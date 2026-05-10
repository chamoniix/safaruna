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

const CONTENT: Record<string, { sections: { heading?: string; body: string }[]; faqs?: { q: string; a: string }[] }> = {
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

  'guide-visa-omra': {
    sections: [
      {
        body: "Vous avez déjà pris votre décision : vous ferez votre Omra en autonomie. Vol réservé, hôtel trouvé — il ne manque plus que le visa. Depuis 2023, la procédure passe intégralement par Nusuk, la plateforme officielle du ministère saoudien du Hajj et de l'Omra. Pour les pèlerins d'Europe, c'est désormais 100 % en ligne — le visa s'obtient en 48 à 72 heures ouvrables.\n\nCe guide s'adresse au pèlerin francophone autonome qui veut maîtriser la procédure sans surprise : éligibilité par nationalité, étapes Nusuk détaillées, documents requis par pays, coûts réels 2026, règles de séjour et conduite à tenir en cas de refus.\n\nPoint clé 2026 : le Booking Reference Number (BRN), votre numéro de réservation hôtelière validée via Nusuk, est désormais obligatoire avant de soumettre votre demande de visa. Sans BRN, le dossier est bloqué.",
      },
      {
        heading: "Visa Omra — les conditions d'éligibilité en 2026",
        body: "La quasi-totalité des nationalités sont éligibles au visa Omra. Les pèlerins titulaires d'un passeport français, belge ou suisse bénéficient d'une procédure entièrement en ligne via Nusuk. Les ressortissants marocains, algériens et tunisiens doivent passer par un centre VFS Tasheer pour le dépôt des empreintes biométriques — que vous résidiez en Europe ou au Maghreb. Pour les pèlerins sénégalais résidant au Sénégal, une agence agréée locale ou l'ambassade saoudienne à Dakar reste nécessaire.\n\nTrois types de visas coexistent en Arabie Saoudite : le visa Omra dédié (via Nusuk, simple entrée, 30 jours maximum de séjour), le visa Hajj (procédure entièrement séparée, uniquement aux dates du Dhul Hijja) et le visa touristique eVisa (multi-entrées valable 1 an, 90 jours cumulés, disponible pour 57 nationalités). Ce dernier permet techniquement l'accès au Haram, mais sans permis Omra (izin) Nusuk ni accès prioritaire à la Rawdah de Médine. Pour un pèlerinage sérieux, le visa Omra dédié s'impose.",
      },
      {
        heading: "Comment faire sa demande de visa Omra via Nusuk",
        body: "La procédure se déroule en quatre étapes sur umrah.nusuk.sa ou via l'application Nusuk (iOS et Android, gratuite, interface disponible en français depuis 2024).\n\nÉtape 1 — Créer son compte Nusuk\nRendez-vous sur umrah.nusuk.sa. Créez votre compte avec votre adresse email et votre numéro de téléphone (vérification SMS). L'application Nusuk est disponible sur App Store et Google Play.\n\nÉtape 2 — Compléter votre profil pèlerin\nRenseignez vos informations exactement comme sur votre passeport : nom complet, date de naissance, nationalité, numéro et date d'expiration du passeport. Téléversez votre photo d'identité (fond blanc strict, visage centré, sans lunettes, normes ICAO) et votre certificat de vaccin méningite ACWY.\n\nÉtape 3 — Obtenir votre BRN et soumettre la demande\nRéservez votre hébergement à La Mecque via le système Nusuk — vous obtenez un BRN (Booking Reference Number). Ce numéro est obligatoire depuis 2025 : sans BRN validé, la demande de visa Omra est bloquée. Soumettez ensuite votre demande en liant le BRN, vos dates de voyage et votre photo de passeport.\n\nÉtape 4 — Suivi et confirmation\nPour les eVisa (Europe) : délai de 48 à 72 heures ouvrables. Vous recevez une notification email. Le visa apparaît dans votre profil Nusuk sous forme de QR code. Conservez-le accessible sur votre téléphone ou imprimez-le — il est contrôlé à l'arrivée dans les aéroports saoudiens.\n\nL'application Nusuk est également indispensable sur place : elle génère votre permis Omra (izin), obligatoire pour entrer dans la Masjid Al-Haram. Sans permis valide dans Nusuk, l'accès au Haram est refusé même avec un visa en règle. Téléchargez l'application avant le départ.",
      },
      {
        body: "Conseil expert SAFARUMA — Ce que vos documents ne vous disent pas\n\nDeux erreurs causent la majorité des blocages que nous observons chez nos pèlerins : l'hébergement non enregistré dans Nusuk (certains hôtels bien connus ne figurent pas encore dans le système — vérifiez impérativement avant de réserver) et la photo d'identité non conforme aux normes ICAO (lunettes, fond légèrement coloré, mauvais cadrage, ombres sur le visage). Pour la photo : fond blanc parfait, visage centré, sans lunettes, luminosité uniforme. En cas de doute, un photographe professionnel vous coûtera 5 à 10 euros et vous évitera une semaine de délai supplémentaire.\n\n— Youssouf Konaté, Guide certifié SAFARUMA · Madinah",
      },
      {
        heading: "Documents requis selon votre pays de résidence",
        body: "Documents communs à toutes les nationalités : passeport biométrique valide au minimum 6 mois après la date de retour, photo d'identité numérique conforme ICAO, certificat de vaccin méningite ACWY135 (moins de 3 ans, administré plus de 10 jours avant le départ), billet aller-retour confirmé, réservation hôtelière Nusuk avec BRN. Pour les convertis : certificat de conversion à l'Islam.\n\nRésidant en Europe — passeport français, belge ou suisse\nProcédure 100 % en ligne sur umrah.nusuk.sa. Aucun dépôt physique requis. Délai eVisa : 48 à 72 heures. Aucun frais d'agence nécessaire.\n\nRessortissants maghrébins résidant en Europe (passeport marocain, algérien ou tunisien)\nDépôt physique obligatoire en centre VFS Tasheer avec prise d'empreintes biométriques. En France : VFS Tasheer Paris (11-13 rue Madame de Sanzillon, 92110 Clichy). Ajoutez environ 60 € de frais VFS. Titre de séjour valide du pays de résidence exigé.\n\nRésidant au Maroc, en Algérie ou en Tunisie\nMême procédure VFS Tasheer dans votre pays de résidence. Pour l'Algérie, certains consulats demandent un certificat de résidence de 10 ans — vérifiez auprès de votre centre VFS Tasheer avant de vous déplacer.\n\nRésidant au Sénégal et en Afrique francophone subsaharienne\nPas d'eVisa entièrement en ligne disponible. Passez par une agence agréée (ex. Dakar Makkah, licence n°30146) ou l'ambassade saoudienne à Dakar. Si vous résidez en Europe avec un titre de séjour valide, vous pouvez utiliser le centre VFS Tasheer de votre pays de résidence.\n\nFemmes voyageant seules\nDepuis 2021-2022, le mahram n'est plus obligatoire pour l'Omra. Condition : être majeure (18 ans +) et voyager avec un groupe ou via une agence agréée. Aucune limite d'âge n'est imposée par le gouvernement saoudien.",
      },
      {
        heading: "Combien coûte le visa Omra en 2026 ?",
        body: "Le visa Omra n'est pas gratuit, contrairement à ce qu'affirment certains anciens articles. En 2026, les frais officiels via Nusuk se décomposent ainsi :\n\nFrais gouvernementaux officiels : 300 SAR (~75 €), reversés au ministère des Affaires étrangères saoudien. Assurance santé obligatoire (intégrée dans le flux Nusuk, prestataires Bupa ou Tawuniya) : 100 à 180 SAR (~25 à 45 €) selon l'âge et la durée du séjour. Total moyen via Nusuk : environ 535 SAR (~135 €).\n\nFrais supplémentaires selon votre situation : centre VFS Tasheer (Maghreb, Afrique subsaharienne) environ 60 €, photographe professionnel ICAO environ 5 à 10 €.\n\nMéfiez-vous des sites tiers proposant de vous «faciliter» la demande contre des frais de traitement : la procédure Nusuk est directe et ne nécessite aucun intermédiaire payant pour les nationalités éligibles à l'eVisa.",
      },
      {
        heading: "Durée de validité et règles de séjour",
        body: "Changement majeur depuis juin 2025 : la fenêtre d'entrée après délivrance du visa a été réduite de 90 à 30 jours. Concrètement, une fois votre visa délivré, vous avez 30 jours pour entrer en Arabie Saoudite. Passé ce délai, le visa est périmé et vous devez en demander un nouveau. La durée maximale de séjour sur place reste de 30 jours. Le visa Omra est à entrée unique.\n\nPour la saison 1447H (2025-2026), les permis Omra via Nusuk ont été suspendus à partir du 18 avril 2026 pour la période Hajj, jusqu'au 31 mai 2026. Planifiez votre séjour en dehors de cette fenêtre si vous visez la prochaine saison.\n\nLe visa Omra autorise la visite de l'ensemble du territoire saoudien : Djeddah, Médine, Taëf et les autres villes. Seul le cœur de La Mecque (périmètre du Haram) est réservé aux musulmans. Médine est fortement recommandée — la visite de la Masjid An-Nabawi, du Mont Uhud et des sites historiques de la période prophétique enrichit considérablement le pèlerinage.",
      },
      {
        heading: "Que faire en cas de refus ou de problème ?",
        body: "Les causes de refus les plus fréquentes en 2026 : BRN manquant ou hébergement non enregistré dans Nusuk, photo non conforme aux normes ICAO, certificat de vaccin méningite expiré ou administré moins de 10 jours avant le départ, séjour illégal antérieur (overstay) en Arabie Saoudite, titre de séjour jugé insuffisant (certains dossiers algériens), et pour les femmes : absence d'inscription dans un groupe agréé.\n\nIl n'existe pas de procédure d'appel formelle auprès des autorités saoudiennes. Les consulats et ambassades ne sont pas tenus de motiver leur décision de refus. La seule option est de constituer un nouveau dossier corrigé et de le resoumettre via Nusuk. Dans la majorité des cas de refus technique (photo, vaccin, BRN), une nouvelle demande bien préparée aboutit sans difficulté.\n\nPour les refus administratifs complexes (overstay avéré, casier judiciaire, statut de réfugié), consultez un spécialiste avant de resoumettre.",
      },
      {
        heading: "Visa validé — et ensuite ?",
        body: "Le visa vous ouvre les portes de l'Arabie Saoudite. Ce qui vous attend à l'intérieur requiert une autre forme de préparation.\n\nArriver à La Mecque sans guide, c'est naviguer seul dans l'un des environnements les plus intenses spirituellement et physiquement au monde : des millions de pèlerins venus de 190 pays, des rituels précis qui requièrent des explications pour être vécus pleinement, des lieux saints dont la géographie évolue chaque année avec les travaux, et une langue arabe que la majorité des pèlerins francophones ne maîtrisent pas.\n\nUn guide privé certifié SAFARUMA vous accueille à l'aéroport de Djeddah ou Médine, vous accompagne lors de l'entrée en état d'Ihram au Miqat, vous explique chaque geste du Tawaf et du Sa'i dans votre langue, vous emmène dans les lieux historiques que 99 % des pèlerins ne voient jamais, et reste disponible pour vos questions à toute heure du séjour.\n\nLe visa vous emmène à La Mecque. Le guide vous fait vivre la Omra. Découvrez nos guides certifiés disponibles sur safaruma.com/guides.",
      },
      {
        heading: "Conclusion — Prêt pour votre Omra 2026 ?",
        body: "La procédure Nusuk est bien conçue pour le pèlerin autonome francophone. Avec les bons documents, un BRN validé et une photo ICAO conforme, le visa s'obtient en 48 à 72 heures pour les ressortissants européens. Le vrai défi n'est pas le visa — c'est ce qui vient après.\n\nPour aller plus loin : notre guide complet «Comment préparer son Omra en 10 étapes» couvre la préparation spirituelle, physique et logistique bien au-delà du visa. Et si vous souhaitez comprendre la différence entre l'Omra et le Hajj avant de vous lancer, notre article dédié répond à cette question avec précision.\n\nSource officielle visa : nusuk.sa — Ministère du Hajj et de l'Omra : haj.gov.sa",
      },
    ],
    faqs: [
      { q: "Combien coûte le visa Omra en 2026 ?", a: "Environ 535 SAR (~135 €) via Nusuk : 300 SAR de frais gouvernementaux + 100 à 180 SAR d'assurance santé obligatoire (Bupa ou Tawuniya). Pour les ressortissants marocains, algériens et tunisiens, ajoutez environ 60 € de frais VFS Tasheer." },
      { q: "Combien de temps pour obtenir le visa Omra ?", a: "48 à 72 heures ouvrables pour les eVisa (ressortissants européens). Jusqu'à 7 jours ouvrés pour les dossiers passant par VFS Tasheer. En période de pointe (Ramadan), prévoyez 2 à 3 semaines supplémentaires." },
      { q: "Le visa Omra permet-il de visiter Médine ?", a: "Oui. Le visa Omra autorise l'accès à Médine, Djeddah et l'ensemble du territoire saoudien. Seul le cœur de La Mecque (périmètre de la Masjid Al-Haram) est réservé aux musulmans." },
      { q: "Que faire si mon visa Omra est refusé ?", a: "Il n'existe pas de procédure d'appel officielle. Vérifiez les causes probables (photo non conforme, BRN manquant, vaccin expiré), corrigez votre dossier et déposez une nouvelle demande via Nusuk. Dans les cas techniques, une nouvelle demande corrigée aboutit généralement." },
      { q: "Le visa Omra inclut-il l'assurance santé ?", a: "Oui. Une assurance santé obligatoire (Bupa ou Tawuniya selon le profil) est intégrée au flux Nusuk. Son coût (100 à 180 SAR selon l'âge et la durée) est inclus dans les frais totaux. Vous recevez les documents d'assurance par email avec votre visa." },
      { q: "Peut-on faire l'Omra avec un visa touristique ?", a: "Techniquement oui — l'accès à la Masjid Al-Haram est possible avec un visa touristique. Mais vous n'obtenez pas le permis Omra (izin) via Nusuk, ni l'accès prioritaire à la Rawdah de Médine. Pour un véritable pèlerinage, le visa Omra dédié reste préférable." },
      { q: "Une femme peut-elle faire l'Omra seule en 2026 ?", a: "Oui. Le mahram n'est plus obligatoire pour l'Omra depuis la réforme saoudienne de 2021-2022. Condition : être majeure (18 ans +) et voyager dans le cadre d'un groupe ou via une agence agréée. Aucune limite d'âge n'est imposée par le gouvernement saoudien." },
      { q: "Faut-il un mahram pour la femme qui fait l'Omra ?", a: "Non, pour l'Omra. La femme majeure (18 ans +) peut voyager seule à condition d'être inscrite dans un groupe agréé ou via une agence reconnue. Pour le Hajj 2026, la même règle s'applique si elle voyage avec un groupe officiel enregistré sur Nusuk Hajj." },
      { q: "Le visa est-il payant pour les enfants ?", a: "Oui. Les mineurs paient les mêmes frais que les adultes (environ 535 SAR / 135 €). Chaque enfant doit disposer de son propre passeport biométrique — les enfants inscrits sur le passeport d'un parent ne sont plus acceptés." },
      { q: "Peut-on faire une nouvelle demande de visa après un refus ?", a: "Oui, sans délai de carence officiel. Une fois les documents problématiques corrigés (photo, vaccin, BRN), vous pouvez soumettre immédiatement une nouvelle demande via Nusuk. Pour les refus d'ordre administratif (overstay, casier), consultez un spécialiste avant de resoumettre." },
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

  const faqSchema = content.faqs ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `${url}#faq`,
    mainEntity: content.faqs.map(faq => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: { '@type': 'Answer', text: faq.a },
    })),
  } : null;

  const relatedArticles = BLOG_ARTICLES_LIST.filter((a) => a.slug !== slug).slice(0, 3);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostingSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {faqSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />}

      <Navbar />
      <ScrollReveal />

      {/* HERO */}
      <section style={{
        background: 'var(--deep)', paddingTop: '11rem', paddingBottom: '5rem',
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

          {content.faqs && (
            <div style={{ marginTop: '3rem', marginBottom: '2rem' }}>
              <h2 style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: 'clamp(1.3rem, 2.5vw, 1.8rem)', fontWeight: 600, color: 'var(--deep)', marginBottom: '1.5rem' }}>
                FAQ visa Omra 2026
              </h2>
              {content.faqs.map((faq, i) => (
                <details key={i} style={{ borderBottom: '1px solid var(--sand)', marginBottom: '0.25rem' }}>
                  <summary style={{ padding: '1rem 0', cursor: 'pointer', fontSize: '0.93rem', fontWeight: 600, color: 'var(--deep)', listStyle: 'none' }}>
                    {faq.q}
                  </summary>
                  <p style={{ padding: '0 0 1rem', color: 'var(--muted)', lineHeight: 1.9, fontSize: '0.9rem', margin: 0 }}>{faq.a}</p>
                </details>
              ))}
            </div>
          )}

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
