import { Prisma } from '@prisma/client'
import { z } from 'zod'
import {
  APPLICATION_PHOTO_KINDS, applicationMediaSchema, applicationMediaSelect,
  applicationMediaView, applicationPhotoPath, type ApplicationMediaRecord,
  type ApplicationMediaView, type ApplicationPhotoKind,
} from '@/lib/guide-application-media'
import { readApplicationPhotoReceipt } from '@/lib/guide-application-photo-receipt'

// Clients propose receipt-backed replacements, never private storage paths.
export const mediaProposalSchema = z.object({
    hasPersonalVehicle: z.boolean().optional(),
    vehicleModel: z.string().trim().max(120).optional(),
    vehicleYear: z.number().int().min(1000).max(9999).nullable().optional(),
    vehiclePassengerSeats: z.number().int().positive().max(999).nullable().optional(),
    vehicleColor: z.string().trim().max(80).optional(),
    vehicleSeatsConfirmed: z.boolean().optional(),
    profilePhotoReceipt: z.string().min(1).max(3000).optional(),
    vehicleDashboardPhotoReceipt: z.string().min(1).max(3000).optional(),
    vehicleSeatsPhotoReceipt: z.string().min(1).max(3000).optional(),
    vehicleExteriorPhotoReceipt: z.string().min(1).max(3000).optional(),
  }).strict()

const storedPath = (kind: ApplicationPhotoKind) => z.string()
  .regex(new RegExp(`^guide-applications/[0-9a-f-]{36}/${kind}\\.(jpeg|png|webp)$`)).nullable()

export const storedMediaSchema = z.object({
  profilePhotoPath: storedPath('profile'),
  hasPersonalVehicle: z.boolean().nullable(),
  vehicleModel: z.string().max(120).nullable(),
  vehicleYear: z.number().int().min(1000).max(9999).nullable(),
  vehiclePassengerSeats: z.number().int().positive().max(999).nullable(),
  vehicleColor: z.string().max(80).nullable(),
  vehicleSeatsConfirmed: z.boolean().nullable(),
  vehicleDashboardPhotoPath: storedPath('dashboard'),
  vehicleSeatsPhotoPath: storedPath('seats'),
  vehicleExteriorPhotoPath: storedPath('exterior'),
}).strict()

export type GuideProfileMediaSnapshot = Omit<ApplicationMediaRecord, 'id'>
const emptySnapshot: GuideProfileMediaSnapshot = {
  profilePhotoPath: null, hasPersonalVehicle: null, vehicleModel: null,
  vehicleYear: null, vehiclePassengerSeats: null, vehicleColor: null,
  vehicleSeatsConfirmed: null, vehicleDashboardPhotoPath: null,
  vehicleSeatsPhotoPath: null, vehicleExteriorPhotoPath: null,
}
const vehicleFields = ['vehicleModel', 'vehicleYear', 'vehiclePassengerSeats', 'vehicleColor', 'vehicleSeatsConfirmed'] as const
const receiptSlots = [
  ['profilePhotoReceipt', 'profilePhotoPath', 'profile'],
  ['vehicleDashboardPhotoReceipt', 'vehicleDashboardPhotoPath', 'dashboard'],
  ['vehicleSeatsPhotoReceipt', 'vehicleSeatsPhotoPath', 'seats'],
  ['vehicleExteriorPhotoReceipt', 'vehicleExteriorPhotoPath', 'exterior'],
] as const

export function resolveMediaProposal(
  proposal: z.infer<typeof mediaProposalSchema>, actorEmail: string, baseline: GuideProfileMediaSnapshot,
): GuideProfileMediaSnapshot {
  const value = mediaProposalSchema.parse(proposal)
  const snapshot = storedMediaSchema.parse(baseline)
  if (value.hasPersonalVehicle !== undefined) snapshot.hasPersonalVehicle = value.hasPersonalVehicle
  if (snapshot.hasPersonalVehicle !== false) {
    for (const field of vehicleFields) {
      if (value[field] !== undefined) Object.assign(snapshot, { [field]: value[field] })
    }
  }
  for (const [receiptField, pathField, kind] of receiptSlots) {
    const receipt = value[receiptField]
    if (receipt === undefined) continue
    const path = readApplicationPhotoReceipt(receipt, actorEmail, kind)
    if (kind === 'profile' || snapshot.hasPersonalVehicle !== false) snapshot[pathField] = path
  }
  if (snapshot.hasPersonalVehicle === true) {
    // Reuse the application requirements against the complete effective vehicle.
    applicationMediaSchema.parse({ ...snapshot, profilePhotoReceipt: 'stored-private-portrait',
      vehicleModel: snapshot.vehicleModel ?? undefined, vehicleColor: snapshot.vehicleColor ?? undefined,
      vehicleSeatsConfirmed: snapshot.vehicleSeatsConfirmed ?? undefined,
    })
  }
  return snapshot
}

function hideInactiveVehicle(view: ApplicationMediaView): ApplicationMediaView {
  if (view.hasPersonalVehicle !== false) return view
  return { ...view, vehicleModel: null, vehicleYear: null, vehiclePassengerSeats: null,
    vehicleColor: null, vehicleSeatsConfirmed: null,
    photos: { ...view.photos, dashboard: null, seats: null, exterior: null },
  }
}

export function profileMediaView(snapshot: GuideProfileMediaSnapshot, requestId: string): ApplicationMediaView {
  const record = { ...snapshot, id: requestId }
  return hideInactiveVehicle({ ...applicationMediaView(record),
    photos: Object.fromEntries(APPLICATION_PHOTO_KINDS.map(kind => [kind,
      applicationPhotoPath(record, kind)
        ? `/api/guide-profile-change-requests/${encodeURIComponent(requestId)}/photos/${kind}` : null,
    ])) as Record<ApplicationPhotoKind, string | null>,
  })
}

export async function readGuideProfileMedia(db: Prisma.TransactionClient, guideProfileId: string): Promise<{
  snapshot: GuideProfileMediaSnapshot; view: ApplicationMediaView | null
}> {
  const request = await db.guideProfileChangeRequest.findFirst({
    where: { guideProfileId, status: 'APPROVED', changes: { path: ['media'], not: Prisma.AnyNull } },
    orderBy: [{ reviewedAt: 'desc' }, { createdAt: 'desc' }, { id: 'desc' }],
    select: { id: true, changes: true },
  })
  if (request) {
    const snapshot = storedMediaSchema.parse((request.changes as Prisma.JsonObject).media)
    return { snapshot, view: profileMediaView(snapshot, request.id) }
  }
  const application = await db.guideApplication.findFirst({
    where: { createdGuideProfileId: guideProfileId, status: 'APPROVED' },
    orderBy: [{ reviewedAt: 'desc' }, { createdAt: 'desc' }, { id: 'desc' }],
    select: applicationMediaSelect,
  })
  if (!application) return { snapshot: { ...emptySnapshot }, view: null }
  const { id, ...snapshot } = application
  return { snapshot: storedMediaSchema.parse(snapshot), view: hideInactiveVehicle(applicationMediaView({ ...snapshot, id })) }
}
