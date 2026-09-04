import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requirePelerin } from '@/lib/require-account'

const privateJsonHeaders = {
  'Cache-Control': 'private, no-store, max-age=0',
  'Content-Disposition': `attachment; filename="safaruma-donnees-pelerin-${new Date().toISOString().slice(0, 10)}.json"`,
  'X-Content-Type-Options': 'nosniff',
}

export async function GET() {
  const access = await requirePelerin()
  if (!access.ok) return access.response

  const userId = access.actor.id

  const [
    profile,
    reservations,
    conversations,
    guideReviews,
    experienceReviews,
    savedDuas,
    courseProgress,
    notifications,
    referralCode,
    sponsoredReferrals,
    referral,
    promoCodes,
    analyticsEvents,
    dashboardState,
  ] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        image: true,
        firstName: true,
        lastName: true,
        phoneWhatsapp: true,
        country: true,
        createdAt: true,
        lastLogin: true,
        newsletterOptIn: true,
      },
    }),
    prisma.reservation.findMany({
      where: { pelerinId: userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        refNumber: true,
        startDate: true,
        endDate: true,
        nbPeople: true,
        transportOption: true,
        totalPrice: true,
        status: true,
        notes: true,
        selectedPlaces: true,
        selectedCities: true,
        withTransport: true,
        withCar: true,
        gender: true,
        langue: true,
        arrivalPoint: true,
        cityOrder: true,
        guideBedProvided: true,
        ihramAlert: true,
        stayRating: true,
        stayComment: true,
        feedbackSubmittedAt: true,
        createdAt: true,
        updatedAt: true,
        package: { select: { name: true, durationDays: true } },
        guideProfile: {
          select: {
            slug: true,
            guideAccount: {
              select: { displayName: true, firstName: true, lastName: true },
            },
          },
        },
        missions: {
          orderBy: { startDate: 'asc' },
          select: {
            city: true,
            startDate: true,
            endDate: true,
            selectedPlaces: true,
            localTransport: true,
            localTransportDays: true,
            guideConfirmationStatus: true,
          },
        },
      },
    }),
    prisma.conversation.findMany({
      where: { pelerinId: userId },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        createdAt: true,
        updatedAt: true,
        guideProfile: {
          select: {
            slug: true,
            guideAccount: {
              select: { displayName: true, firstName: true, lastName: true },
            },
          },
        },
        messages: {
          orderBy: { createdAt: 'asc' },
          select: {
            id: true,
            senderType: true,
            content: true,
            readAt: true,
            createdAt: true,
          },
        },
      },
    }),
    prisma.review.findMany({
      where: { pelerinId: userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        reservationId: true,
        ratingOverall: true,
        ratingPunctuality: true,
        ratingPedagogy: true,
        ratingKnowledge: true,
        comment: true,
        guideResponse: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        guideProfile: { select: { slug: true } },
      },
    }),
    prisma.experienceReview.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        reservationId: true,
        firstName: true,
        city: true,
        country: true,
        rating: true,
        comment: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.savedDua.findMany({
      where: { userId },
      orderBy: { savedAt: 'desc' },
      select: {
        savedAt: true,
        dua: {
          select: {
            id: true,
            category: true,
            title: true,
            arabicText: true,
            transliteration: true,
            translationFr: true,
            source: true,
          },
        },
      },
    }),
    prisma.courseProgress.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      select: {
        progressPct: true,
        updatedAt: true,
        course: { select: { slug: true, title: true, category: true } },
      },
    }),
    prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        type: true,
        title: true,
        message: true,
        readAt: true,
        createdAt: true,
      },
    }),
    prisma.referralCode.findUnique({
      where: { ownerId: userId },
      select: { code: true, createdAt: true },
    }),
    prisma.referral.findMany({
      where: { sponsorId: userId },
      orderBy: { createdAt: 'desc' },
      select: { id: true, status: true, createdAt: true, qualifiedAt: true },
    }),
    prisma.referral.findUnique({
      where: { referredUserId: userId },
      select: { id: true, status: true, createdAt: true, qualifiedAt: true },
    }),
    prisma.promoCode.findMany({
      where: { ownerId: userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        code: true,
        kind: true,
        status: true,
        discountBps: true,
        expiresAt: true,
        redeemedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.analyticsEvent.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        eventName: true,
        path: true,
        country: true,
        device: true,
        createdAt: true,
      },
    }),
    prisma.pelerinDashboardState.findUnique({
      where: { userId },
      select: {
        memorizedDuaIds: true,
        completedChecklistItemIds: true,
        customChecklistItems: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
  ])

  if (!profile) {
    return NextResponse.json(
      { error: 'Compte introuvable' },
      { status: 404, headers: privateJsonHeaders },
    )
  }

  return NextResponse.json({
    exportedAt: new Date().toISOString(),
    profile,
    reservations,
    conversations,
    reviews: {
      guides: guideReviews,
      experience: experienceReviews,
    },
    savedDuas,
    courseProgress,
    notifications,
    referral: {
      personalCode: referralCode,
      sponsored: sponsoredReferrals,
      received: referral,
      promoCodes,
    },
    analyticsEvents,
    dashboardState,
  }, { headers: privateJsonHeaders })
}
