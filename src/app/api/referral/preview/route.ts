import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { normalizePromoCode } from '@/lib/referral'
import { apiRatelimit, checkRateLimit } from '@/lib/ratelimit'

export async function GET(req: NextRequest) {
  const limited = await checkRateLimit(req, apiRatelimit)
  if (limited) return limited
  const code = normalizePromoCode(req.nextUrl.searchParams.get('ref') || '')
  if (!code) return NextResponse.json({ valid: false }, { headers: { 'Cache-Control': 'no-store' } })
  const referralCode = await prisma.referralCode.findUnique({ where: { code }, select: { id: true } })
  return NextResponse.json({ valid: Boolean(referralCode) }, { headers: { 'Cache-Control': 'no-store' } })
}
