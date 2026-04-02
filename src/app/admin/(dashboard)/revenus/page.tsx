const COMMISSIONS = [
  { id: 'RES-2845', guide: 'Hassan Toure',   pelerin: 'Amina Toure',    amount: 950,  commission: 95,  date: '28/03/2026', paid: true },
  { id: 'RES-2843', guide: 'Omar Benali',    pelerin: 'Sara Mansour',   amount: 1350, commission: 135, date: '15/03/2026', paid: true },
  { id: 'RES-2844', guide: 'Bilal Choudhry', pelerin: 'Khadija Al-Amin',amount: 1200, commission: 120, date: '10/04/2026', paid: false },
  { id: 'RES-2847', guide: 'Omar Benali',    pelerin: 'Fatima Benali',  amount: 1400, commission: 140, date: '15/04/2026', paid: false },
  { id: 'RES-2840', guide: 'Bilal Choudhry', pelerin: 'Ahmed Bouzid',   amount: 1300, commission: 130, date: '25/04/2026', paid: false },
];

const VIREMENTS = [
  { guide: 'Omar Benali',    amount: 2195, period: 'Mars 2026',  status: 'VERSÉ' },
  { guide: 'Hassan Toure',   amount: 1330, period: 'Mars 2026',  status: 'VERSÉ' },
  { guide: 'Youssef Malik',  amount: 1890, period: 'Mars 2026',  status: 'VERSÉ' },
  { guide: 'Bilal Choudhry', amount: 2210, period: 'Avril 2026', status: 'EN ATTENTE' },
  { guide: 'Omar Benali',    amount: 1260, period: 'Avril 2026', status: 'EN ATTENTE' },
];

const card: React.CSSProperties = {
  background: '#FFFFFF', borderRadius: 12,
  boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #E8DFC8',
};

export default function AdminRevenus() {
  const totalCommissions  = COMMISSIONS.reduce((s, c) => s + c.commission, 0);
  const pendingVirements  = VIREMENTS.filter(v => v.status === 'EN ATTENTE').reduce((s, v) => s + v.amount, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
        {[
          { label: 'Revenus bruts (30j)',      value: '28 450 €', color: '#C9A84C' },
          { label: 'Commissions SAFARUMA',     value: `${totalCommissions.toLocaleString('fr-FR')} €`, color: '#16A34A' },
          { label: 'Virements en attente',     value: `${pendingVirements.toLocaleString('fr-FR')} €`, color: '#D97706' },
        ].map(s => (
          <div key={s.label} style={{ ...card, padding: '1.25rem 1.5rem', overflow: 'visible' }}>
            <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#7A6D5A', marginBottom: '0.4rem' }}>{s.label}</div>
            <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.8rem', fontWeight: 700, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Commissions */}
      <div style={{ ...card, overflow: 'hidden' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #E8DFC8' }}>
          <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.1rem', fontWeight: 700, color: '#1A1209' }}>Commissions (10% par réservation)</div>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#F5F3EF', borderBottom: '1px solid #E8DFC8' }}>
              {['Réservation', 'Guide', 'Pèlerin', 'Montant', 'Commission', 'Date', 'Statut'].map(h => (
                <th key={h} style={{ padding: '0.75rem 1.25rem', textAlign: 'left', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#7A6D5A', whiteSpace: 'nowrap' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {COMMISSIONS.map((c, i) => (
              <tr key={c.id} style={{ background: i % 2 === 0 ? '#FFFFFF' : '#FAFAF8', borderBottom: '1px solid #F0EBE0' }}>
                <td style={{ padding: '0.875rem 1.25rem', fontSize: '0.72rem', fontWeight: 700, color: '#C9A84C' }}>{c.id}</td>
                <td style={{ padding: '0.875rem 1.25rem', fontSize: '0.85rem', fontWeight: 600, color: '#1A1209' }}>{c.guide}</td>
                <td style={{ padding: '0.875rem 1.25rem', fontSize: '0.83rem', color: '#4A3F30' }}>{c.pelerin}</td>
                <td style={{ padding: '0.875rem 1.25rem', fontSize: '0.83rem', color: '#4A3F30' }}>{c.amount.toLocaleString('fr-FR')} €</td>
                <td style={{ padding: '0.875rem 1.25rem', fontSize: '0.88rem', fontWeight: 700, color: '#C9A84C' }}>{c.commission.toLocaleString('fr-FR')} €</td>
                <td style={{ padding: '0.875rem 1.25rem', fontSize: '0.75rem', color: '#7A6D5A' }}>{c.date}</td>
                <td style={{ padding: '0.875rem 1.25rem' }}>
                  <span style={{ fontSize: '0.62rem', fontWeight: 700, padding: '0.25rem 0.55rem', borderRadius: 20, background: c.paid ? '#DCFCE7' : '#FEF3C7', color: c.paid ? '#16A34A' : '#D97706' }}>
                    {c.paid ? 'VERSÉ' : 'EN ATTENTE'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Virements */}
      <div style={card}>
        <div style={{ padding: '0 0 1.25rem', borderBottom: '1px solid #E8DFC8', marginBottom: '0' }}>
          <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.1rem', fontWeight: 700, color: '#1A1209' }}>Virements guides</div>
        </div>
        {VIREMENTS.map((v, i) => (
          <div key={i} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem',
            padding: '1rem 0', borderBottom: i < VIREMENTS.length - 1 ? '1px solid #F0EBE0' : 'none',
          }}>
            <div>
              <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#1A1209' }}>{v.guide}</div>
              <div style={{ fontSize: '0.72rem', color: '#7A6D5A', marginTop: 2 }}>{v.period}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.1rem', fontWeight: 700, color: '#1A1209' }}>{v.amount.toLocaleString('fr-FR')} €</span>
              <span style={{ fontSize: '0.62rem', fontWeight: 700, padding: '0.25rem 0.55rem', borderRadius: 20, background: v.status === 'VERSÉ' ? '#DCFCE7' : '#FEF3C7', color: v.status === 'VERSÉ' ? '#16A34A' : '#D97706' }}>
                {v.status}
              </span>
              {v.status === 'EN ATTENTE' && (
                <button style={{ padding: '0.4rem 1rem', borderRadius: 50, border: 'none', background: '#1A1209', color: '#F0D897', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                  Virer
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
