import 'server-only'

import { Prisma } from '@prisma/client'
import { z } from 'zod'
import { createHash } from 'node:crypto'
import { decrypt, encrypt } from '@/lib/crypto'
import { mediaProposalSchema, storedMediaSchema, resolveMediaProposal, readGuideProfileMedia, profileMediaView } from '@/lib/guide-profile-media'
import { GUIDE_LANGUAGES } from '@/lib/languages'
import type { GuideActor } from '@/lib/require-account'
import type { GuideRequestContext } from '@/lib/guide-auth'
import prisma from '@/lib/prisma'

const languageCodes = GUIDE_LANGUAGES.map(language => language.code) as [string, ...string[]]

export const guideProfileChangesObjectSchema = z.object({
  firstName: z.string().trim().min(1, 'Le prénom est obligatoire.').max(50).optional(),
  lastName: z.string().trim().max(50).optional(),
  phoneWhatsapp: z.string().trim().max(20).optional(),
  country: z.string().trim().max(100).optional(),
  bio: z.string().trim().max(2000).optional(),
  city: z.string().trim().max(100).optional(),
  gender: z.enum(['HOMME', 'FEMME']).optional(),
  nationality: z.string().trim().max(100).optional(),
  experienceYears: z.number().int().min(0).max(60).nullable().optional(),
  languages: z.array(z.enum(languageCodes)).max(languageCodes.length)
    .refine(values => new Set(values).size === values.length, 'Une langue a été sélectionnée plusieurs fois.')
    .optional(),
  pricingCorrectionRequest: z.string().trim().max(1000).optional(),
  personalCorrectionRequest: z.string().trim().max(1000).optional(),
  languagesCorrectionRequest: z.string().trim().max(1000).optional(),
}).strict()

// Same format-only policy as Guide inscription. Administrative acceptance does
// not assert bank ownership or third-party verification.
export const bankProposalSchema = z.object({
  firstName: z.string().trim().min(1, 'Indiquez le prénom du titulaire.').max(80),
  lastName: z.string().trim().min(1, 'Indiquez le nom du titulaire.').max(80),
  bankName: z.string().trim().min(1, 'Indiquez le nom de la banque.').max(120),
  country: z.string().trim().min(1, 'Indiquez le pays de la banque.').max(100),
  iban: z.string().transform(value => value.replace(/\s+/g, '').toUpperCase())
    .pipe(z.string().min(15, 'IBAN invalide.').max(34, 'IBAN invalide.').regex(/^[A-Z]{2}\d{2}[A-Z0-9]+$/, 'IBAN invalide.')),
  bic: z.string().trim().max(100).transform(value => value.replace(/\s+/g, '').toUpperCase()),
}).strict()

export const guideProfileProposalSchema = guideProfileChangesObjectSchema.extend({
  city: z.enum(['MAKKAH', 'MADINAH'], { error: 'Choisissez Makkah ou Médine comme ville principale.' }).optional(),
  bankProposal: bankProposalSchema.optional(),
  mediaProposal: mediaProposalSchema.optional(),
  resubmitRequestId: z.string().min(1).optional(),
}).strict().refine(value => Object.keys(value).length > 0, 'Aucune modification transmise.')

export const guideProfileChangesSchema = guideProfileChangesObjectSchema.extend({
  bankEncrypted: z.object({ version: z.literal(1), ciphertext: z.string().min(1) }).strict().optional(),
  media: storedMediaSchema.optional(),
}).strict()
  .refine(value => Object.keys(value).length > 0, 'Aucune modification transmise.')

export type GuideProfileChanges = z.infer<typeof guideProfileChangesSchema>
export class NoGuideProfileChangesError extends Error {}

const GUIDE_PROFILE_REQUIRED_LABELS: Record<string, string> = {
  firstName: 'prénom',
  lastName: 'nom',
  phoneWhatsapp: 'WhatsApp',
  bio: 'présentation',
  city: 'ville principale',
  gender: 'genre',
  nationality: 'nationalité',
  experienceYears: 'années d’expérience',
  languages: 'langue parlée',
  serviceCities: 'ville proposée',
}

export function missingRequiredGuideProfileFields(input: {
  firstName: string | null
  lastName: string | null
  phoneWhatsapp: string | null
  bio: string | null
  city: string | null
  gender: string | null
  nationality: string | null
  experienceYears: number | null
  languages: string[]
  servesMakkah: boolean
  servesMadinah: boolean
}, options: { requireSupportedCity?: boolean } = {}) {
  const missing: string[] = []
  for (const key of ['firstName', 'lastName', 'phoneWhatsapp', 'bio', 'city', 'gender', 'nationality'] as const) {
    if (!input[key]?.trim()) missing.push(GUIDE_PROFILE_REQUIRED_LABELS[key])
  }
  if (input.experienceYears === null) missing.push(GUIDE_PROFILE_REQUIRED_LABELS.experienceYears)
  if (input.languages.length === 0) missing.push(GUIDE_PROFILE_REQUIRED_LABELS.languages)
  if (!input.servesMakkah && !input.servesMadinah) missing.push(GUIDE_PROFILE_REQUIRED_LABELS.serviceCities)
  if (options.requireSupportedCity && input.city?.trim()) {
    if (!['MAKKAH', 'MADINAH'].includes(input.city)) missing.push('ville principale : choisissez Makkah ou Médine')
    else if ((input.city === 'MAKKAH' && !input.servesMakkah) || (input.city === 'MADINAH' && !input.servesMadinah)) missing.push('ville principale parmi les villes proposées')
  }
  return missing
}

type StoredValues = Record<string, unknown>

function canonicalValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalValue)
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([key, entry]) => [key, canonicalValue(entry)]))
  return value
}

// PostgreSQL JSONB does not preserve object-key order; compare values, not their
// serialization order, when checking the stored bank/media baseline.
export function sameProfileValue(left: unknown, right: unknown) {
  return JSON.stringify(canonicalValue(left)) === JSON.stringify(canonicalValue(right))
}

export function profileChangeRevision(request: { id: string; before: unknown; changes: unknown; updatedAt: Date }) {
  return createHash('sha256').update(JSON.stringify({ id: request.id, before: request.before, changes: request.changes, updatedAt: request.updatedAt.toISOString() })).digest('hex')
}

export function bankBeforeSnapshot(profile: {
  bankAccountFirstName: string | null; bankAccountLastName: string | null; bankName: string | null;
  bankCountry: string | null; ibanEncrypted: string | null; bicEncrypted: string | null;
}) {
  return { version: 1, fingerprint: createHash('sha256').update(JSON.stringify({
    firstName: profile.bankAccountFirstName, lastName: profile.bankAccountLastName,
    bankName: profile.bankName, country: profile.bankCountry,
    ibanEncrypted: profile.ibanEncrypted, bicEncrypted: profile.bicEncrypted,
  })).digest('hex') }
}

export function decryptBankProposal(value: NonNullable<GuideProfileChanges['bankEncrypted']>) {
  return bankProposalSchema.parse(JSON.parse(decrypt(value.ciphertext)))
}

// Only authenticated owner/admin routes may use this private serializer.
export function safeProfileChanges(value: Prisma.JsonValue, requestId: string) {
  const parsed = guideProfileChangesSchema.safeParse(value)
  if (!parsed.success) return {}
  const { bankEncrypted, media, ...identity } = parsed.data
  let bankProposal: z.infer<typeof bankProposalSchema> | null = null
  if (bankEncrypted) {
    try { bankProposal = decryptBankProposal(bankEncrypted) } catch { /* fail closed, never return ciphertext */ }
  }
  return { ...identity, ...(bankEncrypted && { bankProposal }), ...(media && { media: profileMediaView(media, requestId) }) }
}

export function safeProfileBefore(value: Prisma.JsonValue, requestId?: string) {
  void requestId // Kept symmetric with the private changes serializer.
  return redactProfileAudit(value)
}

export function redactProfileAudit(value: unknown): Prisma.InputJsonObject {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  const record = value as Record<string, unknown>
  const { bankEncrypted, media } = record
  const identity: Record<string, Prisma.InputJsonValue | null> = {}
  for (const [field, schema] of Object.entries(guideProfileChangesObjectSchema.shape)) {
    if (!Object.hasOwn(record, field)) continue
    const parsed = schema.nullable().safeParse(record[field])
    if (parsed.success && parsed.data !== undefined) identity[field] = parsed.data
  }
  return { ...identity, ...(bankEncrypted !== undefined && { bankEncrypted: { redacted: true } }), ...(media !== undefined && { media: { changed: true } }) } as Prisma.InputJsonObject
}

function compactChanges(changes: z.infer<typeof guideProfileProposalSchema>) {
  return Object.fromEntries(Object.entries(changes).filter(([, value]) => value !== undefined))
}

export async function submitGuideProfileChanges(input: {
  actor: GuideActor
  changes: z.infer<typeof guideProfileProposalSchema>
  context: GuideRequestContext
}) {
  // Revalidate at the service boundary: internal JSON/path fields are never input.
  const proposal = guideProfileProposalSchema.parse(input.changes)
  const requestedChanges = compactChanges(proposal)

  return prisma.$transaction(async tx => {
    const account = await tx.guideAccount.findUnique({
      where: { id: input.actor.id },
      include: {
        guideProfile: {
          include: { languages: { orderBy: { languageCode: 'asc' } } },
        },
      },
    })
    if (!account?.guideProfile) throw new Error('Profil guide introuvable')

    const profile = account.guideProfile
    if (account.status !== 'ACTIVE' || profile.status === 'SUSPENDED' || profile.permanentlyDeactivatedAt) throw new Error('PROFILE_FORBIDDEN')
    const current: StoredValues = {
      firstName: account.firstName,
      lastName: account.lastName,
      phoneWhatsapp: account.phoneWhatsapp,
      country: account.country,
      bio: profile.bio,
      city: profile.city,
      gender: profile.gender,
      nationality: profile.nationality,
      experienceYears: profile.experienceYears,
      languages: profile.languages.map(language => language.languageCode).sort(),
      pricingCorrectionRequest: null,
      personalCorrectionRequest: null,
      languagesCorrectionRequest: null,
    }
    const existing = await tx.guideProfileChangeRequest.findUnique({
      where: { activeKey: profile.id },
    })
    if (existing && (existing.status !== 'PENDING' || !guideProfileChangesSchema.safeParse(existing.changes).success)) throw new Error('PROFILE_CHANGED')
    let previous = existing
    if (proposal.resubmitRequestId) {
      if (existing) throw new Error('PROFILE_CHANGED')
      previous = await tx.guideProfileChangeRequest.findUnique({ where: { id: proposal.resubmitRequestId } })
      if (!previous || previous.guideProfileId !== profile.id || previous.requestedByGuideAccountId !== account.id || previous.status !== 'REJECTED') throw new Error('RESUBMIT_NOT_FOUND')
      const previousChanges = guideProfileChangesSchema.safeParse(previous.changes)
      if (!previousChanges.success) throw new Error('PROFILE_CHANGED')
      if (previousChanges.data.bankEncrypted) current.bankEncrypted = bankBeforeSnapshot(profile)
      if (previousChanges.data.media) current.media = (await readGuideProfileMedia(tx, profile.id)).snapshot
      const previousBefore = previous.before as StoredValues
      for (const field of Object.keys(previousChanges.data)) {
        if (!sameProfileValue(current[field], previousBefore[field])) throw new Error('PROFILE_CHANGED')
      }
    }
    const existingChanges = previous?.changes as StoredValues | undefined
    const existingBefore = previous?.before as StoredValues | undefined
    const resolved: StoredValues = { ...requestedChanges }
    delete resolved.bankProposal
    delete resolved.mediaProposal
    delete resolved.resubmitRequestId
    if (proposal.bankProposal) {
      try { resolved.bankEncrypted = { version: 1, ciphertext: encrypt(JSON.stringify(proposal.bankProposal)) } }
      catch { throw new Error('BANK_UNAVAILABLE') }
      current.bankEncrypted = bankBeforeSnapshot(profile)
    }
    if (proposal.mediaProposal) {
      const effective = await readGuideProfileMedia(tx, profile.id)
      current.media = effective.snapshot
      const pendingMedia = storedMediaSchema.safeParse(existingChanges?.media)
      resolved.media = resolveMediaProposal(proposal.mediaProposal, account.email, pendingMedia.success ? pendingMedia.data : effective.snapshot)
    }
    const changedEntries = Object.entries(resolved).filter(([field, value]) => {
      // An explicit replacement of a pending field must not be silently dropped
      // merely because the Guide has restored its current live value.
      if (existingChanges && Object.hasOwn(existingChanges, field)) return true
      const comparableValue = value === '' && current[field] === null ? null : value
      return !sameProfileValue(comparableValue, current[field])
    })
    const mergedChanges = { ...(existingChanges || {}), ...Object.fromEntries(changedEntries) } as StoredValues
    // New choices must be supported and served. Legacy stored values are not
    // rewritten; an unrelated correction can still be reviewed separately.
    if (proposal.city !== undefined || (proposal.resubmitRequestId && mergedChanges.city !== undefined)) {
      const proposedCity = mergedChanges.city ?? proposal.city
      if (!['MAKKAH', 'MADINAH'].includes(String(proposedCity)) ||
        (proposedCity === 'MAKKAH' && !profile.servesMakkah) ||
        (proposedCity === 'MADINAH' && !profile.servesMadinah)) {
        throw new z.ZodError([{ code: 'custom', path: ['city'], message: 'La ville principale doit être Makkah ou Médine et faire partie de vos villes proposées.' }])
      }
    }
    if (Object.keys(mergedChanges).length === 0) throw new NoGuideProfileChangesError('Aucune modification à valider')
    const mergedBefore = { ...(existingBefore || {}) }
    for (const [field] of changedEntries) {
      if (!(field in mergedBefore)) mergedBefore[field] = current[field]
    }

    const request = existing
      ? await tx.guideProfileChangeRequest.update({
        where: { id: existing.id },
        data: {
          changes: mergedChanges as Prisma.InputJsonObject,
          before: mergedBefore as Prisma.InputJsonObject,
          requestedByGuideAccountId: input.actor.id,
          requestedByEmail: input.actor.email,
          submittedIp: input.context.ip,
          submittedCountry: input.context.country,
          submittedCity: input.context.city,
          submittedDevice: input.context.device,
          submittedBrowser: input.context.browser,
          submittedUserAgent: input.context.userAgent,
        },
      })
      : await tx.guideProfileChangeRequest.create({
        data: {
          guideProfileId: profile.id,
          activeKey: profile.id,
          changes: mergedChanges as Prisma.InputJsonObject,
          before: mergedBefore as Prisma.InputJsonObject,
          requestedByGuideAccountId: input.actor.id,
          requestedByEmail: input.actor.email,
          submittedIp: input.context.ip,
          submittedCountry: input.context.country,
          submittedCity: input.context.city,
          submittedDevice: input.context.device,
          submittedBrowser: input.context.browser,
          submittedUserAgent: input.context.userAgent,
        },
      })

    await tx.auditLog.create({
      data: {
        actor: input.actor.email,
        actorRole: 'GUIDE',
        action: 'GUIDE_PROFILE_CHANGE_REQUESTED',
        target: request.id,
        detail: JSON.stringify({
          guideProfileId: profile.id,
          fields: changedEntries.map(([field]) => field),
          country: input.context.country,
          city: input.context.city,
          device: input.context.device,
          browser: input.context.browser,
        }),
        ip: input.context.ip,
        userAgent: input.context.userAgent,
        before: redactProfileAudit(existingChanges),
        after: redactProfileAudit(mergedChanges),
      },
    })

    return request
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable })
}

export function publicPendingRequest(request: {
  id: string
  changes: Prisma.JsonValue
  before: Prisma.JsonValue
  createdAt: Date
  updatedAt: Date
} | null) {
  if (!request) return null
  return {
    id: request.id,
    revision: profileChangeRevision(request),
    changes: safeProfileChanges(request.changes, request.id),
    createdAt: request.createdAt,
    updatedAt: request.updatedAt,
  }
}
