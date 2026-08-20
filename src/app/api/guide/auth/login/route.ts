import bcrypt from 'bcryptjs'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { checkRateLimitKey, guideAuthRatelimit } from '@/lib/ratelimit'
import {
  createGuideSessionToken,
  getGuideRequestContext,
  GUIDE_SESSION_COOKIE,
  GUIDE_SESSION_MAX_AGE_SECONDS,
  hasTrustedGuideAuthOrigin,
  hashGuideSessionToken,
  recordGuideLoginAttempt,
} from '@/lib/guide-auth'
import { recordAnalyticsEvent } from '@/lib/analytics'

const DUMMY_PASSWORD_HASH = '$2b$12$FdYy.dDquzna2TqOtp7CbeQZqmKRZxnGJI8NmHqL7v8iAmejyMYKC'

const loginSchema = z.object({
  email: z.string().email().max(254).transform(value => value.trim().toLowerCase()),
  password: z.string().min(1).max(1024),
})

function jsonError(error: string, status: 400 | 401 | 403 | 500) {
  return NextResponse.json(
    { error },
    {
      status,
      headers: {
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff',
      },
    },
  )
}

export async function POST(req: NextRequest) {
  const context = getGuideRequestContext(req)
  if (!hasTrustedGuideAuthOrigin(req)) {
    await recordGuideLoginAttempt({
      email: 'unknown',
      success: false,
      reason: 'UNTRUSTED_ORIGIN',
      context,
    })
    return jsonError('Requête non autorisée.', 403)
  }

  const raw = await req.json().catch(() => null)
  const parsed = loginSchema.safeParse(raw)
  const email = parsed.success ? parsed.data.email : 'invalid'

  const limited = await checkRateLimitKey(guideAuthRatelimit, `${context.ip}:${email}`)
  if (limited) {
    await recordGuideLoginAttempt({ email, success: false, reason: 'RATE_LIMITED', context })
    return limited
  }

  if (!parsed.success) {
    await recordGuideLoginAttempt({ email, success: false, reason: 'INVALID_INPUT', context })
    return jsonError('Identifiants incorrects.', 401)
  }

  const { password } = parsed.data
  const account = await prisma.guideAccount.findUnique({
    where: { email },
    include: { guideProfile: { select: { id: true, status: true } } },
  })
  const passwordValid = await bcrypt.compare(password, account?.passwordHash || DUMMY_PASSWORD_HASH)

  let failureReason: string | null = null
  if (!account || !account.passwordHash || !passwordValid) failureReason = 'INVALID_CREDENTIALS'
  else if (account.status !== 'ACTIVE' || account.guideProfile?.status === 'SUSPENDED') failureReason = 'ACCOUNT_SUSPENDED'
  else if (!account.guideProfile) failureReason = 'PROFILE_MISSING'
  else if (!account.emailVerified) failureReason = 'EMAIL_NOT_VERIFIED'

  if (!account || failureReason) {
    await recordGuideLoginAttempt({
      email,
      guideAccountId: account?.id,
      success: false,
      reason: failureReason || 'INVALID_CREDENTIALS',
      context,
    })
    return jsonError('Identifiants incorrects. Vérifiez vos accès SAFARUMA.', 401)
  }

  const token = createGuideSessionToken()
  const expiresAt = new Date(Date.now() + GUIDE_SESSION_MAX_AGE_SECONDS * 1000)
  await prisma.$transaction([
    prisma.guideSession.create({
      data: {
        tokenHash: hashGuideSessionToken(token),
        guideAccountId: account.id,
        expiresAt,
        ...context,
      },
    }),
    prisma.guideAccount.update({
      where: { id: account.id },
      data: { lastLoginAt: new Date() },
    }),
    prisma.guideLoginAttempt.create({
      data: {
        email,
        guideAccountId: account.id,
        success: true,
        reason: 'SUCCESS',
        ...context,
      },
    }),
  ])

  recordAnalyticsEvent({
    eventName: 'login_success',
    userId: account.legacyUserId,
    path: '/guide/connexion',
    country: context.country,
    device: context.device,
    metadata: {
      email,
      role: 'GUIDE',
      method: 'email',
      ip: context.ip,
      city: context.city,
      browser: context.browser,
      userAgent: context.userAgent.slice(0, 240),
      guideAccountId: account.id,
    },
  }).catch(() => {})

  const response = NextResponse.json(
    {
      success: true,
      user: {
        id: account.id,
        email: account.email,
        displayName: account.displayName,
        firstName: account.firstName,
        lastName: account.lastName,
      },
    },
    { headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } },
  )
  response.cookies.set(GUIDE_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: GUIDE_SESSION_MAX_AGE_SECONDS,
    expires: expiresAt,
    path: '/',
    priority: 'high',
  })
  return response
}
