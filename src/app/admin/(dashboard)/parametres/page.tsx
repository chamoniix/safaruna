'use client';

import { useState } from 'react';

export default function AdminParametres() {
  const [email, setEmail] = useState('admin@safaruma.com');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [commission, setCommission] = useState('10');
  const [maintenance, setMaintenance] = useState(false);
  const [newRegistrations, setNewRegistrations] = useState(true);
  const [emailNotifs, setEmailNotifs] = useState(true);

  const Toggle = ({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) => (
    <button
      onClick={() => onChange(!value)}
      style={{
        width: 44, height: 24, borderRadius: 12, border: 'none',
        background: value ? '#C9A84C' : 'rgba(255,255,255,0.15)',
        cursor: 'pointer', position: 'relative', flexShrink: 0, transition: 'background 0.2s',
      }}
    >
      <div style={{
        position: 'absolute', top: 4, width: 16, height: 16, borderRadius: '50%', background: 'white',
        transition: 'left 0.2s', left: value ? 24 : 4,
      }} />
    </button>
  );

  return (
    <div style={{ maxWidth: 600, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* Identifiants admin */}
      <div style={{ background: '#1A1209', border: '1px solid rgba(201,168,76,0.15)', borderRadius: 16, padding: '1.5rem' }}>
        <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#C9A84C', marginBottom: '1.25rem' }}>
          Identifiants administrateur
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: '0.4rem' }}>
              Email admin
            </label>
            <input
              value={email} onChange={e => setEmail(e.target.value)} type="email"
              style={{
                width: '100%', padding: '0.75rem 1rem', boxSizing: 'border-box',
                background: 'rgba(255,255,255,0.06)', border: '1.5px solid rgba(255,255,255,0.1)',
                borderRadius: 8, color: 'white', fontSize: '0.875rem', fontFamily: 'inherit', outline: 'none',
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: '0.4rem' }}>
              Nouveau mot de passe
            </label>
            <input
              value={password} onChange={e => setPassword(e.target.value)} type="password"
              placeholder="Laisser vide pour ne pas changer"
              style={{
                width: '100%', padding: '0.75rem 1rem', boxSizing: 'border-box',
                background: 'rgba(255,255,255,0.06)', border: '1.5px solid rgba(255,255,255,0.1)',
                borderRadius: 8, color: 'white', fontSize: '0.875rem', fontFamily: 'inherit', outline: 'none',
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: '0.4rem' }}>
              Confirmer le mot de passe
            </label>
            <input
              value={confirm} onChange={e => setConfirm(e.target.value)} type="password"
              placeholder="••••••••"
              style={{
                width: '100%', padding: '0.75rem 1rem', boxSizing: 'border-box',
                background: 'rgba(255,255,255,0.06)', border: '1.5px solid rgba(255,255,255,0.1)',
                borderRadius: 8, color: 'white', fontSize: '0.875rem', fontFamily: 'inherit', outline: 'none',
              }}
            />
          </div>
          <button style={{
            alignSelf: 'flex-start', padding: '0.65rem 1.5rem', borderRadius: 8, border: 'none',
            background: '#C9A84C', color: '#1A1209',
            fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
          }}>
            Enregistrer les identifiants
          </button>
        </div>
      </div>

      {/* Commission */}
      <div style={{ background: '#1A1209', border: '1px solid rgba(201,168,76,0.15)', borderRadius: 16, padding: '1.5rem' }}>
        <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#C9A84C', marginBottom: '1.25rem' }}>
          Taux de commission
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <input
            value={commission} onChange={e => setCommission(e.target.value)} type="number" min="0" max="100"
            style={{
              width: 100, padding: '0.75rem 1rem',
              background: 'rgba(255,255,255,0.06)', border: '1.5px solid rgba(255,255,255,0.1)',
              borderRadius: 8, color: 'white', fontSize: '1rem', fontWeight: 700, fontFamily: 'inherit', outline: 'none',
              textAlign: 'center',
            }}
          />
          <span style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.5)' }}>%</span>
          <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)', lineHeight: 1.5 }}>
            Taux prélevé par SAFARUMA<br />sur chaque réservation finalisée
          </div>
        </div>
        <button style={{
          marginTop: '1rem', alignSelf: 'flex-start', padding: '0.65rem 1.5rem', borderRadius: 8, border: 'none',
          background: '#C9A84C', color: '#1A1209',
          fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
        }}>
          Mettre à jour
        </button>
      </div>

      {/* Plateforme */}
      <div style={{ background: '#1A1209', border: '1px solid rgba(201,168,76,0.15)', borderRadius: 16, padding: '1.5rem' }}>
        <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#C9A84C', marginBottom: '1.25rem' }}>
          Paramètres plateforme
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[
            { label: 'Mode maintenance', desc: 'Désactive l\'accès public à la plateforme', value: maintenance, onChange: setMaintenance },
            { label: 'Nouvelles inscriptions', desc: 'Autorise les nouveaux guides à s\'inscrire', value: newRegistrations, onChange: setNewRegistrations },
            { label: 'Notifications email', desc: 'Envoie des alertes admin par email', value: emailNotifs, onChange: setEmailNotifs },
          ].map(s => (
            <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'white', marginBottom: '0.15rem' }}>{s.label}</div>
                <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)' }}>{s.desc}</div>
              </div>
              <Toggle value={s.value} onChange={s.onChange} />
            </div>
          ))}
        </div>
      </div>

      {/* Danger zone */}
      <div style={{ background: '#1A0A08', border: '1px solid rgba(240,108,76,0.2)', borderRadius: 16, padding: '1.5rem' }}>
        <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#F06C4C', marginBottom: '1rem' }}>
          Zone dangereuse
        </div>
        <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', marginBottom: '1rem' }}>
          Ces actions sont irréversibles. Procédez avec précaution.
        </div>
        <button style={{
          padding: '0.65rem 1.25rem', borderRadius: 8,
          border: '1px solid rgba(240,108,76,0.3)', background: 'transparent', color: '#F06C4C',
          fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
        }}>
          Purger les sessions expirées
        </button>
      </div>

    </div>
  );
}
