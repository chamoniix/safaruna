import bcrypt from 'bcryptjs'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { sendGuidePasswordChanged } from '@/lib/email'
import { getGuideRequestContext, GUIDE_SESSION_COOKIE, hasTrustedGuideAuthOrigin } from '@/lib/guide-auth'
import { requireGuide } from '@/lib/require-account'
import { checkRateLimitKey, guideAuthRatelimit } from '@/lib/ratelimit'

const changeSchema = z.object({
  currentPassword: z.string().min(1).max(1024),
  newPassword: z.string().min(8).max(1024),
})

export async function POST(req: NextRequest) {
  const access = await requireGuide()
  if (!access.ok) return access.response
  if (!hasTrustedGuideAuthOrigin(req)) {
    return NextResponse.json({ error: 'Requête non autorisée.' }, { status: 403 })
  }

  const context = getGuideRequestContext(req)
  const limited = await checkRateLimitKey(guideAuthRatelimit, `${context.ip}:${access.actor.id}:password-change`)
  if (limited) return limited

  const parsed = changeSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: 'Le nouveau mot de passe doit contenir au moins 8 caractères.' }, { status: 400 })
  }

  const account = await prisma.guideAccount.findUnique({
    where: { id: access.actor.id },
    select: { id: true, email: true, passwordHash: true, displayName: true, firstName: true },
  })
  const currentValid = account?.passwordHash
    ? await bcrypt.compare(parsed.data.currentPassword, account.passwordHash)
    : false
  if (!account || !currentValid) {
    return NextResponse.json({ error: 'Mot de passe actuel incorrect.' }, { status: 401 })
  }

  const now = new Date()
  const passwordHash = await bcrypt.hash(parsed.data.newPassword, 12)
  await prisma.$transaction([
    prisma.guideAccount.update({ where: { id: account.id }, data: { passwordHash } }),
    prisma.guideSession.updateMany({
      where: { guideAccountId: account.id, revokedAt: null },
      data: { revokedAt: now },
    }),
    prisma.guidePasswordResetToken.updateMany({
      where: { guideAccountId: account.id, usedAt: null },
      data: { usedAt: now },
    }),
    prisma.auditLog.create({
      data: {
        actor: account.email,
        actorRole: 'GUIDE',
        action: 'GUIDE_PASSWORD_CHANGED',
        target: account.id,
        detail: JSON.stringify({ request: { country: context.country, city: context.city, device: context.device, browser: context.browser } }),
        ip: context.ip,
        userAgent: context.userAgent,
      },
    }),
  ])

  await sendGuidePasswordChanged({
    to: account.email,
    name: account.displayName || account.firstName || 'Guide',
    context: {
      date: now.toLocaleString('fr-FR', { timeZone: 'Asia/Riyadh' }),
      ip: context.ip,
      country: context.country,
      city: context.city,
      device: context.device,
      browser: context.browser,
    },
  }).catch(error => console.error('[guide-password-change-email]', error))

  const response = NextResponse.json({ success: true })
  response.cookies.set(GUIDE_SESSION_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0,
    expires: new Date(0),
    path: '/',
    priority: 'high',
  })
  return response
}
