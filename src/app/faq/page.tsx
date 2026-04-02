'use client';

import { useState } from 'react';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from 'next/link';

const CATEGORIES = [
  {
    id: 'pelerins',
    label: 'Pèlerins',
    icon: '🕌',
    questions: [
      {
        q: 'Comment fonctionne la mise en relation avec un guide ?',
        a: 'Après votre inscription, parcourez notre catalogue de guides certifiés. Vous pouvez filtrer par langue, spécialité et disponibilité. Une fois votre guide choisi, envoyez-lui une demande avec vos dates et préférences. Il vous répond sous 24h.',
      },
      {
        q: 'Quels documents sont nécessaires pour effectuer l\'Omra ?',
        a: 'Un passeport valide (6 mois minimum), le visa Omra (que nous pouvons traiter pour vous), un certificat de vaccination méningococcique, et une photo d\'identité récente. Pour les femmes de moins de 45 ans voyageant sans mahram, des justificatifs supplémentaires peuvent être requis.',
      },
      {
        q: 'Combien coûte un guide SAFARUMA ?',
        a: 'Les tarifs varient selon le guide, sa spécialité et la durée. Comptez entre 150€ et 400€ par jour. Chaque guide fixe ses propres honoraires, visibles sur son profil. Vous ne payez que si votre demande est acceptée.',
      },
      {
        q: 'Puis-je annuler ou modifier ma réservation ?',
        a: 'Oui. Toute annulation plus de 72h avant le début de la mission est remboursée à 100%. Entre 24h et 72h : 50% remboursé. Moins de 24h : aucun remboursement. Vous pouvez modifier les dates avec accord du guide.',
      },
      {
        q: 'Les guides parlent-ils français ?',
        a: 'Absolument. Tous nos guides certifiés parlent au minimum le français et l\'arabe. Beaucoup parlent également l\'anglais, l\'ourdou ou le turc. Filtrez par langue sur la page Guides.',
      },
      {
        q: 'Comment sont sélectionnés les guides ?',
        a: 'Chaque guide passe par un processus rigoureux : vérification des documents officiels (accréditation saoudienne), entretien vidéo, test de connaissances religieuses et historiques, période probatoire avec missions supervisées. Moins de 30% des candidats sont retenus.',
      },
      {
        q: 'Y a-t-il un service d\'assistance pendant mon séjour ?',
        a: 'Oui. Notre équipe est joignable 24h/24 par WhatsApp pendant toute la durée de votre séjour en Arabie Saoudite. En cas de problème avec votre guide, nous intervenons immédiatement.',
      },
      {
        q: 'Les services transfert et hôtels sont-ils inclus avec le guide ?',
        a: 'Non, ce sont des services distincts que vous pouvez ajouter à la carte. Transfert aéroport, hébergement à Makkah ou Madinah, et assistance visa sont disponibles séparément ou en bundle. Voir notre page Services.',
      },
    ],
  },
  {
    id: 'guides',
    label: 'Guides',
    icon: '🎓',
    questions: [
      {
        q: 'Comment devenir guide sur SAFARUMA ?',
        a: 'Rendez-vous sur /devenir-guide et soumettez votre candidature. Vous aurez besoin de votre accréditation saoudienne en cours de validité, d\'une pièce d\'identité, d\'un justificatif de résidence et d\'une lettre de motivation. Notre équipe vous contactera sous 5 jours ouvrés.',
      },
      {
        q: 'Quelle commission prend SAFARUMA ?',
        a: 'SAFARUMA prélève 15% sur chaque mission effectuée. Ce pourcentage inclut la visibilité sur la plateforme, les paiements sécurisés, l\'assurance responsabilité civile, et l\'accès à tous les outils de gestion.',
      },
      {
        q: 'Quand et comment suis-je payé ?',
        a: 'Le paiement est versé sur votre compte bancaire enregistré dans les 5 jours ouvrés suivant la fin de la mission. Vous recevez une notification et un reçu détaillé. Les virements sont effectués via notre partenaire Stripe.',
      },
      {
        q: 'Puis-je définir mes propres tarifs et disponibilités ?',
        a: 'Entièrement. Depuis votre tableau de bord, vous fixez votre tarif journalier, vos disponibilités calendaires, et les types de missions que vous acceptez. Vous restez libre de refuser toute demande qui ne vous convient pas.',
      },
      {
        q: 'Que se passe-t-il si un pèlerin annule au dernier moment ?',
        a: 'Notre politique d\'annulation vous protège. En cas d\'annulation moins de 24h avant la mission, vous recevez 50% du montant total. Entre 24h et 72h, 25%. SAFARUMA maintient cette garantie indépendamment du remboursement au pèlerin.',
      },
    ],
  },
  {
    id: 'lieux',
    label: 'Lieux & Omra',
    icon: '🌙',
    questions: [
      {
        q: 'Quelle est la meilleure période pour effectuer l\'Omra ?',
        a: 'L\'Omra peut être effectuée toute l\'année, contrairement au Hajj. Les périodes hors Ramadan (notamment janvier–mars et octobre–novembre) sont généralement moins chargées et moins chères. Le Ramadan est particulièrement spirituel mais très dense.',
      },
      {
        q: 'Combien de temps dure une Omra typique ?',
        a: 'Le rite de l\'Omra (Tawaf + Sa\'i + Taqsir/Halq) dure de 3 à 6 heures selon l\'affluence. La plupart des pèlerins séjournent entre 7 et 14 jours pour profiter pleinement de Makkah et Madinah.',
      },
      {
        q: 'Peut-on visiter Madinah pendant l\'Omra ?',
        a: 'Absolument, et c\'est vivement recommandé. Madinah est à 4h30 de route de Makkah (ou 2h en TGV Haramain). Nos guides couvrent les deux villes. La visite de Madinah est une sunnah, non une obligation du rite.',
      },
      {
        q: 'Quels lieux ne sont pas accessibles aux non-musulmans ?',
        a: 'La zone sacrée (Haram) de Makkah est exclusivement réservée aux musulmans. Madinah est plus ouverte mais certaines zones proches du Masjid An-Nabawi sont également restreintes. Votre guide vous informera des règles spécifiques sur place.',
      },
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
        <span style={{ fontSize: '1rem', color: '#C9A84C', flexShrink: 0, transform: open ? 'rotate(45deg)' : 'none', transition: 'transform 0.2s', display: 'inline-block' }}>+</span>
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
  const [activeTab, setActiveTab] = useState('pelerins');
  const active = CATEGORIES.find(c => c.id === activeTab)!;

  return (
    <>
      <Navbar />

      {/* Hero */}
      <section style={{ background: '#1A1209', padding: '6rem 1.5rem 4rem', textAlign: 'center' }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#C9A84C', marginBottom: '1rem' }}>Foire aux questions</div>
          <h1 style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: 'clamp(2.5rem, 5vw, 3.75rem)', fontWeight: 700, color: 'white', lineHeight: 1.1, margin: '0 0 1.25rem' }}>
            Toutes vos<br />
            <span style={{ color: '#C9A84C' }}>réponses ici</span>
          </h1>
          <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, margin: 0 }}>
            {CATEGORIES.reduce((acc, c) => acc + c.questions.length, 0)} questions répondues — classées par thème.
          </p>
        </div>
      </section>

      {/* Tabs + Content */}
      <section style={{ background: '#F5F2EC', padding: '4rem 1.5rem 6rem' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>

          {/* Category pills */}
          <div style={{ display: 'flex', gap: '0.625rem', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveTab(cat.id)}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.25rem', borderRadius: 50, border: `1.5px solid ${activeTab === cat.id ? '#1A1209' : '#DDD7CC'}`, background: activeTab === cat.id ? '#1A1209' : 'white', color: activeTab === cat.id ? '#F0D897' : '#5A4E3A', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'var(--font-manrope, sans-serif)' }}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
                <span style={{ background: activeTab === cat.id ? 'rgba(240,216,151,0.2)' : '#F5F2EC', color: activeTab === cat.id ? '#F0D897' : '#7A6D5A', fontSize: '0.65rem', fontWeight: 700, padding: '0.1rem 0.5rem', borderRadius: 50 }}>{cat.questions.length}</span>
              </button>
            ))}
          </div>

          {/* Accordion */}
          <div style={{ background: 'white', border: '1px solid #EDE8DC', borderRadius: 20, padding: '0.5rem 2rem', boxShadow: '0 2px 16px rgba(26,18,9,0.04)' }}>
            <div style={{ padding: '1.25rem 0 0.75rem', borderBottom: '2px solid #EDE8DC', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.25rem' }}>{active.icon}</span>
              <span style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.35rem', fontWeight: 700, color: '#1A1209' }}>{active.label}</span>
              <span style={{ background: '#FAF7F0', border: '1px solid #EDE8DC', color: '#7A6D5A', fontSize: '0.65rem', fontWeight: 700, padding: '0.1rem 0.5rem', borderRadius: 50 }}>{active.questions.length} questions</span>
            </div>
            {active.questions.map((item, i) => (
              <AccordionItem key={i} q={item.q} a={item.a} />
            ))}
          </div>

          {/* Still need help? */}
          <div style={{ marginTop: '3rem', background: '#1A1209', borderRadius: 20, padding: '2rem 2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem', flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.5rem', fontWeight: 700, color: 'white', marginBottom: '0.25rem' }}>Pas trouvé votre réponse ?</div>
              <div style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.55)' }}>Notre équipe répond en moins de 24h.</div>
            </div>
            <Link href="/contact" style={{ padding: '0.8rem 2rem', borderRadius: 50, background: '#C9A84C', color: '#1A1209', textDecoration: 'none', fontSize: '0.82rem', fontWeight: 700, letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>
              Nous contacter →
            </Link>
          </div>

        </div>
      </section>

      <Footer />
    </>
  );
}
