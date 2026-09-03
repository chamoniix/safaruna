import Link from 'next/link'
import { Star } from 'lucide-react'
import type { PublicReviewItem } from '@/lib/public-reviews'

export default function PublicReviewCard({ review, compact = false }: { review: PublicReviewItem; compact?: boolean }) {
  const initial = review.firstName.trim().charAt(0).toLocaleUpperCase('fr') || 'S'

  return (
    <article className={`public-review-card${compact ? ' public-review-card--compact' : ''}`}>
      <div className="public-review-card-top">
        <div className="public-review-author">
          <span className="public-review-avatar" aria-hidden="true">
            {review.avatarUrl ? (
              // Google profile photos are remote, user-specific URLs and are intentionally rendered as-is.
              // eslint-disable-next-line @next/next/no-img-element
              <img src={review.avatarUrl} alt="" width={40} height={40} loading="lazy" referrerPolicy="no-referrer" />
            ) : initial}
          </span>
          <span className="public-review-identity">
            <strong>{review.firstName}</strong>
            {review.location && <span>{review.location}</span>}
          </span>
        </div>
        <span className={`public-review-badge public-review-badge--${review.kind.toLowerCase()}`}>{review.label}</span>
      </div>
      <div className="public-review-stars" aria-label={`${review.rating} étoiles sur 5`}>
        <span aria-hidden="true">
          {[1, 2, 3, 4, 5].map(score => <Star key={score} size={15} fill={score <= review.rating ? 'currentColor' : 'transparent'} />)}
        </span>
        <small>{review.rating}/5</small>
      </div>
      <blockquote>“{review.comment}”</blockquote>
      {review.guideName && review.guideSlug && (
        <Link className="public-review-guide" href={`/guides/${review.guideSlug}`}>Guide : {review.guideName}</Link>
      )}
    </article>
  )
}
