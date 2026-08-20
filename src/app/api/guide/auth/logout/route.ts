import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import {
  GUIDE_SESSION_COOKIE,
  hasTrustedGuideAuthOrigin,
  hashGuideSessionToken,
} from '@/lib/guide-auth'

export async function POST(req: NextRequest) {
  if (!hasTrustedGuideAuthOrigin(req)) {
    return NextResponse.json({ error: 'Requête non autorisée.' }, { status: 403 })
  }

  const token = req.cookies.get(GUIDE_SESSION_COOKIE)?.value
  if (token) {
    await prisma.guideSession.updateMany({
      where: { tokenHash: hashGuideSessionToken(token), revokedAt: null },
      data: { revokedAt: new Date() },
    }).catch(() => {})
  }

  const response = NextResponse.json(
    { success: true },
    { headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } },
  )
  response.cookies.set(GUIDE_SESSION_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0,
    expires: new Date(0),
    path: '/',
    priority: 'high',
  })
  return response
}
