import prisma from '@/lib/prisma'
import { PLACES, type Place } from '@/lib/places'
import { guideGroupTier, PLACE_NET_BY_TIER_CENTS, withMarkupCents } from '@/lib/guide-pricing'

const DEFAULT_PLACE_NET_CENTS = {
  netUpTo6Cents: PLACE_NET_BY_TIER_CENTS.UP_TO_6,
  netUpTo15Cents: PLACE_NET_BY_TIER_CENTS.UP_TO_15,
  netUpTo32Cents: PLACE_NET_BY_TIER_CENTS.UP_TO_32,
} as const

export type EffectivePlace = Place & {
  isActive: boolean
  netUpTo6Cents: number
  netUpTo15Cents: number
  netUpTo32Cents: number
}

export async function getEffectivePlaceCatalog(): Promise<EffectivePlace[]> {
  const settings = await prisma.placePrice.findMany({
    select: {
      placeKey: true,
      price: true,
      isActive: true,
      includedInBase: true,
      netUpTo6Cents: true,
      netUpTo15Cents: true,
      netUpTo32Cents: true,
    },
  })
  const byKey = new Map(settings.map(setting => [setting.placeKey, setting]))

  return PLACES.map(place => {
    const setting = byKey.get(place.key)
    return {
      ...place,
      isActive: setting?.isActive ?? true,
      includedInBase: setting?.includedInBase ?? place.includedInBase,
      netUpTo6Cents: setting?.netUpTo6Cents ?? Math.round((setting?.price ?? 50) * 100),
      netUpTo15Cents: setting?.netUpTo15Cents ?? DEFAULT_PLACE_NET_CENTS.netUpTo15Cents,
      netUpTo32Cents: setting?.netUpTo32Cents ?? DEFAULT_PLACE_NET_CENTS.netUpTo32Cents,
    }
  })
}

export function placeNetCentsForGroup(place: EffectivePlace, nbPeople: number): number {
  const tier = guideGroupTier(nbPeople)
  if (tier === 'UP_TO_6') return place.netUpTo6Cents
  if (tier === 'UP_TO_15') return place.netUpTo15Cents
  return place.netUpTo32Cents
}

export function placeRetailCentsForGroup(place: EffectivePlace, nbPeople: number, markupBps: number): number {
  return withMarkupCents(placeNetCentsForGroup(place, nbPeople), markupBps)
}

export function publicPlaceCatalog(places: EffectivePlace[], markupBps: number) {
  return places.map(({ netUpTo6Cents, netUpTo15Cents, netUpTo32Cents, ...place }) => ({
    ...place,
    retailCents: {
      upTo6: withMarkupCents(netUpTo6Cents, markupBps),
      upTo15: withMarkupCents(netUpTo15Cents, markupBps),
      upTo32: withMarkupCents(netUpTo32Cents, markupBps),
    },
  }))
}

export function includedPlaceKeysForCity(
  places: EffectivePlace[],
  city: 'MAKKAH' | 'MADINAH' | 'BOTH'
): string[] {
  return places.filter(place => {
    if (!place.isActive || !place.includedInBase) return false
    if (city === 'MAKKAH') return place.category === 'MAKKAH'
    if (city === 'MADINAH') return place.category === 'MADINAH'
    return place.category === 'MAKKAH' || place.category === 'MADINAH'
  }).map(place => place.key)
}
