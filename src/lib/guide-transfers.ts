import 'server-only'

import { Prisma, type Transfer } from '@prisma/client'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { encrypt } from '@/lib/crypto'
import { adminAuditDetail, adminAuditFields, type AdminActor, type AdminAuditContext } from '@/lib/check-admin'
import { dossierFingerprint, isCurrentDossierConfirmation, readGuideDossier } from '@/lib/guide-dossier'
import { guideTransferDueAt } from '@/lib/guide-payout-policy'
import { queueGuideTransferEmail } from '@/lib/email'

export class GuideTransferError extends Error {
  constructor(message: string, readonly status = 409) { super(message) }
}

const id = z.string().trim().min(1).max(200)
const revision = z.string().regex(/^[a-f0-9]{64}$/)
const bankFields = {
  bankReference: z.string().trim().min(1).max(200).regex(/^[^\x00-\x1f\x7f]+$/),
  sentAt: z.string().datetime({ offset: true }),
}
const prepareSchema = z.object({ earningId: id, sourceRevision: revision, ...bankFields }).strict()
const confirmSchema = z.object({ transferId: id, revision: z.number().int().nonnegative() }).strict()
const correctionSchema = confirmSchema.extend({
  ...bankFields, reason: z.string().trim().min(1).max(2000),
}).strict()

async function requireTransferAdmin(db: Prisma.TransactionClient, actor: AdminActor, superadminOnly = false) {
  const current = actor.id ? await db.adminAccount.findUnique({
    where: { id: actor.id }, select: { status: true, role: true, email: true },
  }) : null
  if (!current || current.status !== 'ACTIVE' || current.email !== actor.email || current.role !== actor.role
    || !['ADMIN', 'SUPERADMIN'].includes(current.role) || (superadminOnly && current.role !== 'SUPERADMIN')) {
    throw new GuideTransferError('Accès administratif non autorisé.', 403)
  }
}

function parse<T>(schema: z.ZodType<T>, input: unknown): T {
  const result = schema.safeParse(input)
  if (!result.success) throw new GuideTransferError('Informations du virement invalides.', 400)
  return result.data
}

async function transaction<T>(work: (db: Prisma.TransactionClient) => Promise<T>): Promise<T> {
  try {
    return await prisma.$transaction(work, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && ['P2002', 'P2025', 'P2034'].includes(error.code)) {
      throw new GuideTransferError('Un autre administrateur a modifié ce virement. Rechargez la réservation.')
    }
    throw error
  }
}

// Never derive a payable amount from today's prices or a client-supplied amount.
async function readSource(db: Prisma.TransactionClient, earningId: string) {
  const earning = await db.guideEarning.findUnique({ where: { id: earningId }, include: {
    reservation: { select: {
      id: true, refNumber: true, status: true, endDate: true, stripePaymentId: true,
      paymentAttempts: { where: { status: 'SUCCEEDED' }, select: { id: true }, take: 1 },
    } },
    guideProfile: { select: { id: true, guideAccountId: true,
      guideAccount: { select: { email: true, displayName: true, firstName: true, lastName: true } },
    } },
  } })
  if (!earning) throw new GuideTransferError('Revenu Guide introuvable.', 404)
  if (earning.status === 'CANCELLED' || earning.reservation.status !== 'COMPLETED') {
    throw new GuideTransferError('La réservation doit être terminée et le revenu non annulé.')
  }
  if (!earning.reservation.stripePaymentId && !earning.reservation.paymentAttempts.length) {
    throw new GuideTransferError('Aucun paiement client vérifié pour cette réservation.')
  }
  if (!Number.isSafeInteger(earning.totalNetCents) || earning.totalNetCents <= 0) {
    throw new GuideTransferError('Le revenu net enregistré ne permet pas ce virement.')
  }
  if (!earning.guideProfile.guideAccountId) throw new GuideTransferError('Compte Guide introuvable.')
  const dossier = await readGuideDossier(db, earning.guideProfile.guideAccountId, { administrative: true })
  const bank = dossier.view.bank
  if (!bank.readable || ![bank.firstName, bank.lastName, bank.bankName, bank.country, bank.iban].every(value => value?.trim())) {
    throw new GuideTransferError('Les coordonnées bancaires approuvées sont incomplètes.')
  }
  const bankRevision = dossierFingerprint({ guideProfileId: earning.guideProfileId, bank: dossier.snapshots.bank })
  const verified = await db.auditLog.findFirst({
    where: { target: earning.guideProfileId, action: 'GUIDE_BANK_VERIFIED', actorRole: { in: ['ADMIN', 'SUPERADMIN'] } },
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }], select: { after: true, id: true },
  })
  if (!isCurrentDossierConfirmation(verified?.after ?? null, bankRevision)
    || !verified?.after || typeof verified.after !== 'object' || Array.isArray(verified.after)
    || verified.after.accountHolderConfirmed !== true) {
    throw new GuideTransferError('Les coordonnées et le titulaire doivent être vérifiés par l’équipe.')
  }
  const dueAt = guideTransferDueAt(earning.reservation.endDate)
  const sourceRevision = dossierFingerprint({
    earningId: earning.id, guideProfileId: earning.guideProfileId, reservationId: earning.reservationId,
    amountCents: earning.totalNetCents, service: earning.serviceNetCents, places: earning.placesNetCents,
    transport: earning.transportNetCents, hotel: earning.hotelNetCents, breakdown: earning.breakdown,
    endDate: earning.reservation.endDate.toISOString(), bankRevision,
  })
  return { earning, bank, bankRevision, sourceRevision, dueAt }
}

function validateSentAt(sentAt: Date, dueAt: Date) {
  if (!Number.isFinite(sentAt.getTime()) || sentAt > new Date()) {
    throw new GuideTransferError('La date d’envoi doit correspondre à un virement déjà effectué.', 400)
  }
  if (sentAt < dueAt) throw new GuideTransferError('La date précède l’échéance des trois jours ouvrés après le séjour.')
}

function assertCurrentRecord(record: Transfer, source: Awaited<ReturnType<typeof readSource>>) {
  if (source.sourceRevision !== record.sourceRevision || source.bankRevision !== record.bankRevision
    || record.amountCents !== source.earning.totalNetCents || record.currency !== 'EUR'
    || record.guideProfileId !== source.earning.guideProfileId || source.earning.transferId !== record.id) {
    throw new GuideTransferError('Le revenu ou les coordonnées ont changé depuis la préparation. Vérification Superadmin nécessaire.')
  }
}

function preparationView(source: Awaited<ReturnType<typeof readSource>>) {
  return {
    earningId: source.earning.id, guideProfileId: source.earning.guideProfileId,
    refNumber: source.earning.reservation.refNumber, amountCents: source.earning.totalNetCents,
    currency: 'EUR', dueAt: source.dueAt.toISOString(), sourceRevision: source.sourceRevision,
    accountHolder: `${source.bank.firstName} ${source.bank.lastName}`, bankName: source.bank.bankName,
    ibanLast4: source.bank.iban!.replace(/\s/g, '').slice(-4),
  }
}

// Safe response and audit projection: no IBAN, bank snapshot or ciphertext.
function publicRecord(record: Transfer) {
  return {
    id: record.id, earningId: record.recordedEarningId, guideProfileId: record.guideProfileId,
    amountCents: record.amountCents, currency: record.currency,
    bankReference: record.bankReference, sentAt: record.sentAt?.toISOString() ?? null,
    dueAt: record.dueAt?.toISOString() ?? null, status: record.status,
    preparedByEmail: record.preparedByEmail, confirmedByEmail: record.confirmedByEmail,
    confirmedAt: record.confirmedAt?.toISOString() ?? null, revision: record.revision,
  }
}

async function audit(db: Prisma.TransactionClient, actor: AdminActor, context: AdminAuditContext,
  action: string, record: Transfer, before?: Transfer, reason?: string) {
  await db.auditLog.create({ data: {
    actor: actor.email, actorRole: actor.role, actorAdminId: actor.id, action, target: record.id,
    detail: adminAuditDetail(context, reason ? { reason } : {}),
    ...(before && { before: publicRecord(before) }), after: publicRecord(record), ...adminAuditFields(context),
  } })
}

export async function readGuideTransferPreparation(actor: AdminActor, earningId: string) {
  return transaction(async db => {
    await requireTransferAdmin(db, actor)
    const source = await readSource(db, parse(id, earningId))
    const existing = await db.transfer.findUnique({ where: { recordedEarningId: earningId } })
    if (existing) return { record: publicRecord(existing), preparation: null }
    if (source.earning.transferId || source.earning.status === 'PAID') {
      throw new GuideTransferError('Ce revenu est déjà rattaché à un virement historique.')
    }
    return { record: null, preparation: preparationView(source) }
  })
}

// Read existing records before current eligibility: a changed bank must never hide
// the original record or silently substitute its beneficiary/amount.
export async function readReservationGuideTransfers(actor: AdminActor, reservationId: string) {
  const parsedId = parse(id, reservationId)
  return transaction(async db => {
    await requireTransferAdmin(db, actor)
    const reservation = await db.reservation.findUnique({ where: { id: parsedId }, select: { refNumber: true } })
    if (!reservation) throw new GuideTransferError('Réservation introuvable.', 404)
    const earnings = await db.guideEarning.findMany({
      where: { reservationId: parsedId }, orderBy: { id: 'asc' },
      include: { recordedTransfer: true, guideProfile: { select: { guideAccount: {
        select: { displayName: true, firstName: true, lastName: true },
      } } } },
    })
    const items = []
    for (const earning of earnings) {
      const record = earning.recordedTransfer
      let preparation: ReturnType<typeof preparationView> | null = null
      let blockedReason: string | null = null
      let reviewRequired = false
      if (!(record?.status === 'PAID' && record.confirmedAt)) {
        try {
          if (!record && (earning.status === 'PAID' || earning.transferId)) {
            throw new GuideTransferError('Revenu lié à un virement historique. Aucun nouvel enregistrement autorisé.')
          }
          const source = await readSource(db, earning.id)
          if (record) {
            if (record.status !== 'PENDING') throw new GuideTransferError('État du virement à vérifier manuellement.')
            assertCurrentRecord(record, source)
          } else preparation = preparationView(source)
        } catch (error) {
          if (!(error instanceof GuideTransferError)) throw error
          blockedReason = error.message
          reviewRequired = Boolean(record)
        }
      }
      const account = earning.guideProfile.guideAccount
      const email = record ? await db.emailDelivery.findFirst({
        where: { referenceType: 'GUIDE_TRANSFER', referenceId: record.id, category: 'GUIDE_TRANSFER_CONFIRMED' },
        select: { status: true, attempts: true, acceptedAt: true, deliveredAt: true },
      }) : null
      items.push({
        earningId: earning.id, guideProfileId: earning.guideProfileId,
        guideName: account?.displayName || `${account?.firstName ?? ''} ${account?.lastName ?? ''}`.trim() || 'Guide',
        amountCents: record ? record.amountCents : earning.totalNetCents,
        record: record ? publicRecord(record) : null, preparation, blockedReason, reviewRequired, email,
        canConfirm: actor.role === 'SUPERADMIN' && record?.status === 'PENDING' && !blockedReason,
        canCorrect: actor.role === 'SUPERADMIN' && Boolean(record) && !blockedReason,
      })
    }
    return { reservationId: parsedId, refNumber: reservation.refNumber, role: actor.role, items }
  })
}

// HTTP entry points authenticate session/origin. Current roles are rechecked here.
// Existing bank operation -> ADMIN preparation -> SUPERADMIN confirmation.
// Email is queued atomically at confirmation, never sent inside the transaction.
// Nothing here calls a bank, payment provider, webhook or email provider.
export async function prepareGuideTransfer(actor: AdminActor, context: AdminAuditContext, input: unknown) {
  const command = parse(prepareSchema, input)
  return transaction(async db => {
    await requireTransferAdmin(db, actor)
    const existing = await db.transfer.findUnique({ where: { recordedEarningId: command.earningId } })
    const sentAt = new Date(command.sentAt)
    if (existing) {
      if (existing.bankReference === command.bankReference && existing.sentAt?.getTime() === sentAt.getTime()
        && existing.sourceRevision === command.sourceRevision) return publicRecord(existing)
      throw new GuideTransferError('Un virement existe déjà pour ce Guide et cette réservation.')
    }
    const source = await readSource(db, command.earningId)
    if (source.earning.transferId || source.earning.status === 'PAID') {
      throw new GuideTransferError('Ce revenu est déjà rattaché à un virement.')
    }
    if (source.sourceRevision !== command.sourceRevision) throw new GuideTransferError('Le revenu ou les coordonnées ont changé. Rechargez la réservation.')
    validateSentAt(sentAt, source.dueAt)
    const record = await db.transfer.create({ data: {
      guideProfileId: source.earning.guideProfileId, recordedEarningId: source.earning.id,
      amountCents: source.earning.totalNetCents, currency: 'EUR', status: 'PENDING',
      bankReference: command.bankReference, sentAt, dueAt: source.dueAt,
      bankSnapshotEncrypted: encrypt(JSON.stringify(source.bank)), bankRevision: source.bankRevision,
      sourceRevision: source.sourceRevision, preparedByAdminId: actor.id, preparedByEmail: actor.email,
    } })
    const claimed = await db.guideEarning.updateMany({
      where: { id: source.earning.id, guideProfileId: source.earning.guideProfileId,
        transferId: null, status: { in: ['UPCOMING', 'AVAILABLE'] } },
      data: { transferId: record.id },
    })
    if (claimed.count !== 1) throw new GuideTransferError('Le revenu a été modifié entre-temps.')
    await audit(db, actor, context, 'GUIDE_TRANSFER_PREPARED', record)
    return publicRecord(record)
  })
}

export async function confirmGuideTransfer(actor: AdminActor, context: AdminAuditContext, input: unknown) {
  const command = parse(confirmSchema, input)
  return transaction(async db => {
    await requireTransferAdmin(db, actor, true)
    const record = await db.transfer.findUnique({ where: { id: command.transferId } })
    if (!record?.recordedEarningId) throw new GuideTransferError('Virement manuel introuvable.', 404)
    if (record.status === 'PAID' && record.confirmedAt) return publicRecord(record)
    if (record.status !== 'PENDING' || record.revision !== command.revision) throw new GuideTransferError('Le virement a changé. Rechargez la réservation.')
    const source = await readSource(db, record.recordedEarningId)
    assertCurrentRecord(record, source)
    const account = source.earning.guideProfile.guideAccount
    if (!account?.email) throw new GuideTransferError('Adresse email du Guide indisponible. Vérification nécessaire.')
    if (!record.sentAt || !record.bankSnapshotEncrypted) throw new GuideTransferError('Le dossier du virement est incomplet.')
    validateSentAt(record.sentAt, source.dueAt)
    const claimed = await db.guideEarning.updateMany({
      where: { id: source.earning.id, transferId: record.id, status: { in: ['UPCOMING', 'AVAILABLE'] } },
      data: { status: 'PAID' },
    })
    if (claimed.count !== 1) throw new GuideTransferError('Le revenu a été modifié entre-temps.')
    const updated = await db.transfer.update({ where: { id: record.id, revision: command.revision, status: 'PENDING' }, data: {
      status: 'PAID', confirmedAt: new Date(), confirmedByAdminId: actor.id, confirmedByEmail: actor.email,
      revision: { increment: 1 },
    } })
    await audit(db, actor, context, 'GUIDE_TRANSFER_CONFIRMED', updated, record)
    await queueGuideTransferEmail(db, {
      transferId: updated.id, to: account.email,
      name: account.displayName || `${account.firstName ?? ''} ${account.lastName ?? ''}`.trim() || 'Guide SAFARUMA',
      refNumber: source.earning.reservation.refNumber, amountCents: source.earning.totalNetCents,
      bankReference: updated.bankReference!, sentAt: updated.sentAt!,
    })
    // PAID is legacy storage terminology: the UI/email must say "virement envoyé",
    // not "reçu". Provider dispatch happens only after commit.
    return publicRecord(updated)
  })
}

export async function correctGuideTransfer(actor: AdminActor, context: AdminAuditContext, input: unknown) {
  const command = parse(correctionSchema, input)
  return transaction(async db => {
    await requireTransferAdmin(db, actor, true)
    const record = await db.transfer.findUnique({ where: { id: command.transferId } })
    if (!record?.recordedEarningId || !record.dueAt) throw new GuideTransferError('Virement manuel introuvable.', 404)
    const sentAt = new Date(command.sentAt)
    if (record.revision !== command.revision) throw new GuideTransferError('Le virement a changé. Rechargez la réservation.')
    if (record.status !== 'PENDING' && !(record.status === 'PAID' && record.confirmedAt)) {
      throw new GuideTransferError('État du virement à vérifier manuellement.')
    }
    if (record.status === 'PENDING') assertCurrentRecord(record, await readSource(db, record.recordedEarningId))
    validateSentAt(sentAt, record.dueAt)
    if (record.bankReference === command.bankReference && record.sentAt?.getTime() === sentAt.getTime()) return publicRecord(record)
    const updated = await db.transfer.update({ where: { id: record.id, revision: command.revision }, data: {
      bankReference: command.bankReference, sentAt, revision: { increment: 1 },
    } })
    // Original values remain in the append-only audit. Never change beneficiary,
    // amount, bank snapshot or paid status through a metadata correction.
    await audit(db, actor, context, 'GUIDE_TRANSFER_CORRECTED', updated, record, command.reason)
    return publicRecord(updated)
  })
}

// Used inside the existing reservation mutation transactions, including legacy
// PAID/transferId rows. A prepared record also locks the underlying beneficiary.
export async function assertNoRecordedGuideTransfer(db: Prisma.TransactionClient, reservationId: string, guideProfileId?: string) {
  const protectedEarning = await db.guideEarning.findFirst({ where: {
    reservationId, ...(guideProfileId && { guideProfileId }),
    OR: [{ status: 'PAID' }, { transferId: { not: null } }, { recordedTransfer: { isNot: null } }],
  }, select: { id: true } })
  if (protectedEarning) throw new GuideTransferError('Un virement est déjà enregistré ou en validation. Traitement financier manuel requis avant cette modification.')
}
