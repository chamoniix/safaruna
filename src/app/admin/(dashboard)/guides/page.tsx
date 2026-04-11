'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

type Guide = {
  id: string;
  name: string;
  email: string;
  city: string;
  langs: string;
  reservations: number;
  joined: string;
  status: string;
  slug: string;
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  ACTIVE:    { label: 'Actif',       color: '#1D5C3A', bg: '#D1FAE5' },
  SUSPENDED: { label: 'Suspendu',    color: '#DC2626', bg: '#FEE2E2' },
  REVIEW:    { label: 'En révision', color: '#92400E', bg: '#FEF3C7' },
  DRAFT:     { label: 'Brouillon',   color: '#6B7280', bg: '#F3F4F6' },
};

export default function AdminGuidesPage() {
  const [guides, setGuides] = useState<Guide[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [toggling, setToggling] = useState<string | null>(null);

  const fetchGuides = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/guides');
      if (!res.ok) throw new Error('Erreur ' + res.status);
      const data = await res.json();
      setGuides(data.guides || []);
    } catch (e: any) {
      setError(e.message || 'Erreur réseau');
    }
    setLoading(false);
  };

  useEffect(() => { fetchGuides(); }, []);

  const filtered = guides.filter(g => {
    const matchSearch = !search ||
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      g.email.toLowerCase().includes(search.toLowerCase()) ||
      g.city.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || g.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const stats = {
    total:    guides.length,
    active:   guides.filter(g => g.status === 'ACTIVE').length,
    review:   guides.filter(g => g.status === 'REVIEW').length,
    suspended: guides.filter(g => g.status === 'SUSPENDED').length,
  };

  const handleToggle = async (guide: Guide) => {
    const action = guide.status === 'ACTIVE' ? 'suspend' : 'activate';
    const label = action === 'suspend' ? 'suspendre' : 'activer';
    if (!window.confirm(`Confirmer : ${label} le guide ${guide.name} ?`)) return;

    setToggling(guide.id);
    try {
      const res = await fetch('/api/admin/guides', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guideId: guide.id, action }),
      });
      if (!res.ok) throw new Error();
      await fetchGuides();
    } catch {
      alert('Erreur lors du changement de statut.');
    }
    setToggling(null);
  };

  const STAT_CARDS = [
    { label: 'Total guides',  value: stats.total,    color: '#1A1209', bg: 'white' },
    { label: 'Actifs',        value: stats.active,   color: '#1D5C3A', bg: '#D1FAE5' },
    { label: 'En révision',   value: stats.review,   color: '#92400E', bg: '#FEF3C7' },
    { label: 'Suspendus',     value: stats.suspended, color: '#DC2626', bg: '#FEE2E2' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', fontFamily: 'var(--font-manrope, sans-serif)' }}>

      {/* Stats bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
        {STAT_CARDS.map(s => (
          <div key={s.label} style={{ background: s.bg, border: '1px solid #E8DFC8', borderRadius: 12, padding: '1.25rem' }}>
            <div style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#7A6D5A', marginBottom: '0.5rem' }}>{s.label}</div>
            <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '2.2rem', fontWeight: 700, color: s.color, lineHeight: 1 }}>
              {loading ? '—' : s.value}
            </div>
          </div>
        ))}
      </div>

      {/* Search + Filter */}
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1 1 240px', maxWidth: 360 }}>
          <svg style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
            width="15" height="15" fill="none" stroke="#7A6D5A" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher par nom, email, ville…"
            style={{ width: '100%', padding: '0.6rem 1rem 0.6rem 2.25rem', boxSizing: 'border-box', border: '1px solid #E8DFC8', borderRadius: 8, fontSize: '0.83rem', fontFamily: 'inherit', color: '#1A1209', background: 'white', outline: 'none' }}
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          style={{ padding: '0.6rem 1rem', border: '1px solid #E8DFC8', borderRadius: 8, fontSize: '0.83rem', fontFamily: 'inherit', color: '#1A1209', background: 'white', outline: 'none', cursor: 'pointer' }}
        >
          <option value="ALL">Tous les statuts</option>
          <option value="ACTIVE">Actif</option>
          <option value="REVIEW">En révision</option>
          <option value="DRAFT">Brouillon</option>
          <option value="SUSPENDED">Suspendu</option>
        </select>
        <span style={{ fontSize: '0.78rem', color: '#7A6D5A', marginLeft: 'auto' }}>
          {loading ? '…' : `${filtered.length} guide${filtered.length !== 1 ? 's' : ''}`}
        </span>
      </div>

      {/* Error */}
      {error && (
        <div style={{ background: '#FEE2E2', border: '1px solid #FCA5A5', borderRadius: 8, padding: '0.75rem 1rem', fontSize: '0.83rem', color: '#DC2626' }}>
          {error} — <button onClick={fetchGuides} style={{ color: '#DC2626', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', textDecoration: 'underline' }}>Réessayer</button>
        </div>
      )}

      {/* Table */}
      <div style={{ background: 'white', border: '1px solid #E8DFC8', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 720 }}>
            <thead>
              <tr style={{ background: '#F5F2EC', borderBottom: '1px solid #E8DFC8' }}>
                {['Nom / Email', 'Ville', 'Langues', 'Réservations', 'Inscrit le', 'Statut', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#7A6D5A', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #F0EBE0' }}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} style={{ padding: '1rem' }}>
                        <div style={{ height: 14, background: '#F0EDE8', borderRadius: 4, width: j === 0 ? 140 : 60 }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: '#7A6D5A', fontSize: '0.85rem' }}>
                    Aucun guide trouvé
                  </td>
                </tr>
              ) : (
                filtered.map((g, i) => {
                  const sc = STATUS_CONFIG[g.status] || { label: g.status, color: '#6B7280', bg: '#F3F4F6' };
                  const isActive = g.status === 'ACTIVE';
                  const isToggling = toggling === g.id;
                  return (
                    <tr key={g.id} style={{ borderBottom: '1px solid #F0EBE0', background: i % 2 === 0 ? 'white' : '#FAFAF8' }}>
                      <td style={{ padding: '0.875rem 1rem' }}>
                        <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#1A1209' }}>{g.name || '—'}</div>
                        <div style={{ fontSize: '0.7rem', color: '#7A6D5A', marginTop: 2 }}>{g.email}</div>
                      </td>
                      <td style={{ padding: '0.875rem 1rem', fontSize: '0.82rem', color: '#4A3F30' }}>{g.city || '—'}</td>
                      <td style={{ padding: '0.875rem 1rem', fontSize: '0.75rem', color: '#7A6D5A', maxWidth: 140 }}>{g.langs || '—'}</td>
                      <td style={{ padding: '0.875rem 1rem', fontSize: '0.9rem', fontWeight: 700, color: '#1A1209', textAlign: 'center' }}>{g.reservations}</td>
                      <td style={{ padding: '0.875rem 1rem', fontSize: '0.75rem', color: '#7A6D5A', whiteSpace: 'nowrap' }}>{g.joined}</td>
                      <td style={{ padding: '0.875rem 1rem' }}>
                        <span style={{ display: 'inline-block', background: sc.bg, color: sc.color, fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.06em', padding: '0.28rem 0.65rem', borderRadius: 20, whiteSpace: 'nowrap' }}>
                          {sc.label}
                        </span>
                      </td>
                      <td style={{ padding: '0.875rem 1rem' }}>
                        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                          <button
                            onClick={() => handleToggle(g)}
                            disabled={isToggling}
                            style={{
                              padding: '6px 14px', borderRadius: 50, border: 'none', cursor: isToggling ? 'not-allowed' : 'pointer',
                              background: isActive ? '#DC2626' : '#1D5C3A', color: 'white',
                              fontSize: '0.7rem', fontWeight: 700, fontFamily: 'inherit',
                              opacity: isToggling ? 0.6 : 1, whiteSpace: 'nowrap',
                            }}
                          >
                            {isToggling ? '…' : isActive ? 'Suspendre' : 'Activer'}
                          </button>
                          {g.slug && (
                            <>
                              <Link
                                href={`/admin/guides/${g.slug}`}
                                style={{ padding: '6px 16px', borderRadius: 50, border: 'none', background: '#1A1209', color: '#F0D897', fontSize: '0.75rem', fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                              >
                                Gérer ✏️
                              </Link>
                              <Link
                                href={`/guides/${g.slug}`}
                                target="_blank"
                                style={{ padding: '6px 14px', borderRadius: 50, border: '1px solid #E8DFC8', background: 'white', color: '#7A6D5A', fontSize: '0.75rem', fontWeight: 600, textDecoration: 'none', whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center' }}
                              >
                                Public ↗
                              </Link>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
