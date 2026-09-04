import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const formation = readFileSync('src/app/guide/(dashboard)/formation/page.tsx', 'utf8')
const documents = readFileSync('src/app/guide/(dashboard)/documents/page.tsx', 'utf8')
const performances = readFileSync('src/app/guide/(dashboard)/performances/page.tsx', 'utf8')
const performancesRoute = readFileSync('src/app/api/guide/performances/route.ts', 'utf8')

test('Formation SAFARUMA annonce le contenu à venir sans réafficher le guide Omra', () => {
  assert.match(formation, /Bientôt disponible/)
  assert.match(formation, /informations essentielles remontées du terrain/)
  assert.doesNotMatch(formation, /OMRA_RITES|Les rites de la Omra/)
})

test('Mes documents affiche uniquement les trois documents prévus et aucune action fictive', () => {
  assert.match(documents, /title: 'RIB'/)
  assert.match(documents, /title: 'Passeport'/)
  assert.match(documents, /title: 'Permis de conduire'/)
  assert.match(documents, /data-disabled="true"/)
  assert.doesNotMatch(documents, /Visa Omra|Réservation hôtel|Taxi privé|WhatsApp/)
})

test('Performances utilise le chargement centré du dashboard Guide', () => {
  assert.match(performances, /aria-label="Chargement des performances"/)
  assert.match(performances, /guide-route-loading__spinner/)
})

test('les performances sont protégées et excluent tous les revenus annulés', () => {
  assert.match(performancesRoute, /requireGuide\(\)/)
  assert.equal(performancesRoute.match(/status: \{ not: 'CANCELLED' \}/g)?.length, 2)
})
