import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const home = readFileSync('src/app/page.tsx', 'utf8')
const card = readFileSync('src/components/PublicReviewCard.tsx', 'utf8')
const publicReviews = readFileSync('src/lib/public-reviews.ts', 'utf8')

test('the homepage renders each approved review only once', () => {
  assert.match(home, /<Carousel label="Avis clients" className="sfr-reviews-carousel" auto=\{false\}>/)
  assert.match(home, /reviews\.length === 1/)
  assert.doesNotMatch(home, /Uniquement des avis réels, publiés après validation/)
})

test('public review cards use the account avatar with an initial fallback', () => {
  assert.match(publicReviews, /avatarUrl: review\.user\.image/)
  assert.match(publicReviews, /avatarUrl: review\.pelerin\.image/)
  assert.match(card, /public-review-avatar/)
  assert.match(card, /review\.avatarUrl/)
  assert.doesNotMatch(card, /<footer>/)
})

test('the public review query remains restricted to approved reviews', () => {
  assert.match(publicReviews, /status: 'APPROVED'/)
})
