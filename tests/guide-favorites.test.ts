import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const schema = readFileSync('prisma/schema.prisma', 'utf8')
const migration = readFileSync('prisma/migrations/20260904190000_guide_favorites/migration.sql', 'utf8')
const route = readFileSync('src/app/api/espace/favorites/route.ts', 'utf8')
const favoritesPage = readFileSync('src/app/espace/(dashboard)/favoris/page.tsx', 'utf8')
const guidesPage = readFileSync('src/app/guides/page.tsx', 'utf8')
const guideProfile = readFileSync('src/app/guides/[slug]/GuideProfileClient.tsx', 'utf8')
const analytics = readFileSync('src/lib/analytics.ts', 'utf8')
const loginPage = readFileSync('src/app/connexion/page.tsx', 'utf8')
const signupPage = readFileSync('src/app/inscription/page.tsx', 'utf8')
const signupActions = readFileSync('src/app/connexion/actions.ts', 'utf8')
const verifyPage = readFileSync('src/app/verify-email/page.tsx', 'utf8')

test('les favoris sont uniques et supprimés avec le Pèlerin ou le Guide', () => {
  assert.match(schema, /model GuideFavorite[\s\S]*userId\s+String[\s\S]*guideProfileId\s+String/)
  assert.match(schema, /@@unique\(\[userId, guideProfileId\]\)/)
  assert.match(schema, /user\s+User\s+@relation\(fields: \[userId\], references: \[id\], onDelete: Cascade\)/)
  assert.match(schema, /guideProfile\s+GuideProfile\s+@relation\(fields: \[guideProfileId\], references: \[id\], onDelete: Cascade\)/)
  assert.match(migration, /CREATE UNIQUE INDEX "GuideFavorite_userId_guideProfileId_key"/)
})

test('l’API Favoris utilise uniquement le compte Pèlerin authentifié', () => {
  assert.match(route, /requirePelerin\(\)/)
  assert.match(route, /userId: access\.actor\.id/)
  assert.doesNotMatch(route, /userId:\s*parsed\.data/)
  assert.match(route, /origin === req\.nextUrl\.origin/)
  assert.match(route, /private, no-store, max-age=0/)
  assert.match(route, /createMany\([\s\S]*skipDuplicates: true/)
})

test('les profils en pause restent dans les favoris, les profils suspendus sont masqués', () => {
  assert.match(route, /guideProfile: \{ status: 'ACTIVE'[\s\S]{0,160}guideAccount: \{ is: \{ status: 'ACTIVE' \} \}/)
  assert.match(route, /bookable: guide\.acceptingBookings && \(guide\.servesMakkah \|\| guide\.servesMadinah\)/)
  assert.doesNotMatch(route, /guideProfile: \{ status: 'ACTIVE'[\s\S]{0,160}acceptingBookings: true/)
  assert.match(favoritesPage, /Temporairement indisponible/)
})

test('le dashboard et les pages Guide utilisent l’API réelle sans localStorage', () => {
  assert.match(favoritesPage, /fetch\('\/api\/espace\/favorites'/)
  assert.doesNotMatch(favoritesPage, /localStorage/)
  assert.match(guidesPage, /aria-pressed=\{active\}/)
  assert.match(guidesPage, /method: favorite \? 'DELETE' : 'POST'/)
  assert.match(guideProfile, /method: favorite \? 'DELETE' : 'POST'/)
})

test('un clic invité revient vers le même Guide et enregistre le favori après connexion', () => {
  for (const source of [loginPage, signupPage, signupActions, verifyPage]) {
    assert.match(source, /url\.pathname !== '\/guides'/)
    assert.match(source, /!url\.pathname\.startsWith\('\/guides\/'\)/)
  }
  assert.match(guidesPage, /params\.set\('favorite', slug\)/)
  assert.match(guideProfile, /params\.set\('favorite', slug\)/)
  assert.match(guidesPage, /if \(favoriteIntent && \/\^\[a-z0-9\]/)
  assert.match(guideProfile, /if \(favoriteIntent === slug\)/)
})

test('les ajouts et retraits alimentent les analytics internes', () => {
  assert.match(analytics, /'guide_favorite_added'/)
  assert.match(analytics, /'guide_favorite_removed'/)
  assert.match(route, /eventName: 'guide_favorite_added'/)
  assert.match(route, /eventName: 'guide_favorite_removed'/)
})
