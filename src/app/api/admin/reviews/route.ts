import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { adminAuditDetail, adminAuditFields, getAdminActor, getAdminAuditContext } from '@/lib/check-admin'
import prisma from '@/lib/prisma'
import { publicReviewerName } from '@/lib/guide-workflow'

const moderationSchema = z.object({
  reviewId: z.string().min(1),
  status: z.enum(['APPROVED', 'REJECTED', 'HIDDEN']),
  reason: z.string().trim().min(10).max(1000),
})

export async function GET(req: NextRequest) {
  const actor = await getAdminActor(req)
  if (!actor) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const reviews = await prisma.review.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      pelerin: { select: { firstName: true, lastName: true, country: true, email: true } },
      guideProfile: { select: { slug: true, guideAccount: { select: { displayName: true, firstName: true, lastName: true } } } },
      reservation: { select: { refNumber: true, stayRating: true, stayComment: true } },
    },
  })

  return NextResponse.json({ reviews: reviews.map(review => {
    const guide = review.guideProfile.guideAccount
    return {
      id: review.id,
      reservationRef: review.reservation.refNumber,
      stayRating: review.reservation.stayRating,
      stayComment: review.reservation.stayComment,
      guideName: guide?.displayName || `${guide?.firstName ?? ''} ${guide?.lastName ?? ''}`.trim() || review.guideProfile.slug,
      author: publicReviewerName(review.pelerin.firstName, review.pelerin.lastName),
      authorEmail: review.pelerin.email,
      country: review.pelerin.country,
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
  }) })
}

export async function PATCH(req: NextRequest) {
  const origin = req.headers.get('origin')
  if (origin && origin !== req.nextUrl.origin) return NextResponse.json({ error: 'Origine non autorisée' }, { status: 403 })
  const actor = await getAdminActor(req)
  if (!actor) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const parsed = moderationSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Statut ou motif invalide' }, { status: 400 })
  const auditContext = getAdminAuditContext(req)

  const existing = await prisma.review.findUnique({
    where: { id: parsed.data.reviewId },
    select: { id: true, status: true, reservation: { select: { refNumber: true } } },
  })
  if (!existing) return NextResponse.json({ error: 'Avis introuvable' }, { status: 404 })

  await prisma.$transaction(async tx => {
    await tx.review.update({
      where: { id: existing.id },
      data: {
        status: parsed.data.status,
        moderationNote: parsed.data.reason,
        moderatedByAdminId: actor.id,
        moderatedByEmail: actor.email,
        moderatedAt: new Date(),
      },
    })
    await tx.auditLog.create({
      data: {
        actor: actor.email,
        actorRole: actor.role,
        actorAdminId: actor.id,
        action: 'REVIEW_MODERATED',
        target: existing.reservation.refNumber,
        detail: adminAuditDetail(auditContext, { reason: parsed.data.reason }),
        before: { status: existing.status },
        after: { status: parsed.data.status },
        ...adminAuditFields(auditContext),
      },
    })
  })

  return NextResponse.json({ success: true })
}
