'use client';

import { useState } from 'react';
import Link from 'next/link';

type Status = 'EN ATTENTE' | 'CONFIRMÉE' | 'EN COURS' | 'TERMINÉE' | 'ANNULÉE';

const STATUS_STYLE: Record<Status, { bg: string; color: string }> = {
  'EN ATTENTE': { bg: '#FEF9EC', color: '#8B6914' },
  'CONFIRMÉE':  { bg: '#EDF7F0', color: '#1D5C3A' },
  'EN COURS':   { bg: '#EFF6FF', color: '#1D4ED8' },
  'TERMINÉE':   { bg: '#F5F2EC', color: '#7A6D5A' },
  'ANNULÉE':    { bg: '#FEF2F2', color: '#DC2626' },
};

const RESERVATIONS = [
  {
    id: '1',
    guide: 'Cheikh Rachid Al-Madani',
    initials: 'RA',
    gradient: 'linear-gradient(135deg, #C9A84C, #8B6914)',
    date: '15 – 18 mars 2026',
    forfait: 'Découverte Complète — 3 jours',
    montant: '840 €',
    status: 'CONFIRMÉE' as Status,
    location: 'Makkah · Madinah',
  },
  {
    id: '2',
    guide: 'Ustadha Fatima Al-Omari',
    initials: 'FA',
    gradient: 'linear-gradient(135deg, #9FE1CB, #1D9E75)',
    date: '22 mars 2026',
    forfait: 'Omra — 1 jour',
    montant: '320 €',
    status: 'EN ATTENTE' as Status,
    location: 'Makkah',
  },
];

const FILTERS = ['Toutes', 'En cours', 'Passées', 'Annulées'];

export default function ReservationsPage() {
  const [filter, setFilter] = useState('Toutes');
  const hasReservations = RESERVATIONS.length > 0;

  return (
    <>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: 700, color: '#1A1209', marginBottom: '0.35rem' }}>
          Mes Réservations
        </h1>
        <p style={{ fontSize: '0.875rem', color: '#7A6D5A' }}>
          {RESERVATIONS.length} réservation{RESERVATIONS.length > 1 ? 's' : ''} au total
        </p>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.75rem' }}>
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '0.45rem 1.1rem', borderRadius: 50, fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
              background: filter === f ? '#1A1209' : 'white',
              color: filter === f ? '#F0D897' : '#7A6D5A',
              border: `1px solid ${filter === f ? '#1A1209' : '#EDE8DC'}`,
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {hasReservations ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {RESERVATIONS.map(r => {
            const s = STATUS_STYLE[r.status];
            return (
              <div key={r.id} style={{ background: 'white', border: '1px solid #EDE8DC', borderRadius: 16, padding: '1.5rem', display: 'flex', gap: '1.25rem', alignItems: 'flex-start', flexWrap: 'wrap', boxShadow: '0 2px 8px rgba(26,18,9,0.04)' }}>
                <div style={{ width: 52, height: 52, borderRadius: '50%', background: r.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-cormorant, serif)', fontWeight: 700, color: '#1A1209', fontSize: '1rem', flexShrink: 0 }}>
                  {r.initials}
                </div>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.25rem' }}>
                    <span style={{ fontSize: '1rem', fontWeight: 700, color: '#1A1209' }}>{r.guide}</span>
                    <span style={{ background: s.bg, color: s.color, fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.06em', padding: '0.2rem 0.65rem', borderRadius: 50 }}>{r.status}</span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#7A6D5A', marginBottom: '0.25rem' }}>{r.location}</div>
                  <div style={{ fontSize: '0.82rem', color: '#5A4E3A', fontWeight: 600, marginBottom: '0.15rem' }}>{r.forfait}</div>
                  <div style={{ fontSize: '0.78rem', color: '#7A6D5A' }}>📅 {r.date}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.75rem', flexShrink: 0 }}>
                  <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.4rem', fontWeight: 700, color: '#1A1209' }}>{r.montant}</div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    <Link href={`/espace/reservations/${r.id}`} style={{ padding: '0.45rem 1rem', borderRadius: 8, fontSize: '0.75rem', fontWeight: 700, background: '#1A1209', color: '#F0D897', textDecoration: 'none' }}>
                      Voir détails
                    </Link>
                    <Link href="/espace/messages/1" style={{ padding: '0.45rem 1rem', borderRadius: 8, fontSize: '0.75rem', fontWeight: 600, background: 'white', color: '#5A4E3A', textDecoration: 'none', border: '1px solid #EDE8DC' }}>
                      Contacter le guide
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '5rem 2rem', background: 'white', borderRadius: 20, border: '1px solid #EDE8DC' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#FAF7F0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', fontSize: '2rem' }}>📅</div>
          <h2 style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.6rem', fontWeight: 700, color: '#1A1209', marginBottom: '0.5rem' }}>Aucune réservation</h2>
          <p style={{ fontSize: '0.875rem', color: '#7A6D5A', marginBottom: '1.75rem', maxWidth: 360, margin: '0 auto 1.75rem' }}>
            Vous n&apos;avez pas encore de réservation. Trouvez un guide certifié et réservez votre accompagnement.
          </p>
          <Link href="/guides" style={{ padding: '0.75rem 2rem', borderRadius: 50, fontSize: '0.875rem', fontWeight: 700, background: '#1A1209', color: '#F0D897', textDecoration: 'none' }}>
            Trouver un guide →
          </Link>
        </div>
      )}
    </>
  );
}
