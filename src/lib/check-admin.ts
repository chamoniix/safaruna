import { isIndividualAdminToken, readVerifiedAdminToken } from '@/lib/admin-auth'
import type { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { createHash } from 'node:crypto'

export type AdminActor = {
  id: string | null
  email: string
  role: 'SUPERADMIN' | 'ADMIN'
}

/**
 * Vérification admin : cookie admin_session JWT valide uniquement.
 * Aligné avec le middleware qui impose la même contrainte sur /api/admin.
 * Aucun fallback NextAuth — une seule méthode d'auth admin.
 */
export async function checkAdmin(req: NextRequest): Promise<boolean> {
  return Boolean(await getAdminActor(req))
}

export async function getAdminActor(req: NextRequest): Promise<AdminActor | null> {
  const adminToken = req.cookies.get('admin_session')?.value
  if (!adminToken) return null

  const secret = process.env.ADMIN_JWT_SECRET
  if (!secret) {
    console.error('[SECURITY] ADMIN_JWT_SECRET manquant — accès admin refusé')
    return null
  }

  const payload = await readVerifiedAdminToken(adminToken, secret)
  if (!isIndividualAdminToken(payload)) return null

  const session = await prisma.adminSession.findUnique({
    where: { id: payload.sessionId },
    include: { adminAccount: { select: { id: true, email: true, role: true, status: true } } },
  })
  const tokenHash = createHash('sha256').update(adminToken).digest('hex')
  if (
    !session || session.tokenHash !== tokenHash || session.revokedAt || session.expiresAt <= new Date()
    || session.adminAccount.id !== payload.adminId || session.adminAccount.email !== payload.email
    || session.adminAccount.role !== payload.role || session.adminAccount.status !== 'ACTIVE'
  ) return null

  if (Date.now() - session.lastSeenAt.getTime() > 5 * 60 * 1000) {
    prisma.adminSession.update({ where: { id: session.id }, data: { lastSeenAt: new Date() } }).catch(() => {})
  }
  return {
    id: session.adminAccount.id,
    email: session.adminAccount.email,
    role: session.adminAccount.role,
  }
}
