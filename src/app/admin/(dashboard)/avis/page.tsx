'use client'

import { useEffect, useMemo, useState } from 'react'
import { ShieldCheck, Star } from 'lucide-react'

type ReviewStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'HIDDEN'
type Review = { id: string; reservationRef: string; guideName: string; author: string; authorEmail: string | null; country: string | null; ratingOverall: number; ratingPunctuality: number | null; ratingPedagogy: number | null; ratingKnowledge: number | null; comment: string; status: ReviewStatus; moderationNote: string | null; moderatedByEmail: string | null; createdAt: string; stayRating: number | null; stayComment: string | null }

const labels: Record<ReviewStatus, string> = { PENDING: 'À valider', APPROVED: 'Publié', REJECTED: 'Rejeté', HIDDEN: 'Masqué' }
const colors: Record<ReviewStatus, { bg: string; fg: string }> = { PENDING: { bg: '#FEF3C7', fg: '#B45309' }, APPROVED: { bg: '#D1FAE5', fg: '#047857' }, REJECTED: { bg: '#FEE2E2', fg: '#B91C1C' }, HIDDEN: { bg: '#E5E7EB', fg: '#374151' } }

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'ALL' | ReviewStatus>('PENDING')
  const [editing, setEditing] = useState<Review | null>(null)
  const [nextStatus, setNextStatus] = useState<Exclude<ReviewStatus, 'PENDING'>>('APPROVED')
  const [reason, setReason] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function load() {
    setLoading(true)
    const response = await fetch('/api/admin/reviews', { cache: 'no-store' })
    const data = await response.json().catch(() => ({}))
    if (!response.ok) setError(data.error || 'Erreur de chargement')
    else { setReviews(data.reviews || []); setError('') }
    setLoading(false)
  }
  useEffect(() => {
    let active = true
    fetch('/api/admin/reviews', { cache: 'no-store' })
      .then(async response => ({ response, data: await response.json().catch(() => ({})) }))
      .then(({ response, data }) => {
        if (!active) return
        if (!response.ok) setError(data.error || 'Erreur de chargement')
        else { setReviews(data.reviews || []); setError('') }
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])
  const visible = useMemo(() => reviews.filter(review => filter === 'ALL' || review.status === filter), [reviews, filter])

  async function moderate() {
    if (!editing || reason.trim().length < 10) return
    setSaving(true)
    const response = await fetch('/api/admin/reviews', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reviewId: editing.id, status: nextStatus, reason }) })
    const data = await response.json().catch(() => ({}))
    if (!response.ok) setError(data.error || 'La modération a échoué.')
    else { setEditing(null); setReason(''); await load() }
    setSaving(false)
  }

  return <div style={{ display: 'grid', gap: 18 }}>
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>{(['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'HIDDEN'] as const).map(status => <button key={status} type="button" onClick={() => setFilter(status)} style={{ border: `1px solid ${filter === status ? '#1A1209' : '#D8CEBC'}`, borderRadius: 999, padding: '8px 13px', background: filter === status ? '#1A1209' : 'white', color: filter === status ? '#F0D897' : '#4A3F30', fontWeight: 700, cursor: 'pointer' }}>{status === 'ALL' ? 'Tous' : labels[status]} ({status === 'ALL' ? reviews.length : reviews.filter(review => review.status === status).length})</button>)}</div>
    {error && <div style={{ padding: 14, color: '#B91C1C', background: '#FEF2F2', borderRadius: 10 }}>{error}</div>}
    {loading && <div style={{ padding: 36, textAlign: 'center', color: '#7A6D5A' }}>Chargement des avis…</div>}
    {!loading && visible.length === 0 && <div style={{ padding: 36, textAlign: 'center', color: '#7A6D5A', background: 'white', borderRadius: 13, border: '1px solid #E8DFC8' }}>Aucun avis réel dans cette catégorie.</div>}
    {visible.map(review => <article key={review.id} style={{ padding: 20, background: 'white', border: '1px solid #E8DFC8', borderRadius: 14 }}><div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}><div><strong style={{ color: '#1A1209' }}>{review.guideName}</strong><div style={{ color: '#7A6D5A', fontSize: 12 }}>{review.reservationRef} · {review.author} · {review.country || 'Pays non renseigné'}</div></div><span style={{ alignSelf: 'start', padding: '6px 10px', borderRadius: 999, background: colors[review.status].bg, color: colors[review.status].fg, fontSize: 12, fontWeight: 800 }}>{labels[review.status]}</span></div><div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 14, color: '#9A6C14', fontWeight: 800 }}><Star size={18} fill="#C9A84C" color="#C9A84C" />{review.ratingOverall}/5</div><p style={{ color: '#4A3F30', lineHeight: 1.65 }}>{review.comment}</p><div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', color: '#7A6D5A', fontSize: 12 }}><span>Ponctualité {review.ratingPunctuality}/5</span><span>Pédagogie {review.ratingPedagogy}/5</span><span>Connaissances {review.ratingKnowledge}/5</span><span>Séjour {review.stayRating}/5</span></div>{review.moderationNote && <div style={{ marginTop: 12, padding: 10, background: '#F8F6F2', borderRadius: 8, color: '#5B5145', fontSize: 12 }}><ShieldCheck size={14} style={{ verticalAlign: 'middle', marginRight: 5 }} />{review.moderationNote} — {review.moderatedByEmail}</div>}<button type="button" onClick={() => { setEditing(review); setNextStatus(review.status === 'APPROVED' ? 'HIDDEN' : 'APPROVED'); setReason('') }} style={{ marginTop: 15, border: 0, borderRadius: 999, padding: '9px 15px', background: '#1A1209', color: '#F0D897', fontWeight: 800, cursor: 'pointer' }}>Modérer</button></article>)}
    {editing && <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(7,10,20,.55)', display: 'grid', placeItems: 'center', padding: 20 }}><div style={{ width: 'min(520px, 100%)', padding: 22, background: 'white', borderRadius: 16 }}><h2 style={{ marginTop: 0 }}>Modérer l’avis</h2><p style={{ color: '#5B5145', fontSize: 13 }}>Le texte et les notes ne sont pas modifiables.</p><label style={{ display: 'grid', gap: 6, marginBottom: 14 }}><span style={{ fontSize: 12, fontWeight: 800 }}>Décision</span><select value={nextStatus} onChange={event => setNextStatus(event.target.value as Exclude<ReviewStatus, 'PENDING'>)} style={{ padding: 11, border: '1px solid #D8CEBC', borderRadius: 9 }}><option value="APPROVED">Publier</option><option value="REJECTED">Rejeter</option><option value="HIDDEN">Masquer</option></select></label><label style={{ display: 'grid', gap: 6 }}><span style={{ fontSize: 12, fontWeight: 800 }}>Motif obligatoire (10 caractères minimum)</span><textarea value={reason} onChange={event => setReason(event.target.value)} rows={4} style={{ padding: 11, border: '1px solid #D8CEBC', borderRadius: 9 }} /></label><div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 18 }}><button type="button" onClick={() => setEditing(null)} style={{ padding: '10px 15px', borderRadius: 999, border: '1px solid #D8CEBC', background: 'white' }}>Annuler</button><button type="button" disabled={saving || reason.trim().length < 10} onClick={moderate} style={{ padding: '10px 16px', borderRadius: 999, border: 0, background: '#1A1209', color: '#F0D897', opacity: saving || reason.trim().length < 10 ? .5 : 1 }}>{saving ? 'Validation…' : 'Valider'}</button></div></div></div>}
  </div>
}
