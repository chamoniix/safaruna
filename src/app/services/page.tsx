import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from 'next/link';

const SERVICES = [
  {
    href: '/services/transfert',
    badge: 'Transferts',
    icon: '🚐',
    arabic: 'نقل',
    title: 'Transfert & Transport',
    desc: 'Navettes aéroport, transferts Makkah–Madinah, véhicules privés avec chauffeur certifié. Ponctualité garantie.',
    features: ['Aéroports JED & MED', 'Navette Makkah → Madinah', 'Véhicule privé 4–8 places', 'Suivi temps réel'],
    price: 'À partir de 45€',
    color: '#1D5C3A',
    bgLight: '#EAF4EE',
  },
  {
    href: '/services/visa',
    badge: 'Visa',
    icon: '📋',
    arabic: 'تأشيرة',
    title: 'Assistance Visa Omra',
    desc: 'Traitement complet de votre demande de visa Omra. Documents, soumission et suivi jusqu\'à l\'obtention.',
    features: ['Dossier complet inclus', 'Suivi de demande', 'Délai express disponible', 'Assistance 7j/7'],
    price: 'À partir de 79€',
    color: '#1A4A7A',
    bgLight: '#EAF0F8',
  },
  {
    href: '/services/hotels',
    badge: 'Hébergement',
    icon: '🏨',
    arabic: 'فندق',
    title: 'Hôtels & Hébergement',
    desc: 'Sélection d\'hôtels à Makkah et Madinah triés sur le volet — proximité Haram, confort, rapport qualité-prix.',
    features: ['Vue Kaaba disponible', 'Makkah & Madinah', 'Check-in facilité', 'Annulation flexible'],
    price: 'À partir de 89€/nuit',
    color: '#7A3A1A',
    bgLight: '#F8F0EA',
  },
];

export default function ServicesPage() {
  return (
    <>
      <Navbar />

      {/* Hero */}
      <section style={{ background: '#1A1209', padding: '6rem 1.5rem 5rem', textAlign: 'center' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#C9A84C', marginBottom: '1rem' }}>Nos services</div>
          <h1 style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 700, color: 'white', lineHeight: 1.05, margin: '0 0 1.25rem' }}>
            Tout pour votre<br />
            <span style={{ color: '#C9A84C' }}>voyage spirituel</span>
          </h1>
          <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, margin: '0 0 2.5rem', maxWidth: 520, marginLeft: 'auto', marginRight: 'auto' }}>
            Transferts, visa et hébergement — des services pensés pour que vous puissiez vous concentrer sur l&apos;essentiel.
          </p>
          <Link href="/guides" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.85rem 2rem', borderRadius: 50, background: '#C9A84C', color: '#1A1209', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 700, letterSpacing: '0.04em' }}>
            Trouver un guide →
          </Link>
        </div>
      </section>

      {/* Services grid */}
      <section style={{ background: '#F5F2EC', padding: '5rem 1.5rem 6rem' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {SERVICES.map((s) => (
              <div key={s.href} style={{ background: 'white', border: '1px solid #EDE8DC', borderRadius: 20, overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 24px rgba(26,18,9,0.06)', transition: 'transform 0.2s, box-shadow 0.2s' }}>

                {/* Card header */}
                <div style={{ background: '#1A1209', padding: '2rem 1.75rem', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', right: -10, top: -10, fontSize: '5rem', opacity: 0.07, fontFamily: 'serif', color: 'white', userSelect: 'none', lineHeight: 1 }}>{s.arabic}</div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', position: 'relative', zIndex: 1 }}>
                    <div>
                      <span style={{ background: s.bgLight, color: s.color, fontSize: '0.6rem', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', padding: '0.2rem 0.65rem', borderRadius: 50, marginBottom: '0.75rem', display: 'inline-block' }}>{s.badge}</span>
                      <h2 style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.6rem', fontWeight: 700, color: 'white', margin: 0, lineHeight: 1.2 }}>{s.title}</h2>
                    </div>
                    <div style={{ fontSize: '2rem', flexShrink: 0 }}>{s.icon}</div>
                  </div>
                </div>

                {/* Card body */}
                <div style={{ padding: '1.5rem 1.75rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <p style={{ fontSize: '0.875rem', color: '#5A4E3A', lineHeight: 1.7, margin: 0 }}>{s.desc}</p>

                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {s.features.map(f => (
                      <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.82rem', color: '#5A4E3A' }}>
                        <span style={{ width: 18, height: 18, borderRadius: '50%', background: '#FAF7F0', border: '1px solid #EDE8DC', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', color: '#C9A84C', flexShrink: 0 }}>✓</span>
                        {f}
                      </li>
                    ))}
                  </ul>

                  <div style={{ marginTop: 'auto', paddingTop: '0.5rem', borderTop: '1px solid #F5F2EC', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#AEA491', marginBottom: '0.1rem' }}>Tarif</div>
                      <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.2rem', fontWeight: 700, color: '#1A1209' }}>{s.price}</div>
                    </div>
                    <Link href={s.href} style={{ padding: '0.65rem 1.5rem', borderRadius: 50, background: '#1A1209', color: '#F0D897', textDecoration: 'none', fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>
                      En savoir plus →
                    </Link>
                  </div>
                </div>

              </div>
            ))}
          </div>

          {/* Bundle banner */}
          <div style={{ marginTop: '3rem', background: 'linear-gradient(135deg, #1A1209 0%, #2C1F0E 100%)', borderRadius: 20, padding: '2.5rem 2.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#C9A84C', marginBottom: '0.5rem' }}>Offre complète</div>
              <h3 style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '2rem', fontWeight: 700, color: 'white', margin: '0 0 0.5rem', lineHeight: 1.2 }}>Guide + Services<br />en bundle</h3>
              <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.55)', margin: 0, lineHeight: 1.65 }}>Combinez guide certifié, transferts, visa et hébergement. Économisez jusqu&apos;à 20% sur votre pack complet.</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {['Guide certifié inclus', 'Transferts aéroport', 'Assistance visa', 'Hôtel Makkah & Madinah'].map(item => (
                <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.82rem', color: 'rgba(255,255,255,0.7)' }}>
                  <span style={{ color: '#C9A84C', fontSize: '0.75rem' }}>✦</span> {item}
                </div>
              ))}
              <Link href="/guides" style={{ marginTop: '0.5rem', padding: '0.85rem 2rem', borderRadius: 50, background: '#C9A84C', color: '#1A1209', textDecoration: 'none', fontSize: '0.82rem', fontWeight: 700, letterSpacing: '0.04em', textAlign: 'center' }}>
                Créer mon pack →
              </Link>
            </div>
          </div>

        </div>
      </section>

      <Footer />
    </>
  );
}
