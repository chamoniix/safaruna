import { NextRequest, NextResponse } from 'next/server'
import { adminAuditDetail, adminAuditFields, getAdminActor, getAdminAuditContext } from '@/lib/check-admin'
import prisma from '@/lib/prisma'
import { PLACES } from '@/lib/places'
import { z } from 'zod'
import { PLACE_NET_BY_TIER_CENTS } from '@/lib/guide-pricing'

const updatePlaceSchema = z.object({
  placeKey: z.string().min(1),
  netUpTo6: z.number().min(0).max(999).optional(),
  netUpTo15: z.number().min(0).max(999).optional(),
  netUpTo32: z.number().min(0).max(999).optional(),
  isActive: z.boolean().optional(),
  includedInBase: z.boolean().optional(),
}).refine(value => value.netUpTo6 !== undefined || value.netUpTo15 !== undefined || value.netUpTo32 !== undefined || value.isActive !== undefined || value.includedInBase !== undefined, {
  message: 'Aucune modification reçue',
})

export async function GET(req: NextRequest) {
  const actor = await getAdminActor(req)
  if (!actor)
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const auditContext = getAdminAuditContext(req)

  try {
    // Seed automatique : crée les PlacePrice manquants
    const existing = await prisma.placePrice.findMany()
    const existingKeys = new Set(existing.map(p => p.placeKey))
    const missing = PLACES.filter(p => !existingKeys.has(p.key))
    if (missing.length > 0 && actor.role === 'SUPERADMIN') {
      await prisma.$transaction([
        prisma.placePrice.createMany({
          data: missing.map(p => ({
            placeKey: p.key,
            price: 50,
            isActive: true,
            includedInBase: p.includedInBase,
            netUpTo6Cents: PLACE_NET_BY_TIER_CENTS.UP_TO_6,
            netUpTo15Cents: PLACE_NET_BY_TIER_CENTS.UP_TO_15,
            netUpTo32Cents: PLACE_NET_BY_TIER_CENTS.UP_TO_32,
          })),
          skipDuplicates: true,
        }),
        prisma.auditLog.create({
          data: {
            actor: actor.email,
            actorRole: actor.role,
            actorAdminId: actor.id,
            action: 'PLACE_PRICES_INITIALIZED',
            target: 'place-prices',
            detail: adminAuditDetail(auditContext, { placeKeys: missing.map(place => place.key) }),
            before: { missing: missing.map(place => place.key) },
            after: {
              defaultNetPricesCents: {
                upTo6: PLACE_NET_BY_TIER_CENTS.UP_TO_6,
                upTo15: PLACE_NET_BY_TIER_CENTS.UP_TO_15,
                upTo32: PLACE_NET_BY_TIER_CENTS.UP_TO_32,
              },
              initialized: missing.map(place => place.key),
            },
            ...adminAuditFields(auditContext),
          },
        }),
      ])
    }

    const allPrices = await prisma.placePrice.findMany()
    const settingsByKey = new Map(allPrices.map(place => [place.placeKey, place]))

    return NextResponse.json({
      canEdit: actor.role === 'SUPERADMIN',
      places: PLACES.map(p => ({
        key: p.key,
        emoji: p.emoji,
        nameFr: p.nameFr,
        nameAr: p.nameAr,
        category: p.category,
        includedInBase: settingsByKey.get(p.key)?.includedInBase ?? p.includedInBase,
        isActive: settingsByKey.get(p.key)?.isActive ?? true,
        netUpTo6: (settingsByKey.get(p.key)?.netUpTo6Cents ?? Math.round((settingsByKey.get(p.key)?.price ?? 50) * 100)) / 100,
        netUpTo15: (settingsByKey.get(p.key)?.netUpTo15Cents ?? PLACE_NET_BY_TIER_CENTS.UP_TO_15) / 100,
        netUpTo32: (settingsByKey.get(p.key)?.netUpTo32Cents ?? PLACE_NET_BY_TIER_CENTS.UP_TO_32) / 100,
      }))
    })
  } catch (err) {
    console.error('[admin/lieux GET]', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const actor = await getAdminActor(req)
  if (!actor)
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  if (actor.role !== 'SUPERADMIN') {
    return NextResponse.json({ error: 'Seul le Superadmin peut modifier les tarifs.' }, { status: 403 })
  }
  const auditContext = getAdminAuditContext(req)

  try {
    const parsed = updatePlaceSchema.safeParse(await req.json())
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Modification invalide' }, { status: 400 })
    }
    const { placeKey, netUpTo6, netUpTo15, netUpTo32, isActive, includedInBase } = parsed.data
    const libraryPlace = PLACES.find(place => place.key === placeKey)
    if (!libraryPlace) return NextResponse.json({ error: 'Lieu inconnu' }, { status: 404 })

    const next = await prisma.$transaction(async tx => {
      const previousRow = await tx.placePrice.findUnique({ where: { placeKey } })
      const previous = {
        netUpTo6Cents: previousRow?.netUpTo6Cents ?? Math.round((previousRow?.price ?? 50) * 100),
        netUpTo15Cents: previousRow?.netUpTo15Cents ?? PLACE_NET_BY_TIER_CENTS.UP_TO_15,
        netUpTo32Cents: previousRow?.netUpTo32Cents ?? PLACE_NET_BY_TIER_CENTS.UP_TO_32,
        isActive: previousRow?.isActive ?? true,
        includedInBase: previousRow?.includedInBase ?? libraryPlace.includedInBase,
      }
      const updated = {
        netUpTo6Cents: netUpTo6 === undefined ? previous.netUpTo6Cents : Math.round(netUpTo6 * 100),
        netUpTo15Cents: netUpTo15 === undefined ? previous.netUpTo15Cents : Math.round(netUpTo15 * 100),
        netUpTo32Cents: netUpTo32 === undefined ? previous.netUpTo32Cents : Math.round(netUpTo32 * 100),
        isActive: isActive ?? previous.isActive,
        includedInBase: includedInBase ?? previous.includedInBase,
      }
      await tx.placePrice.upsert({
        where: { placeKey },
        update: { ...updated, price: updated.netUpTo6Cents / 100 },
        create: { placeKey, ...updated, price: updated.netUpTo6Cents / 100 },
      })
      await tx.auditLog.create({ data: {
        actor: actor.email,
        actorRole: actor.role,
        actorAdminId: actor.id,
        action: 'PLACE_SETTINGS_UPDATED',
        target: placeKey,
        detail: adminAuditDetail(auditContext),
        before: previous,
        after: updated,
        ...adminAuditFields(auditContext),
      } })
      return updated
    })

    return NextResponse.json({
      success: true,
      place: {
        key: placeKey,
        netUpTo6: next.netUpTo6Cents / 100,
        netUpTo15: next.netUpTo15Cents / 100,
        netUpTo32: next.netUpTo32Cents / 100,
        isActive: next.isActive,
        includedInBase: next.includedInBase,
      },
    })
  } catch (err) {
    console.error('[admin/lieux PATCH]', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
