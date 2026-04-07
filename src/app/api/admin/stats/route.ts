import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/admin-auth';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const session = req.cookies.get('admin_session')?.value;
  const secret = process.env.ADMIN_JWT_SECRET ?? '';
  if (!session || !(await verifyAdminToken(session, secret))) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [guidesActifs, pelerinsInscrits, reservationsMois, commissions, guidesEnAttente] = await Promise.all([
    prisma.guideProfile.count({ where: { status: 'ACTIVE' } }),
    prisma.user.count({ where: { role: 'PELERIN' } }),
    prisma.reservation.count({ where: { createdAt: { gte: startOfMonth } } }),
    prisma.reservation.aggregate({ where: { createdAt: { gte: startOfMonth }, status: { in: ['CONFIRMED', 'COMPLETED'] } }, _sum: { commissionAmount: true } }),
    prisma.guideProfile.count({ where: { status: { in: ['DRAFT', 'REVIEW'] } } }),
  ]);

  return NextResponse.json({
    guidesActifs,
    pelerinsInscrits,
    reservationsMois,
    commissionsMois: Math.round(commissions._sum.commissionAmount || 0),
    guidesEnAttente,
    litigesOuverts: 0, // À brancher quand le modèle Litige sera créé
  });
}
