import assert from 'node:assert/strict'
import { createHmac } from 'node:crypto'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import {
  classifyRevolutWebhookEvent,
  deterministicRevolutEventId,
  RevolutApiError,
  revolutPaymentProvider,
  verifyRevolutWebhookSignature,
  type RevolutOrder,
} from '../src/lib/payments/revolut-provider'
import {
  getActivePaymentProvider,
  paymentEventClaimDisposition,
} from '../src/lib/payments/provider'

const originalSecret = process.env.REVOLUT_MERCHANT_SECRET_KEY
const originalWebhookSecret = process.env.REVOLUT_WEBHOOK_SIGNING_SECRET
const originalPublicKey = process.env.NEXT_PUBLIC_REVOLUT_MERCHANT_PUBLIC_KEY
const originalPaymentProvider = process.env.PAYMENT_PROVIDER
const originalFetch = globalThis.fetch

function configureRevolut() {
  process.env.REVOLUT_MERCHANT_SECRET_KEY = 'sk_test'
  process.env.REVOLUT_WEBHOOK_SIGNING_SECRET = 'wsk_test'
  process.env.NEXT_PUBLIC_REVOLUT_MERCHANT_PUBLIC_KEY = 'pk_test'
}

function checkoutInput() {
  return {
    bookingRef: 'SAF-TEST-001',
    idempotencyKey: 'checkout:SAF-TEST-001',
    amountCents: 13_000,
    currency: 'EUR',
    productName: 'SAFARUMA — Accompagnement',
    description: 'Accompagnement · Makkah · 2 personne(s)',
    imageUrl: 'https://safaruma.com/og-image.jpg',
    metadata: {
      refNumber: 'SAF-TEST-001',
      pelerinId: 'user-1',
      pelerinEmail: 'pelerin@example.com',
    },
    successUrl: 'https://safaruma.com/espace/checkout/guide/confirmation?ref=SAF-TEST-001',
    cancelUrl: 'https://safaruma.com/espace/checkout/guide?cancelled=1',
    customerEmail: 'pelerin@example.com',
    expiresAt: new Date('2026-09-02T12:31:00.000Z'),
  }
}

function order(overrides: Partial<RevolutOrder> = {}): RevolutOrder {
  return {
    id: '6634c172-3398-ac93-aee9-50de0282e3ac',
    token: 'public-order-token',
    type: 'payment',
    state: 'pending',
    amount: 13_000,
    currency: 'EUR',
    capture_mode: 'automatic',
    created_at: '2026-09-02T12:00:00.000Z',
    updated_at: '2026-09-02T12:00:00.000Z',
    checkout_url: 'https://checkout.revolut.com/payment-link/public-order-token',
    merchant_order_data: {
      reference: 'SAF-TEST-001',
      url: 'https://safaruma.com/espace/checkout/guide/confirmation?ref=SAF-TEST-001',
    },
    metadata: {
      refNumber: 'SAF-TEST-001',
      pelerinId: 'user-1',
      pelerinEmail: 'pelerin@example.com',
    },
    ...overrides,
  }
}

test.afterEach(() => {
  globalThis.fetch = originalFetch
  if (originalSecret === undefined) delete process.env.REVOLUT_MERCHANT_SECRET_KEY
  else process.env.REVOLUT_MERCHANT_SECRET_KEY = originalSecret
  if (originalWebhookSecret === undefined) delete process.env.REVOLUT_WEBHOOK_SIGNING_SECRET
  else process.env.REVOLUT_WEBHOOK_SIGNING_SECRET = originalWebhookSecret
  if (originalPublicKey === undefined) delete process.env.NEXT_PUBLIC_REVOLUT_MERCHANT_PUBLIC_KEY
  else process.env.NEXT_PUBLIC_REVOLUT_MERCHANT_PUBLIC_KEY = originalPublicKey
  if (originalPaymentProvider === undefined) delete process.env.PAYMENT_PROVIDER
  else process.env.PAYMENT_PROVIDER = originalPaymentProvider
})

test('crée un ordre Revolut automatique avec un line_item de service et sans industry_data', async () => {
  configureRevolut()
  let requestBody: Record<string, unknown> = {}
  globalThis.fetch = async (_input, init) => {
    requestBody = JSON.parse(String(init?.body)) as Record<string, unknown>
    return new Response(JSON.stringify(order()), {
      status: 201,
      headers: { 'content-type': 'application/json' },
    })
  }

  const result = await revolutPaymentProvider().createHostedCheckout(checkoutInput())

  assert.equal(result.provider, 'REVOLUT')
  assert.equal(result.checkoutId, order().id)
  assert.equal(result.publicToken, order().token)
  assert.equal(requestBody.capture_mode, 'automatic')
  assert.equal(requestBody.expire_pending_after, 'PT31M')
  assert.equal('industry_data' in requestBody, false)
  assert.equal('customer' in requestBody, false)
  assert.deepEqual(requestBody.metadata, { refNumber: 'SAF-TEST-001' })
  const serializedBody = JSON.stringify(requestBody)
  for (const forbidden of ['pelerin@example.com', 'user-1', 'promoCodeId', 'analyticsSessionHash']) {
    assert.equal(serializedBody.includes(forbidden), false, forbidden)
  }
  assert.deepEqual(requestBody.line_items, [{
    name: 'SAFARUMA — Accompagnement',
    type: 'service',
    quantity: { value: 1 },
    unit_price_amount: 13_000,
    total_amount: 13_000,
    external_id: 'SAF-TEST-001',
    description: 'Accompagnement · Makkah · 2 personne(s)',
    image_urls: ['https://safaruma.com/og-image.jpg'],
  }])
})

test('récupère par référence un ordre créé malgré un timeout sans refaire de POST', async () => {
  configureRevolut()
  const methods: string[] = []
  globalThis.fetch = async (input, init) => {
    methods.push(init?.method ?? 'GET')
    const url = String(input)
    if (init?.method === 'POST') throw new TypeError('network timeout')
    if (url.includes('merchant_order_data_reference=')) {
      return new Response(JSON.stringify({ orders: [order()] }), { status: 200 })
    }
    return new Response(JSON.stringify(order()), { status: 200 })
  }

  const result = await revolutPaymentProvider().createHostedCheckout(checkoutInput())

  assert.equal(result.checkoutId, order().id)
  assert.deepEqual(methods, ['POST', 'GET', 'GET'])
})

test('réconcilie aussi un ordre si Revolut renvoie un body invalide avec un statut 5xx', async () => {
  configureRevolut()
  const methods: string[] = []
  globalThis.fetch = async (input, init) => {
    methods.push(init?.method ?? 'GET')
    const url = String(input)
    if (init?.method === 'POST') return new Response('<upstream error>', { status: 502 })
    if (url.includes('merchant_order_data_reference=')) {
      return new Response(JSON.stringify({ orders: [order()] }), { status: 200 })
    }
    return new Response(JSON.stringify(order()), { status: 200 })
  }

  const result = await revolutPaymentProvider().createHostedCheckout(checkoutInput())

  assert.equal(result.checkoutId, order().id)
  assert.deepEqual(methods, ['POST', 'GET', 'GET'])
})

test('conserve un statut ambigu si un 5xx valide ne peut pas encore être réconcilié', async () => {
  configureRevolut()
  globalThis.fetch = async (_input, init) => {
    if (init?.method === 'POST') {
      return new Response(JSON.stringify({ code: 'upstream_unavailable' }), { status: 503 })
    }
    return new Response(JSON.stringify({ orders: [] }), { status: 200 })
  }

  await assert.rejects(
    revolutPaymentProvider().createHostedCheckout(checkoutInput()),
    error => error instanceof RevolutApiError && error.status === 503 && error.ambiguous,
  )
})

test('annule explicitement un ordre orphelin', async () => {
  configureRevolut()
  let requestedUrl = ''
  globalThis.fetch = async (input, init) => {
    requestedUrl = String(input)
    assert.equal(init?.method, 'POST')
    return new Response(JSON.stringify(order({ state: 'cancelled' })), { status: 200 })
  }

  await revolutPaymentProvider().expireHostedCheckout(order().id!)
  assert.match(requestedUrl, new RegExp(`/orders/${order().id}/cancel$`))
})

test('vérifie une des signatures v1 avec comparaison constante et refuse le rejeu', () => {
  const signingSecret = 'wsk_test'
  const rawBody = '{"event":"ORDER_COMPLETED","order_id":"6634c172-3398-ac93-aee9-50de0282e3ac"}'
  const now = Date.parse('2026-09-02T12:00:00.000Z')
  const timestamp = String(now)
  const valid = createHmac('sha256', signingSecret)
    .update(`v1.${timestamp}.${rawBody}`)
    .digest('hex')

  assert.equal(verifyRevolutWebhookSignature({
    rawBody,
    timestamp,
    signatureHeader: `v1=${'0'.repeat(64)},v1=${valid}`,
    signingSecret,
    now,
  }), true)
  assert.equal(verifyRevolutWebhookSignature({
    rawBody,
    timestamp,
    signatureHeader: `v1=${valid}`,
    signingSecret,
    now: now + 5 * 60 * 1000 + 1,
  }), false)
})

test('produit une idempotence stable et distingue deux tentatives de paiement', () => {
  const completedOrder = order({
    state: 'completed',
    updated_at: '2026-09-02T12:05:00.000Z',
  })
  const paymentOne = {
    id: 'payment-1',
    state: 'completed',
    updated_at: '2026-09-02T12:05:00.000Z',
  }
  const paymentTwo = { ...paymentOne, id: 'payment-2' }
  const first = deterministicRevolutEventId({
    eventType: 'ORDER_COMPLETED',
    order: completedOrder,
    payment: paymentOne,
  })
  const duplicate = deterministicRevolutEventId({
    eventType: 'ORDER_COMPLETED',
    order: completedOrder,
    payment: paymentOne,
  })
  const otherAttempt = deterministicRevolutEventId({
    eventType: 'ORDER_COMPLETED',
    order: completedOrder,
    payment: paymentTwo,
  })

  assert.equal(first, duplicate)
  assert.notEqual(first, otherAttempt)
})

test('seul ORDER_COMPLETED confirme et les échecs de tentative restent non terminaux', () => {
  assert.equal(classifyRevolutWebhookEvent('ORDER_COMPLETED', 'completed'), 'PAID')
  assert.equal(classifyRevolutWebhookEvent('ORDER_COMPLETED', 'processing'), 'IGNORED')
  assert.equal(classifyRevolutWebhookEvent('ORDER_CANCELLED', 'cancelled'), 'EXPIRED')
  assert.equal(classifyRevolutWebhookEvent('ORDER_FAILED', 'failed'), 'EXPIRED')
  assert.equal(classifyRevolutWebhookEvent('ORDER_PAYMENT_DECLINED', 'pending'), 'IGNORED')
  assert.equal(classifyRevolutWebhookEvent('ORDER_PAYMENT_FAILED', 'pending'), 'IGNORED')
  assert.equal(classifyRevolutWebhookEvent('ORDER_FAILED', 'completed'), 'IGNORED')
})

test('préserve le draft si l’annulation provider n’est pas confirmée', () => {
  const source = readFileSync('src/lib/payments/create-session.ts', 'utf8')
  const preservationBranch = source.slice(
    source.indexOf('if (!cleanupConfirmed)'),
    source.indexOf('await prisma.$transaction([', source.indexOf('if (!cleanupConfirmed)')),
  )
  assert.match(preservationBranch, /PAYMENT_PROVIDER_OUTCOME_UNKNOWN/)
  assert.match(preservationBranch, /payment-checkout-reconciliation/)
  assert.doesNotMatch(preservationBranch, /reservationDraft\.deleteMany/)
  assert.doesNotMatch(preservationBranch, /promoCode\.updateMany/)
})

test('refuse la configuration Revolut partielle avant toute requête API', async () => {
  let fetchCalled = false
  globalThis.fetch = async () => {
    fetchCalled = true
    throw new Error('fetch ne doit pas être appelé')
  }
  process.env.PAYMENT_PROVIDER = 'REVOLUT'
  process.env.REVOLUT_MERCHANT_SECRET_KEY = 'sk_test'
  process.env.REVOLUT_WEBHOOK_SIGNING_SECRET = 'wsk_test'
  delete process.env.NEXT_PUBLIC_REVOLUT_MERCHANT_PUBLIC_KEY

  await assert.rejects(getActivePaymentProvider(), /non configuré/)
  assert.equal(fetchCalled, false)
})

test('distingue un événement finalisé d’un événement concurrent encore en vol', () => {
  const now = new Date('2026-09-02T12:05:00.000Z')
  assert.equal(paymentEventClaimDisposition({
    status: 'PROCESSED',
    processingStartedAt: now,
    now,
  }), 'FINALIZED')
  assert.equal(paymentEventClaimDisposition({
    status: 'PROCESSING',
    processingStartedAt: new Date('2026-09-02T12:04:30.000Z'),
    now,
  }), 'IN_FLIGHT')
  assert.equal(paymentEventClaimDisposition({
    status: 'PROCESSING',
    processingStartedAt: new Date('2026-09-02T11:59:00.000Z'),
    now,
  }), 'RECLAIM')
  const processSource = readFileSync('src/lib/payments/process-event.ts', 'utf8')
  assert.match(processSource, /class PaymentEventInFlightError extends PaymentProcessingError/)
  assert.match(processSource, /super\('Événement de paiement déjà en cours de traitement', 503\)/)
})

test('les deux webhooks rendent in-flight retryable avant le ledger rejected', () => {
  for (const path of [
    'src/app/api/revolut/webhook/route.ts',
    'src/app/api/stripe/webhook/route.ts',
  ]) {
    const source = readFileSync(path, 'utf8')
    const inFlightBranch = source.indexOf('error instanceof PaymentEventInFlightError')
    const rejectedLedger = source.indexOf('await recordRejectedPaymentEvent', inFlightBranch)
    assert.ok(inFlightBranch >= 0, path)
    assert.ok(rejectedLedger > inFlightBranch, path)
    assert.match(source.slice(inFlightBranch, rejectedLedger), /status: 503/)
  }
})

test('le webhook Revolut dérive le pèlerin du draft puis de la réservation pour les replays', () => {
  const source = readFileSync('src/app/api/revolut/webhook/route.ts', 'utf8')
  const resolver = source.slice(
    source.indexOf('async function resolvePaymentCustomerContext'),
    source.indexOf('export async function POST'),
  )
  assert.match(resolver, /prisma\.reservationDraft\.findUnique/)
  assert.match(resolver, /prisma\.reservation\.findUnique/)
  assert.match(resolver, /analyticsSessionHash/)
})
