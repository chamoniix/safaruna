import { Prisma } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { adminAuditDetail, adminAuditFields, getAdminActor, getAdminAuditContext } from '@/lib/check-admin'
import { guideProfileChangesSchema } from '@/lib/guide-profile-changes'
import prisma from '@/lib/prisma'

const reviewSchema = z.object({
  requestId: z.string().min(1),
  action: z.enum(['APPROVE', 'REJECT']),
  reviewNotes: z.string().trim().max(2000).optional(),
}).strict()

class ProfileChangedDuringReviewError extends Error {}

function sameValue(left: unknown, right: unknown) {
  return JSON.stringify(left) === JSON.stringify(right)
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const actor = await getAdminActor(req)
  if (!actor) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const parsed = reviewSchema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: 'Paramètres invalides' }, { status: 400 })

  const { slug } = await params
  const auditContext = getAdminAuditContext(req)
  const { requestId, action, reviewNotes } = parsed.data

  try {
    const result = await prisma.$transaction(async tx => {
      const guide = await tx.guideProfile.findUnique({
        where: { slug },
        include: {
          guideAccount: true,
          languages: { orderBy: { languageCode: 'asc' } },
        },
      })
      if (!guide?.guideAccount) throw new Error('GUIDE_NOT_FOUND')

      const changeRequest = await tx.guideProfileChangeRequest.findUnique({ where: { id: requestId } })
      if (!changeRequest || changeRequest.guideProfileId !== guide.id) throw new Error('REQUEST_NOT_FOUND')
      if (changeRequest.status !== 'PENDING' || changeRequest.activeKey !== guide.id) throw new Error('REQUEST_ALREADY_REVIEWED')

      const changesResult = guideProfileChangesSchema.safeParse(changeRequest.changes)
      const before = changeRequest.before as Record<string, unknown>
      if (!changesResult.success) throw new Error('INVALID_STORED_REQUEST')
      const changes = changesResult.data

      const current: Record<string, unknown> = {
        firstName: guide.guideAccount.firstName,
        lastName: guide.guideAccount.lastName,
        phoneWhatsapp: guide.guideAccount.phoneWhatsapp,
        country: guide.guideAccount.country,
        bio: guide.bio,
        city: guide.city,
        gender: guide.gender,
        nationality: guide.nationality,
        experienceYears: guide.experienceYears,
        languages: guide.languages.map(language => language.languageCode).sort(),
      }
      for (const field of Object.keys(changes)) {
        if (!sameValue(current[field], before[field])) throw new ProfileChangedDuringReviewError(field)
      }

      if (action === 'APPROVE') {
        const accountData = {
          ...(changes.firstName !== undefined && { firstName: changes.firstName }),
          ...(changes.lastName !== undefined && { lastName: changes.lastName || null }),
          ...(changes.phoneWhatsapp !== undefined && { phoneWhatsapp: changes.phoneWhatsapp || null }),
          ...(changes.country !== undefined && { country: changes.country || null }),
        }
        if (Object.keys(accountData).length > 0) {
          const finalFirstName = changes.firstName ?? guide.guideAccount.firstName ?? ''
          const finalLastName = changes.lastName ?? guide.guideAccount.lastName ?? ''
          await tx.guideAccount.update({
            where: { id: guide.guideAccount.id },
            data: {
              ...accountData,
              ...((changes.firstName !== undefined || changes.lastName !== undefined) && {
                displayName: `${finalFirstName} ${finalLastName}`.trim() || null,
              }),
            },
          })
        }

        const profileData = {
          ...(changes.bio !== undefined && { bio: changes.bio || null }),
          ...(changes.city !== undefined && { city: changes.city || null }),
          ...(changes.gender !== undefined && { gender: changes.gender }),
          ...(changes.nationality !== undefined && { nationality: changes.nationality || null }),
          ...(changes.experienceYears !== undefined && { experienceYears: changes.experienceYears }),
        }
        if (Object.keys(profileData).length > 0) {
          await tx.guideProfile.update({ where: { id: guide.id }, data: profileData })
        }
        if (changes.languages !== undefined) {
          await tx.guideLanguage.deleteMany({ where: { guideProfileId: guide.id } })
          if (changes.languages.length > 0) {
            await tx.guideLanguage.createMany({
              data: changes.languages.map(languageCode => ({
                guideProfileId: guide.id,
                languageCode,
                level: 'NATIVE',
              })),
            })
          }
        }
      }

      const reviewed = await tx.guideProfileChangeRequest.update({
        where: { id: changeRequest.id },
        data: {
          activeKey: null,
          status: action === 'APPROVE' ? 'APPROVED' : 'REJECTED',
          reviewedByAdminId: actor.id,
          reviewedByEmail: actor.email,
          reviewNotes: reviewNotes || null,
          reviewedAt: new Date(),
        },
      })
      await tx.auditLog.create({
        data: {
          actor: actor.email,
          actorRole: actor.role,
          actorAdminId: actor.id,
          action: action === 'APPROVE' ? 'GUIDE_PROFILE_CHANGE_APPROVED' : 'GUIDE_PROFILE_CHANGE_REJECTED',
          target: changeRequest.id,
          detail: adminAuditDetail(auditContext, { guideProfileId: guide.id, fields: Object.keys(changes) }),
          before: before as Prisma.InputJsonObject,
          after: action === 'APPROVE'
            ? changes as Prisma.InputJsonObject
            : { rejected: true, changes } as Prisma.InputJsonObject,
          ...adminAuditFields(auditContext),
        },
      })

      return reviewed
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable })

    return NextResponse.json({ success: true, status: result.status })
  } catch (error) {
    if (error instanceof ProfileChangedDuringReviewError) {
      return NextResponse.json({ error: 'Le profil a changé depuis cette demande. Rechargez la fiche avant de décider.' }, { status: 409 })
    }
    if (error instanceof Error && error.message === 'GUIDE_NOT_FOUND') {
      return NextResponse.json({ error: 'Guide introuvable' }, { status: 404 })
    }
    if (error instanceof Error && error.message === 'REQUEST_NOT_FOUND') {
      return NextResponse.json({ error: 'Demande introuvable' }, { status: 404 })
    }
    if (error instanceof Error && error.message === 'REQUEST_ALREADY_REVIEWED') {
      return NextResponse.json({ error: 'Cette demande a déjà été traitée' }, { status: 409 })
    }
    if (error instanceof Error && error.message === 'INVALID_STORED_REQUEST') {
      return NextResponse.json({ error: 'Cette demande contient des données invalides' }, { status: 409 })
    }
    console.error('[admin guide profile-change]', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
