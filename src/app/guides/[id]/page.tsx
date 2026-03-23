import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import BookingWidget from "./BookingWidget";

// Using dynamic route destructuring for Next.js App Router
export default async function GuideProfile({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  
  return (
    <>
      <Navbar />
      
      {/* Profile Hero Header */}
      <section style={{ background: 'var(--deep)', color: 'white', padding: '10rem 4rem 4rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 0%, rgba(201,168,76,0.1) 0%, transparent 60%)', pointerEvents: 'none' }}></div>
        
        <div className="guide-avatar-dark" style={{ background: 'linear-gradient(135deg, #F0D897, #C9A84C)', margin: '0 auto 1.5rem', width: '100px', height: '100px', fontSize: '2.5rem' }}>
          RA
        </div>
        
        <h1 style={{ color: 'white', marginBottom: '0.5rem', fontSize: 'clamp(2rem, 3vw, 3rem)' }}>
          Cheikh Rachid Al-Madani
        </h1>
        <div style={{ color: 'var(--gold)', letterSpacing: '3px', marginBottom: '1rem', fontSize: '1.2rem' }}>★★★★★</div>
        
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto 2rem', lineHeight: 1.8 }}>
          Guide certifié basé à Madinah depuis 12 ans. Passionné par l'histoire islamique et la transmission du savoir avec douceur et bienveillance. J'accompagne chaque pèlerin comme s'il s'agissait de ma propre famille, en partageant les histoires profondes de chaque lieu saint que nous foulons.
        </p>
        
        <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <div className="floating-stat" style={{ position: 'relative', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(201,168,76,0.2)', padding: '1rem 2rem', color: 'white' }}>
            <strong style={{ fontSize: '1.4rem', color: 'var(--gold-light)' }}>214</strong>
            <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>Avis vérifiés</span>
          </div>
          <div className="floating-stat" style={{ position: 'relative', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(201,168,76,0.2)', padding: '1rem 2rem', color: 'white' }}>
            <strong style={{ fontSize: '1.4rem', color: 'var(--gold-light)' }}>2 400+</strong>
            <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>Pèlerins accompagnés</span>
          </div>
        </div>
      </section>

      {/* Profile Details Grid */}
      <section style={{ padding: '6rem 4rem', background: 'var(--cream)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '4rem', maxWidth: '1200px', margin: '0 auto' }} className="profile-grid">
          
          {/* Left Column: Infos */}
          <div>
            <div className="section-label">À propos du guide</div>
            <h2 style={{ fontSize: '2rem', marginBottom: '2rem' }}>Spécialiste de la Sîra et des rituels authentiques</h2>
            
            <div style={{ marginBottom: '3rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--deep)', marginBottom: '1rem' }}>Langues Parlées</h3>
              <div className="lang-chips">
                <span className="chip active" style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}>🇫🇷 Français (Natif)</span>
                <span className="chip" style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}>🇦🇱 Arabe (Littéraire & Dialecte)</span>
                <span className="chip" style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}>🇬🇧 English (Courant)</span>
              </div>
            </div>

            <div style={{ marginBottom: '3rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--deep)', marginBottom: '1rem' }}>Certifications et Diplômes</h3>
              <ul className="pkg-features">
                <li><span className="pkg-check">✓</span> Master en Sciences Islamiques (Université Islamique de Médine)</li>
                <li><span className="pkg-check">✓</span> Licence officielle de Guide Mutawwif (Ministère du Hajj)</li>
                <li><span className="pkg-check">✓</span> Certification Secourisme Avancé (Croissant Rouge Saoudien)</li>
              </ul>
            </div>

            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--deep)', marginBottom: '1rem' }}>Ses Forfaits Disponibles</h3>
              <div className="packages-grid" style={{ gridTemplateColumns: '1fr', marginTop: '1rem' }}>
                <div className="package-card featured" style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h4 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--deep)', marginBottom: '0.5rem' }}>Omra Spirituelle & Histoire</h4>
                      <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: '1rem' }}>L'immersion complète avec visite des lieux de la bataille de Badr et montée de la montagne de la lumière.</p>
                      <span className="chip" style={{ background: 'var(--green-light)', color: 'var(--green)' }}>5 jours</span>
                      <span className="chip" style={{ background: 'var(--sand)' }}>Voiture incluse</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div className="pkg-price" style={{ fontSize: '1.8rem' }}>450€</div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Par personne</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Reservation Sticky Panel */}
          <div>
            <BookingWidget guideId={resolvedParams.id} pricePerDay={150} />
          </div>
          
        </div>
      </section>

      <Footer />
    </>
  );
}
