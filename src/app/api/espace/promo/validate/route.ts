import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { normalizePromoCode } from '@/lib/referral'
import { requirePelerin } from '@/lib/require-account'
import { findAvailablePromotionCampaign } from '@/lib/promotion-campaign'
import { apiRatelimit, checkRateLimit } from '@/lib/ratelimit'
import { z } from 'zod'

const validatePromotionSchema = z.object({
  code: z.string().max(64),
  grossAmountCents: z.number().int().positive(),
})

export async function POST(req: NextRequest) {
  const limited = await checkRateLimit(req, apiRatelimit)
  if (limited) return limited
  const access = await requirePelerin()
  if (!access.ok) return access.response
  const parsed = validatePromotionSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Code ou montant invalide.' }, { status: 400 })
  const code = normalizePromoCode(parsed.data.code)
  if (!code) return NextResponse.json({ error: 'Saisissez un code promotionnel.' }, { status: 400 })
  const promo = await prisma.promoCode.findUnique({
    where: { code },
    select: { code: true, ownerId: true, status: true, expiresAt: true, reservedDraftId: true, discountBps: true },
  })
  if (promo && promo.ownerId === access.actor.id && promo.status === 'ACTIVE' && promo.expiresAt > new Date() && !promo.reservedDraftId) {
    return NextResponse.json({ code: promo.code, discountPercent: promo.discountBps / 100 }, { headers: { 'Cache-Control': 'private, no-store' } })
  }
  const campaign = await findAvailablePromotionCampaign({
    code,
    pelerinId: access.actor.id,
    grossAmountCents: parsed.data.grossAmountCents,
  })
  if (!campaign) return NextResponse.json({ error: 'Ce code promotionnel est invalide, expiré ou déjà utilisé.' }, { status: 409 })
  return NextResponse.json({ code: campaign.code, discountPercent: campaign.discountBps / 100 }, { headers: { 'Cache-Control': 'private, no-store' } })
}
