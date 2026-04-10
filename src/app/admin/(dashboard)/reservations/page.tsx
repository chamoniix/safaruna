'use client';

import { useState, useEffect } from 'react';

type Reservation = {
  id: string;
  refNumber: string;
  pelerin: string;
  guide: string;
  packageName: string;
  durationDays: number;
  startDate: string;
  nbPeople: number;
  basePrice: number;
  commissionAmount: number;
  totalPrice: number;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  PENDING:   { label: 'En attente', color: '#D97706', bg: '#FEF3C7' },
  CONFIRMED: { label: 'Confirmée',  color: '#1D4ED8', bg: '#DBEAFE' },
  COMPLETED: { label: 'Terminée',   color: '#1D5C3A', bg: '#D1FAE5' },
  CANCELLED: { label: 'Annulée',    color: '#DC2626', bg: '#FEE2E2' },
};

const FILTER_OPTIONS = [
  { key: 'ALL',       label: 'Toutes' },
  { key: 'PENDING',   label: 'En attente' },
  { key: 'CONFIRMED', label: 'Confirmée' },
  { key: 'COMPLETED', label: 'Terminée' },
  { key: 'CANCELLED', label: 'Annulée' },
];

export default function AdminReservations() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');
  const [filter, setFilter]             = useState('ALL');
  const [search, setSearch]             = useState('');

  // Modal state
  const [managingResa, setManagingResa]       = useState<Reservation | null>(null);
  const [modalStatus, setModalStatus]         = useState('');
  const [motif, setMotif]                     = useState('');
  const [submittingModal, setSubmittingModal] = useState(false);

  const fetchReservations = async () => {
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/admin/reservations');
      if (!res.ok) throw new Error('Erreur ' + res.status);
      const data = await res.json();
      setReservations(data.reservations || []);
    } catch (e: any) { setError(e.message || 'Erreur réseau'); }
    setLoading(false);
  };

  useEffect(() => { fetchReservations(); }, []);

  const visible = reservations
    .filter(r => filter === 'ALL' || r.status === filter)
    .filter(r => !search ||
      r.refNumber.toLowerCase().includes(search.toLowerCase()) ||
      r.pelerin.toLowerCase().includes(search.toLowerCase()) ||
      r.guide.toLowerCase().includes(search.toLowerCase())
    );

  const activeResas = reservations.filter(r => r.status !== 'CANCELLED');
  const stats = [
    { label: 'Total réservations', value: reservations.length,                              color: '#1A1209', bg: 'white' },
    { label: 'En attente',         value: reservations.filter(r => r.status === 'PENDING').length,   color: '#D97706', bg: '#FEF3C7' },
    { label: 'Confirmées',         value: reservations.filter(r => r.status === 'CONFIRMED').length, color: '#1D4ED8', bg: '#DBEAFE' },
    { label: 'Commissions (€)',    value: `${Math.round(activeResas.reduce((s, r) => s + r.commissionAmount, 0))} €`, color: '#1D5C3A', bg: '#D1FAE5' },
  ];

  const handleModal = async () => {
    if (!managingResa) return;
    if (motif.trim().length < 10) {
      alert('Le motif doit faire au moins 10 caractères.');
      return;
    }
    const sc = STATUS_CONFIG[modalStatus];
    if (!window.confirm(`Passer en "${sc?.label ?? modalStatus}" ?`)) return;
    setSubmittingModal(true);
    try {
      const res = await fetch('/api/admin/reservations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reservationId: managingResa.id, status: modalStatus, motif }),
      });
      if (!res.ok) throw new Error();
      setManagingResa(null);
      await fetchReservations();
    } catch { alert('Erreur lors de la mise à jour du statut.'); }
    setSubmittingModal(false);
  };

  const totalRevenu     = Math.round(activeResas.reduce((s, r) => s + r.totalPrice, 0));
  const totalCommission = Math.round(activeResas.reduce((s, r) => s + r.commissionAmount, 0));

  const card: React.CSSProperties = {
    background: 'white', border: '1px solid #E8DFC8', borderRadius: 12,
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', fontFamily: 'var(--font-manrope, sans-serif)' }}>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
        {stats.map(s => (
          <div key={s.label} style={{ ...card, background: s.bg, padding: '1.25rem 1.5rem' }}>
            <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#7A6D5A', marginBottom: '0.4rem' }}>{s.label}</div>
            <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.8rem', fontWeight: 700, color: s.color }}>
              {loading ? '—' : s.value}
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1 1 220px', maxWidth: 320 }}>
          <svg style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
            width="15" height="15" fill="none" stroke="#7A6D5A" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Réf, pèlerin, guide…"
            style={{ width: '100%', padding: '0.55rem 1rem 0.55rem 2.2rem', boxSizing: 'border-box', background: 'white', border: '1px solid #E8DFC8', borderRadius: 8, fontSize: '0.83rem', color: '#1A1209', outline: 'none', fontFamily: 'inherit' }}
          />
        </div>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {FILTER_OPTIONS.map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)} style={{
              padding: '0.45rem 0.875rem', borderRadius: 20, cursor: 'pointer',
              fontSize: '0.72rem', fontWeight: 700, fontFamily: 'inherit',
              background: filter === f.key ? '#1A1209' : 'white',
              color: filter === f.key ? '#F0D897' : '#7A6D5A',
              border: `1px solid ${filter === f.key ? '#1A1209' : '#E8DFC8'}`,
            }}>{f.label}</button>
          ))}
        </div>
        <span style={{ marginLeft: 'auto', fontSize: '0.78rem', color: '#7A6D5A' }}>
          {loading ? '…' : `${visible.length} résultat${visible.length !== 1 ? 's' : ''}`}
        </span>
      </div>

      {/* Error */}
      {error && (
        <div style={{ background: '#FEE2E2', border: '1px solid #FCA5A5', borderRadius: 8, padding: '0.75rem 1rem', fontSize: '0.83rem', color: '#DC2626' }}>
          {error} — <button onClick={fetchReservations} style={{ color: '#DC2626', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', textDecoration: 'underline' }}>Réessayer</button>
        </div>
      )}

      {/* Table */}
      <div style={{ ...card, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
            <thead>
              <tr style={{ background: '#F5F2EC', borderBottom: '1px solid #E8DFC8' }}>
                {['Réf', 'Pèlerin', 'Guide', 'Package', 'Départ', 'Pers.', 'Prix total', 'Commission', 'Statut', 'Action'].map(h => (
                  <th key={h} style={{ padding: '0.75rem 0.875rem', textAlign: 'left', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#7A6D5A', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #F0EBE0' }}>
                    {Array.from({ length: 10 }).map((_, j) => (
                      <td key={j} style={{ padding: '0.875rem' }}>
                        <div style={{ height: 13, background: '#F0EDE8', borderRadius: 4, width: j === 0 ? 80 : j < 3 ? 100 : 55 }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : visible.length === 0 ? (
                <tr><td colSpan={10} style={{ padding: '3rem', textAlign: 'center', color: '#7A6D5A', fontSize: '0.85rem' }}>Aucune réservation trouvée</td></tr>
              ) : (
                visible.map((r, i) => {
                  const sc = STATUS_CONFIG[r.status] || { label: r.status, color: '#6B7280', bg: '#F3F4F6' };
                  return (
                    <tr key={r.id} style={{ background: i % 2 === 0 ? 'white' : '#FAFAF8', borderBottom: '1px solid #F0EBE0' }}>
                      <td style={{ padding: '0.75rem 0.875rem', fontSize: '0.75rem', fontWeight: 700, color: '#1A1209', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>{r.refNumber}</td>
                      <td style={{ padding: '0.75rem 0.875rem', fontSize: '0.82rem', color: '#1A1209', whiteSpace: 'nowrap' }}>{r.pelerin}</td>
                      <td style={{ padding: '0.75rem 0.875rem', fontSize: '0.82rem', color: '#4A3F30', whiteSpace: 'nowrap' }}>{r.guide}</td>
                      <td style={{ padding: '0.75rem 0.875rem', fontSize: '0.75rem', color: '#7A6D5A' }}>{r.packageName}<br /><span style={{ fontSize: '0.65rem' }}>{r.durationDays}j</span></td>
                      <td style={{ padding: '0.75rem 0.875rem', fontSize: '0.75rem', color: '#4A3F30', whiteSpace: 'nowrap' }}>{r.startDate}</td>
                      <td style={{ padding: '0.75rem 0.875rem', fontSize: '0.82rem', color: '#1A1209', textAlign: 'center' }}>{r.nbPeople}</td>
                      <td style={{ padding: '0.75rem 0.875rem', fontSize: '0.85rem', fontWeight: 700, color: '#1A1209', whiteSpace: 'nowrap' }}>{r.totalPrice} €</td>
                      <td style={{ padding: '0.75rem 0.875rem', fontSize: '0.82rem', color: '#1D5C3A', fontWeight: 600, whiteSpace: 'nowrap' }}>{r.commissionAmount} €</td>
                      <td style={{ padding: '0.75rem 0.875rem' }}>
                        <span style={{ display: 'inline-block', background: sc.bg, color: sc.color, fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.06em', padding: '0.25rem 0.6rem', borderRadius: 20, whiteSpace: 'nowrap' }}>{sc.label}</span>
                      </td>
                      <td style={{ padding: '0.75rem 0.875rem' }}>
                        <button
                          onClick={() => { setManagingResa(r); setModalStatus(r.status); setMotif(''); }}
                          style={{ padding: '0.35rem 0.75rem', background: '#1A1209', color: '#F0D897', border: 'none', borderRadius: 20, fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}
                        >
                          Gérer →
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            {/* Totaux */}
            {!loading && visible.length > 0 && (
              <tfoot>
                <tr style={{ background: '#F5F2EC', borderTop: '2px solid #E8DFC8' }}>
                  <td colSpan={6} style={{ padding: '0.75rem 0.875rem', fontSize: '0.72rem', fontWeight: 700, color: '#7A6D5A', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Total (hors annulées)
                  </td>
                  <td style={{ padding: '0.75rem 0.875rem', fontSize: '0.9rem', fontWeight: 700, color: '#1A1209', whiteSpace: 'nowrap' }}>{totalRevenu} €</td>
                  <td style={{ padding: '0.75rem 0.875rem', fontSize: '0.9rem', fontWeight: 700, color: '#1D5C3A', whiteSpace: 'nowrap' }}>{totalCommission} €</td>
                  <td colSpan={2} />
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Modal */}
      {managingResa && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9998, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'white', borderRadius: 16, padding: '2rem', maxWidth: 480, width: '90%', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Title */}
            <div>
              <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.4rem', fontWeight: 700, color: '#1A1209' }}>
                Modifier la réservation {managingResa.refNumber}
              </div>
            </div>
            {/* Info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <div style={{ fontSize: '0.78rem', color: '#7A6D5A' }}><span style={{ fontWeight: 700, color: '#4A3F30' }}>Pèlerin :</span> {managingResa.pelerin}</div>
              <div style={{ fontSize: '0.78rem', color: '#7A6D5A' }}><span style={{ fontWeight: 700, color: '#4A3F30' }}>Guide :</span> {managingResa.guide}</div>
              <div style={{ fontSize: '0.78rem', color: '#7A6D5A' }}><span style={{ fontWeight: 700, color: '#4A3F30' }}>Montant :</span> {managingResa.totalPrice} €</div>
            </div>
            {/* Select statut */}
            <div>
              <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#7A6D5A', marginBottom: 6 }}>Nouveau statut</label>
              <select
                value={modalStatus}
                onChange={e => setModalStatus(e.target.value)}
                style={{ width: '100%', padding: '0.6rem 0.875rem', border: '1.5px solid #E8DFC8', borderRadius: 8, fontSize: '0.85rem', fontFamily: 'inherit', color: '#1A1209', background: 'white', outline: 'none', boxSizing: 'border-box' }}
              >
                {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </div>
            {/* Motif */}
            <div>
              <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#7A6D5A', marginBottom: 6 }}>Motif (obligatoire)</label>
              <textarea
                value={motif}
                onChange={e => setMotif(e.target.value)}
                rows={3}
                placeholder="Ex: Pèlerin a contacté pour annulation…"
                style={{ width: '100%', padding: '0.6rem 0.875rem', border: '1.5px solid #E8DFC8', borderRadius: 8, fontSize: '0.85rem', fontFamily: 'inherit', color: '#1A1209', background: 'white', outline: 'none', boxSizing: 'border-box', resize: 'vertical', lineHeight: 1.6 }}
              />
              <div style={{ fontSize: '0.65rem', color: motif.trim().length < 10 ? '#DC2626' : '#1D5C3A', marginTop: 4 }}>
                {motif.trim().length} / 10 caractères minimum
              </div>
            </div>
            {/* Buttons */}
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setManagingResa(null)}
                disabled={submittingModal}
                style={{ padding: '0.65rem 1.25rem', background: 'white', color: '#7A6D5A', border: '1px solid #E8DFC8', borderRadius: 50, fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
              >
                Annuler
              </button>
              <button
                onClick={handleModal}
                disabled={submittingModal}
                style={{ padding: '0.65rem 1.5rem', background: submittingModal ? '#9CA3AF' : '#1A1209', color: '#F0D897', border: 'none', borderRadius: 50, fontSize: '0.82rem', fontWeight: 700, cursor: submittingModal ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}
              >
                {submittingModal ? 'Confirmation…' : 'Confirmer'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
