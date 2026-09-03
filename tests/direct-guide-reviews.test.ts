import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const schema = readFileSync('prisma/schema.prisma', 'utf8')
const migration = readFileSync('prisma/migrations/20260903124500_direct_guide_reviews/migration.sql', 'utf8')
const route = readFileSync('src/app/api/espace/guide-reviews/[slug]/route.ts', 'utf8')
const form = readFileSync('src/app/avis/guide/[slug]/GuideReviewForm.tsx', 'utf8')
const page = readFileSync('src/app/avis/guide/[slug]/page.tsx', 'utf8')
const publicReviews = readFileSync('src/lib/public-reviews.ts', 'utf8')
const profile = readFileSync('src/app/guides/[slug]/page.tsx', 'utf8')
const profileClient = readFileSync('src/app/guides/[slug]/GuideProfileClient.tsx', 'utf8')
const adminRoute = readFileSync('src/app/api/admin/reviews/route.ts', 'utf8')
const dashboardRoute = readFileSync('src/app/api/espace/my-reviews/route.ts', 'utf8')

test('un avis Guide direct est distinct des avis liés aux réservations', () => {
  assert.match(schema, /reservationId\s+String\?/)
  assert.match(schema, /directReviewKey\s+String\?\s+@unique/)
  assert.match(migration, /ALTER COLUMN "reservationId" DROP NOT NULL/)
  assert.match(migration, /Review_directReviewKey_key/)
})

test('le serveur lie chaque avis au compte connecté et limite les avis directs à deux Guides', () => {
  assert.match(route, /requirePelerin\(\)/)
  assert.match(route, /reviewKey\(access\.actor\.id, guide\.id\)/)
  assert.match(route, /pelerinId: access\.actor\.id/)
  assert.match(route, /directReviewKey: \{ not: null \}/)
  assert.match(route, /usedGuideReviews >= 2/)
  assert.match(route, /TransactionIsolationLevel\.Serializable/)
  assert.match(route, /status: 'PENDING'/)
  assert.match(route, /DIRECT_GUIDE_REVIEW_SUBMITTED/)
  assert.match(route, /REVIEW_SUBMITTED_ADMIN/)
})

test('le lien Guide conserve le retour après connexion ou inscription', () => {
  assert.match(page, /\/avis\/guide\/\$\{guide\.slug\}/)
  for (const path of [
    'src/app/connexion/actions.ts',
    'src/app/connexion/page.tsx',
    'src/app/inscription/page.tsx',
    'src/app/verify-email/page.tsx',
  ]) {
    assert.match(readFileSync(path, 'utf8'), /pathname\.startsWith\('\/avis\/guide\/'\)/)
  }
  assert.match(form, /En attente de validation/)
})

test('seuls les avis Guide approuvés alimentent la fiche du bon Guide', () => {
  assert.match(publicReviews, /guideWhere = \{ status: 'APPROVED'/)
  assert.match(profile, /reviews: \{[\s\S]*where: \{ status: 'APPROVED' \}/)
  assert.match(profile, /guideProfileId: guide\.id, status: 'APPROVED'/)
  assert.match(profileClient, /\/avis\/guide\/\$\{slug\}/)
  assert.match(adminRoute, /reviewerFirstName/)
})

test('les avis Guide directs restent visibles dans Mes avis sans dépendre d’une réservation', () => {
  assert.match(dashboardRoute, /directGuideReviews/)
  assert.match(dashboardRoute, /if \(!review\.reservationId \|\| !review\.reservation\) continue/)
})
