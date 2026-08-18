import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import {
  ANALYTICS_EVENT_NAMES,
  analyticsCountry,
  analyticsDevice,
  recordAnalyticsEvent,
} from '@/lib/analytics'

const scalar = z.union([z.string().max(240), z.number().finite(), z.boolean(), z.null()])
const eventSchema = z.object({
  eventName: z.enum(ANALYTICS_EVENT_NAMES),
  sessionId: z.string().min(20).max(100),
  path: z.string().min(1).max(500),
  referrer: z.string().max(1000).nullable().optional(),
  metadata: z.record(z.string(), scalar).optional(),
})

export async function POST(req: NextRequest) {
  const contentLength = Number(req.headers.get('content-length') ?? '0')
  if (contentLength > 8_192) {
    return NextResponse.json({ error: 'Payload trop volumineux' }, { status: 413 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'JSON invalide' }, { status: 400 })
  }

  const parsed = eventSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Événement invalide' }, { status: 400 })
  }

  const session = await getServerSession(authOptions)
  await recordAnalyticsEvent({
    ...parsed.data,
    userId: session?.user?.id ?? null,
    country: analyticsCountry(req.headers.get('x-vercel-ip-country')),
    device: analyticsDevice(req.headers.get('user-agent')),
  })

  return new NextResponse(null, { status: 204 })
}

