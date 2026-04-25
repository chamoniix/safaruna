'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { PLACES } from '@/lib/places';
import { GUIDE_LANGUAGES, LANG_CODE_TO_LABEL } from '@/lib/languages';

type Language = { id: string; languageCode: string; level: string };
type Package  = { id: string; name: string; pricePerPerson: number; durationDays: number; maxPeople: number };
type Reservation = { id: string; refNumber: string; startDate: string; nbPeople: number; totalPrice: number; status: string; createdAt: string };
type GuidePlace = { id: string; placeKey: string; isActive: boolean };
type Guide = {
  id: string; slug: string; bio: string | null; city: string | null;
  nationality: string | null; experienceYears: number | null; status: string;
  responseTimeAvg: string | null; completionRate: number | null;
  ibanMasked: string | null;
  availabilities: { id: string; date: string; status: string }[];
  conversations: { id: string; pelerinName: string; lastMessage: string; lastMessageAt: string }[];
  user: { name: string | null; firstName: string | null; lastName: string | null; email: string | null; createdAt: string; phoneWhatsapp: string | null; image: string | null };
  languages: Language[];
  packages: Package[];
  reservations: Reservation[];
  places: GuidePlace[];
  stats: { totalReservations: number; totalRevenue: number; avgRating: number | null };
  interviewScore: number | null;
  interviewNotes: string | null;
  interviewDate: string | null;
  interviewedBy: string | null;
};

const RES_STATUS: Record<string, { label: string; color: string; bg: string }> = {
  PENDING:   { label: 'En attente', color: '#92400E', bg: '#FEF3C7' },
  CONFIRMED: { label: 'Confirmée',  color: '#1E40AF', bg: '#DBEAFE' },
  COMPLETED: { label: 'Terminée',   color: '#1D5C3A', bg: '#D1FAE5' },
  CANCELLED: { label: 'Annulée',    color: '#DC2626', bg: '#FEE2E2' },
};

const PROFILE_STATUSES = ['DRAFT', 'REVIEW', 'ACTIVE', 'SUSPENDED'];

const sectionStyle: React.CSSProperties = {
  background: 'white', border: '1px solid #E8DFC8', borderRadius: 12,
  padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem',
};
const labelStyle: React.CSSProperties = {
  fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em',
  textTransform: 'uppercase', color: '#7A6D5A', marginBottom: 4, display: 'block',
};
const inputStyle: React.CSSProperties = {
  width: '100%', padding: '0.6rem 0.875rem', border: '1.5px solid #E8DFC8',
  borderRadius: 8, fontSize: '0.85rem', fontFamily: 'var(--font-manrope, sans-serif)',
  color: '#1A1209', background: 'white', outline: 'none', boxSizing: 'border-box',
};

export default function AdminGuideDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [guide, setGuide] = useState<Guide | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Editable fields
  const [bio, setBio]                     = useState('');
  const [city, setCity]                   = useState('');
  const [nationality, setNationality]     = useState('');
  const [expYears, setExpYears]           = useState('');
  const [status, setStatus]               = useState('');
  const [saving, setSaving]               = useState(false);
  const [saveMsg, setSaveMsg]             = useState('');

  // Package price editing
  const [editingPkg, setEditingPkg]       = useState<string | null>(null);
  const [pkgPrice, setPkgPrice]           = useState('');
  const [savingPkg, setSavingPkg]         = useState(false);

  // Access management — validate / suspend / reactivate
  const [genPassword, setGenPassword]     = useState(true);
  const [activating, setActivating]       = useState(false);
  const [accessResult, setAccessResult]   = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Regenerate password — independent state so it never interferes with other sections
  const [newPassword, setNewPassword]     = useState('');
  const [loadingAccess, setLoadingAccess] = useState(false);


  // Identity editing
  const [firstName, setFirstName]           = useState('');
  const [lastName, setLastName]             = useState('');
  const [email, setEmail]                   = useState('');
  const [phoneWhatsapp, setPhoneWhatsapp]   = useState('');
  const [savingIdentity, setSavingIdentity] = useState(false);
  const [identityMsg, setIdentityMsg]       = useState('');

  // Interview scoring
  const [interviewScore, setInterviewScore] = useState('');
  const [interviewNotes, setInterviewNotes] = useState('');
  const [savingInterview, setSavingInterview] = useState(false);
  const [interviewMsg, setInterviewMsg] = useState('');

  // Langue add form state
  const [langCode, setLangCode]   = useState('');
  const [langLevel, setLangLevel] = useState('NATIVE');
  const [addingLang, setAddingLang] = useState(false);

  // Lieux toggles
  const [placesMap, setPlacesMap] = useState<Record<string, boolean>>({});
  const [togglingPlace, setTogglingPlace] = useState<string | null>(null);

  // silent=true → update data without showing the full-page skeleton (used for post-action refreshes)
  const fetchGuide = async (silent = false) => {
    if (!silent) setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/guides/${slug}`);
      if (!res.ok) throw new Error('Erreur ' + res.status);
      const data = await res.json();
      const g: Guide = data.guide;
      setGuide(g);
      setBio(g.bio || '');
      setCity(g.city || '');
      setNationality(g.nationality || '');
      setExpYears(g.experienceYears?.toString() || '');
      setStatus(g.status);
      setFirstName(g.user.firstName || '');
      setLastName(g.user.lastName || '');
      setEmail(g.user.email || '');
      setPhoneWhatsapp(g.user.phoneWhatsapp || '');
      setInterviewScore(g.interviewScore?.toString() || '');
      setInterviewNotes(g.interviewNotes || '');
      const map: Record<string, boolean> = {};
      g.places?.forEach((p: any) => { map[p.placeKey] = p.isActive; });
      setPlacesMap(map);
    } catch (e: any) { setError(e.message); }
    if (!silent) setLoading(false);
  };

  useEffect(() => { if (slug) fetchGuide(); }, [slug]);

  const handleSave = async () => {
    setSaving(true); setSaveMsg('');
    try {
      const res = await fetch(`/api/admin/guides/${slug}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bio, city, nationality, experienceYears: expYears ? Number(expYears) : null, status }),
      });
      if (!res.ok) throw new Error();
      setSaveMsg('✓ Modifications sauvegardées');
      await fetchGuide(true); // silent — no skeleton flash
    } catch { setSaveMsg('✗ Erreur lors de la sauvegarde'); }
    setSaving(false);
    setTimeout(() => setSaveMsg(''), 3000);
  };

  const handleAccess = async (action: 'activate' | 'suspend', generatePassword: boolean) => {
    setActivating(true);
    setAccessResult(null);
    try {
      const res = await fetch(`/api/admin/guides/${slug}/activate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, generatePassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur');
      setAccessResult({ message: data.message, type: 'success' });
      await fetchGuide(true); // silent — keep sections visible
    } catch (e: any) {
      setAccessResult({ message: e.message, type: 'error' });
    }
    setActivating(false);
  };

  const handleRegenPassword = async () => {
    setLoadingAccess(true);
    setNewPassword('');
    try {
      const res = await fetch(`/api/admin/guides/${slug}/activate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'activate', generatePassword: true }),
      });
      const data = await res.json();
      if (data.password) setNewPassword(data.password);
    } catch { /* silent — password card won't show */ }
    setLoadingAccess(false);
  };

  const handlePkgSave = async (pkgId: string) => {
    setSavingPkg(true);
    try {
      const res = await fetch(`/api/admin/guides/${slug}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageId: pkgId, pricePerPerson: Number(pkgPrice) }),
      });
      if (!res.ok) throw new Error();
      setEditingPkg(null);
      await fetchGuide(true); // silent — no skeleton flash
    } catch { alert('Erreur lors de la mise à jour du prix.'); }
    setSavingPkg(false);
  };

  const handleTogglePlace = async (placeKey: string) => {
    setTogglingPlace(placeKey);
    setPlacesMap(prev => ({ ...prev, [placeKey]: !prev[placeKey] }));
    await fetch(`/api/admin/guides/${slug}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ togglePlace: placeKey }),
    });
    setTogglingPlace(null);
    await fetchGuide(true);
  };

  const initials = (g: Guide) => {
    const n = g.user.firstName || g.user.name || '';
    return n.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'G';
  };

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} style={{ background: '#F0EDE8', borderRadius: 12, height: 120, border: '1px solid #E8DFC8' }} />
      ))}
    </div>
  );

  if (error) return (
    <div style={{ background: '#FEE2E2', border: '1px solid #FCA5A5', borderRadius: 12, padding: '2rem', color: '#DC2626', textAlign: 'center' }}>
      {error}
      <button onClick={() => fetchGuide()} style={{ display: 'block', margin: '1rem auto 0', padding: '0.5rem 1.25rem', background: '#DC2626', color: 'white', border: 'none', borderRadius: 50, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700 }}>Réessayer</button>
    </div>
  );

  if (!guide) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', fontFamily: 'var(--font-manrope, sans-serif)', width: '100%', minHeight: 0, overflow: 'visible' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <Link href="/admin/guides" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', border: '1px solid #E8DFC8', borderRadius: 50, fontSize: '0.78rem', fontWeight: 600, color: '#7A6D5A', textDecoration: 'none', background: 'white' }}>
          ← Retour aux guides
        </Link>
        <h1 style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.6rem', fontWeight: 700, color: '#1A1209', margin: 0, flex: 1 }}>
          {guide.user.name || guide.user.firstName || 'Guide'}
        </h1>
        {guide.slug && (
          <Link href={`/guides/${guide.slug}`} target="_blank" style={{ padding: '0.5rem 1rem', border: '1px solid #E8DFC8', borderRadius: 50, fontSize: '0.78rem', fontWeight: 600, color: '#7A6D5A', textDecoration: 'none', background: 'white' }}>
            Voir profil public ↗
          </Link>
        )}
      </div>

      {/* Stats rapides */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
        {[
          { label: 'Réservations totales', value: guide.stats.totalReservations },
          { label: 'Revenus générés (€)',  value: `${guide.stats.totalRevenue} €` },
          { label: 'Note moyenne',         value: guide.stats.avgRating ? `${guide.stats.avgRating} / 5` : '—' },
        ].map(s => (
          <div key={s.label} style={{ background: 'white', border: '1px solid #E8DFC8', borderRadius: 12, padding: '1.25rem' }}>
            <div style={labelStyle}>{s.label}</div>
            <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '2rem', fontWeight: 700, color: '#1A1209', lineHeight: 1 }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Section 1 — Identité */}
      <div style={sectionStyle}>
        <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.2rem', fontWeight: 700, color: '#1A1209' }}>Identité</div>

        {/* Avatar + infos rapides */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          {guide.user.image ? (
            <img src={guide.user.image} alt="" style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
          ) : (
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg, #F0D897, #C9A84C)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.2rem', fontWeight: 700, color: '#1A1209', flexShrink: 0 }}>
              {initials(guide)}
            </div>
          )}
          <div>
            <div style={{ fontWeight: 700, fontSize: '1rem', color: '#1A1209' }}>{guide.user.name || '—'}</div>
            <div style={{ fontSize: '0.8rem', color: '#7A6D5A' }}>{guide.user.email}</div>
            <div style={{ fontSize: '0.72rem', color: '#9A8A7A', marginTop: 2 }}>
              Inscrit le {new Date(guide.user.createdAt).toLocaleDateString('fr-FR')}
            </div>
          </div>
          <div style={{ marginLeft: 'auto', fontSize: '0.72rem', color: '#9CA3AF', fontStyle: 'italic' }}>
            Upload photo — fonctionnalité R2 à venir
          </div>
        </div>

        <div style={{ height: 1, background: '#F0EBE0' }} />

        {/* Formulaire identité éditable */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={labelStyle}>Prénom</label>
            <input value={firstName} onChange={e => setFirstName(e.target.value)} style={inputStyle} placeholder="Prénom" />
          </div>
          <div>
            <label style={labelStyle}>Nom</label>
            <input value={lastName} onChange={e => setLastName(e.target.value)} style={inputStyle} placeholder="Nom" />
          </div>
          <div>
            <label style={labelStyle}>Email</label>
            <input value={email} onChange={e => setEmail(e.target.value)} type="email" style={inputStyle} placeholder="email@exemple.com" />
          </div>
          <div>
            <label style={labelStyle}>WhatsApp</label>
            <input value={phoneWhatsapp} onChange={e => setPhoneWhatsapp(e.target.value)} style={inputStyle} placeholder="+33 6 XX XX XX XX" />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingTop: '0.5rem', borderTop: '1px solid #F0EBE0' }}>
          <button
            onClick={async () => {
              setSavingIdentity(true); setIdentityMsg('');
              try {
                const res = await fetch(`/api/admin/guides/${slug}`, {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ firstName, lastName, email, phoneWhatsapp }),
                });
                if (!res.ok) throw new Error();
                setIdentityMsg('✓ Identité sauvegardée');
                await fetchGuide(true);
              } catch { setIdentityMsg('✗ Erreur lors de la sauvegarde'); }
              setSavingIdentity(false);
              setTimeout(() => setIdentityMsg(''), 3000);
            }}
            disabled={savingIdentity}
            style={{ padding: '0.65rem 1.75rem', background: '#1A1209', color: '#F0D897', border: 'none', borderRadius: 50, fontWeight: 700, fontSize: '0.85rem', cursor: savingIdentity ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: savingIdentity ? 0.7 : 1 }}
          >
            {savingIdentity ? 'Sauvegarde…' : "Sauvegarder l'identité"}
          </button>
          {identityMsg && (
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: identityMsg.startsWith('✓') ? '#1D5C3A' : '#DC2626' }}>{identityMsg}</span>
          )}
        </div>
      </div>

      {/* Section 1b — Gestion des accès */}
      <div style={{ ...sectionStyle, gap: '0.875rem' }}>
        <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.2rem', fontWeight: 700, color: '#1A1209' }}>Gestion des accès</div>

        {/* REVIEW or DRAFT → activate */}
        {(guide.status === 'REVIEW' || guide.status === 'DRAFT') && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer' }} onClick={() => setGenPassword(v => !v)}>
              <div style={{ width: 18, height: 18, border: '2px solid #C9A84C', borderRadius: 4, background: genPassword ? '#C9A84C' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {genPassword && <span style={{ color: '#1A1209', fontSize: '0.7rem', fontWeight: 900 }}>✓</span>}
              </div>
              <span style={{ fontSize: '0.82rem', color: '#4A3F30' }}>Générer un nouveau mot de passe et envoyer par email</span>
            </div>
            <button
              onClick={() => handleAccess('activate', genPassword)}
              disabled={activating}
              style={{ padding: '0.7rem 1.75rem', background: activating ? '#9CA3AF' : '#1D5C3A', color: 'white', border: 'none', borderRadius: 50, fontWeight: 700, fontSize: '0.85rem', cursor: activating ? 'not-allowed' : 'pointer', fontFamily: 'inherit', alignSelf: 'flex-start' }}
            >
              {activating ? 'Validation…' : '✓ Valider le profil guide'}
            </button>
          </>
        )}

        {/* ACTIVE → suspend */}
        {guide.status === 'ACTIVE' && (
          <button
            onClick={() => { if (confirm('Suspendre ce guide ?')) handleAccess('suspend', false); }}
            disabled={activating}
            style={{ padding: '0.7rem 1.75rem', background: activating ? '#9CA3AF' : '#DC2626', color: 'white', border: 'none', borderRadius: 50, fontWeight: 700, fontSize: '0.85rem', cursor: activating ? 'not-allowed' : 'pointer', fontFamily: 'inherit', alignSelf: 'flex-start' }}
          >
            {activating ? '…' : 'Suspendre le profil'}
          </button>
        )}

        {/* SUSPENDED → reactivate */}
        {guide.status === 'SUSPENDED' && (
          <button
            onClick={() => handleAccess('activate', false)}
            disabled={activating}
            style={{ padding: '0.7rem 1.75rem', background: activating ? '#9CA3AF' : '#1D5C3A', color: 'white', border: 'none', borderRadius: 50, fontWeight: 700, fontSize: '0.85rem', cursor: activating ? 'not-allowed' : 'pointer', fontFamily: 'inherit', alignSelf: 'flex-start' }}
          >
            {activating ? '…' : 'Réactiver le profil'}
          </button>
        )}

        {/* Action result banner (validate / suspend / reactivate) */}
        {accessResult && (
          <div style={{ background: accessResult.type === 'success' ? '#D1FAE5' : '#FEE2E2', border: `1px solid ${accessResult.type === 'success' ? '#6EE7B7' : '#FCA5A5'}`, borderRadius: 8, padding: '0.75rem 1rem', fontSize: '0.82rem', fontWeight: 600, color: accessResult.type === 'success' ? '#1D5C3A' : '#DC2626' }}>
            {accessResult.type === 'success' ? '✅ ' : '✗ '}{accessResult.message}
          </div>
        )}

        <div style={{ height: 1, background: '#F0EBE0' }} />

        {/* Regenerate password — independent state */}
        <button
          onClick={handleRegenPassword}
          disabled={loadingAccess}
          style={{ padding: '0.5rem 1.25rem', background: 'white', color: '#7A6D5A', border: '1px solid #E8DFC8', borderRadius: 50, fontWeight: 600, fontSize: '0.78rem', cursor: loadingAccess ? 'not-allowed' : 'pointer', fontFamily: 'inherit', alignSelf: 'flex-start' }}
        >
          {loadingAccess ? '…' : '↻ Régénérer mot de passe'}
        </button>

        {newPassword && (
          <div style={{ background: '#D1FAE5', border: '1px solid #6EE7B7', borderRadius: 8, padding: '0.875rem 1rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1D5C3A', marginBottom: '0.25rem' }}>✅ Email envoyé — Mot de passe temporaire :</div>
            <div style={{ fontFamily: 'monospace', fontSize: '1rem', fontWeight: 700, color: '#1A1209', letterSpacing: '0.08em' }}>{newPassword}</div>
            <div style={{ fontSize: '0.65rem', color: '#7A6D5A', marginTop: '0.25rem' }}>Visible une seule fois — non enregistré</div>
          </div>
        )}
      </div>

      {/* Section — Entretien & Évaluation */}
      {(() => {
        const score = interviewScore !== '' ? Number(interviewScore) : null;
        const scoreColor = score === null ? '#7A6D5A'
          : score >= 15 ? '#1D5C3A'
          : score >= 10 ? '#92400E'
          : '#DC2626';
        const scoreBg = score === null ? '#F3F4F6'
          : score >= 15 ? '#D1FAE5'
          : score >= 10 ? '#FEF3C7'
          : '#FEE2E2';

        const handleSaveInterview = async () => {
          setSavingInterview(true);
          setInterviewMsg('');
          try {
            const res = await fetch(`/api/admin/guides/${slug}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                interviewScore: interviewScore !== '' ? Number(interviewScore) : undefined,
                interviewNotes,
                interviewDate: new Date().toISOString(),
              }),
            });
            if (!res.ok) throw new Error();
            setInterviewMsg('✓ Évaluation sauvegardée');
            await fetchGuide(true);
          } catch { setInterviewMsg('✗ Erreur lors de la sauvegarde'); }
          setSavingInterview(false);
          setTimeout(() => setInterviewMsg(''), 3000);
        };

        return (
          <div style={{ background: '#F0F9FF', border: '1px solid #BAE6FD', borderRadius: 12, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.2rem', fontWeight: 700, color: '#1A1209' }}>🎤 Entretien & Évaluation</div>
              <div style={{ fontSize: '0.72rem', color: '#7A6D5A', marginTop: 2 }}>Ces informations sont privées — non visibles par le guide</div>
            </div>

            {guide.interviewDate ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <span style={{ background: '#D1FAE5', color: '#1D5C3A', fontSize: '0.72rem', fontWeight: 700, padding: '0.25rem 0.75rem', borderRadius: 20 }}>✓ Entretien complété</span>
                <span style={{ fontSize: '0.78rem', color: '#4A3F30' }}>le {guide.interviewDate} par {guide.interviewedBy || 'admin'}</span>
              </div>
            ) : (
              <span style={{ background: '#FEF3C7', color: '#92400E', fontSize: '0.72rem', fontWeight: 700, padding: '0.25rem 0.75rem', borderRadius: 20, alignSelf: 'flex-start' }}>⏳ Entretien à planifier</span>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: '1rem', alignItems: 'start' }}>
              <div>
                <label style={labelStyle}>Note de l'entretien (/20)</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="number" min={0} max={20}
                    value={interviewScore}
                    onChange={e => setInterviewScore(e.target.value)}
                    style={{ ...inputStyle, width: 80 }}
                    placeholder="—"
                  />
                  {score !== null && (
                    <span style={{ background: scoreBg, color: scoreColor, fontWeight: 700, fontSize: '0.85rem', padding: '0.2rem 0.6rem', borderRadius: 8 }}>
                      {score}/20
                    </span>
                  )}
                </div>
              </div>
              <div>
                <label style={labelStyle}>Notes internes (test écrit + oral)</label>
                <textarea
                  value={interviewNotes}
                  onChange={e => setInterviewNotes(e.target.value)}
                  rows={5}
                  style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
                  placeholder="Observations sur le candidat, points forts, points faibles, résultat test écrit, résultat oral…"
                />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingTop: '0.5rem', borderTop: '1px solid #BAE6FD' }}>
              <button
                onClick={handleSaveInterview}
                disabled={savingInterview}
                style={{ padding: '0.65rem 1.75rem', background: '#0369A1', color: 'white', border: 'none', borderRadius: 50, fontWeight: 700, fontSize: '0.85rem', cursor: savingInterview ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: savingInterview ? 0.7 : 1 }}
              >
                {savingInterview ? 'Sauvegarde…' : "Sauvegarder l'évaluation"}
              </button>
              {interviewMsg && (
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: interviewMsg.startsWith('✓') ? '#1D5C3A' : '#DC2626' }}>{interviewMsg}</span>
              )}
            </div>

            {score !== null && (
              <div style={{ background: scoreBg, border: `1px solid ${scoreColor}33`, borderRadius: 8, padding: '0.75rem 1rem', fontSize: '0.82rem', fontWeight: 600, color: scoreColor }}>
                {score >= 15
                  ? '✅ Candidat recommandé — Peut être validé'
                  : score >= 10
                  ? '⚠️ Candidat acceptable — À valider avec précaution'
                  : '❌ Candidat non recommandé'}
              </div>
            )}
          </div>
        );
      })()}

      {/* Section 2 — Profil éditable */}
      <div style={sectionStyle}>
        <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.2rem', fontWeight: 700, color: '#1A1209' }}>Profil guide</div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={labelStyle}>Ville</label>
            <input value={city} onChange={e => setCity(e.target.value)} style={inputStyle} placeholder="Makkah" />
          </div>
          <div>
            <label style={labelStyle}>Nationalité</label>
            <input value={nationality} onChange={e => setNationality(e.target.value)} style={inputStyle} placeholder="Marocaine" />
          </div>
          <div>
            <label style={labelStyle}>Années d'expérience</label>
            <input value={expYears} onChange={e => setExpYears(e.target.value)} type="number" min={0} style={inputStyle} placeholder="8" />
          </div>
          <div>
            <label style={labelStyle}>Statut</label>
            <select value={status} onChange={e => setStatus(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
              {PROFILE_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label style={labelStyle}>Bio</label>
          <textarea value={bio} onChange={e => setBio(e.target.value)} rows={4} style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }} placeholder="Présentation du guide…" />
        </div>

        {/* Langues parlées */}
        <div>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#7A6D5A', marginBottom: '0.75rem' }}>Langues parlées</div>

          {/* Chips — langues déjà sélectionnées */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem', minHeight: 32 }}>
            {guide.languages.length === 0 && (
              <span style={{ fontSize: '0.8rem', color: '#9CA3AF', alignSelf: 'center' }}>Aucune langue renseignée</span>
            )}
            {guide.languages.map(l => (
              <span key={l.id} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', background: '#F5F0E8', border: '1px solid #E8DFC8', borderRadius: 20, padding: '0.3rem 0.5rem 0.3rem 0.75rem', fontSize: '0.75rem', fontWeight: 600, color: '#4A3F30' }}>
                {LANG_CODE_TO_LABEL[l.languageCode] ?? l.languageCode}
                <span style={{ fontSize: '0.65rem', color: '#7A6D5A', fontWeight: 500 }}>· {l.level}</span>
                <button
                  onClick={async () => {
                    const res = await fetch(`/api/admin/guides/${slug}`, {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ deleteLanguageId: l.id }),
                    });
                    if (res.ok) fetchGuide(true);
                  }}
                  style={{ width: 16, height: 16, borderRadius: '50%', background: '#FEE2E2', color: '#DC2626', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', fontWeight: 900, padding: 0, lineHeight: 1 }}
                >✕</button>
              </span>
            ))}
          </div>

          {/* Ajout langue — dropdown */}
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <select
              value={langCode}
              onChange={e => setLangCode(e.target.value)}
              style={{ padding: '0.45rem 0.75rem', border: '1.5px solid #E8DFC8', borderRadius: 8, fontSize: '0.82rem', fontFamily: 'var(--font-manrope, sans-serif)', background: 'white', cursor: 'pointer', outline: 'none', minWidth: 200 }}
            >
              <option value="">— Choisir une langue —</option>
              {GUIDE_LANGUAGES.filter(l => !guide.languages.some(gl => gl.languageCode === l.code)).map(l => (
                <option key={l.code} value={l.code}>{l.label}</option>
              ))}
            </select>
            <select
              value={langLevel}
              onChange={e => setLangLevel(e.target.value)}
              style={{ padding: '0.45rem 0.75rem', border: '1.5px solid #E8DFC8', borderRadius: 8, fontSize: '0.82rem', fontFamily: 'var(--font-manrope, sans-serif)', background: 'white', cursor: 'pointer', outline: 'none' }}
            >
              {['NATIVE','C2','C1','B2','B1'].map(lvl => <option key={lvl} value={lvl}>{lvl}</option>)}
            </select>
            <button
              disabled={!langCode || addingLang}
              onClick={async () => {
                if (!langCode) return;
                setAddingLang(true);
                const res = await fetch(`/api/admin/guides/${slug}`, {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ addLanguage: { code: langCode, level: langLevel } }),
                });
                if (res.ok) { setLangCode(''); setLangLevel('NATIVE'); fetchGuide(true); }
                setAddingLang(false);
              }}
              style={{ padding: '0.45rem 1rem', background: (!langCode || addingLang) ? '#E8DFC8' : '#1A1209', color: (!langCode || addingLang) ? '#7A6D5A' : '#F0D897', border: 'none', borderRadius: 50, fontSize: '0.78rem', fontWeight: 700, cursor: (!langCode || addingLang) ? 'not-allowed' : 'pointer', fontFamily: 'inherit', transition: 'background 0.15s' }}
            >
              {addingLang ? '…' : 'Ajouter'}
            </button>
          </div>
        </div>

        {/* Save button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingTop: '0.5rem', borderTop: '1px solid #F0EBE0' }}>
          <button onClick={handleSave} disabled={saving} style={{ padding: '0.65rem 1.75rem', background: '#1A1209', color: '#F0D897', border: 'none', borderRadius: 50, fontWeight: 700, fontSize: '0.85rem', cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: saving ? 0.7 : 1 }}>
            {saving ? 'Sauvegarde…' : 'Sauvegarder'}
          </button>
          {saveMsg && (
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: saveMsg.startsWith('✓') ? '#1D5C3A' : '#DC2626' }}>{saveMsg}</span>
          )}
        </div>
      </div>

      {/* Section — Lieux de visite */}
      <div style={{ background: 'white', border: '1px solid #E8DFC8', borderRadius: 12, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.2rem', fontWeight: 700, color: '#1A1209' }}>Lieux de visite</div>
          <div style={{ fontSize: '0.72rem', color: '#7A6D5A', marginTop: 2 }}>Lieux activés par ce guide pour les réservations</div>
        </div>
        {(['MAKKAH', 'MADINAH', 'HISTORIQUE'] as const).map(cat => {
          const catPlaces = PLACES.filter(p => p.category === cat);
          const catLabel = cat === 'MAKKAH' ? 'Makkah' : cat === 'MADINAH' ? 'Madinah' : 'Sites historiques';
          return (
            <div key={cat}>
              <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#C9A84C', marginBottom: '0.5rem' }}>{catLabel}</div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {catPlaces.map(place => {
                  const isActive = placesMap[place.key] ?? false;
                  const isToggling = togglingPlace === place.key;
                  return (
                    <button
                      key={place.key}
                      onClick={() => handleTogglePlace(place.key)}
                      disabled={isToggling}
                      style={{
                        padding: '0.35rem 0.875rem', borderRadius: 20,
                        border: `1px solid ${isActive ? '#1D5C3A' : '#E8DFC8'}`,
                        background: isActive ? '#D1FAE5' : '#F3F4F6',
                        color: isActive ? '#1D5C3A' : '#9CA3AF',
                        fontSize: '0.75rem', fontWeight: 600, cursor: isToggling ? 'wait' : 'pointer',
                        fontFamily: 'inherit', opacity: isToggling ? 0.6 : 1, transition: 'all 0.15s',
                        display: 'flex', alignItems: 'center', gap: '0.3rem',
                      }}
                    >
                      <span>{place.emoji}</span>
                      {isActive ? '✓ ' : ''}{place.nameFr}
                      {place.includedInBase && (
                        <span style={{ fontSize: '0.55rem', fontWeight: 700, color: '#8B6914', background: '#FEF9EC', border: '1px solid #FCD34D', borderRadius: 10, padding: '0.1rem 0.3rem', marginLeft: 2 }}>★</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Section 3 — Packages */}
      {guide.packages.length > 0 && (
        <div style={sectionStyle}>
          <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.2rem', fontWeight: 700, color: '#1A1209' }}>Packages ({guide.packages.length})</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {guide.packages.map(pkg => (
              <div key={pkg.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.875rem 1rem', background: '#FAFAF8', border: '1px solid #F0EBE0', borderRadius: 8, flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 160 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1A1209' }}>{pkg.name}</div>
                  <div style={{ fontSize: '0.72rem', color: '#7A6D5A', marginTop: 2 }}>
                    {pkg.durationDays}j · max {pkg.maxPeople} pers.
                  </div>
                </div>
                {editingPkg === pkg.id ? (
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <input
                      value={pkgPrice}
                      onChange={e => setPkgPrice(e.target.value)}
                      type="number" min={0}
                      style={{ ...inputStyle, width: 100, padding: '0.4rem 0.6rem' }}
                      placeholder="Prix €"
                    />
                    <button onClick={() => handlePkgSave(pkg.id)} disabled={savingPkg} style={{ padding: '0.4rem 0.875rem', background: '#1D5C3A', color: 'white', border: 'none', borderRadius: 50, fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                      {savingPkg ? '…' : 'OK'}
                    </button>
                    <button onClick={() => setEditingPkg(null)} style={{ padding: '0.4rem 0.875rem', background: 'white', color: '#7A6D5A', border: '1px solid #E8DFC8', borderRadius: 50, fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                      Annuler
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.3rem', fontWeight: 700, color: '#1A1209' }}>{pkg.pricePerPerson} €</span>
                    <span style={{ fontSize: '0.65rem', color: '#7A6D5A' }}>/pers.</span>
                    <button onClick={() => { setEditingPkg(pkg.id); setPkgPrice(pkg.pricePerPerson.toString()); }} style={{ padding: '0.35rem 0.875rem', background: 'white', color: '#1A1209', border: '1px solid #E8DFC8', borderRadius: 50, fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                      Modifier
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section — Informations bancaires */}
      <div style={{ background: '#FEF9EC', border: '1px solid #FCD34D', borderRadius: 12, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.2rem', fontWeight: 700, color: '#1A1209' }}>Informations bancaires</div>
          <div style={{ fontSize: '0.72rem', color: '#7A6D5A', marginTop: 2 }}>Données sensibles — accès restreint</div>
        </div>
        {!guide.ibanMasked ? (
          <div style={{ color: '#9CA3AF', fontSize: '0.85rem' }}>Aucun IBAN renseigné</div>
        ) : (
          <div style={{ fontFamily: 'monospace', color: '#7A6D5A', fontSize: '0.95rem' }}>
            •••• •••• {guide.ibanMasked}
          </div>
        )}
      </div>

      {/* Section — Disponibilités (30 prochains jours) */}
      <div style={sectionStyle}>
        <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.2rem', fontWeight: 700, color: '#1A1209' }}>Disponibilités (30 prochains jours)</div>
        {guide.availabilities.length === 0 ? (
          <div style={{ color: '#9CA3AF', fontSize: '0.85rem' }}>Aucune disponibilité renseignée</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
            {guide.availabilities.map(a => {
              const dayNum = new Date(a.date).getDate();
              const colors: Record<string, { bg: string; color: string }> = {
                AVAILABLE:   { bg: '#D1FAE5', color: '#1D5C3A' },
                BOOKED:      { bg: '#FEE2E2', color: '#DC2626' },
                UNAVAILABLE: { bg: '#F3F4F6', color: '#9CA3AF' },
              };
              const c = colors[a.status] || colors.UNAVAILABLE;
              const fullDate = new Date(a.date).toLocaleDateString('fr-FR');
              return (
                <div
                  key={a.id}
                  title={fullDate}
                  style={{ width: 40, height: 40, borderRadius: 6, background: c.bg, color: c.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.78rem', fontWeight: 700, cursor: 'default' }}
                >
                  {dayNum}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Section — Conversations avec les pèlerins */}
      <div style={sectionStyle}>
        <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.2rem', fontWeight: 700, color: '#1A1209' }}>Conversations avec les pèlerins</div>
        {guide.conversations.length === 0 ? (
          <div style={{ color: '#9CA3AF', fontSize: '0.85rem' }}>Aucune conversation</div>
        ) : (
          guide.conversations.map((c, i) => {
            const ini = c.pelerinName.slice(0, 2).toUpperCase();
            return (
              <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', padding: '0.75rem 0', borderBottom: i < guide.conversations.length - 1 ? '1px solid #F0EBE0' : 'none' }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#E8DFC8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-cormorant, serif)', fontSize: '0.9rem', fontWeight: 700, color: '#1A1209', flexShrink: 0 }}>{ini}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1A1209' }}>{c.pelerinName}</div>
                  <div style={{ fontSize: '0.72rem', color: '#7A6D5A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.lastMessage || '—'}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem', flexShrink: 0 }}>
                  <span style={{ fontSize: '0.68rem', color: '#9A8A7A' }}>{c.lastMessageAt}</span>
                  <a href={`/admin/messages?conv=${c.id}`} style={{ fontSize: '0.72rem', fontWeight: 700, color: '#C9A84C', textDecoration: 'none', border: '1px solid #E8DFC8', padding: '0.2rem 0.6rem', borderRadius: 20, background: 'white' }}>Voir →</a>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Section 4 — Réservations */}
      <div style={sectionStyle}>
        <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.2rem', fontWeight: 700, color: '#1A1209' }}>
          Dernières réservations ({guide.stats.totalReservations} au total)
        </div>
        {guide.reservations.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#7A6D5A', fontSize: '0.85rem', padding: '1.5rem 0' }}>Aucune réservation pour ce guide.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 560 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #E8DFC8' }}>
                  {['Référence', 'Date début', 'Personnes', 'Total (€)', 'Statut'].map(h => (
                    <th key={h} style={{ padding: '0.6rem 0.875rem', textAlign: 'left', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#7A6D5A', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {guide.reservations.map((r, i) => {
                  const rs = RES_STATUS[r.status] || { label: r.status, color: '#6B7280', bg: '#F3F4F6' };
                  return (
                    <tr key={r.id} style={{ borderBottom: '1px solid #F0EBE0', background: i % 2 === 0 ? 'transparent' : '#FAFAF8' }}>
                      <td style={{ padding: '0.7rem 0.875rem', fontSize: '0.78rem', fontWeight: 600, color: '#1A1209', fontFamily: 'monospace' }}>{r.refNumber}</td>
                      <td style={{ padding: '0.7rem 0.875rem', fontSize: '0.75rem', color: '#4A3F30' }}>{new Date(r.startDate).toLocaleDateString('fr-FR')}</td>
                      <td style={{ padding: '0.7rem 0.875rem', fontSize: '0.82rem', color: '#1A1209', textAlign: 'center' }}>{r.nbPeople}</td>
                      <td style={{ padding: '0.7rem 0.875rem', fontSize: '0.85rem', fontWeight: 700, color: '#1A1209' }}>{r.totalPrice} €</td>
                      <td style={{ padding: '0.7rem 0.875rem' }}>
                        <span style={{ display: 'inline-block', background: rs.bg, color: rs.color, fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.06em', padding: '0.25rem 0.6rem', borderRadius: 20, whiteSpace: 'nowrap' }}>
                          {rs.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
