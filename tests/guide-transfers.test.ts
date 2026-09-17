import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import test from 'node:test'
import vm from 'node:vm'
import ts from 'typescript'
import { Prisma, type Transfer, type GuideEarningStatus } from '@prisma/client'
import { createHash } from 'node:crypto'
import { guideTransferDueAt } from '../src/lib/guide-payout-policy'
import type { AdminActor, AdminAuditContext } from '../src/lib/check-admin'

const require = createRequire(import.meta.url)
const fingerprint = (value: unknown) => createHash('sha256').update(JSON.stringify(value)).digest('hex')
function load<T>(file: string, mocks: Record<string, unknown>): T {
  const loadedModule = { exports: {} }
  vm.runInNewContext(ts.transpileModule(readFileSync(file, 'utf8'), {
    compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS, esModuleInterop: true },
  }).outputText, { module: loadedModule, exports: loadedModule.exports, process, console, Error, Date,
    require: (name: string) => Object.hasOwn(mocks, name) ? mocks[name] : require(name) })
  return loadedModule.exports as T
}

function fixture() {
  const actor: AdminActor = { id: 'admin', email: 'admin@example.test', role: 'ADMIN' }
  const current = { ...actor, status: 'ACTIVE' }
  const context = { ip: '127.0.0.1', requestId: 'test', userAgent: 'test' } as AdminAuditContext
  const bank = { firstName: 'Test', lastName: 'Guide', bankName: 'Bank', country: 'FR', iban: 'TEST_PRIVATE_IBAN', bic: null, readable: true }
  const bankSnapshot = { fingerprint: 'bank-v1', requirement: 'approved-account-holder' }
  let verification = { revision: fingerprint({ guideProfileId: 'guide', bank: bankSnapshot }), accountHolderConfirmed: true }
  const earning = {
    id: 'earning', reservationId: 'reservation', guideProfileId: 'guide',
    serviceNetCents: 10000, placesNetCents: 5000, transportNetCents: 0, hotelNetCents: 0,
    totalNetCents: 15000, breakdown: {}, status: 'UPCOMING' as GuideEarningStatus, transferId: null as string | null,
    reservation: { id: 'reservation', refNumber: 'TEST-RESERVATION', status: 'COMPLETED', endDate: new Date('2026-01-01T12:00:00Z'), stripePaymentId: null as string | null, paymentAttempts: [{ id: 'succeeded' }] },
    guideProfile: { id: 'guide', guideAccountId: 'account' },
  }
  let records: Transfer[] = []
  let audits: Record<string, unknown>[] = []
  let failAudit = false, conflict = false, failedClaim = false
  let inTransaction = false
  const updateEarning = (data: { status?: GuideEarningStatus; transferId?: string }) => { Object.assign(earning, data); return { count: 1 } }
  const db = {
    adminAccount: { findUnique: async () => current },
    guideEarning: {
      findUnique: async () => earning,
      findFirst: async () => earning.status === 'PAID' || earning.transferId || records.length ? { id: earning.id } : null,
      updateMany: async ({ data }: { data: { status?: GuideEarningStatus; transferId?: string } }) => {
        assert.ok(inTransaction)
        return failedClaim ? { count: 0 } : updateEarning(data)
      },
    },
    transfer: {
      findUnique: async ({ where }: { where: { id?: string; recordedEarningId?: string } }) => {
        const row = records.find(item => where.id ? item.id === where.id : item.recordedEarningId === where.recordedEarningId)
        return row ? { ...row } : null
      },
      create: async ({ data }: { data: Partial<Transfer> }) => {
        assert.ok(inTransaction)
        const row = { id: 'transfer', revision: 0, confirmedAt: null, confirmedByAdminId: null, confirmedByEmail: null, createdAt: new Date(), ...data } as Transfer
        records.push(row); return { ...row }
      },
      update: async ({ where, data }: { where: { id: string }; data: Partial<Omit<Transfer, 'revision'>> & { revision: { increment: number } } }) => {
        assert.ok(inTransaction)
        const row = records.find(item => item.id === where.id)!
        Object.assign(row, { ...data, revision: row.revision + data.revision.increment }); return { ...row }
      },
    },
    auditLog: {
      findFirst: async () => ({ id: 'verified', after: verification }),
      create: async ({ data }: { data: Record<string, unknown> }) => { assert.ok(inTransaction); if (failAudit) throw new Error('audit unavailable'); audits.push(data); return { ...data, id: 'audit' } },
    },
    $transaction: async <T>(fn: (client: unknown) => Promise<T>, options: { isolationLevel: string }) => {
      assert.equal(options.isolationLevel, 'Serializable')
      if (conflict) throw new Prisma.PrismaClientKnownRequestError('test conflict', { code: 'P2034', clientVersion: 'test' })
      const oldRecords = structuredClone(records), oldEarning = structuredClone(earning), oldAudits = [...audits]
      inTransaction = true
      try { return await fn(db) } catch (error) { records = oldRecords; Object.assign(earning, oldEarning); audits = oldAudits; throw error } finally { inTransaction = false }
    },
  }
  const service = load<typeof import('../src/lib/guide-transfers')>('src/lib/guide-transfers.ts', {
    'server-only': {}, '@/lib/prisma': db,
    '@/lib/crypto': { encrypt: (value: string) => Buffer.from(value).toString('base64') },
    '@/lib/guide-payout-policy': { guideTransferDueAt },
    '@/lib/check-admin': { adminAuditDetail: (_: unknown, detail: unknown) => JSON.stringify(detail), adminAuditFields: () => ({ ip: '127.0.0.1', requestId: 'test' }) },
    '@/lib/guide-dossier': {
      dossierFingerprint: fingerprint,
      isCurrentDossierConfirmation: (value: { revision?: string } | null, revision: string) => value?.revision === revision,
      readGuideDossier: async (_: unknown, account: string, options: { administrative: boolean }) => {
        assert.equal(account, 'account'); assert.equal(options.administrative, true)
        return { snapshots: { bank: bankSnapshot }, view: { bank } }
      },
    },
  })
  const prepareInput = async () => ({ earningId: earning.id, sourceRevision: (await service.readGuideTransferPreparation(actor, earning.id)).preparation!.sourceRevision, bankReference: 'BANK-REFERENCE-1', sentAt: '2026-01-07T12:00:00Z' })
  return {
    actor, current, earning, bank, context, service, db,
    records: () => records, audits: () => audits, prepareInput,
    prepare: async () => service.prepareGuideTransfer(actor, context, await prepareInput()),
    confirm: (revision = 0) => service.confirmGuideTransfer(actor, context, { transferId: 'transfer', revision }),
    correct: (extra: Record<string, unknown> = {}) => service.correctGuideTransfer(actor, context, { transferId: 'transfer', revision: 1, bankReference: 'BANK-REFERENCE-2', sentAt: '2026-01-08T12:00:00Z', reason: 'Référence bancaire corrigée', ...extra }),
    superadmin: () => { actor.role = current.role = 'SUPERADMIN' },
    unverify: () => { verification = { revision: 'obsolete', accountHolderConfirmed: true } },
    noHolder: () => { verification.accountHolderConfirmed = false },
    bankChange: () => { bankSnapshot.fingerprint = 'bank-v2'; verification.revision = fingerprint({ guideProfileId: 'guide', bank: bankSnapshot }) },
    failAudit: () => { failAudit = true }, conflict: () => { conflict = true }, failClaim: () => { failedClaim = true },
  }
}

for (const [end, due] of [
  ['2026-09-14T12:00:00Z', '2026-09-16T21:00:00.000Z'], // Mon -> Thu
  ['2026-09-17T12:00:00Z', '2026-09-22T21:00:00.000Z'], // Thu -> Wed
  ['2026-09-18T12:00:00Z', '2026-09-22T21:00:00.000Z'], // Fri -> Wed
  ['2026-09-19T12:00:00Z', '2026-09-22T21:00:00.000Z'],
  ['2026-09-20T12:00:00Z', '2026-09-22T21:00:00.000Z'],
  ['2026-09-20T21:30:00Z', '2026-09-23T21:00:00.000Z'], // Already Monday in KSA
  ['2026-12-31T12:00:00Z', '2027-01-05T21:00:00.000Z'],
  ['2028-02-28T12:00:00Z', '2028-03-01T21:00:00.000Z'],
]) test(`KSA payout due date ${end}`, () => assert.equal(guideTransferDueAt(new Date(end)).toISOString(), due))
test('invalid stay date rejected', () => assert.throws(() => guideTransferDueAt(new Date('invalid'))))

test('preparation uses fixed full net and approved bank, no financial side effect', async () => {
  const f = fixture(); const result = await f.prepare()
  assert.equal(result.amountCents, 15000); assert.equal(result.currency, 'EUR'); assert.equal(result.status, 'PENDING')
  assert.equal(f.earning.status, 'UPCOMING'); assert.equal(f.earning.transferId, result.id)
  assert.equal(f.audits()[0].action, 'GUIDE_TRANSFER_PREPARED')
  assert.doesNotMatch(JSON.stringify([result, f.audits()]), /TEST_PRIVATE_IBAN|bankSnapshotEncrypted/)
  assert.ok(f.records()[0].bankSnapshotEncrypted)
})

test('double preparation returns the same record, conflicting second request rejected', async () => {
  const f = fixture(), input = await f.prepareInput()
  const first = await f.service.prepareGuideTransfer(f.actor, f.context, input)
  const again = await f.service.prepareGuideTransfer(f.actor, f.context, input)
  assert.equal(first.id, again.id); assert.equal(f.records().length, 1); assert.equal(f.audits().length, 1)
  await assert.rejects(f.service.prepareGuideTransfer(f.actor, f.context, { ...input, bankReference: 'DIFFERENT' }), /existe déjà/)
})

test('Admin cannot confirm; Superadmin confirms once without pretending bank receipt', async () => {
  const f = fixture(); await f.prepare()
  await assert.rejects(f.confirm(), /non autorisé/)
  f.superadmin(); const result = await f.confirm()
  assert.equal(result.status, 'PAID'); assert.equal(f.earning.status, 'PAID')
  assert.equal(f.audits().filter(row => row.action === 'GUIDE_TRANSFER_CONFIRMED').length, 1)
  await f.confirm()
  assert.equal(f.audits().length, 2)
  assert.equal('receivedAt' in result, false)
})

test('current administrative role is rechecked, not trusted from stale actor', async () => {
  const f = fixture(); await f.prepare(); f.actor.role = 'SUPERADMIN'
  await assert.rejects(f.confirm(), /non autorisé/)
  f.actor.role = 'ADMIN'; f.current.status = 'SUSPENDED'
  await assert.rejects(f.service.readGuideTransferPreparation(f.actor, f.earning.id), /non autorisé/)
})

for (const state of ['CANCELLED', 'CONFIRMED', 'PENDING']) test(`reservation ${state} cannot prepare a transfer`, async () => {
  const f = fixture(); f.earning.reservation.status = state
  await assert.rejects(f.prepare(), /doit être terminée/); assert.equal(f.records().length, 0)
})

test('payment proof missing or earning cancelled is blocked', async () => {
  const f = fixture(); f.earning.reservation.paymentAttempts = []
  await assert.rejects(f.prepare(), /paiement client vérifié/)
  f.earning.reservation.stripePaymentId = 'legacy-stripe'; f.earning.status = 'CANCELLED'
  await assert.rejects(f.prepare(), /revenu non annulé/)
})

for (const amount of [0, -1, 0.5, NaN]) test(`invalid net amount ${amount} rejected`, async () => {
  const f = fixture(); f.earning.totalNetCents = amount; await assert.rejects(f.prepare(), /revenu net enregistré/)
})

for (const change of ['unverify', 'noHolder', 'incomplete', 'unreadable'] as const) test(`bank ${change} cannot be used`, async () => {
  const f = fixture()
  if (change === 'incomplete') f.bank.iban = ''
  else if (change === 'unreadable') f.bank.readable = false
  else f[change]()
  await assert.rejects(f.prepare(), /coordonnées|titulaire/)
})

test('amount/beneficiary cannot be supplied or partial payment smuggled', async () => {
  const f = fixture(), input = await f.prepareInput()
  for (const extra of [{ amountCents: 1 }, { currency: 'GBP' }, { guideProfileId: 'other' }, { iban: 'OTHER' }]) {
    await assert.rejects(f.service.prepareGuideTransfer(f.actor, f.context, { ...input, ...extra }), /invalides/)
  }
})

test('stale preparation, future and early bank dates rejected', async () => {
  const f = fixture(), input = await f.prepareInput()
  for (const sentAt of ['2100-01-01T12:00:00Z', '2026-01-02T12:00:00Z']) {
    await assert.rejects(f.service.prepareGuideTransfer(f.actor, f.context, { ...input, sentAt }), /date/i)
  }
  f.earning.totalNetCents++
  await assert.rejects(f.service.prepareGuideTransfer(f.actor, f.context, input), /ont changé/)
})

for (const change of ['bank', 'net', 'guide', 'cancelled'] as const) test(`confirmation refuses changed ${change}`, async () => {
  const f = fixture(); await f.prepare(); f.superadmin()
  if (change === 'bank') f.bankChange()
  if (change === 'net') f.earning.totalNetCents++
  if (change === 'guide') f.earning.guideProfileId = 'other'
  if (change === 'cancelled') f.earning.reservation.status = 'CANCELLED'
  await assert.rejects(f.confirm())
  assert.equal(f.records()[0].status, 'PENDING'); assert.equal(f.earning.status, 'UPCOMING')
})

test('stale confirmation revision refused', async () => {
  const f = fixture(); await f.prepare(); f.superadmin(); await assert.rejects(f.confirm(8), /a changé/)
})

test('legacy linked/paid earnings never automatically converted', async () => {
  const f = fixture(); f.earning.status = 'PAID'; await assert.rejects(f.prepare(), /historique/)
  f.earning.status = 'UPCOMING'; f.earning.transferId = 'old'; await assert.rejects(f.prepare(), /historique/)
})

test('audit failure rolls back preparation and earning claim', async () => {
  const f = fixture(); const input = await f.prepareInput(); f.failAudit()
  await assert.rejects(f.service.prepareGuideTransfer(f.actor, f.context, input), /audit unavailable/)
  assert.equal(f.records().length, 0); assert.equal(f.earning.transferId, null)
})

test('audit failure rolls back confirmation and paid status', async () => {
  const f = fixture(); await f.prepare(); f.superadmin(); f.failAudit()
  await assert.rejects(f.confirm(), /audit unavailable/)
  assert.equal(f.records()[0].status, 'PENDING'); assert.equal(f.earning.status, 'UPCOMING')
})

test('concurrent claim and serialization conflict leave no partial records', async () => {
  const f = fixture(); const input = await f.prepareInput(); f.failClaim()
  await assert.rejects(f.service.prepareGuideTransfer(f.actor, f.context, input), /entre-temps/)
  assert.equal(f.records().length, 0)
  f.conflict(); await assert.rejects(f.service.prepareGuideTransfer(f.actor, f.context, input), /autre administrateur/)
})

test('only Superadmin corrects metadata; original bank reference remains in audit', async () => {
  const f = fixture(); await f.prepare(); await assert.rejects(f.correct({ revision: 0 }), /non autorisé/)
  f.superadmin(); await f.confirm()
  await assert.rejects(f.correct({ reason: '' }), /invalides/)
  await assert.rejects(f.correct({ revision: 0 }), /a changé/)
  await assert.rejects(f.correct({ amountCents: 1 }), /invalides/)
  const updated = await f.correct()
  assert.equal(updated.bankReference, 'BANK-REFERENCE-2'); assert.equal(updated.status, 'PAID'); assert.equal(updated.amountCents, 15000)
  const event = f.audits().at(-1)!
  assert.equal((event.before as { bankReference: string }).bankReference, 'BANK-REFERENCE-1')
  assert.equal((event.after as { bankReference: string }).bankReference, 'BANK-REFERENCE-2')
  assert.doesNotMatch(JSON.stringify(event), /TEST_PRIVATE_IBAN/)
})

test('prepared, paid and historical records protect reassignment and status mutations', async () => {
  const f = fixture()
  const tx = f.db as unknown as Prisma.TransactionClient
  await f.service.assertNoRecordedGuideTransfer(tx, 'reservation', 'guide')
  await f.prepare()
  await assert.rejects(f.service.assertNoRecordedGuideTransfer(tx, 'reservation', 'guide'), /Traitement financier manuel/)
})

test('both existing mutation routes invoke the guard inside the transaction', () => {
  for (const file of ['src/app/api/admin/reservations/route.ts', 'src/app/api/admin/reservations/transfer/route.ts']) {
    const code = readFileSync(file, 'utf8')
    assert.match(code, /\$transaction\(async tx => \{[\s\S]*?await assertNoRecordedGuideTransfer\(tx,/)
    assert.match(code, /error instanceof GuideTransferError/)
  }
})

test('migration preserves legacy rows, adds unique earning link and restrictive foreign key', () => {
  const sql = readFileSync('prisma/migrations/20260917120000_manual_guide_transfers/migration.sql', 'utf8')
  assert.doesNotMatch(sql, /DROP TABLE|DELETE FROM|UPDATE "Transfer"|DROP COLUMN/i)
  assert.match(sql, /CREATE UNIQUE INDEX "Transfer_recordedEarningId_key"/)
  assert.match(sql, /ON DELETE RESTRICT/)
  assert.match(sql, /"recordedEarningId" IS NULL OR/)
})
