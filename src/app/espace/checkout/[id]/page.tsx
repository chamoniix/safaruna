'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function CheckoutPage({ params }: { params: { id: string } }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
    }, 2500);
  };

  if (isSuccess) {
    return (
      <>
        <Navbar />
        <div style={{ minHeight: '100vh', background: '#FAF7F0', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem', fontFamily: 'var(--font-manrope, sans-serif)' }}>
          <div style={{ background: 'white', borderRadius: 24, padding: '3rem 2rem', maxWidth: 480, width: '100%', textAlign: 'center', border: '1px solid #EDE8DC', boxShadow: '0 8px 40px rgba(26,18,9,0.08)' }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#E8F5EE', border: '3px solid rgba(29,92,58,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', fontSize: '2rem', color: '#1D5C3A' }}>✓</div>
            <h1 style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '2rem', color: '#1A1209', marginBottom: '0.75rem', fontWeight: 600 }}>Paiement réussi !</h1>
            <p style={{ color: '#7A6D5A', lineHeight: 1.7, marginBottom: '2rem', fontSize: '0.9rem' }}>
              BarakAllahu fik. Votre réservation est confirmée. Votre guide a été notifié et vous attend insha'Allah.
            </p>
            <Link href="/espace/tableau-de-bord" style={{ display: 'inline-block', background: '#C9A84C', color: '#1A1209', fontWeight: 700, padding: '0.85rem 2rem', borderRadius: 50, textDecoration: 'none', fontSize: '0.875rem' }}>
              Accéder à mon espace pèlerin
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        .checkout-input {
          width: 100%; padding: 12px 16px; border-radius: 12px;
          border: 1.5px solid #E8DFC8; background: #FDFBF7;
          font-size: 0.9rem; color: #1A1209; outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          font-family: var(--font-manrope, sans-serif);
          box-sizing: border-box;
        }
        .checkout-input:focus { border-color: #C9A84C; box-shadow: 0 0 0 3px rgba(201,168,76,0.12); }
        .checkout-input::placeholder { color: rgba(122,109,90,0.45); }
        .checkout-label {
          display: block; font-size: 0.65rem; font-weight: 700;
          letter-spacing: 0.1em; text-transform: uppercase;
          color: #7A6D5A; margin-bottom: 0.45rem;
        }
        .checkout-grid {
          display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;
        }
        @media (max-width: 768px) {
          .checkout-layout { flex-direction: column-reverse !important; }
          .checkout-summary { width: 100% !important; position: static !important; }
          .checkout-grid { grid-template-columns: 1fr !important; }
          .checkout-main { padding: 1.25rem 1rem 3rem !important; }
        }
      `}} />
      <Navbar />
      <div className="checkout-main" style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem 1.5rem 4rem', paddingTop: 'clamp(5rem, 10vw, 7rem)', fontFamily: 'var(--font-manrope, sans-serif)' }}>

        <Link href="/guides" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', fontWeight: 600, color: '#7A6D5A', textDecoration: 'none', marginBottom: '1.5rem' }}>
          ← Retour
        </Link>

        <h1 style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: 600, color: '#1A1209', marginBottom: '2rem' }}>
          Confirmez et payez
        </h1>

        <div className="checkout-layout" style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>

          {/* ── FORMULAIRE ── */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {/* Infos pèlerin */}
            <div style={{ background: 'white', borderRadius: 20, border: '1px solid #EDE8DC', padding: '1.75rem', boxShadow: '0 2px 12px rgba(26,18,9,0.04)' }}>
              <h2 style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.3rem', fontWeight: 600, color: '#1A1209', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid #F0EBD8' }}>
                Vos informations
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="checkout-grid">
                  <div>
                    <label className="checkout-label">Prénom</label>
                    <input className="checkout-input" type="text" placeholder="Karim" required />
                  </div>
                  <div>
                    <label className="checkout-label">Nom</label>
                    <input className="checkout-input" type="text" placeholder="Lamrani" required />
                  </div>
                </div>
                <div>
                  <label className="checkout-label">Email</label>
                  <input className="checkout-input" type="email" placeholder="karim@exemple.com" required />
                </div>
                <div>
                  <label className="checkout-label">WhatsApp</label>
                  <input className="checkout-input" type="tel" placeholder="+33 6 12 34 56 78" />
                </div>
              </div>
            </div>

            {/* Paiement */}
            <div style={{ background: 'white', borderRadius: 20, border: '1px solid #EDE8DC', padding: '1.75rem', boxShadow: '0 2px 12px rgba(26,18,9,0.04)' }}>
              <h2 style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.3rem', fontWeight: 600, color: '#1A1209', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid #F0EBD8' }}>
                Paiement sécurisé
              </h2>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label className="checkout-label">Nom sur la carte</label>
                  <input className="checkout-input" type="text" placeholder="KARIM LAMRANI" required />
                </div>
                <div>
                  <label className="checkout-label">Numéro de carte</label>
                  <div style={{ position: 'relative' }}>
                    <input className="checkout-input" type="text" placeholder="0000 0000 0000 0000" required maxLength={19} style={{ paddingLeft: '3rem', fontFamily: 'monospace', letterSpacing: '0.1em' }} />
                    <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: '1.1rem', opacity: 0.5 }}>💳</span>
                  </div>
                </div>
                <div className="checkout-grid">
                  <div>
                    <label className="checkout-label">Expiration</label>
                    <input className="checkout-input" type="text" placeholder="MM/AA" required maxLength={5} style={{ fontFamily: 'monospace', letterSpacing: '0.1em' }} />
                  </div>
                  <div>
                    <label className="checkout-label">CVC</label>
                    <input className="checkout-input" type="text" placeholder="123" required maxLength={4} style={{ fontFamily: 'monospace', letterSpacing: '0.1em' }} />
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', background: '#FAF7F0', borderRadius: 10, border: '1px solid #EDE8DC', marginTop: '0.25rem' }}>
                  <span style={{ color: '#C9A84C', fontSize: '0.9rem' }}>🔒</span>
                  <span style={{ fontSize: '0.72rem', color: '#7A6D5A', lineHeight: 1.5 }}>Paiement sécurisé par Stripe. SAFARUMA ne stocke aucune donnée bancaire.</span>
                </div>

                <button
                  type="submit"
                  disabled={isProcessing}
                  style={{
                    width: '100%', padding: '0.9rem', border: 'none', borderRadius: 50,
                    background: isProcessing ? '#FAF3E0' : '#C9A84C',
                    color: '#1A1209', fontWeight: 800, fontSize: '0.95rem',
                    cursor: isProcessing ? 'not-allowed' : 'pointer',
                    fontFamily: 'inherit', letterSpacing: '0.04em',
                    transition: 'background 0.2s',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  }}
                >
                  {isProcessing ? (
                    <>
                      <span style={{ display: 'inline-block', width: 16, height: 16, border: '2px solid #8B6914', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                      Traitement en cours...
                    </>
                  ) : 'Payer 320,00 €'}
                </button>
                <style dangerouslySetInnerHTML={{ __html: `@keyframes spin { to { transform: rotate(360deg); } }` }} />
              </form>
            </div>

          </div>

          {/* ── RÉSUMÉ COMMANDE ── */}
          <div className="checkout-summary" style={{ width: 360, flexShrink: 0, position: 'sticky', top: 90 }}>
            <div style={{ background: 'white', borderRadius: 20, border: '1px solid #EDE8DC', overflow: 'hidden', boxShadow: '0 2px 12px rgba(26,18,9,0.04)' }}>

              {/* Guide header */}
              <div style={{ background: 'linear-gradient(135deg, #1A1209, #2D1F08)', padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, #F0D897, #C9A84C)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-cormorant, serif)', fontWeight: 700, color: '#1A1209', fontSize: '1rem', flexShrink: 0, border: '2px solid rgba(201,168,76,0.4)' }}>RA</div>
                <div>
                  <div style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#C9A84C', marginBottom: '0.2rem' }}>Guide certifié</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'white', fontFamily: 'var(--font-cormorant, serif)' }}>Rachid Al-Madani</div>
                  <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.45)', marginTop: '0.15rem' }}>Makkah · ★ 4.97 (214 avis)</div>
                </div>
              </div>

              {/* Détails */}
              <div style={{ padding: '1.25rem 1.5rem' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#7A6D5A', marginBottom: '1rem' }}>Détails de la réservation</div>

                {[
                  { icon: '📅', label: 'Dates', value: '10 au 14 Juin 2025' },
                  { icon: '👥', label: 'Pèlerins', value: '2 personnes' },
                  { icon: '📦', label: 'Forfait', value: 'Ziyara & Omra Essentielle' },
                  { icon: '🚗', label: 'Transport', value: 'Voiture privée incluse' },
                ].map((item, i, arr) => (
                  <div key={item.label} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.65rem 0', borderBottom: i < arr.length - 1 ? '1px solid #F5F0E8' : 'none' }}>
                    <span style={{ fontSize: '1rem', flexShrink: 0, marginTop: '0.1rem' }}>{item.icon}</span>
                    <div>
                      <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#7A6D5A', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{item.label}</div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#1A1209', marginTop: '0.1rem' }}>{item.value}</div>
                    </div>
                  </div>
                ))}

                {/* Totaux */}
                <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #EDE8DC', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {[
                    { label: 'Forfait (2 pers.)', value: '240,00 €' },
                    { label: 'Transport', value: '80,00 €' },
                    { label: 'Frais SAFARUMA', value: 'Inclus' },
                  ].map(row => (
                    <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                      <span style={{ color: '#7A6D5A' }}>{row.label}</span>
                      <span style={{ fontWeight: 700, color: row.value === 'Inclus' ? '#1D5C3A' : '#1A1209' }}>{row.value}</span>
                    </div>
                  ))}
                </div>

                {/* Total */}
                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '2px solid #EDE8DC', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.1rem', fontWeight: 700, color: '#1A1209' }}>Total TTC</span>
                  <span style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '2rem', fontWeight: 700, color: '#1A1209' }}>320 €</span>
                </div>

                {/* Garantie */}
                <div style={{ marginTop: '1rem', background: '#FAF7F0', borderRadius: 10, padding: '0.75rem 1rem', border: '1px solid #EDE8DC', fontSize: '0.72rem', color: '#7A6D5A', lineHeight: 1.6 }}>
                  <strong style={{ color: '#1A1209' }}>✓ Garantie annulation</strong> — Remboursement intégral si annulé 7 jours avant le départ.
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
      <Footer />
    </>
  );
}
