import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import prisma from '@/lib/prisma'
import { baseTemplate, btn, divider, escapeHtml, heading, p, sendEmail } from '@/lib/email'

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
      guideProfile: { include: { user: { select: { email: true, name: true, firstName: true, lastName: true } } } },
      missions: {
        orderBy: { startDate: 'asc' },
        include: { guideProfile: { include: { user: { select: { email: true, name: true, firstName: true, lastName: true } } } } },
      },
    },
  })

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
      if (flags[key] || !assignment.guide.user.email) continue
      const guideName = personName(assignment.guide.user)
      const label = daysUntil === 1 ? 'demain' : 'dans 3 jours'
      try {
        await sendEmail({
          to: { email: assignment.guide.user.email, name: guideName },
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

  const deletedDrafts = await prisma.reservationDraft.deleteMany({ where: { expiresAt: { lt: new Date() } } })
  return NextResponse.json({ success: true, reservationsChecked: reservations.length, emailsSent: sent, draftsReleased: deletedDrafts.count, checkedAt: new Date().toISOString() })
}
