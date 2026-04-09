'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

type GuideData = {
  guide: {
    id: string;
    name: string;
    firstName: string | null;
    email: string;
    status: 'DRAFT' | 'REVIEW' | 'ACTIVE' | 'SUSPENDED';
    slug: string | null;
    city: string | null;
    bio: string | null;
    languages: { languageCode: string; level: string }[];
  };
  stats: {
    totalReservations: number;
    reservationsMois: number;
    totalCompleted: number;
    revenuesMois: number;
    avgRating: number | null;
    totalReviews: number;
  };
  recentReservations: {
    id: string;
    refNumber: string;
    pelerinName: string;
    pelerinCountry: string | null;
    packageName: string;
    durationDays: number;
    startDate: string;
    nbPeople: number;
    totalPrice: number;
    status: string;
  }[];
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  DRAFT:     { label: 'Brouillon',        color: '#7A6D5A', bg: '#F5F2EC', border: '#E8DFC8' },
  REVIEW:    { label: 'En cours d\'examen', color: '#D97706', bg: '#FEF3C7', border: '#FDE68A' },
  ACTIVE:    { label: 'Profil actif',     color: '#1D5C3A', bg: '#D1FAE5', border: '#6EE7B7' },
  SUSPENDED: { label: 'Suspendu',         color: '#DC2626', bg: '#FEE2E2', border: '#FCA5A5' },
};

const RESERVATION_STATUS: Record<string, { label: string; color: string; bg: string }> = {
  PENDING:   { label: 'En attente', color: '#D97706', bg: '#FEF3C7' },
  CONFIRMED: { label: 'Confirmée',  color: '#1D4ED8', bg: '#DBEAFE' },
  COMPLETED: { label: 'Terminée',   color: '#1D5C3A', bg: '#D1FAE5' },
  CANCELLED: { label: 'Annulée',    color: '#DC2626', bg: '#FEE2E2' },
};

const card: React.CSSProperties = {
  background: 'white',
  border: '1px solid #E8DFC8',
  borderRadius: 12,
  boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
};

export default function GuideDashboard() {
  const [data, setData]     = useState<GuideData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');

  useEffect(() => {
    fetch('/api/guide/dashboard')
      .then(r => { if (!r.ok) throw new Error('Erreur ' + r.status); return r.json(); })
      .then(d => { setData(d); setLoading(false); })
      .catch((e: Error) => { setError(e.message); setLoading(false); });
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', fontFamily: 'var(--font-manrope, sans-serif)' }}>
        <div style={{ ...card, height: 80, background: '#F0EDE8' }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
          {Array.from({ length: 4 }).map((_, i) => <div key={i} style={{ ...card, height: 90, background: '#F0EDE8' }} />)}
        </div>
        <div style={{ ...card, height: 200, background: '#F0EDE8' }} />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ background: '#FEE2E2', border: '1px solid #FCA5A5', borderRadius: 8, padding: '0.75rem 1rem', fontSize: '0.83rem', color: '#DC2626', fontFamily: 'var(--font-manrope, sans-serif)' }}>
        {error || 'Impossible de charger les données.'}{' '}
        <button onClick={() => window.location.reload()} style={{ color: '#DC2626', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Réessayer</button>
      </div>
    );
  }

  const { guide, stats, recentReservations } = data;
  const sc = STATUS_CONFIG[guide.status] || STATUS_CONFIG.DRAFT;
  const firstName = guide.firstName || guide.name.split(' ')[0] || 'Guide';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', fontFamily: 'var(--font-manrope, sans-serif)' }}>

      {/* Status banner */}
      <div style={{ ...card, padding: '1rem 1.5rem', border: `1px solid ${sc.border}`, background: sc.bg, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: sc.color, flexShrink: 0, boxShadow: guide.status === 'ACTIVE' ? '0 0 0 4px rgba(29,92,58,0.15)' : 'none' }} />
          <div>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: sc.color }}>{sc.label}</div>
            <div style={{ fontSize: '0.72rem', color: '#7A6D5A', marginTop: 1 }}>
              {guide.status === 'DRAFT'     && 'Complétez votre profil pour soumettre votre candidature.'}
              {guide.status === 'REVIEW'    && 'Votre dossier est en cours d\'examen. Vous serez contacté sous 48h insha\'Allah.'}
              {guide.status === 'ACTIVE'    && `Bonjour ${firstName} ! Votre profil est visible par les pèlerins.`}
              {guide.status === 'SUSPENDED' && 'Votre profil a été suspendu. Contactez le support pour plus d\'informations.'}
            </div>
          </div>
        </div>
        {guide.status === 'ACTIVE' && guide.slug && (
          <Link href={`/guides/${guide.slug}`} target="_blank" style={{ fontSize: '0.72rem', fontWeight: 700, color: sc.color, border: `1px solid ${sc.border}`, padding: '0.35rem 0.875rem', borderRadius: 20, textDecoration: 'none', whiteSpace: 'nowrap' }}>
            Voir mon profil public ↗
          </Link>
        )}
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
        <div style={{ ...card, padding: '1rem 1.25rem' }}>
          <div style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#7A6D5A', marginBottom: '0.4rem' }}>Réservations</div>
          <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '2rem', fontWeight: 700, color: '#1A1209', lineHeight: 1 }}>{stats.totalReservations}</div>
          <div style={{ fontSize: '0.68rem', color: '#7A6D5A', marginTop: '0.3rem' }}>{stats.reservationsMois} ce mois</div>
        </div>
        <div style={{ ...card, background: '#D1FAE5', padding: '1rem 1.25rem' }}>
          <div style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#7A6D5A', marginBottom: '0.4rem' }}>Terminées</div>
          <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '2rem', fontWeight: 700, color: '#1D5C3A', lineHeight: 1 }}>{stats.totalCompleted}</div>
        </div>
        <div style={{ ...card, background: '#FEF9E7', padding: '1rem 1.25rem' }}>
          <div style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#7A6D5A', marginBottom: '0.4rem' }}>Revenus ce mois</div>
          <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '2rem', fontWeight: 700, color: '#C9A84C', lineHeight: 1 }}>{stats.revenuesMois} €</div>
        </div>
        <div style={{ ...card, background: '#FEF3C7', padding: '1rem 1.25rem' }}>
          <div style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#7A6D5A', marginBottom: '0.4rem' }}>Note moyenne</div>
          <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '2rem', fontWeight: 700, color: '#D97706', lineHeight: 1 }}>
            {stats.avgRating !== null ? `★ ${stats.avgRating}` : '—'}
          </div>
          <div style={{ fontSize: '0.68rem', color: '#7A6D5A', marginTop: '0.3rem' }}>{stats.totalReviews} avis</div>
        </div>
      </div>

      {/* Recent reservations */}
      <div style={{ ...card, overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #F0EBE0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.2rem', fontWeight: 700, color: '#1A1209' }}>Dernières réservations</div>
          <Link href="/guide/missions" style={{ fontSize: '0.72rem', fontWeight: 700, color: '#C9A84C', textDecoration: 'none' }}>Voir toutes →</Link>
        </div>

        {recentReservations.length === 0 ? (
          <div style={{ padding: '3rem 2rem', textAlign: 'center' }}>
            {guide.status === 'ACTIVE' ? (
              <>
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🕌</div>
                <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.4rem', color: '#1A1209', marginBottom: '0.5rem' }}>Aucune réservation pour l&apos;instant</div>
                <div style={{ fontSize: '0.82rem', color: '#7A6D5A', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                  Insha&apos;Allah, les pèlerins découvriront bientôt votre profil.
                </div>
                {guide.slug && (
                  <Link href={`/guides/${guide.slug}`} target="_blank" style={{ display: 'inline-block', background: '#1A1209', color: '#F0D897', padding: '0.65rem 1.5rem', borderRadius: 50, fontWeight: 700, fontSize: '0.82rem', textDecoration: 'none' }}>
                    Voir mon profil public ↗
                  </Link>
                )}
              </>
            ) : (
              <div style={{ fontSize: '0.85rem', color: '#7A6D5A' }}>Les réservations apparaîtront ici une fois votre profil actif.</div>
            )}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 680 }}>
              <thead>
                <tr style={{ background: '#F5F2EC', borderBottom: '1px solid #E8DFC8' }}>
                  {['Réf', 'Pèlerin', 'Package', 'Départ', 'Pers.', 'Montant', 'Statut'].map(h => (
                    <th key={h} style={{ padding: '0.75rem 0.875rem', textAlign: 'left', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#7A6D5A', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentReservations.map((r, i) => {
                  const rs = RESERVATION_STATUS[r.status] || { label: r.status, color: '#6B7280', bg: '#F3F4F6' };
                  return (
                    <tr key={r.id} style={{ background: i % 2 === 0 ? 'white' : '#FAFAF8', borderBottom: '1px solid #F0EBE0' }}>
                      <td style={{ padding: '0.75rem 0.875rem', fontSize: '0.75rem', fontWeight: 700, color: '#1A1209', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>{r.refNumber}</td>
                      <td style={{ padding: '0.75rem 0.875rem', fontSize: '0.82rem', fontWeight: 600, color: '#1A1209', whiteSpace: 'nowrap' }}>
                        {r.pelerinName}
                        {r.pelerinCountry && <span style={{ fontSize: '0.68rem', color: '#7A6D5A', display: 'block' }}>{r.pelerinCountry}</span>}
                      </td>
                      <td style={{ padding: '0.75rem 0.875rem', fontSize: '0.75rem', color: '#7A6D5A' }}>
                        {r.packageName}<br />
                        <span style={{ fontSize: '0.65rem' }}>{r.durationDays}j</span>
                      </td>
                      <td style={{ padding: '0.75rem 0.875rem', fontSize: '0.75rem', color: '#4A3F30', whiteSpace: 'nowrap' }}>{r.startDate}</td>
                      <td style={{ padding: '0.75rem 0.875rem', fontSize: '0.82rem', color: '#1A1209', textAlign: 'center' }}>{r.nbPeople}</td>
                      <td style={{ padding: '0.75rem 0.875rem', fontSize: '0.85rem', fontWeight: 700, color: '#1A1209', whiteSpace: 'nowrap' }}>{r.totalPrice} €</td>
                      <td style={{ padding: '0.75rem 0.875rem' }}>
                        <span style={{ display: 'inline-block', background: rs.bg, color: rs.color, fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.06em', padding: '0.25rem 0.6rem', borderRadius: 20, whiteSpace: 'nowrap' }}>{rs.label}</span>
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
