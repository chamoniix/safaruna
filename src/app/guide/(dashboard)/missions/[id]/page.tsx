'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { PLACES } from '@/lib/places';

type Mission = {
  id: string;
  city: string;
  startDate: string;
  endDate: string;
  selectedPlaces: string[];
  localTransport: string | null;
  localTransportDays: number;
  guideConfirmationStatus: string;
  guideConfirmedAt: string | null;
};

type MissionDetail = {
  id: string;
  refNumber: string;
  status: string;
  createdAt: string;
  pelerinName: string;
  pelerinCountry: string | null;
  pelerinEmail: string | null;
  packageName: string;
  nbPeople: number;
  notes: string | null;
  guideRevenue: number | null;
  guideRevenueStatus: string | null;
  review: { rating: number; comment: string } | null;
  missions: Mission[];
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  PENDING:   { label: 'En attente', color: '#D97706', bg: '#FEF3C7' },
  CONFIRMED: { label: 'Confirmée',  color: '#1D4ED8', bg: '#DBEAFE' },
  COMPLETED: { label: 'Terminée',   color: '#1D5C3A', bg: '#D1FAE5' },
  CANCELLED: { label: 'Annulée',    color: '#DC2626', bg: '#FEE2E2' },
};

const GUIDE_CONFIRMATION_CONFIG: Record<string, { label: string; color: string }> = {
  PENDING:      { label: 'En attente de confirmation', color: '#D97706' },
  CONFIRMED:    { label: 'Confirmée',                  color: '#1D5C3A' },
  DECLINED:     { label: 'Refusée',                     color: '#DC2626' },
  NO_RESPONSE:  { label: 'Sans réponse',                color: '#DC2626' },
};

const REVENUE_STATUS_LABEL: Record<string, string> = {
  UPCOMING: 'À venir',
  PENDING: 'En cours de traitement',
  PAID: 'Versé',
};

const card: React.CSSProperties = {
  background: 'white',
  border: '1px solid #E8DFC8',
  borderRadius: 12,
  boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
  padding: '1.5rem 1.75rem',
};

const sectionTitle: React.CSSProperties = {
  fontFamily: 'var(--font-cormorant, serif)',
  fontSize: '1.2rem',
  fontWeight: 700,
  color: '#1A1209',
  marginBottom: '1rem',
};

function placeNames(keys: string[]) {
  if (keys.length === 0) return 'Aucun lieu renseigné';
  return keys.map(key => PLACES.find(place => place.key === key)?.nameFr ?? key).join(', ');
}

function localTransportLabel(localTransport: string | null, days: number) {
  if (localTransport === 'TAXI') return 'Taxi public — courses du guide à régler sur place';
  if (localTransport === 'CAR') return `Voiture privée — ${days} jour${days > 1 ? 's' : ''}`;
  return 'Sans transport local réservé';
}

function cityLabel(value: string) {
  if (value === 'MAKKAH') return 'Makkah';
  if (value === 'MADINAH') return 'Médine';
  return value;
}

export default function MissionDetailPage() {
  const params = useParams<{ id: string }>();
  const [data, setData] = useState<MissionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    fetch(`/api/guide/missions/${params.id}`)
      .then(r => {
        if (!r.ok) throw new Error(r.status === 404 ? 'Mission introuvable.' : 'Erreur ' + r.status);
        return r.json();
      })
      .then((d: MissionDetail) => { setData(d); setLoading(false); })
      .catch((e: Error) => { setError(e.message); setLoading(false); });
  }, [params.id]);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ ...card, height: 80, background: '#F0EDE8' }} />
        <div style={{ ...card, height: 200, background: '#F0EDE8' }} />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontFamily: 'var(--font-manrope, sans-serif)' }}>
        <Link href="/guide/missions" style={{ color: '#7A6D5A', fontSize: '0.82rem', fontWeight: 700, textDecoration: 'none' }}>← Mes missions</Link>
        <div style={{ background: '#FEE2E2', border: '1px solid #FCA5A5', borderRadius: 8, padding: '0.75rem 1rem', fontSize: '0.83rem', color: '#DC2626' }}>
          {error || 'Impossible de charger cette mission.'}
        </div>
      </div>
    );
  }

  const sc = STATUS_CONFIG[data.status] || { label: data.status, color: '#6B7280', bg: '#F3F4F6' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', fontFamily: 'var(--font-manrope, sans-serif)' }}>

      <Link href="/guide/missions" style={{ color: '#7A6D5A', fontSize: '0.82rem', fontWeight: 700, textDecoration: 'none', width: 'fit-content' }}>← Mes missions</Link>

      {/* Header */}
      <div style={card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#7A6D5A' }}>Réf {data.refNumber}</div>
            <h1 style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.75rem', fontWeight: 700, color: '#1A1209', margin: '0.25rem 0' }}>{data.pelerinName}</h1>
            <div style={{ fontSize: '0.78rem', color: '#7A6D5A' }}>
              {data.pelerinCountry && <>{data.pelerinCountry} · </>}
              {data.packageName} · {data.nbPeople} personne{data.nbPeople > 1 ? 's' : ''} · Créée le {data.createdAt}
            </div>
          </div>
          <span style={{ display: 'inline-block', background: sc.bg, color: sc.color, fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.06em', padding: '0.35rem 0.85rem', borderRadius: 20, whiteSpace: 'nowrap' }}>{sc.label}</span>
        </div>
      </div>

      {/* Missions par ville */}
      <div style={card}>
        <div style={sectionTitle}>Villes et dates</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {data.missions.map(mission => {
            const gc = GUIDE_CONFIRMATION_CONFIG[mission.guideConfirmationStatus] || { label: mission.guideConfirmationStatus, color: '#6B7280' };
            return (
              <div key={mission.id} style={{ padding: '1rem', borderRadius: 10, border: '1px solid #F0EBE0', background: '#FDFBF7' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1A1209' }}>{cityLabel(mission.city)}</div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: gc.color }}>{gc.label}{mission.guideConfirmedAt ? ` · ${mission.guideConfirmedAt}` : ''}</div>
                </div>
                <div style={{ fontSize: '0.78rem', color: '#4A3F30', marginTop: '0.35rem' }}>{mission.startDate} → {mission.endDate}</div>
                <dl style={{ display: 'grid', gap: '0.4rem', margin: '0.75rem 0 0', fontSize: '0.78rem', color: '#4A3F30' }}>
                  <div><dt style={{ display: 'inline', color: '#7A6D5A', fontWeight: 700 }}>Lieux : </dt><dd style={{ display: 'inline', margin: 0 }}>{placeNames(mission.selectedPlaces)}</dd></div>
                  <div><dt style={{ display: 'inline', color: '#7A6D5A', fontWeight: 700 }}>Transport local : </dt><dd style={{ display: 'inline', margin: 0 }}>{localTransportLabel(mission.localTransport, mission.localTransportDays)}</dd></div>
                </dl>
              </div>
            );
          })}
        </div>
      </div>

      {/* Revenu */}
      <div style={card}>
        <div style={sectionTitle}>Votre revenu</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.6rem', fontWeight: 700, color: '#1A1209' }}>
            {data.guideRevenue === null ? '—' : `${data.guideRevenue} €`}
          </div>
          {data.guideRevenueStatus && (
            <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#7A6D5A' }}>{REVENUE_STATUS_LABEL[data.guideRevenueStatus] ?? data.guideRevenueStatus}</span>
          )}
        </div>
      </div>

      {/* Notes */}
      {data.notes && (
        <div style={card}>
          <div style={sectionTitle}>Notes</div>
          <p style={{ fontSize: '0.82rem', color: '#4A3F30', margin: 0, whiteSpace: 'pre-wrap' }}>{data.notes}</p>
        </div>
      )}

      {/* Avis */}
      {data.review && (
        <div style={card}>
          <div style={sectionTitle}>Avis du pèlerin</div>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1D5C3A' }}>★ {data.review.rating}/5</div>
          {data.review.comment && <p style={{ fontSize: '0.82rem', color: '#4A3F30', marginTop: '0.5rem' }}>{data.review.comment}</p>}
        </div>
      )}

    </div>
  );
}