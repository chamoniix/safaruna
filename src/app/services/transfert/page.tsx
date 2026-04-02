import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollReveal from "@/components/ScrollReveal";

export const metadata = {
  title: "Transferts & Transport — SAFARUNA",
  description: "Voiture privée, van 9 places, Train Haramayn Makkah↔Madinah. Vos transferts Omra organisés par votre guide SAFARUNA.",
};

const OPTIONS = [
  {
    icon: '🚗',
    title: 'Voiture privée 4–5 places',
    price: 'Inclus',
    sub: 'Forfaits Essentielle & Histoire',
    features: [
      'Berline ou SUV climatisé',
      'Chauffeur guide ou chauffeur dédié',
      'Aéroport ↔ hôtel ↔ lieux saints',
      'Masjid Al-Haram, Jabal Nour, Jabal Thawr',
      'Disponibilité journalière flexible',
    ],
    recommended: false,
  },
  {
    icon: '🚐',
    title: 'Van 7–9 places',
    price: 'Inclus',
    sub: 'Forfaits famille & groupe',
    features: [
      'Van Hiace ou Toyota Coaster 9 places',
      'Idéal familles ou groupes d\'amis',
      'Climatisé avec chargeurs USB',
      'Siège bébé disponible sur demande',
      'Programme journalier personnalisé',
    ],
    recommended: true,
  },
  {
    icon: '🚌',
    title: 'Minibus 12–20 places',
    price: 'Sur devis',
    sub: 'Groupes constitués',
    features: [
      'Minibus avec guide à bord',
      'Microphone intégré pour les explications',
      'Adapté groupes familiaux élargis',
      'Circuits thématiques (Sîra, Badr, Ohoud)',
      'Devis personnalisé sous 24h',
    ],
    recommended: false,
  },
];

const ROUTES = [
  { from: '✈️ Aéroport King Abdulaziz', to: '🏨 Hôtel Makkah', time: '45 min', note: 'selon trafic' },
  { from: '🕋 Masjid Al-Haram', to: '⛰️ Jabal Nour', time: '20 min', note: 'via route Mina' },
  { from: '🕋 Masjid Al-Haram', to: '🕌 Masjid An-Nabawi', time: '4h30', note: 'train Haramayn' },
  { from: '🌿 Madinah centre', to: '⚔️ Badr', time: '1h15', note: 'route historique' },
  { from: '🕌 Masjid An-Nabawi', to: '🏛️ Masjid Quba', time: '10 min', note: 'voiture privée' },
  { from: '🌙 Makkah', to: '🏕️ Mina / Muzdalifah', time: '30 min', note: 'période Hajj' },
];

export default function TransfertPage() {
  return (
    <>
      <Navbar />
      <ScrollReveal />

      {/* HERO */}
      <section style={{
        background: 'var(--deep)', paddingTop: '8rem', paddingBottom: '5rem',
        paddingLeft: '4rem', paddingRight: '4rem',
        position: 'relative', overflow: 'hidden', textAlign: 'center',
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 60% 70% at 50% 0%, rgba(201,168,76,0.12) 0%, transparent 60%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 700, margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.25)', padding: '0.35rem 1rem', borderRadius: 50, marginBottom: '1.5rem', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--gold)', animation: 'fadeInUp 0.7s ease both' }}>
            🚗 Service Transferts
          </div>
          <h1 style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: 'clamp(2.2rem, 4.5vw, 3.5rem)', fontWeight: 300, color: 'white', lineHeight: 1.1, marginBottom: '1.25rem', animation: 'fadeInUp 0.8s 0.15s ease both', opacity: 0 }}>
            Chaque déplacement,<br /><em style={{ color: 'var(--gold)' }}>pris en charge.</em>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.95rem', lineHeight: 1.85, maxWidth: 540, margin: '0 auto 2rem', animation: 'fadeInUp 0.8s 0.3s ease both', opacity: 0 }}>
            Voiture privée, van familial, Train Haramayn — votre guide coordonne tous vos déplacements pour que vous vous concentriez uniquement sur votre Omra.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap', animation: 'fadeInUp 0.8s 0.45s ease both', opacity: 0 }}>
            <span className="badge-trust">🛡️ Véhicules assurés</span>
            <span className="badge-verified">✓ Chauffeurs vérifiés</span>
            <span className="badge-certified">🎓 Guide à bord</span>
          </div>
        </div>
      </section>

      {/* OPTIONS */}
      <section style={{ padding: '5rem 4rem', background: 'var(--cream)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div className="section-label reveal" style={{ textAlign: 'center' }}>Nos options</div>
          <h2 className="reveal reveal-d1" style={{ textAlign: 'center', marginBottom: '3rem' }}>
            Transport adapté à <em>votre groupe</em>
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '1.5rem' }}>
            {OPTIONS.map((opt, i) => (
              <div key={opt.title} className={`reveal reveal-d${i + 1}`} style={{
                background: 'white', borderRadius: 20, padding: '2rem',
                border: opt.recommended ? '2px solid var(--gold)' : '1px solid var(--sand)',
                position: 'relative',
              }}>
                {opt.recommended && (
                  <div style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'var(--gold)', color: 'var(--deep)', fontSize: '0.62rem', fontWeight: 800, letterSpacing: '0.1em', padding: '0.2rem 0.6rem', borderRadius: 50 }}>POPULAIRE</div>
                )}
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{opt.icon}</div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--deep)', marginBottom: '0.25rem' }}>{opt.title}</h3>
                <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginBottom: '1.25rem' }}>{opt.sub}</div>
                <ul style={{ listStyle: 'none', marginBottom: '1.5rem' }}>
                  {opt.features.map(f => (
                    <li key={f} style={{ display: 'flex', gap: '0.5rem', fontSize: '0.85rem', padding: '0.35rem 0', borderBottom: '1px solid var(--sand)', color: 'var(--warm)', alignItems: 'flex-start' }}>
                      <span style={{ color: 'var(--gold)', fontWeight: 700, flexShrink: 0 }}>✓</span> {f}
                    </li>
                  ))}
                </ul>
                <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.6rem', fontWeight: 700, color: 'var(--deep)' }}>{opt.price}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--muted)', marginTop: '0.1rem' }}>{opt.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ROUTES */}
      <section style={{ padding: '5rem 4rem', background: 'white', borderTop: '1px solid var(--sand)' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div className="section-label reveal" style={{ textAlign: 'center' }}>Trajets fréquents</div>
          <h2 className="reveal reveal-d1" style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            Les routes que nous <em>maîtrisons</em>
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {ROUTES.map((r, i) => (
              <div key={i} className={`reveal reveal-d${(i % 3) + 1}`} style={{
                display: 'grid', gridTemplateColumns: '1fr auto 1fr auto',
                alignItems: 'center', gap: '1rem',
                background: 'var(--cream)', borderRadius: 14, padding: '1.1rem 1.5rem',
                border: '1px solid var(--sand)',
              }}>
                <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--deep)' }}>{r.from}</span>
                <span style={{ color: 'var(--gold)', fontSize: '1.1rem' }}>→</span>
                <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--deep)' }}>{r.to}</span>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.1rem', fontWeight: 700, color: 'var(--deep)' }}>{r.time}</div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--muted)' }}>{r.note}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <h2 className="reveal" style={{ color: 'white' }}>
          Votre transfert est <em style={{ color: 'var(--gold)' }}>inclus.</em>
        </h2>
        <p className="reveal reveal-d1" style={{ color: 'rgba(255,255,255,0.5)', maxWidth: 440, margin: '1rem auto 2.5rem', lineHeight: 1.8 }}>
          Choisissez un guide SAFARUNA et votre voiture privée ou van est inclus dans votre forfait dès le premier jour.
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
