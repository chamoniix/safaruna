'use client'

import Link from 'next/link'
import { FormEvent, Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'

function AdminResetForm() {
  const token = useSearchParams().get('token') || ''
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')

    if (!token) return setError('Lien invalide.')
    if (password.length < 8) return setError('Le mot de passe doit contenir au moins 8 caractères.')
    if (password !== confirmation) return setError('Les mots de passe ne correspondent pas.')

    setLoading(true)
    try {
      const response = await fetch('/api/admin/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Réinitialisation impossible.')
      setDone(true)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Réinitialisation impossible.')
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div style={{ textAlign: 'center' }}>
        <p style={{ color: '#F0D897', fontSize: '0.86rem', lineHeight: 1.7, margin: '1.5rem 0' }}>
          Ton mot de passe Administration a été mis à jour. Toutes les anciennes sessions ont été déconnectées.
        </p>
        <Link href="/admin/login" style={{ display: 'block', padding: '0.9rem', borderRadius: 50, background: '#C9A84C', color: '#1A1209', fontSize: '0.875rem', fontWeight: 700, textDecoration: 'none' }}>
          Se connecter
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {error && (
        <div role="alert" style={{ padding: '0.75rem 1rem', background: 'rgba(240,108,76,0.12)', border: '1px solid rgba(240,108,76,0.3)', borderRadius: 10, color: '#F06C4C', fontSize: '0.78rem', fontWeight: 600 }}>
          {error}
        </div>
      )}
      <div>
        <label htmlFor="admin-new-password" style={{ display: 'block', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#C9A84C', marginBottom: '0.45rem' }}>
          Nouveau mot de passe
        </label>
        <input id="admin-new-password" type="password" required minLength={8} autoComplete="new-password" value={password} onChange={event => setPassword(event.target.value)} style={{ width: '100%', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.06)', border: '1.5px solid rgba(255,255,255,0.12)', borderRadius: 10, color: 'white', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }} />
      </div>
      <div>
        <label htmlFor="admin-confirm-password" style={{ display: 'block', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#C9A84C', marginBottom: '0.45rem' }}>
          Confirmer le mot de passe
        </label>
        <input id="admin-confirm-password" type="password" required minLength={8} autoComplete="new-password" value={confirmation} onChange={event => setConfirmation(event.target.value)} style={{ width: '100%', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.06)', border: '1.5px solid rgba(255,255,255,0.12)', borderRadius: 10, color: 'white', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }} />
      </div>
      <button type="submit" disabled={loading || !token} style={{ width: '100%', padding: '0.9rem', borderRadius: 50, border: 'none', background: '#C9A84C', color: '#1A1209', fontSize: '0.875rem', fontWeight: 700, cursor: loading || !token ? 'not-allowed' : 'pointer', opacity: loading || !token ? 0.65 : 1, fontFamily: 'inherit' }}>
        {loading ? 'Mise à jour…' : 'Mettre à jour le mot de passe'}
      </button>
      <Link href="/admin/login" style={{ color: '#C9A84C', fontSize: '0.76rem', fontWeight: 600, textAlign: 'center', textDecoration: 'none' }}>
        Retour à la connexion
      </Link>
    </form>
  )
}

export default function AdminResetPasswordPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#0F0A05', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-manrope, sans-serif)', padding: '1.5rem' }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '2rem', fontWeight: 700, color: 'white', letterSpacing: '0.08em' }}>
            SAFAR<span style={{ color: '#C9A84C' }}>U</span>MA
          </div>
          <div style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)' }}>
            Administration
          </div>
        </div>
        <div style={{ background: '#1A1209', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 20, overflow: 'hidden' }}>
          <div style={{ height: 3, background: 'linear-gradient(90deg, #C9A84C, #F0D897, #C9A84C)' }} />
          <div style={{ padding: '2rem' }}>
            <h1 style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.6rem', fontWeight: 700, color: 'white', marginBottom: '1.5rem', textAlign: 'center' }}>
              Nouveau mot de passe
            </h1>
            <Suspense fallback={<p style={{ color: 'rgba(255,255,255,0.4)', textAlign: 'center' }}>Chargement…</p>}>
              <AdminResetForm />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  )
}
