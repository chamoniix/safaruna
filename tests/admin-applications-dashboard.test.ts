/* eslint-disable @typescript-eslint/no-explicit-any -- Isolated VM exports and heterogeneous React hook slots are intentionally dynamic test doubles. */
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { runInNewContext } from 'node:vm'
import test from 'node:test'
import ts from 'typescript'
import * as React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

const require = createRequire(import.meta.url)
const applicationPage = 'src/app/admin/(dashboard)/candidatures-guides/page.tsx'
const dashboardPage = 'src/app/admin/(dashboard)/tableau-de-bord/page.tsx'

// Execute the actual modules with isolated dependencies: no database, email or live requests.
function loadModule(path: string, mocks: Record<string, unknown>, globals = {}) {
  const output = ts.transpileModule(readFileSync(path, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
  }).outputText
  const exports: Record<string, any> = {}
  runInNewContext(output, { exports, require: (id: string) => id in mocks ? mocks[id] : require(id), URLSearchParams, AbortController, ...globals })
  return exports
}

function mount(path: string) {
  let cursor = 0
  const slots: any[] = []
  const effects: Array<() => unknown> = []
  const requests: Array<{ url: string; signal?: AbortSignal; resolve: (response: unknown) => void }> = []
  const hooks = {
    ...React,
    useState(initial: unknown) {
      const index = cursor++
      if (!(index in slots)) slots[index] = initial
      return [slots[index], (value: any) => { slots[index] = typeof value === 'function' ? value(slots[index]) : value }]
    },
    useRef(initial: unknown) {
      const index = cursor++
      return slots[index] ??= { current: initial }
    },
    useCallback(callback: unknown, deps: unknown[]) {
      const index = cursor++
      if (!slots[index] || deps.some((dep, i) => dep !== slots[index].deps[i])) slots[index] = { callback, deps }
      return slots[index].callback
    },
    useEffect(callback: () => (() => void) | void, deps: unknown[]) {
      const index = cursor++
      if (!slots[index] || deps.some((dep, i) => dep !== slots[index].deps[i])) {
        effects.push(() => { slots[index]?.cleanup?.(); slots[index] = { deps, cleanup: callback() } })
      }
    },
  }
  const loaded = loadModule(path, {
    react: hooks,
    '@/lib/languages': { LANG_CODE_TO_LABEL: {} },
    'next/link': { __esModule: true, default: (props: any) => React.createElement('a', props) },
    'lucide-react': new Proxy({}, { get: () => () => null }),
  }, {
    fetch: (url: string, options: { signal?: AbortSignal }) => new Promise(resolve => requests.push({ url, signal: options.signal, resolve })),
    window: { confirm: () => true },
  })
  function render() { cursor = 0; return loaded.default() as React.ReactElement }
  return { render, requests, flushEffects() { while (effects.length) effects.shift()!() } }
}

function elements(node: React.ReactNode): React.ReactElement<any>[] {
  if (!React.isValidElement<{ children?: React.ReactNode }>(node)) return []
  return [node, ...React.Children.toArray(node.props.children).flatMap(elements)]
}

async function respond(request: { resolve: (value: unknown) => void }, payload: unknown, ok = true) {
  request.resolve({ ok, json: async () => payload })
  await new Promise(resolve => setImmediate(resolve))
}

const empty = { applications: [], counts: {}, pagination: { page: 1, pages: 1, total: 0 } }

test('candidatures : chargement, erreur, nouvelle tentative puis vrai résultat vide', async () => {
  const ui = mount(applicationPage)
  let html = renderToStaticMarkup(ui.render())
  assert.match(html, /Chargement…/)
  assert.doesNotMatch(html, />0<|Aucune candidature/)
  ui.flushEffects()
  await respond(ui.requests[0], { error: 'Session expirée' }, false)
  html = renderToStaticMarkup(ui.render())
  assert.match(html, /Session expirée/)
  assert.match(html, /Pagination indisponible/)
  assert.doesNotMatch(html, /Aucune candidature|>0</)
  const retry = elements(ui.render()).find(el => el.type === 'button' && el.props.children === 'Réessayer')!
  retry.props.onClick()
  assert.match(renderToStaticMarkup(ui.render()), /Chargement…/)
  await respond(ui.requests[1], empty)
  html = renderToStaticMarkup(ui.render())
  assert.match(html, /Aucune candidature ne correspond aux filtres/)
  assert.match(html, /0 candidature/)
  assert.doesNotMatch(html, /Session expirée|Pagination indisponible/)
})

test('une ancienne recherche ne remplace pas la réponse la plus récente', async () => {
  const ui = mount(applicationPage)
  const tree = ui.render()
  ui.flushEffects()
  elements(tree).find(el => el.type === 'input')!.props.onChange({ target: { value: 'nom complet' } })
  ui.render()
  ui.flushEffects()
  assert.equal(ui.requests[0].signal?.aborted, true)
  await respond(ui.requests[1], { ...empty, counts: { PENDING: 3 } })
  await respond(ui.requests[0], { ...empty, counts: { PENDING: 99 } })
  const html = renderToStaticMarkup(ui.render())
  assert.match(html, />3</)
  assert.doesNotMatch(html, />99</)
})

test('accueil : liens distincts guides/candidatures et aucun faux zéro après erreur', async () => {
  const ui = mount(dashboardPage)
  let html = renderToStaticMarkup(ui.render())
  assert.match(html, /href="\/admin\/guides"/)
  assert.match(html, /href="\/admin\/candidatures-guides"[^>]*>— candidature/)
  ui.flushEffects()
  await respond(ui.requests[0], { error: 'Lecture impossible' }, false)
  html = renderToStaticMarkup(ui.render())
  assert.match(html, /Lecture impossible/)
  assert.doesNotMatch(html, />0 candidature/)
  elements(ui.render()).find(el => el.type === 'button' && el.props.children === 'Réessayer')!.props.onClick()
  ui.render()
  ui.flushEffects()
  assert.equal(ui.requests.length, 2)
})

test('un traitement terminé recharge les filtres actuels, pas ceux de l’ancien formulaire', async () => {
  const ui = mount(applicationPage)
  ui.render()
  ui.flushEffects()
  await respond(ui.requests[0], { ...empty, applications: [{
    id: 'isolated-test', firstName: 'Test', lastName: 'Candidate', status: 'PENDING',
    dateOfBirth: '1990-01-01', createdAt: '2026-01-01', serviceCities: [], languages: [],
    masteredPlaces: [], transportModes: [],
  }] })
  elements(ui.render()).find(el => el.type === 'button' && el.props.children === 'Voir')!.props.onClick()
  const modal = ui.render()
  const action = elements(modal).find(el => el.type === 'button' && el.props.children === 'Mettre en cours')!.props.onClick()
  elements(modal).find(el => el.type === 'button' && el.props.children === '×')!.props.onClick()
  elements(ui.render()).find(el => el.type === 'input')!.props.onChange({ target: { value: 'current search' } })
  ui.render()
  ui.flushEffects()
  await respond(ui.requests[1], { success: true })
  assert.match(ui.requests[3].url, /q=current\+search/)
  await respond(ui.requests[3], empty)
  await action
  assert.match(renderToStaticMarkup(ui.render()), /Aucune candidature ne correspond aux filtres/)
})

test('API : nom complet, espaces et ordre inversé, email et statut conservés', async () => {
  let where: any
  let authorized = true
  const loaded = loadModule('src/app/api/admin/guide-applications/route.ts', {
    'next/server': { NextResponse: { json: (body: unknown, init: unknown) => ({ body, init }) } },
    '@/lib/check-admin': { getAdminActor: async () => authorized ? { role: 'SUPERADMIN' } : null },
    '@/lib/email': {}, '@/lib/crypto': {}, '@/lib/places': { PLACES: [] },
    '@/lib/prisma': { __esModule: true, default: { guideApplication: {
      findMany: async (args: any) => { where = args.where; return [] },
      count: async () => 0, groupBy: async () => [],
    } } },
  })
  const row = { firstName: 'Test', lastName: 'Candidate', email: 'test@example.invalid', whatsapp: '+33000000000', status: 'PENDING' }
  function matches(filter: any): boolean {
    return Object.entries(filter).every(([key, value]: [string, any]) => key === 'OR' ? value.some(matches) : key === 'AND' ? value.every(matches) : typeof value === 'string' ? row[key as keyof typeof row] === value : row[key as keyof typeof row].toLowerCase().includes(value.contains.toLowerCase()))
  }
  for (const q of ['Test Candidate', ' candidate   TEST ', 'Test', 'test@example.invalid', '+33000000000']) {
    await loaded.GET({ nextUrl: new URL(`https://example.invalid/api?q=${encodeURIComponent(q)}&status=PENDING`) })
    assert.equal(matches(where), true, q)
    assert.equal(where.status, 'PENDING')
  }
  await loaded.GET({ nextUrl: new URL('https://example.invalid/api?q=Test%20Unknown') })
  assert.equal(matches(where), false)
  authorized = false
  const response = await loaded.GET({ nextUrl: new URL('https://example.invalid/api') })
  assert.equal(response.init.status, 401)
})
