'use client';

import { useState } from 'react';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from 'next/link';
import { CATEGORIES } from './data';

const IconOmra = () => (
  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <rect x="3" y="7" width="10" height="7" rx="1" stroke="currentColor" strokeWidth="1.2"/>
    <path d="M1 14h14" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    <path d="M5 7V5a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    <rect x="7" y="9" width="2" height="3" rx="0.5" fill="currentColor"/>
  </svg>
);
const IconOrg = () => (
  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <rect x="2" y="3" width="12" height="11" rx="2" stroke="currentColor" strokeWidth="1.2"/>
    <path d="M2 7h12" stroke="currentColor" strokeWidth="1.2"/>
    <path d="M5 1v4M11 1v4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    <path d="M5 10h2M5 12.5h4" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
  </svg>
);
const IconGuides = () => (
  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.2"/>
    <path d="M2 14c0-3.3 2.7-5.5 6-5.5S14 10.7 14 14" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    <path d="M12 2l.4 1.2 1.2.4-1.2.4L12 5.2l-.4-1.2-1.2-.4 1.2-.4z" fill="currentColor"/>
  </svg>
);
const IconProblemes = () => (
  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M8 2L3 4.5v4c0 3.5 5 5.5 5 5.5s5-2 5-5.5v-4L8 2z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
    <path d="M8 7v2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <circle cx="8" cy="11.2" r="0.7" fill="currentColor"/>
  </svg>
);
const IconLieux = () => (
  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M8 2C5.8 2 4 3.8 4 6c0 3.5 4 8 4 8s4-4.5 4-8c0-2.2-1.8-4-4-4z" stroke="currentColor" strokeWidth="1.2"/>
    <circle cx="8" cy="6" r="1.5" fill="currentColor"/>
  </svg>
);

const ICON_MAP: Record<string, React.ComponentType> = {
  omra: IconOmra,
  organisation: IconOrg,
  guides: IconGuides,
  problemes: IconProblemes,
  lieux: IconLieux,
};

export default function FaqPage() {
  const [activeTab, setActiveTab] = useState('omra');
  const totalQ = CATEGORIES.reduce((acc, c) => acc + c.questions.length, 0);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        .faq-details { border-bottom: 1px solid #EDE8DC; }
        .faq-details summary {
          display: flex; align-items: center; justify-content: space-between;
          gap: 1rem; padding: 1.1rem 0; cursor: pointer; list-style: none;
          font-size: 0.9rem; font-weight: 600; color: #1A1209; line-height: 1.5;
          background: none; border: none; width: 100%; text-align: left;
        }
        .faq-details summary::-webkit-details-marker { display: none; }
        .faq-details summary::after {
          content: '+'; font-size: 1.1rem; color: #C9A84C; flex-shrink: 0;
          transition: transform 0.2s; display: inline-block; line-height: 1;
        }
        .faq-details[open] summary::after { transform: rotate(45deg); }
        .faq-details .faq-answer {
          padding-bottom: 1.1rem; font-size: 0.875rem;
          color: #5A4E3A; line-height: 1.75; padding-right: 2rem; margin: 0;
        }
      `}} />

      <Navbar />

      {/* Hero */}
      <section style={{ background: '#1A1209', padding: '11rem 1.5rem 4rem', textAlign: 'center' }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#C9A84C', marginBottom: '1rem' }}>Foire aux questions</div>
          <h1 style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: 'clamp(2.5rem, 5vw, 3.75rem)', fontWeight: 700, color: 'white', lineHeight: 1.1, margin: '0 0 1.25rem' }}>
            Toutes vos<br />
            <span style={{ color: '#C9A84C' }}>réponses ici</span>
          </h1>
          <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, margin: 0 }}>
            {totalQ} questions répondues, classées par thème.
          </p>
        </div>
      </section>

      {/* Tabs + Content */}
      <section style={{ background: '#F5F2EC', padding: '4rem 1.5rem 6rem' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>

          {/* Category pills */}
          <div style={{ display: 'flex', gap: '0.625rem', marginBottom: '2.5rem', overflowX: 'auto', flexWrap: 'nowrap', paddingBottom: '0.5rem', scrollbarWidth: 'none' }}>
            {CATEGORIES.map(cat => {
              const CatIcon = ICON_MAP[cat.id];
              const isActive = activeTab === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveTab(cat.id)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', padding: '0.6rem 1.25rem', borderRadius: 50, border: `1.5px solid ${isActive ? '#1A1209' : '#DDD7CC'}`, background: isActive ? '#1A1209' : 'white', color: isActive ? '#F0D897' : '#5A4E3A', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'var(--font-manrope, sans-serif)', whiteSpace: 'nowrap', flexShrink: 0 }}
                >
                  <CatIcon />
                  <span>{cat.label}</span>
                  <span style={{ background: isActive ? 'rgba(240,216,151,0.2)' : '#F5F2EC', color: isActive ? '#F0D897' : '#7A6D5A', fontSize: '0.65rem', fontWeight: 700, padding: '0.1rem 0.5rem', borderRadius: 50 }}>{cat.questions.length}</span>
                </button>
              );
            })}
          </div>

          {/* All categories in DOM — visibility controlled by display */}
          {CATEGORIES.map(cat => {
            const Icon = ICON_MAP[cat.id];
            return (
              <div key={cat.id} style={{ display: activeTab === cat.id ? 'block' : 'none' }}>
                <div style={{ background: 'white', border: '1px solid #EDE8DC', borderRadius: 20, padding: '0.5rem 2rem', boxShadow: '0 2px 16px rgba(26,18,9,0.04)' }}>
                  <div style={{ padding: '1.25rem 0 0.75rem', borderBottom: '2px solid #EDE8DC', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span style={{ color: '#C9A84C', display: 'flex', alignItems: 'center' }}><Icon /></span>
                    <span style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.35rem', fontWeight: 700, color: '#1A1209' }}>{cat.label}</span>
                  </div>
                  {cat.questions.map((item, i) => (
                    <details key={i} className="faq-details">
                      <summary>{item.q}</summary>
                      <p className="faq-answer">{item.a}</p>
                    </details>
                  ))}
                </div>
              </div>
            );
          })}

        </div>
      </section>

      {/* CTA */}
      <section style={{ background: '#1A1209', padding: '4rem 1.5rem', textAlign: 'center' }}>
        <div style={{ maxWidth: 560, margin: '0 auto' }}>
          <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', fontWeight: 700, color: 'white', lineHeight: 1.15, marginBottom: '1rem' }}>
            Votre question n&apos;est pas ici ?
          </div>
          <p style={{ color: 'rgba(255,255,255,0.65)', lineHeight: 1.7, marginBottom: '2rem', fontSize: '0.95rem' }}>
            Notre équipe répond sous 2h en semaine.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/contact" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#C9A84C', color: '#1A1209', padding: '0.85rem 2rem', borderRadius: 50, fontWeight: 700, fontSize: '0.88rem', letterSpacing: '0.04em', textDecoration: 'none' }}>
              Nous contacter
            </Link>
            <Link href="/inscription" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', border: '1.5px solid rgba(201,168,76,0.5)', color: '#F0D897', padding: '0.85rem 2rem', borderRadius: 50, fontWeight: 600, fontSize: '0.88rem', textDecoration: 'none' }}>
              Créer mon espace
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
