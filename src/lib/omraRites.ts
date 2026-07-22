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
  id: 'miqat' | 'ihram' | 'tawaf' | 'sai' | 'tahallul';
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
      "Le Miqat est la frontière sacrée au-delà de laquelle un pèlerin ne peut pénétrer sans être en état d'Ihram. Il en existe cinq, chacun correspondant à une direction d'arrivée vers les lieux saints.",
      "Depuis Madinah, ce point est Dhul Hulayfah — plus connu sous le nom de Bir Ali, à environ 12 km de la ville. Un pèlerin arrivant par avion doit se mettre en Ihram avant de survoler la ligne du Miqat, généralement annoncée par l'équipage.",
    ],
    keyFacts: [
      { title: 'Les 5 Miqats', body: "Dhul Hulayfah (venant de Madinah), Al-Juhfah (Syrie/Égypte), Qarn Al-Manazil (Najd), Yalamlam (Yémen), Dhat Irq (Irak). Chaque pèlerin passe par celui correspondant à son itinéraire." },
      { title: 'La prière recommandée', body: "Avant de formuler la Niyyah, il est recommandé d'accomplir une prière au Miqat lorsque cela est possible, en signe de préparation." },
      { title: "Une clause de sortie", body: "Celui qui craint un empêchement peut, en formulant son intention, ajouter une clause s'en remettant à Allah pour se désacraliser là où il serait bloqué." },
    ],
    duas: [
      {
        label: 'La Niyyah — formulée en se tournant vers la Qibla',
        ar: 'لَبَّيْكَ اللَّهُمَّ بِعُمْرَةٍ',
        phon: "Labbayka Allahumma bi'Umrah",
        fr: "« Me voici, ô Allah, pour accomplir une Omra. »",
      },
      {
        label: 'La Talbiyah — à réciter à voix haute tout le long du trajet',
        ar: 'لَبَّيْكَ اللَّهُمَّ لَبَّيْكَ، لَبَّيْكَ لَا شَرِيكَ لَكَ لَبَّيْكَ، إِنَّ الْحَمْدَ وَالنِّعْمَةَ لَكَ وَالْمُلْكَ، لَا شَرِيكَ لَكَ',
        phon: "Labbayka Allahumma labbayk, labbayka la charika laka labbayk, inna al-hamda wa an-ni'mata laka wal-mulk, la charika lak",
        fr: "« Me voici, Ô Allah, me voici. Me voici, Tu n'as point d'associé, me voici. La louange, le bienfait et la royauté T'appartiennent, Tu n'as point d'associé. »",
      },
    ],
    afterNote: "Une fois les habitations de Makkah aperçues, le pèlerin cesse la Talbiyah pour se consacrer aux rituels qui suivent.",
  },
  {
    id: 'ihram',
    title: "L'Ihram",
    nameAr: 'الإحرام',
    intro: [
      "L'Ihram est l'état de sacralisation dans lequel le pèlerin entre pour accomplir la Omra. Il repose sur une intention sincère, une tenue spécifique, et un ensemble d'interdits à respecter jusqu'au Tahallul.",
      "Avant de l'enfiler, il est recommandé de faire les grandes ablutions, de se couper les ongles et de se parfumer — ce parfum reste toléré sur le corps même après, tant qu'on ne le renouvelle pas.",
    ],
    keyFacts: [
      { title: 'Tenue des hommes', body: "Deux pièces de tissu non cousu : l'Izar autour de la taille, le Rida sur le buste, traditionnellement blanches, avec des sandales laissant les pieds à découvert. La tête reste nue." },
      { title: 'Tenue des femmes', body: "La femme garde ses vêtements habituels couvrants, dans le respect de la pudeur, sans gants ni voile collé directement au visage." },
      { title: 'Les interdits principaux', body: "Se raser ou se couper les cheveux et les ongles, porter un vêtement cousu à sa mesure, se couvrir la tête directement, se parfumer à nouveau, chasser, et tout ce qui touche au mariage ou à l'acte conjugal." },
      { title: 'Quatre niveaux de gravité', body: "La plupart des interdits se rachètent sans annuler la Omra ; la chasse impose un sacrifice équivalent ; les préliminaires conjugaux demandent une compensation ; seul le rapport charnel complet annule le rite sans possibilité de rachat." },
    ],
    steps: [
      { num: '1', title: 'La purification', body: "Faire le Ghousl (grandes ablutions) ou à défaut le Wudu, avant d'enfiler la tenue." },
      { num: '2', title: 'Revêtir la tenue', body: "Il est permis de la revêtir depuis l'hôtel, avant même d'arriver au Miqat — c'est ce que faisaient déjà les Compagnons." },
      { num: '3', title: 'La prière recommandée', body: "Accomplir une prière surérogatoire au Miqat si l'occasion se présente." },
      { num: '4', title: 'La Niyyah et la Talbiyah', body: "Formuler l'intention face à la Qibla, puis entamer la Talbiyah à voix haute." },
    ],
    duas: [],
  },
  {
    id: 'tawaf',
    title: 'Le Tawaf',
    nameAr: 'الطواف',
    intro: [
      "Le Tawaf consiste à effectuer sept tours autour de la Kaaba, en la gardant à sa gauche, en commençant et terminant chaque tour au niveau de la Pierre Noire (Al-Hajar Al-Aswad).",
      "Avant de commencer, l'homme découvre son épaule droite en passant le Rida sous son aisselle (Al-Idtiba') — un geste propre à ce premier Tawaf, à ne pas reproduire dans les suivants.",
    ],
    keyFacts: [
      { title: 'Sens et repère', body: "Sens antihoraire, la Kaaba à gauche. Chaque tour commence et se termine au niveau de la Pierre Noire." },
      { title: "Ar-Raml, les 3 premiers tours", body: "Les trois premiers tours s'effectuent d'un pas rapide pour les hommes lorsque c'est possible ; les quatre suivants d'un pas normal." },
      { title: 'La pureté rituelle', body: "Le Tawaf s'accomplit en état de Wudu. Si les ablutions sont rompues, il faut les refaire et reprendre le tour interrompu." },
      { title: 'Le coin yéménite', body: "Il est recommandé de toucher le coin yéménite (Ar-Roukn Al-Yamani) à chaque passage, sans l'embrasser." },
    ],
    duas: [
      {
        label: 'Face à la Pierre Noire — à chaque passage',
        ar: 'بِسْمِ اللَّهِ، اللَّهُ أَكْبَرُ',
        phon: 'Bismillah, Allahou Akbar',
        fr: "« Au nom d'Allah, Allah est le Plus Grand. » — la toucher ou l'embrasser si possible, sinon lui faire signe de la main sans bousculer personne.",
      },
      {
        label: 'Entre le coin yéménite et la Pierre Noire',
        ar: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ',
        phon: "Rabbana atina fi dounya hassanatan wa fil akhirati hassanatan wa qina 'adhaba an-nar",
        fr: "« Notre Seigneur, accorde-nous le bien ici-bas et dans l'au-delà, et préserve-nous du châtiment du Feu. »",
      },
    ],
    afterNote: "En dehors de ces deux invocations, le Tawaf n'impose aucune formule fixe à chaque tour — le pèlerin invoque librement ou récite le Coran. Une fois les sept tours achevés, il couvre à nouveau son épaule, accomplit deux rak'ah derrière la Station d'Ibrahim (Maqam Ibrahim), puis boit l'eau de Zamzam.",
  },
  {
    id: 'sai',
    title: "As-Sa'i",
    nameAr: 'السعي',
    intro: [
      "Le Sa'i se déroule entre les monts Safa et Marwa, en mémoire de Hajar courant à la recherche d'eau pour son fils Ismaël. Il se pratique après le Tawaf.",
      "Le trajet se parcourt sept fois (Safa→Marwa et Marwa→Safa comptant chacun comme un trajet), le dernier se terminant sur Marwa. Le couloir (Mas'a) mesure environ 394 mètres, soit environ 2 758 mètres parcourus au total.",
    ],
    keyFacts: [
      { title: 'Sept trajets', body: "Safa → Marwa compte pour un trajet. Le septième et dernier se termine sur Marwa." },
      { title: 'Le passage accéléré', body: "Entre les deux repères verts, une légère accélération du pas est recommandée pour les hommes, en souvenir de la course de Hajar." },
      { title: 'La pureté rituelle', body: "Le Sa'i reste valide même sans Wudu selon la majorité des savants, mais être en état de pureté est recommandé." },
      { title: 'Invocation libre', body: "Comme pour le Tawaf, aucune formule n'est imposée entre les deux monts — chacun invoque selon son cœur." },
    ],
    duas: [
      {
        label: 'En approchant de Safa pour la première fois',
        ar: 'إِنَّ الصَّفَا وَالْمَرْوَةَ مِنْ شَعَائِرِ اللَّهِ',
        phon: "Inna as-Safa wal-Marwata min cha'a'iri Llah",
        fr: "« Certes, Safa et Marwa sont parmi les lieux sacrés d'Allah. » (Al-Baqarah, 2:158) — récité une seule fois, non répété à chaque passage.",
      },
      {
        label: 'Sur le mont Safa, face à la Kaaba',
        ar: 'نَبْدَأُ بِمَا بَدَأَ اللَّهُ بِهِ',
        phon: "Nabda'u bima bada'a Llahou bihi",
        fr: "« Je commence par ce par quoi Allah a commencé. » — suivi du Takbir et d'invocations libres, répétés trois fois.",
      },
    ],
  },
  {
    id: 'tahallul',
    title: 'Le Tahallul',
    nameAr: 'التحلل',
    intro: [
      "Le Tahallul — « sortir de l'état sacré » — marque la fin de la Omra. Il s'accomplit juste après le Sa'i.",
      "Une fois le Tahallul accompli, les interdits de l'Ihram sont levés : la Omra est achevée.",
    ],
    keyFacts: [
      { title: 'Pour les hommes', body: "Se raser entièrement la tête (Halq, préférable) ou raccourcir uniformément ses cheveux (Taqsir)." },
      { title: 'Pour les femmes', body: "Couper une mèche de cheveux, l'équivalent d'une phalangette." },
    ],
    duas: [
      {
        label: 'Au moment du Tahallul',
        ar: 'اللَّهُمَّ تَقَبَّلْ مِنِّي',
        phon: 'Allahumma taqabbal minni',
        fr: "« Ô Allah, accepte de moi. »",
      },
    ],
    afterNote: "Le Prophète ﷺ a invoqué trois fois en faveur de ceux qui se rasent la tête, et une seule fois pour ceux qui se contentent de raccourcir leurs cheveux (Bukhari) — le rasage complet reste donc préférable pour les hommes, sans que raccourcir soit invalide.",
  },
];

export const ENTRANCE_DUA: Dua = {
  label: "Du'a d'entrée au Masjid Al-Haram",
  ar: 'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ',
  phon: 'Allahumma iftah li abwaba rahmatik',
  fr: "« Ô Allah, ouvre-moi les portes de Ta miséricorde. »",
};
