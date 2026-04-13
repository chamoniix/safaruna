'use client'
import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

function VerifyEmailContent() {
  const params = useSearchParams()
  const router = useRouter()
  const token = params.get('token')
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')

  useEffect(() => {
    if (!token) { setStatus('error'); return }
    fetch('/api/verify-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setStatus('success')
          setTimeout(() => router.push('/connexion?verified=1'), 2000)
        } else {
          setStatus('error')
        }
      })
      .catch(() => setStatus('error'))
  }, [token, router])

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      background: '#FAF7F0', fontFamily: 'var(--font-manrope, sans-serif)',
    }}>
      <div style={{
        background: 'white', borderRadius: 20,
        padding: '3rem 2.5rem', textAlign: 'center',
        maxWidth: 420, boxShadow: '0 8px 32px rgba(26,18,9,0.08)',
      }}>
        {status === 'loading' && (
          <>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>⏳</div>
            <h2 style={{ color: '#1A1209' }}>Vérification en cours...</h2>
          </>
        )}
        {status === 'success' && (
          <>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>✅</div>
            <h2 style={{ color: '#1D5C3A' }}>Email confirmé !</h2>
            <p style={{ color: '#7A6D5A' }}>
              Redirection vers votre espace...
            </p>
          </>
        )}
        {status === 'error' && (
          <>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>❌</div>
            <h2 style={{ color: '#DC2626' }}>Lien invalide ou expiré</h2>
            <p style={{ color: '#7A6D5A', marginBottom: '1.5rem' }}>
              Ce lien a expiré ou a déjà été utilisé.
            </p>
            <a href="/inscription" style={{
              display: 'inline-block',
              background: '#C9A84C', color: '#1A1209',
              padding: '0.75rem 1.5rem', borderRadius: 50,
              fontWeight: 700, textDecoration: 'none',
              fontSize: '0.88rem',
            }}>
              Créer un nouveau compte
            </a>
          </>
        )}
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div style={{
        minHeight: '100vh', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        background: '#FAF7F0',
      }}>
        <div style={{ color: '#7A6D5A' }}>Chargement...</div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  )
}
