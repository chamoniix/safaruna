import { isIndividualAdminToken, readVerifiedAdminToken } from '@/lib/admin-auth'
import type { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { createHash, randomUUID } from 'node:crypto'

export type AdminActor = {
  id: string | null
  email: string
  role: 'SUPERADMIN' | 'ADMIN'
}

export type AdminAuditContext = {
  ip: string
  country: string | null
  city: string | null
  device: 'MOBILE' | 'TABLET' | 'DESKTOP' | 'UNKNOWN'
  browser: string
  userAgent: string
  requestId: string
}

function decodedHeader(value: string | null): string | null {
  if (!value) return null
  try { return decodeURIComponent(value) } catch { return value }
}

function requestDevice(userAgent: string): AdminAuditContext['device'] {
  if (/ipad|tablet|kindle|silk/i.test(userAgent)) return 'TABLET'
  if (/mobi|iphone|ipod|android/i.test(userAgent)) return 'MOBILE'
  return userAgent ? 'DESKTOP' : 'UNKNOWN'
}

function requestBrowser(userAgent: string): string {
  if (/Edg\//i.test(userAgent)) return 'Edge'
  if (/Firefox\//i.test(userAgent)) return 'Firefox'
  if (/CriOS|Chrome\//i.test(userAgent)) return 'Chrome'
  if (/Safari\//i.test(userAgent)) return 'Safari'
  return userAgent ? 'Autre' : 'Inconnu'
}

export function getAdminAuditContext(req: NextRequest): AdminAuditContext {
  const userAgent = req.headers.get('user-agent') || ''
  return {
    ip: (req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown').slice(0, 64),
    country: req.headers.get('x-vercel-ip-country')?.slice(0, 32) || null,
    city: decodedHeader(req.headers.get('x-vercel-ip-city'))?.slice(0, 100) || null,
    device: requestDevice(userAgent),
    browser: requestBrowser(userAgent),
    userAgent: userAgent.slice(0, 500),
    requestId: (req.headers.get('x-request-id') || req.headers.get('x-vercel-id') || randomUUID()).slice(0, 160),
  }
}

export function adminAuditFields(context: AdminAuditContext) {
  return {
    ip: context.ip,
    userAgent: context.userAgent,
    requestId: context.requestId,
  }
}

export function adminAuditDetail(context: AdminAuditContext, detail: Record<string, unknown> = {}) {
  return JSON.stringify({
    ...detail,
    request: {
      country: context.country,
      city: context.city,
      device: context.device,
      browser: context.browser,
    },
  })
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
