import type {
  HostedCheckoutInput,
  HostedCheckoutResult,
  PaymentProvider,
} from '@/lib/payments/provider'
import { createHash, createHmac, timingSafeEqual } from 'node:crypto'

const REVOLUT_API_BASE_URL = 'https://merchant.revolut.com/api'
const REVOLUT_API_VERSION = '2024-09-01'
const REVOLUT_PENDING_EXPIRY = 'PT31M'
const REVOLUT_REQUEST_TIMEOUT_MS = 15_000
const WEBHOOK_TOLERANCE_MS = 5 * 60 * 1000

export type RevolutPayment = {
  id?: string
  state?: string
  amount?: number
  currency?: string
  created_at?: string
  updated_at?: string
}

export type RevolutOrder = {
  id?: string
  token?: string
  type?: string
  state?: string
  amount?: number
  currency?: string
  capture_mode?: string
  created_at?: string
  updated_at?: string
  checkout_url?: string
  redirect_url?: string
  metadata?: Record<string, unknown>
  merchant_order_data?: {
    reference?: string
    url?: string
  }
  payments?: RevolutPayment[]
}

export class RevolutApiError extends Error {
  constructor(
    message: string,
    readonly status?: number,
    readonly ambiguous = false,
  ) {
    super(message)
  }
}

export function verifyRevolutWebhookSignature(input: {
  rawBody: string
  timestamp: string | null
  signatureHeader: string | null
  signingSecret: string
  now?: number
}): boolean {
  if (!input.timestamp || !/^\d+$/.test(input.timestamp) || !input.signatureHeader) return false
  const timestampMs = Number(input.timestamp)
  if (!Number.isSafeInteger(timestampMs)) return false
  if (Math.abs((input.now ?? Date.now()) - timestampMs) > WEBHOOK_TOLERANCE_MS) return false

  const expectedHex = createHmac('sha256', input.signingSecret)
    .update(`v1.${input.timestamp}.${input.rawBody}`)
    .digest('hex')
  const expected = Buffer.from(expectedHex, 'hex')
  return input.signatureHeader.split(',').some(part => {
    const candidate = part.trim()
    if (!/^v1=[0-9a-fA-F]{64}$/.test(candidate)) return false
    const actual = Buffer.from(candidate.slice(3), 'hex')
    return actual.length === expected.length && timingSafeEqual(actual, expected)
  })
}

export function deterministicRevolutEventId(input: {
  eventType: string
  order: RevolutOrder
  payment?: RevolutPayment | null
}): string {
  const digest = createHash('sha256').update([
    input.eventType,
    input.order.id ?? '',
    input.payment?.id ?? '',
  ].join('|')).digest('hex')
  return `revolut:${digest}`
}

export type RevolutWebhookAction = 'PAID' | 'EXPIRED' | 'IGNORED'

export function classifyRevolutWebhookEvent(
  eventType: string,
  authoritativeOrderState: string | undefined,
): RevolutWebhookAction {
  if (eventType === 'ORDER_COMPLETED' && authoritativeOrderState === 'completed') return 'PAID'
  if (eventType === 'ORDER_CANCELLED' && authoritativeOrderState === 'cancelled') return 'EXPIRED'
  if (eventType === 'ORDER_FAILED' && authoritativeOrderState === 'failed') return 'EXPIRED'
  return 'IGNORED'
}

function revolutSecretKey(): string {
  assertRevolutConfiguration()
  const secretKey = process.env.REVOLUT_MERCHANT_SECRET_KEY
  return secretKey!.trim()
}

export function assertRevolutConfiguration(): void {
  const required = [
    process.env.REVOLUT_MERCHANT_SECRET_KEY,
    process.env.REVOLUT_WEBHOOK_SIGNING_SECRET,
    process.env.NEXT_PUBLIC_REVOLUT_MERCHANT_PUBLIC_KEY,
  ]
  if (required.some(value => !value?.trim())) {
    throw new Error('Processeur de paiement Revolut non configuré')
  }
}

function revolutHeaders(secretKey: string, json = false): HeadersInit {
  return {
    Authorization: `Bearer ${secretKey}`,
    'Revolut-Api-Version': REVOLUT_API_VERSION,
    ...(json ? { 'Content-Type': 'application/json' } : {}),
  }
}

async function parseResponse(response: Response): Promise<unknown> {
  const text = await response.text()
  if (!text) return null
  try {
    return JSON.parse(text)
  } catch {
    throw new RevolutApiError(
      'Réponse Revolut invalide',
      response.status,
      response.ok || response.status >= 500,
    )
  }
}

async function revolutFetch(
  secretKey: string,
  path: string,
  init: RequestInit = {},
  timeoutMs = REVOLUT_REQUEST_TIMEOUT_MS,
): Promise<{ response: Response; data: unknown }> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const response = await fetch(`${REVOLUT_API_BASE_URL}${path}`, {
      ...init,
      headers: {
        ...revolutHeaders(secretKey, Boolean(init.body)),
        ...init.headers,
      },
      cache: 'no-store',
      signal: controller.signal,
    })
    const data = await parseResponse(response)
    return { response, data }
  } catch (error) {
    if (error instanceof RevolutApiError) throw error
    throw new RevolutApiError(
      error instanceof Error ? error.message : 'Requête Revolut impossible',
      undefined,
      true,
    )
  } finally {
    clearTimeout(timeout)
  }
}

function validateOrderIdentity(
  order: RevolutOrder,
  expected: { bookingRef: string; amountCents: number; currency: string },
): RevolutOrder {
  if (!order.id || !order.token || !order.checkout_url) {
    throw new RevolutApiError('Ordre Revolut incomplet')
  }
  if (
    order.type !== 'payment'
    || order.merchant_order_data?.reference !== expected.bookingRef
    || order.amount !== expected.amountCents
    || order.currency !== expected.currency.toUpperCase()
    || order.capture_mode !== 'automatic'
  ) {
    throw new RevolutApiError('Ordre Revolut incohérent')
  }
  return order
}

function asOrder(value: unknown): RevolutOrder {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new RevolutApiError('Ordre Revolut invalide')
  }
  return value as RevolutOrder
}

export async function retrieveRevolutOrder(orderId: string): Promise<RevolutOrder> {
  const secretKey = revolutSecretKey()
  const { response, data } = await revolutFetch(
    secretKey,
    `/orders/${encodeURIComponent(orderId)}`,
  )
  if (!response.ok) {
    throw new RevolutApiError('Impossible de récupérer l’ordre Revolut', response.status)
  }
  return asOrder(data)
}

async function findRevolutOrderByReference(
  secretKey: string,
  bookingRef: string,
): Promise<RevolutOrder | null> {
  const query = new URLSearchParams({
    limit: '100',
    merchant_order_data_reference: bookingRef,
  })
  const { response, data } = await revolutFetch(secretKey, `/orders?${query}`)
  if (!response.ok) {
    throw new RevolutApiError('Impossible de rechercher l’ordre Revolut', response.status)
  }
  const orders = data && typeof data === 'object' && !Array.isArray(data)
    ? (data as { orders?: unknown }).orders
    : undefined
  if (!Array.isArray(orders)) throw new RevolutApiError('Liste d’ordres Revolut invalide')
  const matching = orders.filter(order => (
    order
    && typeof order === 'object'
    && !Array.isArray(order)
    && (order as RevolutOrder).merchant_order_data?.reference === bookingRef
  )) as RevolutOrder[]
  if (matching.length === 0) return null
  if (matching.length > 1) throw new RevolutApiError('Référence Revolut dupliquée')
  const orderId = matching[0]?.id
  if (!orderId) throw new RevolutApiError('Identifiant d’ordre Revolut manquant')

  const { response: detailResponse, data: detailData } = await revolutFetch(
    secretKey,
    `/orders/${encodeURIComponent(orderId)}`,
  )
  if (!detailResponse.ok) {
    throw new RevolutApiError('Impossible de récupérer l’ordre Revolut', detailResponse.status)
  }
  return asOrder(detailData)
}

async function recoverAmbiguousOrder(
  secretKey: string,
  input: HostedCheckoutInput,
): Promise<RevolutOrder | null> {
  const waits = [0, 250, 750]
  for (const waitMs of waits) {
    if (waitMs > 0) await new Promise(resolve => setTimeout(resolve, waitMs))
    try {
      const order = await findRevolutOrderByReference(secretKey, input.bookingRef)
      if (order) return validateOrderIdentity(order, input)
    } catch {
      // Le résultat du POST reste ambigu même si la lecture de réconciliation
      // échoue. Le caller doit préserver le draft jusqu'au webhook terminal.
    }
  }
  return null
}

async function createRevolutHostedCheckout(
  secretKey: string,
  input: HostedCheckoutInput,
): Promise<HostedCheckoutResult> {
  const body = {
    amount: input.amountCents,
    currency: input.currency.toUpperCase(),
    description: input.description,
    capture_mode: 'automatic',
    expire_pending_after: REVOLUT_PENDING_EXPIRY,
    enforce_challenge: 'automatic',
    metadata: { refNumber: input.bookingRef },
    merchant_order_data: {
      reference: input.bookingRef,
      url: input.successUrl,
    },
    redirect_url: input.successUrl,
    line_items: [{
      name: input.productName,
      type: 'service',
      quantity: { value: 1 },
      unit_price_amount: input.amountCents,
      total_amount: input.amountCents,
      external_id: input.bookingRef,
      description: input.description,
      ...(input.imageUrl ? { image_urls: [input.imageUrl] } : {}),
    }],
  }

  let response: Response
  let data: unknown
  try {
    const result = await revolutFetch(secretKey, '/orders', {
      method: 'POST',
      body: JSON.stringify(body),
    })
    response = result.response
    data = result.data
  } catch (error) {
    if (!(error instanceof RevolutApiError) || !error.ambiguous) throw error
    const recovered = await recoverAmbiguousOrder(secretKey, input)
    if (!recovered) throw error
    return {
      provider: 'REVOLUT',
      checkoutId: recovered.id!,
      checkoutUrl: recovered.checkout_url!,
      publicToken: recovered.token!,
    }
  }

  if (!response.ok) {
    if (response.status >= 500) {
      const recovered = await recoverAmbiguousOrder(secretKey, input)
      if (recovered) {
        return {
          provider: 'REVOLUT',
          checkoutId: recovered.id!,
          checkoutUrl: recovered.checkout_url!,
          publicToken: recovered.token!,
        }
      }
    }
    throw new RevolutApiError(
      'Création de l’ordre Revolut refusée',
      response.status,
      response.status >= 500,
    )
  }

  let order: RevolutOrder
  try {
    order = validateOrderIdentity(asOrder(data), input)
  } catch (error) {
    const recovered = await recoverAmbiguousOrder(secretKey, input)
    if (!recovered) {
      throw new RevolutApiError(
        error instanceof Error ? error.message : 'Ordre Revolut invalide',
        response.status,
        true,
      )
    }
    order = recovered
  }
  if (order.state !== 'pending') {
    throw new RevolutApiError('État initial de l’ordre Revolut incohérent')
  }
  return {
    provider: 'REVOLUT',
    checkoutId: order.id!,
    checkoutUrl: order.checkout_url!,
    publicToken: order.token!,
  }
}

async function cancelRevolutOrder(secretKey: string, orderId: string): Promise<void> {
  const { response } = await revolutFetch(
    secretKey,
    `/orders/${encodeURIComponent(orderId)}/cancel`,
    { method: 'POST' },
  )
  if (response.ok) return

  const order = await retrieveRevolutOrder(orderId)
  if (order.state === 'cancelled' || order.state === 'failed') return
  throw new RevolutApiError('Annulation de l’ordre Revolut impossible', response.status)
}

export function revolutPaymentProvider(): PaymentProvider {
  const secretKey = revolutSecretKey()
  return {
    name: 'REVOLUT',
    createHostedCheckout: input => createRevolutHostedCheckout(secretKey, input),
    expireHostedCheckout: orderId => cancelRevolutOrder(secretKey, orderId),
  }
}
