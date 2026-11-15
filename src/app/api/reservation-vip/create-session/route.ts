import { randomBytes } from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { contactRatelimit, checkRateLimit } from '@/lib/ratelimit'
import { getWhopClient } from '@/lib/payments/whop-provider'

export async function POST(request: NextRequest) {
  const limited = await checkRateLimit(request, contactRatelimit)
  if (limited) return limited

  if (!process.env.WHOP_API_KEY?.trim()) {
    return NextResponse.json({ error: 'Le paiement VIP n’est pas encore configuré.' }, { status: 503 })
  }
  if (!process.env.VIP_CALENDLY_URL?.trim()) {
    return NextResponse.json({ error: 'La prise de rendez-vous VIP n’est pas encore configurée.' }, { status: 503 })
  }

  const refNumber = `VIP-${randomBytes(16).toString('hex').toUpperCase()}`
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXTAUTH_URL || 'https://safaruma.com'
  const consultation = await prisma.vipConsultation.create({ data: { refNumber } })

  try {
    const checkout = await getWhopClient().checkoutConfigurations.create({
      mode: 'payment',
      metadata: { vipRef: refNumber, type: 'vip_consultation_deposit' },
      redirect_url: `${baseUrl}/reservation-vip/confirmation?ref=${encodeURIComponent(refNumber)}`,
      variant: {
        billing_type: 'one_time',
        initial_price: 500,
        currency: 'eur',
        override_tax_type: 'inclusive',
        title: 'Acompte VIP SAFARUMA',
        description: 'Acompte de 500 € imputé sur la facture finale après consultation.',
        force_create_new_plan: true,
        stock: 1,
        unlimited_stock: false,
        metadata: { vipRef: refNumber, type: 'vip_consultation_deposit' },
        visibility: 'hidden',
        release_method: 'buy_now',
      },
    }, { idempotencyKey: `vip:${refNumber}` })

    if (!checkout.purchase_url) throw new Error('Whop n’a pas retourné de lien de paiement')
    await prisma.vipConsultation.update({
      where: { id: consultation.id },
      data: { providerCheckoutId: checkout.id },
    })
    return NextResponse.json({ checkoutUrl: checkout.purchase_url })
  } catch (error) {
    await prisma.vipConsultation.delete({ where: { id: consultation.id } }).catch(() => undefined)
    console.error('[vip/create-session]', error)
    return NextResponse.json({ error: 'Impossible de préparer le paiement VIP.' }, { status: 502 })
  }
}
