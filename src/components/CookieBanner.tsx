'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { hasConsented, acceptAll, rejectAll } from '@/lib/consent';
import CookieModal from './CookieModal';

export default function CookieBanner() {
  const [show, setShow] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const initialStateTimer = window.setTimeout(() => setShow(!hasConsented()), 0);
    const onConsentChanged = () => setShow(!hasConsented());
    const onOpenModal = () => setShowModal(true);

    window.addEventListener('consent-changed', onConsentChanged);
    window.addEventListener('open-cookie-modal', onOpenModal);
    return () => {
      window.clearTimeout(initialStateTimer);
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
        .cookie-banner {
          position: fixed;
          left: 24px;
          bottom: 24px;
          right: auto;
          z-index: 9999;
          width: 340px;
          max-width: calc(100vw - 32px);
          padding: 18px;
          border: 1px solid rgba(26,18,9,0.08);
          border-radius: 14px;
          background: #fff;
          box-shadow: 0 12px 42px rgba(0,0,0,0.16);
          font-family: var(--font-manrope, sans-serif);
          animation: cookieBannerIn 0.3s ease both;
        }
        .cookie-banner-copy {
          display: flex;
          align-items: flex-start;
          gap: 9px;
          margin-bottom: 12px;
        }
        .cookie-banner-copy span {
          font-size: 18px;
          line-height: 1;
          flex-shrink: 0;
        }
        .cookie-banner-copy p {
          margin: 0;
          color: #1A1209;
          font-size: 0.8rem;
          line-height: 1.52;
        }
        .cookie-banner-actions {
          display: flex;
          gap: 8px;
          margin-bottom: 8px;
        }
        .cookie-banner-actions button {
          flex: 1;
          border: none;
          border-radius: 8px;
          min-height: 38px;
          padding: 9px 12px;
          font-family: var(--font-manrope, sans-serif);
          font-size: 0.8rem;
          font-weight: 700;
          cursor: pointer;
        }
        .cookie-banner-reject {
          background: #1A1209;
          color: #fff;
        }
        .cookie-banner-accept {
          background: #C9A84C;
          color: #1A1209;
        }
        .cookie-banner-customize {
          background: none;
          border: none;
          cursor: pointer;
          color: #6B7280;
          font-family: var(--font-manrope, sans-serif);
          font-size: 0.73rem;
          text-decoration: underline;
          padding: 0;
        }
        @media (min-width: 641px) {
          .cookie-banner {
            left: auto;
            right: 96px;
          }
        }
        @media (max-width: 640px) {
          .cookie-banner {
            left: 10px;
            bottom: 72px;
            width: min(328px, calc(100vw - 76px));
            padding: 12px;
            border-radius: 12px;
          }
          .cookie-banner-copy {
            gap: 7px;
            margin-bottom: 9px;
          }
          .cookie-banner-copy span {
            font-size: 16px;
          }
          .cookie-banner-copy p {
            font-size: 0.72rem;
            line-height: 1.42;
          }
          .cookie-banner-actions button {
            min-height: 34px;
            padding: 7px 10px;
            font-size: 0.74rem;
          }
        }
      `}</style>

      {show && !showModal && (
        <div
          role="dialog"
          aria-label="Gestion des cookies"
          className="cookie-banner"
        >
          <div className="cookie-banner-copy">
            <span>🍪</span>
            <p>
              SAFARUMA utilise des cookies pour mesurer l&apos;audience du site et améliorer votre expérience. Acceptez-vous ?{' '}
              <Link href="/cookies" style={{ color: '#C9A84C', textDecoration: 'underline', fontSize: 'inherit' }}>
                En savoir plus.
              </Link>
            </p>
          </div>

          <div className="cookie-banner-actions">
            <button
              onClick={handleReject}
              className="cookie-banner-reject"
            >
              Refuser
            </button>
            <button
              onClick={handleAccept}
              className="cookie-banner-accept"
            >
              Accepter
            </button>
          </div>

          <div style={{ textAlign: 'center' }}>
            <button
              onClick={() => setShowModal(true)}
              className="cookie-banner-customize"
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
