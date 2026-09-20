import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { createRequire } from 'node:module'
import { runInNewContext } from 'node:vm'
import ts from 'typescript'
import * as React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

const detailPage = readFileSync('src/app/espace/(dashboard)/reservations/[id]/page.tsx', 'utf8')
const detailNotFound = readFileSync('src/app/espace/(dashboard)/reservations/[id]/not-found.tsx', 'utf8')
const reservationsPage = readFileSync('src/app/espace/(dashboard)/reservations/page.tsx', 'utf8')
const legacyConfirmation = readFileSync('src/app/espace/confirmation/[id]/page.tsx', 'utf8')
const confirmationPage = readFileSync('src/app/espace/checkout/[slug]/confirmation/page.tsx', 'utf8')
const dashboardPage = readFileSync('src/app/espace/(dashboard)/tableau-de-bord/page.tsx', 'utf8')

// Compile the real components with isolated data; never access a database or payment provider.
function isolatedComponent(source: string, mocks: Record<string, unknown>) {
  const require = createRequire(import.meta.url)
  const exports: { default?: React.ComponentType | ((props: { params: Promise<{ id: string }> }) => Promise<React.ReactNode>) } = {}
  runInNewContext(ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText, {
    exports,
    require: (id: string) => {
      if (id in mocks) return mocks[id]
      if (['react', 'react/jsx-runtime', 'lucide-react'].includes(id)) return require(id)
      throw new Error(`Unexpected test dependency: ${id}`)
    },
  })
  return exports.default!
}

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

test('le détail conserve la réservation confirmée sans exposer les validations internes des missions', async () => {
  assert.doesNotMatch(detailPage, /guideConfirmationStatus|Validation du Guide/)
  const date = new Date('2026-10-01T00:00:00Z')
  const profile = { slug: 'isolated-guide', guideAccount: { displayName: 'Guide de test', firstName: null, lastName: null } }
  for (const internalStatus of ['PENDING', 'CONFIRMED', 'DECLINED', 'NO_RESPONSE']) {
    const Component = isolatedComponent(detailPage, {
      'next/link': { __esModule: true, default: 'a' },
      'next/navigation': { notFound: () => { throw new Error('Unexpected not found') }, redirect: () => { throw new Error('Unexpected redirect') } },
      '@/lib/require-account': { requirePelerin: async () => ({ ok: true, actor: { id: 'isolated-pelerin' } }) },
      '@/lib/guide-workflow': { missionDurationDays: () => 1 },
      '@/lib/places': { PLACES: [{ key: 'isolated-place', nameFr: 'Lieu de test' }] },
      '@/lib/prisma': { __esModule: true, default: { reservation: { findFirst: async (query: { where: { id: string; pelerinId: string }; select: { missions: { select: Record<string, unknown> } } }) => {
        assert.equal(query.where.id, 'isolated-reservation')
        assert.equal(query.where.pelerinId, 'isolated-pelerin')
        assert.equal('guideConfirmationStatus' in query.select.missions.select, false)
        return {
          id: 'isolated-reservation', refNumber: 'SAF-ISOLATED', status: 'CONFIRMED', createdAt: date,
          startDate: date, endDate: date, nbPeople: 2, totalPrice: 130, langue: 'fr',
          guideProfile: profile, package: { name: 'Accompagnement test' }, optionsJson: {}, pricingJson: {},
          paymentAttempts: [{ provider: 'REVOLUT', amountCents: 13000, currency: 'EUR', paidAt: date }],
          missions: [{ id: 'isolated-mission', city: 'MAKKAH', startDate: date, endDate: date,
            selectedPlaces: ['isolated-place'], localTransport: 'TAXI', localTransportDays: 1,
            guideProfile: profile, guideConfirmationStatus: internalStatus }],
        }
      } } } },
    }) as (props: { params: Promise<{ id: string }> }) => Promise<React.ReactNode>
    const html = renderToStaticMarkup(await Component({ params: Promise.resolve({ id: 'isolated-reservation' }) }))
    assert.doesNotMatch(html, /Validation du Guide|Sans réponse|Refusée|En attente/)
    for (const text of ['Confirmée', 'SAF-ISOLATED', 'Guide de test', 'Lieu de test', 'Taxi public', 'Payé et enregistré']) {
      assert.ok(html.includes(text), text)
    }
  }
})

test('la nouvelle phrase de succès reste réservée à une confirmation serveur vérifiée', () => {
  for (const validReturn of [true, false]) {
    for (const state of ['pending', 'confirmed', 'failed', 'delayed']) {
      const Component = isolatedComponent(confirmationPage, {
        react: { ...React, useEffect: () => {}, useState: () => [{ refNumber: 'SAF-ISOLATED', state }, () => {}] },
        'next/navigation': { useSearchParams: () => new URLSearchParams(validReturn ? 'ref=SAF-ISOLATED&payment=success' : 'ref=SAF-ISOLATED') },
        'next/link': { __esModule: true, default: 'a' },
      }) as React.ComponentType
      const html = renderToStaticMarkup(React.createElement(Component))
      assert.equal(html.includes('Votre réservation est confirmée.'), validReturn && state === 'confirmed')
      assert.doesNotMatch(html, /Votre demande de réservation a bien été enregistrée/)
      if (validReturn && state === 'confirmed') assert.ok(html.includes('Vous recevrez un email avec les détails de votre voyage.'))
    }
  }
  assert.match(confirmationPage, /fetch\(`\/api\/espace\/reservations\?ref=/)
  assert.match(confirmationPage, /verification\?\.refNumber !== ref/)
})

test('le titre du dashboard ne promet pas une validation du guide et conserve le statut réel', () => {
  for (const status of ['PENDING', 'CONFIRMED']) {
    let cursor = 0
    const states = [{
      user: { name: 'Pèlerin test', firstName: 'Test' }, stats: { totalReservations: 1 },
      recentReservations: [{ id: 'isolated-reservation', refNumber: 'SAF-ISOLATED', status, guideName: 'Guide de test', totalPrice: 130 }],
      notifications: [], unreadNotifications: 0,
    }, false, '']
    const Component = isolatedComponent(dashboardPage, {
      react: { ...React, useEffect: () => {}, useState: () => [states[cursor++], () => {}] },
      'next-auth/react': { useSession: () => ({ data: null }) },
      'next/link': { __esModule: true, default: 'a' },
    }) as React.ComponentType
    const html = renderToStaticMarkup(React.createElement(Component))
    assert.doesNotMatch(html, /En attente de confirmation/)
    assert.ok(html.includes(status === 'PENDING' ? 'Votre réservation' : 'Prochain voyage'))
    assert.ok(html.includes(status === 'PENDING' ? 'En attente' : 'Confirmée'))
  }
})
