import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const email = (session.user as { email?: string }).email;
  if (!email) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      guideProfile: {
        include: {
          languages: { select: { languageCode: true, level: true } },
        },
      },
    },
  });

  if (!user) return NextResponse.json({ error: 'Introuvable' }, { status: 404 });
  if (!user.guideProfile) return NextResponse.json({ error: 'Profil guide introuvable' }, { status: 404 });

  const guideProfile = user.guideProfile;

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const guideReservationWhere = {
    OR: [
      { guideProfileId: guideProfile.id },
      { missions: { some: { guideProfileId: guideProfile.id } } },
    ],
  };

  const [totalReservations, reservationsMois, revenuesMois, totalCompleted, reviewsData, recentReservations] = await Promise.all([
    prisma.reservation.count({ where: guideReservationWhere }),
    prisma.reservation.count({
      where: { ...guideReservationWhere, createdAt: { gte: startOfMonth } },
    }),
    prisma.guideEarning.aggregate({
      where: { guideProfileId: guideProfile.id, reservation: { status: 'COMPLETED' }, createdAt: { gte: startOfMonth } },
      _sum: { totalNetCents: true },
    }),
    prisma.reservation.count({
      where: { ...guideReservationWhere, status: 'COMPLETED' },
    }),
    prisma.review.findMany({
      where: { reservation: guideReservationWhere },
      select: { ratingOverall: true },
    }),
    prisma.reservation.findMany({
      where: guideReservationWhere,
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        pelerin: { select: { firstName: true, lastName: true, name: true, country: true } },
        package: { select: { name: true, durationDays: true } },
        missions: { where: { guideProfileId: guideProfile.id }, orderBy: { startDate: 'asc' } },
        guideEarnings: { where: { guideProfileId: guideProfile.id }, select: { totalNetCents: true } },
      },
    }),
  ]);

  const avgRating = reviewsData.length > 0
    ? Math.round((reviewsData.reduce((s, r) => s + r.ratingOverall, 0) / reviewsData.length) * 10) / 10
    : null;

  const displayName = user.name
    || `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim()
    || email;

  return NextResponse.json({
    guide: {
      id: user.id,
      name: displayName,
      firstName: user.firstName,
      email: user.email || '—',
      status: guideProfile.status,
      slug: guideProfile.slug,
      city: guideProfile.city,
      bio: guideProfile.bio,
      acceptingBookings: guideProfile.acceptingBookings,
      servesMakkah: guideProfile.servesMakkah,
      servesMadinah: guideProfile.servesMadinah,
      languages: guideProfile.languages,
    },
    stats: {
      totalReservations,
      reservationsMois,
      totalCompleted,
      revenuesMois: Math.round((revenuesMois._sum.totalNetCents ?? 0) / 100),
      avgRating,
      totalReviews: reviewsData.length,
    },
    recentReservations: recentReservations.map(r => ({
      id: r.id,
      refNumber: r.refNumber,
      pelerinName: r.pelerin.name
        || `${r.pelerin.firstName ?? ''} ${r.pelerin.lastName ?? ''}`.trim()
        || '—',
      pelerinCountry: r.pelerin.country,
      packageName: r.package.name,
      durationDays: r.missions.length > 0
        ? r.missions.reduce((sum, mission) => sum + Math.round((mission.endDate.getTime() - mission.startDate.getTime()) / 86_400_000) + 1, 0)
        : r.package.durationDays,
      startDate: new Date(r.missions[0]?.startDate ?? r.startDate).toLocaleDateString('fr-FR'),
      nbPeople: r.nbPeople,
      guideRevenue: (r.guideEarnings[0]?.totalNetCents ?? 0) / 100,
      status: r.status,
    })),
  });
}
