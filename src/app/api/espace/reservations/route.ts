import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requirePelerin } from '@/lib/require-account';

export async function GET() {
  const access = await requirePelerin();
  if (!access.ok) return access.response;

  const now = new Date();

  const userId = access.actor.id;

  const [reservations, totalSpentResult] = await Promise.all([
    prisma.reservation.findMany({
      where: { pelerinId: userId },
      orderBy: { createdAt: 'desc' },
      include: {
        guideProfile: {
          include: {
            guideAccount: { select: { displayName: true, firstName: true, lastName: true } }
          }
        },
        package: { select: { name: true, durationDays: true } },
        reviews: { select: { ratingOverall: true, comment: true } },
        missions: {
          orderBy: { startDate: 'asc' },
          include: { guideProfile: { include: { guideAccount: { select: { displayName: true, firstName: true, lastName: true } } } } },
        },
      }
    }),
    prisma.reservation.aggregate({
      where: { pelerinId: userId, status: 'COMPLETED' },
      _sum: { totalPrice: true },
    }),
  ]);

  const upcoming  = reservations.filter(r => r.status === 'CONFIRMED' && r.startDate > now).length;
  const completed = reservations.filter(r => r.status === 'COMPLETED').length;

  return NextResponse.json({
    stats: {
      total: reservations.length,
      upcoming,
      completed,
      totalSpent: Math.round(totalSpentResult._sum.totalPrice ?? 0),
    },
    reservations: reservations.map(r => ({
      id: r.id,
      refNumber: r.refNumber,
      guideName: r.missions.length > 0
        ? [...new Set(r.missions.map(mission => mission.guideProfile.guideAccount?.displayName
          || `${mission.guideProfile.guideAccount?.firstName ?? ''} ${mission.guideProfile.guideAccount?.lastName ?? ''}`.trim()
          || 'Guide SAFARUMA'))].join(' · ')
        : r.guideProfile.guideAccount?.displayName
          || `${r.guideProfile.guideAccount?.firstName ?? ''} ${r.guideProfile.guideAccount?.lastName ?? ''}`.trim()
          || '—',
      missions: r.missions.map(mission => ({
        city: mission.city,
        startDate: mission.startDate.toISOString(),
        endDate: mission.endDate.toISOString(),
      })),
      packageName: r.package.name,
      durationDays: r.package.durationDays,
      startDate: new Date(r.startDate).toLocaleDateString('fr-FR'),
      startDateRaw: r.startDate.toISOString(),
      nbPeople: r.nbPeople,
      totalPrice: r.totalPrice,
      status: r.status,
      createdAt: new Date(r.createdAt).toLocaleDateString('fr-FR'),
      review: r.reviews[0] ? { rating: r.reviews[0].ratingOverall, comment: r.reviews[0].comment } : null,
    })),
  });
}
