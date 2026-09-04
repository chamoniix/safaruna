'use client'

import Link from 'next/link'
import { FormEvent, useState } from 'react'

export default function GuideForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function submit(event: FormEvent) {
    event.preventDefault()
    setLoading(true)
    setError('')
    try {
      const response = await fetch('/api/guide/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await response.json().catch(() => null) as { error?: string } | null
      if (!response.ok) throw new Error(data?.error || 'Envoi impossible.')
      setSent(true)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Envoi impossible.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#1A1209', padding: '2rem 1rem', fontFamily: 'var(--font-manrope, sans-serif)', position: 'relative', overflow: 'hidden' }}>
      <style>{`
        @keyframes guide-forgot-spin { to { transform: rotate(360deg); } }
        .guide-forgot-button { transition: transform 160ms ease, box-shadow 160ms ease, opacity 160ms ease; }
        .guide-forgot-button:not(:disabled):hover { transform: translateY(-1px); box-shadow: 0 10px 28px rgba(201,168,76,0.22); }
        .guide-forgot-button:not(:disabled):active { transform: translateY(1px) scale(0.99); box-shadow: none; }
        .guide-forgot-input:focus-visible { outline: none; border-color: #F0D897 !important; box-shadow: 0 0 0 3px rgba(240,216,151,0.14); }
        .guide-forgot-back:hover { color: #FFF3C4 !important; }
        @media (max-width: 480px) { .guide-forgot-card { padding: 1.5rem !important; border-radius: 18px !important; } }
        @media (prefers-reduced-motion: reduce) { .guide-forgot-button { transition: none; } }
      `}</style>
      <div aria-hidden="true" style={{ position: 'fixed', inset: 0, background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(201,168,76,0.08) 0%, transparent 60%)', pointerEvents: 'none' }} />
      <section className="guide-forgot-card" style={{ position: 'relative', width: '100%', maxWidth: 420, border: '1px solid rgba(201,168,76,0.3)', borderRadius: 22, padding: '2rem', background: '#241A0F', color: '#FFF8E7', boxShadow: '0 28px 70px rgba(0,0,0,0.28)', overflow: 'hidden' }}>
        <div aria-hidden="true" style={{ position: 'absolute', inset: '0 0 auto', height: 3, background: 'linear-gradient(90deg, #C9A84C, #F0D897, #C9A84C)' }} />
        <Link href="/" aria-label="Retour à l’accueil SAFARUMA" style={{ display: 'inline-block', color: '#FFF8E7', textDecoration: 'none', fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.35rem', fontWeight: 700, letterSpacing: '0.08em', marginBottom: '1.4rem' }}>
          SAFAR<span style={{ color: '#C9A84C' }}>U</span>MA
        </Link>
        <div style={{ color: '#C9A84C', fontSize: '0.68rem', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.45rem' }}>Espace Guide</div>
        <h1 style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: 'clamp(2rem, 8vw, 2.45rem)', lineHeight: 1.08, color: '#FFF8E7', margin: '0 0 0.75rem', fontWeight: 600 }}>Mot de passe oublié</h1>
        <p style={{ color: '#D8CFBF', fontSize: '0.88rem', lineHeight: 1.65, margin: '0 0 1.5rem' }}>Indiquez l’adresse de votre compte Guide. Si elle est reconnue, vous recevrez un lien valable une heure.</p>
        {sent ? (
          <div role="status" aria-live="polite" style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', background: '#183C2B', border: '1px solid rgba(110,231,183,0.42)', borderRadius: 12, padding: '1rem', color: '#D1FAE5', fontSize: '0.84rem', lineHeight: 1.55 }}>
            <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flex: '0 0 auto', marginTop: 1 }}><path d="M20 6 9 17l-5-5" /></svg>
            <span>Si cette adresse correspond à un compte actif, l’e-mail a été envoyé.</span>
          </div>
        ) : (
          <form onSubmit={submit} style={{ display: 'grid', gap: '1rem' }}>
            <div>
              <label htmlFor="guide-forgot-email" style={{ display: 'block', color: '#F0D897', fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.09em', textTransform: 'uppercase', marginBottom: '0.45rem' }}>Adresse e-mail</label>
              <input id="guide-forgot-email" className="guide-forgot-input" type="email" autoComplete="email" required value={email} onChange={event => setEmail(event.target.value)} placeholder="votre@email.com" style={{ width: '100%', boxSizing: 'border-box', minHeight: 48, padding: '0.75rem 0.9rem', borderRadius: 10, border: '1px solid rgba(201,168,76,0.4)', background: '#30261B', color: '#FFF8E7', fontSize: '1rem', fontFamily: 'inherit' }} />
            </div>
            {error && <div role="alert" style={{ background: 'rgba(127,29,29,0.32)', border: '1px solid rgba(252,165,165,0.38)', borderRadius: 10, padding: '0.75rem 0.9rem', color: '#FECACA', fontSize: '0.8rem', lineHeight: 1.5 }}>{error}</div>}
            <button className="guide-forgot-button" type="submit" disabled={loading} aria-busy={loading} style={{ minHeight: 48, padding: '0.75rem', borderRadius: 50, border: 0, background: '#D7B64F', color: '#1A1209', fontWeight: 800, fontSize: '0.9rem', fontFamily: 'inherit', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.76 : 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 9 }}>
              {loading ? <><span aria-hidden="true" style={{ width: 16, height: 16, border: '2px solid rgba(26,18,9,0.28)', borderTopColor: '#1A1209', borderRadius: '50%', animation: 'guide-forgot-spin 700ms linear infinite' }} /><span>Envoi en cours…</span></> : 'Envoyer le lien'}
            </button>
          </form>
        )}
        <Link className="guide-forgot-back" href="/guide/connexion" style={{ display: 'inline-block', marginTop: '1.35rem', color: '#E6C969', fontSize: '0.82rem', fontWeight: 700, textDecoration: 'none', transition: 'color 160ms ease' }}>← Retour à la connexion</Link>
      </section>
    </main>
  )
}
