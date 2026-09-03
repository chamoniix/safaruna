import 'server-only'

import type { GuideConfirmationStatus, GuideReservationIncidentType, Prisma } from '@prisma/client'

type IncidentContext = {
  actor: string
  actorRole: string
  ip?: string | null
  userAgent?: string | null
  country?: string | null
  city?: string | null
  device?: string | null
  browser?: string | null
}

const missionStatusByType: Record<GuideReservationIncidentType, GuideConfirmationStatus> = {
  GUIDE_DECLINED: 'DECLINED',
  NO_RESPONSE: 'NO_RESPONSE',
}

export async function suspendGuideForReservationIncident(
  tx: Prisma.TransactionClient,
  input: {
    reservationId: string
    guideProfileId: string
    refNumber: string
    type: GuideReservationIncidentType
    reason?: string | null
    occurredAt: Date
    context: IncidentContext
  },
) {
  const existing = await tx.guideReservationIncident.findUnique({
    where: {
      reservationId_guideProfileId: {
        reservationId: input.reservationId,
        guideProfileId: input.guideProfileId,
      },
    },
    select: { id: true },
  })
  if (existing) return { created: false, incidentId: existing.id }

  const profile = await tx.guideProfile.findUnique({
    where: { id: input.guideProfileId },
    select: { guideAccountId: true, status: true, acceptingBookings: true },
  })
  if (!profile) throw new Error('GUIDE_NOT_FOUND')

  const incident = await tx.guideReservationIncident.create({
    data: {
      reservationId: input.reservationId,
      guideProfileId: input.guideProfileId,
      type: input.type,
      reason: input.reason || null,
      reportedAt: input.occurredAt,
    },
  })
  await tx.reservationMission.updateMany({
    where: {
      reservationId: input.reservationId,
      guideProfileId: input.guideProfileId,
      guideConfirmationStatus: 'PENDING',
    },
    data: { guideConfirmationStatus: missionStatusByType[input.type] },
  })
  await tx.guideProfile.update({
    where: { id: input.guideProfileId },
    data: { status: 'SUSPENDED', acceptingBookings: false },
  })
  if (profile.guideAccountId) {
    await tx.guideAccount.update({
      where: { id: profile.guideAccountId },
      data: { status: 'SUSPENDED' },
    })
    await tx.guideSession.updateMany({
      where: { guideAccountId: profile.guideAccountId, revokedAt: null },
      data: { revokedAt: input.occurredAt },
    })
  }
  await tx.auditLog.create({
    data: {
      actor: input.context.actor,
      actorRole: input.context.actorRole,
      action: input.type === 'GUIDE_DECLINED'
        ? 'GUIDE_RESERVATION_DECLINED_AND_SUSPENDED'
        : 'GUIDE_NO_RESPONSE_AND_SUSPENDED',
      target: input.refNumber,
      detail: JSON.stringify({
        incidentId: incident.id,
        guideProfileId: input.guideProfileId,
        reason: input.reason || null,
        request: {
          country: input.context.country || null,
          city: input.context.city || null,
          device: input.context.device || null,
          browser: input.context.browser || null,
        },
      }),
      ip: input.context.ip || null,
      userAgent: input.context.userAgent || null,
      before: { profileStatus: profile.status, acceptingBookings: profile.acceptingBookings, confirmationStatus: 'PENDING' },
      after: { profileStatus: 'SUSPENDED', acceptingBookings: false, confirmationStatus: missionStatusByType[input.type] },
    },
  })

  return { created: true, incidentId: incident.id }
}
