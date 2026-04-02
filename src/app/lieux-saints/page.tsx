'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

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
      features: ['Cave d\'Hégire', 'Miracle de l\'araignée', 'Foi absolue'],
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
      title: 'Plaine d\'Arafat',
      nameAr: 'عَرَفَات',
      tag: 'Pilier du Hajj',
      tagColor: '#C9A84C',
      description: "Sans Arafat, il n'y a pas de Hajj. Le 9 Dhul Hijja, des millions de pèlerins se tiennent dans cette plaine du lever du soleil jusqu'au coucher — en prière, en pleurs, en du'a. Le Prophète ﷺ y prononça son discours d'adieu lors du dernier Hajj.",
      history: "Le Prophète ﷺ y fit son dernier sermon en 632 : «Ô gens, votre sang et vos biens vous sont sacrés... Aucun Arabe n'est supérieur à un non-Arabe, ni aucun non-Arabe à un Arabe, sinon par la piété.» Ce discours est souvent appelé la première déclaration universelle des droits de l'homme.",
      dua: "لَبَّيْكَ اللَّهُمَّ لَبَّيْكَ، لَبَّيْكَ لَا شَرِيكَ لَكَ لَبَّيْكَ",
      duaTrad: "Me voici, Ô Allah, me voici. Me voici, sans associé pour Toi, me voici. (Talbiyah)",
      features: ['Wuquf', 'Sermon d\'adieu', 'Jabal Al-Rahmah'],
    },
    {
      slug: 'safa-marwa',
      title: 'Safa & Marwa',
      nameAr: 'الصَّفَا وَالْمَرْوَة',
      tag: 'Sa\'i · Omra',
      tagColor: '#1A4A8A',
      description: "Les deux collines entre lesquelles Hajar, mère d'Ismaël, courut 7 fois à la recherche d'eau pour son fils mourant de soif. Allah fit jaillir la source de Zamzam en réponse à sa foi et à son action. Le Sa'i (7 passages) est l'acte de commémoration de cette foi absolue.",
      history: "Ibrahim ﷺ avait laissé Hajar et le nourrisson Ismaël dans une vallée aride sur l'ordre d'Allah. Quand l'eau manqua, Hajar courut entre les deux collines en cherchant de l'aide. Allah fit jaillir Zamzam. Le Coran dit : «Safa et Marwa font partie des symboles d'Allah» (2:158).",
      dua: "إِنَّ الصَّفَا وَالْمَرْوَةَ مِن شَعَائِرِ اللَّهِ",
      duaTrad: "Safa et Marwa font partie des symboles d'Allah. (Al-Baqarah 2:158 — à réciter en commençant le Sa'i)",
      features: ['7 passages · Sa\'i', 'Histoire de Hajar', 'Zamzam'],
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
      title: 'Meeqat Tan\'im',
      nameAr: 'مسجد عائشة',
      tag: 'Meeqat',
      tagColor: '#8B6914',
      description: "Le Meeqat le plus proche de Makkah, aussi appelé Masjid Aïsha (ra). C'est d'ici que les pèlerins déjà à Makkah peuvent entrer en état d'Ihram pour accomplir une Omra supplémentaire. Aïsha (ra) y accomplit son Omra sur l'ordre du Prophète ﷺ lors du Hajj d'adieu.",
      history: "Lors du Hajj d'adieu, Aïsha (ra) eut ses règles et ne put pas accomplir l'Omra qu'elle avait prévue. Après la fin de ses règles, le Prophète ﷺ envoya son frère Abd Ar-Rahman pour l'accompagner à Tan'im, d'où elle entra en Ihram pour accomplir son Omra. Ce lieu porte depuis son nom.",
      dua: "لَبَّيْكَ اللَّهُمَّ عُمْرَةً",
      duaTrad: "Me voici, Ô Allah, pour accomplir une Omra. (à prononcer en entrant en état d'Ihram)",
      features: ['Ihram Omra', 'À 5 km du Haram', 'Meeqat historique'],
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
      features: ['Équivalent d\'une Omra', 'Fondée en 622', 'Première mosquée'],
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
      title: 'Al-Baqi\'',
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
      title: 'Masjid Al-Jumu\'ah',
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
  ],
};

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
  duaTranslit?: string;
  features: string[];
}

export default function LieuxSaintsPage() {
  const [city, setCity] = useState<'Makkah' | 'Madinah'>('Makkah');
  const [selected, setSelected] = useState<Lieu | null>(null);

  const lieux = LIEUX[city];

  return (
    <div style={{ minHeight: '100vh', background: '#FDFBF7' }}>
      <Navbar />

      {/* HERO */}
      <section style={{ background: '#0D0A06', paddingTop: '8rem', paddingBottom: '5rem', paddingLeft: '2rem', paddingRight: '2rem', position: 'relative', overflow: 'hidden', textAlign: 'center' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 70% 60% at 50% 0%, rgba(201,168,76,0.12) 0%, transparent 60%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', fontFamily: 'serif', fontSize: 'clamp(6rem, 20vw, 14rem)', color: 'rgba(201,168,76,0.04)', lineHeight: 1, pointerEvents: 'none', userSelect: 'none', whiteSpace: 'nowrap' }}>الأماكن المقدسة</div>

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 700, margin: '0 auto' }}>
          <div style={{ display: 'inline-block', background: 'rgba(201,168,76,0.15)', border: '1px solid rgba(201,168,76,0.3)', color: '#F0D897', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', padding: '0.3rem 1rem', borderRadius: 50, marginBottom: '1.5rem' }}>
            Encyclopédie · 17 lieux saints
          </div>
          <h1 style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: 'clamp(2.5rem, 7vw, 4.5rem)', fontWeight: 600, color: 'white', lineHeight: 1.1, marginBottom: '1.25rem' }}>
            Les Lieux Saints de l'Islam
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1rem', lineHeight: 1.75, maxWidth: 520, margin: '0 auto 2.5rem' }}>
            Histoire, signification spirituelle et du'a pour chacun des 17 lieux les plus sacrés de Makkah et Madinah.
          </p>

          {/* City toggle */}
          <div style={{ display: 'inline-flex', background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 50, padding: 4, gap: 4 }}>
            {(['Makkah', 'Madinah'] as const).map((c) => (
              <button key={c} onClick={() => { setCity(c); setSelected(null); }} style={{
                padding: '0.6rem 1.75rem', borderRadius: 50, border: 'none', cursor: 'pointer',
                fontSize: '0.82rem', fontWeight: 700, fontFamily: 'var(--font-manrope, sans-serif)',
                background: city === c ? '#C9A84C' : 'transparent',
                color: city === c ? '#1A1209' : 'rgba(255,255,255,0.7)',
                transition: 'all 0.2s',
              }}>
                {c === 'Makkah' ? 'Makkah Al-Mukarramah' : 'Al-Madinah Al-Munawwarah'}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* COUNT */}
      <div style={{ background: '#F5F2EC', padding: '1.25rem 2rem', borderBottom: '1px solid #EDE8DC', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#7A6D5A' }}>
            <span style={{ color: '#1A1209', fontWeight: 700 }}>{lieux.length} lieux</span> à {city} — avec nom arabe, histoire et du'a
          </div>
          <div style={{ fontSize: '0.72rem', color: '#7A6D5A' }}>Cliquez sur une carte pour voir les détails</div>
        </div>
      </div>

      {/* GRID */}
      <section style={{ padding: '3rem 2rem', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {lieux.map((lieu) => (
            <PlaceCard key={lieu.slug} lieu={lieu} onClick={() => setSelected(lieu)} />
          ))}
        </div>
      </section>

      {/* MODAL */}
      {selected && (
        <div onClick={() => setSelected(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backdropFilter: 'blur(4px)' }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: 'white', borderRadius: 24, maxWidth: 600, width: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 32px 80px rgba(0,0,0,0.3)' }}>
            {/* Modal header */}
            <div style={{ background: 'linear-gradient(135deg, #0D0A06, #1A1209)', padding: '2rem', position: 'relative', overflow: 'hidden', borderRadius: '24px 24px 0 0' }}>
              <div style={{ position: 'absolute', top: '50%', right: '1.5rem', transform: 'translateY(-50%)', fontFamily: 'serif', fontSize: '5rem', color: 'rgba(201,168,76,0.08)', lineHeight: 1, userSelect: 'none' }}>{selected.nameAr}</div>
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'inline-block', background: selected.tagColor, color: 'white', fontSize: '0.58rem', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', padding: '0.2rem 0.75rem', borderRadius: 50, marginBottom: '0.75rem' }}>{selected.tag}</div>
                <h2 style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.8rem', fontWeight: 600, color: 'white', marginBottom: '0.25rem' }}>{selected.title}</h2>
                <div style={{ fontFamily: 'serif', fontSize: '1.2rem', color: '#F0D897', direction: 'rtl' }}>{selected.nameAr}</div>
              </div>
              <button onClick={() => setSelected(null)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.7)', width: 32, height: 32, borderRadius: '50%', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
            </div>

            <div style={{ padding: '1.75rem' }}>
              <p style={{ color: '#5A4E3A', lineHeight: 1.8, fontSize: '0.9rem', marginBottom: '1.5rem' }}>{selected.description}</p>

              <div style={{ background: '#FAF7F0', borderRadius: 16, padding: '1.25rem', marginBottom: '1.5rem', border: '1px solid #EDE8DC' }}>
                <div style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#C9A84C', marginBottom: '0.75rem' }}>Histoire</div>
                <p style={{ color: '#5A4E3A', lineHeight: 1.8, fontSize: '0.85rem' }}>{selected.history}</p>
              </div>

              <div style={{ background: 'linear-gradient(135deg, #0D0A06, #1A1209)', borderRadius: 16, padding: '1.5rem', border: '1px solid rgba(201,168,76,0.15)' }}>
                <div style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#C9A84C', marginBottom: '1rem' }}>Du'a recommandée</div>
                {/* Arabic text */}
                <div style={{ fontFamily: 'serif', fontSize: '1.3rem', color: '#F0D897', direction: 'rtl', lineHeight: 1.9, marginBottom: '0.75rem', textAlign: 'center' }}>{selected.dua}</div>
                {/* Translitération */}
                {selected.duaTranslit && (
                  <div style={{ fontSize: '0.78rem', color: 'rgba(201,168,76,0.6)', lineHeight: 1.6, textAlign: 'center', fontStyle: 'italic', marginBottom: '0.5rem' }}>{selected.duaTranslit}</div>
                )}
                {/* Traduction */}
                <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: '0.75rem', marginTop: '0.5rem' }}>🇫🇷 {selected.duaTrad}</div>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '1.25rem' }}>
                {selected.features.map((f) => (
                  <span key={f} style={{ background: '#FAF3E0', color: '#8B6914', border: '1px solid #EDE8DC', fontSize: '0.7rem', fontWeight: 700, padding: '0.25rem 0.75rem', borderRadius: 50 }}>{f}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

function PlaceCard({ lieu, onClick }: { lieu: Lieu; onClick: () => void }) {
  return (
    <div onClick={onClick} style={{ background: 'white', borderRadius: 20, border: '1px solid #EDE8DC', overflow: 'hidden', cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s, border-color 0.2s', display: 'flex', flexDirection: 'column' }} className="place-card-hover">
      <style dangerouslySetInnerHTML={{ __html: `.place-card-hover:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(26,18,9,0.1); border-color: #C9A84C !important; } .place-card-hover:hover .place-cta-btn { background: #C9A84C !important; color: #1A1209 !important; }` }} />

      {/* Header — dark placeholder with Arabic name as hero text */}
      <div style={{ background: 'linear-gradient(135deg, #0D0A06 0%, #1A1209 60%, #2D1F08 100%)', padding: '1.75rem', position: 'relative', overflow: 'hidden', minHeight: 130, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
        {/* Large Arabic watermark as pseudo-image */}
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'serif', fontSize: 'clamp(3rem, 8vw, 5rem)', color: 'rgba(201,168,76,0.09)', lineHeight: 1, userSelect: 'none', direction: 'rtl', padding: '0 1rem', textAlign: 'center' }}>{lieu.nameAr}</div>
        {/* Subtle gold glow */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '50%', background: 'linear-gradient(to top, rgba(201,168,76,0.05), transparent)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-block', background: lieu.tagColor, color: 'white', fontSize: '0.58rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0.18rem 0.6rem', borderRadius: 50, marginBottom: '0.5rem' }}>{lieu.tag}</div>
          <h3 style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.25rem', fontWeight: 600, color: 'white', lineHeight: 1.2 }}>{lieu.title}</h3>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <p style={{ fontSize: '0.8rem', color: '#7A6D5A', lineHeight: 1.7, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', margin: 0 }}>
          {lieu.description}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontFamily: 'serif', fontSize: '1rem', color: '#C9A84C', direction: 'rtl' }}>{lieu.nameAr}</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
            {lieu.features.slice(0, 2).map((f) => (
              <span key={f} style={{ background: '#FAF3E0', color: '#8B6914', fontSize: '0.6rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: 50, border: '1px solid rgba(201,168,76,0.2)' }}>{f}</span>
            ))}
          </div>
        </div>
      </div>

      {/* CTA button */}
      <div style={{ padding: '0 1.25rem 1.25rem' }}>
        <div className="place-cta-btn" style={{ background: '#1A1209', color: '#F0D897', textAlign: 'center', padding: '0.7rem', borderRadius: 50, fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.04em', transition: 'background 0.2s, color 0.2s' }}>
          Découvrir →
        </div>
      </div>
    </div>
  );
}
