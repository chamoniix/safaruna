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
    description: 'Ils partent. Votre guide privé prend soin d\'eux comme vous le feriez vous-même.',
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
      <style dangerouslySetInnerHTML={{ __html: `
        .op-hero { padding: 4rem 1.25rem 2.5rem; max-width: 700px; margin: 0 auto; text-align: center; }
        .op-section { padding: 2.5rem 1.25rem; max-width: 860px; margin: 0 auto; }
        .op-section-sm { padding: 2rem 1.25rem; max-width: 640px; margin: 0 auto; }
        .op-cta { padding: 2.5rem 1.25rem; background: var(--deep); text-align: center; }
        .op-cards { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; }
        .op-versus { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
        .op-faq { display: flex; flex-direction: column; gap: 0.75rem; }
        @media (max-width: 600px) {
          .op-hero { padding: 2.5rem 1.25rem 2rem; }
          .op-section { padding: 2rem 1.25rem; }
          .op-section-sm { padding: 1.5rem 1.25rem; }
          .op-cta { padding: 2rem 1.25rem; }
          .op-cards { grid-template-columns: 1fr; gap: 0.75rem; }
          .op-versus { grid-template-columns: 1fr; }
        }
      `}} />
      <main style={{ paddingTop: '4rem', background: 'var(--cream)' }}>

        {/* Hero */}
        <section className="op-hero">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.3)', padding: '0.3rem 0.9rem', borderRadius: 50, fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--gold-dark)', marginBottom: '1.25rem' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--gold)', display: 'inline-block' }} />
            Le plus beau cadeau
          </div>
          <h1 style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: 'clamp(2rem, 5vw, 3.4rem)', fontWeight: 300, lineHeight: 1.15, color: 'var(--deep)', marginBottom: '1.25rem' }}>
            Offrir la Omra à vos parents.<br />
            <em style={{ fontStyle: 'italic', color: 'var(--gold-dark)' }}>Un guide qui prend soin d&apos;eux.</em>
          </h1>
          <p style={{ fontSize: '1rem', color: 'var(--muted)', lineHeight: 1.75, marginBottom: '1.75rem', maxWidth: 520, margin: '0 auto 1.75rem' }}>
            Ils font ce voyage. Vous ne les accompagnez pas. Ces quelques mots — <strong style={{ color: 'var(--deep)', fontStyle: 'italic' }}>&quot;SVP prenez soin de mes parents&quot;</strong> — vous les direz à leur guide. Et leur guide les prendra.
          </p>
          <Link href="/guides" style={{ display: 'inline-block', background: 'var(--deep)', color: 'var(--gold-light)', padding: '0.85rem 2rem', borderRadius: 50, fontWeight: 700, fontSize: '0.88rem', textDecoration: 'none', letterSpacing: '0.04em' }}>
            Trouver un guide pour mes parents
          </Link>
        </section>

        {/* Ce que le guide fait */}
        <section className="op-section">
          <div className="op-cards">
            {[
              {
                icon: '🤲',
                title: 'Il les accompagne pas à pas',
                text: 'De l\'arrivée jusqu\'au dernier rite, votre guide est présent à chaque moment. Aucune étape laissée seule, aucune question sans réponse.',
              },
              {
                icon: '📖',
                title: 'Il leur raconte ce qu\'ils n\'ont jamais appris',
                text: 'Ibrahim, Hajar, le Prophète ﷺ — l\'histoire de ces lieux saints racontée sur les lieux mêmes. Vos parents repartiront en ayant compris ce qu\'aucune école ne leur a enseigné.',
              },
              {
                icon: '⏱️',
                title: 'Il adapte le rythme',
                text: 'Pas de course, pas de pression. Le guide ajuste le rythme à leur âge, leur condition, leur énergie. Leur voyage est unique — il est traité comme tel.',
              },
              {
                icon: '📱',
                title: 'Il vous tient informé',
                text: 'Où que vous soyez dans le monde, votre guide vous tient au courant. Chaque étape franchie, chaque rituel accompli — vous êtes là, même à distance.',
              },
            ].map((item, i) => (
              <div key={i} style={{ background: 'white', border: '1px solid #EDE8DC', borderRadius: 14, padding: '1.25rem' }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '0.6rem' }}>{item.icon}</div>
                <h3 style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.1rem', fontWeight: 600, color: 'var(--deep)', marginBottom: '0.4rem' }}>{item.title}</h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--muted)', lineHeight: 1.65, margin: 0 }}>{item.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Citation */}
        <section className="op-section-sm">
          <blockquote style={{ borderLeft: '3px solid var(--gold)', background: '#FAF8F0', borderRadius: '0 14px 14px 0', padding: '1.25rem 1.25rem 1.25rem 1.5rem' }}>
            <p style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.2rem', fontStyle: 'italic', color: 'var(--deep)', lineHeight: 1.7, marginBottom: '0.6rem' }}>
              &quot;Ma mère n&apos;a jamais été à l&apos;école. Quand elle est rentrée, elle pouvait tout raconter sur La Mecque et Médine. Tout.&quot;
            </p>
            <cite style={{ fontSize: '0.78rem', color: 'var(--muted)', fontStyle: 'normal', fontWeight: 600 }}>Karim, 34 ans — Lyon</cite>
          </blockquote>
        </section>

        {/* Pourquoi un guide privé vs agence */}
        <section className="op-section">
          <h2 style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 400, color: 'var(--deep)', marginBottom: '1.25rem', textAlign: 'center' }}>
            Pourquoi un guide privé,<br /><em style={{ fontStyle: 'italic', color: 'var(--gold-dark)' }}>et pas une agence ?</em>
          </h2>
          <div className="op-versus">
            <div style={{ background: '#FDECEA', border: '1px solid rgba(192,57,43,0.15)', borderRadius: 14, padding: '1.1rem' }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#C0392B', marginBottom: '0.65rem' }}>Groupe agence</div>
              {['40 personnes qui n\'attendent pas', 'Guide qui ne connaît pas vos parents', 'Rythme imposé par le groupe', 'Vos parents se sentent perdus', 'Vous ne savez pas ce qui se passe'].map((t, i) => (
                <div key={i} style={{ fontSize: '0.8rem', color: '#7A6D5A', padding: '0.25rem 0', borderBottom: i < 4 ? '1px solid rgba(0,0,0,0.05)' : 'none', display: 'flex', gap: '0.4rem' }}>
                  <span style={{ color: '#C0392B', flexShrink: 0 }}>✕</span> {t}
                </div>
              ))}
            </div>
            <div style={{ background: '#E8F5EE', border: '1px solid rgba(29,92,58,0.15)', borderRadius: 14, padding: '1.1rem' }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--green)', marginBottom: '0.65rem' }}>Guide privé Safaruma</div>
              {['Disponible uniquement pour vos parents', 'Connaît leur nom, leur histoire, leurs besoins', 'Rythme 100% adapté à eux', 'Ils se sentent accompagnés et en sécurité', 'Vous êtes informé à chaque étape'].map((t, i) => (
                <div key={i} style={{ fontSize: '0.8rem', color: '#1D5C3A', padding: '0.25rem 0', borderBottom: i < 4 ? '1px solid rgba(0,0,0,0.05)' : 'none', display: 'flex', gap: '0.4rem' }}>
                  <span style={{ color: 'var(--green)', flexShrink: 0 }}>✓</span> {t}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="op-section-sm">
          <h2 style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.7rem', fontWeight: 400, color: 'var(--deep)', marginBottom: '1.1rem', textAlign: 'center' }}>Questions fréquentes</h2>
          <div className="op-faq">
            {[
              {
                q: 'Peut-on offrir la Omra à ses parents sans les accompagner ?',
                a: 'Oui. Vous réservez le guide pour vos parents, et celui-ci les prend en charge dès leur arrivée. Vous êtes informé à chaque étape, où que vous soyez.',
              },
              {
                q: 'Mon père a 68 ans et marche lentement — le guide s\'adaptera-t-il ?',
                a: 'Absolument. Le rythme est entièrement adapté à votre père, pas l\'inverse. Nos guides sont habitués à accompagner des personnes âgées.',
              },
              {
                q: 'Mes parents ne parlent que l\'arabe — est-ce un problème ?',
                a: 'Non. Plusieurs de nos guides sont arabophones natifs. Vous précisez la langue lors de la réservation et nous sélectionnons le guide adapté.',
              },
              {
                q: 'Comment je suis tenu informé pendant leur séjour ?',
                a: 'Votre guide vous envoie des nouvelles régulièrement par WhatsApp à chaque rituel important. Vous vivez ce voyage avec eux, même à distance.',
              },
            ].map((item, i) => (
              <div key={i} style={{ background: 'white', border: '1px solid #EDE8DC', borderRadius: 14, padding: '1.1rem 1.25rem' }}>
                <div style={{ fontSize: '0.87rem', fontWeight: 700, color: 'var(--deep)', marginBottom: '0.35rem' }}>{item.q}</div>
                <div style={{ fontSize: '0.81rem', color: 'var(--muted)', lineHeight: 1.65 }}>{item.a}</div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA final */}
        <section className="op-cta">
          <p style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: 'clamp(1.3rem, 3vw, 1.9rem)', fontStyle: 'italic', color: 'var(--gold-light)', marginBottom: '0.5rem' }}>
            &quot;SVP prenez soin de mes parents.&quot;
          </p>
          <p style={{ fontSize: '0.87rem', color: 'rgba(240,216,151,0.6)', marginBottom: '1.75rem' }}>
            Nos guides l&apos;ont entendu des centaines de fois. Ils savent ce que ça veut dire.
          </p>
          <Link href="/guides" style={{ display: 'inline-block', background: 'var(--gold)', color: 'var(--deep)', padding: '0.85rem 2rem', borderRadius: 50, fontWeight: 700, fontSize: '0.88rem', textDecoration: 'none', letterSpacing: '0.04em' }}>
            Trouver un guide pour mes parents
          </Link>
        </section>

      </main>
      <Footer />
    </>
  );
}
