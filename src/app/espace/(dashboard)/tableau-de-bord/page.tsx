'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
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

const TIMELINE_STEPS: { key: string; label: string; icon: React.ReactNode }[] = [
  {
    key: 'PENDING',
    label: 'Demande reçue',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
        <polyline points="14,2 14,8 20,8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
      </svg>
    ),
  },
  {
    key: 'CONFIRMED',
    label: 'Confirmé',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
        <polyline points="22,4 12,14.01 9,11.01"/>
      </svg>
    ),
  },
  {
    key: 'UPCOMING',
    label: 'Départ imminent',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M22 2L11 13"/>
        <path d="M22 2L15 22 11 13 2 9l20-7z"/>
      </svg>
    ),
  },
  {
    key: 'COMPLETED',
    label: 'Terminé',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26 12,2"/>
      </svg>
    ),
  },
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
                width: 34, height: 34, borderRadius: '50%',
                background: done ? '#1D5C3A' : active ? '#C9A84C' : '#F3F4F6',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.75rem',
                color: done ? 'white' : active ? '#1A1209' : '#9CA3AF',
                fontWeight: 700,
                border: active ? '2px solid #C9A84C' : 'none',
                flexShrink: 0,
              }}>
                {done ? '✓' : step.icon}
              </div>
              <div style={{
                fontSize: '0.62rem',
                color: active ? '#C9A84C' : done ? '#1D5C3A' : '#9CA3AF',
                fontWeight: active ? 700 : 500,
                marginTop: '0.3rem',
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
                minWidth: 16,
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
  borderRadius: 16,
  boxShadow: '0 1px 4px rgba(26,18,9,0.06)',
};

function Skeleton({ w, h = 14 }: { w?: number | string; h?: number }) {
  return <div style={{ height: h, background: '#F0EDE8', borderRadius: 6, width: w ?? '100%' }} />;
}

function EmailVerificationBanner() {
  const { data: session } = useSession();
  if (!session || session.user?.emailVerified) return null;
  return (
    <div style={{
      background: '#FEF9EC', border: '1px solid #C9A84C',
      borderRadius: 14, padding: '1rem 1.25rem',
      display: 'flex', gap: '0.75rem', alignItems: 'flex-start',
    }}>
      <div style={{ fontSize: '1.25rem', flexShrink: 0, marginTop: 2 }}>✉️</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, color: '#1A1209', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
          Confirmez votre email
        </div>
        <div style={{ color: '#7A6D5A', fontSize: '0.78rem', marginBottom: '0.75rem' }}>
          Un email de confirmation vous a été envoyé.
        </div>
        <button
          onClick={() => fetch('/api/resend-verification', { method: 'POST' })}
          style={{ background: '#C9A84C', color: '#1A1209', border: 'none', padding: '0.5rem 1rem', borderRadius: 50, fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer' }}
        >
          Renvoyer l&apos;email →
        </button>
      </div>
    </div>
  );
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontFamily: 'var(--font-manrope, sans-serif)' }}>
        {/* Hero skeleton */}
        <div style={{ background: '#1A1209', borderRadius: 20, padding: '1.75rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: 54, height: 54, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ height: 28, background: 'rgba(255,255,255,0.1)', borderRadius: 6, width: '55%', marginBottom: 8 }} />
            <div style={{ height: 14, background: 'rgba(255,255,255,0.06)', borderRadius: 4, width: '70%' }} />
          </div>
        </div>
        {/* Stats skeleton */}
        <div className="tb-stats-grid">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} style={{ ...card, padding: '1rem', height: 80 }}>
              <Skeleton w={50} />
              <div style={{ marginTop: '0.625rem' }}><Skeleton w={45} h={24} /></div>
            </div>
          ))}
        </div>
        {/* Reservations skeleton */}
        <div style={{ ...card, overflow: 'hidden' }}>
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #F0EBE0' }}><Skeleton w={180} /></div>
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #F5F2EC' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <Skeleton w={120} />
                <Skeleton w={60} />
              </div>
              <Skeleton w="90%" h={12} />
            </div>
          ))}
        </div>
        <style dangerouslySetInnerHTML={{ __html: `.tb-stats-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 0.75rem; } @media (max-width: 640px) { .tb-stats-grid { grid-template-columns: repeat(2,1fr); } }` }} />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ background: '#FEE2E2', border: '1px solid #FCA5A5', borderRadius: 12, padding: '1rem 1.25rem', fontSize: '0.83rem', color: '#DC2626', fontFamily: 'var(--font-manrope, sans-serif)' }}>
        {error || 'Impossible de charger les données.'}{' '}
        <button onClick={fetchData} style={{ color: '#DC2626', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Réessayer</button>
      </div>
    );
  }

  const { user, stats, recentReservations, unreadNotifications } = data;
  const displayFirstName = user.firstName || user.name.split(' ')[0] || 'Pèlerin';
  const nextTrip = recentReservations.find(r => r.status === 'CONFIRMED' || r.status === 'UPCOMING');

  const QUICK_ACTIONS = [
    {
      href: '/guides',
      label: 'Trouver\nun guide',
      color: '#8B6914',
      bg: '#FAF3E0',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
      ),
    },
    {
      href: '/espace/checklist',
      label: 'Ma\nchecklist',
      color: '#1D5C3A',
      bg: '#F0FDF4',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
        </svg>
      ),
    },
    {
      href: '/espace/guide-omra',
      label: 'Guide\nOmra',
      color: '#1D4ED8',
      bg: '#EFF6FF',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/>
        </svg>
      ),
    },
    {
      href: '/espace/dua',
      label: "Carnet\nDu'a",
      color: '#7A1D5C',
      bg: '#FDF4FF',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
        </svg>
      ),
    },
  ];

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        /* Stats grid */
        .tb-stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0.75rem;
        }
        @media (max-width: 640px) {
          .tb-stats-grid { grid-template-columns: repeat(2, 1fr); }
        }

        /* Quick actions */
        .tb-actions {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0.75rem;
          margin-top: 0.75rem;
        }
        @media (max-width: 640px) {
          .tb-actions {
            display: flex;
            overflow-x: auto;
            gap: 0.625rem;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: none;
            padding-bottom: 4px;
            scroll-snap-type: x mandatory;
          }
          .tb-actions::-webkit-scrollbar { display: none; }
          .tb-action-link { min-width: 100px; flex-shrink: 0; scroll-snap-align: start; }
        }
        .tb-action-link {
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          gap: 0.5rem; padding: 1rem 0.5rem;
          background: white; border: 1px solid #E8DFC8; border-radius: 14px;
          text-decoration: none; text-align: center;
          transition: transform 0.18s, box-shadow 0.18s;
          box-shadow: 0 1px 4px rgba(26,18,9,0.05);
        }
        .tb-action-link:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(26,18,9,0.1);
        }

        /* Reservation cards */
        .tb-res-card {
          padding: 1.125rem 1.25rem;
          transition: background 0.15s;
        }
        .tb-res-card:hover { background: #FDFAF4; }

        /* Next trip card shimmer */
        @keyframes tb-shimmer {
          0% { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }
        .tb-next-trip-badge {
          display: inline-flex; align-items: center; gap: 0.4rem;
          background: rgba(201,168,76,0.18); color: #F0D897;
          padding: 0.25rem 0.625rem; border-radius: 50;
          font-size: 0.6rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;
        }
      `}} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontFamily: 'var(--font-manrope, sans-serif)' }}>

        <EmailVerificationBanner />

        {/* ── HERO GREETING ── */}
        <div style={{ background: 'linear-gradient(135deg, #1A1209 0%, #2A1C0D 100%)', borderRadius: 20, padding: '1.75rem', position: 'relative', overflow: 'hidden' }}>
          {/* Gold top line */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, transparent 0%, #C9A84C 35%, #F0D897 55%, #C9A84C 75%, transparent 100%)' }} />
          {/* Arabic watermark */}
          <div style={{ position: 'absolute', right: -8, bottom: -12, fontSize: '5.5rem', opacity: 0.05, fontFamily: 'serif', color: 'white', userSelect: 'none', lineHeight: 1, letterSpacing: '-0.05em', pointerEvents: 'none' }}>بسم الله</div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', position: 'relative', zIndex: 1 }}>
            <div style={{ width: 54, height: 54, borderRadius: '50%', background: 'linear-gradient(135deg, #F0D897 0%, #C9A84C 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.35rem', fontWeight: 700, color: '#1A1209', flexShrink: 0, boxShadow: '0 0 0 3px rgba(201,168,76,0.2)', border: '2px solid rgba(240,216,151,0.4)' }}>
              {user.initials}
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.85rem', fontWeight: 700, color: 'white', lineHeight: 1.1 }}>
                Salam {displayFirstName} ✦
              </div>
              <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)', marginTop: '0.25rem', letterSpacing: '0.02em' }}>
                Bienvenue dans ton espace pèlerin
              </div>
            </div>
          </div>

          {/* Mini stats strip */}
          <div style={{ display: 'flex', gap: '0.625rem', marginTop: '1.25rem', position: 'relative', zIndex: 1 }}>
            {[
              { v: stats.totalReservations,   l: 'Total' },
              { v: stats.upcomingReservations, l: 'À venir' },
              { v: stats.completedReservations, l: 'Complétées' },
            ].map(s => (
              <div key={s.l} style={{ flex: 1, background: 'rgba(255,255,255,0.06)', borderRadius: 10, padding: '0.625rem 0.5rem', textAlign: 'center', backdropFilter: 'blur(4px)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.5rem', fontWeight: 700, color: '#F0D897', lineHeight: 1 }}>{s.v}</div>
                <div style={{ fontSize: '0.57rem', color: 'rgba(255,255,255,0.38)', letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: '0.2rem' }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── NOTIFICATION BANNER ── */}
        {unreadNotifications > 0 && (
          <div style={{ background: '#1A1209', borderRadius: 14, padding: '0.875rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#C9A84C', flexShrink: 0 }} />
              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'white' }}>
                {unreadNotifications} notification{unreadNotifications > 1 ? 's' : ''} non lue{unreadNotifications > 1 ? 's' : ''}
              </div>
            </div>
            <button onClick={markAllRead} disabled={markingRead} style={{ padding: '0.375rem 0.875rem', borderRadius: 50, border: '1px solid rgba(201,168,76,0.4)', background: 'transparent', color: '#C9A84C', fontSize: '0.72rem', fontWeight: 700, cursor: markingRead ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: markingRead ? 0.5 : 1, whiteSpace: 'nowrap' }}>
              {markingRead ? '…' : 'Tout marquer lu'}
            </button>
          </div>
        )}

        {/* ── NEXT TRIP CARD ── */}
        {nextTrip && (
          <div style={{ background: 'linear-gradient(135deg, #1D5C3A 0%, #25724A 100%)', borderRadius: 16, padding: '1.25rem 1.5rem', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ position: 'absolute', right: -8, top: '50%', transform: 'translateY(-50%)', fontSize: '4.5rem', opacity: 0.07, userSelect: 'none', pointerEvents: 'none' }}>✈️</div>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(240,216,151,0.9)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 2L11 13"/><path d="M22 2L15 22 11 13 2 9l20-7z"/>
              </svg>
            </div>
            <div style={{ flex: 1, position: 'relative', zIndex: 1 }}>
              <div className="tb-next-trip-badge">Prochain départ</div>
              <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.2rem', fontWeight: 700, color: 'white', marginTop: '0.3rem', lineHeight: 1.2 }}>
                {nextTrip.guideName}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.6)', marginTop: '0.15rem' }}>
                {nextTrip.startDate} · {nextTrip.nbPeople} pèlerin{nextTrip.nbPeople > 1 ? 's' : ''}
              </div>
            </div>
          </div>
        )}

        {/* ── STATS GRID ── */}
        <div className="tb-stats-grid">
          {[
            { label: 'Réservations', value: stats.totalReservations, color: '#1D4ED8', bg: '#EFF6FF', border: '#BFDBFE' },
            { label: 'À venir', value: stats.upcomingReservations, color: '#D97706', bg: '#FFFBEB', border: '#FDE68A' },
            { label: 'Complétées', value: stats.completedReservations, color: '#1D5C3A', bg: '#F0FDF4', border: '#A7F3D0' },
            { label: 'Dépensé', value: `${stats.totalSpent} €`, color: '#8B6914', bg: '#FEFCE8', border: '#FDE68A' },
          ].map(s => (
            <div key={s.label} style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: 14, padding: '1rem 1.1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <div style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: s.color, opacity: 0.7, marginBottom: '0.4rem' }}>{s.label}</div>
              <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '2rem', fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* ── QUICK ACTIONS ── */}
        <div>
          <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.2rem', fontWeight: 700, color: '#1A1209', marginBottom: 0, letterSpacing: '0.01em' }}>Accès rapide</div>
          <div className="tb-actions">
            {QUICK_ACTIONS.map(a => (
              <Link key={a.href} href={a.href} className="tb-action-link">
                <div style={{ width: 44, height: 44, borderRadius: 12, background: a.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: a.color }}>
                  {a.icon}
                </div>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#1A1209', lineHeight: 1.35, whiteSpace: 'pre-line' }}>{a.label}</div>
              </Link>
            ))}
          </div>
        </div>

        {/* ── RECENT RESERVATIONS ── */}
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
                const statusBorderColor = r.status === 'PENDING' ? '#FDE68A' : r.status === 'CONFIRMED' ? '#BFDBFE' : r.status === 'UPCOMING' ? '#BBF7D0' : r.status === 'COMPLETED' ? '#A7F3D0' : '#F3F4F6';
                return (
                  <div key={r.id} className="tb-res-card" style={{ borderBottom: i < recentReservations.length - 1 ? '1px solid #F0EBE0' : 'none', borderLeft: `3px solid ${statusBorderColor}` }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem' }}>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#1A1209', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.guideName}</div>
                        <div style={{ fontSize: '0.68rem', color: '#7A6D5A', marginTop: 2 }}>{r.refNumber} · {r.packageName}</div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1A1209' }}>{r.totalPrice} €</div>
                        <div style={{ fontSize: '0.65rem', color: '#7A6D5A', marginTop: 2 }}>{r.nbPeople} pers. · {r.startDate}</div>
                      </div>
                    </div>

                    {isCancelled ? (
                      <div style={{ marginTop: '0.75rem' }}>
                        <span style={{ display: 'inline-block', background: sc.bg, color: sc.color, fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', padding: '0.3rem 0.75rem', borderRadius: 20 }}>
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
    </>
  );
}
