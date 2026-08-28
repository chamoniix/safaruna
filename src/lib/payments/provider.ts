export type PaymentProviderName = 'STRIPE'

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

  throw new Error(`Processeur de paiement non pris en charge: ${configured}`)
}
