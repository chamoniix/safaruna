import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import test from 'node:test'

const settingsPage = readFileSync('src/app/espace/(dashboard)/parametres/page.tsx', 'utf8')
const exportRoute = readFileSync('src/app/api/espace/export/route.ts', 'utf8')

test('les paramètres chargent et enregistrent les vraies données du profil Pèlerin', () => {
  assert.match(settingsPage, /fetch\('\/api\/espace\/profil'\)/)
  assert.match(settingsPage, /fetch\('\/api\/espace\/profil',\s*\{[\s\S]*method: 'PATCH'/)
  assert.match(settingsPage, /body: JSON\.stringify\(\{ phoneWhatsapp:/)
  assert.doesNotMatch(settingsPage, /karim\.lamrani@example\.com/)
  assert.doesNotMatch(settingsPage, /\+33 6 12 34 56 78/)
})

test('l’email reste en lecture seule et le mot de passe utilise le workflow existant', () => {
  assert.match(settingsPage, /La modification de l’adresse de connexion n’est pas encore disponible\./)
  assert.match(settingsPage, /href="\/mot-de-passe-oublie"/)
  assert.doesNotMatch(settingsPage, />Modifier<\/button>/)
})

test('l’export est authentifié, limité à actor.id et construit avec des sélections explicites', () => {
  assert.match(exportRoute, /requirePelerin\(\)/)
  assert.match(exportRoute, /const userId = access\.actor\.id/)
  assert.match(exportRoute, /where: \{ pelerinId: userId \}/)
  assert.match(exportRoute, /where: \{ userId \}/)
  assert.match(exportRoute, /prisma\.pelerinDashboardState\.findUnique/)
  assert.match(exportRoute, /select: \{/)
  assert.match(exportRoute, /Content-Disposition/)
  assert.doesNotMatch(exportRoute, /passwordHash\s*:/)
  assert.doesNotMatch(exportRoute, /sessionToken\s*:/)
  assert.doesNotMatch(exportRoute, /access_token\s*:/)
  assert.doesNotMatch(exportRoute, /refresh_token\s*:/)
  assert.doesNotMatch(exportRoute, /stripePaymentId\s*:/)
  assert.doesNotMatch(exportRoute, /providerPaymentId\s*:/)
  assert.doesNotMatch(exportRoute, /moderatedByEmail\s*:/)
  assert.doesNotMatch(exportRoute, /referrer\s*:/)
})

test('le téléchargement affiche ses états de chargement et d’erreur', () => {
  assert.match(settingsPage, /fetch\('\/api\/espace\/export'\)/)
  assert.match(settingsPage, /setExporting\(true\)/)
  assert.match(settingsPage, /setExportError/)
  assert.match(settingsPage, /URL\.createObjectURL/)
})

test('le Guide Omra conserve son URL dans le layout du dashboard Pèlerin', () => {
  assert.equal(existsSync('src/app/espace/(dashboard)/guide-omra/page.tsx'), true)
  assert.equal(existsSync('src/app/espace/guide-omra/page.tsx'), false)
})
