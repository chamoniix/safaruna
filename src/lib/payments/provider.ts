export type PaymentProviderName = 'STRIPE' | 'REVOLUT'

export const PAYMENT_EVENT_PROCESSING_LEASE_MS = 5 * 60 * 1000

export type PaymentEventClaimDisposition = 'FINALIZED' | 'IN_FLIGHT' | 'RECLAIM'

export function paymentEventClaimDisposition(input: {
  status: 'PROCESSING' | 'PROCESSED' | 'FAILED' | 'IGNORED'
  processingStartedAt: Date
  now?: Date
}): PaymentEventClaimDisposition {
  if (input.status === 'PROCESSED' || input.status === 'IGNORED') return 'FINALIZED'
  const staleBefore = new Date(
    (input.now ?? new Date()).getTime() - PAYMENT_EVENT_PROCESSING_LEASE_MS,
  )
  if (input.status === 'PROCESSING' && input.processingStartedAt > staleBefore) return 'IN_FLIGHT'
  return 'RECLAIM'
}

export type HostedCheckoutInput = {
  bookingRef: string
  idempotencyKey: string
  amountCents: number
  currency: string
  productName: string
  description: string
  imageUrl?: string
  metadata: Record<string, string>
  successUrl: string
  cancelUrl: string
  customerEmail: string
  expiresAt: Date
}

export type HostedCheckoutResult = {
  provider: PaymentProviderName
  checkoutId: string
  checkoutUrl: string
  publicToken?: string
}

export interface PaymentProvider {
  readonly name: PaymentProviderName
  createHostedCheckout(input: HostedCheckoutInput): Promise<HostedCheckoutResult>
  expireHostedCheckout(checkoutId: string): Promise<void>
}

export async function getActivePaymentProvider(): Promise<PaymentProvider> {
  const configured = (process.env.PAYMENT_PROVIDER || 'STRIPE').trim().toUpperCase()

  if (configured === 'STRIPE') {
    const { stripePaymentProvider } = await import('@/lib/payments/stripe-provider')
    return stripePaymentProvider()
  }

  if (configured === 'REVOLUT') {
    const { revolutPaymentProvider } = await import('@/lib/payments/revolut-provider')
    return revolutPaymentProvider()
  }

  throw new Error(`Processeur de paiement non pris en charge: ${configured}`)
}
