'use client';

import { useState } from 'react';

const LITIGES_DATA = [
  { id: 'LIT-0041', reservation: 'RES-2839', pelerin: 'Zohra Hamidi', guide: 'Omar Benali', subject: 'Guide absent au RDV Médine', opened: '2026-03-29', priority: 'HAUTE', status: 'OUVERT' },
  { id: 'LIT-0040', reservation: 'RES-2831', pelerin: 'Karim Bouazza', guide: 'Hassan Toure', subject: 'Prestation non conforme à l\'annonce', opened: '2026-03-22', priority: 'MOYENNE', status: 'EN COURS' },
  { id: 'LIT-0039', reservation: 'RES-2820', pelerin: 'Nadia Larbi', guide: 'Youssef Malik', subject: 'Demande de remboursement partiel', opened: '2026-03-18', priority: 'BASSE', status: 'RÉSOLU' },
  { id: 'LIT-0038', reservation: 'RES-2815', pelerin: 'Samir Belhaj', guide: 'Bilal Choudhry', subject: 'Hébergement non réservé', opened: '2026-03-10', priority: 'HAUTE', status: 'RÉSOLU' },
  { id: 'LIT-0037', reservation: 'RES-2847', pelerin: 'Fatima Benali', guide: 'Omar Benali', subject: 'Conflit sur le programme', opened: '2026-04-01', priority: 'MOYENNE', status: 'OUVERT' },
];

const PRIORITY_COLORS: Record<string, string> = {
  'HAUTE': '#F06C4C',
  'MOYENNE': '#F0B44C',
  'BASSE': '#4CAF9A',
};
const STATUS_COLORS: Record<string, string> = {
  'OUVERT': '#F06C4C',
  'EN COURS': '#F0B44C',
  'RÉSOLU': '#4CAF9A',
};

export default function AdminLitiges() {
  const [selected, setSelected] = useState<number | null>(null);
  const open = LITIGES_DATA.filter(l => l.status !== 'RÉSOLU').length;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: selected !== null ? '1fr 360px' : '1fr', gap: '1.5rem' }}>
      <div>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
          {[
            { label: 'Litiges ouverts', value: String(open), color: '#F06C4C' },
            { label: 'En cours', value: String(LITIGES_DATA.filter(l => l.status === 'EN COURS').length), color: '#F0B44C' },
            { label: 'Résolus (30j)', value: String(LITIGES_DATA.filter(l => l.status === 'RÉSOLU').length), color: '#4CAF9A' },
          ].map(s => (
            <div key={s.label} style={{
              flex: 1, background: '#1A1209', border: '1px solid rgba(201,168,76,0.12)',
              borderRadius: 12, padding: '1rem 1.25rem',
            }}>
              <div style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: '0.4rem' }}>{s.label}</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>

        <div style={{ background: '#1A1209', border: '1px solid rgba(201,168,76,0.15)', borderRadius: 16, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                {['ID', 'Objet', 'Pèlerin', 'Guide', 'Ouvert le', 'Priorité', 'Statut', ''].map(h => (
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
              {LITIGES_DATA.map((l, i) => (
                <tr key={l.id} style={{
                  borderBottom: i < LITIGES_DATA.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                  background: selected === i ? 'rgba(201,168,76,0.05)' : 'transparent',
                  cursor: 'pointer',
                }} onClick={() => setSelected(selected === i ? null : i)}>
                  <td style={{ padding: '1rem 1.25rem', fontSize: '0.72rem', fontWeight: 700, color: '#C9A84C' }}>{l.id}</td>
                  <td style={{ padding: '1rem 1.25rem', fontSize: '0.8rem', color: 'white', maxWidth: 200 }}>
                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.subject}</div>
                  </td>
                  <td style={{ padding: '1rem 1.25rem', fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>{l.pelerin}</td>
                  <td style={{ padding: '1rem 1.25rem', fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>{l.guide}</td>
                  <td style={{ padding: '1rem 1.25rem', fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>{l.opened}</td>
                  <td style={{ padding: '1rem 1.25rem' }}>
                    <span style={{ fontSize: '0.6rem', fontWeight: 700, padding: '0.25rem 0.55rem', borderRadius: 20, background: `${PRIORITY_COLORS[l.priority]}22`, color: PRIORITY_COLORS[l.priority] }}>
                      {l.priority}
                    </span>
                  </td>
                  <td style={{ padding: '1rem 1.25rem' }}>
                    <span style={{ fontSize: '0.6rem', fontWeight: 700, padding: '0.25rem 0.55rem', borderRadius: 20, background: `${STATUS_COLORS[l.status]}22`, color: STATUS_COLORS[l.status] }}>
                      {l.status}
                    </span>
                  </td>
                  <td style={{ padding: '1rem 1.25rem' }}>
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ color: 'rgba(255,255,255,0.3)' }}>
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selected !== null && (
        <div style={{ background: '#1A1209', border: '1px solid rgba(201,168,76,0.15)', borderRadius: 16, padding: '1.5rem', height: 'fit-content' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
            <div>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#C9A84C', letterSpacing: '0.08em', marginBottom: '0.25rem' }}>{LITIGES_DATA[selected].id}</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'white' }}>{LITIGES_DATA[selected].subject}</div>
            </div>
            <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', padding: 4 }}>
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {[
            { label: 'Réservation', value: LITIGES_DATA[selected].reservation },
            { label: 'Pèlerin', value: LITIGES_DATA[selected].pelerin },
            { label: 'Guide', value: LITIGES_DATA[selected].guide },
            { label: 'Ouvert le', value: LITIGES_DATA[selected].opened },
          ].map(row => (
            <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)' }}>{row.label}</span>
              <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'white' }}>{row.value}</span>
            </div>
          ))}

          <div style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <button style={{
              padding: '0.7rem', borderRadius: 8, border: 'none',
              background: '#4CAF9A22', color: '#4CAF9A',
              fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
            }}>
              Marquer comme résolu
            </button>
            <button style={{
              padding: '0.7rem', borderRadius: 8, border: 'none',
              background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.6)',
              fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
            }}>
              Contacter les parties
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
