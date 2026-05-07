import type { Metadata, Viewport } from 'next';

export const viewport: Viewport = { themeColor: '#FAF7F0' };
export const metadata: Metadata = {
  title: 'FAQ — Questions fréquentes sur la Omra & les guides privés | SAFARUMA',
  description: 'Toutes les réponses à vos questions sur la Omra, les guides privés certifiés, les réservations, les prix et le déroulement du pèlerinage avec SAFARUMA.',
  alternates: { canonical: 'https://safaruma.com/faq' },
};

const FAQ_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    { "@type": "Question", "name": "Qu'est-ce que la Omra ?", "acceptedAnswer": { "@type": "Answer", "text": "La Omra est un pèlerinage volontaire à La Mecque accompli hors de la saison du Hajj. Elle consiste à entrer en Ihram, effectuer le Tawaf autour de la Kaaba, le Sa'i entre Safa et Marwa, puis le Tahallul." } },
    { "@type": "Question", "name": "Quelle est la différence entre la Omra et le Hajj ?", "acceptedAnswer": { "@type": "Answer", "text": "Le Hajj est le cinquième pilier de l'Islam, obligatoire une fois dans sa vie. Il se déroule uniquement les 8-10 Dhou al-Hijja. La Omra peut être effectuée toute l'année, dure quelques heures et ne comprend que quatre rites principaux." } },
    { "@type": "Question", "name": "Quelles sont les étapes de la Omra dans l'ordre ?", "acceptedAnswer": { "@type": "Answer", "text": "1. Ihram au Miqat. 2. Tawaf : 7 tours autour de la Kaaba. 3. Prière de 2 raka'at derrière le Maqam Ibrahim. 4. Sa'i : 7 allers-retours entre Safa et Marwa. 5. Tahallul : rasage ou coupe des cheveux." } },
    { "@type": "Question", "name": "Comment obtenir le visa Omra ?", "acceptedAnswer": { "@type": "Answer", "text": "Depuis 2019, le visa Omra s'obtient via la plateforme Nusuk (nusuk.sa). La demande en ligne est possible sans opérateur agréé. Le visa est généralement accordé en 3 à 7 jours." } },
    { "@type": "Question", "name": "Combien coûte un guide privé SAFARUMA ?", "acceptedAnswer": { "@type": "Answer", "text": "Les tarifs varient entre 150 € et 400 € par jour selon le guide et sa spécialité. Chaque guide fixe librement ses honoraires, visibles sur son profil avant toute réservation. Aucun frais caché." } },
    { "@type": "Question", "name": "Peut-on faire la Omra pendant le Ramadan ?", "acceptedAnswer": { "@type": "Answer", "text": "Oui. Le Prophète ﷺ a dit que la Omra pendant le Ramadan équivaut en récompense à un Hajj. C'est cependant la période la plus dense. Un guide privé est fortement recommandé pour naviguer dans cette affluence." } },
    { "@type": "Question", "name": "Comment sont sélectionnés les guides SAFARUMA ?", "acceptedAnswer": { "@type": "Answer", "text": "Chaque guide passe par une vérification de l'accréditation saoudienne officielle (Mutawwif), un entretien vidéo, un test de connaissances islamiques, une vérification des antécédents et une période probatoire. Moins de 30% des candidats sont retenus." } },
    { "@type": "Question", "name": "Quels vaccins sont obligatoires pour la Omra ?", "acceptedAnswer": { "@type": "Answer", "text": "Le vaccin contre la méningite à méningocoque (MenACWY) est obligatoire pour obtenir le visa Omra. Il doit être administré au minimum 10 jours avant l'entrée en Arabie Saoudite." } },
    { "@type": "Question", "name": "Une femme peut-elle faire la Omra sans mahram ?", "acceptedAnswer": { "@type": "Answer", "text": "Les femmes de plus de 45 ans peuvent effectuer la Omra sans mahram dans le cadre d'un groupe organisé. Pour les femmes de moins de 45 ans, les règles varient selon les pays de résidence." } },
    { "@type": "Question", "name": "Proposez-vous un service pour les personnes à mobilité réduite ?", "acceptedAnswer": { "@type": "Answer", "text": "Oui. Certains guides SAFARUMA sont spécialisés PMR. Ils connaissent les accès adaptés du Masjid Al-Haram, coordonnent les fauteuils roulants officiels et adaptent le rythme à chaque pèlerin." } },
    { "@type": "Question", "name": "Quelle est la meilleure période pour la Omra ?", "acceptedAnswer": { "@type": "Answer", "text": "Les périodes les moins chargées sont janvier-février et octobre-novembre. Ces mois offrent un meilleur confort thermique et moins de foule au Haram. Évitez les vacances scolaires saoudiennes et les semaines autour du Ramadan." } }
  ]
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_SCHEMA) }} />
      {children}
    </>
  );
}
