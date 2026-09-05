import { Prisma } from '@prisma/client'
import { normalizePromoCode, promoDiscountCents } from '@/lib/referral'

export const REFERRAL_CODE_PREFIX = 'SAF-'

export class PromotionCampaignUnavailableError extends Error {}

export type PromotionCampaignSelection = {
  id: string
  code: string
  discountBps: number
}

export function isReservedReferralCode(code: string): boolean {
  return normalizePromoCode(code).startsWith(REFERRAL_CODE_PREFIX)
}

export async function findAvailablePromotionCampaign(input: {
  code: string
  pelerinId: string
  grossAmountCents: number
  now?: Date
}): Promise<(PromotionCampaignSelection & { discountAmountCents: number }) | null> {
  const now = input.now ?? new Date()
  const code = normalizePromoCode(input.code)
  if (!code || isReservedReferralCode(code)) return null

  const db = (await import('@/lib/prisma')).default
  const campaign = await db.promotionCampaign.findUnique({ where: { code } })
  if (!campaign || campaign.status !== 'ACTIVE' || campaign.startsAt > now || campaign.expiresAt <= now) return null
  if (campaign.discountBps <= 0 || campaign.discountBps >= 10_000) return null
  const activeUseFilter: Prisma.PromotionRedemptionWhereInput = {
    campaignId: campaign.id,
    OR: [
      { status: 'REDEEMED' },
      { status: 'HELD', reservationDraftId: { not: null } },
    ],
  }
  const [globalUses, userUses, budget] = await Promise.all([
    db.promotionRedemption.count({ where: activeUseFilter }),
    db.promotionRedemption.count({ where: { ...activeUseFilter, pelerinId: input.pelerinId } }),
    db.promotionRedemption.aggregate({ where: activeUseFilter, _sum: { discountAmountCents: true } }),
  ])
  if (campaign.maxRedemptions !== null && globalUses >= campaign.maxRedemptions) return null
  if (campaign.maxRedemptionsPerPelerin !== null && userUses >= campaign.maxRedemptionsPerPelerin) return null
  const discountAmountCents = promoDiscountCents(input.grossAmountCents, campaign.discountBps)
  if (discountAmountCents <= 0 || discountAmountCents >= input.grossAmountCents) return null
  const committedBudget = budget._sum.discountAmountCents ?? 0
  if (campaign.maxDiscountBudgetCents !== null && committedBudget + discountAmountCents > campaign.maxDiscountBudgetCents) return null
  return { id: campaign.id, code: campaign.code, discountBps: campaign.discountBps, discountAmountCents }
}

export async function holdPromotionCampaign(
  tx: Prisma.TransactionClient,
  input: {
    campaignId: string
    code: string
    discountBps: number
    pelerinId: string
    reservationDraftId: string
    grossAmountCents: number
    now?: Date
  },
) {
  const now = input.now ?? new Date()
  await tx.$queryRaw<Array<{ id: string }>>(
    Prisma.sql`SELECT "id" FROM "PromotionCampaign" WHERE "id" = ${input.campaignId} FOR UPDATE`,
  )
  const campaign = await tx.promotionCampaign.findUnique({ where: { id: input.campaignId } })
  if (
    !campaign || campaign.code !== input.code || campaign.status !== 'ACTIVE'
    || campaign.startsAt > now || campaign.expiresAt <= now
    || campaign.discountBps !== input.discountBps
    || campaign.discountBps <= 0 || campaign.discountBps >= 10_000
  ) throw new PromotionCampaignUnavailableError('PROMOTION_CAMPAIGN_UNAVAILABLE')

  const activeUseFilter: Prisma.PromotionRedemptionWhereInput = {
    campaignId: campaign.id,
    OR: [
      { status: 'REDEEMED' },
      { status: 'HELD', reservationDraftId: { not: null } },
    ],
  }
  const [globalUses, userUses, budget] = await Promise.all([
    tx.promotionRedemption.count({ where: activeUseFilter }),
    tx.promotionRedemption.count({ where: { ...activeUseFilter, pelerinId: input.pelerinId } }),
    tx.promotionRedemption.aggregate({
      where: activeUseFilter,
      _sum: { discountAmountCents: true },
    }),
  ])
  if (campaign.maxRedemptions !== null && globalUses >= campaign.maxRedemptions) {
    throw new PromotionCampaignUnavailableError('PROMOTION_CAMPAIGN_EXHAUSTED')
  }
  if (campaign.maxRedemptionsPerPelerin !== null && userUses >= campaign.maxRedemptionsPerPelerin) {
    throw new PromotionCampaignUnavailableError('PROMOTION_CAMPAIGN_USER_LIMIT')
  }
  const discountAmountCents = promoDiscountCents(input.grossAmountCents, campaign.discountBps)
  if (discountAmountCents <= 0 || discountAmountCents >= input.grossAmountCents) {
    throw new PromotionCampaignUnavailableError('PROMOTION_CAMPAIGN_INVALID_AMOUNT')
  }
  if (
    campaign.maxDiscountBudgetCents !== null
    && (budget._sum.discountAmountCents ?? 0) + discountAmountCents > campaign.maxDiscountBudgetCents
  ) throw new PromotionCampaignUnavailableError('PROMOTION_CAMPAIGN_BUDGET_EXHAUSTED')

  return tx.promotionRedemption.create({
    data: {
      campaignId: campaign.id,
      pelerinId: input.pelerinId,
      reservationDraftId: input.reservationDraftId,
      grossAmountCents: input.grossAmountCents,
      discountAmountCents,
      discountBpsSnapshot: campaign.discountBps,
      campaignCodeSnapshot: campaign.code,
    },
  })
}
