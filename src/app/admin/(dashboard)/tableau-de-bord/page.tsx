'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

type Stats = {
  guidesActifs: number;
  pelerinsInscrits: number;
  reservationsMois: number;
  commissionsMois: number;
  guidesEnAttente: number;
  litigesOuverts: number;
};

const card: React.CSSProperties = {
  background: '#FFFFFF', borderRadius: 12, padding: '1.5rem',
  boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
  border: '1px solid #E8DFC8',
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(r => r.json())
      .then(d => { setStats(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const KPIS = [
    { label: 'Guides actifs',      value: stats?.guidesActifs ?? '—',      color: '#16A34A', bg: '#DCFCE7' },
    { label: 'Pèlerins inscrits',  value: stats?.pelerinsInscrits ?? '—',  color: '#2563EB', bg: '#DBEAFE' },
    { label: 'Réservations (mois)', value: stats?.reservationsMois ?? '—', color: '#D97706', bg: '#FEF3C7' },
    { label: 'Commissions (€)',    value: stats?.commissionsMois ?? '—',   color: '#16A34A', bg: '#DCFCE7' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* Alerts */}
      {stats && (stats.guidesEnAttente > 0 || stats.litigesOuverts > 0) && (
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {stats.guidesEnAttente > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', background: '#FEF3C7', border: '1px solid #FCD34D', borderRadius: 8, padding: '0.6rem 1rem' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#92400E' }}>
                {stats.guidesEnAttente} guide{stats.guidesEnAttente > 1 ? 's' : ''} en attente de validation
              </span>
              <Link href="/admin/guides" style={{ fontSize: '0.72rem', color: '#D97706', fontWeight: 700, textDecoration: 'none' }}>Voir →</Link>
            </div>
          )}
          {stats.litigesOuverts > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', background: '#FEE2E2', border: '1px solid #FCA5A5', borderRadius: 8, padding: '0.6rem 1rem' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#991B1B' }}>
                {stats.litigesOuverts} litige{stats.litigesOuverts > 1 ? 's' : ''} ouvert{stats.litigesOuverts > 1 ? 's' : ''} en attente
              </span>
              <Link href="/admin/litiges" style={{ fontSize: '0.72rem', color: '#DC2626', fontWeight: 700, textDecoration: 'none' }}>Voir →</Link>
            </div>
          )}
        </div>
      )}

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} style={{ ...card, height: 120, background: '#F5F2EC' }} />
          ))
        ) : (
          KPIS.map(k => (
            <div key={k.label} style={card}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#7A6D5A', marginBottom: '1rem' }}>{k.label}</div>
              <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '2rem', fontWeight: 700, color: '#1A1209', lineHeight: 1, marginBottom: '0.4rem' }}>{k.value}</div>
              <div style={{ fontSize: '0.65rem', color: k.color, fontWeight: 600 }}>Données en temps réel</div>
            </div>
          ))
        )}
      </div>

      {/* Message si base vide */}
      {!loading && stats && stats.guidesActifs === 0 && stats.pelerinsInscrits === 0 && (
        <div style={{ ...card, textAlign: 'center', padding: '3rem', color: '#7A6D5A' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>🌱</div>
          <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1A1209', marginBottom: '0.4rem' }}>Base de données initialisée</div>
          <div style={{ fontSize: '0.8rem', lineHeight: 1.6 }}>Les données apparaîtront ici au fur et à mesure des inscriptions et réservations.</div>
        </div>
      )}

    </div>
  );
}
