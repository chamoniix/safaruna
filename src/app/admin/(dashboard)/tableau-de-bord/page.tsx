// Mock data — à remplacer par vraies requêtes DB
const PENDING_GUIDES = 2;
const OPEN_LITIGES   = 2;

const KPIS = [
  { label: 'Guides actifs',          value: '47',      delta: '+3 ce mois',    color: '#16A34A', bg: '#DCFCE7', icon: <svg width="20" height="20" fill="none" stroke="#16A34A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg> },
  { label: 'Pèlerins inscrits',       value: '1 284',   delta: '+128 ce mois',  color: '#2563EB', bg: '#DBEAFE', icon: <svg width="20" height="20" fill="none" stroke="#2563EB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
  { label: 'Réservations (mois)',     value: '312',     delta: '+41 ce mois',   color: '#D97706', bg: '#FEF3C7', icon: <svg width="20" height="20" fill="none" stroke="#D97706" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg> },
  { label: 'Commissions (€)',         value: '2 845',   delta: '+420 ce mois',  color: '#16A34A', bg: '#DCFCE7', icon: <svg width="20" height="20" fill="none" stroke="#16A34A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg> },
];

const MONTHS = [
  { m: 'Oct', v: 18200 }, { m: 'Nov', v: 21400 }, { m: 'Déc', v: 19800 },
  { m: 'Jan', v: 24100 }, { m: 'Fév', v: 26300 }, { m: 'Mar', v: 28450 },
];
const MAX_V = Math.max(...MONTHS.map(m => m.v));

const ACTIVITY = [
  { type: 'Nouveau guide',    name: 'Ibrahim Al-Rashid',         time: 'Il y a 12 min', status: 'EN ATTENTE', statusColor: '#D97706', statusBg: '#FEF3C7' },
  { type: 'Réservation',      name: 'Fatima → Guide Omar',       time: 'Il y a 34 min', status: 'CONFIRMÉE',  statusColor: '#16A34A', statusBg: '#DCFCE7' },
  { type: 'Litige ouvert',    name: 'Pèlerin #2847',             time: 'Il y a 1h',     status: 'OUVERT',     statusColor: '#DC2626', statusBg: '#FEE2E2' },
  { type: 'Guide validé',     name: 'Youssef Malik',             time: 'Il y a 2h',     status: 'ACTIF',      statusColor: '#16A34A', statusBg: '#DCFCE7' },
  { type: 'Réservation',      name: 'Amina → Guide Hassan',      time: 'Il y a 3h',     status: 'CONFIRMÉE',  statusColor: '#16A34A', statusBg: '#DCFCE7' },
  { type: 'Nouveau pèlerin',  name: 'Rachid Benhaddou',          time: 'Il y a 4h',     status: 'INSCRIT',    statusColor: '#2563EB', statusBg: '#DBEAFE' },
];

const card: React.CSSProperties = {
  background: '#FFFFFF', borderRadius: 12, padding: '1.5rem',
  boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)',
  border: '1px solid #E8DFC8',
};

export default function AdminDashboard() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* ── Alerts ── */}
      {(PENDING_GUIDES > 0 || OPEN_LITIGES > 0) && (
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {PENDING_GUIDES > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', background: '#FEF3C7', border: '1px solid #FCD34D', borderRadius: 8, padding: '0.6rem 1rem' }}>
              <svg width="16" height="16" fill="none" stroke="#D97706" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#92400E' }}>
                {PENDING_GUIDES} guide{PENDING_GUIDES > 1 ? 's' : ''} en attente de validation
              </span>
              <a href="/admin/guides" style={{ fontSize: '0.72rem', color: '#D97706', fontWeight: 700, textDecoration: 'none', marginLeft: 4 }}>Voir →</a>
            </div>
          )}
          {OPEN_LITIGES > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', background: '#FEE2E2', border: '1px solid #FCA5A5', borderRadius: 8, padding: '0.6rem 1rem' }}>
              <svg width="16" height="16" fill="none" stroke="#DC2626" strokeWidth="2" viewBox="0 0 24 24"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#991B1B' }}>
                {OPEN_LITIGES} litige{OPEN_LITIGES > 1 ? 's' : ''} ouvert{OPEN_LITIGES > 1 ? 's' : ''} en attente
              </span>
              <a href="/admin/litiges" style={{ fontSize: '0.72rem', color: '#DC2626', fontWeight: 700, textDecoration: 'none', marginLeft: 4 }}>Voir →</a>
            </div>
          )}
        </div>
      )}

      {/* ── KPIs ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        {KPIS.map(k => (
          <div key={k.label} style={card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#7A6D5A' }}>
                {k.label}
              </div>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: k.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {k.icon}
              </div>
            </div>
            <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '2rem', fontWeight: 700, color: '#1A1209', lineHeight: 1, marginBottom: '0.4rem' }}>
              {k.value}
            </div>
            <div style={{ fontSize: '0.72rem', color: k.color, fontWeight: 600 }}>{k.delta}</div>
          </div>
        ))}
      </div>

      {/* ── Chart + Activity ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem' }}>

        {/* Revenue chart */}
        <div style={card}>
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.2rem', fontWeight: 700, color: '#1A1209' }}>
              Revenus — 6 derniers mois
            </div>
            <div style={{ fontSize: '0.72rem', color: '#7A6D5A', marginTop: '0.2rem' }}>Commissions SAFARUMA (10%)</div>
          </div>
          <div style={{ background: '#1A1209', borderRadius: 10, padding: '1.5rem 1.5rem 1rem', display: 'flex', alignItems: 'flex-end', gap: '0.75rem', height: 180 }}>
            {MONTHS.map(({ m, v }) => (
              <div key={m} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem', height: '100%', justifyContent: 'flex-end' }}>
                <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>
                  {(v / 1000).toFixed(0)}k
                </div>
                <div style={{
                  width: '100%', borderRadius: '5px 5px 0 0',
                  background: v === MAX_V
                    ? 'linear-gradient(180deg, #F0D897, #C9A84C)'
                    : 'rgba(201,168,76,0.45)',
                  height: `${(v / MAX_V) * 110}px`,
                  minHeight: 8,
                  transition: 'height 0.3s',
                }} />
                <div style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.4)', fontWeight: 600, paddingBottom: 2 }}>{m}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#7A6D5A' }}>
            <span>Total 6 mois</span>
            <span style={{ fontWeight: 700, color: '#1A1209' }}>138 250 €</span>
          </div>
        </div>

        {/* Activity feed */}
        <div style={card}>
          <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.2rem', fontWeight: 700, color: '#1A1209', marginBottom: '1.25rem' }}>
            Activité récente
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {ACTIVITY.map((a, i) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem',
                padding: '0.75rem 0',
                borderBottom: i < ACTIVITY.length - 1 ? '1px solid #F0EBE0' : 'none',
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#1A1209', marginBottom: '0.1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.name}</div>
                  <div style={{ fontSize: '0.68rem', color: '#7A6D5A' }}>{a.type} · {a.time}</div>
                </div>
                <span style={{
                  fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.06em',
                  padding: '0.25rem 0.5rem', borderRadius: 20, whiteSpace: 'nowrap', flexShrink: 0,
                  background: a.statusBg, color: a.statusColor,
                }}>
                  {a.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
