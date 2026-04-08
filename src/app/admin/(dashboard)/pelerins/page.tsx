'use client';

import { useState, useEffect } from 'react';

type Pelerin = {
  id: string;
  name: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  country: string | null;
  phoneWhatsapp: string | null;
  createdAt: string;
  lastLogin: string | null;
  reservationCount: number;
  totalSpent: number;
};

const card: React.CSSProperties = {
  background: '#FFFFFF', borderRadius: 12,
  boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
  border: '1px solid #E8DFC8',
};

export default function AdminPelerins() {
  const [pelerins, setPelerins] = useState<Pelerin[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [search, setSearch]     = useState('');
  const [filter, setFilter]     = useState('TOUS');

  const fetchPelerins = async () => {
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/admin/pelerins');
      if (!res.ok) throw new Error('Erreur ' + res.status);
      const data = await res.json();
      setPelerins(data.pelerins || []);
    } catch (e: any) { setError(e.message || 'Erreur réseau'); }
    setLoading(false);
  };

  useEffect(() => { fetchPelerins(); }, []);

  const visible = pelerins
    .filter(p => {
      if (filter === 'AVEC') return p.reservationCount > 0;
      if (filter === 'SANS') return p.reservationCount === 0;
      return true;
    })
    .filter(p =>
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.email.toLowerCase().includes(search.toLowerCase())
    );

  const stats = [
    { label: 'Total inscrits',        value: pelerins.length,                                   color: '#1A1209', bg: 'white' },
    { label: 'Avec réservation',      value: pelerins.filter(p => p.reservationCount > 0).length, color: '#1D5C3A', bg: '#D1FAE5' },
    { label: 'Sans réservation',      value: pelerins.filter(p => p.reservationCount === 0).length, color: '#92400E', bg: '#FEF3C7' },
  ];

  const FILTERS = [
    { key: 'TOUS', label: 'Tous' },
    { key: 'AVEC', label: 'Avec réservation' },
    { key: 'SANS', label: 'Sans réservation' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', fontFamily: 'var(--font-manrope, sans-serif)' }}>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
        {stats.map(s => (
          <div key={s.label} style={{ ...card, background: s.bg, padding: '1.25rem 1.5rem' }}>
            <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#7A6D5A', marginBottom: '0.4rem' }}>
              {s.label}
            </div>
            <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.8rem', fontWeight: 700, color: s.color }}>
              {loading ? '—' : s.value}
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1 1 220px', maxWidth: 320 }}>
          <svg style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
            width="15" height="15" fill="none" stroke="#7A6D5A" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher un pèlerin…"
            style={{ width: '100%', padding: '0.55rem 1rem 0.55rem 2.2rem', boxSizing: 'border-box', background: '#FFFFFF', border: '1px solid #E8DFC8', borderRadius: 8, fontSize: '0.83rem', color: '#1A1209', outline: 'none', fontFamily: 'inherit' }}
          />
        </div>
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          {FILTERS.map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)} style={{
              padding: '0.45rem 0.9rem', borderRadius: 20, cursor: 'pointer',
              fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.04em', fontFamily: 'inherit',
              background: filter === f.key ? '#1A1209' : '#FFFFFF',
              color: filter === f.key ? '#F0D897' : '#7A6D5A',
              border: `1px solid ${filter === f.key ? '#1A1209' : '#E8DFC8'}`,
            }}>
              {f.label}
            </button>
          ))}
        </div>
        <div style={{ marginLeft: 'auto', fontSize: '0.78rem', color: '#7A6D5A' }}>
          {loading ? '…' : `${visible.length} pèlerin${visible.length > 1 ? 's' : ''}`}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{ background: '#FEE2E2', border: '1px solid #FCA5A5', borderRadius: 8, padding: '0.75rem 1rem', fontSize: '0.83rem', color: '#DC2626' }}>
          {error} — <button onClick={fetchPelerins} style={{ color: '#DC2626', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', textDecoration: 'underline' }}>Réessayer</button>
        </div>
      )}

      {/* Table */}
      <div style={{ ...card, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 680 }}>
            <thead>
              <tr style={{ background: '#F5F3EF', borderBottom: '1px solid #E8DFC8' }}>
                {['Pèlerin', 'Téléphone', 'Pays', 'Réservations', 'Total dépensé', 'Inscrit le', 'Dernière connexion'].map(h => (
                  <th key={h} style={{ padding: '0.75rem 1.1rem', textAlign: 'left', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#7A6D5A', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #F0EBE0' }}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} style={{ padding: '1rem 1.1rem' }}>
                        <div style={{ height: 13, background: '#F0EDE8', borderRadius: 4, width: j === 0 ? 130 : 60 }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : visible.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: '#7A6D5A', fontSize: '0.85rem' }}>
                    Aucun pèlerin trouvé
                  </td>
                </tr>
              ) : (
                visible.map((p, i) => (
                  <tr key={p.id} style={{ background: i % 2 === 0 ? '#FFFFFF' : '#FAFAF8', borderBottom: '1px solid #F0EBE0' }}>
                    <td style={{ padding: '0.875rem 1.1rem' }}>
                      <div style={{ fontWeight: 600, color: '#1A1209', fontSize: '0.85rem' }}>{p.name}</div>
                      <div style={{ fontSize: '0.7rem', color: '#7A6D5A', marginTop: 2 }}>{p.email}</div>
                    </td>
                    <td style={{ padding: '0.875rem 1.1rem', fontSize: '0.78rem', color: '#7A6D5A' }}>{p.phoneWhatsapp || '—'}</td>
                    <td style={{ padding: '0.875rem 1.1rem', fontSize: '0.82rem', color: '#4A3F30' }}>{p.country || '—'}</td>
                    <td style={{ padding: '0.875rem 1.1rem', textAlign: 'center' }}>
                      <span style={{
                        display: 'inline-block', fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.1rem', fontWeight: 700,
                        color: p.reservationCount > 0 ? '#1D5C3A' : '#7A6D5A',
                      }}>{p.reservationCount}</span>
                    </td>
                    <td style={{ padding: '0.875rem 1.1rem', fontSize: '0.85rem', fontWeight: 700, color: '#1A1209' }}>
                      {p.totalSpent > 0 ? `${p.totalSpent} €` : '—'}
                    </td>
                    <td style={{ padding: '0.875rem 1.1rem', fontSize: '0.75rem', color: '#7A6D5A', whiteSpace: 'nowrap' }}>{p.createdAt}</td>
                    <td style={{ padding: '0.875rem 1.1rem', fontSize: '0.75rem', color: '#9A8A7A', whiteSpace: 'nowrap' }}>{p.lastLogin || '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
