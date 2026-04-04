'use client';

import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function GuideLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const result = await signIn('guide-credentials', {
      email,
      password,
      redirect: false,
    });
    setLoading(false);
    if (result?.ok) {
      router.push('/guide/tableau-de-bord');
    } else {
      setError('Identifiants incorrects. Vérifiez vos accès SAFARUMA.');
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#1A1209', padding: '2rem 1rem',
      fontFamily: 'var(--font-manrope, sans-serif)',
    }}>
      <div style={{ position: 'fixed', inset: 0, background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(201,168,76,0.08) 0%, transparent 60%)', pointerEvents: 'none' }} />

      <div style={{
        position: 'relative', zIndex: 1, width: '100%', maxWidth: 420,
        background: 'rgba(255,255,255,0.04)', borderRadius: 24,
        border: '1px solid rgba(201,168,76,0.2)',
        overflow: 'hidden',
      }}>
        <div style={{ height: 3, background: 'linear-gradient(90deg, #C9A84C, #F0D897, #C9A84C)' }} />

        <div style={{ padding: '2.5rem 2.5rem 2.25rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <Link href="/" style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.75rem', fontWeight: 700, color: 'white', textDecoration: 'none', letterSpacing: '0.08em', display: 'inline-block' }}>
              SAFAR<span style={{ color: '#C9A84C' }}>U</span>MA
            </Link>
            <div style={{ marginTop: '0.5rem', display: 'inline-block', background: 'rgba(201,168,76,0.15)', border: '1px solid rgba(201,168,76,0.3)', borderRadius: 50, padding: '0.2rem 0.8rem', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#C9A84C' }}>
              Espace Guide
            </div>
          </div>

          <h1 style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '2.2rem', fontWeight: 600, color: 'white', textAlign: 'center', marginBottom: '0.5rem', lineHeight: 1.1 }}>
            Accès Guide
          </h1>
          <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.4)', textAlign: 'center', marginBottom: '2rem', lineHeight: 1.6 }}>
            Vos identifiants vous ont été transmis<br />par l&apos;équipe SAFARUMA par email.
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: '0.4rem' }}>
                Adresse e-mail
              </label>
              <input
                type="email" required value={email} onChange={e => setEmail(e.target.value)}
                placeholder="votre@email.com"
                style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: '1.5px solid rgba(201,168,76,0.25)', background: 'rgba(255,255,255,0.05)', fontSize: '0.88rem', color: 'white', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: '0.4rem' }}>
                Mot de passe
              </label>
              <input
                type="password" required value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: '1.5px solid rgba(201,168,76,0.25)', background: 'rgba(255,255,255,0.05)', fontSize: '0.88rem', color: 'white', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
              />
            </div>

            {error && (
              <div style={{ background: 'rgba(192,57,43,0.15)', border: '1px solid rgba(192,57,43,0.3)', borderRadius: 8, padding: '0.6rem 0.9rem', fontSize: '0.78rem', color: '#E74C3C' }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} style={{ width: '100%', padding: '13px', marginTop: '0.25rem', background: '#C9A84C', color: '#1A1209', border: 'none', borderRadius: 50, cursor: loading ? 'not-allowed' : 'pointer', fontSize: '0.875rem', fontWeight: 700, letterSpacing: '0.04em', fontFamily: 'inherit', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Connexion...' : 'Accéder à mon espace →'}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'rgba(255,255,255,0.25)', marginTop: '1.5rem', lineHeight: 1.6 }}>
            Pas encore de compte ?{' '}
            <Link href="/guide/inscription" style={{ color: 'rgba(201,168,76,0.7)', textDecoration: 'none' }}>
              Soumettre ma candidature
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
