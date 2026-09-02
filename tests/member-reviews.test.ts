import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const schema = readFileSync('prisma/schema.prisma', 'utf8')
const migration = readFileSync('prisma/migrations/20260902190000_experience_reviews/migration.sql', 'utf8')
const memberRoute = readFileSync('src/app/api/espace/member-review/route.ts', 'utf8')
const reservationRoute = readFileSync('src/app/api/espace/reviews/route.ts', 'utf8')
const publicReviews = readFileSync('src/lib/public-reviews.ts', 'utf8')
const home = readFileSync('src/app/page.tsx', 'utf8')

test('un compte possède un seul avis membre et chaque réservation un seul avis vérifié', () => {
  assert.match(schema, /generalReviewKey\s+String\?\s+@unique/)
  assert.match(schema, /reservationId\s+String\?\s+@unique/)
  assert.match(migration, /ExperienceReview_generalReviewKey_key/)
  assert.match(migration, /ExperienceReview_reservationId_key/)
})

test('un avis membre est une donnée authentifiée, validée et remise en attente après modification', () => {
  assert.match(memberRoute, /requirePelerin\(\)/)
  assert.match(memberRoute, /firstName: z\.string\(\)[\s\S]*city: z\.string\(\)[\s\S]*country: z\.string\(\)/)
  assert.match(memberRoute, /rating: z\.number\(\)\.int\(\)\.min\(1\)\.max\(5\)/)
  assert.match(memberRoute, /status: 'PENDING'/)
  assert.match(memberRoute, /MEMBER_REVIEW_SUBMITTED/)
  assert.match(memberRoute, /reviewRatelimit/)
})

test('chaque avis après réservation crée aussi un avis vérifié lié à la réservation', () => {
  assert.match(reservationRoute, /experienceReview\.upsert/)
  assert.match(reservationRoute, /reservationId: reservation\.id/)
  assert.match(reservationRoute, /rating: input\.stayRating/)
  assert.match(reservationRoute, /comment: input\.stayComment/)
})

test('les surfaces publiques ne lisent que les avis approuvés et gardent trois labels simples', () => {
  assert.match(publicReviews, /status: 'APPROVED'/)
  assert.match(publicReviews, /'Avis membre'/)
  assert.match(publicReviews, /'Avis vérifié'/)
  assert.match(publicReviews, /'Avis Guide'/)
  assert.doesNotMatch(publicReviews, /refNumber/)
  assert.match(home, /api\/reviews\/public/)
})

test('le retour vers le formulaire est autorisé après les quatre parcours d’authentification', () => {
  for (const path of [
    'src/app/connexion/actions.ts',
    'src/app/connexion/page.tsx',
    'src/app/inscription/page.tsx',
    'src/app/verify-email/page.tsx',
  ]) {
    assert.match(readFileSync(path, 'utf8'), /url\.pathname !== '\/avis\/deposer'/)
  }
})
