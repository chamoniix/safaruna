export default function AdminDashboard() {
  const kpis = [
    { label: 'Guides actifs', value: '47', delta: '+3 ce mois', color: '#C9A84C' },
    { label: 'Pèlerins inscrits', value: '1 284', delta: '+128 ce mois', color: '#4CAF9A' },
    { label: 'Réservations', value: '312', delta: '+41 ce mois', color: '#7B6CF6' },
    { label: 'Revenus (€)', value: '28 450', delta: '+4 200 ce mois', color: '#F06C4C' },
  ];

  const recentActivity = [
    { type: 'Nouveau guide', name: 'Ibrahim Al-Rashid', time: 'Il y a 12 min', status: 'EN ATTENTE' },
    { type: 'Réservation', name: 'Fatima Benali → Guide Omar', time: 'Il y a 34 min', status: 'CONFIRMÉE' },
    { type: 'Litige ouvert', name: 'Pèlerin #2847', time: 'Il y a 1h', status: 'OUVERT' },
    { type: 'Guide validé', name: 'Youssef Malik', time: 'Il y a 2h', status: 'ACTIF' },
    { type: 'Réservation', name: 'Amina Toure → Guide Hassan', time: 'Il y a 3h', status: 'CONFIRMÉE' },
  ];

  // Revenue bars for last 6 months
  const months = [
    { m: 'Oct', v: 18200 }, { m: 'Nov', v: 21400 }, { m: 'Déc', v: 19800 },
    { m: 'Jan', v: 24100 }, { m: 'Fév', v: 26300 }, { m: 'Mar', v: 28450 },
  ];
  const maxV = Math.max(...months.map(m => m.v));

  const statusColor: Record<string, string> = {
    'EN ATTENTE': '#F0B44C',
    'CONFIRMÉE': '#4CAF9A',
    'OUVERT': '#F06C4C',
    'ACTIF': '#4CAF9A',
  };

  return (
    <div>
      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        {kpis.map(k => (
          <div key={k.label} style={{
            background: '#1A1209', border: '1px solid rgba(201,168,76,0.15)',
            borderRadius: 16, padding: '1.5rem', position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: k.color, opacity: 0.8 }} />
            <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: '0.5rem' }}>
              {k.label}
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'white', lineHeight: 1.2, marginBottom: '0.4rem' }}>
              {k.value}
            </div>
            <div style={{ fontSize: '0.72rem', color: k.color, fontWeight: 600 }}>{k.delta}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem' }}>
        {/* Revenue chart */}
        <div style={{ background: '#1A1209', border: '1px solid rgba(201,168,76,0.15)', borderRadius: 16, padding: '1.5rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: '1.5rem' }}>
            Revenus — 6 derniers mois
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.75rem', height: 160 }}>
            {months.map(({ m, v }) => (
              <div key={m} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
                <div style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>
                  {(v / 1000).toFixed(0)}k
                </div>
                <div style={{
                  width: '100%', borderRadius: '6px 6px 0 0',
                  background: 'linear-gradient(180deg, #C9A84C, #F0D897)',
                  height: `${(v / maxV) * 120}px`,
                  opacity: v === maxV ? 1 : 0.6,
                }} />
                <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>{m}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent activity */}
        <div style={{ background: '#1A1209', border: '1px solid rgba(201,168,76,0.15)', borderRadius: 16, padding: '1.5rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: '1.25rem' }}>
            Activité récente
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {recentActivity.map((a, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                <div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'white', marginBottom: '0.15rem' }}>{a.type}</div>
                  <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.4)' }}>{a.name}</div>
                  <div style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.25)', marginTop: '0.15rem' }}>{a.time}</div>
                </div>
                <span style={{
                  fontSize: '0.55rem', fontWeight: 700, letterSpacing: '0.08em',
                  padding: '0.25rem 0.5rem', borderRadius: 20, whiteSpace: 'nowrap',
                  background: `${statusColor[a.status]}22`, color: statusColor[a.status],
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
