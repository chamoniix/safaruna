'use client';

import { useState } from 'react';

const LITIGES = [
  { id: 'LIT-0041', res: 'RES-2839', pelerin: 'Zohra Hamidi',    guide: 'Omar Benali',    subject: "Guide absent au RDV Médine",           opened: '29/03/2026', priority: 'HAUTE',   status: 'OUVERT' },
  { id: 'LIT-0040', res: 'RES-2831', pelerin: 'Karim Bouazza',   guide: 'Hassan Toure',   subject: "Prestation non conforme à l'annonce",  opened: '22/03/2026', priority: 'MOYENNE', status: 'EN COURS' },
  { id: 'LIT-0039', res: 'RES-2820', pelerin: 'Nadia Larbi',     guide: 'Youssef Malik',  subject: "Demande de remboursement partiel",      opened: '18/03/2026', priority: 'BASSE',   status: 'RÉSOLU' },
  { id: 'LIT-0038', res: 'RES-2815', pelerin: 'Samir Belhaj',    guide: 'Bilal Choudhry', subject: "Hébergement non réservé",               opened: '10/03/2026', priority: 'HAUTE',   status: 'RÉSOLU' },
  { id: 'LIT-0037', res: 'RES-2847', pelerin: 'Fatima Benali',   guide: 'Omar Benali',    subject: "Conflit sur le programme",              opened: '01/04/2026', priority: 'MOYENNE', status: 'OUVERT' },
];

const PRIORITY: Record<string, { color: string; bg: string }> = {
  'HAUTE':   { color: '#DC2626', bg: '#FEE2E2' },
  'MOYENNE': { color: '#D97706', bg: '#FEF3C7' },
  'BASSE':   { color: '#16A34A', bg: '#DCFCE7' },
};
const STATUS: Record<string, { color: string; bg: string }> = {
  'OUVERT':    { color: '#DC2626', bg: '#FEE2E2' },
  'EN COURS':  { color: '#D97706', bg: '#FEF3C7' },
  'RÉSOLU':    { color: '#16A34A', bg: '#DCFCE7' },
};

const card: React.CSSProperties = {
  background: '#FFFFFF', borderRadius: 12,
  boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #E8DFC8',
};

export default function AdminLitiges() {
  const [selected, setSelected] = useState<number | null>(null);

  const open     = LITIGES.filter(l => l.status === 'OUVERT').length;
  const inProgress = LITIGES.filter(l => l.status === 'EN COURS').length;
  const resolved = LITIGES.filter(l => l.status === 'RÉSOLU').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
        {[
          { label: 'Ouverts',     value: open,       color: '#DC2626', bg: '#FEE2E2' },
          { label: 'En cours',    value: inProgress, color: '#D97706', bg: '#FEF3C7' },
          { label: 'Résolus',     value: resolved,   color: '#16A34A', bg: '#DCFCE7' },
        ].map(s => (
          <div key={s.label} style={{ ...card, padding: '1.25rem 1.5rem', overflow: 'visible' }}>
            <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#7A6D5A', marginBottom: '0.4rem' }}>{s.label}</div>
            <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '2rem', fontWeight: 700, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selected !== null ? '1fr 340px' : '1fr', gap: '1.5rem' }}>

        {/* Table */}
        <div style={{ ...card, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F5F3EF', borderBottom: '1px solid #E8DFC8' }}>
                {['ID', 'Objet', 'Pèlerin', 'Guide', 'Date', 'Priorité', 'Statut', ''].map(h => (
                  <th key={h} style={{ padding: '0.75rem 1.25rem', textAlign: 'left', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#7A6D5A', whiteSpace: 'nowrap' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {LITIGES.map((l, i) => (
                <tr
                  key={l.id}
                  onClick={() => setSelected(selected === i ? null : i)}
                  style={{
                    background: selected === i ? '#FEF9EC' : i % 2 === 0 ? '#FFFFFF' : '#FAFAF8',
                    borderBottom: '1px solid #F0EBE0', cursor: 'pointer',
                    borderLeft: selected === i ? '3px solid #C9A84C' : '3px solid transparent',
                  }}
                >
                  <td style={{ padding: '1rem 1.25rem', fontSize: '0.72rem', fontWeight: 700, color: '#C9A84C' }}>{l.id}</td>
                  <td style={{ padding: '1rem 1.25rem', fontSize: '0.83rem', color: '#1A1209', maxWidth: 200 }}>
                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.subject}</div>
                  </td>
                  <td style={{ padding: '1rem 1.25rem', fontSize: '0.83rem', color: '#4A3F30' }}>{l.pelerin}</td>
                  <td style={{ padding: '1rem 1.25rem', fontSize: '0.83rem', color: '#4A3F30' }}>{l.guide}</td>
                  <td style={{ padding: '1rem 1.25rem', fontSize: '0.75rem', color: '#7A6D5A' }}>{l.opened}</td>
                  <td style={{ padding: '1rem 1.25rem' }}>
                    <span style={{ fontSize: '0.62rem', fontWeight: 700, padding: '0.25rem 0.55rem', borderRadius: 20, background: PRIORITY[l.priority].bg, color: PRIORITY[l.priority].color }}>
                      {l.priority}
                    </span>
                  </td>
                  <td style={{ padding: '1rem 1.25rem' }}>
                    <span style={{ fontSize: '0.62rem', fontWeight: 700, padding: '0.25rem 0.55rem', borderRadius: 20, background: STATUS[l.status].bg, color: STATUS[l.status].color }}>
                      {l.status}
                    </span>
                  </td>
                  <td style={{ padding: '1rem 1.25rem', color: '#C9A84C' }}>
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Detail panel */}
        {selected !== null && (
          <div style={{ ...card, padding: '1.5rem', height: 'fit-content' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <div>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#C9A84C', letterSpacing: '0.08em', marginBottom: '0.25rem' }}>{LITIGES[selected].id}</div>
                <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1rem', fontWeight: 700, color: '#1A1209', lineHeight: 1.3 }}>{LITIGES[selected].subject}</div>
              </div>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: '#7A6D5A', cursor: 'pointer', padding: 4, borderRadius: 6 }}>
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            {[
              { label: 'Réservation', value: LITIGES[selected].res },
              { label: 'Pèlerin',     value: LITIGES[selected].pelerin },
              { label: 'Guide',       value: LITIGES[selected].guide },
              { label: 'Ouvert le',   value: LITIGES[selected].opened },
            ].map(row => (
              <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0', borderBottom: '1px solid #F0EBE0' }}>
                <span style={{ fontSize: '0.72rem', color: '#7A6D5A' }}>{row.label}</span>
                <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#1A1209' }}>{row.value}</span>
              </div>
            ))}

            <div style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <button style={{ padding: '0.75rem', borderRadius: 50, border: 'none', background: '#1A1209', color: '#F0D897', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                Marquer comme résolu
              </button>
              <button style={{ padding: '0.75rem', borderRadius: 50, border: '1px solid #E8DFC8', background: '#FFFFFF', color: '#7A6D5A', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                Contacter les parties
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
