import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface Lieu {
  slug: string;
  title: string;
  nameAr: string;
  tag: string;
  tagColor: string;
  description: string;
  history: string;
  dua: string;
  duaTrad: string;
  features: string[];
}

const LIEUX: Record<'Makkah' | 'Madinah', Lieu[]> = {
  Makkah: [
    {
      slug: 'masjid-al-haram',
      title: 'Al-Masjid Al-Haram',
      nameAr: 'المسجد الحرام',
      tag: 'Essentiel · Omra',
      tagColor: '#C9A84C',
      description: "Le plus sacré des sanctuaires de l'Islam, construit par Ibrahim et Ismaël ﷻ sur l'ordre d'Allah. La Kaaba en est le cœur — autour d'elle tournent des millions de pèlerins depuis des millénaires. Une prière au Masjid Al-Haram vaut 100 000 prières ailleurs.",
      history: "Selon la tradition islamique, Ibrahim ﷺ posa les fondations de la Kaaba avec son fils Ismaël ﷺ sur l'emplacement où Adam avait initialement bâti un sanctuaire. Le Prophète Muhammad ﷺ purifia la Kaaba des idoles en 630 de l'ère chrétienne lors de la conquête de Makkah, restaurant son état originel de maison d'Allah.",
      dua: "اللَّهُمَّ أَنْتَ السَّلاَمُ وَمِنْكَ السَّلاَمُ، فَحَيِّنَا رَبَّنَا بِالسَّلاَمِ",
      duaTrad: "Ô Allah, Tu es la Paix et de Toi vient la paix. Fais-nous vivre, ô notre Seigneur, dans la paix.",
      features: ['Tawaf', 'Zamzam', '100 000x la prière'],
    },
    {
      slug: 'jabal-al-nour',
      title: 'Jabal Al-Nour',
      nameAr: 'جبل النور',
      tag: 'Révélation',
      tagColor: '#5A2D82',
      description: "La montagne de la Lumière abrite la Grotte de Hira, où le Prophète ﷺ recevait la révélation. C'est ici que Gabriel ﷺ descendit pour la première fois avec les versets d'Al-Alaq : «Lis au nom de ton Seigneur qui a créé». La montée comprend 1652 marches.",
      history: "Pendant les 3 années précédant la Révélation, le Prophète ﷺ se retirait régulièrement dans la grotte pour méditer et se recueillir. La nuit du 17 Ramadan de l'an 610, Gabriel ﷺ lui apparut pour la première fois. Khadijah (ra) fut la première à croire en lui — «Tu es le Messager d'Allah».",
      dua: "اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ",
      duaTrad: "Lis au nom de ton Seigneur qui a créé. (Al-Alaq, 96:1 — premiers mots révélés dans cette grotte)",
      features: ['Grotte de Hira', 'Première révélation', '1652 marches'],
    },
    {
      slug: 'jabal-thawr',
      title: 'Jabal Thawr',
      nameAr: 'جبل ثور',
      tag: 'Hégire',
      tagColor: '#8B2A1A',
      description: "Lors de l'Hégire en 622, le Prophète ﷺ et Abu Bakr (ra) se cachèrent pendant 3 jours dans cette grotte pour échapper aux Qurayshites. Allah envoya une araignée tisser sa toile et un oiseau nidifier à l'entrée — les poursuivants conclurent que personne n'y était entré récemment.",
      history: "Le Coran y fait référence : «Quand il dit à son compagnon : Ne t'afflige pas, Allah est avec nous» (At-Tawbah 9:40). Abu Bakr (ra) avait demandé avec inquiétude s'ils seraient découverts. Le Prophète ﷺ répondit avec cette certitude absolue. Ce moment est considéré comme l'un des sommets de la foi dans la Sîra.",
      dua: "لَا تَحْزَنْ إِنَّ اللَّهَ مَعَنَا",
      duaTrad: "Ne t'afflige pas, Allah est avec nous. (At-Tawbah 9:40)",
      features: ["Cave d'Hégire", "Miracle de l'araignée", 'Foi absolue'],
    },
    {
      slug: 'mina',
      title: 'Mina',
      nameAr: 'مِنَى',
      tag: 'Hajj',
      tagColor: '#1D5C3A',
      description: "La vallée des tentes blanches. Lors du Hajj, des millions de pèlerins y résident 3 nuits. C'est ici que s'accomplit le jet de pierres sur les trois Jamarat — symbole du rejet du shaytân par Ibrahim ﷺ. Hors Hajj, le silence du lieu est saisissant.",
      history: "Ibrahim ﷺ reçut l'ordre de sacrifier son fils Ismaël ﷺ dans cette vallée. Le shaytân tenta trois fois d'interrompre ce sacrifice — Ibrahim le repoussa avec des pierres. Allah remplaça Ismaël par un mouton au moment du sacrifice. C'est l'origine de l'Aïd Al-Adha et du rituel du Rami.",
      dua: "بِسْمِ اللَّهِ وَاللَّهُ أَكْبَرُ",
      duaTrad: "Au nom d'Allah, Allah est le Plus Grand. (à réciter à chaque jet de pierre)",
      features: ['Jamarat', 'Jet de pierres', '3 nuits Hajj'],
    },
    {
      slug: 'arafat',
      title: "Plaine d'Arafat",
      nameAr: 'عَرَفَات',
      tag: 'Pilier du Hajj',
      tagColor: '#C9A84C',
      description: "Sans Arafat, il n'y a pas de Hajj. Le 9 Dhul Hijja, des millions de pèlerins se tiennent dans cette plaine du lever du soleil jusqu'au coucher — en prière, en pleurs, en du'a. Le Prophète ﷺ y prononça son discours d'adieu lors du dernier Hajj.",
      history: "Le Prophète ﷺ y fit son dernier sermon en 632 : «Ô gens, votre sang et vos biens vous sont sacrés... Aucun Arabe n'est supérieur à un non-Arabe, ni aucun non-Arabe à un Arabe, sinon par la piété.» Ce discours est souvent appelé la première déclaration universelle des droits de l'homme.",
      dua: "لَبَّيْكَ اللَّهُمَّ لَبَّيْكَ، لَبَّيْكَ لَا شَرِيكَ لَكَ لَبَّيْكَ",
      duaTrad: "Me voici, Ô Allah, me voici. Me voici, sans associé pour Toi, me voici. (Talbiyah)",
      features: ['Wuquf', "Sermon d'adieu", 'Jabal Al-Rahmah'],
    },
    {
      slug: 'safa-marwa',
      title: 'Safa & Marwa',
      nameAr: 'الصَّفَا وَالْمَرْوَة',
      tag: "Sa'i · Omra",
      tagColor: '#1A4A8A',
      description: "Les deux collines entre lesquelles Hajar, mère d'Ismaël, courut 7 fois à la recherche d'eau pour son fils mourant de soif. Allah fit jaillir la source de Zamzam en réponse à sa foi et à son action. Le Sa'i (7 passages) est l'acte de commémoration de cette foi absolue.",
      history: "Ibrahim ﷺ avait laissé Hajar et le nourrisson Ismaël dans une vallée aride sur l'ordre d'Allah. Quand l'eau manqua, Hajar courut entre les deux collines en cherchant de l'aide. Allah fit jaillir Zamzam. Le Coran dit : «Safa et Marwa font partie des symboles d'Allah» (2:158).",
      dua: "إِنَّ الصَّفَا وَالْمَرْوَةَ مِن شَعَائِرِ اللَّهِ",
      duaTrad: "Safa et Marwa font partie des symboles d'Allah. (Al-Baqarah 2:158 — à réciter en commençant le Sa'i)",
      features: ["7 passages · Sa'i", 'Histoire de Hajar', 'Zamzam'],
    },
    {
      slug: 'muzdalifah',
      title: 'Muzdalifah',
      nameAr: 'مُزْدَلِفَة',
      tag: 'Hajj',
      tagColor: '#1D5C3A',
      description: "La halte sacrée entre Arafat et Mina. Après le coucher du soleil à Arafat, les pèlerins marchent vers Muzdalifah, prient Maghrib et Isha ensemble, dorment à la belle étoile et collectent les 70 petits cailloux pour le jet de Mina. Une nuit unique dans une vie.",
      history: "Le Coran commande : «Quand vous quittez Arafat, invoquez Allah près de la halte sacrée (Muzdalifah)» (2:198). La nuit passée sous les étoiles, des millions de pèlerins allongés à même la terre, dans la même tenue blanche — est souvent décrite comme une préfiguration du Jour du Jugement.",
      dua: "فَإِذَا أَفَضْتُم مِّنْ عَرَفَاتٍ فَاذْكُرُوا اللَّهَ عِندَ الْمَشْعَرِ الْحَرَامِ",
      duaTrad: "Quand vous quittez Arafat, invoquez Allah près de la halte sacrée. (Al-Baqarah 2:198)",
      features: ['Halte sacrée', 'Prière nocturne', 'Collecte cailloux'],
    },
    {
      slug: 'masjid-aisha',
      title: "Meeqat Tan'im",
      nameAr: 'مسجد عائشة',
      tag: 'Meeqat',
      tagColor: '#8B6914',
      description: "Le Meeqat le plus proche de Makkah, aussi appelé Masjid Aïsha (ra). C'est d'ici que les pèlerins déjà à Makkah peuvent entrer en état d'Ihram pour accomplir une Omra supplémentaire. Aïsha (ra) y accomplit son Omra sur l'ordre du Prophète ﷺ lors du Hajj d'adieu.",
      history: "Lors du Hajj d'adieu, Aïsha (ra) eut ses règles et ne put pas accomplir la Omra qu'elle avait prévue. Après la fin de ses règles, le Prophète ﷺ envoya son frère Abd Ar-Rahman pour l'accompagner à Tan'im, d'où elle entra en Ihram pour accomplir son Omra. Ce lieu porte depuis son nom.",
      dua: "لَبَّيْكَ اللَّهُمَّ عُمْرَةً",
      duaTrad: "Me voici, Ô Allah, pour accomplir une Omra. (à prononcer en entrant en état d'Ihram)",
      features: ['Ihram Omra', 'À 5 km du Haram', 'Meeqat historique'],
    },
    {
      slug: 'hira',
      title: 'Grotte de Hira',
      nameAr: 'غار حراء',
      tag: 'Révélation · Hira',
      tagColor: '#5A2D82',
      description: "Au sommet de Jabal Nour se trouve cette petite caverne où le Prophète ﷺ méditait des heures entières avant la Révélation. Pénétrer dans cet espace étroit, c'est toucher l'instant exact où l'humanité bascula. Un lieu hors du temps que chaque pèlerin devrait vivre.",
      history: "La grotte mesure environ 1m de large et 2m de profondeur. La nuit du 17 Ramadan de l'an 610, l'ange Jibrîl apparut et dit : «Iqra» (Lis). Le Prophète ﷺ répondit trois fois : «Je ne sais pas lire.» Jibrîl le serra et récita les premiers versets. Tremblant, le Prophète ﷺ rentra chez Khadijah (ra) qui le réconforta : «Tu es le Messager d'Allah.»",
      dua: "اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ",
      duaTrad: "Lis au nom de ton Seigneur qui a créé. (Al-Alaq 96:1 — premiers mots de la Révélation divine)",
      features: ['Première révélation', 'Nuit du 17 Ramadan', 'Sommet Jabal Nour'],
    },
    {
      slug: 'zamzam',
      title: 'Puits de Zamzam',
      nameAr: 'بئر زمزم',
      tag: 'Eau sacrée · Omra',
      tagColor: '#1A4A8A',
      description: "L'eau la plus sacrée du monde, jaillie miraculeusement pour Hajar et Ismaël ﷺ. Elle coule sans interruption depuis plus de 4000 ans. Le Prophète ﷺ a dit : «L'eau de Zamzam vaut ce pour quoi elle est bue.» Elle guérit, étanche, fortifie — aucun pèlerin ne repart sans en avoir bu.",
      history: "Ibrahim ﷺ laissa Hajar et le nourrisson Ismaël dans la vallée aride de Makkah sur l'ordre d'Allah. Quand l'eau manqua, Hajar courut sept fois entre Safa et Marwa. Désespérée, elle posa Ismaël — et l'ange Jibrîl frappa la terre et l'eau jaillit. Hajar s'écria «Zommi! Zommi!» pour retenir l'eau. Cette source n'a jamais tari depuis plus de 4000 ans.",
      dua: "اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا وَرِزْقًا وَاسِعًا وَشِفَاءً مِنْ كُلِّ دَاءٍ",
      duaTrad: "Ô Allah, je Te demande une science utile, une subsistance abondante et une guérison de toute maladie. (du'a recommandé en buvant Zamzam)",
      features: ['4000 ans sans interruption', 'Miracle de Hajar', "Du'a de guérison"],
    },
    {
      slug: 'hunayn',
      title: 'Vallée de Hunayn',
      nameAr: 'حنين',
      tag: 'Bataille · Coran',
      tagColor: '#8B2A1A',
      description: "Dans cette vallée entre La Mecque et Taïf, les musulmans faillirent être défaits par surprise malgré leur supériorité numérique. La fermeté du Prophète ﷺ retourna la bataille. Le Coran lui-même mentionne Hunayn — une leçon d'humilité gravée dans les versets.",
      history: "Après la conquête de Makkah en l'an 8 de l'Hégire, 12 000 musulmans marchèrent vers Taïf. Les Hawazin et Thaqif tendirent une embuscade. L'avant-garde fut repoussée. Le Prophète ﷺ tint ferme en criant : «Je suis le Prophète, cela n'est pas un mensonge.» Les Compagnons se rallièrent et la victoire fut totale. Allah révéla : «Le jour de Hunayn, quand votre grand nombre vous avait enorgueilli...» (9:25).",
      dua: "وَيَوْمَ حُنَيْنٍ إِذْ أَعْجَبَتْكُمْ كَثْرَتُكُمْ",
      duaTrad: "Et le jour de Hunayn, quand votre grand nombre vous avait enorgueilli... (At-Tawbah 9:25)",
      features: ['Mentionné dans le Coran', 'An 8 Hégire', 'Victoire après embuscade'],
    },
    {
      slug: 'masjid-al-jinn',
      title: 'Masjid Al-Jinn',
      nameAr: 'مسجد الجن',
      tag: 'Lieu rare',
      tagColor: '#5A2D82',
      description: "Selon la Sunnah, un groupe de djinns entendit le Prophète ﷺ réciter le Coran ici et se convertirent à l'Islam. La sourate Al-Jinn (72) leur est entièrement dédiée. Lieu méconnu, peu visité, profondément chargé de sens pour qui connaît la Sîra.",
      history: "Le Coran raconte : «Dis : Il m'a été révélé qu'un groupe de djinns a écouté et a dit : Nous avons entendu un Coran admirable. Il guide vers la droiture, et nous y croyons» (72:1-2). Le Prophète ﷺ y traça un cercle pour ses Compagnons pendant qu'il récitait au groupe de djinns.",
      dua: "قُلْ أُوحِيَ إِلَيَّ أَنَّهُ اسْتَمَعَ نَفَرٌ مِّنَ الْجِنِّ",
      duaTrad: "Dis : Il m'a été révélé qu'un groupe de djinns a écouté. (Al-Jinn 72:1)",
      features: ['Sourate Al-Jinn', 'Lieu de conversion', 'Sîra unique'],
    },
  ],
  Madinah: [
    {
      slug: 'masjid-an-nabawi',
      title: 'Al-Masjid An-Nabawi',
      nameAr: 'المسجد النبوي',
      tag: 'Essentiel',
      tagColor: '#C9A84C',
      description: "La mosquée du Prophète ﷺ à Madinah — la deuxième plus sacrée de l'Islam. Une prière y vaut 1000 prières ailleurs, sauf au Masjid Al-Haram. Elle abrite la Rawdah Al-Mubaraka — «un jardin du Paradis» selon le Prophète ﷺ — et le tombeau sacré.",
      history: "À son arrivée à Madinah en 622, le Prophète ﷺ laissa sa chamelle avancer librement. Là où elle s'agenouilla, il fit construire la mosquée avec ses propres mains. Elle était initialement très simple — des palmiers en guise de colonnes, de la terre battue comme sol. Elle a été agrandie de nombreuses fois depuis.",
      dua: "اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ",
      duaTrad: "Ô Allah, ouvre-moi les portes de Ta miséricorde. (du'a d'entrée à la mosquée)",
      features: ['Rawdah', 'Tombeau du Prophète ﷺ', '1000x la prière'],
    },
    {
      slug: 'masjid-quba',
      title: 'Masjid Quba',
      nameAr: 'مسجد قباء',
      tag: 'Première mosquée',
      tagColor: '#1D5C3A',
      description: "La toute première mosquée bâtie dans l'histoire de l'Islam. Construite par le Prophète ﷺ dès son arrivée à Madinah lors de l'Hégire. Y prier deux rak'ahs équivaut à une Omra complète selon le Hadith authentique.",
      history: "Le Prophète ﷺ posa les premières pierres de Masjid Quba en 622, assisté de ses Compagnons. Le Coran y fait référence : «Une mosquée fondée dès le premier jour sur la piété mérite mieux que tu y pries» (9:108). Ce verset est souvent interprété par les savants comme une référence à Masjid Quba.",
      dua: "فِيهِ رِجَالٌ يُحِبُّونَ أَن يَتَطَهَّرُوا",
      duaTrad: "Il s'y trouve des hommes qui aiment se purifier. (At-Tawbah 9:108, en référence aux fidèles de Quba)",
      features: ["Équivalent d'une Omra", 'Fondée en 622', 'Première mosquée'],
    },
    {
      slug: 'jabal-uhud',
      title: 'Jabal Uhud',
      nameAr: 'جبل أُحُد',
      tag: 'Histoire · Martyrs',
      tagColor: '#8B2A1A',
      description: "«Uhud est une montagne qui nous aime et que nous aimons.» — Prophète ﷺ. Lieu de la bataille d'Uhud (625), où 70 Compagnons furent martyrisés, dont Hamza ibn Abd Al-Muttalib (ra), l'oncle bien-aimé du Prophète ﷺ. Un lieu de recueillement intense.",
      history: "En l'an 3 de l'Hégire, 3000 Qurayshites attaquèrent Madinah. Les archers postés sur le mont quittèrent leur position contre les ordres du Prophète ﷺ pour collecter le butin — offrant une brèche à la cavalerie ennemie. Le Prophète ﷺ lui-même fut blessé. 70 Compagnons périrent ce jour-là.",
      dua: "السَّلاَمُ عَلَيْكُمْ يَا أَهْلَ الْقُبُورِ",
      duaTrad: "Que la paix soit sur vous, ô habitants des tombeaux. (du'a à réciter sur les tombes des martyrs)",
      features: ['Cimetière des martyrs', 'Bataille 625', 'Hamza (ra)'],
    },
    {
      slug: 'al-baqi',
      title: "Al-Baqi'",
      nameAr: 'البقيع',
      tag: 'Cimetière sacré',
      tagColor: '#5A4E3A',
      description: "Le cimetière de Madinah abrite plus de 10 000 Compagnons du Prophète ﷺ, ainsi que plusieurs membres de sa famille dont Uthman ibn Affan (ra), Fatimah Az-Zahraa (ra) selon certains savants, et Ibrahim, le fils du Prophète ﷺ. Le Prophète ﷺ le visitait régulièrement.",
      history: "Le Prophète ﷺ visitait Al-Baqi' chaque vendredi et récitait les salutations aux morts. Il dit : «Paix sur vous, habitants de ce cimetière de croyants et musulmans. Si Allah le veut, nous vous rejoindrons. Vous êtes nos précurseurs et nous sommes vos successeurs.»",
      dua: "السَّلاَمُ عَلَيْكُمْ دَارَ قَوْمٍ مُؤْمِنِينَ",
      duaTrad: "Que la paix soit sur vous, demeure d'un peuple de croyants. (du'a du Prophète ﷺ à Al-Baqi')",
      features: ['10 000+ Compagnons', 'Famille du Prophète ﷺ', 'Visite recommandée'],
    },
    {
      slug: 'masjid-al-qiblatayn',
      title: 'Masjid Al-Qiblatayn',
      nameAr: 'مسجد القبلتين',
      tag: 'Miracle du Coran',
      tagColor: '#1A4A8A',
      description: "La mosquée aux deux Qiblas. C'est ici qu'en l'an 2 de l'Hégire, le Prophète ﷺ était en train de prier en direction de Jérusalem quand Allah révéla l'ordre de se tourner vers la Kaaba. Le Prophète ﷺ pivota en pleine prière — les fidèles l'imitèrent immédiatement.",
      history: "«Nous voyons ton visage se tourner vers le ciel. Nous allons donc t'orienter vers une qibla qui te plaira. Tourne donc ton visage vers la Masjid Al-Haram.» (Al-Baqarah 2:144). Les savants citent cet incident comme l'une des preuves les plus frappantes de la foi des Compagnons — obéissance instantanée, même en pleine prière.",
      dua: "قَدْ نَرَىٰ تَقَلُّبَ وَجْهِكَ فِي السَّمَاءِ",
      duaTrad: "Nous voyons ton visage se tourner vers le ciel. (Al-Baqarah 2:144 — verset du changement de Qibla)",
      features: ['Changement de Qibla', 'An 2 Hégire', 'Architecture unique'],
    },
    {
      slug: 'masjid-al-miqat',
      title: 'Masjid Dhul Hulayfah',
      nameAr: 'مسجد الميقات',
      tag: 'Meeqat',
      tagColor: '#8B6914',
      description: "Le plus important des 5 Meeqats de l'Islam. C'est ici que les pèlerins venant de Madinah — et de tous les pays dans cette direction — entrent en état d'Ihram. Le Prophète ﷺ y entra lui-même en Ihram lors de son Hajj d'adieu. Aussi appelé Abyar Ali (les puits d'Ali).",
      history: "Le Prophète ﷺ définit les 5 Meeqats pour les pèlerins venant de différentes directions : Dhul Hulayfah pour Madinah, Al-Juhfah pour la Syrie, Qarn Al-Manazil pour le Najd, Yalamlam pour le Yémen, et Dhat Iraq pour l'Irak. Ces frontières rituelles sont restées inchangées depuis 14 siècles.",
      dua: "لَبَّيْكَ اللَّهُمَّ لَبَّيْكَ، لَبَّيْكَ لَا شَرِيكَ لَكَ",
      duaTrad: "Me voici, Ô Allah, me voici. Tu n'as pas d'associé, me voici. (Talbiyah — à prononcer en entrant en Ihram)",
      features: ['Principal Meeqat', 'Entrée en Ihram', 'Abyar Ali'],
    },
    {
      slug: 'masjid-al-jumua',
      title: "Masjid Al-Jumu'ah",
      nameAr: 'مسجد الجمعة',
      tag: 'Premier Vendredi',
      tagColor: '#1D5C3A',
      description: "C'est à cet endroit que le Prophète ﷺ dirigea la toute première prière du Vendredi (Jumu'ah) de l'histoire de l'Islam, lors de son Hégire en 622. Il s'arrêta dans la vallée de Banu Salim pendant le déplacement de Quba vers Madinah — et le premier khotba de l'Islam y fut prononcé.",
      history: "Après 14 jours à Quba, le Prophète ﷺ se dirigea vers Madinah un vendredi matin. À mi-chemin, dans le quartier de Banu Salim ibn Awf, il fut rejoint par un grand nombre de fidèles. Il s'arrêta, fit la prière du vendredi et prononça le premier sermon. Ce vendredi est considéré comme le premier Jumu'ah de l'Islam.",
      dua: "يَا أَيُّهَا الَّذِينَ آمَنُوا إِذَا نُودِيَ لِلصَّلَاةِ مِن يَوْمِ الْجُمُعَةِ",
      duaTrad: "Ô croyants, quand l'appel à la prière retentit le jour du Vendredi... (Al-Jumu'ah 62:9)",
      features: ["Premier Jumu'ah", 'Hégire 622', 'Lieu rare à visiter'],
    },
    {
      slug: 'wadi-al-aqiq',
      title: 'Wadi Al-Aqiq',
      nameAr: 'وادي العقيق',
      tag: 'Vallée bénie',
      tagColor: '#5A2D82',
      description: "Une vallée aux abords de Madinah que le Prophète ﷺ a décrite comme bénie. Il dit : «Il m'a été ordonné de prier dans cette vallée bénie.» Le Coran y fait référence indirectement dans les sourates relatives à l'Hégire. Lieu de spiritualité, moins visité que les autres sites.",
      history: "Le Prophète ﷺ y priait souvent et l'aimait particulièrement pour son aspect verdoyant et tranquille. Ibn Umar (ra) rapporte que le Prophète ﷺ y vit en songe l'ange Gabriel lui dire de prier dans «cette vallée bénie et d'y entrer en Ihram». Plusieurs Compagnons y avaient leurs jardins.",
      dua: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، سُبْحَانَ اللَّهِ الْعَظِيمِ",
      duaTrad: "Gloire à Allah et Sa louange, Gloire au très Grand Allah. (dhikr recommandé dans les lieux de nature bénis)",
      features: ['Vallée bénie', 'Prière du Prophète ﷺ', 'Lieu de retraite'],
    },
    {
      slug: 'masjid-fateh',
      title: 'Masjid Al-Fateh',
      nameAr: 'مسجد الفتح',
      tag: "Victoire · Du'a",
      tagColor: '#1D5C3A',
      description: "Durant la Bataille du Fossé, le Prophète ﷺ fit du dua depuis cette colline pendant trois jours consécutifs. Allah révéla alors la victoire imminente. Ce lieu rappelle que la persévérance dans la supplication ne reste jamais sans réponse.",
      history: "En l'an 5 de l'Hégire, les Coalisés assiégèrent Madinah pendant 27 jours. Le Prophète ﷺ grimpa sur cette colline et fit du dua le lundi, mardi et mercredi. Le mercredi à l'heure de Dhuhr, la révélation de la victoire descendit. Les savants rapportent que les du'as faits entre Dhuhr et Asr le mercredi sont parmi les plus susceptibles d'être exaucés.",
      dua: "إِنَّا فَتَحْنَا لَكَ فَتْحًا مُّبِينًا",
      duaTrad: "Nous t'avons accordé une victoire éclatante. (Al-Fath 48:1)",
      features: ["Du'a exaucé", 'Mercredi béni', 'Bataille du Fossé'],
    },
    {
      slug: 'marche-dattes',
      title: 'Marché aux dattes',
      nameAr: 'سوق التمور',
      tag: 'Culture · Sunnah',
      tagColor: '#8B6914',
      description: "Des dizaines de variétés de dattes de Madinah, dont la célèbre Ajwa dont le Prophète ﷺ vanta les vertus. Un marché vivant, parfumé, où les vendeurs vous font goûter sans retenue. L'endroit idéal pour rapporter des cadeaux authentiques à vos proches.",
      history: "La datte est intimement liée à la Sunnah. Le Prophète ﷺ rompait le jeûne avec des dattes fraîches, en mangeait en nombre impair, et recommandait la Ajwa : «Celui qui mange chaque matin sept dattes Ajwa sera protégé de tout poison et sorcellerie.» (Bukhari). Ce marché perpétue une tradition millénaire au cœur de Madinah.",
      dua: "اللَّهُمَّ بَارِكْ لَنَا فِي مَدِينَتِنَا",
      duaTrad: "Ô Allah, bénis-nous dans notre Madinah. (du'a du Prophète ﷺ pour Madinah)",
      features: ['Dattes Ajwa', 'Sunnah du Prophète ﷺ', 'Cadeaux authentiques'],
    },
    {
      slug: 'badr',
      title: 'Badr',
      nameAr: 'بدر',
      tag: 'Bataille · Histoire',
      tagColor: '#8B2A1A',
      description: "À 150 km de Madinah, dans cette vallée, 313 musulmans mal armés vainquirent une armée de 1000 Qurayshites. Le Prophète ﷺ pleura de gratitude. Visiter Badr, c'est comprendre que l'Islam ne s'est pas imposé par la force mais par la foi d'une poignée d'hommes résolus.",
      history: "Le 17 Ramadan de l'an 2 de l'Hégire, Allah envoya des anges en renfort. 70 polythéistes furent tués, 70 faits prisonniers. 14 musulmans moururent martyrs. Le Prophète ﷺ pleura toute la nuit de gratitude. Allah révéla la sourate Al-Anfal en entier à propos de cette bataille — appelée le «Jour de la Distinction» (Yawm Al-Furqan).",
      dua: "يَوْمَ الْفُرْقَانِ يَوْمَ الْتَقَى الْجَمْعَانِ",
      duaTrad: "Le jour de la distinction, le jour où les deux armées se rencontrèrent. (Al-Anfal 8:41)",
      features: ['313 contre 1000', 'Yawm Al-Furqan', 'Anges envoyés'],
    },
    {
      slug: 'khandaq',
      title: 'Al-Khandaq',
      nameAr: 'الخندق',
      tag: 'Stratégie · Foi',
      tagColor: '#1A4A8A',
      description: "Sur la suggestion de Salman Al-Farisi, les musulmans creusèrent un fossé de plusieurs kilomètres pour défendre Madinah. Une stratégie inédite dans la péninsule arabique. Ce site rappelle l'ingéniosité et la solidarité des Compagnons face à une coalition de 10 000 hommes.",
      history: "En l'an 5 de l'Hégire, Salman Al-Farisi proposa le fossé — inconnu des Arabes. En 6 jours, les Compagnons creusèrent 5,5 km. La coalition, incapable de franchir, se retira après 27 jours. Ce siège valut à Salman (ra) la célèbre parole : «Salman est des nôtres, de la famille du Prophète.»",
      dua: "حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ",
      duaTrad: "Allah nous suffit, et Il est le meilleur garant. (Al-Imran 3:173)",
      features: ['10 000 coalisés repoussés', 'Fossé de 5,5 km', 'Victoire sans combat'],
    },
    {
      slug: 'bir-aris',
      title: 'Bir Aris',
      nameAr: 'بئر أريس',
      tag: 'Lieu rare',
      tagColor: '#5A2D82',
      description: "Dans ce jardin paisible de Madinah, le Prophète ﷺ s'assit au bord de ce puits et y laissa tomber sa bague. Un espace à l'écart du tumulte, rarement visité, qui offre une intimité spirituelle rare aux pèlerins qui le connaissent.",
      history: "Le Prophète ﷺ aimait ce jardin de Quba. Un jour, sa bague portant «Muhammad Rasul Allah» tomba dans ce puits. Uthman (ra), alors Calife, tenta pendant 3 jours de la retrouver sans succès. Abu Bakr (ra) et Umar (ra) s'assirent eux aussi au bord de ce même puits. Il est aussi appelé Khatam An-Nabi — la bague du Prophète.",
      dua: "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَآلِ مُحَمَّدٍ",
      duaTrad: "Ô Allah, envoie ta grâce sur Muhammad et sa famille.",
      features: ['Bague perdue du Prophète ﷺ', 'Jardin de Quba', 'Lieu méconnu'],
    },
    {
      slug: 'masjid-ghamamah',
      title: 'Masjid Al-Ghamamah',
      nameAr: 'مسجد الغمامة',
      tag: "Prière de l'Aïd",
      tagColor: '#1D5C3A',
      description: "Le Prophète ﷺ y accomplit la prière de l'Aïd en plein air, et selon la tradition, un nuage lui fit de l'ombre lors de la khutbah. Cette petite mosquée ottomane, à deux pas de Masjid An-Nabawi, est un trésor méconnu que les guides SAFARUMA vous feront découvrir.",
      history: "C'est dans cet espace à ciel ouvert que le Prophète ﷺ dirigea la prière de l'Aïd Al-Adha et Al-Fitr. Un nuage (ghamamah) lui fit de l'ombre par forte chaleur — d'où le nom. La belle mosquée ottomane qui s'y trouve fut construite au XIVe siècle pour commémorer cet événement. Elle est classée monument historique.",
      dua: "اللَّهُ أَكْبَرُ اللَّهُ أَكْبَرُ لَا إِلَهَ إِلَّا اللَّهُ",
      duaTrad: "Allah est le Plus Grand, Allah est le Plus Grand, il n'y a de dieu qu'Allah. (Takbir de l'Aïd)",
      features: ["Prière de l'Aïd", 'Nuage miraculeux', 'Mosquée ottomane XIVe'],
    },
  ],
};

const ALL_LIEUX: Lieu[] = [...LIEUX.Makkah, ...LIEUX.Madinah];

function findLieu(slug: string): { lieu: Lieu; city: 'Makkah' | 'Madinah' } | null {
  for (const lieu of LIEUX.Makkah) {
    if (lieu.slug === slug) return { lieu, city: 'Makkah' };
  }
  for (const lieu of LIEUX.Madinah) {
    if (lieu.slug === slug) return { lieu, city: 'Madinah' };
  }
  return null;
}

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const found = findLieu(slug);

  if (!found) {
    return {
      title: 'Lieu introuvable | Safaruna',
      description: 'Ce lieu saint est introuvable.',
    };
  }

  const { lieu } = found;
  const description = lieu.description.slice(0, 155);

  return {
    title: `${lieu.title} | Safaruna`,
    description,
    openGraph: {
      title: `${lieu.title} | Safaruna`,
      description,
    },
  };
}

export async function generateStaticParams() {
  return ALL_LIEUX.map((lieu) => ({ slug: lieu.slug }));
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const found = findLieu(slug);

  if (!found) {
    return (
      <>
        <Navbar />
        <main
          style={{
            backgroundColor: '#FDFBF7',
            minHeight: '60vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '8rem 2rem',
            textAlign: 'center',
          }}
        >
          <h1
            style={{
              fontFamily: 'var(--font-cormorant, serif)',
              fontSize: '2rem',
              color: '#1A1209',
              marginBottom: '1rem',
            }}
          >
            Lieu introuvable
          </h1>
          <p style={{ color: '#6B5A3A', marginBottom: '2rem' }}>
            Ce lieu saint n&apos;existe pas dans notre répertoire.
          </p>
          <Link
            href="/lieux-saints"
            style={{
              color: '#C9A84C',
              textDecoration: 'underline',
              fontWeight: 600,
            }}
          >
            Retour aux lieux saints
          </Link>
        </main>
        <Footer />
      </>
    );
  }

  const { lieu, city } = found;
  const accentColor = city === 'Madinah' ? '#1D5C3A' : '#C9A84C';

  return (
    <>
      <Navbar />
      <main style={{ backgroundColor: '#FDFBF7' }}>
        {/* Breadcrumb */}
        <nav
          aria-label="Fil d'Ariane"
          style={{
            maxWidth: 720,
            margin: '0 auto',
            padding: '1.25rem 1.5rem 0',
            fontSize: '0.8rem',
            color: '#6B5A3A',
            display: 'flex',
            gap: '0.4rem',
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          <Link href="/" style={{ color: '#C9A84C', textDecoration: 'none' }}>
            Accueil
          </Link>
          <span aria-hidden="true">/</span>
          <Link href="/lieux-saints" style={{ color: '#C9A84C', textDecoration: 'none' }}>
            Lieux saints
          </Link>
          <span aria-hidden="true">/</span>
          <span style={{ color: '#1A1209' }}>{lieu.title}</span>
        </nav>

        {/* Hero */}
        <section
          style={{
            backgroundColor: '#1A1209',
            color: '#FDFBF7',
            padding: '4rem 1.5rem',
            marginTop: '1rem',
          }}
        >
          <div style={{ maxWidth: 720, margin: '0 auto' }}>
            <span
              style={{
                display: 'inline-block',
                backgroundColor: lieu.tagColor,
                color: '#fff',
                fontSize: '0.72rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                padding: '0.3rem 0.75rem',
                borderRadius: '2rem',
                marginBottom: '1.25rem',
              }}
            >
              {lieu.tag}
            </span>
            <h1
              style={{
                fontFamily: 'var(--font-cormorant, serif)',
                fontSize: 'clamp(2rem, 6vw, 3.25rem)',
                fontWeight: 700,
                lineHeight: 1.1,
                marginBottom: '0.5rem',
                color: '#FDFBF7',
              }}
            >
              {lieu.title}
            </h1>
            <p
              dir="rtl"
              lang="ar"
              style={{
                fontFamily: 'serif',
                fontSize: 'clamp(1.1rem, 3vw, 1.5rem)',
                color: accentColor === '#1D5C3A' ? '#6DBF8A' : '#C9A84C',
                marginBottom: '1.5rem',
                lineHeight: 1.6,
              }}
            >
              {lieu.nameAr}
            </p>
            <p
              style={{
                fontSize: '1rem',
                lineHeight: 1.75,
                color: '#D4C8B0',
                maxWidth: 600,
              }}
            >
              {lieu.description}
            </p>
          </div>
        </section>

        {/* Histoire */}
        <section
          style={{
            maxWidth: 720,
            margin: '0 auto',
            padding: '3rem 1.5rem',
            borderBottom: '1px solid #E8DFC8',
          }}
        >
          <h2
            style={{
              fontFamily: 'var(--font-cormorant, serif)',
              fontSize: 'clamp(1.5rem, 4vw, 2rem)',
              fontWeight: 700,
              color: '#1A1209',
              marginBottom: '1rem',
            }}
          >
            Histoire
          </h2>
          <p
            style={{
              fontSize: '1rem',
              lineHeight: 1.8,
              color: '#3D2B1A',
            }}
          >
            {lieu.history}
          </p>
        </section>

        {/* Du'a recommandée */}
        <section
          style={{
            backgroundColor: '#1A1209',
            color: '#FDFBF7',
            padding: '3rem 1.5rem',
          }}
        >
          <div style={{ maxWidth: 720, margin: '0 auto' }}>
            <h2
              style={{
                fontFamily: 'var(--font-cormorant, serif)',
                fontSize: 'clamp(1.5rem, 4vw, 2rem)',
                fontWeight: 700,
                color: '#FDFBF7',
                marginBottom: '1.5rem',
              }}
            >
              Du&apos;a recommandée
            </h2>
            <p
              dir="rtl"
              lang="ar"
              style={{
                fontFamily: 'serif',
                fontSize: 'clamp(1.15rem, 3.5vw, 1.6rem)',
                color: accentColor === '#1D5C3A' ? '#6DBF8A' : '#C9A84C',
                lineHeight: 2,
                marginBottom: '1.25rem',
                textAlign: 'right',
              }}
            >
              {lieu.dua}
            </p>
            <p
              style={{
                fontSize: '0.95rem',
                lineHeight: 1.75,
                color: '#B8A88A',
                fontStyle: 'italic',
                borderLeft: `3px solid ${accentColor === '#1D5C3A' ? '#1D5C3A' : '#C9A84C'}`,
                paddingLeft: '1rem',
              }}
            >
              {lieu.duaTrad}
            </p>
          </div>
        </section>

        {/* Features */}
        <section
          style={{
            maxWidth: 720,
            margin: '0 auto',
            padding: '2.5rem 1.5rem',
            borderBottom: '1px solid #E8DFC8',
          }}
        >
          <h2
            style={{
              fontFamily: 'var(--font-cormorant, serif)',
              fontSize: '0.8rem',
              fontWeight: 700,
              color: '#1A1209',
              marginBottom: '1rem',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            } as React.CSSProperties}
          >
            Points clés
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
            {lieu.features.map((feature) => (
              <span
                key={feature}
                style={{
                  display: 'inline-block',
                  border: `1px solid ${accentColor === '#1D5C3A' ? '#1D5C3A' : '#C9A84C'}`,
                  color: accentColor === '#1D5C3A' ? '#1D5C3A' : '#8B6914',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  padding: '0.35rem 0.85rem',
                  borderRadius: '2rem',
                  backgroundColor: accentColor === '#1D5C3A' ? '#F0F9F4' : '#FDF8ED',
                }}
              >
                {feature}
              </span>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section
          style={{
            maxWidth: 720,
            margin: '0 auto',
            padding: '3rem 1.5rem 4rem',
            textAlign: 'center',
          }}
        >
          <p
            style={{
              fontSize: '1rem',
              color: '#6B5A3A',
              marginBottom: '1.5rem',
              lineHeight: 1.6,
            }}
          >
            Visitez {lieu.title} avec un guide francophone expert des lieux saints.
          </p>
          <Link
            href="/guides"
            style={{
              display: 'inline-block',
              backgroundColor: accentColor === '#1D5C3A' ? '#1D5C3A' : '#C9A84C',
              color: '#fff',
              fontWeight: 700,
              fontSize: '0.95rem',
              padding: '0.9rem 2rem',
              borderRadius: '0.375rem',
              textDecoration: 'none',
              letterSpacing: '0.02em',
            }}
          >
            Réserver avec un guide →
          </Link>
        </section>
      </main>
      <Footer />
    </>
  );
}
