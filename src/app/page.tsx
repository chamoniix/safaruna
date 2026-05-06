import React from "react";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollReveal from "@/components/ScrollReveal";
import StatsSection from "@/components/StatsSection";
import PersonaSection from "@/components/PersonaSection";
import type { Viewport } from 'next';

export const viewport: Viewport = { themeColor: '#FAF7F0' };
import {
  IconMegaphone, IconEye, IconChat, IconGraduationCap, IconShield, IconUserGroup,
  IconMosque, IconMountain, IconBuilding, IconMap, IconAccessibility,
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
    icon: <IconAccessibility size={24} stroke="#C9A84C" />,
    title: 'Prise en charge PMR & mobilité réduite',
    desc: "Fauteuil roulant, mobilité réduite, parent âgé, grossesse avancée — votre guide prend tout en charge. Transport adapté, poussée du fauteuil pendant le tawaf et le sa'i, coordination avec les services du Haram, hôtel accessible. Votre famille mérite de vivre sa Omra, pas de la regarder de loin.",
    vs: "Groupes classiques : aucune prise en charge individuelle, rythme imposé à tous",
  },
  {
    icon: <IconGraduationCap size={24} stroke="#C9A84C" />,
    title: 'Academy islamique',
    desc: "Apprends les rituels, l'histoire, les du'a avant de partir. 30+ leçons vidéo accessibles dans ton espace pèlerin.",
    vs: "Autres plateformes : aucune préparation spirituelle",
  },
  {
    icon: <IconChat size={24} stroke="#C9A84C" />,
    title: 'Assistance en temps réel',
    desc: "On répond à toutes vos questions. Nos guides et nos équipes sont là pour que votre voyage soit le plus agréable.",
    vs: "Agences : tu paies d'abord, tu rencontres après",
  },
  {
    icon: <IconShield size={24} stroke="#C9A84C" />,
    title: 'Garantie remplacement',
    desc: "Si ton guide ne peut pas venir (maladie, urgence), on te trouve un guide équivalent certifié en moins de 2 heures.",
    vs: "Agences : dommage, annulation sans recours",
  },
  {
    icon: <IconUserGroup size={24} stroke="#C9A84C" />,
    title: 'Voiture privée · 7 pèlerins max',
    desc: "Un 4x4 ou van privé pour vous seuls. Maximum 7 pèlerins par guide — pour que chaque question ait une réponse et chaque moment compte. Au-delà de 7, nous organisons un minivan ou bus dédié.",
    vs: "Agences traditionnelles : groupes de 20 à 50 personnes dans un bus",
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

const nbDisponibles = 8;

export default function Home() {
  return (
    <>
      <Navbar transparentOnHero />
      <ScrollReveal />
      <style dangerouslySetInnerHTML={{ __html: `
        @media (max-width: 768px) {
          .hc-eyebrow  { font-size: 0.75rem !important; }
          .hc-title    { font-size: 2.1rem !important; }
          .hc-title-em { font-size: 2.1rem !important; }
          .hc-sub      { font-size: 0.9rem !important; max-width: min(540px, 90vw) !important; }
          .hc-cta      { font-size: 1rem !important; padding: 15px 44px !important; }
          .hc-pill     { font-size: 0.82rem !important; }
          .hc-stars    { font-size: 0.8rem !important; }
          .hc-partner  { font-size: 0.85rem !important; }
        }
        @media (min-width: 769px) {
          .hc-title    { font-size: 2.8rem !important; }
          .hc-title-em { font-size: 2.8rem !important; }
        }
      `}} />

      {/* ═══════════════════════════════════════════════════════
          HERO FULLSCREEN — cinématique
          ═══════════════════════════════════════════════════════ */}
      <section className="hero-full">

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

          {/* Eyebrow */}
          <div style={{ marginTop: '20px', marginBottom: '28px' }}>
            <span className="hc-eyebrow" style={{
              display: 'inline-flex', alignItems: 'center', gap: '5px',
              fontSize: '0.59rem', color: 'rgba(201,168,76,0.95)', letterSpacing: '0.1em',
              padding: '4px 12px', border: '0.5px solid rgba(201,168,76,0.4)',
              borderRadius: '999px', background: 'rgba(201,168,76,0.06)',
            }}>
              <span style={{ color: '#C9A84C' }}>★</span> Guides privés certifiés · 17 langues
            </span>
          </div>

          {/* H1 */}
          <h1 className="hc-title" style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: 'clamp(2rem, 5vw, 2.8rem)', lineHeight: 1.15, color: '#FAF7F0', marginTop: 0, marginBottom: 0 }}>
            Une Omra, un guide privé
          </h1>
          <div className="hc-title-em" style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: 'clamp(2rem, 5vw, 2.8rem)', fontStyle: 'italic', lineHeight: 1.15, color: '#C9A84C', marginTop: '4px', marginBottom: '28px' }}>
            dans ta langue.
          </div>

          {/* Subtitle */}
          <p className="hc-sub" style={{ fontSize: '0.72rem', lineHeight: 1.65, color: 'rgba(250,247,240,0.78)', maxWidth: 'min(540px, 90vw)', margin: '0 auto 32px' }}>
            Guide certifié à <span style={{ color: '#F0D897', fontWeight: 500 }}>La Mecque</span> et <span style={{ color: '#F0D897', fontWeight: 500 }}>Médine</span>. Visite des lieux saints, sites historiques et endroits que les agences Omra ne montrent pas.
          </p>

          {/* CTA with halo */}
          <div style={{ marginBottom: '36px' }}>
            <span className="cta-halo-wrap">
              <Link href="/guides" className="hc-cta" style={{
                display: 'inline-block', border: '1.5px solid #C9A84C',
                color: '#F0D897', padding: '12px 36px', borderRadius: '999px',
                fontSize: '0.81rem', fontWeight: 500, letterSpacing: '0.04em',
                background: 'rgba(201,168,76,0.04)', textDecoration: 'none',
              }}>
                Trouver mon guide
              </Link>
            </span>
          </div>

          {/* Social proof stack */}
          <div style={{ marginBottom: '16px' }}>
            <span className="hc-pill" style={{
              display: 'inline-flex', alignItems: 'center', gap: '7px',
              padding: '5px 13px', border: '0.5px solid rgba(122,217,150,0.5)',
              borderRadius: '999px', fontSize: '0.66rem', color: '#7AD996',
            }}>
              <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#7AD996', flexShrink: 0 }} />
              147 pèlerins ont réservé cette semaine
            </span>
          </div>
          <div className="hc-stars" style={{ marginBottom: '18px', display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '0.625rem' }}>
            <span style={{ color: '#C9A84C', letterSpacing: '1px' }}>★★★★★</span>
            <span style={{ color: 'rgba(250,247,240,0.8)' }}>4.96 · 709 avis vérifiés</span>
          </div>
          <div className="hc-partner" style={{ fontSize: '0.69rem', color: 'rgba(240,216,151,0.92)', letterSpacing: '0.02em', lineHeight: 1.45 }}>
            <span style={{ color: '#C9A84C', fontSize: '0.56rem' }}>◆</span> Partenaire de <span style={{ color: '#F0D897', fontWeight: 500 }}>200+ mosquées</span> et <span style={{ color: '#F0D897', fontWeight: 500 }}>agences Omra</span>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="scroll-indicator" aria-hidden="true">
          <div className="scroll-dot" />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          STATS — animated counters
          ═══════════════════════════════════════════════════════ */}
      <StatsSection />

      {/* Citation */}
      <section style={{ background: '#1A1209', padding: 'clamp(3rem, 6vw, 5rem) 2rem', textAlign: 'center' }}>
        <p style={{
          fontFamily: 'var(--font-cormorant, serif)', fontStyle: 'italic',
          fontSize: 'clamp(1.1rem, 2.5vw, 1.5rem)', color: 'rgba(240,216,151,0.85)',
          maxWidth: 600, margin: '0 auto', lineHeight: 1.75,
        }}>
          &ldquo;Voyage, car dans chaque pas vers les lieux saints,<br />ton âme retrouve ce qu&apos;elle cherchait.&rdquo;
        </p>
      </section>

      {/* ═══════════════════════════════════════════════════════
          QUESTIONNEMENT — Personas / Ce voyage est pour vous
          ═══════════════════════════════════════════════════════ */}
      <section style={{ background: 'var(--cream)', padding: 'clamp(2.5rem, 6vw, 6rem) clamp(1rem, 4vw, 4rem)', borderTop: '1px solid var(--sand)' }}>
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
      <section style={{ background: 'var(--deep)', padding: 'clamp(2.5rem, 6vw, 7rem) clamp(1rem, 4vw, 4rem)', position: 'relative', overflow: 'hidden' }}>
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
            La majorité des pèlerins font la Omra<br />
            <em style={{ color: 'var(--gold)', fontStyle: 'italic' }}>sans vraiment la comprendre.</em>
          </h2>
          <p className="reveal reveal-d2" style={{ color: 'rgba(255,255,255,0.75)', lineHeight: 1.9, fontSize: '1rem', marginBottom: '1.5rem' }}>
            35 personnes dans un bus. Tu imites les gestes de ceux devant toi. Tu tournes autour de la Kaaba en ne sachant pas vraiment pourquoi tu tournes. Tu cherches un sens à ce que tu vis. Tu rentres chez toi avec une belle photo, mais quelque chose manque.
          </p>
          <p className="reveal reveal-d3" style={{ color: 'rgba(255,255,255,0.75)', lineHeight: 1.9, fontSize: '1rem', marginBottom: '3rem' }}>
            Ce n&apos;est pas la Omra qui était mauvaise. C&apos;est le format. Ce voyage mérite un guide qui prend <em style={{ color: 'rgba(240,216,151,0.8)' }}>ton temps</em>{' '}pour tout t&apos;expliquer, dans ta langue, à ton rythme.
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
      <section style={{ background: 'var(--cream)', padding: 'clamp(2.5rem, 6vw, 6rem) clamp(1rem, 4vw, 4rem)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div className="section-label reveal" style={{ textAlign: 'center' }}>Pourquoi SAFARUMA</div>
          <h2 className="reveal reveal-d1" style={{ textAlign: 'center', marginBottom: '0.75rem' }}>
            Ce que nous avons,<br />
            <em>qu&apos;aucune autre plateforme n&apos;offre</em>
          </h2>
          <p className="reveal reveal-d2" style={{ textAlign: 'center', color: 'var(--muted)', maxWidth: 520, margin: '0 auto 3.5rem', lineHeight: 1.75, fontSize: '0.9rem' }}>
            Nous avons construit SAFARUMA en partant d&apos;une question&nbsp;: qu&apos;est-ce qui rend vraiment une Omra inoubliable&nbsp;?
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
      <section style={{ background: 'white', padding: 'clamp(2.5rem, 6vw, 6rem) clamp(1rem, 4vw, 4rem)', borderTop: '1px solid var(--sand)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div className="section-label reveal">Nos guides</div>
          <h2 className="reveal reveal-d1">
            Des guides qui <em>parlent ta langue</em>
          </h2>
          <div className="reveal reveal-d2" style={{ maxWidth: 520, marginBottom: '3rem' }}>
            <p style={{ color: 'var(--muted)', lineHeight: 1.75, fontSize: '0.9rem', margin: '0 0 0.75rem' }}>
              Moins d&apos;1 guide sur 10 est accepté. Chaque candidat passe un entretien exigeant avant d&apos;obtenir la Certification SAFARUMA.
            </p>
            <Link href="/certification" style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
              fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.06em',
              color: 'var(--gold-dark)', textDecoration: 'none',
              border: '1px solid var(--gold-dark)', borderRadius: 50,
              padding: '0.3rem 0.85rem',
              transition: 'background 0.2s, color 0.2s',
            }}>
              En savoir plus sur la certification →
            </Link>
          </div>

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
                        <span style={{ background: '#1D5C3A', color: 'white', fontSize: '0.52rem', fontWeight: 800, letterSpacing: '0.06em', padding: '0.15rem 0.5rem', borderRadius: 50 }}>
                          {g.extraBadges[0]}
                        </span>
                        <span style={{ background: '#C9A84C', color: '#1A1209', fontSize: '0.52rem', fontWeight: 800, letterSpacing: '0.06em', padding: '0.15rem 0.5rem', borderRadius: 50 }}>
                          {g.extraBadges[1]}
                        </span>
                        <span style={{ background: '#1A4A8A', color: 'white', fontSize: '0.52rem', fontWeight: 800, letterSpacing: '0.06em', padding: '0.15rem 0.5rem', borderRadius: 50 }}>
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
                        <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.75)' }}>{g.location}</div>
                      </div>
                    </div>

                    {/* Rating */}
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ color: 'var(--gold)', fontSize: '0.82rem', letterSpacing: 2 }}>★★★★★</span>
                      <span style={{ fontSize: '0.78rem', color: 'white', fontWeight: 700 }}>{g.rating}</span>
                      {g.isOfficial && g.reviews > 0 ? (
                        <span style={{ fontSize: '0.62rem', background: '#C9A84C', color: '#1A1209', fontWeight: 800, padding: '0.1rem 0.5rem', borderRadius: 50 }}>
                          NOTE PARFAITE
                        </span>
                      ) : g.isOfficial ? (
                        <span style={{ fontSize: '.62rem', background: 'rgba(201,168,76,.1)', color: '#8B6914', padding: '.1rem .5rem', borderRadius: 50, border: '1px solid rgba(201,168,76,.3)' }}>
                          Guide Officiel
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
                    <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.7)', marginTop: '0.5rem' }}>
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

            {/* CTA card — Rejoindre notre réseau */}
            <div className="guide-feat-card reveal reveal-d2" style={{ background: 'linear-gradient(160deg, #0A1A0F 0%, #0E2A16 60%, #0A1A0F 100%)', border: '1px solid rgba(29,158,117,0.3)', boxShadow: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 280 }}>
              <div style={{ textAlign: 'center', padding: '2rem 1.5rem' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🌿</div>
                <div style={{ fontSize: '0.6rem', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#1D9E75', marginBottom: '0.75rem' }}>Vous êtes guide ?</div>
                <h3 style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.35rem', fontWeight: 400, color: 'white', lineHeight: 1.3, marginBottom: '0.75rem' }}>
                  Rejoindre notre réseau de guides
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, marginBottom: '1.5rem' }}>
                  Partagez votre connaissance des lieux saints. Rejoignez les guides certifiés SAFARUMA.
                </p>
                <Link href="/devenir-guide" style={{ display: 'inline-block', background: '#1D9E75', color: 'white', fontSize: '0.78rem', fontWeight: 700, padding: '0.6rem 1.5rem', borderRadius: 50, textDecoration: 'none', letterSpacing: '0.04em' }}>
                  Postuler maintenant →
                </Link>
              </div>
            </div>

            {/* CTA card — Tous les guides */}
            <div className="guide-feat-card reveal reveal-d3" style={{ background: 'linear-gradient(160deg, #1A1209 0%, #2D1F08 60%, #1A0E04 100%)', border: '1px solid rgba(201,168,76,0.15)', boxShadow: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 280 }}>
              <div style={{ textAlign: 'center', padding: '2rem 1.5rem' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>✨</div>
                <div style={{ fontSize: '0.6rem', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(201,168,76,0.7)', marginBottom: '0.75rem' }}>Prochainement</div>
                <h3 style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.35rem', fontWeight: 400, color: 'white', lineHeight: 1.3, marginBottom: '0.75rem' }}>
                  De nouveaux guides arrivent bientôt
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, marginBottom: '1.5rem' }}>
                  Notre sélection s&apos;agrandit. Chaque guide est certifié après un processus rigoureux.
                </p>
                <Link href="/guides" style={{ display: 'inline-block', background: 'rgba(201,168,76,0.12)', color: '#C9A84C', fontSize: '0.78rem', fontWeight: 700, padding: '0.6rem 1.5rem', borderRadius: 50, textDecoration: 'none', letterSpacing: '0.04em', border: '1px solid rgba(201,168,76,0.3)' }}>
                  Voir tous les guides →
                </Link>
              </div>
            </div>
          </div>

          <div className="reveal" style={{ textAlign: 'center', marginTop: '3rem' }}>
            <Link href="/guides" className="btn-primary" style={{ fontSize: '0.88rem' }}>
              Voir tous les guides
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          TÉMOIGNAGES — border gauche dorée
          ═══════════════════════════════════════════════════════ */}
      <section style={{ background: 'white', padding: 'clamp(2.5rem, 6vw, 6rem) clamp(1rem, 4vw, 4rem)', borderTop: '1px solid var(--sand)' }}>
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
          PORTES D'ENTRÉE ÉMOTIONNELLES
          ═══════════════════════════════════════════════════════ */}
      <section style={{ background: 'var(--cream)', padding: 'clamp(2.5rem, 6vw, 6rem) clamp(1rem, 4vw, 4rem)', borderTop: '1px solid var(--sand)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>

          <div className="section-label reveal" style={{ textAlign: 'center' }}>Quelle Omra vous ressemble ?</div>
          <h2 className="reveal reveal-d1" style={{ textAlign: 'center', marginBottom: '.5rem' }}>
            Choisissez <em>votre expérience</em>
          </h2>
          <p className="reveal reveal-d2" style={{ textAlign: 'center', color: 'var(--muted)', maxWidth: 480, margin: '0 auto 3rem', lineHeight: 1.75, fontSize: '.9rem' }}>
            Pas un forfait rigide, une expérience construite autour de vous.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>

            {/* CARTE 1 — Ma première Omra */}
            <Link href="/guides" className="reveal reveal-d1" style={{ textDecoration: 'none' }}>
              <div style={{ background: 'white', border: '1px solid var(--sand)', borderRadius: 16, padding: '1.75rem', height: '100%', cursor: 'pointer' }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#FAF3E0', border: '1px solid rgba(201,168,76,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                  <IconMoon size={20} stroke="#C9A84C" />
                </div>
                <span style={{ display: 'inline-block', fontSize: '.65rem', fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: '#8B6914', background: 'rgba(201,168,76,.12)', padding: '.2rem .6rem', borderRadius: 50, marginBottom: '.75rem' }}>
                  Ma première Omra
                </span>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--deep)', marginBottom: '.5rem' }}>
                  Comprendre chaque geste, dans ta langue
                </h3>
                <p style={{ fontSize: '.82rem', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '1rem' }}>
                  Un guide privé certifié qui t&apos;explique chaque rituel de la Omra. Tawaf, sa&apos;i, du&apos;as, tu rentres transformé.
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.3rem', marginBottom: '1rem' }}>
                  {['Makkah', '1 à 7 pers.', 'Guide privé'].map(t => (
                    <span key={t} style={{ fontSize: '.65rem', fontWeight: 700, color: '#8B6914', background: 'rgba(201,168,76,.1)', border: '1px solid rgba(201,168,76,.2)', padding: '.15rem .5rem', borderRadius: 50 }}>{t}</span>
                  ))}
                </div>
                <div style={{ fontSize: '.75rem', color: 'var(--muted)', marginBottom: '1.25rem' }}>
                  À partir de <span style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.2rem', fontWeight: 700, color: 'var(--deep)' }}>99€</span>{' '}pour toute votre famille ou vos proches · max 7
                </div>
                <div style={{ display: 'inline-block', background: 'var(--deep)', color: '#F0D897', fontSize: '.78rem', fontWeight: 700, padding: '.6rem 1.25rem', borderRadius: 50, letterSpacing: '.04em' }}>
                  Choisir mon guide
                </div>
              </div>
            </Link>

            {/* CARTE 2 — En famille (featured) */}
            <Link href="/guides" className="reveal reveal-d2" style={{ textDecoration: 'none', position: 'relative' }}>
              <div style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', background: '#C9A84C', color: '#1A1209', fontSize: '.6rem', fontWeight: 800, padding: '.2rem .75rem', borderRadius: 50, whiteSpace: 'nowrap', zIndex: 1 }}>
                Le plus choisi
              </div>
              <div style={{ background: 'white', border: '2px solid #C9A84C', borderRadius: 16, padding: '1.75rem', height: '100%', cursor: 'pointer' }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#1A1209', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                  <IconUserGroup size={20} stroke="#C9A84C" />
                </div>
                <span style={{ display: 'inline-block', fontSize: '.65rem', fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: '#F0D897', background: '#1A1209', padding: '.2rem .6rem', borderRadius: 50, marginBottom: '.75rem' }}>
                  L&apos;Omra en famille
                </span>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--deep)', marginBottom: '.5rem' }}>
                  Un moment que toute la famille vivra
                </h3>
                <p style={{ fontSize: '.82rem', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '1rem' }}>
                  Guide adapté aux enfants, aux personnes âgées et PMR. Makkah et Madinah à votre rythme, dans votre langue.
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.3rem', marginBottom: '1rem' }}>
                  {['Makkah + Madinah', 'Famille', 'PMR'].map(t => (
                    <span key={t} style={{ fontSize: '.65rem', fontWeight: 700, color: '#8B6914', background: 'rgba(201,168,76,.1)', border: '1px solid rgba(201,168,76,.2)', padding: '.15rem .5rem', borderRadius: 50 }}>{t}</span>
                  ))}
                </div>
                <div style={{ fontSize: '.75rem', color: 'var(--muted)', marginBottom: '1.25rem' }}>
                  À partir de <span style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.2rem', fontWeight: 700, color: 'var(--deep)' }}>99€</span>{' '}pour toute votre famille ou vos proches · max 7
                </div>
                <div style={{ display: 'inline-block', background: '#C9A84C', color: '#1A1209', fontSize: '.78rem', fontWeight: 700, padding: '.6rem 1.25rem', borderRadius: 50, letterSpacing: '.04em' }}>
                  Choisir mon guide
                </div>
              </div>
            </Link>

            {/* CARTE 3 — PMR & parents */}
            <Link href="/guides?pmr=true" className="reveal reveal-d3" style={{ textDecoration: 'none' }}>
              <div style={{ background: 'white', border: '1px solid var(--sand)', borderRadius: 16, padding: '1.75rem', height: '100%', cursor: 'pointer' }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#F0F8F5', border: '1px solid rgba(29,92,58,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                  <IconAccessibility size={20} stroke="#C9A84C" />
                </div>
                <span style={{ display: 'inline-block', fontSize: '.65rem', fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: '#1D5C3A', background: 'rgba(29,92,58,.1)', padding: '.2rem .6rem', borderRadius: 50, marginBottom: '.75rem' }}>
                  Omra PMR &amp; parents
                </span>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--deep)', marginBottom: '.5rem' }}>
                  Votre parent mérite de faire le tawaf
                </h3>
                <p style={{ fontSize: '.82rem', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '1rem' }}>
                  Fauteuil roulant, mobilité réduite, personne âgée, prise en charge totale. Guide PMR certifié SAFARUMA. Tawaf en fauteuil inclus.
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.3rem', marginBottom: '1rem' }}>
                  {['PMR inclus', 'Transport adapté', 'Tawaf fauteuil'].map(t => (
                    <span key={t} style={{ fontSize: '.65rem', fontWeight: 700, color: '#8B6914', background: 'rgba(201,168,76,.1)', border: '1px solid rgba(201,168,76,.2)', padding: '.15rem .5rem', borderRadius: 50 }}>{t}</span>
                  ))}
                </div>
                <div style={{ fontSize: '.75rem', color: 'var(--muted)', marginBottom: '1.25rem' }}>
                  À partir de <span style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.2rem', fontWeight: 700, color: 'var(--deep)' }}>99€</span>{' '}+ 39€ PMR · pour toute votre famille ou vos proches · max 7
                </div>
                <div style={{ display: 'inline-block', background: 'var(--deep)', color: '#F0D897', fontSize: '.78rem', fontWeight: 700, padding: '.6rem 1.25rem', borderRadius: 50, letterSpacing: '.04em' }}>
                  Choisir mon guide
                </div>
              </div>
            </Link>

          </div>

          <div style={{ background: 'white', border: '1px solid var(--sand)', borderRadius: 12, padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }} className="reveal">
            <p style={{ fontSize: '.85rem', color: 'var(--muted)', margin: 0 }}>
              Vous avez une demande spécifique ? Composez votre Omra librement.
            </p>
            <Link href="/guides" className="btn-secondary" style={{ fontSize: '.82rem', whiteSpace: 'nowrap' }}>
              Voir tous les guides
            </Link>
          </div>

        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          LIEUX SAINTS — 6 cards avec hover arabique
          ═══════════════════════════════════════════════════════ */}
      <section style={{ background: 'var(--cream)', padding: 'clamp(2.5rem, 6vw, 6rem) clamp(1rem, 4vw, 4rem)', borderTop: '1px solid var(--sand)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div className="section-label reveal">Les lieux saints</div>
          <h2 className="reveal reveal-d1">
            <em>26 lieux</em> que ton guide<br />te fera vivre autrement
          </h2>
          <p className="reveal reveal-d2" style={{ color: 'var(--muted)', maxWidth: 520, lineHeight: 1.75, marginBottom: '3rem', fontSize: '0.9rem' }}>
            De la grotte de Hira où la première révélation descendit, à Masjid Quba, première mosquée de l&apos;Islam. Chaque lieu cache une histoire que ton guide te fera vivre de l&apos;intérieur.
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
      <section style={{ background: 'var(--deep)', padding: 'clamp(2.5rem, 6vw, 6rem) clamp(1rem, 4vw, 4rem)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 70% 90% at 50% 100%, rgba(201,168,76,0.06) 0%, transparent 55%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div className="reveal" style={{ fontFamily: '"Scheherazade New", "Amiri", "Traditional Arabic", serif', fontSize: 'clamp(2rem, 5vw, 4rem)', color: '#C9A84C', WebkitTextFillColor: '#C9A84C', lineHeight: 1, marginBottom: '1rem', direction: 'rtl', textRendering: 'optimizeLegibility', WebkitFontSmoothing: 'antialiased', unicodeBidi: 'embed' }}>
            وَمَن يُعَظِّمْ شَعَائِرَ اللَّهِ
          </div>
          <p className="reveal reveal-d1" style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.2rem', fontStyle: 'italic', color: 'rgba(255,255,255,0.65)', lineHeight: 1.6, marginBottom: '0.75rem' }}>
            &ldquo;Et quiconque honore les rites sacrés d&apos;Allah, c&apos;est assurément le fruit de la piété des cœurs.&rdquo;
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
            <Link href="/charte-islamique" style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.65rem 1.5rem',
              borderRadius: 50,
              border: '1.5px solid rgba(201,168,76,0.5)',
              color: '#C9A84C',
              fontSize: '0.8rem',
              fontWeight: 700,
              letterSpacing: '0.06em',
              textDecoration: 'none',
              fontFamily: 'inherit',
            }}>
              <svg width="13" height="13" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" strokeWidth="2"
                strokeLinecap="round">
                <polyline points="20,6 9,17 4,12"/>
              </svg>
              Nos guides s&apos;engagent
            </Link>
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
              background: 'linear-gradient(135deg, #1A1209 0%, #2D1F08 100%)',
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
                  <span style={{ display: 'inline-block', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(201,168,76,0.85)', background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.2)', padding: '0.22rem 0.65rem', borderRadius: 4, marginBottom: '0.7rem' }}>Guide de la Omra</span>
                  <h3 style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: 'clamp(1.4rem, 3vw, 1.9rem)', color: 'white', margin: '0 0 0.65rem', lineHeight: 1.2, fontWeight: 400 }}>Guide complet de la Omra</h3>
                  <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, margin: 0 }}>Ihram, Tawaf, Sa&apos;i, Tahallul, chaque rituel expliqué avec ses du&apos;as, significations spirituelles et checklist de préparation.</p>
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
        <svg
          viewBox="0 0 600 120"
          xmlns="http://www.w3.org/2000/svg"
          style={{
            width: 'clamp(300px, 60vw, 700px)',
            opacity: 0.06,
            display: 'block',
            margin: '0 auto 0.5rem',
            pointerEvents: 'none',
            userSelect: 'none',
          }}
          aria-hidden="true"
        >
          <text
            x="50%"
            y="85"
            textAnchor="middle"
            fontFamily='"Scheherazade New", "Amiri", serif'
            fontSize="100"
            fill="#C9A84C"
            direction="rtl"
          >
            سفاروما
          </text>
        </svg>
        <h2 className="reveal reveal-d1" style={{ color: 'white', marginTop: '-1rem' }}>
          Ta Omra mérite mieux.
        </h2>
        <p className="reveal reveal-d2" style={{ color: 'rgba(255,255,255,0.7)', maxWidth: 480, margin: '1rem auto 2.5rem', lineHeight: 1.85, fontSize: '0.95rem' }}>
          Rejoins des milliers de pèlerins à travers le monde qui ont vécu une Omra privée, profonde et inoubliable avec un guide qui a consacré sa vie à ce moment.
        </p>
        <div className="reveal reveal-d3" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '.75rem' }}>
          <Link href="/guides" className="btn-hero-cta" style={{ background: 'var(--gold)', color: 'var(--deep)', borderColor: 'var(--gold)' }}>
            Trouver mon guide
          </Link>
          <span style={{ fontSize: '.72rem', color: 'rgba(255,255,255,.3)', display: 'flex', alignItems: 'center', gap: '.4rem' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#27AE60', display: 'inline-block', animation: 'pulseOpacity 2s infinite' }} />
            {nbDisponibles} guides disponibles ce mois
          </span>
        </div>
      </section>

      <Footer />
    </>
  );
}
