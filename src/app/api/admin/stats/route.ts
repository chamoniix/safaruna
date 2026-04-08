import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/admin-auth';
import prisma from '@/lib/prisma';

async function checkAdmin(req: NextRequest) {
  const session = req.cookies.get('admin_session')?.value;
  const secret = process.env.ADMIN_JWT_SECRET ?? '';
  return session && await verifyAdminToken(session, secret);
}

export async function GET(req: NextRequest) {
  if (!await checkAdmin(req))
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfYear  = new Date(now.getFullYear(), 0, 1);

  const [
    totalGuides,
    activeGuides,
    totalPelerins,
    totalReservations,
    reservationsThisMonth,
    allReservations,
    pendingReservations,
    confirmedReservations,
    guidesEnAttente,
  ] = await Promise.all([
    prisma.guideProfile.count(),
    prisma.guideProfile.count({ where: { status: 'ACTIVE' } }),
    prisma.user.count({ where: { role: 'PELERIN' } }),
    prisma.reservation.count(),
    prisma.reservation.count({ where: { createdAt: { gte: startOfMonth } } }),
    prisma.reservation.findMany({
      select: { totalPrice: true, commissionAmount: true, status: true, createdAt: true },
    }),
    prisma.reservation.count({ where: { status: 'PENDING' } }),
    prisma.reservation.count({ where: { status: 'CONFIRMED' } }),
    prisma.guideProfile.count({ where: { status: { in: ['DRAFT', 'REVIEW'] } } }),
  ]);

  const completed   = allReservations.filter(r => r.status === 'COMPLETED');
  const notCancelled = allReservations.filter(r => r.status !== 'CANCELLED');

  const totalRevenue     = notCancelled.reduce((s, r) => s + r.totalPrice, 0);
  const totalCommission  = notCancelled.reduce((s, r) => s + r.commissionAmount, 0);
  const revenueThisMonth = allReservations
    .filter(r => r.status !== 'CANCELLED' && new Date(r.createdAt) >= startOfMonth)
    .reduce((s, r) => s + r.totalPrice, 0);
  const revenueThisYear  = allReservations
    .filter(r => r.status !== 'CANCELLED' && new Date(r.createdAt) >= startOfYear)
    .reduce((s, r) => s + r.totalPrice, 0);

  // Revenue per month for current year (index 0=Jan … 11=Dec)
  const revenueByMonth = Array.from({ length: 12 }, (_, m) =>
    allReservations
      .filter(r => {
        const d = new Date(r.createdAt);
        return r.status !== 'CANCELLED' && d.getFullYear() === now.getFullYear() && d.getMonth() === m;
      })
      .reduce((s, r) => s + r.totalPrice, 0)
  );

  return NextResponse.json({
    guides: { total: totalGuides, active: activeGuides, pending: guidesEnAttente },
    pelerins: { total: totalPelerins },
    reservations: {
      total: totalReservations,
      thisMonth: reservationsThisMonth,
      pending: pendingReservations,
      confirmed: confirmedReservations,
      completed: completed.length,
      cancelled: allReservations.filter(r => r.status === 'CANCELLED').length,
    },
    revenue: {
      total: Math.round(totalRevenue),
      thisMonth: Math.round(revenueThisMonth),
      thisYear: Math.round(revenueThisYear),
      commission: Math.round(totalCommission),
      byMonth: revenueByMonth.map(v => Math.round(v)),
    },
    // kept for backward compat with /admin/tableau-de-bord
    guidesActifs: activeGuides,
    pelerinsInscrits: totalPelerins,
    reservationsMois: reservationsThisMonth,
    commissionsMois: Math.round(totalCommission),
    guidesEnAttente,
    litigesOuverts: 0,
  });
}
