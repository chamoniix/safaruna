'use client';

import { useState } from 'react';

const RESERVATIONS = [
  { id: 'RES-2847', pelerin: 'Fatima Benali', guide: 'Omar Benali', date: '2026-04-15', nights: 7, amount: 1400, status: 'CONFIRMÉE' },
  { id: 'RES-2846', pelerin: 'Mohammed Saidi', guide: 'Youssef Malik', date: '2026-04-20', nights: 10, amount: 2100, status: 'EN ATTENTE' },
  { id: 'RES-2845', pelerin: 'Amina Toure', guide: 'Hassan Toure', date: '2026-03-28', nights: 5, amount: 950, status: 'TERMINÉE' },
  { id: 'RES-2844', pelerin: 'Khadija Al-Amin', guide: 'Bilal Choudhry', date: '2026-04-10', nights: 7, amount: 1200, status: 'CONFIRMÉE' },
  { id: 'RES-2843', pelerin: 'Sara Mansour', guide: 'Omar Benali', date: '2026-03-15', nights: 7, amount: 1350, status: 'TERMINÉE' },
  { id: 'RES-2842', pelerin: 'Rachid Benhaddou', guide: 'Hassan Toure', date: '2026-05-01', nights: 14, amount: 2800, status: 'EN ATTENTE' },
  { id: 'RES-2841', pelerin: 'Leila Kaci', guide: 'Youssef Malik', date: '2026-03-20', nights: 5, amount: 850, status: 'ANNULÉE' },
  { id: 'RES-2840', pelerin: 'Ahmed Bouzid', guide: 'Bilal Choudhry', date: '2026-04-25', nights: 7, amount: 1300, status: 'CONFIRMÉE' },
];

const STATUS_COLORS: Record<string, string> = {
  'CONFIRMÉE': '#4CAF9A',
  'EN ATTENTE': '#F0B44C',
  'TERMINÉE': 'rgba(255,255,255,0.4)',
  'ANNULÉE': '#F06C4C',
};

export default function AdminReservations() {
  const [filter, setFilter] = useState('TOUTES');
  const filters = ['TOUTES', 'EN ATTENTE', 'CONFIRMÉE', 'TERMINÉE', 'ANNULÉE'];

  const visible = filter === 'TOUTES' ? RESERVATIONS : RESERVATIONS.filter(r => r.status === filter);
  const totalRevenue = visible.filter(r => r.status !== 'ANNULÉE').reduce((s, r) => s + r.amount, 0);

  return (
    <div>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', alignItems: 'center' }}>
        {filters.map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '0.45rem 1rem', borderRadius: 20, border: 'none', cursor: 'pointer',
            fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.06em', fontFamily: 'inherit',
            background: filter === f ? '#C9A84C' : 'rgba(255,255,255,0.07)',
            color: filter === f ? '#1A1209' : 'rgba(255,255,255,0.5)',
          }}>
            {f}
          </button>
        ))}
        <div style={{ marginLeft: 'auto', fontSize: '0.78rem', color: 'rgba(255,255,255,0.35)' }}>
          {visible.length} réservation{visible.length > 1 ? 's' : ''} &middot; <span style={{ color: '#C9A84C', fontWeight: 700 }}>{totalRevenue.toLocaleString('fr-FR')} €</span>
        </div>
      </div>

      <div style={{ background: '#1A1209', border: '1px solid rgba(201,168,76,0.15)', borderRadius: 16, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              {['ID', 'Pèlerin', 'Guide', 'Date départ', 'Nuits', 'Montant', 'Statut', 'Actions'].map(h => (
                <th key={h} style={{
                  padding: '0.875rem 1.25rem', textAlign: 'left',
                  fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.12em',
                  textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)',
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map((r, i) => (
              <tr key={r.id} style={{ borderBottom: i < visible.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                <td style={{ padding: '1rem 1.25rem', fontSize: '0.72rem', fontWeight: 700, color: '#C9A84C', fontVariantNumeric: 'tabular-nums' }}>{r.id}</td>
                <td style={{ padding: '1rem 1.25rem', fontSize: '0.82rem', color: 'white', fontWeight: 600 }}>{r.pelerin}</td>
                <td style={{ padding: '1rem 1.25rem', fontSize: '0.82rem', color: 'rgba(255,255,255,0.6)' }}>{r.guide}</td>
                <td style={{ padding: '1rem 1.25rem', fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)' }}>{r.date}</td>
                <td style={{ padding: '1rem 1.25rem', fontSize: '0.82rem', color: 'rgba(255,255,255,0.6)' }}>{r.nights}n</td>
                <td style={{ padding: '1rem 1.25rem', fontSize: '0.85rem', fontWeight: 700, color: 'white' }}>{r.amount.toLocaleString('fr-FR')} €</td>
                <td style={{ padding: '1rem 1.25rem' }}>
                  <span style={{
                    fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.08em',
                    padding: '0.3rem 0.65rem', borderRadius: 20,
                    background: `${STATUS_COLORS[r.status]}22`, color: STATUS_COLORS[r.status],
                  }}>
                    {r.status}
                  </span>
                </td>
                <td style={{ padding: '1rem 1.25rem' }}>
                  <button style={{
                    padding: '0.3rem 0.7rem', borderRadius: 6, border: 'none',
                    background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.5)',
                    fontSize: '0.68rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                  }}>
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
