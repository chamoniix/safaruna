'use client';

import { useState } from 'react';

const RESERVATIONS = [
  { id: 'RES-2847', pelerin: 'Fatima Benali',    guide: 'Omar Benali',    date: '15/04/2026', nights: 7,  amount: 1400, status: 'CONFIRMÉE' },
  { id: 'RES-2846', pelerin: 'Mohammed Saidi',   guide: 'Youssef Malik',  date: '20/04/2026', nights: 10, amount: 2100, status: 'EN ATTENTE' },
  { id: 'RES-2845', pelerin: 'Amina Toure',      guide: 'Hassan Toure',   date: '28/03/2026', nights: 5,  amount: 950,  status: 'TERMINÉE' },
  { id: 'RES-2844', pelerin: 'Khadija Al-Amin',  guide: 'Bilal Choudhry', date: '10/04/2026', nights: 7,  amount: 1200, status: 'CONFIRMÉE' },
  { id: 'RES-2843', pelerin: 'Sara Mansour',     guide: 'Omar Benali',    date: '15/03/2026', nights: 7,  amount: 1350, status: 'TERMINÉE' },
  { id: 'RES-2842', pelerin: 'Rachid Benhaddou', guide: 'Hassan Toure',   date: '01/05/2026', nights: 14, amount: 2800, status: 'EN ATTENTE' },
  { id: 'RES-2841', pelerin: 'Leila Kaci',       guide: 'Youssef Malik',  date: '20/03/2026', nights: 5,  amount: 850,  status: 'ANNULÉE' },
  { id: 'RES-2840', pelerin: 'Ahmed Bouzid',     guide: 'Bilal Choudhry', date: '25/04/2026', nights: 7,  amount: 1300, status: 'CONFIRMÉE' },
];

const STATUS: Record<string, { color: string; bg: string }> = {
  'CONFIRMÉE':  { color: '#16A34A', bg: '#DCFCE7' },
  'EN ATTENTE': { color: '#D97706', bg: '#FEF3C7' },
  'TERMINÉE':   { color: '#7A6D5A', bg: '#F5F3EF' },
  'ANNULÉE':    { color: '#DC2626', bg: '#FEE2E2' },
};

const card: React.CSSProperties = {
  background: '#FFFFFF', borderRadius: 12, overflow: 'hidden',
  boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #E8DFC8',
};

export default function AdminReservations() {
  const [filter, setFilter] = useState('TOUTES');
  const filters = ['TOUTES', 'EN ATTENTE', 'CONFIRMÉE', 'TERMINÉE', 'ANNULÉE'];

  const visible = filter === 'TOUTES' ? RESERVATIONS : RESERVATIONS.filter(r => r.status === filter);
  const total = visible.filter(r => r.status !== 'ANNULÉE').reduce((s, r) => s + r.amount, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {filters.map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: '0.45rem 0.9rem', borderRadius: 20, cursor: 'pointer',
              fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.04em', fontFamily: 'inherit',
              background: filter === f ? '#1A1209' : '#FFFFFF',
              color: filter === f ? '#F0D897' : '#7A6D5A',
              border: `1px solid ${filter === f ? '#1A1209' : '#E8DFC8'}`,
            }}>
              {f}
            </button>
          ))}
        </div>
        <div style={{ marginLeft: 'auto', fontSize: '0.78rem', color: '#7A6D5A' }}>
          {visible.length} résultat{visible.length > 1 ? 's' : ''} ·{' '}
          <span style={{ fontWeight: 700, color: '#1A1209' }}>{total.toLocaleString('fr-FR')} €</span>
        </div>
      </div>

      <div style={card}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#F5F3EF', borderBottom: '1px solid #E8DFC8' }}>
              {['ID', 'Pèlerin', 'Guide', 'Départ', 'Nuits', 'Montant', 'Statut', ''].map(h => (
                <th key={h} style={{ padding: '0.75rem 1.25rem', textAlign: 'left', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#7A6D5A', whiteSpace: 'nowrap' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map((r, i) => (
              <tr key={r.id} style={{ background: i % 2 === 0 ? '#FFFFFF' : '#FAFAF8', borderBottom: '1px solid #F0EBE0' }}>
                <td style={{ padding: '1rem 1.25rem', fontSize: '0.72rem', fontWeight: 700, color: '#C9A84C', fontVariantNumeric: 'tabular-nums' }}>{r.id}</td>
                <td style={{ padding: '1rem 1.25rem', fontSize: '0.85rem', fontWeight: 600, color: '#1A1209' }}>{r.pelerin}</td>
                <td style={{ padding: '1rem 1.25rem', fontSize: '0.83rem', color: '#4A3F30' }}>{r.guide}</td>
                <td style={{ padding: '1rem 1.25rem', fontSize: '0.78rem', color: '#7A6D5A' }}>{r.date}</td>
                <td style={{ padding: '1rem 1.25rem', fontSize: '0.83rem', color: '#4A3F30' }}>{r.nights}n</td>
                <td style={{ padding: '1rem 1.25rem', fontSize: '0.9rem', fontWeight: 700, color: '#1A1209' }}>{r.amount.toLocaleString('fr-FR')} €</td>
                <td style={{ padding: '1rem 1.25rem' }}>
                  <span style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.06em', padding: '0.3rem 0.65rem', borderRadius: 20, background: STATUS[r.status].bg, color: STATUS[r.status].color }}>
                    {r.status}
                  </span>
                </td>
                <td style={{ padding: '1rem 1.25rem' }}>
                  <button style={{ padding: '0.3rem 0.7rem', borderRadius: 6, border: '1px solid #E8DFC8', background: '#FFFFFF', color: '#7A6D5A', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                    Détails
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
