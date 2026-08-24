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
    <section style={{ width: '100%', maxWidth: 420, border: '1px solid rgba(201,168,76,0.25)', borderRadius: 20, padding: '2rem', background: 'rgba(255,255,255,0.04)', color: 'white' }}>
      <h1 style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '2rem', margin: 0 }}>Nouveau mot de passe</h1>
      {success ? (
        <div style={{ marginTop: '1rem' }}>
          <p style={{ color: '#A7F3D0', fontSize: '0.85rem' }}>Votre mot de passe a été modifié. Toutes les anciennes sessions ont été fermées.</p>
          <Link href="/guide/connexion" style={{ color: '#C9A84C' }}>Se connecter</Link>
        </div>
      ) : (
        <form onSubmit={submit} style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
          <input type="password" required minLength={8} value={password} onChange={event => setPassword(event.target.value)} placeholder="Nouveau mot de passe" style={{ padding: '0.75rem', borderRadius: 9, border: '1px solid rgba(201,168,76,0.3)', background: 'rgba(255,255,255,0.06)', color: 'white' }} />
          <input type="password" required minLength={8} value={confirmation} onChange={event => setConfirmation(event.target.value)} placeholder="Confirmer le mot de passe" style={{ padding: '0.75rem', borderRadius: 9, border: '1px solid rgba(201,168,76,0.3)', background: 'rgba(255,255,255,0.06)', color: 'white' }} />
          {error && <div style={{ color: '#FCA5A5', fontSize: '0.78rem' }}>{error}</div>}
          <button disabled={loading || !token} style={{ padding: '0.75rem', borderRadius: 50, border: 0, background: '#C9A84C', color: '#1A1209', fontWeight: 800 }}>{loading ? 'Modification…' : 'Modifier le mot de passe'}</button>
        </form>
      )}
    </section>
  )
}

export default function GuideResetPasswordPage() {
  return <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#1A1209', padding: '2rem 1rem', fontFamily: 'var(--font-manrope, sans-serif)' }}><Suspense><ResetGuidePasswordForm /></Suspense></main>
}
