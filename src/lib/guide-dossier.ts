import 'server-only'

import { createHash } from 'node:crypto'
import type { Prisma } from '@prisma/client'
import { decrypt } from '@/lib/crypto'
import { getEffectivePlaceCatalog } from '@/lib/place-catalog'
import { BOOKING_NET_COSTS } from '@/lib/booking-pricing'
import { missingRequiredGuideProfileFields, guideProfileChangesSchema } from '@/lib/guide-profile-changes'
import { GUIDE_DOSSIER_ACKNOWLEDGEMENTS, GUIDE_DOSSIER_TERMS_VERSION, GUIDE_PAYOUT_POLICY, type GuideDossierSection } from '@/lib/guide-payout-policy'

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
export async function readGuideDossier(db: Prisma.TransactionClient, guideAccountId: string) {
  const account = await db.guideAccount.findUnique({
    where: { id: guideAccountId },
    include: { guideProfile: { include: {
      languages: { select: { languageCode: true } },
      changeRequests: { where: { status: 'PENDING' }, orderBy: { updatedAt: 'desc' }, take: 1, select: { changes: true } },
    } } },
  })
  if (!account?.guideProfile) throw new Error('DOSSIER_NOT_FOUND')
  const gp = account.guideProfile
  if (account.status !== 'ACTIVE' || gp.status === 'SUSPENDED' || gp.permanentlyDeactivatedAt) throw new Error('DOSSIER_FORBIDDEN')
  const [application, catalog, places, dates, ...acknowledgements] = await Promise.all([
    db.guideApplication.findFirst({ where: { createdGuideProfileId: gp.id, status: 'APPROVED' }, orderBy: { createdAt: 'desc' }, select: { profilePhotoPath: true } }),
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
  const bank = {
    firstName: gp.bankAccountFirstName, lastName: gp.bankAccountLastName,
    bankName: gp.bankName, country: gp.bankCountry, iban, bic, readable: bankReadable,
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
      fingerprint: dossierFingerprint({ guideAccountId, firstName: account.firstName, lastName: account.lastName, bank, encryptedIban: gp.ibanEncrypted, encryptedBic: gp.bicEncrypted }),
      requirement: GUIDE_PAYOUT_POLICY.holder,
    },
    rates,
    terms: { version: GUIDE_DOSSIER_TERMS_VERSION, conditions: '/conditions-guides', charter: '/charte-islamique', policy: GUIDE_PAYOUT_POLICY },
    calendar,
  }
  const bankReady = bankReadable && [bank.firstName, bank.lastName, bank.bankName, bank.country, bank.iban].every(value => Boolean(value?.trim()))
  const ready = { bank: bankReady, rates: baseRates.some(rate => rate.enabled), terms: true, calendar: gp.servesMakkah || gp.servesMadinah }
  const confirmations = dossierSections.map((section, index) => {
    const revision = dossierFingerprint({ guideAccountId, section, acknowledgement: GUIDE_DOSSIER_ACKNOWLEDGEMENTS[section], snapshot: snapshots[section] })
    const previous = acknowledgements[index]
    const confirmed = isCurrentDossierConfirmation(previous?.after ?? null, revision)
    return { section, revision, ready: ready[section], confirmed, confirmedAt: confirmed ? previous!.createdAt.toISOString() : null }
  })
  const parsed = guideProfileChangesSchema.safeParse(gp.changeRequests[0]?.changes)
  const pending = parsed.success ? parsed.data : {}
  const missing = missingRequiredGuideProfileFields({
    firstName: pending.firstName ?? account.firstName, lastName: pending.lastName ?? account.lastName,
    phoneWhatsapp: pending.phoneWhatsapp ?? account.phoneWhatsapp, bio: pending.bio ?? gp.bio,
    city: pending.city ?? gp.city, gender: pending.gender ?? gp.gender, nationality: pending.nationality ?? gp.nationality,
    experienceYears: pending.experienceYears === undefined ? gp.experienceYears : pending.experienceYears,
    languages: pending.languages ?? gp.languages.map(language => language.languageCode),
    servesMakkah: gp.servesMakkah, servesMadinah: gp.servesMadinah,
  })
  const progress = [
    { key: 'identity', label: 'Informations du profil renseignées', complete: missing.length === 0 },
    { key: 'photo', label: 'Photo présente au dossier', complete: Boolean(account.image || application?.profilePhotoPath) },
    ...confirmations.map(item => ({ key: item.section, label: { bank: 'Coordonnées confirmées par vous', rates: 'Montants nets acceptés', terms: 'Conditions et rémunération acceptées', calendar: 'Disponibilités vérifiées par vous' }[item.section], complete: item.ready && item.confirmed })),
  ]
  return {
    guideProfileId: gp.id,
    snapshots,
    view: { bank, rates, confirmations, progress, missingProfileFields: missing, termsVersion: GUIDE_DOSSIER_TERMS_VERSION },
  }
}

export type GuideDossierView = Awaited<ReturnType<typeof readGuideDossier>>['view']
