import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { adminAuditDetail, adminAuditFields, getAdminActor, getAdminAuditContext } from '@/lib/check-admin'
import { isReservedReferralCode } from '@/lib/promotion-campaign'
import { normalizePromoCode } from '@/lib/referral'

const campaignFields = z.object({
  name: z.string().trim().min(2).max(120),
  code: z.string().trim().min(3).max(64),
  discountPercent: z.number().min(0.01).lt(100),
  startsAt: z.string().datetime(),
  expiresAt: z.string().datetime(),
  maxRedemptions: z.number().int().positive().nullable(),
  maxRedemptionsPerPelerin: z.number().int().positive().nullable(),
  maxDiscountBudgetEuros: z.number().positive().nullable(),
})
const createSchema = campaignFields
const updateSchema = campaignFields.partial().extend({
  id: z.string().min(1),
  status: z.enum(['ACTIVE', 'DISABLED']).optional(),
})

class CampaignReactivationError extends Error {}

function limitsAreConsistent(maxRedemptions: number | null, maxPerPelerin: number | null): boolean {
  return maxRedemptions === null || maxPerPelerin === null || maxPerPelerin <= maxRedemptions
}

function campaignAuditSnapshot(campaign: {
  name: string; code: string; status: string; discountBps: number
  startsAt: Date; expiresAt: Date; maxRedemptions: number | null
  maxRedemptionsPerPelerin: number | null; maxDiscountBudgetCents: number | null
}) {
  return {
    name: campaign.name, code: campaign.code, status: campaign.status,
    discountBps: campaign.discountBps,
    startsAt: campaign.startsAt.toISOString(), expiresAt: campaign.expiresAt.toISOString(),
    maxRedemptions: campaign.maxRedemptions,
    maxRedemptionsPerPelerin: campaign.maxRedemptionsPerPelerin,
    maxDiscountBudgetCents: campaign.maxDiscountBudgetCents,
  }
}

export async function GET(req: NextRequest) {
  const actor = await getAdminActor(req)
  if (!actor) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const [campaigns, redemptionStats] = await Promise.all([
    prisma.promotionCampaign.findMany({
      include: { createdByAdmin: { select: { email: true } } },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.promotionRedemption.groupBy({
      by: ['campaignId', 'status'],
      _count: { _all: true },
      _sum: { discountAmountCents: true },
    }),
  ])
  return NextResponse.json({
    campaigns: campaigns.map(campaign => {
      const stats = redemptionStats.filter(item => item.campaignId === campaign.id)
      const redeemed = stats.find(item => item.status === 'REDEEMED')
      return {
        ...campaign,
        status: campaign.status === 'ACTIVE' && campaign.expiresAt <= new Date() ? 'EXPIRED' : campaign.status,
        discountPercent: campaign.discountBps / 100,
        maxDiscountBudgetEuros: campaign.maxDiscountBudgetCents === null ? null : campaign.maxDiscountBudgetCents / 100,
        redeemedCount: redeemed?._count._all ?? 0,
        heldCount: stats.find(item => item.status === 'HELD')?._count._all ?? 0,
        promotionExpenseEuros: (redeemed?._sum.discountAmountCents ?? 0) / 100,
      }
    }),
    canEdit: actor.role === 'SUPERADMIN',
  })
}

export async function POST(req: NextRequest) {
  const actor = await getAdminActor(req)
  if (!actor) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  if (actor.role !== 'SUPERADMIN' || !actor.id) return NextResponse.json({ error: 'Modification réservée au Superadmin.' }, { status: 403 })
  const actorId = actor.id
  const parsed = createSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Paramètres de campagne invalides.' }, { status: 400 })
  const code = normalizePromoCode(parsed.data.code)
  const startsAt = new Date(parsed.data.startsAt)
  const expiresAt = new Date(parsed.data.expiresAt)
  if (isReservedReferralCode(code)) return NextResponse.json({ error: 'Le préfixe SAF- est réservé au parrainage.' }, { status: 400 })
  if (expiresAt <= startsAt) return NextResponse.json({ error: 'La date de fin doit suivre la date de début.' }, { status: 400 })
  if (!limitsAreConsistent(parsed.data.maxRedemptions, parsed.data.maxRedemptionsPerPelerin)) {
    return NextResponse.json({ error: 'La limite par pèlerin ne peut pas dépasser la limite globale.' }, { status: 400 })
  }
  const auditContext = getAdminAuditContext(req)
  try {
    const campaign = await prisma.$transaction(async tx => {
      const created = await tx.promotionCampaign.create({ data: {
        name: parsed.data.name,
        code,
        discountBps: Math.round(parsed.data.discountPercent * 100),
        startsAt,
        expiresAt,
        maxRedemptions: parsed.data.maxRedemptions,
        maxRedemptionsPerPelerin: parsed.data.maxRedemptionsPerPelerin,
        maxDiscountBudgetCents: parsed.data.maxDiscountBudgetEuros === null ? null : Math.round(parsed.data.maxDiscountBudgetEuros * 100),
        createdByAdminId: actorId,
      } })
      await tx.auditLog.create({ data: {
        actor: actor.email, actorRole: actor.role, actorAdminId: actorId,
        action: 'PROMOTION_CAMPAIGN_CREATED', target: created.id,
        detail: adminAuditDetail(auditContext), after: campaignAuditSnapshot(created), ...adminAuditFields(auditContext),
      } })
      return created
    })
    return NextResponse.json({ campaign }, { status: 201 })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json({ error: 'Ce code existe déjà.' }, { status: 409 })
    }
    throw error
  }
}

export async function PATCH(req: NextRequest) {
  const actor = await getAdminActor(req)
  if (!actor) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  if (actor.role !== 'SUPERADMIN' || !actor.id) return NextResponse.json({ error: 'Modification réservée au Superadmin.' }, { status: 403 })
  const actorId = actor.id
  const parsed = updateSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Paramètres de campagne invalides.' }, { status: 400 })
  const current = await prisma.promotionCampaign.findUnique({ where: { id: parsed.data.id } })
  if (!current) return NextResponse.json({ error: 'Campagne introuvable.' }, { status: 404 })
  const code = parsed.data.code ? normalizePromoCode(parsed.data.code) : current.code
  if (isReservedReferralCode(code)) return NextResponse.json({ error: 'Le préfixe SAF- est réservé au parrainage.' }, { status: 400 })
  const startsAt = parsed.data.startsAt ? new Date(parsed.data.startsAt) : current.startsAt
  const expiresAt = parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : current.expiresAt
  if (expiresAt <= startsAt) return NextResponse.json({ error: 'La date de fin doit suivre la date de début.' }, { status: 400 })
  const maxRedemptions = parsed.data.maxRedemptions === undefined ? current.maxRedemptions : parsed.data.maxRedemptions
  const maxRedemptionsPerPelerin = parsed.data.maxRedemptionsPerPelerin === undefined
    ? current.maxRedemptionsPerPelerin
    : parsed.data.maxRedemptionsPerPelerin
  if (!limitsAreConsistent(maxRedemptions, maxRedemptionsPerPelerin)) {
    return NextResponse.json({ error: 'La limite par pèlerin ne peut pas dépasser la limite globale.' }, { status: 400 })
  }
  const auditContext = getAdminAuditContext(req)
  try {
    const updated = await prisma.$transaction(async tx => {
      await tx.$queryRaw<Array<{ id: string }>>(
        Prisma.sql`SELECT "id" FROM "PromotionCampaign" WHERE "id" = ${current.id} FOR UPDATE`,
      )
      if (parsed.data.status === 'ACTIVE') {
        const now = new Date()
        if (expiresAt <= now) throw new CampaignReactivationError('Cette campagne est déjà expirée.')
        const activeUseFilter: Prisma.PromotionRedemptionWhereInput = {
          campaignId: current.id,
          OR: [
            { status: 'REDEEMED' },
            { status: 'HELD', reservationDraftId: { not: null } },
          ],
        }
        const [uses, budget] = await Promise.all([
          tx.promotionRedemption.count({ where: activeUseFilter }),
          tx.promotionRedemption.aggregate({ where: activeUseFilter, _sum: { discountAmountCents: true } }),
        ])
        const budgetCents = parsed.data.maxDiscountBudgetEuros === undefined
          ? current.maxDiscountBudgetCents
          : parsed.data.maxDiscountBudgetEuros === null
            ? null
            : Math.round(parsed.data.maxDiscountBudgetEuros * 100)
        if (maxRedemptions !== null && uses >= maxRedemptions) {
          throw new CampaignReactivationError('Augmentez la limite globale avant de réactiver cette campagne.')
        }
        if (budgetCents !== null && (budget._sum.discountAmountCents ?? 0) >= budgetCents) {
          throw new CampaignReactivationError('Augmentez le budget avant de réactiver cette campagne.')
        }
      }
      const after = await tx.promotionCampaign.update({
        where: { id: current.id },
        data: {
          ...(parsed.data.name !== undefined ? { name: parsed.data.name } : {}),
          ...(parsed.data.code !== undefined ? { code } : {}),
          ...(parsed.data.discountPercent !== undefined ? { discountBps: Math.round(parsed.data.discountPercent * 100) } : {}),
          ...(parsed.data.startsAt !== undefined ? { startsAt } : {}),
          ...(parsed.data.expiresAt !== undefined ? { expiresAt } : {}),
          ...(parsed.data.maxRedemptions !== undefined ? { maxRedemptions } : {}),
          ...(parsed.data.maxRedemptionsPerPelerin !== undefined ? { maxRedemptionsPerPelerin } : {}),
          ...(parsed.data.maxDiscountBudgetEuros !== undefined ? { maxDiscountBudgetCents: parsed.data.maxDiscountBudgetEuros === null ? null : Math.round(parsed.data.maxDiscountBudgetEuros * 100) } : {}),
          ...(parsed.data.status !== undefined ? { status: parsed.data.status } : {}),
        },
      })
      await tx.auditLog.create({ data: {
        actor: actor.email, actorRole: actor.role, actorAdminId: actorId,
        action: 'PROMOTION_CAMPAIGN_UPDATED', target: current.id,
        detail: adminAuditDetail(auditContext), before: campaignAuditSnapshot(current), after: campaignAuditSnapshot(after), ...adminAuditFields(auditContext),
      } })
      return after
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable })
    return NextResponse.json({ campaign: updated })
  } catch (error) {
    if (error instanceof CampaignReactivationError) {
      return NextResponse.json({ error: error.message }, { status: 409 })
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json({ error: 'Ce code existe déjà.' }, { status: 409 })
    }
    throw error
  }
}
