import { createHash } from 'node:crypto'
import { after, NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { authRatelimit, checkRateLimit } from '@/lib/ratelimit'
import { sendPelerinPasswordChanged } from '@/lib/email'
import { getGuideRequestContext } from '@/lib/guide-auth'

export async function POST(req: NextRequest) {
  const context = getGuideRequestContext(req)
  const limited = await checkRateLimit(req, authRatelimit)
  if (limited) return limited

  try {
    const { token, password } = await req.json()
    if (!token || !password) return NextResponse.json({ error: 'Token et mot de passe requis' }, { status: 400 })
    if (password.length < 8) return NextResponse.json({ error: 'Mot de passe trop court (8 caractères minimum)' }, { status: 400 })

    const tokenHash = createHash('sha256').update(token).digest('hex')
    const resetToken = await prisma.passwordResetToken.findUnique({ where: { token: tokenHash } })

    if (!resetToken) return NextResponse.json({ error: 'Lien invalide ou expiré' }, { status: 400 })
    if (resetToken.usedAt) return NextResponse.json({ error: 'Ce lien a déjà été utilisé' }, { status: 400 })
    if (new Date() > resetToken.expiresAt) return NextResponse.json({ error: 'Ce lien a expiré. Faites une nouvelle demande.' }, { status: 400 })
    const user = await prisma.user.findUnique({ where: { email: resetToken.email } })
    if (!user) return NextResponse.json({ error: 'Lien invalide ou expiré' }, { status: 400 })

    const passwordHash = await bcrypt.hash(password, 12)
    const now = new Date()
    await prisma.$transaction(async tx => {
      const claimed = await tx.passwordResetToken.updateMany({
        where: { id: resetToken.id, usedAt: null, expiresAt: { gt: now } },
        data: { usedAt: now },
      })
      if (claimed.count !== 1) throw new Error('RESET_TOKEN_ALREADY_USED')

      await tx.user.update({
        where: { id: user.id },
        data: { passwordHash },
      })
      await tx.passwordResetToken.updateMany({
        where: { email: resetToken.email, id: { not: resetToken.id }, usedAt: null },
        data: { usedAt: now },
      })
      await tx.auditLog.create({
        data: {
          actor: resetToken.email,
          actorRole: 'CLIENT',
          action: 'PELERIN_PASSWORD_RESET_COMPLETED',
          target: user.id,
          detail: JSON.stringify({ request: { country: context.country, city: context.city, device: context.device, browser: context.browser } }),
          ip: context.ip,
          userAgent: context.userAgent,
        },
      })
    })

    after(async () => {
      let action = 'PELERIN_PASSWORD_CHANGED_EMAIL_SENT'
      try {
        await sendPelerinPasswordChanged({
          to: resetToken.email,
          name: user.firstName || user.name || '',
          context: {
            date: now.toLocaleString('fr-FR', { timeZone: 'Asia/Riyadh' }),
            ip: context.ip,
            country: context.country,
            city: context.city,
            device: context.device,
            browser: context.browser,
          },
        })
      } catch (error) {
        action = 'PELERIN_PASSWORD_CHANGED_EMAIL_FAILED'
        console.error('[pelerin-password-changed-email]', error)
      }
      await prisma.auditLog.create({
        data: {
          actor: resetToken.email,
          actorRole: 'CLIENT',
          action,
          target: user.id,
          ip: context.ip,
          userAgent: context.userAgent,
        },
      }).catch(error => console.error('[pelerin-password-changed-email-audit]', error))
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof Error && error.message === 'RESET_TOKEN_ALREADY_USED') {
      return NextResponse.json({ error: 'Ce lien a déjà été utilisé' }, { status: 400 })
    }
    console.error('[reset-password]', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
