import Stripe from 'stripe'
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { sendEmail } from '@/lib/email'
import { createAuditLog } from '@/lib/audit'

export async function POST(req: NextRequest) {
  const stripeKey = process.env.STRIPE_SECRET_KEY
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!stripeKey || !webhookSecret) {
    return NextResponse.json({ error: 'Non configuré' }, { status: 500 })
  }

  const stripe = new Stripe(stripeKey, { apiVersion: '2024-06-20' as any })
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err: any) {
    console.error('Webhook signature failed:', err.message)
    return NextResponse.json({ error: 'Signature invalide' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const refNumber = session.metadata?.refNumber
    if (!refNumber) {
      return NextResponse.json({ error: 'refNumber manquant' }, { status: 400 })
    }

    // 1. Récupère le draft de réservation
    const draft = await prisma.reservationDraft.findUnique({
      where: { refNumber },
    })
    if (!draft) {
      console.error('Draft non trouvé pour', refNumber)
      return NextResponse.json({ error: 'Draft non trouvé' }, { status: 404 })
    }

    const data = JSON.parse(draft.data)

    // 2. Récupère le guide
    const guideSlug = data.selectedGuideSlug || data.guideSlug
    if (!guideSlug) {
      console.error('Slug guide manquant dans le draft', refNumber)
      return NextResponse.json({ error: 'Slug guide manquant' }, { status: 400 })
    }
    const guide = await prisma.guideProfile.findUnique({
      where: { slug: guideSlug },
      include: { user: true, packages: true },
    })
    if (!guide) {
      return NextResponse.json({ error: 'Guide non trouvé' }, { status: 404 })
    }

    // 3. Récupère le pèlerin
    if (!session.customer_email) {
      console.error('customer_email manquant dans la session Stripe', session.id)
      return NextResponse.json({ error: 'Email pèlerin manquant' }, { status: 400 })
    }
    const pelerin = await prisma.user.findUnique({
      where: { email: session.customer_email },
    })
    if (!pelerin) {
      return NextResponse.json({ error: 'Pèlerin non trouvé' }, { status: 404 })
    }

    // 4. Récupère ou crée le package
    let pkg = guide.packages[0]
    if (!pkg) {
      pkg = await prisma.package.create({
        data: {
          guideProfileId: guide.id,
          name: data.packageName || 'Package SAFARUMA',
          durationDays: data.cityChoice === 'BOTH' ? 7 : 3,
          pricePerPerson: data.totalPrice / data.nbPersonnes,
          maxPeople: 20,
        },
      })
    }

    // 5. Crée la réservation confirmée
    const commissionRate = guide.commissionRate ?? 0.12
    const commission = Math.round(data.totalPrice * commissionRate * 100) / 100

    await prisma.reservation.create({
      data: {
        refNumber,
        pelerinId: pelerin.id,
        guideProfileId: guide.id,
        packageId: pkg.id,
        startDate: new Date(data.departDate),
        endDate: new Date(data.returnDate || data.departDate),
        nbPeople: data.nbPersonnes,
        basePrice: data.totalPrice,
        commissionAmount: commission,
        totalPrice: data.totalPrice,
        status: 'CONFIRMED',
        selectedPlaces: data.selectedPlaces || [],
        selectedCities: data.cityChoice,
        withTransport: data.transportOption !== 'NONE',
        withCar: data.withCar || false,
        gender: data.gender,
        langue: data.langue,
        notes: `Payé via Stripe · Session: ${session.id}`,
      },
    })

    // 6. Supprime le draft
    await prisma.reservationDraft.delete({ where: { refNumber } })

    // 7. Audit log
    await createAuditLog({
      actor: session.customer_email || 'stripe',
      actorRole: 'CLIENT',
      action: 'PAYMENT_CONFIRMED',
      target: refNumber,
      detail: `${data.totalPrice}€ · ${data.cityChoice}`,
    })

    // 7. Emails
    const guideName =
      guide.user.name ||
      `${guide.user.firstName ?? ''} ${guide.user.lastName ?? ''}`.trim()
    const pelerinName =
      pelerin.name ||
      `${pelerin.firstName ?? ''} ${pelerin.lastName ?? ''}`.trim() ||
      pelerin.email ||
      '—'

    // Email pèlerin
    try {
      await sendEmail({
        to: { email: pelerin.email!, name: pelerinName },
        subject: `✅ Réservation confirmée — ${refNumber}`,
        html: `<h2>Mabrouk ! Votre réservation est confirmée.</h2>
          <p>Référence : <strong>${refNumber}</strong></p>
          <p>Guide : <strong>${guideName}</strong></p>
          <p>Destination : ${data.cityChoice === 'BOTH' ? 'Makkah + Madinah' : data.cityChoice}</p>
          <p>Départ : ${new Date(data.departDate).toLocaleDateString('fr-FR')}</p>
          <p>Montant payé : ${data.totalPrice}€</p>
          <br/>
          <a href="https://safaruma.com/espace/reservations">Gérer ma réservation</a>`,
      })
    } catch (e) {
      console.error('Email pelerin error:', e)
    }

    // Email guide
    if (guide.user.email) {
      try {
        await sendEmail({
          to: { email: guide.user.email, name: guideName },
          subject: `[SAFARUMA] Nouvelle réservation confirmée — ${refNumber}`,
          html: `<h2>Nouvelle réservation payée !</h2>
            <p>Référence : <strong>${refNumber}</strong></p>
            <p>Pèlerin : <strong>${pelerinName}</strong></p>
            <p>Destination : ${data.cityChoice === 'BOTH' ? 'Makkah + Madinah' : data.cityChoice}</p>
            <p>Départ : ${new Date(data.departDate).toLocaleDateString('fr-FR')}</p>
            <p>Personnes : ${data.nbPersonnes}</p>
            <br/>
            <a href="https://safaruma.com/guide/missions">Voir dans mon espace</a>`,
        })
      } catch (e) {
        console.error('Email guide error:', e)
      }
    }

    // Email admin
    try {
      await sendEmail({
        to: { email: 'admin@safaruma.com', name: 'Admin SAFARUMA' },
        subject: `[Admin] Paiement reçu — ${refNumber} — ${data.totalPrice}€`,
        html: `<p>Pèlerin: ${pelerinName} | Guide: ${guideName} | Total: ${data.totalPrice}€</p>`,
      })
    } catch (e) {
      console.error('Email admin error:', e)
    }

    console.log(`✅ Réservation créée: ${refNumber}`)
  }

  return NextResponse.json({ received: true })
}
