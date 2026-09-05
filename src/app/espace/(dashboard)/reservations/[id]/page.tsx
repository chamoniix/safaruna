import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  CircleAlert,
  CreditCard,
  MapPin,
  Users,
} from 'lucide-react'
import prisma from '@/lib/prisma'
import { PLACES } from '@/lib/places'
import { requirePelerin } from '@/lib/require-account'

export const dynamic = 'force-dynamic'

const STATUS: Record<string, { label: string; color: string; background: string }> = {
  PENDING: { label: 'En attente', color: '#B45309', background: '#FEF3C7' },
  CONFIRMED: { label: 'Confirmée', color: '#1D4ED8', background: '#DBEAFE' },
  COMPLETED: { label: 'Terminée', color: '#047857', background: '#D1FAE5' },
  CANCELLED: { label: 'Annulée', color: '#B91C1C', background: '#FEE2E2' },
}

function dateFr(value: Date) {
  return value.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

function cityLabel(value: string | null | undefined) {
  if (value === 'MAKKAH') return 'Makkah'
  if (value === 'MADINAH') return 'Médine'
  if (value === 'JEDDAH') return 'Aéroport de Jeddah'
  return value || 'Non renseigné'
}

function guideName(account: {
  displayName: string | null
  firstName: string | null
  lastName: string | null
} | null) {
  if (!account) return 'Guide SAFARUMA'
  return account.displayName
    || [account.firstName, account.lastName].filter(Boolean).join(' ')
    || 'Guide SAFARUMA'
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string')
    : []
}

function jsonRecord(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}
}

function numericValue(record: Record<string, unknown>, key: string) {
  return typeof record[key] === 'number' ? record[key] : 0
}

function placeNames(value: unknown) {
  const keys = stringArray(value)
  if (keys.length === 0) return 'Aucun lieu renseigné'
  return keys.map(key => PLACES.find(place => place.key === key)?.nameFr ?? key).join(', ')
}

function localTransportLabel(localTransport: string | null, days: number) {
  if (localTransport === 'TAXI') return 'Taxi public — courses du guide à régler sur place'
  if (localTransport === 'CAR') return `Voiture privée — ${days} jour${days > 1 ? 's' : ''}`
  return 'Sans transport local réservé'
}

function money(value: number, currency = 'EUR') {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(value)
}

const panel: React.CSSProperties = {
  background: 'white',
  border: '1px solid #E8DFC8',
  borderRadius: 16,
  boxShadow: '0 3px 14px rgba(26,18,9,.05)',
}

const sectionTitle: React.CSSProperties = {
  margin: 0,
  color: '#1A1209',
  fontSize: 18,
  fontWeight: 800,
}

export default async function ReservationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const access = await requirePelerin()

  if (!access.ok) {
    redirect(`/connexion?redirect=${encodeURIComponent(`/espace/reservations/${id}`)}`)
  }

  const reservation = await prisma.reservation.findFirst({
    where: { id, pelerinId: access.actor.id },
    select: {
      id: true,
      refNumber: true,
      startDate: true,
      endDate: true,
      nbPeople: true,
      transportOption: true,
      totalPrice: true,
      status: true,
      selectedCities: true,
      gender: true,
      langue: true,
      arrivalPoint: true,
      cityOrder: true,
      guideBedProvided: true,
      ihramAlert: true,
      optionsJson: true,
      pricingJson: true,
      stripePaymentId: true,
      createdAt: true,
      package: { select: { name: true, durationDays: true } },
      promoCode: { select: { code: true } },
      guideProfile: {
        select: {
          slug: true,
          guideAccount: {
            select: { displayName: true, firstName: true, lastName: true },
          },
        },
      },
      missions: {
        orderBy: { startDate: 'asc' },
        select: {
          id: true,
          city: true,
          startDate: true,
          endDate: true,
          selectedPlaces: true,
          localTransport: true,
          localTransportDays: true,
          guideConfirmationStatus: true,
          guideProfile: {
            select: {
              slug: true,
              guideAccount: {
                select: { displayName: true, firstName: true, lastName: true },
              },
            },
          },
        },
      },
      paymentAttempts: {
        where: { status: 'SUCCEEDED' },
        orderBy: { paidAt: 'desc' },
        take: 1,
        select: {
          provider: true,
          amountCents: true,
          currency: true,
          paidAt: true,
        },
      },
    },
  })

  if (!reservation) notFound()

  const status = STATUS[reservation.status] ?? {
    label: reservation.status,
    color: '#5A4E3A',
    background: '#F5F2EC',
  }
  const options = jsonRecord(reservation.optionsJson)
  const pricing = jsonRecord(reservation.pricingJson)
  const payment = reservation.paymentAttempts[0]
  const isPaid = Boolean(payment || reservation.stripePaymentId)
  const amount = payment ? payment.amountCents / 100 : reservation.totalPrice
  const currency = payment?.currency || 'EUR'
  const intercityTransport = numericValue(pricing, 'intercityTransport')
  const hotelNights = numericValue(pricing, 'guideHotelNights')
  const hotelPrice = numericValue(pricing, 'guideHotel')
  const transportOption = typeof options.transportOption === 'string'
    ? options.transportOption
    : reservation.transportOption || 'NONE'
  const sameGuideForBothCities = options.sameGuideForBothCities === true
  const cityOrder = reservation.cityOrder
    ? reservation.cityOrder.split(',').filter(Boolean).map(cityLabel).join(' → ')
    : reservation.missions.map(mission => cityLabel(mission.city)).join(' → ')
  const distinctGuides = [...new Map(
    (reservation.missions.length > 0
      ? reservation.missions.map(mission => mission.guideProfile)
      : [reservation.guideProfile]
    ).map(profile => [profile.slug || guideName(profile.guideAccount), profile]),
  ).values()]
  const priceLines = [
    ['Accompagnement', numericValue(pricing, 'base')],
    ['Visites', numericValue(pricing, 'places')],
    ['Transport du guide entre les villes', intercityTransport],
    ['Transport local à Makkah', numericValue(pricing, 'localTransportMakkah')],
    ['Transport local à Médine', numericValue(pricing, 'localTransportMadinah')],
    ['Hébergement du guide', hotelPrice],
  ].filter(([, value]) => Number(value) > 0) as Array<[string, number]>
  const promoDiscount = numericValue(pricing, 'promoDiscount')

  return (
    <div style={{ display: 'grid', gap: 18, fontFamily: 'var(--font-manrope, sans-serif)' }}>
      <Link
        href="/espace/reservations"
        style={{ display: 'inline-flex', alignItems: 'center', gap: 7, width: 'fit-content', color: '#7A6D5A', fontSize: 13, fontWeight: 700, textDecoration: 'none' }}
      >
        <ArrowLeft size={16} /> Mes réservations
      </Link>

      <section style={{ ...panel, padding: 22 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <div style={{ color: '#8B6914', fontSize: 11, fontWeight: 800, letterSpacing: '.12em', textTransform: 'uppercase' }}>Détail de la réservation</div>
            <h1 style={{ margin: '7px 0 4px', color: '#1A1209', fontSize: 28 }}>{reservation.refNumber}</h1>
            <div style={{ color: '#7A6D5A', fontSize: 13 }}>Créée le {dateFr(reservation.createdAt)}</div>
          </div>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '8px 12px', borderRadius: 999, background: status.background, color: status.color, fontSize: 12, fontWeight: 800 }}>
            {reservation.status === 'CONFIRMED' || reservation.status === 'COMPLETED'
              ? <CheckCircle2 size={15} />
              : <CircleAlert size={15} />}
            {status.label}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginTop: 22 }}>
          <div style={{ padding: 14, borderRadius: 12, background: '#FAF7F0' }}>
            <CalendarDays size={18} color="#C9A84C" />
            <div style={{ color: '#7A6D5A', fontSize: 11, fontWeight: 700, marginTop: 8 }}>SÉJOUR</div>
            <div style={{ color: '#1A1209', fontSize: 13, fontWeight: 700, marginTop: 4 }}>{dateFr(reservation.startDate)} au {dateFr(reservation.endDate)}</div>
          </div>
          <div style={{ padding: 14, borderRadius: 12, background: '#FAF7F0' }}>
            <MapPin size={18} color="#C9A84C" />
            <div style={{ color: '#7A6D5A', fontSize: 11, fontWeight: 700, marginTop: 8 }}>PARCOURS</div>
            <div style={{ color: '#1A1209', fontSize: 13, fontWeight: 700, marginTop: 4 }}>{cityOrder || cityLabel(reservation.selectedCities)}</div>
          </div>
          <div style={{ padding: 14, borderRadius: 12, background: '#FAF7F0' }}>
            <Users size={18} color="#C9A84C" />
            <div style={{ color: '#7A6D5A', fontSize: 11, fontWeight: 700, marginTop: 8 }}>VOYAGEURS</div>
            <div style={{ color: '#1A1209', fontSize: 13, fontWeight: 700, marginTop: 4 }}>{reservation.nbPeople} personne{reservation.nbPeople > 1 ? 's' : ''} · {reservation.langue || 'Langue non renseignée'}</div>
          </div>
          <div style={{ padding: 14, borderRadius: 12, background: '#FAF7F0' }}>
            <CreditCard size={18} color="#C9A84C" />
            <div style={{ color: '#7A6D5A', fontSize: 11, fontWeight: 700, marginTop: 8 }}>{isPaid ? 'MONTANT PAYÉ' : 'MONTANT'}</div>
            <div style={{ color: '#1A1209', fontSize: 17, fontWeight: 800, marginTop: 4 }}>{money(amount, currency)}</div>
          </div>
        </div>
      </section>

      {reservation.ihramAlert && (
        <div style={{ padding: 14, borderRadius: 12, background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#991B1B', fontSize: 13, fontWeight: 800 }}>
          Attention : mettez votre Ihram dans l’avion ou rendez-vous au Miqat le plus proche avant la Omra.
        </div>
      )}

      <section style={{ ...panel, padding: 22 }}>
        <h2 style={sectionTitle}>Guides et missions</h2>
        <div style={{ display: 'grid', gap: 12, marginTop: 16 }}>
          {reservation.missions.map(mission => (
            <article key={mission.id} style={{ padding: 16, borderRadius: 12, border: '1px solid #EFE8DA', background: '#FDFBF7' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                <div>
                  <div style={{ color: '#8B6914', fontSize: 11, fontWeight: 800, letterSpacing: '.08em' }}>{cityLabel(mission.city).toUpperCase()}</div>
                  <div style={{ color: '#1A1209', fontSize: 17, fontWeight: 800, marginTop: 4 }}>{guideName(mission.guideProfile.guideAccount)}</div>
                </div>
                <div style={{ color: '#5A4E3A', fontSize: 12, fontWeight: 700 }}>{dateFr(mission.startDate)} au {dateFr(mission.endDate)}</div>
              </div>
              <dl style={{ display: 'grid', gap: 9, margin: '14px 0 0', color: '#4A3F30', fontSize: 13 }}>
                <div><dt style={{ color: '#7A6D5A', fontWeight: 700 }}>Lieux</dt><dd style={{ margin: '3px 0 0' }}>{placeNames(mission.selectedPlaces)}</dd></div>
                <div><dt style={{ color: '#7A6D5A', fontWeight: 700 }}>Transport local</dt><dd style={{ margin: '3px 0 0' }}>{localTransportLabel(mission.localTransport, mission.localTransportDays)}</dd></div>
                <div><dt style={{ color: '#7A6D5A', fontWeight: 700 }}>Validation du Guide</dt><dd style={{ margin: '3px 0 0' }}>{mission.guideConfirmationStatus === 'CONFIRMED' ? 'Confirmée' : mission.guideConfirmationStatus === 'DECLINED' ? 'Refusée' : mission.guideConfirmationStatus === 'NO_RESPONSE' ? 'Sans réponse' : 'En attente'}</dd></div>
              </dl>
            </article>
          ))}
          {reservation.missions.length === 0 && (
            <div style={{ color: '#7A6D5A', fontSize: 13 }}>
              Guide : {guideName(reservation.guideProfile.guideAccount)}
            </div>
          )}
        </div>
        {distinctGuides.some(guide => guide.slug) && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 14 }}>
            {distinctGuides.filter(guide => guide.slug).map(guide => (
              <Link key={guide.slug} href={`/guides/${guide.slug}`} style={{ color: '#8B6914', fontSize: 12, fontWeight: 800 }}>
                Voir le profil de {guideName(guide.guideAccount)}
              </Link>
            ))}
          </div>
        )}
      </section>

      <section style={{ ...panel, padding: 22 }}>
        <h2 style={sectionTitle}>Informations du séjour</h2>
        <dl style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, margin: '16px 0 0' }}>
          <div><dt style={{ color: '#7A6D5A', fontSize: 12, fontWeight: 700 }}>Formule</dt><dd style={{ margin: '4px 0 0', color: '#1A1209', fontSize: 14, fontWeight: 700 }}>{reservation.package.name} · {reservation.package.durationDays} jour{reservation.package.durationDays > 1 ? 's' : ''}</dd></div>
          <div><dt style={{ color: '#7A6D5A', fontSize: 12, fontWeight: 700 }}>Point d’arrivée</dt><dd style={{ margin: '4px 0 0', color: '#1A1209', fontSize: 14, fontWeight: 700 }}>{cityLabel(reservation.arrivalPoint)}</dd></div>
          <div><dt style={{ color: '#7A6D5A', fontSize: 12, fontWeight: 700 }}>Profil demandé</dt><dd style={{ margin: '4px 0 0', color: '#1A1209', fontSize: 14, fontWeight: 700 }}>{reservation.gender || 'Non renseigné'}</dd></div>
          <div><dt style={{ color: '#7A6D5A', fontSize: 12, fontWeight: 700 }}>Transport entre les villes</dt><dd style={{ margin: '4px 0 0', color: '#1A1209', fontSize: 14, fontWeight: 700 }}>{sameGuideForBothCities && intercityTransport > 0 ? `${transportOption === 'TRAIN' ? 'Train A/R du Guide' : 'Voiture privée A/R du Guide'} · ${money(intercityTransport)}` : 'Non applicable'}</dd></div>
          <div><dt style={{ color: '#7A6D5A', fontSize: 12, fontWeight: 700 }}>Hébergement du Guide</dt><dd style={{ margin: '4px 0 0', color: '#1A1209', fontSize: 14, fontWeight: 700 }}>{reservation.guideBedProvided ? 'Lit fourni par le Pèlerin' : hotelNights > 0 ? `${hotelNights} nuit${hotelNights > 1 ? 's' : ''} · ${money(hotelPrice)}` : 'Non applicable'}</dd></div>
        </dl>
      </section>

      <section style={{ ...panel, padding: 22 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 14, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div>
            <h2 style={sectionTitle}>Paiement</h2>
            <div style={{ color: isPaid ? '#047857' : '#B45309', fontSize: 13, fontWeight: 800, marginTop: 7 }}>{isPaid ? 'Payé et enregistré' : 'En attente de paiement'}</div>
            {payment?.provider && <div style={{ color: '#7A6D5A', fontSize: 12, marginTop: 3 }}>Via {payment.provider === 'REVOLUT' ? 'Revolut' : payment.provider}{payment.paidAt ? ` · ${dateFr(payment.paidAt)}` : ''}</div>}
          </div>
          <div style={{ color: '#1A1209', fontSize: 25, fontWeight: 900 }}>{money(amount, currency)}</div>
        </div>

        {priceLines.length > 0 && (
          <div style={{ display: 'grid', gap: 8, marginTop: 18, paddingTop: 16, borderTop: '1px solid #EFE8DA' }}>
            {priceLines.map(([label, value]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, color: '#5A4E3A', fontSize: 13 }}><span>{label}</span><strong>{money(value)}</strong></div>
            ))}
            {promoDiscount > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, color: '#047857', fontSize: 13 }}><span>Code promotionnel{reservation.promoCode?.code ? ` · ${reservation.promoCode.code}` : ''}</span><strong>−{money(promoDiscount)}</strong></div>}
          </div>
        )}
      </section>
    </div>
  )
}
