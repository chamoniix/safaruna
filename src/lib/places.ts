export type PlaceCategory = 'MAKKAH' | 'MADINAH' | 'HISTORIQUE'

export interface Place {
  key: string
  emoji: string
  nameAr: string
  nameFr: string
  desc: string
  category: PlaceCategory
  includedInBase: boolean
}

export const PLACES: Place[] = [
  // ── MAKKAH ────────────────────────────────────
  {
    key: 'masjid-al-haram',
    emoji: '🕋',
    nameAr: 'المسجد الحرام',
    nameFr: 'Masjid Al-Haram',
    desc: 'La plus grande mosquée du monde',
    category: 'MAKKAH',
    includedInBase: true,
  },
  {
    key: 'kaaba',
    emoji: '⬛',
    nameAr: 'الكعبة المشرفة',
    nameFr: 'La Kaaba',
    desc: 'Le sanctuaire sacré vers lequel prient les musulmans',
    category: 'MAKKAH',
    includedInBase: true,
  },
  {
    key: 'zamzam',
    emoji: '💧',
    nameAr: 'بئر زمزم',
    nameFr: 'Puits de Zamzam',
    desc: "Source d'eau bénite depuis Hagar",
    category: 'MAKKAH',
    includedInBase: true,
  },
  {
    key: 'safa-marwa',
    emoji: '🚶',
    nameAr: 'الصفا والمروة',
    nameFr: "Safa & Marwa (Sa'i)",
    desc: "Parcours rituel du Sa'i",
    category: 'MAKKAH',
    includedInBase: true,
  },
  {
    key: 'jabal-nour',
    emoji: '⛰️',
    nameAr: 'جبل النور',
    nameFr: 'Jabal Nour',
    desc: 'La montagne de la Lumière',
    category: 'MAKKAH',
    includedInBase: false,
  },
  {
    key: 'hira',
    emoji: '🌙',
    nameAr: 'غار حراء',
    nameFr: 'Grotte de Hira',
    desc: 'Lieu de la première révélation coranique',
    category: 'MAKKAH',
    includedInBase: false,
  },
  {
    key: 'jabal-thawr',
    emoji: '🏔️',
    nameAr: 'جبل ثور',
    nameFr: 'Jabal Thawr',
    desc: "Refuge lors de l'Hégire du Prophète ﷺ",
    category: 'MAKKAH',
    includedInBase: false,
  },
  {
    key: 'arafat',
    emoji: '🌄',
    nameAr: 'عرفات',
    nameFr: 'Arafat',
    desc: 'Lieu du pilier central du Hajj',
    category: 'MAKKAH',
    includedInBase: false,
  },
  {
    key: 'muzdalifah',
    emoji: '🌠',
    nameAr: 'مزدلفة',
    nameFr: 'Muzdalifah',
    desc: 'Halte sacrée entre Arafat et Mina',
    category: 'MAKKAH',
    includedInBase: false,
  },
  {
    key: 'mina',
    emoji: '🏕️',
    nameAr: 'منى',
    nameFr: 'Mina',
    desc: 'La Cité des Tentes du Hajj',
    category: 'MAKKAH',
    includedInBase: false,
  },
  // ── MADINAH ───────────────────────────────────
  {
    key: 'masjid-nabawi',
    emoji: '🌿',
    nameAr: 'المسجد النبوي',
    nameFr: 'Masjid An-Nabawi',
    desc: 'La mosquée du Prophète ﷺ',
    category: 'MADINAH',
    includedInBase: true,
  },
  {
    key: 'rawdah',
    emoji: '💚',
    nameAr: 'الروضة الشريفة',
    nameFr: 'La Rawdah',
    desc: 'Le jardin du Paradis entre le minbar et la tombe',
    category: 'MADINAH',
    includedInBase: true,
  },
  {
    key: 'masjid-quba',
    emoji: '🏛️',
    nameAr: 'مسجد قباء',
    nameFr: 'Masjid Quba',
    desc: "La première mosquée de l'Islam",
    category: 'MADINAH',
    includedInBase: false,
  },
  {
    key: 'qiblatayn',
    emoji: '🧭',
    nameAr: 'مسجد القبلتين',
    nameFr: 'Masjid Al-Qiblatayn',
    desc: 'Mosquée des deux Qiblas',
    category: 'MADINAH',
    includedInBase: false,
  },
  {
    key: 'baqi',
    emoji: '⚰️',
    nameAr: 'البقيع',
    nameFr: 'Cimetière Al-Baqi',
    desc: 'Cimetière des Compagnons du Prophète',
    category: 'MADINAH',
    includedInBase: false,
  },
  {
    key: 'ohoud',
    emoji: '⛰️',
    nameAr: 'أحد',
    nameFr: 'Mont Ohoud',
    desc: "Site de la bataille d'Ohoud",
    category: 'MADINAH',
    includedInBase: false,
  },
  {
    key: 'masjid-fateh',
    emoji: '🕌',
    nameAr: 'مسجد الفتح',
    nameFr: 'Masjid Al-Fateh',
    desc: 'Mosquée de la Victoire',
    category: 'MADINAH',
    includedInBase: false,
  },
  {
    key: 'marche-dattes',
    emoji: '🌴',
    nameAr: 'سوق التمور',
    nameFr: 'Marché aux dattes',
    desc: 'Variétés rares de dattes de Madinah',
    category: 'MADINAH',
    includedInBase: false,
  },
  // ── HISTORIQUE ────────────────────────────────
  {
    key: 'badr',
    emoji: '⚔️',
    nameAr: 'بدر',
    nameFr: 'Badr',
    desc: "Première grande bataille de l'Islam",
    category: 'HISTORIQUE',
    includedInBase: false,
  },
  {
    key: 'khandaq',
    emoji: '🛡️',
    nameAr: 'الخندق',
    nameFr: 'Al-Khandaq',
    desc: 'La Bataille du Fossé',
    category: 'HISTORIQUE',
    includedInBase: false,
  },
  {
    key: 'hunayn',
    emoji: '🌅',
    nameAr: 'حنين',
    nameFr: 'Hunayn',
    desc: 'Vallée de la bataille de Hunayn',
    category: 'HISTORIQUE',
    includedInBase: false,
  },
  {
    key: 'bir-aris',
    emoji: '🌊',
    nameAr: 'بئر أريس',
    nameFr: 'Bir Aris',
    desc: 'Puits où le Prophète ﷺ pria',
    category: 'HISTORIQUE',
    includedInBase: false,
  },
  {
    key: 'masjid-ghamamah',
    emoji: '🕌',
    nameAr: 'مسجد الغمامة',
    nameFr: 'Masjid Al-Ghamamah',
    desc: "Lieu de la prière de l'Aïd du Prophète ﷺ",
    category: 'HISTORIQUE',
    includedInBase: false,
  },
]

export function getPlacesByCategory(category: PlaceCategory): Place[] {
  return PLACES.filter(p => p.category === category)
}

export function getPlaceByKey(key: string): Place | undefined {
  return PLACES.find(p => p.key === key)
}

export function getIncludedPlaces(cities: 'MAKKAH' | 'MADINAH' | 'BOTH'): Place[] {
  return PLACES.filter(p => {
    if (!p.includedInBase) return false
    if (cities === 'MAKKAH') return p.category === 'MAKKAH'
    if (cities === 'MADINAH') return p.category === 'MADINAH'
    return true // BOTH
  })
}
