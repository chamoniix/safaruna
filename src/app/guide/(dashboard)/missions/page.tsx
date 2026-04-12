'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

type Mission = {
  id: string;
  refNumber: string;
  pelerinName: string;
  pelerinCountry: string | null;
  packageName: string;
  durationDays: number;
  startDate: string;
  endDate: string;
  nbPeople: number;
  totalPrice: number;
  status: string;
  review: { rating: number; comment: string } | null;
  createdAt: string;
};

type Data = {
  stats: { total: number; confirmed: number; completed: number; pending: number; thisMois: number };
  reservations: Mission[];
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  PENDING:   { label: 'En attente', color: '#D97706', bg: '#FEF3C7' },
  CONFIRMED: { label: 'Confirmée',  color: '#1D4ED8', bg: '#DBEAFE' },
  COMPLETED: { label: 'Terminée',   color: '#1D5C3A', bg: '#D1FAE5' },
  CANCELLED: { label: 'Annulée',    color: '#DC2626', bg: '#FEE2E2' },
};

const FILTERS = [
  { value: 'ALL',       label: 'Toutes' },
  { value: 'PENDING',   label: 'En attente' },
  { value: 'CONFIRMED', label: 'Confirmées' },
  { value: 'COMPLETED', label: 'Terminées' },
  { value: 'CANCELLED', label: 'Annulées' },
];

const card: React.CSSProperties = {
  background: 'white',
  border: '1px solid #E8DFC8',
  borderRadius: 12,
  boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
};

export default function GuideMissions() {
  const [data, setData] = useState<Data | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    setLoading(true);
    const qs = filter !== 'ALL' ? `?status=${filter}` : '';
    fetch(`/api/guide/missions${qs}`)
      .then(r => { if (!r.ok) throw new Error('Erreur ' + r.status); return r.json(); })
      .then(d => { setData(d); setLoading(false); })
      .catch((e: Error) => { setError(e.message); setLoading(false); });
  }, [filter]);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ ...card, height: 80, background: '#F0EDE8' }} />
        <div style={{ ...card, height: 300, background: '#F0EDE8' }} />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ background: '#FEE2E2', border: '1px solid #FCA5A5', borderRadius: 8, padding: '0.75rem 1rem', fontSize: '0.83rem', color: '#DC2626', fontFamily: 'var(--font-manrope, sans-serif)' }}>
        {error || 'Impossible de charger les données.'}{' '}
        <button onClick={() => setFilter(f => f)} style={{ color: '#DC2626', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Réessayer</button>
      </div>
    );
  }

  const { stats, reservations } = data;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', fontFamily: 'var(--font-manrope, sans-serif)' }}>

      {/* Header */}
      <div>
        <h1 style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.75rem', fontWeight: 700, color: '#1A1209', margin: 0 }}>Mes missions</h1>
        <p style={{ fontSize: '0.82rem', color: '#7A6D5A', marginTop: 4 }}>{stats.total} réservation{stats.total > 1 ? 's' : ''} au total · {stats.thisMois} ce mois</p>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
        {[
          { label: 'Total', value: stats.total, color: '#1A1209', bg: 'white' },
          { label: 'En attente', value: stats.pending, color: '#D97706', bg: '#FEF9E7' },
          { label: 'Confirmées', value: stats.confirmed, color: '#1D4ED8', bg: '#EFF6FF' },
          { label: 'Terminées', value: stats.completed, color: '#1D5C3A', bg: '#F0FDF4' },
        ].map(s => (
          <div key={s.label} style={{ ...card, background: s.bg, padding: '1rem 1.25rem' }}>
            <div style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#7A6D5A', marginBottom: '0.4rem' }}>{s.label}</div>
            <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '2rem', fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {FILTERS.map(f => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            style={{
              padding: '0.4rem 1rem',
              borderRadius: 50,
              fontSize: '0.78rem',
              fontWeight: filter === f.value ? 700 : 500,
              border: filter === f.value ? '1.5px solid #C9A84C' : '1px solid #E8DFC8',
              background: filter === f.value ? '#C9A84C' : 'white',
              color: filter === f.value ? '#1A1209' : '#7A6D5A',
              cursor: 'pointer',
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={{ ...card, overflow: 'hidden' }}>
        {reservations.length === 0 ? (
          <div style={{ padding: '3rem 2rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>🕌</div>
            <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.3rem', color: '#1A1209' }}>Aucune mission trouvée</div>
            <div style={{ fontSize: '0.8rem', color: '#7A6D5A', marginTop: '0.5rem' }}>Les réservations apparaîtront ici une fois votre profil actif.</div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 820 }}>
              <thead>
                <tr style={{ background: '#F5F2EC', borderBottom: '1px solid #E8DFC8' }}>
                  {['Réf', 'Pèlerin', 'Package', 'Dates', 'Pers.', 'Montant', 'Avis', 'Statut', ''].map(h => (
                    <th key={h} style={{ padding: '0.75rem 0.875rem', textAlign: 'left', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#7A6D5A', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {reservations.map((r, i) => {
                  const sc = STATUS_CONFIG[r.status] || { label: r.status, color: '#6B7280', bg: '#F3F4F6' };
                  return (
                    <tr key={r.id} style={{ background: i % 2 === 0 ? 'white' : '#FAFAF8', borderBottom: '1px solid #F0EBE0' }}>
                      <td style={{ padding: '0.75rem 0.875rem', fontSize: '0.72rem', fontWeight: 700, color: '#1A1209', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>{r.refNumber}</td>
                      <td style={{ padding: '0.75rem 0.875rem', fontSize: '0.82rem', fontWeight: 600, color: '#1A1209' }}>
                        {r.pelerinName}
                        {r.pelerinCountry && <span style={{ fontSize: '0.68rem', color: '#7A6D5A', display: 'block' }}>{r.pelerinCountry}</span>}
                      </td>
                      <td style={{ padding: '0.75rem 0.875rem', fontSize: '0.75rem', color: '#7A6D5A' }}>
                        {r.packageName}<br />
                        <span style={{ fontSize: '0.65rem' }}>{r.durationDays}j</span>
                      </td>
                      <td style={{ padding: '0.75rem 0.875rem', fontSize: '0.72rem', color: '#4A3F30', whiteSpace: 'nowrap' }}>
                        {r.startDate}<br />
                        <span style={{ color: '#7A6D5A' }}>→ {r.endDate}</span>
                      </td>
                      <td style={{ padding: '0.75rem 0.875rem', fontSize: '0.82rem', color: '#1A1209', textAlign: 'center' }}>{r.nbPeople}</td>
                      <td style={{ padding: '0.75rem 0.875rem', fontSize: '0.85rem', fontWeight: 700, color: '#1A1209', whiteSpace: 'nowrap' }}>{r.totalPrice} €</td>
                      <td style={{ padding: '0.75rem 0.875rem' }}>
                        {r.review ? (
                          <span title={r.review.comment} style={{ fontSize: '0.78rem', fontWeight: 700, color: '#1D5C3A' }}>★ {r.review.rating}/5</span>
                        ) : r.status === 'COMPLETED' ? (
                          <span style={{ fontSize: '0.7rem', color: '#9CA3AF', fontStyle: 'italic' }}>En attente</span>
                        ) : (
                          <span style={{ color: '#D1D5DB' }}>—</span>
                        )}
                      </td>
                      <td style={{ padding: '0.75rem 0.875rem' }}>
                        <span style={{ display: 'inline-block', background: sc.bg, color: sc.color, fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.06em', padding: '0.25rem 0.6rem', borderRadius: 20, whiteSpace: 'nowrap' }}>{sc.label}</span>
                      </td>
                      <td style={{ padding: '0.75rem 0.875rem', whiteSpace: 'nowrap' }}>
                        <Link
                          href={`/guide/missions/${r.id}`}
                          style={{ display: 'inline-block', padding: '0.35rem 0.875rem', borderRadius: 50, border: '1.5px solid #E8DFC8', background: 'white', color: '#1A1209', fontSize: '0.72rem', fontWeight: 700, textDecoration: 'none', fontFamily: 'inherit' }}
                        >
                          Voir les détails
                        </Link>
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
