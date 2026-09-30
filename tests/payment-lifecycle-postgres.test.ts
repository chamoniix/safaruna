import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { resolve } from 'node:path'
import { createHmac, randomUUID } from 'node:crypto'
import test from 'node:test'
import vm from 'node:vm'
import ts from 'typescript'
import { PrismaClient } from '@prisma/client'
import type { AdminActor } from '../src/lib/check-admin'

const url = process.env.PAYMENT_INTEGRATION_TEST_DATABASE_URL

// Explicit opt-in to a disposable isolated PostgreSQL database (a separate
// Neon "preview" project, never the project's real DATABASE_URL). Rather than
// hardcoding a real hostname in source/history, this requires a deliberate
// confirmation flag before it will ever touch the database.
test('payment lifecycle: full cycle, two distinct guides, replay safety, abandon/cancel', { skip: !url }, async t => {
  assert.equal(process.env.PAYMENT_INTEGRATION_TEST_DATABASE_CONFIRM, 'yes-isolated-preview-db')
  const db = new PrismaClient({ datasources: { db: { url } } })

  const SIGNING_SECRET = 'isolated-test-signing-secret'
  const originalEnv = {
    REVOLUT_WEBHOOK_SIGNING_SECRET: process.env.REVOLUT_WEBHOOK_SIGNING_SECRET,
    REVOLUT_MERCHANT_SECRET_KEY: process.env.REVOLUT_MERCHANT_SECRET_KEY,
    NEXT_PUBLIC_REVOLUT_MERCHANT_PUBLIC_KEY: process.env.NEXT_PUBLIC_REVOLUT_MERCHANT_PUBLIC_KEY,
  }
  process.env.REVOLUT_WEBHOOK_SIGNING_SECRET = SIGNING_SECRET
  process.env.REVOLUT_MERCHANT_SECRET_KEY = 'isolated-test-secret-key'
  process.env.NEXT_PUBLIC_REVOLUT_MERCHANT_PUBLIC_KEY = 'isolated-test-public-key'

  // Configured per test step: answers the webhook's `retrieveRevolutOrder`
  // GET call with a fabricated order/payment, standing in for Revolut.
  let orderResponder: ((orderId: string) => Record<string, unknown>) | null = null

  const nodeRequire = createRequire(import.meta.url)
  const realNextServer = nodeRequire('next/server')
  // Routes get `db` through this proxy, which only raises the default 5s
  // interactive-transaction budget when the caller didn't set one. Real
  // production traffic runs co-located with the database (sub-10ms RTT) and
  // comfortably clears that budget; this sandbox's path to the isolated Neon
  // "preview" project does not. The override compensates for network
  // topology only — it changes no application logic.
  const dbForRoutes = new Proxy(db, {
    get(target, prop, receiver) {
      if (prop === '$transaction') {
        return (fn: unknown, options?: Record<string, unknown>) =>
          (target.$transaction as (fn: unknown, options?: Record<string, unknown>) => unknown)(fn, { timeout: 30000, ...options })
      }
      return Reflect.get(target, prop, receiver)
    },
  })
  const cache = new Map<string, { exports: unknown }>()
  function load<T>(file: string): T {
    const absolute = resolve(file)
    const cached = cache.get(absolute)
    if (cached) return cached.exports as T
    const loadedModule = { exports: {} }
    cache.set(absolute, loadedModule)
    vm.runInNewContext(ts.transpileModule(readFileSync(absolute, 'utf8'), {
      compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS, esModuleInterop: true },
    }).outputText, {
      module: loadedModule, exports: loadedModule.exports, console, process, Error, Date, Buffer, URL,
      TextEncoder, TextDecoder, Headers, Request, Response, AbortSignal, AbortController, setTimeout, clearTimeout,
      fetch: async (input: unknown, init?: RequestInit) => {
        const href = typeof input === 'string' ? input : (input as URL).toString()
        if (href.includes('/orders/') && (!init?.method || init.method === 'GET')) {
          if (!orderResponder) throw new Error('Simulated Revolut order fetch with no responder configured')
          const orderId = decodeURIComponent(href.split('/orders/')[1]!)
          return new Response(JSON.stringify(orderResponder(orderId)), { status: 200 })
        }
        // Any other outbound call (email provider, analytics, ...) is blocked —
        // nothing in this isolated test ever reaches a real network.
        throw new Error(`Simulated network call blocked in isolated test: ${href}`)
      },
      require: (name: string) => {
        if (name === 'server-only') return {}
        if (name === '@/lib/prisma') return { default: db, __esModule: true }
        if (name === 'next/server') {
          // Next's real `after()` throws outside an actual request-handling
          // context. Here it just fires the callback and swallows failures —
          // this test asserts on the synchronous DB effects, not side emails.
          return {
            ...realNextServer,
            after: (task: () => unknown) => {
              try {
                const result = task()
                if (result && typeof (result as Promise<unknown>).catch === 'function') {
                  (result as Promise<unknown>).catch(() => {})
                }
              } catch { /* ignore */ }
            },
          }
        }
        if (name.startsWith('@/')) return load(`src/${name.slice(2)}.ts`)
        return nodeRequire(name)
      },
    })
    return loadedModule.exports as T
  }

  function signedHeaders(rawBody: string) {
    const timestamp = String(Date.now())
    const signature = createHmac('sha256', SIGNING_SECRET).update(`v1.${timestamp}.${rawBody}`).digest('hex')
    return { 'revolut-request-timestamp': timestamp, 'revolut-signature': `v1=${signature}`, 'content-type': 'application/json' }
  }

  function webhookRequest(payload: Record<string, unknown>) {
    const rawBody = JSON.stringify(payload)
    const { NextRequest } = nodeRequire('next/server') as typeof import('next/server')
    return new NextRequest('https://safaruma.example.test/api/revolut/webhook', {
      method: 'POST', headers: signedHeaders(rawBody), body: rawBody,
    })
  }

  try {
    const guideMakkah = await db.guideProfile.create({ data: {
      status: 'ACTIVE', acceptingBookings: true, servesMakkah: true, servesMadinah: false, gender: 'HOMME',
      guideAccount: { create: { email: `${randomUUID()}@example.test`, firstName: 'Test', lastName: 'GuideMakkah' } },
    } })
    const guideMadinah = await db.guideProfile.create({ data: {
      status: 'ACTIVE', acceptingBookings: true, servesMakkah: false, servesMadinah: true, gender: 'HOMME',
      guideAccount: { create: { email: `${randomUUID()}@example.test`, firstName: 'Test', lastName: 'GuideMadinah' } },
    } })
    const pelerin = await db.user.create({ data: { email: `${randomUUID()}@example.test`, role: 'PELERIN', emailVerified: new Date() } })

    const webhookRoute = load<typeof import('../src/app/api/revolut/webhook/route')>('src/app/api/revolut/webhook/route.ts')

    function twoGuideDraftData(refNumber: string, amountCents: number, startDate: string, endDate: string) {
      const missions = [
        { city: 'MAKKAH' as const, guideProfileId: guideMakkah.id, guideSlug: 'test-guide-makkah', startDate, endDate: startDate, selectedPlaces: [], localTransport: 'NONE' as const, localTransportDays: 1 },
        { city: 'MADINAH' as const, guideProfileId: guideMadinah.id, guideSlug: 'test-guide-madinah', startDate: endDate, endDate, selectedPlaces: [], localTransport: 'NONE' as const, localTransportDays: 1 },
      ]
      const earnings = [
        { guideProfileId: guideMakkah.id, serviceNetCents: 10000, placesNetCents: 0, transportNetCents: 0, hotelNetCents: 0, totalNetCents: 10000, breakdown: {} },
        { guideProfileId: guideMadinah.id, serviceNetCents: 8000, placesNetCents: 0, transportNetCents: 0, hotelNetCents: 0, totalNetCents: 8000, breakdown: {} },
      ]
      return {
        cityChoice: 'BOTH', departDate: startDate, returnDate: endDate, nbPersonnes: 2, gender: 'HOMME', langue: 'fr',
        selectedPlaces: [], allVisitPlaces: [], transportOption: 'NONE', localTransportMakkah: 'NONE', localTransportMadinah: 'NONE',
        totalPrice: amountCents / 100, packageName: 'Voyage complet — Makkah + Madinah',
        selectedGuideSlug: 'test-guide-makkah', selectedGuideSlugMadinah: 'test-guide-madinah',
        arrivalPoint: 'JEDDAH', guideBedProvided: false, sameGuideForBothCities: false,
        cityOrder: ['MAKKAH', 'MADINAH'], ihramAlert: false, promoCode: null, promotionCampaign: null,
        missions, pricing: {
          base: 180, places: 0, intercityTransport: 0, localTransportMakkah: 0, localTransportMadinah: 0,
          localTransportDaysMakkah: 1, localTransportDaysMadinah: 1,
          localVehicle: { dailyRate: 0, vehicle: 'NONE', label: '' },
          guideHotelNights: 0, guideHotel: 0, promoDiscount: 0, grossTotal: amountCents / 100, total: amountCents / 100,
        },
        earnings,
      }
    }

    async function createDraftWithHold(refNumber: string, data: ReturnType<typeof twoGuideDraftData>, amountCents: number, checkoutId: string) {
      const expiresAt = new Date(Date.now() + 31 * 60 * 1000)
      await db.reservationDraft.create({ data: {
        refNumber, pelerinId: pelerin.id, data: JSON.stringify(data), expiresAt,
        holds: { create: data.missions.map(mission => ({
          guideProfileId: mission.guideProfileId, city: mission.city, date: new Date(mission.startDate), expiresAt,
        })) },
      } })
      await db.paymentAttempt.create({ data: {
        bookingRef: refNumber, provider: 'REVOLUT', status: 'PENDING', amountCents, currency: 'EUR',
        providerCheckoutId: checkoutId, checkoutExpiresAt: expiresAt,
      } })
    }

    function mockOrder(input: { checkoutId: string; refNumber: string; amountCents: number; state: string; paymentId: string; paymentState: string | null }) {
      return {
        id: input.checkoutId, type: 'payment', state: input.state, capture_mode: 'automatic',
        amount: input.amountCents, currency: 'EUR', updated_at: new Date().toISOString(),
        merchant_order_data: { reference: input.refNumber }, metadata: { refNumber: input.refNumber },
        payments: input.paymentState ? [{ id: input.paymentId, state: input.paymentState, amount: input.amountCents, currency: 'EUR', updated_at: new Date().toISOString() }] : [],
      }
    }

    let firstReservationId = ''

    await t.test('full cycle: payment confirmation blocks dates and credits two distinct guides independently', async () => {
      const refNumber = `TEST-${randomUUID()}`
      const checkoutId = `chk_${randomUUID()}`
      const amountCents = 20000
      const data = twoGuideDraftData(refNumber, amountCents, '2026-03-10T12:00:00.000Z', '2026-03-11T12:00:00.000Z')
      await createDraftWithHold(refNumber, data, amountCents, checkoutId)

      orderResponder = orderId => mockOrder({ checkoutId: orderId, refNumber, amountCents, state: 'completed', paymentId: `pay_${refNumber}`, paymentState: 'completed' })

      const res = await webhookRoute.POST(webhookRequest({ event: 'ORDER_COMPLETED', order_id: checkoutId }))
      assert.equal(res.status, 204)

      const reservation = await db.reservation.findUniqueOrThrow({ where: { refNumber } })
      firstReservationId = reservation.id
      assert.equal(reservation.status, 'CONFIRMED')

      const earnings = await db.guideEarning.findMany({ where: { reservationId: reservation.id } })
      assert.equal(earnings.length, 2)
      assert.equal(earnings.find(e => e.guideProfileId === guideMakkah.id)?.totalNetCents, 10000)
      assert.equal(earnings.find(e => e.guideProfileId === guideMadinah.id)?.totalNetCents, 8000)
      // No cross-guide leakage: each guide's earning is tied only to its own profile.
      assert.equal(new Set(earnings.map(e => e.guideProfileId)).size, 2)

      assert.equal(await db.availability.count({ where: { guideProfileId: guideMakkah.id, status: 'BOOKED', reservationId: reservation.id } }), 1)
      assert.equal(await db.availability.count({ where: { guideProfileId: guideMadinah.id, status: 'BOOKED', reservationId: reservation.id } }), 1)
      assert.equal(await db.reservationDraft.count({ where: { refNumber } }), 0)
      assert.equal(await db.reservationHold.count({ where: { draftRefNumber: refNumber } }), 0)

      const event = await db.paymentEvent.findFirstOrThrow({ where: { providerObjectId: checkoutId } })
      assert.equal(event.status, 'PROCESSED')
    })

    await t.test('replaying the identical webhook event never creates a duplicate reservation', async () => {
      const refNumber = `TEST-${randomUUID()}`
      const checkoutId = `chk_${randomUUID()}`
      const amountCents = 20000
      const data = twoGuideDraftData(refNumber, amountCents, '2026-03-12T12:00:00.000Z', '2026-03-13T12:00:00.000Z')
      await createDraftWithHold(refNumber, data, amountCents, checkoutId)
      orderResponder = orderId => mockOrder({ checkoutId: orderId, refNumber, amountCents, state: 'completed', paymentId: `pay_${refNumber}`, paymentState: 'completed' })

      const first = await webhookRoute.POST(webhookRequest({ event: 'ORDER_COMPLETED', order_id: checkoutId }))
      assert.equal(first.status, 204)
      const second = await webhookRoute.POST(webhookRequest({ event: 'ORDER_COMPLETED', order_id: checkoutId }))
      assert.equal(second.status, 204)

      assert.equal(await db.reservation.count({ where: { refNumber } }), 1)
      assert.equal(await db.paymentEvent.count({ where: { providerObjectId: checkoutId } }), 1)
      assert.equal(await db.guideEarning.count({ where: { reservation: { refNumber } } }), 2)
    })

    await t.test('two concurrent deliveries of a brand-new payment event still produce exactly one reservation', async () => {
      const refNumber = `TEST-${randomUUID()}`
      const checkoutId = `chk_${randomUUID()}`
      const amountCents = 20000
      const data = twoGuideDraftData(refNumber, amountCents, '2026-03-14T12:00:00.000Z', '2026-03-15T12:00:00.000Z')
      await createDraftWithHold(refNumber, data, amountCents, checkoutId)
      orderResponder = orderId => mockOrder({ checkoutId: orderId, refNumber, amountCents, state: 'completed', paymentId: `pay_${refNumber}`, paymentState: 'completed' })

      const results = await Promise.allSettled([
        webhookRoute.POST(webhookRequest({ event: 'ORDER_COMPLETED', order_id: checkoutId })),
        webhookRoute.POST(webhookRequest({ event: 'ORDER_COMPLETED', order_id: checkoutId })),
      ])
      const statuses = results.map(r => r.status === 'fulfilled' ? r.value.status : 'rejected')
      // Either both settle 204/503 (in-flight lease), or one wins — never two reservations.
      assert.ok(statuses.every(s => s === 204 || s === 503))
      assert.equal(await db.reservation.count({ where: { refNumber } }), 1)
    })

    await t.test('abandoning checkout before payment frees the held dates without creating a reservation', async () => {
      const refNumber = `TEST-${randomUUID()}`
      const checkoutId = `chk_${randomUUID()}`
      const amountCents = 20000
      const startDate = '2026-03-16T12:00:00.000Z'
      const data = twoGuideDraftData(refNumber, amountCents, startDate, '2026-03-17T12:00:00.000Z')
      await createDraftWithHold(refNumber, data, amountCents, checkoutId)
      orderResponder = orderId => mockOrder({ checkoutId: orderId, refNumber, amountCents, state: 'cancelled', paymentId: `pay_${refNumber}`, paymentState: null })

      const res = await webhookRoute.POST(webhookRequest({ event: 'ORDER_CANCELLED', order_id: checkoutId }))
      assert.equal(res.status, 204)

      assert.equal(await db.reservation.count({ where: { refNumber } }), 0)
      assert.equal(await db.reservationDraft.count({ where: { refNumber } }), 0)
      assert.equal(await db.reservationHold.count({ where: { draftRefNumber: refNumber } }), 0)
      // The abandoned checkout's own dates were never booked — freed, not consumed.
      assert.equal(await db.availability.count({ where: { guideProfileId: guideMakkah.id, date: new Date(startDate), status: 'BOOKED' } }), 0)
    })

    await t.test('admin cancelling a paid reservation frees the dates but leaves guide earnings untouched (no automatic refund exists)', async () => {
      const adminModule = load<typeof import('../src/lib/check-admin')>('src/lib/check-admin.ts')
      const adminAccount = await db.adminAccount.create({ data: { email: `${randomUUID()}@example.test`, role: 'ADMIN' } })
      const actor: AdminActor = { id: adminAccount.id, email: adminAccount.email, role: 'ADMIN' }
      cache.set(resolve('src/lib/check-admin.ts'), { exports: { ...adminModule, getAdminActor: async () => actor } })
      const reservationsRoute = load<typeof import('../src/app/api/admin/reservations/route')>('src/app/api/admin/reservations/route.ts')
      const { NextRequest } = nodeRequire('next/server') as typeof import('next/server')

      const before = await db.guideEarning.findMany({ where: { reservationId: firstReservationId } })
      assert.ok(before.every(e => e.status === 'UPCOMING'))

      const res = await reservationsRoute.PATCH(new NextRequest('https://safaruma.example.test/api/admin/reservations', {
        method: 'PATCH', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ reservationId: firstReservationId, status: 'CANCELLED', motif: 'Isolated payment lifecycle test' }),
      }))
      assert.equal(res.status, 200)

      const reservation = await db.reservation.findUniqueOrThrow({ where: { id: firstReservationId } })
      assert.equal(reservation.status, 'CANCELLED')
      assert.equal(await db.availability.count({ where: { reservationId: firstReservationId, status: 'BOOKED' } }), 0)

      // Documented gap (todos.md S3): cancellation never touches GuideEarning —
      // there is no automatic refund/earning-reversal path in this codebase.
      const after = await db.guideEarning.findMany({ where: { reservationId: firstReservationId } })
      assert.ok(after.every(e => e.status === 'UPCOMING'))
      assert.equal(after.length, before.length)
    })
  } finally {
    await db.$disconnect()
    for (const [key, value] of Object.entries(originalEnv)) {
      if (value === undefined) delete process.env[key]
      else process.env[key] = value
    }
  }
})
