import Stripe from 'stripe'
import * as Sentry from '@sentry/nextjs'
import { Prisma } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import {
  baseTemplate,
  badge,
  btn,
  divider,
  escapeHtml,
  heading,
  p,
  sendEmail,
} from '@/lib/email'
import { createAuditLog } from '@/lib/audit'
import { getPackageForCity, type CityChoice } from '@/lib/packages'
import { PLACES } from '@/lib/places'
import { recordAnalyticsEvent } from '@/lib/analytics'

type DraftMission = {
  city: 'MAKKAH' | 'MADINAH'
  guideProfileId: string
  guideSlug: string
  startDate: string
  endDate: string
  selectedPlaces: string[]
  localTransport: 'NONE' | 'TAXI' | 'CAR'
  localTransportDays: number
}

type DraftEarning = {
  guideProfileId: string
  serviceNetCents: number
  placesNetCents: number
  transportNetCents: number
  hotelNetCents: number
  totalNetCents: number
  breakdown: Prisma.InputJsonValue
}

type DraftData = {
  cityChoice: CityChoice
  departDate: string
  returnDate: string
  nbPersonnes: number
  gender: string
  langue: string
  selectedPlaces: string[]
  allVisitPlaces: string[]
  transportOption: string
  localTransportMakkah: string
  localTransportMadinah: string
  totalPrice: number
  packageName: string
  selectedGuideSlug: string
  selectedGuideSlugMadinah?: string | null
  arrivalPoint: string
  guideBedProvided: boolean
  sameGuideForBothCities: boolean
  cityOrder: Array<'MAKKAH' | 'MADINAH'>
  ihramAlert: boolean
  missions: DraftMission[]
  pricing: {
    base: number
    places: number
    intercityTransport: number
    localTransportMakkah: number
    localTransportMadinah: number
    localTransportDaysMakkah: number
    localTransportDaysMadinah: number
    localVehicle: { dailyRate: number; vehicle: string; label: string }
    guideHotelNights: number
    guideHotel: number
    total: number
  }
  earnings: DraftEarning[]
}

function dateFr(value: Date | string): string {
  return new Date(value).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
  })
}

function eachDate(start: Date, end: Date): Date[] {
  const dates: Date[] = []
  for (let current = new Date(start); current <= end; current = new Date(current.getTime() + 86_400_000)) {
    dates.push(current)
  }
  return dates
}

function cityLabel(city: string): string {
  return city === 'MAKKAH' ? 'Makkah' : 'Médine'
}

function arrivalLabel(arrivalPoint: string): string {
  if (arrivalPoint === 'JEDDAH') return 'Aéroport de Jeddah'
  return cityLabel(arrivalPoint)
}

function tableRows(rows: Array<[string, string]>): string {
  return `<table cellpadding="0" cellspacing="0" width="100%">${rows.map(([key, value]) => `
    <tr>
      <td style="padding:8px 0;font-size:12px;color:#7A6D5A;font-weight:700;width:42%;vertical-align:top">${escapeHtml(key)}</td>
      <td style="padding:8px 0;font-size:13px;color:#1A1209;font-weight:600">${escapeHtml(value)}</td>
    </tr>
    <tr><td colspan="2"><div style="height:1px;background:#E8DFC8"></div></td></tr>
  `).join('')}</table>`
}

function placeNames(keys: string[]): string {
  return keys.map(key => PLACES.find(place => place.key === key)?.nameFr ?? key).join(', ')
}

function transportLabel(mission: DraftMission, data: DraftData): string {
  if (mission.localTransport === 'TAXI') {
    return 'Taxi public — les courses du guide pendant les visites sont à votre charge sur place'
  }
  if (mission.localTransport === 'CAR') {
    return `${data.pricing.localVehicle.label} — ${mission.localTransportDays} jour(s) à ${data.pricing.localVehicle.dailyRate} €/jour`
  }
  return 'Sans transport local réservé'
}

function guideTransportLabel(mission: DraftMission, data: DraftData): string {
  if (mission.localTransport === 'TAXI') {
    return 'Taxi public — vos courses pendant les visites sont prises en charge sur place par le client'
  }
  if (mission.localTransport === 'CAR') {
    return `${data.pricing.localVehicle.label} — ${mission.localTransportDays} jour(s)`
  }
  return 'Sans transport local réservé'
}

async function sendConfirmationEmails(opts: {
  refNumber: string
  amount: number
  data: DraftData
  pelerin: { email: string | null; name: string | null; firstName: string | null; lastName: string | null }
  guides: Array<{
    id: string
    slug: string | null
    guideAccount: { email: string; displayName: string | null; firstName: string | null; lastName: string | null } | null
  }>
}) {
  const { refNumber, amount, data, pelerin, guides } = opts
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://safaruma.com'
  const pelerinName = pelerin.name || `${pelerin.firstName ?? ''} ${pelerin.lastName ?? ''}`.trim() || pelerin.email || 'Pèlerin'
  const guideName = (guideId: string) => {
    const guide = guides.find(item => item.id === guideId)
    return guide?.guideAccount?.displayName || `${guide?.guideAccount?.firstName ?? ''} ${guide?.guideAccount?.lastName ?? ''}`.trim() || guide?.slug || 'Guide SAFARUMA'
  }
  const missionSummary = data.missions.map(mission =>
    `${cityLabel(mission.city)} : ${guideName(mission.guideProfileId)}, du ${dateFr(mission.startDate)} au ${dateFr(mission.endDate)}`
  ).join(' | ')
  const placesSummary = data.missions.map(mission =>
    `${cityLabel(mission.city)} : ${placeNames(mission.selectedPlaces)}`
  ).join(' | ')
  const priceSummary = [
    `Accompagnement ${data.pricing.base} €`,
    data.pricing.places ? `Visites ${data.pricing.places} €` : null,
    data.pricing.intercityTransport ? `Transport du guide ${data.pricing.intercityTransport} €` : null,
    data.pricing.localTransportMakkah ? `Transport local Makkah ${data.pricing.localTransportMakkah} €` : null,
    data.pricing.localTransportMadinah ? `Transport local Médine ${data.pricing.localTransportMadinah} €` : null,
    data.pricing.guideHotel ? `Hôtel du guide ${data.pricing.guideHotel} €` : null,
  ].filter(Boolean).join(' · ')

  if (pelerin.email) {
    await sendEmail({
      category: 'RESERVATION_CONFIRMATION_PELERIN',
      retryable: true,
      idempotencyKey: `payment-confirmation:pelerin:${refNumber}:${pelerin.email.toLowerCase()}`,
      reference: { type: 'RESERVATION', id: refNumber },
      to: { email: pelerin.email, name: pelerinName },
      subject: `Réservation confirmée — ${refNumber}`,
      html: baseTemplate(`
        ${heading('Mabrouk ! Votre réservation est confirmée.')}
        ${badge('PAYÉE ET CONFIRMÉE', '#1D5C3A')}
        ${divider()}
        ${tableRows([
          ['Référence', refNumber],
          ['Séjour', `${dateFr(data.departDate)} au ${dateFr(data.returnDate)}`],
          ['Arrivée', arrivalLabel(data.arrivalPoint)],
          ['Ordre des villes', data.cityOrder.map(cityLabel).join(' → ')],
          ['Guides et missions', missionSummary],
          ['Voyageurs', String(data.nbPersonnes)],
          ['Profil / langue', `${data.gender} · ${data.langue}`],
          ['Lieux', placesSummary],
          ['Transport local', data.missions.map(mission => `${cityLabel(mission.city)} : ${transportLabel(mission, data)}`).join(' | ')],
          ['Transport du guide entre les villes', data.pricing.intercityTransport ? `${data.transportOption === 'TRAIN' ? 'Train A/R' : 'Voiture privée A/R'} — ${data.pricing.intercityTransport} €` : 'Non applicable'],
          ['Hébergement du guide', data.guideBedProvided ? 'Lit fourni par le client' : data.pricing.guideHotelNights ? `${data.pricing.guideHotelNights} nuit(s) — ${data.pricing.guideHotel} €` : 'Non applicable'],
          ['Détail du prix', priceSummary],
          ['Montant payé', `${amount.toLocaleString('fr-FR')} €`],
        ])}
        ${data.ihramAlert ? `<div style="background:#FEE2E2;border:1px solid #DC2626;border-radius:8px;padding:12px 16px;margin:18px 0;color:#991B1B;font-size:13px;font-weight:700">Attention : mettez votre Ihram dans l’avion ou rendez-vous au Miqat le plus proche avant la Omra.</div>` : ''}
        ${divider()}
        ${btn('Voir ma réservation et contacter mon guide', `${baseUrl}/espace/reservations`)}
      `),
    })
  }

  for (const guide of guides) {
    if (!guide.guideAccount?.email) continue
    const assignedMissions = data.missions.filter(mission => mission.guideProfileId === guide.id)
    if (assignedMissions.length === 0) continue
    const name = guideName(guide.id)
    await sendEmail({
      category: 'RESERVATION_CONFIRMATION_GUIDE',
      retryable: true,
      idempotencyKey: `payment-confirmation:guide:${refNumber}:${guide.id}`,
      reference: { type: 'RESERVATION', id: refNumber },
      to: { email: guide.guideAccount.email, name },
      subject: `[SAFARUMA] Nouvelle mission confirmée — ${refNumber}`,
      html: baseTemplate(`
        ${heading('Nouvelle mission payée et confirmée')}
        ${badge('MISSION CONFIRMÉE', '#1D5C3A')}
        ${p(`<strong>${escapeHtml(pelerinName)}</strong> a finalisé sa réservation.`)}
        ${divider()}
        ${tableRows([
          ['Référence', refNumber],
          ['Pèlerin', pelerinName],
          ['Voyageurs', String(data.nbPersonnes)],
          ['Profil / langue', `${data.gender} · ${data.langue}`],
          ['Mission(s)', assignedMissions.map(mission => `${cityLabel(mission.city)} · ${dateFr(mission.startDate)} au ${dateFr(mission.endDate)}`).join(' | ')],
          ['Lieux', assignedMissions.map(mission => `${cityLabel(mission.city)} : ${placeNames(mission.selectedPlaces)}`).join(' | ')],
          ['Transport local', assignedMissions.map(mission => `${cityLabel(mission.city)} : ${guideTransportLabel(mission, data)}`).join(' | ')],
          ['Retour entre les villes', data.sameGuideForBothCities ? `${data.transportOption === 'TRAIN' ? 'Train' : 'Voiture privée'} aller-retour` : 'Non applicable'],
          ['Hébergement hors ville principale', data.guideBedProvided ? 'Lit fourni par le client' : data.pricing.guideHotelNights ? `${data.pricing.guideHotelNights} nuit(s)` : 'Non applicable'],
        ])}
        ${data.ihramAlert ? `<div style="background:#FEE2E2;border:1px solid #DC2626;border-radius:8px;padding:12px 16px;margin:18px 0;color:#991B1B;font-size:13px;font-weight:700">Alerte Ihram active pour ce séjour.</div>` : ''}
        ${divider()}
        ${btn('Voir dans mon espace guide', `${baseUrl}/guide/missions`)}
      `),
    })
  }

  await sendEmail({
    category: 'RESERVATION_CONFIRMATION_ADMIN',
    retryable: true,
    idempotencyKey: `payment-confirmation:admin:${refNumber}`,
    reference: { type: 'RESERVATION', id: refNumber },
    to: { email: 'admin@safaruma.com', name: 'Admin SAFARUMA' },
    subject: `[Admin] Paiement reçu — ${refNumber} — ${amount} €`,
    html: baseTemplate(`
      ${heading('Réservation payée')}
      ${tableRows([
        ['Référence', refNumber],
        ['Pèlerin', pelerinName],
        ['Missions', missionSummary],
        ['Lieux', placesSummary],
        ['Voyageurs / langue / profil', `${data.nbPersonnes} · ${data.langue} · ${data.gender}`],
        ['Arrivée / ordre', `${arrivalLabel(data.arrivalPoint)} · ${data.cityOrder.map(cityLabel).join(' → ')}`],
        ['Transport local', data.missions.map(mission => `${cityLabel(mission.city)} : ${transportLabel(mission, data)}`).join(' | ')],
        ['Prix', priceSummary],
        ['Total Stripe', `${amount.toLocaleString('fr-FR')} €`],
        ['Alerte Ihram', data.ihramAlert ? 'Oui' : 'Non'],
      ])}
      ${divider()}
      ${btn("Voir dans l’administration", `${baseUrl}/admin/reservations`)}
    `),
  })
}

export async function POST(req: NextRequest) {
  const stripeKey = process.env.STRIPE_SECRET_KEY
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!stripeKey || !webhookSecret) {
    return NextResponse.json({ error: 'Non configuré' }, { status: 500 })
  }

  const stripe = new Stripe(stripeKey)
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')
  if (!signature) return NextResponse.json({ error: 'Signature manquante' }, { status: 400 })

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (error) {
    console.error('Webhook signature failed:', error)
    return NextResponse.json({ error: 'Signature invalide' }, { status: 400 })
  }

  if (event.type === 'checkout.session.expired') {
    const session = event.data.object as Stripe.Checkout.Session
    const refNumber = session.metadata?.refNumber
    if (refNumber && session.client_reference_id === refNumber) {
      const deleted = await prisma.reservationDraft.deleteMany({
        where: { refNumber, stripeSessionId: session.id },
      })
      if (deleted.count === 0) return NextResponse.json({ received: true })
      await recordAnalyticsEvent({
        eventName: 'payment_expired',
        sessionHash: session.metadata?.analyticsSessionHash || null,
        path: '/checkout.stripe.com',
        metadata: { refNumber },
      })
      await createAuditLog({
        actor: 'stripe', actorRole: 'SYSTEM', action: 'PAYMENT_SESSION_EXPIRED', target: refNumber,
      })
    }
    return NextResponse.json({ received: true })
  }

  if (event.type !== 'checkout.session.completed') {
    return NextResponse.json({ received: true })
  }

  const session = event.data.object as Stripe.Checkout.Session
  if (session.payment_status !== 'paid') {
    return NextResponse.json({ received: true })
  }
  const refNumber = session.metadata?.refNumber
  if (!refNumber) return NextResponse.json({ error: 'refNumber manquant' }, { status: 400 })
  if (session.mode !== 'payment' || session.currency?.toLowerCase() !== 'eur') {
    return NextResponse.json({ error: 'Paramètres de paiement incohérents' }, { status: 400 })
  }
  if (session.client_reference_id !== refNumber) {
    return NextResponse.json({ error: 'Référence Stripe incohérente' }, { status: 400 })
  }

  const existingReservation = await prisma.reservation.findUnique({ where: { refNumber } })
  if (existingReservation) return NextResponse.json({ received: true })

  const draft = await prisma.reservationDraft.findUnique({ where: { refNumber } })
  if (!draft) return NextResponse.json({ error: 'Draft non trouvé' }, { status: 404 })
  if (draft.stripeSessionId !== session.id) {
    return NextResponse.json({ error: 'Session Stripe incohérente' }, { status: 400 })
  }
  const data = JSON.parse(draft.data) as DraftData
  if (!Array.isArray(data.missions) || data.missions.length === 0) {
    return NextResponse.json({ error: 'Missions manquantes' }, { status: 400 })
  }

  const pelerinEmail = session.metadata?.pelerinEmail
  if (!pelerinEmail) return NextResponse.json({ error: 'Email pèlerin manquant' }, { status: 400 })
  if (session.metadata?.pelerinId !== draft.pelerinId) {
    return NextResponse.json({ error: 'Identité pèlerin incohérente' }, { status: 400 })
  }
  const pelerin = await prisma.user.findUnique({ where: { id: draft.pelerinId } })
  if (!pelerin) return NextResponse.json({ error: 'Pèlerin non trouvé' }, { status: 404 })
  if (pelerin.role !== 'PELERIN' || !pelerin.emailVerified || pelerin.email?.toLowerCase() !== pelerinEmail.toLowerCase()) {
    return NextResponse.json({ error: 'Compte pèlerin incohérent' }, { status: 400 })
  }

  const guideIds = [...new Set(data.missions.map(mission => mission.guideProfileId))]
  const guides = await prisma.guideProfile.findMany({
    where: { id: { in: guideIds } },
    include: { guideAccount: true, packages: true },
  })
  if (guides.length !== guideIds.length) {
    return NextResponse.json({ error: 'Guide introuvable' }, { status: 404 })
  }
  const primaryGuide = guides.find(guide => guide.slug === data.selectedGuideSlug) ?? guides[0]
  const basePackage = getPackageForCity(data.cityChoice)
  let pkg = primaryGuide.packages.find(item => item.name === basePackage.name)
  if (!pkg) {
    pkg = await prisma.package.create({
      data: {
        guideProfileId: primaryGuide.id,
        name: basePackage.name,
        durationDays: data.missions.reduce((sum, mission) => sum + mission.localTransportDays, 0),
        pricePerPerson: data.pricing.base,
        maxPeople: 32,
      },
    })
  }

  if (!Number.isInteger(session.amount_total) || (session.amount_total ?? 0) <= 0) {
    return NextResponse.json({ error: 'Montant Stripe manquant' }, { status: 400 })
  }
  const confirmedAmount = session.amount_total! / 100
  if (Math.abs(confirmedAmount - data.totalPrice) > 0.01) {
    console.error(`[SECURITY] Montant Stripe ${confirmedAmount}€ ≠ draft ${data.totalPrice}€ pour ${refNumber}`)
    return NextResponse.json({ error: 'Montant Stripe incohérent' }, { status: 400 })
  }

  // La réservation conserve le séjour choisi par le client. Les dates plus
  // courtes de chaque mission servent uniquement à bloquer le calendrier guide.
  const startDate = new Date(data.departDate)
  const endDate = new Date(data.returnDate)
  if (!Array.isArray(data.earnings) || data.earnings.length !== guideIds.length) {
    return NextResponse.json({ error: 'Rémunérations guides manquantes' }, { status: 400 })
  }
  const totalGuideNetCents = data.earnings.reduce((sum, earning) => sum + earning.totalNetCents, 0)
  const commission = Math.round(confirmedAmount * 100 - totalGuideNetCents) / 100
  if (commission < 0) {
    return NextResponse.json({ error: 'Rémunérations guides incohérentes' }, { status: 400 })
  }

  try {
    const reservationCreated = await prisma.$transaction(async tx => {
      const duplicate = await tx.reservation.findUnique({ where: { refNumber } })
      if (duplicate) return false

      const reservation = await tx.reservation.create({
        data: {
          refNumber,
          pelerinId: pelerin.id,
          guideProfileId: primaryGuide.id,
          packageId: pkg!.id,
          startDate,
          endDate,
          nbPeople: data.nbPersonnes,
          basePrice: confirmedAmount,
          commissionAmount: commission,
          totalPrice: confirmedAmount,
          status: 'CONFIRMED',
          selectedPlaces: data.selectedPlaces,
          selectedCities: data.cityChoice,
          withTransport: data.pricing.intercityTransport > 0,
          withCar: data.localTransportMakkah === 'CAR' || data.localTransportMadinah === 'CAR',
          gender: data.gender,
          langue: data.langue,
          arrivalPoint: data.arrivalPoint,
          cityOrder: data.cityOrder.join(','),
          guideBedProvided: data.guideBedProvided,
          ihramAlert: data.ihramAlert,
          pricingJson: data.pricing as unknown as Prisma.InputJsonValue,
          stripePaymentId: String(session.payment_intent ?? session.id),
          notes: `Payé via Stripe · Session: ${session.id}`,
          optionsJson: {
            guideSlugMadinah: data.selectedGuideSlugMadinah,
            transportOption: data.transportOption,
            packageName: data.packageName,
            sameGuideForBothCities: data.sameGuideForBothCities,
          },
          missions: {
            create: data.missions.map(mission => ({
              guideProfileId: mission.guideProfileId,
              city: mission.city,
              startDate: new Date(mission.startDate),
              endDate: new Date(mission.endDate),
              selectedPlaces: mission.selectedPlaces,
              localTransport: mission.localTransport,
              localTransportDays: mission.localTransportDays,
            })),
          },
        },
      })

      await tx.guideEarning.createMany({
        data: data.earnings.map(earning => ({
          reservationId: reservation.id,
          guideProfileId: earning.guideProfileId,
          serviceNetCents: earning.serviceNetCents,
          placesNetCents: earning.placesNetCents,
          transportNetCents: earning.transportNetCents,
          hotelNetCents: earning.hotelNetCents,
          totalNetCents: earning.totalNetCents,
          breakdown: earning.breakdown,
          status: 'UPCOMING',
        })),
      })

      for (const mission of data.missions) {
        for (const date of eachDate(new Date(mission.startDate), new Date(mission.endDate))) {
          const otherBooking = await tx.availability.findFirst({
            where: { guideProfileId: mission.guideProfileId, date, status: 'BOOKED' },
          })
          if (otherBooking && otherBooking.reservationId !== reservation.id) {
            throw new Error('GUIDE_ALREADY_BOOKED')
          }
          await tx.availability.upsert({
            where: {
              guideProfileId_date_city: {
                guideProfileId: mission.guideProfileId,
                date,
                city: mission.city,
              },
            },
            update: { status: 'BOOKED', reservationId: reservation.id },
            create: {
              guideProfileId: mission.guideProfileId,
              date,
              city: mission.city,
              status: 'BOOKED',
              reservationId: reservation.id,
            },
          })
        }
      }

      await tx.reservationDraft.delete({ where: { refNumber } })
      return true
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable })

    if (!reservationCreated) return NextResponse.json({ received: true })
  } catch (error) {
    console.error('[stripe/webhook transaction]', error)
    Sentry.captureException(error, { tags: { area: 'stripe-webhook-reservation' }, extra: { refNumber } })
    return NextResponse.json({ error: 'Création de réservation impossible' }, { status: 500 })
  }

  await createAuditLog({
    actor: pelerinEmail,
    actorRole: 'CLIENT',
    action: 'PAYMENT_CONFIRMED',
    target: refNumber,
    detail: JSON.stringify({ amount: confirmedAmount, cityChoice: data.cityChoice, missions: data.missions.length }),
  })

  await recordAnalyticsEvent({
    eventName: 'purchase',
    sessionHash: session.metadata?.analyticsSessionHash || null,
    userId: pelerin.id,
    path: '/checkout.stripe.com',
    metadata: {
      refNumber,
      cityChoice: data.cityChoice,
      amountCents: Math.round(confirmedAmount * 100),
    },
  })

  await sendConfirmationEmails({ refNumber, amount: confirmedAmount, data, pelerin, guides })
    .catch(error => {
      console.error('[stripe/webhook emails]', error)
      Sentry.captureException(error, { tags: { area: 'stripe-confirmation-email' }, extra: { refNumber } })
    })

  return NextResponse.json({ received: true })
}
