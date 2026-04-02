'use client';

import { useState } from 'react';

const PELERINS = [
  { id: 1,  name: 'Fatima Benali',    email: 'fatima@gmail.com',  phone: '+33 6 11 22 33 44', city: 'Paris',       reservations: 2, joined: '15/01/2026', status: 'ACTIF' },
  { id: 2,  name: 'Amina Toure',      email: 'amina@gmail.com',   phone: '+33 6 55 66 77 88', city: 'Lyon',        reservations: 1, joined: '03/02/2026', status: 'ACTIF' },
  { id: 3,  name: 'Mohammed Saidi',   email: 'msaidi@gmail.com',  phone: '+33 6 44 55 66 77', city: 'Marseille',   reservations: 3, joined: '20/11/2025', status: 'ACTIF' },
  { id: 4,  name: 'Khadija Al-Amin',  email: 'khadija@gmail.com', phone: '+33 7 12 34 56 78', city: 'Bordeaux',    reservations: 1, joined: '10/03/2026', status: 'ACTIF' },
  { id: 5,  name: 'Ahmed Bouzid',     email: 'ahmed@gmail.com',   phone: '+33 6 98 76 54 32', city: 'Strasbourg',  reservations: 0, joined: '25/03/2026', status: 'INACTIF' },
  { id: 6,  name: 'Sara Mansour',     email: 'sara@gmail.com',    phone: '+33 6 23 45 67 89', city: 'Nantes',      reservations: 2, joined: '18/12/2025', status: 'ACTIF' },
  { id: 7,  name: 'Rachid Benhaddou', email: 'rachid@gmail.com',  phone: '+33 7 87 65 43 21', city: 'Lille',       reservations: 0, joined: '28/03/2026', status: 'INACTIF' },
  { id: 8,  name: 'Leila Kaci',       email: 'leila@gmail.com',   phone: '+33 6 11 99 88 77', city: 'Nice',        reservations: 1, joined: '14/02/2026', status: 'ACTIF' },
];

const STATUS: Record<string, { color: string; bg: string }> = {
  'ACTIF':   { color: '#16A34A', bg: '#DCFCE7' },
  'INACTIF': { color: '#7A6D5A', bg: '#F5F3EF' },
};

const card: React.CSSProperties = {
  background: '#FFFFFF', borderRadius: 12,
  boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
  border: '1px solid #E8DFC8', overflow: 'hidden',
};

export default function AdminPelerins() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('TOUS');

  const visible = PELERINS
    .filter(p => filter === 'TOUS' || p.status === filter)
    .filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.email.toLowerCase().includes(search.toLowerCase()));

  const stats = [
    { label: 'Total inscrits',   value: '1 284' },
    { label: 'Actifs ce mois',   value: '312' },
    { label: 'Nouveaux (30j)',   value: '128' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
        {stats.map(s => (
          <div key={s.label} style={{ ...card, padding: '1.25rem 1.5rem', overflow: 'visible' }}>
            <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#7A6D5A', marginBottom: '0.4rem' }}>
              {s.label}
            </div>
            <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.8rem', fontWeight: 700, color: '#1A1209' }}>{s.value}</div>
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
            style={{
              width: '100%', padding: '0.55rem 1rem 0.55rem 2.2rem', boxSizing: 'border-box',
              background: '#FFFFFF', border: '1px solid #E8DFC8', borderRadius: 8,
              fontSize: '0.83rem', color: '#1A1209', outline: 'none', fontFamily: 'inherit',
            }}
          />
        </div>
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          {['TOUS', 'ACTIF', 'INACTIF'].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: '0.45rem 0.9rem', borderRadius: 20, cursor: 'pointer',
              fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.04em', fontFamily: 'inherit',
              background: filter === f ? '#1A1209' : '#FFFFFF',
              color: filter === f ? '#F0D897' : '#7A6D5A',
              boxShadow: filter === f ? 'none' : '0 1px 2px rgba(0,0,0,0.06)',
              border: `1px solid ${filter === f ? '#1A1209' : '#E8DFC8'}`,
            }}>
              {f}
            </button>
          ))}
        </div>
        <div style={{ marginLeft: 'auto', fontSize: '0.78rem', color: '#7A6D5A' }}>
          {visible.length} pèlerin{visible.length > 1 ? 's' : ''}
        </div>
      </div>

      {/* Table */}
      <div style={card}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#F5F3EF', borderBottom: '1px solid #E8DFC8' }}>
              {['Pèlerin', 'Téléphone', 'Ville', 'Réservations', 'Inscrit le', 'Statut'].map(h => (
                <th key={h} style={{
                  padding: '0.75rem 1.25rem', textAlign: 'left',
                  fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em',
                  textTransform: 'uppercase', color: '#7A6D5A', whiteSpace: 'nowrap',
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: '#7A6D5A', fontSize: '0.85rem' }}>
                  Aucun pèlerin trouvé
                </td>
              </tr>
            )}
            {visible.map((p, i) => (
              <tr key={p.id} style={{ background: i % 2 === 0 ? '#FFFFFF' : '#FAFAF8', borderBottom: '1px solid #F0EBE0' }}>
                <td style={{ padding: '1rem 1.25rem' }}>
                  <div style={{ fontWeight: 600, color: '#1A1209', fontSize: '0.85rem' }}>{p.name}</div>
                  <div style={{ fontSize: '0.7rem', color: '#7A6D5A', marginTop: 2 }}>{p.email}</div>
                </td>
                <td style={{ padding: '1rem 1.25rem', fontSize: '0.78rem', color: '#7A6D5A' }}>{p.phone}</td>
                <td style={{ padding: '1rem 1.25rem', fontSize: '0.83rem', color: '#4A3F30' }}>{p.city}</td>
                <td style={{ padding: '1rem 1.25rem', fontSize: '0.9rem', fontWeight: 700, color: '#1A1209' }}>{p.reservations}</td>
                <td style={{ padding: '1rem 1.25rem', fontSize: '0.78rem', color: '#7A6D5A' }}>{p.joined}</td>
                <td style={{ padding: '1rem 1.25rem' }}>
                  <span style={{
                    fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.06em',
                    padding: '0.3rem 0.65rem', borderRadius: 20,
                    background: STATUS[p.status].bg, color: STATUS[p.status].color,
                  }}>
                    {p.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
