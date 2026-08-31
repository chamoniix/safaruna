import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { getIncludedPlaces, getPlaceByKey } from '@/lib/places'

type Itinerary = {
  eyebrow: string
  title: string
  description: string
  city: 'MAKKAH' | 'BOTH'
  extras: string[]
}

const itineraries: Itinerary[] = [
  {
    eyebrow: 'Deux villes',
    title: 'L’essentiel de la Omra',
    description: 'Un parcours entre Makkah et Médine, avec les lieux de base inclus dans chaque ville et sans visite supplémentaire.',
    city: 'BOTH',
    extras: [],
  },
  {
    eyebrow: 'Deux villes',
    title: 'Découvrir les deux villes',
    description: 'Les lieux de base inclus, puis trois visites supplémentaires à Médine et trois à Makkah pour approfondir votre séjour.',
    city: 'BOTH',
    extras: ['ohoud', 'qiblatayn', 'masjid-fateh', 'jabal-nour', 'jabal-thawr', 'arafat'],
  },
  {
    eyebrow: 'Makkah',
    title: 'L’essentiel à Makkah',
    description: 'Un parcours centré sur la Omra et les lieux de base inclus à Makkah, sans visite supplémentaire.',
    city: 'MAKKAH',
    extras: [],
  },
  {
    eyebrow: 'Makkah',
    title: 'Découvrir Makkah',
    description: 'Les lieux de base inclus à Makkah, complétés par cinq visites supplémentaires pour enrichir votre parcours.',
    city: 'MAKKAH',
    extras: ['hira', 'jabal-thawr', 'arafat', 'muzdalifah', 'mina'],
  },
]

export default function Page() {
  return (
    <>
      <Navbar />
      <main style={{ background: '#F8F5EF', minHeight: '70vh', padding: '8.5rem 1.25rem 5rem' }}>
        <section style={{ maxWidth: 1120, margin: '0 auto' }}>
          <div style={{ maxWidth: 700, marginBottom: '2.5rem' }}>
            <p style={{ color: '#9A6C14', fontSize: 12, fontWeight: 800, letterSpacing: '.14em', textTransform: 'uppercase', margin: '0 0 .65rem' }}>Préparer votre séjour</p>
            <h1 style={{ fontFamily: 'var(--font-cormorant, Georgia, serif)', color: '#1A1209', fontSize: 'clamp(2.4rem, 6vw, 4rem)', lineHeight: 1, margin: 0 }}>Parcours recommandés</h1>
            <p style={{ color: '#655C50', fontSize: '1rem', lineHeight: 1.7, margin: '1rem 0 0' }}>Choisissez une direction pour votre Omra selon les villes et les visites que vous souhaitez découvrir. Votre guide vous accompagnera ensuite dans la préparation de votre parcours.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 18 }}>
            {itineraries.map(itinerary => {
              const included = getIncludedPlaces(itinerary.city)
              const extras = itinerary.extras.map(getPlaceByKey).filter((place): place is NonNullable<typeof place> => Boolean(place))
              return (
                <article key={itinerary.title} style={{ display: 'flex', flexDirection: 'column', padding: '1.4rem', border: '1px solid #E7DEC9', borderRadius: 18, background: 'white', boxShadow: '0 8px 24px rgba(55,38,12,.05)' }}>
                  <div style={{ alignSelf: 'flex-start', padding: '.3rem .65rem', background: itinerary.city === 'BOTH' ? '#EEF6F2' : '#FEF6E6', borderRadius: 99, color: itinerary.city === 'BOTH' ? '#2B6B52' : '#9A6C14', fontSize: 11, fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase' }}>{itinerary.eyebrow}</div>
                  <h2 style={{ margin: '.9rem 0 .45rem', color: '#1A1209', fontFamily: 'var(--font-cormorant, Georgia, serif)', fontSize: '1.7rem', lineHeight: 1.05 }}>{itinerary.title}</h2>
                  <p style={{ margin: 0, color: '#655C50', fontSize: '.87rem', lineHeight: 1.65 }}>{itinerary.description}</p>

                  <div style={{ marginTop: '1.2rem', paddingTop: '1rem', borderTop: '1px solid #F0EBE1' }}>
                    <div style={{ color: '#6F6250', fontSize: 11, fontWeight: 800, letterSpacing: '.09em', textTransform: 'uppercase', marginBottom: '.55rem' }}>Lieux de base inclus</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {included.map(place => <span key={place.key} style={{ padding: '.28rem .5rem', borderRadius: 8, background: '#F6F2EA', color: '#4C4131', fontSize: 12 }}>{place.emoji} {place.nameFr}</span>)}
                    </div>
                  </div>

                  {extras.length > 0 && (
                    <div style={{ marginTop: '1rem' }}>
                      <div style={{ color: '#6F6250', fontSize: 11, fontWeight: 800, letterSpacing: '.09em', textTransform: 'uppercase', marginBottom: '.55rem' }}>Visites supplémentaires proposées</div>
                      <div style={{ display: 'grid', gap: 6 }}>
                        {extras.map(place => <div key={place.key} style={{ color: '#4C4131', fontSize: 13 }}>{place.emoji} {place.nameFr}</div>)}
                      </div>
                    </div>
                  )}

                  <Link href="/guides" style={{ marginTop: 'auto', paddingTop: '1.4rem', color: '#80601A', fontSize: 13, fontWeight: 800, textDecoration: 'none' }}>Découvrir les guides →</Link>
                </article>
              )
            })}
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
