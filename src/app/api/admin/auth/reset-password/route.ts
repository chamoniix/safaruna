import { createHash } from 'node:crypto'
import bcrypt from 'bcryptjs'
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { adminAuthRatelimit, checkRateLimitKey } from '@/lib/ratelimit'
import { adminAuditDetail, adminAuditFields, getAdminAuditContext } from '@/lib/check-admin'

export async function POST(req: NextRequest) {
  const context = getAdminAuditContext(req)

  try {
    const body = await req.json()
    const token = typeof body.token === 'string' ? body.token.trim() : ''
    const password = typeof body.password === 'string' ? body.password : ''
    const limited = await checkRateLimitKey(adminAuthRatelimit, `${context.ip}:admin-reset`)

    if (limited) return limited
    if (!token || password.length < 8) {
      return NextResponse.json({ error: 'Lien invalide ou mot de passe trop court.' }, { status: 400 })
    }

    const tokenHash = createHash('sha256').update(token).digest('hex')
    const resetToken = await prisma.adminPasswordResetToken.findUnique({
      where: { tokenHash },
      include: { adminAccount: true },
    })

    if (
      !resetToken
      || resetToken.usedAt
      || resetToken.expiresAt <= new Date()
      || resetToken.adminAccount.status !== 'ACTIVE'
    ) {
      return NextResponse.json({ error: 'Lien invalide ou expiré.' }, { status: 400 })
    }

    const passwordHash = await bcrypt.hash(password, 12)
    const now = new Date()

    await prisma.$transaction(async tx => {
      const claimed = await tx.adminPasswordResetToken.updateMany({
        where: { id: resetToken.id, usedAt: null, expiresAt: { gt: now } },
        data: { usedAt: now },
      })
      if (claimed.count !== 1) throw new Error('RESET_TOKEN_ALREADY_USED')

      await tx.adminAccount.update({
        where: { id: resetToken.adminAccountId },
        data: { passwordHash },
      })
      await tx.adminSession.updateMany({
        where: { adminAccountId: resetToken.adminAccountId, revokedAt: null },
        data: { revokedAt: now },
      })
      await tx.auditLog.create({
        data: {
          actor: resetToken.adminAccount.email,
          actorRole: resetToken.adminAccount.role,
          actorAdminId: resetToken.adminAccount.id,
          action: 'ADMIN_PASSWORD_RESET_COMPLETED',
          target: resetToken.adminAccount.id,
          detail: adminAuditDetail(context),
          ...adminAuditFields(context),
        },
      })
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof Error && error.message === 'RESET_TOKEN_ALREADY_USED') {
      return NextResponse.json({ error: 'Ce lien a déjà été utilisé.' }, { status: 400 })
    }
    console.error('[admin-reset-password]', error)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}
