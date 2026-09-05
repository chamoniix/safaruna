import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requirePelerin } from '@/lib/require-account';
import { reviewOpensAt } from '@/lib/guide-workflow';
import { retrieveRevolutOrder } from '@/lib/payments/revolut-provider';
import type { PaymentDraftData } from '@/lib/payments/types';

const noStoreHeaders = { 'Cache-Control': 'no-store' }

type ResumableDraftData = PaymentDraftData & {
  guideSlug?: string
  taxiDirection?: 'MAKKAH' | 'MADINAH' | null
}

function parseResumableDraft(data: string): ResumableDraftData | null {
  try {
    const parsed = JSON.parse(data) as Partial<ResumableDraftData>
    const validDate = (value: unknown) => (
      typeof value === 'string'
      && /^\d{4}-\d{2}-\d{2}$/.test(value)
      && !Number.isNaN(Date.parse(`${value}T00:00:00.000Z`))
    )
    if (
      !parsed
      || !['MAKKAH', 'MADINAH', 'BOTH'].includes(String(parsed.cityChoice))
      || !validDate(parsed.departDate)
      || !validDate(parsed.returnDate)
      || !Number.isInteger(parsed.nbPersonnes)
      || Number(parsed.nbPersonnes) < 1
      || Number(parsed.nbPersonnes) > 32
      || !['HOMME', 'FEMME', 'MIXTE'].includes(String(parsed.gender))
      || typeof parsed.langue !== 'string' || !parsed.langue.trim()
      || !['JEDDAH', 'MADINAH', 'MAKKAH'].includes(String(parsed.arrivalPoint))
      || !Array.isArray(parsed.selectedPlaces) || parsed.selectedPlaces.some(place => typeof place !== 'string')
      || !['NONE', 'TRAIN', 'TAXI_RT', 'TAXI_ONE'].includes(String(parsed.transportOption))
      || !['NONE', 'TAXI', 'CAR'].includes(String(parsed.localTransportMakkah))
      || !['NONE', 'TAXI', 'CAR'].includes(String(parsed.localTransportMadinah))
      || typeof parsed.guideBedProvided !== 'boolean'
      || typeof parsed.selectedGuideSlug !== 'string' || !parsed.selectedGuideSlug.trim()
      || (parsed.selectedGuideSlugMadinah !== undefined && parsed.selectedGuideSlugMadinah !== null && typeof parsed.selectedGuideSlugMadinah !== 'string')
      || typeof parsed.packageName !== 'string' || !parsed.packageName.trim()
      || !parsed.pricing
      || !Number.isFinite(parsed.pricing.total)
      || !Number.isFinite(parsed.pricing.grossTotal)
      || !Number.isFinite(parsed.pricing.promoDiscount)
    ) return null
    return parsed as ResumableDraftData
  } catch {
    return null
  }
}

function isOfficialRevolutCheckoutUrl(value: string | undefined): value is string {
  if (!value) return false
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && url.hostname === 'checkout.revolut.com'
  } catch {
    return false
  }
}

function promotionSnapshot(input: {
  promoCode: { code: string; discountBps: number } | null
  promotionRedemption: { campaignCodeSnapshot: string; discountBpsSnapshot: number } | null
}) {
  if (input.promoCode) {
    return {
      code: input.promoCode.code,
      discountPercent: input.promoCode.discountBps / 100,
    }
  }
  if (input.promotionRedemption) {
    return {
      code: input.promotionRedemption.campaignCodeSnapshot,
      discountPercent: input.promotionRedemption.discountBpsSnapshot / 100,
    }
  }
  return null
}

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
        select: {
          data: true,
          stripeSessionId: true,
          expiresAt: true,
          promoCode: { select: { code: true, discountBps: true } },
          promotionRedemption: {
            select: { campaignCodeSnapshot: true, discountBpsSnapshot: true },
          },
        },
      }),
      prisma.paymentAttempt.findFirst({
        where: { bookingRef: refNumber, status: { in: ['CREATED', 'PENDING'] } },
        select: {
          id: true,
          provider: true,
          providerCheckoutId: true,
          amountCents: true,
          currency: true,
          checkoutExpiresAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
    ])

    const checkoutExpiresAt = pendingAttempt?.checkoutExpiresAt ?? draft?.expiresAt
    if (draft && (pendingAttempt || draft.stripeSessionId) && checkoutExpiresAt && checkoutExpiresAt > now) {
      const draftData = parseResumableDraft(draft.data)
      if (!draftData) {
        return NextResponse.json(
          { error: 'Brouillon de paiement invalide' },
          { status: 409, headers: noStoreHeaders },
        )
      }

      if (
        pendingAttempt?.provider === 'REVOLUT'
        && pendingAttempt.providerCheckoutId
      ) {
        try {
          const order = await retrieveRevolutOrder(pendingAttempt.providerCheckoutId)
          const identityMatches = order.id === pendingAttempt.providerCheckoutId
            && order.type === 'payment'
            && order.merchant_order_data?.reference === refNumber
            && order.amount === pendingAttempt.amountCents
            && order.currency === pendingAttempt.currency.toUpperCase()
            && order.capture_mode === 'automatic'

          if (!identityMatches) {
            return NextResponse.json(
              { error: 'Ordre de paiement incohérent' },
              { status: 409, headers: noStoreHeaders },
            )
          }

          if (['completed', 'processing', 'authorisation_started', 'authorised'].includes(order.state ?? '')) {
            return NextResponse.json({
              verification: { refNumber, state: 'pending' },
            }, { headers: noStoreHeaders })
          }

          if (order.state !== 'pending') {
            return NextResponse.json({
              verification: { refNumber, state: 'failed' },
            }, { headers: noStoreHeaders })
          }

          if (!order.token || !isOfficialRevolutCheckoutUrl(order.checkout_url)) {
            return NextResponse.json(
              { error: 'Ordre de paiement incomplet' },
              { status: 409, headers: noStoreHeaders },
            )
          }

          return NextResponse.json({
            verification: { refNumber, state: 'pending' },
            pendingCheckout: {
              provider: 'REVOLUT',
              checkoutToken: order.token,
              sessionUrl: order.checkout_url,
              refNumber,
              expiresAt: checkoutExpiresAt.toISOString(),
              promotion: promotionSnapshot(draft),
              pricing: draftData.pricing,
              checkout: {
                guideSlug: draftData.guideSlug ?? draftData.selectedGuideSlug,
                cityChoice: draftData.cityChoice,
                departDate: draftData.departDate,
                returnDate: draftData.returnDate,
                nbPersonnes: draftData.nbPersonnes,
                gender: draftData.gender,
                langue: draftData.langue,
                arrivalPoint: draftData.arrivalPoint,
                selectedPlaces: draftData.selectedPlaces,
                transportOption: draftData.transportOption,
                taxiDirection: draftData.taxiDirection ?? null,
                localTransportMakkah: draftData.localTransportMakkah,
                localTransportMadinah: draftData.localTransportMadinah,
                guideBedProvided: draftData.guideBedProvided,
                selectedGuideSlug: draftData.selectedGuideSlug,
                selectedGuideSlugMadinah: draftData.selectedGuideSlugMadinah ?? null,
                packageName: draftData.packageName,
              },
            },
          }, { headers: noStoreHeaders })
        } catch (error) {
          console.error('[espace/reservations resume]', error)
          return NextResponse.json(
            { error: 'Impossible de vérifier le paiement en attente' },
            { status: 503, headers: noStoreHeaders },
          )
        }
      }

      return NextResponse.json({
        verification: { refNumber, state: 'pending' },
      }, { headers: noStoreHeaders })
    }

    return NextResponse.json(
      { error: 'Réservation introuvable' },
      { status: 404, headers: noStoreHeaders },
    )
  }

  const [reservations, totalSpentResult, activeDrafts] = await Promise.all([
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
        reviews: { select: { ratingOverall: true, comment: true, status: true } },
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
    prisma.reservationDraft.findMany({
      where: { pelerinId: userId, expiresAt: { gt: now } },
      orderBy: { createdAt: 'desc' },
      select: {
        refNumber: true,
        data: true,
        expiresAt: true,
        createdAt: true,
        promoCode: { select: { code: true, discountBps: true } },
        promotionRedemption: {
          select: { campaignCodeSnapshot: true, discountBpsSnapshot: true },
        },
      },
    }),
  ]);

  const pendingAttempts = activeDrafts.length > 0
    ? await prisma.paymentAttempt.findMany({
        where: {
          bookingRef: { in: activeDrafts.map(draft => draft.refNumber) },
          status: { in: ['CREATED', 'PENDING'] },
        },
        orderBy: { createdAt: 'desc' },
        select: {
          bookingRef: true,
          provider: true,
          providerCheckoutId: true,
          amountCents: true,
          currency: true,
          checkoutExpiresAt: true,
        },
      })
    : []
  const pendingAttemptByRef = new Map<string, (typeof pendingAttempts)[number]>()
  for (const attempt of pendingAttempts) {
    if (!pendingAttemptByRef.has(attempt.bookingRef)) {
      pendingAttemptByRef.set(attempt.bookingRef, attempt)
    }
  }
  const pendingPayments = activeDrafts.flatMap(draft => {
    const attempt = pendingAttemptByRef.get(draft.refNumber)
    const draftData = parseResumableDraft(draft.data)
    if (!attempt || !draftData || attempt.provider !== 'REVOLUT' || !attempt.providerCheckoutId) return []
    const expiresAt = attempt.checkoutExpiresAt ?? draft.expiresAt
    if (expiresAt <= now) return []
    return [{
      refNumber: draft.refNumber,
      provider: attempt.provider,
      guideSlug: draftData.guideSlug ?? draftData.selectedGuideSlug,
      packageName: draftData.packageName,
      destination: draftData.cityChoice,
      startDate: draftData.departDate,
      nbPeople: draftData.nbPersonnes,
      amountCents: attempt.amountCents,
      currency: attempt.currency,
      promotion: promotionSnapshot(draft),
      expiresAt: expiresAt.toISOString(),
      createdAt: draft.createdAt.toISOString(),
    }]
  })

  const upcoming  = reservations.filter(r => r.status === 'CONFIRMED' && r.startDate > now).length;
  const completed = reservations.filter(r => r.status === 'COMPLETED').length;

  return NextResponse.json({
    stats: {
      total: reservations.length,
      upcoming,
      completed,
      totalSpent: Math.round(totalSpentResult._sum.totalPrice ?? 0),
    },
    pendingPayments,
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
      canReview: ['CONFIRMED', 'COMPLETED'].includes(r.status) && now >= reviewOpensAt(r.endDate),
      feedbackSubmittedAt: r.feedbackSubmittedAt,
      createdAt: new Date(r.createdAt).toLocaleDateString('fr-FR'),
      review: r.reviews[0] ? { rating: r.reviews[0].ratingOverall, comment: r.reviews[0].comment, status: r.reviews[0].status } : null,
    })),
  });
}
