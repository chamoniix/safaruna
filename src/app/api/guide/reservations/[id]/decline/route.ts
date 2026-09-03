import { Prisma } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { baseTemplate, badge, btn, divider, escapeHtml, heading, p, sendEmail } from '@/lib/email'
import { getGuideRequestContext, hasTrustedGuideAuthOrigin } from '@/lib/guide-auth'
import { suspendGuideForReservationIncident } from '@/lib/guide-reservation-incidents'
import prisma from '@/lib/prisma'
import { requireGuide } from '@/lib/require-account'

const declineSchema = z.object({
  reason: z.string().trim().min(10, 'Expliquez la raison en au moins 10 caractères.').max(2000),
}).strict()

function guideName(actor: { displayName: string | null; firstName: string | null; lastName: string | null; email: string }) {
  return actor.displayName || `${actor.firstName ?? ''} ${actor.lastName ?? ''}`.trim() || actor.email
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!hasTrustedGuideAuthOrigin(req)) return NextResponse.json({ error: 'Origine non autorisée' }, { status: 403 })
  const access = await requireGuide()
  if (!access.ok) return access.response

  const parsed = declineSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Motif invalide' }, { status: 400 })
  }
  const { id } = await params
  const reservation = await prisma.reservation.findFirst({
    where: {
      id,
      status: 'CONFIRMED',
      missions: {
        some: {
          guideProfileId: access.actor.guideProfileId,
          guideConfirmationStatus: 'PENDING',
        },
      },
    },
    select: { id: true, refNumber: true },
  })
  if (!reservation) return NextResponse.json({ error: 'Réservation à confirmer introuvable' }, { status: 404 })

  const occurredAt = new Date()
  const requestContext = getGuideRequestContext(req)
  try {
    const result = await prisma.$transaction(tx => suspendGuideForReservationIncident(tx, {
      reservationId: reservation.id,
      guideProfileId: access.actor.guideProfileId,
      refNumber: reservation.refNumber,
      type: 'GUIDE_DECLINED',
      reason: parsed.data.reason,
      occurredAt,
      context: {
        actor: access.actor.email,
        actorRole: 'GUIDE',
        ...requestContext,
      },
    }), { isolationLevel: Prisma.TransactionIsolationLevel.Serializable })
    if (!result.created) return NextResponse.json({ error: 'Cette indisponibilité a déjà été signalée' }, { status: 409 })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && ['P2002', 'P2034'].includes(error.code)) {
      return NextResponse.json({ error: 'Cette indisponibilité est déjà en cours de traitement' }, { status: 409 })
    }
    throw error
  }

  const admins = await prisma.adminAccount.findMany({
    where: { status: 'ACTIVE' },
    select: { email: true, name: true, role: true },
  })
  const name = guideName(access.actor)
  await Promise.allSettled(admins.map(admin => sendEmail({
    category: 'GUIDE_RESERVATION_INCIDENT',
    retryable: true,
    idempotencyKey: `guide-declined:${reservation.id}:${access.actor.guideProfileId}:${admin.email.toLowerCase()}`,
    reference: { type: 'RESERVATION', id: reservation.id },
    to: { email: admin.email, name: admin.name || admin.role },
    subject: `[${admin.role}] Guide indisponible — ${reservation.refNumber}`,
    html: baseTemplate(`
      ${heading('Un Guide a refusé une réservation payée')}
      ${badge('PROFIL SUSPENDU', '#B91C1C')}
      ${p(`<strong>${escapeHtml(name)}</strong> a signalé son indisponibilité pour la réservation <strong>${escapeHtml(reservation.refNumber)}</strong>.`)}
      ${p(`<strong>Motif communiqué :</strong><br>${escapeHtml(parsed.data.reason)}`)}
      ${p('La réservation reste payée et confirmée. Aucun remboursement automatique n’a été déclenché. L’administration doit examiner le motif, décider s’il est comptabilisé, puis transférer ou traiter la réservation.')}
      ${divider()}
      ${btn('Examiner le Guide', `${process.env.NEXT_PUBLIC_BASE_URL || 'https://safaruma.com'}/admin/guides`)}
    `),
  })))

  return NextResponse.json({ success: true, suspended: true })
}
