import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireGuide } from '@/lib/require-account';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const access = await requireGuide({ published: true });
  if (!access.ok) return access.response;
  const guideProfileId = access.actor.guideProfileId;
  const { id } = await params;

  const reservation = await prisma.reservation.findFirst({
    where: {
      id,
      OR: [
        { guideProfileId },
        { missions: { some: { guideProfileId } } },
      ],
    },
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
        select: { totalNetCents: true, status: true },
      },
    },
  });

  if (!reservation) {
    return NextResponse.json({ error: 'Mission introuvable' }, { status: 404 });
  }

  const p = reservation.pelerin;
  const pelerinName = p.name || `${p.firstName ?? ''} ${p.lastName ?? ''}`.trim() || p.email || '—';
  const earning = reservation.guideEarnings[0] ?? null;

  return NextResponse.json({
    id: reservation.id,
    refNumber: reservation.refNumber,
    status: reservation.status,
    createdAt: reservation.createdAt.toLocaleDateString('fr-FR'),
    pelerinName,
    pelerinCountry: reservation.pelerin.country,
    pelerinEmail: reservation.pelerin.email,
    packageName: reservation.package.name,
    nbPeople: reservation.nbPeople,
    notes: reservation.notes,
    guideRevenue: earning ? earning.totalNetCents / 100 : null,
    guideRevenueStatus: earning?.status ?? null,
    review: reservation.reviews[0]
      ? { rating: reservation.reviews[0].ratingOverall, comment: reservation.reviews[0].comment }
      : null,
    missions: reservation.missions.map(mission => ({
      id: mission.id,
      city: mission.city,
      startDate: mission.startDate.toLocaleDateString('fr-FR'),
      endDate: mission.endDate.toLocaleDateString('fr-FR'),
      selectedPlaces: Array.isArray(mission.selectedPlaces) ? mission.selectedPlaces : [],
      localTransport: mission.localTransport,
      localTransportDays: mission.localTransportDays,
      guideConfirmationStatus: mission.guideConfirmationStatus,
      guideConfirmedAt: mission.guideConfirmedAt ? mission.guideConfirmedAt.toLocaleDateString('fr-FR') : null,
    })),
  });
}
