import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import prisma from '@/lib/prisma'
import { getGuideRequestContext, hasTrustedGuideAuthOrigin } from '@/lib/guide-auth'
import { requireGuide } from '@/lib/require-account'
import { baseTemplate, badge, btn, divider, escapeHtml, heading, p, sendEmail } from '@/lib/email'
import { confirmationDeadlines } from '@/lib/guide-workflow'
import { suspendGuideForReservationIncident } from '@/lib/guide-reservation-incidents'

function guideName(actor: { displayName: string | null; firstName: string | null; lastName: string | null; email: string }) {
  return actor.displayName || `${actor.firstName ?? ''} ${actor.lastName ?? ''}`.trim() || actor.email
}

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  if (!hasTrustedGuideAuthOrigin(req)) return NextResponse.json({ error: 'Origine non autorisée' }, { status: 403 })
  const access = await requireGuide()
  if (!access.ok) return access.response

  const { id } = await context.params
  const reservation = await prisma.reservation.findFirst({
    where: {
      id,
      missions: { some: { guideProfileId: access.actor.guideProfileId } },
    },
    select: {
      id: true,
      refNumber: true,
      status: true,
      startDate: true,
      missions: {
        where: { guideProfileId: access.actor.guideProfileId },
        select: {
          id: true,
          city: true,
          startDate: true,
          createdAt: true,
          guideConfirmationRequestedAt: true,
          guideConfirmationStatus: true,
        },
      },
    },
  })

  if (!reservation) return NextResponse.json({ error: 'Réservation introuvable' }, { status: 404 })
  if (reservation.status !== 'CONFIRMED') {
    return NextResponse.json({ error: 'Cette réservation ne peut pas être confirmée.' }, { status: 409 })
  }
  if (reservation.missions.every(mission => mission.guideConfirmationStatus === 'CONFIRMED')) {
    return NextResponse.json({ success: true, alreadyConfirmed: true })
  }

  const now = new Date()
  const requestContext = getGuideRequestContext(req)
  const pendingMissions = reservation.missions.filter(mission => mission.guideConfirmationStatus === 'PENDING')
  if (pendingMissions.length === 0) {
    return NextResponse.json({ error: 'Cette réservation ne peut plus être confirmée.' }, { status: 409 })
  }
  const requestedAt = new Date(Math.min(...pendingMissions.map(mission => (mission.guideConfirmationRequestedAt ?? mission.createdAt).getTime())))
  const departureAt = new Date(Math.min(...pendingMissions.map(mission => mission.startDate.getTime())))
  const deadlines = confirmationDeadlines(requestedAt, departureAt)
  if (now >= deadlines.escalationAt) {
    let incidentCreated = false
    try {
      const incident = await prisma.$transaction(tx => suspendGuideForReservationIncident(tx, {
        reservationId: reservation.id,
        guideProfileId: access.actor.guideProfileId,
        refNumber: reservation.refNumber,
        type: 'NO_RESPONSE',
        reason: `Confirmation tentée après le délai ${deadlines.urgent ? 'urgent de 3 heures' : 'normal de 48 heures'}.`,
        occurredAt: now,
        context: {
          actor: 'SYSTEM',
          actorRole: 'SYSTEM',
          ...requestContext,
        },
      }), { isolationLevel: Prisma.TransactionIsolationLevel.Serializable })
      incidentCreated = incident.created
    } catch (error) {
      if (!(error instanceof Prisma.PrismaClientKnownRequestError && ['P2002', 'P2034'].includes(error.code))) throw error
    }
    if (incidentCreated) {
      const admins = await prisma.adminAccount.findMany({
        where: { status: 'ACTIVE' },
        select: { email: true, name: true, role: true },
      })
      const name = guideName(access.actor)
      await Promise.allSettled(admins.map(admin => sendEmail({
        category: 'GUIDE_RESERVATION_INCIDENT',
        retryable: true,
        idempotencyKey: `guide-confirmation-escalation:${reservation.id}:${access.actor.guideProfileId}:${admin.email.toLowerCase()}`,
        reference: { type: 'RESERVATION', id: reservation.id },
        to: { email: admin.email, name: admin.name || admin.role },
        subject: `[${admin.role}] Guide sans réponse — ${reservation.refNumber}`,
        html: baseTemplate(`
          ${heading('Guide suspendu après expiration du délai')}
          ${badge('PROFIL SUSPENDU', '#B91C1C')}
          ${p(`<strong>${escapeHtml(name)}</strong> a tenté de confirmer la réservation <strong>${escapeHtml(reservation.refNumber)}</strong> après le délai ${deadlines.urgent ? 'urgent de 3 heures' : 'normal de 48 heures'}.`)}
          ${p('La réservation reste payée et confirmée. Aucun remboursement automatique n’a été déclenché. L’administration doit traiter l’incident et organiser la suite.')}
          ${divider()}
          ${btn('Ouvrir les réservations', `${process.env.NEXT_PUBLIC_BASE_URL || 'https://safaruma.com'}/admin/reservations`)}
        `),
      })))
    }
    return NextResponse.json(
      { error: 'Le délai de confirmation est dépassé. Votre profil Guide a été suspendu.', suspended: true },
      { status: 409 },
    )
  }

  const confirmed = await prisma.$transaction(async tx => {
    const updated = await tx.reservationMission.updateMany({
      where: {
        reservationId: reservation.id,
        guideProfileId: access.actor.guideProfileId,
        guideConfirmationStatus: 'PENDING',
      },
      data: {
        guideConfirmationStatus: 'CONFIRMED',
        guideConfirmedAt: now,
      },
    })
    if (updated.count === 0) return false
    await tx.auditLog.create({
      data: {
        actor: access.actor.email,
        actorRole: 'GUIDE',
        action: 'GUIDE_RESERVATION_CONFIRMED',
        target: reservation.refNumber,
        detail: JSON.stringify({
          guideProfileId: access.actor.guideProfileId,
          cities: reservation.missions.map(mission => mission.city),
          request: {
            country: requestContext.country,
            city: requestContext.city,
            device: requestContext.device,
            browser: requestContext.browser,
          },
        }),
        ip: requestContext.ip,
        userAgent: requestContext.userAgent,
        before: { status: 'PENDING' },
        after: { status: 'CONFIRMED', confirmedAt: now.toISOString() },
      },
    })
    return true
  })

  if (!confirmed) return NextResponse.json({ success: true, alreadyConfirmed: true })

  const admins = await prisma.adminAccount.findMany({
    where: { status: 'ACTIVE' },
    select: { email: true, name: true, role: true },
  })
  const name = guideName(access.actor)
  await Promise.all(admins.map(admin => sendEmail({
    category: 'GUIDE_RESERVATION_CONFIRMED',
    retryable: true,
    idempotencyKey: `guide-reservation-confirmed:${reservation.id}:${access.actor.guideProfileId}:${admin.email.toLowerCase()}`,
    reference: { type: 'RESERVATION', id: reservation.id },
    to: { email: admin.email, name: admin.name || admin.role },
    subject: `[${admin.role}] Guide confirmé — ${reservation.refNumber}`,
    html: baseTemplate(`
      ${heading('Le guide a confirmé la réservation')}
      ${badge('GUIDE CONFIRMÉ', '#1D5C3A')}
      ${p(`<strong>${escapeHtml(name)}</strong> a confirmé sa mission pour la réservation <strong>${escapeHtml(reservation.refNumber)}</strong>.`)}
      ${p(`Ville(s) : ${escapeHtml(reservation.missions.map(mission => mission.city === 'MAKKAH' ? 'Makkah' : 'Médine').join(' · '))}`)}
      ${divider()}
      ${btn('Voir la réservation', `${process.env.NEXT_PUBLIC_BASE_URL || 'https://safaruma.com'}/admin/reservations`)}
    `),
  })))

  return NextResponse.json({ success: true, confirmedAt: now.toISOString() })
}
