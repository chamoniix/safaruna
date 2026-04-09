'use client';

import { useState, useEffect } from 'react';

type HistoryRow = {
  id: string;
  refNumber: string;
  pelerinName: string;
  packageName: string;
  nbPeople: number;
  startDate: string;
  totalBrut: number;
  commission: number;
  net: number;
};

type Data = {
  stats: {
    totalBrut: number;
    totalCommissions: number;
    totalNet: number;
    revenuesMois: number;
    commissionsMois: number;
    netMois: number;
    nbMissions: number;
  };
  prochainVirement: { amount: number; period: string; status: string } | null;
  history: HistoryRow[];
};

const card: React.CSSProperties = {
  background: 'white',
  border: '1px solid #E8DFC8',
  borderRadius: 12,
  boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
};

export default function GuideRevenus() {
  const [data, setData] = useState<Data | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/guide/revenus')
      .then(r => { if (!r.ok) throw new Error('Erreur ' + r.status); return r.json(); })
      .then(d => { setData(d); setLoading(false); })
      .catch((e: Error) => { setError(e.message); setLoading(false); });
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ ...card, height: 80, background: '#F0EDE8' }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
          {Array.from({ length: 4 }).map((_, i) => <div key={i} style={{ ...card, height: 90, background: '#F0EDE8' }} />)}
        </div>
        <div style={{ ...card, height: 300, background: '#F0EDE8' }} />
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

  const { stats, prochainVirement, history } = data;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', fontFamily: 'var(--font-manrope, sans-serif)' }}>

      {/* Header */}
      <div>
        <h1 style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.75rem', fontWeight: 700, color: '#1A1209', margin: 0 }}>Mes revenus</h1>
        <p style={{ fontSize: '0.82rem', color: '#7A6D5A', marginTop: 4 }}>{stats.nbMissions} mission{stats.nbMissions > 1 ? 's' : ''} terminée{stats.nbMissions > 1 ? 's' : ''} · Commission SAFARUMA : 15%</p>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
        <div style={{ ...card, padding: '1rem 1.25rem' }}>
          <div style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#7A6D5A', marginBottom: '0.4rem' }}>Brut total</div>
          <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.8rem', fontWeight: 700, color: '#1A1209', lineHeight: 1 }}>{stats.totalBrut} €</div>
          <div style={{ fontSize: '0.65rem', color: '#7A6D5A', marginTop: 4 }}>Toutes missions</div>
        </div>
        <div style={{ ...card, background: '#FEE2E2', padding: '1rem 1.25rem' }}>
          <div style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#7A6D5A', marginBottom: '0.4rem' }}>Commissions</div>
          <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.8rem', fontWeight: 700, color: '#DC2626', lineHeight: 1 }}>{stats.totalCommissions} €</div>
          <div style={{ fontSize: '0.65rem', color: '#7A6D5A', marginTop: 4 }}>15% SAFARUMA</div>
        </div>
        <div style={{ ...card, background: '#D1FAE5', padding: '1rem 1.25rem' }}>
          <div style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#7A6D5A', marginBottom: '0.4rem' }}>Net perçu</div>
          <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.8rem', fontWeight: 700, color: '#1D5C3A', lineHeight: 1 }}>{stats.totalNet} €</div>
          <div style={{ fontSize: '0.65rem', color: '#7A6D5A', marginTop: 4 }}>Après commission</div>
        </div>
        <div style={{ ...card, background: '#FEF9E7', padding: '1rem 1.25rem' }}>
          <div style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#7A6D5A', marginBottom: '0.4rem' }}>Net ce mois</div>
          <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.8rem', fontWeight: 700, color: '#C9A84C', lineHeight: 1 }}>{stats.netMois} €</div>
          <div style={{ fontSize: '0.65rem', color: '#7A6D5A', marginTop: 4 }}>Brut : {stats.revenuesMois} €</div>
        </div>
      </div>

      {/* Prochain virement */}
      {prochainVirement && (
        <div style={{ ...card, padding: '1rem 1.5rem', background: '#FEF9E7', border: '1px solid #FDE68A', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#D97706', marginBottom: 4 }}>Prochain virement</div>
            <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.4rem', fontWeight: 700, color: '#1A1209' }}>{prochainVirement.amount} €</div>
            <div style={{ fontSize: '0.7rem', color: '#7A6D5A', marginTop: 2 }}>Période : {prochainVirement.period}</div>
          </div>
          <span style={{ background: '#FDE68A', color: '#92400E', fontSize: '0.65rem', fontWeight: 700, padding: '0.3rem 0.75rem', borderRadius: 20, textTransform: 'uppercase', letterSpacing: '0.06em' }}>En cours</span>
        </div>
      )}

      {/* Commission info */}
      <div style={{ ...card, padding: '1rem 1.5rem', background: '#F5F2EC', border: '1px solid #E8DFC8' }}>
        <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#7A6D5A', marginBottom: '0.5rem' }}>Comment fonctionne la commission ?</div>
        <div style={{ fontSize: '0.78rem', color: '#4A3F30', lineHeight: 1.7 }}>
          SAFARUMA retient <strong>15%</strong> sur chaque réservation confirmée et complétée. Le reste (85%) vous est versé par virement bancaire dans les <strong>7 jours</strong> suivant la fin de la mission. Les virements sont regroupés par période mensuelle.
        </div>
      </div>

      {/* History table */}
      <div style={{ ...card, overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #F0EBE0' }}>
          <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.2rem', fontWeight: 700, color: '#1A1209' }}>Historique des paiements</div>
          <div style={{ fontSize: '0.72rem', color: '#7A6D5A', marginTop: 2 }}>10 dernières missions terminées</div>
        </div>
        {history.length === 0 ? (
          <div style={{ padding: '3rem 2rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>💰</div>
            <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.3rem', color: '#1A1209' }}>Aucun revenu pour l&apos;instant</div>
            <div style={{ fontSize: '0.8rem', color: '#7A6D5A', marginTop: '0.5rem' }}>Vos revenus apparaîtront ici une fois vos premières missions terminées.</div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
              <thead>
                <tr style={{ background: '#F5F2EC', borderBottom: '1px solid #E8DFC8' }}>
                  {['Réf', 'Pèlerin', 'Package', 'Date', 'Pers.', 'Brut', 'Commission', 'Net reçu'].map(h => (
                    <th key={h} style={{ padding: '0.75rem 0.875rem', textAlign: 'left', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#7A6D5A', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {history.map((r, i) => (
                  <tr key={r.id} style={{ background: i % 2 === 0 ? 'white' : '#FAFAF8', borderBottom: '1px solid #F0EBE0' }}>
                    <td style={{ padding: '0.75rem 0.875rem', fontSize: '0.72rem', fontWeight: 700, color: '#1A1209', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>{r.refNumber}</td>
                    <td style={{ padding: '0.75rem 0.875rem', fontSize: '0.82rem', color: '#1A1209' }}>{r.pelerinName}</td>
                    <td style={{ padding: '0.75rem 0.875rem', fontSize: '0.75rem', color: '#7A6D5A' }}>{r.packageName}</td>
                    <td style={{ padding: '0.75rem 0.875rem', fontSize: '0.75rem', color: '#4A3F30', whiteSpace: 'nowrap' }}>{r.startDate}</td>
                    <td style={{ padding: '0.75rem 0.875rem', fontSize: '0.82rem', color: '#1A1209', textAlign: 'center' }}>{r.nbPeople}</td>
                    <td style={{ padding: '0.75rem 0.875rem', fontSize: '0.82rem', color: '#1A1209', whiteSpace: 'nowrap' }}>{r.totalBrut} €</td>
                    <td style={{ padding: '0.75rem 0.875rem', fontSize: '0.82rem', color: '#DC2626', whiteSpace: 'nowrap' }}>−{r.commission} €</td>
                    <td style={{ padding: '0.75rem 0.875rem', fontSize: '0.85rem', fontWeight: 700, color: '#1D5C3A', whiteSpace: 'nowrap' }}>{r.net} €</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
