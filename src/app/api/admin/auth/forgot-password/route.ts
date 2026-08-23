import { createHash, randomBytes } from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { sendAdminPasswordReset } from '@/lib/email'
import { adminAuthRatelimit, checkRateLimitKey } from '@/lib/ratelimit'
import { adminAuditDetail, adminAuditFields, getAdminAuditContext } from '@/lib/check-admin'

const GENERIC_RESPONSE = { success: true }

export async function POST(req: NextRequest) {
  const context = getAdminAuditContext(req)

  try {
    const body = await req.json()
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''

    const limited = await checkRateLimitKey(adminAuthRatelimit, `${context.ip}:${email || 'missing'}:reset`)
    if (limited) return limited
    if (!email) return NextResponse.json(GENERIC_RESPONSE)

    const account = await prisma.adminAccount.findUnique({ where: { email } })
    if (!account || account.status !== 'ACTIVE') return NextResponse.json(GENERIC_RESPONSE)

    const token = randomBytes(32).toString('hex')
    const tokenHash = createHash('sha256').update(token).digest('hex')
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000)
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXTAUTH_URL || 'https://safaruma.com'
    const resetUrl = `${baseUrl}/admin/reinitialiser-mot-de-passe?token=${token}`

    await prisma.$transaction(async tx => {
      await tx.adminPasswordResetToken.updateMany({
        where: { adminAccountId: account.id, usedAt: null },
        data: { usedAt: new Date() },
      })
      await tx.adminPasswordResetToken.create({
        data: { adminAccountId: account.id, tokenHash, expiresAt },
      })
      await tx.auditLog.create({
        data: {
          actor: account.email,
          actorRole: account.role,
          actorAdminId: account.id,
          action: 'ADMIN_PASSWORD_RESET_REQUESTED',
          target: account.id,
          detail: adminAuditDetail(context),
          ...adminAuditFields(context),
        },
      })
    })

    try {
      await sendAdminPasswordReset({
        to: account.email,
        name: account.name || '',
        resetUrl,
      })
    } catch (error) {
      console.error('[admin-forgot-password-email]', error)
      await prisma.$transaction([
        prisma.adminPasswordResetToken.updateMany({
          where: { tokenHash, usedAt: null },
          data: { usedAt: new Date() },
        }),
        prisma.auditLog.create({
          data: {
            actor: account.email,
            actorRole: account.role,
            actorAdminId: account.id,
            action: 'ADMIN_PASSWORD_RESET_EMAIL_FAILED',
            target: account.id,
            detail: adminAuditDetail(context),
            ...adminAuditFields(context),
          },
        }),
      ]).catch(() => {})
    }

    return NextResponse.json(GENERIC_RESPONSE)
  } catch (error) {
    console.error('[admin-forgot-password]', error)
    return NextResponse.json({ error: 'Envoi temporairement indisponible.' }, { status: 503 })
  }
}
