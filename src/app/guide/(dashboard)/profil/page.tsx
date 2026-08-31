'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { GUIDE_LANGUAGES, LANG_CODE_TO_LABEL } from '@/lib/languages';

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
  gender: 'HOMME' | 'FEMME' | null;
  servesMakkah: boolean;
  servesMadinah: boolean;
  acceptingBookings: boolean;
  makkahNetUpTo6Cents: number;
  makkahNetUpTo15Cents: number;
  makkahNetUpTo32Cents: number;
  madinahNetUpTo6Cents: number;
  madinahNetUpTo15Cents: number;
  madinahNetUpTo32Cents: number;
  nationality: string | null;
  experienceYears: number | null;
  languages: { id: string; languageCode: string; level: string }[];
  createdAt: string;
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
  const [emailChangeOpen, setEmailChangeOpen] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [emailCurrentPassword, setEmailCurrentPassword] = useState('');
  const [emailRequestId, setEmailRequestId] = useState('');
  const [emailCode, setEmailCode] = useState('');
  const [emailSecurityMessage, setEmailSecurityMessage] = useState('');
  const [emailSecurityError, setEmailSecurityError] = useState('');
  const [emailSecurityLoading, setEmailSecurityLoading] = useState(false);
  const [passwordCurrent, setPasswordCurrent] = useState('');
  const [passwordNew, setPasswordNew] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Editable fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneWhatsapp, setPhoneWhatsapp] = useState('');
  const [country, setCountry] = useState('');
  const [bio, setBio] = useState('');
  const [city, setCity] = useState('');
  const [gender, setGender] = useState<'HOMME' | 'FEMME'>('HOMME');
  const [nationality, setNationality] = useState('');
  const [experienceYears, setExperienceYears] = useState('');

  // Languages
  const [languages, setLanguages] = useState<{ id: string; languageCode: string; level: string }[]>([]);
  const [langAdding, setLangAdding] = useState(false);
  const [langError, setLangError] = useState('');
  const selectRef = useRef<HTMLSelectElement>(null);

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
        setGender(p.gender || 'HOMME');
        setNationality(p.nationality || '');
        setExperienceYears(p.experienceYears?.toString() || '');
        setLanguages(p.languages);
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
        body: JSON.stringify({ firstName, lastName, phoneWhatsapp, country, bio, city, gender, nationality, experienceYears }),
      });
      if (!res.ok) throw new Error('Erreur lors de la sauvegarde');
      setSuccess('Profil mis à jour avec succès.');
      setProfile(p => p ? { ...p, firstName, lastName, name: `${firstName} ${lastName}`.trim() || p.name, phoneWhatsapp, country, bio, city, gender, nationality, experienceYears: parseInt(experienceYears) || null } : p);
    } catch (e: unknown) {
      setSaveError(e instanceof Error ? e.message : 'Erreur inconnue');
    } finally {
      setSaving(false);
    }
  }

  async function handleAddLanguage(code: string) {
    if (!code) return;
    setLangAdding(true);
    setLangError('');
    try {
      const res = await fetch('/api/guide/profil/languages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ languageCode: code }),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Erreur');
      const data = await res.json();
      setLanguages(prev => [...prev, data.language]);
      if (selectRef.current) selectRef.current.value = '';
    } catch (e: unknown) {
      setLangError(e instanceof Error ? e.message : 'Erreur');
    } finally {
      setLangAdding(false);
    }
  }

  async function handleRemoveLanguage(id: string) {
    try {
      const res = await fetch(`/api/guide/profil/languages?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      setLanguages(prev => prev.filter(l => l.id !== id));
    } catch {
      setLangError('Impossible de supprimer cette langue.');
    }
  }

  async function requestEmailChange(event: React.FormEvent) {
    event.preventDefault();
    setEmailSecurityLoading(true);
    setEmailSecurityError('');
    setEmailSecurityMessage('');
    try {
      const response = await fetch('/api/guide/security/email-change/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newEmail, currentPassword: emailCurrentPassword }),
      });
      const data = await response.json() as { requestId?: string; error?: string };
      if (!response.ok || !data.requestId) throw new Error(data.error || 'Envoi impossible.');
      setEmailRequestId(data.requestId);
      setEmailSecurityMessage('Code envoyé à votre nouvelle adresse.');
    } catch (cause) {
      setEmailSecurityError(cause instanceof Error ? cause.message : 'Envoi impossible.');
    } finally {
      setEmailSecurityLoading(false);
    }
  }

  async function confirmEmailChange(event: React.FormEvent) {
    event.preventDefault();
    setEmailSecurityLoading(true);
    setEmailSecurityError('');
    try {
      const response = await fetch('/api/guide/security/email-change/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId: emailRequestId, code: emailCode }),
      });
      const data = await response.json() as { error?: string };
      if (!response.ok) throw new Error(data.error || 'Confirmation impossible.');
      window.location.assign('/guide/connexion');
    } catch (cause) {
      setEmailSecurityError(cause instanceof Error ? cause.message : 'Confirmation impossible.');
      setEmailSecurityLoading(false);
    }
  }

  async function changePassword(event: React.FormEvent) {
    event.preventDefault();
    setPasswordError('');
    setPasswordMessage('');
    if (passwordNew !== passwordConfirmation) {
      setPasswordError('Les mots de passe ne correspondent pas.');
      return;
    }
    setPasswordLoading(true);
    try {
      const response = await fetch('/api/guide/security/password/change', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: passwordCurrent, newPassword: passwordNew }),
      });
      const data = await response.json() as { error?: string };
      if (!response.ok) throw new Error(data.error || 'Modification impossible.');
      setPasswordMessage('Mot de passe modifié. Reconnexion en cours…');
      window.setTimeout(() => window.location.assign('/guide/connexion'), 800);
    } catch (cause) {
      setPasswordError(cause instanceof Error ? cause.message : 'Modification impossible.');
      setPasswordLoading(false);
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap', marginTop: 2 }}>
            <span style={{ fontSize: '0.8rem', color: '#7A6D5A' }}>{profile.email}</span>
            <button type="button" onClick={() => { setEmailChangeOpen(true); window.setTimeout(() => document.getElementById('guide-email-security')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 0); }} style={{ border: 0, background: 'none', color: '#C9A84C', fontSize: '0.72rem', fontWeight: 700, padding: 0, cursor: 'pointer' }}>
              Changer mon adresse e-mail
            </button>
          </div>
          <div style={{ fontSize: '0.72rem', color: '#9CA3AF', marginTop: 2 }}>Guide depuis {profile.createdAt}</div>
        </div>
        {profile.slug && (
          <Link href={`/guides/${profile.slug}`} target="_blank" style={{ fontSize: '0.75rem', fontWeight: 700, color: '#C9A84C', border: '1px solid #E8DFC8', padding: '0.4rem 1rem', borderRadius: 20, textDecoration: 'none', whiteSpace: 'nowrap' }}>
            Voir profil public ↗
          </Link>
        )}
      </div>

      <div style={{ ...card, padding: '1.25rem' }}>
        <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.2rem', fontWeight: 700, color: '#1A1209', marginBottom: '0.25rem' }}>Tarifs nets validés</div>
        <div style={{ fontSize: '0.72rem', color: '#7A6D5A', marginBottom: '1rem' }}>Montants qui vous sont reversés par ville. Seule l’administration peut les modifier.</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '0.75rem' }}>
          {[
            { label: 'Makkah', enabled: profile.servesMakkah, values: [profile.makkahNetUpTo6Cents, profile.makkahNetUpTo15Cents, profile.makkahNetUpTo32Cents] },
            { label: 'Médine', enabled: profile.servesMadinah, values: [profile.madinahNetUpTo6Cents, profile.madinahNetUpTo15Cents, profile.madinahNetUpTo32Cents] },
          ].map(item => (
            <div key={item.label} style={{ border: `1px solid ${item.enabled ? '#C9A84C' : '#E5E7EB'}`, borderRadius: 10, padding: '0.875rem', background: item.enabled ? '#FEF9EC' : '#F9FAFB', opacity: item.enabled ? 1 : 0.65 }}>
              <div style={{ fontWeight: 800, fontSize: '0.82rem', color: '#1A1209', marginBottom: '0.5rem' }}>{item.label} · {item.enabled ? 'Disponible' : 'Indisponible'}</div>
              {item.enabled && [
                ['1–6 clients', item.values[0]], ['7–15 clients', item.values[1]], ['16–32 clients', item.values[2]],
              ].map(([group, cents]) => (
                <div key={String(group)} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#7A6D5A', padding: '0.2rem 0' }}>
                  <span>{group}</span><strong style={{ color: '#1A1209' }}>{Number(cents) / 100} €</strong>
                </div>
              ))}
            </div>
          ))}
        </div>
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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <span style={label}>Genre du guide</span>
                <select style={input} value={gender} onChange={e => setGender(e.target.value as 'HOMME' | 'FEMME')}>
                  <option value="HOMME">Homme</option>
                  <option value="FEMME">Femme</option>
                </select>
              </div>
              <div>
                <span style={label}>Villes proposées</span>
                <Link href="/guide/calendrier" style={{ ...input, display: 'flex', alignItems: 'center', justifyContent: 'space-between', textDecoration: 'none', fontWeight: 700 }}>
                  <span>{profile.servesMakkah ? 'Makkah' : null}{profile.servesMakkah && profile.servesMadinah ? ' · ' : ''}{profile.servesMadinah ? 'Médine' : null}{!profile.servesMakkah && !profile.servesMadinah ? 'Aucune ville activée' : ''}</span>
                  <span style={{ color: '#C9A84C' }}>Gérer dans le calendrier →</span>
                </Link>
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

      {/* Languages — interactive */}
      <div style={{ ...card, overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #F0EBE0' }}>
          <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.2rem', fontWeight: 700, color: '#1A1209' }}>Langues parlées</div>
          <div style={{ fontSize: '0.72rem', color: '#7A6D5A', marginTop: 2 }}>Sélectionnez vos langues une par une</div>
        </div>
        <div style={{ padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>

          {/* Chips des langues sélectionnées */}
          {languages.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {languages.map(l => (
                <span
                  key={l.id}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: '#FAF3E0', border: '1px solid rgba(201,168,76,0.4)', borderRadius: 20, padding: '0.3rem 0.5rem 0.3rem 0.875rem', fontSize: '0.78rem', fontWeight: 600, color: '#4A3F30' }}
                >
                  {LANG_CODE_TO_LABEL[l.languageCode] || l.languageCode}
                  <button
                    onClick={() => handleRemoveLanguage(l.id)}
                    aria-label={`Supprimer ${LANG_CODE_TO_LABEL[l.languageCode] || l.languageCode}`}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 0.1rem', lineHeight: 1, color: '#9A8A7A', fontSize: '0.9rem', display: 'flex', alignItems: 'center' }}
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Dropdown d'ajout */}
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <select
              ref={selectRef}
              defaultValue=""
              onChange={e => { if (e.target.value) handleAddLanguage(e.target.value); }}
              disabled={langAdding}
              style={{ ...input, flex: 1, cursor: 'pointer', appearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%237A6D5A' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.875rem center', paddingRight: '2.25rem' }}
            >
              <option value="" disabled>Ajouter une langue…</option>
              {GUIDE_LANGUAGES.filter(l => !languages.some(selected => selected.languageCode === l.code)).map(l => (
                <option key={l.code} value={l.code}>{l.label}</option>
              ))}
            </select>
            {langAdding && (
              <span style={{ fontSize: '0.75rem', color: '#7A6D5A', whiteSpace: 'nowrap' }}>Ajout…</span>
            )}
          </div>

          {langError && (
            <div style={{ fontSize: '0.78rem', color: '#DC2626' }}>{langError}</div>
          )}
        </div>
      </div>

      {/* Security */}
      <div id="guide-email-security" style={{ ...card, padding: '1.25rem', background: '#F5F2EC', display: 'grid', gap: '1.25rem' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.1rem', fontWeight: 700, color: '#1A1209', marginBottom: '0.25rem' }}>Sécurité</div>
          <div style={{ fontSize: '0.75rem', color: '#7A6D5A' }}>Une modification d’adresse ou de mot de passe déconnecte toutes les sessions.</div>
        </div>

        <div style={{ background: 'white', border: '1px solid #E8DFC8', borderRadius: 10, padding: '1rem' }}>
          <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#1A1209' }}>Adresse e-mail</div>
          <div style={{ fontSize: '0.75rem', color: '#7A6D5A', marginTop: 3 }}>{profile.email}</div>
          {!emailChangeOpen ? (
            <button type="button" onClick={() => setEmailChangeOpen(true)} style={{ marginTop: '0.75rem', fontSize: '0.76rem', fontWeight: 700, color: '#C9A84C', border: '1px solid #E8DFC8', padding: '0.45rem 1rem', borderRadius: 20, background: 'white', cursor: 'pointer' }}>Changer mon adresse e-mail</button>
          ) : !emailRequestId ? (
            <form onSubmit={requestEmailChange} style={{ display: 'grid', gap: '0.75rem', marginTop: '0.9rem' }}>
              <input style={input} type="email" required value={newEmail} onChange={event => setNewEmail(event.target.value)} placeholder="Nouvelle adresse e-mail" />
              <input style={input} type="password" required value={emailCurrentPassword} onChange={event => setEmailCurrentPassword(event.target.value)} placeholder="Mot de passe actuel" />
              <button disabled={emailSecurityLoading} style={{ justifySelf: 'start', padding: '0.5rem 1.2rem', border: 0, borderRadius: 20, background: '#1A1209', color: '#F0D897', fontWeight: 700 }}>{emailSecurityLoading ? 'Envoi…' : 'Envoyer le code'}</button>
            </form>
          ) : (
            <form onSubmit={confirmEmailChange} style={{ display: 'grid', gap: '0.75rem', marginTop: '0.9rem' }}>
              <input style={input} inputMode="numeric" pattern="[0-9]{6}" maxLength={6} required value={emailCode} onChange={event => setEmailCode(event.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="Code à 6 chiffres" />
              <button disabled={emailSecurityLoading} style={{ justifySelf: 'start', padding: '0.5rem 1.2rem', border: 0, borderRadius: 20, background: '#1A1209', color: '#F0D897', fontWeight: 700 }}>{emailSecurityLoading ? 'Vérification…' : 'Confirmer la nouvelle adresse'}</button>
            </form>
          )}
          {emailSecurityMessage && <div style={{ color: '#1D5C3A', fontSize: '0.75rem', marginTop: '0.75rem' }}>{emailSecurityMessage}</div>}
          {emailSecurityError && <div style={{ color: '#DC2626', fontSize: '0.75rem', marginTop: '0.75rem' }}>{emailSecurityError}</div>}
        </div>

        <form onSubmit={changePassword} style={{ background: 'white', border: '1px solid #E8DFC8', borderRadius: 10, padding: '1rem', display: 'grid', gap: '0.75rem' }}>
          <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#1A1209' }}>Mot de passe</div>
          <input style={input} type="password" required value={passwordCurrent} onChange={event => setPasswordCurrent(event.target.value)} placeholder="Mot de passe actuel" />
          <input style={input} type="password" required minLength={8} value={passwordNew} onChange={event => setPasswordNew(event.target.value)} placeholder="Nouveau mot de passe (8 caractères minimum)" />
          <input style={input} type="password" required minLength={8} value={passwordConfirmation} onChange={event => setPasswordConfirmation(event.target.value)} placeholder="Confirmer le nouveau mot de passe" />
          <button disabled={passwordLoading} style={{ justifySelf: 'start', padding: '0.5rem 1.2rem', border: 0, borderRadius: 20, background: '#1A1209', color: '#F0D897', fontWeight: 700 }}>{passwordLoading ? 'Modification…' : 'Modifier mon mot de passe'}</button>
          {passwordMessage && <div style={{ color: '#1D5C3A', fontSize: '0.75rem' }}>{passwordMessage}</div>}
          {passwordError && <div style={{ color: '#DC2626', fontSize: '0.75rem' }}>{passwordError}</div>}
        </form>
      </div>

    </div>
  );
}
