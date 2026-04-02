import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollReveal from "@/components/ScrollReveal";

export const metadata = {
  title: "À propos de SAFARUNA — Notre histoire, notre mission",
  description: "SAFARUNA est née d'une conviction : chaque pèlerin francophone mérite un guide privé qui parle sa langue et connaît chaque pierre des Lieux Saints.",
};

const VALUES = [
  {
    icon: '🕋',
    title: 'Authenticité spirituelle',
    desc: "Nous ne faisons aucun compromis sur les rituels. Chaque guide est certifié mutawwif et guidé par une connaissance islamique profonde.",
  },
  {
    icon: '🗣️',
    title: 'Langue maternelle',
    desc: "L'Omra se vit pleinement quand on comprend ce qu'on accomplit. Nos guides expliquent chaque geste dans ta langue, avec tes mots.",
  },
  {
    icon: '👨‍👩‍👧',
    title: 'Accompagnement humain',
    desc: "Pas de groupes de 40 personnes. Ton guide t'accompagne toi et ta famille — avec patience, disponibilité et bienveillance.",
  },
  {
    icon: '🔍',
    title: 'Transparence totale',
    desc: "Prix clairs, profils vérifiés, avis authentiques. Aucune surprise, aucune commission cachée, aucune promesse non tenue.",
  },
  {
    icon: '🌍',
    title: 'Diversité linguistique',
    desc: "Français, Darija, Wolof, Bambara, Turc, Anglais… Chaque communauté mérite un guide qui comprend sa culture et son histoire.",
  },
  {
    icon: '♿',
    title: 'Accessibilité universelle',
    desc: "L'Omra doit être accessible à tous — personnes âgées, PMR, familles avec nourrissons. Nous avons des guides spécialisés pour chacun.",
  },
];

const TEAM = [
  {
    initials: 'AK',
    name: 'Amine Khalidi',
    role: 'Co-fondateur & CEO',
    bio: "Ancien pèlerin déçu par son expérience en groupe, Amine a décidé de créer la plateforme qu'il aurait voulu trouver. Diplômé d'HEC Paris, il a travaillé 8 ans dans la fintech avant de lancer SAFARUNA.",
    gradient: 'linear-gradient(135deg, #F0D897, #C9A84C)',
  },
  {
    initials: 'SK',
    name: 'Soukaïna Kettani',
    role: 'Co-fondatrice & Head of Guides',
    bio: "Ancienne directrice de l'Institut Islamique de Lyon, Soukaïna gère le processus de certification des guides. Elle a elle-même effectué 9 Omra et un Hajj.",
    gradient: 'linear-gradient(135deg, #9FE1CB, #1D9E75)',
  },
  {
    initials: 'MO',
    name: 'Mohammed Ouazzani',
    role: 'CTO & Co-fondateur',
    bio: "Ingénieur logiciel avec 12 ans d'expérience chez des scale-ups parisiens. Mohammed a construit l'intégralité de la plateforme avec une obsession : la performance et la simplicité.",
    gradient: 'linear-gradient(135deg, #A8C8F0, #1A4A8A)',
  },
];

const MILESTONES = [
  { year: '2021', event: "Première idée : Amine revient d'une Omra décevante dans un groupe de 45 personnes. Il commence à imaginer SAFARUNA." },
  { year: '2022', event: "L'équipe fondatrice se constitue à Paris. Premiers entretiens avec 30 guides à Makkah et Madinah." },
  { year: '2023', event: "Lancement en version bêta avec 12 guides pionniers. 500 pèlerins accompagnés la première saison." },
  { year: '2024', event: "120 guides certifiés. Ouverture des guides femmes avec Fatima Al-Omari comme première ambassadrice." },
  { year: '2025', event: "320 guides actifs. 14 000 pèlerins accompagnés. Lancement de l'Academy et du carnet de Du'a numérique." },
  { year: '2026', event: "Expansion vers le Hajj, le Maroc et les circuits historiques d'Al-Andalus. Certification ISO en cours." },
];

export default function AProposPage() {
  return (
    <>
      <Navbar />
      <ScrollReveal />

      {/* ─── HERO ─────────────────────────────────────────────────────────────── */}
      <section style={{
        background: 'var(--deep)',
        paddingTop: '9rem', paddingBottom: '6rem',
        paddingLeft: '4rem', paddingRight: '4rem',
        position: 'relative', overflow: 'hidden',
        textAlign: 'center',
      }}>
        {/* Ambient radial glow */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse 70% 80% at 50% 0%, rgba(201,168,76,0.13) 0%, transparent 65%)',
        }} />
        {/* Arabic watermark */}
        <div style={{
          position: 'absolute', top: '5%', left: '50%', transform: 'translateX(-50%)',
          fontFamily: 'var(--font-cormorant, serif)',
          fontSize: 'clamp(8rem, 25vw, 18rem)',
          color: 'rgba(201,168,76,0.04)',
          lineHeight: 1, pointerEvents: 'none', userSelect: 'none',
          direction: 'rtl', zIndex: 0,
        }}>
          سفرنا
        </div>

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 760, margin: '0 auto' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.25)',
            padding: '0.35rem 1rem', borderRadius: 50, marginBottom: '1.5rem',
            fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.12em',
            textTransform: 'uppercase', color: 'var(--gold)',
            animation: 'fadeInUp 0.7s ease both',
          }}>
            Notre histoire
          </div>
          <h1 style={{
            fontFamily: 'var(--font-cormorant, serif)',
            fontSize: 'clamp(2.5rem, 5vw, 4rem)',
            fontWeight: 300, color: 'white', lineHeight: 1.1,
            marginBottom: '1.5rem',
            animation: 'fadeInUp 0.8s 0.15s ease both', opacity: 0,
          }}>
            SAFARUNA est née d&apos;une<br />
            <em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>Omra manquée.</em>
          </h1>
          <p style={{
            color: 'rgba(255,255,255,0.65)', fontSize: '1.05rem',
            lineHeight: 1.85, maxWidth: 600, margin: '0 auto',
            animation: 'fadeInUp 0.8s 0.3s ease both', opacity: 0,
          }}>
            En 2021, notre co-fondateur Amine est revenu de son premier pèlerinage avec un sentiment de frustration. 45 personnes dans un bus, un guide pressé, des rituels expliqués en arabe uniquement, et une connexion spirituelle manquée. C&apos;est de cette frustration qu&apos;est née la conviction : <strong style={{ color: 'var(--gold-light)' }}>chaque pèlerin mérite mieux.</strong>
          </p>
        </div>
      </section>

      {/* ─── MISSION ──────────────────────────────────────────────────────────── */}
      <section style={{ padding: '6rem 4rem', background: 'var(--cream)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5rem', alignItems: 'center' }}>
          <div>
            <div className="section-label reveal">Notre mission</div>
            <h2 className="reveal reveal-d1" style={{ marginBottom: '1.5rem' }}>
              Rendre l&apos;Omra <em>spirituellement accessible</em> à tous les francophones
            </h2>
            <p className="reveal reveal-d2" style={{ color: 'var(--muted)', lineHeight: 1.85, marginBottom: '1.5rem', fontSize: '0.95rem' }}>
              Des millions de musulmans francophones effectuent chaque année leur Omra sans vraiment comprendre ce qu&apos;ils accomplissent. La barrière de la langue, la pression des groupes organisés et le manque de transmission transforment souvent ce voyage sacré en excursion touristique.
            </p>
            <p className="reveal reveal-d3" style={{ color: 'var(--muted)', lineHeight: 1.85, fontSize: '0.95rem' }}>
              SAFARUNA connecte ces pèlerins avec des guides privés qui parlent leur langue, connaissent leur culture et ont dédié leur vie à transmettre la profondeur des Lieux Saints. Notre mission : que chaque pèlerin revienne transformé.
            </p>
          </div>
          <div className="reveal" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {[
              { n: '320+', l: 'Guides certifiés' },
              { n: '14 000+', l: 'Pèlerins accompagnés' },
              { n: '4.97★', l: 'Note moyenne' },
              { n: '12', l: 'Langues couvertes' },
              { n: '98%', l: 'Satisfaction' },
              { n: '2021', l: 'Année de création' },
            ].map(s => (
              <div key={s.l} style={{
                background: 'white', border: '1px solid var(--sand)',
                borderRadius: 16, padding: '1.25rem',
                textAlign: 'center',
              }}>
                <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.8rem', fontWeight: 700, color: 'var(--deep)', lineHeight: 1 }}>{s.n}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '0.4rem' }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── VALEURS ──────────────────────────────────────────────────────────── */}
      <section style={{ background: 'white', padding: '6rem 4rem', borderTop: '1px solid var(--sand)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div className="section-label reveal" style={{ textAlign: 'center' }}>Ce en quoi nous croyons</div>
          <h2 className="reveal reveal-d1" style={{ textAlign: 'center', marginBottom: '0.75rem' }}>
            Nos <em>valeurs fondatrices</em>
          </h2>
          <p className="reveal reveal-d2" style={{ textAlign: 'center', color: 'var(--muted)', maxWidth: 540, margin: '0 auto 3.5rem', lineHeight: 1.75, fontSize: '0.9rem' }}>
            Ces convictions guident chaque décision que nous prenons — du recrutement des guides à la conception de la plateforme.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {VALUES.map((v, i) => (
              <div key={v.title} className={`reveal reveal-d${(i % 3) + 1}`} style={{
                background: 'var(--cream)', borderRadius: 16, padding: '2rem',
                border: '1px solid var(--sand)',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>{v.icon}</div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.6rem', color: 'var(--deep)' }}>{v.title}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--muted)', lineHeight: 1.75 }}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── STORY TIMELINE ────────────────────────────────────────────────────── */}
      <section style={{ background: 'var(--deep)', padding: '6rem 4rem' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div className="section-label reveal" style={{ color: 'var(--gold)', textAlign: 'center' }}>Notre parcours</div>
          <h2 className="reveal reveal-d1" style={{ color: 'white', textAlign: 'center', marginBottom: '3.5rem' }}>
            De l&apos;idée à la <em>réalité</em>
          </h2>
          <div style={{ position: 'relative' }}>
            {/* Vertical line */}
            <div style={{
              position: 'absolute', left: '50%', top: 0, bottom: 0,
              width: 1, background: 'rgba(201,168,76,0.2)', transform: 'translateX(-50%)',
            }} />
            {MILESTONES.map((m, i) => (
              <div key={m.year} className={`reveal reveal-d${(i % 3) + 1}`} style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr',
                gap: '2rem', marginBottom: '2.5rem',
                textAlign: i % 2 === 0 ? 'right' : 'left',
                direction: i % 2 === 0 ? 'rtl' : 'ltr',
              }}>
                <div>
                  <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '2rem', fontWeight: 700, color: 'var(--gold)', lineHeight: 1, marginBottom: '0.4rem' }}>{m.year}</div>
                  <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.88rem', lineHeight: 1.75, direction: 'ltr', textAlign: 'left' }}>{m.event}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: i % 2 === 0 ? 'flex-start' : 'flex-end', paddingTop: '0.3rem' }}>
                  <div style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--gold)', border: '3px solid var(--deep)', boxShadow: '0 0 0 3px rgba(201,168,76,0.3)' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TEAM ─────────────────────────────────────────────────────────────── */}
      <section style={{ background: 'var(--cream)', padding: '6rem 4rem' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div className="section-label reveal" style={{ textAlign: 'center' }}>L&apos;équipe fondatrice</div>
          <h2 className="reveal reveal-d1" style={{ textAlign: 'center', marginBottom: '0.75rem' }}>
            Ceux qui ont <em>tout quitté</em> pour SAFARUNA
          </h2>
          <p className="reveal reveal-d2" style={{ textAlign: 'center', color: 'var(--muted)', maxWidth: 520, margin: '0 auto 3.5rem', lineHeight: 1.75, fontSize: '0.9rem' }}>
            Trois croyants convaincus que la technologie peut servir la spiritualité — sans jamais la trahir.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
            {TEAM.map((m, i) => (
              <div key={m.name} className={`reveal reveal-d${i + 1}`} style={{
                background: 'white', borderRadius: 20, padding: '2rem',
                border: '1px solid var(--sand)',
                boxShadow: '0 4px 20px rgba(26,18,9,0.04)',
              }}>
                <div style={{
                  width: 72, height: 72, borderRadius: '50%',
                  background: m.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.6rem', fontWeight: 700, color: 'var(--deep)',
                  marginBottom: '1.25rem',
                  boxShadow: '0 8px 24px rgba(26,18,9,0.1)',
                }}>
                  {m.initials}
                </div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--deep)', marginBottom: '0.2rem' }}>{m.name}</h3>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--gold-dark)', marginBottom: '1rem' }}>{m.role}</div>
                <p style={{ fontSize: '0.85rem', color: 'var(--muted)', lineHeight: 1.75 }}>{m.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── MANIFESTO ────────────────────────────────────────────────────────── */}
      <section style={{ background: 'var(--sand)', padding: '5rem 4rem', textAlign: 'center' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '2.5rem', color: 'rgba(201,168,76,0.5)', marginBottom: '1rem', direction: 'rtl' }}>
            ❝
          </div>
          <blockquote className="reveal" style={{
            fontFamily: 'var(--font-cormorant, serif)',
            fontSize: 'clamp(1.3rem, 2.5vw, 1.9rem)',
            fontWeight: 300, fontStyle: 'italic',
            color: 'var(--deep)', lineHeight: 1.5,
            margin: '0 0 1.5rem',
          }}>
            Nous croyons que comprendre un lieu sacré, c&apos;est le vivre deux fois — une fois avec ses pieds, et une fois avec son cœur.
          </blockquote>
          <p className="reveal reveal-d1" style={{ color: 'var(--muted)', fontSize: '0.85rem', fontWeight: 600 }}>
            — Le manifeste SAFARUNA, 2021
          </p>
        </div>
      </section>

      {/* ─── CTA ──────────────────────────────────────────────────────────────── */}
      <section className="cta-section">
        <h2 className="reveal" style={{ color: 'white' }}>
          Prêt à vivre <em style={{ color: 'var(--gold)' }}>ton Omra différemment ?</em>
        </h2>
        <p className="reveal reveal-d1" style={{ color: 'rgba(255,255,255,0.5)', maxWidth: 460, margin: '1rem auto 2.5rem', lineHeight: 1.8 }}>
          Rejoins des milliers de pèlerins francophones qui ont vécu une Omra privée, profonde et inoubliable.
        </p>
        <div className="reveal reveal-d2" style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/guides" className="btn-primary" style={{ background: 'var(--gold)', color: 'var(--deep)', fontWeight: 700 }}>
            Trouver mon guide →
          </Link>
          <Link href="/guide/inscription" className="btn-secondary" style={{ borderColor: 'rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.7)' }}>
            Devenir guide
          </Link>
        </div>
      </section>

      <Footer />
    </>
  );
}
