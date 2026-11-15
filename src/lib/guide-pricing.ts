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

// Prix unique payé par le client pour une mission dans une ville.
export const PUBLIC_GUIDE_BASE_CENTS = 13_000
export const PUBLIC_GUIDE_EXTRA_PERSON_CENTS = 2_500
export const PUBLIC_EXTRA_PLACE_CENTS = 5_000
export const SAFARUMA_COMMISSION_BPS = 1_500

export function splitBookingPaymentCents(totalPaidCents: number): { commissionCents: number; guideNetCents: number } {
  const commissionCents = Math.round(totalPaidCents * SAFARUMA_COMMISSION_BPS / 10_000)
  return { commissionCents, guideNetCents: totalPaidCents - commissionCents }
}

export type GuidePaymentServices = {
  guideProfileId: string
  serviceGrossCents: number
  placesGrossCents: number
  transportGrossCents: number
  hotelGrossCents: number
}

export function allocateGuidePaymentCents(totalPaidCents: number, services: GuidePaymentServices[]) {
  const { guideNetCents } = splitBookingPaymentCents(totalPaidCents)
  const grossTotal = services.reduce((sum, item) => sum + item.serviceGrossCents + item.placesGrossCents + item.transportGrossCents + item.hotelGrossCents, 0)
  if (grossTotal <= 0) throw new Error('Prestations de réservation manquantes')
  let cumulativeGross = 0
  let allocated = 0
  function share(grossCents: number) {
    cumulativeGross += grossCents
    const cumulativeNet = Math.round(guideNetCents * cumulativeGross / grossTotal)
    const net = cumulativeNet - allocated
    allocated = cumulativeNet
    return net
  }
  return services.map(item => {
    const serviceNetCents = share(item.serviceGrossCents)
    const placesNetCents = share(item.placesGrossCents)
    const transportNetCents = share(item.transportGrossCents)
    const hotelNetCents = share(item.hotelGrossCents)
    return {
      guideProfileId: item.guideProfileId, serviceNetCents, placesNetCents, transportNetCents, hotelNetCents,
      totalNetCents: serviceNetCents + placesNetCents + transportNetCents + hotelNetCents,
    }
  })
}

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

export function publicGuideServicePriceCents(nbPeople: number): number {
  return PUBLIC_GUIDE_BASE_CENTS + Math.max(0, nbPeople - 4) * PUBLIC_GUIDE_EXTRA_PERSON_CENTS
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
  nbPeople: number,
  markupBps = GUIDE_SERVICE_MARKUP_BPS
): number {
  return withMarkupCents(guideServiceNetCents(rates, city, nbPeople), markupBps)
}

export function placeNetCents(nbPeople: number): number {
  return PLACE_NET_BY_TIER_CENTS[guideGroupTier(nbPeople)]
}

export function placeRetailCents(nbPeople: number, markupBps = GUIDE_SERVICE_MARKUP_BPS): number {
  return withMarkupCents(placeNetCents(nbPeople), markupBps)
}

export function centsToEuros(cents: number): number {
  return Math.round(cents) / 100
}
