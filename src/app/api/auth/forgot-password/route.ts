import { createHash, randomBytes } from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { sendPasswordReset } from '@/lib/email'
import { authRatelimit, checkRateLimit } from '@/lib/ratelimit'
import { getGuideRequestContext } from '@/lib/guide-auth'

export async function POST(req: NextRequest) {
  const context = getGuideRequestContext(req)
  const limited = await checkRateLimit(req, authRatelimit)
  if (limited) return limited

  try {
    const { email } = await req.json()
    if (!email) return NextResponse.json({ error: 'Email requis' }, { status: 400 })

    // Vérifier si l'utilisateur existe
    const user = await prisma.user.findUnique({ where: { email } })

    // Toujours retourner succès pour ne pas révéler si l'email existe
    if (!user) {
      return NextResponse.json({ success: true })
    }

    // Générer un token unique
    const token = randomBytes(32).toString('hex')
    const tokenHash = createHash('sha256').update(token).digest('hex')
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 heure

    await prisma.$transaction(async tx => {
      await tx.passwordResetToken.deleteMany({ where: { email } })
      await tx.passwordResetToken.create({
        data: { email, token: tokenHash, expiresAt },
      })
      await tx.auditLog.create({
        data: {
          actor: email,
          actorRole: 'CLIENT',
          action: 'PELERIN_PASSWORD_RESET_REQUESTED',
          target: user.id,
          detail: JSON.stringify({ request: { country: context.country, city: context.city, device: context.device, browser: context.browser } }),
          ip: context.ip,
          userAgent: context.userAgent,
        },
      })
    })

    const baseUrl = process.env.NEXTAUTH_URL || 'https://safaruma.com'
    const resetUrl = `${baseUrl}/reinitialiser-mot-de-passe?token=${token}`
    try {
      await sendPasswordReset({
        to: email,
        name: user.firstName || user.name || '',
        resetUrl,
      })
      await prisma.auditLog.create({
        data: {
          actor: email,
          actorRole: 'CLIENT',
          action: 'PELERIN_PASSWORD_RESET_EMAIL_SENT',
          target: user.id,
          ip: context.ip,
          userAgent: context.userAgent,
        },
      }).catch(() => {})
    } catch (error) {
      console.error('[forgot-password-email]', error)
      await prisma.$transaction([
        prisma.passwordResetToken.updateMany({
          where: { token: tokenHash, usedAt: null },
          data: { usedAt: new Date() },
        }),
        prisma.auditLog.create({
          data: {
            actor: email,
            actorRole: 'CLIENT',
            action: 'PELERIN_PASSWORD_RESET_EMAIL_FAILED',
            target: user.id,
            ip: context.ip,
            userAgent: context.userAgent,
          },
        }),
      ]).catch(() => {})
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[forgot-password]', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
