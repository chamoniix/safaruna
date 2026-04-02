'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { IconCar, IconVan, IconTrain, IconShield, IconStar, IconPerson, IconUserGroup, IconClock, IconAccessibility, IconMap } from '@/components/Icons';

const GUIDES_DATA = [
  {
    slug: 'rachid-al-madani',
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
    isWoman: false,
  },
  {
    slug: 'fatima-al-omari',
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
    isWoman: true,
  },
  {
    slug: 'youssouf-konate',
    name: 'Youssouf Konaté',
    title: 'Spécialiste Afrique de l\'Ouest',
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
    isWoman: false,
  },
  {
    slug: 'abdullah-ben-yusuf',
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
    isWoman: false,
  },
  {
    slug: 'samira-al-rashidi',
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
    isWoman: true,
  },
];

export default function GuideSearchPage() {
  const [viewMode,    setViewMode]    = useState<'grid' | 'list'>('grid');
  const [budget,      setBudget]      = useState(800);
  const [activeFilters, setActiveFilters] = useState<string[]>(['🇫🇷 Francophone']);
  const [activeQF,    setActiveQF]    = useState('🇫🇷 Francophone');

  const removeFilter = (f: string) => setActiveFilters(prev => prev.filter(x => x !== f));

  return (
    <div style={{ fontFamily: 'var(--font-manrope, Manrope, sans-serif)', background: '#FAF7F0', color: '#1A1209', minHeight: '100vh' }}>
      <Navbar />

      {/* ── HERO ── */}
      <div style={{
        background: '#1A1209',
        paddingTop: '8rem',
        paddingBottom: '3rem',
        paddingLeft: '2rem',
        paddingRight: '2rem',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Glow */}
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 120% at 50% 110%, rgba(201,168,76,0.14) 0%, transparent 65%)', pointerEvents: 'none' }} />
        {/* Arabic calligraphy watermark */}
        <div style={{ position: 'absolute', right: '4rem', top: '50%', transform: 'translateY(-50%)', fontFamily: 'serif', fontSize: '10rem', color: 'rgba(201,168,76,0.05)', userSelect: 'none', pointerEvents: 'none', lineHeight: 1 }}>
          مرشد
        </div>

        <div style={{ maxWidth: 860, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(240,216,151,0.55)', marginBottom: '0.75rem', textAlign: 'center' }}>
            Trouver mon guide privé
          </div>
          <h1 style={{
            fontFamily: 'var(--font-cormorant, serif)',
            fontSize: 'clamp(2.2rem, 4vw, 3.2rem)',
            fontWeight: 300,
            color: 'white',
            textAlign: 'center',
            marginBottom: '0.5rem',
            lineHeight: 1.1,
          }}>
            Ton Omra, dans <em style={{ fontStyle: 'italic', color: '#C9A84C' }}>ta langue</em>
          </h1>
          <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem', marginBottom: '2.5rem' }}>
            {GUIDES_DATA.length} guides certifiés · Makkah, Madinah, Badr & plus
          </p>

          {/* Search bar */}
          <div style={{
            background: 'white',
            borderRadius: 20,
            padding: '1rem 1.25rem',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr auto',
            gap: '0.75rem',
            alignItems: 'end',
            boxShadow: '0 24px 60px rgba(0,0,0,0.3)',
            marginBottom: '1.5rem',
          }} className="search-grid">
            {[
              { label: 'Langue du guide', type: 'select', opts: ['Toutes les langues', '🇫🇷 Français', '🇸🇦 Arabe', '🇬🇧 English', '🇸🇳 Wolof'] },
              { label: 'Destination',     type: 'select', opts: ['Makkah + Madinah', 'Makkah uniquement', 'Madinah uniquement'] },
            ].map(f => (
              <div key={f.label}>
                <div style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#7A6D5A', marginBottom: '0.35rem' }}>{f.label}</div>
                <select style={{ width: '100%', border: '1.5px solid #E8DFC8', borderRadius: 10, padding: '0.6rem 0.85rem', fontFamily: 'inherit', fontSize: '0.85rem', color: '#1A1209', background: '#FDFBF7', outline: 'none' }}>
                  {f.opts.map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
            ))}
            <div>
              <div style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#7A6D5A', marginBottom: '0.35rem' }}>Date d&apos;arrivée</div>
              <input type="date" style={{ width: '100%', border: '1.5px solid #E8DFC8', borderRadius: 10, padding: '0.6rem 0.85rem', fontFamily: 'inherit', fontSize: '0.85rem', color: '#1A1209', background: '#FDFBF7', outline: 'none' }} />
            </div>
            <button style={{ background: '#C9A84C', color: '#1A1209', border: 'none', borderRadius: 10, padding: '0.7rem 1.6rem', fontFamily: 'inherit', fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
              Rechercher →
            </button>
          </div>

          {/* Quick filters */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center' }}>
            {([
              { key: '🇫🇷 Francophone', label: '🇫🇷 Francophone', icon: null },
              { key: '🚗 Avec voiture', label: 'Avec voiture', icon: <IconCar size={12} stroke="currentColor" /> },
              { key: '👩 Femme guide', label: 'Femme guide', icon: <IconPerson size={12} stroke="currentColor" /> },
              { key: '👨‍👩‍👧 Famille', label: 'Famille', icon: <IconUserGroup size={12} stroke="currentColor" /> },
              { key: '♿ PMR', label: 'PMR', icon: <IconAccessibility size={12} stroke="currentColor" /> },
              { key: '⭐ Top noté', label: 'Top noté', icon: <IconStar size={12} stroke="currentColor" /> },
            ] as Array<{ key: string; label: string; icon: React.ReactNode }>).map(f => (
              <button
                key={f.key}
                onClick={() => setActiveQF(f.key)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                  padding: '0.3rem 0.9rem',
                  borderRadius: 50,
                  border: `1px solid ${activeQF === f.key ? '#C9A84C' : 'rgba(255,255,255,0.15)'}`,
                  background: activeQF === f.key ? '#C9A84C' : 'rgba(255,255,255,0.07)',
                  color: activeQF === f.key ? '#1A1209' : 'rgba(255,255,255,0.65)',
                  fontSize: '0.75rem',
                  fontWeight: activeQF === f.key ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >{f.icon}{f.label}</button>
            ))}
          </div>
        </div>
      </div>

      {/* ── TRUST BAR ── */}
      <div className="trust-bar">
        <div className="trust-bar-item"><span className="icon" style={{ fontWeight: 700 }}>✓</span> Guides mutawwif certifiés</div>
        <div className="trust-bar-item"><IconShield size={14} /> Paiement 100% sécurisé</div>
        <div className="trust-bar-item"><IconStar size={14} /> Note moyenne 4.94 / 5</div>
        <div className="trust-bar-item"><IconPerson size={14} /> Guides PMR disponibles</div>
        <div className="trust-bar-item"><IconClock size={14} /> Réponse garantie &lt; 2h</div>
      </div>

      {/* ── MAIN ── */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '2.5rem 2rem 6rem', display: 'grid', gridTemplateColumns: '260px 1fr', gap: '2rem', alignItems: 'start' }} className="results-layout">

        {/* ── SIDEBAR ── */}
        <aside style={{ position: 'sticky', top: 80 }}>

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
            {[{ label: '🇫🇷 Français', count: 320 }, { label: '🇸🇦 Arabe', count: 280 }, { label: '🇬🇧 English', count: 140 }, { label: '🇸🇳 Wolof', count: 24 }, { label: '🇲🇦 Darija', count: 89 }].map(o => (
              <FilterOpt key={o.label} label={o.label} count={o.count} />
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
        </aside>

        {/* ── RESULTS ── */}
        <div>
          {/* Active filters */}
          {activeFilters.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.25rem', alignItems: 'center' }}>
              <span style={{ fontSize: '0.72rem', color: '#7A6D5A', fontWeight: 600 }}>Actifs :</span>
              {activeFilters.map(f => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: '#1A1209', color: '#F0D897', padding: '0.2rem 0.75rem', borderRadius: 50, fontSize: '0.72rem', fontWeight: 600 }}>
                  {f}
                  <button onClick={() => removeFilter(f)} style={{ background: 'none', border: 'none', color: 'rgba(240,216,151,0.5)', cursor: 'pointer', fontSize: '0.9rem', lineHeight: 1, padding: 0 }}>×</button>
                </div>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <p style={{ fontSize: '0.875rem', color: '#7A6D5A' }}>
              <strong style={{ color: '#1A1209' }}>{GUIDES_DATA.length}</strong> guides trouvés
            </p>
            <div style={{ display: 'flex', border: '1.5px solid #E8DFC8', borderRadius: 8, overflow: 'hidden' }}>
              {(['grid', 'list'] as const).map(m => (
                <button
                  key={m} onClick={() => setViewMode(m)}
                  style={{ padding: '0.4rem 0.85rem', background: viewMode === m ? '#1A1209' : 'white', color: viewMode === m ? '#F0D897' : '#7A6D5A', border: 'none', cursor: 'pointer', fontSize: '0.9rem' }}
                >
                  {m === 'grid' ? '⊞' : '☰'}
                </button>
              ))}
            </div>
          </div>

          {/* Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(290px, 1fr))' : '1fr',
            gap: '1.25rem',
          }}>
            {GUIDES_DATA.map(g => (
              <GuideCard key={g.slug} guide={g} listView={viewMode === 'list'} />
            ))}
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media(max-width:960px){
          .results-layout { grid-template-columns: 1fr !important; }
          .search-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media(max-width:600px){
          .search-grid { grid-template-columns: 1fr !important; }
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

function GuideCard({ guide: g, listView }: { guide: GuideData; listView: boolean }) {
  return (
    <Link href={`/guides/${g.slug}`} style={{ textDecoration: 'none', display: 'block' }}>
      <div style={{
        background: 'white',
        border: '1px solid #E8DFC8',
        borderRadius: 18,
        overflow: 'hidden',
        transition: 'transform 0.2s, box-shadow 0.2s, border-color 0.2s',
        cursor: 'pointer',
        display: listView ? 'flex' : 'block',
        alignItems: listView ? 'stretch' : undefined,
      }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)';
          (e.currentTarget as HTMLElement).style.boxShadow = '0 20px 60px rgba(26,18,9,0.12)';
          (e.currentTarget as HTMLElement).style.borderColor = 'rgba(201,168,76,0.5)';
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLElement).style.transform = '';
          (e.currentTarget as HTMLElement).style.boxShadow = '';
          (e.currentTarget as HTMLElement).style.borderColor = '#E8DFC8';
        }}
      >
        {/* Banner */}
        <div style={{
          height: listView ? 'auto' : 90,
          width: listView ? 110 : 'auto',
          background: g.gradient,
          position: 'relative',
          overflow: 'hidden',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: listView ? 'center' : undefined,
        }}>
          {/* Subtle radial */}
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 30% 50%, rgba(255,255,255,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
          {/* Avatar */}
          <div style={{
            position: listView ? 'static' : 'absolute',
            bottom: listView ? undefined : -18,
            left: listView ? undefined : '1.25rem',
            width: 46,
            height: 46,
            borderRadius: '50%',
            border: listView ? 'none' : '3px solid white',
            background: g.avatarGradient,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'var(--font-cormorant, serif)',
            fontSize: '1rem',
            fontWeight: 700,
            color: '#1A1209',
            flexShrink: 0,
            zIndex: 1,
          }}>
            {g.initials}
          </div>
          {/* Available dot */}
          {!listView && (
            <div style={{ position: 'absolute', bottom: 8, right: 12, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: g.available ? '#27AE60' : '#aaa', border: '1.5px solid rgba(255,255,255,0.5)' }} />
              <span style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>{g.available ? 'Disponible' : 'Indisponible'}</span>
            </div>
          )}
          {/* Badge */}
          {g.badge && !listView && (
            <div style={{ position: 'absolute', top: 10, right: 10, background: g.badgeColor, color: '#1A1209', fontSize: '0.55rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '0.2rem 0.55rem', borderRadius: 50 }}>
              {g.badge}
            </div>
          )}
        </div>

        {/* Body */}
        <div style={{ padding: listView ? '1rem 1.25rem' : '1.5rem 1.25rem 1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.2rem', paddingTop: listView ? 0 : '0.5rem' }}>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1A1209', lineHeight: 1.2 }}>{g.name}</div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1A1209', whiteSpace: 'nowrap' }}>
              <span style={{ color: '#C9A84C' }}>★</span> {g.rating}
              <span style={{ fontWeight: 400, color: '#7A6D5A', fontSize: '0.72rem' }}> ({g.reviews})</span>
            </div>
          </div>
          <div style={{ fontSize: '0.72rem', color: '#7A6D5A', fontStyle: 'italic', marginBottom: '0.6rem' }}>{g.title}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.72rem', color: '#7A6D5A', marginBottom: '0.75rem' }}><IconMap size={12} stroke="#7A6D5A" /> {g.location} · {g.experience} ans</div>

          {/* Languages */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginBottom: '0.7rem' }}>
            {g.languages.map((l, i) => (
              <span key={l} style={{
                fontSize: '0.65rem', fontWeight: 600, padding: '0.15rem 0.55rem', borderRadius: 50,
                background: i === 0 ? '#FAF3E0' : '#F5F0E8',
                border: `1px solid ${i === 0 ? 'rgba(201,168,76,0.4)' : 'transparent'}`,
                color: i === 0 ? '#8B6914' : '#7A6D5A',
              }}>{l}</span>
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
              <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.4rem', fontWeight: 600, color: '#1A1209', lineHeight: 1 }}>
                {g.price}€
              </div>
              <div style={{ fontSize: '0.65rem', color: '#7A6D5A' }}>{g.priceSub}</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.35rem' }}>
              <span style={{ fontSize: '0.6rem', fontWeight: 700, background: '#E8F5EE', color: '#1D5C3A', padding: '0.15rem 0.55rem', borderRadius: 50 }}>✓ Vérifié</span>
              <span style={{ fontSize: '0.6rem', color: '#7A6D5A' }}>{g.pilgrims} pèlerins</span>
            </div>
          </div>

          {/* CTA button */}
          <div style={{
            marginTop: '0.875rem',
            background: '#1A1209',
            color: '#F0D897',
            textAlign: 'center',
            padding: '0.7rem',
            borderRadius: 50,
            fontSize: '0.78rem',
            fontWeight: 700,
            letterSpacing: '0.04em',
          }}>
            Voir le profil →
          </div>
        </div>
      </div>
    </Link>
  );
}
