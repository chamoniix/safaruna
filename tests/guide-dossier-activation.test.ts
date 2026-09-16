import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import test from 'node:test'
import vm from 'node:vm'
import ts from 'typescript'

const require = createRequire(import.meta.url)
function load(file: string, mocks: Record<string, unknown>) {
  const module = { exports: {} as any }
  vm.runInNewContext(ts.transpileModule(readFileSync(file, 'utf8'), { compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS, esModuleInterop: true } }).outputText,
    { module, exports: module.exports, Error, console, process, require: (name: string) => Object.hasOwn(mocks, name) ? mocks[name] : require(name) })
  return module.exports
}

function fixture() {
  const actor = { id: 'admin', email: 'admin@example.test', role: 'SUPERADMIN' }
  const currentAdmin = { ...actor, status: 'ACTIVE' }
  const profile: any = {
    id: 'guide', slug: 'guide-test', status: 'REVIEW', updatedAt: new Date('2026-09-16'), profileSubmittedAt: new Date('2026-09-15'), approvedAt: null,
    guideAccountId: 'account', bio: 'Une présentation de test', city: 'MADINAH', gender: 'HOMME', nationality: 'FR', experienceYears: 8,
    servesMakkah: true, servesMadinah: true, acceptingBookings: false, permanentlyDeactivatedAt: null,
    bankAccountFirstName: 'Test', bankAccountLastName: 'Guide', bankName: 'Banque', bankCountry: 'FR', ibanEncrypted: 'iban-one', bicEncrypted: null,
    makkahNetUpTo6Cents: 10000, makkahNetUpTo15Cents: 13000, makkahNetUpTo32Cents: 16000,
    madinahNetUpTo6Cents: 10000, madinahNetUpTo15Cents: 13000, madinahNetUpTo32Cents: 16000,
    languages: [{ languageCode: 'fr' }], changeRequests: [],
  }
  const account: any = { id: 'account', email: 'guide@example.test', status: 'ACTIVE', firstName: 'Test', lastName: 'Guide', phoneWhatsapp: '+33000000000', image: 'https://photo.example.test/approved.webp', updatedAt: new Date('2026-09-16') }
  let events: any[] = []
  const writes: any[] = []
  let emails = 0
  let authenticated = true
  let failCatalog = false
  let conflict = false
  let inTransaction = false
  let queueFailure = false
  const notifications: any[] = []
  const email = {
    queueGuideDossierEmail: async (tx: unknown, opts: any) => {
      assert.equal(tx, db); assert.equal(inTransaction, true)
      if (queueFailure) throw new Error('queue unavailable')
      notifications.push(opts); return `delivery-${notifications.length}`
    },
    dispatchGuideDossierEmails: async (ids: string[]) => { assert.equal(inTransaction, false); emails += ids.length },
  }
  const db: any = {
    adminAccount: { findUnique: async () => currentAdmin, findMany: async () => [currentAdmin] },
    guideAccount: { findUnique: async () => ({ ...account, guideProfile: profile }), update: async ({ data }: any) => { writes.push(['account', data]); Object.assign(account, data) } },
    guideProfile: { findUnique: async () => ({ ...profile, guideAccount: account }), update: async ({ data }: any) => { writes.push(['profile', data]); Object.assign(profile, data) } },
    guideSession: { updateMany: async () => { writes.push(['sessions']); return { count: 1 } } },
    guidePlace: { findMany: async () => [] }, availability: { findMany: async () => [] },
    auditLog: {
      findFirst: async ({ where }: any) => [...events].reverse().find(e => e.action === where.action && e.target === where.target && (typeof where.actorRole === 'string' ? e.actorRole === where.actorRole : where.actorRole.in.includes(e.actorRole))) || null,
      create: async ({ data }: any) => { const row = { ...data, id: String(events.length), createdAt: new Date('2026-09-16') }; events.push(row); return row },
    },
    $transaction: async (fn: any, options: any) => {
      assert.equal(options.isolationLevel, 'Serializable')
      if (conflict) throw new (require('@prisma/client').Prisma.PrismaClientKnownRequestError)('Concurrent modification', { code: 'P2034', clientVersion: 'test' })
      const oldProfile = { ...profile }, oldAccount = { ...account }, count = writes.length, oldEvents = [...events], queued = notifications.length
      inTransaction = true
      try { return await fn(db) } catch (error) { Object.assign(profile, oldProfile); Object.assign(account, oldAccount); writes.splice(count); events = oldEvents; notifications.splice(queued); throw error } finally { inTransaction = false }
    },
  }
  const admin = { getAdminActor: async () => authenticated ? actor : null, getAdminAuditContext: () => ({}), adminAuditFields: () => ({ ip: '127.0.0.1' }), adminAuditDetail: (_: unknown, info: unknown) => JSON.stringify(info || {}) }
  const changes = {
    guideProfileChangesSchema: { safeParse: (value: any) => ({ success: true, data: value || {} }) },
    missingRequiredGuideProfileFields: (value: any, options?: any) => !value.firstName || !value.bio ? ['Informations manquantes'] : options?.requireSupportedCity && !((value.city === 'MAKKAH' && value.servesMakkah) || (value.city === 'MADINAH' && value.servesMadinah)) ? ['Ville principale'] : [],
    decryptBankProposal: (value: string) => JSON.parse(value),
  }
  const policy = load('src/lib/guide-payout-policy.ts', {})
  const dossier = load('src/lib/guide-dossier.ts', {
    '@/lib/email': email,
    'server-only': {}, '@/lib/crypto': { decrypt: (value: string) => value === 'iban-one' || value === 'iban-one-new-nonce' ? 'FR_TEST_IBAN_ONE' : 'FR_TEST_IBAN_TWO' },
    '@/lib/check-admin': admin, '@/lib/guide-profile-media': { readGuideProfileMedia: async () => ({ snapshot: { profilePhotoPath: 'private/test.webp' } }) },
    '@/lib/guide-profile-changes': changes, '@/lib/guide-payout-policy': policy,
    '@/lib/place-catalog': { getEffectivePlaceCatalog: async () => { if (failCatalog) throw new Error('catalog unavailable'); return [] } },
    '@/lib/booking-pricing': { BOOKING_NET_COSTS: { hotel: 80 } },
  })
  const shared = { '@/lib/prisma': db, '@/lib/check-admin': admin, '@/lib/guide-dossier': dossier, '@/lib/guide-profile-changes': changes, '@/lib/guide-profile-media': {}, '@/lib/crypto': {}, '@/lib/email': email }
  const detail = load('src/app/api/admin/guides/[slug]/activate/route.ts', shared)
  const listing = load('src/app/api/admin/guides/route.ts', shared)
  const bank = load('src/app/api/admin/guides/[slug]/profile-change/route.ts', shared)
  const submit = load('src/app/api/guide/profil/submit/route.ts', {
    ...shared,
    '@/lib/require-account': { requireGuide: async () => ({ ok: true, actor: { id: account.id, email: account.email, guideProfileId: profile.id } }) },
    '@/lib/guide-auth': { hasTrustedGuideAuthOrigin: () => true, getGuideRequestContext: () => ({ ip: '127.0.0.1' }) },
    '@/lib/email': email,
  })
  const request = (body: unknown, origin = 'https://safaruma.com') => ({ nextUrl: { origin: 'https://safaruma.com' }, headers: new Headers({ origin }), json: async () => body })
  const read = () => dossier.readAdminGuideDossier(db, account.id, actor)
  const append = async (action: string, after: any, actorRole = 'GUIDE') => db.auditLog.create({ data: { action, target: profile.id, actorRole, actor: actor.email, after } })
  const complete = async () => {
    const guideDossier = await dossier.readGuideDossier(db, account.id)
    for (const item of guideDossier.view.confirmations) await append(dossier.dossierAction(item.section), { revision: item.revision })
    await append('GUIDE_PHOTO_PUBLISHED', { image: account.image }, 'SUPERADMIN')
    await append('GUIDE_BANK_VERIFIED', { revision: (await read()).bankVerification.revision, accountHolderConfirmed: true }, 'ADMIN')
  }
  const post = (body: any, origin?: string) => detail.POST(request(body, origin), { params: Promise.resolve({ slug: profile.slug }) })
  const patch = (body: any, origin?: string) => listing.PATCH(request({ guideId: profile.id, ...body }, origin))
  const verify = (body: any, origin?: string) => bank.POST(request(body, origin), { params: Promise.resolve({ slug: profile.slug }) })
  return { db, actor, currentAdmin, profile, account, writes, read, complete, append, post, patch, verify, request, dossier, submit: () => submit.POST(request({})),
    events: () => events, emails: () => emails, notifications, breakQueue: () => { queueFailure = true }, noAuth: () => { authenticated = false }, breakCatalog: () => { failCatalog = true }, conflict: () => { conflict = true } }
}

test('submission and audit roll back if acknowledgement cannot be durably queued', async () => {
  const f = fixture()
  f.profile.status = 'DRAFT'
  await f.complete()
  f.breakQueue()
  await assert.rejects(f.submit(), /queue unavailable/)
  assert.equal(f.profile.status, 'DRAFT')
  assert.equal(f.writes.length, 0)
  assert.equal(f.emails(), 0)
  assert.equal(f.events().some(e => e.action === 'GUIDE_PROFILE_SUBMITTED_FOR_REVIEW'), false)
})

for (const endpoint of ['post', 'patch'] as const) {
  test(`${endpoint}: queue persistence failure rolls back activation and does not send`, async () => {
    const f = fixture()
    await f.complete()
    const state = await f.read()
    f.breakQueue()
    assert.equal((await f[endpoint]({ action: 'activate', revision: state.revision })).status, 500)
    assert.equal(f.profile.status, 'REVIEW')
    assert.equal(f.writes.length, 0)
    assert.equal(f.notifications.length, 0)
    assert.equal(f.emails(), 0)
    assert.equal(f.events().some(e => e.action === 'GUIDE_ACTIVATED'), false)
  })

  test(`${endpoint}: already ACTIVE rejection does not send a publication notification`, async () => {
    const f = fixture()
    f.profile.status = 'ACTIVE'
    f.profile.approvedAt = new Date('2026-09-15')
    const state = await f.read()
    assert.equal((await f[endpoint]({ action: 'activate', revision: state.revision })).status, 409)
    assert.equal(f.notifications.length, 0)
    assert.equal(f.emails(), 0)
  })

  test(`${endpoint}: first publication requires complete current dossier + Superadmin, preserves paused bookings`, async () => {
    const f = fixture()
    let state = await f.read()
    assert.equal((await f[endpoint]({ action: 'activate', revision: state.revision })).status, 409)
    assert.equal(f.writes.length, 0)
    await f.complete()
    state = await f.read()
    assert.equal(state.activation.canActivate, true)
    f.actor.role = f.currentAdmin.role = 'ADMIN'
    assert.equal((await f[endpoint]({ action: 'activate', revision: state.revision })).status, 403)
    f.actor.role = f.currentAdmin.role = 'SUPERADMIN'
    assert.equal((await f[endpoint]({ action: 'activate', revision: (await f.read()).revision })).status, 200)
    assert.equal(f.profile.status, 'ACTIVE')
    assert.equal(f.profile.acceptingBookings, false)
    assert.equal(f.emails(), 1)
    assert.equal(f.notifications[0].event, 'ACTIVATED')
    assert.equal(f.notifications[0].eventId, f.events().find(e => e.action === 'GUIDE_ACTIVATED').id)
    assert.doesNotMatch(JSON.stringify(f.events()), /FR_TEST_IBAN|iban-one|private\/test/)
  })

  test(`${endpoint}: stale revision, changed admin privilege, permanent ban and missing submission never activate`, async () => {
    const f = fixture(); await f.complete()
    const revision = (await f.read()).revision
    f.account.firstName = 'Changed'
    assert.equal((await f[endpoint]({ action: 'activate', revision })).status, 409)
    f.currentAdmin.role = 'ADMIN'
    assert.equal((await f[endpoint]({ action: 'activate', revision })).status, 403)
    f.currentAdmin.role = 'SUPERADMIN'
    f.profile.permanentlyDeactivatedAt = new Date()
    assert.equal((await f[endpoint]({ action: 'activate', revision: (await f.read()).revision })).status, 409)
    f.profile.permanentlyDeactivatedAt = null
    f.profile.status = 'SUSPENDED'; f.account.status = 'SUSPENDED'; f.profile.profileSubmittedAt = null
    assert.equal((await f[endpoint]({ action: 'activate', revision: (await f.read()).revision })).status, 409)
    assert.equal(f.writes.length, 0); assert.equal(f.emails(), 0)
  })

  test(`${endpoint}: Admin reactivates documented legacy publication without new acknowledgements`, async () => {
    const f = fixture(); f.actor.role = f.currentAdmin.role = 'ADMIN'
    f.profile.status = 'SUSPENDED'; f.account.status = 'SUSPENDED'; f.profile.approvedAt = new Date('2025-01-01')
    f.profile.city = 'Ancienne ville'; f.account.image = null
    f.profile.bio = ''
    assert.equal((await f[endpoint]({ action: 'activate', revision: (await f.read()).revision })).status, 409)
    f.profile.bio = 'Une présentation de test'
    assert.equal((await f[endpoint]({ action: 'activate', revision: (await f.read()).revision })).status, 200)
    assert.equal(f.profile.status, 'ACTIVE'); assert.equal(f.profile.acceptingBookings, false)
  })

  test(`${endpoint}: immediate suspension does not depend on dossier and revokes Guide sessions`, async () => {
    const f = fixture(); f.profile.status = 'ACTIVE'; f.breakCatalog()
    assert.equal((await f[endpoint]({ action: 'suspend' })).status, 200)
    assert.equal(f.account.status, 'SUSPENDED')
    assert.equal(f.writes.filter(write => write[0] === 'sessions').length, 1)
    assert.equal(f.emails(), 0)
  })

  test(`${endpoint}: activation requires a revision and authentication`, async () => {
    const f = fixture()
    assert.equal((await f[endpoint]({ action: 'activate' })).status, 400)
    f.noAuth()
    assert.equal((await f[endpoint]({ action: 'activate', revision: 'a'.repeat(64) })).status, 401)
    assert.equal(f.writes.length, 0)
  })

  test(`${endpoint}: cross-origin writes rejected and serialization conflicts surface as 409`, async () => {
    const f = fixture(); await f.complete()
    const body = { action: 'activate', revision: (await f.read()).revision }
    assert.equal((await f[endpoint](body, 'https://evil.example.test')).status, 403)
    f.conflict()
    assert.equal((await f[endpoint](body)).status, 409)
    assert.equal(f.writes.length, 0); assert.equal(f.emails(), 0)
  })
}

test('manual banking verification requires explicit attestation, is idempotent and invalidates on bank/identity changes', async () => {
  const f = fixture()
  const revision = (await f.read()).bankVerification.revision
  assert.equal((await f.verify({ action: 'VERIFY_BANK', revision })).status, 400)
  assert.equal((await f.verify({ action: 'VERIFY_BANK', revision, accountHolderConfirmed: true })).status, 200)
  assert.equal((await f.verify({ action: 'VERIFY_BANK', revision, accountHolderConfirmed: true })).status, 200)
  assert.equal(f.events().filter(e => e.action === 'GUIDE_BANK_VERIFIED').length, 1)
  assert.equal((await f.read()).bankVerification.verified, true)
  f.profile.ibanEncrypted = 'iban-two'
  assert.equal((await f.read()).bankVerification.verified, false)
  assert.equal((await f.verify({ action: 'VERIFY_BANK', revision, accountHolderConfirmed: true })).status, 409)
  f.profile.ibanEncrypted = 'iban-one'; f.account.firstName = 'Other'
  assert.equal((await f.read()).bankVerification.verified, false)
  assert.doesNotMatch(JSON.stringify(f.events()), /FR_TEST_IBAN|iban-one/)
})

test('private pending bank can be acknowledged; approval re-encryption does not invalidate same semantic data', async () => {
  const f = fixture()
  f.profile.changeRequests = [{ changes: { bankEncrypted: JSON.stringify({ firstName: 'Test', lastName: 'Guide', bankName: 'Banque', country: 'FR', iban: 'FR_TEST_IBAN_ONE', bic: '' }) } }]
  const pending = await f.dossier.readGuideDossier(f.db, f.account.id)
  assert.equal(pending.view.bankProposalPending, true)
  const bankAck = pending.view.confirmations.find((v: any) => v.section === 'bank')
  await f.append(f.dossier.dossierAction('bank'), { revision: bankAck.revision })
  f.profile.changeRequests = []; f.profile.ibanEncrypted = 'iban-one-new-nonce'
  const approved = await f.dossier.readGuideDossier(f.db, f.account.id)
  assert.equal(approved.view.confirmations.find((v: any) => v.section === 'bank').confirmed, true)
})

test('private portrait alone is insufficient and changed public photo invalidates publication proof', async () => {
  const f = fixture(); await f.complete()
  f.account.image = 'https://photo.example.test/unapproved.webp'
  assert.equal((await f.read()).activation.canActivate, false)
  assert.match((await f.read()).activation.blockers.join(' '), /photo publique/)
})

test('legacy publication audit is sufficient evidence; suspended status alone is not', async () => {
  const f = fixture(); f.actor.role = f.currentAdmin.role = 'ADMIN'; f.profile.status = 'SUSPENDED'; f.account.status = 'SUSPENDED'
  assert.equal((await f.read()).activation.requiresSuperadmin, true)
  await f.append('GUIDE_ACTIVATED', { status: 'ACTIVE' }, 'ADMIN')
  assert.equal((await f.read()).activation.requiresSuperadmin, false)
  assert.equal((await f.read()).activation.canActivate, true)
})

test('unchanged historical bank confirmation remains valid, but never after identity or bank change', async () => {
  const f = fixture()
  const dossier = await f.dossier.readGuideDossier(f.db, f.account.id)
  const policy = load('src/lib/guide-payout-policy.ts', {})
  const oldRevision = f.dossier.dossierFingerprint({ guideAccountId: f.account.id, section: 'bank', acknowledgement: policy.GUIDE_DOSSIER_ACKNOWLEDGEMENTS.bank, snapshot: {
    fingerprint: f.dossier.dossierFingerprint({ guideAccountId: f.account.id, firstName: f.account.firstName, lastName: f.account.lastName, bank: dossier.view.bank, encryptedIban: f.profile.ibanEncrypted, encryptedBic: f.profile.bicEncrypted }), requirement: policy.GUIDE_PAYOUT_POLICY.holder,
  } })
  await f.append(f.dossier.dossierAction('bank'), { revision: oldRevision })
  const confirmed = async () => (await f.dossier.readGuideDossier(f.db, f.account.id)).view.confirmations.find((v: any) => v.section === 'bank').confirmed
  assert.equal(await confirmed(), true)
  f.account.firstName = 'Changed'; assert.equal(await confirmed(), false)
  f.account.firstName = 'Test'; f.profile.ibanEncrypted = 'iban-two'; assert.equal(await confirmed(), false)
})

test('initial submission requires every Guide confirmation, not administrative bank or public portrait approval', async () => {
  const f = fixture(); f.profile.status = 'DRAFT'; f.profile.profileSubmittedAt = null; f.account.image = null
  assert.equal((await f.submit()).status, 400)
  assert.equal(f.writes.length, 0); assert.equal(f.emails(), 0)
  const dossier = await f.dossier.readGuideDossier(f.db, f.account.id)
  for (const item of dossier.view.confirmations) await f.append(f.dossier.dossierAction(item.section), { revision: item.revision })
  assert.equal((await f.read()).bankVerification.verified, false)
  assert.equal((await f.submit()).status, 200)
  assert.equal(f.profile.status, 'REVIEW'); assert.equal(f.emails(), 2)
  assert.deepEqual(f.notifications.map(item => item.event), ['SUBMITTED', 'ADMIN_REVIEW'])
  assert.equal(f.notifications[0].eventId, f.notifications[1].eventId)
  assert.equal(f.notifications[0].to, 'guide@example.test')
  assert.equal(f.notifications[1].to, 'admin@example.test')
  assert.equal((await f.submit()).status, 200); assert.equal(f.emails(), 2, 'repeat submission must not send email again')
  f.account.status = 'SUSPENDED'
  assert.equal((await f.submit()).status, 403); assert.equal(f.emails(), 2)
})

test('manual verification rejects untrusted origins and database serialization conflicts without audit', async () => {
  const f = fixture()
  const body = { action: 'VERIFY_BANK', revision: (await f.read()).bankVerification.revision, accountHolderConfirmed: true }
  assert.equal((await f.verify(body, 'https://evil.example.test')).status, 403)
  f.conflict()
  assert.equal((await f.verify(body)).status, 409)
  assert.equal(f.events().length, 0)
})
