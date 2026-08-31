import { Prisma } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'
import {
  assertMissionsAvailable,
  bookingToday,
  GuideAvailabilityConflictError,
  parseBookingDate,
  type AvailabilityCity,
} from '@/lib/guide-availability'
import { getGuideRequestContext, hasTrustedGuideAuthOrigin } from '@/lib/guide-auth'
import prisma from '@/lib/prisma'
import { requireGuide } from '@/lib/require-account'

async function getGuideProfile() {
  const access = await requireGuide()
  if (!access.ok) return access
  const guideProfile = await prisma.guideProfile.findUnique({
    where: { id: access.actor.guideProfileId },
    select: { id: true, servesMakkah: true, servesMadinah: true, acceptingBookings: true, city: true },
  })
  if (!guideProfile) return { ok: false as const, response: NextResponse.json({ error: 'Profil guide introuvable' }, { status: 404 }) }
  return { ok: true as const, actor: access.actor, guideProfile }
}

function parseCity(value: unknown): AvailabilityCity | null {
  return value === 'MAKKAH' || value === 'MADINAH' ? value : null
}

function mutationDenied(req: NextRequest): NextResponse | null {
  return hasTrustedGuideAuthOrigin(req)
    ? null
    : NextResponse.json({ error: 'Origine non autorisée' }, { status: 403 })
}

function conflictResponse(error: unknown): NextResponse | null {
  if (error instanceof GuideAvailabilityConflictError) {
    return NextResponse.json({ error: 'Cette date est réservée ou en cours de paiement' }, { status: 409 })
  }
  if (error instanceof Prisma.PrismaClientKnownRequestError && ['P2002', 'P2034'].includes(error.code)) {
    return NextResponse.json({ error: 'Cette disponibilité vient d’être modifiée. Actualisez le calendrier.' }, { status: 409 })
  }
  return null
}

function auditContext(req: NextRequest) {
  const context = getGuideRequestContext(req)
  return {
    ip: context.ip,
    userAgent: context.userAgent,
    request: {
      country: context.country,
      city: context.city,
      device: context.device,
      browser: context.browser,
    },
  }
}

export async function GET(req: NextRequest) {
  const result = await getGuideProfile()
  if (!result.ok) return result.response
  const guide = result.guideProfile
  const searchParams = req.nextUrl.searchParams
  const city = parseCity(searchParams.get('city')) ?? 'MAKKAH'
  const from = parseBookingDate(searchParams.get('from'))
  const to = parseBookingDate(searchParams.get('to'))
  if (!from || !to || to < from) {
    return NextResponse.json({ error: 'Période invalide' }, { status: 400 })
  }

  const [records, holds] = await Promise.all([
    prisma.availability.findMany({
      where: {
        guideProfileId: guide.id,
        date: { gte: from, lte: to },
        OR: [{ city }, { city: 'BOTH' }, { status: 'BOOKED' }],
      },
      orderBy: { date: 'asc' },
    }),
    prisma.reservationHold.findMany({
      where: {
        guideProfileId: guide.id,
        date: { gte: from, lte: to },
        expiresAt: { gt: new Date() },
      },
      orderBy: { date: 'asc' },
      select: { id: true, date: true, city: true },
    }),
  ])
  const priority: Record<string, number> = { BOOKED: 4, HELD: 3, UNAVAILABLE: 2, AVAILABLE: 1 }
  const items = [
    ...records.map(record => ({
      id: record.id,
      date: record.date.toISOString().slice(0, 10),
      status: record.status,
      city: record.city,
    })),
    ...holds.map(hold => ({
      id: `hold-${hold.id}`,
      date: hold.date.toISOString().slice(0, 10),
      status: 'HELD' as const,
      city: hold.city,
    })),
  ]
  const byDate = new Map<string, typeof items[number]>()
  for (const item of items) {
    if (!byDate.has(item.date) || priority[item.status] > priority[byDate.get(item.date)!.status]) {
      byDate.set(item.date, item)
    }
  }

  return NextResponse.json({
    city,
    serviceEnabled: city === 'MAKKAH' ? guide.servesMakkah : guide.servesMadinah,
    services: { makkah: guide.servesMakkah, madinah: guide.servesMadinah },
    acceptingBookings: guide.acceptingBookings,
    availabilities: [...byDate.values()],
  })
}

export async function PATCH(req: NextRequest) {
  const denied = mutationDenied(req)
  if (denied) return denied
  const result = await getGuideProfile()
  if (!result.ok) return result.response
  const guide = result.guideProfile
  const body = await req.json()
  const context = auditContext(req)

  if (typeof body.acceptingBookings === 'boolean' && body.city === undefined && body.enabled === undefined) {
    const before = guide.acceptingBookings
    await prisma.$transaction([
      prisma.guideProfile.update({
        where: { id: guide.id },
        data: { acceptingBookings: body.acceptingBookings },
      }),
      prisma.auditLog.create({
        data: {
          actor: result.actor.email,
          actorRole: 'GUIDE',
          action: 'GUIDE_BOOKING_AVAILABILITY_UPDATED',
          target: guide.id,
          detail: JSON.stringify(context.request),
          ip: context.ip,
          userAgent: context.userAgent,
          before: { acceptingBookings: before },
          after: { acceptingBookings: body.acceptingBookings },
        },
      }),
    ])
    return NextResponse.json({ success: true })
  }

  const city = parseCity(body.city)
  if (!city || typeof body.enabled !== 'boolean' || body.acceptingBookings !== undefined) {
    return NextResponse.json({ error: 'Paramètres invalides' }, { status: 400 })
  }
  const before = city === 'MAKKAH' ? guide.servesMakkah : guide.servesMadinah
  await prisma.$transaction([
    prisma.guideProfile.update({
      where: { id: guide.id },
      data: city === 'MAKKAH' ? { servesMakkah: body.enabled } : { servesMadinah: body.enabled },
    }),
    prisma.auditLog.create({
      data: {
        actor: result.actor.email,
        actorRole: 'GUIDE',
        action: 'GUIDE_SERVICE_CITY_UPDATED',
        target: guide.id,
        detail: JSON.stringify({ ...context.request, city }),
        ip: context.ip,
        userAgent: context.userAgent,
        before: { city, enabled: before },
        after: { city, enabled: body.enabled },
      },
    }),
  ])
  return NextResponse.json({ success: true })
}

export async function POST(req: NextRequest) {
  const denied = mutationDenied(req)
  if (denied) return denied
  const result = await getGuideProfile()
  if (!result.ok) return result.response
  const guide = result.guideProfile
  const body = await req.json()
  const city = parseCity(body.city)
  const date = parseBookingDate(body.date)
  if (!city || !date || date < bookingToday() || body.status !== 'UNAVAILABLE') {
    return NextResponse.json({ error: 'Paramètres invalides' }, { status: 400 })
  }
  const context = auditContext(req)
  try {
    await prisma.$transaction(async tx => {
      await assertMissionsAvailable(tx, [{ guideProfileId: guide.id, city, dates: [date] }])
      await tx.availability.create({
        data: { guideProfileId: guide.id, date, city, status: 'UNAVAILABLE' },
      })
      await tx.auditLog.create({
        data: {
          actor: result.actor.email,
          actorRole: 'GUIDE',
          action: 'GUIDE_DATE_UNAVAILABLE_CREATED',
          target: guide.id,
          detail: JSON.stringify({ ...context.request, date: body.date, city }),
          ip: context.ip,
          userAgent: context.userAgent,
          before: { date: body.date, city, status: null },
          after: { date: body.date, city, status: 'UNAVAILABLE' },
        },
      })
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable })
    return NextResponse.json({ success: true })
  } catch (error) {
    const conflict = conflictResponse(error)
    if (conflict) return conflict
    throw error
  }
}

export async function DELETE(req: NextRequest) {
  const denied = mutationDenied(req)
  if (denied) return denied
  const result = await getGuideProfile()
  if (!result.ok) return result.response
  const guide = result.guideProfile
  const body = await req.json()
  const city = parseCity(body.city)
  const date = parseBookingDate(body.date)
  if (!city || !date || date < bookingToday()) {
    return NextResponse.json({ error: 'Paramètres invalides' }, { status: 400 })
  }
  const context = auditContext(req)
  try {
    await prisma.$transaction(async tx => {
      const deleted = await tx.availability.deleteMany({
        where: { guideProfileId: guide.id, date, city, status: 'UNAVAILABLE' },
      })
      if (deleted.count !== 1) throw new GuideAvailabilityConflictError('BOOKED')
      await tx.auditLog.create({
        data: {
          actor: result.actor.email,
          actorRole: 'GUIDE',
          action: 'GUIDE_DATE_UNAVAILABLE_REMOVED',
          target: guide.id,
          detail: JSON.stringify({ ...context.request, date: body.date, city }),
          ip: context.ip,
          userAgent: context.userAgent,
          before: { date: body.date, city, status: 'UNAVAILABLE' },
          after: { date: body.date, city, status: null },
        },
      })
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable })
    return NextResponse.json({ success: true })
  } catch (error) {
    const conflict = conflictResponse(error)
    if (conflict) return conflict
    throw error
  }
}
