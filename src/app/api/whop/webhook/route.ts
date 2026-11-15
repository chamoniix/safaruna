import * as Sentry from '@sentry/nextjs'
import { after, type NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { unwrapWebhook } from '@whop/sdk/helpers'
import { recordAnalyticsEvent } from '@/lib/analytics'
import { sendPaymentConfirmationEmails } from '@/lib/payments/confirmation-emails'
import { sendReferralPromoCode } from '@/lib/email'
import {
  PaymentEventInFlightError,
  PaymentProcessingError,
  claimPaymentEvent,
  processPaidCheckout,
  recordIgnoredPaymentEvent,
  recordRejectedPaymentEvent,
} from '@/lib/payments/process-event'

type WhopWebhook = {
  id: string
  type: string
  timestamp: string
  data: {
    id: string
    status?: string
    currency?: string
    customer_email?: string | null
    total?: { amount?: string; currency?: string }
    metadata?: Record<string, unknown> | null
    created_at?: string
    paid_at?: string | null
    checkout_configuration_id?: string | null
  }
}

function metadataString(metadata: Record<string, unknown> | null | undefined, key: string): string {
  const value = metadata?.[key]
  return typeof value === 'string' ? value : ''
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text()
  let event: WhopWebhook
  try {
    event = unwrapWebhook<WhopWebhook>(rawBody, {
      headers: Object.fromEntries(request.headers),
      key: process.env.WHOP_WEBHOOK_SECRET,
    })
  } catch (error) {
    console.error('[whop-webhook signature]', error)
    return NextResponse.json({ error: 'Signature Whop invalide' }, { status: 400 })
  }

  const occurredAt = new Date(event.timestamp)
  if (Number.isNaN(occurredAt.getTime())) {
    return NextResponse.json({ error: 'Date d’événement invalide' }, { status: 400 })
  }

  if (event.type !== 'payment.succeeded') {
    await recordIgnoredPaymentEvent({
      provider: 'WHOP', providerEventId: event.id, providerEventType: event.type,
      providerObjectId: event.data?.id, occurredAt,
    })
    return NextResponse.json({ received: true })
  }

  const vipRef = metadataString(event.data?.metadata, 'vipRef')
  const bookingRef = metadataString(event.data?.metadata, 'refNumber')
  if (!vipRef && !bookingRef && metadataString(event.data?.metadata, 'type') !== 'vip_consultation_deposit') {
    // An account can host other applications; their payments are not SAFARUMA orders.
    return NextResponse.json({ received: true })
  }
  if (vipRef) {
    try {
      const payment = event.data
      const amount = payment.total?.amount
      const currency = payment.total?.currency ?? payment.currency
      if (payment.status !== 'paid' || !payment.id || !payment.checkout_configuration_id || amount !== '500.00' || currency?.toLowerCase() !== 'eur') {
        throw new PaymentProcessingError('Acompte VIP Whop incohérent', 400)
      }

      const claimed = await claimPaymentEvent({
        provider: 'WHOP', providerEventId: event.id, providerEventType: event.type,
        providerObjectId: payment.id, occurredAt, bookingRef: vipRef,
      })
      if (claimed.duplicate) {
        return NextResponse.json({ received: true })
      }

      await prisma.$transaction(async tx => {
        const updated = await tx.vipConsultation.updateMany({
          where: { refNumber: vipRef, status: 'PENDING_PAYMENT', providerCheckoutId: payment.checkout_configuration_id },
          data: {
            status: 'PAID', providerPaymentId: payment.id,
            paidAt: payment.paid_at ? new Date(payment.paid_at) : occurredAt,
            customerEmail: payment.customer_email || undefined,
          },
        })
        if (updated.count !== 1) {
          const existing = await tx.vipConsultation.findUnique({ where: { refNumber: vipRef } })
          if (!existing || existing.providerPaymentId !== payment.id || !['PAID', 'CONSULTATION_BOOKED'].includes(existing.status)) {
            throw new PaymentProcessingError('Référence de paiement VIP inconnue', 400)
          }
        }
        await tx.paymentEvent.update({
          where: { id: claimed.id },
          data: { status: 'PROCESSED', processedAt: new Date() },
        })
      })
      return NextResponse.json({ received: true })
    } catch (error) {
      if (error instanceof PaymentEventInFlightError) {
        return NextResponse.json({ error: error.message }, { status: 503, headers: { 'Retry-After': '1' } })
      }
      await recordRejectedPaymentEvent({
        provider: 'WHOP', providerEventId: event.id, providerEventType: event.type,
        providerObjectId: event.data?.id, occurredAt, error,
      }).catch(ledgerError => Sentry.captureException(ledgerError, { tags: { area: 'payment-event-ledger', provider: 'WHOP' } }))
      return NextResponse.json({ error: error instanceof Error ? error.message : 'Acompte VIP impossible à confirmer' }, {
        status: error instanceof PaymentProcessingError ? error.status : 500,
      })
    }
  }

  try {
    const payment = event.data
    const metadata = payment.metadata
    const refNumber = metadataString(metadata, 'refNumber')
    const pelerinId = metadataString(metadata, 'pelerinId')
    const pelerinEmail = metadataString(metadata, 'pelerinEmail')
    const analyticsSessionHash = metadataString(metadata, 'analyticsSessionHash') || null
    const amount = payment.total?.amount
    const currency = payment.total?.currency ?? payment.currency
    if (!refNumber || !pelerinId || !pelerinEmail || !payment.id) {
      throw new PaymentProcessingError('Métadonnées de paiement Whop manquantes', 400)
    }
    if (payment.status !== 'paid' || !amount || !currency || !/^[0-9]+(?:\.[0-9]{1,2})?$/.test(amount)) {
      throw new PaymentProcessingError('Paiement Whop incohérent', 400)
    }
    const result = await processPaidCheckout({
      provider: 'WHOP',
      providerEventId: event.id,
      providerEventType: event.type,
      providerCheckoutId: payment.checkout_configuration_id ?? payment.id,
      providerPaymentId: payment.id,
      bookingRef: refNumber,
      pelerinId,
      pelerinEmail,
      analyticsSessionHash,
      amountCents: Math.round(Number(amount) * 100),
      currency: currency.toUpperCase(),
      occurredAt: payment.paid_at ? new Date(payment.paid_at) : occurredAt,
    })

    if (!result.duplicate && result.data && result.pelerin && result.guides) {
      after(async () => {
        const sideEffects = await Promise.allSettled([
          recordAnalyticsEvent({
            eventName: 'purchase', sessionHash: analyticsSessionHash,
            userId: result.pelerin!.id, path: '/checkout.whop.com',
            metadata: { refNumber, provider: 'WHOP', cityChoice: result.data!.cityChoice, amountCents: Math.round(Number(amount) * 100) },
          }),
          sendPaymentConfirmationEmails({ refNumber, amount: result.amount, data: result.data!, pelerin: result.pelerin!, guides: result.guides! }),
          ...(result.sponsorPromo ? [sendReferralPromoCode({
            to: result.sponsorPromo.email, name: result.sponsorPromo.name,
            code: result.sponsorPromo.code, expiresAt: result.sponsorPromo.expiresAt,
            purpose: 'SPONSOR_REWARD', referralId: result.sponsorPromo.referralId,
          })] : []),
        ])
        for (const item of sideEffects) if (item.status === 'rejected') {
          console.error('[whop-webhook side effect]', item.reason)
          Sentry.captureException(item.reason, { tags: { area: 'payment-webhook-side-effect', provider: 'WHOP' }, extra: { refNumber } })
        }
      })
    }
    return NextResponse.json({ received: true })
  } catch (error) {
    if (error instanceof PaymentEventInFlightError) {
      return NextResponse.json({ error: error.message }, { status: 503, headers: { 'Retry-After': '1' } })
    }
    await recordRejectedPaymentEvent({
      provider: 'WHOP', providerEventId: event.id, providerEventType: event.type,
      providerObjectId: event.data?.id, occurredAt, error,
    }).catch(ledgerError => Sentry.captureException(ledgerError, { tags: { area: 'payment-event-ledger', provider: 'WHOP' } }))
    Sentry.captureException(error, { tags: { area: 'payment-webhook-processing', provider: 'WHOP' }, extra: { eventId: event.id, eventType: event.type } })
    const status = error instanceof PaymentProcessingError ? error.status : 500
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Traitement du paiement impossible' }, { status })
  }
}
