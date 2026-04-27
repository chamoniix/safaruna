import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: "Nos formules d'accompagnement — Guide privé Omra La Mecque et Médine | SAFARUMA",
  description: "Choisissez votre accompagnement Omra : guide privé pour La Mecque, visite de Médine, ou le voyage complet Makkah et Madinah. Accompagnement sur mesure, francophone, certifié.",
  keywords: [
    'guide privé omra',
    'accompagnement omra',
    'formules omra',
    'guide omra La Mecque Médine',
    'guide omra makkah madinah',
    'omra complet guide privé',
    'guide omra francophone',
    'mutaweef francophone',
    'circuit privé Médine',
  ],
  openGraph: {
    title: "Nos accompagnements — Guide privé Omra | SAFARUMA",
    description: "Votre Omra est unique. Votre guide aussi. Choisissez l'accompagnement qui correspond à votre voyage.",
    url: 'https://safaruma.com/accompagnements',
    siteName: 'SAFARUMA',
    locale: 'fr_FR',
    type: 'website',
  },
  alternates: {
    canonical: 'https://safaruma.com/accompagnements',
  },
};

const FORMULES = [
  {
    badge: 'Le plus choisi',
    name: 'Le Voyage Complet',
    subtitle: 'Guide privé — La Mecque & Médine',
    pour: 'Pour votre premier grand voyage, pour offrir une expérience totale à vos proches, ou pour ne faire qu\'un seul voyage mais le faire pleinement.',
    inclus: [
      'Tous les rituels de la Omra à Makkah — ihram, tawaf, sa\'i, tahallul',
      'Sur les pas du Prophète ﷺ à Madinah — Rawdah, Masjid Quba, Al-Baqi',
      'Transfert Makkah–Madinah coordonné',
      'Programme sur mesure selon votre durée (5 à 10 jours)',
      'Adaptation famille, séniors et mobilité réduite incluse',
    ],
    duree: '5 à 10 jours',
    cta: 'Construire mon voyage complet',
    ctaHref: '/guides',
    ctaSecondaire: 'Parler à un conseiller',
    ctaSecondaireHref: 'https://wa.me/33600000000',
    highlight: true,
  },
  {
    badge: null,
    name: "L'Essentiel",
    subtitle: 'Guide privé pour votre Omra à La Mecque',
    pour: 'Pour accomplir les rituels correctement, avec un expert à vos côtés — que ce soit votre première Omra ou votre dixième.',
    inclus: [
      'Ihram depuis la miqat, tawaf des 7 tours expliqués étape par étape',
      'Sa\'i entre Safa et Marwa, zamzam, Maqam Ibrahim',
      'Du\'as guidées à voix basse à chaque station',
      'Option : Jabal Nour / grotte de Hira',
    ],
    duree: '2 à 4 jours',
    cta: 'Accompagner ma Omra',
    ctaHref: '/guides',
    ctaSecondaire: null,
    ctaSecondaireHref: null,
    highlight: false,
  },
  {
    badge: null,
    name: 'La Lumière de Madinah',
    subtitle: 'Circuit privé des lieux saints de Médine',
    pour: 'Pour ceux qui reviennent une deuxième fois, qui veulent approfondir la dimension historique, ou qui souhaitent visiter Madinah indépendamment.',
    inclus: [
      'Masjid An-Nabawi et la Rawdah — timing optimisé pour les créneaux d\'accès',
      'Tombeau du Prophète ﷺ, contexte historique et spirituel en temps réel',
      'Masjid Quba, cimetière Al-Baqi',
      'Option "Batailles" : sites de Badr et/ou Uhud',
    ],
    duree: '2 à 3 jours',
    cta: 'Préparer ma visite à Médine',
    ctaHref: '/guides',
    ctaSecondaire: null,
    ctaSecondaireHref: null,
    highlight: false,
  },
];

const FAQS = [
  {
    q: 'Quelle formule choisir pour une première Omra ?',
    a: 'Le Voyage Complet est le choix de la majorité des premiers voyageurs — il couvre les deux villes saintes sans que vous ayez à organiser quoi que ce soit. Si vous avez peu de jours, L\'Essentiel à Makkah est parfait pour accomplir tous les rituels avec un guide.',
  },
  {
    q: 'Combien de jours faut-il prévoir à Médine pendant la Omra ?',
    a: 'En général, 2 à 3 jours à Madinah permettent de visiter tous les lieux essentiels sans précipitation. Votre guide adapte le programme selon votre rythme et vos centres d\'intérêt.',
  },
  {
    q: 'Ces formules s\'adaptent-elles aux familles, séniors ou personnes à mobilité réduite ?',
    a: 'Oui. Chaque formule est adaptable — rythme ralenti, accès fauteuil roulant, communication avec la famille à distance. Précisez votre situation lors de la réservation et votre guide s\'organise en conséquence.',
  },
];

export default function AccompagnementsPage() {
  return (
    <>
      <Navbar />
      <style dangerouslySetInnerHTML={{ __html: `
        .ac-hero { padding: 4rem 1.25rem 2.5rem; max-width: 680px; margin: 0 auto; text-align: center; }
        .ac-section { padding: 2.5rem 1.25rem; max-width: 1000px; margin: 0 auto; }
        .ac-section-sm { padding: 2rem 1.25rem; max-width: 680px; margin: 0 auto; }
        .ac-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.25rem; align-items: start; }
        .ac-card { background: white; border: 1px solid #EDE8DC; border-radius: 18px; padding: 1.5rem; display: flex; flex-direction: column; gap: 0; }
        .ac-card.highlight { border: 2px solid #C9A84C; box-shadow: 0 8px 32px rgba(201,168,76,0.12); }
        .ac-reassurance { display: flex; flex-wrap: wrap; gap: 1rem; justify-content: center; }
        .ac-badge-pill { display: inline-flex; align-items: center; gap: 0.4rem; background: rgba(201,168,76,0.1); border: 1px solid rgba(201,168,76,0.25); padding: 0.45rem 1rem; border-radius: 50px; font-size: 0.78rem; font-weight: 600; color: #8B6914; }
        .ac-faq { display: flex; flex-direction: column; gap: 0.75rem; }
        .ac-cta { padding: 2.5rem 1.25rem; background: #FAF8F0; border-top: 3px solid #C9A84C; text-align: center; }
        @media (max-width: 860px) {
          .ac-cards { grid-template-columns: 1fr; max-width: 520px; margin: 0 auto; }
          .ac-hero { padding: 2.5rem 1.25rem 2rem; }
          .ac-section { padding: 2rem 1.25rem; }
          .ac-cta { padding: 2rem 1.25rem; }
        }
        @media (max-width: 600px) {
          .ac-section-sm { padding: 1.5rem 1.25rem; }
        }
      `}} />
      <main style={{ paddingTop: '4rem', background: 'var(--cream)' }}>

        {/* Hero */}
        <section className="ac-hero">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.3)', padding: '0.3rem 0.9rem', borderRadius: 50, fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--gold-dark)', marginBottom: '1.25rem' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--gold)', display: 'inline-block' }} />
            Guides privés certifiés
          </div>
          <h1 style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: 'clamp(2rem, 5vw, 3.2rem)', fontWeight: 300, lineHeight: 1.15, color: 'var(--deep)', marginBottom: '1rem' }}>
            Votre Omra est unique.<br />
            <em style={{ fontStyle: 'italic', color: 'var(--gold-dark)' }}>Votre guide aussi.</em>
          </h1>
          <p style={{ fontSize: '0.95rem', color: 'var(--muted)', lineHeight: 1.75, maxWidth: 500, margin: '0 auto' }}>
            Choisissez l&apos;accompagnement qui correspond à votre voyage — les rituels à La Mecque, la découverte de Médine, ou les deux villes dans leur intégralité.
          </p>
        </section>

        {/* Les 3 formules */}
        <section className="ac-section">
          <div className="ac-cards">
            {FORMULES.map((f, i) => (
              <div key={i} className={`ac-card${f.highlight ? ' highlight' : ''}`}>
                {f.badge && (
                  <div style={{ display: 'inline-flex', alignSelf: 'flex-start', alignItems: 'center', gap: '0.35rem', background: '#C9A84C', color: '#1A1209', padding: '0.25rem 0.75rem', borderRadius: 50, fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#1A1209', display: 'inline-block' }} />
                    {f.badge}
                  </div>
                )}
                {!f.badge && <div style={{ height: '1.6rem', marginBottom: '0.75rem' }} />}
                <h2 style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.5rem', fontWeight: 600, color: 'var(--deep)', marginBottom: '0.2rem', lineHeight: 1.2 }}>{f.name}</h2>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--gold-dark)', marginBottom: '0.85rem' }}>{f.subtitle}</div>
                <p style={{ fontSize: '0.8rem', color: 'var(--muted)', lineHeight: 1.65, fontStyle: 'italic', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid #EDE8DC' }}>{f.pour}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', marginBottom: '1.1rem' }}>
                  {f.inclus.map((item, j) => (
                    <div key={j} style={{ display: 'flex', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--deep)', lineHeight: 1.55 }}>
                      <span style={{ color: 'var(--gold)', fontWeight: 700, flexShrink: 0, marginTop: '0.05rem' }}>✓</span>
                      {item}
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1.25rem', paddingTop: '0.75rem', borderTop: '1px solid #EDE8DC' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                  </svg>
                  <span style={{ fontSize: '0.75rem', color: 'var(--muted)', fontWeight: 600 }}>{f.duree}</span>
                </div>
                <Link href={f.ctaHref} style={{ display: 'block', textAlign: 'center', background: f.highlight ? 'var(--deep)' : 'transparent', color: f.highlight ? 'var(--gold-light)' : 'var(--deep)', border: f.highlight ? 'none' : '1.5px solid var(--deep)', padding: '0.75rem', borderRadius: 50, fontWeight: 700, fontSize: '0.82rem', textDecoration: 'none', letterSpacing: '0.04em', marginBottom: f.ctaSecondaire ? '0.6rem' : 0 }}>
                  {f.cta}
                </Link>
                {f.ctaSecondaire && (
                  <Link href={f.ctaSecondaireHref!} style={{ display: 'block', textAlign: 'center', fontSize: '0.78rem', color: 'var(--gold-dark)', fontWeight: 600, textDecoration: 'none' }}>
                    {f.ctaSecondaire} →
                  </Link>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Réassurance */}
        <section className="ac-section-sm">
          <div className="ac-reassurance">
            {[
              { icon: '✓', text: 'Guides certifiés et vérifiés' },
              { icon: '✓', text: 'Francophones natifs' },
              { icon: '✓', text: 'Disponibilité confirmée avant réservation' },
              { icon: '✓', text: 'Adapté famille, séniors, PMR' },
            ].map((item, i) => (
              <div key={i} className="ac-badge-pill">
                <span style={{ color: 'var(--gold)' }}>{item.icon}</span>
                {item.text}
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="ac-section-sm">
          <h2 style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.7rem', fontWeight: 400, color: 'var(--deep)', marginBottom: '1.1rem', textAlign: 'center' }}>Questions fréquentes</h2>
          <div className="ac-faq">
            {FAQS.map((item, i) => (
              <div key={i} style={{ background: 'white', border: '1px solid #EDE8DC', borderRadius: 14, padding: '1.1rem 1.25rem' }}>
                <div style={{ fontSize: '0.87rem', fontWeight: 700, color: 'var(--deep)', marginBottom: '0.35rem' }}>{item.q}</div>
                <div style={{ fontSize: '0.81rem', color: 'var(--muted)', lineHeight: 1.65 }}>{item.a}</div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA indécis */}
        <section className="ac-cta">
          <p style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: 'clamp(1.3rem, 3vw, 1.9rem)', fontWeight: 400, color: 'var(--deep)', marginBottom: '0.5rem' }}>
            Pas sûr de quelle formule choisir ?
          </p>
          <p style={{ fontSize: '0.87rem', color: 'var(--muted)', marginBottom: '1.5rem' }}>
            Décrivez votre situation en quelques mots — on vous oriente vers le bon accompagnement.
          </p>
          <Link href="/contact" style={{ display: 'inline-block', background: 'var(--deep)', color: 'var(--gold-light)', padding: '0.85rem 2rem', borderRadius: 50, fontWeight: 700, fontSize: '0.88rem', textDecoration: 'none', letterSpacing: '0.04em' }}>
            Nous décrire votre voyage
          </Link>
        </section>

      </main>
      <Footer />
    </>
  );
}
