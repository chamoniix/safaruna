import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getOrCreateReferralCode } from '@/lib/referral'
import { requirePelerin } from '@/lib/require-account'

function publicName(user: { name: string | null; firstName: string | null; lastName: string | null; email: string | null }): string {
  const first = user.firstName || user.name?.split(' ')[0] || 'Pèlerin'
  const lastInitial = user.lastName?.trim().slice(0, 1)
  return lastInitial ? `${first} ${lastInitial}.` : first
}

export async function GET() {
  const access = await requirePelerin()
  if (!access.ok) return access.response

  const [referralCode, referrals, promoCodes] = await Promise.all([
    getOrCreateReferralCode(access.actor.id),
    prisma.referral.findMany({
      where: { sponsorId: access.actor.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        status: true,
        createdAt: true,
        qualifiedAt: true,
        referredUser: { select: { name: true, firstName: true, lastName: true, email: true } },
      },
    }),
    prisma.promoCode.findMany({
      where: { ownerId: access.actor.id },
      orderBy: { createdAt: 'desc' },
      select: { id: true, code: true, kind: true, status: true, discountBps: true, expiresAt: true, redeemedAt: true, createdAt: true },
    }),
  ])

  const now = new Date()
  return NextResponse.json({
    link: `https://safaruma.com/rejoindre?ref=${encodeURIComponent(referralCode.code)}`,
    code: referralCode.code,
    stats: {
      invited: referrals.length,
      qualified: referrals.filter(referral => referral.status === 'QUALIFIED').length,
      pending: referrals.filter(referral => referral.status === 'REGISTERED').length,
    },
    referrals: referrals.map(referral => ({
      id: referral.id,
      name: publicName(referral.referredUser),
      status: referral.status,
      createdAt: referral.createdAt.toISOString(),
      qualifiedAt: referral.qualifiedAt?.toISOString() || null,
    })),
    promoCodes: promoCodes.map(promo => ({
      id: promo.id,
      code: promo.code,
      kind: promo.kind,
      status: promo.expiresAt <= now && promo.status === 'ACTIVE' ? 'EXPIRED' : promo.status,
      discountPercent: promo.discountBps / 100,
      expiresAt: promo.expiresAt.toISOString(),
      redeemedAt: promo.redeemedAt?.toISOString() || null,
      daysRemaining: Math.max(0, Math.ceil((promo.expiresAt.getTime() - now.getTime()) / 86_400_000)),
    })),
  }, { headers: { 'Cache-Control': 'private, no-store, max-age=0' } })
}
