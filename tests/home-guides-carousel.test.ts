import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const home = readFileSync('src/app/page.tsx', 'utf8')
const styles = readFileSync('src/app/globals.css', 'utf8')

test('la home charge uniquement les vrais Guides et leurs statistiques depuis l API', () => {
  assert.match(home, /fetch\('\/api\/guides\/available'/)
  assert.match(home, /guide\.rating\.toFixed\(1\)/)
  assert.match(home, /guide\.reviewCount/)
  assert.doesNotMatch(home, /id: 'youssef'|id: 'ibrahim'|id: 'muhammad'|id: 'rachid'/)
})

test('le carrousel ne combine plus deux moteurs de défilement', () => {
  assert.match(styles, /\.sfr-carousel-track\s*\{[\s\S]*scroll-behavior:\s*auto;/)
  assert.match(home, /onPointerEnter=\{\(\) => setInteracting\(true\)\}/)
  assert.match(home, /coarsePointer \|\| interacting/)
  assert.match(home, /firstClone\.offsetLeft - firstItem\.offsetLeft/)
  assert.match(home, /let position = ref\.current\?\.scrollLeft \?\? 0/)
  assert.match(home, /position \+= delta \* 0\.026/)
})

test('le bloc Guides ne clone pas un Guide réel pour simuler une boucle', () => {
  assert.match(home, /<Carousel label="Guides privés SAFARUMA" auto=\{false\}>/)
  assert.match(styles, /\.sfr-carousel-track\s*\{[\s\S]*overflow-x:\s*auto;/)
  assert.match(styles, /-webkit-overflow-scrolling:\s*touch;/)
})
