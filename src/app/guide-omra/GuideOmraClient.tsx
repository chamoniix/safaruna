"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

/* ─── Navigation sections ─── */
const SECTIONS = [
  { id: "intro", label: "Introduction" },
  { id: "preparation", label: "Préparation" },
  { id: "ihram", label: "L'Ihram" },
  { id: "tawaf", label: "Le Tawaf" },
  { id: "sai", label: "La Sa'i" },
  { id: "tahallul", label: "Le Tahallul" },
  { id: "duas", label: "Du'as essentielles" },
  { id: "checklist", label: "Checklist" },
  { id: "faq", label: "FAQ" },
];

/* ─── FAQ items ─── */
const FAQ_ITEMS = [
  {
    q: "Combien de temps dure une Omra ?",
    a: "La Omra elle-même (Ihram → Tawaf → Sa'i → Tahallul) dure entre 3h et 6h selon l'affluence. Les séjours complets pour un pèlerin francophone durent généralement entre 7 et 14 jours pour profiter pleinement des lieux saints.",
  },
  {
    q: "Peut-on faire la Omra sans guide privé ?",
    a: "Oui, techniquement. Mais sans guide, on risque d'accomplir les rituels mécaniquement, sans en comprendre la profondeur. Un guide mutawwif francophone vous explique chaque geste, vous enseigne les du'as appropriées et vous accompagne spirituellement — une différence fondamentale.",
  },
  {
    q: "Quelle est la différence entre la Omra et le Hajj ?",
    a: "La Omra est le «petit pèlerinage» : elle n'est pas obligatoire mais fortement recommandée, et peut être accomplie à n'importe quel moment de l'année. Le Hajj est le «grand pèlerinage», cinquième pilier de l'Islam, obligatoire une fois dans la vie si l'on en a les moyens, et limité au mois de Dhoul Hijja.",
  },
  {
    q: "Quels documents sont nécessaires pour la Omra ?",
    a: "Passeport valide au moins 6 mois, visa Omra (obtenu via une agence agréée ou directement sur la plateforme Nusuk), carnet de vaccination (méningite obligatoire, Covid selon les périodes), et pour les femmes de moins de 45 ans voyageant sans mahram : autorisation familiale selon les nouvelles règles saoudiennes.",
  },
  {
    q: "Peut-on faire la Omra en famille avec des enfants ?",
    a: "Absolument. Les enfants peuvent accomplir la Omra accompagnés de leurs parents. Un guide SAFARUMA s'adapte au rythme de la famille, explique les rituels aux enfants de façon accessible, et gère les moments de fatigue. C'est souvent une expérience transformatrice pour les familles.",
  },
  {
    q: "Y a-t-il des restrictions pour les femmes ?",
    a: "Les femmes accomplissent la Omra exactement comme les hommes, sauf pour l'Ihram : elles portent leurs vêtements normaux couvrants (pas de couture interdite pour elles) et ne se rasent pas la tête — elles coupent seulement une mèche de cheveux pour le Tahallul. Depuis 2021, les femmes de plus de 45 ans peuvent voyager en groupe sans mahram.",
  },
  {
    q: "Comment se préparer spirituellement avant la Omra ?",
    a: "Commencez 40 jours avant : purifiez vos actes (remboursez vos dettes, réconciliez-vous avec vos proches), intensifiez vos adorations (dhikr, lecture du Coran, prières nocturnes), apprenez les du'as des rituels, et fixez vos intentions avec sincérité. SAFARUMA propose un livret de préparation spirituelle gratuit.",
  },
];

/* ─── Checklist items ─── */
const CHECKLIST = [
  { cat: "Documents", items: ["Passeport valide +6 mois", "Visa Omra obtenu", "Carnet de vaccination (méningite)", "Assurance voyage souscrite"] },
  { cat: "Tenue Ihram", items: ["2 pièces blanches non cousues (hommes)", "Vêtements couvrants sans parfum (femmes)", "Ceinture pour fixer l'Ihram", "Sandales ouvertes"] },
  { cat: "Soin & Hygiène", items: ["Savon et shampooing sans parfum", "Crème solaire sans parfum", "Médicaments essentiels (antidouleur, anti-diarrhée)", "Bas et chaussettes confortables"] },
  { cat: "Spirituel", items: ["Du'as mémorisées ou imprimées", "Petit Coran ou application", "Tasbih (chapelet)", "Livret de préparation SAFARUMA"] },
  { cat: "Pratique", items: ["Numéro de votre guide SAFARUMA noté", "Application SAFARUMA téléchargée", "Eau Zamzam réservée", "Monnaie saoudienne (SAR)"] },
];

export default function GuideOmraClient() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
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

  const toggleCheck = (key: string) =>
    setChecked((prev) => ({ ...prev, [key]: !prev[key] }));

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const totalItems = CHECKLIST.reduce((s, c) => s + c.items.length, 0);
  const checkedCount = Object.values(checked).filter(Boolean).length;

  return (
    <div className="guide-omra">
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Tajawal:wght@400;500;700&display=swap');

        .guide-omra { --go-gold: #C9A84C; --go-deep: #1A1209; --go-ink: #2C1810; --go-sand: #F5F0E8; --go-text: #3D2B1F; font-family: var(--font-manrope, sans-serif); }

        /* Progress bar */
        .go-progress-bar { position: fixed; top: 0; left: 0; height: 3px; background: var(--go-gold); transition: width 0.2s ease; z-index: 200; }

        /* Hero */
        .go-hero { position: relative; background: var(--go-deep); min-height: 70vh; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 8rem 2rem 5rem; overflow: hidden; }
        .go-hero-arabic { font-family: 'Tajawal', 'Cinzel', serif; font-size: clamp(5rem, 18vw, 12rem); color: rgba(201,168,76,0.06); position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); pointer-events: none; line-height: 1; direction: rtl; white-space: nowrap; }
        .go-hero-eyebrow { font-size: 0.72rem; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; color: var(--go-gold); margin-bottom: 1.25rem; }
        .go-hero h1 { font-family: 'Cinzel', var(--font-cormorant, serif); font-size: clamp(2.2rem, 6vw, 4.2rem); font-weight: 600; color: white; line-height: 1.15; max-width: 720px; margin: 0 auto 1.25rem; }
        .go-hero-sub { font-size: 1.05rem; color: rgba(255,255,255,0.5); max-width: 560px; margin: 0 auto 2.5rem; line-height: 1.85; }
        .go-hero-badges { display: flex; gap: 0.75rem; justify-content: center; flex-wrap: wrap; }
        .go-hero-badge { background: rgba(201,168,76,0.12); border: 1px solid rgba(201,168,76,0.25); color: rgba(201,168,76,0.9); font-size: 0.72rem; font-weight: 600; letter-spacing: 0.08em; padding: 0.35rem 0.9rem; border-radius: 20px; }

        /* Layout */
        .go-layout { display: grid; grid-template-columns: 240px 1fr; gap: 3rem; max-width: 1200px; margin: 0 auto; padding: 4rem 2rem 6rem; }
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
        .go-section { margin-bottom: 5rem; scroll-margin-top: 5rem; }
        .go-section-tag { display: inline-block; font-size: 0.65rem; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: var(--go-gold); background: rgba(201,168,76,0.08); border: 1px solid rgba(201,168,76,0.2); padding: 0.25rem 0.7rem; border-radius: 4px; margin-bottom: 0.85rem; }
        .go-section h2 { font-family: 'Cinzel', var(--font-cormorant, serif); font-size: clamp(1.6rem, 4vw, 2.4rem); font-weight: 600; color: var(--go-deep); margin: 0 0 1.25rem; line-height: 1.2; }
        .go-section p { font-size: 0.95rem; color: #4A3728; line-height: 1.9; margin-bottom: 1.1rem; }
        .go-section strong { color: var(--go-deep); }

        /* Step cards */
        .go-steps { display: flex; flex-direction: column; gap: 1.25rem; margin: 2rem 0; }
        .go-step { display: flex; gap: 1.25rem; background: var(--go-sand); border-radius: 12px; padding: 1.5rem; border-left: 4px solid var(--go-gold); }
        .go-step-num { flex-shrink: 0; width: 36px; height: 36px; background: var(--go-deep); color: var(--go-gold); font-family: 'Cinzel', serif; font-size: 0.9rem; font-weight: 700; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
        .go-step-body h3 { font-size: 1rem; font-weight: 700; color: var(--go-deep); margin: 0 0 0.4rem; }
        .go-step-body p { font-size: 0.875rem; color: #5A4535; line-height: 1.75; margin: 0; }

        /* Ritual info boxes */
        .go-info-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin: 1.75rem 0; }
        .go-info-box { background: white; border: 1px solid rgba(201,168,76,0.2); border-radius: 10px; padding: 1.25rem; }
        .go-info-box-icon { font-size: 1.4rem; margin-bottom: 0.5rem; }
        .go-info-box h4 { font-size: 0.78rem; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: var(--go-gold); margin: 0 0 0.3rem; }
        .go-info-box p { font-size: 0.83rem; color: #5A4535; line-height: 1.6; margin: 0; }

        /* Du'as */
        .go-dua-card { background: var(--go-deep); border-radius: 12px; padding: 1.75rem 2rem; margin-bottom: 1.25rem; }
        .go-dua-label { font-size: 0.68rem; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: rgba(201,168,76,0.7); margin-bottom: 0.75rem; }
        .go-dua-arabic { font-family: 'Tajawal', serif; font-size: 1.6rem; color: rgba(201,168,76,0.9); direction: rtl; line-height: 1.8; margin-bottom: 0.9rem; text-align: right; }
        .go-dua-transliteration { font-size: 0.82rem; font-style: italic; color: rgba(255,255,255,0.45); margin-bottom: 0.5rem; }
        .go-dua-translation { font-size: 0.88rem; color: rgba(255,255,255,0.65); line-height: 1.65; }

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

          <div className="go-checklist-progress">
            <p className="go-cp-label">Checklist — {checkedCount}/{totalItems}</p>
            <div className="go-cp-bar-bg">
              <div className="go-cp-bar-fill" style={{ width: `${totalItems > 0 ? (checkedCount / totalItems) * 100 : 0}%` }} />
            </div>
          </div>
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

            <div className="go-steps go-reveal go-reveal-d2">
              {[
                { num: "1", title: "Réparer ses relations", body: "Remboursez vos dettes, demandez pardon à ceux que vous avez lésés, réconciliez-vous avec votre famille. La Omra est un nouveau départ — partez le cœur léger." },
                { num: "2", title: "Apprendre les du'as", body: "Mémorisez ou imprimez les du'as de chaque rituel. Votre guide SAFARUMA vous les enseignera en contexte, mais les connaître à l'avance enrichit l'expérience." },
                { num: "3", title: "Préparer la tenue", body: "Hommes : deux pièces blanches non cousues (izar + rida) sans coutures. Femmes : vêtements couvrants, sans parfum. Évitez toute chose parfumée dès le miqat." },
                { num: "4", title: "Fortifier l'intention", body: "La niyyah (intention) est le fondement de toute adoration. Prenez le temps de vous demander pourquoi vous faites ce voyage — répondez-y avec votre cœur, pas votre ego." },
                { num: "5", title: "Préparer physiquement", body: "Entraînez-vous à marcher : la Omra implique plusieurs kilomètres à pied. Soignez vos pieds, portez des chaussures confortables rodées et prenez vos médicaments habituels." },
              ].map((s) => (
                <div key={s.num} className="go-step">
                  <div className="go-step-num">{s.num}</div>
                  <div className="go-step-body">
                    <h3>{s.title}</h3>
                    <p>{s.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* IHRAM */}
          <section id="ihram" className="go-section">
            <span className="go-section-tag go-reveal">Rituel 1</span>
            <h2 className="go-reveal go-reveal-d1">L'Ihram — الإحرام</h2>
            <p className="go-reveal go-reveal-d2">
              L'Ihram est l'état sacré dans lequel le pèlerin entre pour accomplir la Omra. Il commence au <strong>miqat</strong> — la frontière géographique sacrée autour de La Mecque — et se compose d'une intention (niyyah), d'une tenue et d'un ensemble d'interdictions.
            </p>
            <p className="go-reveal go-reveal-d2">
              En arabe, <em>ihram</em> vient de la racine «h-r-m» qui désigne le sacré et l'interdit. Entrer en Ihram, c'est quitter le monde ordinaire pour entrer dans un espace-temps consacré uniquement à Dieu.
            </p>

            <div className="go-info-grid go-reveal go-reveal-d3">
              {[
                { icon: "📍", title: "Le Miqat", body: "Frontière au-delà de laquelle on ne peut entrer à La Mecque sans Ihram. Pour les voyageurs aériens : Qarn Al-Manazil ou Dhoul Houlaïfa selon l'itinéraire." },
                { icon: "🕊️", title: "Tenue hommes", body: "Deux pièces de tissu blanc non cousu : l'izar (autour des hanches) et la rida (sur les épaules). Tête nue, pieds en sandales ouvertes." },
                { icon: "🌸", title: "Tenue femmes", body: "Vêtement couvrant habituel, sans parfum, visage et mains découverts. Pas de niqab ni de gants pendant la Omra selon la majorité des savants." },
                { icon: "🚫", title: "Interdictions", body: "Parfum, couper ongles ou cheveux, rapports conjugaux, chasse, couvrir la tête (hommes), se disputer, jurer." },
              ].map((b) => (
                <div key={b.title} className="go-info-box">
                  <div className="go-info-box-icon">{b.icon}</div>
                  <h4>{b.title}</h4>
                  <p>{b.body}</p>
                </div>
              ))}
            </div>

            <h3 className="go-reveal" style={{ fontFamily: "'Cinzel', serif", fontSize: "1.1rem", color: "var(--go-deep)", margin: "2rem 0 1rem" }}>Comment entrer en Ihram</h3>
            <div className="go-steps go-reveal">
              {[
                { num: "1", title: "La purification", body: "Faites le ghusl (bain rituel complet) ou au moins le wudu (ablutions). Appliquez du parfum sur votre corps AVANT d'enfiler la tenue (interdit après)." },
                { num: "2", title: "Enfiler la tenue", body: "Revêtez la tenue d'Ihram. Accompagnez ce geste d'une méditation : vous vous dépouilles de vos signes sociaux. Devant Dieu, tous les humains sont égaux." },
                { num: "3", title: "La prière de 2 rak'at", body: "Avant le miqat, accomplissez 2 rak'at d'intention d'Ihram si possible. Lisez Sourate Al-Kafirun au 1er rak'at, Sourate Al-Ikhlas au 2e." },
                { num: "4", title: "La niyyah et le Talbiyyah", body: "Au miqat, formulez votre intention : «Allahumma inni uridu al-'umrata fa yassir-ha li wa taqabbal-ha minni». Puis commencez à réciter la Talbiyyah à voix haute." },
              ].map((s) => (
                <div key={s.num} className="go-step">
                  <div className="go-step-num">{s.num}</div>
                  <div className="go-step-body">
                    <h3>{s.title}</h3>
                    <p>{s.body}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="go-dua-card go-reveal">
              <p className="go-dua-label">La Talbiyyah — à réciter depuis le miqat jusqu'au début du Tawaf</p>
              <p className="go-dua-arabic">لَبَّيْكَ اللَّهُمَّ لَبَّيْكَ، لَبَّيْكَ لَا شَرِيكَ لَكَ لَبَّيْكَ، إِنَّ الْحَمْدَ وَالنِّعْمَةَ لَكَ وَالْمُلْكَ، لَا شَرِيكَ لَكَ</p>
              <p className="go-dua-transliteration">Labbayk-Allahumma labbayk, labbayk la sharika laka labbayk, innal-hamda wan-ni'mata laka wal-mulk, la sharika lak</p>
              <p className="go-dua-translation">«Me voici, ô Allah, me voici. Me voici, Tu n'as pas d'associé, me voici. En vérité, la louange, la grâce et la royauté T'appartiennent. Tu n'as pas d'associé.»</p>
            </div>
          </section>

          {/* TAWAF */}
          <section id="tawaf" className="go-section">
            <span className="go-section-tag go-reveal">Rituel 2</span>
            <h2 className="go-reveal go-reveal-d1">Le Tawaf — الطواف</h2>
            <p className="go-reveal go-reveal-d2">
              Le Tawaf consiste à tourner <strong>sept fois</strong> autour de la Kaaba dans le sens antihoraire, en commençant et en finissant à la Hajar Al-Aswad (la Pierre Noire). C'est l'image de l'âme qui tourne autour de son centre — Dieu.
            </p>
            <p className="go-reveal go-reveal-d2">
              Durée estimée : <strong>1h30 à 3h</strong> selon l'affluence. Maintenez la wudu pendant tout le Tawaf. Si elle est rompue, quittez l'espace, refaites les ablutions et reprenez depuis le tour interrompu.
            </p>

            <div className="go-info-grid go-reveal go-reveal-d3">
              {[
                { icon: "↩️", title: "Direction", body: "Sens antihoraire (la Kaaba à votre gauche). Commencez et finissez à la Hajar Al-Aswad." },
                { icon: "7️⃣", title: "Nombre de tours", body: "7 tours complets. Chaque tour commence à la Hajar Al-Aswad et y revient." },
                { icon: "💧", title: "Condition", body: "Être en état de wudu. Les femmes en période de menstrues ne font pas le Tawaf." },
                { icon: "🟢", title: "La ligne verte", body: "Pour les 3 premiers tours, les hommes accélèrent légèrement le pas (raml) si possible." },
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
              <p>Il n'y a pas de du'a fixe à réciter pendant le Tawaf. Faites les du'as qui viennent de votre cœur, lisez le Coran, faites le dhikr. Evitez les formules récitées en groupe qui peuvent distraire — votre dialogue avec Dieu est personnel.</p>
            </div>

            <div className="go-dua-card go-reveal">
              <p className="go-dua-label">Du'a en face de la Hajar Al-Aswad — à chaque passage</p>
              <p className="go-dua-arabic">بِسْمِ اللهِ وَاللهُ أَكْبَرُ</p>
              <p className="go-dua-transliteration">Bismillahi wallahu akbar</p>
              <p className="go-dua-translation">«Au nom d'Allah, Allah est le Plus Grand.» — Pointez ou embrassez la Pierre Noire à chaque tour si possible.</p>
            </div>

            <div className="go-dua-card go-reveal">
              <p className="go-dua-label">Du'a entre les deux Rukn (entre le coin yéménite et la Hajar Al-Aswad)</p>
              <p className="go-dua-arabic">رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ</p>
              <p className="go-dua-transliteration">Rabbana atina fid-dunya hasanatan wa fil-akhirati hasanatan wa qina 'adhaban-nar</p>
              <p className="go-dua-translation">«Seigneur, accorde-nous le bien ici-bas et le bien dans l'au-delà, et préserve-nous du châtiment du Feu.»</p>
            </div>

            <h3 className="go-reveal" style={{ fontFamily: "'Cinzel', serif", fontSize: "1.05rem", color: "var(--go-deep)", margin: "2rem 0 0.75rem" }}>Après le Tawaf : la prière des 2 rak'at</h3>
            <p className="go-reveal" style={{ fontSize: "0.9rem", color: "#4A3728", lineHeight: 1.8 }}>
              Une fois le 7e tour accompli, dirigez-vous vers le Maqam Ibrahim et accomplissez 2 rak'at. Lisez Al-Kafirun au 1er rak'at et Al-Ikhlas au 2e. C'est une sunnah confirmée. Puis buvez de l'eau de Zamzam en faisant face à la Qibla.
            </p>
          </section>

          {/* SA'I */}
          <section id="sai" className="go-section">
            <span className="go-section-tag go-reveal">Rituel 3</span>
            <h2 className="go-reveal go-reveal-d1">La Sa'i — السعي</h2>
            <p className="go-reveal go-reveal-d2">
              La Sa'i commémore la course d'Hajar, femme d'Ibrahim ﷺ, entre les collines de Safa et Marwa à la recherche d'eau pour son fils Ismaïl. Dieu répondit à son effort et sa foi en faisant jaillir la source de Zamzam.
            </p>
            <p className="go-reveal go-reveal-d2">
              Elle consiste en <strong>7 allers-retours</strong> entre Safa et Marwa (Safa → Marwa = 1 trajet). Elle commence à Safa et se termine à Marwa. Durée estimée : <strong>45min à 1h30</strong>.
            </p>

            <div className="go-info-grid go-reveal go-reveal-d3">
              {[
                { icon: "🏔️", title: "Safa → Marwa", body: "Aller de Safa à Marwa = 1 trajet. 7 trajets au total. On commence à Safa, on finit à Marwa." },
                { icon: "💨", title: "La course légère", body: "Entre les deux panneaux verts (hommes seulement), accélérer légèrement le pas en souvenir d'Hajar." },
                { icon: "💧", title: "Wudu", body: "La Sa'i est valide même sans wudu selon la majorité des savants, mais être en état de pureté est recommandé." },
                { icon: "🌿", title: "Du'a libre", body: "Faites vos du'as personnelles. Chaque allez-retour est une opportunité de dialogue intime avec Dieu." },
              ].map((b) => (
                <div key={b.title} className="go-info-box">
                  <div className="go-info-box-icon">{b.icon}</div>
                  <h4>{b.title}</h4>
                  <p>{b.body}</p>
                </div>
              ))}
            </div>

            <div className="go-dua-card go-reveal">
              <p className="go-dua-label">Du'a sur la colline de Safa — au début et à chaque retour à Safa</p>
              <p className="go-dua-arabic">إِنَّ الصَّفَا وَالْمَرْوَةَ مِنْ شَعَائِرِ اللَّهِ — أَبْدَأُ بِمَا بَدَأَ اللَّهُ بِهِ</p>
              <p className="go-dua-transliteration">Innas-Safa wal-Marwata min sha'a'irillah — Abda'u bima bada'allahu bih</p>
              <p className="go-dua-translation">«Safa et Marwa sont parmi les rites d'Allah» — puis «Je commence par ce qu'Allah a commencé.» Faites face à la Kaaba, levez les mains et faites du dhikr et des du'as.</p>
            </div>
          </section>

          {/* TAHALLUL */}
          <section id="tahallul" className="go-section">
            <span className="go-section-tag go-reveal">Rituel 4</span>
            <h2 className="go-reveal go-reveal-d1">Le Tahallul — التحلل</h2>
            <p className="go-reveal go-reveal-d2">
              Le Tahallul — «sortir de l'état sacré» — marque la fin de la Omra. Pour les hommes, il consiste à se <strong>raser la tête</strong> (halq, recommandé) ou à couper les cheveux de façon égale (taqsir). Pour les femmes, couper une mèche de la longueur d'un bout de doigt suffit.
            </p>
            <p className="go-reveal go-reveal-d2">
              Après le Tahallul, toutes les interdictions de l'Ihram sont levées. Vous avez accompli votre Omra — subhanAllah. Prenez un moment de gratitude, de sujud, de pleurs. C'est un moment de renaissance.
            </p>

            <div className="go-alert go-reveal">
              <span className="go-alert-icon">✦</span>
              <p>Le Prophète ﷺ a fait du'a trois fois pour ceux qui se rasent et une fois pour ceux qui coupent. Raser est donc préférable pour les hommes, mais couper est valide. Ne vous précipitez pas : savourez ce moment de clôture.</p>
            </div>

            <div className="go-dua-card go-reveal">
              <p className="go-dua-label">Du'a lors du Tahallul</p>
              <p className="go-dua-arabic">اللَّهُمَّ تَقَبَّلْ مِنِّي</p>
              <p className="go-dua-transliteration">Allahumma taqabbal minni</p>
              <p className="go-dua-translation">«Ô Allah, accepte de moi.» — Une des du'as les plus simples et les plus profondes. Répétez-la autant que vous le souhaitez en ce moment privilégié.</p>
            </div>
          </section>

          {/* DU'AS */}
          <section id="duas" className="go-section">
            <span className="go-section-tag go-reveal">Invocations</span>
            <h2 className="go-reveal go-reveal-d1">Du'as Essentielles</h2>
            <p className="go-reveal go-reveal-d2">
              La du'a est le cœur de l'adoration. À La Mecque, dans la Maison de Dieu, vos invocations ont une valeur spirituelle particulière. Voici les du'as les plus importantes à connaître.
            </p>

            {[
              {
                label: "Du'a d'entrée à la Mosquée Al-Haram",
                ar: "اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ",
                tr: "Allahumm-aftah li abwaba rahmatik",
                fr: "«Ô Allah, ouvre-moi les portes de Ta miséricorde.»",
              },
              {
                label: "Du'a au premier regard sur la Kaaba",
                ar: "اللَّهُمَّ زِدْ هَذَا الْبَيْتَ تَشْرِيفًا وَتَعْظِيمًا وَتَكْرِيمًا وَمَهَابَةً",
                tr: "Allahumma zid hadhal-bayta tashrifan wa ta'dhiman wa takriman wa mahabah",
                fr: "«Ô Allah, augmente la dignité, la grandeur, l'honneur et la vénération de cette Maison.»",
              },
              {
                label: "Du'a pour soi-même (à utiliser librement)",
                ar: "رَبِّ اغْفِرْ لِي وَارْحَمْنِي وَتُبْ عَلَيَّ",
                tr: "Rabbigh-fir li warhamni wa tub 'alayya",
                fr: "«Seigneur, pardonne-moi, aie pitié de moi et accorde-moi Ton repentir.»",
              },
              {
                label: "Du'a de Zamzam",
                ar: "اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا وَرِزْقًا وَاسِعًا وَشِفَاءً مِنْ كُلِّ دَاءٍ",
                tr: "Allahumma inni as'aluka 'ilman nafi'an wa rizqan wasi'an wa shifa'an min kulli da'",
                fr: "«Ô Allah, je Te demande une science utile, une subsistance abondante et la guérison de toute maladie.»",
              },
            ].map((d) => (
              <div key={d.label} className="go-dua-card go-reveal">
                <p className="go-dua-label">{d.label}</p>
                <p className="go-dua-arabic">{d.ar}</p>
                <p className="go-dua-transliteration">{d.tr}</p>
                <p className="go-dua-translation">{d.fr}</p>
              </div>
            ))}
          </section>

          {/* CHECKLIST */}
          <section id="checklist" className="go-section">
            <span className="go-section-tag go-reveal">Préparation</span>
            <h2 className="go-reveal go-reveal-d1">Checklist de la Omra</h2>
            <p className="go-reveal go-reveal-d2">
              Cochez chaque élément au fur et à mesure de votre préparation. Votre progression est sauvegardée pour cette session.
            </p>

            <div className="go-reveal go-reveal-d2">
              {CHECKLIST.map((cat) => (
                <div key={cat.cat} className="go-checklist-cat">
                  <p className="go-checklist-cat-title">{cat.cat}</p>
                  {cat.items.map((item) => {
                    const key = `${cat.cat}::${item}`;
                    const isChecked = !!checked[key];
                    return (
                      <div key={key} className="go-check-item" onClick={() => toggleCheck(key)} role="checkbox" aria-checked={isChecked} tabIndex={0} onKeyDown={(e) => e.key === " " && toggleCheck(key)}>
                        <div className={`go-check-box${isChecked ? " checked" : ""}`}>
                          {isChecked && <svg width="11" height="9" viewBox="0 0 11 9" fill="none"><path d="M1 4.5L4 7.5L10 1.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                        </div>
                        <span className={`go-check-label${isChecked ? " checked" : ""}`}>{item}</span>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </section>

          {/* FAQ */}
          <section id="faq" className="go-section">
            <span className="go-section-tag go-reveal">Questions fréquentes</span>
            <h2 className="go-reveal go-reveal-d1">FAQ — Vos questions sur la Omra</h2>

            <div className="go-reveal go-reveal-d1">
              {FAQ_ITEMS.map((item, i) => (
                <div key={i} className="go-faq-item">
                  <div className="go-faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                    <span>{item.q}</span>
                    <div className={`go-faq-icon${openFaq === i ? " open" : ""}`}>+</div>
                  </div>
                  <div className={`go-faq-a${openFaq === i ? " open" : ""}`}>{item.a}</div>
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <div className="go-cta-block go-reveal">
            <h3>Accomplissez votre Omra avec un guide qui connaît chaque pierre</h3>
            <p>Naïm LAAMARI et les guides SAFARUMA vous accompagnent pas à pas — rituels, du'as, histoire et spiritualité — pour que votre Omra soit inoubliable.</p>
            <div className="go-cta-btns">
              <Link href="/guides" className="go-btn-gold">Trouver mon guide →</Link>
              <a href="https://wa.me/message/ZGUPRJRNVJRGN1" target="_blank" rel="noopener noreferrer" className="go-btn-outline">WhatsApp SAFARUMA</a>
            </div>
          </div>

        </main>
      </div>

      <Footer />
    </div>
  );
}
