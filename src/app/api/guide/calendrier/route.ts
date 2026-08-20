import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireGuide } from '@/lib/require-account'

type ServiceCity = 'MAKKAH' | 'MADINAH'

async function getGuideProfile() {
  const access = await requireGuide()
  if (!access.ok) return access
  const guideProfile = await prisma.guideProfile.findUnique({
    where: { id: access.actor.guideProfileId },
    select: { id: true, servesMakkah: true, servesMadinah: true, acceptingBookings: true, city: true },
  })
  if (!guideProfile) return { ok: false as const, response: NextResponse.json({ error: 'Profil guide introuvable' }, { status: 404 }) }
  return { ok: true as const, guideProfile }
}

function parseCity(value: unknown): ServiceCity | null {
  return value === 'MAKKAH' || value === 'MADINAH' ? value : null
}

function parseDate(value: unknown): Date | null {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null
  const date = new Date(`${value}T12:00:00.000Z`)
  return Number.isNaN(date.getTime()) ? null : date
}

export async function GET(req: NextRequest) {
  const result = await getGuideProfile()
  if (!result.ok) return result.response
  const guide = result.guideProfile
  const city = parseCity(new URL(req.url).searchParams.get('city')) ?? 'MAKKAH'
  const today = new Date()
  today.setUTCHours(0, 0, 0, 0)
  const in365days = new Date(today)
  in365days.setUTCDate(in365days.getUTCDate() + 365)

  const records = await prisma.availability.findMany({
    where: {
      guideProfileId: guide.id,
      date: { gte: today, lte: in365days },
      OR: [{ city }, { city: 'BOTH' }, { status: 'BOOKED' }],
    },
    orderBy: { date: 'asc' },
  })
  const priority: Record<string, number> = { BOOKED: 3, UNAVAILABLE: 2, AVAILABLE: 1 }
  const byDate = new Map<string, typeof records[number]>()
  for (const record of records) {
    const key = record.date.toISOString().slice(0, 10)
    if (!byDate.has(key) || priority[record.status] > priority[byDate.get(key)!.status]) {
      byDate.set(key, record)
    }
  }

  return NextResponse.json({
    city,
    serviceEnabled: city === 'MAKKAH' ? guide.servesMakkah : guide.servesMadinah,
    services: { makkah: guide.servesMakkah, madinah: guide.servesMadinah },
    acceptingBookings: guide.acceptingBookings,
    availabilities: [...byDate.values()].map(record => ({
      id: record.id,
      date: record.date.toISOString().slice(0, 10),
      status: record.status,
      city: record.city,
    })),
  })
}

export async function PATCH(req: NextRequest) {
  const result = await getGuideProfile()
  if (!result.ok) return result.response
  const guide = result.guideProfile
  const body = await req.json()
  const city = parseCity(body.city)
  if (!city || typeof body.enabled !== 'boolean') {
    return NextResponse.json({ error: 'Paramètres invalides' }, { status: 400 })
  }
  await prisma.guideProfile.update({
    where: { id: guide.id },
    data: city === 'MAKKAH' ? { servesMakkah: body.enabled } : { servesMadinah: body.enabled },
  })
  return NextResponse.json({ success: true })
}

export async function POST(req: NextRequest) {
  const result = await getGuideProfile()
  if (!result.ok) return result.response
  const guide = result.guideProfile
  const body = await req.json()
  const city = parseCity(body.city)
  const date = parseDate(body.date)
  if (!city || !date || body.status !== 'UNAVAILABLE') {
    return NextResponse.json({ error: 'Paramètres invalides' }, { status: 400 })
  }
  const held = await prisma.reservationHold.findFirst({
    where: { guideProfileId: guide.id, date, expiresAt: { gt: new Date() } },
  })
  const booked = await prisma.availability.findFirst({
    where: { guideProfileId: guide.id, date, status: 'BOOKED' },
  })
  if (held || booked) {
    return NextResponse.json({ error: 'Cette date est réservée ou en cours de paiement' }, { status: 409 })
  }
  await prisma.availability.upsert({
    where: { guideProfileId_date_city: { guideProfileId: guide.id, date, city } },
    update: { status: 'UNAVAILABLE', reservationId: null },
    create: { guideProfileId: guide.id, date, city, status: 'UNAVAILABLE' },
  })
  return NextResponse.json({ success: true })
}

export async function DELETE(req: NextRequest) {
  const result = await getGuideProfile()
  if (!result.ok) return result.response
  const guide = result.guideProfile
  const body = await req.json()
  const city = parseCity(body.city)
  const date = parseDate(body.date)
  if (!city || !date) return NextResponse.json({ error: 'Paramètres invalides' }, { status: 400 })
  await prisma.availability.deleteMany({
    where: { guideProfileId: guide.id, date, city, status: { in: ['AVAILABLE', 'UNAVAILABLE'] } },
  })
  return NextResponse.json({ success: true })
}
