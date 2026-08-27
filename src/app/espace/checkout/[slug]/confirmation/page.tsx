'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

const MAX_VERIFICATION_ATTEMPTS = 8
const VERIFICATION_RETRY_MS = 1500
type VerificationState = 'pending' | 'confirmed' | 'failed' | 'delayed'

function ConfirmationContent() {
  const params = useSearchParams()
  const ref = params.get('ref') || 'SAF-XXX'
  const payment = params.get('payment')
  const validReturn = ref !== 'SAF-XXX' && payment === 'success'

  const [verification, setVerification] = useState<{ refNumber: string; state: VerificationState }>({
    refNumber: '',
    state: 'pending',
  })
  const verified: VerificationState = !validReturn
    ? 'failed'
    : verification.refNumber === ref
      ? verification.state
      : 'pending'

  useEffect(() => {
    if (!validReturn) return
    let cancelled = false
    let retryTimer: ReturnType<typeof setTimeout> | undefined

    const retryOrDelay = (attempt: number) => {
      if (cancelled) return
      if (attempt >= MAX_VERIFICATION_ATTEMPTS) {
        setVerification({ refNumber: ref, state: 'delayed' })
        return
      }
      retryTimer = setTimeout(() => checkReservation(attempt + 1), VERIFICATION_RETRY_MS)
    }

    const checkReservation = async (attempt: number) => {
      try {
        const res = await fetch(`/api/espace/reservations?ref=${encodeURIComponent(ref)}`, {
          cache: 'no-store',
        })
        if (!res.ok) {
          if ([400, 401, 403, 404].includes(res.status)) {
            if (!cancelled) setVerification({ refNumber: ref, state: 'failed' })
            return
          }
          retryOrDelay(attempt)
          return
        }

        const data = await res.json() as {
          verification?: { refNumber?: string; state?: 'confirmed' | 'pending' | 'failed' }
        }
        const verification = data.verification
        if (verification?.refNumber !== ref) {
          if (!cancelled) setVerification({ refNumber: ref, state: 'failed' })
          return
        }
        if (verification.state === 'confirmed' || verification.state === 'failed') {
          if (!cancelled) setVerification({ refNumber: ref, state: verification.state })
          return
        }
        retryOrDelay(attempt)
      } catch {
        retryOrDelay(attempt)
      }
    }

    checkReservation(1)
    return () => {
      cancelled = true
      if (retryTimer) clearTimeout(retryTimer)
    }
  }, [ref, validReturn])

  if (verified === 'pending') {
    return (
      <div style={{ minHeight: '100vh', background: '#FAF7F0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', fontFamily: 'Arial, sans-serif', gap: '1.5rem' }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid #E8DFC8', borderTopColor: '#C9A84C', animation: 'spin 0.8s linear infinite' }} />
        <p style={{ color: '#7A6D5A', fontSize: '0.95rem' }}>Confirmation en cours...</p>
        <p style={{ color: '#9CA3AF', fontSize: '0.8rem' }}>Veuillez patienter, nous vérifions votre réservation.</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  if (verified === 'failed') {
    return (
      <div style={{ minHeight: '100vh', background: '#FAF7F0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', fontFamily: 'Arial, sans-serif', gap: '1rem' }}>
        <p style={{ color: '#7A6D5A', fontSize: '1rem' }}>Nous n&apos;avons pas pu confirmer votre réservation.</p>
        <p style={{ color: '#9CA3AF', fontSize: '0.85rem' }}>Si vous avez effectué un paiement, contactez-nous avec votre référence : <strong>{ref}</strong></p>
        <Link href="/espace/reservations" style={{ color: '#C9A84C', fontWeight: 700, textDecoration: 'underline' }}>Voir mes réservations</Link>
      </div>
    )
  }

  if (verified === 'delayed') {
    return (
      <div style={{ minHeight: '100vh', background: '#FAF7F0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', fontFamily: 'Arial, sans-serif', gap: '1rem', textAlign: 'center' }}>
        <p style={{ color: '#7A6D5A', fontSize: '1rem' }}>La vérification prend plus de temps que prévu.</p>
        <p style={{ color: '#9CA3AF', fontSize: '0.85rem', maxWidth: 480 }}>Aucun succès ne sera affiché avant la confirmation sécurisée du serveur. Référence : <strong>{ref}</strong></p>
        <button type="button" onClick={() => window.location.reload()} style={{ border: 0, borderRadius: 10, background: '#1A1209', color: '#F0D897', padding: '0.8rem 1.2rem', fontWeight: 700, cursor: 'pointer' }}>Réessayer</button>
        <Link href="/espace/reservations" style={{ color: '#C9A84C', fontWeight: 700, textDecoration: 'underline' }}>Voir mes réservations</Link>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#FAF7F0', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ maxWidth: 520, width: '100%', textAlign: 'center' }}>

        {/* Icône */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
            <circle cx="26" cy="26" r="25" stroke="#C9A84C" strokeWidth="1.5" fill="rgba(201,168,76,0.06)"/>
            <path
              d="M32 18C28.5 18 25 21 25 26C25 31 28.5 34 32 34
                 C29 34 20 31 20 26C20 21 29 18 32 18Z"
              fill="#C9A84C" opacity="0.9"/>
            <circle cx="33" cy="22" r="2" fill="#C9A84C" opacity="0.7"/>
          </svg>
        </div>

        {/* Titre arabe */}
        <div style={{ fontFamily: 'Georgia, serif', fontSize: '1.5rem', color: '#C9A84C', marginBottom: '0.5rem', direction: 'rtl' }}>
          الحمد لله
        </div>

        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '2.5rem', fontWeight: 400, color: '#1A1209', marginBottom: '0.5rem' }}>
          Mabrouk !
        </h1>

        <p style={{ color: '#7A6D5A', fontSize: '0.95rem', lineHeight: 1.8, marginBottom: '1.5rem' }}>
          Votre demande de réservation a bien été enregistrée.
          Vous recevrez un email de confirmation avec tous les détails de votre voyage.
        </p>

        {/* Du'a du voyageur */}
        <div style={{ background: 'white', border: '1px solid #E8DFC8', borderRadius: 16, padding: '1.5rem', marginBottom: '2rem' }}>
          <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#C9A84C', marginBottom: '1rem' }}>
            Du&apos;a du voyageur
          </div>
          <div style={{ fontFamily: 'serif', fontSize: '1.2rem', color: '#1A1209', direction: 'rtl', lineHeight: 1.8, marginBottom: '0.75rem' }}>
            سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ
          </div>
          <div style={{ fontSize: '0.82rem', color: '#7A6D5A', fontStyle: 'italic', lineHeight: 1.7 }}>
            « Gloire à Celui qui nous a soumis cela, alors que nous n&apos;en étions pas capables. »
          </div>
        </div>

        {/* Numéro de réservation */}
        <div style={{ background: '#1A1209', borderRadius: 16, padding: '1.25rem 2rem', marginBottom: '2rem' }}>
          <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(201,168,76,0.6)', marginBottom: '0.5rem' }}>
            Numéro de réservation
          </div>
          <div style={{ fontFamily: 'monospace', fontSize: '1.5rem', fontWeight: 700, color: '#F0D897', letterSpacing: '0.1em' }}>
            {ref}
          </div>
        </div>

        <Link
          href="/espace/reservations"
          style={{ display: 'inline-block', width: '100%', padding: '1rem', background: '#1A1209', color: '#F0D897', textDecoration: 'none', borderRadius: 12, fontWeight: 700, fontSize: '0.95rem', textAlign: 'center', boxSizing: 'border-box' }}
        >
          Gérer ma réservation →
        </Link>

        <div style={{ marginTop: '1rem', fontSize: '0.78rem', color: '#9CA3AF' }}>
          Un email de confirmation a été envoyé à votre adresse
        </div>
      </div>
    </div>
  )
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: '#FAF7F0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', border: '3px solid #E8DFC8', borderTopColor: '#C9A84C', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    }>
      <ConfirmationContent />
    </Suspense>
  )
}
