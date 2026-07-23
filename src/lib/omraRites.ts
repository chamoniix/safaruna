export interface Dua {
  label: string;
  ar: string;
  phon: string;
  fr: string;
}

export interface KeyFact {
  title: string;
  body: string;
}

export interface RiteStep {
  num: string;
  title: string;
  body: string;
}

export interface OmraRite {
  id: 'miqat' | 'ihram' | 'arrivee' | 'tawaf' | 'sai' | 'tahallul';
  title: string;
  nameAr: string;
  intro: string[];
  keyFacts: KeyFact[];
  steps?: RiteStep[];
  duas: Dua[];
  afterNote?: string;
}

export const OMRA_RITES: OmraRite[] = [
  {
    id: 'miqat',
    title: 'Le Miqat et la Niyyah',
    nameAr: 'الميقات والنية',
    intro: [
      "Le Miqat est la frontière sacrée au-delà de laquelle un pèlerin ne peut pénétrer sans être en état d'Ihram. Pour un pèlerin partant de Madinah, ce point est Dhul Hulayfah — connu localement sous le nom de Bir Ali, à environ 12 km de la ville. Un pèlerin arrivant directement par l'aéroport de Jeddah doit revêtir l'Ihram chez lui ou dans l'avion.",
      "Il est permis de revêtir la tenue d'Ihram dès l'hôtel, avant même d'arriver au Miqat.",
    ],
    keyFacts: [
      { title: 'La prière recommandée', body: "Il est recommandé d'accomplir une prière au Miqat avant de formuler l'intention, lorsque l'occasion se présente." },
    ],
    duas: [
      {
        label: 'La Niyyah — formulée debout, face à la Qibla',
        ar: 'لَبَّيْكَ اللَّهُمَّ بِعُمْرَةٍ',
        phon: "Labbayka Allahumma bi'Umrah",
        fr: "« Mon Seigneur, j'accours à Ton appel pour accomplir une Omra. »",
      },
      {
        label: "Clause optionnelle, pour celui qui craint un empêchement",
        ar: 'اللَّهُمَّ مَحِلِّي حَيْثُ حَبَسْتَنِي',
        phon: 'Allahumma mahilli haythu habastani',
        fr: "« Mon Seigneur, je me désacraliserai là où Tu m'arrêteras. »",
      },
      {
        label: 'La Talbiyah — à réciter à voix haute tout le long du trajet',
        ar: 'لَبَّيْكَ اللَّهُمَّ لَبَّيْكَ، لَبَّيْكَ لَا شَرِيكَ لَكَ لَبَّيْكَ، إِنَّ الْحَمْدَ وَالنِّعْمَةَ لَكَ وَالْمُلْكَ، لَا شَرِيكَ لَكَ',
        phon: "Labbayka Allahumma labbayk, labbayka la charika laka labbayk, inna al-hamda wa an-ni'mata laka wal-mulk, la charika lak",
        fr: "« Je réponds à Ton appel, ô Allah ! Je réponds à Ton appel. Tu n'as point d'associé. La louange et le bienfait T'appartiennent, ainsi que la royauté. Tu n'as point d'associé. »",
      },
    ],
    afterNote: "Il est permis d'ajouter parfois, entre deux Talbiyah, le Tahlil : « La ilaha illa Allah » (nul n'est digne d'adoration si ce n'est Allah). Une fois les habitations de Makkah aperçues, le pèlerin cesse la Talbiyah.",
  },
  {
    id: 'ihram',
    title: "L'Ihram",
    nameAr: 'الإحرام',
    intro: [
      "L'Ihram est l'état de sacralisation dans lequel le pèlerin entre pour accomplir la Omra. Avant de l'enfiler, il est recommandé de faire les grandes ablutions, de s'épiler, de se couper les ongles, de tailler sa moustache et de se parfumer.",
    ],
    keyFacts: [
      { title: 'Tenue des hommes', body: "Deux pièces de tissu non cousu : l'Izar autour de la taille, le Rida sur le buste, de préférence blanches, avec des sandales." },
      { title: 'Tenue des femmes', body: "La femme porte les habits qu'elle souhaite, sans gants et sans se couvrir le visage directement." },
      { title: 'Les interdits', body: "Se raser ou se couper les cheveux et les ongles, porter un vêtement cousu à sa mesure (hors exception pour les femmes), se couvrir la tête directement (un parapluie reste permis contre le soleil), se parfumer à nouveau, chasser, et tout ce qui touche au mariage ou à l'acte conjugal." },
      { title: 'Quatre niveaux de gravité', body: "Les cinq premiers interdits se rachètent sans annuler la Omra ; la chasse impose un sacrifice équivalent ; les préliminaires conjugaux demandent une compensation ; seul le rapport charnel complet annule le rite, sans possibilité de rachat." },
    ],
    duas: [],
  },
  {
    id: 'arrivee',
    title: 'Arrivée à Makkah',
    nameAr: 'الوصول إلى مكة',
    intro: [
      "Il est souhaitable de faire les grandes ablutions avant d'entrer à Makkah, et d'y entrer en plein jour si possible. Dès que ses affaires sont déposées à l'hôtel, le pèlerin se dirige directement vers Masjid Al-Haram, en entrant si possible par la porte de Banou Chayba, le pied droit en premier.",
      "Dès qu'il voit la Kaaba, il peut lever les mains pour invoquer librement — il n'y a pas d'invocation précise à ce moment, mais on rapporte qu'Omar (رضي الله عنه) disait la du'a ci-dessous.",
    ],
    keyFacts: [],
    duas: [
      {
        label: "En entrant dans Masjid Al-Haram, pied droit en premier",
        ar: 'اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَسَلِّمْ، اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ',
        phon: 'Allahumma salli ala Mohammadin wa sallim, Allahumma iftah li abwaba rahmatika',
        fr: "« Que la paix et le salut d'Allah soient sur Mohammed, ô Allah ouvre-moi les portes de Ta miséricorde. »",
      },
      {
        label: 'En voyant la Kaaba pour la première fois (du\'a rapportée d\'Omar رضي الله عنه)',
        ar: 'اللَّهُمَّ أَنْتَ السَّلاَمُ، وَمِنْكَ السَّلاَمُ، فَحَيِّنَا رَبَّنَا بِالسَّلاَمِ',
        phon: 'Allahumma anta as-salam, wa minka as-salam, fa hayyina rabbana bis-salam',
        fr: "« Ô Allah, Tu es la Paix, et de Toi vient la paix. Fais-nous vivre, ô notre Seigneur, dans la paix. »",
      },
    ],
  },
  {
    id: 'tawaf',
    title: 'Le Tawaf',
    nameAr: 'الطواف',
    intro: [
      "Le Tawaf consiste à effectuer sept tours autour de la Kaaba, en la gardant à sa gauche, en commençant et terminant chaque tour au niveau de la Pierre Noire (Al-Hajar Al-Aswad).",
      "Avant de commencer, l'homme découvre son épaule droite en passant le Rida sous son aisselle droite puis en le jetant sur l'épaule gauche (Al-Idtiba') — un geste propre à ce premier Tawaf, à ne pas reproduire ensuite.",
    ],
    keyFacts: [
      { title: 'Sens et repère', body: "Sens antihoraire, la Kaaba à gauche, en passant derrière Al-Hijr. Chaque passage devant la Pierre Noire compte pour un tour (Chawt)." },
      { title: 'Ar-Raml, les 3 premiers tours', body: "Les trois premiers tours de ce Tawaf s'effectuent d'un pas rapide (uniquement pour ce premier Tawaf) ; les quatre suivants d'un pas normal." },
      { title: 'Le coin yéménite', body: "Il est recommandé de toucher le coin yéménite (Ar-Roukn Al-Yamani) à chaque passage, sans l'embrasser. S'il n'est pas possible de le toucher, on ne lui fait pas non plus de signe." },
      { title: 'Le Moultazam', body: "L'espace entre la Pierre Noire et la porte de la Kaaba. Il est permis de s'y tenir pour invoquer, en y posant la poitrine, le visage, les avant-bras et les mains." },
    ],
    duas: [
      {
        label: "Face à la Pierre Noire — au premier passage",
        ar: 'بِسْمِ اللَّهِ، اللَّهُ أَكْبَرُ',
        phon: 'Bismillah, Allahou Akbar',
        fr: "« Au nom d'Allah, Allah est le Plus Grand. » La toucher ou l'embrasser si possible ; sinon lui faire signe de la main sans bousculer personne. Aux six tours suivants, seul « Allahou Akbar » est dit, sans « Bismillah ».",
      },
      {
        label: 'Entre le coin yéménite et la Pierre Noire',
        ar: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ',
        phon: "Rabbana atina fi dounya hassanatan wa fil akhirati hassanatan wa qina 'adhaba an-nar",
        fr: "« Notre Seigneur, accorde-nous le bien ici-bas et dans l'au-delà, et préserve-nous du châtiment du Feu. »",
      },
      {
        label: 'En se dirigeant vers la Station d\'Ibrahim (Maqam Ibrahim), après le 7e tour',
        ar: 'وَاتَّخِذُوا مِن مَّقَامِ إِبْرَاهِيمَ مُصَلًّى',
        phon: "Wa attakhidhou min maqami Ibrahima moussalla",
        fr: "« Et adoptez pour lieu de prière le lieu où Ibrahim se tint debout. » (Al-Baqarah, 2:125)",
      },
    ],
    afterNote: "En dehors de ces invocations, le Tawaf n'impose aucune formule fixe à chaque tour — le pèlerin invoque librement ou récite le Coran. Une fois les sept tours achevés, il couvre à nouveau son épaule, se rend derrière la Station d'Ibrahim pour y réciter le verset ci-dessus et accomplir deux rak'ah (Al-Kafiroun puis Al-Ikhlas), boit l'eau de Zamzam, puis revient à la Pierre Noire en disant « Allahou Akbar ».",
  },
  {
    id: 'sai',
    title: "As-Sa'i",
    nameAr: 'السعي',
    intro: [
      "Le Sa'i se déroule entre les monts Safa et Marwa, en mémoire de Hajar courant à la recherche d'eau pour son fils Ismaël. Il se pratique après le Tawaf.",
      "En approchant de Safa pour la première fois, le pèlerin récite le verset ci-dessous — une seule fois, non répété à chaque passage.",
    ],
    keyFacts: [
      { title: 'Sept trajets', body: "Safa → Marwa compte pour un trajet. Le septième et dernier se termine sur Marwa." },
      { title: 'Le passage accéléré', body: "Entre les deux repères verts, une légère accélération du pas est recommandée pour les hommes." },
    ],
    duas: [
      {
        label: 'En approchant de Safa pour la première fois',
        ar: 'إِنَّ الصَّفَا وَالْمَرْوَةَ مِنْ شَعَائِرِ اللَّهِ، فَمَنْ حَجَّ الْبَيْتَ أَوِ اعْتَمَرَ فَلَا جُنَاحَ عَلَيْهِ أَن يَطَّوَّفَ بِهِمَا، وَمَن تَطَوَّعَ خَيْرًا فَإِنَّ اللَّهَ شَاكِرٌ عَلِيمٌ',
        phon: "Inna as-Safa wal-Marwata min cha'a'iri Llah, faman hajja al-bayta awi'tamara fala jounaha 'alayhi an yatawafa bihima, wa man tatawa'a khayran fa inna Llaha chakiroun 'alim",
        fr: "« Certes, Safa et Marwa sont parmi les lieux sacrés d'Allah. Quiconque fait le pèlerinage à la Maison ou fait la Omra ne commet pas de péché en faisant le va-et-vient entre ces deux monts. Et quiconque fait de son propre gré une bonne œuvre, alors Allah est Reconnaissant, Omniscient. » (Al-Baqarah, 2:158) — suivi de « Nabda'u bima bada'a Llahou bihi » (je commence par ce par quoi Allah a commencé).",
      },
      {
        label: 'Sur chaque mont, face à la Kaaba — répété trois fois',
        ar: 'اللَّهُ أَكْبَرُ، اللَّهُ أَكْبَرُ، اللَّهُ أَكْبَرُ، لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، يُحْيِي وَيُمِيتُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
        phon: "Allahou Akbar, Allahou Akbar, Allahou Akbar, la ilaha illa Llahou wahdahou la charika lahou, lahou al-moulkou wa lahou al-hamdou, youhyi wa youmit, wa houwa 'ala koulli chay'in qadir",
        fr: "« Allah est le Plus Grand » (trois fois). « Il n'y a de divinité digne d'adoration qu'Allah, Seul, sans associé, à Lui la royauté et la louange, Il donne la vie et la mort, et Il est capable de toute chose. » Puis invocations libres, mains levées, répété trois fois en tout sur chaque mont.",
      },
    ],
    afterNote: "Ce verset et la formule « Nabda'u bima bada'a Llahou bihi » ne se récitent qu'à la première approche de Safa, non à chaque passage. En dehors de cela, le Sa'i n'a pas d'invocation spécifique — le pèlerin invoque librement. L'invocation « Allahumma ghfir wa rham, innaka anta al-a'azzou al-akram » (Ô Allah, pardonne et fais miséricorde, Tu es le Plus Puissant, le Plus Généreux) est permise, car plusieurs Compagnons la disaient.",
  },
  {
    id: 'tahallul',
    title: 'Fin de la Omra',
    nameAr: 'التحلل',
    intro: [
      "Une fois le septième trajet du Sa'i terminé, le pèlerin se raccourcit les cheveux sur toute la tête, ou les rase s'il enchaîne sur un Hajj proche et que le temps restant permet à ses cheveux de repousser. La femme coupe une mèche, l'équivalent d'une phalangette.",
      "La Omra est alors accomplie, et le pèlerin se désacralise.",
    ],
    keyFacts: [],
    duas: [],
  },
];
