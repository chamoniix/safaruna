import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { checkAdmin } from '@/lib/check-admin'

export async function GET(req: NextRequest) {
  if (!await checkAdmin(req)) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const referrals = await prisma.referral.findMany({
    orderBy: { createdAt: 'desc' },
    take: 200,
    include: {
      sponsor: { select: { name: true, firstName: true, lastName: true, email: true } },
      referredUser: { select: { name: true, firstName: true, lastName: true, email: true } },
      qualifiedReservation: { select: { refNumber: true, totalPrice: true, createdAt: true } },
      promoCodes: { select: { code: true, kind: true, status: true, discountBps: true, expiresAt: true, redeemedAt: true } },
    },
  })
  return NextResponse.json({
    referrals: referrals.map(referral => ({
      id: referral.id,
      status: referral.status,
      createdAt: referral.createdAt.toISOString(),
      qualifiedAt: referral.qualifiedAt?.toISOString() || null,
      sponsor: referral.sponsor,
      referred: referral.referredUser,
      payment: referral.qualifiedReservation ? {
        refNumber: referral.qualifiedReservation.refNumber,
        totalPrice: referral.qualifiedReservation.totalPrice,
        createdAt: referral.qualifiedReservation.createdAt.toISOString(),
      } : null,
      promoCodes: referral.promoCodes.map(code => ({ ...code, discountPercent: code.discountBps / 100, expiresAt: code.expiresAt.toISOString(), redeemedAt: code.redeemedAt?.toISOString() || null })),
    })),
  }, { headers: { 'Cache-Control': 'private, no-store, max-age=0' } })
}
