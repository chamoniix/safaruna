'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

type ProfilData = {
  id: string; name: string; email: string;
  firstName: string | null; lastName: string | null;
  country: string | null; phoneWhatsapp: string | null;
  createdAt: string;
};

const card: React.CSSProperties = {
  background: 'white', border: '1px solid #E8DFC8',
  borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
};

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '0.65rem 0.875rem',
  border: '1.5px solid #E8DFC8', borderRadius: 8,
  fontSize: '0.85rem', color: '#1A1209',
  fontFamily: 'var(--font-manrope, sans-serif)',
  outline: 'none', background: '#FDFBF7', boxSizing: 'border-box',
};

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '0.65rem', fontWeight: 700,
  letterSpacing: '0.1em', textTransform: 'uppercase' as const,
  color: '#7A6D5A', marginBottom: '0.4rem',
};

function Skeleton({ w, h = 14 }: { w?: number | string; h?: number }) {
  return <div style={{ height: h, background: '#F0EDE8', borderRadius: 4, width: w ?? '100%' }} />;
}

export default function EspaceProfil() {
  const [data, setData]       = useState<ProfilData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName]   = useState('');
  const [country, setCountry]     = useState('');
  const [phoneWhatsapp, setPhone] = useState('');
  const [saving, setSaving]       = useState(false);
  const [saveMsg, setSaveMsg]     = useState<{ ok: boolean; text: string } | null>(null);

  const fetchData = () => {
    setLoading(true); setError('');
    fetch('/api/espace/profil')
      .then(r => { if (!r.ok) throw new Error('Erreur ' + r.status); return r.json(); })
      .then((d: ProfilData) => {
        setData(d);
        setFirstName(d.firstName ?? '');
        setLastName(d.lastName ?? '');
        setCountry(d.country ?? '');
        setPhone(d.phoneWhatsapp ?? '');
        setLoading(false);
      })
      .catch((e: Error) => { setError(e.message); setLoading(false); });
  };

  useEffect(() => { fetchData(); }, []);

  const handleSave = async () => {
    setSaving(true); setSaveMsg(null);
    try {
      const res = await fetch('/api/espace/profil', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: firstName || undefined,
          lastName: lastName || undefined,
          country: country || undefined,
          phoneWhatsapp: phoneWhatsapp || undefined,
        }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Erreur'); }
      setSaveMsg({ ok: true, text: '✓ Profil mis à jour' });
      fetchData();
    } catch (e: any) { setSaveMsg({ ok: false, text: e.message }); }
    setSaving(false);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', fontFamily: 'var(--font-manrope, sans-serif)' }}>
        <div style={{ ...card, padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ width: 60, height: 60, borderRadius: '50%', background: '#F0EDE8', flexShrink: 0 }} />
            <div style={{ flex: 1 }}><Skeleton w={180} h={20} /><div style={{ marginTop: '0.5rem' }}><Skeleton w={220} /></div></div>
          </div>
          <Skeleton w={160} />
        </div>
        <div style={{ ...card, padding: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i}><Skeleton w={80} /><div style={{ marginTop: '0.5rem' }}><Skeleton h={36} /></div></div>
            ))}
          </div>
          <Skeleton w={130} h={38} />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ background: '#FEE2E2', border: '1px solid #FCA5A5', borderRadius: 8, padding: '0.75rem 1rem', fontSize: '0.83rem', color: '#DC2626', fontFamily: 'var(--font-manrope, sans-serif)' }}>
        {error || 'Impossible de charger le profil.'}{' '}
        <button onClick={fetchData} style={{ color: '#DC2626', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Réessayer</button>
      </div>
    );
  }

  const initials = (
    (data.firstName?.[0] ?? data.name?.[0] ?? 'P').toUpperCase() +
    (data.lastName?.[0] ?? data.name?.[1] ?? '').toUpperCase()
  );

  const fullName = (data.firstName || data.lastName)
    ? `${data.firstName ?? ''} ${data.lastName ?? ''}`.trim()
    : data.name;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', fontFamily: 'var(--font-manrope, sans-serif)' }}>

      <div style={{ ...card, padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
        <div style={{
          width: 60, height: 60, borderRadius: '50%', background: '#C9A84C', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.5rem', fontWeight: 700, color: '#1A1209',
        }}>
          {initials}
        </div>
        <div>
          <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.3rem', fontWeight: 700, color: '#1A1209' }}>{fullName}</div>
          <div style={{ fontSize: '0.82rem', color: '#7A6D5A', marginTop: '0.2rem' }}>{data.email}</div>
          <div style={{ fontSize: '0.72rem', color: '#9A8A7A', marginTop: '0.2rem' }}>Membre depuis {data.createdAt}</div>
        </div>
      </div>

      <div style={{ ...card, padding: '1.5rem' }}>
        <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.3rem', fontWeight: 700, color: '#1A1209', marginBottom: '1.25rem' }}>
          Modifier mon profil
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <label style={labelStyle}>Prénom</label>
            <input style={inputStyle} type="text" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Votre prénom" />
          </div>
          <div>
            <label style={labelStyle}>Nom</label>
            <input style={inputStyle} type="text" value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Votre nom" />
          </div>
          <div>
            <label style={labelStyle}>Pays</label>
            <input style={inputStyle} type="text" value={country} onChange={e => setCountry(e.target.value)} placeholder="Ex : France" />
          </div>
          <div>
            <label style={labelStyle}>Téléphone WhatsApp</label>
            <input style={inputStyle} type="tel" value={phoneWhatsapp} onChange={e => setPhone(e.target.value)} placeholder="+33 6 00 00 00 00" />
          </div>
        </div>
        {saveMsg && (
          <div style={{ fontSize: '0.82rem', fontWeight: 600, color: saveMsg.ok ? '#1D5C3A' : '#DC2626', marginBottom: '0.875rem' }}>
            {saveMsg.text}
          </div>
        )}
        <button onClick={handleSave} disabled={saving} style={{ padding: '0.65rem 1.75rem', borderRadius: 50, border: 'none', background: saving ? '#E8DFC8' : '#1A1209', color: saving ? '#7A6D5A' : '#F0D897', fontSize: '0.82rem', fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
          {saving ? 'Enregistrement…' : 'Sauvegarder'}
        </button>
      </div>

      <div style={{ ...card, padding: '1.5rem' }}>
        <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.3rem', fontWeight: 700, color: '#1A1209', marginBottom: '0.875rem' }}>Sécurité</div>
        <div style={{ fontSize: '0.82rem', color: '#7A6D5A', lineHeight: 1.7, marginBottom: '1rem' }}>
          Pour changer votre mot de passe, utilisez la fonction Mot de passe oublié sur la page de connexion.
        </div>
        <Link href="/connexion" style={{ display: 'inline-block', padding: '0.55rem 1.25rem', borderRadius: 50, border: '1px solid #E8DFC8', background: 'transparent', color: '#7A6D5A', fontSize: '0.78rem', fontWeight: 600, textDecoration: 'none' }}>
          Aller à la connexion →
        </Link>
      </div>

    </div>
  );
}
