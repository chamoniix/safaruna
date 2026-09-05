import { Prisma, type PaymentAttemptStatus } from '@prisma/client'

const SAFE_TERMINAL_ATTEMPT_STATUSES = new Set<PaymentAttemptStatus>([
  'EXPIRED',
  'FAILED',
  'CANCELLED',
])

export function canDeleteExpiredDraft(attemptStatuses: PaymentAttemptStatus[]): boolean {
  return attemptStatuses.length > 0
    && attemptStatuses.every(status => SAFE_TERMINAL_ATTEMPT_STATUSES.has(status))
}

export async function deleteTerminalExpiredDrafts(
  tx: Prisma.TransactionClient,
  now = new Date(),
): Promise<number> {
  const expiredDrafts = await tx.reservationDraft.findMany({
    where: { expiresAt: { lte: now } },
    select: { id: true, refNumber: true },
  })
  if (expiredDrafts.length === 0) return 0

  const attempts = await tx.paymentAttempt.findMany({
    where: { bookingRef: { in: expiredDrafts.map(draft => draft.refNumber) } },
    select: { bookingRef: true, status: true },
  })
  const statusesByReference = new Map<string, PaymentAttemptStatus[]>()
  for (const attempt of attempts) {
    const statuses = statusesByReference.get(attempt.bookingRef) ?? []
    statuses.push(attempt.status)
    statusesByReference.set(attempt.bookingRef, statuses)
  }

  const safeDrafts = expiredDrafts.filter(draft => (
    canDeleteExpiredDraft(statusesByReference.get(draft.refNumber) ?? [])
  ))
  if (safeDrafts.length === 0) return 0

  const safeDraftIds = safeDrafts.map(draft => draft.id)
  await tx.promoCode.updateMany({
    where: { reservedDraftId: { in: safeDraftIds }, status: 'HELD' },
    data: { status: 'ACTIVE', reservedDraftId: null },
  })
  await tx.promotionRedemption.updateMany({
    where: { reservationDraftId: { in: safeDraftIds }, status: 'HELD' },
    data: { status: 'EXPIRED', releasedAt: now, reservationDraftId: null },
  })
  const deleted = await tx.reservationDraft.deleteMany({ where: { id: { in: safeDraftIds } } })
  return deleted.count
}
