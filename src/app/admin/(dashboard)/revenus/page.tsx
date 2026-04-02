const COMMISSIONS = [
  { id: 'RES-2845', guide: 'Hassan Toure', pelerin: 'Amina Toure', amount: 950, commission: 95, date: '2026-03-28', paid: true },
  { id: 'RES-2843', guide: 'Omar Benali', pelerin: 'Sara Mansour', amount: 1350, commission: 135, date: '2026-03-15', paid: true },
  { id: 'RES-2844', guide: 'Bilal Choudhry', pelerin: 'Khadija Al-Amin', amount: 1200, commission: 120, date: '2026-04-10', paid: false },
  { id: 'RES-2847', guide: 'Omar Benali', pelerin: 'Fatima Benali', amount: 1400, commission: 140, date: '2026-04-15', paid: false },
  { id: 'RES-2840', guide: 'Bilal Choudhry', pelerin: 'Ahmed Bouzid', amount: 1300, commission: 130, date: '2026-04-25', paid: false },
];

const VIREMENTS = [
  { guide: 'Omar Benali', amount: 2195, period: 'Mars 2026', status: 'VERSÉ' },
  { guide: 'Hassan Toure', amount: 1330, period: 'Mars 2026', status: 'VERSÉ' },
  { guide: 'Youssef Malik', amount: 1890, period: 'Mars 2026', status: 'VERSÉ' },
  { guide: 'Bilal Choudhry', amount: 2210, period: 'Avril 2026', status: 'EN ATTENTE' },
  { guide: 'Omar Benali', amount: 1260, period: 'Avril 2026', status: 'EN ATTENTE' },
];

export default function AdminRevenus() {
  const totalCommissions = COMMISSIONS.reduce((s, c) => s + c.commission, 0);
  const pendingVirements = VIREMENTS.filter(v => v.status === 'EN ATTENTE').reduce((s, v) => s + v.amount, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
        {[
          { label: 'Revenus bruts (30j)', value: `${(28450).toLocaleString('fr-FR')} €`, color: '#C9A84C' },
          { label: 'Commissions SAFARUMA', value: `${totalCommissions.toLocaleString('fr-FR')} €`, color: '#4CAF9A' },
          { label: 'Virements en attente', value: `${pendingVirements.toLocaleString('fr-FR')} €`, color: '#F0B44C' },
        ].map(s => (
          <div key={s.label} style={{
            background: '#1A1209', border: '1px solid rgba(201,168,76,0.12)',
            borderRadius: 14, padding: '1.25rem 1.5rem',
          }}>
            <div style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: '0.4rem' }}>
              {s.label}
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Commissions table */}
      <div style={{ background: '#1A1209', border: '1px solid rgba(201,168,76,0.15)', borderRadius: 16, padding: '1.5rem' }}>
        <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#C9A84C', marginBottom: '1rem' }}>
          Commissions (10% par réservation)
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              {['Réservation', 'Guide', 'Pèlerin', 'Montant', 'Commission', 'Date', 'Versé'].map(h => (
                <th key={h} style={{
                  padding: '0.75rem 1rem', textAlign: 'left',
                  fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.12em',
                  textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)',
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {COMMISSIONS.map((c, i) => (
              <tr key={c.id} style={{ borderBottom: i < COMMISSIONS.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                <td style={{ padding: '0.875rem 1rem', fontSize: '0.72rem', fontWeight: 700, color: '#C9A84C' }}>{c.id}</td>
                <td style={{ padding: '0.875rem 1rem', fontSize: '0.82rem', color: 'white', fontWeight: 600 }}>{c.guide}</td>
                <td style={{ padding: '0.875rem 1rem', fontSize: '0.78rem', color: 'rgba(255,255,255,0.6)' }}>{c.pelerin}</td>
                <td style={{ padding: '0.875rem 1rem', fontSize: '0.82rem', color: 'rgba(255,255,255,0.7)' }}>{c.amount.toLocaleString('fr-FR')} €</td>
                <td style={{ padding: '0.875rem 1rem', fontSize: '0.85rem', fontWeight: 700, color: '#C9A84C' }}>{c.commission.toLocaleString('fr-FR')} €</td>
                <td style={{ padding: '0.875rem 1rem', fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>{c.date}</td>
                <td style={{ padding: '0.875rem 1rem' }}>
                  <span style={{
                    fontSize: '0.6rem', fontWeight: 700, padding: '0.25rem 0.55rem', borderRadius: 20,
                    background: c.paid ? '#4CAF9A22' : '#F0B44C22',
                    color: c.paid ? '#4CAF9A' : '#F0B44C',
                  }}>
                    {c.paid ? 'VERSÉ' : 'EN ATTENTE'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Virements guides */}
      <div style={{ background: '#1A1209', border: '1px solid rgba(201,168,76,0.15)', borderRadius: 16, padding: '1.5rem' }}>
        <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#C9A84C', marginBottom: '1rem' }}>
          Virements guides
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
          {VIREMENTS.map((v, i) => (
            <div key={i} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '0.875rem 0',
              borderBottom: i < VIREMENTS.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
            }}>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'white' }}>{v.guide}</div>
                <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)' }}>{v.period}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'white' }}>{v.amount.toLocaleString('fr-FR')} €</span>
                <span style={{
                  fontSize: '0.6rem', fontWeight: 700, padding: '0.25rem 0.55rem', borderRadius: 20,
                  background: v.status === 'VERSÉ' ? '#4CAF9A22' : '#F0B44C22',
                  color: v.status === 'VERSÉ' ? '#4CAF9A' : '#F0B44C',
                }}>
                  {v.status}
                </span>
                {v.status === 'EN ATTENTE' && (
                  <button style={{
                    padding: '0.3rem 0.7rem', borderRadius: 6, border: 'none',
                    background: '#C9A84C', color: '#1A1209',
                    fontSize: '0.68rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                  }}>
                    Virer
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
