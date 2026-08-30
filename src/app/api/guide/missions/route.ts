import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireGuide } from '@/lib/require-account';

export async function GET(req: NextRequest) {
  const access = await requireGuide();
  if (!access.ok) return access.response;
  const guideProfileId = access.actor.guideProfileId;

  const { searchParams } = new URL(req.url);
  const statusFilter = searchParams.get('status'); // PENDING | CONFIRMED | COMPLETED | CANCELLED

  const where: Record<string, unknown> = {
    OR: [
      { guideProfileId },
      { missions: { some: { guideProfileId } } },
    ],
  };
  if (statusFilter && statusFilter !== 'ALL') where.status = statusFilter;

  const reservations = await prisma.reservation.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      pelerin: { select: { name: true, firstName: true, lastName: true, country: true, email: true } },
      package: { select: { name: true, durationDays: true } },
      reviews: {
        where: { guideProfileId, status: 'APPROVED' },
        select: { ratingOverall: true, comment: true },
      },
      missions: {
        where: { guideProfileId },
        orderBy: { startDate: 'asc' },
      },
      guideEarnings: {
        where: { guideProfileId },
        select: { totalNetCents: true },
      },
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
        durationDays: r.missions.length > 0
          ? r.missions.reduce((sum, mission) => sum + Math.round((mission.endDate.getTime() - mission.startDate.getTime()) / 86_400_000) + 1, 0)
          : r.package.durationDays,
        startDate: new Date(r.missions[0]?.startDate ?? r.startDate).toLocaleDateString('fr-FR'),
        endDate: new Date(r.missions.at(-1)?.endDate ?? r.endDate).toLocaleDateString('fr-FR'),
        missionCities: r.missions.map(mission => mission.city),
        guideConfirmationStatus: r.missions.every(mission => mission.guideConfirmationStatus === 'CONFIRMED') ? 'CONFIRMED' : 'PENDING',
        guideConfirmedAt: r.missions.find(mission => mission.guideConfirmedAt)?.guideConfirmedAt ?? null,
        nbPeople: r.nbPeople,
        guideRevenue: r.guideEarnings[0] ? r.guideEarnings[0].totalNetCents / 100 : null,
        status: r.status,
        review: r.reviews[0]
          ? { rating: r.reviews[0].ratingOverall, comment: r.reviews[0].comment }
          : null,
        createdAt: new Date(r.createdAt).toLocaleDateString('fr-FR'),
      };
    }),
  });
}
