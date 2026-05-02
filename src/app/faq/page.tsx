'use client';

import { useState } from 'react';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from 'next/link';

const IconOmra = () => (
  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <rect x="3" y="7" width="10" height="7" rx="1" stroke="currentColor" strokeWidth="1.2"/>
    <path d="M1 14h14" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    <path d="M5 7V5a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    <rect x="7" y="9" width="2" height="3" rx="0.5" fill="currentColor"/>
  </svg>
);
const IconOrg = () => (
  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <rect x="2" y="3" width="12" height="11" rx="2" stroke="currentColor" strokeWidth="1.2"/>
    <path d="M2 7h12" stroke="currentColor" strokeWidth="1.2"/>
    <path d="M5 1v4M11 1v4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    <path d="M5 10h2M5 12.5h4" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
  </svg>
);
const IconGuides = () => (
  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.2"/>
    <path d="M2 14c0-3.3 2.7-5.5 6-5.5S14 10.7 14 14" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    <path d="M12 2l.4 1.2 1.2.4-1.2.4L12 5.2l-.4-1.2-1.2-.4 1.2-.4z" fill="currentColor"/>
  </svg>
);
const IconProblemes = () => (
  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M8 2L3 4.5v4c0 3.5 5 5.5 5 5.5s5-2 5-5.5v-4L8 2z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
    <path d="M8 7v2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <circle cx="8" cy="11.2" r="0.7" fill="currentColor"/>
  </svg>
);
const IconLieux = () => (
  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M8 2C5.8 2 4 3.8 4 6c0 3.5 4 8 4 8s4-4.5 4-8c0-2.2-1.8-4-4-4z" stroke="currentColor" strokeWidth="1.2"/>
    <circle cx="8" cy="6" r="1.5" fill="currentColor"/>
  </svg>
);

const ICON_MAP: Record<string, React.ComponentType> = {
  omra: IconOmra,
  organisation: IconOrg,
  guides: IconGuides,
  problemes: IconProblemes,
  lieux: IconLieux,
};

const CATEGORIES = [
  {
    id: 'omra',
    label: 'Omra',
    questions: [
      { q: "Qu'est-ce que la Omra ?", a: "La Omra est un pèlerinage volontaire à La Mecque accompli hors de la saison du Hajj. Elle consiste à entrer en Ihram, effectuer le Tawaf autour de la Kaaba, le Sa'i entre Safa et Marwa, puis le Tahallul. Contrairement au Hajj, elle n'est pas obligatoire mais constitue une sunnah mu'akkada (pratique fortement recommandée) d'une immense valeur spirituelle." },
      { q: "Quelle est la différence entre la Omra et le Hajj ?", a: "Le Hajj est le cinquième pilier de l'Islam, obligatoire une fois dans sa vie pour tout musulman qui en a la capacité. Il se déroule uniquement les 8, 9 et 10 Dhou al-Hijja et comprend des rites supplémentaires : station à Arafat, Mouzdalifa, lapidation à Mina. La Omra peut être effectuée toute l'année, dure quelques heures et ne comprend que quatre rites principaux." },
      { q: "La Omra est-elle obligatoire en Islam ?", a: "Les savants s'accordent sur le fait que la Omra est une sunnah fortement recommandée selon les écoles malékite et hanéfite, et une obligation selon les écoles shafi'ite et hanbalite. Dans tous les cas, sa valeur spirituelle est immense : le Prophète ﷺ a dit qu'elle est une expiation pour les péchés commis entre deux Omra." },
      { q: "Quelles sont les étapes de la Omra dans l'ordre ?", a: "1. Ihram : entrer en état de sacralisation au Miqat avec la Niyyah et le Talbiyah. 2. Tawaf : 7 tours autour de la Kaaba dans le sens antihoraire. 3. Prière de 2 raka'at derrière le Maqam Ibrahim. 4. Sa'i : 7 allers-retours entre Safa et Marwa. 5. Tahallul : rasage ou coupe des cheveux pour sortir de l'Ihram." },
      { q: "Qu'est-ce que l'Ihram et comment le porter ?", a: "L'Ihram désigne à la fois l'état de sacralisation et le vêtement qui l'accompagne. Pour l'homme : deux pièces de tissu blanc non cousues (izar pour le bas, rida pour le haut). Pour la femme : tenue modeste couvrant tout sauf le visage et les mains. En Ihram sont interdits : couper cheveux ou ongles, parfums, relations conjugales, vêtements cousus pour l'homme." },
      { q: "Qu'est-ce que le Tawaf ?", a: "Le Tawaf consiste à tourner 7 fois autour de la Kaaba dans le sens antihoraire, en commençant à la Pierre Noire (Hajar al-Aswad). Chaque tour débute par une salutation à la Pierre Noire. Pour les hommes, les 3 premiers tours s'effectuent en Raml (marche rapide). On récite des du'as librement pendant le Tawaf." },
      { q: "Qu'est-ce que le Sa'i entre Safa et Marwa ?", a: "Le Sa'i commémore la course de Hajar cherchant de l'eau pour son fils Ismaïl. On effectue 7 trajets entre les deux collines (Safa → Marwa = 1 trajet), en commençant par Safa et terminant à Marwa. Les hommes adoptent une allure rapide entre les deux marqueurs verts." },
      { q: "Qu'est-ce que le Tahallul ?", a: "Le Tahallul marque la fin de la Omra et la sortie de l'Ihram. Il s'effectue après le Sa'i. Les hommes rasent entièrement la tête (Halq, plus méritoire) ou se coupent les cheveux (Taqsir). Les femmes coupent une mèche de la longueur d'une phalange. Tous les interdits de l'Ihram sont alors levés." },
      { q: "Peut-on faire la Omra pendant le Ramadan ?", a: "Oui. Le Prophète ﷺ a dit que la Omra pendant le Ramadan équivaut en récompense à un Hajj. Cependant, c'est la période la plus dense. Prévoir une réservation très en avance et un guide privé pour naviguer dans cette affluence." },
      { q: "Quelle est la meilleure période pour la Omra ?", a: "La Omra peut être effectuée toute l'année. Les périodes les moins chargées : janvier–février et octobre–novembre. Ces mois offrent un meilleur confort thermique et moins de foule au Haram. Évitez les vacances scolaires saoudiennes et les semaines autour du Ramadan." },
      { q: "Combien de temps dure le rite de la Omra ?", a: "Le rite complet (Ihram → Tawaf → Sa'i → Tahallul) dure entre 3 et 8 heures selon l'affluence. En période creuse, certains pèlerins le réalisent en 2h30. Pendant le Ramadan, comptez 6 à 10 heures. Un guide privé vous aide à optimiser les horaires." },
      { q: "Une femme peut-elle faire la Omra sans mahram ?", a: "Les femmes de plus de 45 ans peuvent effectuer la Omra sans mahram dans le cadre d'un groupe organisé. Pour les femmes de moins de 45 ans, les règles varient selon les pays. Vérifiez les conditions auprès de l'ambassade d'Arabie Saoudite de votre pays de résidence." },
      { q: "Quels vaccins sont obligatoires pour la Omra ?", a: "Le vaccin contre la méningite à méningocoque (MenACWY) est obligatoire pour obtenir le visa Omra. Il doit être administré au minimum 10 jours avant l'entrée en Arabie Saoudite. D'autres vaccins sont recommandés : hépatite A et B, typhoïde, grippe. Consultez votre médecin." },
      { q: "Peut-on accomplir plusieurs Omra lors d'un même séjour ?", a: "Oui. Pour chaque Omra supplémentaire, sortez des limites du Haram, entrez à nouveau en Ihram depuis un Miqat (généralement Masjid Aïcha/Tan'im, le plus proche de La Mecque) et recommencez les rites depuis le début." },
      { q: "Y a-t-il un âge minimum pour la Omra ?", a: "Il n'existe pas d'âge minimum légal. Un enfant peut l'accomplir mais elle ne compte pas comme obligation (il devra la refaire adulte). Pour les seniors ou personnes à mobilité réduite, des fauteuils roulants sont disponibles au Masjid al-Haram et nos guides PMR spécialisés peuvent accompagner vos proches." },
    ],
  },
  {
    id: 'organisation',
    label: 'Organisation',
    questions: [
      { q: "Comment fonctionne la mise en relation avec un guide SAFARUMA ?", a: "Après votre inscription gratuite, parcourez notre catalogue de guides certifiés. Filtrez par langue, spécialité et disponibilité. Consultez les profils détaillés. Envoyez une demande avec vos dates. Le guide vous répond sous 24h. Le paiement n'est déclenché qu'après acceptation mutuelle." },
      { q: "Combien coûte un guide privé SAFARUMA ?", a: "Les tarifs varient selon le guide, sa spécialité et la durée. Comptez entre 150 € et 400 € par jour. Chaque guide fixe librement ses honoraires, visibles sur son profil avant toute réservation. Aucun frais caché." },
      { q: "Quels documents sont nécessaires pour la Omra ?", a: "Passeport valide (6 mois minimum), photo d'identité fond blanc, certificat de vaccination méningococcique (MenACWY). Selon votre situation : acte de mariage pour les couples, justificatif de mahram pour les femmes de moins de 45 ans. SAFARUMA peut vous accompagner dans les démarches." },
      { q: "Comment obtenir le visa Omra ?", a: "Depuis 2019, le visa Omra s'obtient via la plateforme Nusuk (nusuk.sa) ou via une agence habilitée. La demande en ligne est possible sans opérateur agréé. Le visa est généralement accordé en 3 à 7 jours. SAFARUMA peut vous orienter dans ces démarches." },
      { q: "Combien de temps à l'avance réserver son guide ?", a: "Nous recommandons 4 à 8 semaines à l'avance, surtout pour le Ramadan où les guides se remplissent dès novembre. En période creuse, une réservation 1 à 2 semaines avant est souvent possible." },
      { q: "Peut-on réserver un guide pour une famille ou un groupe ?", a: "Absolument. Précisez la composition dans votre demande. Certains guides acceptent jusqu'à 6 personnes. Pour des groupes plus importants, nous coordonnons plusieurs guides. Les tarifs peuvent être négociés." },
      { q: "Comment se déroule le paiement ?", a: "Le paiement est sécurisé via Stripe, débité uniquement après acceptation du guide. Les fonds sont conservés en escrow et reversés au guide 5 jours après la fin de mission confirmée." },
      { q: "Puis-je annuler ou modifier ma réservation ?", a: "Annulation plus de 72h avant : remboursement 100%. Entre 24h et 72h : 50% remboursé. Moins de 24h : aucun remboursement. Pour les modifications de dates, le guide doit accepter le changement." },
      { q: "Les services transfert et hôtel sont-ils inclus ?", a: "Non, ce sont des services distincts disponibles sur notre page Services. Transfert aéroport, hébergement à Makkah ou Madinah, et assistance visa sont proposés individuellement ou en bundle." },
      { q: "Y a-t-il une assistance pendant le séjour en Arabie Saoudite ?", a: "Oui. Notre équipe est joignable 24h/24 via WhatsApp pendant toute la durée de votre séjour. Vous recevez le numéro d'urgence dans votre récapitulatif de réservation." },
      { q: "Proposez-vous un service pour les personnes à mobilité réduite ?", a: "Oui. Certains guides sont spécialisés PMR. Ils connaissent les accès adaptés, coordonnent les fauteuils roulants officiels du Haram et adaptent le rythme. Mentionnez vos besoins lors de la réservation." },
      { q: "Quelle est la différence avec une agence classique ?", a: "Une agence classique vend un forfait standard (bus, hôtel, groupe de 30 personnes). SAFARUMA vous met en relation avec un guide privé certifié qui vous accompagne personnellement, dans votre langue, à votre rythme. C'est un voyage sur-mesure." },
    ],
  },
  {
    id: 'guides',
    label: 'Guides',
    questions: [
      { q: "Comment sont sélectionnés les guides SAFARUMA ?", a: "Chaque candidat passe par : vérification de l'accréditation saoudienne officielle (Mutawwif), entretien vidéo approfondi, test de connaissances islamiques et historiques, vérification des antécédents, puis période probatoire. Moins de 30% des candidats sont retenus. Tous les guides sont réévalués annuellement." },
      { q: "Quelle certification les guides doivent-ils avoir ?", a: "Tous nos guides détiennent l'accréditation officielle saoudienne de guide de pèlerinage (Mutawwif), délivrée par le Ministère du Hajj et de l'Omra. Ces certifications sont vérifiables sur chaque profil." },
      { q: "Les guides parlent-ils français ?", a: "Oui, tous nos guides certifiés parlent au minimum le français et l'arabe. Beaucoup maîtrisent également l'anglais, le wolof, le darija, l'ourdou ou le turc. Filtrez par langue directement sur la page Guides." },
      { q: "Comment choisir le bon guide ?", a: "Consultez les profils : langues parlées, années d'expérience, spécialités (histoire islamique, PMR, familles), avis vérifiés, tarif journalier et disponibilités. Vous pouvez envoyer un message avant de réserver pour tester la communication." },
      { q: "Peut-on contacter le guide avant de réserver ?", a: "Oui. Depuis chaque profil, envoyez un message préalable pour poser vos questions et évaluer la réactivité. Nous encourageons ce contact — un bon feeling est essentiel." },
      { q: "Comment devenir guide certifié SAFARUMA ?", a: "Rendez-vous sur safaruma.com/devenir-guide et soumettez votre candidature. Vous devez fournir votre accréditation saoudienne en cours de validité, une pièce d'identité, un justificatif de résidence et une lettre de motivation. Notre équipe vous contacte sous 5 jours ouvrés." },
      { q: "Quelle commission prend SAFARUMA ?", a: "SAFARUMA prélève 15% de commission sur chaque mission. Ce pourcentage couvre la visibilité sur la plateforme, les paiements sécurisés, l'assurance responsabilité civile, et les outils de gestion." },
      { q: "Quand et comment les guides sont-ils payés ?", a: "Le versement est effectué sur le compte bancaire enregistré dans les 5 jours ouvrés suivant la fin de mission confirmée, via Stripe Connect. Les guides suivent leurs revenus en temps réel depuis leur tableau de bord." },
      { q: "Un guide peut-il refuser une demande ?", a: "Oui, entièrement. Les guides définissent leurs disponibilités, tarifs et types de missions. Ils peuvent décliner sans justification. En cas de refus, vous recevez une notification et pouvez contacter un autre guide." },
    ],
  },
  {
    id: 'problemes',
    label: 'Problèmes',
    questions: [
      { q: "Que faire si mon guide ne répond pas avant le départ ?", a: "Si votre guide ne répond pas dans les 24h, contactez notre support WhatsApp (numéro dans votre espace). Nous intervenons pour relancer le guide ou, si nécessaire, vous proposer un remplaçant disponible. Votre séjour ne sera pas compromis." },
      { q: "Mon guide n'est pas venu au rendez-vous. Que faire ?", a: "Appelez directement votre guide (coordonnées dans votre espace réservation). S'il ne répond pas, contactez notre ligne d'urgence disponible 24h/24. Nous localisons le guide et si le rendez-vous ne peut être honoré, nous vous trouvons un remplaçant ou procédons à un remboursement complet." },
      { q: "Comment signaler un problème avec un guide ?", a: "Depuis votre espace pèlerin, rubrique 'Mes réservations', cliquez sur 'Signaler un problème'. Décrivez la situation avec dates et détails. Notre équipe de médiation vous répond sous 24h ouvrées." },
      { q: "Que se passe-t-il en cas d'accident ou d'urgence médicale ?", a: "Votre guide privé connaît les structures médicales locales. En cas d'urgence : il contacte le 911 (urgences saoudiennes) et vous accompagne à l'hôpital. Notre équipe est notifiée et assure le lien avec votre famille. Nous recommandons fortement une assurance voyage avec rapatriement médical." },
      { q: "Mon guide ne correspond pas à son profil. Que faire ?", a: "Contactez notre support dès que vous constatez le problème. Si la prestation est significativement différente du profil (langue non maîtrisée, comportement non professionnel), vous êtes en droit de demander un remboursement partiel ou total." },
      { q: "Mon vol est retardé ou annulé. Comment prévenir mon guide ?", a: "Informez votre guide via la messagerie SAFARUMA dès que vous êtes au courant. Si vous ne pouvez pas accéder à l'application, utilisez le WhatsApp ou SMS communiqué lors de la réservation. Les guides s'adaptent aux retards inférieurs à 12h." },
      { q: "Que faire si je perds mon passeport en Arabie Saoudite ?", a: "Contactez immédiatement l'ambassade ou le consulat de votre pays. Votre guide connaît les procédures et peut vous accompagner. Conservez toujours des copies numériques de vos documents dans un email ou cloud." },
      { q: "Comment obtenir un remboursement pour prestation non conforme ?", a: "Soumettez une demande dans votre espace réservation dans les 48h suivant la fin de mission. Joignez les preuves (captures, photos). Notre équipe examine le dossier sous 5 jours ouvrés. Les remboursements sont effectués sous 7 à 10 jours." },
      { q: "Que faire si je tombe malade pendant la Omra ?", a: "Prévenez votre guide immédiatement. Il vous accompagnera aux cliniques du Masjid al-Haram (disponibles 24h/24) ou à l'hôpital si nécessaire. Si votre état nécessite une interruption de la Omra, votre guide vous expliquera les dispositions prévues par la jurisprudence islamique." },
      { q: "Mon guide parle mal français. Quels sont mes recours ?", a: "Si le niveau de langue ne correspond pas au profil, c'est un motif valide de réclamation. Contactez notre support avec des exemples précis. Nous pouvons vous proposer un guide en remplacement ou un remboursement partiel." },
    ],
  },
  {
    id: 'lieux',
    label: 'Lieux',
    questions: [
      { q: "Qu'est-ce que le Masjid al-Haram ?", a: "Le Masjid al-Haram est la plus grande mosquée du monde, entourant la Kaaba à Makkah. Ses lieux clés : la Kaaba (maison cubique au centre), le Hajar al-Aswad (Pierre Noire), le Maqam Ibrahim (empreinte du prophète Ibrahim), le puits de Zamzam, et les collines de Safa et Marwa intégrées dans la mosquée." },
      { q: "Peut-on visiter Madinah lors d'un séjour Omra ?", a: "Absolument, et c'est vivement recommandé. Madinah abrite le Masjid an-Nabawi (mosquée du Prophète ﷺ et sa tombe), Masjid al-Quba (première mosquée de l'Islam), Masjid al-Qiblatayn et le cimetière al-Baqi'. La visite est une sunnah, accessible en 2h en TGV Haramain ou 4h30 en voiture." },
      { q: "Comment se rendre de Makkah à Madinah ?", a: "Trois options : le TGV Haramain (2h, confortable, réservation en ligne), le bus SAPTCO (4h, économique), ou voiture avec chauffeur privé (4h30, flexible). Nos guides peuvent organiser votre transfert inter-villes." },
      { q: "Quels lieux sont réservés aux musulmans ?", a: "La zone sacrée (Haram) de Makkah est strictement réservée aux musulmans — des checkpoints contrôlent l'accès. À Madinah, certaines zones proches du Masjid an-Nabawi sont également restreintes. Votre guide vous informera des règles spécifiques." },
      { q: "Qu'est-ce que le puits de Zamzam ?", a: "Le puits de Zamzam est situé à l'intérieur du Masjid al-Haram, à 21 mètres de la Kaaba. C'est le puits miraculeux apparu pour désaltérer Hajar et Ismaïl. Son eau est considérée comme bénite. Des stations distribuent l'eau gratuitement dans toute la mosquée." },
      { q: "Peut-on visiter Jabal Uhud à Madinah ?", a: "Oui. Jabal Uhud est la montagne où s'est déroulée la bataille d'Uhud (625 ap. J.C.). C'est un site historique et spirituel majeur — on y trouve le tombeau des martyrs dont Hamza ibn Abd al-Muttalib. Nos guides proposent des visites commentées approfondies." },
      { q: "Qu'est-ce que la mosquée Quba ?", a: "Masjid Quba est la toute première mosquée construite dans l'histoire de l'Islam, bâtie par le Prophète ﷺ à son arrivée à Madinah. Prier deux rak'at à Masjid Quba équivaut en récompense à une Omra selon le Hadith. Visite incontournable à Madinah." },
      { q: "Y a-t-il des sites historiques à visiter à Makkah ?", a: "Oui. Jabal an-Nour (Grotte de Hira, lieu de la première révélation), Jabal Thawr (refuge du Prophète ﷺ lors de l'Hégire), le cimetière de Jannat al-Mu'alla. Le Musée de la Kaaba présente l'histoire de la Grande Mosquée. Votre guide privé vous amènera sur tous ces lieux avec des explications approfondies." },
      { q: "Combien de temps séjourner à Makkah et Madinah ?", a: "La plupart des pèlerins séjournent entre 7 et 14 jours au total. Recommandé : 4–5 nuits à Makkah et 3–4 nuits à Madinah. Plus vous prolongez, plus vous approfondissez la dimension spirituelle et historique de ce voyage." },
      { q: "Peut-on s'approcher de la Kaaba pour la toucher ?", a: "En dehors des périodes d'affluence extrême, il est possible de toucher ou embrasser le Hajar al-Aswad. En haute saison, l'accès proche est difficile. Un guide expérimenté connaît les meilleurs moments (nuit, tôt le matin) pour s'approcher plus facilement." },
    ],
  },
];

function AccordionItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: '1px solid #EDE8DC' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', padding: '1.1rem 0', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
      >
        <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1A1209', lineHeight: 1.5, flex: 1 }}>{q}</span>
        <span style={{ fontSize: '1.1rem', color: '#C9A84C', flexShrink: 0, transform: open ? 'rotate(45deg)' : 'none', transition: 'transform 0.2s', display: 'inline-block', lineHeight: 1 }}>+</span>
      </button>
      {open && (
        <div style={{ paddingBottom: '1.1rem', fontSize: '0.875rem', color: '#5A4E3A', lineHeight: 1.75, paddingRight: '2rem' }}>
          {a}
        </div>
      )}
    </div>
  );
}

export default function FaqPage() {
  const [activeTab, setActiveTab] = useState('omra');
  const active = CATEGORIES.find(c => c.id === activeTab)!;
  const Icon = ICON_MAP[active.id];
  const totalQ = CATEGORIES.reduce((acc, c) => acc + c.questions.length, 0);

  return (
    <>
      <Navbar transparentOnHero scrollThreshold={250} />

      {/* Hero */}
      <section style={{ background: '#1A1209', padding: '6rem 1.5rem 4rem', textAlign: 'center' }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#C9A84C', marginBottom: '1rem' }}>Foire aux questions</div>
          <h1 style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: 'clamp(2.5rem, 5vw, 3.75rem)', fontWeight: 700, color: 'white', lineHeight: 1.1, margin: '0 0 1.25rem' }}>
            Toutes vos<br />
            <span style={{ color: '#C9A84C' }}>réponses ici</span>
          </h1>
          <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, margin: 0 }}>
            {totalQ} questions répondues — classées par thème.
          </p>
        </div>
      </section>

      {/* Tabs + Content */}
      <section style={{ background: '#F5F2EC', padding: '4rem 1.5rem 6rem' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>

          {/* Category pills — single scrollable row, aligned */}
          <div style={{ display: 'flex', gap: '0.625rem', marginBottom: '2.5rem', overflowX: 'auto', flexWrap: 'nowrap', paddingBottom: '0.5rem', scrollbarWidth: 'none' }}>
            {CATEGORIES.map(cat => {
              const CatIcon = ICON_MAP[cat.id];
              const isActive = activeTab === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveTab(cat.id)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', padding: '0.6rem 1.25rem', borderRadius: 50, border: `1.5px solid ${isActive ? '#1A1209' : '#DDD7CC'}`, background: isActive ? '#1A1209' : 'white', color: isActive ? '#F0D897' : '#5A4E3A', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'var(--font-manrope, sans-serif)', whiteSpace: 'nowrap', flexShrink: 0 }}
                >
                  <CatIcon />
                  <span>{cat.label}</span>
                  <span style={{ background: isActive ? 'rgba(240,216,151,0.2)' : '#F5F2EC', color: isActive ? '#F0D897' : '#7A6D5A', fontSize: '0.65rem', fontWeight: 700, padding: '0.1rem 0.5rem', borderRadius: 50 }}>{cat.questions.length}</span>
                </button>
              );
            })}
          </div>

          {/* Accordion */}
          <div style={{ background: 'white', border: '1px solid #EDE8DC', borderRadius: 20, padding: '0.5rem 2rem', boxShadow: '0 2px 16px rgba(26,18,9,0.04)' }}>
            <div style={{ padding: '1.25rem 0 0.75rem', borderBottom: '2px solid #EDE8DC', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span style={{ color: '#C9A84C', display: 'flex', alignItems: 'center' }}><Icon /></span>
              <span style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.35rem', fontWeight: 700, color: '#1A1209' }}>{active.label}</span>
            </div>
            {active.questions.map((item, i) => (
              <AccordionItem key={i} q={item.q} a={item.a} />
            ))}
          </div>

        </div>
      </section>

      {/* CTA */}
      <section style={{ background: '#1A1209', padding: '4rem 1.5rem', textAlign: 'center' }}>
        <div style={{ maxWidth: 560, margin: '0 auto' }}>
          <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', fontWeight: 700, color: 'white', lineHeight: 1.15, marginBottom: '1rem' }}>
            Votre question n&apos;est pas ici ?
          </div>
          <p style={{ color: 'rgba(255,255,255,0.65)', lineHeight: 1.7, marginBottom: '2rem', fontSize: '0.95rem' }}>
            Notre équipe répond sous 2h en semaine.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/contact" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#C9A84C', color: '#1A1209', padding: '0.85rem 2rem', borderRadius: 50, fontWeight: 700, fontSize: '0.88rem', letterSpacing: '0.04em', textDecoration: 'none' }}>
              Nous contacter
            </Link>
            <Link href="/inscription" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', border: '1.5px solid rgba(201,168,76,0.5)', color: '#F0D897', padding: '0.85rem 2rem', borderRadius: 50, fontWeight: 600, fontSize: '0.88rem', textDecoration: 'none' }}>
              Créer mon espace
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
