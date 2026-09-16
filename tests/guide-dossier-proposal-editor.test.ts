import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { isValidElement, type ComponentProps, type ReactElement, type ReactNode } from 'react'
import ts from 'typescript'
import type Editor from '../src/components/guide/GuideDossierProposalEditor'
import type { GuideDossierProposal } from '../src/components/guide/GuideDossierProposalEditor'
import * as mediaModule from '../src/lib/guide-application-media'

type Props = ComponentProps<typeof Editor>
type Element = ReactElement<Record<string, unknown>>
const bank = { firstName: 'Test', lastName: 'Guide', bankName: 'Test Bank', country: 'FR', iban: 'FR123456789012345', bic: '', readable: true }
const media: mediaModule.ApplicationMediaView = {
  applicationId: 'private-request', hasPersonalVehicle: true, vehicleModel: 'Van', vehicleYear: 2020,
  vehiclePassengerSeats: 6, vehicleColor: 'Blanc', vehicleSeatsConfirmed: true,
  photos: { profile: '/api/guide-profile-change-requests/test/photos/profile', dashboard: null, seats: null, exterior: null },
}

function elements(node: ReactNode): Element[] {
  if (Array.isArray(node)) return node.flatMap(elements)
  if (!isValidElement<Record<string, unknown>>(node)) return []
  return [node, ...elements(node.props.children as ReactNode)]
}

// Exercise the actual component callbacks with deterministic state hooks; no DOM,
// real uploads, external accounts, or additional test dependency is required.
function fixture(overrides: Partial<Props> = {}) {
  let cursor = 0
  const slots: unknown[] = []
  const changes: GuideDossierProposal[] = []
  const busy: boolean[] = []
  const fetches: { url: string; options: RequestInit }[] = []
  const cleanups: (() => void)[] = []
  const pendingReads: (() => void)[] = []
  let readerMode: 'success' | 'error' | 'pending' = 'success'
  const preview = 'data:image/png;base64,dGVzdA=='
  let respond: (url: string, options: RequestInit) => Promise<Response> = async () => Response.json({ receipt: 'private-receipt' })
  const hooks = {
    useState(initial: unknown) {
      const index = cursor++
      if (!(index in slots)) slots[index] = typeof initial === 'function' ? initial() : initial
      return [slots[index], (next: unknown) => { slots[index] = typeof next === 'function' ? next(slots[index]) : next }]
    },
    useRef(initial: unknown) {
      const index = cursor++
      if (!(index in slots)) slots[index] = { current: initial }
      return slots[index]
    },
    useId() { cursor++; return 'editor' },
    useEffect(effect: () => (() => void) | undefined) {
      const index = cursor++
      if (!(index in slots)) {
        slots[index] = true
        const cleanup = effect()
        if (cleanup) cleanups.push(cleanup)
      }
    },
  }
  class TestFileReader {
    result: string | null = null
    onload: (() => void) | null = null
    onerror: (() => void) | null = null
    onabort: (() => void) | null = null
    readAsDataURL() {
      const mode = readerMode
      const complete = () => {
        if (mode === 'error') this.onerror?.()
        else { this.result = preview; this.onload?.() }
      }
      if (mode === 'pending') pendingReads.push(complete)
      else queueMicrotask(complete)
    }
    abort() { this.onabort?.() }
  }
  const output = ts.transpileModule(readFileSync('src/components/guide/GuideDossierProposalEditor.tsx', 'utf8'), {
    compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
  }).outputText
  const localRequire = createRequire(import.meta.url)
  const exported: { default?: (props: Props) => ReactNode } = {}
  new Function('require', 'exports', 'fetch', 'FileReader', output)(
    (id: string) => id === 'react' ? hooks : id === '@/lib/guide-application-media' ? mediaModule : localRequire(id),
    exported,
    async (url: string, options: RequestInit) => { fetches.push({ url, options }); return respond(url, options) },
    TestFileReader,
  )
  let props: Props = { email: 'guide+photos@example.test', bank, media, onChange: value => changes.push(structuredClone(value)), onBusyChange: value => busy.push(value), ...overrides }
  let rendered: Element[] = []
  const render = () => { cursor = 0; rendered = elements(exported.default!(props)); return rendered }
  const find = (predicate: (element: Element) => boolean) => {
    const found = rendered.find(predicate)
    assert.ok(found, 'Expected rendered element')
    return found
  }
  function fire(element: Element, name: 'onChange' | 'onClick', event: unknown = {}) {
    const callback = element.props[name]
    assert.equal(typeof callback, 'function')
    ;(callback as (event: unknown) => void)(event)
    render()
  }
  const change = (id: string, value: unknown) => fire(find(element => element.props.id === `editor-${id}`), 'onChange', { target: { value } })
  const open = (text: string) => fire(find(element => element.type === 'button' && element.props.children === text), 'onClick')
  const selectFile = (kind: string, file: File) => fire(find(element => element.props.id === `editor-photo-${kind}`), 'onChange', { target: { files: [file], value: file.name } })
  render()
  return { changes, busy, fetches, find, fire, change, open, selectFile, render,
    nodes: () => rendered,
    respond(value: typeof respond) { respond = value },
    props(value: Partial<Props>) { props = { ...props, ...value }; render() },
    readerMode(value: typeof readerMode) { readerMode = value },
    finishReading() { pendingReads.splice(0).forEach(complete => complete()) },
    unmount() { cleanups.forEach(cleanup => cleanup()) },
  }
}

const flush = () => new Promise(resolve => setImmediate(resolve))
const photo = () => new File(['test photo bytes'], 'test.png', { type: 'image/png' })

test('editor does not emit initial pending values; a bank edit emits a complete private replacement', () => {
  const initialBank = { firstName: bank.firstName, lastName: bank.lastName, bankName: 'Pending Bank', country: bank.country, iban: bank.iban, bic: bank.bic }
  const f = fixture({ initialBank, initialMedia: media })
  assert.equal(f.changes.length, 0)
  assert.equal(f.nodes().some(element => element.type === 'form'), false)
  f.render(); assert.equal(f.changes.length, 0)
  f.change('bank-firstName', 'Updated')
  assert.deepEqual(f.changes, [{ bankProposal: { ...initialBank, firstName: 'Updated' } }])
  assert.ok(f.nodes().some(element => element.props['data-clarity-mask'] === 'true' && 'data-sentry-mask' in element.props))
})

test('opening an editor is not an edit; media changes include only touched fields and retain hidden vehicle values', () => {
  const f = fixture()
  f.open('Modifier les photos et le véhicule')
  assert.equal(f.changes.length, 0)
  f.change('vehicleModel', 'Updated van')
  assert.deepEqual(f.changes.at(-1), { mediaProposal: { vehicleModel: 'Updated van' } })
  f.change('vehicle', 'no')
  assert.equal(f.nodes().some(element => element.props.id === 'editor-vehicleModel'), false)
  assert.equal(f.nodes().some(element => element.props.id === 'editor-photo-seats'), false)
  assert.deepEqual(f.changes.at(-1), { mediaProposal: { vehicleModel: 'Updated van', hasPersonalVehicle: false } })
  f.change('vehicle', 'yes')
  assert.equal(f.find(element => element.props.id === 'editor-vehicleModel').props.value, 'Updated van')
  assert.equal(f.find(element => element.props.id === 'editor-vehicleYear').props.value, 2020)
  assert.deepEqual(f.changes.at(-1), { mediaProposal: { vehicleModel: 'Updated van', hasPersonalVehicle: true } })
})

test('every photo has an explicit accessible import/replace button; disabled controls cannot open its input', () => {
  const f = fixture({ initialMedia: media })
  for (const kind of mediaModule.APPLICATION_PHOTO_KINDS) {
    const input = f.find(element => element.props.id === `editor-photo-${kind}`)
    assert.equal(input.props.hidden, true)
    const text = kind === 'profile' ? 'Remplacer la photo' : 'Importer une photo'
    const button = f.find(element => element.props['aria-label'] === `${text} — ${mediaModule.APPLICATION_PHOTO_LABELS[kind]}`)
    assert.equal(button.props.children, text)
    let clicks = 0
    ;(input.props.ref as (element: { click(): void }) => void)({ click: () => { clicks++ } })
    f.fire(button, 'onClick'); assert.equal(clicks, 1)
    f.props({ disabled: true })
    const lockedButton = f.find(element => element.props['aria-label'] === button.props['aria-label'])
    assert.equal(lockedButton.props.disabled, true)
    assert.equal(f.find(element => element.props.id === input.props.id).props.disabled, true)
    f.fire(lockedButton, 'onClick'); assert.equal(clicks, 1)
    f.props({ disabled: false })
  }
})

test('upload sends raw image with owner header, locks edits, and emits only its receipt from the response', async () => {
  const f = fixture({ initialMedia: media })
  let finish: (response: Response) => void = () => {}
  f.respond(() => new Promise(resolve => { finish = resolve }))
  const file = photo()
  f.selectFile('seats', file)
  assert.deepEqual(f.busy, [true])
  await flush(); f.render()
  assert.equal(f.fetches.length, 1)
  assert.equal(f.fetches[0].url, '/api/guide/inscription/photos?kind=seats')
  assert.equal(f.fetches[0].options.body, file)
  assert.deepEqual(f.fetches[0].options.headers, { 'Content-Type': 'image/png', 'x-guide-email': encodeURIComponent('guide+photos@example.test') })
  assert.equal(f.find(element => element.props.id === 'editor-photo-profile').props.disabled, true)
  f.selectFile('profile', photo()); assert.equal(f.fetches.length, 1)
  finish(Response.json({ receipt: 'safe-private-receipt', pathname: 'private/blob/path', url: 'https://private.invalid/file' }))
  await flush(); f.render()
  assert.deepEqual(f.busy, [true, false])
  assert.deepEqual(f.changes, [{ mediaProposal: { vehicleSeatsPhotoReceipt: 'safe-private-receipt' } }])
  assert.equal(f.find(element => element.props.id === 'editor-photo-profile').props.disabled, false)
  assert.equal(f.nodes().some(element => element.type === 'img' && element.props.src === 'data:image/png;base64,dGVzdA=='), true)
})

test('upload server error is visible, leaves proposal unchanged, and unlocks the parent save state for retry', async () => {
  const f = fixture({ initialMedia: media })
  f.respond(async () => Response.json({ error: 'Envoi momentanément indisponible.' }, { status: 503 }))
  f.selectFile('profile', photo()); await flush(); f.render()
  assert.deepEqual(f.changes, [])
  assert.deepEqual(f.busy, [true, false])
  assert.ok(f.nodes().some(element => element.props.role === 'status' && element.props.children === 'Envoi momentanément indisponible.'))
  assert.equal(f.find(element => element.props.id === 'editor-photo-profile').props.disabled, false)
  f.respond(async () => Response.json({ receipt: 'retry-receipt' }))
  f.selectFile('profile', photo()); await flush(); f.render()
  assert.deepEqual(f.changes, [{ mediaProposal: { profilePhotoReceipt: 'retry-receipt' } }])
  assert.deepEqual(f.busy, [true, false, true, false])
})

test('missing receipt or network error fails without a proposal and always releases upload busy', async () => {
  for (const response of [async () => Response.json({ url: 'https://private.invalid/file' }), async (): Promise<Response> => { throw new Error('Réseau indisponible') }]) {
    const f = fixture({ initialMedia: media }); f.respond(response)
    f.selectFile('profile', photo()); await flush(); f.render()
    assert.deepEqual(f.changes, [])
    assert.deepEqual(f.busy, [true, false])
    assert.equal(f.find(element => element.props.id === 'editor-photo-profile').props.disabled, false)
    assert.ok(f.nodes().some(element => element.props.role === 'status'))
  }
})

test('invalid photo type, empty file, and oversize file are rejected before upload without locking save', () => {
  for (const file of [new File(['x'], 'bad.svg', { type: 'image/svg+xml' }), new File([], 'empty.png', { type: 'image/png' }), new File([new Uint8Array(4_000_001)], 'large.png', { type: 'image/png' })]) {
    const f = fixture({ initialMedia: media }); f.selectFile('profile', file)
    assert.equal(f.fetches.length, 0); assert.deepEqual(f.busy, []); assert.deepEqual(f.changes, [])
    assert.ok(f.nodes().some(element => element.props.role === 'status'))
  }
})

test('FileReader failure occurs before upload, keeps the existing proposal photo, and releases save busy', async () => {
  const f = fixture({ initialMedia: media })
  f.readerMode('error')
  f.selectFile('profile', photo()); await flush(); f.render()
  assert.equal(f.fetches.length, 0)
  assert.deepEqual(f.changes, [])
  assert.deepEqual(f.busy, [true, false])
  assert.ok(f.nodes().some(element => element.type === 'img' && element.props.src === media.photos.profile))
  assert.ok(f.nodes().some(element => element.props.role === 'status' && element.props.children === 'L’aperçu de la photo n’a pas pu être lu. Réessayez.'))
})

test('unmount during FileReader aborts before upload and cannot replace the pending preview', async () => {
  const f = fixture({ initialMedia: media })
  f.readerMode('pending')
  f.selectFile('profile', photo())
  f.unmount(); f.finishReading(); await flush(); f.render()
  assert.equal(f.fetches.length, 0)
  assert.deepEqual(f.changes, [])
  assert.deepEqual(f.busy, [true])
  assert.ok(f.nodes().some(element => element.type === 'img' && element.props.src === media.photos.profile))
})

test('unmount while upload is pending ignores even a later successful receipt and preserves the preview', async () => {
  const f = fixture({ initialMedia: media })
  let finish: (response: Response) => void = () => {}
  f.respond(() => new Promise(resolve => { finish = resolve }))
  f.selectFile('profile', photo()); await flush()
  assert.equal(f.fetches.length, 1)
  f.unmount()
  assert.equal(f.fetches[0].options.signal?.aborted, true)
  finish(Response.json({ receipt: 'late-receipt' })); await flush(); f.render()
  assert.deepEqual(f.changes, [])
  assert.deepEqual(f.busy, [true])
  assert.ok(f.nodes().some(element => element.type === 'img' && element.props.src === media.photos.profile))
})
