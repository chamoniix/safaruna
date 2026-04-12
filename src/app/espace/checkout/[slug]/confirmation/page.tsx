'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

function ConfirmationContent() {
  const params = useSearchParams()
  const ref = params.get('ref') || 'SAF-XXX'

  return (
    <div style={{ minHeight: '100vh', background: '#FAF7F0', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ maxWidth: 520, width: '100%', textAlign: 'center' }}>

        {/* Icône */}
        <div style={{ fontSize: '3rem', marginBottom: '1rem', filter: 'drop-shadow(0 2px 8px rgba(201,168,76,0.3))' }}>🕌</div>

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

        {/* Numéro de réservation */}
        <div style={{ background: '#1A1209', borderRadius: 16, padding: '1.25rem 2rem', marginBottom: '2rem' }}>
          <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(201,168,76,0.6)', marginBottom: '0.5rem' }}>
            Numéro de réservation
          </div>
          <div style={{ fontFamily: 'monospace', fontSize: '1.5rem', fontWeight: 700, color: '#F0D897', letterSpacing: '0.1em' }}>
            {ref}
          </div>
        </div>

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
