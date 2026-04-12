import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import {
  sendEmail, baseTemplate, heading, badge, p, divider, btn,
} from '@/lib/email'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user)
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const body = await req.json()
  const {
    guideSlug, cityChoice, departDate, nbPersonnes,
    gender, langue, selectedPlaces, withTransport, withCar,
    totalPrice, packageName,
  } = body

  try {
    // 2. Récupère le guide
    const guide = await prisma.guideProfile.findUnique({
      where: { slug: guideSlug },
      include: { user: true, packages: true },
    })
    if (!guide)
      return NextResponse.json({ error: 'Guide introuvable' }, { status: 404 })

    // 3. Package
    let pkg = guide.packages[0]
    if (!pkg) {
      pkg = await prisma.package.create({
        data: {
          guideProfileId: guide.id,
          name: packageName || 'Package SAFARUMA',
          durationDays: cityChoice === 'BOTH' ? 7 : 3,
          pricePerPerson: totalPrice / nbPersonnes,
          maxPeople: 20,
        },
      })
    }

    // 4. refNumber
    const refNumber =
      'SAF-' +
      Date.now().toString(36).toUpperCase() +
      Math.random().toString(36).slice(2, 5).toUpperCase()

    // 5. Pèlerin
    const pelerinUser = await prisma.user.findUnique({
      where: { email: session.user.email! },
    })
    if (!pelerinUser)
      return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 })

    // 6. Réservation
    const commissionRate = (guide as any).commissionRate ?? 0.12
    const commission = Math.round(totalPrice * commissionRate * 100) / 100

    const destLabel =
      cityChoice === 'BOTH' ? 'Makkah + Madinah'
      : cityChoice === 'MAKKAH' ? 'Makkah' : 'Madinah'

    const reservation = await prisma.reservation.create({
      data: {
        refNumber,
        pelerinId: pelerinUser.id,
        guideProfileId: guide.id,
        packageId: pkg.id,
        startDate: new Date(departDate),
        endDate: new Date(departDate),
        nbPeople: nbPersonnes,
        basePrice: totalPrice,
        commissionAmount: commission,
        totalPrice,
        status: 'PENDING',
        selectedPlaces,
        selectedCities: cityChoice,
        withTransport: withTransport ?? false,
        withCar: withCar ?? false,
        gender,
        langue,
        notes: `Ville(s): ${cityChoice} | Transport: ${withTransport ? 'Oui' : 'Non'} | Voiture: ${withCar ? 'Oui' : 'Non'}`,
      },
    })

    // Noms
    const guideName =
      guide.user.name ||
      `${guide.user.firstName ?? ''} ${guide.user.lastName ?? ''}`.trim()
    const pelerinName =
      pelerinUser.name ||
      `${pelerinUser.firstName ?? ''} ${pelerinUser.lastName ?? ''}`.trim() ||
      pelerinUser.email || '—'
    const departureFr = new Date(departDate).toLocaleDateString('fr-FR')

    // 7. Email pèlerin
    try {
      await sendEmail({
        to: { email: pelerinUser.email!, name: pelerinName },
        subject: `Réservation reçue — ${refNumber}`,
        html: baseTemplate(`
          ${heading('Mabrouk ! الحمد لله')}
          ${badge('EN ATTENTE DE CONFIRMATION', '#D97706')}
          ${p(`Votre demande de réservation avec <strong>${guideName}</strong> a bien été reçue. Le guide a 24h pour confirmer votre voyage.`)}
          ${divider()}
          <table cellpadding="0" cellspacing="0" width="100%">
            ${[
              ['Référence', refNumber],
              ['Guide', guideName],
              ['Destination', destLabel],
              ['Date de départ', departureFr],
              ['Personnes', String(nbPersonnes)],
              ['Total', totalPrice.toLocaleString('fr-FR') + ' €'],
            ].map(([k, v]) => `
              <tr>
                <td style="padding:8px 0;font-size:12px;color:#7A6D5A;font-weight:700;text-transform:uppercase;width:40%">${k}</td>
                <td style="padding:8px 0;font-size:13px;color:#1A1209;font-weight:600">${v}</td>
              </tr>
              <tr><td colspan="2"><div style="height:1px;background:#E8DFC8"></div></td></tr>
            `).join('')}
          </table>
          ${divider()}
          <div style="background:#FEF9EC;border:1px solid #FCD34D;border-radius:8px;padding:12px 16px;margin:16px 0">
            <div style="font-size:12px;color:#92400E;font-weight:700">⏳ Prochaine étape</div>
            <div style="font-size:13px;color:#4A3F30;margin-top:4px">Votre guide confirmera sous 24h. Vous recevrez un email de confirmation.</div>
          </div>
          ${btn('Gérer ma réservation', 'https://safaruma.com/espace/reservations')}
        `),
      })
    } catch (e) {
      console.error('[reservations/create] pelerin email error', e)
    }

    // 8. Email guide
    if (guide.user.email) {
      try {
        await sendEmail({
          to: { email: guide.user.email, name: guideName },
          subject: `[SAFARUMA] Nouvelle demande — ${refNumber}`,
          html: baseTemplate(`
            ${heading('Nouvelle demande de réservation !')}
            ${badge('ACTION REQUISE — 24H', '#DC2626')}
            ${p(`<strong>${pelerinName}</strong> souhaite réserver votre accompagnement. Vous avez <strong>24 heures</strong> pour confirmer.`)}
            ${divider()}
            <table cellpadding="0" cellspacing="0" width="100%">
              ${[
                ['Référence', refNumber],
                ['Pèlerin', pelerinName],
                ['Destination', destLabel],
                ['Date', departureFr],
                ['Personnes', String(nbPersonnes)],
              ].map(([k, v]) => `
                <tr>
                  <td style="padding:8px 0;font-size:12px;color:#7A6D5A;font-weight:700;width:40%">${k}</td>
                  <td style="padding:8px 0;font-size:13px;color:#1A1209;font-weight:600">${v}</td>
                </tr>
              `).join('')}
            </table>
            ${divider()}
            ${btn('Voir dans mon espace', 'https://safaruma.com/guide/missions')}
          `),
        })
      } catch (e) {
        console.error('[reservations/create] guide email error', e)
      }
    }

    // 9. Email admin
    try {
      await sendEmail({
        to: { email: 'admin@safaruma.com', name: 'Admin SAFARUMA' },
        subject: `[Admin] Nouvelle réservation ${refNumber}`,
        html: baseTemplate(`
          ${heading('Nouvelle réservation')}
          ${p(`Pèlerin: ${pelerinName} | Guide: ${guideName} | Total: ${totalPrice}€`)}
          ${btn("Voir dans l'admin", 'https://safaruma.com/admin/reservations')}
        `),
      })
    } catch (e) {
      console.error('[reservations/create] admin email error', e)
    }

    return NextResponse.json({
      success: true,
      refNumber,
      reservationId: reservation.id,
    })
  } catch (err) {
    console.error('[reservations/create]', err)
    return NextResponse.json({ error: 'Erreur serveur', details: String(err) }, { status: 500 })
  }
}
