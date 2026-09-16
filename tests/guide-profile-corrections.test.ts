import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import test from 'node:test'
import vm from 'node:vm'
import ts from 'typescript'
import { z } from 'zod'
import { Prisma } from '@prisma/client'

const require = createRequire(import.meta.url)
function load(file: string, mocks: Record<string, unknown>) {
  const module = { exports: {} as any }
  vm.runInNewContext(ts.transpileModule(readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true, target: ts.ScriptTarget.ES2022 },
  }).outputText, { module, exports: module.exports, Error, console, require: (name: string) => Object.hasOwn(mocks, name) ? mocks[name] : require(name) })
  return module.exports
}

const bank = { firstName: 'Guide', lastName: 'Test', bankName: 'Test bank', country: 'FR', iban: 'FR7612345678901234567890123', bic: 'TESTFRPP' }
function fixture() {
  let tick = 0
  const requests: any[] = [], audits: any[] = [], profileWrites: any[] = [], accountWrites: any[] = []
  const account: any = { id: 'account-a', status: 'ACTIVE', firstName: 'Old', lastName: 'Guide', email: 'guide@example.test', phoneWhatsapp: null, country: null, image: 'public-unchanged' }
  const profile: any = {
    id: 'profile-a', slug: 'guide-test', guideAccount: account, status: 'ACTIVE', permanentlyDeactivatedAt: null,
    bio: 'Old bio', city: 'MADINAH', gender: 'HOMME', nationality: 'FR', experienceYears: 1, languages: [{ languageCode: 'fr' }],
    bankAccountFirstName: 'Old', bankAccountLastName: 'Guide', bankName: 'Old bank', bankCountry: 'FR', ibanEncrypted: 'old-cipher', bicEncrypted: null,
    updatedAt: new Date('2026-09-13T10:00:00Z'), profileSubmittedAt: null,
  }
  account.guideProfile = profile
  let adminActive = true, transactionError: unknown = null, brokenCrypto = false
  let authAllowed = true, authCalls = 0, transactionCalls = 0, bodyReads = 0
  const db: any = {
    adminAccount: { findUnique: async () => ({ email: 'admin@example.test', role: 'ADMIN', status: adminActive ? 'ACTIVE' : 'DISABLED' }) },
    guideAccount: {
      findUnique: async () => account,
      update: async ({ data }: any) => { accountWrites.push(data); Object.assign(account, data); return account },
    },
    guideProfile: {
      findUnique: async () => profile,
      update: async ({ data }: any) => { profileWrites.push(data); Object.assign(profile, data); return profile },
    },
    guideProfileChangeRequest: {
      findUnique: async ({ where }: any) => requests.find(item => where.id ? item.id === where.id : item.activeKey === where.activeKey) || null,
      findFirst: async () => requests.filter(item => item.status === 'APPROVED' && item.changes.media).at(-1) || null,
      create: async ({ data }: any) => {
        const time = new Date(1789280000000 + tick++)
        const row = { ...data, id: `request-${requests.length}`, status: 'PENDING', createdAt: time, updatedAt: time }
        requests.push(row); return row
      },
      update: async ({ where, data }: any) => {
        const row = requests.find(item => item.id === where.id)
        Object.assign(row, data, { updatedAt: new Date(1789280000000 + tick++) }); return row
      },
    },
    guideLanguage: { deleteMany: async () => {}, createMany: async () => {} },
    auditLog: { create: async ({ data }: any) => { audits.push(data); return data } },
    $transaction: async (callback: any, options: any) => {
      transactionCalls++
      assert.equal(options.isolationLevel, 'Serializable')
      if (transactionError) throw transactionError
      return callback(db)
    },
  }
  const crypto = {
    encrypt: (plain: string) => { if (brokenCrypto) throw new Error('sensitive crypto failure'); return `sealed:${Buffer.from(plain).toString('base64')}` },
    decrypt: (cipher: string) => { if (brokenCrypto || !cipher.startsWith('sealed:')) throw new Error('sensitive crypto failure'); return Buffer.from(cipher.slice(7), 'base64').toString() },
  }
  const baseline: any = { profilePhotoPath: 'private/old-photo', hasPersonalVehicle: false }
  const media = {
    mediaProposalSchema: z.object({ profilePhotoReceipt: z.string().optional(), hasPersonalVehicle: z.boolean().optional() }).strict(),
    storedMediaSchema: z.object({ profilePhotoPath: z.string(), hasPersonalVehicle: z.boolean() }).strict(),
    resolveMediaProposal: (proposal: any, email: string, current: any) => {
      assert.equal(email, account.email)
      if (proposal.profilePhotoReceipt && proposal.profilePhotoReceipt !== 'owner-receipt') throw new Error('MEDIA_INVALID')
      return { ...current, ...(proposal.profilePhotoReceipt && { profilePhotoPath: 'private/new-photo' }), ...(proposal.hasPersonalVehicle !== undefined && { hasPersonalVehicle: proposal.hasPersonalVehicle }) }
    },
    readGuideProfileMedia: async () => ({ snapshot: requests.filter(item => item.status === 'APPROVED' && item.changes.media).at(-1)?.changes.media ?? baseline, view: {} }),
    profileMediaView: (_snapshot: any, id: string) => ({ hasPersonalVehicle: false, photos: { profile: `/api/guide-profile-change-requests/${id}/photos/profile` } }),
  }
  const changes = load('src/lib/guide-profile-changes.ts', {
    'server-only': {}, '@/lib/prisma': db, '@/lib/languages': { GUIDE_LANGUAGES: [{ code: 'fr' }, { code: 'en' }] },
    '@/lib/crypto': crypto, '@/lib/guide-profile-media': media,
  })
  const route = load('src/app/api/admin/guides/[slug]/profile-change/route.ts', {
    '@/lib/prisma': db, '@/lib/guide-profile-changes': changes, '@/lib/guide-profile-media': media, '@/lib/crypto': crypto,
    '@/lib/check-admin': {
      getAdminActor: async () => { authCalls++; return authAllowed ? { id: 'admin-a', role: 'ADMIN', email: 'admin@example.test' } : null },
      getAdminAuditContext: () => ({ ip: '127.0.0.1' }), adminAuditDetail: (_context: any, detail: any) => JSON.stringify(detail), adminAuditFields: () => ({}),
    },
  })
  const submit = (value: any) => changes.submitGuideProfileChanges({ actor: { id: account.id, email: account.email }, changes: value, context: { ip: '127.0.0.1' } })
  const review = (body: any, origin: string | null = 'https://safaruna.test') => route.POST({
    headers: new Headers(origin ? { origin } : {}), nextUrl: { origin: 'https://safaruna.test' },
    json: async () => { bodyReads++; return body },
  }, { params: Promise.resolve({ slug: profile.slug }) })
  const decide = (row: any, action = 'APPROVE', reviewNotes?: string) => review({ action, requestId: row.id, revision: changes.profileChangeRevision(row), ...(reviewNotes !== undefined && { reviewNotes }) })
  return { changes, submit, review, decide, account, profile, requests, audits, profileWrites, accountWrites, baseline,
    denyAuth: () => { authAllowed = false }, counters: () => ({ authCalls, transactionCalls, bodyReads }),
    breakCrypto: () => { brokenCrypto = true }, disableAdmin: () => { adminActive = false }, failTransaction: () => { transactionError = new Prisma.PrismaClientKnownRequestError('conflict', { code: 'P2034', clientVersion: 'test' }) } }
}

test('bank and receipt-backed media are pending only, encrypted, privately serialized and redacted from audit', async () => {
  const f = fixture()
  const row = await f.submit({ firstName: 'Corrected', bankProposal: bank, mediaProposal: { profilePhotoReceipt: 'owner-receipt' } })
  assert.equal(f.profileWrites.length, 0)
  assert.equal(f.accountWrites.length, 0)
  assert.equal(f.profile.status, 'ACTIVE')
  assert.doesNotMatch(JSON.stringify(row.changes), /FR7612345678901234567890123|TESTFRPP/)
  assert.equal(row.before.bankEncrypted.version, 1)
  assert.match(row.before.bankEncrypted.fingerprint, /^[a-f0-9]{64}$/)
  const safe = f.changes.publicPendingRequest(row)
  assert.equal(safe.changes.bankProposal.iban, bank.iban)
  assert.match(safe.revision, /^[a-f0-9]{64}$/)
  assert.doesNotMatch(JSON.stringify(safe), /ciphertext|private\/|sealed:/)
  assert.doesNotMatch(JSON.stringify(f.audits), /FR7612345678901234567890123|TESTFRPP|ciphertext|private\/|sealed:|old-cipher/)
  assert.deepEqual(Object.keys(f.changes.safeProfileBefore({ iban: bank.iban, ciphertext: 'secret', profilePhotoPath: 'private/a', firstName: 'Known' })), ['firstName'])
})

test('public proposal schema excludes internal paths/ciphertext and enforces inscription bank format', async () => {
  const f = fixture()
  for (const input of [{ bankEncrypted: { version: 1, ciphertext: 'forged' } }, { media: f.baseline }, { mediaProposal: { profilePhotoPath: 'forged' } }, { bankProposal: { ...bank, iban: 'not-an-iban' } }]) {
    assert.equal(f.changes.guideProfileProposalSchema.safeParse(input).success, false)
  }
  await assert.rejects(() => f.submit({ mediaProposal: { profilePhotoReceipt: 'foreign-receipt' } }), /MEDIA_INVALID/)
  const row = await f.submit({ bankProposal: { ...bank, iban: 'fr76 12345678901234567890123', bic: '' } })
  assert.equal(f.changes.publicPendingRequest(row).changes.bankProposal.iban, bank.iban)
})

test('explicitly reverting pending identity/media/bank values replaces the prior proposal without cancellation', async () => {
  const f = fixture()
  const row = await f.submit({ bio: 'Proposed bio', mediaProposal: { hasPersonalVehicle: true }, bankProposal: bank })
  const previousRevision = f.changes.profileChangeRevision(row)
  const updated = await f.submit({ bio: 'Old bio', mediaProposal: { hasPersonalVehicle: false }, bankProposal: { ...bank, bankName: 'Restored bank' } })
  assert.equal(updated.id, row.id)
  assert.equal(updated.status, 'PENDING')
  assert.equal(updated.changes.bio, 'Old bio')
  assert.equal(updated.changes.media.hasPersonalVehicle, false)
  assert.equal(f.changes.publicPendingRequest(updated).changes.bankProposal.bankName, 'Restored bank')
  assert.notEqual(f.changes.profileChangeRevision(updated), previousRevision)
  assert.equal(f.profileWrites.length, 0)
  assert.equal(f.requests.length, 1)
})

test('admin approval applies bank but never activates account/profile, publishes media or marks verification', async () => {
  const f = fixture()
  const row = await f.submit({ bankProposal: bank, mediaProposal: { profilePhotoReceipt: 'owner-receipt' } })
  // JSONB reorders object keys on persistence; equivalent snapshots still match.
  row.before.media = Object.fromEntries(Object.entries(row.before.media).reverse())
  row.before.bankEncrypted = Object.fromEntries(Object.entries(row.before.bankEncrypted).reverse())
  const response = await f.decide(row)
  assert.equal(response.status, 200)
  assert.equal(row.status, 'APPROVED')
  assert.equal(f.profile.bankAccountFirstName, bank.firstName)
  assert.match(f.profile.ibanEncrypted, /^sealed:/)
  assert.equal(f.profile.status, 'ACTIVE')
  assert.equal(f.account.image, 'public-unchanged')
  assert.equal(f.accountWrites.length, 0)
  assert.doesNotMatch(JSON.stringify(f.profileWrites), /verified|approvedAt|status|image/)
  assert.doesNotMatch(JSON.stringify(f.audits), /FR7612345678901234567890123|TESTFRPP|ciphertext|private\/|sealed:/)
})

test('revision guards all reviewed content including before and timestamp; live bank drift blocks approval', async () => {
  for (const mutate of [(row: any) => { row.changes.bio = 'new proposal' }, (row: any) => { row.before.bio = 'altered baseline' }, (row: any) => { row.updatedAt = new Date('2026-10-01T00:00:00Z') }]) {
    const f = fixture(), row = await f.submit({ bio: 'new' })
    const revision = f.changes.profileChangeRevision(row)
    mutate(row)
    assert.equal((await f.review({ action: 'APPROVE', requestId: row.id, revision })).status, 409)
    assert.equal(f.profileWrites.length, 0)
  }
  const f = fixture(), row = await f.submit({ bankProposal: bank })
  f.profile.ibanEncrypted = 'changed-outside-request'
  assert.equal((await f.decide(row)).status, 409)
  assert.equal((await f.decide(row, 'REJECT', 'Coordonnées à corriger.')).status, 200)
})

test('reject requires a motif and rejected request can be explicitly resubmitted without exposing storage values', async () => {
  const f = fixture(), row = await f.submit({ bankProposal: bank, mediaProposal: { profilePhotoReceipt: 'owner-receipt' } })
  assert.equal((await f.decide(row, 'REJECT')).status, 400)
  assert.equal((await f.decide(row, 'REJECT', ' ')).status, 400)
  assert.equal((await f.decide(row, 'REJECT', 'Merci de corriger.')).status, 200)
  assert.equal(f.profileWrites.length, 0)
  const resubmitted = await f.submit({ resubmitRequestId: row.id, bio: 'Corrected bio' })
  assert.notEqual(resubmitted.id, row.id)
  assert.equal(resubmitted.changes.bankEncrypted.ciphertext, row.changes.bankEncrypted.ciphertext)
  assert.equal(resubmitted.changes.media.profilePhotoPath, 'private/new-photo')
  assert.equal(resubmitted.changes.bio, 'Corrected bio')
  assert.equal(row.status, 'REJECTED')
  await assert.rejects(() => f.submit({ resubmitRequestId: row.id }), /PROFILE_CHANGED/)
})

test('resubmit rejects foreign/non-rejected requests and stale baselines', async () => {
  const f = fixture(), row = await f.submit({ bankProposal: bank })
  await f.decide(row, 'REJECT', 'À corriger')
  f.profile.bankName = 'New current bank'
  await assert.rejects(() => f.submit({ resubmitRequestId: row.id }), /PROFILE_CHANGED/)
  const g = fixture(), other = await g.submit({ bio: 'New' })
  await g.decide(other, 'REJECT', 'À corriger')
  other.requestedByGuideAccountId = 'foreign'
  await assert.rejects(() => g.submit({ resubmitRequestId: other.id }), /RESUBMIT_NOT_FOUND/)
})

test('return-to-draft only affects REVIEW and needs exact dossier + pending version, without creating fake requests', async () => {
  for (const withPending of [false, true]) {
    const f = fixture()
    f.profile.status = 'REVIEW'
    f.profile.profileSubmittedAt = new Date('2026-09-13T09:00:00Z')
    const pending = withPending ? await f.submit({ bio: 'Proposal' }) : null
    const body = { action: 'RETURN_TO_DRAFT', reviewNotes: 'Complétez votre dossier.', profileSubmittedAt: f.profile.profileSubmittedAt.toISOString(), profileUpdatedAt: f.profile.updatedAt.toISOString(), ...(pending && { requestId: pending.id, revision: f.changes.profileChangeRevision(pending) }) }
    assert.equal((await f.review({ ...body, profileUpdatedAt: '2026-09-01T00:00:00Z' })).status, 409)
    assert.equal((await f.review({ ...body, reviewNotes: '' })).status, 400)
    assert.equal((await f.review(body)).status, 200)
    assert.equal(f.profile.status, 'DRAFT')
    assert.equal(f.profile.profileSubmittedAt, null)
    assert.equal(f.account.status, 'ACTIVE')
    assert.equal(f.requests.length, withPending ? 1 : 0)
    if (pending) assert.equal(pending.status, 'REJECTED')
    assert.equal(f.audits.at(-1).action, 'GUIDE_PROFILE_RETURNED_TO_DRAFT')
    assert.equal(JSON.parse(f.audits.at(-1).detail).reason, body.reviewNotes)
  }
  const f = fixture()
  assert.equal((await f.review({ action: 'RETURN_TO_DRAFT', reviewNotes: 'Reason', profileSubmittedAt: null, profileUpdatedAt: f.profile.updatedAt.toISOString() })).status, 409)
})

test('transaction rechecks admin/guide access and maps serializable conflicts to 409', async () => {
  const f = fixture(), row = await f.submit({ bio: 'New' })
  f.disableAdmin()
  assert.equal((await f.decide(row)).status, 403)
  const g = fixture(), pending = await g.submit({ bio: 'New' })
  g.account.status = 'DISABLED'
  assert.equal((await g.decide(pending)).status, 403)
  await assert.rejects(() => g.submit({ bio: 'Another' }), /PROFILE_FORBIDDEN/)
  const h = fixture(), conflicted = await h.submit({ bio: 'New' })
  h.failTransaction()
  assert.equal((await h.decide(conflicted)).status, 409)
})

test('crypto failures are privately unreadable, never raw errors/ciphertext, and do not prevent rejecting a request', async () => {
  const f = fixture(), row = await f.submit({ bankProposal: bank })
  f.breakCrypto()
  const safe = f.changes.publicPendingRequest(row)
  assert.equal(safe.changes.bankProposal, null)
  assert.doesNotMatch(JSON.stringify(safe), /sensitive crypto failure|sealed:|ciphertext/)
  const failed = await f.decide(row)
  assert.equal(failed.status, 409)
  assert.doesNotMatch(await failed.text(), /sensitive crypto failure|sealed:|ciphertext/)
  assert.equal((await f.decide(row, 'REJECT', 'À corriger')).status, 200)
  await assert.rejects(() => f.submit({ bankProposal: bank }), { message: 'BANK_UNAVAILABLE' })
})

test('review rejects cross-site origins before authentication/body/DB and anonymous requests before body/DB', async () => {
  const f = fixture()
  for (const action of ['APPROVE', 'REJECT', 'RETURN_TO_DRAFT']) {
    const response = await f.review({ action }, 'https://attacker.example')
    assert.equal(response.status, 403)
    assert.equal(response.headers.get('cache-control'), 'private, no-store')
  }
  assert.deepEqual(f.counters(), { authCalls: 0, transactionCalls: 0, bodyReads: 0 })
  f.denyAuth()
  assert.equal((await f.review({ action: 'APPROVE' })).status, 401)
  assert.deepEqual(f.counters(), { authCalls: 1, transactionCalls: 0, bodyReads: 0 })
  assert.equal(f.audits.length, 0)
  assert.equal(f.profileWrites.length, 0)
  assert.equal(f.accountWrites.length, 0)
})
