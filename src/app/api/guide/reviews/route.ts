import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { publicReviewerName } from '@/lib/guide-workflow'
import { requireGuide } from '@/lib/require-account'

export async function GET() {
  const access = await requireGuide()
  if (!access.ok) return access.response

  const reviews = await prisma.review.findMany({
    where: {
      guideProfileId: access.actor.guideProfileId,
      status: 'APPROVED',
    },
    orderBy: { createdAt: 'desc' },
    include: {
      pelerin: { select: { firstName: true, lastName: true, country: true } },
      reservation: { select: { refNumber: true } },
    },
  })

  return NextResponse.json({
    reviews: reviews.map(review => ({
      id: review.id,
      reservationRef: review.reservation.refNumber,
      author: publicReviewerName(review.pelerin.firstName, review.pelerin.lastName),
      country: review.pelerin.country,
      ratingOverall: review.ratingOverall,
      ratingPunctuality: review.ratingPunctuality,
      ratingPedagogy: review.ratingPedagogy,
      ratingKnowledge: review.ratingKnowledge,
      comment: review.comment,
      createdAt: review.createdAt,
    })),
  })
}
