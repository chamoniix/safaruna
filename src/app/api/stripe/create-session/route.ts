import Stripe from 'stripe'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20' as any,
})

export async function POST(req: NextRequest) {
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
  } = body

  if (!totalPrice || totalPrice <= 0)
    return NextResponse.json({ error: 'Montant invalide' }, { status: 400 })

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
    return NextResponse.json({ error: 'Erreur serveur', details: String(err) }, { status: 500 })
  }
}
