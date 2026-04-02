import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollReveal from "@/components/ScrollReveal";

export const metadata = {
  title: "Hôtels & Hébergements Omra — SAFARUMA",
  description: "Sélection d'hôtels certifiés SAFARUMA à Makkah et Madinah. Proches du Haram, adaptés PMR, avec accueil de qualité pour votre Omra.",
};

const HOTELS_MAKKAH = [
  {
    name: 'Pullman Zamzam Makkah',
    stars: '★★★★★',
    distance: '50m du Haram',
    priceFrom: '280€ / nuit',
    features: ['Vue directe sur la Kaaba', 'Adapté PMR', 'Restaurant halal', 'Navette Haram gratuite'],
    tag: 'Premium',
    tagColor: '#8B6914',
    tagBg: 'rgba(201,168,76,0.1)',
  },
  {
    name: 'Hilton Makkah Convention',
    stars: '★★★★★',
    distance: '200m du Haram',
    priceFrom: '180€ / nuit',
    features: ['Accès direct galerie Haram', 'Piscine & spa', 'Room service 24h', 'Parking gratuit'],
    tag: 'Best Seller',
    tagColor: '#1D5C3A',
    tagBg: 'rgba(29,92,58,0.1)',
  },
  {
    name: 'Dar Al Tawba Hotel',
    stars: '★★★★',
    distance: '400m du Haram',
    priceFrom: '95€ / nuit',
    features: ['Excellent rapport qualité/prix', 'Toit-terrasse vue Kaaba', 'Personnel francophone', 'Petit-déjeuner inclus'],
    tag: 'Rapport Q/P',
    tagColor: '#1A4A8A',
    tagBg: 'rgba(26,74,138,0.1)',
  },
];

const HOTELS_MADINAH = [
  {
    name: 'Anwar Al Madinah Mövenpick',
    stars: '★★★★★',
    distance: '40m du Masjid An-Nabawi',
    priceFrom: '220€ / nuit',
    features: ['Vue directe sur le minaret vert', 'Accès direct au Haram', 'Chambre adaptée PMR', 'Restaurant international halal'],
    tag: 'Coup de cœur',
    tagColor: '#8B6914',
    tagBg: 'rgba(201,168,76,0.1)',
  },
  {
    name: 'Saja Madinah Hotel',
    stars: '★★★★',
    distance: '150m du Masjid An-Nabawi',
    priceFrom: '110€ / nuit',
    features: ['Navette gratuite Haram', 'Familles bienvenues', 'Cuisine orientale', 'Check-in flexible'],
    tag: 'Famille',
    tagColor: '#1D5C3A',
    tagBg: 'rgba(29,92,58,0.1)',
  },
];

const CERTIF_CRITERIA = [
  { icon: '📍', t: 'Proximité', d: 'Maximum 500m du Haram à Makkah, 300m du Masjid An-Nabawi à Madinah' },
  { icon: '🥗', t: '100% Halal', d: "Tous les restaurants et services alimentaires de nos hôtels sont certifiés halal" },
  { icon: '♿', t: 'Accessibilité', d: 'Chambres adaptées PMR disponibles sur demande dans chaque établissement sélectionné' },
  { icon: '🗣️', t: 'Accueil francophone', d: 'Personnel parlant français ou guide SAFARUMA disponible pour faciliter le check-in' },
  { icon: '🧹', t: 'Propreté certifiée', d: 'Audit de propreté régulier par notre équipe sur place' },
  { icon: '🔒', t: 'Coffre-fort', d: 'Coffre-fort individuel dans chaque chambre pour vos documents et objets de valeur' },
];

export default function HotelsPage() {
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
            🏨 Service Hébergements
          </div>
          <h1 style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: 'clamp(2.2rem, 4.5vw, 3.5rem)', fontWeight: 300, color: 'white', lineHeight: 1.1, marginBottom: '1.25rem', animation: 'fadeInUp 0.8s 0.15s ease both', opacity: 0 }}>
            Dormir à <em style={{ color: 'var(--gold)' }}>deux pas du Haram.</em>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.95rem', lineHeight: 1.85, maxWidth: 540, margin: '0 auto 2rem', animation: 'fadeInUp 0.8s 0.3s ease both', opacity: 0 }}>
            Nous sélectionnons et réservons pour vous les meilleurs hôtels à Makkah et Madinah — proches du Haram, 100% halal, adaptés à votre budget et aux besoins de votre famille.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap', animation: 'fadeInUp 0.8s 0.45s ease both', opacity: 0 }}>
            <span className="badge-trust">🛡️ Sélection vérifiée</span>
            <span className="badge-verified">✓ 100% Halal</span>
            <span className="badge-certified">♿ Accessibilité PMR</span>
          </div>
        </div>
      </section>

      {/* CRITÈRES */}
      <section style={{ padding: '4rem 4rem 2rem', background: 'var(--cream)' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div className="section-label reveal" style={{ textAlign: 'center' }}>Notre sélection</div>
          <h2 className="reveal reveal-d1" style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            Les critères <em>SAFARUMA</em>
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
            {CERTIF_CRITERIA.map((c, i) => (
              <div key={c.t} className={`reveal reveal-d${(i % 3) + 1}`} style={{
                display: 'flex', gap: '1rem', alignItems: 'flex-start',
                background: 'white', borderRadius: 14, padding: '1.25rem',
                border: '1px solid var(--sand)',
              }}>
                <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>{c.icon}</span>
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--deep)', marginBottom: '0.25rem' }}>{c.t}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--muted)', lineHeight: 1.6 }}>{c.d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HÔTELS MAKKAH */}
      <section style={{ padding: '4rem 4rem', background: 'var(--cream)' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div className="section-label reveal">Makkah Al-Mukarramah</div>
          <h2 className="reveal reveal-d1" style={{ marginBottom: '2rem' }}>
            Nos hôtels <em>à Makkah</em>
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '1.5rem' }}>
            {HOTELS_MAKKAH.map((h, i) => (
              <div key={h.name} className={`reveal reveal-d${i + 1}`} style={{
                background: 'white', borderRadius: 20, padding: '1.75rem',
                border: '1px solid var(--sand)',
                boxShadow: '0 4px 16px rgba(26,18,9,0.04)',
                position: 'relative',
              }}>
                <div style={{ position: 'absolute', top: '1rem', right: '1rem', background: h.tagBg, color: h.tagColor, border: `1px solid ${h.tagColor}30`, fontSize: '0.62rem', fontWeight: 800, letterSpacing: '0.08em', padding: '0.2rem 0.6rem', borderRadius: 50 }}>{h.tag}</div>
                <div style={{ marginBottom: '0.25rem' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--deep)', marginBottom: '0.2rem' }}>{h.name}</h3>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <span style={{ color: 'var(--gold)', fontSize: '0.78rem' }}>{h.stars}</span>
                    <span style={{ fontSize: '0.72rem', background: 'var(--green-bg)', color: 'var(--green)', padding: '0.15rem 0.5rem', borderRadius: 50, fontWeight: 700 }}>📍 {h.distance}</span>
                  </div>
                </div>
                <ul style={{ listStyle: 'none', margin: '1rem 0 1.25rem' }}>
                  {h.features.map(f => (
                    <li key={f} style={{ display: 'flex', gap: '0.5rem', fontSize: '0.82rem', padding: '0.3rem 0', borderBottom: '1px solid var(--sand)', color: 'var(--warm)', alignItems: 'center' }}>
                      <span style={{ color: 'var(--gold)', fontWeight: 700, flexShrink: 0 }}>✓</span> {f}
                    </li>
                  ))}
                </ul>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>À partir de</div>
                    <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.4rem', fontWeight: 700, color: 'var(--deep)' }}>{h.priceFrom}</div>
                  </div>
                  <Link href="/guides" style={{ background: 'var(--deep)', color: 'var(--gold-light)', padding: '0.5rem 1.1rem', borderRadius: 50, fontSize: '0.78rem', fontWeight: 700, textDecoration: 'none' }}>
                    Réserver →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HÔTELS MADINAH */}
      <section style={{ padding: '0 4rem 5rem', background: 'var(--cream)' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div className="section-label reveal">Al-Madinah Al-Munawwarah</div>
          <h2 className="reveal reveal-d1" style={{ marginBottom: '2rem' }}>
            Nos hôtels <em>à Madinah</em>
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '1.5rem' }}>
            {HOTELS_MADINAH.map((h, i) => (
              <div key={h.name} className={`reveal reveal-d${i + 1}`} style={{
                background: 'white', borderRadius: 20, padding: '1.75rem',
                border: '1px solid var(--sand)',
                boxShadow: '0 4px 16px rgba(26,18,9,0.04)',
                position: 'relative',
              }}>
                <div style={{ position: 'absolute', top: '1rem', right: '1rem', background: h.tagBg, color: h.tagColor, border: `1px solid ${h.tagColor}30`, fontSize: '0.62rem', fontWeight: 800, letterSpacing: '0.08em', padding: '0.2rem 0.6rem', borderRadius: 50 }}>{h.tag}</div>
                <div style={{ marginBottom: '0.25rem' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--deep)', marginBottom: '0.2rem' }}>{h.name}</h3>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <span style={{ color: 'var(--gold)', fontSize: '0.78rem' }}>{h.stars}</span>
                    <span style={{ fontSize: '0.72rem', background: 'var(--green-bg)', color: 'var(--green)', padding: '0.15rem 0.5rem', borderRadius: 50, fontWeight: 700 }}>📍 {h.distance}</span>
                  </div>
                </div>
                <ul style={{ listStyle: 'none', margin: '1rem 0 1.25rem' }}>
                  {h.features.map(f => (
                    <li key={f} style={{ display: 'flex', gap: '0.5rem', fontSize: '0.82rem', padding: '0.3rem 0', borderBottom: '1px solid var(--sand)', color: 'var(--warm)', alignItems: 'center' }}>
                      <span style={{ color: 'var(--gold)', fontWeight: 700, flexShrink: 0 }}>✓</span> {f}
                    </li>
                  ))}
                </ul>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>À partir de</div>
                    <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.4rem', fontWeight: 700, color: 'var(--deep)' }}>{h.priceFrom}</div>
                  </div>
                  <Link href="/guides" style={{ background: 'var(--deep)', color: 'var(--gold-light)', padding: '0.5rem 1.1rem', borderRadius: 50, fontSize: '0.78rem', fontWeight: 700, textDecoration: 'none' }}>
                    Réserver →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <h2 className="reveal" style={{ color: 'white' }}>
          Votre hôtel inclus dans <em style={{ color: 'var(--gold)' }}>votre forfait.</em>
        </h2>
        <p className="reveal reveal-d1" style={{ color: 'rgba(255,255,255,0.5)', maxWidth: 440, margin: '1rem auto 2.5rem', lineHeight: 1.8 }}>
          Votre guide SAFARUMA coordonne votre hébergement avec votre programme de visites. Un seul interlocuteur pour tout organiser.
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
