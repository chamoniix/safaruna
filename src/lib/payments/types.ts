import type { Prisma } from '@prisma/client'
import type { CityChoice } from '@/lib/packages'

export type PaymentProviderId = 'STRIPE' | 'REVOLUT'

export type DraftMission = {
  city: 'MAKKAH' | 'MADINAH'
  guideProfileId: string
  guideSlug: string
  startDate: string
  endDate: string
  selectedPlaces: string[]
  localTransport: 'NONE' | 'TAXI' | 'CAR'
  localTransportDays: number
}

export type DraftEarning = {
  guideProfileId: string
  serviceNetCents: number
  placesNetCents: number
  transportNetCents: number
  hotelNetCents: number
  totalNetCents: number
  breakdown: Prisma.InputJsonValue
}

export type PaymentDraftData = {
  cityChoice: CityChoice
  departDate: string
  returnDate: string
  nbPersonnes: number
  gender: string
  langue: string
  selectedPlaces: string[]
  allVisitPlaces: string[]
  transportOption: string
  localTransportMakkah: string
  localTransportMadinah: string
  totalPrice: number
  packageName: string
  selectedGuideSlug: string
  selectedGuideSlugMadinah?: string | null
  arrivalPoint: string
  guideBedProvided: boolean
  sameGuideForBothCities: boolean
  cityOrder: Array<'MAKKAH' | 'MADINAH'>
  ihramAlert: boolean
  promoCode: { id: string; code: string; discountBps: number } | null
  missions: DraftMission[]
  pricing: {
    base: number
    places: number
    intercityTransport: number
    localTransportMakkah: number
    localTransportMadinah: number
    localTransportDaysMakkah: number
    localTransportDaysMadinah: number
    localVehicle: { dailyRate: number; vehicle: string; label: string }
    guideHotelNights: number
    guideHotel: number
    promoDiscount: number
    grossTotal: number
    total: number
  }
  earnings: DraftEarning[]
}

export type NormalizedCheckoutPaidEvent = {
  provider: PaymentProviderId
  providerEventId: string
  providerEventType: string
  providerCheckoutId: string
  providerPaymentId: string
  bookingRef: string
  pelerinId: string
  pelerinEmail: string
  analyticsSessionHash: string | null
  amountCents: number
  currency: string
  occurredAt: Date
}

export type NormalizedCheckoutExpiredEvent = {
  provider: PaymentProviderId
  providerEventId: string
  providerEventType: string
  providerCheckoutId: string
  bookingRef: string
  analyticsSessionHash: string | null
  occurredAt: Date
}
