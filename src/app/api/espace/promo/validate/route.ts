import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { normalizePromoCode } from '@/lib/referral'
import { requirePelerin } from '@/lib/require-account'

export async function POST(req: NextRequest) {
  const access = await requirePelerin()
  if (!access.ok) return access.response
  const body = await req.json().catch(() => null) as { code?: unknown } | null
  const code = normalizePromoCode(typeof body?.code === 'string' ? body.code : '')
  if (!code) return NextResponse.json({ error: 'Saisissez un code promotionnel.' }, { status: 400 })
  const promo = await prisma.promoCode.findUnique({
    where: { code },
    select: { code: true, ownerId: true, status: true, expiresAt: true, reservedDraftId: true, discountBps: true },
  })
  if (!promo || promo.ownerId !== access.actor.id || promo.status !== 'ACTIVE' || promo.expiresAt <= new Date() || promo.reservedDraftId) {
    return NextResponse.json({ error: 'Ce code promotionnel est invalide, expiré ou déjà utilisé.' }, { status: 409 })
  }
  return NextResponse.json({ code: promo.code, discountPercent: promo.discountBps / 100 }, { headers: { 'Cache-Control': 'private, no-store' } })
}
