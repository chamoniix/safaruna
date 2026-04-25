import { NextRequest, NextResponse } from 'next/server';
import { checkAdmin } from '@/lib/check-admin';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  if (!await checkAdmin(req)) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const guides = await prisma.guideProfile.findMany({
    include: {
      user: { select: { name: true, firstName: true, lastName: true } },
      _count: { select: { reservations: true } },
    },
    orderBy: { user: { name: 'asc' } },
  });

  const revenueByGuide = await prisma.reservation.groupBy({
    by: ['guideProfileId'],
    _sum: { totalPrice: true, commissionAmount: true },
    where: { status: { in: ['CONFIRMED', 'COMPLETED'] } },
  });

  const revenueMap = new Map(
    revenueByGuide.map(r => [r.guideProfileId, r._sum])
  );

  return NextResponse.json({
    guides: guides.map(g => ({
      id: g.id,
      slug: g.slug,
      name: g.user.name || `${g.user.firstName ?? ''} ${g.user.lastName ?? ''}`.trim() || '—',
      commissionRate: g.commissionRate,
      totalReservations: g._count.reservations,
      totalRevenue: Math.round(revenueMap.get(g.id)?.totalPrice ?? 0),
      totalCommission: Math.round(revenueMap.get(g.id)?.commissionAmount ?? 0),
    })),
  });
}

export async function PATCH(req: NextRequest) {
  if (!await checkAdmin(req)) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const { guideId, commissionRate } = await req.json();
  const rate = Number(commissionRate);
  if (!guideId || isNaN(rate) || rate <= 0 || rate > 0.5)
    return NextResponse.json({ error: 'Taux invalide (0 < taux ≤ 50%)' }, { status: 400 });

  await prisma.guideProfile.update({ where: { id: guideId }, data: { commissionRate: rate } });
  return NextResponse.json({ success: true });
}
