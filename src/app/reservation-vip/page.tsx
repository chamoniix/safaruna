import type { Metadata } from 'next'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import PayDepositButton from './PayDepositButton'

export const metadata: Metadata = {
  title: 'Réservation VIP | Conciergerie Omra SAFARUMA',
  description: 'Une organisation privée et sur mesure pour votre Omra : guide, transferts, hébergement et services de conciergerie selon vos besoins.',
}

const services = [
  ['Organisation sur mesure', 'Un échange avec notre organisateur pour comprendre vos attentes et construire un programme adapté à votre séjour.'],
  ['Guides privés certifiés', 'Un guide dédié, plusieurs guides pour une famille ou un groupe, et un accompagnement dans les langues disponibles.'],
  ['Visites des lieux saints', 'Un itinéraire autour des lieux historiques de Makkah et de Médine, parmi plus de 25 lieux à découvrir.'],
  ['Transport et transferts', 'Recherche et coordination d’un véhicule adapté : berline, 4×4 ou van, transferts entre les villes, prise en charge ou dépôt à l’aéroport.'],
  ['Hébergement et préparation', 'Recherche d’hôtel, organisation de réservations et possibilité de trouver des ihrams de qualité selon vos préférences.'],
  ['Services pour votre famille', 'Coordination de besoins particuliers, comme une nounou ou une aide adaptée aux enfants, selon les disponibilités.'],
  ['Demandes particulières', 'Nous étudions vos demandes de discrétion, d’organisation privilégiée, de sécurité ou d’accès VIP selon les règles, autorisations et disponibilités applicables.'],
]

export default function ReservationVipPage() {
  return <>
    <Navbar />
    <main style={{ background: '#15130F', color: '#F8F4E9', minHeight: '75vh', padding: 'clamp(7rem,12vw,10rem) 1.25rem 5rem' }}>
      <div style={{ maxWidth: 1080, margin: '0 auto' }}>
        <p style={{ color: '#D5B65E', letterSpacing: '.22em', textTransform: 'uppercase', font: '700 .75rem var(--font-manrope, sans-serif)' }}>SAFARUMA · CONCIERGERIE PRIVÉE</p>
        <h1 style={{ color: 'inherit', maxWidth: 850, margin: '1rem 0', font: '500 clamp(2.7rem,7vw,5.5rem)/.98 var(--font-cormorant, Georgia, serif)' }}>Votre Omra, organisée à votre mesure.</h1>
        <p style={{ maxWidth: 720, color: '#D5D0C4', font: '400 1.05rem/1.8 var(--font-manrope, sans-serif)' }}>
          Un interlocuteur dédié prépare avec vous une expérience privée, confortable et discrète. Nous recherchons, coordonnons et organisons les services souhaités après un échange personnalisé.
        </p>

        <section aria-labelledby="vip-services" style={{ marginTop: '4rem' }}>
          <p style={{ color: '#D5B65E', letterSpacing: '.18em', textTransform: 'uppercase', fontSize: '.72rem' }}>Une organisation complète</p>
          <h2 id="vip-services" style={{ margin: '.5rem 0 1.5rem', font: '500 clamp(2rem,4vw,3rem) var(--font-cormorant, Georgia, serif)' }}>Une seule équipe pour tout coordonner</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,290px),1fr))', gap: '1px', background: 'rgba(213,182,94,.2)', border: '1px solid rgba(213,182,94,.2)' }}>
            {services.map(([title, body]) => <article key={title} style={{ padding: '1.5rem', background: '#1D1A14' }}>
              <h3 style={{ color: '#E2C97A', margin: '0 0 .6rem', font: '600 1.3rem var(--font-cormorant, Georgia, serif)' }}>{title}</h3>
              <p style={{ color: '#D5D0C4', margin: 0, font: '400 .88rem/1.75 var(--font-manrope, sans-serif)' }}>{body}</p>
            </article>)}
          </div>
        </section>

        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,320px),1fr))', gap: '2.5rem', alignItems: 'center', marginTop: '4rem', padding: 'clamp(1.4rem,4vw,3rem)', border: '1px solid rgba(213,182,94,.35)', background: 'linear-gradient(135deg,#211E17,#181610)' }}>
          <div>
            <p style={{ color: '#D5B65E', letterSpacing: '.18em', textTransform: 'uppercase', fontSize: '.72rem' }}>Votre première étape</p>
            <h2 style={{ margin: '.5rem 0 1rem', font: '500 clamp(2rem,4vw,3rem) var(--font-cormorant, Georgia, serif)' }}>Consultation privée</h2>
            <p style={{ color: '#D5D0C4', font: '400 .92rem/1.8 var(--font-manrope, sans-serif)' }}>Après le règlement de l’acompte, vous choisirez un créneau avec notre organisateur. Pendant la consultation, nous établirons vos besoins et préparerons une proposition personnalisée.</p>
          </div>
          <div>
            <p style={{ margin: 0, color: '#D5B65E', font: '600 3.5rem var(--font-cormorant, Georgia, serif)' }}>500 €</p>
            <p style={{ margin: '.2rem 0 1.3rem', color: '#F8F4E9', font: '600 .92rem var(--font-manrope, sans-serif)' }}>Acompte pour la consultation et la mise en place de votre demande</p>
            <p style={{ color: '#D5D0C4', font: '400 .82rem/1.65 var(--font-manrope, sans-serif)' }}>Cet acompte est imputé sur la facture finale. Après la consultation, nous vous transmettrons le montant global des services retenus. Les prestations dépendent de vos choix, des disponibilités et de leur faisabilité.</p>
            <div style={{ marginTop: '1.5rem' }}><PayDepositButton /></div>
          </div>
        </section>
      </div>
    </main>
    <Footer />
  </>
}
