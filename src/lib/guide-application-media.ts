import { z } from 'zod'

export const APPLICATION_PHOTO_KINDS = ['profile', 'dashboard', 'seats', 'exterior'] as const
export type ApplicationPhotoKind = typeof APPLICATION_PHOTO_KINDS[number]
export const APPLICATION_PHOTO_LABELS: Record<ApplicationPhotoKind, string> = {
  profile: 'Photo de profil', dashboard: 'Intérieur — tableau de bord',
  seats: 'Intérieur — places arrière', exterior: 'Extérieur du véhicule',
}

export const applicationMediaSchema = z.object({
  profilePhotoReceipt: z.string().min(1, 'Ajoutez votre photo de profil.').max(3000),
  hasPersonalVehicle: z.boolean({ error: 'Indiquez si vous disposez d’un véhicule personnel.' }),
  vehicleModel: z.string().trim().max(120).optional(),
  vehicleYear: z.number().int().min(1000).max(9999).nullable().optional(),
  vehiclePassengerSeats: z.number().int().positive().max(999).nullable().optional(),
  vehicleColor: z.string().trim().max(80).optional(),
  vehicleSeatsConfirmed: z.boolean().optional(),
  vehicleDashboardPhotoReceipt: z.string().max(3000).optional(),
  vehicleSeatsPhotoReceipt: z.string().max(3000).optional(),
  vehicleExteriorPhotoReceipt: z.string().max(3000).optional(),
}).superRefine((value, context) => {
  if (!value.hasPersonalVehicle) return
  for (const [key, message] of [
    ['vehicleModel', 'Indiquez le modèle du véhicule.'],
    ['vehicleYear', 'Indiquez l’année du véhicule.'],
    ['vehiclePassengerSeats', 'Indiquez le nombre de places disponibles, hors conducteur.'],
    ['vehicleColor', 'Indiquez la couleur du véhicule.'],
    ['vehicleSeatsConfirmed', 'Confirmez le nombre de places disponibles, hors conducteur.'],
  ] as const) {
    if (!value[key]) context.addIssue({ code: 'custom', path: [key], message })
  }
})

export const applicationMediaSelect = {
  id: true, profilePhotoPath: true, hasPersonalVehicle: true, vehicleModel: true,
  vehicleYear: true, vehiclePassengerSeats: true, vehicleColor: true,
  vehicleSeatsConfirmed: true, vehicleDashboardPhotoPath: true,
  vehicleSeatsPhotoPath: true, vehicleExteriorPhotoPath: true,
} as const

export type ApplicationMediaRecord = {
  id: string; profilePhotoPath: string | null; hasPersonalVehicle: boolean | null
  vehicleModel: string | null; vehicleYear: number | null; vehiclePassengerSeats: number | null
  vehicleColor: string | null; vehicleSeatsConfirmed: boolean | null
  vehicleDashboardPhotoPath: string | null; vehicleSeatsPhotoPath: string | null
  vehicleExteriorPhotoPath: string | null
}

export function applicationPhotoPath(record: ApplicationMediaRecord, kind: ApplicationPhotoKind) {
  return { profile: record.profilePhotoPath, dashboard: record.vehicleDashboardPhotoPath,
    seats: record.vehicleSeatsPhotoPath, exterior: record.vehicleExteriorPhotoPath }[kind]
}

// Never expose Blob paths/URLs or upload receipts to a dashboard or public API.
export function applicationMediaView(record: ApplicationMediaRecord) {
  return {
    applicationId: record.id,
    hasPersonalVehicle: record.hasPersonalVehicle, vehicleModel: record.vehicleModel,
    vehicleYear: record.vehicleYear, vehiclePassengerSeats: record.vehiclePassengerSeats,
    vehicleColor: record.vehicleColor, vehicleSeatsConfirmed: record.vehicleSeatsConfirmed,
    photos: Object.fromEntries(APPLICATION_PHOTO_KINDS.map(kind => [kind,
      applicationPhotoPath(record, kind)
        ? `/api/guide-applications/${encodeURIComponent(record.id)}/photos/${kind}` : null,
    ])) as Record<ApplicationPhotoKind, string | null>,
  }
}
export type ApplicationMediaView = ReturnType<typeof applicationMediaView>
