'use client';

import { useState, useEffect } from 'react';

type StatsData = {
  guides: { total: number; active: number; pending: number };
  pelerins: { total: number };
  reservations: { total: number; thisMonth: number; pending: number; confirmed: number; completed: number; cancelled: number };
  revenue: { total: number; thisMonth: number; thisYear: number; commission: number; byMonth: number[] };
};

const MONTHS_FR = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

const card: React.CSSProperties = {
  background: 'white', border: '1px solid #E8DFC8', borderRadius: 12,
  boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
};

function Skeleton({ h = 110 }: { h?: number }) {
  return <div style={{ ...card, height: h, background: '#F0EDE8' }} />;
}

function KpiCard({ label, value, sub, color = '#1A1209', bg = 'white' }: { label: string; value: string | number; sub?: string; color?: string; bg?: string }) {
  return (
    <div style={{ ...card, background: bg, padding: '1.4rem 1.5rem' }}>
      <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#7A6D5A', marginBottom: '0.75rem' }}>{label}</div>
      <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '2.2rem', fontWeight: 700, color, lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: '0.65rem', color: '#9A8A7A', marginTop: '0.4rem', fontWeight: 600 }}>{sub}</div>}
    </div>
  );
}

function PipelineCard({ label, value, total, color, bg }: { label: string; value: number; total: number; color: string; bg: string }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div style={{ ...card, padding: '1rem 1.25rem' }}>
      <div style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#7A6D5A', marginBottom: '0.6rem' }}>{label}</div>
      <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.8rem', fontWeight: 700, color, lineHeight: 1, marginBottom: '0.5rem' }}>{value}</div>
      <div style={{ fontSize: '0.65rem', color: '#9A8A7A', marginBottom: '0.5rem' }}>{pct}% du total</div>
      <div style={{ height: 4, background: '#F0EBE0', borderRadius: 50, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 50, transition: 'width 0.6s ease' }} />
      </div>
    </div>
  );
}

export default function AdminStatsPage() {
  const [data, setData]     = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');

  const fetchStats = async () => {
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/admin/stats');
      if (!res.ok) throw new Error('Erreur ' + res.status);
      setData(await res.json());
    } catch (e: any) { setError(e.message || 'Erreur réseau'); }
    setLoading(false);
  };

  useEffect(() => { fetchStats(); }, []);

  const year = new Date().getFullYear();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', fontFamily: 'var(--font-manrope, sans-serif)' }}>

      {/* Error */}
      {error && (
        <div style={{ background: '#FEE2E2', border: '1px solid #FCA5A5', borderRadius: 8, padding: '0.75rem 1rem', fontSize: '0.83rem', color: '#DC2626' }}>
          {error} — <button onClick={fetchStats} style={{ color: '#DC2626', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', textDecoration: 'underline' }}>Réessayer</button>
        </div>
      )}

      {/* Bloc 1 — KPIs principaux */}
      <section>
        <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#7A6D5A', marginBottom: '0.875rem' }}>Revenus & activité</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} />)
          ) : data ? (
            <>
              <KpiCard label="Revenus totaux" value={`${data.revenue.total.toLocaleString('fr-FR')} €`} sub="Hors annulations" color="#1D5C3A" bg="#D1FAE5" />
              <KpiCard label="Revenus ce mois" value={`${data.revenue.thisMonth.toLocaleString('fr-FR')} €`} sub={`Année : ${data.revenue.thisYear.toLocaleString('fr-FR')} €`} color="#1D4ED8" bg="#DBEAFE" />
              <KpiCard label="Commissions" value={`${data.revenue.commission.toLocaleString('fr-FR')} €`} sub="Part SAFARUMA" color="#92400E" bg="#FEF3C7" />
              <KpiCard label="Réservations" value={data.reservations.total} sub={`${data.reservations.thisMonth} ce mois`} color="#1A1209" />
            </>
          ) : null}
        </div>
      </section>

      {/* Bloc 2 — Guides & Pèlerins */}
      <section>
        <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#7A6D5A', marginBottom: '0.875rem' }}>Communauté</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} h={100} />)
          ) : data ? (
            <>
              <KpiCard label="Guides total" value={data.guides.total} sub={`${data.guides.pending} en attente de validation`} />
              <KpiCard label="Guides actifs" value={data.guides.active} sub={`${data.guides.total > 0 ? Math.round((data.guides.active / data.guides.total) * 100) : 0}% du total`} color="#1D5C3A" bg="#D1FAE5" />
              <KpiCard label="Pèlerins inscrits" value={data.pelerins.total} sub="Comptes créés" color="#1D4ED8" bg="#DBEAFE" />
            </>
          ) : null}
        </div>
      </section>

      {/* Bloc 3 — Pipeline réservations */}
      <section>
        <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#7A6D5A', marginBottom: '0.875rem' }}>Pipeline réservations</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem' }}>
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} h={100} />)
          ) : data ? (
            <>
              <PipelineCard label="En attente"  value={data.reservations.pending}   total={data.reservations.total} color="#D97706" bg="#FEF3C7" />
              <PipelineCard label="Confirmées"  value={data.reservations.confirmed} total={data.reservations.total} color="#1D4ED8" bg="#DBEAFE" />
              <PipelineCard label="Terminées"   value={data.reservations.completed} total={data.reservations.total} color="#1D5C3A" bg="#D1FAE5" />
              <PipelineCard label="Annulées"    value={data.reservations.cancelled} total={data.reservations.total} color="#DC2626" bg="#FEE2E2" />
              <PipelineCard label="Ce mois"     value={data.reservations.thisMonth} total={data.reservations.total} color="#7C3AED" bg="#EDE9FE" />
            </>
          ) : null}
        </div>
      </section>

      {/* Bloc 4 — Revenus annuels SVG */}
      <section>
        <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#7A6D5A', marginBottom: '0.875rem' }}>
          Revenus {year} — par mois
        </div>
        <div style={{ ...card, padding: '1.5rem' }}>
          {loading ? (
            <div style={{ height: 160, background: '#F0EDE8', borderRadius: 8 }} />
          ) : data ? (() => {
            const byMonth = data.revenue.byMonth;
            const maxVal  = Math.max(...byMonth, 1);
            const barH    = 120;
            const barW    = 28;
            const gap     = 14;
            const svgW    = 12 * (barW + gap) - gap;
            const currentMonth = new Date().getMonth();

            return (
              <div style={{ overflowX: 'auto' }}>
                <svg width={svgW} height={barH + 32} viewBox={`0 0 ${svgW} ${barH + 32}`} style={{ display: 'block', minWidth: svgW }}>
                  {byMonth.map((v, m) => {
                    const h   = Math.max(Math.round((v / maxVal) * barH), v > 0 ? 4 : 0);
                    const x   = m * (barW + gap);
                    const y   = barH - h;
                    const isCurrentMonth = m === currentMonth;
                    const fill = v === 0 ? '#EDE8DC' : isCurrentMonth ? '#C9A84C' : '#1D5C3A';
                    return (
                      <g key={m}>
                        {/* Bar */}
                        <rect x={x} y={y} width={barW} height={Math.max(h, 2)} rx={4} fill={fill} />
                        {/* Value label above bar */}
                        {v > 0 && (
                          <text x={x + barW / 2} y={y - 4} textAnchor="middle" fontSize="8" fill="#7A6D5A" fontFamily="var(--font-manrope, sans-serif)">
                            {v >= 1000 ? `${Math.round(v / 1000)}k` : v}
                          </text>
                        )}
                        {/* Month label */}
                        <text x={x + barW / 2} y={barH + 18} textAnchor="middle" fontSize="9" fill={isCurrentMonth ? '#C9A84C' : '#9A8A7A'} fontWeight={isCurrentMonth ? '700' : '400'} fontFamily="var(--font-manrope, sans-serif)">
                          {MONTHS_FR[m]}
                        </text>
                      </g>
                    );
                  })}
                </svg>
                <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.875rem', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.7rem', color: '#7A6D5A' }}>
                    <div style={{ width: 10, height: 10, borderRadius: 2, background: '#C9A84C' }} /> Mois en cours
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.7rem', color: '#7A6D5A' }}>
                    <div style={{ width: 10, height: 10, borderRadius: 2, background: '#1D5C3A' }} /> Mois passés
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.7rem', color: '#7A6D5A' }}>
                    <div style={{ width: 10, height: 10, borderRadius: 2, background: '#EDE8DC' }} /> Aucune donnée
                  </div>
                </div>
              </div>
            );
          })() : null}
        </div>
      </section>

    </div>
  );
}
