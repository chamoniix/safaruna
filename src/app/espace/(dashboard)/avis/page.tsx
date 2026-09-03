'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { LockKeyhole, MessageSquareText, Pencil, Star } from 'lucide-react'
import styles from './page.module.css'

type ReviewStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'HIDDEN'
type ReviewItem = {
  id: string
  rating: number
  comment: string
  status: ReviewStatus
  createdAt: string
  updatedAt: string
}
type ReservationReviewGroup = {
  reservationId: string
  refNumber: string
  updatedAt: string
  editable: boolean
  stayReview: ReviewItem | null
  guideReviews: Array<ReviewItem & { guideName: string }>
}
type ReviewsResponse = {
  memberReview: ReviewItem | null
  reservationReviews: ReservationReviewGroup[]
}

const STATUS: Record<ReviewStatus, { label: string; className: string }> = {
  PENDING: { label: 'À valider', className: styles.pending },
  APPROVED: { label: 'Publié', className: styles.approved },
  REJECTED: { label: 'Rejeté', className: styles.rejected },
  HIDDEN: { label: 'Masqué', className: styles.hidden },
}

function Rating({ value }: { value: number }) {
  return (
    <span className={styles.rating} aria-label={`${value} étoiles sur 5`}>
      <Star size={15} fill="currentColor" aria-hidden="true" />
      {value}/5
    </span>
  )
}

function Status({ value }: { value: ReviewStatus }) {
  const status = STATUS[value]
  return <span className={`${styles.status} ${status.className}`}>{status.label}</span>
}

function ReviewContent({ label, review }: { label: string; review: ReviewItem }) {
  return (
    <div className={styles.reviewContent}>
      <div className={styles.reviewMeta}>
        <strong>{label}</strong>
        <Rating value={review.rating} />
        <Status value={review.status} />
      </div>
      <p>{review.comment}</p>
    </div>
  )
}

export default function MyReviewsPage() {
  const [data, setData] = useState<ReviewsResponse | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    fetch('/api/espace/my-reviews', { cache: 'no-store' })
      .then(async response => {
        const payload = await response.json().catch(() => ({}))
        if (!response.ok) throw new Error(payload.error || 'Impossible de charger vos avis.')
        if (active) setData(payload as ReviewsResponse)
      })
      .catch(value => { if (active) setError(value instanceof Error ? value.message : 'Impossible de charger vos avis.') })
    return () => { active = false }
  }, [])

  if (error) return <div className={styles.error} role="alert">{error}</div>
  if (!data) return <div className={styles.loading} role="status">Chargement de vos avis…</div>

  const isEmpty = !data.memberReview && data.reservationReviews.length === 0

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <p>Vos retours</p>
        <h1>Mes avis</h1>
        <span>Consultez le statut de vos avis et modifiez ceux qui sont encore éditables.</span>
      </header>

      {isEmpty ? (
        <section className={styles.empty}>
          <MessageSquareText size={34} aria-hidden="true" />
          <h2>Vous n’avez pas encore laissé d’avis.</h2>
          <p>Partagez votre expérience générale avec SAFARUMA en quelques instants.</p>
          <Link href="/avis/deposer">Donner mon avis</Link>
        </section>
      ) : (
        <div className={styles.list}>
          {data.memberReview && (
            <article className={styles.card}>
              <div className={styles.cardHeader}>
                <div>
                  <span className={styles.kind}>Avis membre</span>
                  <h2>Votre expérience SAFARUMA</h2>
                </div>
                <Link className={styles.action} href="/avis/deposer">
                  <Pencil size={16} aria-hidden="true" /> Modifier mon avis
                </Link>
              </div>
              <ReviewContent label="Avis membre" review={data.memberReview} />
            </article>
          )}

          {data.reservationReviews.map(group => (
            <article className={styles.card} key={group.reservationId}>
              <div className={styles.cardHeader}>
                <div>
                  <span className={styles.kind}>Réservation {group.refNumber}</span>
                  <h2>Votre séjour et votre guide</h2>
                </div>
                <Link className={styles.action} href={`/espace/avis/${group.reservationId}`}>
                  {group.editable ? <Pencil size={16} aria-hidden="true" /> : <LockKeyhole size={16} aria-hidden="true" />}
                  {group.editable ? 'Modifier mes avis' : 'Voir mes avis'}
                </Link>
              </div>
              <div className={styles.reviewStack}>
                {group.stayReview && <ReviewContent label="Avis vérifié" review={group.stayReview} />}
                {group.guideReviews.map(review => (
                  <ReviewContent key={review.id} label={`Avis Guide · ${review.guideName}`} review={review} />
                ))}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
