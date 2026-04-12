"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

/* ─── Navigation sections ─── */
const SECTIONS = [
  { id: 'intro',       label: 'Introduction' },
  { id: 'preparation', label: 'Préparation' },
];


export default function GuideOmraClient() {
  const [progress, setProgress] = useState(0);
  const [activeSection, setActiveSection] = useState("intro");
  const mainRef = useRef<HTMLDivElement>(null);

  /* ─── Scroll progress + active section ─── */
  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement;
      const scrolled = el.scrollTop;
      const total = el.scrollHeight - el.clientHeight;
      setProgress(total > 0 ? Math.round((scrolled / total) * 100) : 0);

      for (let i = SECTIONS.length - 1; i >= 0; i--) {
        const sec = document.getElementById(SECTIONS[i].id);
        if (sec && sec.getBoundingClientRect().top <= 120) {
          setActiveSection(SECTIONS[i].id);
          break;
        }
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ─── Reveal animation ─── */
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>(".go-reveal");
    if (!els.length) return;
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { (e.target as HTMLElement).style.opacity = "1"; (e.target as HTMLElement).style.transform = "translateY(0)"; } }),
      { threshold: 0.12 }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="guide-omra">
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Tajawal:wght@400;500;700&display=swap');

        .guide-omra { --go-gold: #C9A84C; --go-deep: #1A1209; --go-ink: #2C1810; --go-sand: #F5F0E8; --go-text: #3D2B1F; font-family: var(--font-manrope, sans-serif); }

        /* Progress bar */
        .go-progress-bar { position: fixed; top: 0; left: 0; height: 3px; background: var(--go-gold); transition: width 0.2s ease; z-index: 200; }

        /* Hero */
        .go-hero { position: relative; background: var(--go-deep); min-height: 50vh; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 7rem 1.5rem 3rem; overflow: hidden; }
        @media (max-width: 768px) {
          .go-hero { min-height: 40vh; padding: 6rem 1.25rem 2.5rem; }
          .go-hero h1 { font-size: clamp(1.6rem, 7vw, 2.4rem); }
          .go-hero-sub { font-size: 0.88rem; margin-bottom: 1.5rem; }
          .go-layout { padding: 1.25rem 1rem 3rem; gap: 1.5rem; }
          .go-section { margin-bottom: 2rem; }
          .go-step { padding: 1.1rem; gap: 0.85rem; }
          .go-dua-card { padding: 1.25rem; }
          .go-dua-arabic { font-size: 1.25rem; }
          .go-info-grid { grid-template-columns: 1fr 1fr; gap: 0.65rem; }
          .go-info-box { padding: 1rem; }
          .go-cta-block { padding: 2rem 1.25rem; }
          .go-cta-block h3 { font-size: 1.35rem; }
        }
        .go-hero-arabic { font-family: 'Tajawal', 'Cinzel', serif; font-size: clamp(5rem, 18vw, 12rem); color: rgba(201,168,76,0.06); position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); pointer-events: none; line-height: 1; direction: rtl; white-space: nowrap; }
        .go-hero-eyebrow { font-size: 0.72rem; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; color: var(--go-gold); margin-bottom: 1.25rem; }
        .go-hero h1 { font-family: 'Cinzel', var(--font-cormorant, serif); font-size: clamp(2.2rem, 6vw, 4.2rem); font-weight: 600; color: white; line-height: 1.15; max-width: 720px; margin: 0 auto 1.25rem; }
        .go-hero-sub { font-size: 1.05rem; color: rgba(255,255,255,0.5); max-width: 560px; margin: 0 auto 2.5rem; line-height: 1.85; }
        .go-hero-badges { display: flex; gap: 0.75rem; justify-content: center; flex-wrap: wrap; }
        .go-hero-badge { background: rgba(201,168,76,0.12); border: 1px solid rgba(201,168,76,0.25); color: rgba(201,168,76,0.9); font-size: 0.72rem; font-weight: 600; letter-spacing: 0.08em; padding: 0.35rem 0.9rem; border-radius: 20px; }

        /* Layout */
        .go-layout { display: grid; grid-template-columns: 240px 1fr; gap: 3rem; max-width: 1200px; margin: 0 auto; padding: 2rem 2rem 4rem; }
        @media (max-width: 900px) { .go-layout { grid-template-columns: 1fr; } .go-sidebar { display: none; } }

        /* Sidebar TOC */
        .go-sidebar { position: sticky; top: 5rem; align-self: start; }
        .go-toc-title { font-size: 0.65rem; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; color: rgba(44,24,16,0.4); margin-bottom: 1rem; }
        .go-toc-link { display: block; font-size: 0.82rem; font-weight: 500; color: rgba(44,24,16,0.45); padding: 0.4rem 0 0.4rem 0.85rem; border-left: 2px solid transparent; cursor: pointer; transition: all 0.2s; text-decoration: none; }
        .go-toc-link:hover, .go-toc-link.active { color: var(--go-gold); border-left-color: var(--go-gold); }
        .go-checklist-progress { margin-top: 2rem; background: var(--go-sand); border-radius: 10px; padding: 1rem 1.1rem; }
        .go-cp-label { font-size: 0.72rem; font-weight: 600; letter-spacing: 0.08em; color: var(--go-text); margin-bottom: 0.6rem; }
        .go-cp-bar-bg { height: 6px; background: rgba(201,168,76,0.15); border-radius: 3px; overflow: hidden; }
        .go-cp-bar-fill { height: 100%; background: var(--go-gold); border-radius: 3px; transition: width 0.4s ease; }

        /* Content */
        .go-content { max-width: 760px; }
        .go-section { margin-bottom: 2.5rem; scroll-margin-top: 5rem; }
        .go-section-tag { display: inline-block; font-size: 0.65rem; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: var(--go-gold); background: rgba(201,168,76,0.08); border: 1px solid rgba(201,168,76,0.2); padding: 0.25rem 0.7rem; border-radius: 4px; margin-bottom: 0.85rem; }
        .go-section h2 { font-family: 'Cinzel', var(--font-cormorant, serif); font-size: clamp(1.6rem, 4vw, 2.4rem); font-weight: 600; color: var(--go-deep); margin: 0 0 1.25rem; line-height: 1.2; }
        .go-section p { font-size: 0.95rem; color: #4A3728; line-height: 1.9; margin-bottom: 1.1rem; }
        .go-section strong { color: var(--go-deep); }

        /* Step cards */
        .go-steps { display: flex; flex-direction: column; gap: 0.85rem; margin: 1.25rem 0; }
        .go-step { display: flex; gap: 1rem; background: #F8F4EC; border-radius: 12px; padding: 1.25rem; border-left: 3px solid var(--go-gold); }
        .go-step-num { flex-shrink: 0; width: 36px; height: 36px; background: var(--go-deep); color: var(--go-gold); font-family: 'Cinzel', serif; font-size: 0.9rem; font-weight: 700; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
        .go-step-body h3 { font-size: 1rem; font-weight: 700; color: var(--go-deep); margin: 0 0 0.4rem; }
        .go-step-body p { font-size: 0.875rem; color: #3D2510; line-height: 1.75; margin: 0; }

        /* Ritual info boxes */
        .go-info-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 0.85rem; margin: 1rem 0; }
        .go-info-box { background: white; border: 1px solid rgba(201,168,76,0.2); border-radius: 10px; padding: 1.25rem; }
        .go-info-box-icon { font-size: 1.4rem; margin-bottom: 0.5rem; }
        .go-info-box h4 { font-size: 0.78rem; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: var(--go-gold); margin: 0 0 0.3rem; }
        .go-info-box p { font-size: 0.83rem; color: #5A4535; line-height: 1.6; margin: 0; }

        /* Du'as */
        .go-dua-card { background: #0D0805; border: 1px solid rgba(201,168,76,0.25); border-radius: 12px; padding: 1.5rem 1.75rem; margin-bottom: 1rem; }
        .go-dua-label { font-size: 0.68rem; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: #C9A84C; margin-bottom: 0.65rem; }
        .go-dua-arabic { font-family: 'Tajawal', serif; font-size: 1.5rem; color: #F0D897; direction: rtl; line-height: 1.8; margin-bottom: 0.75rem; text-align: right; }
        .go-dua-transliteration { font-size: 0.82rem; font-style: italic; color: rgba(255,255,255,0.65); margin-bottom: 0.4rem; }
        .go-dua-translation { font-size: 0.88rem; color: rgba(255,255,255,0.85); line-height: 1.65; }

        /* Checklist */
        .go-checklist-cat { margin-bottom: 2rem; }
        .go-checklist-cat-title { font-size: 0.78rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--go-gold); margin-bottom: 0.9rem; padding-bottom: 0.5rem; border-bottom: 1px solid rgba(201,168,76,0.2); }
        .go-check-item { display: flex; align-items: center; gap: 0.85rem; padding: 0.65rem 0; cursor: pointer; border-bottom: 1px solid rgba(0,0,0,0.04); }
        .go-check-box { width: 20px; height: 20px; border: 2px solid rgba(201,168,76,0.4); border-radius: 5px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; transition: all 0.15s; background: transparent; }
        .go-check-box.checked { background: var(--go-gold); border-color: var(--go-gold); }
        .go-check-label { font-size: 0.88rem; color: #4A3728; line-height: 1.5; transition: color 0.15s; }
        .go-check-label.checked { text-decoration: line-through; color: rgba(74,55,40,0.4); }

        /* FAQ accordion */
        .go-faq-item { border-bottom: 1px solid rgba(44,24,16,0.08); }
        .go-faq-q { display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding: 1.2rem 0; cursor: pointer; font-size: 0.95rem; font-weight: 600; color: var(--go-deep); }
        .go-faq-q:hover { color: var(--go-gold); }
        .go-faq-icon { flex-shrink: 0; width: 22px; height: 22px; border-radius: 50%; background: rgba(201,168,76,0.1); display: flex; align-items: center; justify-content: center; font-size: 0.9rem; color: var(--go-gold); transition: transform 0.2s; }
        .go-faq-icon.open { transform: rotate(45deg); }
        .go-faq-a { font-size: 0.88rem; color: #5A4535; line-height: 1.8; padding-bottom: 1.25rem; display: none; }
        .go-faq-a.open { display: block; }

        /* CTA block */
        .go-cta-block { background: var(--go-deep); border-radius: 16px; padding: 2.5rem 2.5rem; margin-top: 4rem; text-align: center; position: relative; overflow: hidden; }
        .go-cta-block::before { content: 'عمرة'; font-family: 'Tajawal', serif; font-size: 9rem; color: rgba(201,168,76,0.04); position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); pointer-events: none; direction: rtl; white-space: nowrap; }
        .go-cta-block h3 { font-family: 'Cinzel', var(--font-cormorant, serif); font-size: 1.7rem; color: white; margin: 0 0 0.75rem; position: relative; }
        .go-cta-block p { font-size: 0.9rem; color: rgba(255,255,255,0.5); margin: 0 auto 2rem; max-width: 480px; line-height: 1.8; position: relative; }
        .go-cta-btns { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; position: relative; }
        .go-btn-gold { background: var(--go-gold); color: var(--go-deep); font-weight: 700; font-size: 0.88rem; padding: 0.85rem 2rem; border-radius: 8px; text-decoration: none; letter-spacing: 0.04em; transition: opacity 0.2s; }
        .go-btn-gold:hover { opacity: 0.88; }
        .go-btn-outline { background: transparent; color: rgba(255,255,255,0.7); font-weight: 600; font-size: 0.88rem; padding: 0.85rem 2rem; border-radius: 8px; text-decoration: none; border: 1px solid rgba(255,255,255,0.15); transition: border-color 0.2s, color 0.2s; }
        .go-btn-outline:hover { border-color: var(--go-gold); color: var(--go-gold); }

        /* Reveal animation base */
        .go-reveal { opacity: 0; transform: translateY(22px); transition: opacity 0.65s ease, transform 0.65s ease; }
        .go-reveal-d1 { transition-delay: 0.1s; }
        .go-reveal-d2 { transition-delay: 0.2s; }
        .go-reveal-d3 { transition-delay: 0.3s; }

        /* Alert box */
        .go-alert { background: rgba(201,168,76,0.07); border: 1px solid rgba(201,168,76,0.25); border-radius: 10px; padding: 1.1rem 1.4rem; margin: 1.5rem 0; display: flex; gap: 0.85rem; align-items: flex-start; }
        .go-alert-icon { font-size: 1.1rem; flex-shrink: 0; margin-top: 0.05rem; }
        .go-alert p { font-size: 0.875rem; color: #4A3728; line-height: 1.75; margin: 0; }

        /* Mobile TOC strip */
        .go-mobile-toc { display: none; position: sticky; top: 56px; z-index: 50; background: white; border-bottom: 1px solid var(--go-sand); padding: 0.75rem 1.25rem; overflow-x: auto; white-space: nowrap; gap: 0.5rem; scrollbar-width: none; }
        .go-mobile-toc::-webkit-scrollbar { display: none; }
        @media (max-width: 900px) { .go-mobile-toc { display: flex; } }
        .go-mobile-toc a { flex-shrink: 0; font-size: 0.75rem; font-weight: 600; color: rgba(44,24,16,0.5); padding: 0.3rem 0.75rem; border-radius: 20px; border: 1px solid rgba(44,24,16,0.1); cursor: pointer; text-decoration: none; }
        .go-mobile-toc a.active { background: var(--go-deep); color: var(--go-gold); border-color: var(--go-deep); }
      `}} />

      {/* Progress bar */}
      <div className="go-progress-bar" style={{ width: `${progress}%` }} />

      <Navbar />

      {/* Hero */}
      <section className="go-hero">
        <div className="go-hero-arabic">عمرة</div>
        <p className="go-hero-eyebrow go-reveal">Guide Spirituel Complet</p>
        <h1 className="go-reveal go-reveal-d1">La Omra étape par étape — Rituels, Du'as & Conseils</h1>
        <p className="go-hero-sub go-reveal go-reveal-d2">
          De l'Ihram au Tahallul, chaque rituel expliqué avec sa signification profonde, ses du'as et ses recommandations pratiques pour vivre pleinement ce voyage sacré.
        </p>
        <div className="go-hero-badges go-reveal go-reveal-d3">
          <span className="go-hero-badge">Ihram</span>
          <span className="go-hero-badge">Tawaf</span>
          <span className="go-hero-badge">Sa'i</span>
          <span className="go-hero-badge">Tahallul</span>
          <span className="go-hero-badge">Du'as</span>
          <span className="go-hero-badge">Checklist</span>
        </div>
      </section>

      {/* Mobile sticky TOC */}
      <div className="go-mobile-toc">
        {SECTIONS.map((s) => (
          <a
            key={s.id}
            className={activeSection === s.id ? "active" : ""}
            onClick={() => scrollTo(s.id)}
          >
            {s.label}
          </a>
        ))}
      </div>

      {/* Main layout */}
      <div className="go-layout" ref={mainRef}>
        {/* Sidebar */}
        <aside className="go-sidebar">
          <p className="go-toc-title">Table des matières</p>
          {SECTIONS.map((s) => (
            <a
              key={s.id}
              className={`go-toc-link${activeSection === s.id ? " active" : ""}`}
              onClick={() => scrollTo(s.id)}
            >
              {s.label}
            </a>
          ))}

        </aside>

        {/* Content */}
        <main className="go-content">

          {/* INTRODUCTION */}
          <section id="intro" className="go-section">
            <span className="go-section-tag go-reveal">Bienvenue</span>
            <h2 className="go-reveal go-reveal-d1">Qu'est-ce que la Omra ?</h2>
            <p className="go-reveal go-reveal-d2">
              La Omra — en arabe <strong>العمرة</strong> — est le pèlerinage mineur à La Mecque. Contrairement au Hajj, elle peut être accomplie à n'importe quel moment de l'année et n'est pas obligatoire, mais elle est <strong>fortement recommandée</strong> (sunnah) et constitue une expiation des péchés d'une vie entière.
            </p>
            <p className="go-reveal go-reveal-d2">
              Le Prophète ﷺ a dit : <em>«La Omra jusqu'à la Omra suivante est une expiation pour ce qui s'est passé entre elles.»</em> (Bukhari & Muslim). C'est un voyage de retour à Dieu, un renouveau de l'âme, une renaissance spirituelle.
            </p>

            <div className="go-info-grid go-reveal go-reveal-d3">
              {[
                { icon: "⏱", title: "Durée", body: "3h à 6h pour les rituels complets, selon l'affluence" },
                { icon: "🕌", title: "Lieu", body: "La Mecque (Masjid Al-Haram) — Makkah Al-Mukarramah" },
                { icon: "📅", title: "Période", body: "Toute l'année — avec ou hors saison du Ramadan" },
                { icon: "🤲", title: "Condition", body: "Être musulman(e), en état de pureté rituelle, niyyah sincère" },
              ].map((b) => (
                <div key={b.title} className="go-info-box">
                  <div className="go-info-box-icon">{b.icon}</div>
                  <h4>{b.title}</h4>
                  <p>{b.body}</p>
                </div>
              ))}
            </div>

            <div className="go-alert go-reveal">
              <span className="go-alert-icon">✦</span>
              <p>La Omra se compose de <strong>quatre rituels essentiels</strong> dans cet ordre : l'Ihram → le Tawaf → la Sa'i → le Tahallul. Chacun a sa dimension spirituelle propre et ses conditions de validité.</p>
            </div>
          </section>

          {/* PRÉPARATION */}
          <section id="preparation" className="go-section">
            <span className="go-section-tag go-reveal">Avant le départ</span>
            <h2 className="go-reveal go-reveal-d1">La Préparation</h2>
            <p className="go-reveal go-reveal-d2">
              La Omra commence bien avant d'embarquer dans l'avion. Une préparation sérieuse — spirituelle, physique et logistique — fait toute la différence entre un voyage accompli mécaniquement et une expérience qui transforme.
            </p>

            {/* Questions Ihram & Miqat */}
            <div className="go-steps go-reveal">

              <div className="go-step">
                <div className="go-step-num">1</div>
                <div className="go-step-body">
                  <h3>Quand dois-je enfiler l'Ihram ?</h3>
                  <p>
                    Avant de franchir le <strong>Miqat</strong> — la frontière
                    sacrée à partir de laquelle il est interdit d'entrer
                    sans être en état de sacralisation. Dans l'avion,
                    l'équipage vous préviendra avant le passage.
                    La règle d'or : <strong>enfilez l'Ihram avant même
                    de monter dans l'avion</strong> pour ne prendre aucun risque.
                  </p>
                </div>
              </div>

              <div className="go-step">
                <div className="go-step-num">2</div>
                <div className="go-step-body">
                  <h3>Puis-je enlever l'Ihram à l'arrivée pour me reposer ?</h3>
                  <p>
                    <strong>Non.</strong> Une fois l'Ihram enfilé et la Niyyah
                    prononcée au Miqat, vous êtes en état de sacralisation.
                    Vous ne pouvez plus l'enlever avant d'avoir accompli
                    la Omra complète — même si vous souhaitez vous reposer
                    à l'hôtel d'abord. Vous pouvez vous reposer en Ihram,
                    mais l'enlever avant la Omra est interdit et entraîne
                    une pénalité (<em>Fidya</em>).
                  </p>
                </div>
              </div>

              <div className="go-step">
                <div className="go-step-num">3</div>
                <div className="go-step-body">
                  <h3>Comment prononcer l'intention (Niyyah) ?</h3>
                  <p>
                    La Niyyah se prononce au moment du passage du Miqat.
                    En arabe : <strong style={{ fontFamily: 'Tajawal, serif',
                    fontSize: '1.1rem', direction: 'rtl', display: 'inline-block' }}>
                    لَبَّيْكَ اللَّهُمَّ عُمْرَةً</strong>
                    <br/>
                    <em>&quot;Labbayka Allahumma &apos;Umratan&quot;</em> —
                    &quot;Me voici, ô Allah, pour la Omra.&quot;
                    Suivi du Talbiyah que vous répéterez jusqu'au début du Tawaf.
                  </p>
                </div>
              </div>

            </div>

            <div className="go-alert go-reveal">
              <span className="go-alert-icon">✦</span>
              <p>
                <strong>Il existe 5 Miqats terrestres</strong> selon votre pays
                d'origine et votre itinéraire. Les pèlerins français passent
                en général par <em>Qarn Al-Manazil</em> (vol direct) ou
                <em> Yalamlam</em> (via Dubaï). Le guide complet détaille
                chaque Miqat, la procédure dans l'avion, et tout ce qu'il
                faut savoir sur l'état de sacralisation.
              </p>
            </div>

          </section>

          {/* PAYWALL */}
          <div style={{
            background: 'linear-gradient(135deg, #1A1209 0%, #2D1F08 100%)',
            border: '1px solid rgba(201,168,76,0.3)',
            borderRadius: 20,
            padding: '3rem 2rem',
            textAlign: 'center',
            margin: '3rem 0',
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(201,168,76,0.08) 0%, transparent 60%)', pointerEvents: 'none' }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🕋</div>
              <h3 style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.8rem', color: 'white', fontWeight: 600, marginBottom: '0.75rem', lineHeight: 1.2 }}>
                La suite du guide est gratuite
              </h3>
              <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.9rem', lineHeight: 1.7, marginBottom: '2rem', maxWidth: 420, margin: '0 auto 2rem' }}>
                Sa&apos;i, Tahallul, Du&apos;as essentielles et Checklist complète — accessibles dans votre espace pèlerin gratuit.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: 320, margin: '0 auto' }}>
                <a href="/inscription?redirect=/espace/guide-omra" style={{ display: 'block', background: '#C9A84C', color: '#1A1209', padding: '0.9rem 2rem', borderRadius: 50, fontWeight: 700, fontSize: '0.95rem', textDecoration: 'none', letterSpacing: '0.04em' }}>
                  Créer mon espace gratuitement →
                </a>
                <a href="/connexion?redirect=/espace/guide-omra" style={{ display: 'block', background: 'transparent', color: 'rgba(255,255,255,0.5)', padding: '0.7rem', fontSize: '0.82rem', textDecoration: 'none' }}>
                  Déjà un compte ? Accéder au guide complet
                </a>
              </div>
              <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', marginTop: '1.5rem', flexWrap: 'wrap' }}>
                {["Sa'i & Tahallul", "Du'as essentielles", 'Checklist complète', 'FAQ Omra'].map(t => (
                  <span key={t} style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <span style={{ color: '#C9A84C' }}>✓</span> {t}
                  </span>
                ))}
              </div>
            </div>
          </div>

        </main>
      </div>

      <Footer />
    </div>
  );
}
