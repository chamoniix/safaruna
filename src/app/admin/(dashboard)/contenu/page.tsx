'use client';

import { useState } from 'react';

const FEATURED_GUIDES = [
  { id: 2, name: 'Youssef Malik', city: 'Lyon', featured: true },
  { id: 3, name: 'Omar Benali', city: 'Marseille', featured: true },
  { id: 4, name: 'Hassan Toure', city: 'Bordeaux', featured: false },
  { id: 7, name: 'Bilal Choudhry', city: 'Toulouse', featured: false },
];

const ARTICLES = [
  { title: 'Comment préparer son Omra ?', slug: 'preparer-omra', status: 'PUBLIÉ', updated: '2026-03-15' },
  { title: 'Les lieux incontournables de La Mecque', slug: 'lieux-mecque', status: 'PUBLIÉ', updated: '2026-03-10' },
  { title: 'Guide du pèlerin : Médine', slug: 'guide-medine', status: 'BROUILLON', updated: '2026-03-28' },
];

export default function AdminContenu() {
  const [banner, setBanner] = useState('Ramadan 2026 — Réservez votre guide dès maintenant');
  const [bannerActive, setBannerActive] = useState(true);
  const [featured, setFeatured] = useState(FEATURED_GUIDES);

  const toggleFeatured = (id: number) => {
    setFeatured(prev => prev.map(g => g.id === id ? { ...g, featured: !g.featured } : g));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* Banner */}
      <div style={{ background: '#1A1209', border: '1px solid rgba(201,168,76,0.15)', borderRadius: 16, padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#C9A84C' }}>
            Bandeau annonce
          </div>
          <button
            onClick={() => setBannerActive(!bannerActive)}
            style={{
              width: 40, height: 22, borderRadius: 11, border: 'none',
              background: bannerActive ? '#C9A84C' : 'rgba(255,255,255,0.15)',
              cursor: 'pointer', position: 'relative', transition: 'background 0.2s',
            }}
          >
            <div style={{
              position: 'absolute', top: 3, width: 16, height: 16, borderRadius: '50%', background: 'white',
              transition: 'left 0.2s', left: bannerActive ? 21 : 3,
            }} />
          </button>
        </div>
        <input
          value={banner}
          onChange={e => setBanner(e.target.value)}
          style={{
            width: '100%', padding: '0.75rem 1rem',
            background: 'rgba(255,255,255,0.06)', border: '1.5px solid rgba(255,255,255,0.1)',
            borderRadius: 8, color: 'white', fontSize: '0.875rem', fontFamily: 'inherit',
            outline: 'none', boxSizing: 'border-box',
          }}
        />
        <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem' }}>
          <button style={{
            padding: '0.55rem 1.25rem', borderRadius: 8, border: 'none',
            background: '#C9A84C', color: '#1A1209',
            fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
          }}>
            Sauvegarder
          </button>
        </div>
      </div>

      {/* Featured guides */}
      <div style={{ background: '#1A1209', border: '1px solid rgba(201,168,76,0.15)', borderRadius: 16, padding: '1.5rem' }}>
        <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#C9A84C', marginBottom: '1rem' }}>
          Guides mis en avant
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {featured.map(g => (
            <div key={g.id} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '0.75rem 1rem', borderRadius: 10,
              background: g.featured ? 'rgba(201,168,76,0.08)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${g.featured ? 'rgba(201,168,76,0.2)' : 'transparent'}`,
            }}>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'white' }}>{g.name}</div>
                <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)' }}>{g.city}</div>
              </div>
              <button
                onClick={() => toggleFeatured(g.id)}
                style={{
                  width: 40, height: 22, borderRadius: 11, border: 'none',
                  background: g.featured ? '#C9A84C' : 'rgba(255,255,255,0.15)',
                  cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0,
                }}
              >
                <div style={{
                  position: 'absolute', top: 3, width: 16, height: 16, borderRadius: '50%', background: 'white',
                  transition: 'left 0.2s', left: g.featured ? 21 : 3,
                }} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Blog articles */}
      <div style={{ background: '#1A1209', border: '1px solid rgba(201,168,76,0.15)', borderRadius: 16, padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#C9A84C' }}>
            Articles de blog
          </div>
          <button style={{
            padding: '0.4rem 1rem', borderRadius: 8, border: '1px solid rgba(201,168,76,0.3)',
            background: 'transparent', color: '#C9A84C',
            fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
          }}>
            + Nouvel article
          </button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
          {ARTICLES.map((a, i) => (
            <div key={a.slug} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '0.875rem 0',
              borderBottom: i < ARTICLES.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
            }}>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'white', marginBottom: '0.15rem' }}>{a.title}</div>
                <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.3)' }}>/{a.slug} · Modifié le {a.updated}</div>
              </div>
              <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                <span style={{
                  fontSize: '0.6rem', fontWeight: 700, padding: '0.25rem 0.55rem', borderRadius: 20,
                  background: a.status === 'PUBLIÉ' ? '#4CAF9A22' : 'rgba(255,255,255,0.07)',
                  color: a.status === 'PUBLIÉ' ? '#4CAF9A' : 'rgba(255,255,255,0.4)',
                }}>
                  {a.status}
                </span>
                <button style={{
                  padding: '0.3rem 0.65rem', borderRadius: 6, border: 'none',
                  background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.5)',
                  fontSize: '0.68rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                }}>
                  Modifier
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
