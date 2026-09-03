import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requirePelerin } from '@/lib/require-account'

function guideName(guideProfile: {
  slug: string | null
  guideAccount: { displayName: string | null; firstName: string | null; lastName: string | null } | null
}) {
  const account = guideProfile.guideAccount
  return account?.displayName || [account?.firstName, account?.lastName].filter(Boolean).join(' ') || guideProfile.slug || 'Guide'
}

export async function GET() {
  const access = await requirePelerin()
  if (!access.ok) return access.response

  const [experienceReviews, guideReviews] = await Promise.all([
    prisma.experienceReview.findMany({
      where: { userId: access.actor.id },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        generalReviewKey: true,
        reservationId: true,
        rating: true,
        comment: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        reservation: { select: { refNumber: true } },
      },
    }),
    prisma.review.findMany({
      where: { pelerinId: access.actor.id },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        reservationId: true,
        ratingOverall: true,
        comment: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        reservation: { select: { refNumber: true } },
        guideProfile: {
          select: {
            slug: true,
            guideAccount: { select: { displayName: true, firstName: true, lastName: true } },
          },
        },
      },
    }),
  ])

  const memberReview = experienceReviews.find(review => review.generalReviewKey !== null)
  const reservationReviews = new Map<string, {
    reservationId: string
    refNumber: string
    updatedAt: Date
    stayReview: null | {
      id: string
      rating: number
      comment: string
      status: string
      createdAt: Date
      updatedAt: Date
    }
    guideReviews: Array<{
      id: string
      guideName: string
      rating: number
      comment: string
      status: string
      createdAt: Date
      updatedAt: Date
    }>
  }>()

  for (const review of experienceReviews) {
    if (!review.reservationId || !review.reservation) continue
    reservationReviews.set(review.reservationId, {
      reservationId: review.reservationId,
      refNumber: review.reservation.refNumber,
      updatedAt: review.updatedAt,
      stayReview: {
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        status: review.status,
        createdAt: review.createdAt,
        updatedAt: review.updatedAt,
      },
      guideReviews: [],
    })
  }

  for (const review of guideReviews) {
    const group = reservationReviews.get(review.reservationId) || {
      reservationId: review.reservationId,
      refNumber: review.reservation.refNumber,
      updatedAt: review.updatedAt,
      stayReview: null,
      guideReviews: [],
    }
    group.guideReviews.push({
      id: review.id,
      guideName: guideName(review.guideProfile),
      rating: review.ratingOverall,
      comment: review.comment,
      status: review.status,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
    })
    if (review.updatedAt > group.updatedAt) group.updatedAt = review.updatedAt
    reservationReviews.set(review.reservationId, group)
  }

  return NextResponse.json({
    memberReview: memberReview ? {
      id: memberReview.id,
      rating: memberReview.rating,
      comment: memberReview.comment,
      status: memberReview.status,
      createdAt: memberReview.createdAt,
      updatedAt: memberReview.updatedAt,
    } : null,
    reservationReviews: [...reservationReviews.values()]
      .map(group => ({
        ...group,
        editable: group.guideReviews.every(review => review.status === 'PENDING'),
      }))
      .sort((left, right) => right.updatedAt.getTime() - left.updatedAt.getTime()),
  }, {
    headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' },
  })
}
