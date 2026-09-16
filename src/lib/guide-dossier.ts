import 'server-only'

import { createHash } from 'node:crypto'
import type { Prisma } from '@prisma/client'
import { decrypt } from '@/lib/crypto'
import { readGuideProfileMedia } from '@/lib/guide-profile-media'
import { getEffectivePlaceCatalog } from '@/lib/place-catalog'
import { BOOKING_NET_COSTS } from '@/lib/booking-pricing'
import { missingRequiredGuideProfileFields, guideProfileChangesSchema, decryptBankProposal } from '@/lib/guide-profile-changes'
import { GUIDE_DOSSIER_ACKNOWLEDGEMENTS, GUIDE_DOSSIER_TERMS_VERSION, GUIDE_PAYOUT_POLICY, type GuideDossierSection } from '@/lib/guide-payout-policy'
import { adminAuditDetail, adminAuditFields, type AdminActor, type AdminAuditContext } from '@/lib/check-admin'
import { queueGuideDossierEmail } from '@/lib/email'

export const dossierSections = Object.keys(GUIDE_DOSSIER_ACKNOWLEDGEMENTS) as GuideDossierSection[]
export const dossierAction = (section: GuideDossierSection) => `GUIDE_DOSSIER_${section.toUpperCase()}_CONFIRMED`
export function dossierFingerprint(value: unknown) {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex')
}

export function isCurrentDossierConfirmation(after: Prisma.JsonValue | null, revision: string) {
  return Boolean(after && typeof after === 'object' && !Array.isArray(after) && after.revision === revision)
}

// Both GET and the confirmation transaction read the same owner-scoped sources.
// No new business table: confirmations are immutable events in the existing audit.
export async function readGuideDossier(db: Prisma.TransactionClient, guideAccountId: string, options: { administrative?: boolean } = {}) {
  const account = await db.guideAccount.findUnique({
    where: { id: guideAccountId },
    include: { guideProfile: { include: {
      languages: { orderBy: { languageCode: 'asc' }, select: { languageCode: true } },
      changeRequests: { where: { status: 'PENDING' }, orderBy: [{ updatedAt: 'desc' }, { id: 'desc' }], take: 1, select: { id: true, updatedAt: true, changes: true } },
    } } },
  })
  if (!account?.guideProfile) throw new Error('DOSSIER_NOT_FOUND')
  const gp = account.guideProfile
  const parsed = guideProfileChangesSchema.safeParse(gp.changeRequests[0]?.changes)
  const pending = !options.administrative && parsed.success ? parsed.data : {}
  if (!options.administrative && (account.status !== 'ACTIVE' || gp.status === 'SUSPENDED' || gp.permanentlyDeactivatedAt)) throw new Error('DOSSIER_FORBIDDEN')
  const [media, catalog, places, dates, ...acknowledgements] = await Promise.all([
    readGuideProfileMedia(db, gp.id),
    getEffectivePlaceCatalog(db),
    db.guidePlace.findMany({ where: { guideProfileId: gp.id }, orderBy: { placeKey: 'asc' }, select: { placeKey: true, isActive: true } }),
    db.availability.findMany({ where: { guideProfileId: gp.id, status: 'UNAVAILABLE' }, orderBy: [{ date: 'asc' }, { city: 'asc' }], select: { date: true, city: true } }),
    ...dossierSections.map(section => db.auditLog.findFirst({
      where: { target: gp.id, actorRole: 'GUIDE', action: dossierAction(section) },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }], select: { after: true, createdAt: true },
    })),
  ])
  let iban: string | null = null
  let bic: string | null = null
  let bankReadable = true
  try {
    iban = gp.ibanEncrypted ? decrypt(gp.ibanEncrypted) : null
    bic = gp.bicEncrypted ? decrypt(gp.bicEncrypted) : null
  } catch {
    // Never expose ciphertext, crypto errors or a made-up value to the client.
    bankReadable = false
    iban = null
    bic = null
  }
  let bank = {
    firstName: gp.bankAccountFirstName, lastName: gp.bankAccountLastName,
    bankName: gp.bankName, country: gp.bankCountry, iban, bic, readable: bankReadable,
  }
  if (pending.bankEncrypted) {
    try { const proposed = decryptBankProposal(pending.bankEncrypted); bank = { firstName: proposed.firstName, lastName: proposed.lastName, bankName: proposed.bankName, country: proposed.country, iban: proposed.iban, bic: proposed.bic || null, readable: true } }
    catch { bank = { firstName: null, lastName: null, bankName: null, country: null, iban: null, bic: null, readable: false } }
  }
  const baseRates = [
    { city: 'Makkah', enabled: gp.servesMakkah, cents: [gp.makkahNetUpTo6Cents, gp.makkahNetUpTo15Cents, gp.makkahNetUpTo32Cents] },
    { city: 'Médine', enabled: gp.servesMadinah, cents: [gp.madinahNetUpTo6Cents, gp.madinahNetUpTo15Cents, gp.madinahNetUpTo32Cents] },
  ]
  const placeRates = catalog.filter(place => place.isActive && !place.includedInBase).map(place => ({
    key: place.key, name: place.nameFr,
    cents: [place.netUpTo6Cents, place.netUpTo15Cents, place.netUpTo32Cents],
  })).sort((a, b) => a.key.localeCompare(b.key))
  const rates = { base: baseRates, places: placeRates, travelNetEuros: BOOKING_NET_COSTS }
  const calendar = { servesMakkah: gp.servesMakkah, servesMadinah: gp.servesMadinah, places, unavailableDates: dates.map(date => ({ city: date.city, date: date.date.toISOString() })) }
  const snapshots = {
    bank: {
      // Bank details stay in their encrypted fields, never in the general audit.
      fingerprint: dossierFingerprint({ guideAccountId, firstName: pending.firstName ?? account.firstName, lastName: pending.lastName ?? account.lastName, bank }),
      requirement: GUIDE_PAYOUT_POLICY.holder,
    },
    rates,
    terms: { version: GUIDE_DOSSIER_TERMS_VERSION, conditions: '/conditions-guides', charter: '/charte-islamique', policy: GUIDE_PAYOUT_POLICY },
    calendar,
  }
  const bankReady = bank.readable && [bank.firstName, bank.lastName, bank.bankName, bank.country, bank.iban].every(value => Boolean(value?.trim()))
  const ready = { bank: bankReady, rates: baseRates.some(rate => rate.enabled), terms: true, calendar: gp.servesMakkah || gp.servesMadinah }
  const confirmations = dossierSections.map((section, index) => {
    const revision = dossierFingerprint({ guideAccountId, section, acknowledgement: GUIDE_DOSSIER_ACKNOWLEDGEMENTS[section], snapshot: snapshots[section] })
    const previous = acknowledgements[index]
    const legacyBankRevision = section === 'bank' && !pending.bankEncrypted && pending.firstName === undefined && pending.lastName === undefined
      ? dossierFingerprint({ guideAccountId, section, acknowledgement: GUIDE_DOSSIER_ACKNOWLEDGEMENTS[section], snapshot: {
        fingerprint: dossierFingerprint({ guideAccountId, firstName: account.firstName, lastName: account.lastName, bank, encryptedIban: gp.ibanEncrypted, encryptedBic: gp.bicEncrypted }),
        requirement: GUIDE_PAYOUT_POLICY.holder,
      } }) : null
    const confirmed = isCurrentDossierConfirmation(previous?.after ?? null, revision) || Boolean(legacyBankRevision && isCurrentDossierConfirmation(previous?.after ?? null, legacyBankRevision))
    return { section, revision, ready: ready[section], confirmed, confirmedAt: confirmed ? previous!.createdAt.toISOString() : null }
  })
  const missing = missingRequiredGuideProfileFields({
    firstName: pending.firstName ?? account.firstName, lastName: pending.lastName ?? account.lastName,
    phoneWhatsapp: pending.phoneWhatsapp ?? account.phoneWhatsapp, bio: pending.bio ?? gp.bio,
    city: pending.city ?? gp.city, gender: pending.gender ?? gp.gender, nationality: pending.nationality ?? gp.nationality,
    experienceYears: pending.experienceYears === undefined ? gp.experienceYears : pending.experienceYears,
    languages: pending.languages ?? gp.languages.map(language => language.languageCode),
    servesMakkah: gp.servesMakkah, servesMadinah: gp.servesMadinah,
  }, { requireSupportedCity: true })
  const progress = [
    { key: 'identity', label: 'Informations du profil renseignées', complete: missing.length === 0 },
    { key: 'photo', label: 'Photo présente au dossier', complete: Boolean(account.image || media.snapshot.profilePhotoPath || pending.media?.profilePhotoPath) },
    ...confirmations.map(item => ({ key: item.section, label: { bank: 'Coordonnées confirmées par vous', rates: 'Montants nets acceptés', terms: 'Conditions et rémunération acceptées', calendar: 'Disponibilités vérifiées par vous' }[item.section], complete: item.ready && item.confirmed })),
  ]
  return {
    guideProfileId: gp.id,
    account,
    snapshots,
    view: { bank, bankProposalPending: Boolean(pending.bankEncrypted), rates, confirmations, progress, missingProfileFields: missing, termsVersion: GUIDE_DOSSIER_TERMS_VERSION },
  }
}

export type GuideDossierView = Awaited<ReturnType<typeof readGuideDossier>>['view']

export class GuideDossierDecisionError extends Error {
  constructor(message: string, public status = 409) { super(message) }
}

export async function requireCurrentDossierAdmin(db: Prisma.TransactionClient, actor: AdminActor) {
  const current = actor.id ? await db.adminAccount.findUnique({ where: { id: actor.id }, select: { status: true, role: true, email: true } }) : null
  if (!current || current.status !== 'ACTIVE' || current.role !== actor.role || current.email !== actor.email) {
    throw new GuideDossierDecisionError('Accès administrateur non autorisé.', 403)
  }
}

export async function readAdminGuideDossier(db: Prisma.TransactionClient, guideAccountId: string, actor: AdminActor) {
  const dossier = await readGuideDossier(db, guideAccountId, { administrative: true })
  const account = dossier.account
  const profile = account.guideProfile!
  const [previousActivation, bankEvent, photoEvent] = await Promise.all([
    db.auditLog.findFirst({ where: { target: profile.id, action: 'GUIDE_ACTIVATED', actorRole: { in: ['ADMIN', 'SUPERADMIN'] } }, orderBy: [{ createdAt: 'desc' }, { id: 'desc' }], select: { id: true } }),
    db.auditLog.findFirst({ where: { target: profile.id, action: 'GUIDE_BANK_VERIFIED', actorRole: { in: ['ADMIN', 'SUPERADMIN'] } }, orderBy: [{ createdAt: 'desc' }, { id: 'desc' }], select: { after: true, createdAt: true, actor: true } }),
    db.auditLog.findFirst({ where: { target: profile.id, action: 'GUIDE_PHOTO_PUBLISHED', actorRole: 'SUPERADMIN' }, orderBy: [{ createdAt: 'desc' }, { id: 'desc' }], select: { after: true } }),
  ])
  const bankRevision = dossierFingerprint({ guideProfileId: profile.id, bank: dossier.snapshots.bank })
  const verified = isCurrentDossierConfirmation(bankEvent?.after ?? null, bankRevision)
  const bankVerification = { revision: bankRevision, verified, verifiedAt: verified ? bankEvent!.createdAt.toISOString() : null, verifiedByEmail: verified ? bankEvent!.actor : null }
  const previouslyPublished = Boolean(profile.approvedAt || previousActivation)
  const publicPhotoApproved = Boolean(account.image && photoEvent?.after && typeof photoEvent.after === 'object' && !Array.isArray(photoEvent.after) && photoEvent.after.image === account.image)
  const blockers: string[] = []
  if (profile.permanentlyDeactivatedAt) blockers.push('Ce Guide est définitivement désactivé après trois annulations comptabilisées.')
  if (profile.status === 'DRAFT') blockers.push('Le Guide doit d’abord soumettre son profil pour validation.')
  if (profile.status === 'ACTIVE') blockers.push('Le profil est déjà actif.')
  if (!previouslyPublished) {
    if (actor.role !== 'SUPERADMIN') blockers.push('La première publication est réservée au Superadmin.')
    if (!profile.profileSubmittedAt) blockers.push('Le Guide doit soumettre son dossier complet avant sa première publication.')
    if (profile.changeRequests.length) blockers.push('Traitez d’abord les modifications de profil en attente.')
    blockers.push(...dossier.view.progress.filter(item => !item.complete).map(item => item.label))
    if (!publicPhotoApproved) blockers.push('Une photo publique validée par le Superadmin est nécessaire.')
    if (!verified) blockers.push('Vérifiez manuellement les coordonnées bancaires et leur titulaire.')
  } else {
    // Reactivation keeps the pre-existing profile checks, without retroactively
    // imposing the new onboarding acknowledgements on already published Guides.
    const missing = missingRequiredGuideProfileFields({
      firstName: account.firstName, lastName: account.lastName, phoneWhatsapp: account.phoneWhatsapp,
      bio: profile.bio, city: profile.city, gender: profile.gender, nationality: profile.nationality,
      experienceYears: profile.experienceYears, languages: profile.languages.map(item => item.languageCode),
      servesMakkah: profile.servesMakkah, servesMadinah: profile.servesMadinah,
    })
    if (missing.length) blockers.push(`Profil incomplet : ${missing.join(', ')}.`)
    if (profile.status === 'REVIEW' && profile.changeRequests.length) blockers.push('Traitez d’abord les modifications de profil en attente.')
  }
  // Includes all decision inputs; a stale screen cannot activate, even if still complete.
  const revision = dossierFingerprint({ profile, account: { id: account.id, updatedAt: account.updatedAt, status: account.status, firstName: account.firstName, lastName: account.lastName, phoneWhatsapp: account.phoneWhatsapp, image: account.image }, snapshots: dossier.snapshots, confirmations: dossier.view.confirmations, bankVerification, previouslyPublished, publicPhotoApproved })
  return { ...dossier.view, revision, bankVerification, activation: { previouslyPublished, requiresSuperadmin: !previouslyPublished, canActivate: blockers.length === 0, blockers, revision } }
}

// Both historical activation endpoints use the same fresh transaction and decision rules.
export async function decideGuideStatus(db: Prisma.TransactionClient, actor: AdminActor, auditContext: AdminAuditContext, where: { id: string } | { slug: string }, action: 'activate' | 'suspend', revision?: string) {
  await requireCurrentDossierAdmin(db, actor)
  const profile = await db.guideProfile.findUnique({ where, include: { guideAccount: true } })
  if (!profile?.guideAccount) throw new GuideDossierDecisionError('Guide introuvable.', 404)
  const dossier = action === 'activate' ? await readAdminGuideDossier(db, profile.guideAccount.id, actor) : null
  if (dossier && revision !== dossier.revision) throw new GuideDossierDecisionError('Le dossier a changé. Rechargez la fiche avant de décider.')
  if (dossier && !dossier.activation.canActivate) throw new GuideDossierDecisionError(dossier.activation.blockers.join(' '), dossier.activation.requiresSuperadmin && actor.role !== 'SUPERADMIN' ? 403 : 409)
  const status = action === 'activate' ? 'ACTIVE' : 'SUSPENDED'
  await db.guideProfile.update({ where: { id: profile.id }, data: {
    status,
    ...(status === 'ACTIVE' && { approvedByAdminId: actor.id, approvedByEmail: actor.email, approvedAt: profile.approvedAt ?? new Date() }),
  } })
  await db.guideAccount.update({ where: { id: profile.guideAccount.id }, data: { status } })
  if (status === 'SUSPENDED') await db.guideSession.updateMany({ where: { guideAccountId: profile.guideAccount.id, revokedAt: null }, data: { revokedAt: new Date() } })
  const decision = await db.auditLog.create({ data: {
    actor: actor.email, actorRole: actor.role, actorAdminId: actor.id,
    action: status === 'ACTIVE' ? 'GUIDE_ACTIVATED' : 'GUIDE_SUSPENDED', target: profile.id,
    detail: adminAuditDetail(auditContext, dossier ? { revision, previouslyPublished: dossier.activation.previouslyPublished } : {}),
    before: { status: profile.status }, after: { status }, ...adminAuditFields(auditContext),
  } })
  const emailIds = status === 'ACTIVE' && profile.status !== 'ACTIVE'
    ? [await queueGuideDossierEmail(db, {
      eventId: decision.id, guideProfileId: profile.id, event: 'ACTIVATED',
      to: profile.guideAccount.email,
      name: profile.guideAccount.displayName || profile.guideAccount.firstName || 'Guide',
      slug: profile.slug,
    })] : []
  return { status, profile, emailIds }
}
