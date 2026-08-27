import { createHash, timingSafeEqual } from 'node:crypto'
import { Prisma } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const runtime = 'nodejs'

type BrevoEvent = Record<string, unknown>

const STATUS_BY_EVENT: Record<string, string> = {
  request: 'ACCEPTED',
  sent: 'SENT',
  delivered: 'DELIVERED',
  opened: 'OPENED',
  unique_opened: 'OPENED',
  uniqueOpened: 'OPENED',
  proxy_open: 'OPENED',
  unique_proxy_open: 'OPENED',
  click: 'CLICKED',
  clicked: 'CLICKED',
  deferred: 'DEFERRED',
  soft_bounce: 'SOFT_BOUNCE',
  softBounce: 'SOFT_BOUNCE',
  hard_bounce: 'HARD_BOUNCE',
  hardBounce: 'HARD_BOUNCE',
  blocked: 'BLOCKED',
  invalid: 'INVALID',
  spam: 'SPAM',
  complaint: 'SPAM',
  unsubscribed: 'UNSUBSCRIBED',
  error: 'ERROR',
}

function authorized(req: NextRequest): boolean {
  const expected = process.env.BREVO_WEBHOOK_SECRET
  const value = req.headers.get('authorization')
  if (!expected || !value?.startsWith('Bearer ')) return false
  const received = value.slice(7)
  const expectedBuffer = Buffer.from(expected)
  const receivedBuffer = Buffer.from(received)
  return expectedBuffer.length === receivedBuffer.length && timingSafeEqual(expectedBuffer, receivedBuffer)
}

function text(value: unknown, max = 500): string | null {
  return typeof value === 'string' && value ? value.slice(0, max) : null
}

function eventDate(event: BrevoEvent): Date {
  const seconds = Number(event.ts_event ?? event.ts)
  if (Number.isFinite(seconds) && seconds > 0) return new Date(seconds * 1000)
  const milliseconds = Number(event.ts_epoch)
  if (Number.isFinite(milliseconds) && milliseconds > 0) return new Date(milliseconds)
  return new Date()
}

function eventKey(event: BrevoEvent, eventName: string, messageId: string | null, occurredAt: Date): string {
  return createHash('sha256').update(JSON.stringify([
    event.id ?? null,
    eventName,
    messageId,
    occurredAt.toISOString(),
    event.email ?? null,
  ])).digest('hex')
}

async function recordEvent(event: BrevoEvent) {
  const eventName = text(event.event, 80)
  if (!eventName) return 'ignored' as const
  const status = STATUS_BY_EVENT[eventName]
  if (!status) return 'ignored' as const

  const messageId = text(event['message-id'] ?? event.messageId, 500)
  const recipientEmail = text(event.email, 320)?.toLowerCase() ?? null
  const occurredAt = eventDate(event)
  const delivery = messageId
    ? await prisma.emailDelivery.findUnique({ where: { providerMessageId: messageId }, select: { id: true, deliveredAt: true, lastEventAt: true } })
    : null
  const reason = text(event.reason ?? event.message ?? event.error, 500)
  const providerEventKey = eventKey(event, eventName, messageId, occurredAt)

  try {
    await prisma.$transaction(async tx => {
      await tx.emailDeliveryEvent.create({
        data: {
          providerEventKey,
          deliveryId: delivery?.id,
          providerMessageId: messageId,
          event: eventName,
          recipientEmail,
          reason,
          occurredAt,
        },
      })

      if (delivery && (!delivery.lastEventAt || delivery.lastEventAt <= occurredAt)) {
        const delivered = ['DELIVERED', 'OPENED', 'CLICKED'].includes(status)
        const terminal = ['DELIVERED', 'OPENED', 'CLICKED', 'HARD_BOUNCE', 'BLOCKED', 'INVALID', 'SPAM', 'UNSUBSCRIBED', 'ERROR'].includes(status)
        await tx.emailDelivery.update({
          where: { id: delivery.id },
          data: {
            status,
            lastEventAt: occurredAt,
            ...(delivered && !delivery.deliveredAt && { deliveredAt: occurredAt }),
            ...(terminal && { payloadEncrypted: null, nextAttemptAt: null }),
            ...(reason && { lastError: reason }),
          },
        })
      }
    })
    return delivery ? 'linked' as const : 'orphan' as const
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') return 'duplicate' as const
    throw error
  }
}

export async function POST(req: NextRequest) {
  if (!authorized(req)) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const body = await req.json().catch(() => null)
  const events = Array.isArray(body) ? body : body && typeof body === 'object' ? [body] : []
  if (!events.length) return NextResponse.json({ error: 'Événement invalide' }, { status: 400 })

  const result = { linked: 0, orphan: 0, duplicate: 0, ignored: 0 }
  for (const event of events.slice(0, 100)) {
    const status = await recordEvent(event as BrevoEvent)
    result[status]++
  }

  return NextResponse.json({ success: true, ...result })
}
