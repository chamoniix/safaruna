'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const SECTIONS = [
  { id: 'introduction', label: 'Introduction' },
  { id: 'preparation',  label: 'Préparation' },
  { id: 'rituels',      label: 'Rituels' },
];

export default function GuideOmraClient() {
  const [activeSection, setActiveSection] = useState('introduction');

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
      <Navbar transparentOnHero scrollThreshold={250} />

      {/* Hero */}
      <section className="guide-hero">
        <span className="arabic-bg" aria-hidden="true">عمرة</span>
        <div className="guide-hero-inner">
          <h1>
            La Omra étape par étape
            <span className="hero-subtitle">Rituels, Du&apos;as &amp; Conseils</span>
          </h1>
          <p className="hero-lead">
            De l&apos;Ihram au Tahallul, chaque rituel expliqué simplement, avec ses du&apos;as
            et ses conseils pratiques pour vivre pleinement ce voyage sacré.
          </p>
          <div className="guide-tags">
            <span className="tag-chip">Ihram</span>
            <span className="tag-chip">Tawaf</span>
            <span className="tag-chip">Sa&apos;i</span>
            <span className="tag-chip">Safa-Marwa</span>
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
            La Omra est un <strong>voyage de l&apos;âme</strong> bien plus qu&apos;un simple pèlerinage.
            C&apos;est l&apos;effacement des péchés d&apos;une vie entière.
          </p>
          <div className="quote-block">
            <span className="quote-icon">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M3 5h2v4H3V5zm6 0h2v4H9V5z" fill="#C9A84C"/>
              </svg>
              Hadith
            </span>
            <p>
              Le Prophète a dit : <em>« La Omra jusqu&apos;à la Omra suivante est une expiation
              pour ce qui s&apos;est passé entre elles. »</em> (Bukhari &amp; Muslim).
            </p>
          </div>
        </section>

        {/* ── PRÉPARATION ── */}
        <section id="preparation">
          <span className="label-overline">AVANT LE DÉPART</span>
          <h2>La Préparation</h2>
          <p>
            La Omra commence bien avant d&apos;embarquer. Une préparation sérieuse, à la fois
            spirituelle, physique et logistique, fait toute la différence entre un voyage accompli
            mécaniquement et une expérience qui transforme.
          </p>

          <div className="info-card">
            <div className="info-icon">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M2 5l5-3 5 3v6l-5 3-5-3V5z" stroke="#C9A84C" strokeWidth="1" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="info-content">
              <h3>Il existe 5 Miqats terrestres</h3>
              <p>
                Le Miqat est la frontière sacrée à partir de laquelle l&apos;état d&apos;Ihram devient
                obligatoire. Selon votre itinéraire et votre point de départ, vous franchirez l&apos;un
                de ces 5 Miqats.
              </p>
            </div>
          </div>

          <div className="faq-card">
            <div className="faq-num">1</div>
            <div className="faq-content">
              <h3>Quand dois-je enfiler l&apos;Ihram ?</h3>
              <p>
                Selon votre itinéraire. En général <strong>environ 1h avant le passage du Miqat
                dans l&apos;avion</strong>. L&apos;équipage annoncera le moment précis pour que vous
                ne le franchissiez pas sans être en état de sacralisation.
              </p>
            </div>
          </div>

          <div className="faq-card">
            <div className="faq-num">2</div>
            <div className="faq-content">
              <h3>Puis-je enlever l&apos;Ihram à l&apos;arrivée pour me reposer ?</h3>
              <p>
                <strong>Non.</strong> Une fois l&apos;Ihram enfilé et la Niyyah prononcée au Miqat,
                vous êtes en état de sacralisation. Vous ne pouvez plus l&apos;enlever avant
                d&apos;avoir accompli la Omra complète. Vous pouvez vous reposer en Ihram, mais
                l&apos;enlever avant la Omra entraîne une pénalité (<em>Fidya</em>).
              </p>
            </div>
          </div>

          <div className="faq-card">
            <div className="faq-num">3</div>
            <div className="faq-content">
              <h3>Comment prononcer la Niyyah ?</h3>
              <p>La Niyyah se prononce au moment du passage du Miqat.</p>
              <div className="arabic-dua">
                <div className="dua-ar">لَبَّيْكَ اللَّهُمَّ عُمْرَةً</div>
                <div className="dua-tr">Labbayka Allahumma &apos;Umratan</div>
                <div className="dua-fr">« Me voici, ô Allah, pour la Omra. »</div>
              </div>
              <p>Suivi du Talbiyah que vous répéterez jusqu&apos;au début du Tawaf.</p>
            </div>
          </div>
        </section>

        {/* ── CTA ESPACE PÈLERIN ── */}
        <div className="upgrade-card">
          <div className="upgrade-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 3v18M3 12h18" stroke="#C9A84C" strokeWidth="1.5" strokeLinecap="round"/>
              <circle cx="12" cy="12" r="9" stroke="#C9A84C" strokeWidth="1.2"/>
            </svg>
          </div>
          <h3>Va plus loin avec ton <span className="upgrade-gold">espace pèlerin</span></h3>
          <p className="upgrade-sub">Outils interactifs et contenus enrichis, gratuits.</p>
          <div className="upgrade-grid">
            {[
              'Checklist cochable',
              "Audio des du'as",
              'Marque-pages',
              'Suivi de progression',
            ].map((feat) => (
              <div key={feat} className="upgrade-feat">
                <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                  <path d="M3 6l2 2 4-4" stroke="#C9A84C" strokeWidth="1.3" strokeLinecap="round"/>
                </svg>
                {feat}
              </div>
            ))}
          </div>
          <Link href="/inscription" className="upgrade-cta">
            Créer mon espace gratuit
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M3 7h8M7 3l4 4-4 4" stroke="#1A1209" strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
          </Link>
        </div>

        {/* ── RITUELS ── */}
        <section id="rituels">
          <span className="label-overline">LE TAWAF</span>
          <h2>Tourner autour de la Kaaba</h2>
          <p>
            Le Tawaf est le premier rituel après l&apos;arrivée à Makkah. Il consiste à effectuer
            7 tours autour de la Kaaba dans le sens antihoraire, en commençant par la Pierre Noire
            (Hajar al-Aswad). C&apos;est un acte d&apos;adoration où le pèlerin se rapproche
            physiquement et spirituellement du centre du monde musulman.
          </p>

          <div className="info-card">
            <div className="info-icon">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <circle cx="7" cy="7" r="4" stroke="#C9A84C" strokeWidth="1"/>
                <circle cx="7" cy="7" r="1.5" fill="#C9A84C"/>
              </svg>
            </div>
            <div className="info-content">
              <h3>7 tours dans le sens antihoraire</h3>
              <p>
                Pour les hommes, les 3 premiers tours s&apos;effectuent en <strong>Raml</strong>
                (marche rapide aux épaules redressées) lorsque c&apos;est possible. Les 4 derniers
                tours s&apos;effectuent en marche normale.
              </p>
            </div>
          </div>

          <span className="label-overline">LE SA&apos;I</span>
          <h2>Entre Safa et Marwa</h2>
          <p>
            Après le Tawaf, vous accomplissez le Sa&apos;i : 7 allers-retours entre les deux
            collines de Safa et Marwa, en mémoire de Hajar cherchant de l&apos;eau pour son fils
            Ismaïl. C&apos;est un rituel de patience, de confiance et de mémoire.
          </p>

          <div className="info-card">
            <div className="info-icon">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M3 11V3h2v8M9 11V3h2v8" stroke="#C9A84C" strokeWidth="1"/>
              </svg>
            </div>
            <div className="info-content">
              <h3>7 trajets de Safa à Marwa</h3>
              <p>
                Safa → Marwa = 1 trajet. Marwa → Safa = 2e trajet. Au total, 7 trajets se
                terminant à Marwa. Une légère course est recommandée entre les deux marqueurs
                verts pour les hommes.
              </p>
            </div>
          </div>

          <span className="label-overline">LE TAHALLUL</span>
          <h2>Sortir de l&apos;état de sacralisation</h2>
          <p>
            Le Tahallul marque la fin de la Omra. C&apos;est le moment où le pèlerin sort de
            l&apos;état d&apos;Ihram. Il s&apos;effectue après le Sa&apos;i.
          </p>

          <div className="info-card">
            <div className="info-icon">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M2 7h10M9 4l3 3-3 3" stroke="#C9A84C" strokeWidth="1" strokeLinecap="round"/>
              </svg>
            </div>
            <div className="info-content">
              <h3>Halq ou Taqsir</h3>
              <p>
                Les hommes choisissent entre se raser entièrement la tête (<strong>Halq</strong>,
                recommandé) ou raccourcir leurs cheveux (<strong>Taqsir</strong>). Les femmes
                coupent une mèche d&apos;environ la longueur d&apos;une phalange. Une fois le
                Tahallul accompli, les interdits de l&apos;Ihram sont levés.
              </p>
            </div>
          </div>
        </section>

      </article>

      <Footer />
    </>
  );
}
