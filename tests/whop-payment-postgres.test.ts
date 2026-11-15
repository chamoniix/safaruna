import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { resolve } from 'node:path'
import { createHmac, randomBytes, randomUUID } from 'node:crypto'
import test from 'node:test'
import vm from 'node:vm'
import ts from 'typescript'
import { PrismaClient } from '@prisma/client'

const url = process.env.PAYMENT_INTEGRATION_TEST_DATABASE_URL

// Regression: Whop VIP confirms exactly the matching checkout, and retries after
// a transient DB failure. Real PostgreSQL + SDK signature verifier; no money moves.
test('Whop VIP payment, signature, retry and contact contracts', { skip: !url }, async t => {
  assert.equal(process.env.PAYMENT_INTEGRATION_TEST_DATABASE_CONFIRM, 'yes-isolated-preview-db')
  assert.match(new URL(url!).searchParams.get('schema') ?? '', /^qa_whop_/)
  const db = new PrismaClient({ datasources: { db: { url } } })
  const secret = 'ws_isolated_qa_signature'
  const previous = process.env.WHOP_WEBHOOK_SECRET
  const previousCalendar = process.env.VIP_CALENDLY_URL
  const previousApiKey = process.env.WHOP_API_KEY
  process.env.WHOP_API_KEY = 'isolated-test-key'
  process.env.WHOP_WEBHOOK_SECRET = secret
  process.env.VIP_CALENDLY_URL = 'https://calendly.com/safaruna-com/consultation-vip-safaruma'
  let failTransaction = false
  const nodeRequire = createRequire(import.meta.url)
  const nextServer = nodeRequire('next/server')
  const cache = new Map<string, { exports: unknown }>()
  let sdkFixture: object | null = null
  const routeDb = new Proxy(db, { get(target, prop, receiver) {
    if (prop === '$transaction') return (fn: unknown, options?: Record<string, unknown>) => {
      if (failTransaction) { failTransaction = false; throw new Error('QA_TRANSIENT_DB_FAILURE') }
      return (target.$transaction as (fn: unknown, options?: Record<string, unknown>) => unknown)(fn, { timeout: 30000, ...options })
    }
    return Reflect.get(target, prop, receiver)
  } })
  function load<T>(file: string): T {
    const absolute = resolve(file)
    if (cache.has(absolute)) return cache.get(absolute)!.exports as T
    const mod = { exports: {} }
    cache.set(absolute, mod)
    vm.runInNewContext(ts.transpileModule(readFileSync(absolute, 'utf8'), {
      compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS, esModuleInterop: true },
    }).outputText, {
      module: mod, exports: mod.exports, console: { ...console, error: () => {} }, process,
      Error, Date, Buffer, URL, Headers, Request, Response, TextEncoder, TextDecoder,
      AbortSignal, AbortController, setTimeout, clearTimeout,
      fetch: async () => { throw new Error('External requests forbidden in fixture tests') },
      require(name: string) {
        if (name === 'server-only') return {}
        if (name === '@/lib/prisma') return { default: routeDb, __esModule: true }
        if (name === '@whop/sdk') {
          const sdk = nodeRequire(name)
          return { ...sdk, WhopClient: class { constructor(options: unknown) { return sdkFixture ?? new sdk.WhopClient(options) } } }
        }
        if (name === '@sentry/nextjs') return { captureException: () => {} }
        if (name === '@/lib/email') return { sendReferralPromoCode: async () => {} }
        if (name === '@/lib/payments/confirmation-emails') return { sendPaymentConfirmationEmails: async () => {} }
        if (name === 'next/server') return { ...nextServer, after: () => {} }
        if (name.startsWith('@/')) return load(`src/${name.slice(2)}.ts`)
        return nodeRequire(name)
      },
    })
    return mod.exports as T
  }
  const webhook = load<typeof import('../src/app/api/whop/webhook/route')>('src/app/api/whop/webhook/route.ts')
  const contact = load<typeof import('../src/app/api/reservation-vip/[ref]/route')>('src/app/api/reservation-vip/[ref]/route.ts')
  const refs: string[] = [], events: string[] = []
  const fairRefs: string[] = []
  async function fixture() {
    const refNumber = `VIP-${randomBytes(16).toString('hex').toUpperCase()}`
    const checkout = `ch_qa_${randomUUID()}`
    refs.push(refNumber)
    await db.vipConsultation.create({ data: { refNumber, providerCheckoutId: checkout } })
    return { refNumber, checkout }
  }
  function payload(f: { refNumber: string; checkout: string }, overrides: Record<string, unknown> = {}) {
    const eventId = `evt_qa_${randomUUID()}`
    events.push(eventId)
    return { id: eventId, type: 'payment.succeeded', timestamp: new Date().toISOString(), data: {
      id: `pay_qa_${randomUUID()}`, status: 'paid', checkout_configuration_id: f.checkout,
      total: { amount: '500.00', currency: 'eur' }, metadata: { vipRef: f.refNumber },
      customer_email: 'vip-fixture@example.test', ...overrides,
    } }
  }
  async function deliver(event: ReturnType<typeof payload>, signatureValid = true) {
    const raw = JSON.stringify(event)
    const timestamp = String(Math.floor(Date.now() / 1000))
    const signature = createHmac('sha256', signatureValid ? secret : 'wrong-secret').update(`${event.id}.${timestamp}.${raw}`).digest('base64')
    return webhook.POST(new nextServer.NextRequest('http://localhost/api/whop/webhook', {
      method: 'POST', body: raw, headers: { 'content-type': 'application/json', 'webhook-id': event.id, 'webhook-timestamp': timestamp, 'webhook-signature': `v1,${signature}` },
    }))
  }
  try {
    await t.test('unpaid consultation hides Calendly and refuses contact writes', async () => {
      const f = await fixture()
      const params = { params: Promise.resolve({ ref: f.refNumber }) }
      const before = await contact.GET(new nextServer.NextRequest('http://localhost'), params)
      const body = await before.json()
      assert.equal(body.paid, false)
      assert.equal(body.calendlyUrl, null)
      const update = await contact.POST(new nextServer.NextRequest('http://localhost', { method: 'POST', body: JSON.stringify({ platform: 'TELEGRAM', phone: '+33600000000' }) }), params)
      assert.equal(update.status, 409)
    })
    await t.test('valid signature confirms one deposit; duplicate delivery is idempotent', async () => {
      const f = await fixture(), event = payload(f)
      assert.equal((await deliver(event)).status, 200)
      assert.equal((await deliver(event)).status, 200)
      const paid = await db.vipConsultation.findUniqueOrThrow({ where: { refNumber: f.refNumber } })
      assert.equal(paid.status, 'PAID')
      assert.equal(paid.amountCents, 50000)
      assert.equal(paid.providerPaymentId, event.data.id)
      assert.equal(await db.paymentEvent.count({ where: { provider: 'WHOP', providerEventId: event.id } }), 1)
      const params = { params: Promise.resolve({ ref: f.refNumber }) }
      const view = await contact.GET(new nextServer.NextRequest('http://localhost'), params)
      assert.equal((await view.json()).calendlyUrl, process.env.VIP_CALENDLY_URL)
      const update = await contact.POST(new nextServer.NextRequest('http://localhost', { method: 'POST', body: JSON.stringify({ platform: 'TELEGRAM', phone: '+33600000000' }) }), params)
      assert.equal(update.status, 200)
      assert.equal((await db.vipConsultation.findUniqueOrThrow({where:{refNumber:f.refNumber}})).contactPlatform, 'TELEGRAM')
    })
    await t.test('wrong signature and wrong amount never confirm a deposit', async () => {
      const f = await fixture()
      assert.equal((await deliver(payload(f), false)).status, 400)
      assert.equal((await deliver(payload(f, { total: { amount: '499.00', currency: 'eur' } }))).status, 400)
      assert.equal((await db.vipConsultation.findUniqueOrThrow({where:{refNumber:f.refNumber}})).status, 'PENDING_PAYMENT')
    })
    await t.test('unrelated shared-account payments are acknowledged without creating SAFARUMA records', async () => {
      const f = await fixture()
      const event = payload(f, { metadata: { application: 'another-application' } })
      assert.equal((await deliver(event)).status, 200)
      assert.equal(await db.paymentEvent.count({ where: { provider: 'WHOP', providerEventId: event.id } }), 0)
      assert.equal((await db.vipConsultation.findUniqueOrThrow({where:{refNumber:f.refNumber}})).status, 'PENDING_PAYMENT')
    })
    await t.test('missing checkout identity must not match a pending consultation', async () => {
      const f = await fixture()
      const event = payload(f)
      delete (event.data as Record<string, unknown>).checkout_configuration_id
      assert.equal((await deliver(event)).status, 400)
      assert.equal((await db.vipConsultation.findUniqueOrThrow({where:{refNumber:f.refNumber}})).status, 'PENDING_PAYMENT')
    })
    await t.test('transient database failure can be retried with the same event id', async () => {
      const f = await fixture(), event = payload(f)
      failTransaction = true
      assert.equal((await deliver(event)).status, 500)
      assert.equal((await deliver(event)).status, 200)
      assert.equal((await db.vipConsultation.findUniqueOrThrow({where:{refNumber:f.refNumber}})).status, 'PAID')
    })
    await t.test('twenty unsettled checkouts cannot starve the next expired checkout', async () => {
      const lookup = new Map<string, { ref: string; pending: boolean }>()
      for (let i=0;i<21;i++) {
        const ref=`SAF-FAIR-${randomUUID()}`, checkout=`ch_fair_${randomUUID()}`
        fairRefs.push(ref); lookup.set(checkout,{ref,pending:i<20})
        events.push(`reconcile-expired:${checkout}`)
        await db.paymentAttempt.create({data:{bookingRef:ref,provider:'WHOP',providerCheckoutId:checkout,status:'PENDING',amountCents:13000,checkoutExpiresAt:new Date(Date.now()-60000),updatedAt:new Date(Date.now()-3600000+i)}})
      }
      sdkFixture={
        checkoutConfigurations:{retrieve:async({id}:{id:string})=>({variant:{id},metadata:{refNumber:lookup.get(id)!.ref}})},
        variants:{update:async()=>{}},
        payments:{
          list:async({variant_id}:{variant_id:string})=>(async function*(){if(lookup.get(variant_id)!.pending)yield{id:'pay_unsettled',checkout_configuration_id:variant_id,voidable:false}})(),
          retrieveStatus:async()=>({status:'processing'}),
        },
      }
      const worker=load<typeof import('../src/lib/payments/whop-provider')>('src/lib/payments/whop-provider.ts')
      const first=await worker.reconcileExpiredWhopCheckouts()
      assert.equal(first.pending,20)
      await worker.reconcileExpiredWhopCheckouts()
      assert.equal((await db.paymentAttempt.findFirstOrThrow({where:{bookingRef:fairRefs[20]}})).status,'EXPIRED')
      assert.equal(await db.paymentAttempt.count({where:{bookingRef:{in:fairRefs.slice(0,20)},status:'PENDING'}}),20)
      sdkFixture=null
    })
    await t.test('expired Whop dates remain held until payment reconciliation releases the draft', async () => {
      const user=await db.user.create({data:{email:`hold-${randomUUID()}@example.test`,role:'PELERIN'}})
      const guide=await db.guideProfile.create({data:{slug:`hold-${randomUUID()}`,status:'ACTIVE'}})
      const ref=`SAF-HOLD-${randomUUID()}`
      const past=new Date(Date.now()-60000)
      try {
        await db.reservationDraft.create({data:{refNumber:ref,pelerinId:user.id,expiresAt:past,data:JSON.stringify({paymentProvider:'WHOP'}),holds:{create:{guideProfileId:guide.id,city:'MAKKAH',date:new Date('2030-01-01T12:00:00Z'),expiresAt:past}}}})
        const {activeReservationHoldWhere}=load<typeof import('../src/lib/guide-availability')>('src/lib/guide-availability.ts')
        assert.equal(await db.reservationHold.count({where:{guideProfileId:guide.id,...activeReservationHoldWhere()}}),1)
        // Legacy providers keep their existing time-based hold semantics.
        await db.reservationDraft.update({where:{refNumber:ref},data:{data:JSON.stringify({paymentProvider:'REVOLUT'})}})
        assert.equal(await db.reservationHold.count({where:{guideProfileId:guide.id,...activeReservationHoldWhere()}}),0)
      } finally {
        await db.reservationDraft.deleteMany({where:{refNumber:ref}})
        await db.guideProfile.delete({where:{id:guide.id}})
        await db.user.delete({where:{id:user.id}})
      }
    })
  } finally {
    await db.paymentEvent.deleteMany({ where: { provider: 'WHOP', providerEventId: { in: events } } })
    await db.vipConsultation.deleteMany({ where: { refNumber: { in: refs } } })
    await db.paymentAttempt.deleteMany({ where: { bookingRef: { in: fairRefs } } })
    await db.$disconnect()
    if (previous === undefined) delete process.env.WHOP_WEBHOOK_SECRET; else process.env.WHOP_WEBHOOK_SECRET = previous
    if (previousCalendar === undefined) delete process.env.VIP_CALENDLY_URL; else process.env.VIP_CALENDLY_URL = previousCalendar
    if (previousApiKey === undefined) delete process.env.WHOP_API_KEY; else process.env.WHOP_API_KEY = previousApiKey
  }
})
