import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requirePelerin } from '@/lib/require-account';

const noStoreHeaders = { 'Cache-Control': 'no-store' }

export async function GET(req: NextRequest) {
  const access = await requirePelerin();
  if (!access.ok) return access.response;

  const now = new Date();
  const userId = access.actor.id;
  const refNumber = req.nextUrl.searchParams.get('ref')?.trim()

  if (refNumber) {
    if (!/^SAF-[A-Z0-9-]{6,40}$/.test(refNumber)) {
      return NextResponse.json(
        { error: 'Référence invalide' },
        { status: 400, headers: noStoreHeaders },
      )
    }

    const reservation = await prisma.reservation.findFirst({
      where: { refNumber, pelerinId: userId },
      select: {
        refNumber: true,
        status: true,
        stripePaymentId: true,
        paymentAttempts: {
          where: { status: 'SUCCEEDED' },
          select: { id: true },
          take: 1,
        },
      },
    })

    if (reservation) {
      const confirmed = (reservation.paymentAttempts.length > 0 || Boolean(reservation.stripePaymentId))
        && ['CONFIRMED', 'COMPLETED'].includes(reservation.status)

      return NextResponse.json({
        verification: {
          refNumber: reservation.refNumber,
          state: confirmed ? 'confirmed' : 'failed',
        },
      }, { headers: noStoreHeaders })
    }

    const [draft, pendingAttempt] = await Promise.all([
      prisma.reservationDraft.findFirst({
        where: { refNumber, pelerinId: userId },
        select: { stripeSessionId: true, expiresAt: true },
      }),
      prisma.paymentAttempt.findFirst({
        where: { bookingRef: refNumber, status: { in: ['CREATED', 'PENDING'] } },
        select: { id: true, checkoutExpiresAt: true },
        orderBy: { createdAt: 'desc' },
      }),
    ])

    const checkoutExpiresAt = pendingAttempt?.checkoutExpiresAt ?? draft?.expiresAt
    if (draft && (pendingAttempt || draft.stripeSessionId) && checkoutExpiresAt && checkoutExpiresAt > now) {
      return NextResponse.json({
        verification: { refNumber, state: 'pending' },
      }, { headers: noStoreHeaders })
    }

    return NextResponse.json(
      { error: 'Réservation introuvable' },
      { status: 404, headers: noStoreHeaders },
    )
  }

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
