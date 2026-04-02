import { notFound } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import GuideProfileClient from './GuideProfileClient';

// Pre-render all guide pages at build time → no server-side DB lookup needed
export async function generateStaticParams() {
  return [
    { slug: 'rachid-al-madani' },
    { slug: 'fatima-al-omari' },
    { slug: 'youssouf-konate' },
    { slug: 'abdullah-ben-yusuf' },
    { slug: 'samira-al-rashidi' },
  ];
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const PACKAGES = [
  {
    name: 'Omra Essentielle',
    label: 'Essentielle',
    price: 280,
    days: 3,
    description:
      "Le parcours fondamental de la Omra avec accompagnement complet du guide lors des rituels obligatoires. Idéal pour les pèlerins avec un budget maîtrisé.",
    features: [
      "Accueil à l'aéroport et transfert",
      "Guide personnel pour tous les rituels (tawaf, sa'i)",
      "Livret de du'a et supplications illustré",
      'Orientation Masjid Al-Haram et Zamzam',
      'Disponibilité téléphonique 24h/24',
      'Certificat de pèlerinage personnalisé',
    ],
  },
  {
    name: 'Omra & Histoire',
    label: 'Histoire',
    price: 450,
    days: 5,
    description:
      "L'immersion spirituelle et historique complète : rituels + visites des lieux de la Sîra prophétique. Inclut Jabal Nour, Jabal Thawr et le train Haramayn.",
    features: [
      'Tout ce qui est inclus dans Essentielle',
      'Voiture privée 7 places pour les visites',
      'Train Haramayn Makkah ↔ Madinah',
      'Ascension Jabal Nour (Grotte de Hira)',
      'Visite Jabal Thawr et sites de la Sîra',
      'Conférence "Histoire des Lieux Saints" (1h)',
    ],
  },
  {
    name: 'Grand Voyage Spirituel',
    label: 'Grand Voyage',
    price: 780,
    days: 10,
    description:
      'Le voyage complet : Makkah, Madinah, Badr, Ohoud et tous les sites historiques majeurs. Adapté PMR. Confort premium tout inclus.',
    features: [
      'Tout ce qui est inclus dans Omra & Histoire',
      'Makkah + Madinah + Badr + Ohoud',
      'Adapté PMR (fauteuil roulant disponible)',
      'Hôtel 5★ sélectionné à proximité du Haram',
      'Repas du soir inclus (cuisine orientale)',
      'Album photo souvenir du voyage',
    ],
  },
];

const PLACES = [
  // MAKKAH
  { emoji: '🕋', nameAr: 'المسجد الحرام', nameFr: 'Masjid Al-Haram', desc: 'La plus grande mosquée du monde', category: 'MAKKAH' as const },
  { emoji: '⬛', nameAr: 'الكعبة المشرفة', nameFr: 'La Kaaba', desc: 'Le sanctuaire sacré vers lequel prient les musulmans', category: 'MAKKAH' as const },
  { emoji: '💧', nameAr: 'بئر زمزم', nameFr: 'Puits de Zamzam', desc: "Source d'eau bénite depuis Hagar", category: 'MAKKAH' as const },
  { emoji: '⛰️', nameAr: 'جبل النور', nameFr: 'Jabal Nour', desc: 'La montagne de la Lumière', category: 'MAKKAH' as const },
  { emoji: '🌙', nameAr: 'غار حراء', nameFr: 'Grotte de Hira', desc: 'Lieu de la première révélation coranique', category: 'MAKKAH' as const },
  { emoji: '🏔️', nameAr: 'جبل ثور', nameFr: 'Jabal Thawr', desc: "Refuge lors de l'Hégire du Prophète ﷺ", category: 'MAKKAH' as const },
  { emoji: '🌄', nameAr: 'عرفات', nameFr: 'Arafat', desc: 'Lieu du pilier central du Hajj', category: 'MAKKAH' as const },
  { emoji: '🌠', nameAr: 'مزدلفة', nameFr: 'Muzdalifah', desc: 'Halte sacrée entre Arafat et Mina', category: 'MAKKAH' as const },
  { emoji: '🏕️', nameAr: 'منى', nameFr: 'Mina', desc: 'La "Cité des Tentes" du Hajj', category: 'MAKKAH' as const },
  { emoji: '🚶‍♀️', nameAr: 'المروة', nameFr: 'Al-Marwa', desc: "Une des deux collines du Sa'i", category: 'MAKKAH' as const },
  { emoji: '🚶', nameAr: 'الصفا', nameFr: 'Al-Safa', desc: "Point de départ du Sa'i", category: 'MAKKAH' as const },
  { emoji: '🕌', nameAr: 'مسجد الجن', nameFr: 'Masjid Al-Jinn', desc: 'Lieu où les djinns écoutèrent le Coran', category: 'MAKKAH' as const },
  // MADINAH
  { emoji: '🌿', nameAr: 'المسجد النبوي', nameFr: 'Masjid An-Nabawi', desc: 'La mosquée du Prophète ﷺ', category: 'MADINAH' as const },
  { emoji: '💚', nameAr: 'الروضة الشريفة', nameFr: 'La Rawdah', desc: 'Le jardin du Paradis entre le minbar et la tombe', category: 'MADINAH' as const },
  { emoji: '🏛️', nameAr: 'مسجد قباء', nameFr: 'Masjid Quba', desc: "La première mosquée de l'Islam", category: 'MADINAH' as const },
  { emoji: '🧭', nameAr: 'مسجد القبلتين', nameFr: 'Masjid Al-Qiblatayn', desc: 'Mosquée des deux Qiblas', category: 'MADINAH' as const },
  { emoji: '⚰️', nameAr: 'البقيع', nameFr: 'Cimetière Al-Baqi', desc: 'Cimetière des Compagnons du Prophète', category: 'MADINAH' as const },
  { emoji: '⛰️', nameAr: 'أحد', nameFr: 'Mont Ohoud', desc: "Site de la bataille d'Ohoud", category: 'MADINAH' as const },
  { emoji: '🕌', nameAr: 'مسجد الفتح', nameFr: 'Masjid Al-Fateh', desc: 'Mosquée de la Victoire', category: 'MADINAH' as const },
  { emoji: '🌴', nameAr: 'سوق التمور', nameFr: 'Marché aux dattes', desc: 'Variétés rares de dattes de Madinah', category: 'MADINAH' as const },
  // HISTORIQUE
  { emoji: '⚔️', nameAr: 'بدر', nameFr: 'Badr', desc: "Site de la première grande bataille de l'Islam", category: 'HISTORIQUE' as const },
  { emoji: '🛡️', nameAr: 'الخندق', nameFr: 'Al-Khandaq', desc: 'La Bataille du Fossé', category: 'HISTORIQUE' as const },
  { emoji: '🌅', nameAr: 'حنين', nameFr: 'Hunayn', desc: 'Vallée de la bataille de Hunayn', category: 'HISTORIQUE' as const },
  { emoji: '🌊', nameAr: 'بئر أريس', nameFr: 'Bir Aris', desc: 'Puits où le Prophète ﷺ pria', category: 'HISTORIQUE' as const },
  { emoji: '🕌', nameAr: 'مسجد الغمامة', nameFr: 'Masjid Al-Ghamamah', desc: "Lieu de la prière de l'Aïd du Prophète ﷺ", category: 'HISTORIQUE' as const },
];

const REVIEWS = [
  {
    name: 'Mohammed A.',
    country: 'France',
    flag: '🇫🇷',
    date: 'Mars 2026',
    rating: 5,
    text: "Rachid est bien plus qu'un guide — c'est un véritable compagnon de voyage spirituel. Sa connaissance de la Sîra est encyclopédique et sa pédagogie rend chaque lieu vivant. Je n'aurais jamais autant ressenti la profondeur de ces lieux sans lui.",
  },
  {
    name: 'Khadija M.',
    country: 'Belgique',
    flag: '🇧🇪',
    date: 'Janvier 2026',
    rating: 5,
    text: "Voyage en famille avec 4 enfants — Rachid a su adapter le rythme et le discours à chacun. Les enfants ont adoré les anecdotes historiques qu'il racontait en marchant. Disponible à toute heure, discret et bienveillant. Je recommande vivement.",
  },
  {
    name: 'Youssef K.',
    country: 'Suisse',
    flag: '🇨🇭',
    date: 'Novembre 2025',
    rating: 5,
    text: "La montée de Jabal Nour avec Rachid reste le moment le plus fort de ma vie. Il nous a récité les premiers versets de la sourate Al-Alaq au sommet. Un frisson que je n'oublierai jamais. Organisation parfaite, ponctualité impeccable.",
  },
  {
    name: 'Amina B.',
    country: 'Canada',
    flag: '🇨🇦',
    date: 'Octobre 2025',
    rating: 5,
    text: "Premier voyage à La Mecque, beaucoup d'appréhension. Rachid m'a tout de suite mise à l'aise avec son calme et sa bienveillance. Il a géré la foule au Haram avec une maîtrise remarquable. Le forfait \"Omra & Histoire\" valait vraiment l'investissement.",
  },
  {
    name: 'Ibrahim D.',
    country: 'Sénégal',
    flag: '🇸🇳',
    date: 'Ramadan 2025',
    rating: 4,
    text: "Excellente expérience dans l'ensemble. Rachid parle français avec un niveau académique impressionnant. La visite de Badr m'a particulièrement touché — il connaît le nom de chaque Compagnon enterré là-bas. Petite suggestion : prévoir plus de temps à la Rawdah.",
  },
];

// ─── Guide Data ────────────────────────────────────────────────────────────────

const GUIDES: Record<string, {
  name: string;
  initials: string;
  location: string;
  experience: number;
  rating: number;
  reviewCount: number;
  pilgrimsCount: string;
  returnRate: number;
  speciality: string;
  isWoman?: boolean;
  languages: string[];
  shortBio: string;
  bioFull: string[];
  certifications: string[];
  services: string[];
  gradient: string;
}> = {
  'rachid-al-madani': {
    name: 'Cheikh Rachid Al-Madani',
    initials: 'RA',
    location: 'Makkah · Madinah',
    experience: 14,
    rating: 4.97,
    reviewCount: 214,
    pilgrimsCount: '2 400+',
    returnRate: 91,
    speciality: 'Spécialiste de la Sîra prophétique',
    languages: ['🇫🇷 Français', '🇸🇦 Arabe', '🇬🇧 English'],
    shortBio:
      "Guide certifié basé à Madinah depuis 12 ans. Passionné par l\'histoire islamique et la transmission du savoir avec douceur et bienveillance. J\'accompagne chaque pèlerin comme s\'il s\'agissait de ma propre famille.",
    bioFull: [
      "Né à Lyon, Rachid Al-Madani a grandi dans une famille pratiquante avant de partir étudier les sciences islamiques à l\'Université Islamique de Médine, où il a obtenu un Master avec mention. C\'est là qu\'il a développé sa passion pour la Sîra prophétique et pour la transmission vivante de l\'histoire des Lieux Saints.",
      "Depuis 2013, il accompagne des pèlerins francophones en provenance de France, de Belgique, du Canada et d\'Afrique de l\'Ouest. Sa méthode pédagogique unique mêle récits historiques, exégèse coranique et méditation contemplative au cœur même des lieux visités.",
      "Spécialiste reconnu de la montagne de la Lumière et des sites de la Sîra, Rachid a développé des circuits thématiques originaux qui permettent aux pèlerins de vivre une expérience spirituelle profonde plutôt qu\'un simple passage touristique.",
      "Sa maîtrise de l\'arabe littéraire et dialectal lui permet de faciliter les démarches administratives sur place et de communiquer avec les autorités saoudiennes. Il est également certifié en secourisme avancé pour assurer la sécurité de son groupe en toutes circonstances.",
    ],
    certifications: [
      'Master en Sciences Islamiques — Université Islamique de Médine',
      "Licence officielle de Guide Mutawwif — Ministère du Hajj et de l\'Omra",
      'Certification Secourisme Avancé — Croissant Rouge Saoudien',
      'Attestation Protocole PMR — Autorité de Masjid Al-Haram',
    ],
    services: [
      'Voiture privée 7 places',
      'Train Haramayn inclus',
      "Livret du\'a illustré",
      'Transferts aéroport',
      'Disponibilité 24h/24',
      'Démarches administratives',
      'Accompagnement PMR',
      'Album photo souvenir',
    ],
    gradient: 'linear-gradient(135deg, #F0D897, #C9A84C)',
  },

  'fatima-al-omari': {
    name: 'Ustadha Fatima Al-Omari',
    initials: 'FA',
    location: 'Makkah',
    experience: 8,
    rating: 4.95,
    reviewCount: 178,
    pilgrimsCount: '860+',
    returnRate: 87,
    speciality: 'Guide femme · Spécialiste familles',
    isWoman: true,
    languages: ['🇫🇷 Français', '🇲🇦 Darija', '🇹🇷 Türkçe'],
    shortBio:
      'Guide certifiée et femme au parcours exceptionnel. Fatima accompagne les femmes seules et les familles avec une approche bienveillante et rassurante, idéale pour un premier voyage à La Mecque.',
    bioFull: [
      "Fatima Al-Omari, diplômée en études islamiques de l\'Université Mohammed VI de Rabat, a rejoint l\'équipe des guides mutawwif de Makkah en 2017, devenant l\'une des premières femmes francophones certifiées dans ce domaine.",
      'Sa spécialité : accompagner les femmes voyageant seules ou en groupe féminin, ainsi que les familles avec de jeunes enfants. Son approche douce et structurée crée un cadre rassurant pour les pèlerins à leur premier voyage.',
      "Elle maîtrise parfaitement les rituels féminins de l\'Omra et est habituée à accompagner des groupes aux besoins variés, y compris des personnes âgées ou à mobilité réduite.",
      'Fatima propose également des ateliers de préparation spirituelle en ligne avant le départ, pour que chaque pèlerin arrive bien préparé et serein.',
    ],
    certifications: [
      'Licence en Études Islamiques — Université Mohammed VI, Rabat',
      "Guide Mutawwif certifiée — Ministère du Hajj et de l\'Omra",
      'Formation Accompagnement Femmes Seules — Centre islamique de Makkah',
      'Certification Premiers Secours — Croissant Rouge Saoudien',
    ],
    services: [
      'Guide femme certifiée',
      'Groupes 100% féminins',
      'Familles et enfants',
      "Livret du\'a illustré",
      'Transferts aéroport',
      'Disponibilité 24h/24',
      'Préparation spirituelle en ligne',
      'Accompagnement PMR',
    ],
    gradient: 'linear-gradient(135deg, #9FE1CB, #1D9E75)',
  },

  'youssouf-konate': {
    name: 'Cheikh Youssouf Konaté',
    initials: 'YK',
    location: 'Makkah',
    experience: 6,
    rating: 4.88,
    reviewCount: 94,
    pilgrimsCount: '620+',
    returnRate: 84,
    speciality: "Guide Afrique de l\'Ouest · Multilangues",
    languages: ['🇫🇷 Français', '🇸🇳 Wolof', '🎵 Bambara'],
    shortBio:
      "Originaire de Dakar, Youssouf est la référence des pèlerins d\'Afrique de l\'Ouest. Il combine rigueur académique et chaleur humaine pour un accompagnement à la fois savant et fraternel.",
    bioFull: [
      'Né à Dakar dans une famille de tradition soufie, Youssouf Konaté a étudié les sciences islamiques à Touba puis à Makkah. Il guide depuis 2015 des pèlerins originaires du Sénégal, de Guinée, du Mali, du Burkina Faso et de la diaspora africaine en Europe.',
      "Sa connaissance du Wolof et des cultures ouest-africaines lui permet d\'établir une connexion unique avec ses pèlerins. Il adapte ses explications aux références culturelles de chaque groupe, rendant les enseignements immédiatement accessibles et profonds.",
      'Youssouf est particulièrement reconnu pour ses récits vivants des grandes figures islamiques africaines et leur lien avec les Lieux Saints. Il a co-écrit un guide de pèlerinage en wolof avec translittération française.',
      "Son calme légendaire dans la foule du Haram et sa connaissance des heures creuses lui permettent d\'optimiser chaque visite pour le bien-être de son groupe.",
    ],
    certifications: [
      "Diplôme d\'études islamiques — Institut Islamique de Touba",
      "Guide Mutawwif certifié — Ministère du Hajj et de l\'Omra",
      'Certification Accompagnement Multiculturel — ISESCO',
      'Secourisme de Base — Croissant Rouge Saoudien',
    ],
    services: [
      'Voiture privée 7 places',
      "Livret du\'a en Wolof/Français",
      'Transferts aéroport',
      'Disponibilité 24h/24',
      'Groupes mixtes',
      'Cuisines halal africaines',
      'Préparation spirituelle',
      'Certificat de pèlerinage',
    ],
    gradient: 'linear-gradient(135deg, #F7D774, #E8A020)',
  },

  'abdullah-ben-yusuf': {
    name: 'Cheikh Abdullah Ben Yusuf',
    initials: 'AB',
    location: 'Madinah',
    experience: 11,
    rating: 4.93,
    reviewCount: 147,
    pilgrimsCount: '1 100+',
    returnRate: 92,
    speciality: 'Expert Madinah · Doctorat Sciences Islamiques',
    languages: ['🇫🇷 Français', '🇸🇦 Arabe'],
    shortBio:
      'Le guide le mieux noté de Madinah avec un doctorat en sciences islamiques. Abdullah transforme chaque visite en expérience spirituelle profonde grâce à une érudition rare et une humilité exemplaire.',
    bioFull: [
      "Cheikh Abdullah Ben Yusuf est titulaire d\'un Doctorat en Sciences du Hadith de l\'Université Islamique de Médine, où il a été formé par des érudits de renommée mondiale. Il guide depuis 2009 et reste l\'un des rares guides à avoir une formation académique de ce niveau.",
      "Sa spécialité absolue est la ville de Madinah : il connaît l\'histoire de chaque rue, chaque mosquée, et peut réciter les hadiths relatifs à chaque lieu en arabe et en français. Ses visites de la Rawdah sont réputées comme les plus émouvantes du secteur.",
      "Abdullah a développé un programme d\'immersion \"Madinah Profonde\" qui prend deux jours complets et couvre des sites rarement visités, notamment Masjid Al-Ijaba et les puits sacrés aux alentours de la ville.",
      'Sa pédagogie douce, son absence totale de précipitation et sa connexion personnelle avec chaque pèlerin lui valent un taux de recommandation de 98%. Il est régulièrement sollicité pour des conférences en Europe sur la spiritualité islamique.',
    ],
    certifications: [
      'Doctorat en Sciences du Hadith — Université Islamique de Médine',
      "Guide Mutawwif Senior — Ministère du Hajj et de l\'Omra (15 ans)",
      'Ijaza en récitation coranique (Hafs)',
      'Certification Secourisme Avancé — Croissant Rouge Saoudien',
    ],
    services: [
      'Voiture de prestige incluse',
      'Train Haramayn inclus',
      "Livret du\'a avec hadiths",
      'Transferts VIP aéroport',
      'Disponibilité 24h/24',
      'Cours arabe de voyage',
      'Accompagnement PMR',
      'Visites exclusives',
    ],
    gradient: 'linear-gradient(135deg, #A8C8F0, #1A4A8A)',
  },

  'samira-al-rashidi': {
    name: 'Samira Al-Rashidi',
    initials: 'SR',
    location: 'Madinah',
    experience: 5,
    rating: 4.91,
    reviewCount: 76,
    pilgrimsCount: '420+',
    returnRate: 86,
    speciality: 'Spécialiste PMR · Madinah',
    isWoman: true,
    languages: ['🇫🇷 Français', '🇹🇳 Tunisien', '🇸🇦 Arabe'],
    shortBio:
      "La spécialiste PMR de Madinah. Samira a développé des protocoles d\'accompagnement adaptés aux personnes à mobilité réduite, aux seniors et aux malades, avec une attention et une douceur inégalées.",
    bioFull: [
      "Samira Al-Rashidi, Tunisienne installée à Madinah depuis 2014, s\'est spécialisée dans l\'accompagnement des personnes à mobilité réduite après avoir vécu l\'expérience difficile de son propre père lors d\'un pèlerinage. Elle a depuis développé des protocoles précis pour rendre le pèlerinage accessible à tous.",
      'Sa formation en kinésithérapie combinée à sa licence islamique lui donne une double compétence unique : elle sait anticiper les besoins médicaux de ses pèlerins tout en offrant un accompagnement spirituel de qualité.',
      'Samira travaille avec un réseau de prestataires spécialisés : fauteuils roulants motorisés, pousseurs agréés au Haram, hôtels avec chambres adaptées à moins de 200m du Masjid An-Nabawi.',
      "Elle est également réputée pour ses soirées de du\'a collectives le long de la Rawdah, des moments que ses pèlerins décrivent comme les plus beaux de leur vie.",
    ],
    certifications: [
      'Licence en Études Islamiques — Institut Supérieur de Théologie de Tunis',
      "Guide Mutawwif certifiée — Ministère du Hajj et de l\'Omra",
      'Diplôme de Kinésithérapie — ISSPL Tunis',
      'Certification Accompagnement PMR en lieux saints — Autorité du Haram',
    ],
    services: [
      'Fauteuil roulant motorisé',
      'Pousseur agréé Haram',
      'Hôtel adapté PMR',
      'Transferts véhicule PMR',
      'Disponibilité 24h/24',
      'Soins médicaux de base',
      "Livret du\'a grand format",
      'Accompagnement seniors',
    ],
    gradient: 'linear-gradient(135deg, #F0A8C0, #A81D5C)',
  },
};

// ─── Page ──────────────────────────────────────────────────────────────────────

export default async function GuideProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const guide = GUIDES[slug];

  if (!guide) {
    notFound();
  }

  return (
    <>
      <Navbar />

      {/* HERO */}
      <section style={{
        background: 'var(--deep)',
        paddingTop: '8rem',
        paddingBottom: '4rem',
        paddingLeft: '2rem',
        paddingRight: '2rem',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Ambient glow */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse 60% 80% at 50% 0%, rgba(201,168,76,0.12) 0%, transparent 65%)',
          pointerEvents: 'none',
        }}></div>

        {/* Avatar */}
        <div style={{
          width: '110px',
          height: '110px',
          borderRadius: '50%',
          background: guide.gradient,
          margin: '0 auto 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'var(--font-cormorant), serif',
          fontSize: '2.5rem',
          fontWeight: 700,
          color: 'var(--deep)',
          position: 'relative',
          zIndex: 1,
          boxShadow: '0 0 0 4px rgba(201,168,76,0.25), 0 16px 48px rgba(0,0,0,0.3)',
        }}>
          {guide.initials}
        </div>

        {/* Name */}
        <h1 style={{
          fontFamily: 'var(--font-cormorant), serif',
          fontSize: 'clamp(2rem, 4vw, 3rem)',
          fontWeight: 400,
          color: 'white',
          marginBottom: '0.5rem',
          position: 'relative',
          zIndex: 1,
          lineHeight: 1.15,
        }}>
          {guide.name}
        </h1>

        {/* Speciality */}
        <div style={{
          fontSize: '0.78rem',
          fontWeight: 700,
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          color: 'var(--gold)',
          marginBottom: '0.6rem',
          position: 'relative',
          zIndex: 1,
        }}>
          {guide.speciality}
        </div>

        {/* Rating */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          marginBottom: '1.25rem',
          position: 'relative',
          zIndex: 1,
        }}>
          <span style={{ color: 'var(--gold)', letterSpacing: '2px', fontSize: '1rem' }}>★★★★★</span>
          <span style={{ color: 'white', fontWeight: 700, fontSize: '0.9rem' }}>{guide.rating}</span>
          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.82rem' }}>({guide.reviewCount} avis)</span>
        </div>

        {/* Short bio */}
        <p style={{
          color: 'rgba(255,255,255,0.65)',
          fontSize: '0.95rem',
          maxWidth: '580px',
          margin: '0 auto 2rem',
          lineHeight: 1.85,
          position: 'relative',
          zIndex: 1,
        }}>
          {guide.shortBio}
        </p>

        {/* Stats row */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          justifyContent: 'center',
          flexWrap: 'wrap',
          marginBottom: '2rem',
          position: 'relative',
          zIndex: 1,
        }}>
          {[
            { value: String(guide.reviewCount), label: 'Avis vérifiés' },
            { value: guide.pilgrimsCount, label: 'Pèlerins accompagnés' },
            { value: `${guide.experience} ans`, label: 'Expérience' },
            { value: `${guide.returnRate}%`, label: 'Taux de retour' },
          ].map((stat, i) => (
            <div key={i} style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(201,168,76,0.2)',
              borderRadius: '14px',
              padding: '1rem 1.5rem',
              textAlign: 'center',
              minWidth: '110px',
            }}>
              <div style={{
                fontFamily: 'var(--font-cormorant), serif',
                fontSize: '1.6rem',
                fontWeight: 700,
                color: 'var(--gold-light)',
                lineHeight: 1,
                marginBottom: '0.25rem',
              }}>
                {stat.value}
              </div>
              <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.45)', fontWeight: 600, letterSpacing: '0.05em' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Language chips */}
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          justifyContent: 'center',
          flexWrap: 'wrap',
          position: 'relative',
          zIndex: 1,
        }}>
          {guide.languages.map((lang, i) => (
            <span key={i} style={{
              padding: '0.3rem 0.9rem',
              borderRadius: '50px',
              background: i === 0 ? 'var(--gold)' : 'rgba(255,255,255,0.08)',
              color: i === 0 ? 'var(--deep)' : 'rgba(255,255,255,0.75)',
              fontWeight: i === 0 ? 700 : 500,
              fontSize: '0.78rem',
              border: i === 0 ? 'none' : '1px solid rgba(255,255,255,0.15)',
            }}>
              {lang}
            </span>
          ))}
          {guide.location && (
            <span style={{
              padding: '0.3rem 0.9rem',
              borderRadius: '50px',
              background: 'rgba(255,255,255,0.08)',
              color: 'rgba(255,255,255,0.75)',
              fontSize: '0.78rem',
              border: '1px solid rgba(255,255,255,0.15)',
            }}>
              📍 {guide.location}
            </span>
          )}
        </div>
      </section>

      {/* MAIN CONTENT — client component handles tabs + booking widget */}
      <div style={{ background: 'var(--cream)', minHeight: '60vh' }}>
        <GuideProfileClient
          slug={slug}
          guideName={guide.name}
          packages={PACKAGES}
          places={PLACES}
          reviews={REVIEWS}
          certifications={guide.certifications}
          services={guide.services}
          bioFull={guide.bioFull}
        />
      </div>

      <Footer />
    </>
  );
}
