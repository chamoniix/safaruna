import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requirePelerin } from '@/lib/require-account';

export async function GET() {
  const access = await requirePelerin();
  if (!access.ok) return access.response;

  const now = new Date();

  const user = await prisma.user.findUnique({
    where: { id: access.actor.id },
    include: {
      reservations: {
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          guideProfile: {
            include: {
              user: { select: { name: true, firstName: true, lastName: true } }
            }
          },
          package: { select: { name: true, durationDays: true } },
        }
      },
      notifications: {
        where: { readAt: null },
        orderBy: { createdAt: 'desc' },
        take: 5,
      },
    }
  });

  if (!user) return NextResponse.json({ error: 'Session invalide' }, { status: 401 });

  const [totalReservations, upcomingReservations, completedReservations, spentResult] = await Promise.all([
    prisma.reservation.count({ where: { pelerinId: user.id } }),
    prisma.reservation.count({
      where: { pelerinId: user.id, status: 'CONFIRMED', startDate: { gt: now } }
    }),
    prisma.reservation.count({ where: { pelerinId: user.id, status: 'COMPLETED' } }),
    prisma.reservation.aggregate({
      where: { pelerinId: user.id, status: 'COMPLETED' },
      _sum: { totalPrice: true },
    }),
  ]);

  const displayName = user.name
    || `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim()
    || user.email
    || '—';

  return NextResponse.json({
    user: {
      id: user.id,
      name: displayName,
      email: user.email || '—',
      firstName: user.firstName,
      lastName: user.lastName,
      country: user.country,
      phoneWhatsapp: user.phoneWhatsapp,
      createdAt: new Date(user.createdAt).toLocaleDateString('fr-FR'),
      initials: (displayName[0] || 'P').toUpperCase(),
    },
    stats: {
      totalReservations,
      upcomingReservations,
      completedReservations,
      totalSpent: Math.round(spentResult._sum.totalPrice ?? 0),
    },
    recentReservations: user.reservations.map(r => ({
      id: r.id,
      refNumber: r.refNumber,
      guideName: r.guideProfile.user.name
        || `${r.guideProfile.user.firstName ?? ''} ${r.guideProfile.user.lastName ?? ''}`.trim()
        || '—',
      packageName: r.package.name,
      startDate: new Date(r.startDate).toLocaleDateString('fr-FR'),
      nbPeople: r.nbPeople,
      totalPrice: r.totalPrice,
      status: r.status,
    })),
    unreadNotifications: user.notifications.length,
    notifications: user.notifications.map(n => ({
      id: n.id,
      title: n.title,
      message: n.message,
      type: n.type,
      createdAt: new Date(n.createdAt).toLocaleDateString('fr-FR'),
    })),
  });
}
