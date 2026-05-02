import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollReveal from "@/components/ScrollReveal";
import NewsletterForm from "@/components/NewsletterForm";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog — Hajj, Omra & lieux saints — SAFARUMA',
  description: 'Actualités Hajj 2026, histoire des lieux saints, guides pratiques pour la Omra et témoignages de pèlerins francophones.',
  alternates: { canonical: 'https://safaruma.com/blog' },
};

export const ARTICLES = [
  {
    slug: 'comment-preparer-omra-10-etapes',
    category: 'Préparation',
    categoryColor: '#1D5C3A',
    categoryBg: 'rgba(29,92,58,0.1)',
    title: 'Comment préparer son Omra en 10 étapes',
    excerpt: "De l'intention à l'atterrissage : le guide complet pour que rien ne soit laissé au hasard. Visa, ihram, rituels, santé, spiritualité — 10 étapes pour une Omra sereine.",
    readTime: '10 min',
    date: '28 mars 2026',
    author: 'Fatima Al-Omari',
    authorRole: 'Guide certifiée · Makkah',
    featured: true,
  },
  {
    slug: 'les-7-tours-du-tawaf',
    category: 'Spiritualité',
    categoryColor: '#5A2D82',
    categoryBg: 'rgba(90,45,130,0.1)',
    title: 'Les 7 tours du Tawaf : sens et spiritualité',
    excerpt: "Pourquoi 7 tours ? Quel est le sens de chaque passage devant la Pierre Noire ? Ce que les savants disent de ce rite millénaire et comment le vivre de l'intérieur.",
    readTime: '8 min',
    date: '20 mars 2026',
    author: 'Abdullah Ben Yusuf',
    authorRole: 'Docteur en Sciences Islamiques · Madinah',
    featured: false,
  },
  {
    slug: 'jabal-uhud-bataille-islam',
    category: 'Histoire',
    categoryColor: '#8B2A1A',
    categoryBg: 'rgba(139,42,26,0.1)',
    title: 'Jabal Uhud : la bataille qui a forgé l\'Islam',
    excerpt: "Le mont Uhud n'est pas qu'une montagne. C'est le lieu où le Prophète ﷺ a pleuré ses compagnons tombés. L'histoire, la géographie, la visite — tout ce qu'il faut savoir.",
    readTime: '9 min',
    date: '12 mars 2026',
    author: 'Rachid Al-Madani',
    authorRole: 'Guide certifié · Makkah & Madinah',
    featured: false,
  },
  {
    slug: 'guide-visa-omra-2025',
    category: 'Visa & Pratique',
    categoryColor: '#1A4A8A',
    categoryBg: 'rgba(26,74,138,0.1)',
    title: 'Guide pratique du visa Omra 2025',
    excerpt: "Nouveau système Nusuk, délais, documents exigés, erreurs à éviter : tout ce qui a changé pour les ressortissants francophones qui souhaitent obtenir leur visa Omra.",
    readTime: '7 min',
    date: '5 mars 2026',
    author: 'Youssouf Konaté',
    authorRole: 'Guide certifié · Madinah',
    featured: false,
  },
  {
    slug: 'difference-omra-hajj',
    category: 'Éducation',
    categoryColor: '#8B6914',
    categoryBg: 'rgba(201,168,76,0.1)',
    title: 'Quelle est la différence entre Omra et Hajj ?',
    excerpt: "Obligatoire ou facultatif ? Quels rituels sont partagés, lesquels sont propres au Hajj ? Une explication claire, fondée sur les textes, pour mieux comprendre les deux grands pèlerinages.",
    readTime: '6 min',
    date: '25 février 2026',
    author: 'Samira Al-Rashidi',
    authorRole: 'Guide certifiée · Makkah',
    featured: false,
  },
];

export default function BlogPage() {
  const [featured, ...rest] = ARTICLES;

  return (
    <>
      <Navbar transparentOnHero scrollThreshold={300} />
      <ScrollReveal />
      <style dangerouslySetInnerHTML={{ __html: `
        .blog-hero-section { padding: 8rem 4rem 5rem; }
        .blog-featured-section { padding: 4rem 4rem 2rem; }
        .blog-grid-section { padding: 2rem 4rem 5rem; }
        .blog-newsletter-section { padding: 4rem; }
        .blog-featured-card { display: grid; grid-template-columns: 1fr 1fr; }
        .blog-featured-left { padding: 4rem; min-height: 320px; }
        @media (max-width: 768px) {
          .blog-hero-section { padding: 6rem 1.25rem 3rem; }
          .blog-featured-section { padding: 2rem 1.25rem 1rem; }
          .blog-grid-section { padding: 1.5rem 1.25rem 3rem; }
          .blog-newsletter-section { padding: 3rem 1.25rem; }
          .blog-featured-card { grid-template-columns: 1fr; }
          .blog-featured-left { padding: 2rem; min-height: 180px; }
        }
      `}} />

      {/* HERO */}
      <section className="blog-hero-section" style={{
        background: 'var(--deep)', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 60% 70% at 50% 0%, rgba(201,168,76,0.11) 0%, transparent 60%)', pointerEvents: 'none' }} />
        {/* Arabic watermark */}
        <div style={{ position: 'absolute', right: '5%', bottom: '5%', fontFamily: 'var(--font-cormorant, serif)', fontSize: 'clamp(6rem, 20vw, 14rem)', color: 'rgba(201,168,76,0.04)', lineHeight: 1, pointerEvents: 'none', userSelect: 'none', direction: 'rtl', zIndex: 0 }}>
          علم
        </div>
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.25)', padding: '0.35rem 1rem', borderRadius: 50, marginBottom: '1.5rem', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--gold)', animation: 'fadeInUp 0.7s ease both' }}>
            📖 Blog SAFARUMA
          </div>
          <h1 style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 300, color: 'white', lineHeight: 1.1, marginBottom: '1.25rem', animation: 'fadeInUp 0.8s 0.15s ease both', opacity: 0, maxWidth: 700 }}>
            La connaissance est le plus beau<br />
            <em style={{ color: 'var(--gold)' }}>cadeau du pèlerinage.</em>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.95rem', lineHeight: 1.85, maxWidth: 520, animation: 'fadeInUp 0.8s 0.3s ease both', opacity: 0 }}>
            Articles écrits par nos guides certifiés pour vous aider à préparer, comprendre et vivre pleinement votre Omra.
          </p>
        </div>
      </section>

      {/* FEATURED ARTICLE */}
      <section className="blog-featured-section" style={{ background: 'var(--cream)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div className="section-label reveal">À la une</div>
          <Link href={`/blog/${featured.slug}`} style={{ textDecoration: 'none' }}>
            <div className="reveal reveal-d1 blog-featured-card" style={{
              background: 'white', borderRadius: 24, overflow: 'hidden',
              border: '1px solid var(--sand)', gap: 0,
              boxShadow: '0 8px 40px rgba(26,18,9,0.06)',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}>
              {/* Left: visual */}
              <div className="blog-featured-left" style={{
                background: 'linear-gradient(135deg, var(--deep) 0%, #2D1F08 100%)',
                position: 'relative', overflow: 'hidden',
                display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
              }}>
                <div style={{ position: 'absolute', top: '1rem', right: '1.5rem', fontFamily: 'var(--font-cormorant, serif)', fontSize: '8rem', color: 'rgba(201,168,76,0.1)', lineHeight: 1, direction: 'rtl', userSelect: 'none' }}>
                  مرشد
                </div>
                <span style={{ display: 'inline-block', background: featured.categoryBg, color: featured.categoryColor, border: `1px solid ${featured.categoryColor}30`, fontSize: '0.62rem', fontWeight: 800, letterSpacing: '0.1em', padding: '0.25rem 0.7rem', borderRadius: 50, marginBottom: '1rem', textTransform: 'uppercase' }}>
                  {featured.category}
                </span>
                <h2 style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.8rem', fontWeight: 400, color: 'white', lineHeight: 1.2, marginBottom: 0 }}>
                  {featured.title}
                </h2>
              </div>
              {/* Right: content */}
              <div style={{ padding: '3rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ color: 'var(--muted)', lineHeight: 1.8, marginBottom: '2rem', fontSize: '0.92rem' }}>{featured.excerpt}</p>
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingTop: '1.5rem', borderTop: '1px solid var(--sand)' }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #F0D897, #C9A84C)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-cormorant, serif)', fontWeight: 700, color: 'var(--deep)', fontSize: '0.9rem', flexShrink: 0 }}>
                      {featured.author.split(' ').map(w => w[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--deep)' }}>{featured.author}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>{featured.date} · {featured.readTime} de lecture</div>
                    </div>
                    <div style={{ marginLeft: 'auto', background: 'var(--deep)', color: 'var(--gold-light)', padding: '0.5rem 1.25rem', borderRadius: 50, fontSize: '0.78rem', fontWeight: 700 }}>
                      Lire →
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* ARTICLES GRID */}
      <section className="blog-grid-section" style={{ background: 'var(--cream)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div className="section-label reveal">Tous les articles</div>
          <h2 className="reveal reveal-d1" style={{ marginBottom: '2.5rem' }}>
            Nos <em>derniers articles</em>
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {rest.map((article, i) => (
              <Link key={article.slug} href={`/blog/${article.slug}`} style={{ textDecoration: 'none' }}>
                <div className={`reveal reveal-d${(i % 3) + 1}`} style={{
                  background: 'white', borderRadius: 20, overflow: 'hidden',
                  border: '1px solid var(--sand)', height: '100%',
                  display: 'flex', flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  boxShadow: '0 2px 12px rgba(26,18,9,0.04)',
                }}>
                  {/* Card header */}
                  <div style={{
                    background: 'linear-gradient(135deg, var(--deep) 0%, #2D1F08 100%)',
                    padding: '2rem', minHeight: 120,
                    display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
                    position: 'relative', overflow: 'hidden',
                  }}>
                    <div style={{ position: 'absolute', top: '0.5rem', right: '1rem', fontFamily: 'var(--font-cormorant, serif)', fontSize: '4rem', color: 'rgba(201,168,76,0.08)', lineHeight: 1, direction: 'rtl', userSelect: 'none' }}>
                      {['🕌', '⛰️', '📜', '✈️'][i]}
                    </div>
                    <span style={{ display: 'inline-block', background: article.categoryBg, color: article.categoryColor, border: `1px solid ${article.categoryColor}30`, fontSize: '0.6rem', fontWeight: 800, letterSpacing: '0.1em', padding: '0.2rem 0.6rem', borderRadius: 50, textTransform: 'uppercase', alignSelf: 'flex-start' }}>
                      {article.category}
                    </span>
                  </div>
                  {/* Content */}
                  <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--deep)', lineHeight: 1.4, marginBottom: '0.75rem' }}>{article.title}</h3>
                    <p style={{ fontSize: '0.82rem', color: 'var(--muted)', lineHeight: 1.7, flex: 1 }}>{article.excerpt}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--sand)' }}>
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--sand)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, color: 'var(--warm)', flexShrink: 0 }}>
                        {article.author.split(' ').map(w => w[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--deep)' }}>{article.author}</div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--muted)' }}>{article.date} · {article.readTime}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Newsletter */}
      <section className="blog-newsletter-section" style={{ background: 'var(--sand)', textAlign: 'center' }}>
        <div style={{ maxWidth: 540, margin: '0 auto' }}>
          <h2 className="reveal" style={{ marginBottom: '0.75rem' }}>
            Recevez nos articles <em>chaque semaine</em>
          </h2>
          <p className="reveal reveal-d1" style={{ color: 'var(--muted)', lineHeight: 1.75, marginBottom: '2rem', fontSize: '0.9rem' }}>
            Conseils spirituels, guides pratiques et actualités des Lieux Saints — directement dans votre boîte mail.
          </p>
          <div className="reveal reveal-d2">
            <NewsletterForm />
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
