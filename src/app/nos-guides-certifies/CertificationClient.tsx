"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

/* ─── Criteria items ─── */
const CRITERIA = [
  { num: "01", title: "Connaissance des rituels", body: "Maîtrise complète du Fiqh de la Omra : Ihram, Tawaf, Sa'i, Tahallul. Connaissance des rulings des 4 madhabs." },
  { num: "02", title: "Histoire islamique de La Mecque", body: "Sites saints, événements prophétiques, contexte historique et spirituel de chaque lieu visité." },
  { num: "03", title: "Du'as et invocations", body: "Mémorisation des du'as des rituels, capacité à les enseigner avec leur contexte et leur sens profond." },
  { num: "04", title: "Gestion de groupe", body: "Encadrement en sécurité, gestion de l'affluence, protocoles d'urgence, adaptation aux besoins des PMR." },
  { num: "05", title: "Communication en français", body: "Capacité à expliquer des concepts islamiques complexes de façon claire et accessible à des francophones." },
  { num: "06", title: "Éthique professionnelle", body: "Respect de la charte SAFARUMA, confidentialité, honnêteté tarifaire, absence de conflit d'intérêts." },
];

/* ─── Partnership benefits ─── */
const PARTNER_BENEFITS = [
  { icon: "🕌", title: "Guides vérifiés et sélectionnés dédiés", body: "Accès prioritaire aux guides disponibles pour vos groupes de fidèles, réservation simplifiée via un interlocuteur unique." },
  { icon: "📋", title: "Programme sur-mesure", body: "Élaboration d'un programme spirituel et culturel adapté à votre communauté, vos valeurs et vos besoins spécifiques." },
  { icon: "💎", title: "Tarifs partenaires", body: "Conditions tarifaires préférentielles pour les associations et mosquées partenaires avec facturation centralisée." },
  { icon: "📜", title: "Documentation islamique", body: "Fourniture de livrets spirituels, du'as imprimées et supports pédagogiques co-élaborés avec notre équipe SAFARUMA." },
];

/* ─── Badge SVG component ─── */
function CertBadgeSVG() {
  return (
    <svg
      width="220"
      height="220"
      viewBox="0 0 220 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Badge Vérifié SAFARUMA"
    >
      {/* Outer ring */}
      <circle cx="110" cy="110" r="104" stroke="url(#badgeGold)" strokeWidth="2.5" fill="none" />
      {/* Middle ring */}
      <circle cx="110" cy="110" r="94" stroke="rgba(201,168,76,0.25)" strokeWidth="1" fill="none" />
      {/* Background disc */}
      <circle cx="110" cy="110" r="90" fill="url(#badgeBg)" />
      {/* Star burst (8 points) */}
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i * 45 * Math.PI) / 180;
        const x1 = 110 + Math.cos(angle) * 62;
        const y1 = 110 + Math.sin(angle) * 62;
        const x2 = 110 + Math.cos(angle) * 78;
        const y2 = 110 + Math.sin(angle) * 78;
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(201,168,76,0.35)" strokeWidth="1.5" />;
      })}
      {/* Inner decorative circle */}
      <circle cx="110" cy="110" r="60" stroke="rgba(201,168,76,0.3)" strokeWidth="1" strokeDasharray="3 4" fill="none" />
      {/* Checkmark shield */}
      <path d="M110 58 L132 68 L132 92 C132 108 122 120 110 126 C98 120 88 108 88 92 L88 68 Z" fill="url(#badgeShield)" stroke="rgba(201,168,76,0.6)" strokeWidth="1.5" />
      {/* Checkmark */}
      <path d="M100 91 L107 99 L122 82" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      {/* SAFARUMA text arc (top) */}
      <path id="arcTop" d="M 30 110 A 80 80 0 0 1 190 110" fill="none" />
      <text fill="rgba(201,168,76,0.9)" fontSize="10.5" fontWeight="700" letterSpacing="3.5" fontFamily="sans-serif">
        <textPath href="#arcTop" startOffset="50%" textAnchor="middle">SAFARUMA</textPath>
      </text>
      {/* CERTIFIÉ text arc (bottom) */}
      <path id="arcBot" d="M 38 118 A 80 80 0 0 0 182 118" fill="none" />
      <text fill="rgba(201,168,76,0.65)" fontSize="9" fontWeight="600" letterSpacing="2.5" fontFamily="sans-serif">
        <textPath href="#arcBot" startOffset="50%" textAnchor="middle">GUIDE VÉRIFIÉ</textPath>
      </text>
      {/* Decorative dots */}
      {[0, 60, 120, 180, 240, 300].map((deg) => {
        const rad = (deg * Math.PI) / 180;
        return (
          <circle
            key={deg}
            cx={110 + Math.cos(rad) * 87}
            cy={110 + Math.sin(rad) * 87}
            r="2.5"
            fill="rgba(201,168,76,0.5)"
          />
        );
      })}
      {/* Gradients */}
      <defs>
        <linearGradient id="badgeGold" x1="0" y1="0" x2="220" y2="220" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#E8C96A" />
          <stop offset="50%" stopColor="#C9A84C" />
          <stop offset="100%" stopColor="#9A7030" />
        </linearGradient>
        <radialGradient id="badgeBg" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#2C1810" />
          <stop offset="100%" stopColor="#1A1209" />
        </radialGradient>
        <linearGradient id="badgeShield" x1="88" y1="58" x2="132" y2="126" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#C9A84C" />
          <stop offset="100%" stopColor="#7A5820" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default function CertificationClient() {
  const [formState, setFormState] = useState({ name: "", org: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  /* ─── Reveal animation ─── */
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>(".cert-reveal");
    if (!els.length) return;
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) {
          (e.target as HTMLElement).style.opacity = "1";
          (e.target as HTMLElement).style.transform = "translateY(0)";
        }
      }),
      { threshold: 0.1 }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  /* ─── Auto-advance steps ─── */
  useEffect(() => {
    const t = setInterval(() => setActiveStep((s) => (s + 1) % 3), 3200);
    return () => clearInterval(t);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(`Partenariat mosquée/association — ${formState.org || formState.name}`);
    const body = encodeURIComponent(`Nom : ${formState.name}\nOrganisation : ${formState.org}\nEmail : ${formState.email}\n\n${formState.message}`);
    window.location.href = `mailto:contact@safaruma.com?subject=${subject}&body=${body}`;
    setSubmitted(true);
  };

  return (
    <div className="cert-page">
      <style dangerouslySetInnerHTML={{ __html: `
        .cert-page { --cp-gold: #C9A84C; --cp-deep: #1A1209; --cp-ink: #2C1810; --cp-sand: #F5F0E8; --cp-text: #3D2B1F; font-family: var(--font-manrope, sans-serif); }

        /* Reveal base */
        .cert-reveal { opacity: 0; transform: translateY(24px); transition: opacity 0.65s ease, transform 0.65s ease; }
        .cert-reveal-d1 { transition-delay: 0.1s; }
        .cert-reveal-d2 { transition-delay: 0.2s; }
        .cert-reveal-d3 { transition-delay: 0.3s; }
        .cert-reveal-d4 { transition-delay: 0.4s; }

        /* Hero */
        .cert-hero { position: relative; background: var(--cp-deep); min-height: 72vh; display: flex; align-items: center; justify-content: center; text-align: center; padding: 10.5rem 2rem 6rem; overflow: hidden; }
        .cert-hero-arabic { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-family: var(--font-cormorant, serif); font-size: clamp(8rem, 22vw, 18rem); color: rgba(201,168,76,0.04); pointer-events: none; direction: rtl; line-height: 1; user-select: none; }
        .cert-hero-lines { position: absolute; inset: 0; background: repeating-linear-gradient(0deg, transparent, transparent 79px, rgba(201,168,76,0.03) 80px); pointer-events: none; }
        .cert-hero-inner { position: relative; max-width: 760px; }
        .cert-eyebrow { font-size: 0.7rem; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; color: var(--cp-gold); margin-bottom: 1.25rem; }
        .cert-hero h1 { font-family: var(--font-cormorant, serif); font-size: clamp(2.2rem, 6vw, 4rem); font-weight: 600; color: white; line-height: 1.15; margin: 0 0 1.5rem; }
        .cert-hero-sub { font-size: 1.05rem; color: rgba(255,255,255,0.45); max-width: 540px; margin: 0 auto 2.75rem; line-height: 1.9; }
        .cert-hero-pills { display: flex; gap: 0.75rem; justify-content: center; flex-wrap: wrap; }
        .cert-pill { background: rgba(201,168,76,0.1); border: 1px solid rgba(201,168,76,0.25); color: rgba(201,168,76,0.85); font-size: 0.72rem; font-weight: 600; letter-spacing: 0.07em; padding: 0.35rem 0.95rem; border-radius: 20px; }

        /* Sections */
        .cert-section { padding: 6rem 2rem; }
        .cert-section-inner { max-width: 1100px; margin: 0 auto; }
        .cert-section-light { background: white; }
        .cert-section-sand { background: var(--cp-sand); }
        .cert-section-dark { background: var(--cp-deep); }
        .cert-tag { display: inline-block; font-size: 0.65rem; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; color: var(--cp-gold); background: rgba(201,168,76,0.1); border: 1px solid rgba(201,168,76,0.25); padding: 0.28rem 0.75rem; border-radius: 4px; margin-bottom: 1rem; }
        .cert-tag-light { color: rgba(201,168,76,0.8); background: rgba(201,168,76,0.08); border-color: rgba(201,168,76,0.2); }
        .cert-h2 { font-family: var(--font-cormorant, serif); font-size: clamp(1.8rem, 4vw, 2.8rem); font-weight: 600; color: var(--cp-deep); line-height: 1.2; margin: 0 0 1rem; }
        .cert-h2-light { color: white; }
        .cert-lead { font-size: 1rem; color: #5A4535; line-height: 1.85; max-width: 660px; margin-bottom: 3rem; }
        .cert-lead-light { color: rgba(255,255,255,0.55); }

        /* Pillars */
        .cert-pillars { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; }
        @media (max-width: 760px) { .cert-pillars { grid-template-columns: 1fr; } }
        .cert-pillar { background: var(--cp-sand); border-radius: 14px; padding: 2rem 1.75rem; border-top: 3px solid var(--cp-gold); }
        .cert-pillar-icon { width: 44px; height: 44px; background: var(--cp-deep); border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-bottom: 1.25rem; }
        .cert-pillar h3 { font-family: var(--font-cormorant, serif); font-size: 1.25rem; font-weight: 600; color: var(--cp-deep); margin: 0 0 0.6rem; }
        .cert-pillar p { font-size: 0.875rem; color: #5A4535; line-height: 1.75; margin: 0; }

        /* Process steps */
        .cert-steps-wrap { display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; align-items: center; }
        @media (max-width: 860px) { .cert-steps-wrap { grid-template-columns: 1fr; gap: 2.5rem; } }
        .cert-step-list { display: flex; flex-direction: column; gap: 1rem; }
        .cert-step-item { display: flex; gap: 1.25rem; padding: 1.5rem; border-radius: 12px; cursor: pointer; transition: background 0.2s; border: 1px solid transparent; }
        .cert-step-item.active { background: white; border-color: rgba(201,168,76,0.2); box-shadow: 0 4px 24px rgba(201,168,76,0.08); }
        .cert-step-num { flex-shrink: 0; width: 40px; height: 40px; border-radius: 50%; background: var(--cp-deep); color: var(--cp-gold); font-weight: 700; font-size: 0.85rem; display: flex; align-items: center; justify-content: center; transition: transform 0.2s; }
        .cert-step-item.active .cert-step-num { transform: scale(1.1); }
        .cert-step-body h3 { font-size: 0.97rem; font-weight: 700; color: var(--cp-deep); margin: 0 0 0.35rem; }
        .cert-step-body p { font-size: 0.84rem; color: #5A4535; line-height: 1.7; margin: 0; }
        .cert-step-visual { background: var(--cp-deep); border-radius: 16px; padding: 2.5rem 2rem; position: relative; overflow: hidden; min-height: 300px; display: flex; flex-direction: column; justify-content: center; }
        .cert-step-vis-num { font-family: var(--font-cormorant, serif); font-size: 7rem; color: rgba(201,168,76,0.06); position: absolute; top: 0.5rem; right: 1.5rem; line-height: 1; font-weight: 700; }
        .cert-step-vis-label { font-size: 0.65rem; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; color: rgba(201,168,76,0.6); margin-bottom: 0.85rem; }
        .cert-step-vis-title { font-family: var(--font-cormorant, serif); font-size: 1.6rem; color: white; font-weight: 600; margin-bottom: 1rem; }
        .cert-step-vis-items { display: flex; flex-direction: column; gap: 0.6rem; }
        .cert-step-vis-item { display: flex; align-items: center; gap: 0.65rem; font-size: 0.83rem; color: rgba(255,255,255,0.6); }
        .cert-step-vis-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--cp-gold); flex-shrink: 0; }

        /* Criteria grid */
        .cert-criteria-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.25rem; }
        @media (max-width: 900px) { .cert-criteria-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 560px) { .cert-criteria-grid { grid-template-columns: 1fr; } }
        .cert-crit-card { background: rgba(255,255,255,0.04); border: 1px solid rgba(201,168,76,0.15); border-radius: 12px; padding: 1.5rem; }
        .cert-crit-num { font-family: var(--font-cormorant, serif); font-size: 2rem; color: rgba(201,168,76,0.2); font-weight: 700; margin-bottom: 0.5rem; line-height: 1; }
        .cert-crit-card h4 { font-size: 0.9rem; font-weight: 700; color: white; margin: 0 0 0.5rem; }
        .cert-crit-card p { font-size: 0.8rem; color: rgba(255,255,255,0.45); line-height: 1.7; margin: 0; }

        /* Badge section */
        .cert-badge-wrap { display: grid; grid-template-columns: auto 1fr; gap: 5rem; align-items: center; }
        @media (max-width: 800px) { .cert-badge-wrap { grid-template-columns: 1fr; gap: 3rem; text-align: center; justify-items: center; } }
        .cert-badge-glow { position: relative; }
        .cert-badge-glow::before { content: ''; position: absolute; inset: -20px; border-radius: 50%; background: radial-gradient(circle, rgba(201,168,76,0.15) 0%, transparent 70%); pointer-events: none; }
        .cert-badge-quote { font-family: var(--font-cormorant, serif); font-size: 1.25rem; font-style: italic; color: var(--cp-deep); line-height: 1.7; border-left: 3px solid var(--cp-gold); padding-left: 1.5rem; margin: 1.75rem 0; }
        @media (max-width: 800px) { .cert-badge-quote { border-left: none; border-top: 2px solid var(--cp-gold); padding-left: 0; padding-top: 1rem; } }
        .cert-badge-stat-row { display: flex; gap: 2.5rem; flex-wrap: wrap; margin-top: 2rem; }
        @media (max-width: 800px) { .cert-badge-stat-row { justify-content: center; } }
        .cert-badge-stat { }
        .cert-badge-stat-num { font-family: var(--font-cormorant, serif); font-size: 2.2rem; font-weight: 700; color: var(--cp-gold); line-height: 1; }
        .cert-badge-stat-label { font-size: 0.72rem; font-weight: 600; color: #7A6050; letter-spacing: 0.06em; margin-top: 0.2rem; }

        /* Partner section */
        .cert-partner-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.25rem; margin: 2.5rem 0 3rem; }
        @media (max-width: 660px) { .cert-partner-grid { grid-template-columns: 1fr; } }
        .cert-partner-card { background: rgba(255,255,255,0.04); border: 1px solid rgba(201,168,76,0.15); border-radius: 12px; padding: 1.4rem 1.5rem; display: flex; gap: 1rem; }
        .cert-partner-icon { font-size: 1.4rem; flex-shrink: 0; }
        .cert-partner-card h4 { font-size: 0.88rem; font-weight: 700; color: white; margin: 0 0 0.35rem; }
        .cert-partner-card p { font-size: 0.8rem; color: rgba(255,255,255,0.45); line-height: 1.65; margin: 0; }

        /* Form */
        .cert-form { background: rgba(255,255,255,0.04); border: 1px solid rgba(201,168,76,0.2); border-radius: 16px; padding: 2.25rem 2.5rem; max-width: 600px; }
        .cert-form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        @media (max-width: 560px) { .cert-form-row { grid-template-columns: 1fr; } }
        .cert-field { display: flex; flex-direction: column; gap: 0.4rem; margin-bottom: 1rem; }
        .cert-field label { font-size: 0.72rem; font-weight: 700; letter-spacing: 0.08em; color: rgba(201,168,76,0.8); text-transform: uppercase; }
        .cert-field input, .cert-field textarea { background: rgba(255,255,255,0.06); border: 1px solid rgba(201,168,76,0.2); border-radius: 8px; padding: 0.75rem 1rem; font-size: 0.875rem; color: white; font-family: inherit; outline: none; transition: border-color 0.2s; resize: none; }
        .cert-field input::placeholder, .cert-field textarea::placeholder { color: rgba(255,255,255,0.25); }
        .cert-field input:focus, .cert-field textarea:focus { border-color: rgba(201,168,76,0.5); }

        /* CTA final */
        .cert-cta-final { background: linear-gradient(135deg, var(--cp-deep) 0%, #2C1810 100%); padding: 7rem 2rem; text-align: center; position: relative; overflow: hidden; }
        .cert-cta-arabic { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-family: var(--font-cormorant, serif); font-size: clamp(6rem, 18vw, 14rem); color: rgba(201,168,76,0.04); direction: rtl; pointer-events: none; white-space: nowrap; line-height: 1; }
        .cert-cta-inner { position: relative; max-width: 640px; margin: 0 auto; }
        .cert-cta-inner h2 { font-family: var(--font-cormorant, serif); font-size: clamp(2rem, 5vw, 3rem); color: white; font-weight: 600; margin: 0 0 1rem; }
        .cert-cta-inner p { font-size: 0.95rem; color: rgba(255,255,255,0.45); line-height: 1.85; margin: 0 0 2.5rem; }
        .cert-btn-row { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }
        .cert-btn-gold { background: var(--cp-gold); color: var(--cp-deep); font-weight: 700; font-size: 0.9rem; padding: 0.9rem 2.25rem; border-radius: 8px; text-decoration: none; letter-spacing: 0.03em; transition: opacity 0.2s; }
        .cert-btn-gold:hover { opacity: 0.88; }
        .cert-btn-ghost { background: transparent; color: rgba(255,255,255,0.6); font-weight: 600; font-size: 0.9rem; padding: 0.9rem 2.25rem; border-radius: 8px; text-decoration: none; border: 1px solid rgba(255,255,255,0.15); transition: border-color 0.2s, color 0.2s; }
        .cert-btn-ghost:hover { border-color: var(--cp-gold); color: var(--cp-gold); }
        .cert-submit-btn { width: 100%; background: var(--cp-gold); color: var(--cp-deep); font-weight: 700; font-size: 0.88rem; padding: 0.9rem; border-radius: 8px; border: none; cursor: pointer; font-family: inherit; letter-spacing: 0.04em; transition: opacity 0.2s; margin-top: 0.5rem; }
        .cert-submit-btn:hover { opacity: 0.88; }
      `}} />

      <Navbar />

      {/* ── HERO ── */}
      <section className="cert-hero">
        <div className="cert-hero-arabic">شهادة</div>
        <div className="cert-hero-lines" />
        <div className="cert-hero-inner">
          <p className="cert-eyebrow cert-reveal">Programme officiel SAFARUMA</p>
          <h1 className="cert-reveal cert-reveal-d1">
            La Certification SAFARUMA<br />
            <span style={{ color: "var(--cp-gold)" }}>Le gage de confiance islamique</span>
          </h1>
          <p className="cert-hero-sub cert-reveal cert-reveal-d2">
            Pas un label commercial. Un protocole rigoureux développé par l'équipe SAFARUMA — pour que chaque pèlerin sache qu'il est entre de bonnes mains.
          </p>
          <div className="cert-hero-pills cert-reveal cert-reveal-d3">
            <span className="cert-pill">Connaissance islamique</span>
            <span className="cert-pill">Savoir-faire terrain</span>
            <span className="cert-pill">Éthique & confiance</span>
            <span className="cert-pill">Sélection rigoureuse</span>
          </div>
        </div>
      </section>

      {/* ── SECTION 1 : POURQUOI ── */}
      <section className="cert-section cert-section-light">
        <div className="cert-section-inner">
          <span className="cert-tag cert-reveal">Pourquoi la certification</span>
          <h2 className="cert-h2 cert-reveal cert-reveal-d1">Tout le monde peut se dire guide.<br />SAFARUMA vérifie et sélectionne ceux qui le sont vraiment.</h2>
          <p className="cert-lead cert-reveal cert-reveal-d2">
            En l'absence de standard reconnu, n'importe qui peut proposer ses services comme «guide de la Omra». Nous avons construit un processus de certification exigeant, fondé sur trois piliers indissociables, pour protéger les pèlerins et valoriser les vrais professionnels.
          </p>

          <div className="cert-pillars">
            {[
              {
                icon: (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
                  </svg>
                ),
                title: "Connaissance islamique",
                body: "Fiqh de la Omra, histoire de La Mecque, du'as des rituels, maîtrise des différentes madhabs. Le guide doit être un enseignant, pas seulement un accompagnateur.",
              },
              {
                icon: (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>
                  </svg>
                ),
                title: "Savoir-faire terrain",
                body: "Gestion des flux d'affluence, sécurité de groupe, protocoles d'urgence, adaptation au rythme des pèlerins seniors ou PMR. L'expérience terrain est vérifiée et évaluée.",
              },
              {
                icon: (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                ),
                title: "Éthique et confiance",
                body: "Honnêteté tarifaire, respect de la vie privée, absence de conflit d'intérêts, adhésion à la Charte Islamique SAFARUMA. L'éthique n'est pas optionnelle.",
              },
            ].map((p, i) => (
              <div key={p.title} className={`cert-pillar cert-reveal cert-reveal-d${i + 1}`}>
                <div className="cert-pillar-icon">{p.icon}</div>
                <h3>{p.title}</h3>
                <p>{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 2 : PROCESSUS ── */}
      <section className="cert-section cert-section-sand">
        <div className="cert-section-inner">
          <span className="cert-tag cert-reveal">Le processus</span>
          <h2 className="cert-h2 cert-reveal cert-reveal-d1">La certification en 3 étapes</h2>
          <p className="cert-lead cert-reveal cert-reveal-d2">
            Un parcours structuré, transparent et rigoureux. Chaque étape est conçue pour évaluer une dimension différente du profil du guide.
          </p>

          <div className="cert-steps-wrap">
            <div className="cert-step-list cert-reveal cert-reveal-d2">
              {[
                {
                  num: "1",
                  title: "Inscription et dossier",
                  body: "Identité vérifiée, expérience documentée, langues maîtrisées, références islamiques fournies. Le dossier est examiné par notre équipe sous 72h.",
                  details: ["Pièce d'identité ou passeport", "Curriculum vitae et expérience terrain", "Langues parlées et niveaux", "Lettres de recommandation (optionnel)"],
                },
                {
                  num: "2",
                  title: "Test de certification en ligne",
                  body: "Examen en 3 modules : histoire et géographie islamique de La Mecque, rituels et Fiqh de la Omra, mise en situation éthique et déontologie.",
                  details: ["Module 1 — Histoire & Géographie (40 questions)", "Module 2 — Rituels & Fiqh (50 questions)", "Module 3 — Éthique & Déontologie (30 questions)", "Score minimum requis : 78%"],
                },
                {
                  num: "3",
                  title: "Validation par le Comité de sélection SAFARUMA",
                  body: "Les dossiers ayant passé le test sont soumis au Comité de sélection SAFARUMA pour validation finale et attribution du badge vérifié.",
                  details: ["Revue du dossier complet par le Comité", "Entretien oral (optionnel selon profil)", "Attribution du badge numérique vérifié", "Accès au réseau SAFARUMA"],
                },
              ].map((s, i) => (
                <div
                  key={s.num}
                  className={`cert-step-item${activeStep === i ? " active" : ""}`}
                  onClick={() => setActiveStep(i)}
                >
                  <div className="cert-step-num">{s.num}</div>
                  <div className="cert-step-body">
                    <h3>{s.title}</h3>
                    <p>{s.body}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="cert-step-visual cert-reveal cert-reveal-d3">
              <div className="cert-step-vis-num">0{activeStep + 1}</div>
              <p className="cert-step-vis-label">Étape {activeStep + 1} / 3</p>
              <p className="cert-step-vis-title">
                {activeStep === 0 && "Inscription et dossier"}
                {activeStep === 1 && "Test de certification"}
                {activeStep === 2 && "Validation du Comité"}
              </p>
              <div className="cert-step-vis-items">
                {(activeStep === 0
                  ? ["Pièce d'identité ou passeport", "CV et expérience terrain", "Langues parlées et niveaux", "Lettres de recommandation"]
                  : activeStep === 1
                  ? ["Module 1 — Histoire & Géographie (40 q.)", "Module 2 — Rituels & Fiqh (50 q.)", "Module 3 — Éthique & Déontologie (30 q.)", "Score minimum requis : 78%"]
                  : ["Revue du dossier complet par le Comité", "Entretien oral selon profil", "Attribution du badge numérique vérifié", "Accès au réseau SAFARUMA"]
                ).map((item) => (
                  <div key={item} className="cert-step-vis-item">
                    <div className="cert-step-vis-dot" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 3 : BADGE ── */}
      <section className="cert-section cert-section-light">
        <div className="cert-section-inner">
          <span className="cert-tag cert-reveal">Le Badge</span>
          <div className="cert-badge-wrap">
            <div className="cert-badge-glow cert-reveal">
              <CertBadgeSVG />
            </div>
            <div className="cert-reveal cert-reveal-d1">
              <h2 className="cert-h2" style={{ marginBottom: "0.75rem" }}>Le Badge Vérifié SAFARUMA</h2>
              <p style={{ fontSize: "0.95rem", color: "#5A4535", lineHeight: 1.8, marginBottom: 0 }}>
                Visible sur chaque profil guide, ce badge est infalsifiable et lié à l'identité vérifiée du guide. Il est renouvelé chaque année après une mise à jour des connaissances.
              </p>
              <blockquote className="cert-badge-quote">
                «Ce badge atteste que ce guide a été évalué et validé par SAFARUMA selon un protocole rigoureux développé par l'équipe SAFARUMA.»
              </blockquote>
              <div className="cert-badge-stat-row">
                {[
                  { num: "100%", label: "Guides vérifiés avant badge" },
                  { num: "78%", label: "Score minimum au test" },
                  { num: "1 an", label: "Durée avant renouvellement" },
                ].map((s) => (
                  <div key={s.label} className="cert-badge-stat">
                    <div className="cert-badge-stat-num">{s.num}</div>
                    <div className="cert-badge-stat-label">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Criteria */}
          <div style={{ marginTop: "5rem" }}>
            <span className="cert-tag cert-reveal">Ce qui est évalué</span>
            <h2 className="cert-h2 cert-reveal cert-reveal-d1" style={{ marginBottom: "2rem" }}>Les 6 critères de certification</h2>
          </div>
        </div>
        {/* Criteria on dark background */}
        <div style={{ background: "var(--cp-deep)", padding: "3rem 2rem", marginTop: "1.5rem" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <div className="cert-criteria-grid">
              {CRITERIA.map((c, i) => (
                <div key={c.num} className={`cert-crit-card cert-reveal cert-reveal-d${(i % 3) + 1}`}>
                  <div className="cert-crit-num">{c.num}</div>
                  <h4>{c.title}</h4>
                  <p>{c.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 4 : COMITÉ (EN COURS DE CONSTITUTION) ── */}
      <section className="cert-section cert-section-sand">
        <div className="cert-section-inner">
          <span className="cert-tag cert-reveal">Le Comité de sélection</span>
          <h2 className="cert-h2 cert-reveal cert-reveal-d1">Un Comité de sélection<br />en cours de constitution</h2>
          <p className="cert-lead cert-reveal cert-reveal-d2" style={{ marginBottom: "2rem" }}>
            SAFARUMA collabore activement avec des savants islamiques, imams et experts du pèlerinage pour valider son protocole de sélection. Les membres du Comité seront annoncés prochainement.
          </p>

          <div className="cert-reveal" style={{ background: "rgba(201,168,76,0.06)", border: "1px solid rgba(201,168,76,0.25)", borderRadius: 14, padding: "2rem 2.25rem", display: "flex", gap: "1.5rem", alignItems: "flex-start", maxWidth: 680 }}>
            <div style={{ width: 44, height: 44, borderRadius: "50%", background: "var(--cp-deep)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: "1.1rem" }}>✦</div>
            <div>
              <p style={{ fontSize: "1rem", color: "var(--cp-deep)", fontWeight: 600, margin: "0 0 0.5rem", fontFamily: "var(--font-cormorant, serif)", lineHeight: 1.4 }}>
                Vous êtes savant, imam ou formateur islamique ?
              </p>
              <p style={{ fontSize: "0.875rem", color: "#5A4535", lineHeight: 1.8, margin: "0 0 1.25rem" }}>
                SAFARUMA recherche des experts du pèlerinage et des sciences islamiques pour participer à la construction de son Comité de sélection. Rejoignez un projet qui valorise l'excellence islamique dans l'accompagnement des pèlerins francophones.
              </p>
              <a
                href="mailto:contact@safaruma.com?subject=Candidature%20Comité%20de%20sélection%20SAFARUMA"
                style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", background: "var(--cp-deep)", color: "var(--cp-gold)", fontWeight: 700, fontSize: "0.85rem", padding: "0.7rem 1.4rem", borderRadius: 8, textDecoration: "none", letterSpacing: "0.03em" }}
              >
                Contactez-nous →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 5 : PARTENARIAT MOSQUÉES ── */}
      <section className="cert-section cert-section-dark">
        <div className="cert-section-inner">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4rem", alignItems: "start" }}>
            <div>
              <span className="cert-tag cert-tag-light cert-reveal">Mosquées & Associations</span>
              <h2 className="cert-h2 cert-h2-light cert-reveal cert-reveal-d1">SAFARUMA offre des guides vérifiés et sélectionnés aux mosquées partenaires</h2>
              <p className="cert-lead cert-lead-light cert-reveal cert-reveal-d2">
                Votre association ou mosquée organise des voyages pour la Omra ? Devenez partenaire SAFARUMA et offrez à vos fidèles des guides vérifiés et sélectionnés avec un programme spirituel sur-mesure.
              </p>

              <div className="cert-partner-grid cert-reveal cert-reveal-d2">
                {PARTNER_BENEFITS.map((b) => (
                  <div key={b.title} className="cert-partner-card">
                    <span className="cert-partner-icon">{b.icon}</span>
                    <div>
                      <h4>{b.title}</h4>
                      <p>{b.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="cert-reveal cert-reveal-d2">
              <h3 style={{ fontFamily: "var(--font-cormorant, serif)", fontSize: "1.25rem", color: "rgba(201,168,76,0.9)", margin: "0 0 1.5rem", fontWeight: 600 }}>Formulaire de partenariat</h3>
              {submitted ? (
                <div style={{ background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.3)", borderRadius: 12, padding: "2rem", textAlign: "center" }}>
                  <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>✓</div>
                  <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.9rem", lineHeight: 1.75, margin: 0 }}>
                    Votre messagerie s'est ouverte avec les informations pré-remplies. Envoyez l'email à <strong style={{ color: "var(--cp-gold)" }}>contact@safaruma.com</strong> — nous vous répondrons sous 48h.
                  </p>
                </div>
              ) : (
                <form className="cert-form" onSubmit={handleSubmit}>
                  <div className="cert-form-row">
                    <div className="cert-field">
                      <label>Votre nom *</label>
                      <input type="text" required placeholder="Imam Al-Farouqi" value={formState.name} onChange={(e) => setFormState((p) => ({ ...p, name: e.target.value }))} />
                    </div>
                    <div className="cert-field">
                      <label>Organisation *</label>
                      <input type="text" required placeholder="Mosquée Al-Nour Paris" value={formState.org} onChange={(e) => setFormState((p) => ({ ...p, org: e.target.value }))} />
                    </div>
                  </div>
                  <div className="cert-field">
                    <label>Email de contact *</label>
                    <input type="email" required placeholder="contact@mosquee-example.fr" value={formState.email} onChange={(e) => setFormState((p) => ({ ...p, email: e.target.value }))} />
                  </div>
                  <div className="cert-field">
                    <label>Votre message</label>
                    <textarea rows={4} placeholder="Décrivez votre projet : nombre de pèlerins, période envisagée, besoins spécifiques..." value={formState.message} onChange={(e) => setFormState((p) => ({ ...p, message: e.target.value }))} />
                  </div>
                  <button type="submit" className="cert-submit-btn">Envoyer la demande de partenariat →</button>
                  <p style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.3)", margin: "0.75rem 0 0", textAlign: "center" }}>Réponse garantie sous 48h — contact@safaruma.com</p>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section className="cert-cta-final">
        <div className="cert-cta-arabic">شهادة</div>
        <div className="cert-cta-inner">
          <p style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--cp-gold)", marginBottom: "1.25rem" }} className="cert-reveal">Rejoindre SAFARUMA</p>
          <h2 className="cert-reveal cert-reveal-d1">Passez la certification.<br />Devenez un guide reconnu.</h2>
          <p className="cert-reveal cert-reveal-d2">
            Vous souhaitez obtenir la certification SAFARUMA ? Déposez votre candidature — le processus est gratuit et ouvert toute l'année.
          </p>
          <div className="cert-btn-row cert-reveal cert-reveal-d3">
            <Link href="/guide/inscription" className="cert-btn-gold">Passer la certification →</Link>
            <a href="https://wa.me/message/ZGUPRJRNVJRGN1" target="_blank" rel="noopener noreferrer" className="cert-btn-ghost">Questions ? WhatsApp</a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
