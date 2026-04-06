'use client';

import Link from 'next/link';
import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function ResetForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (password !== confirm) { setError('Les mots de passe ne correspondent pas.'); return; }
    if (password.length < 8) { setError('Minimum 8 caractères.'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (data.success) { setDone(true); }
      else { setError(data.error || 'Erreur. Réessayez.'); }
    } catch { setError('Erreur de connexion.'); }
    finally { setLoading(false); }
  }

  if (!token) return (
    <div style={{ textAlign: 'center', padding: '2rem' }}>
      <p style={{ color: '#C0392B', fontSize: '0.9rem' }}>Lien invalide.</p>
      <Link href="/mot-de-passe-oublie" style={{ color: '#C9A84C', fontWeight: 600 }}>Faire une nouvelle demande</Link>
    </div>
  );

  return done ? (
    <div style={{ textAlign: 'center' }}>
      <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#E8F5EE', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem', fontSize: '1.5rem', color: '#1D5C3A' }}>✓</div>
      <p style={{ fontSize: '0.95rem', fontWeight: 600, color: '#1A1209', marginBottom: '0.5rem' }}>Mot de passe mis à jour !</p>
      <p style={{ fontSize: '0.85rem', color: '#7A6D5A', marginBottom: '1.75rem' }}>Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.</p>
      <Link href="/connexion" style={{ display: 'block', padding: '13px', textAlign: 'center', background: '#1A1209', color: '#F0D897', borderRadius: 50, fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none' }}>
        Se connecter
      </Link>
    </div>
  ) : (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {error && (
        <div style={{ background: '#FEE2E2', border: '1px solid #FCA5A5', borderRadius: 10, padding: '0.75rem 1rem', fontSize: '0.82rem', color: '#DC2626', fontWeight: 600 }}>
          {error}
        </div>
      )}
      <div>
        <label style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#7A6D5A', marginBottom: '0.5rem' }}>Nouveau mot de passe</label>
        <input type="password" required minLength={8} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" style={{ width: '100%', padding: '12px 16px', borderRadius: 10, border: '1.5px solid #E8DFC8', background: '#FDFBF7', fontSize: '0.9rem', color: '#1A1209', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />
      </div>
      <div>
        <label style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#7A6D5A', marginBottom: '0.5rem' }}>Confirmer le mot de passe</label>
        <input type="password" required minLength={8} value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="••••••••" style={{ width: '100%', padding: '12px 16px', borderRadius: 10, border: '1.5px solid #E8DFC8', background: '#FDFBF7', fontSize: '0.9rem', color: '#1A1209', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />
      </div>
      <button type="submit" disabled={loading} style={{ width: '100%', padding: '13px', background: '#1A1209', color: '#F0D897', border: 'none', borderRadius: 50, cursor: loading ? 'not-allowed' : 'pointer', fontSize: '0.875rem', fontWeight: 600, fontFamily: 'inherit', opacity: loading ? 0.7 : 1 }}>
        {loading ? 'Mise à jour...' : 'Mettre à jour le mot de passe'}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FAF7F0', padding: '2rem 1rem', fontFamily: 'var(--font-manrope, sans-serif)' }}>
      <div style={{ position: 'fixed', inset: 0, background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(201,168,76,0.05) 0%, transparent 60%)', pointerEvents: 'none' }} />
      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 440, background: 'white', borderRadius: 24, boxShadow: '0 8px 48px rgba(26,18,9,0.08)', overflow: 'hidden' }}>
        <div style={{ height: 4, background: 'linear-gradient(90deg, #C9A84C, #F0D897, #C9A84C)' }} />
        <div style={{ padding: '2.5rem 2.5rem 2.25rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
            <Link href="/" style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.75rem', fontWeight: 700, color: '#1A1209', textDecoration: 'none', letterSpacing: '0.08em', display: 'inline-block', marginBottom: '0.75rem' }}>
              SAFAR<span style={{ color: '#C9A84C' }}>U</span>MA
            </Link>
            <h1 style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.75rem', fontWeight: 700, color: '#1A1209', margin: 0 }}>
              Nouveau mot de passe
            </h1>
          </div>
          <Suspense fallback={<div style={{ textAlign: 'center', color: '#7A6D5A' }}>Chargement...</div>}>
            <ResetForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
