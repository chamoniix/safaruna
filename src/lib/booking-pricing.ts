import { PLACES } from '@/lib/places'
import type { CityChoice } from '@/lib/packages'

export type TransportOption = 'NONE' | 'TRAIN' | 'TAXI_RT' | 'TAXI_ONE'
export type LocalTransportOption = 'NONE' | 'TAXI' | 'CAR'

const TAXI_ONE_WAY = 120

export const BOOKING_PRICES = {
  trainPerTrip: 80,
  trainRoundTrip: 160,
  taxiOneWay: TAXI_ONE_WAY,
  taxiRoundTrip: TAXI_ONE_WAY * 2,
  localCarPerDay: 45,
  localMinivanPerDay: 120,
  localBusPerDay: 500,
  guideHotelPerNight: 80,
  defaultPlace: 50,
} as const

export const TRANSPORT_OPTIONS: readonly TransportOption[] = ['NONE', 'TRAIN', 'TAXI_RT', 'TAXI_ONE']
export const LOCAL_TRANSPORT_OPTIONS: readonly LocalTransportOption[] = ['NONE', 'TAXI', 'CAR']

const MAKKAH_HISTORICAL = ['hunayn']
const MADINAH_HISTORICAL = ['badr', 'khandaq', 'bir-aris', 'masjid-ghamamah']

const PLACE_HOURS: Record<string, number> = {
  'jabal-nour': 2.5,
  hira: 2.5,
  'jabal-thawr': 3,
  arafat: 2,
  muzdalifah: 1,
  mina: 1,
  hunayn: 2,
  'masjid-quba': 1,
  qiblatayn: 1,
  baqi: 1,
  ohoud: 2.5,
  'masjid-fateh': 1,
  'marche-dattes': 1,
  badr: 4,
  khandaq: 1.5,
  'bir-aris': 1,
  'masjid-ghamamah': 1,
}

const HOURS_PER_LOCAL_CAR_DAY = 6

export function isTransportOption(value: unknown): value is TransportOption {
  return TRANSPORT_OPTIONS.includes(value as TransportOption)
}

export function isLocalTransportOption(value: unknown): value is LocalTransportOption {
  return LOCAL_TRANSPORT_OPTIONS.includes(value as LocalTransportOption)
}

export function calculateLocalCarDays(selectedPlaces: string[], city: 'MAKKAH' | 'MADINAH'): number {
  const cityKeys = city === 'MAKKAH'
    ? [...PLACES.filter(place => place.category === 'MAKKAH').map(place => place.key), ...MAKKAH_HISTORICAL]
    : [...PLACES.filter(place => place.category === 'MADINAH').map(place => place.key), ...MADINAH_HISTORICAL]
  const selected = selectedPlaces.filter(key => cityKeys.includes(key))

  if (selected.length === 0) return 1

  let hours = selected.reduce((sum, key) => sum + (PLACE_HOURS[key] ?? 1.5), 0)
  if (city === 'MAKKAH' && selected.includes('jabal-nour') && selected.includes('hira')) hours -= 1
  if (city === 'MADINAH' && selected.includes('masjid-quba') && selected.includes('qiblatayn')) hours -= 0.5
  if (city === 'MADINAH' && selected.includes('ohoud') && selected.includes('masjid-fateh')) hours -= 0.5

  return Math.max(1, Math.ceil(hours / HOURS_PER_LOCAL_CAR_DAY))
}

export function getLocalVehiclePricing(nbPeople: number): {
  dailyRate: number
  vehicle: 'CAR' | 'MINIVAN' | 'BUS'
  label: string
} {
  if (nbPeople <= 6) {
    return { dailyRate: BOOKING_PRICES.localCarPerDay, vehicle: 'CAR', label: 'Voiture privée' }
  }
  if (nbPeople <= 15) {
    return { dailyRate: BOOKING_PRICES.localMinivanPerDay, vehicle: 'MINIVAN', label: 'Minivan avec chauffeur' }
  }
  return { dailyRate: BOOKING_PRICES.localBusPerDay, vehicle: 'BUS', label: 'Bus avec chauffeur' }
}

export function calculateBookingTransportPrice(input: {
  cityChoice: CityChoice
  nbPeople: number
  selectedPlaces: string[]
  transportOption: TransportOption
  localTransportMakkah: LocalTransportOption
  localTransportMadinah: LocalTransportOption
  sameGuideForBothCities?: boolean
  sameGuidePrimaryCity?: 'MAKKAH' | 'MADINAH' | null
  guideBedProvided?: boolean
}) {
  const {
    cityChoice,
    nbPeople,
    selectedPlaces,
    transportOption,
    localTransportMakkah,
    localTransportMadinah,
    sameGuideForBothCities = false,
    sameGuidePrimaryCity = null,
    guideBedProvided = false,
  } = input

  const intercity = cityChoice === 'BOTH' && sameGuideForBothCities
    ? transportOption === 'TRAIN'
      ? BOOKING_PRICES.trainRoundTrip
      : transportOption === 'TAXI_RT'
        ? BOOKING_PRICES.taxiRoundTrip
        : transportOption === 'TAXI_ONE'
          ? BOOKING_PRICES.taxiOneWay
          : 0
    : 0

  const makkahDays = calculateLocalCarDays(selectedPlaces, 'MAKKAH')
  const madinahDays = calculateLocalCarDays(selectedPlaces, 'MADINAH')
  const localVehicle = getLocalVehiclePricing(nbPeople)
  const localCarMakkah = cityChoice !== 'MADINAH' && localTransportMakkah === 'CAR'
    ? makkahDays * localVehicle.dailyRate
    : 0
  const localCarMadinah = cityChoice !== 'MAKKAH' && localTransportMadinah === 'CAR'
    ? madinahDays * localVehicle.dailyRate
    : 0

  const guideHotelNights = cityChoice === 'BOTH' && sameGuideForBothCities && !guideBedProvided
    ? Math.max(0, (sameGuidePrimaryCity === 'MAKKAH' ? madinahDays : makkahDays) - 1)
    : 0
  const guideHotel = guideHotelNights * BOOKING_PRICES.guideHotelPerNight

  return {
    intercity,
    localCarMakkah,
    localCarMadinah,
    localCar: localCarMakkah + localCarMadinah,
    makkahDays,
    madinahDays,
    localVehicle,
    guideHotelNights,
    guideHotel,
  }
}
