"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { OMRA_RITES } from "@/lib/omraRites";

const MIQAT = OMRA_RITES.find((r) => r.id === "miqat")!;
const IHRAM = OMRA_RITES.find((r) => r.id === "ihram")!;
const TAWAF = OMRA_RITES.find((r) => r.id === "tawaf")!;
const SAI = OMRA_RITES.find((r) => r.id === "sai")!;
const TAHALLUL = OMRA_RITES.find((r) => r.id === "tahallul")!;

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
    a: "Oui, techniquement. Mais sans guide, on risque d'accomplir les rituels mécaniquement, sans en comprendre la profondeur. Un guide Certifié SAFARUMA francophone vous explique chaque geste, vous enseigne les du'as appropriées et vous accompagne spirituellement — une différence fondamentale.",
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

export default function GuideOmraComplet() {
  const { data: session } = useSession();
  const emailVerified = session?.user?.emailVerified;
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
        .go-dua-label { font-size: 0.68rem; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: rgba(255,255,255,0.9); margin-bottom: 0.65rem; }
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

      {/* Bandeau membre */}
      <div style={{ background: '#E8F5EE', borderBottom: '1px solid rgba(29,92,58,0.2)', padding: '0.6rem 1.5rem', textAlign: 'center', fontSize: '0.78rem', fontWeight: 600, color: '#1D5C3A' }}>
        ✓ Guide complet · Réservé aux membres SAFARUMA
      </div>

      <Navbar />

      {/* Email verification banner */}
      {session && !emailVerified && (
        <div style={{
          background: '#FEF9EC', border: '1px solid #C9A84C',
          borderRadius: 12, padding: '1rem 1.25rem',
          margin: '1rem 1.5rem', textAlign: 'center',
        }}>
          <div style={{ fontWeight: 700, color: '#1A1209', marginBottom: '0.5rem' }}>
            ✉️ Confirmez votre email pour accéder à votre espace
          </div>
          <div style={{ color: '#7A6D5A', fontSize: '0.82rem', marginBottom: '1rem' }}>
            Un email de confirmation vous a été envoyé.
          </div>
          <button
            onClick={() => fetch('/api/resend-verification', { method: 'POST' })}
            style={{
              background: '#C9A84C', color: '#1A1209',
              border: 'none', padding: '0.6rem 1.25rem',
              borderRadius: 50, fontWeight: 700,
              fontSize: '0.82rem', cursor: 'pointer',
            }}
          >
            Renvoyer l'email de confirmation
          </button>
        </div>
      )}

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
            <span className="go-section-tag">Avant le départ</span>
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
            <span className="go-section-tag">Rituel 1</span>
            <h2 className="go-reveal go-reveal-d1">L'Ihram — الإحرام</h2>
            <p className="go-reveal go-reveal-d2">{IHRAM.intro[0]}</p>
            <p className="go-reveal go-reveal-d2">{IHRAM.intro[1]}</p>

            <div className="go-info-grid go-reveal go-reveal-d3">
              {[
                { icon: "📍", title: "Le Miqat", body: MIQAT.keyFacts[0].body },
                { icon: "🕊️", title: "Tenue hommes", body: IHRAM.keyFacts[0].body },
                { icon: "🌸", title: "Tenue femmes", body: IHRAM.keyFacts[1].body },
                { icon: "🚫", title: "Interdictions", body: IHRAM.keyFacts[2].body },
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
              {IHRAM.steps!.map((s) => (
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
              <p className="go-dua-label">{MIQAT.duas[1].label}</p>
              <p className="go-dua-arabic">{MIQAT.duas[1].ar}</p>
              <p className="go-dua-transliteration">{MIQAT.duas[1].phon}</p>
              <p className="go-dua-translation">{MIQAT.duas[1].fr}</p>
            </div>
          </section>

          {/* TAWAF */}
          <section id="tawaf" className="go-section">
            <span className="go-section-tag">Rituel 2</span>
            <h2 className="go-reveal go-reveal-d1">Le Tawaf — الطواف</h2>
            <p className="go-reveal go-reveal-d2">{TAWAF.intro[0]}</p>
            <p className="go-reveal go-reveal-d2">{TAWAF.intro[1]}</p>
            <p className="go-reveal go-reveal-d2">
              Durée estimée : <strong>1h30 à 3h</strong> selon l'affluence.
            </p>

            <div className="go-info-grid go-reveal go-reveal-d3">
              {[
                { icon: "↩️", title: TAWAF.keyFacts[0].title, body: TAWAF.keyFacts[0].body },
                { icon: "7️⃣", title: TAWAF.keyFacts[1].title, body: TAWAF.keyFacts[1].body },
                { icon: "💧", title: TAWAF.keyFacts[2].title, body: TAWAF.keyFacts[2].body },
                { icon: "🟢", title: TAWAF.keyFacts[3].title, body: TAWAF.keyFacts[3].body },
              ].map((b) => (
                <div key={b.title} className="go-info-box">
                  <div className="go-info-box-icon">{b.icon}</div>
                  <h4>{b.title}</h4>
                  <p>{b.body}</p>
                </div>
              ))}
            </div>

            {TAWAF.duas.map((d) => (
              <div key={d.label} className="go-dua-card go-reveal">
                <p className="go-dua-label">{d.label}</p>
                <p className="go-dua-arabic">{d.ar}</p>
                <p className="go-dua-transliteration">{d.phon}</p>
                <p className="go-dua-translation">{d.fr}</p>
              </div>
            ))}

            <p className="go-reveal" style={{ fontSize: "0.9rem", color: "#4A3728", lineHeight: 1.8 }}>
              {TAWAF.afterNote}
            </p>
          </section>

          {/* SA'I */}
          <section id="sai" className="go-section">
            <span className="go-section-tag">Rituel 3</span>
            <h2 className="go-reveal go-reveal-d1">La Sa'i — السعي</h2>
            <p className="go-reveal go-reveal-d2">{SAI.intro[0]}</p>
            <p className="go-reveal go-reveal-d2">
              {SAI.intro[1]} Durée estimée : <strong>45min à 1h30</strong>.
            </p>

            <div className="go-info-grid go-reveal go-reveal-d3">
              {[
                { icon: "🏔️", title: SAI.keyFacts[0].title, body: SAI.keyFacts[0].body },
                { icon: "💨", title: SAI.keyFacts[1].title, body: SAI.keyFacts[1].body },
                { icon: "💧", title: SAI.keyFacts[2].title, body: SAI.keyFacts[2].body },
                { icon: "🌿", title: SAI.keyFacts[3].title, body: SAI.keyFacts[3].body },
              ].map((b) => (
                <div key={b.title} className="go-info-box">
                  <div className="go-info-box-icon">{b.icon}</div>
                  <h4>{b.title}</h4>
                  <p>{b.body}</p>
                </div>
              ))}
            </div>

            {SAI.duas.map((d) => (
              <div key={d.label} className="go-dua-card go-reveal">
                <p className="go-dua-label">{d.label}</p>
                <p className="go-dua-arabic">{d.ar}</p>
                <p className="go-dua-transliteration">{d.phon}</p>
                <p className="go-dua-translation">{d.fr}</p>
              </div>
            ))}
          </section>

          {/* TAHALLUL */}
          <section id="tahallul" className="go-section">
            <span className="go-section-tag">Rituel 4</span>
            <h2 className="go-reveal go-reveal-d1">Le Tahallul — التحلل</h2>
            <p className="go-reveal go-reveal-d2">{TAHALLUL.intro[0]}</p>
            <p className="go-reveal go-reveal-d2">
              {TAHALLUL.intro[1]} Vous avez accompli votre Omra — subhanAllah. Prenez un moment de gratitude, de sujud, de pleurs. C'est un moment de renaissance.
            </p>

            <div className="go-alert go-reveal">
              <span className="go-alert-icon">✦</span>
              <p>{TAHALLUL.afterNote}</p>
            </div>

            <div className="go-dua-card go-reveal">
              <p className="go-dua-label">{TAHALLUL.duas[0].label}</p>
              <p className="go-dua-arabic">{TAHALLUL.duas[0].ar}</p>
              <p className="go-dua-transliteration">{TAHALLUL.duas[0].phon}</p>
              <p className="go-dua-translation">{TAHALLUL.duas[0].fr}</p>
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
