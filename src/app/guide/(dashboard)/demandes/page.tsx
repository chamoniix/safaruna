'use client'

import { useEffect, useState } from 'react'
import { CalendarDays, CheckCircle2, CircleAlert, MapPin, Users } from 'lucide-react'

type Mission = {
  id: string
  city: string
  startDate: string
  endDate: string
  selectedPlaces: string[] | null
  guideConfirmationStatus: 'PENDING' | 'CONFIRMED' | 'DECLINED' | 'NO_RESPONSE'
  guideConfirmedAt: string | null
}

type Reservation = {
  id: string
  refNumber: string
  startDate: string
  endDate: string
  nbPeople: number
  status: string
  langue: string | null
  gender: string | null
  arrivalPoint: string | null
  guideBedProvided: boolean
  ihramAlert: boolean
  pelerin: { name: string | null; firstName: string | null; lastName: string | null; email: string | null }
  missions: Mission[]
  guideConfirmationStatus: 'PENDING' | 'CONFIRMED' | 'DECLINED' | 'NO_RESPONSE'
  guideEarning: { service: number; places: number; transport: number; hotel: number; total: number; status: string } | null
}

function dateFr(value: string) {
  return new Date(value).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
}

export default function GuideDemandesPage() {
  const [highlightedRef, setHighlightedRef] = useState<string | null>(null)
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [confirmingId, setConfirmingId] = useState<string | null>(null)
  const [declineTarget, setDeclineTarget] = useState<Reservation | null>(null)
  const [declineReason, setDeclineReason] = useState('')
  const [declining, setDeclining] = useState(false)

  async function load() {
    setLoading(true)
    const response = await fetch('/api/guide/reservations', { cache: 'no-store' })
    const data = await response.json().catch(() => ({}))
    if (!response.ok) setError(data.error || 'Impossible de charger les réservations.')
    else {
      setError('')
      setReservations(data.reservations || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    let active = true
    Promise.resolve(new URLSearchParams(window.location.search).get('reservation')).then(value => {
      if (active) setHighlightedRef(value)
    })
    fetch('/api/guide/reservations', { cache: 'no-store' })
      .then(async response => ({ response, data: await response.json().catch(() => ({})) }))
      .then(({ response, data }) => {
        if (!active) return
        if (!response.ok) setError(data.error || 'Impossible de charger les réservations.')
        else { setError(''); setReservations(data.reservations || []) }
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  async function confirmReservation(id: string) {
    setConfirmingId(id)
    const response = await fetch(`/api/guide/reservations/${id}/confirm`, { method: 'POST' })
    const data = await response.json().catch(() => ({}))
    if (!response.ok && data.suspended) window.location.assign('/guide/connexion')
    else if (!response.ok) setError(data.error || 'La confirmation a échoué.')
    else await load()
    setConfirmingId(null)
  }

  async function declineReservation() {
    if (!declineTarget || declineReason.trim().length < 10) {
      setError('Expliquez la raison en au moins 10 caractères.')
      return
    }
    setDeclining(true)
    setError('')
    const response = await fetch(`/api/guide/reservations/${declineTarget.id}/decline`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason: declineReason }),
    })
    const data = await response.json().catch(() => ({}))
    if (!response.ok) {
      setError(data.error || 'Le signalement a échoué.')
      setDeclining(false)
      return
    }
    window.location.assign('/guide/connexion')
  }

  const pending = reservations.filter(reservation => reservation.status === 'CONFIRMED' && reservation.guideConfirmationStatus === 'PENDING')
  const confirmed = reservations.filter(reservation => reservation.guideConfirmationStatus === 'CONFIRMED')
  const ordered = [...pending, ...confirmed]

  return (
    <div style={{ display: 'grid', gap: 18 }}>
      <header>
        <div style={{ color: '#9A6C14', fontSize: 12, fontWeight: 800, letterSpacing: '.12em', textTransform: 'uppercase' }}>Réservations payées</div>
        <h1 style={{ margin: '6px 0', color: '#1A1209', fontSize: 30 }}>Demandes à confirmer</h1>
        <p style={{ margin: 0, color: '#756B5D', fontSize: 14 }}>Confirmez chaque nouvelle réservation depuis cet écran.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 12 }}>
        <div style={{ padding: 18, borderRadius: 14, background: '#FFF7E5', border: '1px solid #F2D08B' }}><strong style={{ fontSize: 26, color: '#B45309' }}>{pending.length}</strong><div style={{ color: '#7C5A20', fontSize: 13 }}>confirmation(s) attendue(s)</div></div>
        <div style={{ padding: 18, borderRadius: 14, background: '#ECFDF5', border: '1px solid #A7F3D0' }}><strong style={{ fontSize: 26, color: '#047857' }}>{confirmed.length}</strong><div style={{ color: '#356859', fontSize: 13 }}>réservation(s) confirmée(s)</div></div>
      </div>

      {error && <div style={{ padding: 14, borderRadius: 10, color: '#B91C1C', background: '#FEF2F2', border: '1px solid #FECACA' }}>{error}</div>}
      {loading && <div style={{ padding: 36, textAlign: 'center', color: '#7A6D5A' }}>Chargement des demandes…</div>}
      {!loading && ordered.length === 0 && <div style={{ padding: 36, borderRadius: 14, background: 'white', border: '1px solid #E8DFC8', textAlign: 'center', color: '#7A6D5A' }}>Aucune réservation réelle pour le moment.</div>}

      {ordered.map(reservation => {
        const isPending = reservation.guideConfirmationStatus === 'PENDING'
        const pelerinName = reservation.pelerin.name || `${reservation.pelerin.firstName ?? ''} ${reservation.pelerin.lastName ?? ''}`.trim() || 'Pèlerin'
        return (
          <article key={reservation.id} id={reservation.refNumber === highlightedRef ? 'reservation-active' : undefined} style={{ background: 'white', border: `1px solid ${reservation.refNumber === highlightedRef ? '#C9A84C' : '#E8DFC8'}`, borderRadius: 16, padding: 20, boxShadow: reservation.refNumber === highlightedRef ? '0 0 0 3px rgba(201,168,76,.16)' : '0 3px 14px rgba(26,18,9,.05)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontFamily: 'monospace', color: '#7A6D5A', fontSize: 12 }}>{reservation.refNumber}</div>
                <h2 style={{ margin: '5px 0 0', fontSize: 20, color: '#1A1209' }}>{pelerinName}</h2>
              </div>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 11px', borderRadius: 999, background: isPending ? '#FEF3C7' : '#D1FAE5', color: isPending ? '#B45309' : '#047857', fontSize: 12, fontWeight: 800 }}>
                {isPending ? <CircleAlert size={15} /> : <CheckCircle2 size={15} />}{isPending ? 'À confirmer' : 'Confirmée'}
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10, marginTop: 18 }}>
              <div style={{ display: 'flex', gap: 8, color: '#4A3F30', fontSize: 13 }}><CalendarDays size={17} color="#C9A84C" /><span>{reservation.missions.map(mission => `${dateFr(mission.startDate)} – ${dateFr(mission.endDate)}`).join(' · ')}</span></div>
              <div style={{ display: 'flex', gap: 8, color: '#4A3F30', fontSize: 13 }}><MapPin size={17} color="#C9A84C" /><span>{reservation.missions.map(mission => mission.city === 'MAKKAH' ? 'Makkah' : 'Médine').join(' · ')}</span></div>
              <div style={{ display: 'flex', gap: 8, color: '#4A3F30', fontSize: 13 }}><Users size={17} color="#C9A84C" /><span>{reservation.nbPeople} voyageur(s) · {reservation.langue || 'Langue non renseignée'}</span></div>
            </div>
            {reservation.ihramAlert && <div style={{ marginTop: 14, padding: 12, borderRadius: 9, color: '#991B1B', background: '#FEF2F2', border: '1px solid #FCA5A5', fontSize: 13, fontWeight: 700 }}>Alerte Ihram active pour cette réservation.</div>}
            <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid #EFE8DA', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
              <div><span style={{ color: '#7A6D5A', fontSize: 12 }}>Votre revenu net</span><div style={{ color: '#1D5C3A', fontSize: 21, fontWeight: 800 }}>{reservation.guideEarning ? `${reservation.guideEarning.total} €` : '—'}</div></div>
              {isPending && <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => { setDeclineTarget(reservation); setDeclineReason('') }} style={{ border: '1px solid #FCA5A5', borderRadius: 999, padding: '12px 18px', background: 'white', color: '#B91C1C', fontWeight: 800, cursor: 'pointer' }}>Je ne suis pas disponible</button>
                <button type="button" onClick={() => confirmReservation(reservation.id)} disabled={confirmingId === reservation.id} style={{ border: 0, borderRadius: 999, padding: '12px 22px', background: '#1A1209', color: '#F0D897', fontWeight: 800, cursor: 'pointer', opacity: confirmingId === reservation.id ? .65 : 1 }}>{confirmingId === reservation.id ? 'Confirmation…' : 'Confirmer la réservation'}</button>
              </div>}
            </div>
          </article>
        )
      })}

      {declineTarget && (
        <div role="dialog" aria-modal="true" aria-labelledby="decline-title" style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(26,18,9,.62)', display: 'grid', placeItems: 'center', padding: 16 }}>
          <div style={{ width: '100%', maxWidth: 480, background: 'white', borderRadius: 16, padding: 24, boxShadow: '0 24px 70px rgba(0,0,0,.25)' }}>
            <h2 id="decline-title" style={{ margin: 0, color: '#1A1209', fontSize: 23 }}>Signaler mon indisponibilité</h2>
            <p style={{ color: '#7A6D5A', fontSize: 13, lineHeight: 1.65 }}>La réservation {declineTarget.refNumber} est déjà payée. Votre profil sera suspendu immédiatement pendant l’examen du motif par l’administration.</p>
            <label style={{ display: 'block', color: '#4A3F30', fontSize: 12, fontWeight: 800, marginBottom: 6 }}>Motif obligatoire</label>
            <textarea value={declineReason} onChange={event => setDeclineReason(event.target.value)} rows={5} maxLength={2000} placeholder="Expliquez précisément pourquoi vous ne pouvez pas assurer cette réservation…" style={{ width: '100%', boxSizing: 'border-box', border: '1px solid #E8DFC8', borderRadius: 10, padding: 12, resize: 'vertical', font: 'inherit', color: '#1A1209' }} />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 9, marginTop: 16 }}>
              <button type="button" onClick={() => setDeclineTarget(null)} disabled={declining} style={{ border: '1px solid #E8DFC8', borderRadius: 999, padding: '10px 17px', background: 'white', color: '#7A6D5A', fontWeight: 700 }}>Retour</button>
              <button type="button" onClick={declineReservation} disabled={declining || declineReason.trim().length < 10} style={{ border: 0, borderRadius: 999, padding: '10px 17px', background: '#B91C1C', color: 'white', fontWeight: 800, opacity: declining || declineReason.trim().length < 10 ? .55 : 1 }}>{declining ? 'Envoi…' : 'Confirmer mon indisponibilité'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
