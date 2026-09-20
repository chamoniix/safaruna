import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { createRequire } from 'node:module'
import { runInNewContext } from 'node:vm'
import test from 'node:test'
import ts from 'typescript'
import * as React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

const checkoutPath = 'src/app/espace/checkout/[slug]/page.tsx'
const catalogPath = 'src/app/guides/page.tsx'
function source(path: string) {
  return process.env.NAVIGATION_BASELINE === '1'
    ? execFileSync('git', ['show', `HEAD:${path}`], { encoding: 'utf8' })
    : readFileSync(path, 'utf8')
}
function nodes(path: string) {
  const file = ts.createSourceFile(path, source(path), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
  const found: ts.Node[] = []
  function visit(node: ts.Node) { found.push(node); node.forEachChild(visit) }
  visit(file)
  return { file, found }
}
function declaration(name: string) {
  const { file, found } = nodes(checkoutPath)
  return found.find(node => ts.isVariableDeclaration(node) && node.name.getText(file) === name)?.getText(file)
}
function run(code: string, context: Record<string, unknown>) {
  return runInNewContext(ts.transpileModule(code, { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText, { URLSearchParams, ...context })
}

test('changing guide cannot skip earlier steps or alter an active/resuming payment', () => {
  for (const cityChoice of ['MAKKAH', 'MADINAH', 'BOTH', null]) {
    for (const step of [1, 2, 3, 4, 5]) {
      for (const payment of ['none', 'active', 'resuming']) {
        let nextStep: number | undefined
        const code = ['guideSelectionStep', 'canChangeGuide', 'goToGuideSelection']
          .map(name => declaration(name)).filter(Boolean).map(value => `const ${value};`).join('\n')
        run(`${code}\ngoToGuideSelection()`, {
          cityChoice, step, paymentSession: payment === 'active' ? {} : null, resumingPayment: payment === 'resuming',
          setStep: (value: number) => { nextStep = value }, scrollContainerRef: { current: null },
        })
        const target = cityChoice === 'BOTH' ? 2 : 4
        assert.equal(nextStep, cityChoice && step >= target && payment === 'none' ? target : undefined)
      }
    }
  }
})

test('single-city guide continuation requires dates and arrival before recap', () => {
  for (const range of [undefined, { from: new Date() }, { from: new Date(), to: new Date() }]) {
    for (const arrivalPoint of ['', 'JEDDAH']) {
      let nextStep = 4
      let error = ''
      run(`const ${declaration('continueFromGuideStep')}; continueFromGuideStep()`, {
        cityChoice: 'MAKKAH', range, arrivalPoint, step: 4, daysMakkah: 1, daysMadinah: 1,
        addDays: (date: Date) => date, setError: (value: string) => { error = value }, setStep: (value: number) => { nextStep = value },
      })
      const complete = Boolean(range?.from && range?.to && arrivalPoint)
      assert.equal(nextStep, complete ? 5 : 2)
      assert.equal(Boolean(error), !complete)
    }
  }
})

test('catalogue return assigns the correct city, replaces old selection, preserves legacy pair links and ignores payment resumes', () => {
  const { file, found } = nodes(checkoutPath)
  const effect = found.find(node => ts.isCallExpression(node) && node.expression.getText(file) === 'useEffect' && node.arguments[0]?.getText(file).includes("const pairSlug = searchParams.get('pair')")) as ts.CallExpression
  assert.ok(effect)
  for (const city of [null, 'MAKKAH', 'MADINAH', 'INVALID']) {
    for (const resumeRef of [null, 'existing-order']) {
      let makkah = 'previous-makkah'
      let madinah = 'previous-madinah'
      const params = new URLSearchParams({ pair: 'chosen-guide' })
      if (city) params.set('selectionCity', city)
      run(`(${effect.arguments[0].getText(file)})()`, {
        searchParams: params, resumeRef, selectedGuideSlugMadinah: madinah,
        setSelectedGuideSlug: (value: string) => { makkah = value },
        setSelectedGuideSlugMadinah: (value: string) => { madinah = value },
      })
      assert.equal(makkah, !resumeRef && city === 'MAKKAH' ? 'chosen-guide' : 'previous-makkah')
      assert.equal(madinah, !resumeRef && (city === null || city === 'MADINAH') ? 'chosen-guide' : 'previous-madinah')
    }
  }
})

test('card and drawer return links both carry the chosen city and encode slugs', () => {
  const { file, found } = nodes(catalogPath)
  const hrefs = found.filter(node => ts.isJsxAttribute(node) && node.name.getText(file) === 'href' && node.getText(file).includes('?pair=')) as ts.JsxAttribute[]
  assert.equal(hrefs.length, 2)
  for (const href of hrefs) {
    const expression = (href.initializer as ts.JsxExpression).expression!.getText(file)
    for (const city of ['MAKKAH', 'MADINAH']) {
      const value = run(expression, { returnSlug: 'original', g: { slug: 'new&guide' }, returnCity: city, encodeURIComponent })
      const url = new URL(value, 'https://safaruma.com')
      assert.equal(url.searchParams.get('pair'), 'new&guide')
      assert.equal(url.searchParams.get('selectionCity'), city)
    }
  }
})

test('a stale original guide response cannot clear a newly chosen Makkah guide', () => {
  const { file, found } = nodes(checkoutPath)
  const effect = found.find(node => ts.isCallExpression(node) && node.expression.getText(file) === 'useEffect' && node.arguments[0]?.getText(file).includes('guide.slug !== slug')) as ts.CallExpression
  assert.ok(effect)
  let changed = false
  run(`(${effect.arguments[0].getText(file)})()`, {
    guide: { slug: 'original', servesMakkah: false, servesMadinah: true }, slug: 'original',
    cityChoice: 'BOTH', selectedGuideSlug: 'new-makkah-guide',
    setSelectedGuideSlug: () => { changed = true }, setSelectedGuideSlugMadinah: () => { changed = true },
  })
  assert.equal(changed, false)
})

test('errors are visible outside the recap and announced accessibly', () => {
  const text = source(checkoutPath)
  const warning = text.indexOf('{error && step !== 5 && (')
  assert.ok(warning > 0 && warning < text.indexOf('{step === 1 && ('))
  assert.match(text.slice(warning, warning + 100), /role="alert"/)
  assert.match(text, /if \(error && step !== 5\) scrollContainerRef/)
})

test('actual checkout component keeps the header action disabled before guide selection and renders errors on every step', () => {
  const require = createRequire(import.meta.url)
  const { file, found } = nodes(checkoutPath)
  const stateNames = found.filter(node => ts.isVariableDeclaration(node) && node.initializer && ts.isCallExpression(node.initializer) && node.initializer.expression.getText(file) === 'useState')
    .map(node => (node as ts.VariableDeclaration).name.getText(file).slice(1, -1).split(',')[0].trim())
  let cursor = 0
  const state: Record<string, unknown> = { loadingGuide: false, cityChoice: 'MAKKAH', guide: { slug: 'fixture-guide', name: 'Guide isolé', city: 'MAKKAH' }, error: 'Erreur de test isolé' }
  const hooks = { ...React, useEffect: () => {}, useRef: () => ({ current: null }), useState(initial: unknown) {
    const name = stateNames[cursor++]
    if (!(name in state)) state[name] = initial
    return [state[name], (value: unknown) => { state[name] = value }]
  } }
  const mocks: Record<string, unknown> = {
    react: hooks,
    'next/navigation': { useParams: () => ({ slug: 'fixture-guide' }), useSearchParams: () => new URLSearchParams(), useRouter: () => ({}) },
    'next-auth/react': { useSession: () => ({ status: 'authenticated', data: { user: { email: 'isolated@example.com' } } }) },
    'next/link': { __esModule: true, default: 'a' },
    'react-day-picker': { DayPicker: () => null },
    './revolut-embedded-checkout': { __esModule: true, default: () => null },
    '@/lib/analytics-client': {},
  }
  const exports: { default?: () => React.ReactNode } = {}
  runInNewContext(ts.transpileModule(source(checkoutPath), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText, {
    exports, URLSearchParams,
    require: (id: string) => id in mocks ? mocks[id] : id.endsWith('.css') ? {} : require(id.startsWith('@/') ? `${process.cwd()}/src/${id.slice(2)}` : id),
  })
  for (const cityChoice of ['MAKKAH', 'BOTH']) {
    for (const step of [1, 2, 3, 4, 5]) {
      Object.assign(state, { step, cityChoice })
      cursor = 0
      const html = renderToStaticMarkup(exports.default!())
      assert.equal((html.match(/role="alert"/g) || []).length, 1)
      assert.ok(html.includes('Erreur de test isolé'))
      if (step === 5) {
        assert.ok(!html.includes('Confirmation sous'))
        assert.ok(html.includes('Guide Certifié SAFARUMA'))
        assert.ok(html.includes('Annulation gratuite sous 48h'))
        assert.ok(html.includes('Paiement 100% sécurisé'))
      }
      const action = html.match(/<button[^>]*class="checkout-account-action"[^>]*>/)?.[0]
      assert.ok(action)
      assert.equal(action.includes('disabled'), step < (cityChoice === 'BOTH' ? 2 : 4))
    }
  }
})
