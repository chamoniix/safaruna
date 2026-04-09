'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

type Language = { id: string; languageCode: string; level: string };
type Package  = { id: string; name: string; pricePerPerson: number; durationDays: number; maxPeople: number };
type Reservation = { id: string; refNumber: string; startDate: string; nbPeople: number; totalPrice: number; status: string; createdAt: string };
type Guide = {
  id: string; slug: string; bio: string | null; city: string | null;
  nationality: string | null; experienceYears: number | null; status: string;
  responseTimeAvg: string | null; completionRate: number | null;
  user: { name: string | null; firstName: string | null; lastName: string | null; email: string | null; createdAt: string };
  languages: Language[];
  packages: Package[];
  reservations: Reservation[];
  stats: { totalReservations: number; totalRevenue: number; avgRating: number | null };
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

  // Access management
  const [genPassword, setGenPassword]     = useState(true);
  const [activating, setActivating]       = useState(false);
  const [accessResult, setAccessResult]   = useState<{ password?: string; guideEmail?: string; message: string; type: 'success' | 'error' } | null>(null);

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
      await fetchGuide();
    } catch { setSaveMsg('✗ Erreur lors de la sauvegarde'); }
    setSaving(false);
    setTimeout(() => setSaveMsg(''), 3000);
  };

  const handleAccess = async (action: 'activate' | 'suspend', overrideGenPw?: boolean) => {
    setActivating(true);
    setAccessResult(null);
    const currentEmail = guide?.user.email || '';
    try {
      const generatePassword = overrideGenPw !== undefined ? overrideGenPw : genPassword;
      const res = await fetch(`/api/admin/guides/${slug}/activate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, generatePassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur');
      // Set result BEFORE silent refresh so it stays visible
      setAccessResult({ password: data.password, guideEmail: currentEmail, message: data.message, type: 'success' });
      await fetchGuide(true); // silent: no skeleton flash
    } catch (e: any) {
      setAccessResult({ message: e.message, type: 'error' });
    }
    setActivating(false);
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
      await fetchGuide();
    } catch { alert('Erreur lors de la mise à jour du prix.'); }
    setSavingPkg(false);
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', fontFamily: 'var(--font-manrope, sans-serif)' }}>

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
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg, #F0D897, #C9A84C)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.2rem', fontWeight: 700, color: '#1A1209', flexShrink: 0 }}>
            {initials(guide)}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '1rem', color: '#1A1209' }}>{guide.user.name || '—'}</div>
            <div style={{ fontSize: '0.8rem', color: '#7A6D5A' }}>{guide.user.email}</div>
            <div style={{ fontSize: '0.72rem', color: '#9A8A7A', marginTop: 2 }}>
              Inscrit le {new Date(guide.user.createdAt).toLocaleDateString('fr-FR')}
            </div>
          </div>
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
              onClick={() => handleAccess('activate')}
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
            onClick={() => { if (confirm('Suspendre ce guide ?')) handleAccess('suspend'); }}
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

        {/* Regenerate password — always visible */}
        <button
          onClick={() => handleAccess('activate', true)}
          disabled={activating}
          style={{ padding: '0.5rem 1.25rem', background: 'white', color: '#7A6D5A', border: '1px solid #E8DFC8', borderRadius: 50, fontWeight: 600, fontSize: '0.78rem', cursor: activating ? 'not-allowed' : 'pointer', fontFamily: 'inherit', alignSelf: 'flex-start' }}
        >
          {activating ? '…' : '↻ Régénérer mot de passe'}
        </button>

        {/* Result banner */}
        {accessResult && (
          <div style={{
            background: accessResult.type === 'success' ? '#D1FAE5' : '#FEE2E2',
            border: `1px solid ${accessResult.type === 'success' ? '#6EE7B7' : '#FCA5A5'}`,
            borderRadius: 10,
            padding: '1rem 1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: accessResult.type === 'success' ? '#1D5C3A' : '#DC2626' }}>
              {accessResult.type === 'success' ? '✅ ' : '✗ '}
              {accessResult.password && accessResult.guideEmail
                ? `Email envoyé à ${accessResult.guideEmail}`
                : accessResult.message}
            </div>
            {accessResult.password && (
              <>
                <div style={{ fontFamily: 'monospace', fontSize: '0.9rem', background: '#1A1209', color: '#F0D897', padding: '0.5rem 0.875rem', borderRadius: 6, display: 'inline-block' }}>
                  Mot de passe temporaire : <strong>{accessResult.password}</strong>
                </div>
                <div style={{ fontSize: '0.7rem', color: '#6B7280' }}>Visible une seule fois — disparaît au rechargement.</div>
              </>
            )}
            {!accessResult.password && accessResult.type === 'success' && (
              <div style={{ fontSize: '0.78rem', color: '#4A3F30' }}>{accessResult.message}</div>
            )}
          </div>
        )}
      </div>

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

        {/* Langues */}
        {guide.languages.length > 0 && (
          <div>
            <label style={labelStyle}>Langues</label>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {guide.languages.map(l => (
                <span key={l.id} style={{ background: '#F5F0E8', border: '1px solid #E8DFC8', borderRadius: 20, padding: '0.3rem 0.75rem', fontSize: '0.75rem', fontWeight: 600, color: '#4A3F30' }}>
                  {l.languageCode} <span style={{ color: '#9A8A7A', fontWeight: 400 }}>{l.level}</span>
                </span>
              ))}
            </div>
          </div>
        )}

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
