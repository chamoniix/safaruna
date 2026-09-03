import { Prisma } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'
import { baseTemplate, badge, btn, divider, escapeHtml, heading, p, sendEmail } from '@/lib/email'
import { getGuideRequestContext, hasTrustedGuideAuthOrigin } from '@/lib/guide-auth'
import { guideProfileChangesSchema, missingRequiredGuideProfileFields } from '@/lib/guide-profile-changes'
import prisma from '@/lib/prisma'
import { requireGuide } from '@/lib/require-account'

export async function POST(req: NextRequest) {
  if (!hasTrustedGuideAuthOrigin(req)) return NextResponse.json({ error: 'Origine non autorisée' }, { status: 403 })
  const access = await requireGuide()
  if (!access.ok) return access.response
  const requestContext = getGuideRequestContext(req)
  const submittedAt = new Date()

  let result: { alreadySubmitted: boolean; slug: string | null; name: string }
  try {
    result = await prisma.$transaction(async tx => {
    const account = await tx.guideAccount.findUnique({
      where: { id: access.actor.id },
      include: {
        guideProfile: {
          include: {
            languages: { select: { languageCode: true } },
            changeRequests: {
              where: { status: 'PENDING' },
              orderBy: { updatedAt: 'desc' },
              take: 1,
              select: { changes: true },
            },
          },
        },
      },
    })
    if (!account?.guideProfile) throw new Error('PROFILE_NOT_FOUND')
    const profile = account.guideProfile
    if (profile.status === 'REVIEW') return { alreadySubmitted: true, slug: profile.slug, name: account.displayName || account.firstName || 'Guide' }
    if (profile.status !== 'DRAFT') throw new Error('PROFILE_NOT_DRAFT')

    const pending = profile.changeRequests[0]
      ? guideProfileChangesSchema.safeParse(profile.changeRequests[0].changes)
      : null
    const changes = pending?.success ? pending.data : {}
    const effective = {
      firstName: changes.firstName ?? account.firstName,
      lastName: changes.lastName ?? account.lastName,
      phoneWhatsapp: changes.phoneWhatsapp ?? account.phoneWhatsapp,
      bio: changes.bio ?? profile.bio,
      city: changes.city ?? profile.city,
      gender: changes.gender ?? profile.gender,
      nationality: changes.nationality ?? profile.nationality,
      experienceYears: changes.experienceYears ?? profile.experienceYears,
      languages: changes.languages ?? profile.languages.map(language => language.languageCode),
      servesMakkah: profile.servesMakkah,
      servesMadinah: profile.servesMadinah,
    }
    const missing = missingRequiredGuideProfileFields(effective)
    if (missing.length > 0) throw new Error(`PROFILE_INCOMPLETE:${missing.join(', ')}`)

    await tx.guideProfile.update({
      where: { id: profile.id },
      data: { status: 'REVIEW', profileSubmittedAt: submittedAt },
    })
    await tx.auditLog.create({
      data: {
        actor: access.actor.email,
        actorRole: 'GUIDE',
        action: 'GUIDE_PROFILE_SUBMITTED_FOR_REVIEW',
        target: profile.id,
        detail: JSON.stringify({
          pendingProfileChange: Boolean(profile.changeRequests[0]),
          request: {
            country: requestContext.country,
            city: requestContext.city,
            device: requestContext.device,
            browser: requestContext.browser,
          },
        }),
        ip: requestContext.ip,
        userAgent: requestContext.userAgent,
        before: { status: 'DRAFT' },
        after: { status: 'REVIEW', profileSubmittedAt: submittedAt.toISOString() },
      },
    })
    return { alreadySubmitted: false, slug: profile.slug, name: account.displayName || account.firstName || 'Guide' }
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable })
  } catch (error) {
    if (error instanceof Error && error.message === 'PROFILE_NOT_FOUND') {
      return NextResponse.json({ error: 'Profil Guide introuvable' }, { status: 404 })
    }
    if (error instanceof Error && error.message === 'PROFILE_NOT_DRAFT') {
      return NextResponse.json({ error: 'Ce profil ne peut pas être soumis dans son état actuel' }, { status: 409 })
    }
    if (error instanceof Error && error.message.startsWith('PROFILE_INCOMPLETE:')) {
      return NextResponse.json({ error: `Complétez les champs suivants : ${error.message.slice('PROFILE_INCOMPLETE:'.length)}.` }, { status: 400 })
    }
    throw error
  }

  if (result.alreadySubmitted) return NextResponse.json({ success: true, alreadySubmitted: true, status: 'REVIEW' })

  const admins = await prisma.adminAccount.findMany({
    where: { status: 'ACTIVE' },
    select: { email: true, name: true, role: true },
  })
  await Promise.allSettled(admins.map(admin => sendEmail({
    category: 'GUIDE_PROFILE_REVIEW_SUBMITTED',
    retryable: true,
    idempotencyKey: `guide-profile-review:${access.actor.guideProfileId}:${submittedAt.toISOString()}:${admin.email.toLowerCase()}`,
    reference: { type: 'GUIDE_PROFILE', id: access.actor.guideProfileId },
    to: { email: admin.email, name: admin.name || admin.role },
    subject: `[${admin.role}] Profil Guide à valider — ${result.name}`,
    html: baseTemplate(`
      ${heading('Un Guide a soumis son profil')}
      ${badge('À TRAITER SOUS 48 H', '#D97706')}
      ${p(`<strong>${escapeHtml(result.name)}</strong> a terminé son profil et demande sa publication.`)}
      ${divider()}
      ${btn('Examiner le profil', `${process.env.NEXT_PUBLIC_BASE_URL || 'https://safaruma.com'}/admin/guides/${encodeURIComponent(result.slug || '')}`)}
    `),
  })))

  return NextResponse.json({ success: true, status: 'REVIEW', submittedAt })
}
