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

const STATUS: Record<string, { label: string; dot: string; color: string }> = {
  PENDING:   { label: 'En attente',  dot: '#C9A84C', color: '#8B6914' },
  CONFIRMED: { label: 'Confirmée',   dot: '#7AD996', color: '#1A6B3F' },
  COMPLETED: { label: 'Terminée',    dot: '#C9A84C', color: '#4A3F30' },
  CANCELLED: { label: 'Annulée',     dot: '#C53030', color: '#C53030' },
};

function EmailVerificationBanner() {
  const { data: session } = useSession();
  if (!session || (session.user as any)?.emailVerified) return null;
  return (
    <div style={{
      background: 'rgba(201,168,76,0.07)',
      border: '0.5px solid rgba(201,168,76,0.3)',
      borderRadius: 12, padding: '12px 16px',
      marginBottom: 20, textAlign: 'center',
    }}>
      <div style={{ fontWeight: 700, color: '#1A1209', fontSize: 13, marginBottom: 4 }}>
        Confirmez votre adresse email
      </div>
      <div style={{ color: '#7A6D5A', fontSize: 12, marginBottom: 10 }}>
        Un email de confirmation vous a été envoyé.
      </div>
      <button
        onClick={() => fetch('/api/resend-verification', { method: 'POST' })}
        style={{ background: '#C9A84C', color: '#1A1209', border: 'none', padding: '6px 18px', borderRadius: 50, fontWeight: 700, fontSize: 12, cursor: 'pointer' }}
      >
        Renvoyer l'email
      </button>
    </div>
  );
}

function Skeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ height: 56, background: '#F0EDE8', borderRadius: 14, width: '55%' }} />
      <div style={{ height: 172, background: '#F0EDE8', borderRadius: 20 }} />
      {[0, 1, 2].map(i => (
        <div key={i} style={{ height: 76, background: '#F0EDE8', borderRadius: 14 }} />
      ))}
    </div>
  );
}

export default function EspaceTableauDeBord() {
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

  if (loading) return <Skeleton />;

  if (error || !data) {
    return (
      <div style={{ background: '#FEE2E2', border: '0.5px solid #FCA5A5', borderRadius: 12, padding: '12px 16px', fontSize: 13, color: '#C53030' }}>
        {error || 'Impossible de charger.'}{' '}
        <button onClick={fetchData} style={{ color: '#C53030', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
          Réessayer
        </button>
      </div>
    );
  }

  const { user, stats, recentReservations, unreadNotifications, notifications } = data;
  const firstName   = user.firstName || user.name.split(' ')[0] || 'Pèlerin';
  const featured    = recentReservations.find(r => r.status === 'CONFIRMED')
                   || recentReservations.find(r => r.status === 'PENDING');
  const others      = recentReservations.filter(r => r !== featured);
  const lastNotif   = notifications[0];

  return (
    <div style={{ fontFamily: 'var(--font-manrope, sans-serif)', maxWidth: 640, margin: '0 auto', color: '#1A1209' }}>

      <EmailVerificationBanner />

      {/* ── GREETING ── */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11.5, color: 'rgba(26,18,9,0.42)', fontWeight: 500, letterSpacing: '0.04em', marginBottom: 2 }}>
          Bienvenue dans votre espace
        </div>
        <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: 30, fontWeight: 600, color: '#1A1209', lineHeight: 1.1 }}>
          Bonjour, {firstName}
        </div>
      </div>

      {/* ── NOTIFICATION STRIP ── */}
      {unreadNotifications > 0 && lastNotif && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: 'rgba(201,168,76,0.07)',
          border: '0.5px solid rgba(201,168,76,0.22)',
          borderRadius: 12, padding: '10px 14px', marginBottom: 24,
        }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#C9A84C', flexShrink: 0 }} />
          <span style={{ flex: 1, fontSize: 12.5, color: '#1A1209', lineHeight: 1.4 }}>
            <strong style={{ fontWeight: 700 }}>{lastNotif.title}</strong>
            {lastNotif.message ? ` — ${lastNotif.message}` : ''}
          </span>
          <span style={{ fontSize: 10.5, color: 'rgba(26,18,9,0.38)', flexShrink: 0 }}>{lastNotif.createdAt}</span>
        </div>
      )}

      {featured ? (
        <>
          {/* ── FEATURED TRIP CARD ── */}
          <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(26,18,9,0.38)', marginBottom: 10 }}>
            {featured.status === 'CONFIRMED' ? 'Prochain voyage' : 'En attente de confirmation'}
          </div>

          <div style={{
            background: 'linear-gradient(150deg, #1A1209 0%, #2D1F08 60%, #1A1209 100%)',
            borderRadius: 20, padding: '22px 22px 20px',
            border: '0.5px solid rgba(201,168,76,0.18)',
            boxShadow: '0 8px 32px rgba(26,18,9,0.18)',
            marginBottom: 28,
            position: 'relative', overflow: 'hidden',
          }}>
            {/* Subtle glow */}
            <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,168,76,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />

            {/* Top row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                background: 'rgba(255,255,255,0.07)', border: '0.5px solid rgba(255,255,255,0.12)',
                borderRadius: 999, padding: '4px 10px',
                fontSize: 10, fontWeight: 600, color: STATUS[featured.status]?.dot || '#FAF7F0',
                letterSpacing: '0.04em',
              }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: STATUS[featured.status]?.dot || '#FAF7F0', display: 'inline-block' }} />
                {STATUS[featured.status]?.label || featured.status}
              </span>
              <span style={{ fontFamily: 'monospace', fontSize: 10, color: 'rgba(250,247,240,0.28)', letterSpacing: '0.06em' }}>
                {featured.refNumber}
              </span>
            </div>

            {/* Guide + package */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 10.5, color: 'rgba(201,168,76,0.75)', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 5 }}>
                Guide privé certifié
              </div>
              <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: 27, color: '#FAF7F0', fontWeight: 600, lineHeight: 1.1, marginBottom: 4 }}>
                {featured.guideName}
              </div>
              <div style={{ fontSize: 12.5, color: 'rgba(250,247,240,0.45)' }}>
                {featured.packageName}
              </div>
            </div>

            {/* Details row */}
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
              borderTop: '0.5px solid rgba(255,255,255,0.07)',
              paddingTop: 16, gap: 0,
            }}>
              <div>
                <div style={{ fontSize: 9, color: 'rgba(250,247,240,0.35)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 4 }}>Départ</div>
                <div style={{ fontSize: 13, color: '#FAF7F0', fontWeight: 600 }}>{featured.startDate}</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 9, color: 'rgba(250,247,240,0.35)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 4 }}>Voyageurs</div>
                <div style={{ fontSize: 13, color: '#FAF7F0', fontWeight: 600 }}>{featured.nbPeople} pers.</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 9, color: 'rgba(250,247,240,0.35)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 4 }}>Total</div>
                <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: 19, color: '#C9A84C', fontWeight: 700 }}>
                  {featured.totalPrice} €
                </div>
              </div>
            </div>
          </div>

          {/* ── OTHER TRIPS ── */}
          {others.length > 0 && (
            <div style={{ marginBottom: 28 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(26,18,9,0.38)' }}>
                  Autres voyages
                </div>
                <Link href="/espace/reservations" style={{ fontSize: 11.5, fontWeight: 700, color: '#C9A84C', textDecoration: 'none' }}>
                  Voir tout →
                </Link>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {others.map(r => {
                  const sc = STATUS[r.status] || { label: r.status, dot: '#C9A84C', color: '#7A6D5A' };
                  const isCancelled = r.status === 'CANCELLED';
                  return (
                    <div key={r.id} style={{
                      background: 'white',
                      border: '0.5px solid rgba(26,18,9,0.07)',
                      borderRadius: 14, padding: '14px 16px',
                      display: 'flex', alignItems: 'center', gap: 14,
                      boxShadow: '0 1px 4px rgba(26,18,9,0.04)',
                      opacity: isCancelled ? 0.55 : 1,
                    }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: sc.dot, flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13.5, fontWeight: 700, color: '#1A1209', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {r.guideName}
                        </div>
                        <div style={{ fontSize: 11.5, color: 'rgba(26,18,9,0.42)' }}>
                          {r.startDate} · {r.nbPeople} pers.
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontSize: 13.5, fontWeight: 700, color: '#1A1209' }}>{r.totalPrice} €</div>
                        <div style={{ fontSize: 10.5, color: sc.color, fontWeight: 600, marginTop: 1 }}>{sc.label}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── STATS STRIP ── */}
          <div style={{
            background: '#FAF7F0',
            borderRadius: 16, padding: '16px 20px',
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
            border: '0.5px solid rgba(26,18,9,0.06)',
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: 30, fontWeight: 700, color: '#1A1209', lineHeight: 1 }}>
                {stats.totalReservations}
              </div>
              <div style={{ fontSize: 9.5, color: 'rgba(26,18,9,0.42)', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 4 }}>
                Voyages
              </div>
            </div>
            <div style={{ textAlign: 'center', borderLeft: '0.5px solid rgba(26,18,9,0.07)', borderRight: '0.5px solid rgba(26,18,9,0.07)' }}>
              <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: 30, fontWeight: 700, color: '#1A6B3F', lineHeight: 1 }}>
                {stats.completedReservations}
              </div>
              <div style={{ fontSize: 9.5, color: 'rgba(26,18,9,0.42)', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 4 }}>
                Terminés
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: 30, fontWeight: 700, color: '#C9A84C', lineHeight: 1 }}>
                {stats.totalSpent > 0 ? `${stats.totalSpent}` : '—'}
              </div>
              {stats.totalSpent > 0 && (
                <div style={{ fontSize: 8.5, color: 'rgba(26,18,9,0.3)', marginBottom: -2 }}>€</div>
              )}
              <div style={{ fontSize: 9.5, color: 'rgba(26,18,9,0.42)', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 4 }}>
                Dépensé
              </div>
            </div>
          </div>
        </>
      ) : (
        /* ── EMPTY STATE ── */
        <div style={{
          background: 'linear-gradient(150deg, #1A1209 0%, #2D1F08 100%)',
          borderRadius: 20, padding: '44px 28px',
          textAlign: 'center',
          border: '0.5px solid rgba(201,168,76,0.15)',
          boxShadow: '0 8px 32px rgba(26,18,9,0.12)',
        }}>
          <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(201,168,76,0.1)', border: '0.5px solid rgba(201,168,76,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="#C9A84C" strokeWidth="1.5" strokeLinejoin="round"/>
              <polyline points="9,22 9,12 15,12 15,22" stroke="#C9A84C" strokeWidth="1.5"/>
            </svg>
          </div>
          <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: 24, color: '#FAF7F0', fontWeight: 600, marginBottom: 10, lineHeight: 1.2 }}>
            Votre voyage <em style={{ color: '#C9A84C', fontStyle: 'italic' }}>commence ici</em>
          </div>
          <div style={{ fontSize: 13, color: 'rgba(250,247,240,0.5)', lineHeight: 1.7, maxWidth: 280, margin: '0 auto 28px' }}>
            Trouvez un guide privé certifié dans votre langue et réservez votre Omra en quelques clics.
          </div>
          <Link href="/guides" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: '#C9A84C', color: '#1A1209',
            padding: '11px 28px', borderRadius: 999,
            fontSize: 13, fontWeight: 700, textDecoration: 'none',
            letterSpacing: '0.03em',
          }}>
            Découvrir les guides
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path d="M2.5 6h7M6 2.5l3.5 3.5L6 9.5" stroke="#1A1209" strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
          </Link>
        </div>
      )}
    </div>
  );
}
