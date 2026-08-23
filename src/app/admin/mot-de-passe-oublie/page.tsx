'use client'

import Link from 'next/link'
import { FormEvent, useState } from 'react'

export default function AdminForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/admin/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Envoi temporairement indisponible.')
      setSent(true)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Envoi temporairement indisponible.')
    } finally {
      setLoading(false)
    }
  }

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
            <h1 style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.6rem', fontWeight: 700, color: 'white', marginBottom: '0.5rem', textAlign: 'center' }}>
              Mot de passe oublié
            </h1>

            {sent ? (
              <div style={{ textAlign: 'center' }}>
                <p style={{ color: '#F0D897', fontSize: '0.86rem', lineHeight: 1.7, margin: '1.5rem 0' }}>
                  Si cette adresse correspond à un compte Administration actif, un lien de réinitialisation vient d&apos;être envoyé.
                </p>
                <Link href="/admin/login" style={{ color: '#C9A84C', fontSize: '0.78rem', fontWeight: 700, textDecoration: 'none' }}>
                  Retour à la connexion
                </Link>
              </div>
            ) : (
              <>
                <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', textAlign: 'center', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                  Saisissez l&apos;adresse de votre compte Administration.
                </p>

                {error && (
                  <div role="alert" style={{ marginBottom: '1rem', padding: '0.75rem 1rem', background: 'rgba(240,108,76,0.12)', border: '1px solid rgba(240,108,76,0.3)', borderRadius: 10, color: '#F06C4C', fontSize: '0.78rem', fontWeight: 600 }}>
                    {error}
                  </div>
                )}

                <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label htmlFor="admin-reset-email" style={{ display: 'block', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#C9A84C', marginBottom: '0.45rem' }}>
                      Adresse email
                    </label>
                    <input
                      id="admin-reset-email"
                      type="email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={event => setEmail(event.target.value)}
                      placeholder="admin@safaruma.com"
                      style={{ width: '100%', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.06)', border: '1.5px solid rgba(255,255,255,0.12)', borderRadius: 10, color: 'white', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
                    />
                  </div>
                  <button type="submit" disabled={loading} style={{ width: '100%', padding: '0.9rem', borderRadius: 50, border: 'none', background: '#C9A84C', color: '#1A1209', fontSize: '0.875rem', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.65 : 1, fontFamily: 'inherit' }}>
                    {loading ? 'Envoi…' : 'Envoyer le lien sécurisé'}
                  </button>
                  <Link href="/admin/login" style={{ color: '#C9A84C', fontSize: '0.76rem', fontWeight: 600, textAlign: 'center', textDecoration: 'none' }}>
                    Retour à la connexion
                  </Link>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
