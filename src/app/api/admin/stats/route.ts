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

  const [
    guidesActifs,
    guidesEnAttente,
    pelerinsInscrits,
    reservationsMois,
    allReservationsMois,
  ] = await Promise.all([
    prisma.guideProfile.count({ where: { status: 'ACTIVE' } }),
    prisma.guideProfile.count({ where: { status: 'REVIEW' } }),
    prisma.user.count({ where: { role: 'PELERIN' } }),
    prisma.reservation.count({
      where: { createdAt: { gte: startOfMonth } }
    }),
    prisma.reservation.findMany({
      where: {
        createdAt: { gte: startOfMonth },
        status: { not: 'CANCELLED' }
      },
      select: { commissionAmount: true }
    }),
  ]);

  const commissionsMois = Math.round(
    allReservationsMois.reduce((sum, r) => sum + r.commissionAmount, 0)
  );

  return NextResponse.json({
    guidesActifs,
    guidesEnAttente,
    pelerinsInscrits,
    reservationsMois,
    commissionsMois,
    litigesOuverts: 0,
  });
}
