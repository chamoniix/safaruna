'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const GUIDES_DATA = [
  { slug: 'naim-laamari', gender: 'homme', zones: ['makkah', 'madinah'], name: 'Naïm LAAMARI', title: 'Guide Officiel SAFARUMA', initials: 'NL', location: 'Makkah · Madinah', experience: 8, rating: 5.0, reviews: 5822, languages: ['🇫🇷 Français', '🇸🇦 Arabe', '🇬🇧 English', '🇲🇦 Darija (Maroc)'], services: ['Rituels Omra', 'Histoire islamique', 'PMR'], price: 150, available: true, isOfficial: true, gradient: 'linear-gradient(135deg, #1A1209, #2D1F08)', avatarGradient: 'linear-gradient(135deg, #F0D897, #C9A84C)', badge: 'OFFICIEL', badgeColor: '#C9A84C', bio: 'Responsable Terrain SAFARUMA depuis 8 ans. Diplômé en sciences islamiques, il certifie personnellement tous les guides SAFARUMA à Makkah. Expert des rituels, de l\'histoire et de l\'accompagnement PMR.' },
  { slug: 'rachid-al-madani', gender: 'homme', zones: ['makkah', 'madinah'], name: 'Rachid Al-Madani', title: 'Cheikh · Spécialiste Sîra', initials: 'RA', location: 'Makkah · Madinah', experience: 14, rating: 4.97, reviews: 214, languages: ['🇫🇷 Français', '🇸🇦 Arabe', '🇬🇧 English'], services: ['Omra complète', 'Jabal Uhud', 'Train Haramain', 'Voiture 7pl'], price: 280, available: true, isOfficial: false, gradient: 'linear-gradient(135deg, #2D1F08, #1A1209)', avatarGradient: 'linear-gradient(135deg, #F0D897, #C9A84C)', badge: 'Top Guide', badgeColor: '#C9A84C', bio: 'Cheikh et spécialiste de la Sîra du Prophète ﷺ. 14 ans d\'expérience, 2400+ pèlerins accompagnés. Il relie chaque lieu saint à son histoire avec une profondeur rare.' },
  { slug: 'fatima-al-omari', gender: 'femme', zones: ['makkah', 'madinah'], name: 'Fatima Al-Omari', title: 'Guide femme · Familles', initials: 'FA', location: 'Makkah', experience: 8, rating: 4.95, reviews: 178, languages: ['🇫🇷 Français', '🇲🇦 Darija (Maroc)'], services: ['Guide femme', 'Rituels Omra', 'Van 9pl', 'Familles'], price: 320, available: true, isOfficial: false, gradient: 'linear-gradient(135deg, #082818, #1D5C3A)', avatarGradient: 'linear-gradient(135deg, #9FE1CB, #1D9E75)', badge: 'Guide femme', badgeColor: '#1D5C3A', bio: 'Spécialisée dans l\'accompagnement des femmes et des familles. Ustadha certifiée, elle adapte son rythme à chaque groupe avec douceur et profondeur spirituelle.' },
  { slug: 'youssouf-konate', gender: 'homme', zones: ['makkah'], name: 'Youssouf Konaté', title: "Spécialiste Afrique de l'Ouest", initials: 'YK', location: 'Makkah', experience: 6, rating: 4.92, reviews: 94, languages: ['🇫🇷 Français', '🇸🇳 Wolof', '🇬🇧 English'], services: ['Omra complète', 'Hira', 'Voiture incluse'], price: 240, available: true, isOfficial: false, gradient: 'linear-gradient(135deg, #1A2810, #2D4A1A)', avatarGradient: 'linear-gradient(135deg, #D4E8A0, #5A8A20)', badge: null, badgeColor: '', bio: 'Guide francophone spécialisé pour les communautés d\'Afrique de l\'Ouest. Parle Wolof et comprend les traditions islamiques ouest-africaines.' },
  { slug: 'abdullah-ben-yusuf', gender: 'homme', zones: ['madinah'], name: 'Abdullah Ben Yusuf', title: 'Diplômé · Université de Madinah', initials: 'AB', location: 'Madinah', experience: 10, rating: 4.98, reviews: 147, languages: ['🇫🇷 Français', '🇸🇦 Arabe'], services: ['Rawdah', 'Quba', 'Ohoud', 'Ziyara Madinah'], price: 300, available: false, isOfficial: false, gradient: 'linear-gradient(135deg, #0A1830, #1A4A8A)', avatarGradient: 'linear-gradient(135deg, #A0C4F0, #1A6AC9)', badge: 'Diplômé', badgeColor: '#1A4A8A', bio: 'Diplômé de l\'Université Islamique de Madinah. Expert des ziyarat de Madinah, il vous fera vivre la Rawdah, Quba et les sites d\'Uhud avec une connaissance sans égale.' },
  { slug: 'samira-al-rashidi', gender: 'femme', zones: ['madinah'], name: 'Samira Al-Rashidi', title: 'Spécialiste PMR · Madinah', initials: 'SR', location: 'Madinah', experience: 7, rating: 4.93, reviews: 76, languages: ['🇫🇷 Français', '🇹🇳 Tunisien'], services: ['PMR', 'Fauteuil roulant', 'Hôtel adapté', 'Seniors'], price: 380, available: true, isOfficial: false, gradient: 'linear-gradient(135deg, #28081A, #7A2D8A)', avatarGradient: 'linear-gradient(135deg, #F0A8C0, #A81D5C)', badge: 'PMR', badgeColor: '#7A2D8A', bio: 'Spécialisée dans l\'accompagnement des personnes à mobilité réduite et des seniors. Connaissance parfaite des accès adaptés à Madinah.' },
];

type Guide = typeof GUIDES_DATA[0];

function GuideAvatar({ guide, size = 48 }: { guide: Guide; size?: number }) {
  if (guide.slug === 'naim-laamari') {
    return (
      <div style={{ width: size, height: size, borderRadius: '50%', overflow: 'hidden', position: 'relative', flexShrink: 0 }}>
        <Image src="/guide-avatar.png" alt={guide.name} fill style={{ objectFit: 'cover' }} />
      </div>
    );
  }
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: guide.avatarGradient, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-cormorant, serif)', fontWeight: 700, color: '#1A1209', fontSize: size * 0.35, flexShrink: 0 }}>
      {guide.initials}
    </div>
  );
}

function TunnelContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const groupSize = parseInt(searchParams.get('groupSize') || '2');
  const lang = searchParams.get('lang') || '';
  const gender = searchParams.get('gender') || '';
  const arrivalDate = searchParams.get('arrivalDate') || '';
  const departureDate = searchParams.get('departureDate') || '';

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedMadinah, setSelectedMadinah] = useState<Guide | null>(null);
  const [selectedMakkah, setSelectedMakkah] = useState<Guide | null>(null);
  const [drawerGuide, setDrawerGuide] = useState<Guide | null>(null);
  const [transport, setTransport] = useState<'train' | 'taxi' | 'guide_car'>('train');

  const trainCost = groupSize * 80 * 2;
  const taxiCost = Math.ceil(groupSize / 4) * 120 * 2;

  const filterGuide = (g: Guide) => {
    if (gender === 'homme' && g.gender !== 'homme') return false;
    if (gender === 'femme' && g.gender !== 'femme') return false;
    if (lang && !g.languages.some(l => l.toLowerCase().includes(lang.toLowerCase()) || lang.toLowerCase().includes(l.toLowerCase()))) return false;
    return true;
  };

  const madinahGuides = GUIDES_DATA.filter(g => g.zones.includes('madinah') && filterGuide(g));
  const makkahGuides = GUIDES_DATA.filter(g => g.zones.includes('makkah') && filterGuide(g));

  const totalPrice = () => {
    let total = 0;
    if (selectedMadinah) total += selectedMadinah.price * groupSize;
    if (selectedMakkah) total += selectedMakkah.price * groupSize;
    if (transport === 'train') total += trainCost;
    if (transport === 'taxi') total += taxiCost;
    return total;
  };

  const handleCheckout = () => {
    if (!selectedMadinah || !selectedMakkah) return;
    router.push(
      `/espace/checkout/dual?guide_madinah=${selectedMadinah.slug}&guide_makkah=${selectedMakkah.slug}&personnes=${groupSize}&transport=${transport}&arrivee=${arrivalDate}&depart=${departureDate}`
    );
  };

  const STEPS = [
    { num: 1, label: 'Guide Madinah' },
    { num: 2, label: 'Guide Makkah' },
    { num: 3, label: 'Transport & Récap' },
  ];

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        .tunnel-card { transition: border-color 0.15s, box-shadow 0.15s; cursor: pointer; }
        .tunnel-card:hover { border-color: #C9A84C !important; box-shadow: 0 4px 20px rgba(26,18,9,0.08) !important; }
        .tunnel-card.selected { border-color: #C9A84C !important; box-shadow: 0 0 0 3px rgba(201,168,76,0.2) !important; }
        .drawer-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 300; backdrop-filter: blur(4px); }
        .drawer { position: fixed; right: 0; top: 0; bottom: 0; width: min(440px, 100vw); background: white; z-index: 301; overflow-y: auto; box-shadow: -8px 0 40px rgba(0,0,0,0.15); animation: slideInRight 0.25s ease; }
        @keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
        .tunnel-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; }
        @media (max-width: 600px) { .tunnel-grid { grid-template-columns: 1fr; } .drawer { width: 100vw; } }
        .transport-opt { transition: border-color 0.15s, background 0.15s; cursor: pointer; }
        .transport-opt:hover { border-color: #C9A84C !important; }
        .transport-opt.selected { border-color: #C9A84C !important; background: #FAF3E0 !important; }
      `}} />

      {/* Progress bar */}
      <div style={{ background: 'white', borderBottom: '1px solid #EDE8DC', padding: '1rem 1.5rem', position: 'sticky', top: 58, zIndex: 50 }}>
        <div style={{ maxWidth: 860, margin: '0 auto', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {STEPS.map((s, i) => (
            <div key={s.num} style={{ display: 'flex', alignItems: 'center', flex: s.num < 3 ? 1 : undefined }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: step > s.num ? '#1D5C3A' : step === s.num ? '#1A1209' : '#F0EBD8', color: step > s.num ? 'white' : step === s.num ? '#F0D897' : '#7A6D5A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 800, flexShrink: 0 }}>
                  {step > s.num ? '✓' : s.num}
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: step === s.num ? 700 : 500, color: step === s.num ? '#1A1209' : '#7A6D5A', whiteSpace: 'nowrap' }}>{s.label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div style={{ flex: 1, height: 2, background: step > s.num ? '#1D5C3A' : '#F0EBD8', margin: '0 0.5rem', minWidth: 20 }} />
              )}
            </div>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 860, margin: '0 auto', padding: '2rem 1.5rem 4rem' }}>

        {/* ── STEP 1 — Guide Madinah ── */}
        {step === 1 && (
          <div>
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#1D5C3A', marginBottom: '0.4rem' }}>Étape 1 sur 3</div>
              <h1 style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: 'clamp(1.6rem, 4vw, 2.2rem)', fontWeight: 600, color: '#1A1209', marginBottom: '0.4rem' }}>
                Choisissez votre guide pour <em style={{ color: '#1D5C3A' }}>Madinah</em>
              </h1>
              <p style={{ fontSize: '0.85rem', color: '#7A6D5A', lineHeight: 1.6 }}>
                Rawdah, Masjid Quba, Jabal Uhud — votre guide vous accompagnera sur les lieux saints de Madinah.
              </p>
            </div>

            <div className="tunnel-grid">
              {madinahGuides.map(g => (
                <div key={g.slug} className={`tunnel-card${selectedMadinah?.slug === g.slug ? ' selected' : ''}`} style={{ background: 'white', border: '1.5px solid #EDE8DC', borderRadius: 16, overflow: 'hidden' }}>
                  {/* Banner */}
                  <div style={{ height: 80, background: g.gradient, position: 'relative' }}>
                    {g.badge && <span style={{ position: 'absolute', top: 8, right: 8, background: g.badgeColor, color: g.badgeColor === '#C9A84C' ? '#1A1209' : 'white', fontSize: '0.55rem', fontWeight: 800, padding: '0.15rem 0.5rem', borderRadius: 50, textTransform: 'uppercase' }}>{g.badge}</span>}
                    <div style={{ position: 'absolute', bottom: -18, left: 14 }}>
                      <GuideAvatar guide={g} size={40} />
                    </div>
                    {!g.available && <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ color: 'white', fontSize: '0.72rem', fontWeight: 700, background: 'rgba(0,0,0,0.6)', padding: '0.25rem 0.75rem', borderRadius: 50 }}>Indisponible</span></div>}
                  </div>
                  <div style={{ padding: '1.25rem 1rem 1rem' }}>
                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1A1209', marginBottom: '0.15rem' }}>{g.name}</div>
                    <div style={{ fontSize: '0.7rem', color: '#7A6D5A', fontStyle: 'italic', marginBottom: '0.5rem' }}>{g.title}</div>
                    <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap', marginBottom: '0.6rem' }}>
                      {g.languages.slice(0, 3).map(l => (
                        <span key={l} style={{ fontSize: '0.6rem', background: '#F5F0E8', color: '#7A6D5A', padding: '0.1rem 0.4rem', borderRadius: 20 }}>{l}</span>
                      ))}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                      <div>
                        <span style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.2rem', fontWeight: 700, color: '#1A1209' }}>{g.price}€</span>
                        <span style={{ fontSize: '0.62rem', color: '#7A6D5A' }}>/pers</span>
                      </div>
                      <span style={{ fontSize: '0.68rem', color: '#C9A84C', fontWeight: 700 }}>★ {g.rating} ({g.reviews})</span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => setDrawerGuide(g)} style={{ flex: 1, padding: '0.5rem', borderRadius: 8, border: '1px solid #EDE8DC', background: 'white', fontSize: '0.72rem', fontWeight: 600, color: '#1A1209', cursor: 'pointer', fontFamily: 'inherit' }}>
                        Aperçu
                      </button>
                      <button
                        onClick={() => g.available && setSelectedMadinah(g)}
                        disabled={!g.available}
                        style={{ flex: 2, padding: '0.5rem', borderRadius: 8, border: 'none', background: selectedMadinah?.slug === g.slug ? '#1D5C3A' : g.available ? '#1A1209' : '#E8DFC8', color: selectedMadinah?.slug === g.slug ? 'white' : g.available ? '#F0D897' : '#7A6D5A', fontSize: '0.72rem', fontWeight: 700, cursor: g.available ? 'pointer' : 'not-allowed', fontFamily: 'inherit' }}
                      >
                        {selectedMadinah?.slug === g.slug ? '✓ Sélectionné' : 'Choisir'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {selectedMadinah && (
              <div style={{ marginTop: '1.5rem', padding: '1rem 1.25rem', background: '#E8F5EE', borderRadius: 12, border: '1px solid rgba(29,92,58,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <GuideAvatar guide={selectedMadinah} size={36} />
                  <div>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#1D5C3A', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Guide Madinah sélectionné</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1A1209' }}>{selectedMadinah.name}</div>
                  </div>
                </div>
                <button onClick={() => setStep(2)} style={{ background: '#1A1209', color: '#F0D897', border: 'none', borderRadius: 50, padding: '0.7rem 1.75rem', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
                  Choisir guide Makkah →
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── STEP 2 — Guide Makkah ── */}
        {step === 2 && (
          <div>
            {/* Bandeau guide Madinah confirmé */}
            <div style={{ padding: '0.75rem 1rem', background: '#1A1209', borderRadius: 12, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#1D9E75', flexShrink: 0 }} />
              <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)' }}>Guide Madinah :</span>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#F0D897' }}>{selectedMadinah?.name}</span>
              <button onClick={() => setStep(1)} style={{ marginLeft: 'auto', background: 'none', border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.5)', borderRadius: 50, padding: '0.2rem 0.65rem', fontSize: '0.65rem', cursor: 'pointer', fontFamily: 'inherit' }}>Modifier</button>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#8B6914', marginBottom: '0.4rem' }}>Étape 2 sur 3</div>
              <h1 style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: 'clamp(1.6rem, 4vw, 2.2rem)', fontWeight: 600, color: '#1A1209', marginBottom: '0.4rem' }}>
                Choisissez votre guide pour <em style={{ color: '#C9A84C' }}>Makkah</em>
              </h1>
              <p style={{ fontSize: '0.85rem', color: '#7A6D5A', lineHeight: 1.6 }}>
                Tawaf, Sa&apos;i, Jabal Al-Nour — votre guide vous accompagnera sur les lieux saints de Makkah.
              </p>
            </div>

            <div className="tunnel-grid">
              {makkahGuides.map(g => (
                <div key={g.slug} className={`tunnel-card${selectedMakkah?.slug === g.slug ? ' selected' : ''}`} style={{ background: 'white', border: '1.5px solid #EDE8DC', borderRadius: 16, overflow: 'hidden' }}>
                  <div style={{ height: 80, background: g.gradient, position: 'relative' }}>
                    {g.badge && <span style={{ position: 'absolute', top: 8, right: 8, background: g.badgeColor, color: g.badgeColor === '#C9A84C' ? '#1A1209' : 'white', fontSize: '0.55rem', fontWeight: 800, padding: '0.15rem 0.5rem', borderRadius: 50, textTransform: 'uppercase' }}>{g.badge}</span>}
                    <div style={{ position: 'absolute', bottom: -18, left: 14 }}>
                      <GuideAvatar guide={g} size={40} />
                    </div>
                    {!g.available && <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ color: 'white', fontSize: '0.72rem', fontWeight: 700, background: 'rgba(0,0,0,0.6)', padding: '0.25rem 0.75rem', borderRadius: 50 }}>Indisponible</span></div>}
                  </div>
                  <div style={{ padding: '1.25rem 1rem 1rem' }}>
                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1A1209', marginBottom: '0.15rem' }}>{g.name}</div>
                    <div style={{ fontSize: '0.7rem', color: '#7A6D5A', fontStyle: 'italic', marginBottom: '0.5rem' }}>{g.title}</div>
                    <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap', marginBottom: '0.6rem' }}>
                      {g.languages.slice(0, 3).map(l => (
                        <span key={l} style={{ fontSize: '0.6rem', background: '#F5F0E8', color: '#7A6D5A', padding: '0.1rem 0.4rem', borderRadius: 20 }}>{l}</span>
                      ))}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                      <div>
                        <span style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.2rem', fontWeight: 700, color: '#1A1209' }}>{g.price}€</span>
                        <span style={{ fontSize: '0.62rem', color: '#7A6D5A' }}>/pers</span>
                      </div>
                      <span style={{ fontSize: '0.68rem', color: '#C9A84C', fontWeight: 700 }}>★ {g.rating} ({g.reviews})</span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => setDrawerGuide(g)} style={{ flex: 1, padding: '0.5rem', borderRadius: 8, border: '1px solid #EDE8DC', background: 'white', fontSize: '0.72rem', fontWeight: 600, color: '#1A1209', cursor: 'pointer', fontFamily: 'inherit' }}>
                        Aperçu
                      </button>
                      <button
                        onClick={() => g.available && setSelectedMakkah(g)}
                        disabled={!g.available}
                        style={{ flex: 2, padding: '0.5rem', borderRadius: 8, border: 'none', background: selectedMakkah?.slug === g.slug ? '#C9A84C' : g.available ? '#1A1209' : '#E8DFC8', color: selectedMakkah?.slug === g.slug ? '#1A1209' : g.available ? '#F0D897' : '#7A6D5A', fontSize: '0.72rem', fontWeight: 700, cursor: g.available ? 'pointer' : 'not-allowed', fontFamily: 'inherit' }}
                      >
                        {selectedMakkah?.slug === g.slug ? '✓ Sélectionné' : 'Choisir'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {selectedMakkah && (
              <div style={{ marginTop: '1.5rem', padding: '1rem 1.25rem', background: '#FAF3E0', borderRadius: 12, border: '1px solid rgba(201,168,76,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <GuideAvatar guide={selectedMakkah} size={36} />
                  <div>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#8B6914', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Guide Makkah sélectionné</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1A1209' }}>{selectedMakkah.name}</div>
                  </div>
                </div>
                <button onClick={() => setStep(3)} style={{ background: '#C9A84C', color: '#1A1209', border: 'none', borderRadius: 50, padding: '0.7rem 1.75rem', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
                  Choisir le transport →
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── STEP 3 — Transport + Récapitulatif ── */}
        {step === 3 && selectedMadinah && selectedMakkah && (
          <div>
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#7A6D5A', marginBottom: '0.4rem' }}>Étape 3 sur 3</div>
              <h1 style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: 'clamp(1.6rem, 4vw, 2.2rem)', fontWeight: 600, color: '#1A1209', marginBottom: '0.4rem' }}>
                Transport & Récapitulatif
              </h1>
            </div>

            {/* Guides récap */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              {[{ guide: selectedMadinah, city: 'Madinah', color: '#1D5C3A', bg: '#E8F5EE' }, { guide: selectedMakkah, city: 'Makkah', color: '#8B6914', bg: '#FAF3E0' }].map(({ guide, city, color, bg }) => (
                <div key={city} style={{ background: bg, border: `1px solid ${color}30`, borderRadius: 12, padding: '1rem' }}>
                  <div style={{ fontSize: '0.6rem', fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.6rem' }}>Guide {city}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
                    <GuideAvatar guide={guide} size={36} />
                    <div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1A1209' }}>{guide.name}</div>
                      <div style={{ fontSize: '0.65rem', color: '#7A6D5A' }}>★ {guide.rating}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#1A1209' }}>{guide.price * groupSize}€ <span style={{ fontSize: '0.65rem', fontWeight: 400, color: '#7A6D5A' }}>({groupSize} pers.)</span></div>
                </div>
              ))}
            </div>

            {/* Transport */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#7A6D5A', marginBottom: '0.75rem' }}>Transport Madinah → Makkah</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {[
                  { id: 'train' as const, icon: '🚄', label: 'Train Haramain', desc: 'Rapide et confortable · ~2h', price: trainCost },
                  { id: 'taxi' as const, icon: '🚕', label: 'Taxi privé', desc: 'Porte à porte · ~4h', price: taxiCost },
                  { id: 'guide_car' as const, icon: '🚗', label: 'Voiture du guide Madinah', desc: 'Si disponible · À confirmer', price: 0 },
                ].map(opt => (
                  <div key={opt.id} className={`transport-opt${transport === opt.id ? ' selected' : ''}`} onClick={() => setTransport(opt.id)} style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', padding: '0.875rem 1rem', border: '1.5px solid #EDE8DC', borderRadius: 12, background: 'white' }}>
                    <span style={{ fontSize: '1.25rem' }}>{opt.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1A1209' }}>{opt.label}</div>
                      <div style={{ fontSize: '0.7rem', color: '#7A6D5A' }}>{opt.desc}</div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: opt.price > 0 ? '#1A1209' : '#1D5C3A' }}>
                        {opt.price > 0 ? `+${opt.price}€` : 'Inclus'}
                      </div>
                      <div style={{ fontSize: '0.62rem', color: '#7A6D5A' }}>
                        {opt.price > 0 ? `${groupSize} pers. A/R` : 'Sur demande'}
                      </div>
                    </div>
                    <div style={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${transport === opt.id ? '#C9A84C' : '#E8DFC8'}`, background: transport === opt.id ? '#C9A84C' : 'transparent', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {transport === opt.id && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#1A1209' }} />}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div style={{ background: '#1A1209', borderRadius: 16, padding: '1.25rem 1.5rem', marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(240,216,151,0.5)', marginBottom: '0.75rem' }}>Total estimé</div>
              {[
                { label: `Guide Madinah × ${groupSize}`, value: selectedMadinah.price * groupSize },
                { label: `Guide Makkah × ${groupSize}`, value: selectedMakkah.price * groupSize },
                { label: `Transport (${transport === 'train' ? 'Train' : transport === 'taxi' ? 'Taxi' : 'Guide'})`, value: transport === 'train' ? trainCost : transport === 'taxi' ? taxiCost : 0 },
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'rgba(255,255,255,0.55)', marginBottom: '0.35rem' }}>
                  <span>{row.label}</span>
                  <span style={{ fontWeight: 600 }}>{row.value > 0 ? `${row.value}€` : 'Inclus'}</span>
                </div>
              ))}
              <div style={{ height: 1, background: 'rgba(255,255,255,0.1)', margin: '0.75rem 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)' }}>Total</span>
                <span style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '2rem', fontWeight: 700, color: '#F0D897' }}>{totalPrice().toLocaleString('fr-FR')} €</span>
              </div>
            </div>

            <button onClick={handleCheckout} style={{ width: '100%', padding: '0.9rem', background: '#C9A84C', color: '#1A1209', border: 'none', borderRadius: 50, fontWeight: 800, fontSize: '0.95rem', cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '0.04em' }}>
              Confirmer et réserver →
            </button>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', marginTop: '0.875rem', flexWrap: 'wrap' }}>
              <button onClick={() => setStep(2)} style={{ background: 'none', border: 'none', color: '#7A6D5A', fontSize: '0.75rem', cursor: 'pointer', fontFamily: 'inherit', textDecoration: 'underline' }}>← Modifier guide Makkah</button>
              <button onClick={() => setStep(1)} style={{ background: 'none', border: 'none', color: '#7A6D5A', fontSize: '0.75rem', cursor: 'pointer', fontFamily: 'inherit', textDecoration: 'underline' }}>← Modifier guide Madinah</button>
            </div>
          </div>
        )}
      </div>

      {/* ── DRAWER aperçu guide ── */}
      {drawerGuide && (
        <>
          <div className="drawer-overlay" onClick={() => setDrawerGuide(null)} />
          <div className="drawer">
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #EDE8DC', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.1rem', fontWeight: 700, color: '#1A1209' }}>Aperçu du guide</span>
              <button onClick={() => setDrawerGuide(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7A6D5A', fontSize: '1.2rem', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
            </div>
            <div style={{ height: 120, background: drawerGuide.gradient, position: 'relative' }}>
              <div style={{ position: 'absolute', bottom: -28, left: '1.5rem' }}>
                <GuideAvatar guide={drawerGuide} size={60} />
              </div>
            </div>
            <div style={{ padding: '2.5rem 1.5rem 1.5rem' }}>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1A1209', marginBottom: '0.2rem' }}>{drawerGuide.name}</div>
              <div style={{ fontSize: '0.78rem', color: '#7A6D5A', fontStyle: 'italic', marginBottom: '0.75rem' }}>{drawerGuide.title}</div>
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.4rem', fontWeight: 700, color: '#1A1209' }}>{drawerGuide.experience}</div>
                  <div style={{ fontSize: '0.62rem', color: '#7A6D5A' }}>ans exp.</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.4rem', fontWeight: 700, color: '#C9A84C' }}>{drawerGuide.rating}</div>
                  <div style={{ fontSize: '0.62rem', color: '#7A6D5A' }}>note ★</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.4rem', fontWeight: 700, color: '#1A1209' }}>{drawerGuide.reviews}</div>
                  <div style={{ fontSize: '0.62rem', color: '#7A6D5A' }}>avis</div>
                </div>
              </div>
              <p style={{ fontSize: '0.85rem', color: '#4A3728', lineHeight: 1.7, marginBottom: '1rem' }}>{drawerGuide.bio}</p>
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#7A6D5A', marginBottom: '0.4rem' }}>Langues</div>
                <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                  {drawerGuide.languages.map(l => <span key={l} style={{ fontSize: '0.72rem', background: '#FAF3E0', color: '#8B6914', border: '1px solid rgba(201,168,76,0.3)', padding: '0.2rem 0.6rem', borderRadius: 20 }}>{l}</span>)}
                </div>
              </div>
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#7A6D5A', marginBottom: '0.4rem' }}>Services</div>
                <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                  {drawerGuide.services.map(s => <span key={s} style={{ fontSize: '0.72rem', background: '#F5F0E8', color: '#7A6D5A', padding: '0.2rem 0.6rem', borderRadius: 6 }}>{s}</span>)}
                </div>
              </div>
              <div style={{ borderTop: '1px solid #EDE8DC', paddingTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <span style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.5rem', fontWeight: 700, color: '#1A1209' }}>{drawerGuide.price}€</span>
                  <span style={{ fontSize: '0.72rem', color: '#7A6D5A' }}>/pers</span>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <Link href={`/guides/${drawerGuide.slug}`} target="_blank" style={{ padding: '0.55rem 1rem', border: '1px solid #EDE8DC', borderRadius: 50, fontSize: '0.75rem', fontWeight: 600, color: '#1A1209', textDecoration: 'none' }}>
                    Fiche complète ↗
                  </Link>
                  <button
                    onClick={() => {
                      if (step === 1) setSelectedMadinah(drawerGuide);
                      else setSelectedMakkah(drawerGuide);
                      setDrawerGuide(null);
                    }}
                    disabled={!drawerGuide.available}
                    style={{ padding: '0.55rem 1.25rem', border: 'none', borderRadius: 50, background: drawerGuide.available ? '#1A1209' : '#E8DFC8', color: drawerGuide.available ? '#F0D897' : '#7A6D5A', fontSize: '0.75rem', fontWeight: 700, cursor: drawerGuide.available ? 'pointer' : 'not-allowed', fontFamily: 'inherit' }}
                  >
                    {drawerGuide.available ? 'Choisir ce guide' : 'Indisponible'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default function TunnelPage() {
  return (
    <>
      <Navbar />
      <div style={{ paddingTop: 58, minHeight: '100vh', background: '#FAF7F0', fontFamily: 'var(--font-manrope, sans-serif)' }}>
        <Suspense fallback={<div style={{ padding: '4rem', textAlign: 'center', color: '#7A6D5A' }}>Chargement...</div>}>
          <TunnelContent />
        </Suspense>
      </div>
      <Footer />
    </>
  );
}
