'use client';

import { useState } from 'react';

const card: React.CSSProperties = {
  background: '#FFFFFF', borderRadius: 12, padding: '1.5rem',
  boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #E8DFC8',
};

const input: React.CSSProperties = {
  width: '100%', padding: '0.75rem 1rem', boxSizing: 'border-box',
  background: '#F8F6F2', border: '1.5px solid #E8DFC8', borderRadius: 8,
  color: '#1A1209', fontSize: '0.875rem', fontFamily: 'inherit', outline: 'none',
};

const label: React.CSSProperties = {
  display: 'block', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em',
  textTransform: 'uppercase', color: '#7A6D5A', marginBottom: '0.4rem',
};

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!value)} style={{
      width: 44, height: 24, borderRadius: 12, border: 'none', flexShrink: 0,
      background: value ? '#1A1209' : '#E8DFC8', cursor: 'pointer', position: 'relative',
    }}>
      <div style={{
        position: 'absolute', top: 4, width: 16, height: 16, borderRadius: '50%',
        background: value ? '#F0D897' : '#FFFFFF', transition: 'left 0.2s', left: value ? 24 : 4,
      }} />
    </button>
  );
}

export default function AdminParametres() {
  const [email, setEmail]           = useState('admin@safaruma.com');
  const [password, setPassword]     = useState('');
  const [confirm, setConfirm]       = useState('');
  const [commission, setCommission] = useState('10');
  const [maintenance, setMaintenance]       = useState(false);
  const [newRegistrations, setNewReg]       = useState(true);
  const [emailNotifs, setEmailNotifs]       = useState(true);

  return (
    <div style={{ maxWidth: 600, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* Identifiants */}
      <div style={card}>
        <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.1rem', fontWeight: 700, color: '#1A1209', marginBottom: '1.25rem' }}>
          Identifiants administrateur
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <span style={label}>Email admin</span>
            <input value={email} onChange={e => setEmail(e.target.value)} type="email" style={input} />
          </div>
          <div>
            <span style={label}>Nouveau mot de passe</span>
            <input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="Laisser vide pour ne pas changer" style={input} />
          </div>
          <div>
            <span style={label}>Confirmer le mot de passe</span>
            <input value={confirm} onChange={e => setConfirm(e.target.value)} type="password" placeholder="••••••••" style={input} />
          </div>
          <div>
            <button style={{ padding: '0.65rem 1.5rem', borderRadius: 50, border: 'none', background: '#1A1209', color: '#F0D897', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
              Enregistrer
            </button>
          </div>
        </div>
      </div>

      {/* Commission */}
      <div style={card}>
        <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.1rem', fontWeight: 700, color: '#1A1209', marginBottom: '1rem' }}>
          Taux de commission
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <input
            value={commission} onChange={e => setCommission(e.target.value)} type="number" min="0" max="100"
            style={{ ...input, width: 90, textAlign: 'center', fontSize: '1.2rem', fontWeight: 700 }}
          />
          <span style={{ fontSize: '1.4rem', color: '#7A6D5A', fontWeight: 300 }}>%</span>
          <span style={{ fontSize: '0.78rem', color: '#7A6D5A', lineHeight: 1.5 }}>
            Prélevé par SAFARUMA<br/>sur chaque réservation
          </span>
        </div>
        <button style={{ padding: '0.65rem 1.5rem', borderRadius: 50, border: 'none', background: '#1A1209', color: '#F0D897', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
          Mettre à jour
        </button>
      </div>

      {/* Plateforme */}
      <div style={card}>
        <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.1rem', fontWeight: 700, color: '#1A1209', marginBottom: '1.25rem' }}>
          Paramètres plateforme
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          {[
            { label: 'Mode maintenance',       desc: "Désactive l'accès public",        value: maintenance,    onChange: setMaintenance },
            { label: 'Nouvelles inscriptions', desc: 'Autorise les inscriptions guides', value: newRegistrations, onChange: setNewReg },
            { label: 'Notifications email',    desc: 'Alertes admin par email',          value: emailNotifs,    onChange: setEmailNotifs },
          ].map(s => (
            <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#1A1209' }}>{s.label}</div>
                <div style={{ fontSize: '0.72rem', color: '#7A6D5A', marginTop: 2 }}>{s.desc}</div>
              </div>
              <Toggle value={s.value} onChange={s.onChange} />
            </div>
          ))}
        </div>
      </div>

      {/* Danger zone */}
      <div style={{ ...card, background: '#FFF8F6', border: '1px solid #FECACA' }}>
        <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.1rem', fontWeight: 700, color: '#DC2626', marginBottom: '0.5rem' }}>
          Zone dangereuse
        </div>
        <div style={{ fontSize: '0.78rem', color: '#7A6D5A', marginBottom: '1rem' }}>
          Ces actions sont irréversibles. Procédez avec précaution.
        </div>
        <button style={{ padding: '0.65rem 1.25rem', borderRadius: 50, border: '1px solid #FCA5A5', background: 'transparent', color: '#DC2626', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
          Purger les sessions expirées
        </button>
      </div>

    </div>
  );
}
