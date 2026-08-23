import { NextRequest, NextResponse } from 'next/server';
import { checkAdmin } from '@/lib/check-admin';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  if (!await checkAdmin(req))
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfYear = new Date(now.getFullYear(), 0, 1);

  const [
    totalGuides,
    guidesActifs,
    guidesEnAttente,
    pelerinsInscrits,
    totalReservations,
    reservationsMois,
    reservationsByStatus,
    revenueTotal,
    revenueMois,
    revenueAnnee,
    reservationsAnnee,
  ] = await Promise.all([
    prisma.guideProfile.count(),
    prisma.guideProfile.count({ where: { status: 'ACTIVE' } }),
    prisma.guideApplication.count({ where: { status: { in: ['PENDING', 'IN_REVIEW'] } } }),
    prisma.user.count({ where: { role: 'PELERIN' } }),
    prisma.reservation.count(),
    prisma.reservation.count({
      where: { createdAt: { gte: startOfMonth } }
    }),
    prisma.reservation.groupBy({
      by: ['status'],
      _count: { _all: true },
    }),
    prisma.reservation.aggregate({
      where: { status: { not: 'CANCELLED' } },
      _sum: { totalPrice: true, commissionAmount: true },
    }),
    prisma.reservation.aggregate({
      where: { createdAt: { gte: startOfMonth }, status: { not: 'CANCELLED' } },
      _sum: { totalPrice: true, commissionAmount: true },
    }),
    prisma.reservation.aggregate({
      where: { createdAt: { gte: startOfYear }, status: { not: 'CANCELLED' } },
      _sum: { totalPrice: true },
    }),
    prisma.reservation.findMany({
      where: { createdAt: { gte: startOfYear }, status: { not: 'CANCELLED' } },
      select: { createdAt: true, totalPrice: true },
    }),
  ]);

  const statusCount = new Map(
    reservationsByStatus.map(row => [row.status, row._count._all])
  );
  const revenueByMonth = Array.from({ length: 12 }, () => 0);
  for (const reservation of reservationsAnnee) {
    revenueByMonth[reservation.createdAt.getMonth()] += reservation.totalPrice;
  }

  const commissionsMois = Math.round(revenueMois._sum.commissionAmount ?? 0);

  return NextResponse.json({
    guides: { total: totalGuides, active: guidesActifs, pending: guidesEnAttente },
    pelerins: { total: pelerinsInscrits },
    reservations: {
      total: totalReservations,
      thisMonth: reservationsMois,
      pending: statusCount.get('PENDING') ?? 0,
      confirmed: statusCount.get('CONFIRMED') ?? 0,
      completed: statusCount.get('COMPLETED') ?? 0,
      cancelled: statusCount.get('CANCELLED') ?? 0,
    },
    revenue: {
      total: Math.round(revenueTotal._sum.totalPrice ?? 0),
      thisMonth: Math.round(revenueMois._sum.totalPrice ?? 0),
      thisYear: Math.round(revenueAnnee._sum.totalPrice ?? 0),
      commission: Math.round(revenueTotal._sum.commissionAmount ?? 0),
      byMonth: revenueByMonth.map(value => Math.round(value)),
    },
    guidesActifs: guidesActifs,
    guidesEnAttente,
    pelerinsInscrits: pelerinsInscrits,
    reservationsMois: reservationsMois,
    commissionsMois: commissionsMois,
    litigesOuverts: 0,
  });
}
