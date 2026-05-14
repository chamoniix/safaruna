import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Comment se passe la Omra — Récit et témoignages | SAFARUMA',
  description: 'Découvrez comment se passe vraiment la Omra avec un guide privé francophone. Récit authentique d\'un couple, étape par étape, du salon à la Kaaba.',
  openGraph: {
    title: 'Comment se passe la Omra avec un guide privé',
    description: 'Un récit authentique : de la préparation à Makkah, en passant par l\'ihram et le Tawaf.',
    url: 'https://safaruma.com/comment-se-passe-la-omra',
  },
  alternates: { canonical: 'https://safaruma.com/comment-se-passe-la-omra' },
}

const jsonLd = {
  breadcrumb: {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Accueil', item: 'https://safaruma.com' },
      { '@type': 'ListItem', position: 2, name: 'Comment se passe la Omra', item: 'https://safaruma.com/comment-se-passe-la-omra' },
    ],
  },
  article: {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Comment se passe la Omra avec un guide privé francophone',
    description: 'Récit authentique d\'un couple accompagné par un guide SAFARUMA — de la préparation à domicile jusqu\'au retour après la Omra.',
    url: 'https://safaruma.com/comment-se-passe-la-omra',
    publisher: { '@type': 'Organization', name: 'SAFARUMA', url: 'https://safaruma.com' },
    inLanguage: 'fr',
  },
  faq: {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Comment se passe la Omra avec un guide privé ?',
        acceptedAnswer: { '@type': 'Answer', text: 'Votre guide vous contacte avant le départ, vous attend à l\'aéroport, vous accompagne pour le Tawaf, le Sa\'i, et les visites. Il est toujours à l\'écoute et répond à toutes vos questions tout au long du séjour.' },
      },
      {
        '@type': 'Question',
        name: 'Qu\'est-ce que le Tawaf pendant la Omra ?',
        acceptedAnswer: { '@type': 'Answer', text: 'Le Tawaf est la circumambulation de la Kaaba en 7 tours dans le sens antihoraire. C\'est l\'un des piliers de la Omra, accompagné de du\'as spécifiques expliqués par votre guide.' },
      },
      {
        '@type': 'Question',
        name: 'Comment se passe l\'ihram pour une femme ?',
        acceptedAnswer: { '@type': 'Answer', text: 'Pour une femme, l\'ihram est sa tenue habituelle pudique. Elle pose l\'intention au miqat et récite la Talbiya. À la fin de la Omra, elle coupe une petite mèche de cheveux plutôt que de se raser.' },
      },
      {
        '@type': 'Question',
        name: 'Combien de temps dure la Omra complète ?',
        acceptedAnswer: { '@type': 'Answer', text: 'Les rituels de la Omra (Tawaf, Sa\'i, Tahallul) peuvent être accomplis en 3 à 5 heures selon l\'affluence. Un séjour complet à Makkah avec visites dure généralement 3 à 7 jours.' },
      },
    ],
  },
}

const C = '#C9A84C'
const DARK = '#1A1209'
const CREAM = '#FAF7F0'

export default function CommentSePasseLaOmra() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd.breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd.article) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd.faq) }} />

      <Navbar />

      <main style={{ background: CREAM, minHeight: '100vh' }}>

        {/* ── HERO ── */}
        <div style={{ background: DARK, padding: '170px 24px 48px', textAlign: 'center' }}>
          <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.2em', color: `${C}99`, textTransform: 'uppercase', marginBottom: 12 }}>
            SAFARUMA · Récit authentique
          </div>
          <h1 style={{
            fontFamily: 'var(--font-cormorant, Georgia, serif)',
            fontSize: 'clamp(2rem, 6vw, 3.2rem)', fontWeight: 400,
            color: '#FAF7F0', lineHeight: 1.2, margin: '0 0 16px',
          }}>
            Comment se passe<br /><em style={{ color: C }}>la Omra</em>
          </h1>
          <p style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.65)', maxWidth: 520, margin: '0 auto 32px', lineHeight: 1.8 }}>
            Du salon familial jusqu'au premier tour de la Kaaba — voici comment deux pèlerins ont vécu la Omra avec leur guide privé SAFARUMA.
          </p>
          <Link href="/guides" style={{
            display: 'inline-block', background: C, color: DARK,
            padding: '12px 28px', borderRadius: 50, fontWeight: 700,
            fontSize: '0.85rem', textDecoration: 'none', letterSpacing: '0.05em',
          }}>
            Trouver mon guide →
          </Link>
        </div>

        {/* ── INTRO COUPLE ── */}
        <div style={{ maxWidth: 680, margin: '0 auto', padding: '48px 24px 0' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 48 }}>
            {[
              { initiale: 'Y', nom: 'Youssef', ville: 'Lyon', couleur: '#1A4B6E' },
              { initiale: 'F', nom: 'Fatima', ville: 'Lyon', couleur: '#6E3A1A' },
            ].map(p => (
              <div key={p.nom} style={{ background: 'white', borderRadius: 16, padding: '20px', border: '1px solid #EDE8DC', textAlign: 'center' }}>
                <div style={{
                  width: 52, height: 52, borderRadius: '50%', margin: '0 auto 12px',
                  background: `${p.couleur}22`, border: `2px solid ${p.couleur}44`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-cormorant, Georgia, serif)',
                  fontSize: '1.4rem', fontWeight: 700, color: p.couleur,
                }}>{p.initiale}</div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: DARK }}>{p.nom}</div>
                <div style={{ fontSize: '0.75rem', color: '#9A8D7A', marginTop: 4 }}>Pèlerin · {p.ville}</div>
              </div>
            ))}
          </div>

          {/* ── CHAPITRE 1 ── */}
          <Chapter num="01" titre="Trois semaines avant le départ" />

          <Perspective auteur="Youssef">
            "Je ne savais pas vraiment comment ça allait se passer. J'avais lu des guides, regardé des vidéos, mais ça restait abstrait. Ce qui a tout changé, c'est quand Ibrahim, notre guide SAFARUMA, nous a appelés trois semaines avant le départ."
          </Perspective>

          <Perspective auteur="Fatima">
            "Il nous a envoyé un document complet : comment mettre l'ihram dans l'avion, où se trouve le miqat, les du'as à apprendre. Pour la première fois, j'avais l'impression que quelqu'un s'occupait vraiment de nous. La Omra n'était plus une idée vague. Elle avait un plan."
          </Perspective>

          <InfoCard icon="📞" texte="Votre guide SAFARUMA vous contacte dans les 24h suivant votre réservation. Il prépare votre voyage avant même que vous fassiez vos valises." />

          {/* ── CTA 1 ── */}
          <CtaBlock />

          {/* ── CHAPITRE 2 ── */}
          <Chapter num="02" titre="Dans l'avion — le miqat au-dessus des nuages" />

          <Perspective auteur="Youssef">
            "Le commandant a annoncé que nous survolions le miqat. J'avais déjà mis mon ihram aux toilettes, comme Ibrahim nous l'avait expliqué. J'ai regardé Fatima. On s'est mis à réciter la Talbiya. Autour de nous, d'autres passagers faisaient de même. Je n'avais jamais rien vécu de tel dans un avion."
          </Perspective>

          <div style={{ background: DARK, borderRadius: 12, padding: '20px 24px', margin: '24px 0', textAlign: 'center' }}>
            <div style={{ fontSize: '1.3rem', color: C, fontFamily: 'Georgia, serif', marginBottom: 8, letterSpacing: '0.05em' }}>
              لَبَّيْكَ اللَّهُمَّ لَبَّيْكَ
            </div>
            <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', fontStyle: 'italic' }}>
              Labbayk Allahumma labbayk — la Omra a commencé
            </div>
          </div>

          <Perspective auteur="Fatima">
            "Pour moi, c'est là que tout a basculé. Pas à l'atterrissage, pas à l'arrivée au Haram. Dans cet avion, en récitant la Talbiya avec Youssef, j'ai senti que nous étions vraiment en route. Ibrahim nous avait dit que c'est souvent là que les pèlerins pleurent pour la première fois. Il avait raison."
          </Perspective>

          {/* ── CHAPITRE 3 ── */}
          <Chapter num="03" titre="L'arrivée — un prénom sur une pancarte" />

          <Perspective auteur="Youssef">
            "En sortant de la douane, on était un peu perdus. Les gens partaient dans tous les sens. Et là, on a vu Ibrahim, grand et souriant, avec une pancarte : 'Famille Benhamou'. Ce détail m'a touché. Il nous attendait vraiment."
          </Perspective>

          <Perspective auteur="Fatima">
            "Il a pris nos valises, nous a conduits au véhicule climatisé qu'il avait réservé, et pendant le trajet vers l'hôtel, il nous a expliqué le programme. Rien d'angoissant, juste de la clarté. On savait exactement ce qui nous attendait."
          </Perspective>

          <InfoCard icon="🚗" texte="Votre guide vous attend à la sortie bagages. Il s'occupe du transport, de l'hôtel, et vous prépare mentalement et spirituellement pour les rituels." />

          {/* ── CHAPITRE 4 ── */}
          <Chapter num="04" titre="La première vue de la Kaaba" />

          <Perspective auteur="Youssef">
            "Ibrahim nous a dit : 'Quand vous allez la voir pour la première fois, posez une du'a. C'est un moment particulier, Allah écoute les du'as à ce moment-là.' On est entrés dans le Masjid al-Haram par Bab Abdel Aziz. Et là..."
          </Perspective>

          <Perspective auteur="Fatima">
            "Je ne m'y attendais pas. J'avais vu des photos, des vidéos, mais rien ne prépare vraiment à ça. La Kaaba est là, devant toi, noire et imposante, entourée de pèlerins qui tournent en silence. Youssef pleurait. Moi aussi. Ibrahim, à côté de nous, a murmuré doucement : 'Prenez votre temps. Posez ce que vous portez dans votre cœur.'"
          </Perspective>

          {/* ── CTA 2 ── */}
          <CtaBlock />

          {/* ── CHAPITRE 5 ── */}
          <Chapter num="05" titre="Le Tawaf — 7 tours qui changent tout" />

          <Perspective auteur="Youssef">
            "Ibrahim nous a guidés au premier rang possible. Il nous expliquait au fur et à mesure : l'histoire de chaque angle de la Kaaba, la signification du Hajar al-Aswad, les du'as à réciter. Ce n'était pas une visite touristique, c'était une immersion."
          </Perspective>

          <Perspective auteur="Fatima">
            "Ce qui m'a frappée, c'est qu'à aucun moment je ne me suis sentie perdue ou dépassée. Ibrahim était là, calme, toujours à portée. Quand j'ai eu du mal à avancer dans la foule, il a trouvé un passage. Quand j'ai voulu m'arrêter pour faire une du'a, il nous a guidés vers un espace plus tranquille."
          </Perspective>

          <div style={{ background: '#F0EDE6', borderRadius: 12, padding: '20px', margin: '24px 0', borderLeft: `3px solid ${C}` }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: C, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>Le Sa'i — entre Safa et Marwa</div>
            <div style={{ fontSize: '0.9rem', color: '#5A4D3F', lineHeight: 1.8 }}>
              Après le Tawaf, nous avons fait le Sa'i — 7 passages entre les collines de Safa et Marwa. Ibrahim nous a raconté l'histoire de Hajar ﷺ à chaque passage. Ce que nous faisions avait un sens, une histoire, une âme.
            </div>
          </div>

          {/* ── CHAPITRE 6 ── */}
          <Chapter num="06" titre="La fin des rituels — et après ?" />

          <Perspective auteur="Youssef">
            "Après le Tahallul, rasage pour moi, Fatima a coupé une mèche, Ibrahim nous a regardés et dit simplement : 'C'est fait. Votre Omra est accomplie.' Ces mots... je ne sais pas comment les décrire."
          </Perspective>

          <Perspective auteur="Fatima">
            "On s'est assis dans un coin du Haram. Ibrahim nous a laissé notre espace, il comprenait que certains moments n'appartiennent qu'à Allah et à ses serviteurs. Puis il nous a proposé de l'eau de Zamzam et nous a demandé ce que nous voulions faire ensuite. C'est ça, un guide privé : vous avez le temps, vous avez la paix."
          </Perspective>

          <InfoCard icon="✦" texte="L'Omra accomplie avec un guide privé, c'est la différence entre faire les rituels et les vivre. Chaque geste a un sens. Chaque moment est guidé." />
        </div>

        {/* ── FAQ ── */}
        <div style={{ background: 'white', marginTop: 48, padding: '48px 24px' }}>
          <div style={{ maxWidth: 680, margin: '0 auto' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: C, marginBottom: 8 }}>Questions fréquentes</div>
            <h2 style={{ fontFamily: 'var(--font-cormorant, Georgia, serif)', fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 400, color: DARK, marginBottom: 32 }}>
              Comment se passe la Omra — vos questions
            </h2>
            {jsonLd.faq.mainEntity.map((q, i) => (
              <div key={i} style={{ borderBottom: '1px solid #EDE8DC', paddingBottom: 24, marginBottom: 24 }}>
                <div style={{ fontWeight: 700, color: DARK, fontSize: '0.95rem', marginBottom: 10 }}>{q.name}</div>
                <div style={{ color: '#7A6D5A', fontSize: '0.9rem', lineHeight: 1.8 }}>{q.acceptedAnswer.text}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── CTA FINAL ── */}
        <div style={{ background: DARK, padding: '56px 24px', textAlign: 'center' }}>
          <div style={{ maxWidth: 520, margin: '0 auto' }}>
            <div style={{ fontFamily: 'var(--font-cormorant, Georgia, serif)', fontSize: 'clamp(1.6rem, 5vw, 2.4rem)', fontWeight: 400, color: '#FAF7F0', marginBottom: 16, lineHeight: 1.3 }}>
              Votre Omra mérite<br /><em style={{ color: C }}>d'être vécue, pas subie</em>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.9rem', marginBottom: 32, lineHeight: 1.7 }}>
              Comme Youssef et Fatima, choisissez un guide SAFARUMA certifié qui vous accompagnera à chaque étape — de votre salon jusqu'au Haram.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/guides" style={{
                background: C, color: DARK, padding: '13px 28px', borderRadius: 50,
                fontWeight: 700, fontSize: '0.85rem', textDecoration: 'none', letterSpacing: '0.05em',
              }}>
                Trouver mon guide
              </Link>
              <Link href="/omra-avec-guide-prive" style={{
                background: 'transparent', color: 'rgba(255,255,255,0.7)',
                padding: '13px 28px', borderRadius: 50, fontWeight: 600,
                fontSize: '0.85rem', textDecoration: 'none',
                border: '1px solid rgba(255,255,255,0.2)',
              }}>
                Voir le programme complet
              </Link>
            </div>
          </div>
        </div>

      </main>
      <Footer />
    </>
  )
}

// ── Composants ──

function Chapter({ num, titre }: { num: string; titre: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, margin: '48px 0 24px' }}>
      <div style={{
        fontFamily: 'var(--font-cormorant, Georgia, serif)',
        fontSize: '2.5rem', fontWeight: 700, color: `${C}33`, lineHeight: 1, flexShrink: 0,
      }}>{num}</div>
      <div style={{ flex: 1, height: 1, background: '#EDE8DC' }} />
      <h2 style={{
        fontFamily: 'var(--font-cormorant, Georgia, serif)',
        fontSize: 'clamp(1.1rem, 3vw, 1.4rem)', fontWeight: 600,
        color: '#1A1209', margin: 0, textAlign: 'right',
      }}>{titre}</h2>
    </div>
  )
}

const PERSPECTIVES: Record<string, { bg: string; text: string; label: string; labelBg: string; avatarBg: string; avatarText: string; role: string; indent: string; quoteOpacity: string }> = {
  Youssef: { bg: '#1B4B82', text: '#FAF7F0', label: '#C9A84C', labelBg: 'rgba(201,168,76,0.18)', avatarBg: '#C9A84C', avatarText: '#1A1209', role: 'Pèlerin',   indent: '0px',  quoteOpacity: 'rgba(255,255,255,0.07)' },
  Fatima:  { bg: '#FDF4E7', text: '#3D3528', label: '#8B6B3D', labelBg: 'rgba(139,107,61,0.12)', avatarBg: '#E8D5B0', avatarText: '#1A1209', role: 'Pèlerine', indent: '20px', quoteOpacity: 'rgba(26,18,9,0.05)'    },
}

function Perspective({ auteur, children }: { auteur: string; children: string }) {
  const s = PERSPECTIVES[auteur] ?? PERSPECTIVES.Youssef
  return (
    <div style={{
      margin: '0 0 20px', marginLeft: s.indent,
      padding: '24px', background: s.bg, borderRadius: 20,
      position: 'relative', overflow: 'hidden',
      boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
    }}>
      {/* Guillemet décoratif watermark */}
      <div style={{
        position: 'absolute', top: -10, right: 18,
        fontSize: '5.5rem', lineHeight: 1, color: s.quoteOpacity,
        fontFamily: 'Georgia, serif', pointerEvents: 'none', userSelect: 'none',
      }}>❝</div>

      {/* Header auteur */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, position: 'relative', zIndex: 1 }}>
        <div style={{
          width: 42, height: 42, borderRadius: '50%', flexShrink: 0,
          background: s.avatarBg, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--font-cormorant, Georgia, serif)', fontSize: '1.25rem', fontWeight: 700, color: s.avatarText,
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        }}>{auteur[0]}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.88rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: s.label }}>{auteur}</span>
          <span style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: s.label, background: s.labelBg, padding: '2px 9px', borderRadius: 20 }}>{s.role}</span>
        </div>
      </div>

      <p style={{ fontSize: '0.95rem', color: s.text, lineHeight: 1.9, margin: 0, fontStyle: 'italic', position: 'relative', zIndex: 1 }}>{children}</p>
    </div>
  )
}

function InfoCard({ icon, texte }: { icon: string; texte: string }) {
  return (
    <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', background: `${C}0D`, border: `1px solid ${C}33`, borderRadius: 12, padding: '16px 20px', margin: '24px 0' }}>
      <span style={{ fontSize: '1.2rem', flexShrink: 0, marginTop: 2 }}>{icon}</span>
      <p style={{ fontSize: '0.88rem', color: '#5A4D3F', lineHeight: 1.75, margin: 0 }}>{texte}</p>
    </div>
  )
}

function CtaBlock() {
  return (
    <div style={{ textAlign: 'center', padding: '32px 0', borderTop: '1px solid #EDE8DC', borderBottom: '1px solid #EDE8DC', margin: '32px 0' }}>
      <p style={{ fontSize: '0.9rem', color: '#7A6D5A', marginBottom: 16 }}>Prêt à vivre votre propre Omra ?</p>
      <Link href="/guides" style={{
        display: 'inline-block', background: '#1A1209', color: '#F0D897',
        padding: '11px 24px', borderRadius: 50, fontWeight: 700,
        fontSize: '0.82rem', textDecoration: 'none', letterSpacing: '0.04em',
      }}>
        Trouver mon guide SAFARUMA
      </Link>
    </div>
  )
}
