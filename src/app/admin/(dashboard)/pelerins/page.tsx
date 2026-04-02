const PELERINS = [
  { id: 1, name: 'Fatima Benali', email: 'fatima@gmail.com', phone: '+33 6 11 22 33 44', city: 'Paris', reservations: 2, joined: '2026-01-15', status: 'ACTIF' },
  { id: 2, name: 'Amina Toure', email: 'amina@gmail.com', phone: '+33 6 55 66 77 88', city: 'Lyon', reservations: 1, joined: '2026-02-03', status: 'ACTIF' },
  { id: 3, name: 'Mohammed Saidi', email: 'msaidi@gmail.com', phone: '+33 6 44 55 66 77', city: 'Marseille', reservations: 3, joined: '2025-11-20', status: 'ACTIF' },
  { id: 4, name: 'Khadija Al-Amin', email: 'khadija@gmail.com', phone: '+33 7 12 34 56 78', city: 'Bordeaux', reservations: 1, joined: '2026-03-10', status: 'ACTIF' },
  { id: 5, name: 'Ahmed Bouzid', email: 'ahmed@gmail.com', phone: '+33 6 98 76 54 32', city: 'Strasbourg', reservations: 0, joined: '2026-03-25', status: 'INACTIF' },
  { id: 6, name: 'Sara Mansour', email: 'sara@gmail.com', phone: '+33 6 23 45 67 89', city: 'Nantes', reservations: 2, joined: '2025-12-18', status: 'ACTIF' },
  { id: 7, name: 'Rachid Benhaddou', email: 'rachid@gmail.com', phone: '+33 7 87 65 43 21', city: 'Lille', reservations: 0, joined: '2026-03-28', status: 'INACTIF' },
  { id: 8, name: 'Leila Kaci', email: 'leila@gmail.com', phone: '+33 6 11 99 88 77', city: 'Nice', reservations: 1, joined: '2026-02-14', status: 'ACTIF' },
];

const STATUS_COLORS: Record<string, string> = {
  'ACTIF': '#4CAF9A',
  'INACTIF': 'rgba(255,255,255,0.3)',
};

export default function AdminPelerins() {
  return (
    <div>
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Total inscrits', value: '1 284' },
          { label: 'Actifs ce mois', value: '312' },
          { label: 'Nouveaux (30j)', value: '128' },
        ].map(s => (
          <div key={s.label} style={{
            flex: 1, background: '#1A1209', border: '1px solid rgba(201,168,76,0.12)',
            borderRadius: 12, padding: '1rem 1.25rem',
          }}>
            <div style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: '0.4rem' }}>
              {s.label}
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'white' }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={{ background: '#1A1209', border: '1px solid rgba(201,168,76,0.15)', borderRadius: 16, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              {['Pèlerin', 'Téléphone', 'Ville', 'Réservations', 'Inscrit le', 'Statut'].map(h => (
                <th key={h} style={{
                  padding: '0.875rem 1.25rem', textAlign: 'left',
                  fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.12em',
                  textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)',
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PELERINS.map((p, i) => (
              <tr key={p.id} style={{ borderBottom: i < PELERINS.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                <td style={{ padding: '1rem 1.25rem' }}>
                  <div style={{ fontWeight: 600, color: 'white', fontSize: '0.85rem' }}>{p.name}</div>
                  <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)' }}>{p.email}</div>
                </td>
                <td style={{ padding: '1rem 1.25rem', fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)' }}>{p.phone}</td>
                <td style={{ padding: '1rem 1.25rem', fontSize: '0.82rem', color: 'rgba(255,255,255,0.6)' }}>{p.city}</td>
                <td style={{ padding: '1rem 1.25rem', fontSize: '0.85rem', fontWeight: 700, color: 'white' }}>{p.reservations}</td>
                <td style={{ padding: '1rem 1.25rem', fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)' }}>{p.joined}</td>
                <td style={{ padding: '1rem 1.25rem' }}>
                  <span style={{
                    fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.08em',
                    padding: '0.3rem 0.65rem', borderRadius: 20,
                    background: `${STATUS_COLORS[p.status]}22`, color: STATUS_COLORS[p.status],
                  }}>
                    {p.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
