'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const ALL_GUIDES = [
  {
    slug: 'rachid-al-madani',
    initials: 'RA',
    gradient: 'linear-gradient(135deg, #C9A84C 0%, #8B6914 100%)',
    name: 'Cheikh Rachid Al-Madani',
    location: 'Makkah · Madinah · 14 ans',
    rating: '4.97',
    reviews: 214,
    langs: ['🇫🇷 Français', '🇸🇦 Arabe', '🇬🇧 English'],
    price: '280€',
  },
  {
    slug: 'fatima-al-omari',
    initials: 'FA',
    gradient: 'linear-gradient(135deg, #9FE1CB 0%, #1D9E75 100%)',
    name: 'Ustadha Fatima Al-Omari',
    location: 'Makkah · 8 ans',
    rating: '4.95',
    reviews: 178,
    langs: ['🇫🇷 Français', '🇲🇦 Darija'],
    price: '320€',
  },
  {
    slug: 'youssouf-konate',
    initials: 'YK',
    gradient: 'linear-gradient(135deg, #F7D774 0%, #E8A020 100%)',
    name: 'Cheikh Youssouf Konaté',
    location: 'Makkah · 6 ans',
    rating: '4.88',
    reviews: 94,
    langs: ['🇫🇷 Français', '🇸🇳 Wolof'],
    price: '240€',
  },
];

export default function FavorisPage() {
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('safaruma_favorites');
    if (stored) setFavorites(JSON.parse(stored));
    else {
      // Pre-populate with 2 guides for demo
      const demo = ['rachid-al-madani', 'fatima-al-omari'];
      setFavorites(demo);
      localStorage.setItem('safaruma_favorites', JSON.stringify(demo));
    }
  }, []);

  const toggle = (slug: string) => {
    setFavorites(prev => {
      const next = prev.includes(slug) ? prev.filter(s => s !== slug) : [...prev, slug];
      localStorage.setItem('safaruma_favorites', JSON.stringify(next));
      return next;
    });
  };

  const favGuides = ALL_GUIDES.filter(g => favorites.includes(g.slug));

  return (
    <>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: 700, color: '#1A1209', marginBottom: '0.35rem' }}>
          Mes Favoris
        </h1>
        <p style={{ fontSize: '0.875rem', color: '#7A6D5A' }}>
          {favGuides.length} guide{favGuides.length > 1 ? 's' : ''} sauvegardé{favGuides.length > 1 ? 's' : ''}
        </p>
      </div>

      {favGuides.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {favGuides.map(g => (
            <div key={g.slug} style={{ background: 'white', border: '1px solid #EDE8DC', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 8px rgba(26,18,9,0.04)', position: 'relative' }}>
              {/* Remove from favorites */}
              <button
                onClick={() => toggle(g.slug)}
                title="Retirer des favoris"
                style={{ position: 'absolute', top: 12, right: 12, zIndex: 2, width: 34, height: 34, borderRadius: '50%', background: 'white', border: '1px solid #EDE8DC', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 6px rgba(0,0,0,0.08)' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#DC2626" stroke="#DC2626" strokeWidth="1.5">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
              </button>

              {/* Avatar */}
              <div style={{ height: 120, background: g.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '3rem', fontWeight: 700, color: 'rgba(26,18,9,0.3)' }}>{g.initials}</span>
              </div>

              {/* Info */}
              <div style={{ padding: '1.25rem' }}>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#1A1209', marginBottom: '0.2rem' }}>{g.name}</div>
                <div style={{ fontSize: '0.78rem', color: '#7A6D5A', marginBottom: '0.5rem' }}>{g.location}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
                  <span style={{ color: '#C9A84C', fontSize: '0.8rem' }}>★★★★★</span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1A1209' }}>{g.rating}</span>
                  <span style={{ fontSize: '0.72rem', color: '#7A6D5A' }}>({g.reviews})</span>
                </div>
                <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                  {g.langs.map(l => (
                    <span key={l} style={{ background: '#FAF7F0', color: '#5A4E3A', fontSize: '0.65rem', padding: '0.15rem 0.5rem', borderRadius: 50, border: '1px solid #EDE8DC' }}>{l}</span>
                  ))}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.2rem', fontWeight: 700, color: '#1A1209' }}>{g.price}<span style={{ fontSize: '0.7rem', fontFamily: 'var(--font-manrope, sans-serif)', color: '#7A6D5A', fontWeight: 400 }}> /pers.</span></span>
                  <Link href={`/guides/${g.slug}`} style={{ padding: '0.45rem 1rem', borderRadius: 8, fontSize: '0.75rem', fontWeight: 700, background: '#1A1209', color: '#F0D897', textDecoration: 'none' }}>Voir profil</Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '5rem 2rem', background: 'white', borderRadius: 20, border: '1px solid #EDE8DC' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '1rem', animation: 'pulse 2s infinite' }}>🤍</div>
          <h2 style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.6rem', fontWeight: 700, color: '#1A1209', marginBottom: '0.5rem' }}>Aucun guide en favoris</h2>
          <p style={{ fontSize: '0.875rem', color: '#7A6D5A', marginBottom: '1.75rem', maxWidth: 340, margin: '0 auto 1.75rem' }}>
            Ajoutez des guides à vos favoris pour les retrouver facilement.
          </p>
          <Link href="/guides" style={{ padding: '0.75rem 2rem', borderRadius: 50, fontSize: '0.875rem', fontWeight: 700, background: '#1A1209', color: '#F0D897', textDecoration: 'none' }}>
            Explorer les guides →
          </Link>
        </div>
      )}
    </>
  );
}
