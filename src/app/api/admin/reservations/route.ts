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

  const reservations = await prisma.reservation.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      pelerin: { select: { name: true, firstName: true, lastName: true, email: true } },
      guideProfile: { select: { user: { select: { name: true, firstName: true, lastName: true } } } },
      package: { select: { name: true, durationDays: true } },
    },
  });

  return NextResponse.json({
    reservations: reservations.map(r => ({
      id: r.id,
      refNumber: r.refNumber,
      pelerin: r.pelerin.name
        || `${r.pelerin.firstName ?? ''} ${r.pelerin.lastName ?? ''}`.trim()
        || r.pelerin.email || '—',
      guide: r.guideProfile.user.name
        || `${r.guideProfile.user.firstName ?? ''} ${r.guideProfile.user.lastName ?? ''}`.trim()
        || '—',
      packageName: r.package.name,
      durationDays: r.package.durationDays,
      startDate: new Date(r.startDate).toLocaleDateString('fr-FR'),
      nbPeople: r.nbPeople,
      basePrice: r.basePrice,
      commissionAmount: r.commissionAmount,
      totalPrice: r.totalPrice,
      status: r.status,
      createdAt: new Date(r.createdAt).toLocaleDateString('fr-FR'),
    })),
  });
}

export async function PATCH(req: NextRequest) {
  if (!await checkAdmin(req))
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const { reservationId, status } = await req.json();

  const validStatuses = ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'];
  if (!validStatuses.includes(status))
    return NextResponse.json({ error: 'Statut invalide' }, { status: 400 });

  await prisma.reservation.update({
    where: { id: reservationId },
    data: { status },
  });

  return NextResponse.json({ success: true });
}
