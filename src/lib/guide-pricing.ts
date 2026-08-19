export type GuideServiceCity = 'MAKKAH' | 'MADINAH'
export type GuideGroupTier = 'UP_TO_6' | 'UP_TO_15' | 'UP_TO_32'

export type GuideNetRates = {
  makkahNetUpTo6Cents: number
  makkahNetUpTo15Cents: number
  makkahNetUpTo32Cents: number
  madinahNetUpTo6Cents: number
  madinahNetUpTo15Cents: number
  madinahNetUpTo32Cents: number
}

export const GUIDE_SERVICE_MARKUP_BPS = 3_000
export const TRAVEL_MARKUP_BPS = 2_000

export const DEFAULT_GUIDE_NET_RATES: GuideNetRates = {
  makkahNetUpTo6Cents: 10_000,
  makkahNetUpTo15Cents: 13_000,
  makkahNetUpTo32Cents: 16_000,
  madinahNetUpTo6Cents: 10_000,
  madinahNetUpTo15Cents: 13_000,
  madinahNetUpTo32Cents: 16_000,
}

export const PLACE_NET_BY_TIER_CENTS: Record<GuideGroupTier, number> = {
  UP_TO_6: 5_000,
  UP_TO_15: 7_000,
  UP_TO_32: 9_000,
}

export function guideGroupTier(nbPeople: number): GuideGroupTier {
  if (nbPeople <= 6) return 'UP_TO_6'
  if (nbPeople <= 15) return 'UP_TO_15'
  return 'UP_TO_32'
}

export function withMarkupCents(netCents: number, markupBps: number): number {
  return Math.round(netCents * (10_000 + markupBps) / 10_000)
}

export function guideServiceNetCents(
  rates: GuideNetRates,
  city: GuideServiceCity,
  nbPeople: number
): number {
  const tier = guideGroupTier(nbPeople)
  if (city === 'MAKKAH') {
    if (tier === 'UP_TO_6') return rates.makkahNetUpTo6Cents
    if (tier === 'UP_TO_15') return rates.makkahNetUpTo15Cents
    return rates.makkahNetUpTo32Cents
  }
  if (tier === 'UP_TO_6') return rates.madinahNetUpTo6Cents
  if (tier === 'UP_TO_15') return rates.madinahNetUpTo15Cents
  return rates.madinahNetUpTo32Cents
}

export function guideServiceRetailCents(
  rates: GuideNetRates,
  city: GuideServiceCity,
  nbPeople: number
): number {
  return withMarkupCents(guideServiceNetCents(rates, city, nbPeople), GUIDE_SERVICE_MARKUP_BPS)
}

export function placeNetCents(nbPeople: number): number {
  return PLACE_NET_BY_TIER_CENTS[guideGroupTier(nbPeople)]
}

export function placeRetailCents(nbPeople: number): number {
  return withMarkupCents(placeNetCents(nbPeople), GUIDE_SERVICE_MARKUP_BPS)
}

export function centsToEuros(cents: number): number {
  return Math.round(cents) / 100
}
