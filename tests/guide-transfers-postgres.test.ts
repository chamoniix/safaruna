import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { resolve } from 'node:path'
import { randomBytes, randomUUID } from 'node:crypto'
import test from 'node:test'
import vm from 'node:vm'
import ts from 'typescript'
import { PrismaClient, Prisma } from '@prisma/client'
import type { AdminActor, AdminAuditContext } from '../src/lib/check-admin'

const url = process.env.GUIDE_TRANSFER_TEST_DATABASE_URL

// Explicit opt-in to a disposable local PostgreSQL database. Never reads the
// project's DATABASE_URL and never runs migrations against a supplied database.
test('manual Guide transfers: real PostgreSQL constraints, transactions and races', { skip: !url }, async t => {
  const parsed = new URL(url!)
  assert.ok(['127.0.0.1', 'localhost'].includes(parsed.hostname))
  assert.equal(parsed.pathname, '/safaruma_transfers_test')
  const db = new PrismaClient({ datasources: { db: { url } } })
  const originalEncryptionKey = process.env.ENCRYPTION_KEY
  process.env.ENCRYPTION_KEY = randomBytes(32).toString('hex')
  const require = createRequire(import.meta.url)
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
      TextEncoder, TextDecoder, Headers, Request, Response, setTimeout, clearTimeout,
      require: (name: string) => {
        if (name === 'server-only') return {}
        if (name === '@/lib/prisma') return { default: db, __esModule: true }
        if (name.startsWith('@/')) return load(`src/${name.slice(2)}.ts`)
        return require(name)
      },
    })
    return loadedModule.exports as T
  }
  const service = load<typeof import('../src/lib/guide-transfers')>('src/lib/guide-transfers.ts')
  const dossier = load<typeof import('../src/lib/guide-dossier')>('src/lib/guide-dossier.ts')
  const crypto = load<typeof import('../src/lib/crypto')>('src/lib/crypto.ts')
  const context = { ip: '127.0.0.1', requestId: randomUUID(), userAgent: 'isolated-postgresql-test' } as AdminAuditContext
  try {
    const admin = await db.adminAccount.create({ data: { email: `${randomUUID()}@example.test`, role: 'ADMIN' } })
    const owner = await db.adminAccount.create({ data: { email: `${randomUUID()}@example.test`, role: 'SUPERADMIN' } })
    const actor: AdminActor = { id: admin.id, email: admin.email, role: 'ADMIN' }
    const superadmin: AdminActor = { id: owner.id, email: owner.email, role: 'SUPERADMIN' }
    const bank = { bankAccountFirstName: 'Test', bankAccountLastName: 'Guide', bankName: 'Test bank', bankCountry: 'FR', ibanEncrypted: crypto.encrypt('LOCAL_TEST_IBAN_ONLY') }
    const guide = await db.guideProfile.create({ data: { ...bank, guideAccount: { create: { email: `${randomUUID()}@example.test`, firstName: 'Test', lastName: 'Guide' } } } })
    const guide2 = await db.guideProfile.create({ data: { ...bank, guideAccount: { create: { email: `${randomUUID()}@example.test`, firstName: 'Test', lastName: 'Guide' } } } })
    for (const profile of [guide, guide2]) {
      const state = await dossier.readGuideDossier(db, profile.guideAccountId!, { administrative: true })
      await db.auditLog.create({ data: { actor: actor.email, actorRole: actor.role, actorAdminId: actor.id,
        action: 'GUIDE_BANK_VERIFIED', target: profile.id,
        after: { revision: dossier.dossierFingerprint({ guideProfileId: profile.id, bank: state.snapshots.bank }), accountHolderConfirmed: true },
      } })
    }
    const pelerin = await db.user.create({ data: { email: `${randomUUID()}@example.test` } })
    const pack = await db.package.create({ data: { guideProfileId: guide.id, name: 'ISOLATED TEST', durationDays: 1, pricePerPerson: 130, maxPeople: 6 } })
    const createReservation = async () => db.reservation.create({ data: {
      pelerinId: pelerin.id, guideProfileId: guide.id, packageId: pack.id, refNumber: `TEST-${randomUUID()}`,
      startDate: new Date('2026-01-01T12:00:00Z'), endDate: new Date('2026-01-01T12:00:00Z'), nbPeople: 1,
      basePrice: 200, commissionAmount: 60, totalPrice: 260, status: 'COMPLETED', stripePaymentId: `TEST-${randomUUID()}`,
    } })
    const reservation = await createReservation()
    const createEarning = async (reservationId: string, guideProfileId = guide.id) => db.guideEarning.create({ data: {
      reservationId, guideProfileId, serviceNetCents: 10000, placesNetCents: 0, transportNetCents: 0, hotelNetCents: 0, totalNetCents: 10000, breakdown: {},
    } })
    const earning = await createEarning(reservation.id)
    const earning2 = await createEarning(reservation.id, guide2.id)
    const makeInput = async (earningId: string) => ({ earningId,
      sourceRevision: (await service.readGuideTransferPreparation(actor, earningId)).preparation!.sourceRevision,
      bankReference: `LOCAL-BANK-${randomUUID()}`, sentAt: '2026-01-07T12:00:00Z',
    })
    const input = await makeInput(earning.id)

    await t.test('simultaneous preparations create one transfer and one audit', async () => {
      const results = await Promise.allSettled([
        service.prepareGuideTransfer(actor, context, input), service.prepareGuideTransfer(actor, context, input),
      ])
      assert.ok(results.some(result => result.status === 'fulfilled'))
      assert.equal(await db.transfer.count({ where: { recordedEarningId: earning.id } }), 1)
      const record = await db.transfer.findUniqueOrThrow({ where: { recordedEarningId: earning.id } })
      assert.equal(await db.auditLog.count({ where: { target: record.id, action: 'GUIDE_TRANSFER_PREPARED' } }), 1)
      assert.equal(record.net, null); assert.equal(record.amountCents, 10000)
      assert.doesNotMatch(JSON.stringify(await db.auditLog.findMany({ where: { target: record.id } })), /LOCAL_TEST_IBAN/)
      assert.match(crypto.decrypt(record.bankSnapshotEncrypted!), /LOCAL_TEST_IBAN_ONLY/)
      await assert.rejects(service.confirmGuideTransfer(actor, context, { transferId: record.id, revision: 0 }))
      const again = await service.prepareGuideTransfer(actor, context, input)
      assert.equal(again.id, record.id)
    })

    await t.test('two concurrent Superadmin confirmations produce one confirmation', async () => {
      const record = await db.transfer.findUniqueOrThrow({ where: { recordedEarningId: earning.id } })
      const results = await Promise.allSettled([
        service.confirmGuideTransfer(superadmin, context, { transferId: record.id, revision: 0 }),
        service.confirmGuideTransfer(superadmin, context, { transferId: record.id, revision: 0 }),
      ])
      assert.ok(results.some(result => result.status === 'fulfilled'))
      assert.equal(await db.auditLog.count({ where: { target: record.id, action: 'GUIDE_TRANSFER_CONFIRMED' } }), 1)
      assert.equal((await db.guideEarning.findUniqueOrThrow({ where: { id: earning.id } })).status, 'PAID')
      assert.equal((await db.guideEarning.findUniqueOrThrow({ where: { id: earning2.id } })).status, 'UPCOMING')
    })

    await t.test('other Guide on same reservation remains independent', async () => {
      const command = await makeInput(earning2.id)
      const prepared = await service.prepareGuideTransfer(actor, context, command)
      await service.confirmGuideTransfer(superadmin, context, { transferId: prepared.id, revision: 0 })
      assert.equal(await db.transfer.count({ where: { recordedEarningId: { in: [earning.id, earning2.id] } } }), 2)
    })

    await t.test('correction preserves the original reference in audit, not the IBAN', async () => {
      const record = await db.transfer.findUniqueOrThrow({ where: { recordedEarningId: earning.id } })
      await service.correctGuideTransfer(superadmin, context, { transferId: record.id, revision: record.revision,
        bankReference: 'CORRECTED-LOCAL-REFERENCE', sentAt: record.sentAt!.toISOString(), reason: 'Local test correction',
      })
      const event = await db.auditLog.findFirstOrThrow({ where: { target: record.id, action: 'GUIDE_TRANSFER_CORRECTED' } })
      assert.equal((event.before as Prisma.JsonObject).bankReference, input.bankReference)
      assert.doesNotMatch(JSON.stringify(event), /LOCAL_TEST_IBAN/)
    })

    await t.test('SQL constraint rejects invalid currency and FK prevents history deletion', async () => {
      const record = await db.transfer.findUniqueOrThrow({ where: { recordedEarningId: earning.id } })
      await assert.rejects(db.transfer.update({ where: { id: record.id }, data: { currency: 'GBP' } }))
      await assert.rejects(db.guideEarning.delete({ where: { id: earning.id } }))
      await assert.rejects(db.reservation.delete({ where: { id: reservation.id } }))
      assert.equal(await db.transfer.count({ where: { id: record.id } }), 1)
    })

    await t.test('real reservation handlers return 409 without changing paid history', async () => {
      const nextGuide = await db.guideProfile.create({ data: {
        status: 'ACTIVE', servesMakkah: true,
        guideAccount: { create: { email: `${randomUUID()}@example.test` } },
      } })
      await db.reservationMission.create({ data: { reservationId: reservation.id, guideProfileId: guide.id,
        city: 'MAKKAH', startDate: reservation.startDate, endDate: reservation.endDate,
      } })
      // Only identity/session parsing is replaced. The handlers, transactions,
      // guard and database are real; no email function is replaced or called.
      const adminModule = load<typeof import('../src/lib/check-admin')>('src/lib/check-admin.ts')
      cache.set(resolve('src/lib/check-admin.ts'), { exports: { ...adminModule, getAdminActor: async () => actor } })
      const statusRoute = load<typeof import('../src/app/api/admin/reservations/route')>('src/app/api/admin/reservations/route.ts')
      const transferRoute = load<typeof import('../src/app/api/admin/reservations/transfer/route')>('src/app/api/admin/reservations/transfer/route.ts')
      const { NextRequest } = require('next/server') as typeof import('next/server')
      const request = (body: unknown) => new NextRequest('https://safaruma.example.test/api/admin/reservations', {
        method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body),
      })
      const cancelled = await statusRoute.PATCH(request({ reservationId: reservation.id, status: 'CANCELLED', motif: 'Isolated test' }))
      assert.equal(cancelled.status, 409); assert.match((await cancelled.json()).error, /virement/)
      const reassigned = await transferRoute.POST(request({ reservationId: reservation.id, newGuideProfileId: nextGuide.id, motif: 'Isolated test' }))
      assert.equal(reassigned.status, 409); assert.match((await reassigned.json()).error, /virement/)
      const unchanged = await db.reservation.findUniqueOrThrow({ where: { id: reservation.id } })
      assert.equal(unchanged.status, 'COMPLETED'); assert.equal(unchanged.guideProfileId, guide.id)
      assert.equal((await db.guideEarning.findUniqueOrThrow({ where: { id: earning.id } })).status, 'PAID')
    })

    await t.test('audit insert failure rolls back transfer and earning link in real PostgreSQL', async () => {
      const res = await createReservation(); const row = await createEarning(res.id); const command = await makeInput(row.id)
      // Only this disposable database: make the request-specific audit invalid.
      await db.$executeRawUnsafe(`ALTER TABLE "AuditLog" ADD CONSTRAINT "test_deny_request" CHECK ("requestId" IS DISTINCT FROM 'force-rollback')`)
      try {
        await assert.rejects(service.prepareGuideTransfer(actor, { ...context, requestId: 'force-rollback' }, command))
        assert.equal(await db.transfer.count({ where: { recordedEarningId: row.id } }), 0)
        assert.equal((await db.guideEarning.findUniqueOrThrow({ where: { id: row.id } })).transferId, null)
      } finally { await db.$executeRawUnsafe('ALTER TABLE "AuditLog" DROP CONSTRAINT "test_deny_request"') }
    })

    await t.test('a simultaneous cancellation cannot leave a transfer on a cancelled stay', async () => {
      const res = await createReservation(); const row = await createEarning(res.id); const command = await makeInput(row.id)
      await Promise.allSettled([
        service.prepareGuideTransfer(actor, context, command),
        db.$transaction(async tx => {
          await service.assertNoRecordedGuideTransfer(tx, res.id)
          await tx.reservation.update({ where: { id: res.id }, data: { status: 'CANCELLED' } })
        }, { isolationLevel: 'Serializable' }),
      ])
      const latest = await db.reservation.findUniqueOrThrow({ where: { id: res.id } })
      const transfer = await db.transfer.findUnique({ where: { recordedEarningId: row.id } })
      assert.equal(Boolean(transfer) && latest.status === 'CANCELLED', false)
      assert.ok(transfer || latest.status === 'CANCELLED')
    })

    await t.test('pending bank proposal is never used as approved destination', async () => {
      const change = await db.guideProfileChangeRequest.create({ data: {
        guideProfileId: guide.id, activeKey: guide.id, requestedByGuideAccountId: guide.guideAccountId!,
        requestedByEmail: 'guide@example.test', before: {},
        changes: { bankEncrypted: crypto.encrypt(JSON.stringify({ firstName: 'Other', lastName: 'Person',
          bankName: 'Proposed bank', country: 'FR', iban: 'UNAPPROVED_PRIVATE_IBAN', bic: null })) },
      } })
      const res = await createReservation(); const row = await createEarning(res.id)
      const prepared = await service.prepareGuideTransfer(actor, context, await makeInput(row.id))
      const recorded = await db.transfer.findUniqueOrThrow({ where: { id: prepared.id } })
      assert.match(crypto.decrypt(recorded.bankSnapshotEncrypted!), /LOCAL_TEST_IBAN_ONLY/)
      assert.doesNotMatch(crypto.decrypt(recorded.bankSnapshotEncrypted!), /UNAPPROVED_PRIVATE_IBAN/)
      await db.guideProfileChangeRequest.update({ where: { id: change.id }, data: { status: 'REJECTED', activeKey: null } })
    })

    await t.test('bank change after preparation requires renewed verification', async () => {
      const res = await createReservation(); const row = await createEarning(res.id)
      const prepared = await service.prepareGuideTransfer(actor, context, await makeInput(row.id))
      await db.guideProfile.update({ where: { id: guide.id }, data: { ibanEncrypted: crypto.encrypt('DIFFERENT_LOCAL_IBAN') } })
      await assert.rejects(service.confirmGuideTransfer(superadmin, context, { transferId: prepared.id, revision: 0 }), /vérifiés/)
      assert.equal((await db.transfer.findUniqueOrThrow({ where: { id: prepared.id } })).status, 'PENDING')
    })
  } finally {
    await db.$disconnect()
    if (originalEncryptionKey === undefined) delete process.env.ENCRYPTION_KEY
    else process.env.ENCRYPTION_KEY = originalEncryptionKey
  }
})
