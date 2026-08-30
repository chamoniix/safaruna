import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getGuideRequestContext, hasTrustedGuideAuthOrigin } from '@/lib/guide-auth'
import { requireGuide } from '@/lib/require-account'
import { baseTemplate, badge, btn, divider, escapeHtml, heading, p, sendEmail } from '@/lib/email'

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
        select: { id: true, city: true, guideConfirmationStatus: true },
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
