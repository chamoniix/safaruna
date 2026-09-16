import { Prisma } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { adminAuditDetail, adminAuditFields, getAdminActor, getAdminAuditContext } from '@/lib/check-admin'
import { guideProfileChangesSchema, bankBeforeSnapshot, decryptBankProposal, profileChangeRevision, redactProfileAudit, sameProfileValue } from '@/lib/guide-profile-changes'
import { readGuideProfileMedia } from '@/lib/guide-profile-media'
import { encrypt } from '@/lib/crypto'
import { readAdminGuideDossier } from '@/lib/guide-dossier'
import prisma from '@/lib/prisma'
import { dispatchGuideDossierEmails, queueGuideDossierEmail } from '@/lib/email'

const reviewSchema = z.discriminatedUnion('action', [z.object({
  requestId: z.string().min(1),
  revision: z.string().regex(/^[a-f0-9]{64}$/),
  action: z.literal('APPROVE'),
  reviewNotes: z.string().trim().max(2000).optional(),
}).strict(), z.object({
  requestId: z.string().min(1), revision: z.string().regex(/^[a-f0-9]{64}$/),
  action: z.literal('REJECT'), reviewNotes: z.string().trim().min(1).max(2000),
}).strict(), z.object({
  action: z.literal('RETURN_TO_DRAFT'), reviewNotes: z.string().trim().min(1).max(2000),
  profileSubmittedAt: z.string().datetime().nullable(), profileUpdatedAt: z.string().datetime(),
  requestId: z.string().min(1).optional(), revision: z.string().regex(/^[a-f0-9]{64}$/).optional(),
}).strict(), z.object({
  action: z.literal('VERIFY_BANK'), revision: z.string().regex(/^[a-f0-9]{64}$/), accountHolderConfirmed: z.literal(true),
}).strict()])

const privateHeaders = { 'Cache-Control': 'private, no-store' }

class ProfileChangedDuringReviewError extends Error {}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const origin = req.headers.get('origin')
  if (origin && origin !== req.nextUrl.origin) return NextResponse.json({ error: 'Origine non autorisée' }, { status: 403, headers: privateHeaders })
  const actor = await getAdminActor(req)
  if (!actor) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const parsed = reviewSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Paramètres invalides' }, { status: 400 })

  const { slug } = await params
  const auditContext = getAdminAuditContext(req)
  const { action } = parsed.data
  const reviewNotes = 'reviewNotes' in parsed.data ? parsed.data.reviewNotes : undefined

  try {
    const result = await prisma.$transaction(async tx => {
      const currentAdmin = actor.id ? await tx.adminAccount.findUnique({ where: { id: actor.id }, select: { status: true, role: true, email: true } }) : null
      if (!currentAdmin || currentAdmin.status !== 'ACTIVE' || currentAdmin.role !== actor.role || currentAdmin.email !== actor.email) throw new Error('ADMIN_FORBIDDEN')
      const guide = await tx.guideProfile.findUnique({
        where: { slug },
        include: {
          guideAccount: true,
          languages: { orderBy: { languageCode: 'asc' } },
        },
      })
      if (!guide?.guideAccount) throw new Error('GUIDE_NOT_FOUND')
      if (parsed.data.action === 'VERIFY_BANK') {
        if (guide.permanentlyDeactivatedAt) throw new Error('GUIDE_FORBIDDEN')
        const dossier = await readAdminGuideDossier(tx, guide.guideAccount.id, actor)
        if (dossier.bankVerification.revision !== parsed.data.revision) throw new ProfileChangedDuringReviewError('bank')
        if (!dossier.confirmations.find(item => item.section === 'bank')?.ready) throw new Error('BANK_INCOMPLETE')
        if (!dossier.bankVerification.verified) await tx.auditLog.create({ data: {
          actor: actor.email, actorRole: actor.role, actorAdminId: actor.id,
          action: 'GUIDE_BANK_VERIFIED', target: guide.id,
          detail: adminAuditDetail(auditContext),
          after: { revision: dossier.bankVerification.revision, accountHolderConfirmed: true },
          ...adminAuditFields(auditContext),
        } })
        return { status: 'BANK_VERIFIED', emailIds: [] }
      }
      if (guide.guideAccount.status !== 'ACTIVE' || guide.status === 'SUSPENDED' || guide.permanentlyDeactivatedAt) throw new Error('GUIDE_FORBIDDEN')

      if (parsed.data.action === 'RETURN_TO_DRAFT') {
        const expected = parsed.data
        if (guide.status !== 'REVIEW' || guide.updatedAt.toISOString() !== expected.profileUpdatedAt || (guide.profileSubmittedAt?.toISOString() ?? null) !== expected.profileSubmittedAt) throw new ProfileChangedDuringReviewError('status')
        const pending = await tx.guideProfileChangeRequest.findUnique({ where: { activeKey: guide.id } })
        if (pending ? pending.status !== 'PENDING' || pending.id !== expected.requestId || profileChangeRevision(pending) !== expected.revision : Boolean(expected.requestId || expected.revision)) throw new ProfileChangedDuringReviewError('request')
        const reviewedAt = new Date()
        if (pending) {
          await tx.guideProfileChangeRequest.update({ where: { id: pending.id }, data: {
            activeKey: null, status: 'REJECTED', reviewedByAdminId: actor.id,
            reviewedByEmail: actor.email, reviewNotes: expected.reviewNotes, reviewedAt,
          } })
          await tx.auditLog.create({ data: {
            actor: actor.email, actorRole: actor.role, actorAdminId: actor.id,
            action: 'GUIDE_PROFILE_CHANGE_REJECTED', target: pending.id,
            detail: adminAuditDetail(auditContext, { guideProfileId: guide.id, reason: 'RETURN_TO_DRAFT' }),
            before: redactProfileAudit(pending.before), after: { rejected: true, changes: redactProfileAudit(pending.changes) },
            ...adminAuditFields(auditContext),
          } })
        }
        await tx.guideProfile.update({ where: { id: guide.id }, data: { status: 'DRAFT', profileSubmittedAt: null } })
        const returnEvent = await tx.auditLog.create({ data: {
          actor: actor.email, actorRole: actor.role, actorAdminId: actor.id,
          action: 'GUIDE_PROFILE_RETURNED_TO_DRAFT', target: guide.id,
          detail: adminAuditDetail(auditContext, { reason: expected.reviewNotes, requestId: pending?.id ?? null }),
          before: { status: 'REVIEW', profileSubmittedAt: expected.profileSubmittedAt }, after: { status: 'DRAFT' },
          ...adminAuditFields(auditContext),
        } })
        const emailId = await queueGuideDossierEmail(tx, {
          eventId: returnEvent.id, guideProfileId: guide.id, event: 'RETURNED',
          to: guide.guideAccount.email, name: guide.guideAccount.displayName || guide.guideAccount.firstName || 'Guide',
        })
        return { status: 'DRAFT', emailIds: [emailId] }
      }

      const changeRequest = await tx.guideProfileChangeRequest.findUnique({ where: { id: parsed.data.requestId } })
      if (!changeRequest || changeRequest.guideProfileId !== guide.id) throw new Error('REQUEST_NOT_FOUND')
      if (changeRequest.status !== 'PENDING' || changeRequest.activeKey !== guide.id) throw new Error('REQUEST_ALREADY_REVIEWED')
      if (profileChangeRevision(changeRequest) !== parsed.data.revision) throw new ProfileChangedDuringReviewError('revision')

      const changesResult = guideProfileChangesSchema.safeParse(changeRequest.changes)
      const before = changeRequest.before as Record<string, unknown>
      if (!changesResult.success) throw new Error('INVALID_STORED_REQUEST')
      const changes = changesResult.data
      if (action === 'APPROVE' && changes.city !== undefined && !((changes.city === 'MAKKAH' && guide.servesMakkah) || (changes.city === 'MADINAH' && guide.servesMadinah))) throw new Error('CITY_UNAVAILABLE')
      let bank: ReturnType<typeof decryptBankProposal> | null = null
      if (changes.bankEncrypted && action === 'APPROVE') {
        try { bank = decryptBankProposal(changes.bankEncrypted) } catch { throw new Error('INVALID_STORED_REQUEST') }
      }

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
        pricingCorrectionRequest: null,
        personalCorrectionRequest: null,
        languagesCorrectionRequest: null,
      }
      if (action === 'APPROVE') {
        if (changes.bankEncrypted) current.bankEncrypted = bankBeforeSnapshot(guide)
        if (changes.media) current.media = (await readGuideProfileMedia(tx, guide.id)).snapshot
        for (const field of Object.keys(changes)) {
          if (!sameProfileValue(current[field], before[field])) throw new ProfileChangedDuringReviewError(field)
        }
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
        let bankData = {}
        if (bank) {
          try { bankData = { bankAccountFirstName: bank.firstName, bankAccountLastName: bank.lastName,
            bankName: bank.bankName, bankCountry: bank.country, ibanEncrypted: encrypt(bank.iban),
            bicEncrypted: bank.bic ? encrypt(bank.bic) : null } }
          catch { throw new Error('BANK_UNAVAILABLE') }
        }
        if (Object.keys(profileData).length > 0 || bank) {
          await tx.guideProfile.update({ where: { id: guide.id }, data: {
            ...profileData, ...bankData,
          } })
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
      const decision = await tx.auditLog.create({
        data: {
          actor: actor.email,
          actorRole: actor.role,
          actorAdminId: actor.id,
          action: action === 'APPROVE' ? 'GUIDE_PROFILE_CHANGE_APPROVED' : 'GUIDE_PROFILE_CHANGE_REJECTED',
          target: changeRequest.id,
          detail: adminAuditDetail(auditContext, { guideProfileId: guide.id, fields: Object.keys(changes) }),
          before: redactProfileAudit(before),
          after: action === 'APPROVE'
            ? redactProfileAudit(changes)
            : { rejected: true, changes: redactProfileAudit(changes) },
          ...adminAuditFields(auditContext),
        },
      })

      const emailId = await queueGuideDossierEmail(tx, {
        eventId: decision.id, guideProfileId: guide.id, event: action === 'APPROVE' ? 'APPROVED' : 'REJECTED',
        to: guide.guideAccount.email, name: guide.guideAccount.displayName || guide.guideAccount.firstName || 'Guide',
      })
      return { status: reviewed.status, emailIds: [emailId] }
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable })

    await dispatchGuideDossierEmails(result.emailIds)
    return NextResponse.json({ success: true, status: result.status }, { headers: privateHeaders })
  } catch (error) {
    if (error instanceof Error && error.message === 'BANK_INCOMPLETE') return NextResponse.json({ error: 'Complétez les coordonnées bancaires avant leur vérification.' }, { status: 409, headers: privateHeaders })
    if (error instanceof Error && error.message === 'CITY_UNAVAILABLE') return NextResponse.json({ error: 'La ville principale proposée doit être Makkah ou Médine et être actuellement proposée par le Guide.' }, { status: 409, headers: privateHeaders })
    if (error instanceof Error && error.message === 'BANK_UNAVAILABLE') return NextResponse.json({ error: 'Les coordonnées bancaires ne peuvent pas être enregistrées actuellement. Réessayez ultérieurement.' }, { status: 503, headers: privateHeaders })
    if (error instanceof ProfileChangedDuringReviewError || (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2034')) {
      return NextResponse.json({ error: 'Le profil a changé depuis cette demande. Rechargez la fiche avant de décider.' }, { status: 409 })
    }
    if (error instanceof Error && ['ADMIN_FORBIDDEN', 'GUIDE_FORBIDDEN'].includes(error.message)) return NextResponse.json({ error: 'Accès non autorisé.' }, { status: 403, headers: privateHeaders })
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
