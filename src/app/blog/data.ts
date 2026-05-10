export type BlogArticle = {
  slug: string;
  category: string;
  categoryColor: string;
  categoryBg: string;
  title: string;
  excerpt: string;
  description: string;
  readTime: string;
  date: string;
  publishedAt: string;
  updatedAt?: string;
  author: string;
  authorRole: string;
  featured: boolean;
  keywords: string[];
  image?: string;
};

export const BLOG_ARTICLES_LIST: BlogArticle[] = [
  {
    slug: 'comment-preparer-omra-10-etapes',
    category: 'Préparation',
    categoryColor: '#1D5C3A',
    categoryBg: 'rgba(29,92,58,0.1)',
    title: 'Comment préparer son Omra en 10 étapes',
    excerpt: "De l'intention à l'atterrissage : le guide complet pour que rien ne soit laissé au hasard. Visa, ihram, rituels, santé, spiritualité — 10 étapes pour une Omra sereine.",
    description: "Visa, ihram, rituels, santé, spiritualité — 10 étapes pour préparer son Omra sereinement. Le guide complet pour pèlerins francophones, par une guide certifiée SAFARUMA.",
    readTime: '10 min',
    date: '28 mars 2026',
    publishedAt: '2026-03-28T08:00:00+03:00',
    author: 'Fatima Al-Omari',
    authorRole: 'Guide certifiée · Makkah',
    featured: true,
    keywords: ['préparer omra', 'checklist omra', 'omra étapes', 'première omra', 'visa omra nusuk', 'ihram omra', 'rituels omra'],
  },
  {
    slug: 'les-7-tours-du-tawaf',
    category: 'Spiritualité',
    categoryColor: '#5A2D82',
    categoryBg: 'rgba(90,45,130,0.1)',
    title: 'Les 7 tours du Tawaf : sens et spiritualité',
    excerpt: "Pourquoi 7 tours ? Quel est le sens de chaque passage devant la Pierre Noire ? Ce que les savants disent de ce rite millénaire et comment le vivre de l'intérieur.",
    description: "Sens du Tawaf : pourquoi 7 tours autour de la Kaaba, Pierre Noire, Maqam Ibrahim, du'as. Ce que les savants islamiques disent de ce rite millénaire de la Omra.",
    readTime: '8 min',
    date: '20 mars 2026',
    publishedAt: '2026-03-20T09:00:00+03:00',
    author: 'Abdullah Ben Yusuf',
    authorRole: 'Docteur en Sciences Islamiques · Madinah',
    featured: false,
    keywords: ['tawaf', '7 tours kaaba', 'rituel omra', 'pierre noire', 'hajar al-aswad', 'maqam ibrahim', 'tawaf sens spirituel'],
  },
  {
    slug: 'jabal-uhud-bataille-islam',
    category: 'Histoire',
    categoryColor: '#8B2A1A',
    categoryBg: 'rgba(139,42,26,0.1)',
    title: "Jabal Uhud : la bataille qui a forgé l'Islam",
    excerpt: "Le mont Uhud n'est pas qu'une montagne. C'est le lieu où le Prophète ﷺ a pleuré ses compagnons tombés. L'histoire, la géographie, la visite — tout ce qu'il faut savoir.",
    description: "Bataille d'Uhud, 625 ap. J.-C. : contexte, martyrs, blessure du Prophète ﷺ et leçon spirituelle. Guide de visite de Jabal Uhud à Madinah avec un guide certifié.",
    readTime: '9 min',
    date: '12 mars 2026',
    publishedAt: '2026-03-12T08:30:00+03:00',
    author: 'Rachid Al-Madani',
    authorRole: 'Guide certifié · Makkah & Madinah',
    featured: false,
    keywords: ['jabal uhud', 'bataille uhud', 'histoire islam', 'hamza ibn abd al-muttalib', 'martyrs uhud', 'visite médine', 'sahaba'],
  },
  {
    slug: 'guide-visa-omra',
    category: 'Visa & Pratique',
    categoryColor: '#1A4A8A',
    categoryBg: 'rgba(26,74,138,0.1)',
    title: 'Guide visa Omra : la procédure complète Nusuk en 2026',
    excerpt: "Procédure Nusuk étape par étape, documents requis par pays, coûts réels, durée de validité et conduite à tenir en cas de refus — le guide complet pour le pèlerin autonome francophone.",
    description: "Comment obtenir son visa Omra via Nusuk en 2026 : procédure étape par étape, durée, prix, documents requis par pays. Guide expert pour pèlerin autonome.",
    readTime: '10 min',
    date: '5 mars 2026',
    publishedAt: '2026-03-05T09:00:00+03:00',
    updatedAt: '2026-05-10T18:00:00+03:00',
    author: 'Youssouf Konaté',
    authorRole: 'Guide certifié · Madinah',
    featured: false,
    keywords: ['visa omra', 'nusuk', 'visa omra 2026', 'demande visa omra', 'validité visa omra', 'prix visa omra', 'visa électronique omra', 'documents visa omra', 'visa omra france', 'visa omra maroc', 'visa omra algérie'],
  },
  {
    slug: 'difference-omra-hajj',
    category: 'Éducation',
    categoryColor: '#8B6914',
    categoryBg: 'rgba(201,168,76,0.1)',
    title: 'Quelle est la différence entre Omra et Hajj ?',
    excerpt: "Obligatoire ou facultatif ? Quels rituels sont partagés, lesquels sont propres au Hajj ? Une explication claire, fondée sur les textes, pour mieux comprendre les deux grands pèlerinages.",
    description: "Omra vs Hajj : rituels communs, rites propres au Hajj (Arafat, Mina, Djamarat), statut obligatoire ou facultatif. Explication fondée sur les textes islamiques.",
    readTime: '6 min',
    date: '25 février 2026',
    publishedAt: '2026-02-25T09:00:00+03:00',
    author: 'Samira Al-Rashidi',
    authorRole: 'Guide certifiée · Makkah',
    featured: false,
    keywords: ['omra vs hajj', 'différence omra hajj', 'pèlerinage islam', 'hajj obligatoire', 'omra facultatif', 'rituels hajj', 'wuquf arafat'],
  },
];

export const BLOG_ARTICLES: Record<string, BlogArticle> = Object.fromEntries(
  BLOG_ARTICLES_LIST.map(a => [a.slug, a])
);
