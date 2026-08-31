import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireGuide } from '@/lib/require-account'
import { getEffectivePlaceCatalog } from '@/lib/place-catalog'
import { getGuideRequestContext, hasTrustedGuideAuthOrigin } from '@/lib/guide-auth'
import { z } from 'zod'

const updateGuidePlaceSchema = z.object({
  placeKey: z.string().min(1).max(100),
  enabled: z.boolean(),
}).strict()

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
  if (!hasTrustedGuideAuthOrigin(req)) {
    return NextResponse.json({ error: 'Origine non autorisée' }, { status: 403 })
  }
  const access = await requireGuide()
  if (!access.ok) return access.response

  const parsed = updateGuidePlaceSchema.safeParse(await req.json())
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Modification invalide' }, { status: 400 })
  }
  const { placeKey, enabled } = parsed.data
  const catalog = await getEffectivePlaceCatalog()
  const place = catalog.find(item => item.key === placeKey)
  if (!place || !place.isActive) {
    return NextResponse.json({ error: 'Ce lieu n’est pas disponible dans le catalogue.' }, { status: 409 })
  }
  if (place.includedInBase) {
    return NextResponse.json({ error: 'Un lieu inclus dans le socle ne peut pas être désactivé par un guide.' }, { status: 409 })
  }

  const existing = await prisma.guidePlace.findUnique({
    where: {
      guideProfileId_placeKey: {
        guideProfileId: access.actor.guideProfileId,
        placeKey,
      },
    },
    select: { isActive: true },
  })
  const context = getGuideRequestContext(req)
  await prisma.$transaction([
    prisma.guidePlace.upsert({
      where: {
        guideProfileId_placeKey: {
          guideProfileId: access.actor.guideProfileId,
          placeKey,
        },
      },
      update: { isActive: enabled },
      create: {
        guideProfileId: access.actor.guideProfileId,
        placeKey,
        isActive: enabled,
      },
    }),
    prisma.auditLog.create({
      data: {
        actor: access.actor.email,
        actorRole: 'GUIDE',
        action: 'GUIDE_PLACE_AVAILABILITY_UPDATED',
        target: access.actor.guideProfileId,
        detail: JSON.stringify({
          placeKey,
          country: context.country,
          city: context.city,
          device: context.device,
          browser: context.browser,
        }),
        ip: context.ip,
        userAgent: context.userAgent,
        before: { placeKey, enabled: existing?.isActive ?? false },
        after: { placeKey, enabled },
      },
    }),
  ])

  return NextResponse.json({ success: true, enabled })
}
