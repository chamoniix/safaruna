export const HOUR_MS = 60 * 60 * 1000

export function confirmationDeadlines(requestedAt: Date, departureAt: Date) {
  const urgent = departureAt.getTime() - requestedAt.getTime() < 48 * HOUR_MS
  return {
    urgent,
    reminderAt: new Date(requestedAt.getTime() + (urgent ? 1 : 6) * HOUR_MS),
    escalationAt: new Date(requestedAt.getTime() + (urgent ? 3 : 24) * HOUR_MS),
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
