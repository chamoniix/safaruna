"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { OMRA_RITES } from "@/lib/omraRites";

const MIQAT = OMRA_RITES.find((r) => r.id === "miqat")!;
const IHRAM = OMRA_RITES.find((r) => r.id === "ihram")!;
const ARRIVEE = OMRA_RITES.find((r) => r.id === "arrivee")!;
const TAWAF = OMRA_RITES.find((r) => r.id === "tawaf")!;
const SAI = OMRA_RITES.find((r) => r.id === "sai")!;
const TAHALLUL = OMRA_RITES.find((r) => r.id === "tahallul")!;

/* ─── Navigation sections ─── */
const SECTIONS = [
  { id: "intro", label: "Introduction" },
  { id: "miqat", label: "Le Miqat" },
  { id: "ihram", label: "L'Ihram" },
  { id: "arrivee", label: "Arrivée à Makkah" },
  { id: "tawaf", label: "Le Tawaf" },
  { id: "sai", label: "La Sa'i" },
  { id: "tahallul", label: "Fin de la Omra" },
];

function ImagePlaceholder({ caption }: { caption: string }) {
  return (
    <div className="go-image-placeholder go-reveal">
      <span style={{ fontSize: "1.3rem", opacity: 0.4 }}>🖼</span>
      <span>{caption}</span>
    </div>
  );
}

export default function GuideOmraComplet() {
  const { data: session } = useSession();
  const emailVerified = session?.user?.emailVerified;
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

        /* Reveal animation base */
        .go-reveal { opacity: 0; transform: translateY(22px); transition: opacity 0.65s ease, transform 0.65s ease; }
        .go-reveal-d1 { transition-delay: 0.1s; }
        .go-reveal-d2 { transition-delay: 0.2s; }
        .go-reveal-d3 { transition-delay: 0.3s; }

        /* Alert box */
        .go-alert { background: rgba(201,168,76,0.07); border: 1px solid rgba(201,168,76,0.25); border-radius: 10px; padding: 1.1rem 1.4rem; margin: 1.5rem 0; display: flex; gap: 0.85rem; align-items: flex-start; }
        .go-alert-icon { font-size: 1.1rem; flex-shrink: 0; margin-top: 0.05rem; }
        .go-alert p { font-size: 0.875rem; color: #4A3728; line-height: 1.75; margin: 0; }

        /* Image placeholder */
        .go-image-placeholder { border: 1.5px dashed rgba(201,168,76,0.4); border-radius: 12px; background: rgba(201,168,76,0.04); padding: 2.5rem 1.5rem; margin: 1.25rem 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.5rem; text-align: center; }
        .go-image-placeholder span { font-size: 0.75rem; color: #9C8F72; font-style: italic; max-width: 420px; }

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
        <p className="go-hero-eyebrow go-reveal">Guide de la Omra</p>
        <h1 className="go-reveal go-reveal-d1">La Omra étape par étape — Rituels & Du'as</h1>
        <p className="go-hero-sub go-reveal go-reveal-d2">
          Du Miqat au Tahallul, chaque rituel expliqué simplement, avec ses du'as authentiques.
        </p>
        <div className="go-hero-badges go-reveal go-reveal-d3">
          <span className="go-hero-badge">Miqat</span>
          <span className="go-hero-badge">Ihram</span>
          <span className="go-hero-badge">Tawaf</span>
          <span className="go-hero-badge">Sa'i</span>
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
              La Omra — en arabe <strong>العمرة</strong> — est le pèlerinage mineur à La Mecque. Elle n'est pas obligatoire, mais fortement recommandée, et peut être accomplie à n'importe quel moment de l'année.
            </p>
            <p className="go-reveal go-reveal-d2">
              Une Omra n'est acceptée que si elle réunit deux conditions : la sincérité de l'intention envers Allah, et la conformité aux gestes accomplis par le Prophète ﷺ. Ce guide vous accompagne à travers chaque étape, avec les du'as correspondantes.
            </p>

            <div className="go-alert go-reveal">
              <span className="go-alert-icon">✦</span>
              <p>La Omra se compose de <strong>quatre rituels essentiels</strong> dans cet ordre : l'Ihram → le Tawaf → la Sa'i → la fin de la Omra (Tahallul).</p>
            </div>
          </section>

          {/* MIQAT */}
          <section id="miqat" className="go-section">
            <span className="go-section-tag">Avant l'Ihram</span>
            <h2 className="go-reveal go-reveal-d1">Le Miqat — الميقات</h2>
            <p className="go-reveal go-reveal-d2">{MIQAT.intro[0]}</p>
            <p className="go-reveal go-reveal-d2">{MIQAT.intro[1]}</p>

            <div className="go-info-grid go-reveal go-reveal-d3">
              {MIQAT.keyFacts.map((f) => (
                <div key={f.title} className="go-info-box">
                  <div className="go-info-box-icon">📍</div>
                  <h4>{f.title}</h4>
                  <p>{f.body}</p>
                </div>
              ))}
            </div>

            <ImagePlaceholder caption="Carte : position du Miqat (Dhul Hulayfah / Bir Ali) par rapport à Madinah et Makkah" />

            {MIQAT.duas.map((d) => (
              <div key={d.label} className="go-dua-card go-reveal">
                <p className="go-dua-label">{d.label}</p>
                <p className="go-dua-arabic">{d.ar}</p>
                <p className="go-dua-transliteration">{d.phon}</p>
                <p className="go-dua-translation">{d.fr}</p>
              </div>
            ))}

            <p className="go-reveal" style={{ fontSize: "0.9rem", color: "#4A3728", lineHeight: 1.8 }}>
              {MIQAT.afterNote}
            </p>
          </section>

          {/* IHRAM */}
          <section id="ihram" className="go-section">
            <span className="go-section-tag">Rituel 1</span>
            <h2 className="go-reveal go-reveal-d1">L'Ihram — الإحرام</h2>
            <p className="go-reveal go-reveal-d2">{IHRAM.intro[0]}</p>

            <div className="go-info-grid go-reveal go-reveal-d3">
              {[
                { icon: "🕊️", ...IHRAM.keyFacts[0] },
                { icon: "🌸", ...IHRAM.keyFacts[1] },
                { icon: "🚫", ...IHRAM.keyFacts[2] },
                { icon: "⚖️", ...IHRAM.keyFacts[3] },
              ].map((b) => (
                <div key={b.title} className="go-info-box">
                  <div className="go-info-box-icon">{b.icon}</div>
                  <h4>{b.title}</h4>
                  <p>{b.body}</p>
                </div>
              ))}
            </div>

            <ImagePlaceholder caption="Illustration : la tenue Ihram (Izar / Rida) — vue correcte vs erreur fréquente (épaule découverte hors Tawaf)" />
          </section>

          {/* ARRIVÉE À MAKKAH */}
          <section id="arrivee" className="go-section">
            <span className="go-section-tag">En arrivant</span>
            <h2 className="go-reveal go-reveal-d1">Arrivée à Makkah</h2>
            <p className="go-reveal go-reveal-d2">{ARRIVEE.intro[0]}</p>
            <p className="go-reveal go-reveal-d2">{ARRIVEE.intro[1]}</p>

            <ImagePlaceholder caption="Photo : première vue de la Kaaba depuis l'intérieur du Masjid Al-Haram" />

            {ARRIVEE.duas.map((d) => (
              <div key={d.label} className="go-dua-card go-reveal">
                <p className="go-dua-label">{d.label}</p>
                <p className="go-dua-arabic">{d.ar}</p>
                <p className="go-dua-transliteration">{d.phon}</p>
                <p className="go-dua-translation">{d.fr}</p>
              </div>
            ))}
          </section>

          {/* TAWAF */}
          <section id="tawaf" className="go-section">
            <span className="go-section-tag">Rituel 2</span>
            <h2 className="go-reveal go-reveal-d1">Le Tawaf — الطواف</h2>
            <p className="go-reveal go-reveal-d2">{TAWAF.intro[0]}</p>
            <p className="go-reveal go-reveal-d2">{TAWAF.intro[1]}</p>

            <div className="go-info-grid go-reveal go-reveal-d3">
              {[
                { icon: "↩️", ...TAWAF.keyFacts[0] },
                { icon: "🏃", ...TAWAF.keyFacts[1] },
                { icon: "👉", ...TAWAF.keyFacts[2] },
                { icon: "🕋", ...TAWAF.keyFacts[3] },
              ].map((b) => (
                <div key={b.title} className="go-info-box">
                  <div className="go-info-box-icon">{b.icon}</div>
                  <h4>{b.title}</h4>
                  <p>{b.body}</p>
                </div>
              ))}
            </div>

            <ImagePlaceholder caption="Schéma : plan du Tawaf avec Hajar Aswad, Hijr Ismaël, Rukn Yamani, Maqam Ibrahim et sens de circulation" />

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
            <p className="go-reveal go-reveal-d2">{SAI.intro[1]}</p>

            <div className="go-info-grid go-reveal go-reveal-d3">
              {[
                { icon: "🏔️", ...SAI.keyFacts[0] },
                { icon: "💨", ...SAI.keyFacts[1] },
              ].map((b) => (
                <div key={b.title} className="go-info-box">
                  <div className="go-info-box-icon">{b.icon}</div>
                  <h4>{b.title}</h4>
                  <p>{b.body}</p>
                </div>
              ))}
            </div>

            <ImagePlaceholder caption="Schéma : trajet du Sa'i entre Safa et Marwa avec les 7 trajets et les repères verts" />

            {SAI.duas.map((d) => (
              <div key={d.label} className="go-dua-card go-reveal">
                <p className="go-dua-label">{d.label}</p>
                <p className="go-dua-arabic">{d.ar}</p>
                <p className="go-dua-transliteration">{d.phon}</p>
                <p className="go-dua-translation">{d.fr}</p>
              </div>
            ))}

            <p className="go-reveal" style={{ fontSize: "0.9rem", color: "#4A3728", lineHeight: 1.8 }}>
              {SAI.afterNote}
            </p>
          </section>

          {/* TAHALLUL */}
          <section id="tahallul" className="go-section">
            <span className="go-section-tag">Rituel 4</span>
            <h2 className="go-reveal go-reveal-d1">Fin de la Omra — التحلل</h2>
            <p className="go-reveal go-reveal-d2">{TAHALLUL.intro[0]}</p>
            <p className="go-reveal go-reveal-d2">{TAHALLUL.intro[1]}</p>

            <ImagePlaceholder caption="Illustration : Halq (rasage complet) et Taqsir (raccourcissement) — les deux options pour les hommes" />
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
