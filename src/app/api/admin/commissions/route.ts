import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/admin-auth';
import prisma from '@/lib/prisma';

async function checkAdmin(req: NextRequest) {
  const session = req.cookies.get('admin_session')?.value;
  const secret = process.env.ADMIN_JWT_SECRET ?? '';
  return session && await verifyAdminToken(session, secret);
}

export async function GET(req: NextRequest) {
  if (!await checkAdmin(req)) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const guides = await prisma.guideProfile.findMany({
    include: {
      user: { select: { name: true, firstName: true, lastName: true } },
      _count: { select: { reservations: true } },
    },
    orderBy: { user: { name: 'asc' } },
  });

  const revenueData = await Promise.all(
    guides.map(g =>
      prisma.reservation.aggregate({
        where: { guideProfileId: g.id, status: { in: ['CONFIRMED', 'COMPLETED'] } },
        _sum: { totalPrice: true },
      })
    )
  );

  return NextResponse.json({
    guides: guides.map((g, i) => ({
      id: g.id,
      slug: g.slug,
      name: g.user.name || `${g.user.firstName ?? ''} ${g.user.lastName ?? ''}`.trim() || '—',
      commissionRate: g.commissionRate,
      totalReservations: g._count.reservations,
      totalRevenue: Math.round(revenueData[i]._sum.totalPrice ?? 0),
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
