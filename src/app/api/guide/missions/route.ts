import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const email = (session.user as any).email as string | undefined;
  const userId = (session.user as any).id as string | undefined;
  if (!email && !userId) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const user = await prisma.user.findFirst({
    where: email ? { email } : { id: userId },
    include: { guideProfile: true },
  });

  if (!user) return NextResponse.json({ error: 'Introuvable' }, { status: 404 });
  if (!user.guideProfile) return NextResponse.json({ error: 'Profil guide introuvable' }, { status: 404 });

  const { searchParams } = new URL(req.url);
  const statusFilter = searchParams.get('status'); // PENDING | CONFIRMED | COMPLETED | CANCELLED

  const where: Record<string, unknown> = { guideProfileId: user.guideProfile.id };
  if (statusFilter && statusFilter !== 'ALL') where.status = statusFilter;

  const reservations = await prisma.reservation.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      pelerin: { select: { name: true, firstName: true, lastName: true, country: true, email: true } },
      package: { select: { name: true, durationDays: true } },
      reviews: { select: { ratingOverall: true, comment: true } },
    },
  });

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const total = reservations.length;
  const confirmed = reservations.filter(r => r.status === 'CONFIRMED').length;
  const completed = reservations.filter(r => r.status === 'COMPLETED').length;
  const pending = reservations.filter(r => r.status === 'PENDING').length;
  const thisMois = reservations.filter(r => new Date(r.createdAt) >= startOfMonth).length;

  return NextResponse.json({
    stats: { total, confirmed, completed, pending, thisMois },
    reservations: reservations.map(r => {
      const p = r.pelerin;
      const pelerinName = p.name || `${p.firstName ?? ''} ${p.lastName ?? ''}`.trim() || p.email || '—';
      return {
        id: r.id,
        refNumber: r.refNumber,
        pelerinName,
        pelerinCountry: r.pelerin.country,
        packageName: r.package.name,
        durationDays: r.package.durationDays,
        startDate: new Date(r.startDate).toLocaleDateString('fr-FR'),
        endDate: new Date(r.endDate).toLocaleDateString('fr-FR'),
        nbPeople: r.nbPeople,
        totalPrice: r.totalPrice,
        status: r.status,
        review: r.reviews[0]
          ? { rating: r.reviews[0].ratingOverall, comment: r.reviews[0].comment }
          : null,
        createdAt: new Date(r.createdAt).toLocaleDateString('fr-FR'),
      };
    }),
  });
}
