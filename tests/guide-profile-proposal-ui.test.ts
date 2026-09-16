import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import test from 'node:test'
import vm from 'node:vm'
import ts from 'typescript'

const require = createRequire(import.meta.url)
const React = require('react')
function harness(status = 'ACTIVE') {
  const profile: any = {
    id: 'test-guide', name: 'Test Guide', firstName: 'Test', lastName: 'Guide', email: 'guide@example.test', status,
    phoneWhatsapp: '+33000000000', country: 'FR', bio: 'Test biography', city: 'MADINAH', gender: 'HOMME', nationality: 'FR', experienceYears: 5,
    languages: [{ id: 'fr', languageCode: 'fr', level: 'NATIVE' }], createdAt: '13/09/2026', image: null,
    acceptingBookings: true, servesMakkah: true, servesMadinah: true, applicationMedia: null,
    pendingChangeRequest: null, latestProfileDecision: null, profileReturn: null,
    dossier: { bank: { readable: true }, progress: [], missingProfileFields: [], rates: { base: [], places: [], travelNetEuros: {} }, confirmations: [{ section: 'terms', revision: 'test-revision', ready: true, confirmed: false }] },
  }
  let cursor = 0
  const states: any[] = []
  const effects: (() => void)[] = []
  let firstRender = true
  const calls: any[] = []
  let handler: (url: string, options: any) => Promise<any> = async (url, options) => {
    if (!options?.method) return { ok: true, json: async () => ({ profile }) }
    if (options.method === 'POST' && url.endsWith('/submit')) return { ok: true, json: async () => ({}) }
    if (options.method === 'POST') return { ok: true, json: async () => ({ dossier: profile.dossier }) }
    return { ok: true, json: async () => ({ pendingChangeRequest: { id: 'new-request', changes: JSON.parse(options.body) } }) }
  }
  const Editor = () => null
  const mocks: any = {
    react: { ...React, useState(initial: any) {
      const index = cursor++
      if (!(index in states)) states[index] = typeof initial === 'function' ? initial() : initial
      return [states[index], (value: any) => { states[index] = typeof value === 'function' ? value(states[index]) : value }]
    }, useEffect(effect: () => void) { if (firstRender) effects.push(effect) } },
    'next/link': () => null, 'next/image': () => null,
    '@/lib/languages': { GUIDE_LANGUAGES: [{ code: 'fr', label: 'Français' }], LANG_CODE_TO_LABEL: { fr: 'Français' } },
    '@/components/guide/ApplicationMediaPanel': () => null,
    '@/components/guide/GuideDossierProposalEditor': Editor,
    '@/lib/guide-payout-policy': { GUIDE_DOSSIER_ACKNOWLEDGEMENTS: { terms: 'Conditions de test' }, GUIDE_PAYOUT_POLICY: {} },
  }
  const module = { exports: {} as any }
  vm.runInNewContext(ts.transpileModule(readFileSync('src/app/guide/(dashboard)/profil/page.tsx', 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true, jsx: ts.JsxEmit.ReactJSX },
  }).outputText, { module, exports: module.exports, Error, window: { location: { hash: '' } },
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
  const submit = () => find(node => node.props?.id === 'guide-profile-form').props.onSubmit({ preventDefault() {} })
  render()
  effects.forEach(effect => effect())
  return { profile, calls, render, nodes, text, find, submit, Editor, setHandler: (value: typeof handler) => { handler = value }, ready: () => new Promise(resolve => setTimeout(resolve, 0)) }
}

test('Guide identity stays read-only until Modify; submission sends proposals, never direct public writes', async () => {
  const h = harness(); await h.ready()
  assert.equal(h.find(node => node.type === 'fieldset' && node.props.children?.some?.((child: any) => child?.props?.className === 'guide-profile-grid')).props.disabled, true)
  h.find(node => node.type === 'button' && h.text(node) === 'Modifier les informations personnelles').props.onClick()
  h.find(node => node.type === 'input' && node.props.placeholder === 'Votre prénom').props.onChange({ target: { value: 'Changed' } })
  await h.submit()
  const write = h.calls.find(call => call.method === 'PATCH')
  assert.equal(JSON.parse(write.body).firstName, 'Changed')
  assert.equal(JSON.parse(write.body).lastName, 'Guide')
  assert.equal(h.calls.some(call => call.url.includes('/admin/') || call.url.endsWith('/submit')), false)
})

test('upload in progress blocks final submission; empty click does not issue a PATCH', async () => {
  const h = harness(); await h.ready()
  h.find(node => node.type === h.Editor).props.onBusyChange(true)
  assert.equal(h.find(node => node.props?.form === 'guide-profile-form').props.disabled, true)
  await h.submit()
  assert.equal(h.calls.some(call => call.method), false)
  h.find(node => node.type === h.Editor).props.onBusyChange(false)
  await h.submit()
  assert.equal(h.calls.some(call => call.method), false)
  assert.match(h.text(h.render()), /Aucune modification à envoyer/)
})

test('conflict while confirming stops later writes, retaining the user selections for retry', async () => {
  const h = harness('DRAFT'); await h.ready()
  h.find(node => node.type === 'input' && node.props.type === 'checkbox').props.onChange({ target: { checked: true } })
  h.setHandler(async () => ({ ok: false, status: 409, json: async () => ({ error: 'Le dossier a changé. Rechargez la page.' }) }))
  await h.submit()
  assert.deepEqual(h.calls.filter(call => call.method).map(call => call.method), ['POST'])
  assert.match(h.text(h.render()), /Le dossier a changé/)
  assert.equal(h.find(node => node.type === 'input' && node.props.type === 'checkbox').props.checked, true)
})

test('bank and photo are sent as proposals; a failed PATCH never submits the draft', async () => {
  const h = harness('DRAFT'); await h.ready()
  const proposal = { bankProposal: { firstName: 'Test', lastName: 'Guide', bankName: 'Bank', country: 'FR', iban: 'TEST-IBAN', bic: '' }, mediaProposal: { profilePhotoReceipt: 'test-receipt' } }
  h.find(node => node.type === h.Editor).props.onChange(proposal)
  h.setHandler(async () => ({ ok: false, status: 429, json: async () => ({ error: 'Réessayez plus tard.' }) }))
  await h.submit()
  assert.deepEqual(JSON.parse(h.calls.find(call => call.method === 'PATCH').body), proposal)
  assert.equal(h.calls.some(call => call.url.endsWith('/submit')), false)
  assert.match(h.text(h.render()), /Réessayez plus tard/)
})

test('return reason and rejected correction appear; resubmission uses explicit owned request ID', async () => {
  const h = harness('DRAFT')
  h.profile.profileReturn = { reason: 'Complétez la photo', at: '2026-09-13T00:00:00Z' }
  h.profile.latestProfileDecision = { id: 'rejected-test', status: 'REJECTED', reviewNotes: 'Photo à corriger', changes: { bio: 'Proposed biography' } }
  await h.ready()
  assert.match(h.text(h.render()), /Complétez la photo/)
  h.find(node => node.type === 'button' && h.text(node) === 'Reprendre cette demande').props.onClick()
  await h.submit()
  const body = JSON.parse(h.calls.find(call => call.method === 'PATCH').body)
  assert.equal(body.resubmitRequestId, 'rejected-test')
  assert.equal(body.bio, 'Proposed biography')
  assert.equal(h.calls.filter(call => call.url.endsWith('/submit')).length, 1)
})

test('saved correction survives draft submission failure and retry does not resend upload receipts', async () => {
  const h = harness('DRAFT'); await h.ready()
  h.find(node => node.type === h.Editor).props.onChange({ mediaProposal: { profilePhotoReceipt: 'test-receipt' } })
  h.setHandler(async (_url, options) => options?.method === 'PATCH'
    ? { ok: true, json: async () => ({ pendingChangeRequest: { id: 'saved', changes: {} } }) }
    : { ok: false, json: async () => ({ error: 'Complétez la présentation.' }) })
  await h.submit()
  assert.match(h.text(h.render()), /Vos modifications sont enregistrées/)
  await h.submit()
  assert.equal(h.calls.filter(call => call.method === 'PATCH').length, 1)
  assert.equal(h.calls.filter(call => call.url.endsWith('/submit')).length, 2)
})

test('main city offers only Makkah and Madinah and excludes unserved city choices', async () => {
  const h = harness()
  h.profile.servesMakkah = false
  await h.ready()
  const select = h.find(node => node.type === 'select' && node.props.id === 'guide-main-city')
  const options = h.nodes(select).filter(node => node.type === 'option')
  assert.deepEqual(options.map(node => node.props.value), ['', 'MAKKAH', 'MADINAH'])
  assert.equal(options.find(node => node.props.value === 'MAKKAH').props.disabled, true)
  assert.equal(options.find(node => node.props.value === 'MADINAH').props.disabled, false)
})

test('unrelated identity proposal does not replace an unchanged legacy main city', async () => {
  const h = harness()
  h.profile.city = 'Médine'
  await h.ready()
  h.find(node => node.type === 'button' && h.text(node) === 'Modifier les informations personnelles').props.onClick()
  h.find(node => node.type === 'input' && node.props.placeholder === 'Votre prénom').props.onChange({ target: { value: 'Corrected' } })
  await h.submit()
  const body = JSON.parse(h.calls.find(call => call.method === 'PATCH').body)
  assert.equal(body.firstName, 'Corrected')
  assert.equal(Object.hasOwn(body, 'city'), false)
})

test('saved bank proposal refreshes the dossier after incomplete submission, so the Guide can confirm the proposed revision', async () => {
  const h = harness('DRAFT'); await h.ready()
  h.find(node => node.type === h.Editor).props.onChange({ bankProposal: { firstName: 'Test', lastName: 'Guide', bankName: 'Bank', country: 'FR', iban: 'TEST-IBAN', bic: '' } })
  h.setHandler(async (url, options) => {
    if (options?.method === 'PATCH') return { ok: true, json: async () => ({ pendingChangeRequest: { id: 'saved', changes: {} } }) }
    if (url.endsWith('/submit')) return { ok: false, json: async () => ({ error: 'Confirmez les coordonnées proposées.' }) }
    return { ok: true, json: async () => ({ profile: { ...h.profile, pendingChangeRequest: { id: 'saved', changes: {} }, dossier: {
      ...h.profile.dossier, bankProposalPending: true,
      confirmations: [{ section: 'terms', ready: true, confirmed: false, revision: 'new-proposal-revision' }],
    } } }) }
  })
  await h.submit()
  assert.match(h.text(h.render()), /Coordonnées proposées — en attente/)
  assert.match(h.text(h.render()), /Vos modifications sont enregistrées/)
  h.find(node => node.type === 'input' && node.props.type === 'checkbox').props.onChange({ target: { checked: true } })
  h.setHandler(async () => ({ ok: false, json: async () => ({ error: 'Stop after observed confirmation payload' }) }))
  await h.submit()
  const confirmation = h.calls.find(call => call.method === 'POST' && !call.url.endsWith('/submit'))
  assert.equal(JSON.parse(confirmation.body).confirmations[0].revision, 'new-proposal-revision')
  assert.equal(h.calls.filter(call => call.method === 'PATCH').length, 1)
})
