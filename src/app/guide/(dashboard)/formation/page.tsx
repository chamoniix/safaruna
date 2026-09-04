import { GraduationCap } from 'lucide-react'

export default function FormationPage() {
  return (
    <div style={{ minHeight: 'calc(100vh - 9rem)', display: 'grid', placeItems: 'center', fontFamily: 'var(--font-manrope, sans-serif)' }}>
      <section style={{ width: 'min(100%, 680px)', padding: 'clamp(1.5rem, 5vw, 3rem)', background: 'white', border: '1px solid #E8DFC8', borderRadius: 18, textAlign: 'center', boxShadow: '0 18px 45px rgba(61, 43, 26, 0.08)' }}>
        <span style={{ width: 58, height: 58, margin: '0 auto 1.25rem', display: 'grid', placeItems: 'center', borderRadius: 16, color: '#8A651B', background: '#F7EAC3' }}>
          <GraduationCap size={29} strokeWidth={1.8} aria-hidden="true" />
        </span>
        <div style={{ color: '#9A6C14', fontSize: 12, fontWeight: 800, letterSpacing: '.12em', textTransform: 'uppercase' }}>
          Formation SAFARUMA
        </div>
        <h1 style={{ margin: '8px 0 12px', color: '#1A1209', fontFamily: 'var(--font-cormorant, serif)', fontSize: 'clamp(2rem, 6vw, 2.7rem)' }}>
          Bientôt disponible
        </h1>
        <p style={{ maxWidth: 540, margin: '0 auto', color: '#756B5D', fontSize: 15, lineHeight: 1.75 }}>
          Vous retrouverez ici les actualités SAFARUMA et les informations essentielles remontées du terrain par notre équipe et les autres guides, afin d’améliorer continuellement l’accompagnement et l’expérience des pèlerins.
        </p>
      </section>
    </div>
  )
}
