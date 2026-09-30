import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { resolve } from 'node:path'
import { randomBytes, randomUUID } from 'node:crypto'
import test from 'node:test'
import vm from 'node:vm'
import ts from 'typescript'
import { PrismaClient } from '@prisma/client'
import type { AdminActor } from '../src/lib/check-admin'

const url = process.env.PAYMENT_INTEGRATION_TEST_DATABASE_URL

// Reuses the same disposable Neon "preview" database as the payment lifecycle
// test (never production — hostname is asserted). Verifies Phase 1 of the
// guide "first publication" close-out: the activate button itself, the
// Admin-vs-Superadmin distinction (first publication vs. reactivation), and
// the activation email — against real dossier-confirmation logic, not a
// hand-faked shortcut.
test('guide first publication: real dossier gate, Admin/Superadmin distinction, activation email', { skip: !url }, async t => {
  const parsed = new URL(url!)
  assert.equal(parsed.hostname, 'ep-floral-night-abr7efez.eu-west-2.aws.neon.tech')
  const db = new PrismaClient({ datasources: { db: { url } } })
  const originalEncryptionKey = process.env.ENCRYPTION_KEY
  process.env.ENCRYPTION_KEY = randomBytes(32).toString('hex')

  const nodeRequire = createRequire(import.meta.url)
  const realNextServer = nodeRequire('next/server')
  // Routes get `db` through this proxy, which only raises the default 5s
  // interactive-transaction budget when the caller didn't set one. Real
  // production traffic runs co-located with the database (sub-10ms RTT) and
  // comfortably clears that budget; this sandbox's path to the isolated Neon
  // "preview" project does not. The override compensates for network
  // topology only — it changes no application logic, and this test's own
  // helper calls keep their own explicit timeout below.
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
      fetch: async () => { throw new Error('Simulated network call blocked in isolated test') },
      require: (name: string) => {
        if (name === 'server-only') return {}
        if (name === '@/lib/prisma') return { default: dbForRoutes, __esModule: true }
        if (name === 'next/server') return realNextServer
        if (name === 'next/cache') return { revalidatePath: () => {} }
        if (name.startsWith('@/')) return load(`src/${name.slice(2)}.ts`)
        return nodeRequire(name)
      },
    })
    return loadedModule.exports as T
  }

  try {
    const dossier = load<typeof import('../src/lib/guide-dossier')>('src/lib/guide-dossier.ts')
    const crypto = load<typeof import('../src/lib/crypto')>('src/lib/crypto.ts')
    const { NextRequest } = nodeRequire('next/server') as typeof import('next/server')

    const admin = await db.adminAccount.create({ data: { email: `${randomUUID()}@example.test`, role: 'ADMIN' } })
    const superadmin = await db.adminAccount.create({ data: { email: `${randomUUID()}@example.test`, role: 'SUPERADMIN' } })
    const adminActor: AdminActor = { id: admin.id, email: admin.email, role: 'ADMIN' }
    const superadminActor: AdminActor = { id: superadmin.id, email: superadmin.email, role: 'SUPERADMIN' }
    let currentActor: AdminActor = superadminActor
    // Override must happen BEFORE anything that imports '@/lib/check-admin' is
    // loaded — CommonJS destructures named exports at require-time, so a route
    // loaded first would freeze a reference to the real getAdminActor.
    const checkAdminModule = load<typeof import('../src/lib/check-admin')>('src/lib/check-admin.ts')
    cache.set(resolve('src/lib/check-admin.ts'), { exports: { ...checkAdminModule, getAdminActor: async () => currentActor } })

    const activateRoute = load<typeof import('../src/app/api/admin/guides/[slug]/activate/route')>('src/app/api/admin/guides/[slug]/activate/route.ts')
    const availableRoute = load<typeof import('../src/app/api/guides/available/route')>('src/app/api/guides/available/route.ts')

    async function makeReadyGuide() {
      const bank = {
        bankAccountFirstName: 'Test', bankAccountLastName: 'Guide',
        bankName: 'Test Bank', bankCountry: 'FR', ibanEncrypted: crypto.encrypt('FR7612345987650123456789014'),
      }
      const guide = await db.guideProfile.create({ data: {
        ...bank, slug: `test-guide-${randomUUID()}`, status: 'REVIEW', city: 'MAKKAH', gender: 'HOMME', nationality: 'Française',
        experienceYears: 5, bio: 'Guide de test isolé', servesMakkah: true,
        profileSubmittedAt: new Date(),
        guideAccount: { create: {
          email: `${randomUUID()}@example.test`, firstName: 'Test', lastName: 'Guide',
          phoneWhatsapp: '+33600000000',
        } },
        languages: { create: { languageCode: 'fr', level: 'NATIVE' } },
      }, include: { guideAccount: true } })

      // Guide-side confirmations: compute each section's real expected revision
      // via the loaded (real) dossier module, then record it exactly as the
      // guide-facing confirmation endpoint would — no hand-guessed hashes.
      const initial = await db.$transaction(tx => dossier.readAdminGuideDossier(tx, guide.guideAccountId!, superadminActor), { timeout: 15000 })
      for (const item of initial.confirmations) {
        await db.auditLog.create({ data: {
          actor: guide.guideAccount!.email, actorRole: 'GUIDE',
          action: dossier.dossierAction(item.section), target: guide.id,
          after: { revision: item.revision },
        } })
      }

      // Superadmin-approved public photo: mirrors the exact end-state the real
      // upload route leaves (image set + matching GUIDE_PHOTO_PUBLISHED audit).
      const imageUrl = `https://blob.example.test/${randomUUID()}.jpg`
      await db.guideAccount.update({ where: { id: guide.guideAccountId! }, data: { image: imageUrl } })
      await db.auditLog.create({ data: {
        actor: superadmin.email, actorRole: 'SUPERADMIN', actorAdminId: superadmin.id,
        action: 'GUIDE_PHOTO_PUBLISHED', target: guide.id, after: { image: imageUrl },
      } })

      // Manual bank verification (Admin/Superadmin side).
      const afterPhoto = await db.$transaction(tx => dossier.readAdminGuideDossier(tx, guide.guideAccountId!, superadminActor), { timeout: 15000 })
      await db.auditLog.create({ data: {
        actor: superadmin.email, actorRole: 'SUPERADMIN', actorAdminId: superadmin.id,
        action: 'GUIDE_BANK_VERIFIED', target: guide.id, after: { revision: afterPhoto.bankVerification.revision },
      } })

      const ready = await db.$transaction(tx => dossier.readAdminGuideDossier(tx, guide.guideAccountId!, superadminActor), { timeout: 15000 })
      return { guide, ready }
    }

    let readyGuideId = ''
    let readyGuideSlug = ''

    await t.test('a fully ready dossier really has zero blockers (fixture sanity check)', async () => {
      const { guide, ready } = await makeReadyGuide()
      readyGuideId = guide.id
      readyGuideSlug = guide.slug!
      assert.equal(ready.activation.previouslyPublished, false)
      assert.equal(ready.activation.requiresSuperadmin, true)
      assert.equal(ready.activation.blockers.length, 0, `unexpected blockers: ${ready.activation.blockers.join(' | ')}`)
      assert.equal(ready.activation.canActivate, true)
    })

    await t.test('an Admin (not Superadmin) cannot perform a first publication', async () => {
      const readyAccountId = (await db.guideProfile.findUniqueOrThrow({ where: { id: readyGuideId } })).guideAccountId!
      const revision = (await db.$transaction(tx => dossier.readAdminGuideDossier(tx, readyAccountId, adminActor), { timeout: 15000 })).activation.revision
      currentActor = adminActor
      const res = await activateRoute.POST(
        new NextRequest(`https://safaruma.example.test/api/admin/guides/${readyGuideSlug}/activate`, {
          method: 'POST', headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ action: 'activate', revision }),
        }),
        { params: Promise.resolve({ slug: readyGuideSlug }) },
      )
      assert.equal(res.status, 403)
      const payload = await res.json()
      assert.match(payload.error, /Superadmin/)

      const profile = await db.guideProfile.findUniqueOrThrow({ where: { id: readyGuideId } })
      assert.equal(profile.status, 'REVIEW')
      assert.equal(profile.approvedAt, null)
      assert.equal(await db.auditLog.count({ where: { target: readyGuideId, action: 'GUIDE_ACTIVATED' } }), 0)
      assert.equal(await db.emailDelivery.count({ where: { referenceType: 'GUIDE_PROFILE', referenceId: readyGuideId, category: 'GUIDE_PROFILE_ACTIVATED' } }), 0)
    })

    await t.test('the Superadmin can perform the first publication: profile goes live, email is queued, audit records previouslyPublished:false', async () => {
      const beforeProfile = await db.guideProfile.findUniqueOrThrow({ where: { id: readyGuideId } })
      const revision = (await db.$transaction(tx => dossier.readAdminGuideDossier(tx, beforeProfile.guideAccountId!, superadminActor), { timeout: 15000 })).activation.revision
      currentActor = superadminActor
      const res = await activateRoute.POST(
        new NextRequest(`https://safaruma.example.test/api/admin/guides/${readyGuideSlug}/activate`, {
          method: 'POST', headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ action: 'activate', revision }),
        }),
        { params: Promise.resolve({ slug: readyGuideSlug }) },
      )
      assert.equal(res.status, 200)
      const payload = await res.json()
      assert.equal(payload.newStatus, 'ACTIVE')

      const profile = await db.guideProfile.findUniqueOrThrow({ where: { id: readyGuideId }, include: { guideAccount: true } })
      assert.equal(profile.status, 'ACTIVE')
      assert.equal(profile.guideAccount!.status, 'ACTIVE')
      assert.equal(profile.approvedByAdminId, superadmin.id)
      assert.equal(profile.approvedByEmail, superadmin.email)
      assert.ok(profile.approvedAt)

      const activation = await db.auditLog.findFirstOrThrow({ where: { target: readyGuideId, action: 'GUIDE_ACTIVATED' } })
      assert.match(activation.detail ?? '', /"previouslyPublished":false/)

      const email = await db.emailDelivery.findFirstOrThrow({ where: { referenceType: 'GUIDE_PROFILE', referenceId: readyGuideId, category: 'GUIDE_PROFILE_ACTIVATED' } })
      assert.ok(email)

      // Real end-to-end proof: the guide is now genuinely publicly visible.
      const publicList = await availableRoute.GET(new NextRequest('https://safaruma.example.test/api/guides/available?city=MAKKAH'))
      const publicData = await publicList.json()
      assert.ok(publicData.guides.some((g: { slug: string }) => g.slug === readyGuideSlug))
    })

    await t.test('after first publication, an Admin (not just Superadmin) can reactivate — the distinction is first-time vs. reactivation, not a blanket role rule', async () => {
      currentActor = adminActor
      const suspendRes = await activateRoute.POST(
        new NextRequest(`https://safaruma.example.test/api/admin/guides/${readyGuideSlug}/activate`, {
          method: 'POST', headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ action: 'suspend' }),
        }),
        { params: Promise.resolve({ slug: readyGuideSlug }) },
      )
      assert.equal(suspendRes.status, 200)
      assert.equal((await db.guideProfile.findUniqueOrThrow({ where: { id: readyGuideId } })).status, 'SUSPENDED')

      const suspended = await db.guideProfile.findUniqueOrThrow({ where: { id: readyGuideId } })
      const reactivation = await db.$transaction(tx => dossier.readAdminGuideDossier(tx, suspended.guideAccountId!, adminActor), { timeout: 15000 })
      assert.equal(reactivation.activation.previouslyPublished, true)
      assert.equal(reactivation.activation.requiresSuperadmin, false)

      const reactivateRes = await activateRoute.POST(
        new NextRequest(`https://safaruma.example.test/api/admin/guides/${readyGuideSlug}/activate`, {
          method: 'POST', headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ action: 'activate', revision: reactivation.activation.revision }),
        }),
        { params: Promise.resolve({ slug: readyGuideSlug }) },
      )
      assert.equal(reactivateRes.status, 200)
      assert.equal((await db.guideProfile.findUniqueOrThrow({ where: { id: readyGuideId } })).status, 'ACTIVE')

      const secondActivation = await db.auditLog.findFirstOrThrow({ where: { target: readyGuideId, action: 'GUIDE_ACTIVATED' }, orderBy: { createdAt: 'desc' } })
      assert.match(secondActivation.detail ?? '', /"previouslyPublished":true/)
    })

    await t.test('an incomplete dossier is rejected even for the Superadmin, with the exact missing item named', async () => {
      const bank = {
        bankAccountFirstName: 'Test', bankAccountLastName: 'Incomplete',
        bankName: 'Test Bank', bankCountry: 'FR', ibanEncrypted: crypto.encrypt('FR7612345987650123456789099'),
      }
      const incomplete = await db.guideProfile.create({ data: {
        ...bank, slug: `test-guide-${randomUUID()}`, status: 'REVIEW', city: 'MAKKAH', gender: 'HOMME', nationality: 'Française',
        experienceYears: 3, bio: 'Guide de test incomplet', servesMakkah: true,
        profileSubmittedAt: new Date(),
        guideAccount: { create: {
          email: `${randomUUID()}@example.test`, firstName: 'Incomplete', lastName: 'Guide',
          phoneWhatsapp: '+33600000001',
        } },
        languages: { create: { languageCode: 'fr', level: 'NATIVE' } },
      } })
      // All 4 confirmations done, bank verified — but the public photo step is
      // deliberately skipped, unlike makeReadyGuide().
      const confirmationsOnly = await db.$transaction(tx => dossier.readAdminGuideDossier(tx, incomplete.guideAccountId!, superadminActor), { timeout: 15000 })
      for (const item of confirmationsOnly.confirmations) {
        await db.auditLog.create({ data: {
          actor: `${randomUUID()}@example.test`, actorRole: 'GUIDE',
          action: dossier.dossierAction(item.section), target: incomplete.id,
          after: { revision: item.revision },
        } })
      }
      const afterConfirm = await db.$transaction(tx => dossier.readAdminGuideDossier(tx, incomplete.guideAccountId!, superadminActor), { timeout: 15000 })
      await db.auditLog.create({ data: {
        actor: superadmin.email, actorRole: 'SUPERADMIN', actorAdminId: superadmin.id,
        action: 'GUIDE_BANK_VERIFIED', target: incomplete.id, after: { revision: afterConfirm.bankVerification.revision },
      } })

      const final = await db.$transaction(tx => dossier.readAdminGuideDossier(tx, incomplete.guideAccountId!, superadminActor), { timeout: 15000 })
      assert.equal(final.activation.canActivate, false)
      assert.match(final.activation.blockers.join(' '), /photo/)

      currentActor = superadminActor
      const res = await activateRoute.POST(
        new NextRequest(`https://safaruma.example.test/api/admin/guides/${incomplete.slug}/activate`, {
          method: 'POST', headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ action: 'activate', revision: final.activation.revision }),
        }),
        { params: Promise.resolve({ slug: incomplete.slug! }) },
      )
      assert.equal(res.status, 409)
      const payload = await res.json()
      assert.match(payload.error, /photo/)
      assert.equal((await db.guideProfile.findUniqueOrThrow({ where: { id: incomplete.id } })).status, 'REVIEW')
    })
  } finally {
    await db.$disconnect()
    if (originalEncryptionKey === undefined) delete process.env.ENCRYPTION_KEY
    else process.env.ENCRYPTION_KEY = originalEncryptionKey
  }
})
