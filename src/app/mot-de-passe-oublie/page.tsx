'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success) {
        setSent(true);
      } else {
        alert(data.error || 'Une erreur est survenue');
      }
    } catch {
      alert('Erreur de connexion. Réessayez.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        .fp-input {
          width: 100%; padding: 12px 16px; border-radius: 10px;
          border: 1.5px solid #E8DFC8; background: #FDFBF7;
          font-size: 0.9rem; color: #1A1209; outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          font-family: var(--font-manrope, sans-serif);
          box-sizing: border-box;
        }
        .fp-input:focus { border-color: #C9A84C; box-shadow: 0 0 0 3px rgba(201,168,76,0.12); }
        .fp-input::placeholder { color: rgba(122,109,90,0.5); }
        .fp-btn { transition: background 0.2s, transform 0.15s; }
        .fp-btn:hover:not(:disabled) { background: #2D1F08 !important; transform: translateY(-1px); }
        .fp-btn:disabled { opacity: 0.65; cursor: not-allowed; }
      `}} />

      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#FAF7F0', padding: '2rem 1rem',
        fontFamily: 'var(--font-manrope, sans-serif)',
      }}>
        <div style={{ position: 'fixed', inset: 0, background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(201,168,76,0.05) 0%, transparent 60%)', pointerEvents: 'none' }} />

        <div style={{
          position: 'relative', zIndex: 1,
          width: '100%', maxWidth: 440,
          background: 'white', borderRadius: 24,
          boxShadow: '0 8px 48px rgba(26,18,9,0.08), 0 2px 12px rgba(26,18,9,0.04)',
          overflow: 'hidden',
        }}>
          <div style={{ height: 4, background: 'linear-gradient(90deg, #C9A84C, #F0D897, #C9A84C)' }} />

          <div style={{ padding: '2.5rem 2.5rem 2.25rem' }}>

            <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
              <Link href="/" style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.75rem', fontWeight: 700, color: '#1A1209', textDecoration: 'none', letterSpacing: '0.08em', display: 'inline-block', marginBottom: '1rem' }}>
                SAFAR<span style={{ color: '#C9A84C' }}>U</span>MA
              </Link>
              <h1 style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.75rem', fontWeight: 700, color: '#1A1209', margin: '0 0 0.5rem', lineHeight: 1.2 }}>
                Mot de passe oublié
              </h1>
              {!sent && (
                <p style={{ fontSize: '0.875rem', color: '#7A6D5A', margin: 0, lineHeight: 1.6 }}>
                  Entrez votre adresse e-mail pour recevoir un lien de réinitialisation.
                </p>
              )}
            </div>

            {sent ? (
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: 56, height: 56, borderRadius: '50%', background: '#E8F5EE',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 1.25rem', fontSize: '1.5rem', color: '#1D5C3A', fontWeight: 700,
                }}>
                  ✓
                </div>
                <p style={{ fontSize: '0.95rem', color: '#1A1209', fontWeight: 600, marginBottom: '0.5rem' }}>
                  Email envoyé !
                </p>
                <p style={{ fontSize: '0.85rem', color: '#7A6D5A', lineHeight: 1.7, marginBottom: '1.75rem' }}>
                  Un lien de réinitialisation a été envoyé à{' '}
                  <strong style={{ color: '#1A1209' }}>{email}</strong>.
                  Pensez à vérifier vos spams.
                </p>
                <Link href="/connexion" style={{
                  display: 'block', width: '100%', padding: '13px', textAlign: 'center',
                  background: '#1A1209', color: '#F0D897', borderRadius: 50,
                  fontSize: '0.875rem', fontWeight: 600, letterSpacing: '0.04em',
                  textDecoration: 'none',
                }}>
                  Retour à la connexion
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <label htmlFor="email" style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#7A6D5A', marginBottom: '0.5rem' }}>
                    Adresse e-mail
                  </label>
                  <input
                    className="fp-input" id="email" type="email" required
                    placeholder="nom@exemple.com"
                    value={email} onChange={e => setEmail(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  className="fp-btn"
                  disabled={loading}
                  style={{
                    width: '100%', padding: '13px',
                    background: '#1A1209', color: '#F0D897',
                    border: 'none', borderRadius: 50, cursor: 'pointer',
                    fontSize: '0.875rem', fontWeight: 600, letterSpacing: '0.04em',
                    fontFamily: 'var(--font-manrope, sans-serif)',
                  }}
                >
                  {loading ? 'Envoi…' : 'Envoyer le lien'}
                </button>
              </form>
            )}

            {!sent && (
              <p style={{ textAlign: 'center', fontSize: '0.82rem', color: '#7A6D5A', marginTop: '1.5rem', lineHeight: 1.6 }}>
                <Link href="/connexion" style={{ color: '#C9A84C', fontWeight: 600, textDecoration: 'none' }}>
                  ← Retour à la connexion
                </Link>
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
