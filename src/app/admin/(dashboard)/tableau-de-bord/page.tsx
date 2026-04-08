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
    {
      label: 'Guides actifs', value: stats?.guidesActifs ?? 0, color: '#16A34A', bg: '#DCFCE7',
      icon: <svg width="20" height="20" fill="none" stroke="#16A34A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>,
      href: '/admin/guides',
    },
    {
      label: 'Pèlerins inscrits', value: stats?.pelerinsInscrits ?? 0, color: '#2563EB', bg: '#DBEAFE',
      icon: <svg width="20" height="20" fill="none" stroke="#2563EB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
      href: '/admin/pelerins',
    },
    {
      label: 'Réservations ce mois', value: stats?.reservationsMois ?? 0, color: '#D97706', bg: '#FEF3C7',
      icon: <svg width="20" height="20" fill="none" stroke="#D97706" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>,
      href: '/admin/reservations',
    },
    {
      label: 'Commissions (€)', value: `${stats?.commissionsMois ?? 0} €`, color: '#16A34A', bg: '#DCFCE7',
      icon: <svg width="20" height="20" fill="none" stroke="#16A34A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
      href: '/admin/revenus',
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* Alertes */}
      {stats && (stats.guidesEnAttente > 0 || stats.litigesOuverts > 0) && (
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {stats.guidesEnAttente > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', background: '#FEF3C7', border: '1px solid #FCD34D', borderRadius: 8, padding: '0.6rem 1rem' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#92400E' }}>{stats.guidesEnAttente} guide{stats.guidesEnAttente > 1 ? 's' : ''} en attente</span>
              <Link href="/admin/guides" style={{ fontSize: '0.72rem', color: '#D97706', fontWeight: 700, textDecoration: 'none' }}>Valider →</Link>
            </div>
          )}
          {stats.litigesOuverts > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', background: '#FEE2E2', border: '1px solid #FCA5A5', borderRadius: 8, padding: '0.6rem 1rem' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#991B1B' }}>{stats.litigesOuverts} litige{stats.litigesOuverts > 1 ? 's' : ''} ouvert{stats.litigesOuverts > 1 ? 's' : ''}</span>
              <Link href="/admin/litiges" style={{ fontSize: '0.72rem', color: '#DC2626', fontWeight: 700, textDecoration: 'none' }}>Voir →</Link>
            </div>
          )}
        </div>
      )}

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} style={{ background: '#F0EDE8', borderRadius: 12, height: 110, border: '1px solid #E8DFC8' }} />
            ))
          : KPIS.map(k => (
              <Link key={k.label} href={k.href} style={{ textDecoration: 'none', display: 'block', background: 'white', borderRadius: 12, padding: '1.25rem', border: '1px solid #E8DFC8', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', transition: 'border-color 0.15s, transform 0.15s', cursor: 'pointer' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#C9A84C'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#E8DFC8'; (e.currentTarget as HTMLElement).style.transform = ''; }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.875rem' }}>
                  <div style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#7A6D5A' }}>{k.label}</div>
                  <div style={{ width: 34, height: 34, borderRadius: 8, background: k.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{k.icon}</div>
                </div>
                <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '2rem', fontWeight: 700, color: '#1A1209', lineHeight: 1, marginBottom: '0.3rem' }}>{k.value}</div>
                <div style={{ fontSize: '0.62rem', color: k.color, fontWeight: 600 }}>● Temps réel</div>
              </Link>
            ))
        }
      </div>

      {/* Actions rapides */}
      <div style={{ background: 'white', borderRadius: 12, padding: '1.25rem', border: '1px solid #E8DFC8' }}>
        <div style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#7A6D5A', marginBottom: '1rem' }}>Actions rapides</div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link href="/admin/guides" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.55rem 1rem', background: '#1A1209', color: '#F0D897', borderRadius: 50, fontSize: '0.78rem', fontWeight: 700, textDecoration: 'none' }}>+ Créer un guide</Link>
          <Link href="/admin/pelerins" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.55rem 1rem', background: '#F5F0E8', color: '#1A1209', borderRadius: 50, fontSize: '0.78rem', fontWeight: 600, textDecoration: 'none', border: '1px solid #E8DFC8' }}>Voir les pèlerins</Link>
          <Link href="/admin/reservations" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.55rem 1rem', background: '#F5F0E8', color: '#1A1209', borderRadius: 50, fontSize: '0.78rem', fontWeight: 600, textDecoration: 'none', border: '1px solid #E8DFC8' }}>Voir les réservations</Link>
        </div>
      </div>

      {/* Message base vide */}
      {!loading && stats && stats.guidesActifs === 0 && stats.pelerinsInscrits === 0 && (
        <div style={{ background: 'white', borderRadius: 12, padding: '2.5rem', border: '1px solid #E8DFC8', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>🌱</div>
          <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1A1209', marginBottom: '0.4rem' }}>Base initialisée — en attente de données</div>
          <div style={{ fontSize: '0.78rem', color: '#7A6D5A', lineHeight: 1.6 }}>Les statistiques apparaîtront ici au fur et à mesure des inscriptions.</div>
        </div>
      )}

    </div>
  );
}
