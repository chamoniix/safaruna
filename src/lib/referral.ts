import { randomBytes } from 'node:crypto'
import { Prisma } from '@prisma/client'
import prisma from '@/lib/prisma'

export const REFERRAL_PROMO_DISCOUNT_BPS = 1_000
export const REFERRAL_PROMO_VALIDITY_DAYS = 60

type Transaction = Prisma.TransactionClient

function randomCode(prefix: string): string {
  return `${prefix}-${randomBytes(6).toString('hex').toUpperCase()}`
}

export function normalizePromoCode(value: string): string {
  return value.trim().toUpperCase().replace(/\s+/g, '')
}

export function promoExpiry(from = new Date()): Date {
  const expiresAt = new Date(from)
  expiresAt.setUTCDate(expiresAt.getUTCDate() + REFERRAL_PROMO_VALIDITY_DAYS)
  return expiresAt
}

export async function getOrCreateReferralCode(userId: string) {
  const existing = await prisma.referralCode.findUnique({ where: { ownerId: userId } })
  if (existing) return existing

  try {
    return await prisma.referralCode.create({
      data: { ownerId: userId, code: randomCode('REF') },
    })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      const concurrent = await prisma.referralCode.findUnique({ where: { ownerId: userId } })
      if (concurrent) return concurrent
    }
    throw error
  }
}

export async function claimReferralForNewPelerin(
  tx: Transaction,
  input: { referralCode: string; referredUserId: string },
) {
  const normalizedCode = normalizePromoCode(input.referralCode)
  if (!normalizedCode) return null

  const source = await tx.referralCode.findUnique({
    where: { code: normalizedCode },
    select: { id: true, ownerId: true },
  })
  if (!source || source.ownerId === input.referredUserId) return null

  return claimReferralFromSource(tx, source, input.referredUserId)
}

async function claimReferralFromSource(
  tx: Transaction,
  source: { id: string; ownerId: string },
  referredUserId: string,
) {
  if (source.ownerId === referredUserId) return null

  const existing = await tx.referral.findUnique({
    where: { referredUserId },
    select: { id: true },
  })
  if (existing) return null

  const now = new Date()
  const promoCode = randomCode('SAF')
  const referral = await tx.referral.create({
    data: {
      referralCodeId: source.id,
      sponsorId: source.ownerId,
      referredUserId,
      promoCodes: {
        create: {
          code: promoCode,
          kind: 'REFERRED_SIGNUP',
          ownerId: referredUserId,
          discountBps: REFERRAL_PROMO_DISCOUNT_BPS,
          expiresAt: promoExpiry(now),
        },
      },
    },
    include: {
      promoCodes: { where: { kind: 'REFERRED_SIGNUP' }, select: { code: true, expiresAt: true, discountBps: true } },
    },
  })
  const promo = referral.promoCodes[0]
  return promo ? { referralId: referral.id, promo } : null
}

export async function claimReferralFromOAuthIntent(
  tx: Transaction,
  input: { intentId: string; referredUserId: string },
) {
  const now = new Date()
  const intent = await tx.referralOAuthIntent.findUnique({
    where: { id: input.intentId },
    include: { referralCode: { select: { id: true, ownerId: true } } },
  })
  if (!intent || intent.consumedAt || intent.expiresAt <= now) return null
  const consumed = await tx.referralOAuthIntent.updateMany({
    where: { id: intent.id, consumedAt: null, expiresAt: { gt: now } },
    data: { consumedAt: now },
  })
  if (consumed.count !== 1) return null
  return claimReferralFromSource(tx, intent.referralCode, input.referredUserId)
}

export async function expirePromoCodes(tx: Transaction, now = new Date()) {
  await tx.promoCode.updateMany({
    where: { status: { in: ['ACTIVE', 'HELD'] }, expiresAt: { lte: now } },
    data: { status: 'EXPIRED', reservedDraftId: null },
  })
}

export function promoDiscountCents(grossCents: number, discountBps: number): number {
  return Math.round(grossCents * discountBps / 10_000)
}
