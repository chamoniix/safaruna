import { WhopClient, WhopEnvironment } from '@whop/sdk'
import type {
  HostedCheckoutInput,
  HostedCheckoutResult,
  PaymentProvider,
} from '@/lib/payments/provider'

// Closing a link is not proof that a payment already in progress was canceled.
// Keep its configuration and reservation hold until Whop reports a final state.
export async function closeWhopCheckout(
  client: WhopClient,
  checkoutId: string,
  bookingRef?: string,
  options: { abortSignal?: AbortSignal } = {},
): Promise<{ closed: boolean; paidPaymentId?: string }> {
  const request = { timeoutInSeconds: 5, maxRetries: 0, ...options }
  const checkout = await client.checkoutConfigurations.retrieve({ id: checkoutId }, request)
  if (!checkout.variant?.id || (bookingRef && checkout.metadata?.refNumber !== bookingRef)) {
    throw new Error('Configuration Whop incohérente')
  }
  await client.variants.update({ id: checkout.variant.id, stock: 0, unlimited_stock: false }, {
    ...request,
    idempotencyKey: `close-checkout:${checkoutId}`,
  })

  let unresolved = false
  const payments = await client.payments.list({ variant_id: checkout.variant.id, first: 100 }, request)
  for await (const payment of payments) {
    if (payment.checkout_configuration_id !== checkoutId) continue
    let state = await client.payments.retrieveStatus({ payment_id: payment.id }, request)
    if (state.status === 'succeeded') return { closed: false, paidPaymentId: payment.id }
    if (state.status !== 'canceled' && payment.voidable) {
      await client.payments.void({ id: payment.id }, { ...request, idempotencyKey: `close-payment:${payment.id}` })
      state = await client.payments.retrieveStatus({ payment_id: payment.id }, request)
      if (state.status === 'succeeded') return { closed: false, paidPaymentId: payment.id }
    }
    if (state.status !== 'canceled') unresolved = true
  }
  return { closed: !unresolved }
}

export async function reconcileExpiredWhopCheckouts() {
  const { default: prisma } = await import('@/lib/prisma')
  const { processExpiredCheckout, processPaidCheckout } = await import('@/lib/payments/process-event')
  const attempts = await prisma.paymentAttempt.findMany({
    where: {
      provider: 'WHOP', status: { in: ['CREATED', 'PENDING'] },
      providerCheckoutId: { not: null }, checkoutExpiresAt: { lte: new Date() },
    },
    orderBy: [{ updatedAt: 'asc' }, { id: 'asc' }], take: 20,
  })
  if (!attempts.length) return { checked: 0, expired: 0, paid: 0, pending: 0 }
  const client = getWhopClient()
  const abortSignal = AbortSignal.timeout(15_000)
  const result = { checked: attempts.length, expired: 0, paid: 0, pending: 0 }
  for (const attempt of attempts) {
    if (abortSignal.aborted) break
    const checkoutId = attempt.providerCheckoutId!
    try {
      // Rotate retries: an unsettled batch must not starve later expirations.
      const checking = await prisma.paymentAttempt.updateMany({
        where: { id: attempt.id, status: { in: ['CREATED', 'PENDING'] } },
        data: { updatedAt: new Date() },
      })
      if (!checking.count) continue
      const closed = await closeWhopCheckout(client, checkoutId, attempt.bookingRef, { abortSignal })
      if (closed.paidPaymentId) {
        const payment = await client.payments.retrieve({ id: closed.paidPaymentId }, { abortSignal, timeoutInSeconds: 5, maxRetries: 0 })
        const metadata = payment.metadata
        const amount = payment.total?.amount
        const currency = payment.total?.currency
        if (payment.status !== 'paid' || payment.checkout_configuration_id !== checkoutId
          || metadata?.refNumber !== attempt.bookingRef || typeof metadata.pelerinId !== 'string'
          || typeof metadata.pelerinEmail !== 'string' || !amount || !currency
          || !/^\d+(?:\.\d{1,2})?$/.test(amount)
          || Math.round(Number(amount) * 100) !== attempt.amountCents
          || currency.toUpperCase() !== attempt.currency.toUpperCase()) {
          throw new Error('Paiement Whop incohérent pendant la vérification')
        }
        const occurredAt = new Date(payment.paid_at || payment.created_at)
        if (Number.isNaN(occurredAt.getTime())) throw new Error('Date de paiement Whop invalide')
        const paid = await processPaidCheckout({
          provider: 'WHOP', providerEventId: `reconcile-paid:${payment.id}`,
          providerEventType: 'payment.succeeded', providerCheckoutId: checkoutId,
          providerPaymentId: payment.id, bookingRef: attempt.bookingRef,
          pelerinId: metadata.pelerinId, pelerinEmail: metadata.pelerinEmail,
          analyticsSessionHash: typeof metadata.analyticsSessionHash === 'string' ? metadata.analyticsSessionHash : null,
          amountCents: attempt.amountCents, currency: attempt.currency, occurredAt,
        })
        if (!paid.duplicate && paid.data && paid.pelerin && paid.guides) {
          const [{ sendPaymentConfirmationEmails }, { sendReferralPromoCode }, { recordAnalyticsEvent }] = await Promise.all([
            import('@/lib/payments/confirmation-emails'), import('@/lib/email'), import('@/lib/analytics'),
          ])
          const effects = await Promise.allSettled([
            sendPaymentConfirmationEmails({ refNumber: attempt.bookingRef, amount: paid.amount, data: paid.data, pelerin: paid.pelerin, guides: paid.guides }),
            recordAnalyticsEvent({
              eventName: 'purchase', sessionHash: typeof metadata.analyticsSessionHash === 'string' ? metadata.analyticsSessionHash : null,
              userId: paid.pelerin.id, path: '/checkout.whop.com',
              metadata: { refNumber: attempt.bookingRef, provider: 'WHOP', cityChoice: paid.data.cityChoice, amountCents: attempt.amountCents },
            }),
            ...(paid.sponsorPromo ? [sendReferralPromoCode({
              to: paid.sponsorPromo.email, name: paid.sponsorPromo.name, code: paid.sponsorPromo.code,
              expiresAt: paid.sponsorPromo.expiresAt, purpose: 'SPONSOR_REWARD', referralId: paid.sponsorPromo.referralId,
            })] : []),
          ])
          for (const effect of effects) if (effect.status === 'rejected') console.error('[whop-reconciliation side effect]', effect.reason)
        }
        result.paid++
      } else if (closed.closed) {
        // Keep the configuration until local expiry is committed, so a retry can
        // still discover its unique variant if the database is temporarily down.
        await processExpiredCheckout({
          provider: 'WHOP', providerEventId: `reconcile-expired:${checkoutId}`,
          providerEventType: 'checkout.expired', providerCheckoutId: checkoutId,
          bookingRef: attempt.bookingRef, analyticsSessionHash: null, occurredAt: new Date(),
        })
        result.expired++
      } else result.pending++
    } catch (error) {
      result.pending++
      console.error('[whop-checkout reconciliation]', attempt.bookingRef, error)
    }
  }
  return result
}

export function getWhopClient(): WhopClient {
  const token = process.env.WHOP_API_KEY?.trim()
  if (!token) throw new Error('Clé API Whop manquante')
  return new WhopClient({
    token,
    environment: process.env.WHOP_ENVIRONMENT?.trim().toLowerCase() === 'production'
      ? WhopEnvironment.Production
      : WhopEnvironment.Sandbox,
  })
}

export function whopPaymentProvider(): PaymentProvider {
  const client = getWhopClient()
  return {
    name: 'WHOP',

    async createHostedCheckout(input: HostedCheckoutInput): Promise<HostedCheckoutResult> {
      const checkout = await client.checkoutConfigurations.create({
        mode: 'payment',
        metadata: input.metadata,
        redirect_url: input.successUrl,
        variant: {
          billing_type: 'one_time',
          initial_price: input.amountCents / 100,
          currency: input.currency.toLowerCase(),
          override_tax_type: 'inclusive',
          title: input.productName.slice(0, 30),
          description: input.description.slice(0, 1000),
          force_create_new_plan: true,
          stock: 1,
          unlimited_stock: false,
          metadata: input.metadata,
          visibility: 'hidden',
          release_method: 'buy_now',
        },
      }, { idempotencyKey: input.idempotencyKey })

      if (!checkout.purchase_url) throw new Error('Whop n’a retourné aucune URL de paiement')
      return { provider: 'WHOP', checkoutId: checkout.id, checkoutUrl: checkout.purchase_url }
    },

    async expireHostedCheckout(checkoutId: string): Promise<void> {
      const closed = await closeWhopCheckout(client, checkoutId)
      if (!closed.closed) throw new Error('Le paiement Whop doit encore être vérifié avant de libérer les dates')
      await client.checkoutConfigurations.delete({ id: checkoutId })
    },
  }
}
