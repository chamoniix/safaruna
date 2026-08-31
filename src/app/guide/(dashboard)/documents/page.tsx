const WHATSAPP_URL = 'https://wa.me/message/3LAXCIZV7FFEK1'

export default function Page() {
  return (
    <div style={{ display: 'grid', gap: 18 }}>
      <header>
        <div style={{ color: '#9A6C14', fontSize: 12, fontWeight: 800, letterSpacing: '.12em', textTransform: 'uppercase' }}>Services à venir</div>
        <h1 style={{ margin: '6px 0', color: '#1A1209', fontFamily: 'var(--font-cormorant, serif)', fontSize: 30 }}>Mes documents</h1>
        <p style={{ margin: 0, color: '#756B5D', fontSize: 14, lineHeight: 1.6 }}>Ces services ne sont pas encore ouverts à la réservation. Contactez l’équipe SAFARUMA pour en savoir plus.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
        {[
          { icon: '🛂', title: 'Visa Omra', action: 'Demander un visa' },
          { icon: '🏨', title: 'Réservation hôtel', action: 'Réserver mon hôtel' },
          { icon: '🚗', title: 'Taxi privé', action: 'Réserver mon taxi privé' },
        ].map(service => (
          <article key={service.title} style={{ background: 'white', border: '1px solid #E8DFC8', borderRadius: 14, padding: 18, display: 'grid', gap: 12 }}>
            <span style={{ width: 42, height: 42, borderRadius: 12, background: '#F5F2EC', display: 'grid', placeItems: 'center', fontSize: 21 }}>{service.icon}</span>
            <div>
              <h2 style={{ margin: 0, color: '#1A1209', fontFamily: 'var(--font-cormorant, serif)', fontSize: 20 }}>{service.title}</h2>
              <p style={{ margin: '5px 0 0', color: '#7A6D5A', fontSize: 13, lineHeight: 1.55 }}>Service bientôt disponible.</p>
            </div>
            <button disabled style={{ padding: '9px 12px', border: '1px solid #DDD6C7', borderRadius: 9, background: '#F2EFE9', color: '#9B9387', fontSize: 12, fontWeight: 700, cursor: 'not-allowed' }}>{service.action}</button>
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" style={{ color: '#80601A', fontSize: 12, fontWeight: 800, textDecoration: 'none' }}>En savoir plus sur WhatsApp →</a>
          </article>
        ))}
      </div>
    </div>
  )
}
