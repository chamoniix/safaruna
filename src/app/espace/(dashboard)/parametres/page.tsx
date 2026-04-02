'use client';

import { useState } from 'react';

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
  const [saved, setSaved] = useState(false);

  const toggleN = (k: keyof typeof notifs) => setNotifs(p => ({ ...p, [k]: !p[k] }));
  const toggleA = (k: keyof typeof access) => setAccess(p => ({ ...p, [k]: !p[k] }));
  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

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
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <input style={{ ...inputBase, flex: 1, background: '#F5F2EC', color: '#7A6D5A', cursor: 'not-allowed' }} type="email" defaultValue="karim.lamrani@example.com" disabled />
              <button style={editBtn}>Modifier</button>
            </div>
          </div>
          <div>
            <label style={fieldLabel}>Mot de passe</label>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <input style={{ ...inputBase, flex: 1, background: '#F5F2EC', color: '#7A6D5A', cursor: 'not-allowed', letterSpacing: '0.15em' }} type="password" defaultValue="••••••••••" disabled />
              <button style={editBtn}>Changer</button>
            </div>
          </div>
          <div>
            <label style={fieldLabel}>Numéro WhatsApp</label>
            <input style={inputBase} type="tel" defaultValue="+33 6 12 34 56 78" />
          </div>
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
            <label style={fieldLabel}>Langue d'interface</label>
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
          Conformément au RGPD, vous pouvez télécharger l'intégralité de vos données ou supprimer définitivement votre compte.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
          <button style={outlineBtn}>Télécharger mes données</button>
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
      </div>

      {/* Footer save */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', paddingBottom: '2rem' }}>
        <button style={{ ...saveBtn, background: saved ? '#1D5C3A' : '#1A1209' }} onClick={handleSave}>
          {saved ? '✓ Enregistré' : 'Enregistrer les modifications'}
        </button>
      </div>

    </div>
  );
}
