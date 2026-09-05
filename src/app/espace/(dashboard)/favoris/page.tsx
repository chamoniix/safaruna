'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

type Guide = { slug: string; name: string; city: string | null; experienceYears: number | null; rating: number | null; reviewCount: number; languages: string[]; image: string | null; bookable: boolean; savedAt: string }

export default function FavorisPage() {
  const [guides, setGuides] = useState<Guide[]>([])
  const [loading, setLoading] = useState(true)
  const [removingSlug, setRemovingSlug] = useState<string | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/espace/favorites', { cache: 'no-store' })
      .then(async response => {
        const data = await response.json().catch(() => ({}))
        if (!response.ok) throw new Error(data.error || 'Chargement impossible.')
        setGuides(data.favorites || [])
      })
      .catch(() => setError('Impossible de charger vos favoris. Réessayez.'))
      .finally(() => setLoading(false))
  }, [])

  async function remove(slug: string) {
    if (removingSlug) return
    setRemovingSlug(slug)
    setError('')
    try {
      const response = await fetch('/api/espace/favorites', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guideSlug: slug }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'Suppression impossible.')
      setGuides(current => current.filter(guide => guide.slug !== slug))
    } catch {
      setError('Impossible de retirer ce guide. Réessayez.')
    } finally {
      setRemovingSlug(null)
    }
  }

  return <div style={{ display: 'grid', gap: 20 }}>
    <header><h1 style={{ margin: 0, color: '#1A1209', fontSize: 30 }}>Mes favoris</h1><p style={{ color: '#7A6D5A' }}>{guides.length} guide(s) sauvegardé(s)</p></header>
    {error && <div role="alert" style={{ padding: '11px 14px', borderRadius: 10, background: '#FDECEA', border: '1px solid #F5C6C2', color: '#C0392B', fontSize: 13 }}>{error}</div>}
    {loading && <div style={{ padding: 36, textAlign: 'center', color: '#7A6D5A' }}>Chargement des guides…</div>}
    {!loading && guides.length === 0 && <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'white', borderRadius: 18, border: '1px solid #EDE8DC' }}><div style={{ fontSize: 44 }}>🤍</div><h2 style={{ color: '#1A1209' }}>Aucun guide en favoris</h2><p style={{ color: '#7A6D5A' }}>Ajoutez des profils réels depuis la liste des guides.</p><Link href="/guides" style={{ display: 'inline-block', padding: '11px 20px', borderRadius: 999, background: '#1A1209', color: '#F0D897', textDecoration: 'none', fontWeight: 800 }}>Explorer les guides</Link></div>}
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(270px,1fr))', gap: 16 }}>{guides.map(guide => <article key={guide.slug} style={{ padding: 20, background: 'white', border: '1px solid #EDE8DC', borderRadius: 15 }}><div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}><div><h2 style={{ margin: 0, color: '#1A1209', fontSize: 18 }}>{guide.name}</h2><div style={{ color: '#7A6D5A', fontSize: 12 }}>{guide.city || 'Ville non renseignée'}{guide.experienceYears !== null ? ` · ${guide.experienceYears} ans` : ''}</div></div><button type="button" onClick={() => remove(guide.slug)} disabled={removingSlug === guide.slug} aria-label={`Retirer ${guide.name} des favoris`} style={{ border: 0, background: 'transparent', color: '#DC2626', fontSize: 22, cursor: removingSlug === guide.slug ? 'wait' : 'pointer', opacity: removingSlug === guide.slug ? 0.45 : 1 }}>♥</button></div>{!guide.bookable && <p style={{ display: 'inline-block', margin: '12px 0 0', padding: '4px 9px', borderRadius: 999, background: '#FEF3C7', color: '#92400E', fontSize: 11, fontWeight: 800 }}>Temporairement indisponible</p>}{guide.rating === null ? <p style={{ color: '#7A6D5A', fontSize: 13 }}>Aucun avis publié pour le moment.</p> : <p style={{ color: '#9A6C14', fontWeight: 800 }}>★ {guide.rating.toFixed(1)} <span style={{ color: '#7A6D5A', fontWeight: 400 }}>({guide.reviewCount})</span></p>}<div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>{guide.languages.map(language => <span key={language} style={{ padding: '4px 8px', background: '#FAF7F0', borderRadius: 999, color: '#5A4E3A', fontSize: 11 }}>{language}</span>)}</div><Link href={`/guides/${guide.slug}`} style={{ display: 'inline-block', marginTop: 16, color: '#1A1209', fontWeight: 800 }}>Voir le profil →</Link></article>)}</div>
  </div>
}
