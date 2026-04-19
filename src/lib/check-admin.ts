import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { verifyAdminToken } from '@/lib/admin-auth'
import type { NextRequest } from 'next/server'

/**
 * Double vérification admin :
 * 1. Cookie admin_session JWT valide → accès immédiat (priorité)
 * 2. Session NextAuth avec rôle ADMIN → accès accordé
 * 3. Session NextAuth PELERIN ou GUIDE → refus immédiat
 * 4. Aucune session ni cookie valide → refus
 */
export async function checkAdmin(req: NextRequest): Promise<boolean> {
  // Priority 1: valid admin JWT cookie (custom admin login)
  const adminToken = req.cookies.get('admin_session')?.value
  if (adminToken) {
    const secret = process.env.ADMIN_JWT_SECRET
    if (!secret) {
      console.error('[SECURITY] ADMIN_JWT_SECRET manquant — accès admin refusé')
      return false
    }
    const isValid = await verifyAdminToken(adminToken, secret)
    if (isValid) return true
    // Cookie présent mais invalide → refus immédiat, pas de fallback NextAuth
    return false
  }

  // Priority 2: NextAuth session (future-proof ADMIN role)
  const session = await getServerSession(authOptions)
  if (session?.user) {
    const role = (session.user as any).role
    if (role === 'ADMIN' || role === 'SUPER_ADMIN') return true
    // Explicitly deny PELERIN and GUIDE even if they somehow have an admin cookie
    return false
  }

  return false
}
