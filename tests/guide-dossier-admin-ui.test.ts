import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import test from 'node:test'
import vm from 'node:vm'
import ts from 'typescript'

const require = createRequire(import.meta.url)
const React = require('react')
function harness(list = false) {
  const guide: any = {
    id: 'test-guide', slug: 'test-guide', status: 'REVIEW', name: 'Test Guide', email: 'guide@example.test', city: 'MADINAH',
    user: { firstName: 'Test', lastName: 'Guide', name: 'Test Guide', email: 'guide@example.test', createdAt: '2026-09-01' },
    languages: [], reservations: [], places: [], availabilities: [], conversations: [], reservationIncidents: [],
    stats: { totalReservations: 0, totalRevenue: 0, avgRating: null }, createdByType: 'ADMIN', createdAt: '2026-09-01',
    servesMakkah: true, servesMadinah: true, acceptingBookings: true, cancellationCount: 0,
    dossier: {
      bank: { firstName: 'Test', lastName: 'Guide', bankName: 'Test Bank', country: 'FR', iban: 'TEST-PRIVATE-IBAN', bic: 'TESTBIC', readable: true },
      progress: [{ key: 'bank', label: 'Coordonnées confirmées par vous', complete: true }],
      bankVerification: { revision: 'bank-version-1', verified: false, verifiedAt: null, verifiedByEmail: null },
      activation: { revision: 'activation-version-1', previouslyPublished: false, requiresSuperadmin: true, canActivate: true, blockers: [] },
    },
  }
  let cursor = 0, firstRender = true
  const states: any[] = [], effects: (() => void)[] = [], calls: any[] = []
  let handler: (url: string, options: any) => Promise<any> = async (_url, options) => ({
    ok: true, json: async () => options?.method ? { message: 'Décision enregistrée' } : { guide, guides: [guide], permissions: { canManagePricing: true } },
  })
  const Link = () => null
  const mocks: any = {
    react: { ...React, useState(initial: any) {
      const index = cursor++
      if (!(index in states)) states[index] = typeof initial === 'function' ? initial() : initial
      return [states[index], (value: any) => { states[index] = typeof value === 'function' ? value(states[index]) : value }]
    }, useRef(initial: any) {
      const index = cursor++
      if (!(index in states)) states[index] = { current: initial }
      return states[index]
    }, useEffect(effect: () => void) { if (firstRender) effects.push(effect) }, useCallback: (callback: any) => callback },
    'next/link': Link, 'next/navigation': { useParams: () => ({ slug: guide.slug }) },
    '@/lib/places': { PLACES: [] }, '@/lib/languages': { GUIDE_LANGUAGES: [], LANG_CODE_TO_LABEL: {} },
    '@/components/admin/GuidePhotoEditor': () => null, '@/components/guide/ApplicationMediaPanel': () => null,
  }
  const module = { exports: {} as any }
  vm.runInNewContext(ts.transpileModule(readFileSync(list ? 'src/app/admin/(dashboard)/guides/page.tsx' : 'src/app/admin/(dashboard)/guides/[slug]/page.tsx', 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true, jsx: ts.JsxEmit.ReactJSX },
  }).outputText, { module, exports: module.exports, Error, setTimeout, confirm: () => true, window: { confirm: () => true },
    fetch: async (url: string, options: any) => { calls.push({ url, ...options }); return handler(url, options) },
    require: (name: string) => Object.hasOwn(mocks, name) ? mocks[name] : require(name),
  })
  const render = () => { cursor = 0; const tree = module.exports.default(); firstRender = false; return tree }
  function nodes(tree: any): any[] {
    if (!tree || typeof tree !== 'object') return []
    if (Array.isArray(tree)) return tree.flatMap(nodes)
    return [tree, ...nodes(tree.props?.children)]
  }
  const text = (tree: any): string => typeof tree === 'string' ? tree : Array.isArray(tree) ? tree.map(text).join('') : tree?.props ? text(tree.props.children) : ''
  const find = (predicate: (node: any) => boolean) => nodes(render()).find(predicate)
  const button = (label: string) => find(node => node.type === 'button' && text(node) === label)
  const attest = () => find(node => node.type === 'input' && node.props.type === 'checkbox').props.onChange({ target: { checked: true } })
  render(); effects.forEach(effect => effect())
  return { guide, calls, render, nodes, text, find, button, attest, Link, setHandler: (value: typeof handler) => { handler = value }, ready: () => new Promise(resolve => setTimeout(resolve, 0)) }
}

test('bank verification requires an explicit manual attestation and sends only the examined revision', async () => {
  const h = harness(); await h.ready()
  assert.equal(h.button('Confirmer la vérification bancaire').props.disabled, true)
  await h.button('Confirmer la vérification bancaire').props.onClick()
  assert.equal(h.calls.some(call => call.method), false)
  const privateBlock = h.find(node => node.props?.['data-clarity-mask'] === 'true' && h.text(node).includes('TEST-PRIVATE-IBAN'))
  assert.ok(privateBlock)
  assert.equal(privateBlock.props['data-sentry-mask'], true)
  assert.match(h.text(privateBlock), /Identité du Guide : Test Guide/)
  h.attest()
  assert.equal(h.button('Confirmer la vérification bancaire').props.disabled, false)
  await h.button('Confirmer la vérification bancaire').props.onClick()
  assert.deepEqual(JSON.parse(h.calls.find(call => call.method).body), { action: 'VERIFY_BANK', revision: 'bank-version-1', accountHolderConfirmed: true })
  assert.match(h.text(h.render()), /Vérification manuelle enregistrée pour ces coordonnées/)
  assert.equal(h.button('Confirmer la vérification bancaire').props.disabled, true)
})

test('publication respects server permission and sends the examined activation revision', async () => {
  const h = harness(); await h.ready()
  h.guide.dossier.activation.canActivate = false
  h.guide.dossier.activation.blockers = ['Première publication réservée au Superadmin']
  assert.equal(h.button('Publier le profil guide').props.disabled, true)
  await h.button('Publier le profil guide').props.onClick()
  assert.equal(h.calls.some(call => call.method), false)
  assert.match(h.text(h.render()), /Première publication réservée au Superadmin/)
  h.guide.dossier.activation.canActivate = true
  await h.button('Publier le profil guide').props.onClick()
  assert.deepEqual(JSON.parse(h.calls.find(call => call.method).body), { action: 'activate', revision: 'activation-version-1' })
})

test('a bank conflict refreshes the dossier, clears attestation and does not automatically retry', async () => {
  const h = harness(); await h.ready(); h.attest()
  h.setHandler(async (_url, options) => {
    if (options?.method) return { ok: false, status: 409, json: async () => ({ error: 'Les coordonnées ont changé.' }) }
    h.guide.dossier.bankVerification.revision = 'bank-version-2'
    return { ok: true, json: async () => ({ guide: h.guide }) }
  })
  await h.button('Confirmer la vérification bancaire').props.onClick()
  assert.equal(h.calls.filter(call => call.method).length, 1)
  assert.equal(h.button('Confirmer la vérification bancaire').props.disabled, true)
  assert.match(h.text(h.render()), /Les coordonnées ont changé/)
  assert.doesNotMatch(h.text(h.render()), /Vérification manuelle enregistrée pour ces coordonnées/)
})

test('bank and publication controls stay disabled during writes and the subsequent refresh', async () => {
  const h = harness(); await h.ready(); h.attest()
  let finishWrite!: (response: any) => void, finishRefresh!: (response: any) => void
  h.setHandler((_url, options) => new Promise(resolve => { if (options?.method) finishWrite = resolve; else finishRefresh = resolve }))
  const callback = h.button('Confirmer la vérification bancaire').props.onClick
  const pending = callback()
  await callback()
  assert.equal(h.calls.filter(call => call.method).length, 1)
  assert.equal(h.button('Enregistrement…').props.disabled, true)
  assert.equal(h.button('Publier le profil guide').props.disabled, true)
  finishWrite({ ok: true, json: async () => ({}) }); await h.ready()
  assert.equal(h.button('Enregistrement…').props.disabled, true)
  finishRefresh({ ok: true, json: async () => ({ guide: h.guide }) }); await pending
  assert.equal(h.button('Confirmer la vérification bancaire').props.disabled, true)
})

test('failed refresh after publication reports partial success and prevents decisions on stale data', async () => {
  const h = harness(); await h.ready()
  h.setHandler(async (_url, options) => {
    if (options?.method) return { ok: true, json: async () => ({ message: 'Profil publié' }) }
    throw new Error('Réseau indisponible')
  })
  await h.button('Publier le profil guide').props.onClick()
  assert.match(h.text(h.render()), /Décision enregistrée, mais rechargement impossible/)
  assert.equal(h.button('Publier le profil guide').props.disabled, true)
  assert.ok(h.button('Recharger le dossier avant toute nouvelle décision'))
})

test('publication conflict displays fresh data and requires another explicit decision', async () => {
  const h = harness(); await h.ready()
  h.setHandler(async (_url, options) => {
    if (options?.method) return { ok: false, status: 409, json: async () => ({ error: 'Le dossier a changé.' }) }
    h.guide.dossier.activation.revision = 'activation-version-2'
    return { ok: true, json: async () => ({ guide: h.guide }) }
  })
  await h.button('Publier le profil guide').props.onClick()
  assert.equal(h.calls.filter(call => call.method).length, 1)
  assert.match(h.text(h.render()), /Le dossier a changé/)
})

test('historical reactivation stays available, without inventing publication history for another suspended profile', async () => {
  const h = harness(); h.guide.status = 'SUSPENDED'; h.guide.dossier.activation.previouslyPublished = true; await h.ready()
  assert.equal(h.button('Réactiver le profil').props.disabled, false)
  await h.button('Réactiver le profil').props.onClick()
  assert.equal(JSON.parse(h.calls.find(call => call.method).body).action, 'activate')
  h.guide.dossier.activation.previouslyPublished = false
  h.guide.dossier.activation.canActivate = false
  assert.equal(h.button('Publier le profil guide').props.disabled, true)
})

test('list never activates a dossier unseen: review and suspended profiles link to their detail page', async () => {
  const h = harness(true); await h.ready()
  for (const status of ['REVIEW', 'SUSPENDED']) {
    h.guide.status = status
    assert.equal(h.find(node => node.type === 'button' && /Activer|Réactiver/.test(h.text(node))), undefined)
    const link = h.find(node => node.type === h.Link && h.text(node) === 'Examiner le dossier')
    assert.equal(link.props.href, '/admin/guides/test-guide')
  }
  assert.equal(h.calls.some(call => call.method), false)
})

test('unreadable bank details cannot be attested or verified', async () => {
  const h = harness(); h.guide.dossier.bank.readable = false; await h.ready()
  assert.equal(h.find(node => node.type === 'input' && node.props.type === 'checkbox').props.disabled, true)
  h.attest()
  await h.button('Confirmer la vérification bancaire').props.onClick()
  assert.equal(h.calls.some(call => call.method), false)
  assert.doesNotMatch(h.text(h.render()), /TEST-PRIVATE-IBAN/)
})

test('immediate suspension remains available when the final dossier is unavailable', async () => {
  const h = harness(); h.guide.status = 'ACTIVE'; h.guide.dossier = null; await h.ready()
  assert.equal(h.button('Suspendre le profil').props.disabled, false)
  h.button('Suspendre le profil').props.onClick(); await h.ready()
  assert.deepEqual(JSON.parse(h.calls.find(call => call.method).body), { action: 'suspend' })
})

test('failed refresh after bank verification locks decisions and reports the recorded result honestly', async () => {
  const h = harness(); await h.ready(); h.attest()
  h.setHandler(async (_url, options) => {
    if (options?.method) return { ok: true, json: async () => ({}) }
    throw new Error('Réseau indisponible')
  })
  await h.button('Confirmer la vérification bancaire').props.onClick()
  assert.match(h.text(h.render()), /Vérification enregistrée, mais rechargement impossible/)
  assert.equal(h.button('Confirmer la vérification bancaire').props.disabled, true)
  assert.equal(h.button('Publier le profil guide').props.disabled, true)
})

test('main-city selector exposes only supported served cities without converting a legacy value', async () => {
  const h = harness(); h.guide.city = 'Médine historique'; h.guide.servesMakkah = false; await h.ready()
  const select = h.find(node => node.props?.id === 'guide-main-city')
  assert.equal(select.props.value, 'Médine historique')
  const options = h.nodes(select).filter(node => node.type === 'option')
  assert.deepEqual(options.filter(node => !node.props.disabled).map(node => node.props.value), ['MADINAH'])
  assert.ok(options.some(node => node.props.value === 'Médine historique' && node.props.disabled))
  assert.match(h.text(select), /valeur historique à vérifier/)
})

test('saving another field omits an unchanged legacy city, while a deliberate city change sends its canonical value', async () => {
  const h = harness(); h.guide.city = 'Médine historique'; await h.ready()
  await h.button('Sauvegarder').props.onClick()
  let write = h.calls.find(call => call.method === 'PATCH')
  assert.equal(Object.hasOwn(JSON.parse(write.body), 'city'), false)
  h.find(node => node.props?.id === 'guide-main-city').props.onChange({ target: { value: 'MAKKAH' } })
  await h.button('Sauvegarder').props.onClick()
  write = h.calls.filter(call => call.method === 'PATCH').at(-1)
  assert.equal(JSON.parse(write.body).city, 'MAKKAH')
})
