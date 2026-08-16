import Stripe from 'stripe'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { apiRatelimit, checkRateLimit } from '@/lib/ratelimit'
import { BASE_PACKAGES, type CityChoice } from '@/lib/packages'
import {
  BOOKING_PRICES,
  calculateBookingTransportPrice,
  isLocalTransportOption,
  isTransportOption,
} from '@/lib/booking-pricing'

export async function POST(req: NextRequest) {
  const limited = await checkRateLimit(req, apiRatelimit)
  if (limited) return limited

  const stripeKey = process.env.STRIPE_SECRET_KEY
  if (!stripeKey)
    return NextResponse.json({ error: 'Stripe non configuré' }, { status: 500 })
  const stripe = new Stripe(stripeKey, { apiVersion: '2024-06-20' as any })

  const userSession = await getServerSession(authOptions)
  if (!userSession?.user)
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const body = await req.json()
  const {
    guideSlug,
    cityChoice,
    nbPersonnes,
    totalPrice,
    packageName,
    selectedGuideSlug,
    selectedGuideSlugMadinah,
    selectedPlaces,
    transportOption,
    taxiDirection,
    localTransportMakkah,
    localTransportMadinah,
  } = body

  const clientTotal = Number(totalPrice)
  if (!Number.isFinite(clientTotal) || clientTotal <= 0)
    return NextResponse.json({ error: 'Montant invalide' }, { status: 400 })

  const nbP = Number(nbPersonnes)
  if (!Number.isInteger(nbP) || nbP < 1 || nbP > 20)
    return NextResponse.json({ error: 'Nombre de personnes invalide' }, { status: 400 })

  if (!['MAKKAH', 'MADINAH', 'BOTH'].includes(cityChoice))
    return NextResponse.json({ error: 'Destination invalide' }, { status: 400 })
  if (!isTransportOption(transportOption))
    return NextResponse.json({ error: 'Transport intercité invalide' }, { status: 400 })
  if (!isLocalTransportOption(localTransportMakkah) || !isLocalTransportOption(localTransportMadinah))
    return NextResponse.json({ error: 'Transport local invalide' }, { status: 400 })
  if (transportOption === 'TAXI_ONE' && !['MAKKAH', 'MADINAH'].includes(taxiDirection))
    return NextResponse.json({ error: 'Direction du taxi invalide' }, { status: 400 })

  const selectedPlaceKeys: string[] = Array.isArray(selectedPlaces)
    ? selectedPlaces.filter((key: unknown): key is string => typeof key === 'string')
    : []

  // ── Validation du prix côté serveur ──────────────────────────────────────
  // Le prix doit être calculé à partir de la base de données, jamais depuis le client
  const effectiveSlug = selectedGuideSlug || guideSlug
  if (!effectiveSlug || !packageName || !nbPersonnes) {
    return NextResponse.json({ error: 'Paramètres de réservation manquants' }, { status: 400 })
  }

  const guideProfile = await prisma.guideProfile.findUnique({
    where: { slug: effectiveSlug },
    include: { packages: true },
  })

  if (!guideProfile || guideProfile.status !== 'ACTIVE') {
    return NextResponse.json({ error: 'Guide non disponible' }, { status: 400 })
  }

  const pkg = guideProfile.packages.find(
    (p) => p.name.toLowerCase().trim() === String(packageName).toLowerCase().trim()
  )

  // Lieux supplémentaires (flat, pas par personne)
  const libPkg = BASE_PACKAGES.find(p => p.name.toLowerCase().trim() === String(packageName).toLowerCase().trim())

  if (!pkg && !libPkg) {
    return NextResponse.json({ error: 'Forfait introuvable' }, { status: 400 })
  }

  // Prix de base : guide-specific si dispo, sinon BASE_PACKAGES
  const expectedBase = pkg?.pricePerPerson ?? libPkg!.basePrice
  const includedPlaces: string[] = libPkg?.includedPlaces ?? []
  const extraPlaceKeys = selectedPlaceKeys.filter(placeKey => !includedPlaces.includes(placeKey))
  let extraPlacesTotal = 0
  if (extraPlaceKeys.length > 0) {
    const placePriceRecords = await prisma.placePrice.findMany({
      where: { placeKey: { in: extraPlaceKeys }, isActive: true },
    })
    extraPlacesTotal = extraPlaceKeys.reduce((sum, pk) => {
      const rec = placePriceRecords.find(r => r.placeKey === pk)
      return sum + (rec?.price ?? BOOKING_PRICES.defaultPlace)
    }, 0)
  }

  // Transport : même calcul partagé avec le récapitulatif, validé côté serveur.
  const transportPricing = calculateBookingTransportPrice({
    cityChoice: cityChoice as CityChoice,
    nbPeople: nbP,
    selectedPlaces: selectedPlaceKeys,
    transportOption,
    localTransportMakkah,
    localTransportMadinah,
  })
  const prixTransport = transportPricing.intercity
  const prixVoiture = transportPricing.localCar
  const prixGroupe = nbP > 7 ? BOOKING_PRICES.groupSurcharge : 0

  const expectedPrice = expectedBase + extraPlacesTotal + prixTransport + prixVoiture + prixGroupe
  // Tolérance de 1€ pour les arrondis éventuels
  if (Math.abs(clientTotal - expectedPrice) > 1) {
    console.error(`[SECURITY] Prix client ${clientTotal}€ ≠ prix serveur ${expectedPrice}€ pour ${effectiveSlug}/${packageName}`)
    return NextResponse.json({ error: 'Montant invalide' }, { status: 400 })
  }
  // ─────────────────────────────────────────────────────────────────────────

  // Génère refNumber
  const refNumber =
    'SAF-' +
    Date.now().toString(36).toUpperCase() +
    Math.random().toString(36).slice(2, 5).toUpperCase()

  try {
    const normalizedBody = {
      ...body,
      nbPersonnes: nbP,
      selectedPlaces: selectedPlaceKeys,
      totalPrice: expectedPrice,
      withCar: localTransportMakkah === 'CAR' || localTransportMadinah === 'CAR',
      pricing: {
        base: expectedBase,
        places: extraPlacesTotal,
        intercityTransport: prixTransport,
        localCarMakkah: transportPricing.localCarMakkah,
        localCarMadinah: transportPricing.localCarMadinah,
        localCarDaysMakkah: transportPricing.makkahDays,
        localCarDaysMadinah: transportPricing.madinahDays,
        group: prixGroupe,
        total: expectedPrice,
      },
    }

    // Sauvegarde le draft
    await prisma.reservationDraft.create({
      data: {
        refNumber,
        data: JSON.stringify(normalizedBody),
        expiresAt: new Date(Date.now() + 30 * 60 * 1000),
      },
    })

    const destLabel =
      cityChoice === 'BOTH' ? 'Makkah + Madinah'
      : cityChoice === 'MAKKAH' ? 'Makkah' : 'Madinah'

    // Crée la Stripe Checkout Session
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || new URL(req.url).origin
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `SAFARUMA — ${packageName || 'Voyage spirituel'}`,
              description: `Voyage spirituel · ${destLabel} · ${nbPersonnes} personne(s)`,
              images: ['https://safaruma.com/og-image.jpg'],
            },
            unit_amount: Math.round(expectedPrice * 100),
          },
          quantity: 1,
        },
      ],
      metadata: {
        refNumber,
        guideSlug: selectedGuideSlug || guideSlug,
        guideSlugMadinah: selectedGuideSlugMadinah || '',
        pelerinEmail: userSession.user.email || '',
      },
      success_url: `${baseUrl}/espace/checkout/${guideSlug}/confirmation?ref=${refNumber}&payment=success`,
      cancel_url: `${baseUrl}/espace/checkout/${guideSlug}?cancelled=1`,
      customer_email: userSession.user.email || undefined,
      expires_at: Math.floor(Date.now() / 1000) + 1800,
    })

    return NextResponse.json({
      sessionUrl: checkoutSession.url,
      refNumber,
    })
  } catch (err) {
    console.error('[stripe/create-session]', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
