import Stripe from 'stripe'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { apiRatelimit, checkRateLimit } from '@/lib/ratelimit'
import { BASE_PACKAGES } from '@/lib/packages'

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
    selectedPlaces,
    transportOption,
    withCar,
  } = body

  if (!totalPrice || totalPrice <= 0)
    return NextResponse.json({ error: 'Montant invalide' }, { status: 400 })

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

  if (!pkg) {
    return NextResponse.json({ error: 'Forfait introuvable' }, { status: 400 })
  }

  // Prix de base = forfait flat 1-7 personnes
  const expectedBase = pkg.pricePerPerson

  // Lieux supplémentaires (flat, pas par personne)
  const libPkg = BASE_PACKAGES.find(p => p.name.toLowerCase().trim() === String(packageName).toLowerCase().trim())
  const includedPlaces: string[] = libPkg?.includedPlaces ?? []
  const extraPlaceKeys: string[] = Array.isArray(selectedPlaces)
    ? selectedPlaces.filter((pk: string) => !includedPlaces.includes(pk))
    : []
  let extraPlacesTotal = 0
  if (extraPlaceKeys.length > 0) {
    const placePriceRecords = await prisma.placePrice.findMany({
      where: { placeKey: { in: extraPlaceKeys }, isActive: true },
    })
    extraPlacesTotal = extraPlaceKeys.reduce((sum, pk) => {
      const rec = placePriceRecords.find(r => r.placeKey === pk)
      return sum + (rec?.price ?? 50)
    }, 0)
  }

  // Transport
  const nbP = Number(nbPersonnes)
  const prixTransport = cityChoice === 'BOTH'
    ? transportOption === 'TRAIN' ? 80 * nbP
    : (transportOption === 'TAXI_RT' || transportOption === 'TAXI_ONE') ? 240
    : 0
    : 0
  const prixVoiture = withCar ? 280 : 0
  const prixGroupe = nbP > 7 ? 200 : 0

  const expectedPrice = expectedBase + extraPlacesTotal + prixTransport + prixVoiture + prixGroupe
  // Tolérance de 1€ pour les arrondis éventuels
  if (Math.abs(totalPrice - expectedPrice) > 1) {
    console.error(`[SECURITY] Prix client ${totalPrice}€ ≠ prix serveur ${expectedPrice}€ pour ${effectiveSlug}/${packageName}`)
    return NextResponse.json({ error: 'Montant invalide' }, { status: 400 })
  }
  // ─────────────────────────────────────────────────────────────────────────

  // Génère refNumber
  const refNumber =
    'SAF-' +
    Date.now().toString(36).toUpperCase() +
    Math.random().toString(36).slice(2, 5).toUpperCase()

  try {
    // Sauvegarde le draft
    await prisma.reservationDraft.create({
      data: {
        refNumber,
        data: JSON.stringify(body),
        expiresAt: new Date(Date.now() + 30 * 60 * 1000),
      },
    })

    const destLabel =
      cityChoice === 'BOTH' ? 'Makkah + Madinah'
      : cityChoice === 'MAKKAH' ? 'Makkah' : 'Madinah'

    // Crée la Stripe Checkout Session
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
            unit_amount: Math.round(totalPrice * 100),
          },
          quantity: 1,
        },
      ],
      metadata: {
        refNumber,
        guideSlug: selectedGuideSlug || guideSlug,
      },
      success_url: `https://safaruma.com/espace/checkout/${guideSlug}/confirmation?ref=${refNumber}&payment=success`,
      cancel_url: `https://safaruma.com/espace/checkout/${guideSlug}?cancelled=1`,
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
