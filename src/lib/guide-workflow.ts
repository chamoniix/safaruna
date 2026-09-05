export const HOUR_MS = 60 * 60 * 1000

// Display the actual days of accompaniment, not the stay or a legacy package duration.
export function missionDurationDays(missions: Array<{ startDate: Date; endDate: Date }>): number | null {
  if (missions.length === 0) return null
  let days = 0
  for (const mission of missions) {
    const start = Date.UTC(mission.startDate.getUTCFullYear(), mission.startDate.getUTCMonth(), mission.startDate.getUTCDate())
    const end = Date.UTC(mission.endDate.getUTCFullYear(), mission.endDate.getUTCMonth(), mission.endDate.getUTCDate())
    if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) return null
    days += (end - start) / (24 * HOUR_MS) + 1
  }
  return days
}

export function confirmationDeadlines(requestedAt: Date, departureAt: Date) {
  const urgent = departureAt.getTime() - requestedAt.getTime() < 48 * HOUR_MS
  return {
    urgent,
    reminderAt: new Date(requestedAt.getTime() + (urgent ? 1 : 6) * HOUR_MS),
    escalationAt: new Date(requestedAt.getTime() + (urgent ? 3 : 48) * HOUR_MS),
  }
}

export function reviewOpensAt(endDate: Date) {
  return new Date(Date.UTC(
    endDate.getUTCFullYear(),
    endDate.getUTCMonth(),
    endDate.getUTCDate(),
    17,
    0,
    0,
    0,
  ))
}

export function publicReviewerName(firstName: string | null, lastName: string | null) {
  const first = firstName?.trim() || 'Pèlerin'
  const initial = lastName?.trim().charAt(0).toLocaleUpperCase('fr-FR')
  return initial ? `${first} ${initial}.` : first
}
