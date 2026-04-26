'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { IconStar, IconAccessibility, IconMap } from '@/components/Icons';

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

const LIEUX_OPTIONS = [
  'Masjid al-Haram', 'Kaaba', 'Zamzam', 'Safa & Marwa',
  'Mina', 'Arafat', 'Muzdalifah', 'Jabal Nur', 'Jabal Thawr',
  'Jabal Rahmah', 'Masjid al-Nabawi', 'Rawdah', 'Masjid Quba',
  'Masjid al-Qiblatayn', 'Baqi', 'Uhud', 'Masjid al-Fath',
  'Masjid Bilal', 'Masjid Ali', 'Masjid Abi Bakr', 'Masjid Omar',
  'Al-Baqi', 'Train Haramain', 'Bir Uthman', 'Bir Ali (Miqat)', 'Masjid al-Ijabah',
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
    languages: ['🇫🇷 Français', '🇸🇦 Arabe', '🇬🇧 English', '🇲🇦 Darija (Maroc)'],
    services: ['Rituels Omra', 'Histoire islamique', 'PMR', 'Gestion de crise'],
    price: 150,
    priceSub: 'dès 150€/pers',
    badge: 'OFFICIEL SAFARUMA',
    badgeColor: '#C9A84C',
    gradient: 'linear-gradient(135deg, #1A1209, #2D1F08)',
    avatarGradient: 'linear-gradient(135deg, #F0D897, #C9A84C)',
    available: true,
    isOfficial: true,
    specialisteEnfants: false,
    shortBio: 'Naïm accompagne les pèlerins depuis 8 ans entre Makkah et Madinah. Responsable terrain SAFARUMA, formateur certifié, il maîtrise les rituels de l\'Omra, l\'histoire islamique des lieux saints, et assure une prise en charge PMR et gestion de crise. Plus de 500 familles l\'ont choisi pour la qualité humaine de son accompagnement.',
  },
  {
    slug: 'bientot-disponible',
    gender: 'homme',
    zones: ['makkah', 'madinah'],
    name: 'Nouveaux guides',
    title: 'Bientôt disponibles',
    initials: '＋',
    location: 'Makkah · Madinah',
    experience: 0,
    rating: 0,
    reviews: 0,
    pilgrims: '',
    languages: ['🇫🇷 Français', '🇸🇦 Arabe'],
    services: [],
    price: 0,
    priceSub: '',
    badge: 'Bientôt',
    badgeColor: '#7A6D5A',
    gradient: 'linear-gradient(135deg, #1A1209, #4A3F30)',
    avatarGradient: 'linear-gradient(135deg, #E8E8E8, #C8C8C8)',
    available: false,
    specialisteEnfants: false,
  },
];

type GuideData = typeof GUIDES_DATA[0];

// ─── SVG Avatars ──────────────────────────────────────────────────────────────
function GuideAvatarSVG({ slug, gradient, initials, isWoman }: { slug: string; gradient: string; initials: string; isWoman?: boolean }) {
  if (slug === 'naim-laamari') {
    return (
      <div style={{
        width: '100%', height: '100%',
        borderRadius: '50%',
        overflow: 'hidden',
        position: 'relative',
      }}>
        <Image
          src="/guide-avatar.png"
          alt="Naïm LAAMARI"
          fill
          style={{
            objectFit: 'cover',
            objectPosition: 'center 10%',
            transform: 'scale(1.15)',
          }}
        />
      </div>
    );
  }
  const bgMap: Record<string, string> = {
    'rachid-al-madani': '#1A3A2A', 'youssouf-konate': '#2A1A3A',
    'abdullah-ben-yusuf': '#1A2A3A', 'fatima-al-omari': '#3A1A2A', 'samira-al-rashidi': '#2A3A1A',
  };
  const kefMap: Record<string, string> = {
    'rachid-al-madani': '#9FE1CB', 'youssouf-konate': '#D4A0E0',
    'abdullah-ben-yusuf': '#A0C4F0', 'fatima-al-omari': '#F0A8C0', 'samira-al-rashidi': '#A8D4A0',
  };
  const bg = bgMap[slug] || '#1A1209';
  const accent = kefMap[slug] || '#C9A84C';

  if (isWoman) {
    return (
      <svg width="46" height="46" viewBox="0 0 46 46" fill="none">
        <rect width="46" height="46" rx="23" fill={bg} />
        <circle cx="23" cy="14" r="6" fill="white" opacity="0.92" />
        <ellipse cx="23" cy="13" rx="9" ry="6" fill={accent} opacity="0.85" />
        <path d="M14 14 Q14 26 16 30 Q19 34 23 34 Q27 34 30 30 Q32 26 32 14" fill={accent} opacity="0.55" />
        <path d="M16 26 Q14 34 14 40 L32 40 Q32 34 30 26 Q27 22 23 22 Q19 22 16 26Z" fill="white" opacity="0.82" />
      </svg>
    );
  }
  return (
    <svg width="46" height="46" viewBox="0 0 46 46" fill="none">
      <rect width="46" height="46" rx="23" fill={bg} />
      <ellipse cx="23" cy="11" rx="10" ry="5.5" fill={accent} opacity="0.9" />
      <path d="M13 11 Q13 16 15 18 L31 18 Q33 16 33 11" fill={accent} opacity="0.7" />
      <circle cx="23" cy="14" r="6" fill="white" opacity="0.92" />
      <rect x="14" y="10" width="18" height="3" rx="1.5" fill={accent} opacity="0.95" />
      <path d="M15 24 Q13 34 13 42 L33 42 Q33 34 31 24 Q28 20 23 20 Q18 20 15 24Z" fill="white" opacity="0.85" />
    </svg>
  );
}

// ─── Calendar Picker ──────────────────────────────────────────────────────────
function CalendarPicker({ dateArrivee, setDateArrivee, dateDepart, setDateDepart, calOffset, setCalOffset }: {
  dateArrivee: Date | null; setDateArrivee: (d: Date | null) => void;
  dateDepart: Date | null; setDateDepart: (d: Date | null) => void;
  calOffset: number; setCalOffset: (n: number) => void;
}) {
  const [pickStep, setPickStep] = useState(0);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const base = new Date(today.getFullYear(), today.getMonth() + calOffset, 1);
  const year = base.getFullYear();
  const month = base.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = (new Date(year, month, 1).getDay() + 6) % 7; // Mon=0

  const MONTHS = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
  const DAYS = ['L','M','M','J','V','S','D'];

  const handleDay = (day: number) => {
    const d = new Date(year, month, day);
    if (d < today) return;
    if (pickStep === 0 || (dateArrivee && d <= dateArrivee)) {
      setDateArrivee(d); setDateDepart(null); setPickStep(1);
    } else {
      setDateDepart(d); setPickStep(0);
    }
  };

  const isStart = (day: number) => dateArrivee?.getTime() === new Date(year, month, day).getTime();
  const isEnd = (day: number) => dateDepart?.getTime() === new Date(year, month, day).getTime();
  const inRange = (day: number) => {
    const d = new Date(year, month, day);
    return !!(dateArrivee && dateDepart && d > dateArrivee && d < dateDepart);
  };
  const isPast = (day: number) => new Date(year, month, day) < today;

  const cells = Array.from({ length: firstDay + daysInMonth }, (_, i) => i < firstDay ? null : i - firstDay + 1);

  return (
    <div style={{ padding: '1rem 1.25rem', minWidth: 290 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
        <button
          onClick={() => calOffset > 0 && setCalOffset(calOffset - 1)}
          style={{ width: 30, height: 30, border: '1.5px solid #E8DFC8', borderRadius: 8, background: 'white', cursor: calOffset > 0 ? 'pointer' : 'not-allowed', color: calOffset > 0 ? '#1A1209' : '#ccc', fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >‹</button>
        <span style={{ fontWeight: 700, fontSize: '0.875rem', color: '#1A1209' }}>{MONTHS[month]} {year}</span>
        <button
          onClick={() => setCalOffset(calOffset + 1)}
          style={{ width: 30, height: 30, border: '1.5px solid #E8DFC8', borderRadius: 8, background: 'white', cursor: 'pointer', color: '#1A1209', fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >›</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', textAlign: 'center' }}>
        {DAYS.map((d, i) => <div key={i} style={{ fontSize: '0.62rem', fontWeight: 700, color: '#7A6D5A', padding: '0.25rem 0' }}>{d}</div>)}
        {cells.map((day, i) => {
          if (!day) return <div key={i} />;
          const s = isStart(day), e = isEnd(day), r = inRange(day), p = isPast(day);
          return (
            <button key={i} onClick={() => !p && handleDay(day)} style={{
              width: 34, height: 34, border: 'none', cursor: p ? 'not-allowed' : 'pointer',
              borderRadius: (s || e) ? '50%' : r ? '0' : '50%',
              background: (s || e) ? '#1A1209' : r ? 'rgba(201,168,76,0.15)' : 'transparent',
              color: (s || e) ? '#F0D897' : p ? '#ccc' : '#1A1209',
              fontSize: '0.8rem', fontWeight: (s || e) ? 700 : 400,
            }}>{day}</button>
          );
        })}
      </div>
      <div style={{ fontSize: '0.7rem', color: '#7A6D5A', textAlign: 'center', marginTop: '0.6rem' }}>
        {pickStep === 1 ? 'Maintenant choisissez la date de départ' : 'Choisissez la date d\'arrivée'}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function GuideSearchPage() {
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedLangue, setSelectedLangue] = useState('');
  const [selectedGender, setSelectedGender] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState(800);

  const [dateArrivee, setDateArrivee] = useState<Date | null>(null);
  const [dateDepart, setDateDepart] = useState<Date | null>(null);
  const [calOffset, setCalOffset] = useState(0);
  const [openPop, setOpenPop] = useState<'dest' | 'cal' | 'langue' | 'voy' | null>(null);
  const [nbPersonnes, setNbPersonnes] = useState(1);
  const [pmr, setPmr] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const [selectedNote, setSelectedNote] = useState('');
  const [selectedSpecialites, setSelectedSpecialites] = useState<string[]>([]);
  const [selectedLieux, setSelectedLieux] = useState<string[]>([]);
  const [lieuxDropOpen, setLieuxDropOpen] = useState(false);
  const [sortBy, setSortBy] = useState('recommande');

  const [drawerGuide, setDrawerGuide] = useState<GuideData | null>(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [loadingSlug, setLoadingSlug] = useState<string | null>(null);

  const openDrawer = (g: GuideData) => {
    setLoadingSlug(g.slug);
    setTimeout(() => {
      setDrawerGuide(g);
      setDrawerVisible(true);
      setLoadingSlug(null);
    }, 120);
  };
  const closeDrawer = () => {
    setDrawerVisible(false);
    setTimeout(() => setDrawerGuide(null), 300);
  };

  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (barRef.current && !barRef.current.contains(e.target as Node)) setOpenPop(null);
    };
    if (openPop) document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [openPop]);

  const fmt = (d: Date | null) => d ? d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }) : null;
  const destLabel: React.ReactNode = selectedCity === 'MAKKAH' ? 'Makkah'
    : selectedCity === 'MADINAH' ? 'Madinah'
    : selectedCity === 'BOTH' ? (
      <span style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
        <span style={{ padding: '2px 8px', borderRadius: 4, background: 'rgba(201,168,76,.12)', fontSize: 11, color: '#8B6914', fontWeight: 700 }}>Makkah</span>
        <span style={{ padding: '2px 8px', borderRadius: 4, background: 'rgba(201,168,76,.12)', fontSize: 11, color: '#8B6914', fontWeight: 700 }}>Madinah</span>
      </span>
    ) : 'Destination';
  const calLabel = dateArrivee ? `${fmt(dateArrivee)}${dateDepart ? ' → ' + fmt(dateDepart) : ''}` : 'Dates';
  const voyLabel = nbPersonnes > 1 || pmr ? `${nbPersonnes} pers${pmr ? ' · PMR' : ''}` : 'Voyageurs';

  const langCodes: Record<string, string> = {
    fr: 'Français', ar: 'Arabe', en: 'English', darija: 'Darija',
    wolof: 'Wolof', bambara: 'Bambara', algerien: 'Algérien',
    tunisien: 'Tunisien', urdu: 'Urdu', hindi: 'Hindi',
    turk: 'Türkçe', russe: 'Russe', mandarin: 'Mandarin',
    espanol: 'Español', deutsch: 'Deutsch',
  };
  const langueLabel = selectedLangue === 'fr' ? '🇫🇷 Français'
    : selectedLangue === 'ar' ? '🇸🇦 Arabe'
    : selectedLangue === 'en' ? '🇬🇧 English'
    : selectedLangue === 'darija' ? '🇲🇦 Darija'
    : selectedLangue === 'wolof' ? '🇸🇳 Wolof'
    : selectedLangue === 'bambara' ? '🌍 Bambara'
    : selectedLangue ? selectedLangue
    : 'Toutes langues';

  const toggleSpe = (s: string) => setSelectedSpecialites(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s]);
  const toggleLieu = (l: string) => setSelectedLieux(p => p.includes(l) ? p.filter(x => x !== l) : [...p, l]);

  const resetFilters = () => {
    setSelectedCity(''); setSelectedLangue(''); setSelectedGender('');
    setSelectedBudget(800); setSelectedNote(''); setSelectedSpecialites([]);
    setSelectedLieux([]); setPmr(false); setNbPersonnes(1);
    setDateArrivee(null); setDateDepart(null); setHasSearched(false);
  };

  const filteredGuides = GUIDES_DATA.filter(g => {
    if (g.available === false) return false;
    if (selectedCity === 'MAKKAH' && !g.zones.includes('makkah')) return false;
    if (selectedCity === 'MADINAH' && !g.zones.includes('madinah')) return false;
    if (selectedCity === 'BOTH' && !(g.zones.includes('makkah') && g.zones.includes('madinah'))) return false;
    if (selectedGender === 'HOMME' && g.gender !== 'homme') return false;
    if (selectedGender === 'FEMME' && g.gender !== 'femme') return false;
    if (selectedLangue) {
      const match = langCodes[selectedLangue] || selectedLangue;
      if (!g.languages.some(l => l.includes(match))) return false;
    }
    if (g.price > selectedBudget) return false;
    if (selectedNote && g.rating < parseFloat(selectedNote)) return false;
    if (pmr && !g.services.some(s => s.includes('PMR'))) return false;
    if (selectedSpecialites.includes('pmr') && !g.services.some(s => s.includes('PMR'))) return false;
    if (selectedSpecialites.includes('famille') && !g.services.some(s => s.toLowerCase().includes('famil'))) return false;
    if (selectedSpecialites.includes('groupe') && !g.services.some(s => s.toLowerCase().includes('group') || s.toLowerCase().includes('van'))) return false;
    if (selectedSpecialites.includes('enfants') && !(g.specialisteEnfants || g.services.some(s => s.toLowerCase().includes('enfant') || s.toLowerCase().includes('famille')))) return false;
    return true;
  });
  const comingSoonGuides = GUIDES_DATA.filter(g => g.available === false);
  const filteredOfficial = filteredGuides.filter(g => g.isOfficial);
  const filteredNonOfficial = filteredGuides.filter(g => !g.isOfficial);

  const FiltersContent = () => (
    <>
      <FilterCard title="Langue">
        <select
          value={selectedLangue}
          onChange={e => setSelectedLangue(e.target.value)}
          style={{ width: '100%', border: '1.5px solid #E8DFC8', borderRadius: 10, padding: '0.5rem 0.75rem', fontSize: '0.82rem', color: '#1A1209', background: 'white', fontFamily: 'inherit', cursor: 'pointer', outline: 'none' }}
        >
          <option value="">Toutes les langues</option>
          <option value="fr">🇫🇷 Français</option>
          <option value="ar">🇸🇦 Arabe</option>
          <option value="en">🇬🇧 English</option>
          <option value="darija">🇲🇦 Darija (Maroc)</option>
          <option value="wolof">🇸🇳 Wolof</option>
          <option value="bambara">🌍 Bambara</option>
          <option value="algerien">🇩🇿 Algérien</option>
          <option value="tunisien">🇹🇳 Tunisien</option>
          <option value="urdu">🇵🇰 Urdu</option>
          <option value="hindi">🇮🇳 Hindi</option>
          <option value="turk">🇹🇷 Türkçe</option>
          <option value="russe">🇷🇺 Russe</option>
          <option value="mandarin">🇨🇳 Mandarin</option>
          <option value="espanol">🇪🇸 Español</option>
          <option value="deutsch">🇩🇪 Deutsch</option>
        </select>
      </FilterCard>

      <FilterCard title="Guide pour">
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {[{ val: '', label: 'Tous' }, { val: 'HOMME', label: 'Hommes' }, { val: 'FEMME', label: 'Femmes' }].map(opt => (
            <button key={opt.val} onClick={() => setSelectedGender(opt.val)} style={{ padding: '0.4rem 0.875rem', borderRadius: 50, border: selectedGender === opt.val ? '2px solid #C9A84C' : '1.5px solid #E8DFC8', background: selectedGender === opt.val ? 'rgba(201,168,76,0.08)' : 'white', color: selectedGender === opt.val ? '#8B6914' : '#7A6D5A', fontWeight: selectedGender === opt.val ? 700 : 500, fontSize: '0.78rem', cursor: 'pointer', fontFamily: 'inherit' }}>{opt.label}</button>
          ))}
        </div>
      </FilterCard>

      <FilterCard title="Budget">
        <div style={{ marginBottom: '0.35rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#7A6D5A' }}>
          <span>Prix / personne</span>
          <strong style={{ color: '#1A1209' }}>{selectedBudget}€ max</strong>
        </div>
        <input type="range" min="100" max="1500" value={selectedBudget} step="50" onChange={e => setSelectedBudget(Number(e.target.value))} style={{ width: '100%', accentColor: '#C9A84C', cursor: 'pointer' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: '#7A6D5A', marginTop: '0.25rem' }}>
          <span>100€</span><span>1 500€</span>
        </div>
      </FilterCard>

      <FilterCard title="Spécialités">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {[
            {
              val: 'pmr',
              label: 'PMR / Mobilité réduite',
              icon: (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <circle cx="12" cy="5" r="2"/>
                  <path d="M12 7v6l3 3"/>
                  <circle cx="9" cy="19" r="3"/>
                  <path d="M15 14h3l1 4"/>
                </svg>
              ),
            },
            {
              val: 'famille',
              label: 'Familles (max 6 pers.)',
              icon: (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 00-3-3.87"/>
                  <path d="M16 3.13a4 4 0 010 7.75"/>
                </svg>
              ),
            },
            {
              val: 'groupe',
              label: 'Groupes (+7 pers.)',
              icon: (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2"/>
                  <circle cx="17" cy="9" r="3"/>
                  <path d="M21 21v-1a3 3 0 00-3-3h-1"/>
                </svg>
              ),
            },
            {
              val: 'enfants',
              label: 'Spécialiste enfants',
              icon: (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M12 2a5 5 0 100 10A5 5 0 0012 2z"/>
                  <path d="M9 14l-2 7h10l-2-7"/>
                  <path d="M9 17h6"/>
                </svg>
              ),
            },
          ].map(s => {
            const active = selectedSpecialites.includes(s.val);
            return (
              <button
                key={s.val}
                onClick={() => setSelectedSpecialites(prev =>
                  active ? prev.filter(x => x !== s.val) : [...prev, s.val]
                )}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '6px 12px', borderRadius: 50,
                  border: active ? '2px solid #C9A84C' : '1.5px solid #E8DFC8',
                  background: active ? 'rgba(201,168,76,.1)' : 'white',
                  color: active ? '#8B6914' : '#7A6D5A',
                  fontWeight: active ? 700 : 500,
                  fontSize: 11, cursor: 'pointer',
                  fontFamily: 'inherit', textAlign: 'left',
                  width: '100%', transition: 'all .15s',
                }}
              >
                <span style={{ color: active ? '#C9A84C' : '#7A6D5A', flexShrink: 0, display: 'flex' }}>
                  {s.icon}
                </span>
                {s.label}
              </button>
            );
          })}
        </div>
      </FilterCard>

      <FilterCard title="Lieux saints">
        <div style={{ position: 'relative' }}>
          <button onClick={() => setLieuxDropOpen(v => !v)} style={{ width: '100%', border: '1.5px solid #E8DFC8', borderRadius: 10, padding: '0.5rem 0.75rem', fontSize: '0.82rem', color: '#7A6D5A', background: 'white', fontFamily: 'inherit', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', outline: 'none' }}>
            <span>{selectedLieux.length > 0 ? `${selectedLieux.length} lieu(x)` : 'Sélectionner'}</span>
            <span style={{ fontSize: '0.6rem' }}>{lieuxDropOpen ? '▲' : '▼'}</span>
          </button>
          {lieuxDropOpen && (
            <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'white', border: '1.5px solid #E8DFC8', borderRadius: 12, marginTop: 4, maxHeight: 180, overflowY: 'auto', zIndex: 50, boxShadow: '0 8px 24px rgba(26,18,9,0.12)' }}>
              {LIEUX_OPTIONS.map(l => (
                <label key={l} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.4rem 0.75rem', cursor: 'pointer', borderBottom: '1px solid #E8DFC8' }}>
                  <input type="checkbox" checked={selectedLieux.includes(l)} onChange={() => toggleLieu(l)} style={{ width: 13, height: 13, accentColor: '#C9A84C' }} />
                  <span style={{ fontSize: '0.78rem', color: '#1A1209' }}>{l}</span>
                </label>
              ))}
            </div>
          )}
        </div>
        {selectedLieux.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginTop: '0.5rem' }}>
            {selectedLieux.map(l => (
              <span key={l} style={{ fontSize: '0.62rem', padding: '0.2rem 0.5rem', background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.3)', borderRadius: 50, color: '#8B6914', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                {l}
                <button onClick={() => toggleLieu(l)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8B6914', padding: 0, lineHeight: 1, fontSize: '0.7rem' }}>✕</button>
              </span>
            ))}
          </div>
        )}
      </FilterCard>

      <FilterCard title="Note minimale">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
          {['4.5', '4.7', '4.9'].map(r => (
            <button key={r} onClick={() => setSelectedNote(selectedNote === r ? '' : r)} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.3rem 0.75rem', borderRadius: 50, border: selectedNote === r ? '2px solid #C9A84C' : '1.5px solid #E8DFC8', background: selectedNote === r ? 'rgba(201,168,76,0.08)' : 'transparent', fontSize: '0.75rem', cursor: 'pointer', color: selectedNote === r ? '#8B6914' : '#7A6D5A', fontWeight: selectedNote === r ? 700 : 500, fontFamily: 'inherit' }}>
              <IconStar size={12} stroke="#C9A84C" /> {r}+
            </button>
          ))}
        </div>
      </FilterCard>

      <button onClick={resetFilters} style={{ width: '100%', padding: '0.6rem', border: '1.5px solid #E8DFC8', borderRadius: 50, background: 'transparent', color: '#7A6D5A', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', marginTop: '0.25rem' }}>
        Réinitialiser
      </button>
    </>
  );

  return (
    <div style={{ fontFamily: 'var(--font-manrope, Manrope, sans-serif)', background: '#FAF7F0', color: '#1A1209', minHeight: '100vh' }}>
      <Navbar />

      {/* ── HERO ── */}
      <div className="guides-hero" style={{ background: '#1A1209', position: 'relative', overflow: 'visible' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 120% at 50% 110%, rgba(201,168,76,0.14) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', right: '4rem', top: '50%', transform: 'translateY(-50%)', fontFamily: 'serif', fontSize: '10rem', color: 'rgba(201,168,76,0.05)', userSelect: 'none', pointerEvents: 'none', lineHeight: 1 }}>مرشد</div>

        <div style={{ maxWidth: 860, margin: '0 auto', position: 'relative', zIndex: 50 }}>
          <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(240,216,151,0.55)', marginBottom: '0.75rem', textAlign: 'center' }}>
            Trouver mon guide privé
          </div>
          <h1 style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: 'clamp(2rem, 5vw, 3.2rem)', fontWeight: 300, color: 'white', textAlign: 'center', marginBottom: '0.5rem', lineHeight: 1.1 }}>
            Ton voyage, dans <em style={{ fontStyle: 'italic', color: '#C9A84C' }}>ta langue</em>
          </h1>
          <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.65)', fontSize: '0.9rem', marginBottom: '2rem' }}>
            Sélection rigoureuse · Entretien physique · Certifiés SAFARUMA · Makkah, Madinah & plus
          </p>

          {/* ── Search bar ── */}
          <div ref={barRef} style={{ position: 'relative' }}>
            <div className="guides-search-pill">
              {/* Destination */}
              <button
                onClick={() => setOpenPop(openPop === 'dest' ? null : 'dest')}
                className="search-seg"
                style={{ borderRight: '1px solid #E8DFC8' }}
              >
                <div className="search-seg-label">Destination</div>
                <div className="search-seg-val" style={{ color: selectedCity ? '#1A1209' : '#9A8A7A', fontWeight: selectedCity ? 700 : 400 }}>{destLabel}</div>
              </button>

              {/* Dates */}
              <button
                onClick={() => setOpenPop(openPop === 'cal' ? null : 'cal')}
                className="search-seg"
                style={{ borderRight: '1px solid #E8DFC8' }}
              >
                <div className="search-seg-label">Dates</div>
                <div className="search-seg-val" style={{ color: dateArrivee ? '#1A1209' : '#9A8A7A', fontWeight: dateArrivee ? 700 : 400 }}>{calLabel}</div>
              </button>

              {/* Langue */}
              <button
                onClick={() => setOpenPop(openPop === 'langue' ? null : 'langue')}
                className="search-seg"
                style={{ borderRight: '1px solid #E8DFC8' }}
              >
                <div className="search-seg-label">Langue</div>
                <div className="search-seg-val" style={{ color: selectedLangue ? '#1A1209' : '#9A8A7A', fontWeight: selectedLangue ? 700 : 400 }}>{langueLabel}</div>
              </button>

              {/* Voyageurs */}
              <button
                onClick={() => setOpenPop(openPop === 'voy' ? null : 'voy')}
                className="search-seg"
              >
                <div className="search-seg-label">Voyageurs</div>
                <div className="search-seg-val" style={{ color: (nbPersonnes > 1 || pmr) ? '#1A1209' : '#9A8A7A', fontWeight: (nbPersonnes > 1 || pmr) ? 700 : 400 }}>{voyLabel}</div>
              </button>

              {/* Chercher */}
              <button
                onClick={() => { setHasSearched(true); setOpenPop(null); }}
                className="search-btn"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
                <span className="search-btn-label">Chercher</span>
              </button>
            </div>

            {/* ── Destination popup ── */}
            {openPop === 'dest' && (() => {
              const DEST_OPTIONS = [
                { val: '', label: 'Toutes', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="1.8" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg> },
                { val: 'MAKKAH', label: 'Makkah', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="1.8" strokeLinecap="round"><path d="M3 10l9-7 9 7v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/><polyline points="9,21 9,12 15,12 15,21"/></svg> },
                { val: 'MADINAH', label: 'Madinah', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="1.8" strokeLinecap="round"><path d="M12 3a6 6 0 0 1 6 6c0 4-6 9-6 9s-6-5-6-9a6 6 0 0 1 6-6z"/><path d="M5 21h14"/><path d="M12 3v2"/></svg> },
                { val: 'BOTH', label: 'Makkah + Madinah', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="1.8" strokeLinecap="round"><path d="M8 2a4 4 0 0 1 4 4c0 3-4 7-4 7S4 9 4 6a4 4 0 0 1 4-4z"/><path d="M16 6a4 4 0 0 1 4 4c0 3-4 7-4 7s-4-4-4-7a4 4 0 0 1 4-4z"/></svg> },
              ];
              const inner = (
                <>
                  {DEST_OPTIONS.map(opt => (
                    <button key={opt.val} onClick={() => { setSelectedCity(opt.val); setOpenPop(null); }} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%', padding: '0.85rem', border: selectedCity === opt.val ? '2px solid #C9A84C' : '1.5px solid transparent', borderRadius: 12, background: selectedCity === opt.val ? 'rgba(201,168,76,0.07)' : 'transparent', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', marginBottom: '0.3rem', transition: 'background 0.12s' }}>
                      <span style={{ flexShrink: 0 }}>{opt.icon}</span>
                      <span style={{ fontSize: '0.9rem', fontWeight: selectedCity === opt.val ? 700 : 500, color: selectedCity === opt.val ? '#8B6914' : '#1A1209' }}>{opt.label}</span>
                    </button>
                  ))}
                </>
              );
              if (isMobile) return (
                <>
                  <div onClick={() => setOpenPop(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 999 }} />
                  <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1000, background: 'white', borderRadius: '20px 20px 0 0', padding: '1rem 1.25rem 2.5rem', maxHeight: '70vh', overflowY: 'auto' }}>
                    <div style={{ width: 40, height: 4, borderRadius: 2, background: 'rgba(26,18,9,0.12)', margin: '0 auto 1.25rem' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--deep)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Destination</span>
                      <button onClick={() => setOpenPop(null)} style={{ background: '#E8DFC8', border: 'none', borderRadius: '50%', width: 28, height: 28, cursor: 'pointer', fontSize: 14, color: '#7A6D5A' }}>✕</button>
                    </div>
                    {inner}
                  </div>
                </>
              );
              return (
                <div className="search-popup" style={{ left: 0 }}>
                  <div style={{ fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#7A6D5A', marginBottom: '0.75rem' }}>Choisir une destination</div>
                  {inner}
                </div>
              );
            })()}

            {/* ── Calendar popup ── */}
            {openPop === 'cal' && (() => {
              const inner = (
                <>
                  <CalendarPicker
                    dateArrivee={dateArrivee} setDateArrivee={setDateArrivee}
                    dateDepart={dateDepart} setDateDepart={setDateDepart}
                    calOffset={calOffset} setCalOffset={setCalOffset}
                  />
                  {dateArrivee && dateDepart && (
                    <div style={{ padding: '0 1.25rem 0.875rem', display: 'flex', justifyContent: 'flex-end' }}>
                      <button onClick={() => setOpenPop(null)} style={{ padding: '0.45rem 1.25rem', background: '#1A1209', color: '#F0D897', border: 'none', borderRadius: 50, fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Confirmer</button>
                    </div>
                  )}
                </>
              );
              if (isMobile) return (
                <>
                  <div onClick={() => setOpenPop(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 999 }} />
                  <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1000, background: 'white', borderRadius: '20px 20px 0 0', padding: '1rem 1.25rem 2.5rem', maxHeight: '70vh', overflowY: 'auto' }}>
                    <div style={{ width: 40, height: 4, borderRadius: 2, background: 'rgba(26,18,9,0.12)', margin: '0 auto 1.25rem' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--deep)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Dates</span>
                      <button onClick={() => setOpenPop(null)} style={{ background: '#E8DFC8', border: 'none', borderRadius: '50%', width: 28, height: 28, cursor: 'pointer', fontSize: 14, color: '#7A6D5A' }}>✕</button>
                    </div>
                    {inner}
                  </div>
                </>
              );
              return (
                <div className="search-popup" style={{ left: '50%', transform: 'translateX(-50%)' }}>
                  {inner}
                </div>
              );
            })()}

            {/* ── Langue popup ── */}
            {openPop === 'langue' && (() => {
              const LANGUE_OPTIONS = [
                { val: '', label: 'Toutes les langues' },
                { val: 'fr', label: 'Français' },
                { val: 'ar', label: 'Arabe' },
                { val: 'en', label: 'English' },
                { val: 'darija', label: 'Darija (Maroc)' },
                { val: 'wolof', label: 'Wolof' },
                { val: 'bambara', label: 'Bambara' },
                { val: 'algerien', label: 'Algérien' },
                { val: 'tunisien', label: 'Tunisien' },
                { val: 'urdu', label: 'Urdu' },
                { val: 'hindi', label: 'Hindi' },
                { val: 'turk', label: 'Türkçe' },
                { val: 'russe', label: 'Russe' },
                { val: 'mandarin', label: 'Mandarin' },
                { val: 'espanol', label: 'Español' },
                { val: 'deutsch', label: 'Deutsch' },
              ];
              const inner = (
                <>
                  {LANGUE_OPTIONS.map(opt => (
                    <button key={opt.val} onClick={() => { setSelectedLangue(opt.val); setOpenPop(null); }} style={{ display: 'flex', alignItems: 'center', width: '100%', padding: '0.85rem', border: selectedLangue === opt.val ? '2px solid #C9A84C' : '1.5px solid transparent', borderRadius: 12, background: selectedLangue === opt.val ? 'rgba(201,168,76,0.07)' : 'transparent', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', marginBottom: '0.3rem', transition: 'background 0.12s' }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: selectedLangue === opt.val ? 700 : 500, color: selectedLangue === opt.val ? '#8B6914' : '#1A1209' }}>{opt.label}</span>
                    </button>
                  ))}
                </>
              );
              if (isMobile) return (
                <>
                  <div onClick={() => setOpenPop(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 999 }} />
                  <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1000, background: 'white', borderRadius: '20px 20px 0 0', padding: '1rem 1.25rem 2.5rem', maxHeight: '70vh', overflowY: 'auto' }}>
                    <div style={{ width: 40, height: 4, borderRadius: 2, background: 'rgba(26,18,9,0.12)', margin: '0 auto 1.25rem' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--deep)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Langue</span>
                      <button onClick={() => setOpenPop(null)} style={{ background: '#E8DFC8', border: 'none', borderRadius: '50%', width: 28, height: 28, cursor: 'pointer', fontSize: 14, color: '#7A6D5A' }}>✕</button>
                    </div>
                    {inner}
                  </div>
                </>
              );
              return (
                <div className="search-popup" style={{ left: '33%' }}>
                  <div style={{ fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#7A6D5A', marginBottom: '0.75rem' }}>Langue du guide</div>
                  {inner}
                </div>
              );
            })()}

            {/* ── Voyageurs popup ── */}
            {openPop === 'voy' && (() => {
              const inner = (
                <>
                  <div style={{ fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#7A6D5A', marginBottom: '1rem' }}>Voyageurs</div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                    <div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1A1209' }}>Personnes</div>
                      <div style={{ fontSize: '0.72rem', color: '#7A6D5A' }}>1 à 7 personnes · voiture privée</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <button onClick={() => setNbPersonnes(Math.max(1, nbPersonnes - 1))} style={{ width: 32, height: 32, borderRadius: '50%', border: '1.5px solid #E8DFC8', background: 'white', cursor: nbPersonnes > 1 ? 'pointer' : 'not-allowed', color: nbPersonnes > 1 ? '#1A1209' : '#ccc', fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                      <span style={{ fontSize: '1rem', fontWeight: 700, color: '#1A1209', minWidth: 20, textAlign: 'center' }}>{nbPersonnes}</span>
                      <button onClick={() => setNbPersonnes(Math.min(7, nbPersonnes + 1))} style={{ width: 32, height: 32, borderRadius: '50%', border: '1.5px solid #E8DFC8', background: 'white', cursor: nbPersonnes < 7 ? 'pointer' : 'not-allowed', color: nbPersonnes < 7 ? '#1A1209' : '#ccc', fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1A1209' }}>Mobilité réduite (PMR)</div>
                      <div style={{ fontSize: '0.72rem', color: '#7A6D5A' }}>Guide spécialisé requis</div>
                    </div>
                    <div onClick={() => setPmr(!pmr)} style={{ width: 44, height: 24, borderRadius: 12, background: pmr ? '#1A1209' : '#E8DFC8', position: 'relative', cursor: 'pointer', transition: 'background 0.2s', flexShrink: 0 }}>
                      <div style={{ position: 'absolute', top: 3, left: pmr ? 23 : 3, width: 18, height: 18, borderRadius: '50%', background: pmr ? '#C9A84C' : 'white', transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }} />
                    </div>
                  </div>

                  <button onClick={() => setOpenPop(null)} style={{ width: '100%', marginTop: '1.25rem', padding: '0.55rem', background: '#1A1209', color: '#F0D897', border: 'none', borderRadius: 50, fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                    Confirmer
                  </button>
                </>
              );
              if (isMobile) return (
                <>
                  <div onClick={() => setOpenPop(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 999 }} />
                  <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1000, background: 'white', borderRadius: '20px 20px 0 0', padding: '1rem 1.25rem 2.5rem', maxHeight: '70vh', overflowY: 'auto' }}>
                    <div style={{ width: 40, height: 4, borderRadius: 2, background: 'rgba(26,18,9,0.12)', margin: '0 auto 1.25rem' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--deep)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Voyageurs</span>
                      <button onClick={() => setOpenPop(null)} style={{ background: '#E8DFC8', border: 'none', borderRadius: '50%', width: 28, height: 28, cursor: 'pointer', fontSize: 14, color: '#7A6D5A' }}>✕</button>
                    </div>
                    {inner}
                  </div>
                </>
              );
              return (
                <div className="search-popup" style={{ right: 0 }}>
                  {inner}
                </div>
              );
            })()}
          </div>
        </div>
      </div>

      {/* ── TRUST BAR ── */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', padding: '0.75rem 1.5rem', background: '#E8DFC8', borderBottom: '1px solid #E8DFC8', flexWrap: 'wrap' }}>
        {[
          {
            label: 'Guides certifiés',
            icon: (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                <polyline points="9,12 11,14 15,10"/>
              </svg>
            ),
          },
          {
            label: 'Paiement sécurisé',
            icon: (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                <line x1="1" y1="10" x2="23" y2="10"/>
              </svg>
            ),
          },
          {
            label: '4.9 · 12 890 avis',
            icon: (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#C9A84C" stroke="#C9A84C" strokeWidth="1">
                <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
              </svg>
            ),
          },
        ].map(b => (
          <span key={b.label} style={{ display: 'flex', alignItems: 'center', gap: '.4rem', fontSize: '.75rem', fontWeight: 600, color: '#7A6D5A' }}>
            <span style={{ color: '#C9A84C', display: 'flex', alignItems: 'center' }}>{b.icon}</span>
            {b.label}
          </span>
        ))}
      </div>

      {/* ── MAIN ── */}
      <div className="guides-main">

        {/* Sidebar — only when hasSearched */}
        {hasSearched && (
          <aside className="guides-sidebar" style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 100px)' }}>
            <FiltersContent />
          </aside>
        )}

        {/* Results */}
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* Results bar */}
          {hasSearched ? (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <p style={{ fontSize: '0.875rem', color: '#7A6D5A', margin: 0 }}>
                <strong style={{ color: '#1A1209' }}>{filteredGuides.length}</strong> guide{filteredGuides.length !== 1 ? 's' : ''} trouvé{filteredGuides.length !== 1 ? 's' : ''}
                {selectedCity === 'MAKKAH' ? ' · Makkah' : selectedCity === 'MADINAH' ? ' · Madinah' : selectedCity === 'BOTH' ? ' · Makkah + Madinah' : ''}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.78rem', color: '#7A6D5A', whiteSpace: 'nowrap' }}>Trier par</span>
                <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ border: '1.5px solid #E8DFC8', borderRadius: 8, padding: '0.35rem 0.65rem', fontSize: '0.78rem', color: '#1A1209', background: 'white', fontFamily: 'inherit', cursor: 'pointer', outline: 'none' }}>
                  <option value="recommande">Recommandé</option>
                  <option value="note">Meilleure note</option>
                  <option value="prix_asc">Prix croissant</option>
                  <option value="prix_desc">Prix décroissant</option>
                  <option value="experience">Expérience</option>
                </select>
              </div>
            </div>
          ) : (
            <>
              <div className="guides-mobile-bar">
                <p style={{ fontSize: '0.875rem', color: '#7A6D5A', margin: 0 }}>
                  <strong style={{ color: '#1A1209' }}>{filteredGuides.length}</strong> guide{filteredGuides.length > 1 ? 's' : ''} disponible{filteredGuides.length > 1 ? 's' : ''}
                </p>
                <button onClick={() => setFiltersOpen(true)} className="guides-filter-btn">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/>
                  </svg>
                  Filtres
                </button>
              </div>
              <div className="guides-desktop-count">
                <p style={{ fontSize: '0.875rem', color: '#7A6D5A', margin: 0 }}>
                  <strong style={{ color: '#1A1209' }}>{filteredGuides.length}</strong> guide{filteredGuides.length > 1 ? 's' : ''} disponible{filteredGuides.length > 1 ? 's' : ''}
                </p>
              </div>
            </>
          )}

          {/* Official guide */}
          {filteredOfficial.map(g => (
            <div key={g.slug} className="guide-official-wrap">
              <div className="guide-official-label">★ RESPONSABLE OFFICIEL SAFARUMA</div>
              <GuideCard guide={g} official onProfile={() => openDrawer(g)} isLoading={loadingSlug === g.slug} />
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
                <button onClick={resetFilters} style={{ color: '#C9A84C', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem', textDecoration: 'underline' }}>
                  voir tous les guides
                </button>
              </div>
            </div>
          )}

          <div className="guides-grid">
            {filteredNonOfficial.map(g => <GuideCard key={g.slug} guide={g} onProfile={() => openDrawer(g)} isLoading={loadingSlug === g.slug} />)}
          </div>

          {/* ── Section Prochainement ── */}
          {comingSoonGuides.length > 0 && (
            <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '2px dashed #E8DFC8' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <span style={{ fontSize: '0.6rem', fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#7A6D5A', background: '#E8DFC8', padding: '0.25rem 0.75rem', borderRadius: 50 }}>
                  Prochainement
                </span>
                <span style={{ fontSize: '0.78rem', color: '#7A6D5A' }}>Ces guides seront bientôt disponibles</span>
              </div>
              <div className="guides-grid" style={{ opacity: 0.55 }}>
                {comingSoonGuides.map(g => (
                  <div key={g.slug} style={{ background: '#F9FAFB', border: '1.5px dashed #E5E7EB', borderRadius: 16, padding: '1.5rem', pointerEvents: 'none', userSelect: 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                      <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#E8DFC8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', color: '#7A6D5A', fontWeight: 700 }}>
                        {g.initials}
                      </div>
                      <div>
                        <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#6B7280' }}>{g.name}</div>
                        <div style={{ fontSize: '0.72rem', color: '#7A6D5A' }}>{g.title}</div>
                      </div>
                    </div>
                    <div style={{ display: 'inline-block', background: '#E8DFC8', color: '#7A6D5A', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.08em', padding: '0.2rem 0.6rem', borderRadius: 50 }}>
                      Bientôt disponible
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ textAlign: 'center', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #E8DFC8' }}>
            <Link href="/guides" style={{ display: 'inline-block', background: '#1A1209', color: '#F0D897', padding: '0.75rem 2rem', borderRadius: 50, fontSize: '0.85rem', fontWeight: 700, textDecoration: 'none', letterSpacing: '0.04em' }}>
              Voir tous les guides →
            </Link>
          </div>
        </div>
      </div>

      {/* ── BOTTOM SHEET (mobile) ── */}
      {filtersOpen && (
        <>
          <div onClick={() => setFiltersOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, backdropFilter: 'blur(2px)' }} />
          <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 201, background: 'white', borderRadius: '24px 24px 0 0', maxHeight: '85vh', overflowY: 'auto', padding: '0 1.25rem 2rem', boxShadow: '0 -8px 40px rgba(0,0,0,0.2)', animation: 'slideUp 0.25s ease' }}>
            <div style={{ textAlign: 'center', padding: '0.875rem 0 1rem' }}>
              <div style={{ width: 40, height: 4, borderRadius: 2, background: '#E8DFC8', margin: '0 auto' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <span style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.4rem', fontWeight: 700, color: '#1A1209' }}>Filtres</span>
              <button onClick={() => setFiltersOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7A6D5A', fontSize: '1.2rem' }}>✕</button>
            </div>
            <FiltersContent />
            <button onClick={() => setFiltersOpen(false)} style={{ width: '100%', height: 52, background: '#1A1209', color: '#F0D897', border: 'none', borderRadius: 50, fontFamily: 'inherit', fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer', marginTop: '0.5rem' }}>
              Appliquer les filtres
            </button>
          </div>
        </>
      )}

      {/* ── GUIDE DRAWER ── */}
      {drawerGuide && (
        <GuideDrawer guide={drawerGuide} visible={drawerVisible} onClose={closeDrawer} />
      )}

      {/* ── CSS ── */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to   { transform: translateY(0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Hero */
        .guides-hero {
          padding: 8rem 1.5rem 3rem;
        }
        @media (max-width: 768px) {
          .guides-hero { padding: 5rem 1rem 2rem !important; }
        }

        /* Search pill */
        .guides-search-pill {
          display: flex;
          align-items: center;
          background: white;
          border-radius: 100px;
          padding: 0.35rem 0.35rem 0.35rem 1.25rem;
          box-shadow: 0 24px 60px rgba(0,0,0,0.35);
          gap: 0;
        }
        @media (max-width: 640px) {
          .guides-search-pill {
            flex-direction: column;
            border-radius: 20px;
            padding: 0.5rem;
            gap: 0;
          }
        }

        /* Search segments */
        .search-seg {
          flex: 1 1 auto;
          min-width: 0;
          background: transparent;
          border: none;
          cursor: pointer;
          text-align: left;
          padding: 0.5rem 1.1rem 0.5rem 0.75rem;
          font-family: inherit;
          outline: none;
        }
        @media (max-width: 640px) {
          .search-seg {
            width: 100%;
            padding: 0.65rem 0.75rem;
            border-right: none !important;
            border-bottom: 1px solid #E8DFC8;
          }
          .search-seg:last-of-type { border-bottom: none; }
        }
        .search-seg-label {
          font-size: 0.58rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #7A6D5A;
          margin-bottom: 2px;
        }
        .search-seg-val {
          font-size: 0.875rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* Search button */
        .search-btn {
          flex-shrink: 0;
          height: 48px;
          padding: 0 1.5rem;
          background: #1A1209;
          color: #F0D897;
          border: none;
          border-radius: 50px;
          font-size: 0.875rem;
          font-weight: 700;
          cursor: pointer;
          font-family: inherit;
          display: flex;
          align-items: center;
          gap: 0.4rem;
          letter-spacing: 0.02em;
          white-space: nowrap;
          transition: opacity 0.15s;
        }
        .search-btn:hover { opacity: 0.88; }
        @media (max-width: 640px) {
          .search-btn {
            width: 100%;
            justify-content: center;
            border-radius: 14px;
            height: 46px;
            margin-top: 0.35rem;
          }
        }
        .search-btn-label { display: inline; }

        /* Popup */
        .search-popup {
          position: absolute;
          top: calc(100% + 10px);
          background: white;
          border-radius: 20px;
          box-shadow: 0 16px 48px rgba(0,0,0,0.18);
          border: 1px solid #E8DFC8;
          z-index: 200;
          min-width: 260px;
          padding: 1.25rem;
        }
        @media (max-width: 640px) {
          .search-popup {
            left: 0 !important;
            right: 0 !important;
            transform: none !important;
            border-radius: 0 0 16px 16px;
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
        @media (max-width: 1023px) {
          .guides-main { flex-direction: column; padding: 1.25rem 1rem 5rem; }
        }

        /* Sidebar */
        .guides-sidebar {
          width: 280px;
          flex-shrink: 0;
          position: sticky;
          top: 80px;
        }
        @media (max-width: 1023px) {
          .guides-sidebar { display: none !important; }
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

        .guides-desktop-count { margin-bottom: 1rem; }
        @media (max-width: 1023px) {
          .guides-desktop-count { display: none; }
        }

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
          white-space: nowrap;
          transition: border-color 0.15s;
        }
        .guides-filter-btn:hover { border-color: #C9A84C; }

        /* Official wrap */
        .guide-official-wrap { margin-bottom: 1.5rem; }
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
        }
        .guide-official-card {
          border: 2px solid #C9A84C !important;
          border-radius: 0 18px 18px 18px !important;
          box-shadow: 0 8px 40px rgba(201,168,76,0.18) !important;
        }
        .guide-official-card .guide-card-banner { height: 120px !important; }

        /* Cards grid */
        .guides-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.25rem;
        }
        @media (max-width: 767px) {
          .guides-grid { grid-template-columns: 1fr; gap: 1rem; }
        }

        .guide-card-banner { height: 100px; }

        @media (max-width: 768px) {
          .guide-official-card { border-radius: 0 12px 12px 12px !important; }
          .guide-official-card .guide-card-banner { height: 120px !important; }
          .guides-main { padding: 1rem 0.875rem 5rem; gap: 0; }
        }
      `}} />

      <Footer />
    </div>
  );
}

/* ─── Sub-components ─────────────────────────────────────────────────────── */

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

// ─── Guide Drawer ─────────────────────────────────────────────────────────────
function GuideDrawer({ guide: g, visible, onClose }: { guide: GuideData; visible: boolean; onClose: () => void }) {
  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          zIndex: 300, backdropFilter: 'blur(2px)',
          opacity: visible ? 1 : 0,
          transition: 'opacity 0.25s ease',
          pointerEvents: visible ? 'auto' : 'none',
        }}
      />
      {/* Slide-up panel */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        zIndex: 301,
        background: 'white',
        borderRadius: '24px 24px 0 0',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 -8px 40px rgba(0,0,0,0.25)',
        transform: visible ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)',
      }}>
        {/* Handle */}
        <div style={{ textAlign: 'center', padding: '0.875rem 0 0.5rem' }}>
          <div style={{ width: 40, height: 4, borderRadius: 2, background: '#E8DFC8', margin: '0 auto' }} />
        </div>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 1.5rem 1rem' }}>
          <span style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.4rem', fontWeight: 700, color: '#1A1209' }}>Fiche guide</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7A6D5A', fontSize: '1.3rem', lineHeight: 1 }}>✕</button>
        </div>

        {/* Guide hero band */}
        <div style={{ background: g.gradient, padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', border: '3px solid #C9A84C', overflow: 'hidden', flexShrink: 0, boxShadow: '0 0 0 3px #1A1209' }}>
            <GuideAvatarSVG slug={g.slug} gradient={g.gradient} initials={g.initials} isWoman={g.slug === 'fatima-al-omari' || g.slug === 'samira-al-rashidi'} />
          </div>
          <div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#F0D897', lineHeight: 1.2 }}>{g.name}</div>
            <div style={{ fontSize: '0.72rem', color: 'rgba(240,216,151,0.75)', fontStyle: 'italic', marginTop: '0.2rem' }}>{g.title}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.5rem' }}>
              <span style={{ fontSize: '0.62rem', color: '#C9A84C', fontWeight: 800 }}>★</span>
              <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.85)', fontWeight: 700 }}>{g.rating} · {g.experience} ans d&apos;expérience</span>
            </div>
          </div>
        </div>

        {/* Bio */}
        {'shortBio' in g && g.shortBio && (
          <div style={{ padding: '1.25rem 1.5rem 0' }}>
            <p style={{ fontSize: '0.85rem', lineHeight: 1.65, color: '#4A4A4A', margin: 0 }}>{g.shortBio as string}</p>
          </div>
        )}

        {/* Languages */}
        <div style={{ padding: '1rem 1.5rem 0' }}>
          <div style={{ fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#7A6D5A', marginBottom: '0.5rem' }}>Langues parlées</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
            {g.languages.map((l, i) => (
              <span key={l} style={{ fontSize: '0.72rem', fontWeight: 600, padding: '0.2rem 0.65rem', borderRadius: 50, background: i === 0 ? '#FAF3E0' : '#E8DFC8', border: `1px solid ${i === 0 ? 'rgba(201,168,76,0.4)' : 'transparent'}`, color: i === 0 ? '#8B6914' : '#7A6D5A' }}>{l}</span>
            ))}
          </div>
        </div>

        {/* Services */}
        {g.services.length > 0 && (
          <div style={{ padding: '1rem 1.5rem 0' }}>
            <div style={{ fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#7A6D5A', marginBottom: '0.5rem' }}>Spécialités</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
              {g.services.map(s => (
                <span key={s} style={{ fontSize: '0.72rem', color: '#7A6D5A', background: '#E8DFC8', padding: '0.2rem 0.6rem', borderRadius: 6 }}>{s}</span>
              ))}
            </div>
          </div>
        )}

        {/* CTAs */}
        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <Link
            href={`/espace/checkout/${g.slug}`}
            style={{ display: 'block', textDecoration: 'none', background: '#1A1209', color: '#F0D897', textAlign: 'center', padding: '0.9rem', borderRadius: 50, fontSize: '0.9rem', fontWeight: 800, letterSpacing: '0.04em' }}
            onClick={onClose}
          >
            Réserver ce guide →
          </Link>
          <Link
            href={`/guides/${g.slug}`}
            style={{ display: 'block', textDecoration: 'none', background: 'white', border: '1.5px solid #E8DFC8', color: '#1A1209', textAlign: 'center', padding: '0.75rem', borderRadius: 50, fontSize: '0.82rem', fontWeight: 700, letterSpacing: '0.04em' }}
            onClick={onClose}
          >
            Voir le profil complet
          </Link>
        </div>
      </div>
    </>
  );
}

function GuideCard({ guide: g, official, onProfile, isLoading }: { guide: GuideData; official?: boolean; onProfile?: () => void; isLoading?: boolean }) {
  return (
    <div
      className={official ? 'guide-official-card' : ''}
      style={{ background: 'white', border: '1px solid #E8DFC8', borderRadius: 18, overflow: 'hidden', transition: 'transform 0.2s, box-shadow 0.2s, border-color 0.2s' }}
      onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.transform = 'translateY(-3px)'; el.style.boxShadow = '0 16px 48px rgba(26,18,9,0.1)'; el.style.borderColor = 'rgba(201,168,76,0.7)'; }}
      onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.transform = ''; el.style.boxShadow = official ? '0 8px 40px rgba(201,168,76,0.18)' : ''; el.style.borderColor = official ? '#C9A84C' : '#E8DFC8'; }}
      >
        {/* Banner */}
        <div className="guide-card-banner" style={{ background: g.gradient, position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 30% 50%, rgba(255,255,255,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', top: '50%', right: '1.25rem', transform: 'translateY(-50%)', width: official ? 64 : 52, height: official ? 64 : 52, borderRadius: '50%', border: official ? '3px solid #C9A84C' : '3px solid rgba(255,255,255,0.6)', overflow: 'hidden', zIndex: 1, boxShadow: official ? '0 0 0 3px #1A1209, 0 4px 16px rgba(201,168,76,0.4)' : '0 2px 12px rgba(0,0,0,0.3)' }}>
            <GuideAvatarSVG slug={g.slug} gradient={g.gradient} initials={g.initials} isWoman={g.slug === 'fatima-al-omari' || g.slug === 'samira-al-rashidi'} />
          </div>
          <div style={{ position: 'absolute', bottom: 8, right: 12, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: g.available ? '#27AE60' : '#aaa', border: '1.5px solid rgba(255,255,255,0.7)' }} />
            <span style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>{g.available ? 'Disponible' : 'Indisponible'}</span>
          </div>
          {official ? (
            <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <span style={{ background: '#1A1209', color: '#F0D897', fontSize: '0.52rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '0.2rem 0.55rem', borderRadius: 50, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>🛡 OFFICIEL SAFARUMA</span>
              <span style={{ background: '#065F46', color: 'white', fontSize: '0.52rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '0.2rem 0.55rem', borderRadius: 50 }}>GUIDE VÉRIFIÉ ✓</span>
              <span style={{ background: '#C9A84C', color: '#1A1209', fontSize: '0.52rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '0.2rem 0.55rem', borderRadius: 50 }}>RESPONSABLE TERRAIN</span>
              <span style={{ background: '#1E3A5F', color: 'white', fontSize: '0.52rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '0.2rem 0.55rem', borderRadius: 50 }}>FORMATEUR CERTIFIÉ</span>
            </div>
          ) : g.badge ? (
            <div style={{ position: 'absolute', top: 10, right: 10, background: g.badgeColor, color: '#fff', fontSize: '0.55rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '0.2rem 0.55rem', borderRadius: 50 }}>{g.badge}</div>
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

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginBottom: '0.7rem' }}>
            {g.languages.map((l, i) => (
              <span key={l} style={{ fontSize: '0.65rem', fontWeight: 600, padding: '0.15rem 0.55rem', borderRadius: 50, background: i === 0 ? '#FAF3E0' : '#E8DFC8', border: `1px solid ${i === 0 ? 'rgba(201,168,76,0.4)' : 'transparent'}`, color: i === 0 ? '#8B6914' : '#7A6D5A' }}>{l}</span>
            ))}
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginBottom: '0.9rem' }}>
            {g.services.map(s => (
              <span key={s} style={{ fontSize: '0.65rem', color: '#7A6D5A', background: '#E8DFC8', padding: '0.15rem 0.5rem', borderRadius: 5 }}>{s}</span>
            ))}
          </div>

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

          <div style={{ marginTop: '0.875rem', display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={onProfile}
              disabled={isLoading}
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', background: 'white', border: '1.5px solid #E8DFC8', color: '#1A1209', textAlign: 'center', padding: '0.65rem', borderRadius: 50, fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.04em', cursor: isLoading ? 'default' : 'pointer', fontFamily: 'inherit', transition: 'background 0.15s, transform 0.1s', transform: isLoading ? 'scale(0.96)' : 'scale(1)' }}
            >
              {isLoading ? (
                <span style={{ width: 14, height: 14, border: '2px solid #C9A84C', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
              ) : 'Voir le profil'}
            </button>
            <Link
              href={`/espace/checkout/${g.slug}`}
              style={{ flex: 1, display: 'block', textDecoration: 'none', background: '#1A1209', color: '#F0D897', textAlign: 'center', padding: '0.65rem', borderRadius: 50, fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.04em' }}
            >
              Choisir ce guide
            </Link>
          </div>
        </div>
    </div>
  );
}
