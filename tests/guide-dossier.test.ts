import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import test from 'node:test'
import vm from 'node:vm'
import ts from 'typescript'

const require = createRequire(import.meta.url)
function load(file: string, mocks: Record<string, unknown>) {
  const module = { exports: {} as any }
  vm.runInNewContext(ts.transpileModule(readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true, jsx: ts.JsxEmit.ReactJSX },
  }).outputText, { module, exports: module.exports, Error, require: (name: string) => Object.hasOwn(mocks, name) ? mocks[name] : require(name) })
  return module.exports
}

function fixture() {
  const policy = load('src/lib/guide-payout-policy.ts', {})
  const profile = {
    id: 'profile-a', status: 'DRAFT', bio: 'Présentation réelle du dossier de test', city: 'MADINAH', gender: 'HOMME', nationality: 'FR', experienceYears: 0,
    servesMakkah: true, servesMadinah: true, acceptingBookings: true, permanentlyDeactivatedAt: null,
    bankAccountFirstName: 'Test', bankAccountLastName: 'Guide', bankName: 'Banque test', bankCountry: 'FR', ibanEncrypted: 'encrypted-iban-test', bicEncrypted: null,
    makkahNetUpTo6Cents: 10000, makkahNetUpTo15Cents: 13000, makkahNetUpTo32Cents: 16000,
    madinahNetUpTo6Cents: 11000, madinahNetUpTo15Cents: 14000, madinahNetUpTo32Cents: 17000,
    languages: [{ languageCode: 'fr' }], changeRequests: [] as any[],
  }
  const account = { id: 'account-a', email: 'guide@example.test', status: 'ACTIVE', firstName: 'Test', lastName: 'Guide', phoneWhatsapp: '+33000000000', image: null, guideProfile: profile }
  let entries: any[] = []
  const queries: any[] = []
  const unavailable: any[] = []
  const catalog = [{ key: 'test-place', nameFr: 'Lieu de test', isActive: true, includedInBase: false, netUpTo6Cents: 5000, netUpTo15Cents: 7000, netUpTo32Cents: 9000 }]
  let trusted = true
  let access = true
  let brokenCrypto = false
  const mediaModule = load('src/lib/guide-profile-media.ts', {
    '@/lib/guide-application-media': load('src/lib/guide-application-media.ts', {}),
    '@/lib/guide-application-photo-receipt': { readApplicationPhotoReceipt: () => { throw new Error('Unexpected upload in dossier test') } },
  })
  const media = { ...mediaModule, readGuideProfileMedia: async () => ({ snapshot: { profilePhotoPath: 'private/photo-test' }, view: null }) }
  const db: any = {
    guideAccount: { findUnique: async (query: any) => { queries.push(query); return query.where.id === account.id ? account : null } },
    guideApplication: { findFirst: async () => ({ profilePhotoPath: 'private/photo-test' }) },
    guideProfileChangeRequest: { findFirst: async () => null },
    guidePlace: { findMany: async () => [{ placeKey: 'test-place', isActive: true }] },
    availability: { findMany: async (query: any) => { assert.equal(query.where.status, 'UNAVAILABLE'); return unavailable } },
    auditLog: {
      findFirst: async (query: any) => [...entries].reverse().find(entry => entry.action === query.where.action && entry.target === query.where.target && entry.actorRole === query.where.actorRole) || null,
      create: async ({ data }: any) => { const entry = { ...data, id: `event-${entries.length}`, createdAt: new Date('2026-09-13T08:00:00Z') }; entries.push(entry); return entry },
    },
    $transaction: async (callback: any, options: any) => {
      assert.equal(options.isolationLevel, 'Serializable')
      const before = [...entries]
      try { return await callback(db) } catch (error) { entries = before; throw error }
    },
  }
  const changes = load('src/lib/guide-profile-changes.ts', {
    'server-only': {}, '@/lib/prisma': db, '@/lib/languages': { GUIDE_LANGUAGES: [{ code: 'fr' }] },
    '@/lib/guide-profile-media': media, '@/lib/crypto': { decrypt: () => { throw new Error('Unexpected proposed bank') }, encrypt: () => { throw new Error('Unexpected write') } },
  })
  const dossier = load('src/lib/guide-dossier.ts', {
    'server-only': {}, '@/lib/crypto': { decrypt: () => { if (brokenCrypto) throw new Error('secret crypto failure'); return 'FR7612345678901234567890123' } },
    '@/lib/place-catalog': { getEffectivePlaceCatalog: async (client: any) => { assert.equal(client, db); return catalog } },
    '@/lib/booking-pricing': { BOOKING_NET_COSTS: { trainPerTrip: 80, guideHotelPerNight: 80 } },
    '@/lib/guide-profile-changes': changes, '@/lib/guide-payout-policy': policy,
    '@/lib/guide-profile-media': media,
  })
  const route = load('src/app/api/guide/profil/route.ts', {
    '@/lib/prisma': db, '@/lib/require-account': { requireGuide: async () => access ? { ok: true, actor: { id: account.id, email: account.email } } : { ok: false, response: new Response('{}', { status: 401 }) } },
    '@/lib/guide-auth': { hasTrustedGuideAuthOrigin: () => trusted, getGuideRequestContext: () => ({ ip: '127.0.0.1', userAgent: 'test', country: 'FR', city: null, device: 'DESKTOP', browser: 'test' }) },
    '@/lib/guide-profile-changes': changes, '@/lib/guide-application-media': { applicationMediaSelect: {}, applicationMediaView: () => ({ photos: {} }) },
    '@/lib/guide-dossier': dossier, '@/lib/guide-payout-policy': policy,
    '@/lib/guide-profile-media': media, '@/lib/guide-photo': { GuidePhotoError: class extends Error {} },
    '@/lib/ratelimit': { apiRatelimit: null, checkRateLimit: async () => null },
  })
  const read = () => dossier.readGuideDossier(db, account.id)
  const post = (body: unknown) => route.POST({ json: async () => body })
  return { read, post, get: route.GET, dossier, db, account, profile, catalog, queries, unavailable, policy,
    entries: () => entries, trust: (value: boolean) => { trusted = value }, access: (value: boolean) => { access = value }, breakCrypto: () => { brokenCrypto = true } }
}

test('dossier reads actual owner data, optional BIC and unmarked available calendar', async () => {
  const f = fixture()
  const { view } = await f.read()
  assert.equal(view.bank.iban, 'FR7612345678901234567890123')
  assert.equal(view.bank.bic, null)
  assert.equal(view.rates.base[1].cents[0], 11000)
  assert.equal(view.confirmations.find((item: any) => item.section === 'calendar').ready, true)
  assert.equal(view.progress.filter((item: any) => item.complete).length, 2)
  assert.equal(view.confirmations.every((item: any) => !item.confirmed), true)
  assert.equal(f.queries.every(query => query.where.id === 'account-a'), true)
  await assert.rejects(() => f.dossier.readGuideDossier(f.db, 'account-other'), /DOSSIER_NOT_FOUND/)
})

test('confirmations persist, survive reload, are idempotent and never store bank details in audit', async () => {
  const f = fixture()
  const initial = await f.read()
  const body = { confirmations: initial.view.confirmations.map(({ section, revision }: any) => ({ section, revision })) }
  const response = await f.post(body)
  assert.equal(response.status, 200)
  assert.equal(response.headers.get('cache-control'), 'private, no-store')
  assert.equal(f.entries().length, 4)
  assert.equal((await f.read()).view.confirmations.every((item: any) => item.confirmed), true)
  assert.equal((await f.post(body)).status, 200)
  assert.equal(f.entries().length, 4)
  assert.equal(f.profile.status, 'DRAFT')
  assert.doesNotMatch(JSON.stringify(f.entries()), /FR7612345678901234567890123|encrypted-iban-test|private\/photo-test/)
  assert.equal(f.entries().every(entry => entry.actorRole === 'GUIDE' && entry.ip === '127.0.0.1'), true)
})

test('stale bank/rate/calendar snapshots are rejected atomically rather than accepted silently', async () => {
  const f = fixture()
  const before = await f.read()
  const body = { confirmations: before.view.confirmations.map(({ section, revision }: any) => ({ section, revision })) }
  f.profile.makkahNetUpTo6Cents = 12000
  const stale = await f.post(body)
  assert.equal(stale.status, 409)
  assert.equal(f.entries().length, 0, 'bank confirmation preceding rates must also roll back')
  const fresh = await f.read()
  await f.post({ confirmations: fresh.view.confirmations.map(({ section, revision }: any) => ({ section, revision })) })
  f.profile.ibanEncrypted = 'new-encrypted-iban'
  f.unavailable.push({ date: new Date('2026-10-01T00:00:00Z'), city: 'MADINAH' })
  const changed = (await f.read()).view.confirmations
  assert.equal(changed.find((item: any) => item.section === 'bank').confirmed, false)
  assert.equal(changed.find((item: any) => item.section === 'calendar').confirmed, false)
  assert.equal(changed.find((item: any) => item.section === 'terms').confirmed, true)
})

test('missing bank information and crypto failure remain incomplete, never replaced by fake values', async () => {
  const f = fixture()
  f.profile.bankName = ''
  const bank = (await f.read()).view.confirmations.find((item: any) => item.section === 'bank')
  assert.equal(bank.ready, false)
  assert.equal((await f.post({ confirmations: [{ section: 'bank', revision: bank.revision }] })).status, 400)
  f.breakCrypto()
  const view = (await f.read()).view
  assert.equal(view.bank.readable, false)
  assert.equal(view.bank.iban, null)
  assert.equal(f.entries().length, 0)
})

test('origin, authentication, suspended accounts and malformed bodies block confirmation', async () => {
  const f = fixture()
  f.trust(false)
  assert.equal((await f.post({})).status, 403)
  f.trust(true)
  f.access(false)
  assert.equal((await f.post({})).status, 401)
  f.access(true)
  for (const body of [null, {}, { confirmations: [], guideAccountId: 'other' }, { confirmations: [{ section: 'publish', revision: 'a'.repeat(64) }] }]) {
    assert.equal((await f.post(body)).status, 400)
  }
  const bank = (await f.read()).view.confirmations[0]
  f.account.status = 'SUSPENDED'
  assert.equal((await f.post({ confirmations: [{ section: bank.section, revision: bank.revision }] })).status, 403)
  assert.equal(f.entries().length, 0)
})

test('existing ACTIVE paused Guides keep status and prices when recording confirmations', async () => {
  const f = fixture()
  f.profile.status = 'ACTIVE'
  f.profile.acceptingBookings = false
  const before = JSON.stringify(f.profile)
  const view = (await f.read()).view
  assert.equal((await f.post({ confirmations: view.confirmations.map(({ section, revision }: any) => ({ section, revision })) })).status, 200)
  assert.equal(JSON.stringify(f.profile), before)
})

test('conditions and dashboard share the approved EUR policy without adding a payout engine', () => {
  const f = fixture()
  assert.match(f.policy.GUIDE_PAYOUT_POLICY.delay, /trois jours ouvrés.*fin du séjour/)
  assert.match(f.policy.GUIDE_PAYOUT_POLICY.delay, /vendredi, le samedi et le dimanche/)
  assert.match(f.policy.GUIDE_PAYOUT_POLICY.currency, /euros/)
  const conditions = readFileSync('src/app/conditions-guides/page.tsx', 'utf8')
  assert.doesNotMatch(conditions, /Virement le 1er du mois/)
  assert.match(conditions, /GUIDE_PAYOUT_POLICY.delay/)
  const page = readFileSync('src/app/guide/(dashboard)/profil/page.tsx', 'utf8')
  assert.match(page, /GUIDE_PAYOUT_POLICY/)
  assert.match(page, /data-clarity-mask="true" data-sentry-mask/)
  assert.doesNotMatch(page, /Tarifs nets validés/)
  assert.equal((page.match(/id="guide-profile-submission"/g) || []).length, 1)
})

test('profile GET returns owner banking with no-store, and no banking to an unauthenticated request', async () => {
  const f = fixture()
  const response = await f.get()
  assert.equal(response.status, 200)
  assert.equal(response.headers.get('cache-control'), 'private, no-store')
  const data = await response.json()
  assert.equal(data.profile.dossier.bank.iban, 'FR7612345678901234567890123')
  assert.doesNotMatch(JSON.stringify(data), /encrypted-iban-test/)
  f.access(false)
  assert.equal((await f.get()).status, 401)
})

test('profile renders real dossier data, readable banking and a single final submission control', async () => {
  const f = fixture()
  const dossier = (await f.read()).view
  const react = require('react')
  const { renderToStaticMarkup } = require('react-dom/server')
  let index = 0
  const profile = { ...f.account, ...f.profile, name: 'Test Guide', image: null, applicationMedia: null, createdAt: '13/09/2026', pendingChangeRequest: null, dossier }
  const Page = load('src/app/guide/(dashboard)/profil/page.tsx', {
    react: { ...react, useState: (initial: unknown) => [index++ === 0 ? profile : index === 2 ? false : initial, () => {}], useEffect: () => {} },
    'next/link': ({ children, ...props }: any) => react.createElement('a', props, children),
    'next/image': () => null,
    '@/lib/languages': { GUIDE_LANGUAGES: [{ code: 'fr', label: 'Français' }], LANG_CODE_TO_LABEL: { fr: 'Français' } },
    '@/components/guide/ApplicationMediaPanel': () => null,
    '@/components/guide/GuideDossierProposalEditor': () => null,
    '@/lib/guide-payout-policy': f.policy,
  }).default
  const html = renderToStaticMarkup(react.createElement(Page))
  assert.match(html, /FR7612345678901234567890123/)
  assert.match(html, /data-clarity-mask="true"/)
  assert.match(html, /3?trois jours ouvrés/)
  assert.match(html, /Lieu de test/)
  assert.match(html, /110 €|110<!-- -->/)
  assert.equal((html.match(/id="guide-profile-submission"/g) || []).length, 1)
  assert.equal((html.match(/type="checkbox"/g) || []).length, 4)
  assert.doesNotMatch(html, /secret crypto failure|encrypted-iban-test/)
})
