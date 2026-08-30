'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { CheckCircle2, Star } from 'lucide-react'

type Guide = { id: string; name: string }
type ExistingReview = { guideProfileId: string; status: string; ratingOverall: number; ratingPunctuality: number | null; ratingPedagogy: number | null; ratingKnowledge: number | null; comment: string }
type GuideReview = { guideProfileId: string; ratingOverall: number; ratingPunctuality: number; ratingPedagogy: number; ratingKnowledge: number; comment: string }

function Rating({ value, onChange, disabled }: { value: number; onChange: (value: number) => void; disabled?: boolean }) {
  return <div style={{ display: 'flex', gap: 5 }}>{[1, 2, 3, 4, 5].map(score => <button key={score} type="button" disabled={disabled} aria-label={`${score} sur 5`} onClick={() => onChange(score)} style={{ padding: 2, border: 0, background: 'transparent', cursor: disabled ? 'default' : 'pointer' }}><Star size={23} color="#C9A84C" fill={score <= value ? '#C9A84C' : 'transparent'} /></button>)}</div>
}

export default function ReviewPage() {
  const params = useParams<{ id: string }>()
  const reservationId = params.id
  const [guides, setGuides] = useState<Guide[]>([])
  const [refNumber, setRefNumber] = useState('')
  const [editable, setEditable] = useState(true)
  const [submitted, setSubmitted] = useState(false)
  const [stayRating, setStayRating] = useState(5)
  const [stayComment, setStayComment] = useState('')
  const [guideReviews, setGuideReviews] = useState<GuideReview[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`/api/espace/reviews?reservationId=${encodeURIComponent(reservationId)}`, { cache: 'no-store' })
      .then(async response => {
        const data = await response.json()
        if (!response.ok) throw new Error(data.error || 'Impossible de charger le formulaire.')
        const reservation = data.reservation
        setGuides(reservation.guides)
        setRefNumber(reservation.refNumber)
        setEditable(reservation.editable)
        setSubmitted(Boolean(reservation.feedbackSubmittedAt))
        setStayRating(reservation.stayRating || 5)
        setStayComment(reservation.stayComment || '')
        setGuideReviews(reservation.guides.map((guide: Guide) => {
          const existing = reservation.reviews.find((review: ExistingReview) => review.guideProfileId === guide.id)
          return {
            guideProfileId: guide.id,
            ratingOverall: existing?.ratingOverall || 5,
            ratingPunctuality: existing?.ratingPunctuality || 5,
            ratingPedagogy: existing?.ratingPedagogy || 5,
            ratingKnowledge: existing?.ratingKnowledge || 5,
            comment: existing?.comment || '',
          }
        }))
      })
      .catch(errorValue => setError(errorValue.message))
      .finally(() => setLoading(false))
  }, [reservationId])

  function updateGuide(id: string, values: Partial<GuideReview>) {
    setGuideReviews(current => current.map(review => review.guideProfileId === id ? { ...review, ...values } : review))
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    setSaving(true)
    setError('')
    const response = await fetch('/api/espace/reviews', {
      method: submitted ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reservationId, stayRating, stayComment, guideReviews }),
    })
    const data = await response.json().catch(() => ({}))
    if (!response.ok) setError(data.error || 'L’enregistrement a échoué.')
    else setSubmitted(true)
    setSaving(false)
  }

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#7A6D5A' }}>Chargement du formulaire…</div>
  if (error && guides.length === 0) return <div style={{ padding: 18, background: '#FEF2F2', color: '#B91C1C', borderRadius: 12 }}>{error}</div>

  return <form onSubmit={submit} style={{ display: 'grid', gap: 18, maxWidth: 820 }}>
    <header><div style={{ color: '#9A6C14', fontSize: 12, fontWeight: 800, letterSpacing: '.12em', textTransform: 'uppercase' }}>Réservation {refNumber}</div><h1 style={{ margin: '6px 0', color: '#1A1209', fontSize: 30 }}>Votre retour d’expérience</h1><p style={{ margin: 0, color: '#756B5D', fontSize: 14 }}>Votre avis sincère nous aide à maintenir la qualité des accompagnements SAFARUMA.</p></header>
    {submitted && <div style={{ display: 'flex', gap: 9, padding: 14, background: '#ECFDF5', color: '#047857', border: '1px solid #A7F3D0', borderRadius: 11 }}><CheckCircle2 size={20} /><span>{editable ? 'Avis enregistré et en attente de validation. Vous pouvez encore le modifier.' : 'Avis validé par SAFARUMA. Il ne peut plus être modifié.'}</span></div>}
    {error && <div style={{ padding: 14, background: '#FEF2F2', color: '#B91C1C', borderRadius: 11 }}>{error}</div>}
    <section style={{ padding: 22, background: 'white', border: '1px solid #E8DFC8', borderRadius: 15 }}><h2 style={{ marginTop: 0, color: '#1A1209', fontSize: 20 }}>Votre séjour dans son ensemble</h2><label style={{ display: 'grid', gap: 7, marginBottom: 16 }}><span style={{ color: '#4A3F30', fontSize: 13, fontWeight: 700 }}>Note du séjour</span><Rating value={stayRating} onChange={setStayRating} disabled={!editable} /></label><label style={{ display: 'grid', gap: 7 }}><span style={{ color: '#4A3F30', fontSize: 13, fontWeight: 700 }}>Votre commentaire</span><textarea required maxLength={2000} disabled={!editable} value={stayComment} onChange={event => setStayComment(event.target.value)} rows={4} style={{ padding: 12, border: '1px solid #D8CEBC', borderRadius: 10, resize: 'vertical', font: 'inherit' }} /></label></section>
    {guideReviews.map(review => {
      const guide = guides.find(item => item.id === review.guideProfileId)
      return <section key={review.guideProfileId} style={{ padding: 22, background: 'white', border: '1px solid #E8DFC8', borderRadius: 15 }}><h2 style={{ marginTop: 0, color: '#1A1209', fontSize: 20 }}>Votre guide : {guide?.name}</h2>{([['Note générale', 'ratingOverall'], ['Ponctualité', 'ratingPunctuality'], ['Pédagogie', 'ratingPedagogy'], ['Connaissances', 'ratingKnowledge']] as const).map(([label, key]) => <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, padding: '8px 0', flexWrap: 'wrap' }}><span style={{ color: '#4A3F30', fontSize: 13, fontWeight: 700 }}>{label}</span><Rating value={review[key]} onChange={value => updateGuide(review.guideProfileId, { [key]: value })} disabled={!editable} /></div>)}<label style={{ display: 'grid', gap: 7, marginTop: 12 }}><span style={{ color: '#4A3F30', fontSize: 13, fontWeight: 700 }}>Commentaire nominatif</span><textarea required maxLength={2000} disabled={!editable} value={review.comment} onChange={event => updateGuide(review.guideProfileId, { comment: event.target.value })} rows={4} style={{ padding: 12, border: '1px solid #D8CEBC', borderRadius: 10, resize: 'vertical', font: 'inherit' }} /></label></section>
    })}
    {editable && <button type="submit" disabled={saving} style={{ justifySelf: 'start', border: 0, borderRadius: 999, padding: '13px 24px', background: '#1A1209', color: '#F0D897', fontWeight: 800, cursor: 'pointer', opacity: saving ? .65 : 1 }}>{saving ? 'Enregistrement…' : submitted ? 'Mettre à jour mon avis' : 'Envoyer mon avis'}</button>}
  </form>
}
