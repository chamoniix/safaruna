'use client';

import { useState } from 'react';

const FEATURED_GUIDES = [
  { id: 2, name: 'Youssef Malik',  city: 'Lyon',      featured: true },
  { id: 3, name: 'Omar Benali',    city: 'Marseille', featured: true },
  { id: 4, name: 'Hassan Toure',   city: 'Bordeaux',  featured: false },
  { id: 7, name: 'Bilal Choudhry', city: 'Toulouse',  featured: false },
];

const ARTICLES = [
  { title: 'Comment préparer son Omra ?',               slug: 'preparer-omra',  status: 'PUBLIÉ',    updated: '15/03/2026' },
  { title: 'Les lieux incontournables de La Mecque',     slug: 'lieux-mecque',   status: 'PUBLIÉ',    updated: '10/03/2026' },
  { title: 'Guide du pèlerin : Médine',                  slug: 'guide-medine',   status: 'BROUILLON', updated: '28/03/2026' },
];

const card: React.CSSProperties = {
  background: '#FFFFFF', borderRadius: 12, padding: '1.5rem',
  boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #E8DFC8',
};

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!value)} style={{
      width: 44, height: 24, borderRadius: 12, border: 'none', flexShrink: 0,
      background: value ? '#1A1209' : '#E8DFC8', cursor: 'pointer', position: 'relative',
    }}>
      <div style={{
        position: 'absolute', top: 4, width: 16, height: 16, borderRadius: '50%',
        background: value ? '#F0D897' : '#FFFFFF',
        transition: 'left 0.2s', left: value ? 24 : 4,
      }} />
    </button>
  );
}

export default function AdminContenu() {
  const [banner, setBanner]         = useState('Ramadan 2026 — Réservez votre guide dès maintenant');
  const [bannerActive, setBannerActive] = useState(true);
  const [featured, setFeatured]     = useState(FEATURED_GUIDES);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* Banner */}
      <div style={card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.1rem', fontWeight: 700, color: '#1A1209' }}>Bandeau annonce</div>
            <div style={{ fontSize: '0.72rem', color: '#7A6D5A', marginTop: 2 }}>Affiché en haut de toutes les pages publiques</div>
          </div>
          <Toggle value={bannerActive} onChange={setBannerActive} />
        </div>
        <input
          value={banner} onChange={e => setBanner(e.target.value)}
          style={{ width: '100%', padding: '0.75rem 1rem', boxSizing: 'border-box', background: '#F8F6F2', border: '1.5px solid #E8DFC8', borderRadius: 8, color: '#1A1209', fontSize: '0.875rem', fontFamily: 'inherit', outline: 'none' }}
        />
        <div style={{ marginTop: '0.875rem' }}>
          <button style={{ padding: '0.55rem 1.5rem', borderRadius: 50, border: 'none', background: '#1A1209', color: '#F0D897', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
            Sauvegarder
          </button>
        </div>
      </div>

      {/* Featured guides */}
      <div style={card}>
        <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.1rem', fontWeight: 700, color: '#1A1209', marginBottom: '1rem' }}>
          Guides mis en avant
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {featured.map(g => (
            <div key={g.id} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '0.875rem 1rem', borderRadius: 8,
              background: g.featured ? '#FEF9EC' : '#F8F6F2',
              border: `1px solid ${g.featured ? '#E8D08A' : '#E8DFC8'}`,
            }}>
              <div>
                <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#1A1209' }}>{g.name}</div>
                <div style={{ fontSize: '0.72rem', color: '#7A6D5A', marginTop: 2 }}>{g.city}</div>
              </div>
              <Toggle
                value={g.featured}
                onChange={v => setFeatured(prev => prev.map(x => x.id === g.id ? { ...x, featured: v } : x))}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Blog */}
      <div style={card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.1rem', fontWeight: 700, color: '#1A1209' }}>Articles de blog</div>
          <button style={{ padding: '0.45rem 1rem', borderRadius: 50, border: '1px solid #1A1209', background: 'transparent', color: '#1A1209', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
            + Nouvel article
          </button>
        </div>
        {ARTICLES.map((a, i) => (
          <div key={a.slug} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem',
            padding: '0.875rem 0',
            borderBottom: i < ARTICLES.length - 1 ? '1px solid #F0EBE0' : 'none',
          }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#1A1209', marginBottom: '0.15rem' }}>{a.title}</div>
              <div style={{ fontSize: '0.68rem', color: '#7A6D5A' }}>/{a.slug} · Modifié le {a.updated}</div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: '0.62rem', fontWeight: 700, padding: '0.25rem 0.55rem', borderRadius: 20, background: a.status === 'PUBLIÉ' ? '#DCFCE7' : '#F5F3EF', color: a.status === 'PUBLIÉ' ? '#16A34A' : '#7A6D5A' }}>
                {a.status}
              </span>
              <button style={{ padding: '0.3rem 0.7rem', borderRadius: 6, border: '1px solid #E8DFC8', background: '#FFFFFF', color: '#7A6D5A', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                Modifier
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
