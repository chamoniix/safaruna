import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const email  = (session.user as any).email  as string | undefined;
  const userId = (session.user as any).id      as string | undefined;

  if (!email && !userId) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const now = new Date();

  let user = await prisma.user.findFirst({
    where: email ? { email } : { id: userId },
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

  if (!user) {
    // Google OAuth user exists in session but not yet in DB — upsert
    const upserted = await prisma.user.upsert({
      where: { email: email! },
      update: { lastLogin: now },
      create: {
        email: email!,
        name: session.user.name || '',
        role: 'PELERIN',
        lastLogin: now,
      },
    });

    return NextResponse.json({
      user: {
        id: upserted.id,
        name: upserted.name || session.user.name || 'Pèlerin',
        email: upserted.email || '',
        firstName: null, lastName: null,
        country: null, phoneWhatsapp: null,
        createdAt: now.toLocaleDateString('fr-FR'),
        initials: (upserted.name || session.user.name || 'P')[0].toUpperCase(),
      },
      stats: {
        totalReservations: 0, upcomingReservations: 0,
        completedReservations: 0, totalSpent: 0,
      },
      recentReservations: [],
      unreadNotifications: 0,
      notifications: [],
    });
  }

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
