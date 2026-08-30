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
import { PLACES } from '@/lib/places'
import type { DraftMission, PaymentDraftData } from '@/lib/payments/types'

function dateFr(value: Date | string): string {
  return new Date(value).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
  })
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

function transportLabel(mission: DraftMission, data: PaymentDraftData): string {
  if (mission.localTransport === 'TAXI') {
    return 'Taxi public — les courses du guide pendant les visites sont à votre charge sur place'
  }
  if (mission.localTransport === 'CAR') {
    return `${data.pricing.localVehicle.label} — ${mission.localTransportDays} jour(s) à ${data.pricing.localVehicle.dailyRate} €/jour`
  }
  return 'Sans transport local réservé'
}

function guideTransportLabel(mission: DraftMission, data: PaymentDraftData): string {
  if (mission.localTransport === 'TAXI') {
    return 'Taxi public — vos courses pendant les visites sont prises en charge sur place par le client'
  }
  if (mission.localTransport === 'CAR') {
    return `${data.pricing.localVehicle.label} — ${mission.localTransportDays} jour(s)`
  }
  return 'Sans transport local réservé'
}

export async function sendPaymentConfirmationEmails(opts: {
  refNumber: string
  amount: number
  data: PaymentDraftData
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
      subject: `[SAFARUMA] Nouvelle réservation à confirmer — ${refNumber}`,
      html: baseTemplate(`
        ${heading('Nouvelle réservation à confirmer')}
        ${badge('ACTION REQUISE', '#D97706')}
        ${p(`<strong>${escapeHtml(pelerinName)}</strong> a finalisé et payé sa réservation. Confirmez maintenant votre disponibilité dans votre espace Guide.`)}
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
        ${btn('Confirmer la réservation', `${baseUrl}/guide/demandes?reservation=${encodeURIComponent(refNumber)}`)}
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
        ['Total payé', `${amount.toLocaleString('fr-FR')} €`],
        ['Alerte Ihram', data.ihramAlert ? 'Oui' : 'Non'],
      ])}
      ${divider()}
      ${btn("Voir dans l’administration", `${baseUrl}/admin/reservations`)}
    `),
  })
}
