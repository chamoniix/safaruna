'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

type Reservation = {
  id: string; refNumber: string; guideName: string;
  packageName: string; durationDays: number;
  startDate: string; startDateRaw: string;
  nbPeople: number; totalPrice: number; status: string;
  createdAt: string;
  review: { rating: number; comment: string } | null;
};

type ReservationsData = {
  stats: { total: number; upcoming: number; completed: number; totalSpent: number; };
  reservations: Reservation[];
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  PENDING:   { label: 'En attente', color: '#D97706', bg: '#FEF3C7' },
  CONFIRMED: { label: 'Confirmée',  color: '#1D4ED8', bg: '#DBEAFE' },
  COMPLETED: { label: 'Terminée',   color: '#1D5C3A', bg: '#D1FAE5' },
  CANCELLED: { label: 'Annulée',    color: '#DC2626', bg: '#FEE2E2' },
};

const FILTERS = [
  { key: 'ALL',       label: 'Toutes' },
  { key: 'PENDING',   label: 'En attente' },
  { key: 'CONFIRMED', label: 'Confirmées' },
  { key: 'COMPLETED', label: 'Terminées' },
  { key: 'CANCELLED', label: 'Annulées' },
];

const card: React.CSSProperties = {
  background: 'white', border: '1px solid #E8DFC8',
  borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
};

const labelStyle: React.CSSProperties = {
  fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em',
  textTransform: 'uppercase' as const, color: '#7A6D5A', marginBottom: '0.4rem',
};

function Skeleton({ w, h = 14 }: { w?: number | string; h?: number }) {
  return <div style={{ height: h, background: '#F0EDE8', borderRadius: 4, width: w ?? '100%' }} />;
}

function ReviewModal({ reservation, onClose, onSuccess }: {
  reservation: Reservation; onClose: () => void; onSuccess: () => void;
}) {
  const [rating, setRating]       = useState(0);
  const [hovered, setHovered]     = useState(0);
  const [comment, setComment]     = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleSubmit = async () => {
    if (rating === 0) { setSubmitError('Sélectionnez une note de 1 à 5 étoiles.'); return; }
    if (comment.trim().length < 20) { setSubmitError('Le commentaire doit contenir au moins 20 caractères.'); return; }
    setSubmitting(true); setSubmitError('');
    try {
      const res = await fetch('/api/espace/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reservationId: reservation.id, rating, comment: comment.trim() }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Erreur'); }
      onSuccess();
    } catch (e: any) { setSubmitError(e.message); }
    setSubmitting(false);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(26,18,9,0.6)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={onClose}>
      <div style={{ ...card, padding: '1.75rem', maxWidth: 460, width: '100%', fontFamily: 'var(--font-manrope, sans-serif)' }} onClick={e => e.stopPropagation()}>
        <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.3rem', fontWeight: 700, color: '#1A1209', marginBottom: '0.35rem' }}>Votre avis</div>
        <div style={{ fontSize: '0.75rem', color: '#7A6D5A', marginBottom: '1.25rem' }}>{reservation.guideName} · {reservation.packageName}</div>
        <div style={{ marginBottom: '1rem' }}>
          <div style={labelStyle}>Note</div>
          <div style={{ display: 'flex', gap: '0.35rem' }}>
            {[1, 2, 3, 4, 5].map(n => (
              <span key={n} onMouseEnter={() => setHovered(n)} onMouseLeave={() => setHovered(0)} onClick={() => setRating(n)}
                style={{ fontSize: '1.8rem', color: n <= (hovered || rating) ? '#C9A84C' : '#E8DFC8', cursor: 'pointer', lineHeight: 1, transition: 'color 0.1s' }}>★</span>
            ))}
          </div>
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <div style={labelStyle}>Commentaire</div>
          <textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Décrivez votre expérience..." rows={4}
            style={{ width: '100%', padding: '0.75rem', border: '1.5px solid #E8DFC8', borderRadius: 8, fontSize: '0.85rem', color: '#1A1209', fontFamily: 'inherit', resize: 'vertical', outline: 'none', boxSizing: 'border-box', background: '#FDFBF7' }} />
        </div>
        {submitError && <div style={{ fontSize: '0.78rem', color: '#DC2626', marginBottom: '0.875rem' }}>{submitError}</div>}
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={onClose} style={{ flex: 1, padding: '0.65rem', borderRadius: 50, border: '1px solid #E8DFC8', background: 'white', color: '#7A6D5A', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Annuler</button>
          <button onClick={handleSubmit} disabled={submitting} style={{ flex: 2, padding: '0.65rem', borderRadius: 50, border: 'none', background: '#1A1209', color: '#F0D897', fontSize: '0.82rem', fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: submitting ? 0.7 : 1 }}>
            {submitting ? 'Envoi…' : "Publier l'avis"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function EspaceReservations() {
  const [data, setData]       = useState<ReservationsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [filter, setFilter]   = useState('ALL');
  const [reviewTarget, setReviewTarget] = useState<Reservation | null>(null);

  const fetchData = () => {
    setLoading(true); setError('');
    fetch('/api/espace/reservations')
      .then(r => { if (!r.ok) throw new Error('Erreur ' + r.status); return r.json(); })
      .then(d => { setData(d); setLoading(false); })
      .catch((e: Error) => { setError(e.message); setLoading(false); });
  };

  useEffect(() => { fetchData(); }, []);

  const visible = data?.reservations.filter(r => filter === 'ALL' || r.status === filter) ?? [];

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', fontFamily: 'var(--font-manrope, sans-serif)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} style={{ ...card, padding: '1rem 1.25rem', height: 90 }}>
              <Skeleton /><div style={{ marginTop: '0.75rem' }}><Skeleton w={60} h={28} /></div>
            </div>
          ))}
        </div>
        <div style={{ ...card, overflow: 'hidden' }}>
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #F0EBE0' }}><Skeleton w={180} /></div>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} style={{ display: 'flex', gap: '1rem', padding: '0.875rem 1.25rem', borderBottom: '1px solid #F5F2EC' }}>
              {Array.from({ length: 8 }).map((_, j) => <Skeleton key={j} w={j === 0 ? 80 : 60} />)}
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

  const { stats } = data;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', fontFamily: 'var(--font-manrope, sans-serif)' }}>

      {reviewTarget && (
        <ReviewModal reservation={reviewTarget} onClose={() => setReviewTarget(null)} onSuccess={() => { setReviewTarget(null); fetchData(); }} />
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
        <div style={{ ...card, padding: '1rem 1.25rem', background: '#DBEAFE' }}>
          <div style={labelStyle}>Total</div>
          <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '2rem', fontWeight: 700, color: '#1D4ED8', lineHeight: 1 }}>{stats.total}</div>
        </div>
        <div style={{ ...card, padding: '1rem 1.25rem', background: '#FEF3C7' }}>
          <div style={labelStyle}>À venir</div>
          <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '2rem', fontWeight: 700, color: '#D97706', lineHeight: 1 }}>{stats.upcoming}</div>
        </div>
        <div style={{ ...card, padding: '1rem 1.25rem', background: '#D1FAE5' }}>
          <div style={labelStyle}>Complétées</div>
          <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '2rem', fontWeight: 700, color: '#1D5C3A', lineHeight: 1 }}>{stats.completed}</div>
        </div>
        <div style={{ ...card, padding: '1rem 1.25rem', background: '#FAF3E0' }}>
          <div style={labelStyle}>Dépensé</div>
          <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '2rem', fontWeight: 700, color: '#8B6914', lineHeight: 1 }}>{stats.totalSpent} €</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
        {FILTERS.map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)} style={{
            padding: '0.45rem 0.875rem', borderRadius: 20, cursor: 'pointer',
            fontSize: '0.72rem', fontWeight: 700, fontFamily: 'inherit',
            background: filter === f.key ? '#1A1209' : 'white',
            color: filter === f.key ? '#F0D897' : '#7A6D5A',
            border: `1px solid ${filter === f.key ? '#1A1209' : '#E8DFC8'}`,
          }}>{f.label}</button>
        ))}
        <span style={{ marginLeft: 'auto', fontSize: '0.78rem', color: '#7A6D5A' }}>
          {visible.length} réservation{visible.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div style={{ ...card, overflow: 'hidden' }}>
        {visible.length === 0 ? (
          <div style={{ padding: '3rem 2rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.875rem' }}>🕋</div>
            <div style={{ fontSize: '0.85rem', color: '#7A6D5A', marginBottom: '1.25rem' }}>Aucune réservation pour ce filtre.</div>
            <Link href="/guides" style={{ display: 'inline-block', background: '#1A1209', color: '#F0D897', padding: '0.65rem 1.5rem', borderRadius: 50, fontWeight: 700, fontSize: '0.82rem', textDecoration: 'none' }}>Trouver un guide</Link>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 780 }}>
              <thead>
                <tr style={{ background: '#F5F2EC', borderBottom: '1px solid #E8DFC8' }}>
                  {['Réf', 'Guide', 'Forfait', 'Départ', 'Pers.', 'Montant', 'Statut', 'Avis'].map(h => (
                    <th key={h} style={{ padding: '0.75rem 0.875rem', textAlign: 'left', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#7A6D5A', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visible.map((r, i) => {
                  const sc = STATUS_CONFIG[r.status] || { label: r.status, color: '#6B7280', bg: '#F3F4F6' };
                  return (
                    <tr key={r.id} style={{ background: i % 2 === 0 ? 'white' : '#FAFAF8', borderBottom: '1px solid #F0EBE0' }}>
                      <td style={{ padding: '0.75rem 0.875rem', fontSize: '0.72rem', fontWeight: 700, color: '#1A1209', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>{r.refNumber}</td>
                      <td style={{ padding: '0.75rem 0.875rem', fontSize: '0.82rem', fontWeight: 600, color: '#1A1209', whiteSpace: 'nowrap' }}>{r.guideName}</td>
                      <td style={{ padding: '0.75rem 0.875rem', fontSize: '0.75rem', color: '#7A6D5A' }}>{r.packageName}<br /><span style={{ fontSize: '0.65rem' }}>{r.durationDays}j</span></td>
                      <td style={{ padding: '0.75rem 0.875rem', fontSize: '0.75rem', color: '#4A3F30', whiteSpace: 'nowrap' }}>{r.startDate}</td>
                      <td style={{ padding: '0.75rem 0.875rem', fontSize: '0.82rem', color: '#1A1209', textAlign: 'center' }}>{r.nbPeople}</td>
                      <td style={{ padding: '0.75rem 0.875rem', fontSize: '0.85rem', fontWeight: 700, color: '#1A1209', whiteSpace: 'nowrap' }}>{r.totalPrice} €</td>
                      <td style={{ padding: '0.75rem 0.875rem' }}>
                        <span style={{ display: 'inline-block', background: sc.bg, color: sc.color, fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.06em', padding: '0.25rem 0.6rem', borderRadius: 20, whiteSpace: 'nowrap' }}>{sc.label}</span>
                      </td>
                      <td style={{ padding: '0.75rem 0.875rem', whiteSpace: 'nowrap' }}>
                        {r.status !== 'COMPLETED' ? (
                          <span style={{ color: '#9A8A7A', fontSize: '0.78rem' }}>—</span>
                        ) : r.review !== null ? (
                          <span style={{ fontSize: '0.82rem', color: '#1D5C3A', fontWeight: 700 }}>★ {r.review.rating}/5</span>
                        ) : (
                          <button onClick={() => setReviewTarget(r)} style={{ padding: '0.3rem 0.65rem', borderRadius: 50, border: '1px solid rgba(201,168,76,0.4)', background: '#FAF3E0', color: '#8B6914', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
                            Laisser un avis
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
