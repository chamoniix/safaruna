'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

type ProfilData = {
  id: string;
  name: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  country: string | null;
  phoneWhatsapp: string | null;
  createdAt: string;
};

const card: React.CSSProperties = { background: 'white', border: '1px solid #E8DFC8', borderRadius: 16, padding: '1.75rem 2rem', marginBottom: '1.25rem' };
const cardTitle: React.CSSProperties = { fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.3rem', fontWeight: 700, color: '#1A1209', marginBottom: '1.25rem', paddingBottom: '0.85rem', borderBottom: '1px solid #F0EBD8' };
const fieldLabel: React.CSSProperties = { display: 'block', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#C9A84C', marginBottom: '0.45rem' };
const inputBase: React.CSSProperties = { width: '100%', padding: '0.75rem 1rem', border: '1.5px solid #E8DFC8', borderRadius: 10, fontFamily: 'var(--font-manrope, sans-serif)', fontSize: '0.875rem', color: '#1A1209', background: '#FDFBF7', outline: 'none', boxSizing: 'border-box' };
const rowStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', padding: '0.85rem 0' };
const rowLabel: React.CSSProperties = { fontSize: '0.875rem', fontWeight: 600, color: '#1A1209' };
const rowSub: React.CSSProperties = { fontSize: '0.72rem', color: '#7A6D5A', marginTop: 2 };
const editBtn: React.CSSProperties = { padding: '0.4rem 1rem', borderRadius: 50, border: '1.5px solid #1A1209', background: 'none', fontSize: '0.72rem', fontWeight: 700, color: '#1A1209', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 };
const saveBtn: React.CSSProperties = { padding: '0.85rem 2.5rem', borderRadius: 50, border: 'none', background: '#1A1209', color: '#F0D897', fontSize: '0.875rem', fontWeight: 700, letterSpacing: '0.04em', cursor: 'pointer', fontFamily: 'var(--font-manrope, sans-serif)' };
const dangerBtn: React.CSSProperties = { padding: '0.65rem 1.5rem', borderRadius: 50, border: 'none', background: '#DC2626', color: 'white', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' };
const outlineBtn: React.CSSProperties = { padding: '0.65rem 1.5rem', borderRadius: 50, border: '1.5px solid #E8DFC8', background: 'none', fontSize: '0.78rem', fontWeight: 600, color: '#1A1209', cursor: 'pointer' };

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      role="switch"
      aria-checked={checked}
      style={{ width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer', background: checked ? '#C9A84C' : '#E8DFC8', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}
    >
      <span style={{ position: 'absolute', top: 3, left: checked ? 23 : 3, width: 18, height: 18, borderRadius: '50%', background: 'white', transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.15)' }} />
    </button>
  );
}

export default function ParametresPage() {
  const [notifs, setNotifs] = useState({ confirm: true, rappel: true, messages: true, newsletter: false, promo: false });
  const [access, setAccess] = useState({ pmr: false, contrast: false });
  const [langue, setLangue] = useState('fr');
  const [timezone, setTimezone] = useState('Europe/Paris');
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [profile, setProfile] = useState<ProfilData | null>(null);
  const [phoneWhatsapp, setPhoneWhatsapp] = useState('');
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState('');
  const [phoneStatus, setPhoneStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [phoneError, setPhoneError] = useState('');
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState('');

  const loadProfile = async () => {
    setProfileLoading(true);
    setProfileError('');

    try {
      const response = await fetch('/api/espace/profil');
      const payload = await response.json() as ProfilData | { error?: string };
      if (!response.ok) {
        throw new Error('error' in payload && payload.error ? payload.error : 'Impossible de charger votre compte.');
      }

      const loadedProfile = payload as ProfilData;
      setProfile(loadedProfile);
      setPhoneWhatsapp(loadedProfile.phoneWhatsapp ?? '');
    } catch (error) {
      setProfileError(error instanceof Error ? error.message : 'Impossible de charger votre compte.');
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    void loadProfile();
  }, []);

  // Load newsletter preference from server
  useEffect(() => {
    fetch('/api/newsletter/preference')
      .then(r => r.ok ? r.json() : null)
      .then((data: { newsletterOptIn?: boolean } | null) => {
        if (data && typeof data.newsletterOptIn === 'boolean') {
          setNotifs(p => ({ ...p, newsletter: data.newsletterOptIn as boolean }));
        }
      })
      .catch(() => {/* ignore */});
  }, []);

  const toggleN = (k: keyof typeof notifs) => {
    const newValue = !notifs[k];
    setNotifs(p => ({ ...p, [k]: newValue }));
    if (k === 'newsletter') {
      fetch('/api/newsletter/preference', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newsletterOptIn: newValue }),
      }).catch(() => {/* ignore */});
    }
  };
  const toggleA = (k: keyof typeof access) => setAccess(p => ({ ...p, [k]: !p[k] }));

  const handleSavePhone = async () => {
    setPhoneStatus('saving');
    setPhoneError('');

    try {
      const response = await fetch('/api/espace/profil', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneWhatsapp: phoneWhatsapp.trim() }),
      });
      const payload = await response.json() as ProfilData | { error?: string };
      if (!response.ok) {
        throw new Error('error' in payload && payload.error ? payload.error : 'Impossible d’enregistrer le numéro.');
      }

      const updatedProfile = payload as ProfilData;
      setProfile(updatedProfile);
      setPhoneWhatsapp(updatedProfile.phoneWhatsapp ?? '');
      setPhoneStatus('saved');
      window.setTimeout(() => setPhoneStatus('idle'), 2000);
    } catch (error) {
      setPhoneStatus('idle');
      setPhoneError(error instanceof Error ? error.message : 'Impossible d’enregistrer le numéro.');
    }
  };

  const handleExport = async () => {
    setExporting(true);
    setExportError('');

    try {
      const response = await fetch('/api/espace/export');
      if (!response.ok) {
        const payload = await response.json().catch(() => null) as { error?: string } | null;
        throw new Error(payload?.error || 'Impossible de préparer votre export.');
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const disposition = response.headers.get('Content-Disposition');
      const fileName = disposition?.match(/filename="([^"]+)"/)?.[1]
        || `safaruma-donnees-pelerin-${new Date().toISOString().slice(0, 10)}.json`;
      const anchor = document.createElement('a');
      anchor.href = objectUrl;
      anchor.download = fileName;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(objectUrl);
    } catch (error) {
      setExportError(error instanceof Error ? error.message : 'Impossible de préparer votre export.');
    } finally {
      setExporting(false);
    }
  };

  const selectStyle: React.CSSProperties = {
    ...inputBase,
    appearance: 'none',
    WebkitAppearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%237A6D5A' fill='none' stroke-width='1.5'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 1rem center',
    paddingRight: '2.5rem',
    cursor: 'pointer',
  };

  return (
    <div style={{ maxWidth: 720, fontFamily: 'var(--font-manrope, sans-serif)' }}>

      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: 'clamp(1.75rem, 3vw, 2.25rem)', fontWeight: 700, color: '#1A1209', marginBottom: '0.35rem' }}>
          Paramètres
        </h1>
        <p style={{ fontSize: '0.875rem', color: '#7A6D5A' }}>Gérez votre compte, vos notifications et vos préférences.</p>
      </div>

      {/* Mon compte */}
      <div style={card}>
        <div style={cardTitle}>Mon compte</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          <div>
            <label style={fieldLabel}>Adresse email</label>
            <input style={{ ...inputBase, background: '#F5F2EC', color: '#7A6D5A', cursor: 'not-allowed' }} type="email" value={profile?.email ?? ''} disabled />
            <div style={{ ...rowSub, marginTop: '0.45rem' }}>
              La modification de l’adresse de connexion n’est pas encore disponible.
            </div>
          </div>
          <div>
            <label style={fieldLabel}>Mot de passe</label>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <input style={{ ...inputBase, flex: 1, background: '#F5F2EC', color: '#7A6D5A', cursor: 'not-allowed', letterSpacing: '0.15em' }} type="password" defaultValue="••••••••••" disabled />
              <Link href="/mot-de-passe-oublie" style={{ ...editBtn, textDecoration: 'none' }}>Réinitialiser</Link>
            </div>
          </div>
          <div>
            <label style={fieldLabel}>Numéro WhatsApp</label>
            <input
              style={inputBase}
              type="tel"
              value={phoneWhatsapp}
              onChange={event => {
                setPhoneWhatsapp(event.target.value);
                setPhoneStatus('idle');
                setPhoneError('');
              }}
              disabled={profileLoading || Boolean(profileError)}
              placeholder="Votre numéro WhatsApp"
            />
          </div>
          {profileLoading && <div style={rowSub}>Chargement de votre compte…</div>}
          {profileError && (
            <div style={{ fontSize: '0.78rem', color: '#DC2626' }} role="alert">
              {profileError}{' '}
              <button type="button" onClick={() => void loadProfile()} style={{ border: 'none', background: 'none', padding: 0, color: '#DC2626', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}>
                Réessayer
              </button>
            </div>
          )}
          {phoneError && <div style={{ fontSize: '0.78rem', color: '#DC2626' }} role="alert">{phoneError}</div>}
        </div>
      </div>

      {/* Notifications */}
      <div style={card}>
        <div style={cardTitle}>Notifications</div>
        {([
          { k: 'confirm',    label: 'Emails de confirmation de réservation', sub: 'Reçu à chaque nouvelle réservation confirmée' },
          { k: 'rappel',     label: 'Rappels avant le départ',               sub: 'J−7 et J−1 avant votre Omra' },
          { k: 'messages',   label: 'Messages des guides',                   sub: 'Notifications quand un guide vous écrit' },
          { k: 'newsletter', label: 'Newsletter SAFARUMA',                   sub: 'Actualités, conseils spirituels, nouveautés' },
          { k: 'promo',      label: 'Offres et promotions',                  sub: 'Réductions et offres spéciales' },
        ] as Array<{ k: keyof typeof notifs; label: string; sub: string }>).map(({ k, label, sub }, i, arr) => (
          <div key={k} style={{ ...rowStyle, borderBottom: i < arr.length - 1 ? '1px solid #F5F2EC' : 'none' }}>
            <div>
              <div style={rowLabel}>{label}</div>
              <div style={rowSub}>{sub}</div>
            </div>
            <Toggle checked={notifs[k]} onChange={() => toggleN(k)} />
          </div>
        ))}
      </div>

      {/* Langue et région */}
      <div style={card}>
        <div style={cardTitle}>Langue et région</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          <div>
            <label style={fieldLabel}>Langue d’interface</label>
            <select style={selectStyle} value={langue} onChange={e => setLangue(e.target.value)}>
              <option value="fr">🇫🇷 Français</option>
              <option value="en">🇬🇧 English</option>
              <option value="ar">🇸🇦 العربية</option>
            </select>
          </div>
          <div>
            <label style={fieldLabel}>Fuseau horaire</label>
            <select style={selectStyle} value={timezone} onChange={e => setTimezone(e.target.value)}>
              <option value="Europe/Paris">Europe/Paris (UTC+1)</option>
              <option value="Africa/Casablanca">Africa/Casablanca (UTC+1)</option>
              <option value="Asia/Riyadh">Asia/Riyadh (UTC+3)</option>
              <option value="America/Montreal">America/Montréal (UTC−5)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Accessibilité */}
      <div style={card}>
        <div style={cardTitle}>Accessibilité</div>
        {([
          { k: 'pmr',      label: 'Mobilité réduite (PMR)',  sub: 'Filtre les guides et services adaptés PMR' },
          { k: 'contrast', label: 'Mode contraste élevé',    sub: 'Améliore la lisibilité pour les malvoyants' },
        ] as Array<{ k: keyof typeof access; label: string; sub: string }>).map(({ k, label, sub }, i, arr) => (
          <div key={k} style={{ ...rowStyle, borderBottom: i < arr.length - 1 ? '1px solid #F5F2EC' : 'none' }}>
            <div>
              <div style={rowLabel}>{label}</div>
              <div style={rowSub}>{sub}</div>
            </div>
            <Toggle checked={access[k]} onChange={() => toggleA(k)} />
          </div>
        ))}
      </div>

      {/* Données & confidentialité */}
      <div style={card}>
        <div style={cardTitle}>Données et confidentialité</div>
        <p style={{ fontSize: '0.82rem', color: '#7A6D5A', lineHeight: 1.65, marginBottom: '1.25rem' }}>
          Conformément au RGPD, vous pouvez télécharger l’intégralité de vos données ou supprimer définitivement votre compte.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
          <button type="button" style={{ ...outlineBtn, opacity: exporting ? 0.65 : 1, cursor: exporting ? 'wait' : 'pointer' }} onClick={() => void handleExport()} disabled={exporting}>
            {exporting ? 'Préparation de l’export…' : 'Télécharger mes données'}
          </button>
          {!deleteConfirm ? (
            <button style={dangerBtn} onClick={() => setDeleteConfirm(true)}>Supprimer mon compte</button>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '0.65rem 1rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.78rem', color: '#DC2626', fontWeight: 600 }}>Confirmer la suppression ?</span>
              <button style={{ ...dangerBtn, padding: '0.35rem 0.85rem', fontSize: '0.72rem' }}>Oui, supprimer</button>
              <button style={{ ...outlineBtn, padding: '0.35rem 0.85rem', fontSize: '0.72rem' }} onClick={() => setDeleteConfirm(false)}>Annuler</button>
            </div>
          )}
        </div>
        {exportError && <div style={{ fontSize: '0.78rem', color: '#DC2626', marginTop: '0.75rem' }} role="alert">{exportError}</div>}
      </div>

      {/* Footer save */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', paddingBottom: '2rem' }}>
        <button
          type="button"
          style={{ ...saveBtn, background: phoneStatus === 'saved' ? '#1D5C3A' : phoneStatus === 'saving' ? '#7A6D5A' : '#1A1209', cursor: phoneStatus === 'saving' || profileLoading || Boolean(profileError) ? 'wait' : 'pointer' }}
          onClick={() => void handleSavePhone()}
          disabled={phoneStatus === 'saving' || profileLoading || Boolean(profileError)}
        >
          {phoneStatus === 'saved' ? '✓ Numéro enregistré' : phoneStatus === 'saving' ? 'Enregistrement…' : 'Enregistrer le numéro'}
        </button>
      </div>

    </div>
  );
}
