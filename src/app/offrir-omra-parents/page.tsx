import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Offrir la Omra à ses parents — Guide privé qui prend soin d\'eux | SAFARUMA',
  description: 'Vous voulez offrir la Omra à vos parents ? Notre guide privé prend soin d\'eux sur place — accompagnement personnalisé, histoire des lieux saints, rythme adapté aux personnes âgées.',
  keywords: [
    'offrir omra parents',
    'omra cadeau parents',
    'guide omra parents âgés',
    'omra surprise parents',
    'prenez soin de mes parents omra',
    'guide privé omra personne âgée',
    'offrir omra',
    'accompagnement omra parents',
  ],
  openGraph: {
    title: 'Offrir la Omra à ses parents — SAFARUMA',
    description: 'Ils partent. Vous restez. Votre guide privé prend soin de vos parents comme vous le feriez vous-même.',
    url: 'https://safaruma.com/offrir-omra-parents',
    siteName: 'SAFARUMA',
    locale: 'fr_FR',
    type: 'website',
  },
  alternates: {
    canonical: 'https://safaruma.com/offrir-omra-parents',
  },
};

export default function OffrirOmraParentsPage() {
  return (
    <>
      <Navbar />
      <main style={{ paddingTop: '5rem', background: 'var(--cream)' }}>

        {/* Hero */}
        <section style={{ padding: '5rem 2rem 4rem', maxWidth: 760, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.3)', padding: '0.35rem 1rem', borderRadius: 50, fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: 'var(--gold-dark)', marginBottom: '1.5rem' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--gold)', display: 'inline-block' }} />
            Le plus beau cadeau
          </div>
          <h1 style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: 'clamp(2.2rem, 5vw, 3.6rem)', fontWeight: 300, lineHeight: 1.15, color: 'var(--deep)', marginBottom: '1.5rem' }}>
            Offrir la Omra à vos parents.<br />
            <em style={{ fontStyle: 'italic', color: 'var(--gold-dark)' }}>Un guide qui prend soin d&apos;eux.</em>
          </h1>
          <p style={{ fontSize: '1.05rem', color: 'var(--muted)', lineHeight: 1.8, marginBottom: '2rem', maxWidth: 580, margin: '0 auto 2rem' }}>
            Ils partent. Vous restez. Ces quelques mots — <strong style={{ color: 'var(--deep)', fontStyle: 'italic' }}>&quot;SVP prenez soin de mes parents&quot;</strong> — vous les direz à leur guide. Et leur guide les prendra.
          </p>
          <Link href="/guides" style={{ display: 'inline-block', background: 'var(--deep)', color: 'var(--gold-light)', padding: '0.9rem 2.2rem', borderRadius: 50, fontWeight: 700, fontSize: '0.9rem', textDecoration: 'none', letterSpacing: '0.04em' }}>
            Trouver un guide pour mes parents
          </Link>
        </section>

        {/* Ce que le guide fait */}
        <section style={{ padding: '4rem 2rem', maxWidth: 900, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
            {[
              {
                icon: '🤲',
                title: 'Il les accompagne pas à pas',
                text: 'De l\'arrivée à l\'aéroport jusqu\'au dernier rite, votre guide est présent à chaque moment. Aucune étape laissée seule, aucune question sans réponse.',
              },
              {
                icon: '📖',
                title: 'Il leur raconte ce qu\'ils n\'ont jamais appris',
                text: 'Ibrahim, Hajar, le Prophète ﷺ — l\'histoire de ces lieux saints racontée sur les lieux mêmes. Vos parents repartiront en ayant appris ce qu\'aucune école ne leur a jamais enseigné.',
              },
              {
                icon: '⏱️',
                title: 'Il adapte le rythme',
                text: 'Pas de course, pas de pression. Le guide ajuste le rythme à leur âge, leur condition, leur énergie. Le voyage de vos parents est unique — il est traité comme tel.',
              },
              {
                icon: '📱',
                title: 'Il vous tient informé',
                text: 'Vous restez en France. Votre guide vous tient au courant. Chaque étape franchie, chaque rituel accompli — vous êtes là, même à distance.',
              },
            ].map((item, i) => (
              <div key={i} style={{ background: 'white', border: '1px solid #EDE8DC', borderRadius: 16, padding: '1.5rem' }}>
                <div style={{ fontSize: '1.8rem', marginBottom: '0.75rem' }}>{item.icon}</div>
                <h3 style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.15rem', fontWeight: 600, color: 'var(--deep)', marginBottom: '0.5rem' }}>{item.title}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--muted)', lineHeight: 1.7 }}>{item.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Citation centrale */}
        <section style={{ padding: '3rem 2rem', maxWidth: 680, margin: '0 auto', textAlign: 'center' }}>
          <blockquote style={{ borderLeft: '3px solid var(--gold)', paddingLeft: '1.5rem', textAlign: 'left', background: '#FAF8F0', borderRadius: '0 14px 14px 0', padding: '1.5rem 1.5rem 1.5rem 2rem' }}>
            <p style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.3rem', fontStyle: 'italic', color: 'var(--deep)', lineHeight: 1.7, marginBottom: '0.75rem' }}>
              &quot;Ma mère n&apos;a jamais été à l&apos;école. Elle savait faire la prière, elle connaissait le Coran. Mais elle ne savait pas où se trouvait la Kaaba sur une carte. Quand elle est rentrée, elle pouvait tout raconter. Tout.&quot;
            </p>
            <cite style={{ fontSize: '0.8rem', color: 'var(--muted)', fontStyle: 'normal', fontWeight: 600 }}>Karim, 34 ans — Lyon</cite>
          </blockquote>
        </section>

        {/* Pourquoi un guide privé vs agence */}
        <section style={{ padding: '3rem 2rem 4rem', maxWidth: 760, margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', fontWeight: 400, color: 'var(--deep)', marginBottom: '2rem', textAlign: 'center' }}>
            Pourquoi un guide privé,<br /><em style={{ fontStyle: 'italic', color: 'var(--gold-dark)' }}>et pas une agence ?</em>
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ background: '#FDECEA', border: '1px solid rgba(192,57,43,0.15)', borderRadius: 14, padding: '1.25rem' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: '#C0392B', marginBottom: '0.75rem' }}>Groupe agence</div>
              {['40 personnes qui n\'attendent pas', 'Guide qui ne connaît pas vos parents', 'Rythme imposé par le groupe', 'Vos parents se sentent perdus', 'Vous ne savez pas ce qui se passe'].map((t, i) => (
                <div key={i} style={{ fontSize: '0.82rem', color: '#7A6D5A', padding: '0.3rem 0', borderBottom: i < 4 ? '1px solid rgba(0,0,0,0.04)' : 'none', display: 'flex', gap: '0.5rem' }}>
                  <span style={{ color: '#C0392B' }}>✕</span> {t}
                </div>
              ))}
            </div>
            <div style={{ background: '#E8F5EE', border: '1px solid rgba(29,92,58,0.15)', borderRadius: 14, padding: '1.25rem' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: 'var(--green)', marginBottom: '0.75rem' }}>Guide privé Safaruma</div>
              {['Disponible uniquement pour vos parents', 'Connaît leur nom, leur histoire, leurs besoins', 'Rythme 100% adapté à eux', 'Ils se sentent accompagnés et en sécurité', 'Vous êtes informé à chaque étape'].map((t, i) => (
                <div key={i} style={{ fontSize: '0.82rem', color: '#1D5C3A', padding: '0.3rem 0', borderBottom: i < 4 ? '1px solid rgba(0,0,0,0.04)' : 'none', display: 'flex', gap: '0.5rem' }}>
                  <span style={{ color: 'var(--green)' }}>✓</span> {t}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section style={{ padding: '3rem 2rem 5rem', maxWidth: 680, margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.8rem', fontWeight: 400, color: 'var(--deep)', marginBottom: '1.5rem', textAlign: 'center' }}>Questions fréquentes</h2>
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '1rem' }}>
            {[
              {
                q: 'Peut-on offrir la Omra à ses parents si on ne les accompagne pas ?',
                a: 'Oui. Vous réservez le guide pour vos parents, et celui-ci les prend en charge dès leur arrivée. Vous restez informé tout au long du voyage.',
              },
              {
                q: 'Mon père a 68 ans et marche lentement — le guide s\'adaptera-t-il ?',
                a: 'Absolument. Nos guides sont formés pour accompagner des personnes âgées. Le rythme est entièrement adapté à votre père, pas l\'inverse.',
              },
              {
                q: 'Mes parents ne parlent que l\'arabe — est-ce un problème ?',
                a: 'Non. Plusieurs de nos guides sont arabophones natifs. Lors de la réservation, vous précisez la langue de vos parents et nous sélectionnons le guide adapté.',
              },
              {
                q: 'Comment je suis tenu informé pendant leur séjour ?',
                a: 'Votre guide vous envoie des nouvelles régulièrement — par WhatsApp, à l\'issue de chaque rituel important. Vous vivez ce voyage avec eux, même à distance.',
              },
            ].map((item, i) => (
              <div key={i} style={{ background: 'white', border: '1px solid #EDE8DC', borderRadius: 14, padding: '1.25rem 1.5rem' }}>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--deep)', marginBottom: '0.4rem' }}>{item.q}</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--muted)', lineHeight: 1.7 }}>{item.a}</div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA final */}
        <section style={{ padding: '4rem 2rem', background: 'var(--deep)', textAlign: 'center' }}>
          <p style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontStyle: 'italic', color: 'var(--gold-light)', marginBottom: '0.75rem' }}>
            &quot;SVP prenez soin de mes parents.&quot;
          </p>
          <p style={{ fontSize: '0.9rem', color: 'rgba(240,216,151,0.6)', marginBottom: '2rem' }}>
            Nos guides l&apos;ont entendu des centaines de fois. Ils savent ce que ça veut dire.
          </p>
          <Link href="/guides" style={{ display: 'inline-block', background: 'var(--gold)', color: 'var(--deep)', padding: '0.9rem 2.2rem', borderRadius: 50, fontWeight: 700, fontSize: '0.9rem', textDecoration: 'none', letterSpacing: '0.04em' }}>
            Trouver un guide pour mes parents
          </Link>
        </section>

      </main>
      <Footer />
    </>
  );
}
