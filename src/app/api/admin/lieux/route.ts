import { NextRequest, NextResponse } from 'next/server'
import { getAdminActor } from '@/lib/check-admin'
import prisma from '@/lib/prisma'
import { PLACES } from '@/lib/places'

export async function GET(req: NextRequest) {
  const actor = await getAdminActor(req)
  if (!actor)
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  try {
    // Seed automatique : crée les PlacePrice manquants
    const existing = await prisma.placePrice.findMany()
    const existingKeys = new Set(existing.map(p => p.placeKey))
    const missing = PLACES.filter(p => !existingKeys.has(p.key))
    if (missing.length > 0 && actor.role === 'SUPERADMIN') {
      await prisma.placePrice.createMany({
        data: missing.map(p => ({
          placeKey: p.key,
          price: 50,
          isActive: true,
        })),
        skipDuplicates: true,
      })
    }

    const allPrices = await prisma.placePrice.findMany()
    const priceMap: Record<string, number> = {}
    allPrices.forEach(p => { priceMap[p.placeKey] = p.price })

    return NextResponse.json({
      canEdit: actor.role === 'SUPERADMIN',
      places: PLACES.map(p => ({
        key: p.key,
        emoji: p.emoji,
        nameFr: p.nameFr,
        nameAr: p.nameAr,
        category: p.category,
        includedInBase: p.includedInBase,
        price: priceMap[p.key] ?? 50,
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

  try {
    const { placeKey, price } = await req.json()

    if (!placeKey || typeof price !== 'number' || price < 0 || price > 999) {
      return NextResponse.json({ error: 'Prix invalide' }, { status: 400 })
    }

    const previous = await prisma.placePrice.findUnique({ where: { placeKey }, select: { price: true } })
    await prisma.$transaction([
      prisma.placePrice.upsert({ where: { placeKey }, update: { price }, create: { placeKey, price, isActive: true } }),
      prisma.auditLog.create({ data: { actor: actor.email, actorRole: actor.role, actorAdminId: actor.id, action: 'PLACE_PRICE_UPDATED', target: placeKey, before: { price: previous?.price ?? null }, after: { price } } }),
    ])

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[admin/lieux PATCH]', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
