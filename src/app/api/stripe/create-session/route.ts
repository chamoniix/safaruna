import Stripe from 'stripe'
import * as Sentry from '@sentry/nextjs'
import { Prisma } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { apiRatelimit, checkRateLimit } from '@/lib/ratelimit'
import { getPackageForCity, type CityChoice } from '@/lib/packages'
import { PLACES } from '@/lib/places'
import {
  calculateBookingTransportPrice,
  calculateLocalCarDays,
} from '@/lib/booking-pricing'
import {
  centsToEuros,
  guideServiceNetCents,
  guideServiceRetailCents,
  placeNetCents,
  placeRetailCents,
} from '@/lib/guide-pricing'
import {
  analyticsCountry,
  analyticsDevice,
  hashAnalyticsSession,
  recordAnalyticsEvent,
} from '@/lib/analytics'
import { requirePelerin } from '@/lib/require-account'

// Stripe exige une expiration située au moins 30 minutes après la création de
// la session. Une minute technique couvre le temps de transaction et réseau.
const HOLD_DURATION_MS = 31 * 60 * 1000
const ALLOWED_GENDERS = ['HOMME', 'FEMME', 'MIXTE'] as const

const checkoutSchema = z.object({
  guideSlug: z.string().min(1).max(120),
  cityChoice: z.enum(['MAKKAH', 'MADINAH', 'BOTH']),
  departDate: z.coerce.date(),
  returnDate: z.coerce.date(),
  nbPersonnes: z.coerce.number().int().min(1).max(32),
  gender: z.enum(ALLOWED_GENDERS),
  langue: z.string().min(1).max(20),
  selectedPlaces: z.array(z.string().max(100)).max(100).default([]),
  transportOption: z.enum(['NONE', 'TRAIN', 'TAXI_RT', 'TAXI_ONE']),
  taxiDirection: z.enum(['MAKKAH', 'MADINAH']).nullable().optional(),
  localTransportMakkah: z.enum(['NONE', 'TAXI', 'CAR']),
  localTransportMadinah: z.enum(['NONE', 'TAXI', 'CAR']),
  totalPrice: z.coerce.number().positive(),
  packageName: z.string().min(1).max(200),
  selectedGuideSlug: z.string().min(1).max(120).nullable().optional(),
  selectedGuideSlugMadinah: z.string().min(1).max(120).nullable().optional(),
  arrivalPoint: z.enum(['JEDDAH', 'MADINAH', 'MAKKAH']),
  guideBedProvided: z.boolean().default(false),
  analyticsSessionId: z.string().min(20).max(100).nullable().optional(),
})

type MissionCity = 'MAKKAH' | 'MADINAH'

function toBookingDate(value: Date): Date {
  return new Date(`${value.toISOString().slice(0, 10)}T12:00:00.000Z`)
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setUTCDate(result.getUTCDate() + days)
  return result
}

function eachDate(start: Date, end: Date): Date[] {
  const dates: Date[] = []
  for (let current = new Date(start); current <= end; current = addDays(current, 1)) {
    dates.push(current)
  }
  return dates
}

function placeCity(key: string): MissionCity | null {
  const place = PLACES.find(item => item.key === key)
  if (!place) return null
  if (place.category === 'MAKKAH' || key === 'hunayn') return 'MAKKAH'
  return 'MADINAH'
}

function servesCity(
  guide: { servesMakkah: boolean; servesMadinah: boolean },
  city: MissionCity
): boolean {
  return city === 'MAKKAH' ? guide.servesMakkah : guide.servesMadinah
}

function primaryCity(city: string | null): MissionCity | null {
  const normalized = city?.trim().toUpperCase() ?? ''
  if (normalized.includes('MAKKAH') || normalized.includes('MECQUE')) return 'MAKKAH'
  if (normalized.includes('MADINAH') || normalized.includes('MEDINE') || normalized.includes('MÉDINE')) return 'MADINAH'
  return null
}

export async function POST(req: NextRequest) {
  const limited = await checkRateLimit(req, apiRatelimit)
  if (limited) return limited

  const stripeKey = process.env.STRIPE_SECRET_KEY
  if (!stripeKey) {
    return NextResponse.json({ error: 'Stripe non configuré' }, { status: 500 })
  }

  const access = await requirePelerin()
  if (!access.ok) return access.response

  const parsed = checkoutSchema.safeParse(await req.json())
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Paramètres de réservation invalides' },
      { status: 400 }
    )
  }

  const body = parsed.data
  const cityChoice = body.cityChoice as CityChoice
  const startDate = toBookingDate(body.departDate)
  const requestedEndDate = toBookingDate(body.returnDate)
  const today = toBookingDate(new Date())
  if (startDate < today || requestedEndDate < startDate) {
    return NextResponse.json({ error: 'Dates de séjour invalides' }, { status: 400 })
  }

  const basePackage = getPackageForCity(cityChoice)
  if (body.packageName.trim() !== basePackage.name) {
    return NextResponse.json({ error: 'Accompagnement invalide' }, { status: 400 })
  }

  const knownPlaceKeys = new Set(PLACES.map(place => place.key))
  const selectedPlaceKeys = [...new Set(body.selectedPlaces)]
  if (selectedPlaceKeys.some(key => !knownPlaceKeys.has(key))) {
    return NextResponse.json({ error: 'Un lieu sélectionné est invalide' }, { status: 400 })
  }

  const makkahGuideSlug = body.selectedGuideSlug || body.guideSlug
  const madinahGuideSlug = cityChoice === 'BOTH'
    ? body.selectedGuideSlugMadinah
    : cityChoice === 'MADINAH'
      ? makkahGuideSlug
      : null
  if (!makkahGuideSlug || (cityChoice === 'BOTH' && !madinahGuideSlug)) {
    return NextResponse.json({ error: 'Guide manquant pour une ville' }, { status: 400 })
  }

  const guideSlugs = [...new Set([makkahGuideSlug, madinahGuideSlug].filter(Boolean) as string[])]
  const guides = await prisma.guideProfile.findMany({
    where: { slug: { in: guideSlugs } },
    include: {
      languages: { select: { languageCode: true } },
      places: { where: { isActive: true }, select: { placeKey: true } },
    },
  })
  const guideBySlug = new Map(guides.map(guide => [guide.slug!, guide]))
  const makkahGuide = guideBySlug.get(makkahGuideSlug)
  const madinahGuide = madinahGuideSlug ? guideBySlug.get(madinahGuideSlug) : null

  const missionGuides: Array<{ city: MissionCity; guide: NonNullable<typeof makkahGuide> }> = []
  if (cityChoice !== 'MADINAH') {
    if (!makkahGuide) return NextResponse.json({ error: 'Guide Makkah introuvable' }, { status: 400 })
    missionGuides.push({ city: 'MAKKAH', guide: makkahGuide })
  }
  if (cityChoice !== 'MAKKAH') {
    const guideForMadinah = cityChoice === 'MADINAH' ? makkahGuide : madinahGuide
    if (!guideForMadinah) return NextResponse.json({ error: 'Guide Médine introuvable' }, { status: 400 })
    missionGuides.push({ city: 'MADINAH', guide: guideForMadinah })
  }

  for (const { city, guide } of missionGuides) {
    if (guide.status !== 'ACTIVE' || !guide.acceptingBookings || !servesCity(guide, city)) {
      return NextResponse.json({ error: `Ce guide ne propose pas actuellement ${city === 'MAKKAH' ? 'Makkah' : 'Médine'}` }, { status: 409 })
    }
    if (!guide.languages.some(language => language.languageCode === body.langue)) {
      return NextResponse.json({ error: 'Le guide sélectionné ne propose pas la langue demandée' }, { status: 409 })
    }
    if (body.gender !== 'MIXTE' && guide.gender !== body.gender) {
      return NextResponse.json({ error: 'Le profil du guide ne correspond pas au genre demandé' }, { status: 409 })
    }
    const activePlaceKeys = new Set(guide.places.map(place => place.placeKey))
    const selectedForCity = selectedPlaceKeys.filter(key => placeCity(key) === city)
    if (activePlaceKeys.size > 0 && selectedForCity.some(key => !activePlaceKeys.has(key))) {
      return NextResponse.json({ error: 'Une visite sélectionnée n’est pas proposée par ce guide' }, { status: 409 })
    }
  }

  const sameGuideForBothCities = cityChoice === 'BOTH' && makkahGuideSlug === madinahGuideSlug
  const sameGuidePrimaryCity = sameGuideForBothCities ? primaryCity(makkahGuide!.city) : null
  if (sameGuideForBothCities && !sameGuidePrimaryCity) {
    return NextResponse.json({ error: 'La ville principale du guide doit être renseignée' }, { status: 409 })
  }
  if (sameGuideForBothCities && !['TRAIN', 'TAXI_RT'].includes(body.transportOption)) {
    return NextResponse.json({ error: 'Le transport aller-retour du guide est obligatoire' }, { status: 400 })
  }
  if (!sameGuideForBothCities && body.transportOption !== 'NONE') {
    return NextResponse.json({ error: 'Le transport du guide ne s’applique que si le même guide accompagne les deux villes' }, { status: 400 })
  }

  const allVisitPlaces = [...new Set([...basePackage.includedPlaces, ...selectedPlaceKeys])]
  const makkahDays = cityChoice === 'MADINAH' ? 0 : calculateLocalCarDays(allVisitPlaces, 'MAKKAH')
  const madinahDays = cityChoice === 'MAKKAH' ? 0 : calculateLocalCarDays(allVisitPlaces, 'MADINAH')
  const cityOrder: MissionCity[] = cityChoice === 'BOTH'
    ? body.arrivalPoint === 'MAKKAH' ? ['MAKKAH', 'MADINAH'] : ['MADINAH', 'MAKKAH']
    : [cityChoice]
  const ihramAlert = cityChoice !== 'MADINAH' && (
    body.arrivalPoint === 'MAKKAH' ||
    (body.arrivalPoint === 'JEDDAH' && cityChoice === 'MAKKAH')
  )

  let missionStart = startDate
  const missions = cityOrder.map(city => {
    const durationDays = city === 'MAKKAH' ? makkahDays : madinahDays
    const missionEnd = addDays(missionStart, durationDays - 1)
    const guide = city === 'MAKKAH' ? makkahGuide! : (cityChoice === 'MADINAH' ? makkahGuide! : madinahGuide!)
    const mission = {
      city,
      guideProfileId: guide.id,
      guideSlug: guide.slug!,
      startDate: missionStart,
      endDate: missionEnd,
      dates: eachDate(missionStart, missionEnd),
      selectedPlaces: allVisitPlaces.filter(key => placeCity(key) === city),
      localTransport: city === 'MAKKAH' ? body.localTransportMakkah : body.localTransportMadinah,
      localTransportDays: durationDays,
    }
    missionStart = addDays(missionEnd, 1)
    return mission
  })
  const missionEndDate = missions.at(-1)!.endDate
  if (missionEndDate > requestedEndDate) {
    return NextResponse.json({ error: 'La durée du séjour est trop courte pour les visites sélectionnées' }, { status: 409 })
  }

  const extraPlaceKeys = selectedPlaceKeys.filter(key => !basePackage.includedPlaces.includes(key))
  const extraPlacesRetailCents = extraPlaceKeys.length * placeRetailCents(body.nbPersonnes)

  const transportPricing = calculateBookingTransportPrice({
    cityChoice,
    nbPeople: body.nbPersonnes,
    selectedPlaces: allVisitPlaces,
    transportOption: body.transportOption,
    localTransportMakkah: body.localTransportMakkah,
    localTransportMadinah: body.localTransportMadinah,
    sameGuideForBothCities,
    sameGuidePrimaryCity,
    guideBedProvided: body.guideBedProvided,
  })
  type EarningDraft = {
    guideProfileId: string
    serviceNetCents: number
    placesNetCents: number
    transportNetCents: number
    hotelNetCents: number
    totalNetCents: number
    breakdown: {
      missions: Array<{
        city: MissionCity
        serviceNetCents: number
        extraPlaceCount: number
        placesNetCents: number
        localTransportNetCents: number
      }>
      intercityNetCents: number
      hotelNetCents: number
    }
  }

  const earningByGuide = new Map<string, EarningDraft>()
  let guideServicesRetailCents = 0
  for (const mission of missions) {
    const missionGuide = guides.find(item => item.id === mission.guideProfileId)!
    const serviceNetCents = guideServiceNetCents(missionGuide, mission.city, body.nbPersonnes)
    guideServicesRetailCents += guideServiceRetailCents(missionGuide, mission.city, body.nbPersonnes)
    const missionExtraPlaces = mission.selectedPlaces.filter(key => extraPlaceKeys.includes(key))
    const placesNetTotalCents = missionExtraPlaces.length * placeNetCents(body.nbPersonnes)
    const localTransportNetCents = Math.round((mission.city === 'MAKKAH'
      ? transportPricing.localCarNetMakkah
      : transportPricing.localCarNetMadinah) * 100)
    const earning = earningByGuide.get(mission.guideProfileId) ?? {
      guideProfileId: mission.guideProfileId,
      serviceNetCents: 0,
      placesNetCents: 0,
      transportNetCents: 0,
      hotelNetCents: 0,
      totalNetCents: 0,
      breakdown: { missions: [], intercityNetCents: 0, hotelNetCents: 0 },
    }
    earning.serviceNetCents += serviceNetCents
    earning.placesNetCents += placesNetTotalCents
    earning.transportNetCents += localTransportNetCents
    earning.breakdown.missions.push({
      city: mission.city,
      serviceNetCents,
      extraPlaceCount: missionExtraPlaces.length,
      placesNetCents: placesNetTotalCents,
      localTransportNetCents,
    })
    earningByGuide.set(mission.guideProfileId, earning)
  }

  if (sameGuideForBothCities) {
    const earning = earningByGuide.get(makkahGuide!.id)!
    const intercityNetCents = Math.round(transportPricing.intercityNet * 100)
    const hotelNetCents = Math.round(transportPricing.guideHotelNet * 100)
    earning.transportNetCents += intercityNetCents
    earning.hotelNetCents += hotelNetCents
    earning.breakdown.intercityNetCents = intercityNetCents
    earning.breakdown.hotelNetCents = hotelNetCents
  }

  const earningDrafts = [...earningByGuide.values()].map(earning => ({
    ...earning,
    totalNetCents: earning.serviceNetCents + earning.placesNetCents +
      earning.transportNetCents + earning.hotelNetCents,
  }))
  const expectedPriceCents = guideServicesRetailCents + extraPlacesRetailCents + Math.round((
    transportPricing.intercity + transportPricing.localCar + transportPricing.guideHotel
  ) * 100)
  const expectedPrice = centsToEuros(expectedPriceCents)
  if (Math.abs(body.totalPrice - expectedPrice) > 0.01) {
    console.error(`[SECURITY] Prix client ${body.totalPrice}€ ≠ prix serveur ${expectedPrice}€`)
    return NextResponse.json({ error: 'Le prix a été actualisé. Vérifiez le récapitulatif.' }, { status: 409 })
  }

  const refNumber = 'SAF-' + Date.now().toString(36).toUpperCase() +
    Math.random().toString(36).slice(2, 5).toUpperCase()
  const expiresAt = new Date(Date.now() + HOLD_DURATION_MS)
  const analyticsSessionHash = hashAnalyticsSession(body.analyticsSessionId)
  const normalizedBody = {
    ...body,
    selectedPlaces: selectedPlaceKeys,
    allVisitPlaces,
    totalPrice: expectedPrice,
    selectedGuideSlug: makkahGuideSlug,
    selectedGuideSlugMadinah: madinahGuideSlug,
    sameGuideForBothCities,
    cityOrder,
    ihramAlert,
    analyticsSessionHash,
    missions: missions.map(mission => ({ ...mission, dates: undefined })),
    pricing: {
      base: centsToEuros(guideServicesRetailCents),
      places: centsToEuros(extraPlacesRetailCents),
      intercityTransport: transportPricing.intercity,
      localTransportMakkah: transportPricing.localCarMakkah,
      localTransportMadinah: transportPricing.localCarMadinah,
      localTransportDaysMakkah: transportPricing.makkahDays,
      localTransportDaysMadinah: transportPricing.madinahDays,
      localVehicle: transportPricing.localVehicle,
      guideHotelNights: transportPricing.guideHotelNights,
      guideHotel: transportPricing.guideHotel,
      total: expectedPrice,
    },
    earnings: earningDrafts,
  }

  try {
    await prisma.$transaction(async tx => {
      await tx.reservationDraft.deleteMany({ where: { expiresAt: { lte: new Date() } } })

      for (const mission of missions) {
        const conflict = await tx.availability.findFirst({
          where: {
            guideProfileId: mission.guideProfileId,
            date: { in: mission.dates },
            OR: [
              { status: 'BOOKED' },
              { status: 'UNAVAILABLE', city: { in: [mission.city, 'BOTH'] } },
            ],
          },
        })
        if (conflict) throw new Error('GUIDE_UNAVAILABLE')
      }

      await tx.reservationDraft.create({
        data: {
          refNumber,
          pelerinId: access.actor.id,
          data: JSON.stringify(normalizedBody),
          expiresAt,
          holds: {
            create: missions.flatMap(mission => mission.dates.map(date => ({
              guideProfileId: mission.guideProfileId,
              city: mission.city,
              date,
              expiresAt,
            }))),
          },
        },
      })
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable })
  } catch (error) {
    if (error instanceof Error && error.message === 'GUIDE_UNAVAILABLE') {
      return NextResponse.json({ error: 'Ce guide n’est plus disponible sur les dates choisies' }, { status: 409 })
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json({ error: 'Ces dates viennent d’être réservées. Choisissez d’autres dates.' }, { status: 409 })
    }
    console.error('[stripe/create-session hold]', error)
    Sentry.captureException(error, { tags: { area: 'checkout-hold' } })
    return NextResponse.json({ error: 'Impossible de bloquer ces disponibilités' }, { status: 500 })
  }

  try {
    const stripe = new Stripe(stripeKey)
    const destLabel = cityChoice === 'BOTH' ? 'Makkah + Médine' : cityChoice === 'MAKKAH' ? 'Makkah' : 'Médine'
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || new URL(req.url).origin
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'payment',
      client_reference_id: refNumber,
      line_items: [{
        price_data: {
          currency: 'eur',
          product_data: {
            name: `SAFARUMA — ${basePackage.name}`,
            description: `Accompagnement · ${destLabel} · ${body.nbPersonnes} personne(s)`,
            images: ['https://safaruma.com/og-image.jpg'],
          },
          unit_amount: Math.round(expectedPrice * 100),
        },
        quantity: 1,
      }],
      metadata: {
        refNumber,
        guideSlug: makkahGuideSlug,
        guideSlugMadinah: madinahGuideSlug || '',
        pelerinEmail: access.actor.email,
        pelerinId: access.actor.id,
        analyticsSessionHash: analyticsSessionHash || '',
      },
      success_url: `${baseUrl}/espace/checkout/${body.guideSlug}/confirmation?ref=${refNumber}&payment=success`,
      cancel_url: `${baseUrl}/espace/checkout/${body.guideSlug}?cancelled=1`,
      customer_email: access.actor.email,
      expires_at: Math.floor(expiresAt.getTime() / 1000),
    })

    await prisma.reservationDraft.update({
      where: { refNumber },
      data: { stripeSessionId: checkoutSession.id },
    })
    await recordAnalyticsEvent({
      eventName: 'checkout_created',
      sessionHash: analyticsSessionHash,
      userId: access.actor.id,
      path: `/espace/checkout/${body.guideSlug}`,
      country: analyticsCountry(req.headers.get('x-vercel-ip-country')),
      device: analyticsDevice(req.headers.get('user-agent')),
      metadata: {
        refNumber,
        guideSlug: makkahGuideSlug,
        cityChoice,
        amountCents: Math.round(expectedPrice * 100),
      },
    })
    return NextResponse.json({ sessionUrl: checkoutSession.url, refNumber })
  } catch (error) {
    await prisma.reservationDraft.deleteMany({ where: { refNumber } })
    console.error('[stripe/create-session Stripe]', error)
    Sentry.captureException(error, { tags: { area: 'stripe-session-create' } })
    return NextResponse.json({ error: 'Erreur lors de la préparation du paiement' }, { status: 500 })
  }
}
