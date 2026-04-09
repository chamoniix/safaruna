'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

type DashboardData = {
  user: { id: string; name: string; email: string; firstName: string | null; initials: string };
  stats: { totalReservations: number; upcomingReservations: number; completedReservations: number; totalSpent: number };
  recentReservations: { id: string; refNumber: string; guideName: string; packageName: string; startDate: string; nbPeople: number; totalPrice: number; status: string }[];
  unreadNotifications: number;
  notifications: { id: string; title: string; message: string; type: string; createdAt: string }[];
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  PENDING:   { label: 'En attente', color: '#D97706', bg: '#FEF3C7' },
  CONFIRMED: { label: 'Confirmée',  color: '#1D4ED8', bg: '#DBEAFE' },
  COMPLETED: { label: 'Terminée',   color: '#1D5C3A', bg: '#D1FAE5' },
  CANCELLED: { label: 'Annulée',    color: '#DC2626', bg: '#FEE2E2' },
};

const card: React.CSSProperties = {
  background: 'white', border: '1px solid #E8DFC8', borderRadius: 12,
  boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
};

export default function EspaceDashboard() {
  const [data, setData]       = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  const fetchData = () => {
    setLoading(true); setError('');
    fetch('/api/espace/dashboard')
      .then(r => { if (!r.ok) throw new Error('Erreur ' + r.status); return r.json(); })
      .then(d => { setData(d); setLoading(false); })
      .catch((e: Error) => { setError(e.message); setLoading(false); });
  };

  useEffect(() => { fetchData(); }, []);

  const handleMarkAllRead = () => {
    fetch('/api/notifications', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ all: true }) })
      .then(() => fetchData());
  };

  const firstName = data?.user.firstName || data?.user.name?.split(' ')[0] || 'Pèlerin';

  const statCards = data ? [
    { label: 'Réservations', value: data.stats.totalReservations, color: '#1D4ED8', bg: '#DBEAFE' },
    { label: 'À venir',      value: data.stats.upcomingReservations, color: '#D97706', bg: '#FEF3C7' },
    { label: 'Complétées',   value: data.stats.completedReservations, color: '#1D5C3A', bg: '#D1FAE5' },
    { label: 'Total dépensé', value: `${data.stats.totalSpent} €`, color: '#C9A84C', bg: '#FEF9E7' },
  ] : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', fontFamily: 'var(--font-manrope, sans-serif)' }}>

      {error && (
        <div style={{ background: '#FEE2E2', border: '1px solid #FCA5A5', borderRadius: 8, padding: '0.75rem 1rem', fontSize: '0.83rem', color: '#DC2626' }}>
          {error} — <button onClick={fetchData} style={{ color: '#DC2626', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', textDecoration: 'underline' }}>Réessayer</button>
        </div>
      )}

      {/* Stats bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <div key={i} style={{ ...card, height: 90, background: '#F0EDE8' }} />)
          : statCards.map(s => (
            <div key={s.label} style={{ ...card, background: s.bg, padding: '1.1rem 1.25rem' }}>
              <div style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#7A6D5A', marginBottom: '0.5rem' }}>{s.label}</div>
              <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '2rem', fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.value}</div>
            </div>
          ))
        }
      </div>

      {/* Welcome empty state */}
      {!loading && data && data.stats.totalReservations === 0 && (
        <div style={{ ...card, padding: '2.5rem', textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🕋</div>
          <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.5rem', fontWeight: 700, color: '#1A1209', marginBottom: '0.5rem' }}>
            Bienvenue {firstName} !
          </div>
          <div style={{ fontSize: '0.88rem', color: '#7A6D5A', marginBottom: '1.5rem', lineHeight: 1.7 }}>
            Trouve ton guide pour la Omra et commence ton voyage spirituel.
          </div>
          <Link href="/guides" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.7rem 1.5rem', background: '#1A1209', color: '#F0D897', borderRadius: 50, fontSize: '0.85rem', fontWeight: 700, textDecoration: 'none' }}>
            Trouver un guide →
          </Link>
        </div>
      )}

      {/* Recent reservations */}
      {!loading && data && data.recentReservations.length > 0 && (
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.875rem' }}>
            <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#7A6D5A' }}>Mes dernières réservations</div>
            <Link href="/espace/reservations" style={{ fontSize: '0.75rem', fontWeight: 700, color: '#C9A84C', textDecoration: 'none' }}>Voir toutes →</Link>
          </div>
          <div style={{ ...card, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 560 }}>
                <thead>
                  <tr style={{ background: '#F5F2EC', borderBottom: '1px solid #E8DFC8' }}>
                    {['Guide', 'Package', 'Date départ', 'Personnes', 'Montant', 'Statut'].map(h => (
                      <th key={h} style={{ padding: '0.75rem 0.875rem', textAlign: 'left', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#7A6D5A', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.recentReservations.map((r, i) => {
                    const sc = STATUS_CONFIG[r.status] || { label: r.status, color: '#6B7280', bg: '#F3F4F6' };
                    return (
                      <tr key={r.id} style={{ background: i % 2 === 0 ? 'white' : '#FAFAF8', borderBottom: '1px solid #F0EBE0' }}>
                        <td style={{ padding: '0.75rem 0.875rem', fontSize: '0.82rem', fontWeight: 600, color: '#1A1209', whiteSpace: 'nowrap' }}>{r.guideName}</td>
                        <td style={{ padding: '0.75rem 0.875rem', fontSize: '0.78rem', color: '#4A3F30' }}>{r.packageName}</td>
                        <td style={{ padding: '0.75rem 0.875rem', fontSize: '0.78rem', color: '#7A6D5A', whiteSpace: 'nowrap' }}>{r.startDate}</td>
                        <td style={{ padding: '0.75rem 0.875rem', fontSize: '0.82rem', color: '#1A1209', textAlign: 'center' }}>{r.nbPeople}</td>
                        <td style={{ padding: '0.75rem 0.875rem', fontSize: '0.85rem', fontWeight: 700, color: '#1A1209', whiteSpace: 'nowrap' }}>{r.totalPrice} €</td>
                        <td style={{ padding: '0.75rem 0.875rem' }}>
                          <span style={{ display: 'inline-block', background: sc.bg, color: sc.color, fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.06em', padding: '0.25rem 0.6rem', borderRadius: 20, whiteSpace: 'nowrap' }}>{sc.label}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* Notifications */}
      {!loading && data && data.unreadNotifications > 0 && (
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.875rem' }}>
            <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#7A6D5A' }}>
              Notifications non lues ({data.unreadNotifications})
            </div>
            <button onClick={handleMarkAllRead} style={{ fontSize: '0.72rem', fontWeight: 700, color: '#7A6D5A', background: 'none', border: '1px solid #E8DFC8', borderRadius: 50, padding: '0.3rem 0.75rem', cursor: 'pointer', fontFamily: 'inherit' }}>
              Tout marquer comme lu
            </button>
          </div>
          <div style={{ ...card, overflow: 'hidden' }}>
            {data.notifications.map((n, i) => (
              <div key={n.id} style={{ padding: '0.875rem 1.1rem', borderBottom: i < data.notifications.length - 1 ? '1px solid #F0EBE0' : 'none', display: 'flex', gap: '0.875rem', alignItems: 'flex-start', background: '#FFFBF0' }}>
                <span style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', background: '#E8DFC8', color: '#7A6D5A', padding: '0.2rem 0.5rem', borderRadius: 4, whiteSpace: 'nowrap', marginTop: 2 }}>{n.type}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#1A1209', marginBottom: '0.15rem' }}>{n.title}</div>
                  <div style={{ fontSize: '0.75rem', color: '#7A6D5A' }}>{n.message}</div>
                </div>
                <div style={{ fontSize: '0.68rem', color: '#9A8A7A', whiteSpace: 'nowrap', flexShrink: 0 }}>{n.createdAt}</div>
              </div>
            ))}
          </div>
        </section>
      )}

    </div>
  );
}
