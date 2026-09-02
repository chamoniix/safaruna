import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { analyticsCountry, analyticsDevice, recordAnalyticsEvent } from '@/lib/analytics'
import { reviewOpensAt } from '@/lib/guide-workflow'
import { requirePelerin } from '@/lib/require-account'
import { checkRateLimitKey, reviewRatelimit } from '@/lib/ratelimit'

const guideReviewSchema = z.object({
  guideProfileId: z.string().min(1),
  ratingOverall: z.number().int().min(1).max(5),
  ratingPunctuality: z.number().int().min(1).max(5),
  ratingPedagogy: z.number().int().min(1).max(5),
  ratingKnowledge: z.number().int().min(1).max(5),
  comment: z.string().trim().min(1).max(2000),
})

const feedbackSchema = z.object({
  reservationId: z.string().min(1),
  firstName: z.string().trim().min(2).max(80),
  city: z.string().trim().min(2).max(120),
  country: z.string().trim().min(2).max(120),
  stayRating: z.number().int().min(1).max(5),
  stayComment: z.string().trim().min(1).max(2000),
  guideReviews: z.array(guideReviewSchema).min(1),
})

async function ownedReservation(reservationId: string, pelerinId: string) {
  return prisma.reservation.findFirst({
    where: { id: reservationId, pelerinId },
    include: {
      pelerin: { select: { firstName: true, country: true } },
      missions: {
        select: {
          guideProfileId: true,
          guideProfile: {
            select: {
              slug: true,
              guideAccount: { select: { displayName: true, firstName: true, lastName: true } },
            },
          },
        },
      },
      reviews: {
        select: {
          id: true,
          guideProfileId: true,
          status: true,
          ratingOverall: true,
          ratingPunctuality: true,
          ratingPedagogy: true,
          ratingKnowledge: true,
          comment: true,
        },
      },
      experienceReview: {
        select: { firstName: true, city: true, country: true, rating: true, comment: true, status: true },
      },
    },
  })
}

export async function GET(req: NextRequest) {
  const access = await requirePelerin()
  if (!access.ok) return access.response
  const reservationId = req.nextUrl.searchParams.get('reservationId')
  if (!reservationId) return NextResponse.json({ error: 'Réservation manquante' }, { status: 400 })

  const reservation = await ownedReservation(reservationId, access.actor.id)
  if (!reservation) return NextResponse.json({ error: 'Réservation introuvable' }, { status: 404 })

  const guides = [...new Map(reservation.missions.map(mission => {
    const account = mission.guideProfile.guideAccount
    const name = account?.displayName || `${account?.firstName ?? ''} ${account?.lastName ?? ''}`.trim() || mission.guideProfile.slug
    return [mission.guideProfileId, { id: mission.guideProfileId, name }]
  })).values()]
  const editable = reservation.reviews.every(review => review.status === 'PENDING')

  return NextResponse.json({
    reservation: {
      id: reservation.id,
      refNumber: reservation.refNumber,
      status: reservation.status,
      endDate: reservation.endDate,
      reviewOpensAt: reviewOpensAt(reservation.endDate),
      stayRating: reservation.stayRating,
      stayComment: reservation.stayComment,
      feedbackSubmittedAt: reservation.feedbackSubmittedAt,
      author: {
        firstName: reservation.experienceReview?.firstName || reservation.pelerin.firstName || '',
        city: reservation.experienceReview?.city || '',
        country: reservation.experienceReview?.country || reservation.pelerin.country || '',
      },
      experienceReviewStatus: reservation.experienceReview?.status || null,
      guides,
      reviews: reservation.reviews,
      editable,
    },
  })
}

async function saveFeedback(req: NextRequest) {
  const origin = req.headers.get('origin')
  if (origin && origin !== req.nextUrl.origin) return NextResponse.json({ error: 'Origine non autorisée' }, { status: 403 })
  const access = await requirePelerin()
  if (!access.ok) return access.response
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown'
  const limited = await checkRateLimitKey(reviewRatelimit, `${ip}:${access.actor.id}:reservation-review`)
  if (limited) return limited

  const parsed = feedbackSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Données invalides' }, { status: 400 })
  const input = parsed.data
  const reservation = await ownedReservation(input.reservationId, access.actor.id)
  if (!reservation) return NextResponse.json({ error: 'Réservation introuvable' }, { status: 404 })
  if (!['CONFIRMED', 'COMPLETED'].includes(reservation.status)) {
    return NextResponse.json({ error: 'Cette réservation ne peut pas encore recevoir un avis.' }, { status: 409 })
  }
  if (new Date() < reviewOpensAt(reservation.endDate)) {
    return NextResponse.json({ error: 'Le formulaire sera disponible à la fin du séjour.' }, { status: 409 })
  }
  if (reservation.reviews.some(review => review.status !== 'PENDING')) {
    return NextResponse.json({ error: 'Un avis modéré ne peut plus être modifié.' }, { status: 409 })
  }

  const assignedGuideIds = [...new Set(reservation.missions.map(mission => mission.guideProfileId))].sort()
  const submittedGuideIds = [...new Set(input.guideReviews.map(review => review.guideProfileId))].sort()
  if (assignedGuideIds.length !== submittedGuideIds.length || assignedGuideIds.some((id, index) => id !== submittedGuideIds[index])) {
    return NextResponse.json({ error: 'Un avis est requis pour chaque guide de la réservation.' }, { status: 400 })
  }

  const now = new Date()
  await prisma.$transaction(async tx => {
    await tx.reservation.update({
      where: { id: reservation.id },
      data: { stayRating: input.stayRating, stayComment: input.stayComment, feedbackSubmittedAt: now },
    })
    await tx.experienceReview.upsert({
      where: { reservationId: reservation.id },
      create: {
        userId: access.actor.id,
        reservationId: reservation.id,
        firstName: input.firstName,
        city: input.city,
        country: input.country,
        rating: input.stayRating,
        comment: input.stayComment,
      },
      update: {
        firstName: input.firstName,
        city: input.city,
        country: input.country,
        rating: input.stayRating,
        comment: input.stayComment,
        status: 'PENDING',
        moderatedByAdminId: null,
        moderatedByEmail: null,
        moderatedAt: null,
        moderationNote: null,
      },
    })
    for (const review of input.guideReviews) {
      await tx.review.upsert({
        where: { reservationId_guideProfileId: { reservationId: reservation.id, guideProfileId: review.guideProfileId } },
        update: {
          ratingOverall: review.ratingOverall,
          ratingPunctuality: review.ratingPunctuality,
          ratingPedagogy: review.ratingPedagogy,
          ratingKnowledge: review.ratingKnowledge,
          comment: review.comment,
        },
        create: {
          reservationId: reservation.id,
          guideProfileId: review.guideProfileId,
          pelerinId: access.actor.id,
          ratingOverall: review.ratingOverall,
          ratingPunctuality: review.ratingPunctuality,
          ratingPedagogy: review.ratingPedagogy,
          ratingKnowledge: review.ratingKnowledge,
          comment: review.comment,
        },
      })
    }
    await tx.auditLog.create({
      data: {
        actor: access.actor.email,
        actorRole: 'CLIENT',
        action: reservation.reviews.length ? 'REVIEW_UPDATED_PENDING' : 'REVIEW_SUBMITTED',
        target: reservation.refNumber,
        ip: (req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown').slice(0, 64),
        userAgent: (req.headers.get('user-agent') || '').slice(0, 500),
        after: { guideProfileIds: assignedGuideIds, stayRating: input.stayRating, firstName: input.firstName, city: input.city, country: input.country },
      },
    })
  })

  const admins = await prisma.adminAccount.findMany({ where: { status: 'ACTIVE' }, select: { email: true, name: true, role: true } })
  const { baseTemplate, btn, divider, escapeHtml, heading, p, sendEmail } = await import('@/lib/email')
  await Promise.all(admins.map(admin => sendEmail({
    category: 'REVIEW_SUBMITTED_ADMIN',
    retryable: true,
    idempotencyKey: `review-submitted:${reservation.id}:${reservation.reviews.length ? 'updated' : 'created'}:${admin.email.toLowerCase()}`,
    reference: { type: 'RESERVATION', id: reservation.id },
    to: { email: admin.email, name: admin.name || admin.role },
    subject: `[${admin.role}] Nouvel avis à modérer — ${reservation.refNumber}`,
    html: baseTemplate(`${heading('Un avis attend votre validation')}${p(`Réservation : <strong>${escapeHtml(reservation.refNumber)}</strong>`)}${divider()}${btn('Modérer les avis', `${process.env.NEXT_PUBLIC_BASE_URL || 'https://safaruma.com'}/admin/avis`)}`),
  })))

  await recordAnalyticsEvent({
    eventName: 'review_submitted',
    userId: access.actor.id,
    path: `/espace/avis/${reservation.id}`,
    country: analyticsCountry(req.headers.get('x-vercel-ip-country')),
    device: analyticsDevice(req.headers.get('user-agent')),
    metadata: { kind: 'VERIFIED', operation: reservation.reviews.length ? 'update' : 'create' },
  })

  return NextResponse.json({ success: true, status: 'PENDING' })
}

export async function POST(req: NextRequest) {
  return saveFeedback(req)
}

export async function PATCH(req: NextRequest) {
  return saveFeedback(req)
}
