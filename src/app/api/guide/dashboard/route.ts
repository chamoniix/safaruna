import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const email = (session.user as any).email as string | undefined;
  if (!email) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      guideProfile: {
        include: {
          languages: { select: { languageCode: true, level: true } },
          reservations: {
            orderBy: { createdAt: 'desc' },
            take: 5,
            include: {
              pelerin: { select: { firstName: true, lastName: true, name: true, country: true } },
              package: { select: { name: true, durationDays: true } },
            },
          },
          _count: { select: { reservations: true } },
        },
      },
    },
  });

  if (!user) return NextResponse.json({ error: 'Introuvable' }, { status: 404 });
  if (!user.guideProfile) return NextResponse.json({ error: 'Profil guide introuvable' }, { status: 404 });

  const guideProfile = user.guideProfile;

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [reservationsMois, revenuesMois, totalCompleted, reviewsData] = await Promise.all([
    prisma.reservation.count({
      where: { guideProfileId: guideProfile.id, createdAt: { gte: startOfMonth } },
    }),
    prisma.reservation.aggregate({
      where: { guideProfileId: guideProfile.id, status: 'COMPLETED', createdAt: { gte: startOfMonth } },
      _sum: { totalPrice: true },
    }),
    prisma.reservation.count({
      where: { guideProfileId: guideProfile.id, status: 'COMPLETED' },
    }),
    prisma.review.findMany({
      where: { reservation: { guideProfileId: guideProfile.id } },
      select: { ratingOverall: true },
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
      languages: guideProfile.languages,
    },
    stats: {
      totalReservations: guideProfile._count.reservations,
      reservationsMois,
      totalCompleted,
      revenuesMois: Math.round(revenuesMois._sum.totalPrice ?? 0),
      avgRating,
      totalReviews: reviewsData.length,
    },
    recentReservations: guideProfile.reservations.map(r => ({
      id: r.id,
      refNumber: r.refNumber,
      pelerinName: r.pelerin.name
        || `${r.pelerin.firstName ?? ''} ${r.pelerin.lastName ?? ''}`.trim()
        || '—',
      pelerinCountry: r.pelerin.country,
      packageName: r.package.name,
      durationDays: r.package.durationDays,
      startDate: new Date(r.startDate).toLocaleDateString('fr-FR'),
      nbPeople: r.nbPeople,
      totalPrice: r.totalPrice,
      status: r.status,
    })),
  });
}
