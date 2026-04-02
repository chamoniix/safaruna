import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollReveal from "@/components/ScrollReveal";

export const metadata = {
  title: "Visa Omra — Assistance SAFARUMA",
  description: "Assistance complète pour votre visa Omra individuel ou de groupe. Démarches simplifiées, délais réduits, accompagnement par des guides basés en Arabie Saoudite.",
};

const STEPS = [
  { n: '01', icon: '📋', t: 'Créez votre dossier', d: "Renseignez vos informations personnelles, votre groupe et vos dates dans notre formulaire sécurisé. Cela prend moins de 10 minutes." },
  { n: '02', icon: '📄', t: 'Documents requis', d: "Passeport valide 6 mois, photo d'identité fond blanc, justificatif de situation islamique (pour les femmes : mahram ou groupe féminin)." },
  { n: '03', icon: '🔄', t: 'Traitement assisté', d: "Notre équipe basée à Jeddah vérifie votre dossier et le soumet via les canaux officiels du Ministère du Hajj et de la Omra saoudien." },
  { n: '04', icon: '✅', t: 'Visa reçu', d: "Vous recevez votre visa numérique (Nusuk) par email en 3 à 10 jours ouvrés. Il est directement lié à votre passeport — aucun sticker requis." },
];

const REQUIREMENTS = [
  { label: 'Passeport', detail: 'Validité minimale 6 mois après la date de retour', icon: '🛂' },
  { label: 'Photo', detail: 'Format passeport, fond blanc, prise récente (moins de 6 mois)', icon: '📸' },
  { label: 'Femme seule (hors 45 ans)', detail: 'Doit voyager avec un groupe féminin organisé ou avec mahram', icon: '👩' },
  { label: 'Billets d\'avion', detail: 'Réservation confirmée (aller-retour)', icon: '✈️' },
  { label: 'Hébergement', detail: 'Confirmation d\'hôtel ou adresse du guide pour au moins les 3 premiers jours', icon: '🏨' },
  { label: 'Vaccination', detail: 'Méningite ACYW obligatoire. COVID-19 selon les directives du moment', icon: '💉' },
];

const FAQ = [
  { q: 'Combien de temps faut-il pour obtenir le visa ?', a: 'Entre 3 et 10 jours ouvrés via le portail Nusuk. En période de Ramadan, les délais peuvent atteindre 15 jours — anticipez.' },
  { q: 'Peut-on faire une Omra plusieurs fois par an ?', a: 'Oui. Le visa Omra est individuel et renouvelable. Il n\'y a pas de limite annuelle pour les ressortissants des pays francophones.' },
  { q: 'Une femme peut-elle partir seule ?', a: "Les femmes de plus de 45 ans peuvent voyager seules. En dessous de 45 ans, elles doivent être accompagnées d'un mahram ou rejoindre un groupe féminin organisé agréé." },
  { q: 'Que se passe-t-il en cas de refus de visa ?', a: "Les refus sont rares. En cas de refus, notre équipe analyse le dossier et vous aide à le re-soumettre avec les corrections nécessaires, sans frais supplémentaires." },
];

export default function VisaPage() {
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
            🛂 Service Visa Omra
          </div>
          <h1 style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: 'clamp(2.2rem, 4.5vw, 3.5rem)', fontWeight: 300, color: 'white', lineHeight: 1.1, marginBottom: '1.25rem', animation: 'fadeInUp 0.8s 0.15s ease both', opacity: 0 }}>
            Votre visa Omra,<br /><em style={{ color: 'var(--gold)' }}>sans stress.</em>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.95rem', lineHeight: 1.85, maxWidth: 540, margin: '0 auto 2rem', animation: 'fadeInUp 0.8s 0.3s ease both', opacity: 0 }}>
            Notre équipe basée en Arabie Saoudite connaît les démarches officielles sur le bout des doigts. Nous prenons en charge votre dossier de visa Nusuk de A à Z.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap', animation: 'fadeInUp 0.8s 0.45s ease both', opacity: 0 }}>
            <span className="badge-trust">🛡️ Dossier sécurisé</span>
            <span className="badge-verified">✓ Canal officiel Nusuk</span>
            <span className="badge-certified">⏱️ 3–10 jours ouvrés</span>
          </div>
        </div>
      </section>

      {/* PROCESSUS */}
      <section style={{ padding: '5rem 4rem', background: 'var(--cream)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div className="section-label reveal" style={{ textAlign: 'center' }}>Processus simple</div>
          <h2 className="reveal reveal-d1" style={{ textAlign: 'center', marginBottom: '3rem' }}>
            4 étapes pour votre <em>visa Omra</em>
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
            {STEPS.map((s, i) => (
              <div key={s.n} className={`reveal reveal-d${i + 1}`} style={{
                background: 'white', borderRadius: 16, padding: '1.75rem',
                border: '1px solid var(--sand)', position: 'relative',
              }}>
                <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '2.5rem', fontWeight: 300, color: 'var(--gold-light)', lineHeight: 1, marginBottom: '0.5rem' }}>{s.n}</div>
                <div style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>{s.icon}</div>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--deep)', marginBottom: '0.5rem' }}>{s.t}</h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--muted)', lineHeight: 1.7 }}>{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* REQUIREMENTS */}
      <section style={{ padding: '5rem 4rem', background: 'white', borderTop: '1px solid var(--sand)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div className="section-label reveal" style={{ textAlign: 'center' }}>Documents nécessaires</div>
          <h2 className="reveal reveal-d1" style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            Ce qu&apos;il faut <em>préparer</em>
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
            {REQUIREMENTS.map((r, i) => (
              <div key={r.label} className={`reveal reveal-d${(i % 3) + 1}`} style={{
                display: 'flex', gap: '1rem', alignItems: 'flex-start',
                background: 'var(--cream)', borderRadius: 14, padding: '1.25rem',
                border: '1px solid var(--sand)',
              }}>
                <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>{r.icon}</span>
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--deep)', marginBottom: '0.25rem' }}>{r.label}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--muted)', lineHeight: 1.6 }}>{r.detail}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ padding: '5rem 4rem', background: 'var(--cream)' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <div className="section-label reveal" style={{ textAlign: 'center' }}>Questions fréquentes</div>
          <h2 className="reveal reveal-d1" style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            Tout ce que vous <em>voulez savoir</em>
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {FAQ.map((f, i) => (
              <div key={i} className={`reveal reveal-d${(i % 3) + 1}`} style={{
                background: 'white', borderRadius: 14, padding: '1.5rem',
                border: '1px solid var(--sand)',
              }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--deep)', marginBottom: '0.6rem' }}>❓ {f.q}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--muted)', lineHeight: 1.7 }}>{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <h2 className="reveal" style={{ color: 'white' }}>
          Prêt à démarrer votre <em style={{ color: 'var(--gold)' }}>dossier visa ?</em>
        </h2>
        <p className="reveal reveal-d1" style={{ color: 'rgba(255,255,255,0.5)', maxWidth: 440, margin: '1rem auto 2.5rem', lineHeight: 1.8 }}>
          Choisissez votre guide SAFARUMA et nous prenons en charge toutes vos démarches administratives.
        </p>
        <div className="reveal reveal-d2">
          <Link href="/guides" className="btn-primary" style={{ background: 'var(--gold)', color: 'var(--deep)', fontWeight: 700 }}>
            Choisir mon guide →
          </Link>
        </div>
      </section>

      <Footer />
    </>
  );
}
