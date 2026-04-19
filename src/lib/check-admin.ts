import { verifyAdminToken } from '@/lib/admin-auth'
import type { NextRequest } from 'next/server'

/**
 * Vérification admin : cookie admin_session JWT valide uniquement.
 * Aligné avec le middleware qui impose la même contrainte sur /api/admin.
 * Aucun fallback NextAuth — une seule méthode d'auth admin.
 */
export async function checkAdmin(req: NextRequest): Promise<boolean> {
  const adminToken = req.cookies.get('admin_session')?.value
  if (!adminToken) return false

  const secret = process.env.ADMIN_JWT_SECRET
  if (!secret) {
    console.error('[SECURITY] ADMIN_JWT_SECRET manquant — accès admin refusé')
    return false
  }

  return verifyAdminToken(adminToken, secret)
}
