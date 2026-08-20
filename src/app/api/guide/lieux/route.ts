import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireGuide } from '@/lib/require-account'

export async function GET() {
  const access = await requireGuide()
  if (!access.ok) return access.response

  const places = await prisma.guidePlace.findMany({
    where: { guideProfileId: access.actor.guideProfileId }
  })

  const placesMap: Record<string, boolean> = {}
  places.forEach(p => { placesMap[p.placeKey] = p.isActive })

  return NextResponse.json({ places: placesMap })
}

export async function POST(req: NextRequest) {
  const access = await requireGuide()
  if (!access.ok) return access.response

  const { placeKey } = await req.json()

  const existing = await prisma.guidePlace.findFirst({
    where: { guideProfileId: access.actor.guideProfileId, placeKey }
  })

  if (existing) {
    await prisma.guidePlace.update({
      where: { id: existing.id },
      data: { isActive: !existing.isActive }
    })
  } else {
    await prisma.guidePlace.create({
      data: {
        guideProfileId: access.actor.guideProfileId,
        placeKey,
        isActive: true,
      }
    })
  }

  return NextResponse.json({ success: true })
}
