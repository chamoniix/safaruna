import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { verifyAdminToken } from '@/lib/admin-auth'
import type { NextRequest } from 'next/server'

/**
 * Double vérification admin :
 * 1. Si une session NextAuth PELERIN ou GUIDE existe → refus immédiat
 * 2. Vérifie le JWT admin_session signé avec ADMIN_JWT_SECRET
 */
export async function checkAdmin(req: NextRequest): Promise<boolean> {
  // Deny any active NextAuth session with a non-admin role
  const session = await getServerSession(authOptions)
  if (session?.user) {
    const role = (session.user as any).role
    if (role === 'PELERIN' || role === 'GUIDE') return false
  }
  // Verify admin JWT cookie
  const adminToken = req.cookies.get('admin_session')?.value
  if (!adminToken) return false
  return verifyAdminToken(adminToken, process.env.ADMIN_JWT_SECRET ?? '')
}
