import Link from 'next/link'

export default function ReservationNotFound() {
  return (
    <section style={{ background: 'white', border: '1px solid #E8DFC8', borderRadius: 16, padding: '3rem 1.5rem', textAlign: 'center', fontFamily: 'var(--font-manrope, sans-serif)' }}>
      <div style={{ color: '#8B6914', fontSize: 12, fontWeight: 800, letterSpacing: '.12em', textTransform: 'uppercase' }}>Réservation introuvable</div>
      <h1 style={{ color: '#1A1209', fontSize: 28, margin: '10px 0' }}>Cette réservation n’est pas accessible.</h1>
      <p style={{ color: '#7A6D5A', fontSize: 14, margin: '0 auto 22px', maxWidth: 480 }}>Vérifiez la référence depuis votre liste de réservations.</p>
      <Link href="/espace/reservations" style={{ display: 'inline-block', padding: '11px 18px', borderRadius: 999, background: '#1A1209', color: '#F0D897', fontSize: 13, fontWeight: 800, textDecoration: 'none' }}>
        Retour à mes réservations
      </Link>
    </section>
  )
}
