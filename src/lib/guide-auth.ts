import 'server-only'

import { createHash, randomBytes } from 'node:crypto'
import { cookies } from 'next/headers'
import type { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'

export const GUIDE_SESSION_COOKIE = 'guide_session'
export const GUIDE_SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60

export type GuideRequestContext = {
  ip: string
  country: string | null
  city: string | null
  device: 'MOBILE' | 'TABLET' | 'DESKTOP' | 'UNKNOWN'
  browser: string
  userAgent: string
}

function decodedHeader(value: string | null): string | null {
  if (!value) return null
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

function requestDevice(userAgent: string): GuideRequestContext['device'] {
  if (/ipad|tablet|kindle|silk/i.test(userAgent)) return 'TABLET'
  if (/mobi|iphone|ipod|android/i.test(userAgent)) return 'MOBILE'
  return userAgent ? 'DESKTOP' : 'UNKNOWN'
}

function requestBrowser(userAgent: string): string {
  if (/Edg\//i.test(userAgent)) return 'Edge'
  if (/Firefox\//i.test(userAgent)) return 'Firefox'
  if (/CriOS|Chrome\//i.test(userAgent)) return 'Chrome'
  if (/Safari\//i.test(userAgent)) return 'Safari'
  return userAgent ? 'Autre' : 'Inconnu'
}

export function getGuideRequestContext(req: NextRequest): GuideRequestContext {
  const userAgent = req.headers.get('user-agent') || ''
  return {
    ip: (req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || req.headers.get('x-real-ip')
      || 'unknown').slice(0, 64),
    country: req.headers.get('x-vercel-ip-country')?.slice(0, 32) || null,
    city: decodedHeader(req.headers.get('x-vercel-ip-city'))?.slice(0, 100) || null,
    device: requestDevice(userAgent),
    browser: requestBrowser(userAgent),
    userAgent: userAgent.slice(0, 500),
  }
}

export function hasTrustedGuideAuthOrigin(req: NextRequest): boolean {
  const origin = req.headers.get('origin')
  return !origin || origin === req.nextUrl.origin
}

export function createGuideSessionToken(): string {
  return randomBytes(32).toString('base64url')
}

export function hashGuideSessionToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

export async function readGuideSessionToken(): Promise<string | null> {
  return (await cookies()).get(GUIDE_SESSION_COOKIE)?.value || null
}

export async function resolveGuideSession(token: string) {
  const tokenHash = hashGuideSessionToken(token)
  const session = await prisma.guideSession.findUnique({
    where: { tokenHash },
    include: {
      guideAccount: {
        include: {
          guideProfile: {
            select: {
              id: true,
              status: true,
              slug: true,
              acceptingBookings: true,
              servesMakkah: true,
              servesMadinah: true,
            },
          },
        },
      },
    },
  })

  if (!session || session.revokedAt || session.expiresAt <= new Date()) return null

  if (Date.now() - session.lastSeenAt.getTime() > 5 * 60 * 1000) {
    prisma.guideSession.update({
      where: { id: session.id },
      data: { lastSeenAt: new Date() },
    }).catch(() => {})
  }

  return session
}

export async function recordGuideLoginAttempt(input: {
  email: string
  guideAccountId?: string | null
  success: boolean
  reason: string
  context: GuideRequestContext
}) {
  await prisma.guideLoginAttempt.create({
    data: {
      email: input.email.slice(0, 254),
      guideAccountId: input.guideAccountId || null,
      success: input.success,
      reason: input.reason,
      ...input.context,
    },
  }).catch(() => {})
}
