import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'

const contactSchema = z.object({
  platform: z.enum(['WHATSAPP', 'TELEGRAM']),
  phone: z.string().trim().min(6).max(40),
})

export async function GET(_request: NextRequest, { params }: { params: Promise<{ ref: string }> }) {
  const { ref } = await params
  const consultation = await prisma.vipConsultation.findUnique({
    where: { refNumber: ref },
    select: { refNumber: true, status: true, contactPlatform: true, contactPhone: true },
  })
  if (!consultation) return NextResponse.json({ error: 'Réservation VIP introuvable.' }, { status: 404 })
  return NextResponse.json({
    refNumber: consultation.refNumber,
    paid: consultation.status === 'PAID' || consultation.status === 'CONSULTATION_BOOKED',
    contactPlatform: consultation.contactPlatform,
    contactPhone: consultation.contactPhone,
    calendlyUrl: consultation.status === 'PAID' || consultation.status === 'CONSULTATION_BOOKED'
      ? process.env.VIP_CALENDLY_URL || null
      : null,
  }, { headers: { 'Cache-Control': 'no-store' } })
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ ref: string }> }) {
  const { ref } = await params
  const parsed = contactSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Indiquez WhatsApp ou Telegram et un numéro valide.' }, { status: 400 })

  const result = await prisma.vipConsultation.updateMany({
    where: { refNumber: ref, status: { in: ['PAID', 'CONSULTATION_BOOKED'] } },
    data: { contactPlatform: parsed.data.platform, contactPhone: parsed.data.phone },
  })
  if (!result.count) return NextResponse.json({ error: 'Le paiement doit être confirmé avant de continuer.' }, { status: 409 })
  return NextResponse.json({ saved: true })
}
