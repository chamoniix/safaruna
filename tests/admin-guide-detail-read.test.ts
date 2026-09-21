import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import test from 'node:test'
import vm from 'node:vm'
import ts from 'typescript'

const require = createRequire(import.meta.url)

function fixture() {
  let actor: any = { id: 'admin-test', email: 'admin@example.test', role: 'SUPERADMIN' }
  let revoked = false
  let failDatabase = false
  let elapsedMs = 0
  let budget = 5000
  let transactionOptions: any
  let mediaReads = 0
  const calls: string[] = []
  const profile: any = {
    id: 'profile-test', slug: 'guide-test', status: 'DRAFT', createdAt: new Date('2026-09-01'),
    guideAccount: { id: 'account-test', email: 'guide@example.test', registeredAt: new Date('2026-09-01') },
    languages: [], reservations: [], availabilities: [], places: [], changeRequests: [], reservationIncidents: [],
  }
  const media = { snapshot: { profilePhotoPath: 'private-test-path' }, view: { photos: { profile: '/api/guide-applications/test/photos/profile' } } }
  const read = (name: string, value: any) => async () => { calls.push(name); return value }
  const tx: any = {
    guideProfile: { findUnique: async () => { calls.push('profile'); if (failDatabase) throw new Error('private database diagnostic'); return profile } },
    reservationHold: { findMany: read('holds', []) },
    reservation: { count: read('count', 0), aggregate: read('revenue', { _sum: { totalPrice: null } }) },
    conversation: { findMany: read('conversations', []) },
    guideApplication: { findFirst: read('application', null) },
  }
  function consume(ms: number) {
    elapsedMs += ms
    if (elapsedMs > budget) throw Object.assign(new Error('Transaction already closed: expired transaction'), { code: 'P2028' })
  }
  const mocks: Record<string, any> = {
    '@/lib/prisma': { $transaction: async (fn: any, options: any) => {
      calls.push('transaction'); transactionOptions = options; budget = options.timeout ?? 5000
      return fn(tx)
    } },
    '@/lib/check-admin': { getAdminActor: async () => actor },
    '@/lib/crypto': { decrypt: () => { throw new Error('Unexpected decrypt') } },
    '@/lib/guide-application-media': { applicationMediaSelect: {}, applicationMediaView: () => { throw new Error('No application in this fixture') } },
    '@/lib/guide-profile-changes': {},
    '@/lib/guide-profile-media': { readGuideProfileMedia: async (db: any, id: string) => {
      assert.equal(db, tx); assert.equal(id, profile.id); mediaReads++; consume(1000); return media
    } },
    '@/lib/guide-dossier': {
      requireCurrentDossierAdmin: async (db: any, current: any) => {
        assert.equal(db, tx); assert.equal(current, actor); calls.push('current-admin')
        if (revoked) throw new Error('Access revoked')
      },
      readAdminGuideDossier: async (db: any, id: string, current: any, preloaded?: any) => {
        assert.equal(db, tx); assert.equal(id, profile.guideAccount.id); assert.equal(current, actor)
        assert.equal(preloaded?.db, tx)
        assert.equal(preloaded?.guideProfileId, profile.id, 'reuse only this profile media inside the same transaction')
        assert.equal(preloaded?.value, media, 'do not query the same media twice')
        consume(15500)
        return { revision: 'current-revision', activation: { canActivate: false } }
      },
    },
  }
  const module = { exports: {} as any }
  vm.runInNewContext(ts.transpileModule(readFileSync('src/app/api/admin/guides/[slug]/route.ts', 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true },
  }).outputText, { module, exports: module.exports, Date, Error, console: { error() {} },
    require: (name: string) => Object.hasOwn(mocks, name) ? mocks[name] : require(name),
  })
  return {
    get: () => module.exports.GET({}, { params: Promise.resolve({ slug: profile.slug }) }),
    profile, calls, options: () => transactionOptions, mediaReads: () => mediaReads,
    anonymous: () => { actor = null }, admin: () => { actor.role = 'ADMIN' },
    revoke: () => { revoked = true }, breakDatabase: () => { failDatabase = true },
  }
}

test('admin detail survives the observed slow read with a bounded GET budget and one media load', async () => {
  const f = fixture()
  const response = await f.get()
  assert.equal(response.status, 200)
  assert.equal(f.options().timeout, 30000)
  assert.equal(f.options().isolationLevel, 'Serializable')
  assert.equal(f.mediaReads(), 1)
  assert.deepEqual(f.calls.slice(0, 3), ['transaction', 'current-admin', 'profile'])
  assert.equal(response.headers.get('cache-control'), 'private, no-store')
  const body = await response.json()
  assert.equal(body.guide.status, 'DRAFT')
  assert.equal(body.guide.dossier.activation.canActivate, false)
  assert.equal(body.permissions.canManagePricing, true)
  assert.equal(body.guide.stats.totalReservations, 0)
  assert.equal(body.guide.stats.totalRevenue, 0)
  assert.doesNotMatch(JSON.stringify(body), /private-test-path/)
})

test('admin detail preserves the Admin role without granting pricing permission', async () => {
  const f = fixture(); f.admin()
  const response = await f.get()
  assert.equal(response.status, 200)
  assert.equal((await response.json()).permissions.canManagePricing, false)
})

test('anonymous or revoked admin cannot read any profile data', async () => {
  const anonymous = fixture(); anonymous.anonymous()
  assert.equal((await anonymous.get()).status, 401)
  assert.equal(anonymous.calls.length, 0)
  const revoked = fixture(); revoked.revoke()
  const denied = await revoked.get()
  assert.notEqual(denied.status, 200)
  assert.equal(revoked.calls.includes('profile'), false)
  assert.doesNotMatch(await denied.text(), /guide@example|profile-test/)
})

test('database errors remain failures, never an empty or invented guide dossier', async () => {
  const f = fixture(); f.breakDatabase()
  const response = await f.get()
  assert.equal(response.status, 500)
  assert.deepEqual(await response.json(), { error: 'Erreur serveur' })
})
