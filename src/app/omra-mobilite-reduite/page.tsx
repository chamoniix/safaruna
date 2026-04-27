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

const OBJECTIONS = [
  {
    peur: 'Je vais ralentir les autres et me sentir un fardeau.',
    reponse: 'Votre guide est là uniquement pour vous. Pas de groupe qui attend, pas de regard. Vous avancez à votre rythme, et votre rythme est le bon.',
  },
  {
    peur: 'La Kaaba est entourée d\'une foule immense — comment faire le tawaf ?',
    reponse: 'La Grande Mosquée dispose d\'un niveau dédié aux fauteuils roulants pour le tawaf. Votre guide connaît les accès, les horaires creux et les zones prioritaires.',
  },
  {
    peur: 'Je ne sais pas si je pourrai faire le sa\'i entre Safa et Marwa.',
    reponse: 'Le couloir du sa\'i est accessible en fauteuil roulant. Des fauteuils de location sont disponibles sur place — votre guide les réserve et vous accompagne sur tout le parcours.',
  },
  {
    peur: 'Le guide ne voudra pas s\'occuper de moi.',
    reponse: 'Nos guides ont accompagné des centaines de pèlerins en situation de handicap. Ils ont choisi ce métier pour vous accompagner, pas pour vous juger.',
  },
];

const COMPETENCES = [
  { title: 'Accès fauteuil roulant', text: 'Entrées dédiées, niveaux accessibles, ascenseurs et rampes — votre guide connaît chaque accès de la Grande Mosquée.' },
  { title: 'Tawaf au niveau −1', text: 'Le niveau souterrain de la Kaaba est réservé aux fauteuils roulants. Votre guide vous y emmène pour les 7 tours.' },
  { title: 'Sa\'i accessible', text: 'Fauteuils de location réservés à l\'avance. Votre guide gère toute la logistique du parcours Safa-Marwa.' },
  { title: 'Horaires stratégiques', text: 'Moins de foule tôt le matin ou après l\'Icha. Votre guide planifie les rituels aux meilleurs créneaux.' },
  { title: 'Médine accessible', text: 'La mosquée du Prophète ﷺ dispose d\'espaces dédiés. Votre guide vous accompagne sur tout le site.' },
  { title: 'Assistance logistique', text: 'Votre guide connaît les démarches pour le fauteuil à l\'aéroport, à l\'hôtel et dans les lieux saints.' },
];

const FAQS = [
  {
    q: 'Peut-on vraiment faire la Omra en fauteuil roulant ?',
    a: 'Oui. La Grande Mosquée de La Mecque dispose d\'aménagements spécifiques : niveau dédié pour le tawaf, ascenseurs, espaces prioritaires. Des milliers de pèlerins en fauteuil roulant accomplissent la Omra chaque année.',
  },
  {
    q: 'Faut-il apporter son propre fauteuil roulant ?',
    a: 'Non. Des fauteuils roulants sont disponibles à la location dans les deux villes saintes. Votre guide organise la réservation à l\'avance pour éviter toute attente.',
  },
  {
    q: 'La fatigue est mon problème principal — est-ce adapté aussi ?',
    a: 'Absolument. Fauteuil, canne, pauses fréquentes — votre guide adapte le rythme et le programme à votre réalité, sans jugement.',
  },
  {
    q: 'Combien de jours prévoir avec mobilité réduite ?',
    a: 'Au minimum 7 jours pour La Mecque et Médine, afin d\'avancer sans fatigue excessive. Votre guide vous conseille selon votre situation.',
  },
];

export default function OmraMobiliteReduitePage() {
  return (
    <>
      <Navbar />
      <style dangerouslySetInnerHTML={{ __html: `
        .mr-hero { padding: 4rem 1.25rem 2.5rem; max-width: 700px; margin: 0 auto; text-align: center; }
        .mr-section { padding: 2.5rem 1.25rem; max-width: 860px; margin: 0 auto; }
        .mr-section-sm { padding: 2rem 1.25rem; max-width: 640px; margin: 0 auto; }
        .mr-competences { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.85rem; }
        .mr-faq { display: flex; flex-direction: column; gap: 0.75rem; }
        .mr-cta { padding: 2.5rem 1.25rem; background: #FAF8F0; border-top: 3px solid var(--gold); text-align: center; }
        @media (max-width: 640px) {
          .mr-hero { padding: 2.5rem 1.25rem 2rem; }
          .mr-section { padding: 2rem 1.25rem; }
          .mr-section-sm { padding: 1.5rem 1.25rem; }
          .mr-competences { grid-template-columns: repeat(2, 1fr); }
          .mr-cta { padding: 2rem 1.25rem; }
        }
        @media (max-width: 420px) {
          .mr-competences { grid-template-columns: 1fr; }
        }
      `}} />
      <main style={{ paddingTop: '4rem', background: 'var(--cream)' }}>

        {/* Hero */}
        <section className="mr-hero">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.3)', padding: '0.3rem 0.9rem', borderRadius: 50, fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--gold-dark)', marginBottom: '1.25rem' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--gold)', display: 'inline-block' }} />
            Ce voyage est le vôtre aussi
          </div>
          <h1 style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: 'clamp(2rem, 5vw, 3.4rem)', fontWeight: 300, lineHeight: 1.15, color: 'var(--deep)', marginBottom: '1.25rem' }}>
            La Omra en fauteuil roulant.<br />
            <em style={{ fontStyle: 'italic', color: 'var(--gold-dark)' }}>Oui, c&apos;est possible.</em>
          </h1>
          <p style={{ fontSize: '1rem', color: 'var(--muted)', lineHeight: 1.75, marginBottom: '1.75rem', maxWidth: 520, margin: '0 auto 1.75rem' }}>
            Beaucoup pensent que leur mobilité réduite les empêche de faire la Omra. Ce n&apos;est pas vrai. Votre guide connaît les accès adaptés et s&apos;assure que vous ne vous sentez jamais un fardeau.
          </p>
          <Link href="/guides" style={{ display: 'inline-block', background: 'var(--deep)', color: 'var(--gold-light)', padding: '0.85rem 2rem', borderRadius: 50, fontWeight: 700, fontSize: '0.88rem', textDecoration: 'none', letterSpacing: '0.04em' }}>
            Trouver un guide adapté
          </Link>
        </section>

        {/* Objections — design card vertically stacked */}
        <section className="mr-section">
          <h2 style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 400, color: 'var(--deep)', marginBottom: '1.25rem', textAlign: 'center' }}>
            Ce que vous craignez.<br />
            <em style={{ fontStyle: 'italic', color: 'var(--gold-dark)' }}>Ce que votre guide gère.</em>
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {OBJECTIONS.map((item, i) => (
              <div key={i} style={{ background: 'white', border: '1px solid #EDE8DC', borderRadius: 14, overflow: 'hidden' }}>
                <div style={{ padding: '0.9rem 1.25rem', background: '#FDF4F3', borderBottom: '1px solid #F5E0DD' }}>
                  <span style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#C0392B', marginRight: '0.5rem' }}>Crainte</span>
                  <span style={{ fontSize: '0.82rem', color: '#7A3A30', fontStyle: 'italic' }}>&quot;{item.peur}&quot;</span>
                </div>
                <div style={{ padding: '0.9rem 1.25rem' }}>
                  <span style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--green)', marginRight: '0.5rem' }}>✓ Réalité</span>
                  <span style={{ fontSize: '0.82rem', color: 'var(--deep)', lineHeight: 1.65 }}>{item.reponse}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Citation */}
        <section className="mr-section-sm">
          <blockquote style={{ borderLeft: '3px solid var(--gold)', background: '#FAF8F0', borderRadius: '0 14px 14px 0', padding: '1.25rem 1.25rem 1.25rem 1.5rem' }}>
            <p style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.2rem', fontStyle: 'italic', color: 'var(--deep)', lineHeight: 1.7, marginBottom: '0.6rem' }}>
              &quot;J&apos;avais peur que personne ne veuille m&apos;accompagner. Mon guide a fait le tawaf entier avec moi, à son rythme — le mien. C&apos;est le voyage le plus important de ma vie.&quot;
            </p>
            <cite style={{ fontSize: '0.78rem', color: 'var(--muted)', fontStyle: 'normal', fontWeight: 600 }}>Fatima, 52 ans — Marseille</cite>
          </blockquote>
        </section>

        {/* Compétences du guide */}
        <section className="mr-section">
          <h2 style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 400, color: 'var(--deep)', marginBottom: '1.25rem', textAlign: 'center' }}>
            Ce que votre guide <em style={{ fontStyle: 'italic', color: 'var(--gold-dark)' }}>maîtrise</em>
          </h2>
          <div className="mr-competences">
            {COMPETENCES.map((item, i) => (
              <div key={i} style={{ background: 'white', border: '1px solid #EDE8DC', borderRadius: 14, padding: '1rem 1.1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.35rem' }}>
                  <span style={{ color: 'var(--gold)', fontWeight: 700, fontSize: '0.9rem' }}>✓</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--deep)' }}>{item.title}</span>
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--muted)', lineHeight: 1.6, margin: 0 }}>{item.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="mr-section-sm">
          <h2 style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.7rem', fontWeight: 400, color: 'var(--deep)', marginBottom: '1.1rem', textAlign: 'center' }}>Questions fréquentes</h2>
          <div className="mr-faq">
            {FAQS.map((item, i) => (
              <div key={i} style={{ background: 'white', border: '1px solid #EDE8DC', borderRadius: 14, padding: '1.1rem 1.25rem' }}>
                <div style={{ fontSize: '0.87rem', fontWeight: 700, color: 'var(--deep)', marginBottom: '0.35rem' }}>{item.q}</div>
                <div style={{ fontSize: '0.81rem', color: 'var(--muted)', lineHeight: 1.65 }}>{item.a}</div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA final — fond clair pour se distinguer du footer */}
        <section className="mr-cta">
          <p style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 400, color: 'var(--deep)', marginBottom: '0.5rem' }}>
            Ce voyage vous appartient.
          </p>
          <p style={{ fontSize: '0.87rem', color: 'var(--muted)', marginBottom: '1.5rem' }}>
            Votre mobilité ne définit pas ce que vous pouvez accomplir.
          </p>
          <Link href="/guides" style={{ display: 'inline-block', background: 'var(--deep)', color: 'var(--gold-light)', padding: '0.85rem 2rem', borderRadius: 50, fontWeight: 700, fontSize: '0.88rem', textDecoration: 'none', letterSpacing: '0.04em' }}>
            Trouver un guide adapté à ma situation
          </Link>
        </section>

      </main>
      <Footer />
    </>
  );
}
