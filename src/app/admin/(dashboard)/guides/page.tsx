'use client';

import { useState } from 'react';

const GUIDES = [
  { id: 1, name: 'Ibrahim Al-Rashid', email: 'ibrahim@gmail.com', city: 'Paris',      langs: 'AR, FR',     reservations: 0,  joined: '28/03/2026', status: 'EN ATTENTE' },
  { id: 2, name: 'Youssef Malik',     email: 'youssef@gmail.com', city: 'Lyon',       langs: 'AR, FR, EN', reservations: 14, joined: '12/11/2025', status: 'ACTIF' },
  { id: 3, name: 'Omar Benali',       email: 'omar@gmail.com',    city: 'Marseille',  langs: 'AR, FR',     reservations: 8,  joined: '01/12/2025', status: 'ACTIF' },
  { id: 4, name: 'Hassan Toure',      email: 'hassan@gmail.com',  city: 'Bordeaux',   langs: 'AR, FR',     reservations: 22, joined: '15/09/2025', status: 'ACTIF' },
  { id: 5, name: 'Karim Mansouri',    email: 'karim@gmail.com',   city: 'Lille',      langs: 'AR, FR, EN', reservations: 3,  joined: '20/01/2026', status: 'SUSPENDU' },
  { id: 6, name: 'Tariq Al-Farouk',   email: 'tariq@gmail.com',   city: 'Nice',       langs: 'AR, FR',     reservations: 0,  joined: '30/03/2026', status: 'EN ATTENTE' },
  { id: 7, name: 'Bilal Choudhry',    email: 'bilal@gmail.com',   city: 'Toulouse',   langs: 'AR, EN, UR', reservations: 11, joined: '08/10/2025', status: 'ACTIF' },
];

const STATUS: Record<string, { color: string; bg: string }> = {
  'ACTIF':       { color: '#16A34A', bg: '#DCFCE7' },
  'EN ATTENTE':  { color: '#D97706', bg: '#FEF3C7' },
  'SUSPENDU':    { color: '#DC2626', bg: '#FEE2E2' },
};

const card: React.CSSProperties = {
  background: '#FFFFFF', borderRadius: 12,
  boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
  border: '1px solid #E8DFC8', overflow: 'hidden',
};

export default function AdminGuides() {
  const [filter, setFilter]   = useState('TOUS');
  const [search, setSearch]   = useState('');
  const filters = ['TOUS', 'EN ATTENTE', 'ACTIF', 'SUSPENDU'];

  const visible = GUIDES
    .filter(g => filter === 'TOUS' || g.status === filter)
    .filter(g => !search || g.name.toLowerCase().includes(search.toLowerCase()) || g.email.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* Toolbar */}
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: '1 1 220px', maxWidth: 320 }}>
          <svg style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
            width="15" height="15" fill="none" stroke="#7A6D5A" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher un guide…"
            style={{
              width: '100%', padding: '0.55rem 1rem 0.55rem 2.2rem', boxSizing: 'border-box',
              background: '#FFFFFF', border: '1px solid #E8DFC8', borderRadius: 8,
              fontSize: '0.83rem', color: '#1A1209', outline: 'none', fontFamily: 'inherit',
            }}
          />
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          {filters.map(f => (
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
          {visible.length} guide{visible.length > 1 ? 's' : ''}
        </div>
      </div>

      {/* Table */}
      <div style={card}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#F5F3EF', borderBottom: '1px solid #E8DFC8' }}>
              {['Guide', 'Ville', 'Langues', 'Réservations', 'Inscrit le', 'Statut', 'Actions'].map(h => (
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
                <td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: '#7A6D5A', fontSize: '0.85rem' }}>
                  Aucun guide trouvé
                </td>
              </tr>
            )}
            {visible.map((g, i) => (
              <tr key={g.id} style={{
                background: i % 2 === 0 ? '#FFFFFF' : '#FAFAF8',
                borderBottom: '1px solid #F0EBE0',
              }}>
                <td style={{ padding: '1rem 1.25rem' }}>
                  <div style={{ fontWeight: 600, color: '#1A1209', fontSize: '0.85rem' }}>{g.name}</div>
                  <div style={{ fontSize: '0.7rem', color: '#7A6D5A', marginTop: 2 }}>{g.email}</div>
                </td>
                <td style={{ padding: '1rem 1.25rem', fontSize: '0.83rem', color: '#4A3F30' }}>{g.city}</td>
                <td style={{ padding: '1rem 1.25rem', fontSize: '0.78rem', color: '#7A6D5A' }}>{g.langs}</td>
                <td style={{ padding: '1rem 1.25rem', fontSize: '0.9rem', fontWeight: 700, color: '#1A1209' }}>{g.reservations}</td>
                <td style={{ padding: '1rem 1.25rem', fontSize: '0.78rem', color: '#7A6D5A' }}>{g.joined}</td>
                <td style={{ padding: '1rem 1.25rem' }}>
                  <span style={{
                    fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.06em',
                    padding: '0.3rem 0.65rem', borderRadius: 20,
                    background: STATUS[g.status].bg, color: STATUS[g.status].color,
                  }}>
                    {g.status}
                  </span>
                </td>
                <td style={{ padding: '1rem 1.25rem' }}>
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'nowrap' }}>
                    {g.status === 'EN ATTENTE' && (
                      <button style={{ padding: '0.3rem 0.7rem', borderRadius: 6, border: '1px solid #16A34A', background: '#DCFCE7', color: '#16A34A', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
                        Valider
                      </button>
                    )}
                    {g.status === 'ACTIF' && (
                      <button style={{ padding: '0.3rem 0.7rem', borderRadius: 6, border: '1px solid #DC2626', background: '#FEE2E2', color: '#DC2626', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
                        Suspendre
                      </button>
                    )}
                    {g.status === 'SUSPENDU' && (
                      <button style={{ padding: '0.3rem 0.7rem', borderRadius: 6, border: '1px solid #16A34A', background: '#DCFCE7', color: '#16A34A', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
                        Réactiver
                      </button>
                    )}
                    <button style={{ padding: '0.3rem 0.7rem', borderRadius: 6, border: '1px solid #E8DFC8', background: '#FFFFFF', color: '#7A6D5A', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
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
