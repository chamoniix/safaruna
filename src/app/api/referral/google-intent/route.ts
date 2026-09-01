import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { normalizePromoCode } from '@/lib/referral'
import { createReferralIntentCookie, REFERRAL_OAUTH_COOKIE } from '@/lib/referral-oauth'
import { apiRatelimit, checkRateLimit } from '@/lib/ratelimit'

const INTENT_DURATION_MS = 10 * 60_000

export async function POST(req: NextRequest) {
  const limited = await checkRateLimit(req, apiRatelimit)
  if (limited) return limited
  const body = await req.json().catch(() => null) as { ref?: unknown } | null
  const code = normalizePromoCode(typeof body?.ref === 'string' ? body.ref : '')
  if (!code) return NextResponse.json({ error: 'Lien de parrainage invalide.' }, { status: 400 })

  const referralCode = await prisma.referralCode.findUnique({ where: { code }, select: { id: true } })
  if (!referralCode) return NextResponse.json({ error: 'Lien de parrainage invalide.' }, { status: 400 })

  const expiresAt = new Date(Date.now() + INTENT_DURATION_MS)
  const intent = await prisma.referralOAuthIntent.create({ data: { referralCodeId: referralCode.id, expiresAt } })
  const response = NextResponse.json({ ok: true })
  response.cookies.set(REFERRAL_OAUTH_COOKIE, createReferralIntentCookie(intent.id, expiresAt), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: expiresAt,
    priority: 'high',
  })
  return response
}
