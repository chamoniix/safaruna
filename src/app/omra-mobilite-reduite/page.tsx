import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Omra en fauteuil roulant et mobilité réduite — Guide privé adapté | SAFARUMA',
  description: 'Faire la Omra avec une mobilité réduite ou en fauteuil roulant, c\'est possible. Notre guide privé connaît les accès adaptés, le parcours aménagé, et vous accompagne à chaque étape du tawaf au sa\'i.',
  keywords: [
    'omra fauteuil roulant',
    'omra mobilité réduite',
    'omra handicapé',
    'omra PMR',
    'omra accessible',
    'guide omra mobilité réduite',
    'faire omra fauteuil roulant',
    'omra personne handicapée',
    'tawaf fauteuil roulant',
  ],
  openGraph: {
    title: 'Omra en fauteuil roulant — SAFARUMA',
    description: 'Vous pensez que votre mobilité réduite vous empêche de faire la Omra. Ce voyage est le vôtre aussi.',
    url: 'https://safaruma.com/omra-mobilite-reduite',
    siteName: 'SAFARUMA',
    locale: 'fr_FR',
    type: 'website',
  },
  alternates: {
    canonical: 'https://safaruma.com/omra-mobilite-reduite',
  },
};

export default function OmraMobiliteReduitePage() {
  return (
    <>
      <Navbar />
      <main style={{ paddingTop: '5rem', background: 'var(--cream)' }}>

        {/* Hero */}
        <section style={{ padding: '5rem 2rem 4rem', maxWidth: 760, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.3)', padding: '0.35rem 1rem', borderRadius: 50, fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: 'var(--gold-dark)', marginBottom: '1.5rem' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--gold)', display: 'inline-block' }} />
            Ce voyage est le vôtre aussi
          </div>
          <h1 style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: 'clamp(2.2rem, 5vw, 3.6rem)', fontWeight: 300, lineHeight: 1.15, color: 'var(--deep)', marginBottom: '1.5rem' }}>
            La Omra en fauteuil roulant.<br />
            <em style={{ fontStyle: 'italic', color: 'var(--gold-dark)' }}>Oui, c&apos;est possible.</em>
          </h1>
          <p style={{ fontSize: '1.05rem', color: 'var(--muted)', lineHeight: 1.8, marginBottom: '2rem', maxWidth: 580, margin: '0 auto 2rem' }}>
            Beaucoup pensent que leur mobilité réduite les empêche de faire la Omra. Ce n&apos;est pas vrai. Votre guide connaît les accès adaptés, le parcours aménagé, et s&apos;assure que vous ne vous sentez jamais un fardeau.
          </p>
          <Link href="/guides" style={{ display: 'inline-block', background: 'var(--deep)', color: 'var(--gold-light)', padding: '0.9rem 2.2rem', borderRadius: 50, fontWeight: 700, fontSize: '0.9rem', textDecoration: 'none', letterSpacing: '0.04em' }}>
            Trouver un guide adapté
          </Link>
        </section>

        {/* Ce qui bloque vs ce que le guide fait */}
        <section style={{ padding: '3rem 2rem 4rem', maxWidth: 900, margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 400, color: 'var(--deep)', marginBottom: '2rem', textAlign: 'center' }}>
            Ce que vous craignez.<br />
            <em style={{ fontStyle: 'italic', color: 'var(--gold-dark)' }}>Ce que votre guide gère.</em>
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '1rem' }}>
            {[
              {
                peur: 'Je vais ralentir les autres et me sentir un fardeau',
                reponse: 'Votre guide est là uniquement pour vous. Pas de groupe qui attend, pas de regard. Vous avancez à votre rythme, et votre rythme est le bon.',
              },
              {
                peur: 'La Kaaba est entourée d\'une foule immense — comment je fais le tawaf ?',
                reponse: 'La Grande Mosquée dispose d\'un niveau dédié aux fauteuils roulants pour le tawaf. Votre guide connaît les accès, les horaires creux, et les zones prioritaires.',
              },
              {
                peur: 'Je ne sais pas si je pourrai faire le sa\'i entre Safa et Marwa',
                reponse: 'Le couloir du sa\'i est accessible aux fauteuils roulants. Des fauteuils de location sont disponibles sur place — votre guide les réserve et vous accompagne sur tout le parcours.',
              },
              {
                peur: 'Le guide ne voudra pas s\'occuper de moi',
                reponse: 'Nos guides ont accompagné des centaines de pèlerins en situation de handicap. Ils savent. Ils ont choisi ce métier pour vous accompagner, pas pour vous juger.',
              },
            ].map((item, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: 'white', border: '1px solid #EDE8DC', borderRadius: 16, overflow: 'hidden' }}>
                <div style={{ padding: '1.25rem 1.5rem', borderRight: '1px solid #EDE8DC' }}>
                  <div style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: '#C0392B', marginBottom: '0.5rem' }}>Crainte</div>
                  <p style={{ fontSize: '0.83rem', color: 'var(--muted)', lineHeight: 1.65, fontStyle: 'italic' }}>&quot;{item.peur}&quot;</p>
                </div>
                <div style={{ padding: '1.25rem 1.5rem', background: '#FAF8F0' }}>
                  <div style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: 'var(--green)', marginBottom: '0.5rem' }}>Réalité</div>
                  <p style={{ fontSize: '0.83rem', color: 'var(--deep)', lineHeight: 1.65 }}>{item.reponse}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Citation */}
        <section style={{ padding: '2rem 2rem 3rem', maxWidth: 640, margin: '0 auto' }}>
          <blockquote style={{ borderLeft: '3px solid var(--gold)', background: '#FAF8F0', borderRadius: '0 14px 14px 0', padding: '1.5rem 1.5rem 1.5rem 2rem' }}>
            <p style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.25rem', fontStyle: 'italic', color: 'var(--deep)', lineHeight: 1.75, marginBottom: '0.75rem' }}>
              &quot;J&apos;avais peur que personne ne veuille m&apos;accompagner. Mon guide a fait le tawaf entier avec moi, à son rythme — le mien. C&apos;est le voyage le plus important de ma vie.&quot;
            </p>
            <cite style={{ fontSize: '0.8rem', color: 'var(--muted)', fontStyle: 'normal', fontWeight: 600 }}>Fatima, 52 ans — Marseille</cite>
          </blockquote>
        </section>

        {/* Ce que votre guide sait faire */}
        <section style={{ padding: '3rem 2rem 4rem', maxWidth: 900, margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 400, color: 'var(--deep)', marginBottom: '1.5rem', textAlign: 'center' }}>
            Ce que votre guide <em style={{ fontStyle: 'italic', color: 'var(--gold-dark)' }}>maîtrise</em>
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            {[
              { title: 'Accès fauteuil roulant', text: 'Entrées dédiées de la Grande Mosquée, niveaux accessibles, ascenseurs et rampes — votre guide connaît chaque accès.' },
              { title: 'Tawaf au niveau -1', text: 'Le niveau souterrain de la Kaaba est réservé aux fauteuils roulants. Votre guide vous y emmène et vous accompagne les 7 tours.' },
              { title: 'Sa\'i accessible', text: 'Fauteuils de location disponibles sur place. Votre guide les réserve à l\'avance et gère la logistique du parcours Safa-Marwa.' },
              { title: 'Horaires stratégiques', text: 'Moins de foule tôt le matin ou après l\'Icha. Votre guide planifie les rituels aux meilleurs moments pour vous.' },
              { title: 'Médine accessible', text: 'La mosquée du Prophète ﷺ dispose d\'espaces et d\'accès dédiés. Votre guide vous guide sur tout le site de Médine.' },
              { title: 'Documentation et assistance', text: 'Votre guide connaît les démarches pour le fauteuil roulant à l\'aéroport, l\'hôtel et les lieux saints.' },
            ].map((item, i) => (
              <div key={i} style={{ background: 'white', border: '1px solid #EDE8DC', borderRadius: 14, padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--gold)', fontWeight: 700 }}>✓</span>
                  <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--deep)' }}>{item.title}</span>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--muted)', lineHeight: 1.65 }}>{item.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section style={{ padding: '3rem 2rem 5rem', maxWidth: 680, margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.8rem', fontWeight: 400, color: 'var(--deep)', marginBottom: '1.5rem', textAlign: 'center' }}>Questions fréquentes</h2>
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '1rem' }}>
            {[
              {
                q: 'Peut-on vraiment faire la Omra en fauteuil roulant ?',
                a: 'Oui. La Grande Mosquée de La Mecque dispose d\'aménagements spécifiques pour les personnes en fauteuil roulant : niveau dédié pour le tawaf, ascenseurs, espaces prioritaires. Des milliers de pèlerins en fauteuil roulant accomplissent la Omra chaque année.',
              },
              {
                q: 'Faut-il apporter son propre fauteuil roulant ?',
                a: 'Non, pas obligatoirement. Des fauteuils roulants sont disponibles à la location dans les deux villes saintes. Votre guide peut organiser la réservation à l\'avance pour éviter toute attente.',
              },
              {
                q: 'La fatigue est mon problème principal, pas le fauteuil — est-ce adapté aussi ?',
                a: 'Absolument. Que vous ayez besoin d\'un fauteuil roulant, d\'une canne, ou simplement de pauses fréquentes — votre guide adapte le rythme et le programme à votre réalité, sans jugement.',
              },
              {
                q: 'Combien de jours faut-il prévoir pour une Omra avec mobilité réduite ?',
                a: 'Nous recommandons au minimum 7 jours pour une Omra classique (La Mecque + Médine) afin d\'avoir le temps nécessaire sans fatigue excessive. Votre guide peut vous conseiller selon votre situation spécifique.',
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
            Ce voyage vous appartient.
          </p>
          <p style={{ fontSize: '0.9rem', color: 'rgba(240,216,151,0.6)', marginBottom: '2rem' }}>
            Votre mobilité réduite ne définit pas ce que vous pouvez accomplir.
          </p>
          <Link href="/guides" style={{ display: 'inline-block', background: 'var(--gold)', color: 'var(--deep)', padding: '0.9rem 2.2rem', borderRadius: 50, fontWeight: 700, fontSize: '0.9rem', textDecoration: 'none', letterSpacing: '0.04em' }}>
            Trouver un guide adapté à ma situation
          </Link>
        </section>

      </main>
      <Footer />
    </>
  );
}
