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

  // Calcule J-3, J-2, J-1, J-0
  const j0End = new Date(today); j0End.setHours(23, 59, 59, 999)

  const j1 = new Date(today)
  j1.setDate(j1.getDate() + 1)
  const j1End = new Date(j1); j1End.setHours(23, 59, 59, 999)

  const j2 = new Date(today)
  j2.setDate(j2.getDate() + 2)
  const j2End = new Date(j2); j2End.setHours(23, 59, 59, 999)

  const j3 = new Date(today)
  j3.setDate(j3.getDate() + 3)
  const j3End = new Date(j3); j3End.setHours(23, 59, 59, 999)

  void j1End; void j2End

  // Récupère les réservations CONFIRMED avec départ J-0 à J-3
  const reservations = await prisma.reservation.findMany({
    where: {
      status: 'CONFIRMED',
      startDate: {
        gte: today, // inclut aujourd'hui (J-0)
        lte: j3End,
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
    const isJ2 = daysUntil === 2
    const isJ1 = daysUntil === 1
    const isJ0 = daysUntil === 0

    if (!isJ3 && !isJ2 && !isJ1 && !isJ0) continue

    // Anti-doublon : vérifie optionsJson pour les flags de notification
    const opts = (resa as any).optionsJson as Record<string, unknown> | null ?? {}
    const flagKey = isJ1 ? 'notifiedJ1' : isJ3 ? 'notifiedJ3' : null

    // Skip si déjà notifié pour cet événement email
    if (flagKey && opts[flagKey]) {
      // Vérifie quand même les in-app de J0/J2
      if (!isJ2 && !isJ0) continue
    }

    const label = isJ1 ? 'demain' : 'dans 3 jours'
    const pelerinName = resa.pelerin.name ||
      `${resa.pelerin.firstName ?? ''} ${resa.pelerin.lastName ?? ''}`.trim() ||
      resa.pelerin.email || '—'
    const guideName = resa.guideProfile.user.name ||
      `${resa.guideProfile.user.firstName ?? ''} ${resa.guideProfile.user.lastName ?? ''}`.trim()

    let emailSentForResa = false

    // Email pèlerin
    if (resa.pelerin.email) {
      try {
        await sendEmail({
          to: { email: resa.pelerin.email, name: pelerinName },
          subject: `Rappel — Votre voyage commence ${label} · ${resa.refNumber}`,
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
        emailSentForResa = true
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
        emailSentForResa = true
      } catch (e) { console.error('Email guide notif error:', e) }
    }

    // In-app notification J-2 : checklist reminder
    if (isJ2 && !opts['notifiedJ2']) {
      await prisma.notification.create({
        data: {
          userId: resa.pelerinId,
          type: 'CHECKLIST_REMINDER',
          title: 'Votre Omra approche bientôt',
          message: `Votre départ est dans 48h (réf. ${resa.refNumber}). N'oubliez pas de valider votre checklist avant de partir !`,
        },
      }).catch(e => console.error('notif J2 error:', e))
    }

    // In-app notification J-0 : jour du départ
    if (isJ0 && !opts['notifiedJ0']) {
      await prisma.notification.create({
        data: {
          userId: resa.pelerinId,
          type: 'DEPARTURE_DAY',
          title: 'Votre expérience inoubliable commence aujourd\'hui !',
          message: `Bonne route pour votre Omra. Que Allah facilite votre voyage. Réf. : ${resa.refNumber}`,
        },
      }).catch(e => console.error('notif J0 error:', e))
    }

    // Marque les flags anti-doublon dans optionsJson
    const newFlags: Record<string, boolean> = { ...(opts as Record<string, boolean>) }
    if (flagKey) newFlags[flagKey] = true
    if (isJ2) newFlags['notifiedJ2'] = true
    if (isJ0) newFlags['notifiedJ0'] = true
    if (emailSentForResa || isJ2 || isJ0) {
      try {
        await prisma.reservation.update({
          where: { id: resa.id },
          data: { optionsJson: newFlags as any },
        })
      } catch (e) { console.error('Update optionsJson notif error:', e) }
    }
  }

  // Nettoyage des drafts expirés
  await prisma.reservationDraft.deleteMany({
    where: { expiresAt: { lt: new Date() } }
  })

  return NextResponse.json({
    success: true,
    reservationsChecked: reservations.length,
    emailsSent: sent,
    checkedAt: new Date().toISOString(),
  })
}
