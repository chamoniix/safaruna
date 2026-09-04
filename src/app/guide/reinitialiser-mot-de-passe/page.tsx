'use client'

import Link from 'next/link'
import { FormEvent, Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'

function ResetGuidePasswordForm() {
  const token = useSearchParams().get('token') || ''
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (password !== confirmation) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const response = await fetch('/api/guide/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })
      const data = await response.json().catch(() => null) as { error?: string } | null
      if (!response.ok) throw new Error(data?.error || 'Réinitialisation impossible.')
      setSuccess(true)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Réinitialisation impossible.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="guide-reset-card" style={{ position: 'relative', width: '100%', maxWidth: 420, border: '1px solid rgba(201,168,76,0.3)', borderRadius: 22, padding: '2rem', background: '#241A0F', color: '#FFF8E7', boxShadow: '0 28px 70px rgba(0,0,0,0.28)', overflow: 'hidden' }}>
      <div aria-hidden="true" style={{ position: 'absolute', inset: '0 0 auto', height: 3, background: 'linear-gradient(90deg, #C9A84C, #F0D897, #C9A84C)' }} />
      <Link href="/" aria-label="Retour à l’accueil SAFARUMA" style={{ display: 'inline-block', color: '#FFF8E7', textDecoration: 'none', fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.35rem', fontWeight: 700, letterSpacing: '0.08em', marginBottom: '1.4rem' }}>
        SAFAR<span style={{ color: '#C9A84C' }}>U</span>MA
      </Link>
      <div style={{ color: '#C9A84C', fontSize: '0.68rem', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.45rem' }}>Espace Guide</div>
      <h1 style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: 'clamp(2rem, 8vw, 2.45rem)', lineHeight: 1.08, color: '#FFF8E7', margin: '0 0 0.75rem', fontWeight: 600 }}>Nouveau mot de passe</h1>
      {success ? (
        <div role="status" aria-live="polite" style={{ marginTop: '1rem' }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', display: 'grid', placeItems: 'center', color: '#D1FAE5', background: '#183C2B', border: '1px solid rgba(110,231,183,0.42)', marginBottom: '1rem' }}>
            <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
          </div>
          <p style={{ color: '#D1FAE5', fontSize: '0.9rem', lineHeight: 1.65, margin: '0 0 1.25rem' }}>Votre mot de passe a été modifié. Toutes les anciennes sessions ont été fermées.</p>
          <Link className="guide-reset-login" href="/guide/connexion" style={{ minHeight: 48, borderRadius: 50, background: '#D7B64F', color: '#1A1209', fontWeight: 800, fontSize: '0.9rem', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform 160ms ease, box-shadow 160ms ease' }}>Se connecter →</Link>
        </div>
      ) : (
        <form onSubmit={submit} style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
          <div>
            <label htmlFor="guide-reset-password" style={{ display: 'block', color: '#F0D897', fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.09em', textTransform: 'uppercase', marginBottom: '0.45rem' }}>Nouveau mot de passe</label>
            <input id="guide-reset-password" className="guide-reset-input" type="password" autoComplete="new-password" required minLength={8} value={password} onChange={event => setPassword(event.target.value)} placeholder="8 caractères minimum" style={{ width: '100%', boxSizing: 'border-box', minHeight: 48, padding: '0.75rem 0.9rem', borderRadius: 10, border: '1px solid rgba(201,168,76,0.4)', background: '#30261B', color: '#FFF8E7', fontSize: '1rem', fontFamily: 'inherit' }} />
          </div>
          <div>
            <label htmlFor="guide-reset-confirmation" style={{ display: 'block', color: '#F0D897', fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.09em', textTransform: 'uppercase', marginBottom: '0.45rem' }}>Confirmer le mot de passe</label>
            <input id="guide-reset-confirmation" className="guide-reset-input" type="password" autoComplete="new-password" required minLength={8} value={confirmation} onChange={event => setConfirmation(event.target.value)} placeholder="Saisissez-le à nouveau" style={{ width: '100%', boxSizing: 'border-box', minHeight: 48, padding: '0.75rem 0.9rem', borderRadius: 10, border: '1px solid rgba(201,168,76,0.4)', background: '#30261B', color: '#FFF8E7', fontSize: '1rem', fontFamily: 'inherit' }} />
          </div>
          {!token && <div role="alert" style={{ background: 'rgba(127,29,29,0.32)', border: '1px solid rgba(252,165,165,0.38)', borderRadius: 10, padding: '0.75rem 0.9rem', color: '#FECACA', fontSize: '0.8rem', lineHeight: 1.5 }}>Ce lien est invalide. Demandez un nouveau lien depuis « Mot de passe oublié ».</div>}
          {error && <div role="alert" style={{ background: 'rgba(127,29,29,0.32)', border: '1px solid rgba(252,165,165,0.38)', borderRadius: 10, padding: '0.75rem 0.9rem', color: '#FECACA', fontSize: '0.8rem', lineHeight: 1.5 }}>{error}</div>}
          <button className="guide-reset-button" type="submit" disabled={loading || !token} aria-busy={loading} style={{ minHeight: 48, padding: '0.75rem', borderRadius: 50, border: 0, background: '#D7B64F', color: '#1A1209', fontWeight: 800, fontSize: '0.9rem', fontFamily: 'inherit', cursor: loading || !token ? 'not-allowed' : 'pointer', opacity: loading || !token ? 0.58 : 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 9 }}>
            {loading ? <><span aria-hidden="true" style={{ width: 16, height: 16, border: '2px solid rgba(26,18,9,0.28)', borderTopColor: '#1A1209', borderRadius: '50%', animation: 'guide-reset-spin 700ms linear infinite' }} /><span>Modification en cours…</span></> : 'Modifier le mot de passe'}
          </button>
        </form>
      )}
    </section>
  )
}

export default function GuideResetPasswordPage() {
  return (
    <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#1A1209', padding: '2rem 1rem', fontFamily: 'var(--font-manrope, sans-serif)', position: 'relative', overflow: 'hidden' }}>
      <style>{`
        @keyframes guide-reset-spin { to { transform: rotate(360deg); } }
        .guide-reset-button, .guide-reset-login { transition: transform 160ms ease, box-shadow 160ms ease, opacity 160ms ease; }
        .guide-reset-button:not(:disabled):hover, .guide-reset-login:hover { transform: translateY(-1px); box-shadow: 0 10px 28px rgba(201,168,76,0.22); }
        .guide-reset-button:not(:disabled):active, .guide-reset-login:active { transform: translateY(1px) scale(0.99); box-shadow: none; }
        .guide-reset-input:focus-visible { outline: none; border-color: #F0D897 !important; box-shadow: 0 0 0 3px rgba(240,216,151,0.14); }
        @media (max-width: 480px) { .guide-reset-card { padding: 1.5rem !important; border-radius: 18px !important; } }
        @media (prefers-reduced-motion: reduce) { .guide-reset-button, .guide-reset-login { transition: none; } }
      `}</style>
      <div aria-hidden="true" style={{ position: 'fixed', inset: 0, background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(201,168,76,0.08) 0%, transparent 60%)', pointerEvents: 'none' }} />
      <Suspense><ResetGuidePasswordForm /></Suspense>
    </main>
  )
}
