import { createHash } from 'node:crypto'
import bcrypt from 'bcryptjs'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { sendGuidePasswordChanged } from '@/lib/email'
import { getGuideRequestContext, hasTrustedGuideAuthOrigin } from '@/lib/guide-auth'
import { checkRateLimitKey, guideAuthRatelimit } from '@/lib/ratelimit'

const resetSchema = z.object({
  token: z.string().min(1).max(256),
  password: z.string().min(8).max(1024),
})

export async function POST(req: NextRequest) {
  const context = getGuideRequestContext(req)
  if (!hasTrustedGuideAuthOrigin(req)) {
    return NextResponse.json({ error: 'Requête non autorisée.' }, { status: 403 })
  }

  const limited = await checkRateLimitKey(guideAuthRatelimit, `${context.ip}:guide-reset`)
  if (limited) return limited
  const parsed = resetSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: 'Lien invalide ou mot de passe trop court.' }, { status: 400 })
  }

  const tokenHash = createHash('sha256').update(parsed.data.token).digest('hex')
  const resetToken = await prisma.guidePasswordResetToken.findUnique({
    where: { tokenHash },
    include: { guideAccount: true },
  })
  const now = new Date()
  if (
    !resetToken
    || resetToken.usedAt
    || resetToken.expiresAt <= now
    || resetToken.guideAccount.status !== 'ACTIVE'
  ) {
    return NextResponse.json({ error: 'Lien invalide ou expiré.' }, { status: 400 })
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12)
  try {
    await prisma.$transaction(async tx => {
      const claimed = await tx.guidePasswordResetToken.updateMany({
        where: { id: resetToken.id, usedAt: null, expiresAt: { gt: now } },
        data: { usedAt: now },
      })
      if (claimed.count !== 1) throw new Error('RESET_TOKEN_ALREADY_USED')

      await tx.guideAccount.update({
        where: { id: resetToken.guideAccountId },
        data: {
          passwordHash,
          emailVerified: resetToken.guideAccount.emailVerified ?? now,
        },
      })
      await tx.guideSession.updateMany({
        where: { guideAccountId: resetToken.guideAccountId, revokedAt: null },
        data: { revokedAt: now },
      })
      await tx.guidePasswordResetToken.updateMany({
        where: { guideAccountId: resetToken.guideAccountId, id: { not: resetToken.id }, usedAt: null },
        data: { usedAt: now },
      })
      await tx.auditLog.create({
        data: {
          actor: resetToken.guideAccount.email,
          actorRole: 'GUIDE',
          action: 'GUIDE_PASSWORD_RESET_COMPLETED',
          target: resetToken.guideAccountId,
          detail: JSON.stringify({ request: { country: context.country, city: context.city, device: context.device, browser: context.browser } }),
          ip: context.ip,
          userAgent: context.userAgent,
          before: { emailVerified: resetToken.guideAccount.emailVerified },
          after: { emailVerified: resetToken.guideAccount.emailVerified ?? now },
        },
      })
    })
  } catch (error) {
    if (error instanceof Error && error.message === 'RESET_TOKEN_ALREADY_USED') {
      return NextResponse.json({ error: 'Ce lien a déjà été utilisé.' }, { status: 400 })
    }
    throw error
  }

  await sendGuidePasswordChanged({
    to: resetToken.guideAccount.email,
    name: resetToken.guideAccount.displayName || resetToken.guideAccount.firstName || 'Guide',
    context: {
      date: now.toLocaleString('fr-FR', { timeZone: 'Asia/Riyadh' }),
      ip: context.ip,
      country: context.country,
      city: context.city,
      device: context.device,
      browser: context.browser,
    },
  }).catch(error => console.error('[guide-reset-password-email]', error))

  return NextResponse.json({ success: true })
}
