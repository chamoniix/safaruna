import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { adminAuditDetail, adminAuditFields, getAdminActor, getAdminAuditContext } from '@/lib/check-admin'
import prisma from '@/lib/prisma'
import { publicReviewerName } from '@/lib/guide-workflow'
import { analyticsCountry, analyticsDevice, recordAnalyticsEvent } from '@/lib/analytics'

const moderationSchema = z.object({
  reviewId: z.string().min(1),
  reviewType: z.enum(['GUIDE', 'EXPERIENCE']),
  status: z.enum(['APPROVED', 'REJECTED', 'HIDDEN']),
  reason: z.string().trim().min(10).max(1000),
})

export async function GET(req: NextRequest) {
  const actor = await getAdminActor(req)
  if (!actor) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const [reviews, experienceReviews] = await Promise.all([
    prisma.review.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        pelerin: { select: { firstName: true, lastName: true, country: true, email: true } },
        guideProfile: { select: { slug: true, guideAccount: { select: { displayName: true, firstName: true, lastName: true } } } },
        reservation: {
          select: {
            refNumber: true,
            stayRating: true,
            stayComment: true,
            experienceReview: { select: { firstName: true, city: true, country: true } },
          },
        },
      },
    }),
    prisma.experienceReview.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { email: true } },
        reservation: { select: { refNumber: true } },
      },
    }),
  ])

  const guideItems = reviews.map(review => {
    const guide = review.guideProfile.guideAccount
    return {
      id: review.id,
      reviewType: 'GUIDE' as const,
      kind: 'GUIDE' as const,
      label: 'Avis Guide',
      reservationRef: review.reservation.refNumber,
      stayRating: review.reservation.stayRating,
      stayComment: review.reservation.stayComment,
      guideName: guide?.displayName || `${guide?.firstName ?? ''} ${guide?.lastName ?? ''}`.trim() || review.guideProfile.slug,
      author: review.reservation.experienceReview?.firstName || publicReviewerName(review.pelerin.firstName, review.pelerin.lastName),
      authorEmail: review.pelerin.email,
      country: review.reservation.experienceReview?.country || review.pelerin.country,
      city: review.reservation.experienceReview?.city || null,
      ratingOverall: review.ratingOverall,
      ratingPunctuality: review.ratingPunctuality,
      ratingPedagogy: review.ratingPedagogy,
      ratingKnowledge: review.ratingKnowledge,
      comment: review.comment,
      status: review.status,
      moderationNote: review.moderationNote,
      moderatedByEmail: review.moderatedByEmail,
      moderatedAt: review.moderatedAt,
      createdAt: review.createdAt,
    }
  })

  const experienceItems = experienceReviews.map(review => ({
    id: review.id,
    reviewType: 'EXPERIENCE' as const,
    kind: review.reservationId ? 'VERIFIED' as const : 'MEMBER' as const,
    label: review.reservationId ? 'Avis vérifié' : 'Avis membre',
    reservationRef: review.reservation?.refNumber || null,
    stayRating: null,
    stayComment: null,
    guideName: null,
    author: review.firstName,
    authorEmail: review.user.email,
    country: review.country,
    city: review.city,
    ratingOverall: review.rating,
    ratingPunctuality: null,
    ratingPedagogy: null,
    ratingKnowledge: null,
    comment: review.comment,
    status: review.status,
    moderationNote: review.moderationNote,
    moderatedByEmail: review.moderatedByEmail,
    moderatedAt: review.moderatedAt,
    createdAt: review.createdAt,
  }))

  return NextResponse.json({
    reviews: [...guideItems, ...experienceItems].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
  })
}

export async function PATCH(req: NextRequest) {
  const origin = req.headers.get('origin')
  if (origin && origin !== req.nextUrl.origin) return NextResponse.json({ error: 'Origine non autorisée' }, { status: 403 })
  const actor = await getAdminActor(req)
  if (!actor) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const parsed = moderationSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Statut ou motif invalide' }, { status: 400 })
  const auditContext = getAdminAuditContext(req)

  const existing = parsed.data.reviewType === 'GUIDE'
    ? await prisma.review.findUnique({
      where: { id: parsed.data.reviewId },
      select: { id: true, status: true, reservation: { select: { refNumber: true } } },
    })
    : await prisma.experienceReview.findUnique({
      where: { id: parsed.data.reviewId },
      select: { id: true, status: true, reservation: { select: { refNumber: true } } },
    })
  if (!existing) return NextResponse.json({ error: 'Avis introuvable' }, { status: 404 })

  await prisma.$transaction(async tx => {
    const moderation = {
      status: parsed.data.status,
      moderationNote: parsed.data.reason,
      moderatedByAdminId: actor.id,
      moderatedByEmail: actor.email,
      moderatedAt: new Date(),
    }
    if (parsed.data.reviewType === 'GUIDE') {
      await tx.review.update({ where: { id: existing.id }, data: moderation })
    } else {
      await tx.experienceReview.update({ where: { id: existing.id }, data: moderation })
    }
    await tx.auditLog.create({
      data: {
        actor: actor.email,
        actorRole: actor.role,
        actorAdminId: actor.id,
        action: parsed.data.reviewType === 'GUIDE' ? 'REVIEW_MODERATED' : 'EXPERIENCE_REVIEW_MODERATED',
        target: existing.reservation?.refNumber || existing.id,
        detail: adminAuditDetail(auditContext, { reason: parsed.data.reason, reviewType: parsed.data.reviewType }),
        before: { status: existing.status },
        after: { status: parsed.data.status },
        ...adminAuditFields(auditContext),
      },
    })
  })

  await recordAnalyticsEvent({
    eventName: 'review_moderated',
    path: '/admin/avis',
    country: analyticsCountry(req.headers.get('x-vercel-ip-country')),
    device: analyticsDevice(req.headers.get('user-agent')),
    metadata: { reviewType: parsed.data.reviewType, status: parsed.data.status, actorRole: actor.role },
  })

  return NextResponse.json({ success: true })
}
