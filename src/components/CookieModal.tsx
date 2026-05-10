'use client';
import { useState, useEffect } from 'react';
import { getConsent, setConsent, rejectAll } from '@/lib/consent';

type Props = {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
};

function Toggle({ value, onChange, disabled }: { value: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button
      role="switch"
      aria-checked={value}
      disabled={disabled}
      onClick={() => !disabled && onChange(!value)}
      style={{
        width: 44, height: 24, borderRadius: 12, flexShrink: 0,
        background: value ? '#C9A84C' : '#D1D5DB',
        border: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
        position: 'relative', transition: 'background 0.2s',
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <span style={{
        position: 'absolute', top: 2,
        left: value ? 22 : 2,
        width: 20, height: 20, borderRadius: '50%',
        background: 'white', transition: 'left 0.2s',
        boxShadow: '0 1px 3px rgba(0,0,0,0.25)',
        display: 'block',
      }} />
    </button>
  );
}

const CATEGORIES = [
  {
    key: 'essential' as const,
    icon: '🛡️',
    title: 'Cookies essentiels',
    desc: 'Nécessaires au fonctionnement du site (session, paiement, sécurité). Ils ne peuvent pas être désactivés.',
    disabled: true,
  },
  {
    key: 'analytics' as const,
    icon: '📊',
    title: "Cookies de mesure d'audience",
    desc: "Nous aident à comprendre comment vous utilisez notre site (Google Analytics 4). Données agrégées et anonymes.",
    disabled: false,
  },
  {
    key: 'marketing' as const,
    icon: '🎯',
    title: 'Cookies marketing',
    desc: "Permettent de mesurer l'efficacité de nos campagnes publicitaires sur Meta, TikTok et Google. Aucun cookie marketing n'est actif aujourd'hui.",
    disabled: false,
  },
  {
    key: 'confort' as const,
    icon: '✨',
    title: 'Cookies de confort',
    desc: "Améliorent votre expérience en analysant votre navigation pour identifier les points de friction (Hotjar). Aucun cookie de confort n'est actif aujourd'hui.",
    disabled: false,
  },
];

export default function CookieModal({ open, onClose, onSaved }: Props) {
  const [choices, setChoices] = useState({ analytics: false, marketing: false, confort: false });

  useEffect(() => {
    if (open) {
      const c = getConsent();
      setChoices({
        analytics: c?.analytics ?? false,
        marketing: c?.marketing ?? false,
        confort: c?.confort ?? false,
      });
    }
  }, [open]);

  if (!open) return null;

  const handleSave = () => {
    setConsent(choices);
    onSaved();
  };

  const handleRejectAll = () => {
    rejectAll();
    onSaved();
  };

  const getValue = (key: keyof typeof choices | 'essential'): boolean =>
    key === 'essential' ? true : choices[key as keyof typeof choices];

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 10000,
        background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem', fontFamily: 'var(--font-manrope, sans-serif)',
      }}
    >
      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#FFFFFF', borderRadius: 16,
          width: '100%', maxWidth: 560,
          maxHeight: '90vh', overflowY: 'auto',
          animation: 'modalIn 0.25s ease both',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '1.5rem 1.5rem 1rem', borderBottom: '1px solid #F3F4F6',
          position: 'sticky', top: 0, background: '#FFFFFF', zIndex: 1,
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: '#1A1209' }}>
              Personnaliser vos cookies
            </h2>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: '#6B7280' }}>
              Choisissez les catégories que vous autorisez.
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Fermer"
            style={{
              background: '#F3F4F6', border: 'none', borderRadius: '50%',
              width: 32, height: 32, cursor: 'pointer', fontSize: '1rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}
          >✕</button>
        </div>

        {/* Categories */}
        <div style={{ padding: '1rem 1.5rem' }}>
          {CATEGORIES.map((cat) => (
            <div
              key={cat.key}
              style={{
                display: 'flex', alignItems: 'flex-start', gap: '1rem',
                padding: '1rem', marginBottom: '0.75rem',
                background: '#FAFAFA', borderRadius: 12,
                border: '1px solid #F3F4F6',
              }}
            >
              <span style={{ fontSize: '1.3rem', flexShrink: 0, marginTop: 2 }}>{cat.icon}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1A1209', marginBottom: '0.25rem' }}>
                  {cat.title}
                </div>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#6B7280', lineHeight: 1.6 }}>
                  {cat.desc}
                </p>
              </div>
              <div style={{ flexShrink: 0, marginTop: 4 }}>
                <Toggle
                  value={getValue(cat.key)}
                  disabled={cat.disabled}
                  onChange={(v) => {
                    if (!cat.disabled) {
                      setChoices((prev) => ({ ...prev, [cat.key]: v }));
                    }
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex', gap: '0.75rem', padding: '1rem 1.5rem 1.5rem',
          borderTop: '1px solid #F3F4F6',
          position: 'sticky', bottom: 0, background: '#FFFFFF',
        }}>
          <button
            onClick={handleRejectAll}
            style={{
              flex: 1, background: 'transparent', color: '#1A1209',
              border: '1.5px solid #E5E7EB', borderRadius: 8,
              padding: '10px 16px', fontSize: '0.85rem', fontWeight: 500,
              cursor: 'pointer', fontFamily: 'var(--font-manrope, sans-serif)',
            }}
          >Tout refuser</button>
          <button
            onClick={handleSave}
            style={{
              flex: 1, background: '#C9A84C', color: '#FFFFFF',
              border: 'none', borderRadius: 8,
              padding: '10px 16px', fontSize: '0.85rem', fontWeight: 600,
              cursor: 'pointer', fontFamily: 'var(--font-manrope, sans-serif)',
            }}
          >Enregistrer mes choix</button>
        </div>
      </div>
    </div>
  );
}
