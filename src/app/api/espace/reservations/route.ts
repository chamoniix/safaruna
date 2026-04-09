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

  const user = await prisma.user.findFirst({
    where: email ? { email } : { id: userId },
  });

  if (!user) {
    // Google OAuth user exists in session but not yet in DB — upsert
    await prisma.user.upsert({
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
      stats: { total: 0, upcoming: 0, completed: 0, totalSpent: 0 },
      reservations: [],
    });
  }

  const [reservations, totalSpentResult] = await Promise.all([
    prisma.reservation.findMany({
      where: { pelerinId: user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        guideProfile: {
          include: {
            user: { select: { name: true, firstName: true, lastName: true } }
          }
        },
        package: { select: { name: true, durationDays: true } },
        reviews: { select: { ratingOverall: true, comment: true } },
      }
    }),
    prisma.reservation.aggregate({
      where: { pelerinId: user.id, status: 'COMPLETED' },
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
      guideName: r.guideProfile.user.name
        || `${r.guideProfile.user.firstName ?? ''} ${r.guideProfile.user.lastName ?? ''}`.trim()
        || '—',
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
