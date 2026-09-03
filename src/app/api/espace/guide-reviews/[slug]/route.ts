import { Prisma } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { analyticsCountry, analyticsDevice, recordAnalyticsEvent } from '@/lib/analytics'
import prisma from '@/lib/prisma'
import { requirePelerin } from '@/lib/require-account'
import { checkRateLimitKey, reviewRatelimit } from '@/lib/ratelimit'

const directGuideReviewSchema = z.object({
  firstName: z.string().trim().min(2).max(80),
  city: z.string().trim().min(2).max(120),
  country: z.string().trim().min(2).max(120),
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().min(1).max(2000),
})

class DirectGuideReviewLimitError extends Error {}

function requestIp(req: NextRequest) {
  return (req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown').slice(0, 64)
}

function reviewKey(pelerinId: string, guideProfileId: string) {
  return `${pelerinId}:${guideProfileId}`
}

function guideName(guide: {
  slug: string | null
  guideAccount: { displayName: string | null; firstName: string | null; lastName: string | null } | null
}) {
  const account = guide.guideAccount
  return account?.displayName || [account?.firstName, account?.lastName].filter(Boolean).join(' ') || guide.slug || 'Guide SAFARUMA'
}

async function activeGuide(slug: string) {
  return prisma.guideProfile.findFirst({
    where: { slug, status: 'ACTIVE' },
    select: {
      id: true,
      slug: true,
      guideAccount: { select: { displayName: true, firstName: true, lastName: true, image: true } },
    },
  })
}

export async function GET(_req: NextRequest, context: { params: Promise<{ slug: string }> }) {
  const access = await requirePelerin()
  if (!access.ok) return access.response
  const { slug } = await context.params
  const guide = await activeGuide(slug)
  if (!guide || !guide.guideAccount) return NextResponse.json({ error: 'Guide introuvable' }, { status: 404 })

  const key = reviewKey(access.actor.id, guide.id)
  const [user, review, usedGuideReviews] = await Promise.all([
    prisma.user.findUnique({ where: { id: access.actor.id }, select: { firstName: true, country: true } }),
    prisma.review.findUnique({
      where: { directReviewKey: key },
      select: {
        reviewerFirstName: true,
        reviewerCity: true,
        reviewerCountry: true,
        ratingOverall: true,
        comment: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.review.count({ where: { pelerinId: access.actor.id, directReviewKey: { not: null } } }),
  ])

  return NextResponse.json({
    guide: { slug: guide.slug, name: guideName(guide), image: guide.guideAccount.image },
    profile: { firstName: user?.firstName || '', country: user?.country || '' },
    review: review ? {
      firstName: review.reviewerFirstName || user?.firstName || '',
      city: review.reviewerCity || '',
      country: review.reviewerCountry || user?.country || '',
      rating: review.ratingOverall,
      comment: review.comment,
      status: review.status,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
    } : null,
    quota: { used: usedGuideReviews, maximum: 2, remaining: Math.max(0, 2 - usedGuideReviews) },
  }, { headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } })
}

async function saveDirectGuideReview(req: NextRequest, context: { params: Promise<{ slug: string }> }) {
  const origin = req.headers.get('origin')
  if (origin && origin !== req.nextUrl.origin) return NextResponse.json({ error: 'Origine non autorisée' }, { status: 403 })

  const contentLength = Number(req.headers.get('content-length') ?? '0')
  if (contentLength > 12_000) return NextResponse.json({ error: 'Contenu trop volumineux' }, { status: 413 })

  const access = await requirePelerin()
  if (!access.ok) return access.response
  const limited = await checkRateLimitKey(reviewRatelimit, `${requestIp(req)}:${access.actor.id}:direct-guide-review`)
  if (limited) return limited

  const parsed = directGuideReviewSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: 'Vérifiez votre prénom, votre ville, votre pays, votre note et votre commentaire.' }, { status: 400 })
  }

  const { slug } = await context.params
  const guide = await activeGuide(slug)
  if (!guide || !guide.guideAccount) return NextResponse.json({ error: 'Guide introuvable' }, { status: 404 })

  const key = reviewKey(access.actor.id, guide.id)
  let saved: { id: string; status: string; updatedAt: Date; existed: boolean } | null = null

  for (let attempt = 0; attempt < 3 && !saved; attempt += 1) {
    try {
      saved = await prisma.$transaction(async tx => {
        const previous = await tx.review.findUnique({
          where: { directReviewKey: key },
          select: {
            id: true,
            status: true,
            ratingOverall: true,
            comment: true,
            reviewerFirstName: true,
            reviewerCity: true,
            reviewerCountry: true,
          },
        })
        if (!previous) {
          const usedGuideReviews = await tx.review.count({
            where: { pelerinId: access.actor.id, directReviewKey: { not: null } },
          })
          if (usedGuideReviews >= 2) throw new DirectGuideReviewLimitError()
        }

        const review = await tx.review.upsert({
          where: { directReviewKey: key },
          create: {
            directReviewKey: key,
            guideProfileId: guide.id,
            pelerinId: access.actor.id,
            reviewerFirstName: parsed.data.firstName,
            reviewerCity: parsed.data.city,
            reviewerCountry: parsed.data.country,
            ratingOverall: parsed.data.rating,
            comment: parsed.data.comment,
          },
          update: {
            reviewerFirstName: parsed.data.firstName,
            reviewerCity: parsed.data.city,
            reviewerCountry: parsed.data.country,
            ratingOverall: parsed.data.rating,
            ratingPunctuality: null,
            ratingPedagogy: null,
            ratingKnowledge: null,
            comment: parsed.data.comment,
            status: 'PENDING',
            moderatedByAdminId: null,
            moderatedByEmail: null,
            moderatedAt: null,
            moderationNote: null,
          },
          select: { id: true, status: true, updatedAt: true },
        })

        await tx.auditLog.create({
          data: {
            actor: access.actor.email,
            actorRole: 'CLIENT',
            action: previous ? 'DIRECT_GUIDE_REVIEW_UPDATED' : 'DIRECT_GUIDE_REVIEW_SUBMITTED',
            target: guide.slug || guide.id,
            ip: requestIp(req),
            detail: JSON.stringify({ guideProfileId: guide.id, source: 'DIRECT' }),
            userAgent: (req.headers.get('user-agent') || '').slice(0, 500),
            before: previous || undefined,
            after: {
              status: review.status,
              rating: parsed.data.rating,
              firstName: parsed.data.firstName,
              city: parsed.data.city,
              country: parsed.data.country,
            },
          },
        })
        return { ...review, existed: Boolean(previous) }
      }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable })
    } catch (error) {
      if (error instanceof DirectGuideReviewLimitError) {
        return NextResponse.json({ error: 'Vous avez déjà déposé un avis sur deux Guides différents.' }, { status: 409 })
      }
      if (error instanceof Prisma.PrismaClientKnownRequestError && ['P2002', 'P2034'].includes(error.code) && attempt < 2) continue
      throw error
    }
  }

  if (!saved) return NextResponse.json({ error: 'L’envoi de votre avis a échoué.' }, { status: 503 })

  const admins = await prisma.adminAccount.findMany({
    where: { status: 'ACTIVE' },
    select: { email: true, name: true, role: true },
  })
  const name = guideName(guide)
  const { baseTemplate, btn, divider, escapeHtml, heading, p, sendEmail } = await import('@/lib/email')
  await Promise.all(admins.map(admin => sendEmail({
    category: 'REVIEW_SUBMITTED_ADMIN',
    retryable: true,
    idempotencyKey: `direct-guide-review:${saved.id}:${saved.updatedAt.getTime()}:${admin.email.toLowerCase()}`,
    reference: { type: 'GUIDE_REVIEW', id: saved.id },
    to: { email: admin.email, name: admin.name || admin.role },
    subject: `[${admin.role}] Nouvel avis Guide à modérer — ${name}`,
    html: baseTemplate(`${heading('Un avis Guide attend votre validation')}${p(`<strong>${escapeHtml(parsed.data.firstName)}</strong> · ${escapeHtml(parsed.data.city)}, ${escapeHtml(parsed.data.country)} · ${parsed.data.rating}/5<br>Guide : <strong>${escapeHtml(name)}</strong>`)}${divider()}${btn('Modérer les avis', `${process.env.NEXT_PUBLIC_BASE_URL || 'https://safaruma.com'}/admin/avis`)}`),
  })))

  await recordAnalyticsEvent({
    eventName: 'review_submitted',
    userId: access.actor.id,
    path: `/avis/guide/${slug}`,
    country: analyticsCountry(req.headers.get('x-vercel-ip-country')),
    device: analyticsDevice(req.headers.get('user-agent')),
    metadata: { kind: 'GUIDE', source: 'DIRECT', guideSlug: slug, operation: saved.existed ? 'update' : 'create' },
  })

  return NextResponse.json({ success: true, status: saved.status })
}

export async function POST(req: NextRequest, context: { params: Promise<{ slug: string }> }) {
  return saveDirectGuideReview(req, context)
}

export async function PATCH(req: NextRequest, context: { params: Promise<{ slug: string }> }) {
  return saveDirectGuideReview(req, context)
}
