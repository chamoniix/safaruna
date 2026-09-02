import Stripe from 'stripe'
import * as Sentry from '@sentry/nextjs'
import { after, type NextRequest, NextResponse } from 'next/server'
import { recordAnalyticsEvent } from '@/lib/analytics'
import { sendPaymentConfirmationEmails } from '@/lib/payments/confirmation-emails'
import { sendReferralPromoCode } from '@/lib/email'
import {
  PaymentProcessingError,
  PaymentEventInFlightError,
  processExpiredCheckout,
  processPaidCheckout,
  recordIgnoredPaymentEvent,
  recordRejectedPaymentEvent,
} from '@/lib/payments/process-event'



export async function POST(req: NextRequest) {
  const stripeKey = process.env.STRIPE_SECRET_KEY
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!stripeKey || !webhookSecret) {
    return NextResponse.json({ error: 'Non configuré' }, { status: 500 })
  }

  const stripe = new Stripe(stripeKey)
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')
  if (!signature) return NextResponse.json({ error: 'Signature manquante' }, { status: 400 })

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (error) {
    console.error('Webhook signature failed:', error)
    return NextResponse.json({ error: 'Signature invalide' }, { status: 400 })
  }

  const occurredAt = new Date(event.created * 1000)

  try {
    if (event.type === 'checkout.session.expired') {
      const session = event.data.object as Stripe.Checkout.Session
      const refNumber = session.metadata?.refNumber
      if (!refNumber || session.client_reference_id !== refNumber) {
        await recordIgnoredPaymentEvent({
          provider: 'STRIPE',
          providerEventId: event.id,
          providerEventType: event.type,
          providerObjectId: session.id,
          occurredAt,
        })
        return NextResponse.json({ received: true })
      }

      const result = await processExpiredCheckout({
        provider: 'STRIPE',
        providerEventId: event.id,
        providerEventType: event.type,
        providerCheckoutId: session.id,
        bookingRef: refNumber,
        analyticsSessionHash: session.metadata?.analyticsSessionHash || null,
        occurredAt,
      })

      if (result.expired) {
        after(async () => {
          await recordAnalyticsEvent({
            eventName: 'payment_expired',
            sessionHash: session.metadata?.analyticsSessionHash || null,
            path: '/checkout.stripe.com',
            metadata: { refNumber, provider: 'STRIPE' },
          }).catch(error => {
            console.error('[payment-webhook expired analytics]', error)
            Sentry.captureException(error, { tags: { area: 'payment-webhook-analytics' }, extra: { refNumber } })
          })
        })
      }
      return NextResponse.json({ received: true })
    }

    if (event.type !== 'checkout.session.completed') {
      const object = event.data.object as { id?: string }
      await recordIgnoredPaymentEvent({
        provider: 'STRIPE',
        providerEventId: event.id,
        providerEventType: event.type,
        providerObjectId: object.id,
        occurredAt,
      })
      return NextResponse.json({ received: true })
    }

    const session = event.data.object as Stripe.Checkout.Session
    if (session.payment_status !== 'paid') {
      await recordIgnoredPaymentEvent({
        provider: 'STRIPE',
        providerEventId: event.id,
        providerEventType: event.type,
        providerObjectId: session.id,
        occurredAt,
      })
      return NextResponse.json({ received: true })
    }

    const refNumber = session.metadata?.refNumber
    if (!refNumber) throw new PaymentProcessingError('refNumber manquant', 400)
    if (session.mode !== 'payment' || session.currency?.toLowerCase() !== 'eur') {
      throw new PaymentProcessingError('Paramètres de paiement incohérents', 400)
    }
    if (session.client_reference_id !== refNumber) {
      throw new PaymentProcessingError('Référence de paiement incohérente', 400)
    }

    const pelerinEmail = session.metadata?.pelerinEmail
    const pelerinId = session.metadata?.pelerinId
    if (!pelerinEmail) throw new PaymentProcessingError('Email pèlerin manquant', 400)
    if (!pelerinId) throw new PaymentProcessingError('Identité pèlerin manquante', 400)
    if (!Number.isInteger(session.amount_total) || (session.amount_total ?? 0) <= 0) {
      throw new PaymentProcessingError('Montant du paiement manquant', 400)
    }

    const providerPaymentId = typeof session.payment_intent === 'string'
      ? session.payment_intent
      : session.payment_intent?.id || session.id

    const result = await processPaidCheckout({
      provider: 'STRIPE',
      providerEventId: event.id,
      providerEventType: event.type,
      providerCheckoutId: session.id,
      providerPaymentId,
      bookingRef: refNumber,
      pelerinId,
      pelerinEmail,
      analyticsSessionHash: session.metadata?.analyticsSessionHash || null,
      amountCents: session.amount_total!,
      currency: session.currency.toUpperCase(),
      occurredAt,
    })

    if (!result.duplicate && result.data && result.pelerin && result.guides) {
      after(async () => {
        const sideEffects = await Promise.allSettled([
          recordAnalyticsEvent({
            eventName: 'purchase',
            sessionHash: session.metadata?.analyticsSessionHash || null,
            userId: result.pelerin!.id,
            path: '/checkout.stripe.com',
            metadata: {
              refNumber,
              provider: 'STRIPE',
              cityChoice: result.data!.cityChoice,
              amountCents: session.amount_total!,
            },
          }),
          sendPaymentConfirmationEmails({
            refNumber,
            amount: result.amount,
            data: result.data!,
            pelerin: result.pelerin!,
            guides: result.guides!,
          }),
          ...(result.sponsorPromo ? [
            sendReferralPromoCode({
              to: result.sponsorPromo.email,
              name: result.sponsorPromo.name,
              code: result.sponsorPromo.code,
              expiresAt: result.sponsorPromo.expiresAt,
              purpose: 'SPONSOR_REWARD',
              referralId: result.sponsorPromo.referralId,
            }),
          ] : []),
        ])

        for (const sideEffect of sideEffects) {
          if (sideEffect.status === 'rejected') {
            console.error('[payment-webhook side effect]', sideEffect.reason)
            Sentry.captureException(sideEffect.reason, {
              tags: { area: 'payment-webhook-side-effect' },
              extra: { refNumber },
            })
          }
        }
      })
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    if (error instanceof PaymentEventInFlightError) {
      return NextResponse.json(
        { error: error.message },
        { status: 503, headers: { 'Retry-After': '1' } },
      )
    }
    const failedObject = event.data.object as { id?: string }
    await recordRejectedPaymentEvent({
      provider: 'STRIPE',
      providerEventId: event.id,
      providerEventType: event.type,
      providerObjectId: failedObject.id,
      occurredAt,
      error,
    }).catch(ledgerError => {
      console.error('[payment-webhook rejected event ledger]', ledgerError)
      Sentry.captureException(ledgerError, { tags: { area: 'payment-event-ledger' } })
    })
    console.error('[payment-webhook processing]', error)
    Sentry.captureException(error, {
      tags: { area: 'payment-webhook-processing' },
      extra: { provider: 'STRIPE', eventId: event.id, eventType: event.type },
    })
    const status = error instanceof PaymentProcessingError ? error.status : 500
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Traitement du paiement impossible' },
      { status },
    )
  }
}
