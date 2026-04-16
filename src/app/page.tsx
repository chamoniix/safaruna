import React from "react";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollReveal from "@/components/ScrollReveal";
import StatsSection from "@/components/StatsSection";
import PersonaSection from "@/components/PersonaSection";
import {
  IconMegaphone, IconEye, IconChat, IconGraduationCap, IconShield, IconUserGroup,
  IconMosque, IconMountain, IconBuilding, IconMap,
  IconBookOpen, IconStar, IconMoon, IconSparkles, IconHandshake,
} from "@/components/Icons";

const LOGO_LETTERS = ['S', 'A', 'F', 'A', 'R', 'U', 'M', 'A'];

const DIFFERENCIATEURS: Array<{ icon: React.ReactNode; title: string; desc: string; vs: string }> = [
  {
    icon: <IconMegaphone size={24} stroke="#C9A84C" />,
    title: 'Guide dans ta langue',
    desc: "Tu choisis ton guide selon sa langue maternelle. Français, Wolof, Darija, Turc — ton guide te parle comme un ami, pas comme un conférencier.",
    vs: "Autres plateformes : guides assignés sans choix de langue",
  },
  {
    icon: <IconEye size={24} stroke="#C9A84C" />,
    title: 'Profil guide transparent',
    desc: "Biographie complète, certifications vérifiées, avis authentiques, lieux couverts, taux de retour. Tu sais exactement qui tu vas rencontrer.",
    vs: "Agences : photo et prénom, c'est tout",
  },
  {
    icon: <IconChat size={24} stroke="#C9A84C" />,
    title: 'Messagerie directe',
    desc: "Tu échanges avec ton guide avant de payer. Pose tes questions, vérifie sa disponibilité, ressens si le courant passe.",
    vs: "Agences : tu pais d'abord, tu rencontres après",
  },
  {
    icon: <IconGraduationCap size={24} stroke="#C9A84C" />,
    title: 'Academy islamique',
    desc: "Apprends les rituels, l'histoire, les du'a avant de partir. 30+ leçons vidéo accessibles dans ton espace pèlerin.",
    vs: "Autres plateformes : aucune préparation spirituelle",
  },
  {
    icon: <IconShield size={24} stroke="#C9A84C" />,
    title: 'Garantie remplacement',
    desc: "Si ton guide ne peut pas venir (maladie, urgence), on te trouve un guide équivalent certifié en moins de 2 heures.",
    vs: "Agences : dommage, annulation sans recours",
  },
  {
    icon: <IconUserGroup size={24} stroke="#C9A84C" />,
    title: 'Petits groupes max 8',
    desc: "Jamais 40 personnes dans un bus. Maximum 8 pèlerins par guide — pour que chaque question ait une réponse, chaque moment compte.",
    vs: "Agences traditionnelles : groupes de 20 à 50",
  },
];

const GUIDES_VEDETTE = [
  {
    slug: 'naim-laamari',
    initials: 'NL',
    hasPhoto: true,
    gradient: 'linear-gradient(135deg, #F0D897 0%, #C9A84C 100%)',
    bgGradient: 'linear-gradient(160deg, #1A1209 0%, #2D1F08 60%, #1A0E04 100%)',
    name: 'Naïm LAAMARI',
    location: 'Makkah · 8 ans · Responsable Terrain',
    rating: '5.0',
    reviews: 0,
    langs: ['🇫🇷 Français', '🇸🇦 Arabe', '🇬🇧 English', '🇲🇦 Darija'],
    price: '150€',
    badge: '★ OFFICIEL SAFARUMA',
    badgeColor: '#C9A84C',
    badgeTextColor: '#1A1209',
    isOfficial: true,
    extraBadges: ['GUIDE VÉRIFIÉ ✓', 'RESPONSABLE TERRAIN', 'FORMATEUR CERTIFIÉ'],
  },
  {
    slug: 'rachid-al-madani',
    initials: 'RA',
    hasPhoto: false,
    gradient: 'linear-gradient(135deg, #C9A84C 0%, #8B6914 100%)',
    bgGradient: 'linear-gradient(160deg, #1A1209 0%, #2D1F08 60%, #1A0E04 100%)',
    name: 'Cheikh Rachid Al-Madani',
    location: 'Makkah · Madinah · 14 ans',
    rating: '4.97',
    reviews: 214,
    langs: ['🇫🇷 Français', '🇸🇦 Arabe', '🇬🇧 English'],
    price: '280€',
    badge: 'Top Guide',
    badgeColor: '#C9A84C',
    badgeTextColor: '#1A1209',
    isOfficial: false,
    extraBadges: [],
  },
  {
    slug: 'fatima-al-omari',
    initials: 'FA',
    hasPhoto: false,
    gradient: 'linear-gradient(135deg, #9FE1CB 0%, #1D9E75 100%)',
    bgGradient: 'linear-gradient(160deg, #082818 0%, #1D5C3A 60%, #082818 100%)',
    name: 'Ustadha Fatima Al-Omari',
    location: 'Makkah · 8 ans',
    rating: '4.95',
    reviews: 178,
    langs: ['🇫🇷 Français', '🇲🇦 Darija'],
    price: '320€',
    badge: 'Guide Femme',
    badgeColor: '#1D9E75',
    badgeTextColor: '#ffffff',
    isOfficial: false,
    extraBadges: [],
  },
];

const LIEUX_VEDETTE: Array<{ icon: React.ReactNode; nameFr: string; nameAr: string; desc: string }> = [
  { icon: <IconMosque size={28} stroke="#8B6914" />, nameFr: 'Masjid Al-Haram',   nameAr: 'المسجد الحرام',    desc: "La plus grande mosquée du monde. Le cœur du pèlerinage." },
  { icon: <IconMountain size={28} stroke="#8B6914" />, nameFr: 'Grotte de Hira', nameAr: 'غار حراء',         desc: "Là où la première révélation coranique fut révélée." },
  { icon: <IconMosque size={28} stroke="#8B6914" />, nameFr: 'Masjid An-Nabawi', nameAr: 'المسجد النبوي',    desc: "La mosquée du Prophète ﷺ. La Rawdah, jardin du Paradis." },
  { icon: <IconMap size={28} stroke="#8B6914" />, nameFr: 'Badr',               nameAr: 'بدر',              desc: "Site de la première grande bataille de l'Islam." },
  { icon: <IconMountain size={28} stroke="#8B6914" />, nameFr: 'Jabal Rahmah', nameAr: 'جبل الرحمة',       desc: "La montagne de la Miséricorde, au cœur d'Arafat." },
  { icon: <IconBuilding size={28} stroke="#8B6914" />, nameFr: 'Masjid Quba',  nameAr: 'مسجد قباء',        desc: "La première mosquée bâtie dans l'histoire de l'Islam." },
];

const TEMOIGNAGES = [
  {
    text: "Rachid nous a fait vivre l'histoire à chaque pas. La montée de Jabal Nour avec ses explications était le moment le plus fort de notre vie. Je pleurais sans même comprendre pourquoi.",
    name: 'Karim L.', city: '🇫🇷 Lyon', init: 'KL', rating: 5, date: 'Mars 2026',
  },
  {
    text: "En tant que groupe de femmes, nous avions des appréhensions. Fatima a tout géré avec une douceur et une compétence incroyables. Elle adapte son rythme, elle répond à chaque question, elle ne juge pas. Une perle.",
    name: 'Safia M.', city: '🇧🇪 Bruxelles', init: 'SM', rating: 5, date: 'Février 2026',
  },
  {
    text: "Youssouf parle Wolof, connaît les histoires que nos anciens nous ont transmises, et les relie aux lieux saints. Pour notre communauté, c'est inestimable. Toute la famille est repartie transformée.",
    name: 'Ibrahima D.', city: '🇸🇳 Dakar', init: 'ID', rating: 5, date: 'Janvier 2026',
  },
];

export default function Home() {
  return (
    <>
      <Navbar />
      <ScrollReveal />

      {/* ═══════════════════════════════════════════════════════
          HERO FULLSCREEN — cinématique
          ═══════════════════════════════════════════════════════ */}
      <section className="hero-full">
        {/* Arabic watermark */}
        <div className="hero-full-arabic" aria-hidden="true">بسم الله</div>

        {/* Ambient glow rings */}
        <div style={{ position: 'absolute', width: '70vw', height: '70vw', maxWidth: 800, maxHeight: 800, borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,168,76,0.07) 0%, transparent 65%)', top: '50%', left: '50%', transform: 'translate(-50%, -55%)', pointerEvents: 'none' }} />

        {/* Content */}
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 760, width: '100%' }}>
          {/* Logo letter-by-letter */}
          <div className="hero-logo-word" aria-label="SAFARUMA">
            {LOGO_LETTERS.map((letter, i) => (
              <span
                key={i}
                className={`hero-logo-letter${i === 5 ? ' gold' : ''}`}
                style={{ animationDelay: `${i * 80}ms` }}
                aria-hidden="true"
              >
                {letter}
              </span>
            ))}
          </div>

          {/* Golden line */}
          <div className="golden-line-wrap">
            <div className="golden-line-anim" />
          </div>

          {/* Arabic subtitle */}
          <div style={{
            fontFamily: 'var(--font-cormorant, serif)',
            fontSize: '1rem', letterSpacing: '0.15em',
            color: 'rgba(201,168,76,0.6)',
            marginBottom: '1rem',
            animation: 'fadeIn 0.8s 1.0s ease both', opacity: 0,
          }}>
            سافر • SAFARUMA • Voyage
          </div>

          {/* Main tagline */}
          <h1 style={{
            fontFamily: 'var(--font-cormorant, serif)',
            fontSize: 'clamp(2.4rem, 5.5vw, 3.8rem)',
            fontWeight: 300, color: 'white', lineHeight: 1.15,
            marginBottom: '1.5rem',
            animation: 'fadeInUp 0.9s 1.2s ease both', opacity: 0,
          }}>
            Le voyage vers tes origines
            <br />
            <em style={{ color: 'var(--gold)', fontStyle: 'italic' }}>commence ici.</em>
          </h1>

          <p style={{
            color: 'rgba(255,255,255,0.45)',
            fontSize: '1rem', lineHeight: 1.8,
            maxWidth: 520, margin: '0 auto 2.5rem',
            animation: 'fadeInUp 0.9s 1.4s ease both', opacity: 0,
          }}>
            Un guide privé certifié, qui parle ta langue, t&apos;explique chaque rituel, et transforme ton voyage en expérience spirituelle inoubliable.
          </p>

          {/* CTAs */}
          <div style={{
            display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap',
            marginBottom: '1.5rem',
            animation: 'fadeInUp 0.9s 1.6s ease both', opacity: 0,
          }}>
            <Link href="/guides" className="btn-hero-cta">
              Trouver mon guide
            </Link>
          </div>

          {/* Live trust mini-row */}
          <div style={{
            display: 'flex', gap: '2rem', justifyContent: 'center', flexWrap: 'wrap',
            marginBottom: '1.75rem',
            animation: 'fadeIn 0.9s 1.8s ease both', opacity: 0,
          }}>
            <div className="live-badge">
              <span className="live-dot" />
              <span>147 pèlerins ont réservé cette semaine</span>
            </div>
            <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ color: 'var(--gold)' }}>★★★★★</span> 4.96 · 709 avis vérifiés
            </span>
          </div>

          {/* Citation */}
          <p style={{
            fontFamily: 'var(--font-cormorant, serif)',
            fontStyle: 'italic',
            fontSize: '0.95rem',
            color: 'rgba(240,216,151,0.5)',
            maxWidth: 480,
            margin: '0 auto',
            lineHeight: 1.7,
            animation: 'fadeIn 0.9s 2.0s ease both', opacity: 0,
          }}>
            &ldquo;Voyage — car dans chaque pas vers les lieux saints,<br />ton âme retrouve ce qu&apos;elle cherchait.&rdquo;
          </p>
        </div>

        {/* Scroll indicator */}
        <div className="scroll-indicator" aria-hidden="true">
          <span>Découvrir</span>
          <div className="scroll-dot" />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          STATS — animated counters
          ═══════════════════════════════════════════════════════ */}
      <StatsSection />

      {/* ═══════════════════════════════════════════════════════
          QUESTIONNEMENT — Personas / Ce voyage est pour vous
          ═══════════════════════════════════════════════════════ */}
      <section style={{ background: 'var(--cream)', padding: '6rem 4rem', borderTop: '1px solid var(--sand)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--gold-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--gold)', display: 'inline-block', animation: 'pulse 2s infinite' }} />
              Ce voyage est pour vous
            </span>
          </div>
          <h2 className="reveal reveal-d1" style={{ textAlign: 'center', fontFamily: 'var(--font-cormorant, serif)', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 300, color: 'var(--deep)', margin: '0.75rem 0 0.5rem', lineHeight: 1.2 }}>
            Peu importe <em style={{ color: 'var(--gold-dark)', fontStyle: 'italic' }}>où vous en êtes.</em>
          </h2>
          <p className="reveal reveal-d2" style={{ textAlign: 'center', color: 'var(--muted)', maxWidth: 480, margin: '0 auto 2rem', lineHeight: 1.75, fontSize: '0.9rem' }}>
            Reconnaissez-vous dans l&apos;un de ces profils ?
          </p>
          <PersonaSection />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          LE PROBLÈME — dark, text reveal
          ═══════════════════════════════════════════════════════ */}
      <section style={{ background: 'var(--deep)', padding: '7rem 4rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 60% 80% at 50% 50%, rgba(201,168,76,0.05) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 820, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(201,168,76,0.5)', marginBottom: '1.5rem' }} className="reveal">
            Le constat
          </div>
          <h2 className="reveal reveal-d1" style={{
            fontFamily: 'var(--font-cormorant, serif)',
            fontSize: 'clamp(2rem, 4.5vw, 3.2rem)',
            fontWeight: 300, color: 'white', lineHeight: 1.15, marginBottom: '2.5rem',
          }}>
            90% des pèlerins font la Omra<br />
            <em style={{ color: 'var(--gold)', fontStyle: 'italic' }}>sans vraiment la comprendre.</em>
          </h2>
          <p className="reveal reveal-d2" style={{ color: 'rgba(255,255,255,0.55)', lineHeight: 1.9, fontSize: '1rem', marginBottom: '1.5rem' }}>
            35 personnes dans un bus. Un guide qui parle arabe. Tu imites les gestes de ceux devant toi. Tu tournes autour de la Kaaba en ne sachant pas vraiment pourquoi tu tournes. Tu récites des du&apos;a que tu n&apos;as jamais apprises. Tu rentres chez toi avec une belle photo, mais quelque chose manque.
          </p>
          <p className="reveal reveal-d3" style={{ color: 'rgba(255,255,255,0.55)', lineHeight: 1.9, fontSize: '1rem', marginBottom: '3rem' }}>
            Ce n&apos;est pas la Omra qui était mauvaise. C&apos;est le format. Un voyage d&apos;une telle profondeur mérite un guide qui prend le temps — <em style={{ color: 'rgba(240,216,151,0.8)' }}>ton temps</em> — pour tout t&apos;expliquer, dans ta langue, à ton rythme.
          </p>
          <div className="reveal reveal-d4">
            <Link href="/guides" className="btn-hero-cta">
              Et si ta Omra avait du sens ?
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          DIFFÉRENCIATEURS vs autres plateformes
          ═══════════════════════════════════════════════════════ */}
      <section style={{ background: 'var(--cream)', padding: '6rem 4rem' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div className="section-label reveal" style={{ textAlign: 'center' }}>Pourquoi SAFARUMA</div>
          <h2 className="reveal reveal-d1" style={{ textAlign: 'center', marginBottom: '0.75rem' }}>
            Ce que nous avons,<br />
            <em>qu&apos;aucune autre plateforme n&apos;offre</em>
          </h2>
          <p className="reveal reveal-d2" style={{ textAlign: 'center', color: 'var(--muted)', maxWidth: 520, margin: '0 auto 3.5rem', lineHeight: 1.75, fontSize: '0.9rem' }}>
            Nous avons construit SAFARUMA en partant d&apos;une question : qu&apos;est-ce qui rend vraiment un pèlerinage inoubliable ?
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
            {DIFFERENCIATEURS.map((d, i) => (
              <div key={d.title} className={`diff-card reveal reveal-d${(i % 3) + 1}`}>
                <div className="diff-icon" style={{ fontSize: 'unset' }}>{d.icon}</div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--deep)', marginBottom: '0.5rem' }}>{d.title}</h3>
                <p style={{ fontSize: '0.84rem', color: 'var(--muted)', lineHeight: 1.75, marginBottom: '0.75rem' }}>{d.desc}</p>
                <div style={{ fontSize: '0.7rem', color: 'rgba(192,57,43,0.65)', fontStyle: 'italic', borderTop: '1px solid var(--sand)', paddingTop: '0.6rem' }}>
                  ✕ {d.vs}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          GUIDES EN VEDETTE — cards hover overlay
          ═══════════════════════════════════════════════════════ */}
      <section style={{ background: 'white', padding: '6rem 4rem', borderTop: '1px solid var(--sand)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div className="section-label reveal">Nos guides</div>
          <h2 className="reveal reveal-d1">
            Des guides qui <em>parlent ta langue</em>
          </h2>
          <p className="reveal reveal-d2" style={{ color: 'var(--muted)', maxWidth: 520, lineHeight: 1.75, marginBottom: '3rem', fontSize: '0.9rem' }}>
            Chaque guide est certifié mutawwif, vérifié par notre équipe et évalué par des centaines de pèlerins réels.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {GUIDES_VEDETTE.map((g, i) => (
              <div
                key={g.slug}
                className={`guide-feat-card reveal reveal-d${i + 1}`}
                style={{
                  background: g.bgGradient,
                  border: g.isOfficial ? '2px solid #C9A84C' : '1px solid rgba(255,255,255,0.06)',
                  boxShadow: g.isOfficial ? '0 8px 40px rgba(201,168,76,0.2)' : 'none',
                }}
              >
                {/* Background initials watermark */}
                <div style={{
                  position: 'absolute', top: '50%', left: '50%',
                  transform: 'translate(-50%, -55%)',
                  fontFamily: 'var(--font-cormorant, serif)',
                  fontSize: '10rem', fontWeight: 700,
                  color: 'rgba(255,255,255,0.04)',
                  userSelect: 'none', lineHeight: 1,
                }}>
                  {g.initials}
                </div>

                {/* Main content */}
                <div className="guide-feat-overlay">
                  <div style={{ flex: 1 }}>

                    {/* Badge principal */}
                    <div style={{
                      display: 'inline-block',
                      background: g.badgeColor,
                      color: g.badgeTextColor,
                      fontSize: '0.6rem',
                      fontWeight: 800,
                      letterSpacing: '0.08em',
                      padding: '0.2rem 0.6rem',
                      borderRadius: 50,
                      marginBottom: g.isOfficial ? '0.4rem' : '0.75rem',
                    }}>
                      {g.badge}
                    </div>

                    {/* Extra badges pour Naïm */}
                    {g.isOfficial && g.extraBadges.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginBottom: '0.75rem' }}>
                        <span style={{ background: '#065F46', color: 'white', fontSize: '0.52rem', fontWeight: 800, letterSpacing: '0.06em', padding: '0.15rem 0.5rem', borderRadius: 50 }}>
                          {g.extraBadges[0]}
                        </span>
                        <span style={{ background: '#C9A84C', color: '#1A1209', fontSize: '0.52rem', fontWeight: 800, letterSpacing: '0.06em', padding: '0.15rem 0.5rem', borderRadius: 50 }}>
                          {g.extraBadges[1]}
                        </span>
                        <span style={{ background: '#1E3A5F', color: 'white', fontSize: '0.52rem', fontWeight: 800, letterSpacing: '0.06em', padding: '0.15rem 0.5rem', borderRadius: 50 }}>
                          {g.extraBadges[2]}
                        </span>
                      </div>
                    )}

                    {/* Avatar + info */}
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                      {/* Avatar : photo pour Naïm, initiales pour les autres */}
                      {g.hasPhoto ? (
                        <div style={{
                          width: 48,
                          height: 48,
                          borderRadius: '50%',
                          overflow: 'hidden',
                          position: 'relative',
                          flexShrink: 0,
                          border: '2px solid #C9A84C',
                          boxShadow: '0 0 0 2px rgba(201,168,76,0.3)',
                        }}>
                          <Image
                            src="/guide-avatar.png"
                            alt="Naïm LAAMARI — Guide Officiel SAFARUMA"
                            fill
                            style={{ objectFit: 'cover', objectPosition: 'center top' }}
                          />
                        </div>
                      ) : (
                        <div style={{
                          width: 44,
                          height: 44,
                          borderRadius: '50%',
                          background: g.gradient,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontFamily: 'var(--font-cormorant, serif)',
                          fontWeight: 700,
                          color: '#1A1209',
                          fontSize: '1rem',
                          flexShrink: 0,
                        }}>
                          {g.initials}
                        </div>
                      )}
                      <div>
                        <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'white' }}>{g.name}</div>
                        <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.55)' }}>{g.location}</div>
                      </div>
                    </div>

                    {/* Rating */}
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ color: 'var(--gold)', fontSize: '0.82rem', letterSpacing: 2 }}>★★★★★</span>
                      <span style={{ fontSize: '0.78rem', color: 'white', fontWeight: 700 }}>{g.rating}</span>
                      {g.isOfficial ? (
                        <span style={{ fontSize: '0.62rem', background: '#C9A84C', color: '#1A1209', fontWeight: 800, padding: '0.1rem 0.5rem', borderRadius: 50 }}>
                          NOTE PARFAITE
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)' }}>({g.reviews} avis)</span>
                      )}
                    </div>

                    {/* Languages */}
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.25rem' }}>
                      {g.langs.map(l => (
                        <span key={l} style={{
                          background: 'rgba(255,255,255,0.1)',
                          color: 'rgba(255,255,255,0.8)',
                          fontSize: '0.68rem',
                          padding: '0.15rem 0.5rem',
                          borderRadius: 50,
                          border: '1px solid rgba(255,255,255,0.15)',
                        }}>{l}</span>
                      ))}
                    </div>

                    {/* Price */}
                    <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)', marginTop: '0.5rem' }}>
                      À partir de{' '}
                      <span style={{
                        fontFamily: 'var(--font-cormorant, serif)',
                        fontSize: '1.1rem',
                        fontWeight: 700,
                        color: 'var(--gold-light)',
                      }}>{g.price}</span> / pers.
                    </div>
                  </div>

                  {/* CTA */}
                  <Link href={`/guides/${g.slug}`} className="guide-feat-btn">
                    Voir le profil
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="reveal" style={{ textAlign: 'center', marginTop: '3rem' }}>
            <Link href="/guides" className="btn-primary" style={{ fontSize: '0.88rem' }}>
              Voir tous les guides
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          LIEUX SAINTS — 6 cards avec hover arabique
          ═══════════════════════════════════════════════════════ */}
      <section style={{ background: 'var(--cream)', padding: '6rem 4rem', borderTop: '1px solid var(--sand)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div className="section-label reveal">Les lieux saints</div>
          <h2 className="reveal reveal-d1">
            <em>26 lieux</em> que ton guide<br />te fera vivre autrement
          </h2>
          <p className="reveal reveal-d2" style={{ color: 'var(--muted)', maxWidth: 520, lineHeight: 1.75, marginBottom: '3rem', fontSize: '0.9rem' }}>
            Au-delà du Masjid Al-Haram, il existe des dizaines de sites chargés d&apos;histoire. Ton guide certifié te les fait découvrir avec la profondeur qu&apos;ils méritent.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            {LIEUX_VEDETTE.map((l, i) => (
              <div key={l.nameFr} className={`place-card reveal reveal-d${(i % 3) + 1}`}>
                <div className="place-arabic-bg" aria-hidden="true">{l.nameAr}</div>
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{ marginBottom: '0.75rem' }}>{l.icon}</div>
                  <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#C9A84C', WebkitTextFillColor: '#C9A84C', fontFamily: '"Scheherazade New", "Amiri", serif', marginBottom: '0.2rem' }}>
                    {l.nameAr}
                  </div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--deep)', marginBottom: '0.5rem' }}>{l.nameFr}</h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--muted)', lineHeight: 1.65 }}>{l.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="reveal" style={{ textAlign: 'center', marginTop: '3rem' }}>
            <Link href="/lieux-saints" className="btn-secondary">
              Découvrir tous les lieux
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          CHARTE ISLAMIQUE
          ═══════════════════════════════════════════════════════ */}
      <section style={{ background: 'var(--deep)', padding: '6rem 4rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 70% 90% at 50% 100%, rgba(201,168,76,0.06) 0%, transparent 55%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div className="reveal" style={{ fontFamily: '"Scheherazade New", "Amiri", "Traditional Arabic", serif', fontSize: 'clamp(2rem, 5vw, 4rem)', color: '#C9A84C', WebkitTextFillColor: '#C9A84C', lineHeight: 1, marginBottom: '1rem', direction: 'rtl', textRendering: 'optimizeLegibility', WebkitFontSmoothing: 'antialiased', unicodeBidi: 'embed' }}>
            وَمَن يُعَظِّمْ شَعَائِرَ اللَّهِ
          </div>
          <p className="reveal reveal-d1" style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.2rem', fontStyle: 'italic', color: 'rgba(255,255,255,0.65)', lineHeight: 1.6, marginBottom: '0.75rem' }}>
            &ldquo;Et quiconque honore les rites sacrés d&apos;Allah — c&apos;est assurément le fruit de la piété des cœurs.&rdquo;
          </p>
          <p className="reveal reveal-d2" style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', marginBottom: '4rem' }}>Sourate Al-Hajj · 22:32</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2rem' }}>
            {([
              { icon: <IconMosque size={28} stroke="#C9A84C" />, t: 'Authenticité',  d: "Nos guides ne font jamais de compromis sur les rituels. Chaque geste a un sens — ils vous l'expliquent.", color: '#C9A84C' },
              { icon: <IconHandshake size={28} stroke="#9FE1CB" />, t: 'Confiance',      d: "La charte islamique que signent nos guides n'est pas un contrat. C'est un serment devant Allah.", color: '#9FE1CB' },
              { icon: <IconBookOpen size={28} stroke="#A8C8F0" />, t: 'Connaissance',   d: "L'Omra sans savoir, c'est marcher dans le noir. Avec SAFARUMA, chaque pas a un sens.", color: '#A8C8F0' },
            ] as { icon: React.ReactNode; t: string; d: string; color: string }[]).map((v, i) => (
              <div key={v.t} className={`reveal reveal-d${i + 1}`} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '2rem' }}>
                <div style={{ marginBottom: '0.75rem' }}>{v.icon}</div>
                <h3 style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.4rem', color: v.color, marginBottom: '0.5rem', fontWeight: 600 }}>{v.t}</h3>
                <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.75 }}>{v.d}</p>
              </div>
            ))}
          </div>

          <div className="reveal" style={{ marginTop: '3rem' }}>
            <Link href="/charte" style={{ fontSize: '0.8rem', color: 'rgba(201,168,76,0.6)', textDecoration: 'none', letterSpacing: '0.08em', borderBottom: '1px solid rgba(201,168,76,0.3)', paddingBottom: '0.2rem' }}>
              Lire la Charte SAFARUMA
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          TÉMOIGNAGES — border gauche dorée
          ═══════════════════════════════════════════════════════ */}
      <section style={{ background: 'white', padding: '6rem 4rem', borderTop: '1px solid var(--sand)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div className="section-label reveal">Témoignages</div>
          <h2 className="reveal reveal-d1" style={{ marginBottom: '3rem' }}>
            Ce que disent nos <em>pèlerins</em>
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '1.5rem' }}>
            {TEMOIGNAGES.map((t, i) => (
              <div key={t.name} className={`reveal reveal-d${i + 1}`} style={{
                background: 'var(--cream)', borderRadius: 16, padding: '1.75rem',
                borderLeft: '3px solid var(--gold)',
                boxShadow: '0 2px 12px rgba(26,18,9,0.04)',
              }}>
                <div style={{ color: 'var(--gold)', fontSize: '1.5rem', lineHeight: 1, marginBottom: '1rem', fontFamily: 'var(--font-cormorant, serif)' }}>&ldquo;</div>
                <p style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.05rem', fontStyle: 'italic', color: 'var(--deep)', lineHeight: 1.65, marginBottom: '1.5rem' }}>{t.text}</p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--sand)', paddingTop: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--sand)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.82rem', color: 'var(--warm)', flexShrink: 0 }}>{t.init}</div>
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--deep)' }}>{t.name}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>{t.city}</div>
                    </div>
                  </div>
                  <div>
                    <div style={{ color: 'var(--gold)', fontSize: '0.72rem', letterSpacing: 2, textAlign: 'right' }}>{'★'.repeat(t.rating)}</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--muted)', textAlign: 'right' }}>{t.date}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          FORFAITS — 3 cards
          ═══════════════════════════════════════════════════════ */}
      <section id="packages" style={{ background: 'var(--cream)', padding: '6rem 4rem', borderTop: '1px solid var(--sand)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div className="section-label reveal" style={{ textAlign: 'center' }}>Nos forfaits</div>
          <h2 className="reveal reveal-d1" style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
            Un programme pour <em>chaque pèlerin</em>
          </h2>
          <p className="reveal reveal-d2" style={{ textAlign: 'center', color: 'var(--muted)', maxWidth: 480, margin: '0 auto 3rem', lineHeight: 1.75, fontSize: '0.9rem' }}>
            3 jours ou 10 jours, solo ou famille — il existe un forfait fait pour toi.
          </p>
          <div className="packages-grid">
            {([
              { icon: <IconMoon size={28} stroke="currentColor" />, title: 'Omra Essentielle', featured: false, price: '280€', sub: '/ pers · 2–3 jours', features: ["Rituels expliqués (tawaf, sa'i)", "Masjid Al-Haram & Zamzam", "Livret du'a illustré", "Disponibilité 24h/24", "1 à 8 personnes"] },
              { icon: <IconMosque size={28} stroke="currentColor" />, title: 'Omra & Histoire', featured: true, price: '450€', sub: '/ pers · 5 jours', features: ["Tout Essentielle inclus", "Voiture privée 7 places", "Jabal Al-Nour, Thawr, Uhud", "Train Haramain Makkah ↔ Madinah", "Masjid Quba, Al-Baqi', Rawdah", "Conférence Sîra (1h)"] },
              { icon: <IconSparkles size={28} stroke="currentColor" />, title: 'Grand Voyage', featured: false, price: '780€', sub: '/ pers · 10 jours', features: ["Tout Omra & Histoire inclus", "Makkah + Madinah + Badr + Ohoud", "Adapté PMR disponible", "Hôtel 5★ à 200m du Haram", "Album photo souvenir", "1 à 12 personnes"] },
            ] as { icon: React.ReactNode; title: string; featured: boolean; price: string; sub: string; features: string[] }[]).map((p, i) => (
              <div key={p.title} className={`package-card ${p.featured ? 'featured' : ''} reveal reveal-d${i + 1}`}>
                <div className="package-icon">{p.icon}</div>
                <h3>{p.title}</h3>
                <ul className="pkg-features">
                  {p.features.map(f => <li key={f}><span className="pkg-check">✓</span> {f}</li>)}
                </ul>
                <div className="pkg-price">{p.price} <small>{p.sub}</small></div>
                <Link href="/guides" className="btn-primary" style={{ marginTop: '1.5rem', display: 'inline-block', fontSize: '0.85rem' }}>
                  Trouver un guide
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          GUIDE OMRA — carte premium
          ═══════════════════════════════════════════════════════ */}
      <section className="guide-omra-promo-card-section" style={{ background: 'var(--cream)', padding: '2rem 2rem', borderTop: '1px solid var(--sand)' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <Link href="/guide-omra" style={{ textDecoration: 'none', display: 'block' }}>
            <div className="reveal guide-omra-promo-card" style={{
              background: 'linear-gradient(135deg, #1A1209 0%, #2C1810 100%)',
              border: '1px solid rgba(201,168,76,0.3)',
              borderRadius: 16,
              padding: '2rem 2.5rem',
              position: 'relative',
              overflow: 'hidden',
              cursor: 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}>
              <div style={{ position: 'absolute', top: '50%', right: '2rem', transform: 'translateY(-50%)', fontFamily: 'var(--font-cormorant, serif)', fontSize: '6rem', color: 'rgba(201,168,76,0.05)', direction: 'rtl', pointerEvents: 'none', lineHeight: 1 }}>عمرة</div>
              <div className="guide-omra-inner" style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap', position: 'relative' }}>
                <div style={{ flex: 1, minWidth: 220 }}>
                  <span style={{ display: 'inline-block', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(201,168,76,0.85)', background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.2)', padding: '0.22rem 0.65rem', borderRadius: 4, marginBottom: '0.7rem' }}>Guide gratuit</span>
                  <h3 style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: 'clamp(1.4rem, 3vw, 1.9rem)', color: 'white', margin: '0 0 0.65rem', lineHeight: 1.2, fontWeight: 400 }}>Guide complet de la Omra</h3>
                  <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.8, margin: 0 }}>Ihram, Tawaf, Sa&apos;i, Tahallul — chaque rituel expliqué avec ses du&apos;as, significations spirituelles et checklist de préparation.</p>
                </div>
                <div className="guide-omra-tags" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', flexShrink: 0 }}>
                  {['Ihram & Talbiyyah', 'Tawaf — 7 tours', "Sa'i — Safa & Marwa", 'Tahallul', "Du'as essentielles", 'Checklist complète'].map(tag => (
                    <span key={tag} style={{ fontSize: '0.7rem', fontWeight: 600, color: 'rgba(201,168,76,0.75)', background: 'rgba(201,168,76,0.07)', border: '1px solid rgba(201,168,76,0.15)', padding: '0.28rem 0.65rem', borderRadius: 20, whiteSpace: 'nowrap', textAlign: 'center' }}>{tag}</span>
                  ))}
                </div>
              </div>
              <span className="guide-omra-cta" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'var(--gold)', color: 'var(--deep)', fontWeight: 700, fontSize: '0.82rem', padding: '0.65rem 1.4rem', borderRadius: 8, marginTop: '1.25rem' }}>Lire le guide</span>
            </div>
          </Link>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          CTA FINAL
          ═══════════════════════════════════════════════════════ */}
      <section className="cta-section">
        <div className="reveal" style={{ fontFamily: '"Scheherazade New", "Amiri", serif', fontSize: 'clamp(4rem, 15vw, 10rem)', color: 'rgba(201,168,76,0.05)', lineHeight: 1, direction: 'rtl', userSelect: 'none', marginBottom: '0.5rem', WebkitFontSmoothing: 'antialiased', textRendering: 'optimizeLegibility' }}>
          سَفَرُوما
        </div>
        <h2 className="reveal reveal-d1" style={{ color: 'white', marginTop: '-1rem' }}>
          Ta Omra mérite mieux.
        </h2>
        <p className="reveal reveal-d2" style={{ color: 'rgba(255,255,255,0.45)', maxWidth: 480, margin: '1rem auto 2.5rem', lineHeight: 1.85, fontSize: '0.95rem' }}>
          Rejoins des milliers de pèlerins francophones qui ont vécu une Omra privée, profonde et inoubliable avec un guide qui a consacré sa vie à ce moment.
        </p>
        <div className="reveal reveal-d3" style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/guides" className="btn-hero-cta" style={{ background: 'var(--gold)', color: 'var(--deep)', borderColor: 'var(--gold)' }}>
            Trouver mon guide
          </Link>
        </div>
      </section>

      <Footer />
    </>
  );
}
