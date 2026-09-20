import { createHash, randomBytes } from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { sendPasswordReset } from '@/lib/email'
import { authRatelimit, checkRateLimit } from '@/lib/ratelimit'
import { getGuideRequestContext } from '@/lib/guide-auth'

function safePelerinRedirect(value: unknown): string {
  if (typeof value !== 'string' || !value || value.length > 2048 || !value.startsWith('/') || value.startsWith('//') || value.includes('\\')) return ''
  try {
    const url = new URL(value, 'https://safaruma.com')
    if (url.origin !== 'https://safaruma.com') return ''
    if (url.pathname !== '/avis/deposer' && !url.pathname.startsWith('/avis/guide/') && url.pathname !== '/guides' && !url.pathname.startsWith('/guides/') && url.pathname !== '/espace' && !url.pathname.startsWith('/espace/')) return ''
    return `${url.pathname}${url.search}${url.hash}`
  } catch { return '' }
}

export async function POST(req: NextRequest) {
  const context = getGuideRequestContext(req)
  const limited = await checkRateLimit(req, authRatelimit)
  if (limited) return limited

  try {
    const { email, redirect } = await req.json()
    const redirectTo = safePelerinRedirect(redirect)
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
    const resetParams = new URLSearchParams({ token })
    if (redirectTo) resetParams.set('redirect', redirectTo)
    const resetUrl = `${baseUrl}/reinitialiser-mot-de-passe?${resetParams.toString()}`
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
