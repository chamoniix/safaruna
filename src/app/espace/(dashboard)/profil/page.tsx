'use client';

import { useState, useEffect } from 'react';

type ProfilData = {
  id: string; name: string; email: string;
  firstName: string | null; lastName: string | null;
  country: string | null; phoneWhatsapp: string | null; createdAt: string;
};

const card: React.CSSProperties = { background: 'white', border: '1px solid #E8DFC8', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' };
const inputStyle: React.CSSProperties = { width: '100%', padding: '0.65rem 0.875rem', border: '1.5px solid #E8DFC8', borderRadius: 8, fontSize: '0.88rem', color: '#1A1209', fontFamily: 'var(--font-manrope, sans-serif)', outline: 'none', background: '#FDFBF7', boxSizing: 'border-box' };
const labelStyle: React.CSSProperties = { display: 'block', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#7A6D5A', marginBottom: '0.4rem' };

export default function EspaceProfil() {
  const [data, setData]           = useState<ProfilData | null>(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [saving, setSaving]       = useState(false);
  const [success, setSuccess]     = useState('');
  const [saveError, setSaveError] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName,  setLastName]  = useState('');
  const [country,   setCountry]   = useState('');
  const [phoneWhatsapp, setPhoneWhatsapp] = useState('');

  useEffect(() => {
    setLoading(true); setError('');
    fetch('/api/espace/profil')
      .then(r => { if (!r.ok) throw new Error('Erreur ' + r.status); return r.json(); })
      .then((d: ProfilData) => { setData(d); setFirstName(d.firstName || ''); setLastName(d.lastName || ''); setCountry(d.country || ''); setPhoneWhatsapp(d.phoneWhatsapp || ''); setLoading(false); })
      .catch((e: Error) => { setError(e.message); setLoading(false); });
  }, []);

  const handleSave = async () => {
    setSaving(true); setSaveError(''); setSuccess('');
    try {
      const res = await fetch('/api/espace/profil', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ firstName, lastName, country, phoneWhatsapp }) });
      if (!res.ok) throw new Error('Erreur lors de la sauvegarde');
      const updated: ProfilData = await res.json();
      setData(prev => prev ? { ...prev, ...updated } : updated);
      setSuccess('Profil mis à jour avec succès.');
    } catch (e: any) { setSaveError(e.message); }
    setSaving(false);
  };

  const initials = data?.name ? data.name.slice(0, 2).toUpperCase() : '??';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', fontFamily: 'var(--font-manrope, sans-serif)', maxWidth: 640 }}>
      {error && <div style={{ background: '#FEE2E2', border: '1px solid #FCA5A5', borderRadius: 8, padding: '0.75rem 1rem', fontSize: '0.83rem', color: '#DC2626' }}>{error}</div>}

      {loading ? <div style={{ ...card, height: 110, background: '#F0EDE8' }} /> : data ? (
        <div style={{ ...card, padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'linear-gradient(135deg, #F0D897, #C9A84C)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.5rem', fontWeight: 700, color: '#1A1209' }}>{initials}</div>
          <div>
            <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1A1209', marginBottom: '0.2rem' }}>{data.name}</div>
            <div style={{ fontSize: '0.82rem', color: '#7A6D5A', marginBottom: '0.2rem' }}>{data.email}</div>
            <div style={{ fontSize: '0.72rem', color: '#9A8A7A' }}>Membre depuis le {data.createdAt}</div>
          </div>
        </div>
      ) : null}

      <div style={{ ...card, padding: '1.5rem' }}>
        <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#7A6D5A', marginBottom: '1.25rem', paddingBottom: '0.875rem', borderBottom: '1px solid #F0EBD8' }}>Informations personnelles</div>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {Array.from({ length: 4 }).map((_, i) => <div key={i} style={{ height: 44, background: '#F0EDE8', borderRadius: 8 }} />)}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
              <div><label style={labelStyle}>Prénom</label><input value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Prénom" style={inputStyle} /></div>
              <div><label style={labelStyle}>Nom</label><input value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Nom" style={inputStyle} /></div>
            </div>
            <div><label style={labelStyle}>Pays</label><input value={country} onChange={e => setCountry(e.target.value)} placeholder="France, Maroc, Sénégal…" style={inputStyle} /></div>
            <div><label style={labelStyle}>Téléphone WhatsApp</label><input value={phoneWhatsapp} onChange={e => setPhoneWhatsapp(e.target.value)} placeholder="+33 6 00 00 00 00" style={inputStyle} /></div>
            {saveError && <div style={{ fontSize: '0.78rem', color: '#DC2626' }}>{saveError}</div>}
            {success   && <div style={{ fontSize: '0.78rem', color: '#1D5C3A', fontWeight: 600 }}>✓ {success}</div>}
            <button onClick={handleSave} disabled={saving} style={{ alignSelf: 'flex-start', padding: '0.65rem 1.5rem', background: saving ? '#7A6D5A' : '#1A1209', color: '#F0D897', border: 'none', borderRadius: 50, fontSize: '0.85rem', fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
              {saving ? 'Sauvegarde…' : 'Sauvegarder'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
