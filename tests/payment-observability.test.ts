import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const analyticsRoute = readFileSync(
  new URL('../src/app/api/internal/analytics/overview/route.ts', import.meta.url),
  'utf8',
)
const adminReservationsRoute = readFileSync(
  new URL('../src/app/api/admin/reservations/route.ts', import.meta.url),
  'utf8',
)
const analyticsDashboard = readFileSync(
  new URL('../analytics-dashboard/app/page.tsx', import.meta.url),
  'utf8',
)
const adminReferrals = readFileSync(
  new URL('../src/app/admin/(dashboard)/parrainages/page.tsx', import.meta.url),
  'utf8',
)

test('les opérations de paiement lisent le registre provider-neutral existant', () => {
  assert.match(analyticsRoute, /prisma\.paymentAttempt\.findMany/)
  assert.match(analyticsRoute, /prisma\.paymentEvent\.findMany/)
  assert.match(analyticsRoute, /where: \{ status: 'FAILED'/)
  assert.match(analyticsRoute, /prisma\.paymentTransaction\.findMany/)
  assert.match(analyticsRoute, /prisma\.paymentAttempt\.groupBy/)
  assert.match(analyticsRoute, /prisma\.paymentTransaction\.groupBy/)
  assert.match(analyticsRoute, /where: \{ type: 'CHARGE', status: 'SUCCEEDED'/)
})

test('Admin et Superadmin reçoivent le processeur et les références de paiement', () => {
  assert.match(adminReservationsRoute, /paymentAttempts:/)
  assert.match(adminReservationsRoute, /paymentTransactions:/)
  assert.match(adminReservationsRoute, /providerCheckoutId: true/)
  assert.match(adminReservationsRoute, /providerPaymentId: true/)
  assert.match(adminReservationsRoute, /providerTransactionId: true/)
})

test('les libellés opérationnels ne présentent plus Stripe comme processeur unique', () => {
  for (const obsolete of ['Arrivée Stripe', 'Session Stripe', 'webhook Stripe', 'Paiement Stripe']) {
    assert.equal(analyticsDashboard.includes(obsolete), false, obsolete)
    assert.equal(adminReferrals.includes(obsolete), false, obsolete)
  }
  assert.match(analyticsDashboard, /Processeurs de paiement/)
  assert.match(analyticsDashboard, /Incidents de traitement des webhooks/)
})

test('la réponse analytics ne publie pas le metadata brut des incidents de paiement', () => {
  const failedEventSelect = analyticsRoute.slice(
    analyticsRoute.indexOf("prisma.paymentEvent.findMany"),
    analyticsRoute.indexOf("prisma.paymentTransaction.findMany"),
  )
  assert.equal(failedEventSelect.includes('metadata: true'), false)
  assert.equal(failedEventSelect.includes('payload'), false)
})
