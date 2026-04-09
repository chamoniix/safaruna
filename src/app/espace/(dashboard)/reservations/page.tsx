'use client';

import { useState, useEffect } from 'react';

type Reservation = {
  id: string;
  refNumber: string;
  guideName: string;
  packageName: string;
  durationDays: number;
  startDate: string;
  startDateRaw: string;
  nbPeople: number;
  totalPrice: number;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  review: { rating: number; comment: string | null } | null;
};

type Stats = { total: number; upcoming: number; completed: number; totalSpent: number };

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  PENDING:   { label: 'En attente', color: '#D97706', bg: '#FEF3C7' },
  CONFIRMED: { label: 'Confirmée',  color: '#1D4ED8', bg: '#DBEAFE' },
  COMPLETED: { label: 'Terminée',   color: '#1D5C3A', bg: '#D1FAE5' },
  CANCELLED: { label: 'Annulée',    color: '#DC2626', bg: '#FEE2E2' },
};

const FILTERS = [
  { key: 'ALL',       label: 'Toutes' },
  { key: 'CONFIRMED', label: 'À venir' },
  { key: 'COMPLETED', label: 'Complétées' },
  { key: 'CANCELLED', label: 'Annulées' },
];

const card: React.CSSProperties = {
  background: 'white', border: '1px solid #E8DFC8', borderRadius: 12,
  boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
};

function ReviewModal({ reservationId, onClose, onSuccess }: {
  reservationId: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [rating, setRating]     = useState(0);
  const [hovered, setHovered]   = useState(0);
  const [comment, setComment]   = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]       = useState('');

  const handleSubmit = async () => {
    if (rating === 0) { setError('Sélectionne une note (1 à 5 étoiles).'); return; }
    if (!comment.trim()) { setError('Ajoute un commentaire.'); return; }
    setSubmitting(true); setError('');
    try {
      const res = await fetch('/api/espace/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reservationId, rating, comment: comment.trim() }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Erreur'); }
      onSuccess();
    } catch (e: any) { setError(e.message); }
    setSubmitting(false);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(26,18,9,0.6)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={onClose}>
      <div style={{ ...card, padding: '1.75rem', maxWidth: 440, width: '100%', fontFamily: 'var(--font-manrope, sans-serif)' }} onClick={e => e.stopPropagation()}>
        <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.3rem', fontWeight: 700, color: '#1A1209', marginBottom: '1.25rem' }}>Laisser un avis</div>
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#7A6D5A', marginBottom: '0.5rem' }}>Note</div>
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            {[1, 2, 3, 4, 5].map(n => (
              <button key={n} onMouseEnter={() => setHovered(n)} onMouseLeave={() => setHovered(0)} onClick={() => setRating(n)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.6rem', color: n <= (hovered || rating) ? '#C9A84C' : '#E8DFC8', padding: '0.1rem', lineHeight: 1 }}>★</button>
            ))}
          </div>
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#7A6D5A', marginBottom: '0.5rem' }}>Commentaire</div>
          <textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Partagez votre expérience avec ce guide…" rows={4}
            style={{ width: '100%', padding: '0.75rem', border: '1.5px solid #E8DFC8', borderRadius: 8, fontSize: '0.85rem', color: '#1A1209', fontFamily: 'inherit', resize: 'vertical', outline: 'none', boxSizing: 'border-box', background: '#FDFBF7' }} />
        </div>
        {error && <div style={{ fontSize: '0.78rem', color: '#DC2626', marginBottom: '0.875rem' }}>{error}</div>}
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={onClose} style={{ flex: 1, padding: '0.65rem', borderRadius: 50, border: '1px solid #E8DFC8', background: 'white', color: '#7A6D5A', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Annuler</button>
          <button onClick={handleSubmit} disabled={submitting} style={{ flex: 2, padding: '0.65rem', borderRadius: 50, border: 'none', background: '#1A1209', color: '#F0D897', fontSize: '0.82rem', fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: submitting ? 0.7 : 1 }}>
            {submitting ? 'Envoi…' : 'Publier l\'avis'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function EspaceReservations() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [stats, setStats]               = useState<Stats | null>(null);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');
  const [filter, setFilter]             = useState('ALL');
  const [reviewModal, setReviewModal]   = useState<string | null>(null);

  const fetchData = () => {
    setLoading(true); setError('');
    fetch('/api/espace/reservations')
      .then(r => { if (!r.ok) throw new Error('Erreur ' + r.status); return r.json(); })
      .then(d => { setReservations(d.reservations || []); setStats(d.stats); setLoading(false); })
      .catch((e: Error) => { setError(e.message); setLoading(false); });
  };

  useEffect(() => { fetchData(); }, []);

  const now = new Date();
  const visible = reservations.filter(r => {
    if (filter === 'CONFIRMED') return r.status === 'CONFIRMED' && new Date(r.startDateRaw) > now;
    if (filter === 'COMPLETED') return r.status === 'COMPLETED';
    if (filter === 'CANCELLED') return r.status === 'CANCELLED';
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', fontFamily: 'var(--font-manrope, sans-serif)' }}>

      {reviewModal && <ReviewModal reservationId={reviewModal} onClose={() => setReviewModal(null)} onSuccess={() => { setReviewModal(null); fetchData(); }} />}

      {error && (
        <div style={{ background: '#FEE2E2', border: '1px solid #FCA5A5', borderRadius: 8, padding: '0.75rem 1rem', fontSize: '0.83rem', color: '#DC2626' }}>
          {error} — <button onClick={fetchData} style={{ color: '#DC2626', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', textDecoration: 'underline' }}>Réessayer</button>
        </div>
      )}

      {/* Stats bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
        {loading ? Array.from({ length: 4 }).map((_, i) => <div key={i} style={{ ...card, height: 90, background: '#F0EDE8' }} />) : stats ? (
          <>
            <div style={{ ...card, padding: '1rem 1.25rem' }}>
              <div style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#7A6D5A', marginBottom: '0.4rem' }}>Total</div>
              <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '2rem', fontWeight: 700, color: '#1A1209', lineHeight: 1 }}>{stats.total}</div>
            </div>
            <div style={{ ...card, background: '#FEF3C7', padding: '1rem 1.25rem' }}>
              <div style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#7A6D5A', marginBottom: '0.4rem' }}>À venir</div>
              <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '2rem', fontWeight: 700, color: '#D97706', lineHeight: 1 }}>{stats.upcoming}</div>
            </div>
            <div style={{ ...card, background: '#D1FAE5', padding: '1rem 1.25rem' }}>
              <div style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#7A6D5A', marginBottom: '0.4rem' }}>Complétées</div>
              <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '2rem', fontWeight: 700, color: '#1D5C3A', lineHeight: 1 }}>{stats.completed}</div>
            </div>
            <div style={{ ...card, background: '#FEF9E7', padding: '1rem 1.25rem' }}>
              <div style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#7A6D5A', marginBottom: '0.4rem' }}>Total dépensé</div>
              <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '2rem', fontWeight: 700, color: '#C9A84C', lineHeight: 1 }}>{stats.totalSpent} €</div>
            </div>
          </>
        ) : null}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
        {FILTERS.map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)} style={{
            padding: '0.45rem 0.875rem', borderRadius: 20, cursor: 'pointer',
            fontSize: '0.72rem', fontWeight: 700, fontFamily: 'inherit',
            background: filter === f.key ? '#1A1209' : 'white',
            color: filter === f.key ? '#F0D897' : '#7A6D5A',
            border: `1px solid ${filter === f.key ? '#1A1209' : '#E8DFC8'}`,
          }}>{f.label}</button>
        ))}
        <span style={{ marginLeft: 'auto', fontSize: '0.78rem', color: '#7A6D5A', alignSelf: 'center' }}>
          {loading ? '…' : `${visible.length} résultat${visible.length !== 1 ? 's' : ''}`}
        </span>
      </div>

      {/* Table */}
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
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #F0EBE0' }}>
                    {Array.from({ length: 8 }).map((_, j) => (
                      <td key={j} style={{ padding: '0.875rem' }}>
                        <div style={{ height: 12, background: '#F0EDE8', borderRadius: 4, width: j === 0 ? 80 : 60 }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : visible.length === 0 ? (
                <tr><td colSpan={8} style={{ padding: '2.5rem', textAlign: 'center', color: '#7A6D5A', fontSize: '0.85rem' }}>Aucune réservation trouvée</td></tr>
              ) : (
                visible.map((r, i) => {
                  const sc = STATUS_CONFIG[r.status] || { label: r.status, color: '#6B7280', bg: '#F3F4F6' };
                  return (
                    <tr key={r.id} style={{ background: i % 2 === 0 ? 'white' : '#FAFAF8', borderBottom: '1px solid #F0EBE0' }}>
                      <td style={{ padding: '0.75rem 0.875rem', fontSize: '0.75rem', fontWeight: 700, color: '#1A1209', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>{r.refNumber}</td>
                      <td style={{ padding: '0.75rem 0.875rem', fontSize: '0.82rem', fontWeight: 600, color: '#1A1209', whiteSpace: 'nowrap' }}>{r.guideName}</td>
                      <td style={{ padding: '0.75rem 0.875rem', fontSize: '0.75rem', color: '#7A6D5A' }}>{r.packageName}<br /><span style={{ fontSize: '0.65rem' }}>{r.durationDays}j</span></td>
                      <td style={{ padding: '0.75rem 0.875rem', fontSize: '0.75rem', color: '#4A3F30', whiteSpace: 'nowrap' }}>{r.startDate}</td>
                      <td style={{ padding: '0.75rem 0.875rem', fontSize: '0.82rem', color: '#1A1209', textAlign: 'center' }}>{r.nbPeople}</td>
                      <td style={{ padding: '0.75rem 0.875rem', fontSize: '0.85rem', fontWeight: 700, color: '#1A1209', whiteSpace: 'nowrap' }}>{r.totalPrice} €</td>
                      <td style={{ padding: '0.75rem 0.875rem' }}>
                        <span style={{ display: 'inline-block', background: sc.bg, color: sc.color, fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.06em', padding: '0.25rem 0.6rem', borderRadius: 20, whiteSpace: 'nowrap' }}>{sc.label}</span>
                      </td>
                      <td style={{ padding: '0.75rem 0.875rem', whiteSpace: 'nowrap' }}>
                        {r.review ? (
                          <span style={{ fontSize: '0.82rem', color: '#C9A84C', fontWeight: 700 }}>★ {r.review.rating}</span>
                        ) : r.status === 'COMPLETED' ? (
                          <button onClick={() => setReviewModal(r.id)} style={{ padding: '0.3rem 0.65rem', borderRadius: 50, border: '1px solid #C9A84C', background: 'white', color: '#C9A84C', fontSize: '0.68rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
                            Laisser un avis
                          </button>
                        ) : (
                          <span style={{ color: '#9A8A7A', fontSize: '0.78rem' }}>—</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
