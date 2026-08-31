import 'server-only'

import { Prisma } from '@prisma/client'

export type AvailabilityCity = 'MAKKAH' | 'MADINAH'

export type AvailabilityMission = {
  guideProfileId: string
  city: AvailabilityCity
  dates: Date[]
}

export class GuideAvailabilityConflictError extends Error {
  constructor(readonly reason: 'UNAVAILABLE' | 'BOOKED' | 'HELD' | 'HOLD_MISSING') {
    super(reason)
  }
}

export function parseBookingDate(value: unknown): Date | null {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null
  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day, 12))
  if (
    date.getUTCFullYear() !== year
    || date.getUTCMonth() !== month - 1
    || date.getUTCDate() !== day
  ) return null
  return date
}

export function bookingToday(): Date {
  const today = new Date()
  return new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate(), 12))
}

export function eachBookingDate(start: Date, end: Date): Date[] {
  const dates: Date[] = []
  for (let current = new Date(start); current <= end; current = new Date(current.getTime() + 86_400_000)) {
    dates.push(current)
  }
  return dates
}

export async function assertMissionsAvailable(
  tx: Prisma.TransactionClient,
  missions: AvailabilityMission[],
  options: {
    excludeDraftRefNumber?: string
    requireDraftRefNumber?: string
    now?: Date
  } = {},
): Promise<void> {
  const now = options.now ?? new Date()

  for (const mission of missions) {
    const conflict = await tx.availability.findFirst({
      where: {
        guideProfileId: mission.guideProfileId,
        date: { in: mission.dates },
        OR: [
          { status: 'BOOKED' },
          { status: 'UNAVAILABLE', city: { in: [mission.city, 'BOTH'] } },
        ],
      },
      select: { status: true },
    })
    if (conflict) {
      throw new GuideAvailabilityConflictError(conflict.status === 'BOOKED' ? 'BOOKED' : 'UNAVAILABLE')
    }

    const competingHold = await tx.reservationHold.findFirst({
      where: {
        guideProfileId: mission.guideProfileId,
        date: { in: mission.dates },
        expiresAt: { gt: now },
        ...(options.excludeDraftRefNumber
          ? { draftRefNumber: { not: options.excludeDraftRefNumber } }
          : {}),
      },
      select: { id: true },
    })
    if (competingHold) throw new GuideAvailabilityConflictError('HELD')

    if (options.requireDraftRefNumber) {
      const ownHolds = await tx.reservationHold.count({
        where: {
          draftRefNumber: options.requireDraftRefNumber,
          guideProfileId: mission.guideProfileId,
          date: { in: mission.dates },
        },
      })
      if (ownHolds !== mission.dates.length) {
        throw new GuideAvailabilityConflictError('HOLD_MISSING')
      }
    }
  }
}
