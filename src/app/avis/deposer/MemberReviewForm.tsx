'use client'

import { useEffect, useState } from 'react'
import { CheckCircle2, LoaderCircle, Star } from 'lucide-react'

type ReviewStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'HIDDEN'
type StoredReview = {
  firstName: string
  city: string
  country: string
  rating: number
  comment: string
  status: ReviewStatus
}

export default function MemberReviewForm() {
  const [firstName, setFirstName] = useState('')
  const [city, setCity] = useState('')
  const [country, setCountry] = useState('')
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [existing, setExisting] = useState<StoredReview | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    fetch('/api/espace/member-review', { cache: 'no-store' })
      .then(async response => {
        const data = await response.json().catch(() => ({}))
        if (!response.ok) throw new Error(data.error || 'Impossible de charger le formulaire.')
        if (!active) return
        const review = data.review as StoredReview | null
        setExisting(review)
        setFirstName(review?.firstName || data.profile?.firstName || '')
        setCity(review?.city || '')
        setCountry(review?.country || data.profile?.country || '')
        setRating(review?.rating || 0)
        setComment(review?.comment || '')
      })
      .catch(value => { if (active) setError(value instanceof Error ? value.message : 'Impossible de charger le formulaire.') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    if (!rating) {
      setError('Choisissez une note de 1 à 5 étoiles.')
      return
    }
    setSaving(true)
    setSuccess(false)
    setError('')
    const response = await fetch('/api/espace/member-review', {
      method: existing ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ firstName, city, country, rating, comment }),
    })
    const data = await response.json().catch(() => ({}))
    if (!response.ok) {
      setError(data.error || 'L’envoi de votre avis a échoué.')
    } else {
      setExisting({ firstName, city, country, rating, comment, status: 'PENDING' })
      setSuccess(true)
    }
    setSaving(false)
  }

  if (loading) {
    return <div className="member-review-loading" role="status"><LoaderCircle size={26} className="member-review-spinner" /> Préparation du formulaire…</div>
  }

  return (
    <form className="member-review-form" onSubmit={submit}>
      {(success || existing?.status === 'PENDING') && (
        <div className="member-review-notice" role="status" aria-live="polite">
          <CheckCircle2 size={19} />
          <span>{success ? 'Merci, votre avis a bien été envoyé et sera publié après validation.' : 'Votre avis est en attente de validation. Vous pouvez encore le modifier.'}</span>
        </div>
      )}

      {existing?.status === 'APPROVED' && !success && (
        <div className="member-review-notice member-review-notice--approved">
          Votre avis est publié. Toute modification demandera une nouvelle validation.
        </div>
      )}

      <div className="member-review-identity">
        <label>
          <span>Prénom</span>
          <input required minLength={2} maxLength={80} autoComplete="given-name" value={firstName} onChange={event => setFirstName(event.target.value)} />
        </label>
        <label>
          <span>Ville</span>
          <input required minLength={2} maxLength={120} autoComplete="address-level2" value={city} onChange={event => setCity(event.target.value)} />
        </label>
        <label>
          <span>Pays</span>
          <input required minLength={2} maxLength={120} autoComplete="country-name" value={country} onChange={event => setCountry(event.target.value)} />
        </label>
      </div>

      <fieldset className="member-review-stars">
        <legend>Votre note générale</legend>
        <div role="radiogroup" aria-label="Votre note générale">
          {[1, 2, 3, 4, 5].map(score => (
            <button
              key={score}
              type="button"
              role="radio"
              aria-checked={rating === score}
              aria-label={`${score} étoile${score > 1 ? 's' : ''} sur 5`}
              onClick={() => setRating(score)}
            >
              <Star size={38} fill={score <= rating ? '#D5A14A' : 'transparent'} />
            </button>
          ))}
        </div>
      </fieldset>

      <label className="member-review-comment">
        <span>Laissez-nous votre commentaire</span>
        <textarea
          required
          maxLength={2000}
          rows={6}
          placeholder="Partagez simplement votre expérience avec SAFARUMA…"
          value={comment}
          onChange={event => setComment(event.target.value)}
        />
        <small>{comment.length}/2000</small>
      </label>

      {error && <div className="member-review-error" role="alert">{error}</div>}

      <button className="member-review-submit" type="submit" disabled={saving}>
        {saving ? <><LoaderCircle size={18} className="member-review-spinner" /> Envoi en cours…</> : existing ? 'Mettre à jour mon avis' : 'Envoyer mon avis'}
      </button>
    </form>
  )
}
