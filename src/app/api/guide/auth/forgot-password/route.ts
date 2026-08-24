import { createHash, randomBytes } from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { sendGuidePasswordReset } from '@/lib/email'
import { getGuideRequestContext, hasTrustedGuideAuthOrigin } from '@/lib/guide-auth'
import { checkRateLimitKey, guideAuthRatelimit } from '@/lib/ratelimit'

const GENERIC_RESPONSE = { success: true }

export async function POST(req: NextRequest) {
  const context = getGuideRequestContext(req)
  if (!hasTrustedGuideAuthOrigin(req)) {
    return NextResponse.json({ error: 'Requête non autorisée.' }, { status: 403 })
  }

  try {
    const body = await req.json()
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
    const limited = await checkRateLimitKey(guideAuthRatelimit, `${context.ip}:${email || 'missing'}:reset`)
    if (limited) return limited
    if (!email) return NextResponse.json(GENERIC_RESPONSE)

    const account = await prisma.guideAccount.findUnique({ where: { email } })
    if (!account || account.status !== 'ACTIVE') return NextResponse.json(GENERIC_RESPONSE)

    const token = randomBytes(32).toString('hex')
    const tokenHash = createHash('sha256').update(token).digest('hex')
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000)
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXTAUTH_URL || 'https://safaruma.com'
    const resetUrl = `${baseUrl}/guide/reinitialiser-mot-de-passe?token=${token}`
    const now = new Date()

    await prisma.$transaction([
      prisma.guidePasswordResetToken.updateMany({
        where: { guideAccountId: account.id, usedAt: null },
        data: { usedAt: now },
      }),
      prisma.guidePasswordResetToken.create({
        data: { guideAccountId: account.id, tokenHash, expiresAt },
      }),
      prisma.auditLog.create({
        data: {
          actor: account.email,
          actorRole: 'GUIDE',
          action: 'GUIDE_PASSWORD_RESET_REQUESTED',
          target: account.id,
          detail: JSON.stringify({ request: { country: context.country, city: context.city, device: context.device, browser: context.browser } }),
          ip: context.ip,
          userAgent: context.userAgent,
        },
      }),
    ])

    try {
      await sendGuidePasswordReset({
        to: account.email,
        name: account.displayName || account.firstName || 'Guide',
        resetUrl,
      })
    } catch (error) {
      console.error('[guide-forgot-password-email]', error)
      await prisma.guidePasswordResetToken.updateMany({
        where: { tokenHash, usedAt: null },
        data: { usedAt: new Date() },
      }).catch(() => {})
    }

    return NextResponse.json(GENERIC_RESPONSE)
  } catch (error) {
    console.error('[guide-forgot-password]', error)
    return NextResponse.json({ error: 'Envoi temporairement indisponible.' }, { status: 503 })
  }
}
