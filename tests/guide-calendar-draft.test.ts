import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import test from 'node:test'
import vm from 'node:vm'
import ts from 'typescript'

const require = createRequire(import.meta.url)
const calendarSource = readFileSync('src/app/guide/(dashboard)/calendrier/page.tsx', 'utf8')
const profileSource = readFileSync('src/app/guide/(dashboard)/profil/page.tsx', 'utf8')

function calendar(status = 'DRAFT', acceptingBookings = true) {
  const state: unknown[] = []
  let index = 0
  let effects: (() => unknown)[] = []
  const requests: { url: string; method: string }[] = []
  let failWrite = false
  let failRead = false
  let release: (() => void) | undefined
  let waitForWrite: Promise<void> | undefined
  const module = { exports: {} as { default: () => any } }
  vm.runInNewContext(ts.transpileModule(calendarSource, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
  }).outputText, {
    module, exports: module.exports,
    require: (name: string) => {
      if (name === 'react') return {
        useState: (initial: unknown) => {
          const slot = index++
          if (!(slot in state)) state[slot] = typeof initial === 'function' ? initial() : initial
          return [state[slot], (value: any) => { state[slot] = typeof value === 'function' ? value(state[slot]) : value }]
        },
        useMemo: (fn: () => unknown) => fn(),
        useCallback: (fn: unknown) => fn,
        useEffect: (fn: () => unknown) => { effects.push(fn) },
      }
      if (name === '@/components/GuideSessionGuard') return { useGuideSession: () => ({ guideStatus: status }) }
      if (name === 'next/link') return { default: 'a' }
      if (name === 'lucide-react') return new Proxy({}, { get: (_, name) => String(name) })
      return require(name)
    },
    URLSearchParams,
    window: { confirm: () => true },
    fetch: async (url: string, init?: { method?: string }) => {
      const method = init?.method || 'GET'
      requests.push({ url, method })
      if (method !== 'GET') await waitForWrite
      const failed = method === 'GET' ? failRead : failWrite
      return { ok: !failed, json: async () => failed ? { error: 'Erreur de test' } : {
        availabilities: [], services: { makkah: true, madinah: true }, acceptingBookings,
      } }
    },
  })
  const render = () => { index = 0; effects = []; return module.exports.default() }
  return {
    render, requests,
    async load() { render(); effects.forEach(fn => fn()); await new Promise(resolve => setImmediate(resolve)) },
    rejectWrite() { failWrite = true },
    rejectRead() { failRead = true },
    holdWrite() { waitForWrite = new Promise<void>(resolve => { release = resolve }) },
    releaseWrite() { release?.() },
  }
}

function nodes(node: any): any[] {
  if (!node || typeof node !== 'object') return []
  if (Array.isArray(node)) return node.flatMap(nodes)
  return [node, ...nodes(node.props?.children)]
}
function text(node: any): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(text).join(' ')
  return node?.type === 'style' ? '' : text(node?.props?.children ?? '')
}
function globalButton(tree: any) {
  return nodes(tree).find(node => node.type === 'button' && /Mettre en pause|Réactiver|Après publication/.test(text(node)))
}

test('DRAFT et REVIEW ne proposent pas de pause, même si acceptingBookings est vrai', async () => {
  for (const status of ['DRAFT', 'REVIEW']) {
    const page = calendar(status)
    await page.load()
    const button = globalButton(page.render())
    assert.equal(button.props.disabled, true)
    await button.props.onClick()
    assert.equal(page.requests.filter(request => request.method === 'PATCH').length, 0)
    assert.doesNotMatch(text(page.render()), /Nouvelles réservations activées|Les pèlerins peuvent vous choisir/)
  }
})

test('un profil ACTIVE en pause conserve la commande de réactivation', async () => {
  const page = calendar('ACTIVE', false)
  await page.load()
  const button = globalButton(page.render())
  assert.equal(button.props.disabled, false)
  assert.equal(text(button), 'Réactiver')
  await button.props.onClick()
  assert.equal(page.requests.filter(request => request.method === 'PATCH').length, 1)
})

test('dates enregistrées automatiquement : chargement puis confirmation réelle, sans double écriture', async () => {
  const page = calendar()
  await page.load()
  page.holdWrite()
  const day = nodes(page.render()).find(node => node.props?.className === 'calendar-day' && !node.props.disabled)
  assert.ok(day)
  const pending = day.props.onClick()
  assert.match(text(page.render()), /Enregistrement en cours/)
  assert.ok(nodes(page.render()).filter(node => node.props?.className === 'calendar-day').every(node => node.props.disabled))
  page.releaseWrite()
  await pending
  assert.match(text(page.render()), /Modification enregistrée/)
  assert.equal(page.requests.filter(request => request.method === 'POST').length, 1)
})

test('un échec d’écriture ne montre aucune confirmation d’enregistrement', async () => {
  const page = calendar()
  await page.load()
  page.rejectWrite()
  await nodes(page.render()).find(node => node.props?.className === 'calendar-day' && !node.props.disabled).props.onClick()
  assert.match(text(page.render()), /Erreur de test/)
  assert.doesNotMatch(text(page.render()), /Modification enregistrée/)
})

test('un échec de relecture reste visible et ne confirme pas un calendrier à jour', async () => {
  const page = calendar()
  await page.load()
  page.rejectRead()
  await nodes(page.render()).find(node => node.props?.className === 'calendar-day' && !node.props.disabled).props.onClick()
  assert.match(text(page.render()), /Erreur de test/)
  assert.doesNotMatch(text(page.render()), /Modification enregistrée/)
})

test('le calendrier mène à la soumission unique, une fois le profil chargé', () => {
  const tree = calendar().render()
  assert.ok(nodes(tree).some(node => node.props?.href === '/guide/profil#guide-profile-submission'))
  assert.equal((profileSource.match(/id="guide-profile-submission"/g) || []).length, 1)
  assert.equal((profileSource.match(/form="guide-profile-form"/g) || []).length, 1)
  assert.match(profileSource, /window\.location\.hash === '#guide-profile-submission'/)
  assert.match(profileSource, /scrollIntoView/)
})
