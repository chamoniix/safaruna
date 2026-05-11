import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { RefreshCw, Droplets, Heart, Sun, Moon, Scissors, Target } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { lieuxSaints, type LieuSaint, type SectionBlock } from '../data';

// ─── Legacy simple data (25 autres lieux) ────────────────────────────────────

interface LieuSimple {
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

const LIEUX: Record<'Makkah' | 'Madinah', LieuSimple[]> = {
  Makkah: [
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
      description: "Le Meeqat le plus proche de Makkah, aussi appelé Masjid Aïsha (ra). C'est d'ici que les pèlerins déjà à Makkah peuvent entrer en état d'Ihram pour accomplir une Omra supplémentaire.",
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
      description: "Au sommet de Jabal Nour se trouve cette petite caverne où le Prophète ﷺ méditait des heures entières avant la Révélation. Pénétrer dans cet espace étroit, c'est toucher l'instant exact où l'humanité bascula.",
      history: "La grotte mesure environ 1m de large et 2m de profondeur. La nuit du 17 Ramadan de l'an 610, l'ange Jibrîl apparut et dit : «Iqra» (Lis). Le Prophète ﷺ répondit trois fois : «Je ne sais pas lire.» Jibrîl le serra et récita les premiers versets. Tremblant, le Prophète ﷺ rentra chez Khadijah (ra) qui le réconforta.",
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
      description: "L'eau la plus sacrée du monde, jaillie miraculeusement pour Hajar et Ismaël ﷺ. Elle coule sans interruption depuis plus de 4000 ans. Le Prophète ﷺ a dit : «L'eau de Zamzam vaut ce pour quoi elle est bue.»",
      history: "Ibrahim ﷺ laissa Hajar et le nourrisson Ismaël dans la vallée aride de Makkah sur l'ordre d'Allah. Quand l'eau manqua, Hajar courut sept fois entre Safa et Marwa. L'ange Jibrîl frappa la terre et l'eau jaillit. Hajar s'écria «Zommi! Zommi!» pour retenir l'eau. Cette source n'a jamais tari depuis plus de 4000 ans.",
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
      history: "Après la conquête de Makkah en l'an 8 de l'Hégire, 12 000 musulmans marchèrent vers Taïf. Les Hawazin et Thaqif tendirent une embuscade. Le Prophète ﷺ tint ferme en criant : «Je suis le Prophète, cela n'est pas un mensonge.» Les Compagnons se rallièrent et la victoire fut totale.",
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
      description: "Selon la Sunnah, un groupe de djinns entendit le Prophète ﷺ réciter le Coran ici et se convertirent à l'Islam. La sourate Al-Jinn (72) leur est entièrement dédiée.",
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
      history: "Le Prophète ﷺ posa les premières pierres de Masjid Quba en 622, assisté de ses Compagnons. Le Coran y fait référence : «Une mosquée fondée dès le premier jour sur la piété mérite mieux que tu y pries» (9:108).",
      dua: "فِيهِ رِجَالٌ يُحِبُّونَ أَن يَتَطَهَّرُوا",
      duaTrad: "Il s'y trouve des hommes qui aiment se purifier. (At-Tawbah 9:108)",
      features: ["Équivalent d'une Omra", 'Fondée en 622', 'Première mosquée'],
    },
    {
      slug: 'jabal-uhud',
      title: 'Jabal Uhud',
      nameAr: 'جبل أُحُد',
      tag: 'Histoire · Martyrs',
      tagColor: '#8B2A1A',
      description: "«Uhud est une montagne qui nous aime et que nous aimons.» — Prophète ﷺ. Lieu de la bataille d'Uhud (625), où 70 Compagnons furent martyrisés, dont Hamza ibn Abd Al-Muttalib (ra), l'oncle bien-aimé du Prophète ﷺ.",
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
      description: "Le cimetière de Madinah abrite plus de 10 000 Compagnons du Prophète ﷺ, ainsi que plusieurs membres de sa famille. Le Prophète ﷺ le visitait régulièrement et récitait les salutations aux morts.",
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
      description: "La mosquée aux deux Qiblas. C'est ici qu'en l'an 2 de l'Hégire, le Prophète ﷺ était en train de prier en direction de Jérusalem quand Allah révéla l'ordre de se tourner vers la Kaaba. Le Prophète ﷺ pivota en pleine prière.",
      history: "«Nous voyons ton visage se tourner vers le ciel. Nous allons donc t'orienter vers une qibla qui te plaira. Tourne donc ton visage vers la Masjid Al-Haram.» (Al-Baqarah 2:144). Les Compagnons obéirent instantanément, même en pleine prière.",
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
      description: "Le plus important des 5 Meeqats de l'Islam. C'est ici que les pèlerins venant de Madinah entrent en état d'Ihram. Le Prophète ﷺ y entra lui-même en Ihram lors de son Hajj d'adieu.",
      history: "Le Prophète ﷺ définit les 5 Meeqats pour les pèlerins venant de différentes directions : Dhul Hulayfah pour Madinah, Al-Juhfah pour la Syrie, Qarn Al-Manazil pour le Najd, Yalamlam pour le Yémen, et Dhat Iraq pour l'Irak.",
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
      description: "C'est à cet endroit que le Prophète ﷺ dirigea la toute première prière du Vendredi de l'histoire de l'Islam, lors de son Hégire en 622, et où le premier khotba de l'Islam fut prononcé.",
      history: "Après 14 jours à Quba, le Prophète ﷺ se dirigea vers Madinah un vendredi matin. À mi-chemin, dans le quartier de Banu Salim ibn Awf, il s'arrêta, fit la prière du vendredi et prononça le premier sermon.",
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
      description: "Une vallée aux abords de Madinah que le Prophète ﷺ a décrite comme bénie. Il dit : «Il m'a été ordonné de prier dans cette vallée bénie.» Lieu de spiritualité, moins visité que les autres sites.",
      history: "Le Prophète ﷺ y priait souvent et l'aimait particulièrement pour son aspect verdoyant et tranquille. Ibn Umar (ra) rapporte que le Prophète ﷺ y vit en songe l'ange Gabriel lui dire de prier dans «cette vallée bénie».",
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
      history: "En l'an 5 de l'Hégire, les Coalisés assiégèrent Madinah pendant 27 jours. Le Prophète ﷺ grimpa sur cette colline et fit du dua le lundi, mardi et mercredi. Le mercredi à l'heure de Dhuhr, la révélation de la victoire descendit.",
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
      description: "Des dizaines de variétés de dattes de Madinah, dont la célèbre Ajwa dont le Prophète ﷺ vanta les vertus. Un marché vivant, parfumé, où les vendeurs vous font goûter sans retenue.",
      history: "La datte est intimement liée à la Sunnah. Le Prophète ﷺ rompait le jeûne avec des dattes fraîches, en mangeait en nombre impair, et recommandait la Ajwa : «Celui qui mange chaque matin sept dattes Ajwa sera protégé de tout poison et sorcellerie.» (Bukhari).",
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
      description: "À 150 km de Madinah, dans cette vallée, 313 musulmans mal armés vainquirent une armée de 1000 Qurayshites. Visiter Badr, c'est comprendre que l'Islam ne s'est pas imposé par la force mais par la foi d'une poignée d'hommes résolus.",
      history: "Le 17 Ramadan de l'an 2 de l'Hégire, Allah envoya des anges en renfort. 70 polythéistes furent tués, 70 faits prisonniers. 14 musulmans moururent martyrs. Le Prophète ﷺ pleura toute la nuit de gratitude.",
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
      description: "Sur la suggestion de Salman Al-Farisi, les musulmans creusèrent un fossé de plusieurs kilomètres pour défendre Madinah. Ce site rappelle l'ingéniosité et la solidarité des Compagnons face à une coalition de 10 000 hommes.",
      history: "En l'an 5 de l'Hégire, Salman Al-Farisi proposa le fossé — inconnu des Arabes. En 6 jours, les Compagnons creusèrent 5,5 km. La coalition, incapable de franchir, se retira après 27 jours.",
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
      description: "Dans ce jardin paisible de Madinah, le Prophète ﷺ s'assit au bord de ce puits et y laissa tomber sa bague. Un espace à l'écart du tumulte, rarement visité, qui offre une intimité spirituelle rare.",
      history: "Le Prophète ﷺ aimait ce jardin de Quba. Un jour, sa bague portant «Muhammad Rasul Allah» tomba dans ce puits. Uthman (ra), alors Calife, tenta pendant 3 jours de la retrouver sans succès.",
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
      description: "Le Prophète ﷺ y accomplit la prière de l'Aïd en plein air, et selon la tradition, un nuage lui fit de l'ombre lors de la khutbah. Cette petite mosquée ottomane, à deux pas de Masjid An-Nabawi, est un trésor méconnu.",
      history: "C'est dans cet espace à ciel ouvert que le Prophète ﷺ dirigea la prière de l'Aïd Al-Adha et Al-Fitr. Un nuage (ghamamah) lui fit de l'ombre par forte chaleur — d'où le nom. La belle mosquée ottomane qui s'y trouve fut construite au XIVe siècle.",
      dua: "اللَّهُ أَكْبَرُ اللَّهُ أَكْبَرُ لَا إِلَهَ إِلَّا اللَّهُ",
      duaTrad: "Allah est le Plus Grand, Allah est le Plus Grand, il n'y a de dieu qu'Allah. (Takbir de l'Aïd)",
      features: ["Prière de l'Aïd", 'Nuage miraculeux', 'Mosquée ottomane XIVe'],
    },
  ],
};

const ALL_LIEUX: LieuSimple[] = [...LIEUX.Makkah, ...LIEUX.Madinah];

function findLieuSimple(slug: string): { lieu: LieuSimple; city: 'Makkah' | 'Madinah' } | null {
  for (const lieu of LIEUX.Makkah) {
    if (lieu.slug === slug) return { lieu, city: 'Makkah' };
  }
  for (const lieu of LIEUX.Madinah) {
    if (lieu.slug === slug) return { lieu, city: 'Madinah' };
  }
  return null;
}

// ─── Types & helpers ──────────────────────────────────────────────────────────

type Props = { params: Promise<{ slug: string }> };

const ritualIcons = {
  'rotate-cw': RefreshCw,
  'droplets': Droplets,
  'heart': Heart,
  'sun': Sun,
  'moon': Moon,
  'scissors': Scissors,
  'target': Target,
} as const;

function renderBlock(block: SectionBlock, idx: number) {
  const bodyStyle: React.CSSProperties = {
    fontSize: '0.9375rem', lineHeight: 1.75, color: '#444',
    marginBottom: '1rem', marginTop: 0,
  };
  switch (block.type) {
    case 'paragraph':
      return <p key={idx} style={bodyStyle}>{block.content}</p>;
    case 'list':
      return (
        <ul key={idx} style={{ paddingLeft: '1.25rem', marginBottom: '1rem', marginTop: 0 }}>
          {block.items.map((item, i) => (
            <li key={i} style={{ fontSize: '0.9375rem', lineHeight: 1.75, color: '#444', marginBottom: '0.4rem' }}>
              {item}
            </li>
          ))}
        </ul>
      );
    case 'callout':
      return (
        <blockquote key={idx} style={{
          borderLeft: '3px solid #C9A84C', background: '#FAF7F0',
          padding: '1rem 1.25rem', margin: '1.25rem 0', borderRadius: '0 8px 8px 0',
        }}>
          <p style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.05rem', fontStyle: 'italic', color: '#1A1209', lineHeight: 1.7, margin: '0 0 0.5rem' }}>
            «&nbsp;{block.text}&nbsp;»
          </p>
          <span style={{ fontSize: '0.75rem', color: '#888', fontWeight: 600, letterSpacing: '0.04em' }}>
            — {block.reference}
          </span>
        </blockquote>
      );
    case 'stats':
      return (
        <div key={idx} style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem',
          margin: '1.25rem 0',
        }} className="lieu-stats-grid">
          {block.items.map((stat, i) => (
            <div key={i} style={{
              background: 'white', border: '1px solid #E8E2D0', borderRadius: 10,
              padding: '1rem 0.75rem', textAlign: 'center',
            }}>
              <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.5rem', fontWeight: 700, color: '#1A1209', lineHeight: 1.1, marginBottom: '0.3rem' }}>
                {stat.value}
              </div>
              <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#888' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      );
    case 'rituals':
      return (
        <div key={idx} style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem',
          margin: '1.25rem 0',
        }} className="lieu-rituals-grid">
          {block.items.map((ritual, i) => {
            const Icon = ritualIcons[ritual.icon];
            return (
              <div key={i} style={{
                background: 'white', border: '1px solid #E8E2D0', borderRadius: 10,
                padding: '1.25rem 1rem',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }} className="lieu-ritual-card">
                <div style={{ color: '#C9A84C', marginBottom: '0.6rem' }}>
                  <Icon size={22} strokeWidth={1.5} />
                </div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1A1209', marginBottom: '0.4rem', lineHeight: 1.3 }}>
                  {ritual.title}
                </div>
                <p style={{ fontSize: '0.8rem', color: '#666', lineHeight: 1.6, margin: 0 }}>
                  {ritual.description}
                </p>
              </div>
            );
          })}
        </div>
      );
    case 'expert-tip':
      return (
        <div key={idx} style={{
          background: '#FAF7F0', border: '1px solid #E8E2D0',
          borderRadius: 10, padding: '1.25rem 1.5rem', margin: '1.25rem 0',
          borderLeft: '3px solid #C9A84C',
        }}>
          <div style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#C9A84C', marginBottom: '0.5rem' }}>
            {block.title || 'Conseil expert'}
          </div>
          <p style={{ fontSize: '0.88rem', color: '#3D3530', lineHeight: 1.7, margin: 0 }}>
            {block.text}
          </p>
        </div>
      );
    default:
      return null;
  }
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  const rich = lieuxSaints[slug];
  if (rich) {
    const desc = rich.excerpt.slice(0, 155);
    const url = `https://safaruma.com/lieux-saints/${slug}`;
    return {
      title: `${rich.title} | Lieux saints | SAFARUMA`,
      description: desc,
      alternates: { canonical: url },
      openGraph: { title: rich.title, description: desc, url, type: 'article' },
      twitter: { card: 'summary_large_image', title: rich.title, description: desc },
    };
  }

  const found = findLieuSimple(slug);
  if (!found) return { title: 'Lieu introuvable | SAFARUMA', description: 'Ce lieu saint est introuvable.' };
  const desc = found.lieu.description.slice(0, 155);
  return {
    title: `${found.lieu.title} | Lieux saints | SAFARUMA`,
    description: desc,
    openGraph: { title: found.lieu.title, description: desc },
  };
}

export async function generateStaticParams() {
  const richSlugs = Object.keys(lieuxSaints).map(slug => ({ slug }));
  const simpleSlugs = ALL_LIEUX.map(l => ({ slug: l.slug }));
  return [...richSlugs, ...simpleSlugs];
}

// ─── Rich page ────────────────────────────────────────────────────────────────

function RichLieuPage({ lieu }: { lieu: LieuSaint }) {
  const url = `https://safaruma.com/lieux-saints/${lieu.slug}`;

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `${url}#article`,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    headline: lieu.title,
    description: lieu.excerpt,
    datePublished: lieu.publishedAt,
    dateModified: lieu.modifiedAt || lieu.publishedAt,
    author: { '@type': 'Organization', '@id': 'https://safaruma.com/#organization', name: 'SAFARUMA' },
    publisher: { '@id': 'https://safaruma.com/#organization' },
    image: 'https://safaruma.com/icon-logo.png',
    inLanguage: 'fr-FR',
    url,
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Accueil', item: 'https://safaruma.com' },
      { '@type': 'ListItem', position: 2, name: 'Lieux saints', item: 'https://safaruma.com/lieux-saints' },
      { '@type': 'ListItem', position: 3, name: lieu.title, item: url },
    ],
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `${url}#faq`,
    mainEntity: lieu.faq.map(f => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  };

  return (
    <>
      <style>{`
        html { scroll-behavior: smooth; }
        .lieu-saint-content section { padding: 0 !important; }
        .lieu-toc-wrap { display: grid; grid-template-columns: 220px 1fr; gap: 4rem; max-width: 1120px; margin: 0 auto; padding: 3rem 2rem 0; align-items: start; }
        .lieu-toc-sidebar { display: block; }
        .lieu-toc-sidebar-inner { position: sticky; top: 140px; }
        .lieu-mobile-toc { display: none; }
        .lieu-full-wrap { max-width: 1120px; margin: 0 auto; padding: 0 2rem 5rem; }
        .lieu-full-wrap section { padding: 0 !important; }
        .lieu-ritual-card:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,0.08); }
        @media (max-width: 900px) {
          .lieu-toc-wrap { grid-template-columns: 1fr; padding: 2rem 1.25rem 0; gap: 1.5rem; }
          .lieu-toc-sidebar { display: none; }
          .lieu-mobile-toc { display: block; padding: 0 1.25rem; margin-top: 1.5rem; }
          .lieu-full-wrap { padding: 0 1.25rem 4rem; }
          .lieu-stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .lieu-rituals-grid { grid-template-columns: 1fr !important; }
        }
        .lieu-toc-link { display: block; padding: 0.35rem 0.75rem; border-radius: 6px; font-size: 0.78rem; color: #7A6D5A; text-decoration: none; font-weight: 500; font-family: var(--font-manrope, sans-serif); transition: color 0.15s, background 0.15s; }
        .lieu-toc-link:hover { color: #1A1209; background: #F0EBE0; }
        .lieu-section-h2 { font-family: var(--font-cormorant, serif); font-size: clamp(1.3rem, 2.5vw, 1.7rem); font-weight: 600; color: #1A1209; margin: 2rem 0 0.75rem; padding-top: 0.5rem; scroll-margin-top: 140px; border-top: 1px solid #E8E2D0; }
        .lieu-section-h2:first-child { border-top: none; margin-top: 0; padding-top: 0; }
        details.lieu-mobile-details summary { cursor: pointer; font-size: 0.85rem; font-weight: 600; color: #1A1209; padding: 0.75rem 0; list-style: none; display: flex; align-items: center; gap: 0.5rem; }
        details.lieu-mobile-details summary::before { content: '§'; font-family: var(--font-cormorant, serif); color: #C9A84C; font-size: 1.1rem; }
        details.lieu-mobile-details nav a { display: block; padding: 0.4rem 0.5rem; font-size: 0.82rem; color: #7A6D5A; text-decoration: none; }
      `}</style>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <Navbar />

      {/* HERO */}
      <section style={{ background: '#1A1209', padding: '11rem 2rem 5rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 60% 70% at 50% 0%, rgba(201,168,76,0.1) 0%, transparent 60%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 760, margin: '0 auto', position: 'relative' }}>

          {/* Breadcrumb */}
          <nav aria-label="Fil d'Ariane" style={{ display: 'flex', gap: '0.4rem', fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            <Link href="/" style={{ color: 'rgba(201,168,76,0.7)', textDecoration: 'none' }}>Accueil</Link>
            <span>/</span>
            <Link href="/lieux-saints" style={{ color: 'rgba(201,168,76,0.7)', textDecoration: 'none' }}>Lieux saints</Link>
            <span>/</span>
            <span style={{ color: 'rgba(255,255,255,0.5)' }}>{lieu.title}</span>
          </nav>

          {/* Kicker */}
          <div style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#C9A84C', marginBottom: '1rem' }}>
            {lieu.locationKicker}
          </div>

          {/* H1 */}
          <h1 style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 400, color: 'white', lineHeight: 1.15, marginBottom: '1.25rem', margin: '0 0 1.25rem' }}>
            {lieu.title}
          </h1>

          {/* Excerpt */}
          <p style={{ fontSize: '1rem', lineHeight: 1.75, color: 'rgba(255,255,255,0.65)', maxWidth: 580, marginBottom: '2rem' }}>
            {lieu.excerpt}
          </p>

          {/* Meta */}
          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>
            <span>📍 {lieu.location}</span>
            <span>⏱ {lieu.readingTime} min de lecture</span>
            <span>📖 Encyclopédie</span>
          </div>
        </div>
      </section>

      {/* CONTENT */}
      <div style={{ background: '#FAF7F0' }} className="lieu-saint-content">

        {/* Mobile TOC */}
        <div className="lieu-mobile-toc">
          <details className="lieu-mobile-details" style={{ borderBottom: '1px solid #E8E2D0', paddingBottom: '0.75rem' }}>
            <summary>Table des matières — {lieu.sections.length + 1} sections</summary>
            <nav style={{ paddingBottom: '0.5rem' }}>
              {lieu.sections.map(s => <a key={s.id} href={`#${s.id}`} style={{ display: 'block', padding: '0.3rem 0.5rem', fontSize: '0.82rem', color: '#7A6D5A', textDecoration: 'none' }}>{s.title}</a>)}
              <a href="#faq" style={{ display: 'block', padding: '0.3rem 0.5rem', fontSize: '0.82rem', color: '#7A6D5A', textDecoration: 'none' }}>Foire aux questions</a>
            </nav>
          </details>
        </div>

        {/* Desktop 2-column */}
        <div className="lieu-toc-wrap">

          {/* Sticky TOC */}
          <aside className="lieu-toc-sidebar" aria-label="Sommaire">
            <div className="lieu-toc-sidebar-inner">
              <div style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#C9A84C', padding: '0 0.75rem', marginBottom: '0.5rem' }}>
                Sommaire
              </div>
              <div style={{ height: 1, background: 'linear-gradient(90deg, #C9A84C55, transparent)', margin: '0 0.75rem 0.5rem' }} />
              <nav>
                {lieu.sections.map(s => (
                  <a key={s.id} href={`#${s.id}`} className="lieu-toc-link">{s.title}</a>
                ))}
                <a href="#faq" className="lieu-toc-link">Foire aux questions</a>
              </nav>
              <div style={{ marginTop: '1.5rem', padding: '0.875rem 0.75rem', background: '#F0EBE0', borderRadius: 8, fontSize: '0.72rem', color: '#7A6D5A', lineHeight: 1.6 }}>
                Visitez ce lieu avec un guide expert
                <br />
                <Link href="/guides" style={{ color: '#C9A84C', fontWeight: 700, textDecoration: 'none' }}>Trouver mon guide →</Link>
              </div>
            </div>
          </aside>

          {/* Content column */}
          <main>
            {lieu.sections.map((section, si) => (
              <section key={section.id} id={section.id}>
                <h2 className={`lieu-section-h2${si === 0 ? ' first-h2' : ''}`} style={si === 0 ? { fontFamily: 'var(--font-cormorant, serif)', fontSize: 'clamp(1.3rem, 2.5vw, 1.7rem)', fontWeight: 600, color: '#1A1209', margin: '0 0 0.75rem', scrollMarginTop: '140px' } : undefined}>
                  {section.title}
                </h2>
                {section.content.map((block, bi) => renderBlock(block, bi))}

                {section.seeAlso && section.seeAlso.length > 0 && (
                  <p style={{ fontSize: '0.8rem', color: '#888', marginTop: '0.5rem', marginBottom: 0 }}>
                    {section.seeAlso.map((link, li) => (
                      <span key={link.href}>{li > 0 ? ' · ' : 'Voir aussi : '}
                        <Link href={link.href} style={{ color: '#C9A84C' }}>{link.label} →</Link>
                      </span>
                    ))}
                  </p>
                )}
              </section>
            ))}

            {/* FAQ section */}
            <section id="faq">
              <h2 className="lieu-section-h2">Foire aux questions</h2>
              {lieu.faq.map((item, i) => (
                <details key={i} style={{ borderBottom: '1px solid #E8E2D0', marginBottom: '0.25rem' }}>
                  <summary style={{ padding: '0.875rem 0', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600, color: '#1A1209', listStyle: 'none' }}>
                    {item.question}
                  </summary>
                  <p style={{ padding: '0 0 0.875rem', color: '#555', lineHeight: 1.75, fontSize: '0.875rem', margin: 0 }}>
                    {item.answer}
                  </p>
                </details>
              ))}
            </section>
          </main>
        </div>
      </div>

      {/* CTA FINAL */}
      <section style={{
        background: 'linear-gradient(135deg, #1A1209 0%, #2A1F12 100%)',
        padding: '5rem 2rem', textAlign: 'center',
      }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <div style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#C9A84C', marginBottom: '1rem' }}>
            SAFARUMA · Guides certifiés
          </div>
          <h2 style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: 400, color: 'white', lineHeight: 1.2, marginBottom: '1rem' }}>
            Vivez {lieu.title} avec un guide privé
          </h2>
          <p style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, marginBottom: '2rem' }}>
            Un guide SAFARUMA vous accompagne sur les lieux, explique chaque détail dans votre langue et fait vivre l&apos;histoire de façon inoubliable.
          </p>
          <Link href="/guides" style={{
            display: 'inline-block', background: '#C9A84C', color: '#1A1209',
            fontWeight: 700, fontSize: '0.88rem', letterSpacing: '0.06em',
            textTransform: 'uppercase', padding: '0.875rem 2rem', borderRadius: 50,
            textDecoration: 'none', transition: 'background 0.2s',
          }}>
            Découvrir les guides →
          </Link>
        </div>
      </section>

      <Footer />
    </>
  );
}

// ─── Simple page (25 autres lieux) ───────────────────────────────────────────

function SimpleLieuPage({ lieu, city }: { lieu: LieuSimple; city: 'Makkah' | 'Madinah' }) {
  const accentColor = city === 'Madinah' ? '#1D5C3A' : '#C9A84C';
  return (
    <>
      <Navbar />
      <main style={{ backgroundColor: '#FDFBF7', paddingTop: '8rem' }}>
        <nav aria-label="Fil d'Ariane" style={{ maxWidth: 720, margin: '0 auto', padding: '0 1.5rem 1.25rem', fontSize: '0.8rem', color: '#6B5A3A', display: 'flex', gap: '0.4rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <Link href="/" style={{ color: '#C9A84C', textDecoration: 'none' }}>Accueil</Link>
          <span>/</span>
          <Link href="/lieux-saints" style={{ color: '#C9A84C', textDecoration: 'none' }}>Lieux saints</Link>
          <span>/</span>
          <span style={{ color: '#1A1209' }}>{lieu.title}</span>
        </nav>
        <section style={{ backgroundColor: '#1A1209', color: '#FDFBF7', padding: '4rem 1.5rem', marginTop: '1rem' }}>
          <div style={{ maxWidth: 720, margin: '0 auto' }}>
            <span style={{ display: 'inline-block', backgroundColor: lieu.tagColor, color: '#fff', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '0.3rem 0.75rem', borderRadius: '2rem', marginBottom: '1.25rem' }}>
              {lieu.tag}
            </span>
            <h1 style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: 'clamp(2rem, 6vw, 3.25rem)', fontWeight: 700, lineHeight: 1.1, marginBottom: '0.5rem', color: '#FDFBF7' }}>{lieu.title}</h1>
            <p dir="rtl" lang="ar" style={{ fontFamily: 'serif', fontSize: 'clamp(1.1rem, 3vw, 1.5rem)', color: accentColor === '#1D5C3A' ? '#6DBF8A' : '#C9A84C', marginBottom: '1.5rem', lineHeight: 1.6 }}>{lieu.nameAr}</p>
            <p style={{ fontSize: '1rem', lineHeight: 1.75, color: '#D4C8B0', maxWidth: 600 }}>{lieu.description}</p>
          </div>
        </section>
        <section style={{ maxWidth: 720, margin: '0 auto', padding: '3rem 1.5rem', borderBottom: '1px solid #E8DFC8' }}>
          <h2 style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 700, color: '#1A1209', marginBottom: '1rem' }}>Histoire</h2>
          <p style={{ fontSize: '1rem', lineHeight: 1.8, color: '#3D2B1A' }}>{lieu.history}</p>
        </section>
        <section style={{ backgroundColor: '#1A1209', color: '#FDFBF7', padding: '3rem 1.5rem' }}>
          <div style={{ maxWidth: 720, margin: '0 auto' }}>
            <h2 style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 700, color: '#FDFBF7', marginBottom: '1.5rem' }}>Du&apos;a recommandée</h2>
            <p dir="rtl" lang="ar" style={{ fontFamily: 'serif', fontSize: 'clamp(1.15rem, 3.5vw, 1.6rem)', color: accentColor === '#1D5C3A' ? '#6DBF8A' : '#C9A84C', lineHeight: 2, marginBottom: '1.25rem', textAlign: 'right' }}>{lieu.dua}</p>
            <p style={{ fontSize: '0.95rem', lineHeight: 1.75, color: '#B8A88A', fontStyle: 'italic', borderLeft: `3px solid ${accentColor}`, paddingLeft: '1rem' }}>{lieu.duaTrad}</p>
          </div>
        </section>
        <section style={{ maxWidth: 720, margin: '0 auto', padding: '2.5rem 1.5rem', borderBottom: '1px solid #E8DFC8' }}>
          <h2 style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '0.8rem', fontWeight: 700, color: '#1A1209', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.06em' } as React.CSSProperties}>Points clés</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
            {lieu.features.map(f => (
              <span key={f} style={{ display: 'inline-block', border: `1px solid ${accentColor}`, color: accentColor === '#1D5C3A' ? '#1D5C3A' : '#8B6914', fontSize: '0.82rem', fontWeight: 600, padding: '0.35rem 0.85rem', borderRadius: '2rem', backgroundColor: accentColor === '#1D5C3A' ? '#F0F9F4' : '#FDF8ED' }}>{f}</span>
            ))}
          </div>
        </section>
        <section style={{ maxWidth: 720, margin: '0 auto', padding: '3rem 1.5rem 4rem', textAlign: 'center' }}>
          <p style={{ fontSize: '1rem', color: '#6B5A3A', marginBottom: '1.5rem', lineHeight: 1.6 }}>
            Visitez {lieu.title} avec un guide francophone expert des lieux saints.
          </p>
          <Link href="/guides" style={{ display: 'inline-block', backgroundColor: accentColor, color: '#fff', fontWeight: 700, fontSize: '0.95rem', padding: '0.9rem 2rem', borderRadius: '0.375rem', textDecoration: 'none', letterSpacing: '0.02em' }}>
            Réserver avec un guide →
          </Link>
        </section>
      </main>
      <Footer />
    </>
  );
}

// ─── Page entrypoint ──────────────────────────────────────────────────────────

export default async function Page({ params }: Props) {
  const { slug } = await params;

  // Rich page (data.ts)
  const rich = lieuxSaints[slug];
  if (rich) return <RichLieuPage lieu={rich} />;

  // Simple page (legacy)
  const found = findLieuSimple(slug);
  if (found) return <SimpleLieuPage lieu={found.lieu} city={found.city} />;

  notFound();
}
