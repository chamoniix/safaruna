'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { IconCar, IconVan, IconTrain, IconShield, IconStar, IconPerson, IconUserGroup, IconClock, IconAccessibility, IconMap } from '@/components/Icons';

const LANGUES = [
  '🇫🇷 Français',
  '🇸🇦 Arabe',
  '🇬🇧 English',
  '🇲🇦 Darija (Maroc)',
  '🇩🇿 Algérien',
  '🇹🇳 Tunisien',
  '🇸🇳 Wolof',
  '🎵 Bambara',
  '🇲🇱 Fulfuldé',
  '🇹🇷 Türkçe',
  '🇮🇩 Bahasa Indonesia',
  '🇲🇾 Bahasa Melayu',
  '🇵🇰 Urdu',
  '🌿 Punjabi',
  '🇧🇩 Bengali',
  '🇮🇳 Hindi',
  '🇮🇳 Tamil',
  '🇮🇷 Farsi (Persan)',
  '🇦🇿 Azéri',
  '🇺🇿 Ouzbek',
  '🇰🇿 Kazakh',
  '🌍 Haoussa',
  '🌍 Somali',
  '🌍 Swahili',
  '🌍 Amharique',
  '🇷🇺 Russe',
  '🇨🇳 Mandarin',
  '🇪🇸 Español',
  '🇵🇹 Português',
  '🇩🇪 Deutsch',
  '🏔️ Kabyle',
  '🏔️ Chleuh (Tachelhit)',
  '🏔️ Tamazight (Souss)',
  '🌿 Dioula',
  '🌿 Mooré',
];

const GUIDES_DATA = [
  {
    slug: 'naim-laamari',
    gender: 'homme',
    zones: ['makkah', 'madinah'],
    name: 'Naïm LAAMARI',
    title: 'Guide Officiel SAFARUMA · Responsable Terrain',
    initials: 'NL',
    location: 'Makkah Al-Mukarramah',
    experience: 8,
    rating: 5.0,
    reviews: 0,
    pilgrims: 'OFFICIEL',
    languages: ['🇫🇷 Français', '🇸🇦 Arabe', '🇬🇧 English', '🇲🇦 Darija'],
    services: ['Rituels Omra', 'Histoire islamique', 'PMR', 'Gestion de crise'],
    price: 150,
    priceSub: 'dès 150€/pers',
    badge: 'OFFICIEL SAFARUMA',
    badgeColor: '#C9A84C',
    gradient: 'linear-gradient(135deg, #1A1209, #2D1F08)',
    avatarGradient: 'linear-gradient(135deg, #F0D897, #C9A84C)',
    available: true,
    isOfficial: true,
  },
  {
    slug: 'rachid-al-madani',
    gender: 'homme',
    zones: ['makkah', 'madinah'],
    name: 'Rachid Al-Madani',
    title: 'Cheikh · Spécialiste Sîra',
    initials: 'RA',
    location: 'Makkah · Madinah',
    experience: 14,
    rating: 4.97,
    reviews: 214,
    pilgrims: '2 400+',
    languages: ['🇫🇷 Français', '🇸🇦 Arabe', '🇬🇧 English'],
    services: ['Omra complète', 'Jabal Uhud', 'Train Haramain', 'Voiture 7pl'],
    price: 280,
    priceSub: '/ pers · 3j',
    badge: 'Top Guide',
    badgeColor: '#C9A84C',
    gradient: 'linear-gradient(135deg, #2D1F08, #1A1209)',
    avatarGradient: 'linear-gradient(135deg, #F0D897, #C9A84C)',
    available: true,
  },
  {
    slug: 'fatima-al-omari',
    gender: 'femme',
    zones: ['makkah', 'madinah'],
    name: 'Fatima Al-Omari',
    title: 'Guide femme · Familles',
    initials: 'FA',
    location: 'Makkah',
    experience: 8,
    rating: 4.95,
    reviews: 178,
    pilgrims: '860+',
    languages: ['🇫🇷 Français', '🇲🇦 Darija'],
    services: ['Guide femme', 'Rituels Omra', 'Van 9pl', 'Familles'],
    price: 320,
    priceSub: '/ pers · 3j',
    badge: 'Guide femme',
    badgeColor: '#1D5C3A',
    gradient: 'linear-gradient(135deg, #082818, #1D5C3A)',
    avatarGradient: 'linear-gradient(135deg, #9FE1CB, #1D9E75)',
    available: true,
  },
  {
    slug: 'youssouf-konate',
    gender: 'homme',
    zones: ['makkah'],
    name: 'Youssouf Konaté',
    title: "Spécialiste Afrique de l'Ouest",
    initials: 'YK',
    location: 'Makkah',
    experience: 6,
    rating: 4.92,
    reviews: 94,
    pilgrims: '620+',
    languages: ['🇫🇷 Français', '🇸🇳 Wolof', '🇬🇧 English'],
    services: ['Omra complète', 'Hira', 'Voiture incluse'],
    price: 240,
    priceSub: '/ pers · 3j',
    badge: null,
    badgeColor: '',
    gradient: 'linear-gradient(135deg, #1A2810, #2D4A1A)',
    avatarGradient: 'linear-gradient(135deg, #D4E8A0, #5A8A20)',
    available: true,
  },
  {
    slug: 'abdullah-ben-yusuf',
    gender: 'homme',
    zones: ['madinah'],
    name: 'Abdullah Ben Yusuf',
    title: 'Diplômé · Université de Madinah',
    initials: 'AB',
    location: 'Madinah',
    experience: 10,
    rating: 4.98,
    reviews: 147,
    pilgrims: '1 100+',
    languages: ['🇫🇷 Français', '🇸🇦 Arabe'],
    services: ['Rawdah', 'Quba', 'Ohoud', 'Ziyara Madinah'],
    price: 300,
    priceSub: '/ pers · 3j',
    badge: 'Diplômé',
    badgeColor: '#1A4A8A',
    gradient: 'linear-gradient(135deg, #0A1830, #1A4A8A)',
    avatarGradient: 'linear-gradient(135deg, #A0C4F0, #1A6AC9)',
    available: false,
  },
  {
    slug: 'samira-al-rashidi',
    gender: 'femme',
    zones: ['madinah'],
    name: 'Samira Al-Rashidi',
    title: 'Spécialiste PMR · Madinah',
    initials: 'SR',
    location: 'Madinah',
    experience: 7,
    rating: 4.93,
    reviews: 76,
    pilgrims: '520+',
    languages: ['🇫🇷 Français', '🇹🇳 Tunisien'],
    services: ['PMR', 'Fauteuil roulant', 'Hôtel adapté', 'Seniors'],
    price: 380,
    priceSub: '/ pers · 3j',
    badge: 'PMR',
    badgeColor: '#7A2D8A',
    gradient: 'linear-gradient(135deg, #28081A, #7A2D8A)',
    avatarGradient: 'linear-gradient(135deg, #F0A8C0, #A81D5C)',
    available: true,
  },
];

// ─── SVG Avatars ───────────────────────────────────────────────────────────────
function GuideAvatarSVG({ slug, gradient, initials, isWoman }: { slug: string; gradient: string; initials: string; isWoman?: boolean }) {
  if (slug === 'naim-laamari') {
    return (
      <div style={{
        width: 46,
        height: 46,
        borderRadius: '50%',
        overflow: 'hidden',
        position: 'relative',
      }}>
        <Image
          src="/guide-avatar.png"
          alt="Naïm LAAMARI"
          fill
          style={{ objectFit: 'cover', objectPosition: 'center 20%' }}
        />
      </div>
    );
  }

  const bgMap: Record<string, string> = {
    'naim-laamari':     '#1A1209',
    'rachid-al-madani': '#1A3A2A',
    'youssouf-konate':  '#2A1A3A',
    'abdullah-ben-yusuf':'#1A2A3A',
    'fatima-al-omari':  '#3A1A2A',
    'samira-al-rashidi':'#2A3A1A',
  };
  const kefMap: Record<string, string> = {
    'naim-laamari':     '#C9A84C',
    'rachid-al-madani': '#9FE1CB',
    'youssouf-konate':  '#D4A0E0',
    'abdullah-ben-yusuf':'#A0C4F0',
    'fatima-al-omari':  '#F0A8C0',
    'samira-al-rashidi':'#A8D4A0',
  };
  const bg = bgMap[slug] || '#1A1209';
  const accent = kefMap[slug] || '#C9A84C';

  if (isWoman) {
    return (
      <svg width="46" height="46" viewBox="0 0 46 46" fill="none">
        <rect width="46" height="46" rx="23" fill={bg} />
        {/* Head */}
        <circle cx="23" cy="14" r="6" fill="white" opacity="0.92" />
        {/* Hijab */}
        <ellipse cx="23" cy="13" rx="9" ry="6" fill={accent} opacity="0.85" />
        <path d="M14 14 Q14 26 16 30 Q19 34 23 34 Q27 34 30 30 Q32 26 32 14" fill={accent} opacity="0.55" />
        {/* Body/abaya */}
        <path d="M16 26 Q14 34 14 40 L32 40 Q32 34 30 26 Q27 22 23 22 Q19 22 16 26Z" fill="white" opacity="0.82" />
      </svg>
    );
  }

  return (
    <svg width="46" height="46" viewBox="0 0 46 46" fill="none">
      <rect width="46" height="46" rx="23" fill={bg} />
      {/* Keffieh */}
      <ellipse cx="23" cy="11" rx="10" ry="5.5" fill={accent} opacity="0.9" />
      <path d="M13 11 Q13 16 15 18 L31 18 Q33 16 33 11" fill={accent} opacity="0.7" />
      {/* Head */}
      <circle cx="23" cy="14" r="6" fill="white" opacity="0.92" />
      {/* Keffieh band */}
      <rect x="14" y="10" width="18" height="3" rx="1.5" fill={accent} opacity="0.95" />
      {/* Thobe / body */}
      <path d="M15 24 Q13 34 13 42 L33 42 Q33 34 31 24 Q28 20 23 20 Q18 20 15 24Z" fill="white" opacity="0.85" />
    </svg>
  );
}

export default function GuideSearchPage() {
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedLangue, setSelectedLangue] = useState('');
  const [selectedGender, setSelectedGender] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [budget, setBudget] = useState(800);

  const filteredGuides = GUIDES_DATA.filter(g => {
    if (selectedCity === 'MAKKAH' && !g.zones.includes('makkah')) return false;
    if (selectedCity === 'MADINAH' && !g.zones.includes('madinah')) return false;
    if (selectedCity === 'BOTH' && !(g.zones.includes('makkah') && g.zones.includes('madinah'))) return false;
    if (selectedGender === 'HOMME' && g.gender !== 'homme') return false;
    if (selectedGender === 'FEMME' && g.gender !== 'femme') return false;
    if (selectedLangue === 'fr' && !g.languages.some(l => l.includes('Français'))) return false;
    if (selectedLangue === 'ar' && !g.languages.some(l => l.includes('Arabe'))) return false;
    if (selectedLangue === 'en' && !g.languages.some(l => l.includes('English'))) return false;
    return true;
  });
  const filteredOfficial = filteredGuides.filter(g => g.isOfficial);
  const filteredNonOfficial = filteredGuides.filter(g => !g.isOfficial);

  const FiltersContent = () => (
    <>
      <FilterCard title="Budget">
        <div style={{ marginBottom: '0.35rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#7A6D5A' }}>
          <span>Prix / personne</span>
          <strong style={{ color: '#1A1209' }}>{budget}€ max</strong>
        </div>
        <input
          type="range" min="100" max="1500" value={budget} step="50"
          onChange={e => setBudget(Number(e.target.value))}
          style={{ width: '100%', accentColor: '#C9A84C', cursor: 'pointer' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: '#7A6D5A', marginTop: '0.25rem' }}>
          <span>100€</span><span>1 500€</span>
        </div>
      </FilterCard>

      <FilterCard title="Transport">
        {([
          { icon: <IconCar size={14} stroke="#7A6D5A" />, label: 'Voiture privée', count: 187 },
          { icon: <IconVan size={14} stroke="#7A6D5A" />, label: 'Van 7–12 places', count: 94 },
          { icon: <IconTrain size={14} stroke="#7A6D5A" />, label: 'Train Haramain', count: 63 },
        ] as Array<{ icon: React.ReactNode; label: string; count: number }>).map(o => (
          <FilterOpt key={o.label} icon={o.icon} label={o.label} count={o.count} />
        ))}
      </FilterCard>

      <FilterCard title="Langues">
        {LANGUES.slice(0, 10).map(l => (
          <FilterOpt key={l} label={l} count={Math.floor(Math.random() * 200) + 20} />
        ))}
      </FilterCard>

      <FilterCard title="Note minimale">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
          {['4.5+', '4.7+', '4.9+'].map(r => (
            <button key={r} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.3rem 0.75rem', borderRadius: 50, border: '1.5px solid #E8DFC8', background: 'transparent', fontSize: '0.75rem', cursor: 'pointer', color: '#7A6D5A', fontWeight: 500 }}>
              <IconStar size={12} stroke="#C9A84C" /> {r}
            </button>
          ))}
        </div>
      </FilterCard>

      <FilterCard title="Spécialités">
        {([
          { icon: <IconPerson size={14} stroke="#7A6D5A" />, label: 'Guide femme', count: 48 },
          { icon: <IconAccessibility size={14} stroke="#7A6D5A" />, label: 'Adapté PMR', count: 17 },
          { icon: <IconUserGroup size={14} stroke="#7A6D5A" />, label: 'Spécialiste familles', count: 130 },
        ] as Array<{ icon: React.ReactNode; label: string; count: number }>).map(o => (
          <FilterOpt key={o.label} icon={o.icon} label={o.label} count={o.count} />
        ))}
      </FilterCard>
    </>
  );

  return (
    <div style={{ fontFamily: 'var(--font-manrope, Manrope, sans-serif)', background: '#FAF7F0', color: '#1A1209', minHeight: '100vh' }}>
      <Navbar />

      {/* ── HERO ── */}
      <div className="guides-hero" style={{ background: '#1A1209', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 120% at 50% 110%, rgba(201,168,76,0.14) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', right: '4rem', top: '50%', transform: 'translateY(-50%)', fontFamily: 'serif', fontSize: '10rem', color: 'rgba(201,168,76,0.05)', userSelect: 'none', pointerEvents: 'none', lineHeight: 1 }}>مرشد</div>

        <div style={{ maxWidth: 860, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(240,216,151,0.55)', marginBottom: '0.75rem', textAlign: 'center' }}>
            Trouver mon guide privé
          </div>
          <h1 style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: 'clamp(2rem, 5vw, 3.2rem)', fontWeight: 300, color: 'white', textAlign: 'center', marginBottom: '0.5rem', lineHeight: 1.1 }}>
            Ton voyage, dans <em style={{ fontStyle: 'italic', color: '#C9A84C' }}>ta langue</em>
          </h1>
          <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem', marginBottom: '2.5rem' }}>
            {GUIDES_DATA.length} guides certifiés · Makkah, Madinah, Badr & plus
          </p>


        </div>
      </div>

      {/* ── TRUST BAR ── */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', padding: '0.75rem 1.5rem', background: '#F5F0E8', borderBottom: '1px solid #E8DFC8', flexWrap: 'wrap' }}>
        {[
          { icon: '✓', label: 'Guides certifiés' },
          { icon: '🛡', label: 'Paiement sécurisé' },
          { icon: '★', label: '4.94/5 · 709 avis' },
        ].map(b => (
          <span key={b.label} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', fontWeight: 600, color: '#5A4535' }}>
            <span style={{ color: '#C9A84C', fontSize: '0.85rem' }}>{b.icon}</span>
            {b.label}
          </span>
        ))}
      </div>

      {/* ── FILTRES ── */}
      <div style={{ padding: '0 1.5rem' }}>
        <div style={{
          background: 'white',
          borderRadius: 20,
          border: '1px solid #E8DFC8',
          boxShadow: '0 4px 24px rgba(26,18,9,0.06)',
          padding: '1.5rem',
          marginBottom: '2rem',
          maxWidth: 720,
          margin: '0 auto 2rem',
        }}>
          {/* Ligne 1 — Ville */}
          <div style={{ marginBottom: '1rem' }}>
            <div style={{
              fontSize: '0.68rem', fontWeight: 700,
              letterSpacing: '0.1em', textTransform: 'uppercase',
              color: '#7A6D5A', marginBottom: '0.5rem',
            }}>
              Destination
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {[
                { val: '', label: 'Toutes' },
                { val: 'MAKKAH', label: 'Makkah' },
                { val: 'MADINAH', label: 'Madinah' },
                { val: 'BOTH', label: 'Les deux' },
              ].map(opt => (
                <button
                  key={opt.val}
                  onClick={() => setSelectedCity(opt.val)}
                  style={{
                    padding: '0.45rem 1rem',
                    borderRadius: 50,
                    border: selectedCity === opt.val
                      ? '2px solid #C9A84C' : '1.5px solid #E8DFC8',
                    background: selectedCity === opt.val
                      ? 'rgba(201,168,76,0.08)' : 'white',
                    color: selectedCity === opt.val ? '#8B6914' : '#7A6D5A',
                    fontWeight: selectedCity === opt.val ? 700 : 500,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Ligne 2 — Langue + Genre */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{
                fontSize: '0.68rem', fontWeight: 700,
                letterSpacing: '0.1em', textTransform: 'uppercase',
                color: '#7A6D5A', marginBottom: '0.5rem',
              }}>
                Langue
              </div>
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                {[
                  { val: '', label: 'Toutes' },
                  { val: 'fr', label: 'Français' },
                  { val: 'ar', label: 'Arabe' },
                  { val: 'en', label: 'English' },
                ].map(opt => (
                  <button
                    key={opt.val}
                    onClick={() => setSelectedLangue(opt.val)}
                    style={{
                      padding: '0.4rem 0.875rem',
                      borderRadius: 50,
                      border: selectedLangue === opt.val
                        ? '2px solid #C9A84C' : '1.5px solid #E8DFC8',
                      background: selectedLangue === opt.val
                        ? 'rgba(201,168,76,0.08)' : 'white',
                      color: selectedLangue === opt.val ? '#8B6914' : '#7A6D5A',
                      fontWeight: selectedLangue === opt.val ? 700 : 500,
                      fontSize: '0.78rem',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{
                fontSize: '0.68rem', fontWeight: 700,
                letterSpacing: '0.1em', textTransform: 'uppercase',
                color: '#7A6D5A', marginBottom: '0.5rem',
              }}>
                Guide pour
              </div>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                {[
                  { val: '', label: 'Tous' },
                  { val: 'HOMME', label: 'Hommes' },
                  { val: 'FEMME', label: 'Femmes' },
                  { val: 'MIXTE', label: 'Mixte' },
                ].map(opt => (
                  <button
                    key={opt.val}
                    onClick={() => setSelectedGender(opt.val)}
                    style={{
                      padding: '0.4rem 0.875rem',
                      borderRadius: 50,
                      border: selectedGender === opt.val
                        ? '2px solid #C9A84C' : '1.5px solid #E8DFC8',
                      background: selectedGender === opt.val
                        ? 'rgba(201,168,76,0.08)' : 'white',
                      color: selectedGender === opt.val ? '#8B6914' : '#7A6D5A',
                      fontWeight: selectedGender === opt.val ? 700 : 500,
                      fontSize: '0.78rem',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="guides-main">

        {/* ── SIDEBAR (desktop only) ── */}
        <aside className="guides-sidebar">
          <FiltersContent />
        </aside>

        {/* ── RESULTS ── */}
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* Mobile filter button + count */}
          <div className="guides-mobile-bar">
            <p style={{ fontSize: '0.875rem', color: '#7A6D5A', margin: 0 }}>
              <strong style={{ color: '#1A1209' }}>{filteredGuides.length}</strong> guide{filteredGuides.length > 1 ? 's' : ''} trouvé{filteredGuides.length > 1 ? 's' : ''}
            </p>
            <button
              onClick={() => setFiltersOpen(true)}
              className="guides-filter-btn"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/>
              </svg>
              Filtres
            </button>
          </div>

          {/* Desktop count */}
          <div className="guides-desktop-count">
            <p style={{ fontSize: '0.875rem', color: '#7A6D5A', margin: 0 }}>
              <strong style={{ color: '#1A1209' }}>{filteredGuides.length}</strong> guide{filteredGuides.length > 1 ? 's' : ''} trouvé{filteredGuides.length > 1 ? 's' : ''}
            </p>
          </div>

          {/* Official guide — full-width featured card */}
          {filteredOfficial.map(g => (
            <div key={g.slug} className="guide-official-wrap">
              <div className="guide-official-label">★ RESPONSABLE OFFICIEL SAFARUMA</div>
              <GuideCard guide={g} official />
            </div>
          ))}

          {filteredGuides.length === 0 && (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#7A6D5A' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>🔍</div>
              <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.3rem', fontWeight: 600, color: '#1A1209', marginBottom: '0.5rem' }}>
                Aucun guide pour cette sélection
              </div>
              <div style={{ fontSize: '0.85rem' }}>
                Modifie les filtres ou{' '}
                <button
                  onClick={() => { setSelectedCity(''); setSelectedLangue(''); setSelectedGender(''); }}
                  style={{ color: '#C9A84C', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem', textDecoration: 'underline' }}
                >
                  voir tous les guides
                </button>
              </div>
            </div>
          )}

          {/* Cards grid */}
          <div className="guides-grid">
            {filteredNonOfficial.map(g => (
              <GuideCard key={g.slug} guide={g} />
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #E8DFC8' }}>
            <Link href="/guides" style={{ display: 'inline-block', background: '#1A1209', color: '#F0D897', padding: '0.75rem 2rem', borderRadius: 50, fontSize: '0.85rem', fontWeight: 700, textDecoration: 'none', letterSpacing: '0.04em' }}>
              Voir tous les guides →
            </Link>
          </div>
        </div>
      </div>

      {/* ── BOTTOM SHEET (mobile/tablet filters) ── */}
      {filtersOpen && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setFiltersOpen(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, backdropFilter: 'blur(2px)' }}
          />
          {/* Sheet */}
          <div style={{
            position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 201,
            background: 'white', borderRadius: '24px 24px 0 0',
            maxHeight: '85vh', overflowY: 'auto',
            padding: '0 1.25rem 2rem',
            boxShadow: '0 -8px 40px rgba(0,0,0,0.2)',
            animation: 'slideUp 0.25s ease',
          }}>
            {/* Handle */}
            <div style={{ textAlign: 'center', padding: '0.875rem 0 1rem' }}>
              <div style={{ width: 40, height: 4, borderRadius: 2, background: '#E8DFC8', margin: '0 auto' }} />
            </div>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <span style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.4rem', fontWeight: 700, color: '#1A1209' }}>Filtres</span>
              <button onClick={() => setFiltersOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7A6D5A', fontSize: '1.2rem' }}>✕</button>
            </div>
            <FiltersContent />
            {/* Apply */}
            <button
              onClick={() => setFiltersOpen(false)}
              style={{ width: '100%', height: 52, background: '#1A1209', color: '#F0D897', border: 'none', borderRadius: 50, fontFamily: 'inherit', fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer', marginTop: '0.5rem' }}
            >
              Appliquer les filtres
            </button>
          </div>
        </>
      )}

      {/* ── CSS ── */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to   { transform: translateY(0); }
        }

        /* Hero responsive */
        .guides-hero {
          padding-top: 8rem;
          padding-bottom: 3rem;
          padding-left: 1.5rem;
          padding-right: 1.5rem;
        }
        @media (max-width: 768px) {
          .guides-hero {
            padding-top: 5rem !important;
            padding-bottom: 1.5rem !important;
            padding-left: 1rem !important;
            padding-right: 1rem !important;
          }
        }

        /* Search bar */
        .guides-search-bar {
          background: white;
          border-radius: 20px;
          padding: 1rem 1.25rem;
          display: flex;
          flex-direction: column;
          box-shadow: 0 24px 60px rgba(0,0,0,0.3);
          margin-bottom: 1.5rem;
        }
        @media (max-width: 768px) {
          .guides-search-bar {
            padding: 0.875rem;
            border-radius: 14px;
          }
          .guide-official-card {
            border-radius: 0 12px 12px 12px !important;
          }
          .guide-official-card .guide-card-banner {
            height: 120px !important;
          }
          .guides-main {
            padding: 1rem 0.875rem 5rem;
            gap: 0;
          }
        }

        /* Main layout */
        .guides-main {
          max-width: 1280px;
          margin: 0 auto;
          padding: 2.5rem 1.5rem 6rem;
          display: flex;
          gap: 2rem;
          align-items: flex-start;
        }

        /* Sidebar — desktop only */
        .guides-sidebar {
          width: 280px;
          flex-shrink: 0;
          position: sticky;
          top: 80px;
        }
        /* Hide sidebar on tablet + mobile */
        @media (max-width: 1023px) {
          .guides-sidebar { display: none !important; }
          .guides-main { flex-direction: column; padding: 1.25rem 1rem 5rem; }
        }

        /* Mobile filter bar */
        .guides-mobile-bar {
          display: none;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
          gap: 0.75rem;
        }
        @media (max-width: 1023px) {
          .guides-mobile-bar { display: flex; }
        }

        /* Desktop count */
        .guides-desktop-count { margin-bottom: 1rem; }
        @media (max-width: 1023px) {
          .guides-desktop-count { display: none; }
        }

        /* Filter button pill */
        .guides-filter-btn {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.5rem 1.1rem;
          border-radius: 50px;
          border: 1.5px solid #E8DFC8;
          background: white;
          color: #1A1209;
          font-family: var(--font-manrope, sans-serif);
          font-size: 0.82rem;
          font-weight: 700;
          cursor: pointer;
          transition: border-color 0.15s;
          white-space: nowrap;
        }
        .guides-filter-btn:hover { border-color: #C9A84C; }

        /* Official guide featured block */
        .guide-official-wrap {
          margin-bottom: 1.5rem;
        }
        .guide-official-label {
          display: inline-block;
          background: #1A1209;
          color: #F0D897;
          font-size: 0.6rem;
          font-weight: 800;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          padding: 0.35rem 1rem;
          border-radius: 50px 50px 0 0;
          margin-bottom: 0;
        }
        .guide-official-card {
          border: 2px solid #C9A84C !important;
          border-radius: 0 18px 18px 18px !important;
          box-shadow: 0 8px 40px rgba(201,168,76,0.18) !important;
        }
        .guide-official-card .guide-card-banner {
          height: 120px !important;
        }

        /* Cards grid */
        .guides-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.25rem;
        }
        @media (max-width: 767px) {
          .guides-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
          }
        }

        /* Guide card banner */
        .guide-card-banner { height: 100px; }
        @media (max-width: 767px) {
          .guide-card-banner { height: 100px; }
        }

        @media (max-width: 480px) {
          .guides-search-bar .dates-grid {
            grid-template-columns: 1fr !important;
          }
          .guides-search-bar .prefs-grid {
            grid-template-columns: 1fr !important;
          }
          .guides-trust-bar {
            gap: 0.75rem;
            padding: 0.6rem 0.75rem;
            font-size: 0.68rem;
          }
        }
      `}} />

      <Footer />
    </div>
  );
}

/* ─── Sub-components ──────────────────────────────────────────────── */

function FilterCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: 'white', border: '1px solid #E8DFC8', borderRadius: 16, padding: '1.25rem', marginBottom: '0.75rem' }}>
      <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#7A6D5A', marginBottom: '0.85rem', paddingBottom: '0.75rem', borderBottom: '1px solid #F0EBD8' }}>
        {title}
      </div>
      {children}
    </div>
  );
}

function FilterOpt({ icon, label, count }: { icon?: React.ReactNode; label: string; count: number }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.3rem 0', cursor: 'pointer' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
        <input type="checkbox" style={{ width: 14, height: 14, accentColor: '#C9A84C', cursor: 'pointer' }} />
        {icon && <span style={{ display: 'inline-flex', alignItems: 'center' }}>{icon}</span>}
        <span style={{ fontSize: '0.82rem', color: '#1A1209' }}>{label}</span>
      </div>
      <span style={{ fontSize: '0.68rem', color: '#7A6D5A', background: '#F5F0E8', padding: '0.1rem 0.45rem', borderRadius: 50 }}>{count}</span>
    </label>
  );
}

type GuideData = typeof GUIDES_DATA[0];

function GuideCard({ guide: g, official }: { guide: GuideData; official?: boolean }) {
  return (
    <Link href={`/guides/${g.slug}`} style={{ textDecoration: 'none', display: 'block' }}>
      <div
        className={official ? 'guide-official-card' : ''}
        style={{ background: 'white', border: '1px solid #E8DFC8', borderRadius: 18, overflow: 'hidden', transition: 'transform 0.2s, box-shadow 0.2s, border-color 0.2s', cursor: 'pointer' }}
        onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.transform = 'translateY(-3px)'; el.style.boxShadow = '0 16px 48px rgba(26,18,9,0.1)'; el.style.borderColor = 'rgba(201,168,76,0.7)'; }}
        onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.transform = ''; el.style.boxShadow = official ? '0 8px 40px rgba(201,168,76,0.18)' : ''; el.style.borderColor = official ? '#C9A84C' : '#E8DFC8'; }}
      >
        {/* Banner */}
        <div className="guide-card-banner" style={{ background: g.gradient, position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 30% 50%, rgba(255,255,255,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
          {/* Avatar */}
          <div style={{
            position: 'absolute', top: '50%', right: '1.25rem',
            transform: 'translateY(-50%)',
            width: official ? 64 : 52, height: official ? 64 : 52, borderRadius: '50%',
            border: official ? '3px solid #C9A84C' : '3px solid rgba(255,255,255,0.6)',
            overflow: 'hidden',
            zIndex: 1,
            boxShadow: official ? '0 0 0 3px #1A1209, 0 4px 16px rgba(201,168,76,0.4)' : '0 2px 12px rgba(0,0,0,0.3)',
          }}>
            <GuideAvatarSVG
              slug={g.slug}
              gradient={g.gradient}
              initials={g.initials}
              isWoman={g.slug === 'fatima-al-omari' || g.slug === 'samira-al-rashidi'}
            />
          </div>
          {/* Available dot */}
          <div style={{ position: 'absolute', bottom: 8, right: 12, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: g.available ? '#27AE60' : '#aaa', border: '1.5px solid rgba(255,255,255,0.5)' }} />
            <span style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>{g.available ? 'Disponible' : 'Indisponible'}</span>
          </div>
          {/* Badge(s) */}
          {official ? (
            <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <span style={{ background: '#1A1209', color: '#F0D897', fontSize: '0.52rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '0.2rem 0.55rem', borderRadius: 50, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                🛡 OFFICIEL SAFARUMA
              </span>
              <span style={{ background: '#065F46', color: 'white', fontSize: '0.52rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '0.2rem 0.55rem', borderRadius: 50 }}>
                GUIDE VÉRIFIÉ ✓
              </span>
              <span style={{ background: '#C9A84C', color: '#1A1209', fontSize: '0.52rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '0.2rem 0.55rem', borderRadius: 50 }}>
                RESPONSABLE TERRAIN
              </span>
              <span style={{ background: '#1E3A5F', color: 'white', fontSize: '0.52rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '0.2rem 0.55rem', borderRadius: 50 }}>
                FORMATEUR CERTIFIÉ
              </span>
            </div>
          ) : g.badge ? (
            <div style={{ position: 'absolute', top: 10, right: 10, background: g.badgeColor, color: '#fff', fontSize: '0.55rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '0.2rem 0.55rem', borderRadius: 50 }}>
              {g.badge}
            </div>
          ) : null}
        </div>

        {/* Body */}
        <div style={{ padding: '1.5rem 1.25rem 1.25rem', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.2rem', paddingTop: '0.25rem' }}>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1A1209', lineHeight: 1.2 }}>{g.name}</div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1A1209', whiteSpace: 'nowrap', flexShrink: 0 }}>
              <span style={{ color: '#C9A84C' }}>★</span> {g.rating}
              <span style={{ fontWeight: 400, color: '#7A6D5A', fontSize: '0.7rem' }}> ({g.reviews})</span>
            </div>
          </div>
          <div style={{ fontSize: '0.72rem', color: '#7A6D5A', fontStyle: 'italic', marginBottom: '0.6rem' }}>{g.title}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.72rem', color: '#7A6D5A', marginBottom: '0.75rem' }}>
            <IconMap size={12} stroke="#7A6D5A" /> {g.location} · {g.experience} ans
          </div>

          {/* Languages */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginBottom: '0.7rem' }}>
            {g.languages.map((l, i) => (
              <span key={l} style={{ fontSize: '0.65rem', fontWeight: 600, padding: '0.15rem 0.55rem', borderRadius: 50, background: i === 0 ? '#FAF3E0' : '#F5F0E8', border: `1px solid ${i === 0 ? 'rgba(201,168,76,0.4)' : 'transparent'}`, color: i === 0 ? '#8B6914' : '#7A6D5A' }}>{l}</span>
            ))}
          </div>

          {/* Services */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginBottom: '0.9rem' }}>
            {g.services.map(s => (
              <span key={s} style={{ fontSize: '0.65rem', color: '#7A6D5A', background: '#F5F0E8', padding: '0.15rem 0.5rem', borderRadius: 5 }}>{s}</span>
            ))}
          </div>

          {/* Footer */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #F0EBD8', paddingTop: '0.85rem', marginTop: 'auto' }}>
            <div>
              {official ? (
                <>
                  <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.1rem', fontWeight: 700, color: '#1A1209', lineHeight: 1.2 }}>Dès 150€/pers</div>
                  <div style={{ fontSize: '0.6rem', color: '#7A6D5A', marginTop: '0.2rem' }}>Omra ~5h · Visites incluses</div>
                </>
              ) : (
                <>
                  <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.4rem', fontWeight: 600, color: '#1A1209', lineHeight: 1 }}>{g.price}€</div>
                  <div style={{ fontSize: '0.65rem', color: '#7A6D5A' }}>{g.priceSub}</div>
                  <div style={{ fontSize: '0.6rem', color: '#9A8A7A', marginTop: '0.15rem' }}>Omra ~4-6h · Visites incluses</div>
                </>
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.35rem' }}>
              {official ? (
                <>
                  <span style={{ fontSize: '0.62rem', fontWeight: 800, background: '#FAF3E0', color: '#8B6914', border: '1px solid rgba(201,168,76,0.4)', padding: '0.2rem 0.65rem', borderRadius: 50, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>🛡 Certifié SAFARUMA</span>
                  <span style={{ fontSize: '0.62rem', fontWeight: 700, background: '#E8F5EE', color: '#1D5C3A', border: '1px solid rgba(29,92,58,0.2)', padding: '0.2rem 0.65rem', borderRadius: 50 }}>✓ Guide Vérifié</span>
                  <span style={{ fontSize: '0.62rem', fontWeight: 700, background: '#EEF2FF', color: '#1E3A5F', border: '1px solid rgba(30,58,95,0.2)', padding: '0.2rem 0.65rem', borderRadius: 50 }}>🎓 Formateur Certifié</span>
                </>
              ) : (
                <>
                  <span style={{ fontSize: '0.6rem', fontWeight: 700, background: '#E8F5EE', color: '#1D5C3A', padding: '0.15rem 0.55rem', borderRadius: 50 }}>✓ Vérifié</span>
                  <span style={{ fontSize: '0.6rem', color: '#7A6D5A' }}>{g.pilgrims} pèlerins</span>
                </>
              )}
            </div>
          </div>

          {/* CTA */}
          <div style={{ marginTop: '0.875rem', background: '#1A1209', color: '#F0D897', textAlign: 'center', padding: '0.7rem', borderRadius: 50, fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.04em' }}>
            Voir le profil →
          </div>
        </div>
      </div>
    </Link>
  );
}
