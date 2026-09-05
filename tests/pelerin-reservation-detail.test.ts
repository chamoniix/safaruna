import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const detailPage = readFileSync('src/app/espace/(dashboard)/reservations/[id]/page.tsx', 'utf8')
const detailNotFound = readFileSync('src/app/espace/(dashboard)/reservations/[id]/not-found.tsx', 'utf8')
const reservationsPage = readFileSync('src/app/espace/(dashboard)/reservations/page.tsx', 'utf8')
const legacyConfirmation = readFileSync('src/app/espace/confirmation/[id]/page.tsx', 'utf8')

test('la confirmation héritée ne peut plus afficher de faux succès', () => {
  assert.match(legacyConfirmation, /redirect\('\/espace\/reservations'\)/)
  assert.doesNotMatch(legacyConfirmation, /Réservation confirmée|Rachid Al-Madani|450€/)
})

test('le détail est limité à la réservation du Pèlerin authentifié', () => {
  assert.match(detailPage, /params: Promise<\{ id: string \}>/)
  assert.match(detailPage, /requirePelerin\(\)/)
  assert.match(detailPage, /where: \{ id, pelerinId: access\.actor\.id \}/)
  assert.match(detailPage, /if \(!reservation\) notFound\(\)/)
  assert.doesNotMatch(detailPage, /findUnique\(\{\s*where: \{ id \}/)
})

test('le détail ne rend pas les données financières internes', () => {
  assert.doesNotMatch(detailPage, /commissionAmount: true/)
  assert.doesNotMatch(detailPage, /guideEarnings: true/)
  assert.doesNotMatch(detailPage, /notes: true/)
  assert.doesNotMatch(detailPage, /providerPaymentId: true/)
})

test('la page reste dans le layout Pèlerin et possède une erreur locale', () => {
  assert.doesNotMatch(detailPage, /<Navbar|<Footer/)
  assert.match(detailNotFound, /Retour à mes réservations/)
  assert.doesNotMatch(detailNotFound, /<Navbar|<Footer/)
})

test('chaque réservation réelle ouvre son détail', () => {
  assert.match(reservationsPage, /href=\{`\/espace\/reservations\/\$\{r\.id\}`\}/)
  assert.match(reservationsPage, /Voir le détail/)
})
