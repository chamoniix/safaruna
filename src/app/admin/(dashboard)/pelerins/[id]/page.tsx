'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

type PelerinDetail = {
  id: string;
  name: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  country: string | null;
  phoneWhatsapp: string | null;
  createdAt: string;
  lastLogin: string | null;
  role: string;
  stats: {
    totalReservations: number;
    completedReservations: number;
    totalSpent: number;
    avgRating: number | null;
  };
  reservations: {
    id: string;
    refNumber: string;
    guideName: string;
    packageName: string;
    durationDays: number;
    startDate: string;
    nbPeople: number;
    totalPrice: number;
    status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
    createdAt: string;
    review: { rating: number; comment: string | null } | null;
  }[];
  notifications: {
    id: string;
    type: string;
    title: string;
    message: string;
    createdAt: string;
    readAt: string | null;
  }[];
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

function Skeleton({ h = 110 }: { h?: number }) {
  return <div style={{ ...card, height: h, background: '#F0EDE8' }} />;
}

export default function PelerinDetailPage() {
  const params  = useParams();
  const router  = useRouter();
  const id      = params?.id as string;

  const [data, setData]       = useState<PelerinDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    if (!id) return;
    setLoading(true); setError('');
    fetch(`/api/admin/pelerins/${id}`)
      .then(r => {
        if (r.status === 404) throw new Error('Pèlerin introuvable');
        if (!r.ok) throw new Error('Erreur ' + r.status);
        return r.json();
      })
      .then(d => { setData(d); setLoading(false); })
      .catch((e: Error) => { setError(e.message); setLoading(false); });
  }, [id]);

  const initials = data?.name ? data.name.slice(0, 2).toUpperCase() : '??';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', fontFamily: 'var(--font-manrope, sans-serif)' }}>

      {/* Back button */}
      <button
        onClick={() => router.push('/admin/pelerins')}
        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'none', border: 'none', cursor: 'pointer', color: '#7A6D5A', fontSize: '0.82rem', fontWeight: 600, fontFamily: 'inherit', padding: 0, width: 'fit-content' }}
      >
        ← Retour aux pèlerins
      </button>

      {/* Error */}
      {error && (
        <div style={{ background: '#FEE2E2', border: '1px solid #FCA5A5', borderRadius: 8, padding: '0.875rem 1rem', fontSize: '0.83rem', color: '#DC2626' }}>
          {error}
        </div>
      )}

      {/* Header card */}
      {loading ? <Skeleton h={120} /> : data ? (
        <div style={{ ...card, padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
          {/* Avatar */}
          <div style={{
            width: 56, height: 56, borderRadius: '50%',
            background: '#E8DFC8', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.4rem', fontWeight: 700, color: '#1A1209', flexShrink: 0,
          }}>
            {initials}
          </div>
          {/* Info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '0.25rem' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1A1209' }}>{data.name}</div>
              <span style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', background: '#E8DFC8', color: '#7A6D5A', padding: '0.2rem 0.6rem', borderRadius: 50 }}>
                {data.role}
              </span>
            </div>
            <div style={{ fontSize: '0.82rem', color: '#7A6D5A', marginBottom: '0.2rem' }}>{data.email}</div>
            <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', fontSize: '0.75rem', color: '#9A8A7A' }}>
              <span>Inscrit le {data.createdAt}</span>
              {data.lastLogin && <span>Dernière connexion : {data.lastLogin}</span>}
              {data.country && <span>📍 {data.country}</span>}
              {data.phoneWhatsapp && <span>📱 {data.phoneWhatsapp}</span>}
            </div>
          </div>
        </div>
      ) : null}

      {/* Stats bar */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} h={90} />)}
        </div>
      ) : data ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
          <div style={{ ...card, background: '#DBEAFE', padding: '1.1rem 1.25rem' }}>
            <div style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#7A6D5A', marginBottom: '0.5rem' }}>Total réservations</div>
            <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '2rem', fontWeight: 700, color: '#1D4ED8', lineHeight: 1 }}>{data.stats.totalReservations}</div>
          </div>
          <div style={{ ...card, background: '#D1FAE5', padding: '1.1rem 1.25rem' }}>
            <div style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#7A6D5A', marginBottom: '0.5rem' }}>Complétées</div>
            <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '2rem', fontWeight: 700, color: '#1D5C3A', lineHeight: 1 }}>{data.stats.completedReservations}</div>
          </div>
          <div style={{ ...card, background: '#FEF9E7', padding: '1.1rem 1.25rem' }}>
            <div style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#7A6D5A', marginBottom: '0.5rem' }}>Total dépensé</div>
            <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '2rem', fontWeight: 700, color: '#C9A84C', lineHeight: 1 }}>{data.stats.totalSpent} €</div>
          </div>
          <div style={{ ...card, padding: '1.1rem 1.25rem' }}>
            <div style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#7A6D5A', marginBottom: '0.5rem' }}>Note moyenne donnée</div>
            <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '2rem', fontWeight: 700, color: '#1A1209', lineHeight: 1 }}>
              {data.stats.avgRating !== null ? `★ ${data.stats.avgRating}` : '—'}
            </div>
          </div>
        </div>
      ) : null}

      {/* Reservations table */}
      <section>
        <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#7A6D5A', marginBottom: '0.875rem' }}>
          Historique des réservations
        </div>
        <div style={{ ...card, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 760 }}>
              <thead>
                <tr style={{ background: '#F5F2EC', borderBottom: '1px solid #E8DFC8' }}>
                  {['Réf', 'Guide', 'Package', 'Départ', 'Pers.', 'Montant', 'Statut', 'Avis'].map(h => (
                    <th key={h} style={{ padding: '0.75rem 0.875rem', textAlign: 'left', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#7A6D5A', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #F0EBE0' }}>
                      {Array.from({ length: 8 }).map((_, j) => (
                        <td key={j} style={{ padding: '0.875rem' }}>
                          <div style={{ height: 12, background: '#F0EDE8', borderRadius: 4, width: j === 0 ? 80 : 60 }} />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : !data || data.reservations.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ padding: '2.5rem', textAlign: 'center', color: '#7A6D5A', fontSize: '0.85rem' }}>
                      Aucune réservation
                    </td>
                  </tr>
                ) : (
                  data.reservations.map((r, i) => {
                    const sc = STATUS_CONFIG[r.status] || { label: r.status, color: '#6B7280', bg: '#F3F4F6' };
                    return (
                      <tr key={r.id} style={{ background: i % 2 === 0 ? 'white' : '#FAFAF8', borderBottom: '1px solid #F0EBE0' }}>
                        <td style={{ padding: '0.75rem 0.875rem', fontSize: '0.75rem', fontWeight: 700, color: '#1A1209', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>{r.refNumber}</td>
                        <td style={{ padding: '0.75rem 0.875rem', fontSize: '0.82rem', color: '#4A3F30', whiteSpace: 'nowrap' }}>{r.guideName}</td>
                        <td style={{ padding: '0.75rem 0.875rem', fontSize: '0.75rem', color: '#7A6D5A' }}>
                          {r.packageName}<br />
                          <span style={{ fontSize: '0.65rem' }}>{r.durationDays}j</span>
                        </td>
                        <td style={{ padding: '0.75rem 0.875rem', fontSize: '0.75rem', color: '#4A3F30', whiteSpace: 'nowrap' }}>{r.startDate}</td>
                        <td style={{ padding: '0.75rem 0.875rem', fontSize: '0.82rem', color: '#1A1209', textAlign: 'center' }}>{r.nbPeople}</td>
                        <td style={{ padding: '0.75rem 0.875rem', fontSize: '0.85rem', fontWeight: 700, color: '#1A1209', whiteSpace: 'nowrap' }}>{r.totalPrice} €</td>
                        <td style={{ padding: '0.75rem 0.875rem' }}>
                          <span style={{ display: 'inline-block', background: sc.bg, color: sc.color, fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.06em', padding: '0.25rem 0.6rem', borderRadius: 20, whiteSpace: 'nowrap' }}>{sc.label}</span>
                        </td>
                        <td style={{ padding: '0.75rem 0.875rem', fontSize: '0.82rem', color: '#C9A84C', whiteSpace: 'nowrap' }}>
                          {r.review ? `★ ${r.review.rating}` : '—'}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Notifications */}
      {!loading && data && data.notifications.length > 0 && (
        <section>
          <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#7A6D5A', marginBottom: '0.875rem' }}>
            Dernières notifications
          </div>
          <div style={{ ...card, overflow: 'hidden' }}>
            {data.notifications.map((n, i) => (
              <div key={n.id} style={{
                padding: '0.875rem 1.1rem',
                borderBottom: i < data.notifications.length - 1 ? '1px solid #F0EBE0' : 'none',
                display: 'flex', gap: '0.875rem', alignItems: 'flex-start',
                background: n.readAt ? 'white' : '#FFFBF0',
              }}>
                <span style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', background: '#E8DFC8', color: '#7A6D5A', padding: '0.2rem 0.5rem', borderRadius: 4, whiteSpace: 'nowrap', marginTop: 2 }}>
                  {n.type}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#1A1209', marginBottom: '0.15rem' }}>{n.title}</div>
                  <div style={{ fontSize: '0.75rem', color: '#7A6D5A', lineHeight: 1.5 }}>{n.message}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem', flexShrink: 0 }}>
                  <span style={{ fontSize: '0.68rem', color: '#9A8A7A', whiteSpace: 'nowrap' }}>{n.createdAt}</span>
                  <span style={{ fontSize: '0.6rem', fontWeight: 700, color: n.readAt ? '#1D5C3A' : '#D97706' }}>
                    {n.readAt ? 'Lu' : 'Non lu'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

    </div>
  );
}
