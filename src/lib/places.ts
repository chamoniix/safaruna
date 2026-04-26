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
    desc: "C'est ici, à 642 mètres d'altitude, que l'ange Jibrîl apporta au Prophète ﷺ les premiers versets du Coran. Gravir cette montagne, c'est marcher sur les traces du commencement de l'Islam. Une expérience qui laisse une empreinte spirituelle indélébile.",
    category: 'MAKKAH',
    includedInBase: false,
  },
  {
    key: 'hira',
    emoji: '🌙',
    nameAr: 'غار حراء',
    nameFr: 'Grotte de Hira',
    desc: "Au sommet de Jabal Nour se trouve cette petite caverne où le Prophète ﷺ méditait des heures entières avant la Révélation. Pénétrer dans cet espace étroit, c'est toucher l'instant exact où l'humanité bascula. Un lieu hors du temps que chaque pèlerin devrait vivre.",
    category: 'MAKKAH',
    includedInBase: false,
  },
  {
    key: 'jabal-thawr',
    emoji: '🏔️',
    nameAr: 'جبل ثور',
    nameFr: 'Jabal Thawr',
    desc: "Dans cette grotte dissimulée, le Prophète ﷺ et Abu Bakr se cachèrent trois jours lors de la Hijra vers Madinah. La Providence les protégea d'une araignée et d'une colombe. Visiter Jabal Thawr, c'est ressentir la foi absolue qui permit la naissance de l'Islam.",
    category: 'MAKKAH',
    includedInBase: false,
  },
  {
    key: 'arafat',
    emoji: '🌄',
    nameAr: 'عرفات',
    nameFr: 'Arafat',
    desc: "La plaine où le Prophète ﷺ prononça son Sermon d'Adieu devant 100 000 fidèles. Lieu du wuqûf, pilier du Hajj, où les péchés sont pardonnés. Même en dehors du Hajj, fouler cette terre sacrée procure une émotion rare que seuls ceux qui l'ont vécu peuvent décrire.",
    category: 'MAKKAH',
    includedInBase: false,
  },
  {
    key: 'muzdalifah',
    emoji: '🌠',
    nameAr: 'مزدلفة',
    nameFr: 'Muzdalifah',
    desc: "Entre Arafat et Mina, cette plaine ouverte fut le lieu de repos nocturne du Prophète ﷺ lors du Hajj. Les pèlerins y ramassent les cailloux du jet des Jamarat. Un espace à ciel ouvert chargé d'une sérénité que les mots peinent à capturer.",
    category: 'MAKKAH',
    includedInBase: false,
  },
  {
    key: 'mina',
    emoji: '🏕️',
    nameAr: 'منى',
    nameFr: 'Mina',
    desc: "La Cité des Tentes, où Ibrahim ﷺ fut mis à l'épreuve du sacrifice et où les pèlerins du Hajj passent leurs nuits de Tashriq. Voir cette vallée transformée en ville provisoire pour des millions de croyants est un spectacle humain et spirituel sans équivalent.",
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
    desc: "La toute première mosquée bâtie dans l'Islam, posée de ses propres mains par le Prophète ﷺ à son arrivée à Madinah. Une prière de deux rak'at accomplie ici vaut, selon un hadith authentique, l'équivalent d'une Omra complète. Un privilège spirituel inestimable à quelques minutes du centre.",
    category: 'MADINAH',
    includedInBase: false,
  },
  {
    key: 'qiblatayn',
    emoji: '🧭',
    nameAr: 'مسجد القبلتين',
    nameFr: 'Masjid Al-Qiblatayn',
    desc: "C'est ici que l'ordre divin descendit en pleine prière pour changer la direction de la Qibla de Jérusalem vers La Mecque. Les fidèles pivotèrent en un instant, sans rompre leur salat. Une mosquée unique au monde, témoin vivant d'un moment fondateur de l'Islam.",
    category: 'MADINAH',
    includedInBase: false,
  },
  {
    key: 'baqi',
    emoji: '⚰️',
    nameAr: 'البقيع',
    nameFr: 'Cimetière Al-Baqi',
    desc: "Le cimetière où reposent des milliers de Compagnons du Prophète ﷺ, ses épouses, et sa fille Fatima. Le Prophète ﷺ lui-même venait régulièrement y faire du dua. Marcher entre ces tombes simples, rappelant l'humilité face à la mort, touche l'âme avec une force inattendue.",
    category: 'MADINAH',
    includedInBase: false,
  },
  {
    key: 'ohoud',
    emoji: '⛰️',
    nameAr: 'أحد',
    nameFr: 'Mont Ohoud',
    desc: "Au pied de cette montagne, 70 Compagnons dont Hamza, l'oncle du Prophète ﷺ, tombèrent en martyrs. Le Prophète ﷺ a dit : « Ohoud nous aime et nous aimons Ohoud. » Visiter leurs tombes et contempler ce champ de bataille transforme durablement le cœur du pèlerin.",
    category: 'MADINAH',
    includedInBase: false,
  },
  {
    key: 'masjid-fateh',
    emoji: '🕌',
    nameAr: 'مسجد الفتح',
    nameFr: 'Masjid Al-Fateh',
    desc: "Durant la Bataille du Fossé, le Prophète ﷺ fit du dua depuis cette colline pendant trois jours consécutifs. Allah révéla alors la victoire imminente. Ce lieu, appelé Mosquée de la Victoire, rappelle que la persévérance dans la supplication ne reste jamais sans réponse.",
    category: 'MADINAH',
    includedInBase: false,
  },
  {
    key: 'marche-dattes',
    emoji: '🌴',
    nameAr: 'سوق التمور',
    nameFr: 'Marché aux dattes',
    desc: "Des dizaines de variétés de dattes de Madinah, dont la célèbre Ajwa dont le Prophète ﷺ vanta les vertus. Un marché vivant, parfumé, où les vendeurs vous font goûter sans retenue. L'endroit idéal pour rapporter des cadeaux authentiques à vos proches.",
    category: 'MADINAH',
    includedInBase: false,
  },
  // ── HISTORIQUE ────────────────────────────────
  {
    key: 'badr',
    emoji: '⚔️',
    nameAr: 'بدر',
    nameFr: 'Badr',
    desc: "À 150 km de Madinah, dans cette vallée, 313 musulmans mal armés vainquirent une armée de 1000 Qurayshites. Le Prophète ﷺ pleura de gratitude. Visiter Badr, c'est comprendre que l'Islam ne s'est pas imposé par la force mais par la foi d'une poignée d'hommes résolus.",
    category: 'HISTORIQUE',
    includedInBase: false,
  },
  {
    key: 'khandaq',
    emoji: '🛡️',
    nameAr: 'الخندق',
    nameFr: 'Al-Khandaq',
    desc: "Sur la suggestion de Salman Al-Farisi, les musulmans creusèrent un fossé de plusieurs kilomètres pour défendre Madinah. Une stratégie inédite dans la péninsule arabique. Ce site rappelle l'ingéniosité, la solidarité et la foi inébranlable des Compagnons face à une coalition de 10 000 hommes.",
    category: 'HISTORIQUE',
    includedInBase: false,
  },
  {
    key: 'hunayn',
    emoji: '🌅',
    nameAr: 'حنين',
    nameFr: 'Hunayn',
    desc: "Dans cette vallée entre La Mecque et Taïf, les musulmans faillirent être défaits par surprise malgré leur supériorité numérique. La fermeté du Prophète ﷺ retourna la bataille. Le Coran lui-même mentionne Hunayn — une leçon d'humilité gravée dans les versets.",
    category: 'HISTORIQUE',
    includedInBase: false,
  },
  {
    key: 'bir-aris',
    emoji: '🌊',
    nameAr: 'بئر أريس',
    nameFr: 'Bir Aris',
    desc: "Dans ce jardin paisible de Madinah, le Prophète ﷺ s'assit au bord de ce puits et y laissa tomber sa bague. Abu Bakr, Umar et Uthman s'y assirent également. Un lieu de recueillement discret, rarement visité, qui offre une intimité spirituelle rare aux pèlerins qui le connaissent.",
    category: 'HISTORIQUE',
    includedInBase: false,
  },
  {
    key: 'masjid-ghamamah',
    emoji: '🕌',
    nameAr: 'مسجد الغمامة',
    nameFr: 'Masjid Al-Ghamamah',
    desc: "Le Prophète ﷺ y accomplit la prière de l'Aïd en plein air, et selon la tradition, un nuage (ghamamah) lui fit de l'ombre lors de la khutbah. Cette petite mosquée ottomane, à deux pas de Masjid An-Nabawi, est un trésor méconnu que les guides SAFARUMA vous feront découvrir.",
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
