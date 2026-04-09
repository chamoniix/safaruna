'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

type Profile = {
  id: string;
  name: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  phoneWhatsapp: string | null;
  country: string | null;
  slug: string | null;
  status: string;
  bio: string | null;
  city: string | null;
  nationality: string | null;
  experienceYears: number | null;
  languages: { id: string; languageCode: string; level: string }[];
  createdAt: string;
};

const LANG_LABELS: Record<string, string> = {
  fr: 'Français', ar: 'Arabe', en: 'Anglais', tr: 'Turc', ur: 'Ourdou',
  id: 'Indonésien', ms: 'Malais', de: 'Allemand', es: 'Espagnol',
};

const LEVEL_LABELS: Record<string, string> = {
  NATIVE: 'Natif', C2: 'C2', C1: 'C1', B2: 'B2', B1: 'B1',
};

const card: React.CSSProperties = {
  background: 'white',
  border: '1px solid #E8DFC8',
  borderRadius: 12,
  boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
};

const input: React.CSSProperties = {
  width: '100%',
  padding: '0.6rem 0.875rem',
  border: '1px solid #E8DFC8',
  borderRadius: 8,
  fontSize: '0.85rem',
  fontFamily: 'var(--font-manrope, sans-serif)',
  color: '#1A1209',
  background: 'white',
  boxSizing: 'border-box',
  outline: 'none',
};

const label: React.CSSProperties = {
  display: 'block',
  fontSize: '0.72rem',
  fontWeight: 700,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  color: '#7A6D5A',
  marginBottom: '0.35rem',
};

export default function GuideProfil() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [saveError, setSaveError] = useState('');

  // Editable fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneWhatsapp, setPhoneWhatsapp] = useState('');
  const [country, setCountry] = useState('');
  const [bio, setBio] = useState('');
  const [city, setCity] = useState('');
  const [nationality, setNationality] = useState('');
  const [experienceYears, setExperienceYears] = useState('');

  useEffect(() => {
    fetch('/api/guide/profil')
      .then(r => { if (!r.ok) throw new Error('Erreur ' + r.status); return r.json(); })
      .then(d => {
        const p: Profile = d.profile;
        setProfile(p);
        setFirstName(p.firstName || '');
        setLastName(p.lastName || '');
        setPhoneWhatsapp(p.phoneWhatsapp || '');
        setCountry(p.country || '');
        setBio(p.bio || '');
        setCity(p.city || '');
        setNationality(p.nationality || '');
        setExperienceYears(p.experienceYears?.toString() || '');
        setLoading(false);
      })
      .catch((e: Error) => { setError(e.message); setLoading(false); });
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaveError('');
    setSuccess('');
    try {
      const res = await fetch('/api/guide/profil', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, phoneWhatsapp, country, bio, city, nationality, experienceYears }),
      });
      if (!res.ok) throw new Error('Erreur lors de la sauvegarde');
      setSuccess('Profil mis à jour avec succès.');
      setProfile(p => p ? { ...p, firstName, lastName, name: `${firstName} ${lastName}`.trim() || p.name, phoneWhatsapp, country, bio, city, nationality, experienceYears: parseInt(experienceYears) || null } : p);
    } catch (e: unknown) {
      setSaveError(e instanceof Error ? e.message : 'Erreur inconnue');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ ...card, height: 100, background: '#F0EDE8' }} />
        <div style={{ ...card, height: 300, background: '#F0EDE8' }} />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div style={{ background: '#FEE2E2', border: '1px solid #FCA5A5', borderRadius: 8, padding: '0.75rem 1rem', fontSize: '0.83rem', color: '#DC2626', fontFamily: 'var(--font-manrope, sans-serif)' }}>
        {error || 'Impossible de charger le profil.'}{' '}
        <button onClick={() => window.location.reload()} style={{ color: '#DC2626', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Réessayer</button>
      </div>
    );
  }

  const displayName = `${firstName} ${lastName}`.trim() || profile.name;
  const initials = displayName.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() || 'G';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', fontFamily: 'var(--font-manrope, sans-serif)' }}>

      {/* Identity card */}
      <div style={{ ...card, padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, #F0D897, #C9A84C)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.5rem', fontWeight: 700, color: '#1A1209', flexShrink: 0 }}>
          {initials}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.5rem', fontWeight: 700, color: '#1A1209' }}>{displayName}</div>
          <div style={{ fontSize: '0.8rem', color: '#7A6D5A', marginTop: 2 }}>{profile.email}</div>
          <div style={{ fontSize: '0.72rem', color: '#9CA3AF', marginTop: 2 }}>Guide depuis {profile.createdAt}</div>
        </div>
        {profile.slug && (
          <Link href={`/guides/${profile.slug}`} target="_blank" style={{ fontSize: '0.75rem', fontWeight: 700, color: '#C9A84C', border: '1px solid #E8DFC8', padding: '0.4rem 1rem', borderRadius: 20, textDecoration: 'none', whiteSpace: 'nowrap' }}>
            Voir profil public ↗
          </Link>
        )}
      </div>

      {/* Edit form */}
      <form onSubmit={handleSave}>
        <div style={{ ...card, overflow: 'hidden' }}>
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #F0EBE0' }}>
            <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.2rem', fontWeight: 700, color: '#1A1209' }}>Informations personnelles</div>
          </div>
          <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <span style={label}>Prénom</span>
                <input style={input} value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Votre prénom" />
              </div>
              <div>
                <span style={label}>Nom</span>
                <input style={input} value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Votre nom" />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <span style={label}>WhatsApp</span>
                <input style={input} value={phoneWhatsapp} onChange={e => setPhoneWhatsapp(e.target.value)} placeholder="+212 6XX XXX XXX" />
              </div>
              <div>
                <span style={label}>Pays de résidence</span>
                <input style={input} value={country} onChange={e => setCountry(e.target.value)} placeholder="Maroc" />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <span style={label}>Ville</span>
                <input style={input} value={city} onChange={e => setCity(e.target.value)} placeholder="Médine, La Mecque…" />
              </div>
              <div>
                <span style={label}>Nationalité</span>
                <input style={input} value={nationality} onChange={e => setNationality(e.target.value)} placeholder="Marocain(e)" />
              </div>
            </div>

            <div>
              <span style={label}>Années d&apos;expérience</span>
              <input style={{ ...input, width: '50%' }} type="number" min="0" max="50" value={experienceYears} onChange={e => setExperienceYears(e.target.value)} placeholder="Ex : 5" />
            </div>

            <div>
              <span style={label}>Bio / Présentation</span>
              <textarea
                value={bio}
                onChange={e => setBio(e.target.value)}
                rows={4}
                placeholder="Présentez-vous aux pèlerins…"
                style={{ ...input, resize: 'vertical', lineHeight: 1.6 }}
              />
            </div>

            {success && (
              <div style={{ background: '#D1FAE5', border: '1px solid #6EE7B7', borderRadius: 8, padding: '0.6rem 1rem', fontSize: '0.82rem', color: '#1D5C3A' }}>{success}</div>
            )}
            {saveError && (
              <div style={{ background: '#FEE2E2', border: '1px solid #FCA5A5', borderRadius: 8, padding: '0.6rem 1rem', fontSize: '0.82rem', color: '#DC2626' }}>{saveError}</div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="submit"
                disabled={saving}
                style={{ padding: '0.65rem 2rem', borderRadius: 50, fontWeight: 700, fontSize: '0.85rem', background: saving ? '#E8DFC8' : '#1A1209', color: saving ? '#7A6D5A' : '#F0D897', border: 'none', cursor: saving ? 'not-allowed' : 'pointer' }}
              >
                {saving ? 'Sauvegarde…' : 'Sauvegarder'}
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Languages (read-only) */}
      {profile.languages.length > 0 && (
        <div style={{ ...card, overflow: 'hidden' }}>
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #F0EBE0' }}>
            <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.2rem', fontWeight: 700, color: '#1A1209' }}>Langues parlées</div>
            <div style={{ fontSize: '0.72rem', color: '#7A6D5A', marginTop: 2 }}>Contactez le support pour modifier vos langues</div>
          </div>
          <div style={{ padding: '1rem 1.25rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {profile.languages.map(l => (
              <span key={l.id} style={{ background: '#F5F2EC', border: '1px solid #E8DFC8', borderRadius: 20, padding: '0.3rem 0.875rem', fontSize: '0.78rem', fontWeight: 600, color: '#4A3F30' }}>
                {LANG_LABELS[l.languageCode] || l.languageCode} · {LEVEL_LABELS[l.level] || l.level}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Security */}
      <div style={{ ...card, padding: '1rem 1.25rem', background: '#F5F2EC' }}>
        <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.1rem', fontWeight: 700, color: '#1A1209', marginBottom: '0.5rem' }}>Sécurité</div>
        <div style={{ fontSize: '0.8rem', color: '#7A6D5A', marginBottom: '0.75rem' }}>Pour changer votre mot de passe, utilisez la page de connexion.</div>
        <Link href="/guide/connexion" style={{ fontSize: '0.78rem', fontWeight: 700, color: '#C9A84C', textDecoration: 'none', border: '1px solid #E8DFC8', padding: '0.4rem 1rem', borderRadius: 20, background: 'white', display: 'inline-block' }}>
          Modifier le mot de passe →
        </Link>
      </div>

    </div>
  );
}
