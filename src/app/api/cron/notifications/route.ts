import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import prisma from '@/lib/prisma'
import { baseTemplate, btn, divider, escapeHtml, heading, p, retryPendingEmails, sendEmail } from '@/lib/email'
import { archiveExpiredAnalyticsEvents } from '@/lib/analytics-retention'
import { confirmationDeadlines, reviewOpensAt } from '@/lib/guide-workflow'
import { suspendGuideForReservationIncident } from '@/lib/guide-reservation-incidents'
import { deleteTerminalExpiredDrafts } from '@/lib/payments/expired-drafts'

const DAY_MS = 86_400_000

function personName(person: { name: string | null; firstName: string | null; lastName: string | null; email: string | null }): string {
  return person.name || `${person.firstName ?? ''} ${person.lastName ?? ''}`.trim() || person.email || '—'
}

function dateFr(date: Date): string {
  return date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
}

export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret || req.headers.get('authorization') !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const today = new Date()
  today.setUTCHours(0, 0, 0, 0)
  const j1 = new Date(today.getTime() + DAY_MS)
  const j3End = new Date(today.getTime() + 4 * DAY_MS - 1)
  const reservations = await prisma.reservation.findMany({
    where: {
      status: 'CONFIRMED',
      OR: [
        { startDate: { gte: j1, lte: j3End } },
        { missions: { some: { startDate: { gte: j1, lte: j3End } } } },
      ],
    },
    include: {
      pelerin: { select: { email: true, name: true, firstName: true, lastName: true } },
      guideProfile: { include: { guideAccount: { select: { email: true, displayName: true, firstName: true, lastName: true } } } },
      missions: {
        orderBy: { startDate: 'asc' },
        include: { guideProfile: { include: { guideAccount: { select: { email: true, displayName: true, firstName: true, lastName: true } } } } },
      },
    },
  })
  const emailRetries = await retryPendingEmails(20).catch(error => {
    console.error('[cron] reprises email', error)
    return { checked: 0, accepted: 0, failed: 0 }
  })

  const pendingConfirmations = await prisma.reservation.findMany({
    where: {
      status: 'CONFIRMED',
      missions: { some: { guideConfirmationStatus: 'PENDING' } },
    },
    select: {
      id: true,
      refNumber: true,
      nbPeople: true,
      missions: {
        where: { guideConfirmationStatus: 'PENDING' },
        select: {
          city: true,
          startDate: true,
          guideConfirmationRequestedAt: true,
          createdAt: true,
          guideProfileId: true,
          guideProfile: {
            select: { guideAccount: { select: { email: true, displayName: true, firstName: true, lastName: true } } },
          },
        },
      },
    },
  })
  const activeAdmins = await prisma.adminAccount.findMany({
    where: { status: 'ACTIVE' },
    select: { email: true, name: true, role: true },
  })
  let confirmationReminders = 0
  let confirmationEscalations = 0
  for (const reservation of pendingConfirmations) {
    const grouped = new Map<string, typeof reservation.missions>()
    for (const mission of reservation.missions) {
      grouped.set(mission.guideProfileId, [...(grouped.get(mission.guideProfileId) ?? []), mission])
    }
    for (const [guideProfileId, missions] of grouped) {
      const account = missions[0]?.guideProfile.guideAccount
      if (!account?.email) continue
      const requestedAt = new Date(Math.min(...missions.map(mission => (mission.guideConfirmationRequestedAt ?? mission.createdAt).getTime())))
      const departureAt = new Date(Math.min(...missions.map(mission => mission.startDate.getTime())))
      const deadlines = confirmationDeadlines(requestedAt, departureAt)
      const guideName = account.displayName || `${account.firstName ?? ''} ${account.lastName ?? ''}`.trim() || account.email
      const cityNames = missions.map(mission => mission.city === 'MAKKAH' ? 'Makkah' : 'Médine').join(' · ')

      if (new Date() >= deadlines.reminderAt) {
        const result = await sendEmail({
          category: 'GUIDE_CONFIRMATION_REMINDER',
          retryable: true,
          idempotencyKey: `guide-confirmation-reminder:${reservation.id}:${guideProfileId}`,
          reference: { type: 'RESERVATION', id: reservation.id },
          to: { email: account.email, name: guideName },
          subject: `[SAFARUMA] Rappel : réservation à confirmer — ${reservation.refNumber}`,
          html: baseTemplate(`
            ${heading('Votre confirmation est attendue')}
            ${p(`La réservation <strong>${escapeHtml(reservation.refNumber)}</strong> est payée. Confirmez votre disponibilité pour ${escapeHtml(cityNames)}.`)}
            ${p(`Départ : ${escapeHtml(dateFr(departureAt))} · Voyageurs : ${reservation.nbPeople}`)}
            ${divider()}
            ${btn('Confirmer maintenant', `${process.env.NEXT_PUBLIC_BASE_URL || 'https://safaruma.com'}/guide/demandes?reservation=${encodeURIComponent(reservation.refNumber)}`)}
          `),
        })
        if (result.status === 'ACCEPTED' || result.status === 'RETRY_PENDING') confirmationReminders++
      }

      if (new Date() >= deadlines.escalationAt) {
        let suspended = false
        try {
          const incidentResult = await prisma.$transaction(tx => suspendGuideForReservationIncident(tx, {
            reservationId: reservation.id,
            guideProfileId,
            refNumber: reservation.refNumber,
            type: 'NO_RESPONSE',
            reason: `Aucune réponse dans le délai ${deadlines.urgent ? 'urgent de 3 heures' : 'normal de 48 heures'}.`,
            occurredAt: new Date(),
            context: { actor: 'SYSTEM', actorRole: 'SYSTEM' },
          }), { isolationLevel: Prisma.TransactionIsolationLevel.Serializable })
          suspended = incidentResult.created
        } catch (error) {
          if (!(error instanceof Prisma.PrismaClientKnownRequestError && ['P2002', 'P2034'].includes(error.code))) throw error
        }
        if (!suspended) continue
        for (const admin of activeAdmins) {
          const result = await sendEmail({
            category: 'GUIDE_RESERVATION_INCIDENT',
            retryable: true,
            idempotencyKey: `guide-confirmation-escalation:${reservation.id}:${guideProfileId}:${admin.email.toLowerCase()}`,
            reference: { type: 'RESERVATION', id: reservation.id },
            to: { email: admin.email, name: admin.name || admin.role },
            subject: `[${admin.role}] Guide sans réponse — ${reservation.refNumber}`,
            html: baseTemplate(`
              ${heading('Guide suspendu après absence de réponse')}
              ${p(`<strong>${escapeHtml(guideName)}</strong> n’a pas confirmé la réservation <strong>${escapeHtml(reservation.refNumber)}</strong> dans le délai ${deadlines.urgent ? 'urgent de 3 heures' : 'normal de 48 heures'}. Son profil a été suspendu automatiquement.`)}
              ${p(`Ville(s) : ${escapeHtml(cityNames)} · Départ : ${escapeHtml(dateFr(departureAt))}`)}
              ${p('La réservation reste payée et confirmée. Aucun remboursement automatique n’a été déclenché. L’administration doit traiter l’incident et organiser la suite.')}
              ${divider()}
              ${btn('Ouvrir les réservations', `${process.env.NEXT_PUBLIC_BASE_URL || 'https://safaruma.com'}/admin/reservations`)}
            `),
          })
          if (result.status === 'ACCEPTED' || result.status === 'RETRY_PENDING') confirmationEscalations++
        }
      }
    }
  }

  const reviewCandidates = await prisma.reservation.findMany({
    where: {
      status: { in: ['CONFIRMED', 'COMPLETED'] },
      reviewRequestSentAt: null,
      endDate: { lte: new Date() },
    },
    select: {
      id: true,
      refNumber: true,
      endDate: true,
      pelerin: { select: { email: true, name: true, firstName: true, lastName: true } },
    },
  })
  let reviewRequests = 0
  for (const reservation of reviewCandidates) {
    if (new Date() < reviewOpensAt(reservation.endDate) || !reservation.pelerin.email) continue
    const result = await sendEmail({
      category: 'REVIEW_REQUEST',
      retryable: true,
      idempotencyKey: `review-request:${reservation.id}:${reservation.pelerin.email.toLowerCase()}`,
      reference: { type: 'RESERVATION', id: reservation.id },
      to: { email: reservation.pelerin.email, name: personName(reservation.pelerin) },
      subject: `Mabrouk pour votre Omra — partagez votre expérience ${reservation.refNumber}`,
      html: baseTemplate(`
        ${heading('Mabrouk pour votre Omra')}
        ${p('Merci d’avoir choisi SAFARUMA. Pour améliorer la qualité de nos guides, partagez un retour sincère sur votre accompagnement et votre séjour.')}
        ${divider()}
        ${btn('Donner mon avis', `${process.env.NEXT_PUBLIC_BASE_URL || 'https://safaruma.com'}/espace/avis/${reservation.id}`)}
      `),
    })
    if (result.status === 'ACCEPTED' || result.status === 'RETRY_PENDING') {
      await prisma.reservation.update({ where: { id: reservation.id }, data: { reviewRequestSentAt: new Date() } })
      reviewRequests++
    }
  }

  let sent = 0
  for (const reservation of reservations) {
    const flags = ((reservation.optionsJson as Record<string, unknown> | null) ?? {})
    const nextFlags = { ...flags }
    const pelerinName = personName(reservation.pelerin)
    const reservationDays = Math.round((reservation.startDate.getTime() - today.getTime()) / DAY_MS)

    if ((reservationDays === 1 || reservationDays === 3) && reservation.pelerin.email) {
      const key = `notifiedClientJ${reservationDays}`
      if (!flags[key]) {
        const label = reservationDays === 1 ? 'demain' : 'dans 3 jours'
        const missionSummary = reservation.missions.length > 0
          ? reservation.missions.map(mission => `${mission.city === 'MAKKAH' ? 'Makkah' : 'Médine'} : ${dateFr(mission.startDate)}`).join(' · ')
          : dateFr(reservation.startDate)
        try {
          await sendEmail({
            category: 'DEPARTURE_REMINDER_PELERIN',
            to: { email: reservation.pelerin.email, name: pelerinName },
            subject: `Rappel — Votre voyage commence ${label} · ${reservation.refNumber}`,
            throwOnError: true,
            html: baseTemplate(`
              ${heading(`Votre voyage commence ${label} !`)}
              ${p(`Référence : <strong>${escapeHtml(reservation.refNumber)}</strong>`)}
              ${p(`Programme : ${escapeHtml(missionSummary)}<br>Voyageurs : ${reservation.nbPeople}`)}
              ${reservation.ihramAlert ? `<div style="background:#FEE2E2;border:1px solid #DC2626;border-radius:8px;padding:12px 16px;color:#991B1B;font-size:13px;font-weight:700">Attention : mettez votre Ihram dans l’avion ou rendez-vous au Miqat le plus proche avant la Omra.</div>` : ''}
              ${divider()}
              ${btn('Voir ma réservation et contacter mon guide', 'https://safaruma.com/espace/reservations')}
            `),
          })
          nextFlags[key] = true
          sent++
        } catch (error) { console.error('[cron] rappel pèlerin', error) }
      }
    }

    const assignments = reservation.missions.length > 0
      ? reservation.missions.map(mission => ({
          id: mission.id,
          city: mission.city,
          startDate: mission.startDate,
          endDate: mission.endDate,
          guide: mission.guideProfile,
        }))
      : [{ id: 'legacy', city: reservation.selectedCities || 'MISSION', startDate: reservation.startDate, endDate: reservation.endDate, guide: reservation.guideProfile }]

    for (const assignment of assignments) {
      const daysUntil = Math.round((assignment.startDate.getTime() - today.getTime()) / DAY_MS)
      if (daysUntil !== 1 && daysUntil !== 3) continue
      const key = `notifiedGuide_${assignment.id}_J${daysUntil}`
      const guideAccount = assignment.guide.guideAccount
      if (flags[key] || !guideAccount?.email) continue
      const guideName = guideAccount.displayName
        || `${guideAccount.firstName ?? ''} ${guideAccount.lastName ?? ''}`.trim()
        || guideAccount.email
      const label = daysUntil === 1 ? 'demain' : 'dans 3 jours'
      try {
        await sendEmail({
          category: 'DEPARTURE_REMINDER_GUIDE',
          to: { email: guideAccount.email, name: guideName },
          subject: `[SAFARUMA] Rappel — Mission ${label} · ${reservation.refNumber}`,
          throwOnError: true,
          html: baseTemplate(`
            ${heading(`Votre mission commence ${label}`)}
            ${p(`Référence : <strong>${escapeHtml(reservation.refNumber)}</strong><br>Pèlerin : <strong>${escapeHtml(pelerinName)}</strong>`)}
            ${p(`Ville : ${escapeHtml(assignment.city === 'MAKKAH' ? 'Makkah' : 'Médine')}<br>Dates : ${escapeHtml(dateFr(assignment.startDate))} au ${escapeHtml(dateFr(assignment.endDate))}<br>Voyageurs : ${reservation.nbPeople}`)}
            ${reservation.ihramAlert ? `<div style="background:#FEE2E2;border:1px solid #DC2626;border-radius:8px;padding:12px 16px;color:#991B1B;font-size:13px;font-weight:700">Alerte Ihram active pour ce séjour.</div>` : ''}
            ${divider()}
            ${btn('Voir dans mon espace guide', 'https://safaruma.com/guide/missions')}
          `),
        })
        nextFlags[key] = true
        sent++
      } catch (error) { console.error('[cron] rappel guide', error) }
    }

    if (JSON.stringify(nextFlags) !== JSON.stringify(flags)) {
      await prisma.reservation.update({ where: { id: reservation.id }, data: { optionsJson: nextFlags as Prisma.InputJsonValue } })
    }
  }

  const draftsReleased = await prisma.$transaction(
    tx => deleteTerminalExpiredDrafts(tx),
    { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
  )
  const analyticsEventsArchived = await archiveExpiredAnalyticsEvents()
  return NextResponse.json({ success: true, reservationsChecked: reservations.length, emailsSent: sent, confirmationReminders, confirmationEscalations, reviewRequests, emailRetries, draftsReleased, analyticsEventsArchived, checkedAt: new Date().toISOString() })
}
