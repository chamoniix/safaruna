import 'server-only'

import { Prisma } from '@prisma/client'
import { z } from 'zod'
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

export const guideProfileChangesSchema = guideProfileChangesObjectSchema
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
}) {
  const missing: string[] = []
  for (const key of ['firstName', 'lastName', 'phoneWhatsapp', 'bio', 'city', 'gender', 'nationality'] as const) {
    if (!input[key]?.trim()) missing.push(GUIDE_PROFILE_REQUIRED_LABELS[key])
  }
  if (input.experienceYears === null) missing.push(GUIDE_PROFILE_REQUIRED_LABELS.experienceYears)
  if (input.languages.length === 0) missing.push(GUIDE_PROFILE_REQUIRED_LABELS.languages)
  if (!input.servesMakkah && !input.servesMadinah) missing.push(GUIDE_PROFILE_REQUIRED_LABELS.serviceCities)
  return missing
}

type StoredValues = Record<string, string | number | null | string[]>

function compactChanges(changes: GuideProfileChanges): GuideProfileChanges {
  return Object.fromEntries(Object.entries(changes).filter(([, value]) => value !== undefined)) as GuideProfileChanges
}

export async function submitGuideProfileChanges(input: {
  actor: GuideActor
  changes: GuideProfileChanges
  context: GuideRequestContext
}) {
  const requestedChanges = compactChanges(input.changes)

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
    const existingChanges = existing?.changes as StoredValues | undefined
    const existingBefore = existing?.before as StoredValues | undefined
    const changedEntries = Object.entries(requestedChanges).filter(([field, value]) => {
      const comparableValue = value === '' && current[field] === null ? null : value
      return JSON.stringify(comparableValue) !== JSON.stringify(current[field])
    })
    const mergedChanges = { ...(existingChanges || {}), ...Object.fromEntries(changedEntries) } as StoredValues
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
        before: (existingChanges || {}) as Prisma.InputJsonObject,
        after: mergedChanges as Prisma.InputJsonObject,
      },
    })

    return request
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable })
}

export function publicPendingRequest(request: {
  id: string
  changes: Prisma.JsonValue
  createdAt: Date
  updatedAt: Date
} | null) {
  if (!request) return null
  const parsed = guideProfileChangesSchema.safeParse(request.changes)
  return {
    id: request.id,
    changes: parsed.success ? parsed.data : {},
    createdAt: request.createdAt,
    updatedAt: request.updatedAt,
  }
}
