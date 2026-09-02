'use client'

import { useEffect, useState } from 'react'
import { LoaderCircle, Star } from 'lucide-react'
import PublicReviewCard from '@/components/PublicReviewCard'
import type { PublicReviewItem } from '@/lib/public-reviews'

type PublicReviewsResponse = {
  reviews: PublicReviewItem[]
  pagination: { page: number; limit: number; total: number; totalPages: number; hasNextPage: boolean }
}

export default function ReviewsDirectory({ initialData, initialError = false }: { initialData: PublicReviewsResponse; initialError?: boolean }) {
  const [data, setData] = useState(initialData)
  const [rating, setRating] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(initialError ? 'Les avis sont temporairement indisponibles.' : '')

  async function load(nextRating: number, page: number) {
    setLoading(true)
    setError('')
    const params = new URLSearchParams({ page: String(page), limit: '12' })
    if (nextRating) params.set('rating', String(nextRating))
    try {
      const response = await fetch(`/api/reviews/public?${params.toString()}`, { cache: 'no-store' })
      const nextData = await response.json()
      if (!response.ok) throw new Error(nextData.error || 'Impossible de charger les avis.')
      setData(nextData)
      setRating(nextRating)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (value) {
      setError(value instanceof Error ? value.message : 'Impossible de charger les avis.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (initialError) load(0, 1)
  }, [initialError])

  return (
    <section className="reviews-directory" aria-live="polite">
      <div className="reviews-filter" aria-label="Filtrer les avis par note">
        <button className={rating === 0 ? 'active' : ''} type="button" onClick={() => load(0, 1)}>Tous</button>
        {[5, 4, 3, 2, 1].map(score => (
          <button className={rating === score ? 'active' : ''} key={score} type="button" onClick={() => load(score, 1)}>
            {score} <Star size={13} fill="currentColor" />
          </button>
        ))}
      </div>

      <div className="reviews-directory-summary">
        <strong>{data.pagination.total}</strong> avis publié{data.pagination.total > 1 ? 's' : ''}
      </div>

      {error && <div className="reviews-directory-error" role="alert">{error}</div>}
      {loading ? (
        <div className="reviews-directory-loading" role="status"><LoaderCircle size={25} /> Chargement des avis…</div>
      ) : data.reviews.length ? (
        <div className="reviews-directory-grid">
          {data.reviews.map(review => <PublicReviewCard key={review.id} review={review} />)}
        </div>
      ) : (
        <div className="reviews-directory-empty">Aucun avis réel et approuvé pour cette note.</div>
      )}

      {data.pagination.totalPages > 1 && (
        <nav className="reviews-pagination" aria-label="Pagination des avis">
          <button type="button" disabled={loading || data.pagination.page <= 1} onClick={() => load(rating, data.pagination.page - 1)}>Précédent</button>
          <span>Page {data.pagination.page} sur {data.pagination.totalPages}</span>
          <button type="button" disabled={loading || !data.pagination.hasNextPage} onClick={() => load(rating, data.pagination.page + 1)}>Suivant</button>
        </nav>
      )}
    </section>
  )
}
