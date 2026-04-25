import Stripe from 'stripe'
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { sendEmail } from '@/lib/email'
import { createAuditLog } from '@/lib/audit'
import { BASE_PACKAGES } from '@/lib/packages'

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

    // ── Idempotence : si la réservation existe déjà, on retourne 200 immédiatement
    const existingReservation = await prisma.reservation.findUnique({
      where: { refNumber },
    })
    if (existingReservation) {
      console.log(`✅ Webhook idempotent — réservation déjà existante: ${refNumber}`)
      return NextResponse.json({ received: true })
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

    // 2. Récupère le guide Makkah
    const guideSlug = data.selectedGuideSlug || data.guideSlug || session.metadata?.guideSlug
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

    // 3. Récupère le pèlerin — customer_email + fallback metadata
    const pelerinEmail =
      session.customer_email ||
      session.metadata?.pelerinEmail ||
      data.pelerinEmail
    if (!pelerinEmail) {
      console.error('Email pèlerin manquant dans la session Stripe', session.id)
      return NextResponse.json({ error: 'Email pèlerin manquant' }, { status: 400 })
    }
    const pelerin = await prisma.user.findUnique({
      where: { email: pelerinEmail },
    })
    if (!pelerin) {
      return NextResponse.json({ error: 'Pèlerin non trouvé' }, { status: 404 })
    }

    // 4. Récupère le package par nom (pas juste packages[0])
    const packageName = data.packageName
    let pkg = packageName
      ? guide.packages.find(
          (p) => p.name.toLowerCase().trim() === String(packageName).toLowerCase().trim()
        )
      : guide.packages[0]

    if (!pkg) {
      // Fallback : créer le package depuis BASE_PACKAGES si absent en DB
      const libPkg = BASE_PACKAGES.find(
        (p) => p.name.toLowerCase().trim() === String(packageName).toLowerCase().trim()
      )
      pkg = await prisma.package.create({
        data: {
          guideProfileId: guide.id,
          name: packageName || 'Package SAFARUMA',
          durationDays: data.cityChoice === 'BOTH' ? 7 : 3,
          pricePerPerson: libPkg?.basePrice ?? data.totalPrice,
          maxPeople: 20,
        },
      })
    }

    // 5. Montant de vérité = Stripe (pas le draft client)
    const confirmedAmount = session.amount_total
      ? session.amount_total / 100
      : data.totalPrice

    // 6. Valider les dates
    const startDate = data.departDate ? new Date(data.departDate) : new Date()
    const endDate = data.returnDate ? new Date(data.returnDate) : startDate
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      console.error('Dates invalides dans le draft', refNumber, data.departDate, data.returnDate)
      // On continue avec des dates par défaut plutôt que de bloquer
    }

    // 7. Guide Madinah (slug)
    const guideSlugMadinah =
      data.selectedGuideSlugMadinah ||
      session.metadata?.guideSlugMadinah ||
      null

    // 8. Crée la réservation dans une transaction atomique
    const commissionRate = guide.commissionRate ?? 0.15
    const commission = Math.round(confirmedAmount * commissionRate * 100) / 100

    await prisma.$transaction(async (tx) => {
      await tx.reservation.create({
        data: {
          refNumber,
          pelerinId: pelerin.id,
          guideProfileId: guide.id,
          packageId: pkg!.id,
          startDate,
          endDate,
          nbPeople: data.nbPersonnes || 1,
          basePrice: confirmedAmount,
          commissionAmount: commission,
          totalPrice: confirmedAmount,
          status: 'CONFIRMED',
          selectedPlaces: data.selectedPlaces || [],
          selectedCities: data.cityChoice,
          withTransport: data.transportOption && data.transportOption !== 'NONE',
          withCar: data.withCar || false,
          gender: data.gender,
          langue: data.langue,
          stripePaymentId: session.payment_intent as string || null,
          notes: `Payé via Stripe · Session: ${session.id}`,
          optionsJson: {
            guideSlugMadinah,
            transportOption: data.transportOption,
            packageName,
          },
        },
      })

      await tx.reservationDraft.delete({ where: { refNumber } })
    })

    // 9. Audit log
    await createAuditLog({
      actor: pelerinEmail,
      actorRole: 'CLIENT',
      action: 'PAYMENT_CONFIRMED',
      target: refNumber,
      detail: `${confirmedAmount}€ · ${data.cityChoice}`,
    })

    // 10. Emails
    const guideName =
      guide.user.name ||
      `${guide.user.firstName ?? ''} ${guide.user.lastName ?? ''}`.trim()
    const pelerinName =
      pelerin.name ||
      `${pelerin.firstName ?? ''} ${pelerin.lastName ?? ''}`.trim() ||
      pelerinEmail

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://safaruma.com'
    const dest = data.cityChoice === 'BOTH' ? 'Makkah + Madinah' : data.cityChoice

    // Email pèlerin
    try {
      await sendEmail({
        to: { email: pelerin.email!, name: pelerinName },
        subject: `✅ Réservation confirmée — ${refNumber}`,
        html: `<h2>Mabrouk ! Votre réservation est confirmée.</h2>
          <p>Référence : <strong>${refNumber}</strong></p>
          <p>Guide : <strong>${guideName}</strong></p>
          <p>Destination : ${dest}</p>
          <p>Départ : ${startDate.toLocaleDateString('fr-FR')}</p>
          <p>Montant payé : ${confirmedAmount}€</p>
          <br/>
          <a href="${baseUrl}/espace/reservations">Gérer ma réservation</a>`,
      })
    } catch (e) {
      console.error('Email pelerin error:', e)
    }

    // Email guide Makkah
    if (guide.user.email) {
      try {
        await sendEmail({
          to: { email: guide.user.email, name: guideName },
          subject: `[SAFARUMA] Nouvelle réservation confirmée — ${refNumber}`,
          html: `<h2>Nouvelle réservation payée !</h2>
            <p>Référence : <strong>${refNumber}</strong></p>
            <p>Pèlerin : <strong>${pelerinName}</strong></p>
            <p>Destination : ${dest}</p>
            <p>Départ : ${startDate.toLocaleDateString('fr-FR')}</p>
            <p>Personnes : ${data.nbPersonnes}</p>
            <p>Votre rôle : Guide Makkah</p>
            <br/>
            <a href="${baseUrl}/guide/missions">Voir dans mon espace</a>`,
        })
      } catch (e) {
        console.error('Email guide Makkah error:', e)
      }
    }

    // Email guide Madinah (si différent du guide Makkah)
    if (guideSlugMadinah && guideSlugMadinah !== guideSlug) {
      try {
        const guideMadinah = await prisma.guideProfile.findUnique({
          where: { slug: guideSlugMadinah },
          include: { user: true },
        })
        if (guideMadinah?.user.email) {
          const guideMadinahName =
            guideMadinah.user.name ||
            `${guideMadinah.user.firstName ?? ''} ${guideMadinah.user.lastName ?? ''}`.trim()
          await sendEmail({
            to: { email: guideMadinah.user.email, name: guideMadinahName },
            subject: `[SAFARUMA] Nouvelle réservation confirmée — ${refNumber}`,
            html: `<h2>Nouvelle réservation payée !</h2>
              <p>Référence : <strong>${refNumber}</strong></p>
              <p>Pèlerin : <strong>${pelerinName}</strong></p>
              <p>Destination : Madinah</p>
              <p>Départ : ${startDate.toLocaleDateString('fr-FR')}</p>
              <p>Personnes : ${data.nbPersonnes}</p>
              <p>Votre rôle : Guide Madinah</p>
              <br/>
              <a href="${baseUrl}/guide/missions">Voir dans mon espace</a>`,
          })
        }
      } catch (e) {
        console.error('Email guide Madinah error:', e)
      }
    }

    // Email admin
    try {
      await sendEmail({
        to: { email: 'admin@safaruma.com', name: 'Admin SAFARUMA' },
        subject: `[Admin] Paiement reçu — ${refNumber} — ${confirmedAmount}€`,
        html: `<p>Pèlerin: ${pelerinName} | Guide: ${guideName} | Total: ${confirmedAmount}€${guideSlugMadinah ? ` | Guide Madinah: ${guideSlugMadinah}` : ''}</p>`,
      })
    } catch (e) {
      console.error('Email admin error:', e)
    }

    console.log(`✅ Réservation créée: ${refNumber} | Montant Stripe: ${confirmedAmount}€`)
  }

  return NextResponse.json({ received: true })
}
