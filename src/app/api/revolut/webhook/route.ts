import * as Sentry from '@sentry/nextjs'
import { after, NextResponse } from 'next/server'
import { createHash } from 'node:crypto'
import prisma from '@/lib/prisma'
import { recordAnalyticsEvent } from '@/lib/analytics'
import { sendReferralPromoCode } from '@/lib/email'
import { sendPaymentConfirmationEmails } from '@/lib/payments/confirmation-emails'
import {
  PaymentProcessingError,
  PaymentEventInFlightError,
  processExpiredCheckout,
  processPaidCheckout,
  recordIgnoredPaymentEvent,
  recordRejectedPaymentEvent,
} from '@/lib/payments/process-event'
import {
  classifyRevolutWebhookEvent,
  deterministicRevolutEventId,
  retrieveRevolutOrder,
  verifyRevolutWebhookSignature,
  type RevolutOrder,
  type RevolutPayment,
} from '@/lib/payments/revolut-provider'

type RevolutWebhookPayload = {
  event: string
  order_id: string
  merchant_order_ext_ref?: string
}

type PaymentCustomerContext = {
  pelerinId: string
  pelerinEmail: string
  analyticsSessionHash: string | null
}

function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex')
}

function parseWebhookPayload(rawBody: string): RevolutWebhookPayload {
  let value: unknown
  try {
    value = JSON.parse(rawBody)
  } catch {
    throw new PaymentProcessingError('Payload Revolut invalide', 400)
  }
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new PaymentProcessingError('Payload Revolut invalide', 400)
  }
  const payload = value as Partial<RevolutWebhookPayload>
  if (
    typeof payload.event !== 'string'
    || !payload.event.startsWith('ORDER_')
    || typeof payload.order_id !== 'string'
    || payload.order_id.length < 10
    || (payload.merchant_order_ext_ref !== undefined && typeof payload.merchant_order_ext_ref !== 'string')
  ) {
    throw new PaymentProcessingError('Payload Revolut incomplet', 400)
  }
  return payload as RevolutWebhookPayload
}

function requiredString(value: unknown, field: string): string {
  if (typeof value !== 'string' || value.length === 0) {
    throw new PaymentProcessingError(`${field} Revolut manquant`, 400)
  }
  return value
}

function requiredDate(value: unknown): Date {
  const date = typeof value === 'string' ? new Date(value) : new Date(Number.NaN)
  if (Number.isNaN(date.getTime())) {
    throw new PaymentProcessingError('Date Revolut invalide', 400)
  }
  return date
}

function latestPaymentByState(order: RevolutOrder, states: Set<string>): RevolutPayment | null {
  const matching = (order.payments ?? [])
    .filter(payment => states.has(payment.state ?? '') && typeof payment.id === 'string')
    .sort((left, right) => (
      requiredDate(right.updated_at).getTime() - requiredDate(left.updated_at).getTime()
    ))
  return matching[0] ?? null
}

function paymentForEvent(order: RevolutOrder, eventType: string): RevolutPayment | null {
  if (eventType === 'ORDER_COMPLETED') {
    return latestPaymentByState(order, new Set(['completed']))
  }
  if (eventType === 'ORDER_PAYMENT_DECLINED') {
    return latestPaymentByState(order, new Set(['declined', 'soft_declined']))
  }
  if (eventType === 'ORDER_PAYMENT_FAILED') {
    return latestPaymentByState(order, new Set(['failed']))
  }
  return null
}

function requiredCompletedPayment(order: RevolutOrder): RevolutPayment {
  const payment = latestPaymentByState(order, new Set(['completed']))
  if (!payment) throw new PaymentProcessingError('Paiement Revolut final manquant', 400)
  return payment
}

function validateAuthoritativeOrder(
  payload: RevolutWebhookPayload,
  order: RevolutOrder,
): { bookingRef: string; metadata: Record<string, unknown>; occurredAt: Date } {
  if (order.id !== payload.order_id || order.type !== 'payment' || order.capture_mode !== 'automatic') {
    throw new PaymentProcessingError('Ordre Revolut incohérent', 400)
  }
  const bookingRef = requiredString(order.merchant_order_data?.reference, 'Référence')
  if (payload.merchant_order_ext_ref && payload.merchant_order_ext_ref !== bookingRef) {
    throw new PaymentProcessingError('Référence Revolut incohérente', 400)
  }
  const metadata = order.metadata
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
    throw new PaymentProcessingError('Métadonnées Revolut manquantes', 400)
  }
  if (metadata.refNumber !== bookingRef) {
    throw new PaymentProcessingError('Métadonnées Revolut incohérentes', 400)
  }
  return { bookingRef, metadata, occurredAt: requiredDate(order.updated_at) }
}

function rejectedEventId(payload: RevolutWebhookPayload): string {
  return `revolut:${sha256(`rejected|${payload.event}|${payload.order_id}`)}`
}

async function resolvePaymentCustomerContext(bookingRef: string): Promise<PaymentCustomerContext> {
  const draft = await prisma.reservationDraft.findUnique({
    where: { refNumber: bookingRef },
    include: { pelerin: { select: { id: true, email: true } } },
  })
  if (draft) {
    let data: unknown
    try {
      data = JSON.parse(draft.data)
    } catch {
      throw new PaymentProcessingError('Brouillon de réservation invalide', 400)
    }
    const analyticsSessionHash = data && typeof data === 'object' && !Array.isArray(data)
      && typeof (data as { analyticsSessionHash?: unknown }).analyticsSessionHash === 'string'
      ? (data as { analyticsSessionHash: string }).analyticsSessionHash || null
      : null
    return {
      pelerinId: draft.pelerin.id,
      pelerinEmail: requiredString(draft.pelerin.email, 'Email pèlerin'),
      analyticsSessionHash,
    }
  }

  const reservation = await prisma.reservation.findUnique({
    where: { refNumber: bookingRef },
    include: { pelerin: { select: { id: true, email: true } } },
  })
  if (!reservation) throw new PaymentProcessingError('Réservation ou brouillon introuvable', 404)
  return {
    pelerinId: reservation.pelerin.id,
    pelerinEmail: requiredString(reservation.pelerin.email, 'Email pèlerin'),
    analyticsSessionHash: null,
  }
}

async function resolveDraftAnalyticsSessionHash(bookingRef: string): Promise<string | null> {
  const draft = await prisma.reservationDraft.findUnique({
    where: { refNumber: bookingRef },
    select: { data: true },
  })
  if (!draft) return null
  try {
    const data = JSON.parse(draft.data) as { analyticsSessionHash?: unknown }
    return typeof data.analyticsSessionHash === 'string'
      ? data.analyticsSessionHash || null
      : null
  } catch {
    return null
  }
}

export async function POST(req: Request) {
  const signingSecret = process.env.REVOLUT_WEBHOOK_SIGNING_SECRET
  if (!signingSecret || !process.env.REVOLUT_MERCHANT_SECRET_KEY) {
    return NextResponse.json({ error: 'Non configuré' }, { status: 500 })
  }

  const rawBody = await req.text()
  const timestamp = req.headers.get('revolut-request-timestamp')
  const signatureHeader = req.headers.get('revolut-signature')
  if (!verifyRevolutWebhookSignature({ rawBody, timestamp, signatureHeader, signingSecret })) {
    return NextResponse.json({ error: 'Signature invalide' }, { status: 400 })
  }

  let payload: RevolutWebhookPayload
  try {
    payload = parseWebhookPayload(rawBody)
  } catch (error) {
    const status = error instanceof PaymentProcessingError ? error.status : 400
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Payload invalide' },
      { status },
    )
  }

  let providerEventId = rejectedEventId(payload)
  let occurredAt = new Date(Number(timestamp))
  try {
    const order = await retrieveRevolutOrder(payload.order_id)
    const authoritative = validateAuthoritativeOrder(payload, order)
    occurredAt = authoritative.occurredAt
    const payment = paymentForEvent(order, payload.event)
    providerEventId = deterministicRevolutEventId({
      eventType: payload.event,
      order,
      payment,
    })
    const action = classifyRevolutWebhookEvent(payload.event, order.state)

    if (action === 'PAID') {
      if (!Number.isInteger(order.amount) || (order.amount ?? 0) <= 0 || order.currency !== 'EUR') {
        throw new PaymentProcessingError('Montant Revolut incohérent', 400)
      }
      const completedPayment = payment ?? requiredCompletedPayment(order)
      if (
        (completedPayment.amount !== undefined && completedPayment.amount !== order.amount)
        || (completedPayment.currency !== undefined && completedPayment.currency !== order.currency)
      ) {
        throw new PaymentProcessingError('Paiement Revolut incohérent', 400)
      }

      const { pelerinEmail, pelerinId, analyticsSessionHash } =
        await resolvePaymentCustomerContext(authoritative.bookingRef)
      const result = await processPaidCheckout({
        provider: 'REVOLUT',
        providerEventId,
        providerEventType: payload.event,
        providerCheckoutId: payload.order_id,
        providerPaymentId: requiredString(completedPayment.id, 'Paiement'),
        bookingRef: authoritative.bookingRef,
        pelerinId,
        pelerinEmail,
        analyticsSessionHash,
        amountCents: order.amount!,
        currency: order.currency,
        occurredAt,
      })

      if (!result.duplicate && result.data && result.pelerin && result.guides) {
        const paymentData = result.data
        const pelerin = result.pelerin
        const guides = result.guides
        after(async () => {
          const sideEffects = await Promise.allSettled([
            recordAnalyticsEvent({
              eventName: 'purchase',
              sessionHash: analyticsSessionHash,
              userId: pelerin.id,
              path: '/checkout.revolut.com',
              metadata: {
                refNumber: authoritative.bookingRef,
                provider: 'REVOLUT',
                cityChoice: paymentData.cityChoice,
                amountCents: order.amount!,
              },
            }),
            sendPaymentConfirmationEmails({
              refNumber: authoritative.bookingRef,
              amount: result.amount,
              data: paymentData,
              pelerin,
              guides,
            }),
            ...(result.sponsorPromo ? [sendReferralPromoCode({
              to: result.sponsorPromo.email,
              name: result.sponsorPromo.name,
              code: result.sponsorPromo.code,
              expiresAt: result.sponsorPromo.expiresAt,
              purpose: 'SPONSOR_REWARD',
              referralId: result.sponsorPromo.referralId,
            })] : []),
          ])
          for (const sideEffect of sideEffects) {
            if (sideEffect.status === 'rejected') {
              console.error('[revolut-webhook side effect]', sideEffect.reason)
              Sentry.captureException(sideEffect.reason, {
                tags: { area: 'payment-webhook-side-effect', provider: 'REVOLUT' },
                extra: { refNumber: authoritative.bookingRef },
              })
            }
          }
        })
      }
      return new Response(null, { status: 204 })
    }

    if (action === 'EXPIRED') {
      const analyticsSessionHash = await resolveDraftAnalyticsSessionHash(authoritative.bookingRef)
      const result = await processExpiredCheckout({
        provider: 'REVOLUT',
        providerEventId,
        providerEventType: payload.event,
        providerCheckoutId: payload.order_id,
        bookingRef: authoritative.bookingRef,
        analyticsSessionHash,
        occurredAt,
      })
      if (result.expired) {
        after(async () => {
          await recordAnalyticsEvent({
            eventName: 'payment_expired',
            sessionHash: analyticsSessionHash,
            path: '/checkout.revolut.com',
            metadata: { refNumber: authoritative.bookingRef, provider: 'REVOLUT' },
          }).catch(error => {
            console.error('[revolut-webhook expired analytics]', error)
            Sentry.captureException(error, {
              tags: { area: 'payment-webhook-analytics', provider: 'REVOLUT' },
              extra: { refNumber: authoritative.bookingRef },
            })
          })
        })
      }
      return new Response(null, { status: 204 })
    }

    // ORDER_PAYMENT_DECLINED et ORDER_PAYMENT_FAILED sont des échecs de tentative :
    // le client peut encore payer le même ordre, donc les dates restent bloquées.
    await recordIgnoredPaymentEvent({
      provider: 'REVOLUT',
      providerEventId,
      providerEventType: payload.event,
      providerObjectId: payload.order_id,
      occurredAt,
    })
    return new Response(null, { status: 204 })
  } catch (error) {
    if (error instanceof PaymentEventInFlightError) {
      return NextResponse.json(
        { error: error.message },
        { status: 503, headers: { 'Retry-After': '1' } },
      )
    }
    await recordRejectedPaymentEvent({
      provider: 'REVOLUT',
      providerEventId,
      providerEventType: payload.event,
      providerObjectId: payload.order_id,
      occurredAt,
      error,
    }).catch(ledgerError => {
      console.error('[revolut-webhook rejected event ledger]', ledgerError)
      Sentry.captureException(ledgerError, {
        tags: { area: 'payment-event-ledger', provider: 'REVOLUT' },
      })
    })
    console.error('[revolut-webhook processing]', error)
    Sentry.captureException(error, {
      tags: { area: 'payment-webhook-processing', provider: 'REVOLUT' },
      extra: { eventId: providerEventId, eventType: payload.event, orderId: payload.order_id },
    })
    const status = error instanceof PaymentProcessingError ? error.status : 500
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Traitement du paiement impossible' },
      { status },
    )
  }
}
