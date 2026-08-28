import Stripe from 'stripe'
import type {
  HostedCheckoutInput,
  HostedCheckoutResult,
  PaymentProvider,
} from '@/lib/payments/provider'

function stripeClient(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY
  if (!secretKey) throw new Error('Processeur de paiement non configuré')
  return new Stripe(secretKey)
}

export function stripePaymentProvider(): PaymentProvider {
  const stripe = stripeClient()

  return {
    name: 'STRIPE',

    async createHostedCheckout(input: HostedCheckoutInput): Promise<HostedCheckoutResult> {
      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        client_reference_id: input.bookingRef,
        line_items: [{
          price_data: {
            currency: input.currency.toLowerCase(),
            product_data: {
              name: input.productName,
              description: input.description,
              ...(input.imageUrl ? { images: [input.imageUrl] } : {}),
            },
            unit_amount: input.amountCents,
          },
          quantity: 1,
        }],
        metadata: input.metadata,
        success_url: input.successUrl,
        cancel_url: input.cancelUrl,
        customer_email: input.customerEmail,
        expires_at: Math.floor(input.expiresAt.getTime() / 1000),
      }, { idempotencyKey: input.idempotencyKey })

      if (!session.url) throw new Error('Le processeur de paiement n’a retourné aucune URL')

      return {
        provider: 'STRIPE',
        checkoutId: session.id,
        checkoutUrl: session.url,
      }
    },

    async expireHostedCheckout(checkoutId: string): Promise<void> {
      await stripe.checkout.sessions.expire(checkoutId)
    },
  }
}
