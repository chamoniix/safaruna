import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import test from 'node:test'
import vm from 'node:vm'
import ts from 'typescript'

// Regression: guide cards labelled every language as French.
// Verified during the guide profile QA, 2026-09-20.
const require = createRequire(import.meta.url)
type Node = { type?: unknown; props?: { children?: unknown; className?: string; href?: string } }
const source = readFileSync('src/app/guides/page.tsx', 'utf8')
const loaded = { exports: {} as { render: (props: unknown) => Node } }
vm.runInNewContext(ts.transpileModule(source.slice(source.indexOf('function GuideCard(')) + '\nexports.render = GuideCard;', {
  compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
}).outputText, { module: loaded, exports: loaded.exports, require,
  Link: 'a', GuideAvatarSVG: 'avatar', FranceFlagSVG: 'flag-fr', FavoriteHeartButton: 'favorite', IconMap: 'map',
})

function nodes(value: unknown): Node[] {
  if (Array.isArray(value)) return value.flatMap(nodes)
  if (!value || typeof value !== 'object') return []
  const node = value as Node
  return [node, ...nodes(node.props?.children)]
}
function text(value: unknown): string {
  if (typeof value === 'string' || typeof value === 'number') return String(value)
  if (Array.isArray(value)) return value.map(text).join('')
  return value && typeof value === 'object' ? text((value as Node).props?.children) : ''
}
function render(languages: string[], shortBio: string) {
  return loaded.exports.render({ guide: { slug: 'qa-guide', name: 'Guide de test',
    gradient: '#000', initials: 'GT', available: true, reviews: 0, rating: null,
    city: 'Makkah', experience: 3, languages, services: [], price: 130, shortBio,
  }, isFavorite: false, favoritePending: false, onFavorite() {} })
}

test('guide card displays the actual language, not a hardcoded French label', () => {
  const tree = render(['English'], 'Biographie approuvée')
  assert.match(text(tree), /English/)
  assert.doesNotMatch(text(tree), /Français/)
  assert.equal(nodes(tree).some(node => node.type === 'flag-fr'), false)
  assert.equal(nodes(tree).find(node => node.props?.href)?.props?.href, '/espace/checkout/qa-guide')
})

test('French flag remains paired with French only', () => {
  const tree = render(['Français'], '')
  assert.match(text(tree), /Français/)
  assert.equal(nodes(tree).some(node => node.type === 'flag-fr'), true)
})

test('card uses the approved biography verbatim and omits empty biographies', () => {
  const bio = 'Une présentation approuvée, sans texte inventé.'
  assert.equal(text(nodes(render(['Arabe'], bio)).find(node => node.props?.className === 'guide-card-summary')), bio)
  assert.equal(nodes(render([], '   ')).some(node => node.props?.className === 'guide-card-summary'), false)
})
