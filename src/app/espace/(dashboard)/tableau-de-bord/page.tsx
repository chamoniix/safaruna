'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

type DashboardData = {
  user: {
    id: string; name: string; email: string;
    firstName: string | null; lastName: string | null;
    country: string | null; phoneWhatsapp: string | null;
    createdAt: string; initials: string;
  };
  stats: {
    totalReservations: number; upcomingReservations: number;
    completedReservations: number; totalSpent: number;
  };
  recentReservations: Array<{
    id: string; refNumber: string; guideName: string;
    packageName: string; startDate: string;
    nbPeople: number; totalPrice: number; status: string;
  }>;
  unreadNotifications: number;
  notifications: Array<{
    id: string; title: string; message: string;
    type: string; createdAt: string;
  }>;
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  PENDING:   { label: 'En attente', color: '#D97706', bg: '#FEF3C7' },
  CONFIRMED: { label: 'Confirmée',  color: '#1D4ED8', bg: '#DBEAFE' },
  COMPLETED: { label: 'Terminée',   color: '#1D5C3A', bg: '#D1FAE5' },
  CANCELLED: { label: 'Annulée',    color: '#DC2626', bg: '#FEE2E2' },
};

const TIMELINE_STEPS = [
  { key: 'PENDING',   label: 'Demande reçue',  icon: '📋' },
  { key: 'CONFIRMED', label: 'Confirmé',        icon: '✅' },
  { key: 'UPCOMING',  label: 'Départ imminent', icon: '🛫' },
  { key: 'COMPLETED', label: 'Terminé',         icon: '⭐' },
];

function ReservationTimeline({ status }: { status: string }) {
  const activeIdx = TIMELINE_STEPS.findIndex(s => s.key === status);
  const displayIdx = activeIdx === -1 ? 0 : activeIdx;

  return (
    <div style={{
      display: 'flex', alignItems: 'center',
      gap: 0, margin: '1rem 0',
      overflowX: 'auto', paddingBottom: '0.25rem',
    }}>
      {TIMELINE_STEPS.map((step, idx) => {
        const done = idx < displayIdx;
        const active = idx === displayIdx;
        return (
          <div key={step.key} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                background: done ? '#1D5C3A' : active ? '#C9A84C' : '#F3F4F6',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: done ? '0.75rem' : '1rem',
                color: done ? 'white' : active ? '#1A1209' : '#9CA3AF',
                fontWeight: 700,
                border: active ? '2px solid #C9A84C' : 'none',
                flexShrink: 0,
              }}>
                {done ? '✓' : step.icon}
              </div>
              <div style={{
                fontSize: '0.65rem',
                color: active ? '#C9A84C' : done ? '#1D5C3A' : '#9CA3AF',
                fontWeight: active ? 700 : 500,
                marginTop: '0.35rem',
                textAlign: 'center',
                whiteSpace: 'nowrap',
              }}>
                {step.label}
              </div>
            </div>
            {idx < TIMELINE_STEPS.length - 1 && (
              <div style={{
                height: 2, flex: 1,
                background: done ? '#1D5C3A' : '#E8DFC8',
                margin: '0 0.25rem',
                marginBottom: '1.25rem',
                minWidth: 20,
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

const card: React.CSSProperties = {
  background: 'white',
  border: '1px solid #E8DFC8',
  borderRadius: 12,
  boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
};

const labelStyle: React.CSSProperties = {
  fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em',
  textTransform: 'uppercase' as const, color: '#7A6D5A', marginBottom: '0.4rem',
};

function Skeleton({ w, h = 14 }: { w?: number | string; h?: number }) {
  return <div style={{ height: h, background: '#F0EDE8', borderRadius: 4, width: w ?? '100%' }} />;
}

export default function EspaceTableauDeBord() {
  const [data, setData]       = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [markingRead, setMarkingRead] = useState(false);

  const fetchData = () => {
    setLoading(true); setError('');
    fetch('/api/espace/dashboard')
      .then(r => { if (!r.ok) throw new Error('Erreur ' + r.status); return r.json(); })
      .then(d => { setData(d); setLoading(false); })
      .catch((e: Error) => { console.error('[espace/dashboard]', e); setError(e.message); setLoading(false); });
  };

  useEffect(() => { fetchData(); }, []);

  const markAllRead = async () => {
    setMarkingRead(true);
    await fetch('/api/notifications', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ markAllRead: true }) });
    setMarkingRead(false);
    fetchData();
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', fontFamily: 'var(--font-manrope, sans-serif)' }}>
        <div style={{ ...card, padding: '1.25rem' }}>
          <Skeleton w={200} h={28} />
          <div style={{ marginTop: '0.5rem' }}><Skeleton w={260} /></div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} style={{ ...card, padding: '1rem 1.25rem', height: 90 }}>
              <Skeleton />
              <div style={{ marginTop: '0.75rem' }}><Skeleton w={60} h={28} /></div>
            </div>
          ))}
        </div>
        <div style={{ ...card, overflow: 'hidden' }}>
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #F0EBE0' }}><Skeleton w={180} /></div>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} style={{ display: 'flex', gap: '1rem', padding: '0.875rem 1.25rem', borderBottom: '1px solid #F5F2EC' }}>
              {Array.from({ length: 6 }).map((_, j) => <Skeleton key={j} w={j === 0 ? 80 : 60} />)}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ background: '#FEE2E2', border: '1px solid #FCA5A5', borderRadius: 8, padding: '0.75rem 1rem', fontSize: '0.83rem', color: '#DC2626', fontFamily: 'var(--font-manrope, sans-serif)' }}>
        {error || 'Impossible de charger les données.'}{' '}
        <button onClick={fetchData} style={{ color: '#DC2626', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Réessayer</button>
      </div>
    );
  }

  const { user, stats, recentReservations, unreadNotifications } = data;
  const displayFirstName = user.firstName || user.name.split(' ')[0] || 'Pèlerin';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', fontFamily: 'var(--font-manrope, sans-serif)' }}>

      <div style={{ ...card, padding: '1.25rem 1.5rem' }}>
        <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.6rem', fontWeight: 700, color: '#1A1209', lineHeight: 1.2 }}>
          Salam {displayFirstName} 👋
        </div>
        <div style={{ fontSize: '0.82rem', color: '#7A6D5A', marginTop: '0.35rem' }}>
          Bienvenue dans ton espace pèlerin
        </div>
      </div>

      {unreadNotifications > 0 && (
        <div style={{ background: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: 10, padding: '0.75rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#D97706' }}>
            🔔 {unreadNotifications} notification{unreadNotifications > 1 ? 's' : ''} non lue{unreadNotifications > 1 ? 's' : ''}
          </div>
          <button onClick={markAllRead} disabled={markingRead} style={{ padding: '0.4rem 0.875rem', borderRadius: 50, border: '1px solid #FDE68A', background: 'white', color: '#D97706', fontSize: '0.72rem', fontWeight: 700, cursor: markingRead ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: markingRead ? 0.6 : 1 }}>
            {markingRead ? 'Mise à jour…' : 'Marquer tout comme lu'}
          </button>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
        <div style={{ ...card, padding: '1rem 1.25rem', background: '#DBEAFE' }}>
          <div style={labelStyle}>Total</div>
          <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '2rem', fontWeight: 700, color: '#1D4ED8', lineHeight: 1 }}>{stats.totalReservations}</div>
        </div>
        <div style={{ ...card, padding: '1rem 1.25rem', background: '#FEF3C7' }}>
          <div style={labelStyle}>À venir</div>
          <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '2rem', fontWeight: 700, color: '#D97706', lineHeight: 1 }}>{stats.upcomingReservations}</div>
        </div>
        <div style={{ ...card, padding: '1rem 1.25rem', background: '#D1FAE5' }}>
          <div style={labelStyle}>Complétées</div>
          <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '2rem', fontWeight: 700, color: '#1D5C3A', lineHeight: 1 }}>{stats.completedReservations}</div>
        </div>
        <div style={{ ...card, padding: '1rem 1.25rem', background: '#FAF3E0' }}>
          <div style={labelStyle}>Dépensé</div>
          <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '2rem', fontWeight: 700, color: '#8B6914', lineHeight: 1 }}>{stats.totalSpent} €</div>
        </div>
      </div>

      <div style={{ ...card, overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #F0EBE0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.3rem', fontWeight: 700, color: '#1A1209' }}>Mes dernières réservations</div>
          <Link href="/espace/reservations" style={{ fontSize: '0.72rem', fontWeight: 700, color: '#C9A84C', textDecoration: 'none' }}>Voir toutes →</Link>
        </div>

        {recentReservations.length === 0 ? (
          <div style={{ padding: '3rem 2rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🕋</div>
            <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.3rem', color: '#1A1209', marginBottom: '0.5rem' }}>
              Tu n&apos;as pas encore de réservation.
            </div>
            <div style={{ fontSize: '0.82rem', color: '#7A6D5A', marginBottom: '1.5rem' }}>Trouve ton guide pour ta Omra →</div>
            <Link href="/guides" style={{ display: 'inline-block', background: '#1A1209', color: '#F0D897', padding: '0.65rem 1.75rem', borderRadius: 50, fontWeight: 700, fontSize: '0.82rem', textDecoration: 'none' }}>
              Découvrir les guides
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {recentReservations.map((r, i) => {
              const sc = STATUS_CONFIG[r.status] || { label: r.status, color: '#6B7280', bg: '#F3F4F6' };
              const isCancelled = r.status === 'CANCELLED';
              return (
                <div key={r.id} style={{ padding: '1rem 1.25rem', borderBottom: i < recentReservations.length - 1 ? '1px solid #F0EBE0' : 'none' }}>
                  {/* Header row */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
                    <div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1A1209' }}>{r.guideName}</div>
                      <div style={{ fontSize: '0.68rem', color: '#7A6D5A', marginTop: 2 }}>{r.refNumber} · {r.packageName}</div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1A1209' }}>{r.totalPrice} €</div>
                      <div style={{ fontSize: '0.68rem', color: '#7A6D5A', marginTop: 2 }}>{r.nbPeople} pers. · {r.startDate}</div>
                    </div>
                  </div>

                  {/* Timeline ou badge annulée */}
                  {isCancelled ? (
                    <div style={{ marginTop: '0.75rem' }}>
                      <span style={{ display: 'inline-block', background: sc.bg, color: sc.color, fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.06em', padding: '0.3rem 0.75rem', borderRadius: 20 }}>
                        Annulée
                      </span>
                    </div>
                  ) : (
                    <ReservationTimeline status={r.status} />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
