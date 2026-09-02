import 'server-only'

import { createHmac } from 'node:crypto'
import { Prisma } from '@prisma/client'
import * as Sentry from '@sentry/nextjs'
import prisma from '@/lib/prisma'

export const ANALYTICS_EVENT_NAMES = [
  'page_view',
  'cta_click',
  'guide_search',
  'guide_viewed',
  'guide_application_started',
  'guide_application_step',
  'guide_application_submitted',
  'account_created',
  'login_success',
  'booking_started',
  'booking_step',
  'begin_checkout',
  'checkout_created',
  'checkout_error',
  'payment_cancelled',
  'purchase',
  'payment_expired',
  'review_submitted',
  'review_moderated',
  'web_vital',
  'client_error',
] as const

export type AnalyticsEventName = (typeof ANALYTICS_EVENT_NAMES)[number]
export type AnalyticsDevice = 'MOBILE' | 'TABLET' | 'DESKTOP' | 'UNKNOWN'

const ALLOWED_EVENTS = new Set<string>(ANALYTICS_EVENT_NAMES)

export function hashAnalyticsSession(sessionId: string | null | undefined): string | null {
  const secret = process.env.ANALYTICS_HASH_SECRET
  if (!secret || !sessionId || sessionId.length < 20 || sessionId.length > 100) return null
  return createHmac('sha256', secret).update(sessionId).digest('hex')
}

export function analyticsDevice(userAgent: string | null): AnalyticsDevice {
  if (!userAgent) return 'UNKNOWN'
  if (/ipad|tablet|kindle|silk|playbook/i.test(userAgent)) return 'TABLET'
  if (/mobi|iphone|ipod|android/i.test(userAgent)) return 'MOBILE'
  return 'DESKTOP'
}

export function analyticsCountry(value: string | null): string {
  const country = value?.trim().toUpperCase() ?? ''
  return /^[A-Z]{2}$/.test(country) ? country : 'UNKNOWN'
}

export function analyticsPath(value: string | null | undefined): string | null {
  if (!value) return null
  const path = value.split('?')[0]?.split('#')[0]?.trim()
  if (!path?.startsWith('/')) return null
  return path.slice(0, 300)
}

export function analyticsReferrer(value: string | null | undefined): string | null {
  if (!value) return null
  try {
    const url = new URL(value)
    return `${url.origin}${url.pathname}`.slice(0, 300)
  } catch {
    return null
  }
}

function safeMetadata(metadata: Record<string, unknown> | null | undefined): Prisma.InputJsonValue | undefined {
  if (!metadata) return undefined
  const safe: Record<string, string | number | boolean | null> = {}
  for (const [key, value] of Object.entries(metadata).slice(0, 16)) {
    if (!/^[a-zA-Z][a-zA-Z0-9_]{0,39}$/.test(key)) continue
    if (typeof value === 'string') safe[key] = value.slice(0, 240)
    else if (typeof value === 'number' && Number.isFinite(value)) safe[key] = value
    else if (typeof value === 'boolean' || value === null) safe[key] = value
  }
  return Object.keys(safe).length > 0 ? safe : undefined
}

export async function recordAnalyticsEvent(input: {
  eventName: AnalyticsEventName
  sessionId?: string | null
  sessionHash?: string | null
  userId?: string | null
  path?: string | null
  referrer?: string | null
  country?: string | null
  device?: AnalyticsDevice | null
  metadata?: Record<string, unknown> | null
}): Promise<boolean> {
  if (!ALLOWED_EVENTS.has(input.eventName)) return false

  try {
    await prisma.analyticsEvent.create({
      data: {
        eventName: input.eventName,
        sessionHash: input.sessionHash ?? hashAnalyticsSession(input.sessionId),
        userId: input.userId || null,
        path: analyticsPath(input.path),
        referrer: analyticsReferrer(input.referrer),
        country: analyticsCountry(input.country ?? null),
        device: input.device ?? 'UNKNOWN',
        metadata: safeMetadata(input.metadata),
      },
    })
    return true
  } catch (error) {
    console.error('[analytics] event write failed', error)
    Sentry.captureException(error, { tags: { area: 'analytics-write', event: input.eventName } })
    return false
  }
}
