'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { CheckCircle2, ClipboardCheck, HeartHandshake, LoaderCircle, PackageCheck, Star } from 'lucide-react'

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
  const successTitleRef = useRef<HTMLHeadingElement>(null)
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

  useEffect(() => {
    if (success) successTitleRef.current?.focus()
  }, [success])

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

  if (success) {
    const features = [
      {
        title: 'Votre checklist Omra est prête',
        text: 'Retrouvez dans votre espace les étapes à préparer avant le départ afin de ne rien oublier.',
        image: '/parcours/preparation-conseils.jpg',
        Icon: ClipboardCheck,
      },
      {
        title: 'Préparez votre équipement à l’avance',
        text: 'Ihram, ceinture et sandales peuvent être préparés à l’avance et apportés par votre guide.',
        image: '/images/guide-omra/ihram.jpg',
        Icon: PackageCheck,
      },
      {
        title: 'Un accompagnement adapté à chacun',
        text: 'SAFARUMA accompagne aussi les pèlerins à mobilité réduite avec un rythme et une assistance adaptés.',
        image: '/why-safaruma/assistance-pmr.jpg',
        Icon: HeartHandshake,
      },
    ]

    return (
      <section className="member-review-success" role="status" aria-live="polite" aria-labelledby="member-review-success-title">
        <div className="member-review-success-mark" aria-hidden="true"><CheckCircle2 size={34} /></div>
        <h2 id="member-review-success-title" ref={successTitleRef} tabIndex={-1}>Barakallahou fik</h2>
        <p className="member-review-success-arabic" lang="ar" dir="rtl">بارك الله فيك</p>
        <p className="member-review-success-copy">
          Merci pour votre avis. Il a bien été transmis à notre équipe et sera publié après validation.
        </p>
        <span className="member-review-status-pill">En attente de validation</span>

        <div className="member-review-discovery">
          <p className="member-review-discovery-title">Le saviez-vous&nbsp;?</p>
          <div className="member-review-feature-grid">
            {features.map(({ title, text, image, Icon }) => (
              <article className="member-review-feature" key={title}>
                <div className="member-review-feature-image">
                  <Image src={image} alt="" fill sizes="(max-width: 640px) 100vw, 240px" />
                </div>
                <div className="member-review-feature-body">
                  <Icon size={20} aria-hidden="true" />
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>

        <Link className="member-review-primary member-review-success-cta" href="/espace/tableau-de-bord">
          Retour à mon espace
        </Link>
      </section>
    )
  }

  return (
    <form className="member-review-form" onSubmit={submit}>
      {existing?.status === 'PENDING' && (
        <div className="member-review-notice" role="status" aria-live="polite">
          <CheckCircle2 size={19} />
          <span>Votre avis est en attente de validation. Vous pouvez encore le modifier.</span>
        </div>
      )}

      {existing?.status === 'APPROVED' && (
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
