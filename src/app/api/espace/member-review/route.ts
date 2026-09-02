import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { analyticsCountry, analyticsDevice, recordAnalyticsEvent } from '@/lib/analytics'
import { requirePelerin } from '@/lib/require-account'
import { checkRateLimitKey, reviewRatelimit } from '@/lib/ratelimit'

const memberReviewSchema = z.object({
  firstName: z.string().trim().min(2).max(80),
  city: z.string().trim().min(2).max(120),
  country: z.string().trim().min(2).max(120),
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().min(1).max(2000),
})

function requestIp(req: NextRequest) {
  return (req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown').slice(0, 64)
}

export async function GET() {
  const access = await requirePelerin()
  if (!access.ok) return access.response

  const [user, review] = await Promise.all([
    prisma.user.findUnique({
      where: { id: access.actor.id },
      select: { firstName: true, country: true },
    }),
    prisma.experienceReview.findUnique({
      where: { generalReviewKey: access.actor.id },
      select: {
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
  ])

  return NextResponse.json({
    profile: { firstName: user?.firstName || '', country: user?.country || '' },
    review,
  }, { headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } })
}

async function saveMemberReview(req: NextRequest) {
  const origin = req.headers.get('origin')
  if (origin && origin !== req.nextUrl.origin) {
    return NextResponse.json({ error: 'Origine non autorisée' }, { status: 403 })
  }

  const contentLength = Number(req.headers.get('content-length') ?? '0')
  if (contentLength > 12_000) return NextResponse.json({ error: 'Contenu trop volumineux' }, { status: 413 })

  const access = await requirePelerin()
  if (!access.ok) return access.response
  const limited = await checkRateLimitKey(reviewRatelimit, `${requestIp(req)}:${access.actor.id}:member-review`)
  if (limited) return limited

  const parsed = memberReviewSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: 'Vérifiez votre prénom, votre ville, votre pays, votre note et votre commentaire.' }, { status: 400 })
  }

  const previous = await prisma.experienceReview.findUnique({
    where: { generalReviewKey: access.actor.id },
    select: { id: true, status: true, rating: true, comment: true, firstName: true, city: true, country: true },
  })

  const now = new Date()
  const review = await prisma.$transaction(async tx => {
    const saved = await tx.experienceReview.upsert({
      where: { generalReviewKey: access.actor.id },
      create: {
        userId: access.actor.id,
        generalReviewKey: access.actor.id,
        ...parsed.data,
      },
      update: {
        ...parsed.data,
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
        action: previous ? 'MEMBER_REVIEW_UPDATED' : 'MEMBER_REVIEW_SUBMITTED',
        target: saved.id,
        ip: requestIp(req),
        detail: JSON.stringify({
          request: {
            country: req.headers.get('x-vercel-ip-country')?.slice(0, 32) || null,
            city: req.headers.get('x-vercel-ip-city')?.slice(0, 100) || null,
          },
        }),
        userAgent: (req.headers.get('user-agent') || '').slice(0, 500),
        before: previous || undefined,
        after: { status: saved.status, rating: parsed.data.rating, firstName: parsed.data.firstName, city: parsed.data.city, country: parsed.data.country },
      },
    })
    return saved
  })

  const admins = await prisma.adminAccount.findMany({
    where: { status: 'ACTIVE' },
    select: { email: true, name: true, role: true },
  })
  const { baseTemplate, btn, divider, escapeHtml, heading, p, sendEmail } = await import('@/lib/email')
  await Promise.all(admins.map(admin => sendEmail({
    category: 'REVIEW_SUBMITTED_ADMIN',
    retryable: true,
    idempotencyKey: `member-review:${review.id}:${review.updatedAt.getTime()}:${admin.email.toLowerCase()}`,
    reference: { type: 'EXPERIENCE_REVIEW', id: review.id },
    to: { email: admin.email, name: admin.name || admin.role },
    subject: `[${admin.role}] Nouvel avis membre à modérer`,
    html: baseTemplate(`${heading('Un avis membre attend votre validation')}${p(`<strong>${escapeHtml(parsed.data.firstName)}</strong> · ${escapeHtml(parsed.data.city)}, ${escapeHtml(parsed.data.country)} · ${parsed.data.rating}/5`)}${divider()}${btn('Modérer les avis', `${process.env.NEXT_PUBLIC_BASE_URL || 'https://safaruma.com'}/admin/avis`)}`),
  })))

  await recordAnalyticsEvent({
    eventName: 'review_submitted',
    userId: access.actor.id,
    path: '/avis/deposer',
    country: analyticsCountry(req.headers.get('x-vercel-ip-country')),
    device: analyticsDevice(req.headers.get('user-agent')),
    metadata: { kind: 'MEMBER', operation: previous ? 'update' : 'create' },
  })

  return NextResponse.json({ success: true, status: review.status, submittedAt: now.toISOString() })
}

export async function POST(req: NextRequest) {
  return saveMemberReview(req)
}

export async function PATCH(req: NextRequest) {
  return saveMemberReview(req)
}
