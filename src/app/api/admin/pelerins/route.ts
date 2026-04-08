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

  const users = await prisma.user.findMany({
    where: { role: 'PELERIN' },
    include: {
      reservations: { select: { id: true, totalPrice: true, status: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({
    pelerins: users.map(u => ({
      id: u.id,
      name: u.name || `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() || '—',
      email: u.email || '',
      firstName: u.firstName,
      lastName: u.lastName,
      country: u.country,
      phoneWhatsapp: u.phoneWhatsapp,
      createdAt: new Date(u.createdAt).toLocaleDateString('fr-FR'),
      lastLogin: u.lastLogin ? new Date(u.lastLogin).toLocaleDateString('fr-FR') : null,
      reservationCount: u.reservations.length,
      totalSpent: Math.round(
        u.reservations
          .filter(r => r.status === 'COMPLETED')
          .reduce((sum, r) => sum + r.totalPrice, 0)
      ),
    })),
  });
}
