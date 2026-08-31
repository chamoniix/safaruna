import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireGuide } from '@/lib/require-account'

function averageRating(rows: { ratingOverall: number }[]) {
  if (rows.length === 0) return null
  return Math.round((rows.reduce((sum, row) => sum + row.ratingOverall, 0) / rows.length) * 10) / 10
}

export async function GET() {
  const access = await requireGuide()
  if (!access.ok) return access.response

  const guideProfileId = access.actor.guideProfileId
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const guideReservationWhere = {
    OR: [
      { guideProfileId },
      { missions: { some: { guideProfileId } } },
    ],
  }
  const completedReservationWhere = { ...guideReservationWhere, status: 'COMPLETED' as const }

  const [completedAllTime, completedThisMonth, earnings, monthlyEarnings, reviews, monthlyReviews] = await Promise.all([
    prisma.reservation.count({ where: completedReservationWhere }),
    prisma.reservation.count({ where: { ...completedReservationWhere, startDate: { gte: startOfMonth } } }),
    prisma.guideEarning.aggregate({
      where: { guideProfileId, reservation: { status: 'COMPLETED' } },
      _sum: { totalNetCents: true },
    }),
    prisma.guideEarning.aggregate({
      where: { guideProfileId, reservation: { status: 'COMPLETED', startDate: { gte: startOfMonth } } },
      _sum: { totalNetCents: true },
    }),
    prisma.review.findMany({
      where: { guideProfileId, status: 'APPROVED' },
      select: { ratingOverall: true },
    }),
    prisma.review.findMany({
      where: { guideProfileId, status: 'APPROVED', createdAt: { gte: startOfMonth } },
      select: { ratingOverall: true },
    }),
  ])

  return NextResponse.json({
    thisMonth: {
      completedReservations: completedThisMonth,
      netEarnings: (monthlyEarnings._sum.totalNetCents ?? 0) / 100,
      averageRating: averageRating(monthlyReviews),
      approvedReviews: monthlyReviews.length,
    },
    allTime: {
      completedReservations: completedAllTime,
      netEarnings: (earnings._sum.totalNetCents ?? 0) / 100,
      averageRating: averageRating(reviews),
      approvedReviews: reviews.length,
    },
  })
}
