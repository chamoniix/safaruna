import Link from 'next/link'
import { Star } from 'lucide-react'
import type { PublicReviewItem } from '@/lib/public-reviews'

export default function PublicReviewCard({ review, compact = false }: { review: PublicReviewItem; compact?: boolean }) {
  return (
    <article className={`public-review-card${compact ? ' public-review-card--compact' : ''}`}>
      <div className="public-review-card-top">
        <span className={`public-review-badge public-review-badge--${review.kind.toLowerCase()}`}>{review.label}</span>
        <span className="public-review-rating" aria-label={`${review.rating} étoiles sur 5`}>
          <Star size={15} fill="currentColor" aria-hidden="true" /> {review.rating}/5
        </span>
      </div>
      <div className="public-review-stars" aria-hidden="true">
        {[1, 2, 3, 4, 5].map(score => <Star key={score} size={17} fill={score <= review.rating ? 'currentColor' : 'transparent'} />)}
      </div>
      <blockquote>“{review.comment}”</blockquote>
      <footer>
        <strong>{review.firstName}</strong>
        {review.location && <span>{review.location}</span>}
        {review.guideName && review.guideSlug && (
          <Link href={`/guides/${review.guideSlug}`}>Guide : {review.guideName}</Link>
        )}
      </footer>
    </article>
  )
}
