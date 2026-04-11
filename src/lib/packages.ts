export type CityChoice = 'MAKKAH' | 'MADINAH' | 'BOTH'

export interface BasePackage {
  id: string
  name: string
  cities: CityChoice
  emoji: string
  description: string
  includedPlaces: string[]
  basePrice: number
  recommended?: boolean
}

export const BASE_PACKAGES: BasePackage[] = [
  {
    id: 'omra-makkah',
    name: 'Omra — Makkah',
    cities: 'MAKKAH',
    emoji: '🕋',
    description: "La Omra complète : Ihram, Tawaf, Sa'i, Tahallul + accompagnement dans les lieux saints de Makkah.",
    includedPlaces: ['masjid-al-haram', 'kaaba', 'zamzam', 'safa-marwa'],
    basePrice: 99,
  },
  {
    id: 'decouverte-madinah',
    name: 'Découverte — Madinah',
    cities: 'MADINAH',
    emoji: '🌿',
    description: 'Visite spirituelle de Madinah : Masjid An-Nabawi, La Rawdah et les sites majeurs.',
    includedPlaces: ['masjid-nabawi', 'rawdah', 'masjid-quba', 'baqi'],
    basePrice: 99,
  },
  {
    id: 'voyage-complet',
    name: 'Voyage complet — Makkah + Madinah',
    cities: 'BOTH',
    emoji: '✨',
    description: "Le voyage complet : Omra à Makkah + découverte de Madinah. Train Haramayn inclus.",
    includedPlaces: [
      'masjid-al-haram', 'kaaba', 'zamzam', 'safa-marwa',
      'masjid-nabawi', 'rawdah',
    ],
    basePrice: 199,
    recommended: true,
  },
]

export function getPackageForCity(city: CityChoice): BasePackage {
  return BASE_PACKAGES.find(p => p.cities === city)!
}
