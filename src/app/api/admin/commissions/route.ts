import { NextRequest, NextResponse } from 'next/server';
import { getAdminActor } from '@/lib/check-admin';
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
      commissionRate: g.commissionRate,
      totalReservations: g._count.reservations,
      totalRevenue: Math.round(revenueMap.get(g.id)?.totalPrice ?? 0),
      totalCommission: Math.round(revenueMap.get(g.id)?.commissionAmount ?? 0),
    })),
  });
}

export async function PATCH(req: NextRequest) {
  const actor = await getAdminActor(req);
  if (!actor) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const { guideId, commissionRate } = await req.json();
  const rate = Number(commissionRate);
  if (!guideId || isNaN(rate) || rate <= 0 || rate > 0.5)
    return NextResponse.json({ error: 'Taux invalide (0 < taux ≤ 50%)' }, { status: 400 });

  const previous = await prisma.guideProfile.findUnique({ where: { id: guideId }, select: { commissionRate: true } });
  if (!previous) return NextResponse.json({ error: 'Guide introuvable' }, { status: 404 });
  await prisma.$transaction([
    prisma.guideProfile.update({ where: { id: guideId }, data: { commissionRate: rate } }),
    prisma.auditLog.create({ data: { actor: actor.email, actorRole: actor.role, actorAdminId: actor.id, action: 'GUIDE_COMMISSION_UPDATED', target: guideId, before: { commissionRate: previous.commissionRate }, after: { commissionRate: rate } } }),
  ]);
  return NextResponse.json({ success: true });
}
