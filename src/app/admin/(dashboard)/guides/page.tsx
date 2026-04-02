'use client';

import { useState } from 'react';

const GUIDES = [
  { id: 1, name: 'Ibrahim Al-Rashid', email: 'ibrahim@gmail.com', city: 'Paris', langs: 'AR, FR', reservations: 0, joined: '2026-03-28', status: 'EN ATTENTE' },
  { id: 2, name: 'Youssef Malik', email: 'youssef@gmail.com', city: 'Lyon', langs: 'AR, FR, EN', reservations: 14, joined: '2025-11-12', status: 'ACTIF' },
  { id: 3, name: 'Omar Benali', email: 'omar@gmail.com', city: 'Marseille', langs: 'AR, FR', reservations: 8, joined: '2025-12-01', status: 'ACTIF' },
  { id: 4, name: 'Hassan Toure', email: 'hassan@gmail.com', city: 'Bordeaux', langs: 'AR, FR', reservations: 22, joined: '2025-09-15', status: 'ACTIF' },
  { id: 5, name: 'Karim Mansouri', email: 'karim@gmail.com', city: 'Lille', langs: 'AR, FR, EN', reservations: 3, joined: '2026-01-20', status: 'SUSPENDU' },
  { id: 6, name: 'Tariq Al-Farouk', email: 'tariq@gmail.com', city: 'Nice', langs: 'AR, FR', reservations: 0, joined: '2026-03-30', status: 'EN ATTENTE' },
  { id: 7, name: 'Bilal Choudhry', email: 'bilal@gmail.com', city: 'Toulouse', langs: 'AR, EN, UR', reservations: 11, joined: '2025-10-08', status: 'ACTIF' },
];

const STATUS_COLORS: Record<string, string> = {
  'EN ATTENTE': '#F0B44C',
  'ACTIF': '#4CAF9A',
  'SUSPENDU': '#F06C4C',
};

export default function AdminGuides() {
  const [filter, setFilter] = useState('TOUS');
  const filters = ['TOUS', 'EN ATTENTE', 'ACTIF', 'SUSPENDU'];

  const visible = filter === 'TOUS' ? GUIDES : GUIDES.filter(g => g.status === filter);

  return (
    <div>
      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
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
        <div style={{ marginLeft: 'auto', fontSize: '0.78rem', color: 'rgba(255,255,255,0.35)', lineHeight: '34px' }}>
          {visible.length} guide{visible.length > 1 ? 's' : ''}
        </div>
      </div>

      {/* Table */}
      <div style={{ background: '#1A1209', border: '1px solid rgba(201,168,76,0.15)', borderRadius: 16, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              {['Guide', 'Ville', 'Langues', 'Réservations', 'Inscrit le', 'Statut', 'Actions'].map(h => (
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
            {visible.map((g, i) => (
              <tr key={g.id} style={{ borderBottom: i < visible.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                <td style={{ padding: '1rem 1.25rem' }}>
                  <div style={{ fontWeight: 600, color: 'white', fontSize: '0.85rem' }}>{g.name}</div>
                  <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)' }}>{g.email}</div>
                </td>
                <td style={{ padding: '1rem 1.25rem', fontSize: '0.82rem', color: 'rgba(255,255,255,0.6)' }}>{g.city}</td>
                <td style={{ padding: '1rem 1.25rem', fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)' }}>{g.langs}</td>
                <td style={{ padding: '1rem 1.25rem', fontSize: '0.85rem', fontWeight: 700, color: 'white' }}>{g.reservations}</td>
                <td style={{ padding: '1rem 1.25rem', fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)' }}>{g.joined}</td>
                <td style={{ padding: '1rem 1.25rem' }}>
                  <span style={{
                    fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.08em',
                    padding: '0.3rem 0.65rem', borderRadius: 20,
                    background: `${STATUS_COLORS[g.status]}22`, color: STATUS_COLORS[g.status],
                  }}>
                    {g.status}
                  </span>
                </td>
                <td style={{ padding: '1rem 1.25rem' }}>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    {g.status === 'EN ATTENTE' && (
                      <button style={{
                        padding: '0.3rem 0.7rem', borderRadius: 6, border: 'none',
                        background: '#4CAF9A22', color: '#4CAF9A',
                        fontSize: '0.68rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                      }}>
                        Valider
                      </button>
                    )}
                    {g.status === 'ACTIF' && (
                      <button style={{
                        padding: '0.3rem 0.7rem', borderRadius: 6, border: 'none',
                        background: '#F06C4C22', color: '#F06C4C',
                        fontSize: '0.68rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                      }}>
                        Suspendre
                      </button>
                    )}
                    {g.status === 'SUSPENDU' && (
                      <button style={{
                        padding: '0.3rem 0.7rem', borderRadius: 6, border: 'none',
                        background: '#4CAF9A22', color: '#4CAF9A',
                        fontSize: '0.68rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                      }}>
                        Réactiver
                      </button>
                    )}
                    <button style={{
                      padding: '0.3rem 0.7rem', borderRadius: 6, border: 'none',
                      background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.5)',
                      fontSize: '0.68rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                    }}>
                      Voir
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
