'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { OMRA_RITES } from '@/lib/omraRites';

const MIQAT = OMRA_RITES.find(r => r.id === 'miqat')!;
const IHRAM = OMRA_RITES.find(r => r.id === 'ihram')!;
const ARRIVEE = OMRA_RITES.find(r => r.id === 'arrivee')!;
const TAWAF = OMRA_RITES.find(r => r.id === 'tawaf')!;
const SAI = OMRA_RITES.find(r => r.id === 'sai')!;
const TAHALLUL = OMRA_RITES.find(r => r.id === 'tahallul')!;

const SECTIONS = [
  { id: 'introduction', label: 'Introduction' },
  { id: 'miqat',        label: 'Le Miqat' },
  { id: 'ihram',        label: "L'Ihram" },
  { id: 'arrivee',      label: 'Arrivée à Makkah' },
  { id: 'tawaf',        label: 'Le Tawaf' },
  { id: 'sai',          label: "La Sa'i" },
  { id: 'tahallul',     label: 'Fin de la Omra' },
];

function ImagePlaceholder({ caption }: { caption: string }) {
  return (
    <div className="image-placeholder">
      <span style={{ fontSize: '1.3rem', opacity: 0.4 }}>🖼</span>
      <span>{caption}</span>
    </div>
  );
}

export default function GuideOmraClient() {
  const { status } = useSession();
  const [activeSection, setActiveSection] = useState('introduction');
  const isGated = status === 'unauthenticated';

  useEffect(() => {
    const onScroll = () => {
      for (let i = SECTIONS.length - 1; i >= 0; i--) {
        const sec = document.getElementById(SECTIONS[i].id);
        if (sec && sec.getBoundingClientRect().top <= 150) {
          setActiveSection(SECTIONS[i].id);
          return;
        }
      }
      setActiveSection('introduction');
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <>
      <Navbar />

      {/* Hero */}
      <section className="guide-hero">
        <span className="arabic-bg" aria-hidden="true">عمرة</span>
        <div className="guide-hero-inner">
          <h1>
            La Omra étape par étape
            <span className="hero-subtitle">Rituels &amp; Du&apos;as</span>
          </h1>
          <p className="hero-lead">
            Du Miqat au Tahallul, chaque rituel expliqué simplement, avec ses du&apos;as authentiques.
          </p>
          <div className="guide-tags">
            <span className="tag-chip">Miqat</span>
            <span className="tag-chip">Ihram</span>
            <span className="tag-chip">Tawaf</span>
            <span className="tag-chip">Sa&apos;i</span>
          </div>
        </div>
      </section>

      {/* Stepper */}
      <div style={{ background: '#FAF7F0' }}>
        <div className="guide-stepper">
          {SECTIONS.map(s => (
            <button
              key={s.id}
              className={`step-btn ${activeSection === s.id ? 'step-active' : 'step-inactive'}`}
              onClick={() => scrollTo(s.id)}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <article className="guide-content">

        {/* ── INTRODUCTION ── */}
        <section id="introduction">
          <h2>Comprendre la Omra</h2>
          <p>
            La Omra — en arabe <strong>العمرة</strong> — est le pèlerinage mineur à La Mecque. Elle n&apos;est
            pas obligatoire, mais fortement recommandée, et peut être accomplie à n&apos;importe quel moment
            de l&apos;année.
          </p>
          <p>
            Une Omra n&apos;est acceptée que si elle réunit deux conditions : la sincérité de l&apos;intention
            envers Allah, et la conformité aux gestes accomplis par le Prophète ﷺ. Elle comprend quatre
            rituels fondamentaux : l&apos;Ihram, le Tawaf, le Sa&apos;i, et la fin de la Omra (Tahallul).
            Ce guide vous accompagne à travers chacun d&apos;eux, avec les du&apos;as correspondantes.
          </p>
        </section>

        {/* ── CONTENT GATE ── */}
        <div style={{ position: 'relative' }}>
          <div className={isGated ? 'guide-gate-blur' : ''}>

        {/* ── MIQAT ── */}
        <section id="miqat">
          <span className="label-overline">AVANT L&apos;IHRAM</span>
          <h2>Le Miqat</h2>
          <p>{MIQAT.intro[0]}</p>
          <p>{MIQAT.intro[1]}</p>

          <div className="info-card">
            <div className="info-icon">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M2 5l5-3 5 3v6l-5 3-5-3V5z" stroke="#C9A84C" strokeWidth="1" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="info-content">
              <h3>{MIQAT.keyFacts[0].title}</h3>
              <p>{MIQAT.keyFacts[0].body}</p>
            </div>
          </div>

          <ImagePlaceholder caption="Carte : position du Miqat (Dhul Hulayfah / Bir Ali) par rapport à Madinah et Makkah" />

          <div className="quote-block">
            <span className="quote-icon">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M3 5h2v4H3V5zm6 0h2v4H9V5z" fill="#C9A84C"/>
              </svg>
              {MIQAT.duas[0].label}
            </span>
            <p>
              <strong>{MIQAT.duas[0].ar}</strong><br/>
              <em>{MIQAT.duas[0].phon}</em><br/>
              {MIQAT.duas[0].fr}
            </p>
          </div>

          <div className="quote-block">
            <span className="quote-icon">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M3 5h2v4H3V5zm6 0h2v4H9V5z" fill="#C9A84C"/>
              </svg>
              {MIQAT.duas[1].label}
            </span>
            <p>
              <strong>{MIQAT.duas[1].ar}</strong><br/>
              <em>{MIQAT.duas[1].phon}</em><br/>
              {MIQAT.duas[1].fr}
            </p>
          </div>

          <p>{MIQAT.afterNote}</p>
        </section>

        {/* ── IHRAM ── */}
        <section id="ihram">
          <span className="label-overline">RITUEL 1</span>
          <h2>L&apos;Ihram</h2>
          <p>{IHRAM.intro[0]}</p>

          <div className="cards-grid-2">
            <div className="info-card">
              <div className="info-icon">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path d="M2 5l5-3 5 3v6l-5 3-5-3V5z" stroke="#C9A84C" strokeWidth="1" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="info-content">
                <h3>{IHRAM.keyFacts[0].title}</h3>
                <p>{IHRAM.keyFacts[0].body}</p>
              </div>
            </div>
            <div className="info-card">
              <div className="info-icon">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path d="M2 5l5-3 5 3v6l-5 3-5-3V5z" stroke="#C9A84C" strokeWidth="1" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="info-content">
                <h3>{IHRAM.keyFacts[1].title}</h3>
                <p>{IHRAM.keyFacts[1].body}</p>
              </div>
            </div>
          </div>

          <div className="info-card">
            <div className="info-icon">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M2 7h10M9 4l3 3-3 3" stroke="#C9A84C" strokeWidth="1" strokeLinecap="round"/>
              </svg>
            </div>
            <div className="info-content">
              <h3>{IHRAM.keyFacts[2].title}</h3>
              <p>{IHRAM.keyFacts[2].body}</p>
            </div>
          </div>

          <div className="info-card">
            <div className="info-icon">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M2 7h10M9 4l3 3-3 3" stroke="#C9A84C" strokeWidth="1" strokeLinecap="round"/>
              </svg>
            </div>
            <div className="info-content">
              <h3>{IHRAM.keyFacts[3].title}</h3>
              <p>{IHRAM.keyFacts[3].body}</p>
            </div>
          </div>

          <ImagePlaceholder caption="Illustration : la tenue Ihram (Izar / Rida) — vue correcte vs erreur fréquente (épaule découverte hors Tawaf)" />
        </section>

        {/* ── ARRIVÉE À MAKKAH ── */}
        <section id="arrivee">
          <span className="label-overline">EN ARRIVANT</span>
          <h2>Arrivée à Makkah</h2>
          <p>{ARRIVEE.intro[0]}</p>
          <p>{ARRIVEE.intro[1]}</p>

          <ImagePlaceholder caption="Photo : première vue de la Kaaba depuis l'intérieur du Masjid Al-Haram" />

          {ARRIVEE.duas.map(d => (
            <div key={d.label} className="quote-block">
              <span className="quote-icon">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path d="M3 5h2v4H3V5zm6 0h2v4H9V5z" fill="#C9A84C"/>
                </svg>
                {d.label}
              </span>
              <p>
                <strong>{d.ar}</strong><br/>
                <em>{d.phon}</em><br/>
                {d.fr}
              </p>
            </div>
          ))}
        </section>

        {/* ── TAWAF ── */}
        <section id="tawaf">
          <span className="label-overline">RITUEL 2</span>
          <h2>Le Tawaf</h2>
          <p>{TAWAF.intro[0]}</p>
          <p>{TAWAF.intro[1]}</p>

          <div className="info-card">
            <div className="info-icon">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <circle cx="7" cy="7" r="4" stroke="#C9A84C" strokeWidth="1"/>
                <circle cx="7" cy="7" r="1.5" fill="#C9A84C"/>
              </svg>
            </div>
            <div className="info-content">
              <h3>{TAWAF.keyFacts[1].title}</h3>
              <p>{TAWAF.keyFacts[1].body}</p>
            </div>
          </div>

          {TAWAF.duas.map(d => (
            <div key={d.label} className="quote-block">
              <span className="quote-icon">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path d="M3 5h2v4H3V5zm6 0h2v4H9V5z" fill="#C9A84C"/>
                </svg>
                {d.label}
              </span>
              <p>
                <strong>{d.ar}</strong><br/>
                <em>{d.phon}</em><br/>
                {d.fr}
              </p>
            </div>
          ))}

          <p>{TAWAF.afterNote}</p>

          <ImagePlaceholder caption="Schéma : plan du Tawaf avec Hajar Aswad, Hijr Ismaël, Rukn Yamani, Maqam Ibrahim et sens de circulation" />
        </section>

        {/* ── SA'I ── */}
        <section id="sai">
          <span className="label-overline">RITUEL 3</span>
          <h2>Entre Safa et Marwa</h2>
          <p>{SAI.intro[0]}</p>
          <p>{SAI.intro[1]}</p>

          <div className="info-card">
            <div className="info-icon">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M3 11V3h2v8M9 11V3h2v8" stroke="#C9A84C" strokeWidth="1"/>
              </svg>
            </div>
            <div className="info-content">
              <h3>{SAI.keyFacts[0].title}</h3>
              <p>{SAI.keyFacts[0].body} {SAI.keyFacts[1].body}</p>
            </div>
          </div>

          <ImagePlaceholder caption="Schéma : trajet du Sa'i entre Safa et Marwa avec les 7 trajets et les repères verts" />

          {SAI.duas.map(d => (
            <div key={d.label} className="quote-block">
              <span className="quote-icon">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path d="M3 5h2v4H3V5zm6 0h2v4H9V5z" fill="#C9A84C"/>
                </svg>
                {d.label}
              </span>
              <p>
                <strong>{d.ar}</strong><br/>
                <em>{d.phon}</em><br/>
                {d.fr}
              </p>
            </div>
          ))}

          <p>{SAI.afterNote}</p>
        </section>

        {/* ── FIN DE LA OMRA ── */}
        <section id="tahallul">
          <span className="label-overline">RITUEL 4</span>
          <h2>Fin de la Omra</h2>
          <p>{TAHALLUL.intro[0]}</p>
          <p>{TAHALLUL.intro[1]}</p>

          <ImagePlaceholder caption="Illustration : Halq (rasage complet) et Taqsir (raccourcissement) — les deux options pour les hommes" />
        </section>

        {/* ── Bandeau fin de guide ── */}
        <div style={{
          background: '#FFFFFF', border: '1px solid #EDE8DC', borderRadius: 12,
          padding: '16px 18px', marginTop: '28px',
          display: 'flex', alignItems: 'center', gap: '14px',
          borderLeft: '3px solid #C9A84C',
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
            <path d="M4 19.5A2.5 2.5 0 016.5 17H20" stroke="#C9A84C" strokeWidth="1.4" strokeLinecap="round"/>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" stroke="#C9A84C" strokeWidth="1.4" strokeLinejoin="round"/>
            <path d="M9 7h6M9 11h4" stroke="#C9A84C" strokeWidth="1" strokeLinecap="round"/>
          </svg>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#1A1209', marginBottom: '3px' }}>
              La suite du guide dans votre espace pèlerin
            </div>
            <div style={{ fontSize: '12px', color: '#5A4E3A', lineHeight: 1.55 }}>
              Version complète, avec suivi de progression — gratuit.
            </div>
          </div>
          <Link href="/inscription" style={{
            display: 'inline-flex', alignItems: 'center', gap: '5px', flexShrink: 0,
            padding: '8px 14px', borderRadius: 999, background: '#1A1209',
            color: '#F0D897', fontSize: '12px', fontWeight: 600, textDecoration: 'none',
            letterSpacing: '0.02em',
          }}>
            Accéder
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path d="M2 6h8M7 3l3 3-3 3" stroke="#F0D897" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </Link>
        </div>

          </div>{/* end guide-gate-blur */}
          {isGated && <GateOverlay />}
        </div>{/* end gate wrapper */}

      </article>

      <Footer />
    </>
  );
}

const GATE_FEATURES = [
  "Rituels complets avec du'as",
  'Miqat, Ihram, Tawaf, Sa\'i et fin de la Omra',
];

function GateOverlay() {
  return (
    <div style={{
      position: 'relative', marginTop: '-280px', zIndex: 10,
      background: 'linear-gradient(to bottom, rgba(250,247,240,0) 0px, rgba(250,247,240,0.92) 110px, #FAF7F0 190px)',
      paddingTop: '48px', paddingBottom: '40px',
      display: 'flex', justifyContent: 'center',
    }}>
      {/* Gold gradient border wrapper */}
      <div style={{
        position: 'relative', borderRadius: 20, padding: '1.5px',
        background: 'linear-gradient(135deg, #C9A84C 0%, #F0D897 28%, #C9A84C 50%, #8B6B2A 72%, #C9A84C 100%)',
        animation: 'gateGoldGlow 3s ease-in-out infinite, gateCardIn 0.45s ease-out both',
        boxShadow: '0 0 40px rgba(201,168,76,0.22), 0 20px 60px rgba(0,0,0,0.55)',
        maxWidth: 390, width: '90%',
      }}>
        {/* Dark inner card */}
        <div style={{
          background: '#1A1209', borderRadius: '18.5px',
          padding: '26px 24px 22px', textAlign: 'center',
          position: 'relative', overflow: 'hidden',
        }}>
          {/* Radial glow top */}
          <div style={{
            position: 'absolute', top: -50, left: '50%', transform: 'translateX(-50%)',
            width: 240, height: 120, pointerEvents: 'none',
            background: 'radial-gradient(ellipse, rgba(201,168,76,0.18) 0%, transparent 70%)',
          }} />
          {/* Shimmer sweep */}
          <div style={{
            position: 'absolute', top: 0, left: 0, width: '45%', height: '100%',
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.025), transparent)',
            animation: 'gateShimmer 4.5s ease-in-out infinite',
            pointerEvents: 'none',
          }} />

          {/* Icône PDF */}
          <div style={{
            width: 46, height: 46, borderRadius: '50%', margin: '0 auto 14px',
            background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.28)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative', zIndex: 1,
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M4 19.5A2.5 2.5 0 016.5 17H20" stroke="#C9A84C" strokeWidth="1.4" strokeLinecap="round"/>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" stroke="#C9A84C" strokeWidth="1.4" strokeLinejoin="round"/>
              <path d="M9 7h6M9 11h4" stroke="#C9A84C" strokeWidth="1" strokeLinecap="round"/>
            </svg>
          </div>

          <div style={{
            fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.2em',
            textTransform: 'uppercase', color: 'rgba(201,168,76,0.7)',
            marginBottom: 10, position: 'relative', zIndex: 1,
          }}>
            Guide complet — Accès gratuit
          </div>

          <h3 style={{
            fontFamily: 'var(--font-cormorant, Georgia, serif)',
            fontSize: '1.3rem', fontWeight: 700, color: '#FAF7F0',
            margin: '0 0 5px', lineHeight: 1.25, position: 'relative', zIndex: 1,
          }}>
            Créez votre compte <span style={{ color: '#F0D897' }}>gratuit</span><br />en 5 secondes
          </h3>

          <div style={{ fontSize: '0.68rem', color: 'rgba(250,247,240,0.38)', margin: '0 0 16px', position: 'relative', zIndex: 1 }}>
            Accédez à la suite du guide Omra
          </div>

          <div style={{ width: 36, height: '0.5px', background: 'rgba(201,168,76,0.3)', margin: '0 auto 18px', position: 'relative', zIndex: 1 }} />

          {/* Features list avec ✦ — padding latéral pour centrage */}
          <div style={{
            display: 'flex', flexDirection: 'column', gap: 9,
            marginBottom: 22, textAlign: 'left',
            padding: '0 12px', position: 'relative', zIndex: 1,
          }}>
            {GATE_FEATURES.map(f => (
              <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 9, fontSize: '0.72rem', color: 'rgba(250,247,240,0.72)', lineHeight: 1.35 }}>
                <span style={{ color: '#C9A84C', fontSize: '0.625rem', flexShrink: 0, marginTop: 2 }}>✦</span>
                {f}
              </div>
            ))}
          </div>

          <Link href="/inscription" style={{
            display: 'block', width: '100%',
            background: 'linear-gradient(135deg, #C9A84C 0%, #F0D897 50%, #C9A84C 100%)',
            color: '#1A1209', padding: '13px 0', borderRadius: 50,
            fontSize: '0.84rem', fontWeight: 800, letterSpacing: '0.05em',
            textDecoration: 'none', marginBottom: 11,
            boxShadow: '0 4px 22px rgba(201,168,76,0.42)',
            position: 'relative', zIndex: 1,
          }}>
            S&apos;inscrire gratuitement
          </Link>

          <Link href="/connexion" style={{ fontSize: '0.67rem', color: 'rgba(250,247,240,0.3)', textDecoration: 'none', position: 'relative', zIndex: 1 }}>
            Déjà un compte ? <span style={{ color: 'rgba(201,168,76,0.6)' }}>Se connecter</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
