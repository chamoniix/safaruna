import { NextRequest, NextResponse } from 'next/server';
import { checkAdmin } from '@/lib/check-admin';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  if (!await checkAdmin(req)) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const page = Number(req.nextUrl.searchParams.get('page') || '1')
  const take = 50
  const skip = (page - 1) * take

  const users = await prisma.user.findMany({
    where: { role: 'PELERIN' },
    include: {
      reservations: { select: { id: true, totalPrice: true, status: true } },
    },
    orderBy: { createdAt: 'desc' },
    take,
    skip,
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
    page,
    pageSize: take,
  });
}
