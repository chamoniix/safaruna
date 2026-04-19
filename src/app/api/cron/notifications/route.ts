import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { sendEmail } from '@/lib/email'

export async function GET(req: NextRequest) {
  // Sécurité : vérifie le secret Vercel Cron
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) {
    console.error('[SECURITY] CRON_SECRET manquant — cron désactivé')
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Calcule J-3 et J-1
  const j3 = new Date(today)
  j3.setDate(j3.getDate() + 3)
  const j3End = new Date(j3)
  j3End.setHours(23, 59, 59, 999)

  const j1 = new Date(today)
  j1.setDate(j1.getDate() + 1)
  const j1End = new Date(j1)
  j1End.setHours(23, 59, 59, 999)

  // Récupère les réservations CONFIRMED avec départ J-3 ou J-1
  const reservations = await prisma.reservation.findMany({
    where: {
      status: 'CONFIRMED',
      startDate: {
        gte: j1, // au moins demain
        lte: j3End, // au plus dans 3 jours
      },
    },
    include: {
      pelerin: {
        select: {
          email: true, name: true,
          firstName: true, lastName: true,
        },
      },
      guideProfile: {
        include: {
          user: {
            select: {
              email: true, name: true,
              firstName: true, lastName: true,
            },
          },
        },
      },
      package: true,
    },
  })

  let sent = 0
  for (const resa of reservations) {
    const daysUntil = Math.round(
      (resa.startDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    )
    const isJ3 = daysUntil === 3
    const isJ1 = daysUntil === 1

    if (!isJ3 && !isJ1) continue

    const label = isJ1 ? 'demain' : 'dans 3 jours'
    const pelerinName = resa.pelerin.name ||
      `${resa.pelerin.firstName ?? ''} ${resa.pelerin.lastName ?? ''}`.trim() ||
      resa.pelerin.email || '—'
    const guideName = resa.guideProfile.user.name ||
      `${resa.guideProfile.user.firstName ?? ''} ${resa.guideProfile.user.lastName ?? ''}`.trim()

    // Email pèlerin
    if (resa.pelerin.email) {
      try {
        await sendEmail({
          to: { email: resa.pelerin.email, name: pelerinName },
          subject: `🕋 Rappel — Votre voyage commence ${label} · ${resa.refNumber}`,
          html: `
            <h2>Votre voyage commence ${label} !</h2>
            <p>Référence : <strong>${resa.refNumber}</strong></p>
            <p>Guide : <strong>${guideName}</strong></p>
            <p>Destination : ${resa.selectedCities === 'BOTH'
              ? 'Makkah + Madinah'
              : resa.selectedCities === 'MAKKAH' ? 'Makkah' : 'Madinah'}</p>
            <p>Date de départ : <strong>${resa.startDate.toLocaleDateString('fr-FR', {
              weekday: 'long', day: 'numeric',
              month: 'long', year: 'numeric',
            })}</strong></p>
            <p>Personnes : ${resa.nbPeople}</p>
            <br/>
            <p>Votre guide vous contactera pour confirmer le point de rendez-vous.</p>
            <a href="https://safaruma.com/espace/reservations">
              Voir les détails de ma réservation
            </a>
          `,
        })
        sent++
      } catch (e) { console.error('Email pèlerin notif error:', e) }
    }

    // Email guide
    if (resa.guideProfile.user.email) {
      try {
        await sendEmail({
          to: {
            email: resa.guideProfile.user.email,
            name: guideName,
          },
          subject: `[SAFARUMA] Rappel — Mission ${label} · ${resa.refNumber}`,
          html: `
            <h2>Rappel : votre mission commence ${label}</h2>
            <p>Référence : <strong>${resa.refNumber}</strong></p>
            <p>Pèlerin : <strong>${pelerinName}</strong></p>
            <p>Destination : ${resa.selectedCities === 'BOTH'
              ? 'Makkah + Madinah'
              : resa.selectedCities === 'MAKKAH' ? 'Makkah' : 'Madinah'}</p>
            <p>Date : <strong>${resa.startDate.toLocaleDateString('fr-FR', {
              weekday: 'long', day: 'numeric',
              month: 'long', year: 'numeric',
            })}</strong></p>
            <p>Personnes : ${resa.nbPeople}</p>
            <br/>
            <a href="https://safaruma.com/guide/missions">
              Voir dans mon espace
            </a>
          `,
        })
        sent++
      } catch (e) { console.error('Email guide notif error:', e) }
    }
  }

  return NextResponse.json({
    success: true,
    reservationsChecked: reservations.length,
    emailsSent: sent,
    checkedAt: new Date().toISOString(),
  })
}
