'use client'

import { useEffect, useState } from 'react'
import { Star } from 'lucide-react'

type Review = {
  id: string
  reservationRef: string
  author: string
  country: string | null
  ratingOverall: number
  ratingPunctuality: number | null
  ratingPedagogy: number | null
  ratingKnowledge: number | null
  comment: string
  createdAt: string
}

export default function GuideReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/guide/reviews', { cache: 'no-store' })
      .then(async response => {
        const data = await response.json()
        if (!response.ok) throw new Error(data.error || 'Erreur')
        setReviews(data.reviews || [])
      })
      .catch(errorValue => setError(errorValue.message))
      .finally(() => setLoading(false))
  }, [])

  const average = reviews.length ? reviews.reduce((sum, review) => sum + review.ratingOverall, 0) / reviews.length : null
  return (
    <div style={{ display: 'grid', gap: 18 }}>
      <header><div style={{ color: '#9A6C14', fontSize: 12, fontWeight: 800, letterSpacing: '.12em', textTransform: 'uppercase' }}>Avis validés</div><h1 style={{ margin: '6px 0', color: '#1A1209', fontSize: 30 }}>Mes avis</h1><p style={{ margin: 0, color: '#756B5D', fontSize: 14 }}>Seuls les avis réels validés par SAFARUMA apparaissent ici et sur votre profil.</p></header>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', padding: 18, borderRadius: 14, background: '#FFFBEB', border: '1px solid #FDE68A' }}><Star size={28} fill="#C9A84C" color="#C9A84C" /><div><strong style={{ color: '#1A1209', fontSize: 25 }}>{average === null ? '—' : average.toFixed(1)}</strong><div style={{ color: '#7A6D5A', fontSize: 12 }}>{reviews.length} avis validé(s)</div></div></div>
      {loading && <div style={{ padding: 35, textAlign: 'center', color: '#7A6D5A' }}>Chargement des avis…</div>}
      {error && <div style={{ padding: 14, color: '#B91C1C', background: '#FEF2F2', borderRadius: 10 }}>{error}</div>}
      {!loading && !error && reviews.length === 0 && <div style={{ padding: 36, background: 'white', border: '1px solid #E8DFC8', borderRadius: 14, textAlign: 'center', color: '#7A6D5A' }}>Aucun avis publié pour le moment.</div>}
      {reviews.map(review => <article key={review.id} style={{ padding: 20, background: 'white', border: '1px solid #E8DFC8', borderRadius: 14 }}><div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}><div><strong style={{ color: '#1A1209' }}>{review.author}</strong><span style={{ color: '#7A6D5A', fontSize: 12 }}> · {review.country || 'Pays non renseigné'}</span></div><div style={{ color: '#B88918', fontWeight: 800 }}>★ {review.ratingOverall}/5</div></div><p style={{ color: '#4A3F30', lineHeight: 1.65, marginBottom: 10 }}>{review.comment}</p><div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', color: '#7A6D5A', fontSize: 12 }}><span>Ponctualité {review.ratingPunctuality ?? '—'}/5</span><span>Pédagogie {review.ratingPedagogy ?? '—'}/5</span><span>Connaissances {review.ratingKnowledge ?? '—'}/5</span><span>{review.reservationRef}</span></div></article>)}
    </div>
  )
}
