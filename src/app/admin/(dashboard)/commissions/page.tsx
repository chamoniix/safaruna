'use client';
import { useState, useEffect } from 'react';

type GuideRow = { id: string; slug: string | null; name: string; totalReservations: number; totalRevenue: number; totalCommission: number };

export default function AdminCommissions() {
  const [guides, setGuides]         = useState<GuideRow[]>([]);
  const [loading, setLoading]       = useState(true);
  const [markupRate, setMarkupRate] = useState(30);
  const [error, setError]           = useState('');

  useEffect(() => {
    let active = true;
    fetch('/api/admin/commissions', { cache: 'no-store' })
      .then(async res => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Impossible de charger les commissions.');
        if (!active) return;
        setGuides(data.guides || []);
        setMarkupRate(data.markupRate ?? 30);
      })
      .catch(fetchError => {
        if (active) setError(fetchError instanceof Error ? fetchError.message : 'Impossible de charger les commissions.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  const card: React.CSSProperties = { background: 'white', border: '1px solid #E8DFC8', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', fontFamily: 'var(--font-manrope, sans-serif)' }}>
      <div>
        <h1 style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.75rem', fontWeight: 700, color: '#1A1209', margin: 0 }}>Gestion des commissions</h1>
      </div>

      {/* Info card */}
      <div style={{ ...card, padding: '1rem 1.5rem', background: '#FEF9E7', border: '1px solid #FCD34D' }}>
        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#92400E', marginBottom: 4 }}>Majoration serveur : {markupRate} % du tarif net guide</div>
        <div style={{ fontSize: '0.78rem', color: '#78350F', lineHeight: 1.6 }}>
          Source unique utilisée par le checkout. La commission réalisée correspond au montant payé par le client moins les rémunérations nettes des guides.
        </div>
      </div>

      {error && (
        <div style={{ background: '#FEE2E2', border: '1px solid #FCA5A5', borderRadius: 8, padding: '0.75rem 1rem', fontSize: '0.83rem', color: '#DC2626' }}>
          {error}
        </div>
      )}

      {/* Table */}
      <div style={{ ...card, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 640 }}>
            <thead>
              <tr style={{ background: '#F5F2EC', borderBottom: '1px solid #E8DFC8' }}>
                {['Guide', 'Majoration', 'Réservations', 'Revenus générés', 'Commission réalisée'].map(h => (
                  <th key={h} style={{ padding: '0.75rem 0.875rem', textAlign: 'left', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#7A6D5A', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #F0EBE0' }}>
                    {Array.from({ length: 5 }).map((_, j) => (
                      <td key={j} style={{ padding: '0.875rem' }}><div style={{ height: 12, background: '#F0EDE8', borderRadius: 4 }} /></td>
                    ))}
                  </tr>
                ))
              ) : guides.length === 0 ? (
                <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: '#7A6D5A', fontSize: '0.85rem' }}>Aucun guide</td></tr>
              ) : (
                guides.map((g, i) => (
                  <tr key={g.id} style={{ borderBottom: '1px solid #F0EBE0', background: i % 2 === 0 ? 'white' : '#FAFAF8' }}>
                    <td style={{ padding: '0.75rem 0.875rem', fontSize: '0.85rem', fontWeight: 700, color: '#1A1209' }}>{g.name}</td>
                    <td style={{ padding: '0.75rem 0.875rem' }}>
                      <span style={{ background: '#FEF3C7', color: '#92400E', fontSize: '0.8rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: 20 }}>
                        {markupRate}%
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 0.875rem', fontSize: '0.82rem', color: '#4A3F30', textAlign: 'center' }}>{g.totalReservations}</td>
                    <td style={{ padding: '0.75rem 0.875rem', fontSize: '0.85rem', fontWeight: 600, color: '#1A1209', whiteSpace: 'nowrap' }}>{g.totalRevenue} €</td>
                    <td style={{ padding: '0.75rem 0.875rem', fontSize: '0.85rem', fontWeight: 700, color: '#1D5C3A', whiteSpace: 'nowrap' }}>{g.totalCommission} €</td>
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
