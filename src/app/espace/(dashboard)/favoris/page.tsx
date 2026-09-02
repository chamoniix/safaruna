'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

type Guide = { slug: string; name: string; city: string | null; experienceYears: number | null; rating: number | null; reviewCount: number; languages: string[]; image: string | null }

export default function FavorisPage() {
  const [favoriteSlugs, setFavoriteSlugs] = useState<string[]>([])
  const [guides, setGuides] = useState<Guide[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let stored: string[] = []
    try { stored = JSON.parse(localStorage.getItem('safaruma_favorites') || '[]') } catch { stored = [] }
    Promise.resolve(stored).then(setFavoriteSlugs)
    fetch('/api/guides/available', { cache: 'no-store' })
      .then(response => response.json())
      .then(data => setGuides(data.guides || []))
      .finally(() => setLoading(false))
  }, [])

  function remove(slug: string) {
    setFavoriteSlugs(current => {
      const next = current.filter(item => item !== slug)
      localStorage.setItem('safaruma_favorites', JSON.stringify(next))
      return next
    })
  }

  const favorites = guides.filter(guide => favoriteSlugs.includes(guide.slug))
  return <div style={{ display: 'grid', gap: 20 }}>
    <header><h1 style={{ margin: 0, color: '#1A1209', fontSize: 30 }}>Mes favoris</h1><p style={{ color: '#7A6D5A' }}>{favorites.length} guide(s) sauvegardé(s)</p></header>
    {loading && <div style={{ padding: 36, textAlign: 'center', color: '#7A6D5A' }}>Chargement des guides…</div>}
    {!loading && favorites.length === 0 && <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'white', borderRadius: 18, border: '1px solid #EDE8DC' }}><div style={{ fontSize: 44 }}>🤍</div><h2 style={{ color: '#1A1209' }}>Aucun guide en favoris</h2><p style={{ color: '#7A6D5A' }}>Ajoutez des profils réels depuis la liste des guides.</p><Link href="/guides" style={{ display: 'inline-block', padding: '11px 20px', borderRadius: 999, background: '#1A1209', color: '#F0D897', textDecoration: 'none', fontWeight: 800 }}>Explorer les guides</Link></div>}
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(270px,1fr))', gap: 16 }}>{favorites.map(guide => <article key={guide.slug} style={{ padding: 20, background: 'white', border: '1px solid #EDE8DC', borderRadius: 15 }}><div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}><div><h2 style={{ margin: 0, color: '#1A1209', fontSize: 18 }}>{guide.name}</h2><div style={{ color: '#7A6D5A', fontSize: 12 }}>{guide.city || 'Ville non renseignée'}{guide.experienceYears !== null ? ` · ${guide.experienceYears} ans` : ''}</div></div><button type="button" onClick={() => remove(guide.slug)} aria-label="Retirer des favoris" style={{ border: 0, background: 'transparent', color: '#DC2626', fontSize: 22, cursor: 'pointer' }}>♥</button></div>{guide.rating === null ? <p style={{ color: '#7A6D5A', fontSize: 13 }}>Aucun avis publié pour le moment.</p> : <p style={{ color: '#9A6C14', fontWeight: 800 }}>★ {guide.rating.toFixed(1)} <span style={{ color: '#7A6D5A', fontWeight: 400 }}>({guide.reviewCount})</span></p>}<div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>{guide.languages.map(language => <span key={language} style={{ padding: '4px 8px', background: '#FAF7F0', borderRadius: 999, color: '#5A4E3A', fontSize: 11 }}>{language}</span>)}</div><Link href={`/guides/${guide.slug}`} style={{ display: 'inline-block', marginTop: 16, color: '#1A1209', fontWeight: 800 }}>Voir le profil →</Link></article>)}</div>
  </div>
}
