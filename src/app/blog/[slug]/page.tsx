import { notFound } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ScrollReveal from '@/components/ScrollReveal';
import type { Metadata } from 'next';
import { BLOG_ARTICLES, BLOG_ARTICLES_LIST } from '../data';

export function generateStaticParams() {
  return Object.keys(BLOG_ARTICLES).map(slug => ({ slug }));
}

export async function generateMetadata({ params }: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = BLOG_ARTICLES[slug];

  if (!article) return { title: 'Article introuvable | SAFARUMA' };

  const url = `https://safaruma.com/blog/${slug}`;
  const ogImage = article.image || 'https://safaruma.com/icon-logo.png';

  return {
    title: `${article.title} | SAFARUMA`,
    description: article.description,
    keywords: article.keywords.join(','),
    alternates: { canonical: url },
    openGraph: {
      title: article.title,
      description: article.description,
      url,
      type: 'article',
      siteName: 'SAFARUMA',
      locale: 'fr_FR',
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt || article.publishedAt,
      authors: [article.author],
      section: article.category,
      tags: article.keywords,
      images: [{ url: ogImage, width: 1200, height: 630, alt: article.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.description,
      images: [ogImage],
    },
  };
}

// ─── Article content ──────────────────────────────────────────────────────────

const CONTENT: Record<string, { sections: { heading?: string; body: string }[] }> = {
  'comment-preparer-omra-10-etapes': {
    sections: [
      { body: "L'Omra ne s'improvise pas. Elle se prépare — spirituellement, administrativement, physiquement. Les pèlerins qui arrivent sans préparation accomplissent les gestes sans les vivre. Ceux qui préparent vivent une transformation. Voici les 10 étapes pour que rien ne soit laissé au hasard." },
      { heading: 'Étape 1 — Faire l\'intention (Niyya)', body: "Tout commence par l'intention pure. L'Omra n'a de valeur que si elle est faite uniquement pour Allah. Commencez dès aujourd'hui à purifier votre intention : ne partez pas pour montrer, pour poster, pour cocher une case. Partez pour revenir transformé. C'est la seule préparation qui compte vraiment." },
      { heading: 'Étape 2 — Apprendre les rituels', body: "Le tawaf (7 tours autour de la Kaaba), le sa'i (7 passages entre Safa et Marwa), la coupe des cheveux (halq ou taqsir) — apprenez le sens et la procédure de chaque rite. Ne comptez pas tout apprendre sur place. Demandez à votre guide SAFARUMA de vous envoyer son guide de préparation en ligne dès la réservation." },
      { heading: 'Étape 3 — Obtenir le visa Nusuk', body: "Depuis 2023, le visa Omra s'obtient via la plateforme officielle Nusuk (nusuk.sa). Documents requis : passeport valide 6 mois après retour, photo d'identité numérique, certificat de vaccin méningite ACYW. Délai habituel : 3 à 10 jours ouvrables. Votre guide SAFARUMA peut vous accompagner dans cette démarche." },
      { heading: 'Étape 4 — Vaccins et santé', body: "Le vaccin contre la méningite ACYW est obligatoire. Il est recommandé de consulter votre médecin pour : mise à jour des vaccins courants, prescription de médicaments pour les maux courants (gastro, douleurs, allergies), et évaluation de votre condition physique si vous avez plus de 60 ans ou des problèmes de santé chroniques." },
      { heading: 'Étape 5 — Réserver votre guide SAFARUMA', body: "Votre guide est la clé de tout. Il vous accueillera à l'aéroport, vous expliquera chaque geste dans votre langue, vous emmènera dans les lieux saints et les lieux historiques, et sera disponible pour vos questions à toute heure. Réservez au minimum 6 semaines à l'avance pour les meilleures disponibilités." },
      { heading: 'Étape 6 — Préparer l\'ihram', body: "Pour les hommes : 2 pièces de tissu blanc non cousu, des sandales qui ne cachent pas les os du pied. Pour les femmes : vêtements normaux couvrants (pas de niqab ni de gants en état d'ihram). Achetez et portez votre ihram une fois avant le départ pour vous y habituer. Certains hommes le trouvent inconfortable la première fois." },
      { heading: 'Étape 7 — Apprendre les du\'a essentielles', body: "Mémorisez au minimum : la du'a d'entrée en ihram (Labbayk Allahumma labbayk…), la du'a du tawaf, la du'a au Maqam Ibrahim, la du'a au Zamzam et la du'a entre Safa et Marwa. Votre guide vous les expliquera en détail sur place, mais les connaître à l'avance vous permettra de vous concentrer sur la présence spirituelle plutôt que sur la mémorisation." },
      { heading: 'Étape 8 — Organiser votre hébergement', body: "Idéalement, choisissez un hôtel à moins de 1 km du Masjid Al-Haram. Plus c'est près, plus vous pouvez prier souvent sans vous épuiser. Les prix varient considérablement selon la saison. Le Ramadan est la période la plus chargée — réservez 3 à 4 mois à l'avance. Votre guide SAFARUMA peut vous recommander des hôtels selon votre budget." },
      { heading: 'Étape 9 — Préparer votre corps', body: "L'Omra implique des kilomètres de marche par jour sur un sol dur, souvent en chaleur intense. Commencez à marcher 30 à 45 minutes par jour dès 2 mois avant le départ. Portez vos sandales de tawaf chez vous pour les roder. Renforcez votre hydratation — l'air à Makkah est extrêmement sec." },
      { heading: 'Étape 10 — Se déconnecter et se recentrer', body: "Dans les jours qui précèdent votre départ, réduisez votre exposition aux réseaux sociaux. Lisez davantage : Coran, Sîra, histoires des Compagnons. Parlez de ce voyage à vos proches, demandez leurs du'a. Arrivez à Makkah avec un cœur vide des préoccupations du monde — c'est la vraie préparation." },
      { body: "Ces 10 étapes, votre guide SAFARUMA les connaît par cœur. Il vous accompagnera à chacune d'elles, bien avant que vous ne posiez le pied à l'aéroport de Jeddah." },
    ],
  },

  'les-7-tours-du-tawaf': {
    sections: [
      { body: "Le Tawaf — les 7 tours effectués autour de la Kaaba dans le sens anti-horaire — est le premier rite de la Omra. C'est aussi l'un des actes d'adoration les plus symboliques de l'Islam. Pourquoi 7 tours ? Que représente chaque passage ? Ce que les savants en disent va vous surprendre." },
      { heading: 'L\'origine du Tawaf', body: "Le Tawaf remonte à Ibrahim ﷺ. Après avoir reconstruit la Kaaba avec son fils Ismaël ﷺ sur l'ordre d'Allah, il accomplit les premiers tours. C'est un acte de soumission qui précède l'Islam de milliers d'années. En tournant, vous vous inscrivez dans une chaîne de croyants qui traverse l'histoire de l'humanité depuis Abraham." },
      { heading: 'Pourquoi 7 tours ?', body: "Le chiffre 7 revient dans de nombreux rituels islamiques : 7 tours de tawaf, 7 passages du sa'i, 7 pierres lancées à Mina, 7 versets dans Al-Fatiha. Les savants l'interprètent comme un symbole de complétude et d'infinité — non au sens mathématique, mais spirituel. 7 n'est pas une limite : c'est un accomplissement. Ce que vous faites est complet devant Allah." },
      { heading: 'Le sens de la direction anti-horaire', body: "On tourne dans le sens opposé aux aiguilles d'une montre. Les scientifiques ont observé que les électrons tournent autour du noyau dans ce sens, que la Terre tourne sur elle-même dans ce sens, que les galaxies spiralent souvent dans ce sens. En tournant, vous vous accordez au mouvement de la création. Cette observation, avancée par certains savants contemporains, reste une réflexion — non une certitude — mais elle est belle." },
      { heading: 'La Hajar Al-Aswad — la Pierre Noire', body: "Chaque tour commence et se termine au niveau de la Hajar Al-Aswad (la Pierre Noire), encastrée dans l'angle sud-est de la Kaaba. Si vous pouvez la toucher ou l'embrasser, faites-le. Sinon, un signe de la main suffit. Le Prophète ﷺ a dit : «La Pierre Noire vient du Paradis». Omar ibn Al-Khattab (ra) avait dit devant elle : «Je sais que tu n'es qu'une pierre et que tu ne peux ni nuire ni profiter. Mais j'ai vu le Prophète te toucher, alors je te touche.» La foi sans compréhension complète, assumée avec humilité : c'est l'essence du Tawaf." },
      { heading: 'Le Maqam Ibrahim', body: "Après les 7 tours, vous priez deux rak'ahs derrière le Maqam Ibrahim — la pierre sur laquelle Ibrahim ﷺ se tenait debout pour construire la Kaaba, et dont les empreintes de ses pieds sont encore visibles. Le Coran y fait référence : «Faites du Maqam Ibrahim un lieu de prière» (2:125). Ce n'est pas une recommandation — c'est un ordre divin." },
      { heading: 'Ce qu\'il faut réciter pendant le Tawaf', body: "Il n'y a pas de du'a officielle imposée pour chaque tour. La liberté est totale. C'est l'un des rares actes dans l'Islam où vous pouvez parler à Allah dans votre propre langue, avec vos propres mots, depuis le fond de votre cœur. Certains pleurent sans pouvoir s'arrêter. C'est normal. C'est même ce qui est attendu." },
      { heading: 'Les conditions de validité', body: "Pour être valide, le tawaf doit : commencer au niveau de la Hajar Al-Aswad, se faire en état de pureté rituelle (wudu), tourner en ayant la Kaaba à gauche (sens anti-horaire), et faire les 7 tours complets. Les femmes en période de menstruation ne peuvent pas accomplir le tawaf — elles doivent attendre. Votre guide SAFARUMA vous expliquera ces règles en détail selon votre situation." },
      { body: "Le Tawaf n'est pas une performance. Ce n'est pas une course. C'est une conversation avec Allah en mouvement. Les pèlerins qui le comprennent vraiment disent souvent qu'ils auraient voulu ne jamais s'arrêter." },
    ],
  },

  'jabal-uhud-bataille-islam': {
    sections: [
      { body: "Il y a des lieux de mémoire qui pèsent différemment. Jabal Uhud n'est pas un site touristique — c'est un cimetière de martyrs. C'est là que le Prophète ﷺ a pleuré ses compagnons tombés. Comprendre Uhud, c'est comprendre quelque chose d'essentiel sur la foi." },
      { heading: 'Le contexte historique', body: "Nous sommes en l'an 3 de l'Hégire (625 après J.-C.). Un an après la victoire éclatante de Badr, les Qurayshites reviennent à Madinah avec 3000 hommes pour venger leur défaite. Le Prophète ﷺ, après consultation, décide de sortir affronter l'ennemi au pied du mont Uhud plutôt que de défendre Madinah de l'intérieur. Une décision qui sera lourde de conséquences." },
      { heading: 'Le déroulement de la bataille', body: "Initialement, les musulmans prennent l'avantage. Les archers postés sur le Jabal Al-Roumat (la montagne des archers) protègent le flanc droit. Mais, voyant la victoire imminente, la plupart des archers quittent leur poste pour recueillir le butin — désobéissant aux ordres exprès du Prophète ﷺ. Khalid ibn Al-Walid, alors chef de la cavalerie qurayshite, s'engouffre dans la brèche. La victoire tourne au désastre." },
      { heading: 'Les martyrs d\'Uhud', body: "70 compagnons du Prophète ﷺ tombèrent ce jour-là. Parmi eux, Hamza ibn Abd Al-Muttalib — l'oncle du Prophète ﷺ, surnommé «le Lion d'Allah». Il fut tué par un lanceur de javelot éthiopien nommé Wahshi, puis mutilé par Hind bint Utba. Le Prophète ﷺ, en voyant le corps de son oncle, pleura comme il n'avait jamais pleuré. Il dit : «Il est le seigneur des martyrs auprès d'Allah.»" },
      { heading: 'La blessure du Prophète ﷺ', body: "Lors de la bataille, le Prophète ﷺ fut lui-même blessé : une dent brisée, le visage ensanglanté, une blessure à la joue. Des rumeurs de sa mort se répandirent dans les rangs musulmans, causant la panique. C'est à ce moment que Ka'b ibn Malik le reconnut vivant et cria : «Le Messager d'Allah est vivant !» — retournant ainsi le moral des combattants." },
      { heading: 'La leçon d\'Uhud', body: "Uhud est une défaite — mais une défaite chargée d'enseignements. Le Coran lui consacre plus de 60 versets dans la Sourate Al-Imran. La leçon centrale : la désobéissance à un ordre du Prophète ﷺ, même motivée par un désir de victoire, mène à la catastrophe. La foi sans discipline n'est pas complète." },
      { heading: 'La visite aujourd\'hui', body: "Jabal Uhud est à environ 5 km au nord de Masjid An-Nabawi à Madinah. Le cimetière des martyrs (Uhud Martyrs Cemetery) est accessible et vous pouvez y réciter Al-Fatiha pour les compagnons tombés. La montagne elle-même est imposante — une masse granitique rose-grise qui domine la plaine. Le Prophète ﷺ l'aimait : «Uhud est une montagne qui nous aime et que nous aimons.»" },
      { heading: 'Le rocher des archers', body: "Votre guide peut vous emmener au Jabal Al-Roumat, le rocher des archers. C'est depuis cet endroit précis que les archers auraient dû rester. C'est minuscule, presque anodin. Et pourtant, c'est de là que l'histoire a basculé. Se tenir à cet endroit avec un guide qui vous raconte les événements minute par minute est une expérience qui ne ressemble à rien d'autre." },
      { body: "Le Prophète ﷺ visitait régulièrement le cimetière d'Uhud et récitait : «Assalamu alaykum ya ahla al-qubour» — Que la paix soit sur vous, ô habitants des tombeaux. Y passer quelques minutes en silence, avec la conscience de ce qui s'est passé ici, peut changer profondément votre façon de comprendre l'Islam." },
    ],
  },

  'guide-visa-omra-2025': {
    sections: [
      { body: "Depuis le lancement de la plateforme Nusuk par l'Autorité générale du Tourisme d'Arabie Saoudite, la procédure de visa Omra a été profondément remaniée. Voici tout ce qui a changé et ce que les pèlerins francophones doivent savoir en 2025." },
      { heading: 'Qu\'est-ce que Nusuk ?', body: "Nusuk (nusuk.sa) est la plateforme officielle du gouvernement saoudien pour la gestion des pèlerinages. Elle remplace les anciens circuits d'agences agréées pour la plupart des nationalités. Vous pouvez y demander votre visa, réserver votre hébergement homologué et gérer votre itinéraire. Votre guide SAFARUMA peut vous accompagner dans cette démarche de A à Z." },
      { heading: 'Qui peut faire une Omra en 2025 ?', body: "Les ressortissants de la quasi-totalité des pays peuvent désormais demander un visa Omra directement, sans passer par une agence de voyage. Les femmes de moins de 45 ans doivent voyager avec un mahram (père, époux, frère, fils majeur) ou dans le cadre d'un groupe organisé par une agence agréée. Cette règle fait l'objet d'assouplissements progressifs selon les nationalités." },
      { heading: 'Documents requis', body: "📄 Passeport valide au minimum 6 mois après la date de retour prévue\n📸 Photo d'identité numérique récente (fond blanc, visage dégagé)\n💉 Certificat de vaccin méningite ACYW135 (moins de 3 ans)\n📋 Réservation d'hôtel confirmée à Makkah et/ou Madinah\n✈️ Billet d'avion aller-retour ou confirmation de vol\n📱 Numéro de téléphone valide pour la vérification SMS" },
      { heading: 'Délais et coûts', body: "Le délai de traitement habituel est de 3 à 10 jours ouvrables. En période de pointe (Ramadan, vacances scolaires), comptez 2 à 3 semaines. Le visa Omra est gratuit — il n'y a pas de frais consulaires pour la plupart des nationalités. Méfiez-vous des sites tiers qui facturent des \"frais de traitement\" pour un service qui devrait être gratuit." },
      { heading: 'Les erreurs les plus fréquentes', body: "❌ Photo non conforme (lunettes, fond coloré, qualité insuffisante)\n❌ Passeport expirant dans moins de 6 mois après le retour\n❌ Vaccin méningite trop ancien (plus de 3 ans)\n❌ Hébergement non homologué Nusuk (certains hôtels ne sont pas encore dans le système)\n❌ Demande trop tardive pendant le Ramadan (période la plus chargée de l'année)" },
      { heading: 'Le visa Omra multiple', body: "Depuis 2023, l'Arabie Saoudite propose un visa Omra multiple valable 90 jours, permettant plusieurs entrées. Idéal pour les familles qui veulent accomplir plusieurs Omra pendant un même séjour. Votre guide SAFARUMA peut vous conseiller sur la meilleure option selon votre situation." },
      { heading: 'Les nationalités avec procédures spécifiques', body: "Certains pays ont des procédures légèrement différentes, notamment les ressortissants de pays avec visa de résidence étranger (expatriés vivant en France, Belgique, Canada…). La règle générale : votre visa est demandé selon le passeport que vous présentez, non votre pays de résidence. Votre guide peut vérifier votre situation spécifique." },
      { body: "La bonne nouvelle : si vous avez un guide SAFARUMA, le visa n'est plus un obstacle. Notre équipe accompagne chaque pèlerin dans la constitution de son dossier, vérifie les documents avant soumission et suit le traitement. Aucune mauvaise surprise à l'aéroport." },
    ],
  },

  'difference-omra-hajj': {
    sections: [
      { body: "Omra. Hajj. Ces deux mots reviennent dans chaque conversation sur les pèlerinages islamiques. Certains les confondent, d'autres pensent que l'un est une version allégée de l'autre. La réalité est plus nuancée — et plus belle." },
      { heading: 'La définition fondamentale', body: "L'Omra est un pèlerinage mineur, accompli à tout moment de l'année. Le Hajj est le cinquième pilier de l'Islam, obligatoire une fois dans la vie pour tout musulman qui en a la capacité, et qui ne peut s'accomplir qu'à des dates très précises : du 8 au 13 Dhul Hijja (le douzième mois du calendrier islamique)." },
      { heading: 'Ce que l\'Omra et le Hajj ont en commun', body: "Les deux pèlerinages partagent plusieurs rituels fondamentaux :\n\n🕌 L'état d'Ihram : vêtements blancs, interdictions rituelles, prononciation du Talbiyah\n🕌 Le Tawaf autour de la Kaaba : 7 tours anti-horaires\n🕌 Le Sa'i : 7 passages entre Safa et Marwa\n🕌 Le rasage ou la coupe des cheveux pour sortir de l'état d'Ihram\n🕌 La prière à Masjid Al-Haram (Makkah)" },
      { heading: 'Ce que le Hajj a en plus', body: "Le Hajj comporte des rituels absents de la Omra, qui constituent son cœur spirituel :\n\n⭐ Le Wuquf à Arafat : le 9 Dhul Hijja, des millions de pèlerins restent debout dans la plaine d'Arafat de la mi-journée jusqu'au coucher du soleil, en prière et invocation. C'est le pilier central du Hajj — sans le Wuquf, il n'y a pas de Hajj valide.\n⭐ La nuit à Muzdalifah : après Arafat, on passe la nuit à ciel ouvert à Muzdalifah, collectant les pierres pour le jet symbolique.\n⭐ Le jet de pierres (Rami) à Mina : symbolisant le rejet du shaytân, 3 jours de suite.\n⭐ L'immolation sacrificielle (Udhiya/Qurbani) le jour de l'Aïd Al-Adha." },
      { heading: 'Le statut religieux', body: "L'Omra est Sunna Mu'akkada — une pratique prophétique fortement recommandée. L'accomplir est une récompense immense, mais ne pas l'accomplir n'est pas un péché. Le Hajj, lui, est Fard — une obligation divine pour tout musulman qui en a la capacité physique et financière. Ne pas l'accomplir alors qu'on en était capable est considéré comme une faute grave par la majorité des savants." },
      { heading: 'La récompense de l\'Omra', body: "Le Prophète ﷺ a dit : «L'Omra est une expiation pour les péchés commis entre elle et la suivante. Et le Hajj mabrur n'a pas d'autre récompense que le Paradis.» (Bukhari & Muslim). Même si la Omra est facultative, sa valeur devant Allah est immense. Certains savants recommandent d'accomplir la Omra au moins une fois par an si on en a la capacité." },
      { heading: 'Peut-on faire l\'Omra pendant le Hajj ?', body: "Oui. Il existe même plusieurs façons de les combiner :\n\n✦ Hajj Tamattu' : Omra d'abord, puis Hajj séparément (en sortant de l'ihram entre les deux)\n✦ Hajj Qiran : Omra et Hajj avec un seul ihram continu\n✦ Hajj Ifrad : Hajj seul, sans Omra\n\nLa majorité des pèlerins francophones pratiquent le Hajj Tamattu'." },
      { heading: 'Pourquoi commencer par l\'Omra ?', body: "La plupart des savants recommandent d'accomplir la Omra avant le Hajj. C'est une façon de découvrir les Lieux Saints, d'apprendre les rituels dans un cadre moins intense, et d'arriver au Hajj avec une expérience déjà acquise. SAFARUMA propose des programmes Omra qui sont aussi une préparation au Hajj — avec des guides qui vous enseignent les rituels des deux pèlerinages." },
      { body: "Que vous vous prépariez pour une Omra, que vous envisagiez le Hajj, ou que vous cherchiez à mieux comprendre votre religion — votre guide SAFARUMA est là pour vous accompagner, expliquer, et faire vivre ces rituels dans toute leur profondeur." },
    ],
  },
};

// ─── Page ──────────────────────────────────────────────────────────────────────

export default async function BlogArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = BLOG_ARTICLES[slug];
  const content = CONTENT[slug];

  if (!article || !content) notFound();

  const url = `https://safaruma.com/blog/${slug}`;
  const ogImage = article.image || 'https://safaruma.com/icon-logo.png';

  const blogPostingSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': `${url}#article`,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    headline: article.title,
    description: article.description,
    image: [ogImage],
    datePublished: article.publishedAt,
    dateModified: article.updatedAt || article.publishedAt,
    author: {
      '@type': 'Person',
      name: article.author,
      jobTitle: article.authorRole,
      ...(article.authorUrl ? { url: article.authorUrl } : {}),
    },
    publisher: { '@id': 'https://safaruma.com/#organization' },
    articleSection: article.category,
    keywords: article.keywords.join(', '),
    inLanguage: 'fr-FR',
    url,
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Accueil', item: 'https://safaruma.com' },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://safaruma.com/blog' },
      { '@type': 'ListItem', position: 3, name: article.title, item: url },
    ],
  };

  const relatedArticles = BLOG_ARTICLES_LIST.filter((a) => a.slug !== slug).slice(0, 3);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostingSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <Navbar />
      <ScrollReveal />

      {/* HERO */}
      <section style={{
        background: 'var(--deep)', paddingTop: '8rem', paddingBottom: '5rem',
        paddingLeft: '4rem', paddingRight: '4rem',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 60% 70% at 50% 0%, rgba(201,168,76,0.11) 0%, transparent 60%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 760, margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.5rem', animation: 'fadeInUp 0.7s ease both' }}>
            <span style={{ background: article.categoryBg, color: article.categoryColor, border: `1px solid ${article.categoryColor}30`, fontSize: '0.62rem', fontWeight: 800, letterSpacing: '0.1em', padding: '0.25rem 0.7rem', borderRadius: 50, textTransform: 'uppercase' }}>
              {article.category}
            </span>
            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.78rem' }}>{article.date}</span>
            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.78rem' }}>· {article.readTime} de lecture</span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: 'clamp(2rem, 4.5vw, 3.2rem)', fontWeight: 300, color: 'white', lineHeight: 1.15, marginBottom: '2rem', animation: 'fadeInUp 0.8s 0.15s ease both', opacity: 0 }}>
            {article.title}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', animation: 'fadeInUp 0.8s 0.3s ease both', opacity: 0 }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, #F0D897, #C9A84C)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-cormorant, serif)', fontWeight: 700, color: 'var(--deep)', fontSize: '1rem', flexShrink: 0 }}>
              {article.author.split(' ').map((w: string) => w[0]).join('').slice(0, 2)}
            </div>
            <div>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'white' }}>{article.author}</div>
              <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)' }}>{article.authorRole}</div>
            </div>
          </div>
        </div>
      </section>

      {/* CONTENT */}
      <section style={{ padding: '5rem 4rem', background: 'var(--cream)' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          {content.sections.map((section, i) => (
            <div key={i} style={{ marginBottom: '2rem' }}>
              {section.heading && (
                <h2 style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: 'clamp(1.3rem, 2.5vw, 1.8rem)', fontWeight: 600, color: 'var(--deep)', marginBottom: '0.75rem', marginTop: i > 0 ? '1rem' : 0 }}>
                  {section.heading}
                </h2>
              )}
              <div style={{ color: 'var(--muted)', lineHeight: 1.9, fontSize: '0.95rem', whiteSpace: 'pre-line' }}>
                {section.body}
              </div>
            </div>
          ))}

          {/* Author card */}
          <div style={{
            background: 'white', borderRadius: 16, padding: '1.75rem',
            border: '1px solid var(--sand)', display: 'flex', gap: '1.25rem',
            alignItems: 'flex-start', marginTop: '3rem',
          }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg, #F0D897, #C9A84C)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-cormorant, serif)', fontWeight: 700, color: 'var(--deep)', fontSize: '1.2rem', flexShrink: 0 }}>
              {article.author.split(' ').map((w: string) => w[0]).join('').slice(0, 2)}
            </div>
            <div>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--deep)', marginBottom: '0.15rem' }}>Écrit par {article.author}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--gold-dark)', fontWeight: 700, letterSpacing: '0.05em', marginBottom: '0.5rem' }}>{article.authorRole}</div>
              <p style={{ fontSize: '0.82rem', color: 'var(--muted)', lineHeight: 1.7 }}>
                Guide certifié SAFARUMA avec des années d&apos;expérience à Makkah et Madinah. Ses articles sont écrits directement depuis les Lieux Saints, avec la précision de quelqu&apos;un qui y vit chaque jour.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* RELATED */}
      <section style={{ padding: '4rem', background: 'white', borderTop: '1px solid var(--sand)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div className="section-label reveal">Continuez la lecture</div>
          <h2 className="reveal reveal-d1" style={{ marginBottom: '2rem' }}>
            Articles <em>connexes</em>
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
            {relatedArticles.map((a, i) => (
              <Link key={a.slug} href={`/blog/${a.slug}`} style={{ textDecoration: 'none' }}>
                <div className={`reveal reveal-d${i + 1}`} style={{
                  background: 'var(--cream)', borderRadius: 16, overflow: 'hidden',
                  border: '1px solid var(--sand)',
                  transition: 'transform 0.2s',
                }}>
                  <div style={{ background: 'linear-gradient(135deg, var(--deep), #2D1F08)', padding: '1.5rem', minHeight: 90, position: 'relative' }}>
                    <span style={{ background: a.categoryBg, color: a.categoryColor, border: `1px solid ${a.categoryColor}30`, fontSize: '0.58rem', fontWeight: 800, letterSpacing: '0.1em', padding: '0.18rem 0.55rem', borderRadius: 50, textTransform: 'uppercase' }}>
                      {a.category}
                    </span>
                  </div>
                  <div style={{ padding: '1.25rem' }}>
                    <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--deep)', lineHeight: 1.4, marginBottom: '0.5rem' }}>{a.title}</h3>
                    <div style={{ fontSize: '0.68rem', color: 'var(--muted)' }}>{a.date} · {a.readTime}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <h2 className="reveal" style={{ color: 'white' }}>
          Prêt à vivre votre <em style={{ color: 'var(--gold)' }}>Omra différemment ?</em>
        </h2>
        <p className="reveal reveal-d1" style={{ color: 'rgba(255,255,255,0.5)', maxWidth: 440, margin: '1rem auto 2.5rem', lineHeight: 1.8 }}>
          Trouvez le guide certifié qui correspond à votre langue, votre groupe et vos dates.
        </p>
        <div className="reveal reveal-d2">
          <Link href="/guides" className="btn-primary" style={{ background: 'var(--gold)', color: 'var(--deep)', fontWeight: 700 }}>
            Trouver mon guide →
          </Link>
        </div>
      </section>

      <Footer />
    </>
  );
}
