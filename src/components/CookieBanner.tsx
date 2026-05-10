'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { hasConsented, acceptAll, rejectAll } from '@/lib/consent';
import CookieModal from './CookieModal';

export default function CookieBanner() {
  const [show, setShow] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    setShow(!hasConsented());

    const onConsentChanged = () => setShow(!hasConsented());
    const onOpenModal = () => setShowModal(true);

    window.addEventListener('consent-changed', onConsentChanged);
    window.addEventListener('open-cookie-modal', onOpenModal);
    return () => {
      window.removeEventListener('consent-changed', onConsentChanged);
      window.removeEventListener('open-cookie-modal', onOpenModal);
    };
  }, []);

  const handleAccept = () => { acceptAll(); setShow(false); };
  const handleReject = () => { rejectAll(); setShow(false); };
  const handleSaved = () => { setShowModal(false); setShow(false); };

  return (
    <>
      <style>{`
        @keyframes cookieBannerIn {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {show && !showModal && (
        <div
          role="dialog"
          aria-label="Gestion des cookies"
          style={{
            position: 'fixed', bottom: 24, left: 24, zIndex: 9999,
            width: 380, maxWidth: 'calc(100vw - 32px)',
            background: '#FFFFFF', borderRadius: 16,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            padding: 24,
            fontFamily: 'var(--font-manrope, sans-serif)',
            animation: 'cookieBannerIn 0.3s ease both',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 16 }}>
            <span style={{ fontSize: 22, lineHeight: 1, flexShrink: 0 }}>🍪</span>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#1A1209', lineHeight: 1.65 }}>
              SAFARUMA utilise des cookies pour mesurer l&apos;audience du site et améliorer votre expérience. Acceptez-vous ?{' '}
              <Link href="/cookies" style={{ color: '#C9A84C', textDecoration: 'underline', fontSize: 'inherit' }}>
                En savoir plus.
              </Link>
            </p>
          </div>

          <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
            <button
              onClick={handleReject}
              style={{
                flex: 1, background: '#1A1209', color: '#FFFFFF',
                border: 'none', borderRadius: 8, padding: '10px 12px',
                fontSize: '0.82rem', fontWeight: 500, cursor: 'pointer',
                fontFamily: 'var(--font-manrope, sans-serif)',
              }}
            >
              Refuser
            </button>
            <button
              onClick={handleAccept}
              style={{
                flex: 1, background: '#C9A84C', color: '#FFFFFF',
                border: 'none', borderRadius: 8, padding: '10px 12px',
                fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
                fontFamily: 'var(--font-manrope, sans-serif)',
              }}
            >
              Accepter
            </button>
          </div>

          <div style={{ textAlign: 'center' }}>
            <button
              onClick={() => setShowModal(true)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: '0.78rem', color: '#6B7280',
                fontFamily: 'var(--font-manrope, sans-serif)',
                textDecoration: 'underline', padding: 0,
              }}
            >
              Personnaliser
            </button>
          </div>
        </div>
      )}

      <CookieModal open={showModal} onClose={() => setShowModal(false)} onSaved={handleSaved} />
    </>
  );
}
