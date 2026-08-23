import { NextRequest, NextResponse } from 'next/server';
import { getAdminActor } from '@/lib/check-admin';
import { GUIDE_SERVICE_MARKUP_BPS } from '@/lib/guide-pricing';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const actor = await getAdminActor(req);
  if (!actor) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const guides = await prisma.guideProfile.findMany({
    include: {
      guideAccount: { select: { displayName: true, firstName: true, lastName: true } },
      _count: { select: { reservations: true } },
    },
    orderBy: { guideAccount: { displayName: 'asc' } },
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
      name: g.guideAccount?.displayName || `${g.guideAccount?.firstName ?? ''} ${g.guideAccount?.lastName ?? ''}`.trim() || '—',
      totalReservations: g._count.reservations,
      totalRevenue: Math.round(revenueMap.get(g.id)?.totalPrice ?? 0),
      totalCommission: Math.round(revenueMap.get(g.id)?.commissionAmount ?? 0),
    })),
    markupRate: GUIDE_SERVICE_MARKUP_BPS / 100,
  });
}
