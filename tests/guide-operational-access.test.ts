import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import test from 'node:test'
import vm from 'node:vm'
import ts from 'typescript'

const require = createRequire(import.meta.url)

function load(file: string, mocks: Record<string, unknown>, globals: Record<string, unknown> = {}) {
  const module = { exports: {} as any }
  vm.runInNewContext(ts.transpileModule(readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText, {
    module, exports: module.exports,
    require: (name: string) => Object.hasOwn(mocks, name) ? mocks[name] : require(name),
    URL, URLSearchParams, ...globals,
  })
  return module.exports
}

function accessFixture(status: string, options: { paused?: boolean; token?: boolean; validSession?: boolean; accountStatus?: string } = {}) {
  const account = {
    id: 'guide-account', email: 'guide@example.test', status: options.accountStatus ?? 'ACTIVE',
    guideProfile: { id: 'guide-profile', status, slug: 'guide-test', acceptingBookings: !options.paused, servesMakkah: false, servesMadinah: false },
  }
  return load('src/lib/require-account.ts', {
    'server-only': {},
    'next-auth': { getServerSession: () => { throw new Error('Pelerin auth must not be used') } },
    '@/lib/auth': { authOptions: {} },
    '@/lib/prisma': {},
    '@/lib/guide-auth': {
      readGuideSessionToken: async () => options.token === false ? null : 'opaque-test-session',
      resolveGuideSession: async () => options.validSession === false ? null : { guideAccount: account },
    },
  })
}

test('operational access refuses DRAFT/REVIEW, but their onboarding access is retained', async () => {
  for (const status of ['DRAFT', 'REVIEW']) {
    const access = accessFixture(status)
    assert.equal((await access.requireGuide()).ok, true)
    const denied = await access.requireGuide({ published: true })
    assert.equal(denied.ok, false)
    assert.equal(denied.response.status, 403)
    assert.equal(denied.response.headers.get('cache-control'), 'no-store')
    assert.match((await denied.response.json()).error, /validé/)
  }
})

test('a published Guide on pause or with both cities disabled retains operational access', async () => {
  for (const paused of [false, true]) {
    const access = await accessFixture('ACTIVE', { paused }).requireGuide({ published: true })
    assert.equal(access.ok, true)
    assert.equal(access.actor.guideProfileId, 'guide-profile')
  }
})

test('missing/revoked sessions and suspended accounts/profiles remain denied', async () => {
  for (const [status, options, expected] of [
    ['ACTIVE', { token: false }, 401],
    ['ACTIVE', { validSession: false }, 401],
    ['ACTIVE', { accountStatus: 'SUSPENDED' }, 403],
    ['SUSPENDED', {}, 403],
  ] as const) {
    for (const published of [false, true]) {
      const result = await accessFixture(status, options).requireGuide({ published })
      assert.equal(result.ok, false)
      assert.equal(result.response.status, expected)
    }
  }
})

const operationalHandlers = [
  ['dashboard', 'GET'], ['missions', 'GET'], ['reservations', 'GET'],
  ['reservations/[id]/confirm', 'POST'], ['reservations/[id]/decline', 'POST'],
  ['revenus', 'GET'], ['performances', 'GET'], ['reviews', 'GET'],
  ['conversations', 'GET'], ['conversations/[id]', 'GET'], ['conversations/[id]', 'POST'],
] as const

test('all operational handlers refuse unpublished Guides before data reads, writes or emails', async () => {
  for (const status of ['DRAFT', 'REVIEW', 'SUSPENDED']) {
    for (const [route, method] of operationalHandlers) {
      let businessCalls = 0
      const unexpected = () => { businessCalls++; throw new Error(`Unexpected business access: ${route}`) }
      const prisma = new Proxy({}, { get: (_, key) => key === '__esModule' ? false : unexpected() })
      const handler = load(`src/app/api/guide/${route}/route.ts`, {
        '@/lib/require-account': accessFixture(status),
        '@/lib/prisma': prisma,
        '@/lib/guide-auth': { hasTrustedGuideAuthOrigin: () => true, getGuideRequestContext: unexpected },
        '@/lib/ratelimit': { checkRateLimit: async () => null, apiRatelimit: {} },
        '@/lib/guide-workflow': {},
        '@/lib/guide-reservation-incidents': { suspendGuideForReservationIncident: unexpected },
        '@/lib/email': { sendEmail: unexpected },
      })
      const req = { url: 'https://example.test/api/guide/test', json: unexpected }
      const result = await handler[method](req, { params: Promise.resolve({ id: 'reservation-test' }) })
      assert.equal(result.status, 403, `${status}: ${method} ${route}`)
      assert.equal(businessCalls, 0)
    }
  }
})

test('published paused Guide can still read their conversations and revenues with ownership filters', async () => {
  const queries: any[] = []
  const prisma = {
    conversation: { findMany: async (query: unknown) => { queries.push(query); return [] } },
    guideEarning: { findMany: async (query: unknown) => { queries.push(query); return [] } },
    transfer: { findFirst: async (query: unknown) => { queries.push(query); return null } },
  }
  for (const route of ['conversations', 'revenus']) {
    const handler = load(`src/app/api/guide/${route}/route.ts`, {
      '@/lib/require-account': accessFixture('ACTIVE', { paused: true }),
      '@/lib/prisma': prisma,
    })
    assert.equal((await handler.GET()).status, 200)
  }
  assert.equal(queries.length, 3)
  assert.ok(queries.every(query => query.where.guideProfileId === 'guide-profile'))
})

function sessionGuardFixture(initialPath = '/guide/missions') {
  const state: any[] = []
  const slots: { deps: unknown[]; cleanup?: () => void }[] = []
  let index = 0
  let path = initialPath
  let pendingEffects: (() => void)[] = []
  const replacements: string[] = []
  const responses: ((response: unknown) => void)[] = []
  const router = { replace: (url: string) => replacements.push(url) }
  const react = require('react')
  const guard = load('src/components/GuideSessionGuard.tsx', {
    react: {
      ...react,
      useState: (initial: unknown) => {
        const slot = index++
        if (!(slot in state)) state[slot] = initial
        return [state[slot], (value: unknown) => { state[slot] = value }]
      },
      useEffect: (effect: () => (() => void) | undefined, deps: unknown[]) => {
        const slot = index++
        if (!slots[slot] || deps.some((value, i) => value !== slots[slot].deps[i])) {
          pendingEffects.push(() => {
            slots[slot]?.cleanup?.()
            slots[slot] = { deps, cleanup: effect() }
          })
        }
      },
    },
    'next/navigation': { useRouter: () => router, usePathname: () => path },
  }, {
    fetch: () => new Promise(resolve => responses.push(resolve)),
  })
  const render = () => {
    index = 0; pendingEffects = []
    const tree = guard.GuideSessionGuard({ children: 'PROTECTED_CHILD' })
    pendingEffects.forEach(effect => effect())
    return tree.props?.children === 'PROTECTED_CHILD'
  }
  return {
    render, replacements, guard,
    navigate(next: string) { path = next },
    async respond(status: string, ok = true) {
      responses.shift()!({ ok, json: async () => ({ user: { guideStatus: status, acceptingBookings: false } }) })
      await new Promise(resolve => setImmediate(resolve))
    },
  }
}

test('client gate hides protected children and redirects unpublished Guides to their profile', async () => {
  for (const status of ['DRAFT', 'REVIEW']) {
    const ui = sessionGuardFixture()
    assert.equal(ui.render(), false)
    await ui.respond(status)
    assert.equal(ui.render(), false)
    assert.deepEqual(ui.replacements, ['/guide/profil'])
  }
})

test('client gate rechecks on navigation without mounting protected children with stale status', async () => {
  const ui = sessionGuardFixture('/guide/profil')
  assert.equal(ui.render(), false)
  await ui.respond('DRAFT')
  assert.equal(ui.render(), true)
  ui.navigate('/guide/messages/test')
  assert.equal(ui.render(), false)
  await ui.respond('DRAFT')
  assert.equal(ui.render(), false)
  assert.deepEqual(ui.replacements, ['/guide/profil'])
})

test('client gate permits paused ACTIVE guides and removes access after session failure', async () => {
  const ui = sessionGuardFixture()
  ui.render()
  await ui.respond('ACTIVE')
  assert.equal(ui.render(), true)
  ui.navigate('/guide/revenus')
  assert.equal(ui.render(), false)
  await ui.respond('ACTIVE', false)
  assert.equal(ui.render(), false)
  assert.deepEqual(ui.replacements, ['/guide/connexion'])
})

test('a late session response from a previous page cannot unlock the current page', async () => {
  const ui = sessionGuardFixture('/guide/profil')
  ui.render()
  ui.navigate('/guide/missions')
  assert.equal(ui.render(), false)
  await ui.respond('ACTIVE') // Cancelled request from the previous path.
  assert.equal(ui.render(), false)
  await ui.respond('REVIEW')
  assert.equal(ui.render(), false)
  assert.deepEqual(ui.replacements, ['/guide/profil'])
})

test('desktop/mobile shared navigation removes operational links only before publication', () => {
  const react = require('react')
  const { renderToStaticMarkup } = require('react-dom/server')
  const { guard } = sessionGuardFixture()
  for (const status of ['DRAFT', 'REVIEW', 'ACTIVE']) {
    const layout = load('src/app/guide/(dashboard)/layout.tsx', {
      react: { ...react, useState: (initial: unknown) => [initial, () => {}] },
      'next/navigation': { usePathname: () => '/guide/profil', useRouter: () => ({}) },
      'next/link': 'a', 'next/image': 'img',
      '@/components/GuideSessionGuard': {
        isGuideOperationalPath: guard.isGuideOperationalPath,
        useGuideSession: () => ({ guideStatus: status, acceptingBookings: false, email: 'guide@example.test' }),
      },
    }, { process: { env: {} } })
    const html = renderToStaticMarkup(layout.default({ children: 'PROFILE' }))
    for (const segment of ['tableau-de-bord', 'demandes', 'missions', 'messages', 'revenus', 'avis', 'performances']) {
      assert.equal(html.includes(`href="/guide/${segment}"`), status === 'ACTIVE', `${status}: ${segment}`)
    }
    for (const segment of ['profil', 'calendrier', 'lieux']) {
      assert.ok(html.includes(`href="/guide/${segment}"`), `${status}: ${segment}`)
    }
  }
})

test('operational path matching includes details and leaves onboarding and security paths alone', () => {
  const { guard } = sessionGuardFixture()
  for (const path of ['tableau-de-bord', 'demandes', 'missions', 'messages', 'revenus', 'paiements', 'avis', 'performances']) {
    assert.equal(guard.isGuideOperationalPath(`/guide/${path}`), true)
    assert.equal(guard.isGuideOperationalPath(`/guide/${path}/detail`), true)
  }
  for (const path of ['profil', 'calendrier', 'lieux', 'connexion', 'reinitialiser-mot-de-passe', 'missions-autre']) {
    assert.equal(guard.isGuideOperationalPath(`/guide/${path}`), false)
  }
})

test('onboarding, security, session and private application media keep the basic Guide guard', () => {
  for (const route of ['profil', 'profil/submit', 'profil/languages', 'calendrier', 'lieux', 'lieux/suggest',
    'security/email-change/request', 'security/email-change/confirm', 'security/password/change', 'auth/session']) {
    const source = readFileSync(`src/app/api/guide/${route}/route.ts`, 'utf8')
    assert.match(source, /requireGuide\(\)/, route)
    assert.doesNotMatch(source, /published: true/, route)
  }
  const media = readFileSync('src/app/api/guide-applications/[id]/photos/[kind]/route.ts', 'utf8')
  assert.match(media, /requireGuide\(\)/)
})
