import 'server-only'

import prisma from '@/lib/prisma'

export type PublicReviewKind = 'MEMBER' | 'VERIFIED' | 'GUIDE'

export type PublicReviewItem = {
  id: string
  kind: PublicReviewKind
  label: 'Avis membre' | 'Avis vérifié' | 'Avis Guide'
  firstName: string
  location: string
  rating: number
  comment: string
  guideName: string | null
  guideSlug: string | null
  publishedAt: string
}

function publicationDate(review: { moderatedAt: Date | null; createdAt: Date }) {
  return review.moderatedAt ?? review.createdAt
}

export async function getPublicReviews(input: { page: number; limit: number; rating?: number }) {
  const page = Math.max(1, input.page)
  const limit = Math.min(24, Math.max(1, input.limit))
  const offset = (page - 1) * limit
  const take = offset + limit
  const rating = input.rating && input.rating >= 1 && input.rating <= 5 ? input.rating : undefined

  const experienceWhere = { status: 'APPROVED' as const, ...(rating ? { rating } : {}) }
  const guideWhere = { status: 'APPROVED' as const, ...(rating ? { ratingOverall: rating } : {}) }

  const [experienceReviews, guideReviews, experienceCount, guideCount] = await Promise.all([
    prisma.experienceReview.findMany({
      where: experienceWhere,
      orderBy: [{ moderatedAt: 'desc' }, { createdAt: 'desc' }],
      take,
      select: {
        id: true,
        reservationId: true,
        firstName: true,
        city: true,
        country: true,
        rating: true,
        comment: true,
        moderatedAt: true,
        createdAt: true,
      },
    }),
    prisma.review.findMany({
      where: guideWhere,
      orderBy: [{ moderatedAt: 'desc' }, { createdAt: 'desc' }],
      take,
      select: {
        id: true,
        ratingOverall: true,
        comment: true,
        moderatedAt: true,
        createdAt: true,
        pelerin: { select: { firstName: true, lastName: true, country: true } },
        reservation: {
          select: {
            experienceReview: { select: { firstName: true, city: true, country: true } },
          },
        },
        guideProfile: {
          select: {
            slug: true,
            guideAccount: { select: { displayName: true, firstName: true, lastName: true } },
          },
        },
      },
    }),
    prisma.experienceReview.count({ where: experienceWhere }),
    prisma.review.count({ where: guideWhere }),
  ])

  const normalizedExperience: Array<PublicReviewItem & { sortDate: Date }> = experienceReviews.map(review => ({
    id: `experience:${review.id}`,
    kind: review.reservationId ? 'VERIFIED' : 'MEMBER',
    label: review.reservationId ? 'Avis vérifié' : 'Avis membre',
    firstName: review.firstName,
    location: [review.city, review.country].filter(Boolean).join(', '),
    rating: review.rating,
    comment: review.comment,
    guideName: null,
    guideSlug: null,
    publishedAt: publicationDate(review).toISOString(),
    sortDate: publicationDate(review),
  }))

  const normalizedGuides: Array<PublicReviewItem & { sortDate: Date }> = guideReviews.map(review => {
    const account = review.guideProfile.guideAccount
    const signature = review.reservation.experienceReview
    const guideName = account?.displayName
      || `${account?.firstName ?? ''} ${account?.lastName ?? ''}`.trim()
      || 'Guide SAFARUMA'
    return {
      id: `guide:${review.id}`,
      kind: 'GUIDE',
      label: 'Avis Guide',
      firstName: signature?.firstName || review.pelerin.firstName?.trim() || 'Pèlerin',
      location: signature
        ? [signature.city, signature.country].filter(Boolean).join(', ')
        : review.pelerin.country || '',
      rating: review.ratingOverall,
      comment: review.comment,
      guideName,
      guideSlug: review.guideProfile.slug,
      publishedAt: publicationDate(review).toISOString(),
      sortDate: publicationDate(review),
    }
  })

  const total = experienceCount + guideCount
  const reviews = [...normalizedExperience, ...normalizedGuides]
    .sort((a, b) => b.sortDate.getTime() - a.sortDate.getTime())
    .slice(offset, offset + limit)
    .map(review => ({
      id: review.id,
      kind: review.kind,
      label: review.label,
      firstName: review.firstName,
      location: review.location,
      rating: review.rating,
      comment: review.comment,
      guideName: review.guideName,
      guideSlug: review.guideSlug,
      publishedAt: review.publishedAt,
    }))

  return {
    reviews,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
      hasNextPage: offset + reviews.length < total,
    },
  }
}
