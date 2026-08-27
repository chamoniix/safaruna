import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireGuide } from '@/lib/require-account'
import { getEffectivePlaceCatalog } from '@/lib/place-catalog'

export async function GET() {
  const access = await requireGuide()
  if (!access.ok) return access.response

  const [places, catalog] = await Promise.all([
    prisma.guidePlace.findMany({ where: { guideProfileId: access.actor.guideProfileId } }),
    getEffectivePlaceCatalog(),
  ])

  const placesMap: Record<string, boolean> = {}
  places.forEach(p => { placesMap[p.placeKey] = p.isActive })

  const visibleCatalog = catalog
    .filter(place => place.isActive)
    .map(({ key, emoji, nameAr, nameFr, tagline, desc, category, includedInBase, isActive }) => ({
      key,
      emoji,
      nameAr,
      nameFr,
      tagline,
      desc,
      category,
      includedInBase,
      isActive,
    }))

  return NextResponse.json({ places: placesMap, catalog: visibleCatalog })
}

export async function POST(req: NextRequest) {
  const access = await requireGuide()
  if (!access.ok) return access.response

  const { placeKey } = await req.json()
  const catalog = await getEffectivePlaceCatalog()
  const place = catalog.find(item => item.key === placeKey)
  if (!place || !place.isActive) {
    return NextResponse.json({ error: 'Ce lieu n’est pas disponible dans le catalogue.' }, { status: 409 })
  }
  if (place.includedInBase) {
    return NextResponse.json({ error: 'Un lieu inclus dans le socle ne peut pas être désactivé par un guide.' }, { status: 409 })
  }

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
