import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireGuide } from '@/lib/require-account';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { getGuideRequestContext, hasTrustedGuideAuthOrigin } from '@/lib/guide-auth';

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
      guideCompleted: mission.guideCompleted,
    })),
  });
}

const completionSchema = z.object({ action: z.literal('COMPLETE'), missionId: z.string().min(1).max(200) }).strict();

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!hasTrustedGuideAuthOrigin(req)) return NextResponse.json({ error: 'Origine non autorisée' }, { status: 403 });
  const access = await requireGuide({ published: true });
  if (!access.ok) return access.response;
  const parsed = completionSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Déclaration de fin invalide.' }, { status: 400 });
  const { id } = await params;
  const actor = access.actor;
  const requestContext = getGuideRequestContext(req);
  try {
    return await prisma.$transaction(async tx => {
      const mission = await tx.reservationMission.findFirst({
        where: {
          id: parsed.data.missionId, reservationId: id, guideProfileId: actor.guideProfileId,
          guideProfile: { status: 'ACTIVE', guideAccount: { id: actor.id, status: 'ACTIVE' } },
        },
        select: { id: true, guideCompleted: true, reservation: { select: { status: true } } },
      });
      if (!mission) return NextResponse.json({ error: 'Mission introuvable.' }, { status: 404 });
      if (!['CONFIRMED', 'COMPLETED'].includes(mission.reservation.status)) {
        return NextResponse.json({ error: 'Cette prestation ne peut pas être déclarée terminée.' }, { status: 409 });
      }
      if (mission.guideCompleted) return NextResponse.json({ success: true, guideCompleted: true });
      await tx.reservationMission.update({ where: { id: mission.id }, data: { guideCompleted: true } });
      await tx.auditLog.create({ data: {
        actor: actor.email, actorRole: 'GUIDE', action: 'GUIDE_MISSION_COMPLETED', target: mission.id,
        detail: JSON.stringify({ reservationId: id, guideProfileId: actor.guideProfileId }),
        ip: requestContext.ip, userAgent: requestContext.userAgent,
        before: { guideCompleted: false }, after: { guideCompleted: true },
      } });
      return NextResponse.json({ success: true, guideCompleted: true });
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && ['P2025', 'P2034'].includes(error.code)) {
      return NextResponse.json({ error: 'La mission a changé. Rechargez la page.' }, { status: 409 });
    }
    console.error('[guide mission completion]', error);
    return NextResponse.json({ error: 'La déclaration de fin n’a pas pu être enregistrée.' }, { status: 500 });
  }
}
