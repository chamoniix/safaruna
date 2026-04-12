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
        <div style={{ marginBottom: '1.5rem' }}>
          <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Main gauche */}
            <path d="M14 38 L14 22 C14 20 15.5 18.5 17.5 18.5 C19.5 18.5 21 20 21 22 L21 30" stroke="#C9A84C" strokeWidth="2" strokeLinecap="round" fill="none"/>
            <path d="M21 26 L21 20 C21 18 22.5 16.5 24.5 16.5 C26.5 16.5 28 18 28 20 L28 26" stroke="#C9A84C" strokeWidth="2" strokeLinecap="round" fill="none"/>
            {/* Main droite */}
            <path d="M42 38 L42 22 C42 20 40.5 18.5 38.5 18.5 C36.5 18.5 35 20 35 22 L35 30" stroke="#C9A84C" strokeWidth="2" strokeLinecap="round" fill="none"/>
            <path d="M35 26 L35 20 C35 18 33.5 16.5 31.5 16.5 C29.5 16.5 28 18 28 20 L28 26" stroke="#C9A84C" strokeWidth="2" strokeLinecap="round" fill="none"/>
            {/* Paume */}
            <path d="M14 38 C14 42 17 45 21 45 L35 45 C39 45 42 42 42 38 L42 32 C42 30 40.5 29 39 29 L17 29 C15.5 29 14 30 14 32 Z" stroke="#C9A84C" strokeWidth="2" fill="rgba(201,168,76,0.08)"/>
            {/* Rayons de lumière */}
            <line x1="28" y1="8" x2="28" y2="14" stroke="#C9A84C" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="20" y1="10" x2="22" y2="15" stroke="#C9A84C" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="36" y1="10" x2="34" y2="15" stroke="#C9A84C" strokeWidth="1.5" strokeLinecap="round"/>
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
