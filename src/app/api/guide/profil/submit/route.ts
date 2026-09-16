import { Prisma } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'
import { dispatchGuideDossierEmails, queueGuideDossierEmail } from '@/lib/email'
import { getGuideRequestContext, hasTrustedGuideAuthOrigin } from '@/lib/guide-auth'
import { readGuideDossier } from '@/lib/guide-dossier'
import prisma from '@/lib/prisma'
import { requireGuide } from '@/lib/require-account'

export async function POST(req: NextRequest) {
  if (!hasTrustedGuideAuthOrigin(req)) return NextResponse.json({ error: 'Origine non autorisée' }, { status: 403 })
  const access = await requireGuide()
  if (!access.ok) return access.response
  const requestContext = getGuideRequestContext(req)
  const submittedAt = new Date()

  let result: { alreadySubmitted: boolean; emailIds: string[] }
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
    if (account.status !== 'ACTIVE' || account.guideProfile.permanentlyDeactivatedAt) throw new Error('DOSSIER_FORBIDDEN')
    const profile = account.guideProfile
    if (profile.status === 'REVIEW') return { alreadySubmitted: true, emailIds: [] }
    if (profile.status !== 'DRAFT') throw new Error('PROFILE_NOT_DRAFT')

    const dossier = await readGuideDossier(tx, account.id)
    const missing = dossier.view.progress.filter(item => !item.complete).map(item => item.label)
    if (missing.length > 0) throw new Error(`PROFILE_INCOMPLETE:${missing.join(', ')}`)
    await tx.guideProfile.update({
      where: { id: profile.id },
      data: { status: 'REVIEW', profileSubmittedAt: submittedAt },
    })
    const submission = await tx.auditLog.create({
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
    const name = account.displayName || account.firstName || 'Guide'
    const emailIds = [await queueGuideDossierEmail(tx, {
      eventId: submission.id, guideProfileId: profile.id, event: 'SUBMITTED', to: account.email, name,
    })]
    const admins = await tx.adminAccount.findMany({ where: { status: 'ACTIVE' }, select: { email: true, name: true, role: true } })
    for (const admin of admins) emailIds.push(await queueGuideDossierEmail(tx, {
      eventId: submission.id, guideProfileId: profile.id, event: 'ADMIN_REVIEW',
      to: admin.email, name: admin.name || admin.role, slug: profile.slug, guideName: name,
    }))
    return { alreadySubmitted: false, emailIds }
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable })
  } catch (error) {
    if (error instanceof Error && error.message === 'DOSSIER_FORBIDDEN') return NextResponse.json({ error: 'Accès Guide non autorisé.' }, { status: 403 })
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2034') return NextResponse.json({ error: 'Votre dossier a changé. Rechargez la page avant de le soumettre.' }, { status: 409 })
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

  await dispatchGuideDossierEmails(result.emailIds)

  return NextResponse.json({ success: true, status: 'REVIEW', submittedAt })
}
