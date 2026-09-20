import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import test from 'node:test'
import vm from 'node:vm'
import ts from 'typescript'

const require = createRequire(import.meta.url)
const source = readFileSync('src/app/guides/[slug]/page.tsx', 'utf8')
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
}).outputText

type Node = { type?: unknown; props?: Record<string, unknown> & { children?: unknown; className?: string } }
type Fixture = {
  bio?: string | null
  image?: string | null
  experienceYears?: number | null
  languages?: string[]
  rating?: number | null
  reviewCount?: number
  slug?: string
}

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

function byClass(tree: Node, className: string) {
  return nodes(tree).find(node => node.props?.className === className)
}

async function render(fixture: Fixture = {}) {
  const guide = {
    id: 'test-guide', bio: fixture.bio ?? null,
    guideAccount: { displayName: 'Guide Test', firstName: 'Guide', lastName: 'Test', image: fixture.image ?? null },
    experienceYears: fixture.experienceYears ?? null,
    languages: (fixture.languages ?? []).map(languageCode => ({ languageCode })),
    places: [], reviews: [], servesMakkah: true, servesMadinah: false,
    city: 'MAKKAH', acceptingBookings: true, university: null,
  }
  const mocks: Record<string, unknown> = {
    react: { cache: (callback: unknown) => callback },
    'next/image': { default: 'image' },
    'next/link': { default: 'a' },
    'next/navigation': { notFound: () => { throw new Error('Unexpected notFound') } },
    '@/components/Footer': { default: 'footer' },
    '@/components/Navbar': { default: 'nav' },
    '@/lib/prisma': { default: {
      guideProfile: { findFirst: async () => guide },
      review: { aggregate: async () => ({
        _avg: { ratingOverall: fixture.rating ?? null },
        _count: { ratingOverall: fixture.reviewCount ?? 0 },
      }) },
    } },
    '@/lib/place-catalog': { getEffectivePlaceCatalog: async () => [] },
    './GuideProfileClient': { default: 'profile-client' },
  }
  const loaded = { exports: {} as { default: (props: { params: Promise<{ slug: string }> }) => Promise<Node> } }
  vm.runInNewContext(compiled, {
    module: loaded, exports: loaded.exports,
    require: (id: string) => {
      if (id === 'react/jsx-runtime') return require(id)
      assert.ok(Object.hasOwn(mocks, id), `Unexpected dependency: ${id}`)
      return mocks[id]
    },
  })
  return loaded.exports.default({ params: Promise.resolve({ slug: fixture.slug ?? 'test-guide' }) })
}

test('public profile hero renders the stored biography verbatim and omits blank biographies', async () => {
  const bio = '  Présentation approuvée du guide, sans ajout.  '
  assert.equal(text(byClass(await render({ bio }), 'sfr-public-guide-bio')), bio)
  for (const bio of [null, '', ' \n\t ']) {
    assert.equal(byClass(await render({ bio }), 'sfr-public-guide-bio'), undefined)
  }
})

test('public profile uses the account portrait with its accessible name or the real initials', async () => {
  const portrait = byClass(await render({ image: '/images/test-guide.jpg' }), 'sfr-public-guide-portrait')
  const image = nodes(portrait).find(node => node.type === 'image')
  assert.equal(image?.props?.src, '/images/test-guide.jpg')
  assert.equal(image?.props?.alt, 'Guide Test')
  assert.equal(image?.props?.sizes, '(max-width: 600px) 128px, 224px')
  const fallback = byClass(await render(), 'sfr-public-guide-portrait')
  assert.equal(text(fallback), 'GT')
  assert.equal(nodes(fallback).some(node => node.type === 'image'), false)
})

test('the existing official portrait fallback remains available', async () => {
  const portrait = byClass(await render({ slug: 'naim-laamari' }), 'sfr-public-guide-portrait')
  assert.equal(nodes(portrait).find(node => node.type === 'image')?.props?.src, '/images/landing/guide-naim-laamari.jpg')
})

test('public profile displays actual review aggregates only when reviews exist', async () => {
  const rated = await render({ rating: 4.64, reviewCount: 7 })
  assert.match(text(byClass(rated, 'sfr-public-guide-facts')), /4\.6 \/ 5 · 7 avis validés/)
  assert.equal(byClass(rated, 'sfr-public-guide-star')?.props?.['aria-hidden'], 'true')
  const unrated = await render({ rating: null, reviewCount: 0 })
  assert.doesNotMatch(text(byClass(unrated, 'sfr-public-guide-facts')), /avis|\/ 5/)
  assert.equal(byClass(unrated, 'sfr-public-guide-star'), undefined)
})

test('public profile preserves stored languages and experience, including zero, without inventing missing facts', async () => {
  const populated = await render({ languages: ['en', 'العربية'], experienceYears: 3 })
  const languages = byClass(populated, 'sfr-public-guide-languages')
  const badges = nodes(languages).filter(node => node.type === 'span')
  assert.deepEqual(badges.map(node => text(node)), ['en', 'العربية'])
  assert.ok(badges.every(node => node.props?.dir === 'auto'))
  assert.match(text(byClass(populated, 'sfr-public-guide-facts')), /Expérience : 3 ans/)
  assert.match(text(byClass(await render({ experienceYears: 0 }), 'sfr-public-guide-facts')), /Expérience : 0 ans/)
  const missing = await render()
  assert.equal(byClass(missing, 'sfr-public-guide-languages'), undefined)
  assert.doesNotMatch(text(byClass(missing, 'sfr-public-guide-facts')), /Expérience/)
})

test('official guide language labels include only languages actually stored', async () => {
  const tree = await render({ slug: 'naim-laamari', languages: ['darija', 'fr'] })
  const badges = nodes(byClass(tree, 'sfr-public-guide-languages')).filter(node => node.type === 'span')
  assert.deepEqual(badges.map(node => text(node)), ['Français', 'الدارجة'])
})
