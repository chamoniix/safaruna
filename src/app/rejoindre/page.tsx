'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

function RejoindreContent() {
  const searchParams = useSearchParams();
  const ref = searchParams.get('ref') || '';

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: 520, width: '100%', textAlign: 'center' }}>

        {/* Badge parrainage */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#FAF3E0', border: '1px solid rgba(201,168,76,0.3)', color: '#8B6914', fontSize: '0.72rem', fontWeight: 700, padding: '0.4rem 1rem', borderRadius: 50, marginBottom: '1.5rem' }}>
          🎁 Offre de parrainage — Code <strong style={{ color: '#C9A84C' }}>{ref}</strong>
        </div>

        {/* Amount */}
        <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: 'clamp(3rem, 8vw, 5rem)', fontWeight: 700, color: '#1A1209', lineHeight: 1, marginBottom: '0.5rem' }}>
          80<span style={{ color: '#C9A84C' }}>€</span>
        </div>
        <div style={{ fontSize: '1rem', fontWeight: 700, color: '#1A1209', marginBottom: '0.5rem' }}>offerts sur votre première réservation</div>
        <p style={{ fontSize: '0.85rem', color: '#7A6D5A', lineHeight: 1.7, marginBottom: '2rem', maxWidth: 380, margin: '0 auto 2rem' }}>
          Un ami vous a invité à découvrir l&apos;Arabie Saoudite avec SAFARUMA. Créez votre compte et bénéficiez de 80€ de réduction automatiquement appliquée.
        </p>

        {/* CTA */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'center' }}>
          <Link href={`/inscription?ref=${ref}`} style={{ display: 'block', width: '100%', maxWidth: 340, padding: '0.9rem', background: '#1A1209', color: '#F0D897', borderRadius: 50, fontWeight: 800, fontSize: '0.95rem', textDecoration: 'none', textAlign: 'center', letterSpacing: '0.04em' }}>
            Créer mon compte et économiser 80€ →
          </Link>
          <Link href="/guides" style={{ fontSize: '0.8rem', color: '#7A6D5A', textDecoration: 'none', fontWeight: 500 }}>
            Découvrir les guides d&apos;abord →
          </Link>
        </div>

        {/* Trust */}
        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
          {['✓ Guides certifiés', '🛡️ Paiement sécurisé', '★ 4.96 · 709 avis'].map(t => (
            <span key={t} style={{ fontSize: '0.72rem', color: '#7A6D5A', fontWeight: 600 }}>{t}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function RejoинdrePage() {
  return (
    <>
      <Navbar />
      <div style={{ paddingTop: 58, background: '#FAF7F0', fontFamily: 'var(--font-manrope, sans-serif)' }}>
        <Suspense fallback={<div style={{ padding: '4rem', textAlign: 'center' }}>Chargement...</div>}>
          <RejoindreContent />
        </Suspense>
      </div>
      <Footer />
    </>
  );
}
