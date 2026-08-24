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
    <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#1A1209', padding: '2rem 1rem', fontFamily: 'var(--font-manrope, sans-serif)' }}>
      <section style={{ width: '100%', maxWidth: 420, border: '1px solid rgba(201,168,76,0.25)', borderRadius: 20, padding: '2rem', background: 'rgba(255,255,255,0.04)', color: 'white' }}>
        <h1 style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '2rem', margin: 0 }}>Mot de passe oublié</h1>
        <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.82rem', lineHeight: 1.6 }}>Indiquez l’adresse de votre compte Guide. Si elle est reconnue, vous recevrez un lien valable une heure.</p>
        {sent ? (
          <div style={{ background: 'rgba(29,92,58,0.25)', border: '1px solid rgba(110,231,183,0.35)', borderRadius: 10, padding: '0.9rem', fontSize: '0.82rem' }}>Si cette adresse correspond à un compte actif, l’e-mail a été envoyé.</div>
        ) : (
          <form onSubmit={submit} style={{ display: 'grid', gap: '1rem' }}>
            <input type="email" required value={email} onChange={event => setEmail(event.target.value)} placeholder="votre@email.com" style={{ width: '100%', boxSizing: 'border-box', padding: '0.75rem', borderRadius: 9, border: '1px solid rgba(201,168,76,0.3)', background: 'rgba(255,255,255,0.06)', color: 'white' }} />
            {error && <div style={{ color: '#FCA5A5', fontSize: '0.78rem' }}>{error}</div>}
            <button disabled={loading} style={{ padding: '0.75rem', borderRadius: 50, border: 0, background: '#C9A84C', color: '#1A1209', fontWeight: 800, cursor: loading ? 'not-allowed' : 'pointer' }}>{loading ? 'Envoi…' : 'Envoyer le lien'}</button>
          </form>
        )}
        <Link href="/guide/connexion" style={{ display: 'inline-block', marginTop: '1.25rem', color: '#C9A84C', fontSize: '0.78rem', textDecoration: 'none' }}>← Retour à la connexion</Link>
      </section>
    </main>
  )
}
