'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Landmark,
  LoaderCircle,
  MapPin,
  Power,
  X,
} from 'lucide-react'

type ServiceCity = 'MAKKAH' | 'MADINAH'
type Avail = { id: string; date: string; status: 'AVAILABLE' | 'BOOKED' | 'UNAVAILABLE' | 'HELD'; city: string }

const DAYS_FR = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
const MONTHS_FR = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']

function toYMD(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export default function GuideCalendrierPage() {
  const [city, setCity] = useState<ServiceCity>('MAKKAH')
  const [availabilities, setAvailabilities] = useState<Avail[]>([])
  const [services, setServices] = useState({ makkah: false, madinah: false })
  const [acceptingBookings, setAcceptingBookings] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [currentMonth, setCurrentMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1))

  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()
  const rangeFrom = toYMD(new Date(year, month, 1))
  const rangeTo = toYMD(new Date(year, month + 1, 0))

  const fetchAvails = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams({ city, from: rangeFrom, to: rangeTo })
      const response = await fetch(`/api/guide/calendrier?${params}`)
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Chargement impossible')
      setAvailabilities(data.availabilities || [])
      setServices(data.services || { makkah: false, madinah: false })
      setAcceptingBookings(Boolean(data.acceptingBookings))
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Chargement impossible')
    }
    setLoading(false)
  }, [city, rangeFrom, rangeTo])

  useEffect(() => { fetchAvails() }, [fetchAvails])

  const availMap = useMemo(() => Object.fromEntries(availabilities.map(item => [item.date, item])), [availabilities])
  const serviceEnabled = city === 'MAKKAH' ? services.makkah : services.madinah

  const toggleAcceptingBookings = async () => {
    const enabled = !acceptingBookings
    if (!enabled && !window.confirm('Mettre toutes les nouvelles réservations en pause ? Vos réservations déjà payées restent inchangées.')) return
    setSaving('global')
    setError('')
    try {
      const response = await fetch('/api/guide/calendrier', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ acceptingBookings: enabled }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Modification impossible')
      setAcceptingBookings(enabled)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Modification impossible')
    }
    setSaving(null)
  }

  const toggleService = async () => {
    const enabled = !serviceEnabled
    if (!enabled && !window.confirm(`Désactiver ${city === 'MAKKAH' ? 'Makkah' : 'Médine'} pour les nouvelles réservations ? Vos réservations déjà payées restent inchangées.`)) return
    setSaving('service')
    setError('')
    try {
      const response = await fetch('/api/guide/calendrier', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ city, enabled }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Modification impossible')
      setServices(previous => city === 'MAKKAH' ? { ...previous, makkah: enabled } : { ...previous, madinah: enabled })
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Modification impossible')
    }
    setSaving(null)
  }

  const handleDayClick = async (date: string) => {
    const current = availMap[date]
    if (current?.status === 'BOOKED' || current?.status === 'HELD' || !serviceEnabled) return
    const previous = availabilities
    const remove = current?.status === 'UNAVAILABLE'
    setAvailabilities(remove
      ? previous.filter(item => item.date !== date)
      : [...previous, { id: `optimistic-${date}`, date, city, status: 'UNAVAILABLE' }])
    setSaving(date)
    setError('')
    try {
      const response = await fetch('/api/guide/calendrier', {
        method: remove ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, city, ...(!remove && { status: 'UNAVAILABLE' }) }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Modification impossible')
      await fetchAvails()
    } catch (cause) {
      setAvailabilities(previous)
      setError(cause instanceof Error ? cause.message : 'Modification impossible')
    }
    setSaving(null)
  }

  const firstDay = new Date(year, month, 1)
  const startOffset = (firstDay.getDay() + 6) % 7
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: Array<{ date: string | null; day: number; inMonth: boolean }> = []
  const daysInPreviousMonth = new Date(year, month, 0).getDate()
  for (let index = startOffset - 1; index >= 0; index--) cells.push({ date: null, day: daysInPreviousMonth - index, inMonth: false })
  for (let day = 1; day <= daysInMonth; day++) cells.push({ date: toYMD(new Date(year, month, day)), day, inMonth: true })
  while (cells.length % 7 !== 0) cells.push({ date: null, day: cells.length % 7, inMonth: false })

  const today = toYMD(new Date())
  const unavailableCount = availabilities.filter(item => item.status === 'UNAVAILABLE').length
  const bookedCount = availabilities.filter(item => item.status === 'BOOKED').length
  const heldCount = availabilities.filter(item => item.status === 'HELD').length
  return (
    <div className="guide-calendar-page">
      <style>{`
        .guide-calendar-page {
          --calendar-ink: #1A1209;
          --calendar-muted: #6F6455;
          --calendar-line: #E8DFC8;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          font-family: var(--font-manrope, sans-serif);
        }
        .calendar-page-heading { display: grid; grid-template-columns: minmax(0, 1fr) minmax(340px, 0.82fr); gap: 1.25rem; align-items: stretch; }
        .calendar-title { padding: 0.25rem 0; }
        .calendar-eyebrow { display: inline-flex; align-items: center; gap: 0.45rem; color: #8A6D20; font-size: 0.75rem; font-weight: 800; letter-spacing: 0.09em; text-transform: uppercase; }
        .calendar-title h1 { margin: 0.35rem 0 0.3rem; color: var(--calendar-ink); font: 700 clamp(2rem, 4vw, 2.7rem)/1 var(--font-cormorant, serif); }
        .calendar-title p { margin: 0; max-width: 660px; color: var(--calendar-muted); font-size: 0.9rem; line-height: 1.55; }
        .calendar-status-panel { display: flex; align-items: center; justify-content: space-between; gap: 1rem; border: 1px solid; border-radius: 14px; padding: 1rem 1.1rem; }
        .calendar-status-panel.is-on { background: #F0FAF5; border-color: #A7D8BE; }
        .calendar-status-panel.is-off { background: #FFF4F3; border-color: #F1B5AF; }
        .calendar-status-copy { display: flex; align-items: center; gap: 0.75rem; min-width: 0; }
        .calendar-status-icon { width: 40px; height: 40px; display: grid; place-items: center; border-radius: 10px; flex: 0 0 40px; }
        .is-on .calendar-status-icon { color: #166534; background: #D9F3E5; }
        .is-off .calendar-status-icon { color: #991B1B; background: #FDE2DF; }
        .calendar-status-copy strong { display: block; color: var(--calendar-ink); font-size: 0.92rem; }
        .calendar-status-copy span { display: block; margin-top: 0.15rem; color: var(--calendar-muted); font-size: 0.78rem; line-height: 1.4; }
        .calendar-action { min-height: 44px; padding: 0.62rem 1rem; border: 0; border-radius: 10px; color: white; font: 700 0.78rem/1 var(--font-manrope, sans-serif); cursor: pointer; white-space: nowrap; }
        .calendar-action.is-danger { background: #9F2D28; }
        .calendar-action.is-success { background: #17633D; }
        .calendar-action:disabled { cursor: not-allowed; opacity: 0.58; }
        .calendar-city-workspace { overflow: hidden; border: 1px solid var(--calendar-line); border-radius: 14px; background: white; }
        .calendar-city-tabs { display: grid; grid-template-columns: 1fr 1fr; padding: 0.4rem; gap: 0.4rem; background: #F1EDE5; }
        .calendar-city-tab { min-height: 54px; display: flex; align-items: center; justify-content: center; gap: 0.6rem; border: 0; border-radius: 10px; background: transparent; color: #625746; font: 700 0.9rem/1 var(--font-manrope, sans-serif); cursor: pointer; }
        .calendar-city-tab.is-selected { background: white; color: var(--calendar-ink); box-shadow: 0 2px 8px rgba(26,18,9,0.09); }
        .calendar-city-tab__state { width: 7px; height: 7px; border-radius: 50%; background: #B0A797; }
        .calendar-city-tab__state.is-on { background: #228653; box-shadow: 0 0 0 3px rgba(34,134,83,0.12); }
        .calendar-city-control { min-height: 74px; display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding: 0.9rem 1.1rem; border-top: 1px solid var(--calendar-line); }
        .calendar-city-control strong { color: var(--calendar-ink); font-size: 0.92rem; }
        .calendar-city-control p { margin: 0.18rem 0 0; color: var(--calendar-muted); font-size: 0.78rem; }
        .calendar-board { position: relative; overflow: hidden; border: 1px solid var(--calendar-line); border-radius: 14px; background: white; box-shadow: 0 8px 26px rgba(26,18,9,0.05); }
        .calendar-toolbar { display: grid; grid-template-columns: 44px 1fr 44px; align-items: center; gap: 0.75rem; padding: 1rem 1.1rem 0.85rem; border-bottom: 1px solid var(--calendar-line); }
        .calendar-toolbar h2 { margin: 0; color: var(--calendar-ink); font: 700 1.55rem/1.1 var(--font-cormorant, serif); text-align: center; }
        .calendar-month-button { width: 44px; height: 44px; display: grid; place-items: center; border: 1px solid #DCD2C0; border-radius: 10px; background: #FAF8F4; color: var(--calendar-ink); cursor: pointer; }
        .calendar-legend { display: flex; align-items: center; justify-content: center; gap: 0.55rem; padding: 0.8rem 1rem; background: #FCFBF8; border-bottom: 1px solid var(--calendar-line); flex-wrap: wrap; }
        .calendar-legend-item { min-height: 32px; display: inline-flex; align-items: center; gap: 0.38rem; padding: 0.3rem 0.55rem; border: 1px solid #EEE7DA; border-radius: 8px; background: white; color: #514838; font-size: 0.75rem; font-weight: 650; }
        .calendar-legend-dot { width: 9px; height: 9px; border-radius: 3px; border: 1.5px solid #B8AE9E; background: white; }
        .calendar-legend-dot.is-unavailable { border-color: #E5847B; background: #FDE6E3; }
        .calendar-legend-dot.is-booked { border-color: #70A7EB; background: #DBEAFE; }
        .calendar-legend-dot.is-held { border-color: #E0A732; background: #FEF0BD; }
        .calendar-weekdays, .calendar-grid { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); }
        .calendar-weekday { padding: 0.65rem 0.25rem; border-bottom: 1px solid var(--calendar-line); color: #6F6455; font-size: 0.72rem; font-weight: 800; text-align: center; text-transform: uppercase; letter-spacing: 0.04em; }
        .calendar-empty-day, .calendar-day { min-height: 82px; padding: 0.55rem; border: 0; border-right: 1px solid #EEE8DD; border-bottom: 1px solid #EEE8DD; box-sizing: border-box; }
        .calendar-empty-day { background: #F8F6F2; color: #C7BFB2; }
        .calendar-day { position: relative; display: flex; flex-direction: column; align-items: flex-start; gap: 0.35rem; color: var(--calendar-ink); font-family: inherit; cursor: pointer; }
        .calendar-day:not(:disabled):hover { box-shadow: inset 0 0 0 2px #C9A84C; z-index: 1; }
        .calendar-day:disabled { cursor: not-allowed; }
        .calendar-day-number { font-size: 0.9rem; font-weight: 800; }
        .calendar-day-status { display: inline-flex; align-items: center; gap: 0.3rem; font-size: 0.66rem; font-weight: 800; line-height: 1.3; }
        .calendar-fetching { position: absolute; inset: 0; z-index: 4; display: grid; place-items: center; background: rgba(255,255,255,0.72); backdrop-filter: blur(1.5px); }
        .calendar-fetching div { display: inline-flex; align-items: center; gap: 0.6rem; padding: 0.7rem 0.9rem; border: 1px solid var(--calendar-line); border-radius: 10px; background: white; color: var(--calendar-ink); font-size: 0.78rem; font-weight: 750; box-shadow: 0 8px 25px rgba(26,18,9,0.08); }
        .calendar-spin { animation: calendar-spin 0.72s linear infinite; }
        @keyframes calendar-spin { to { transform: rotate(360deg); } }
        .calendar-summary { display: flex; gap: 0.65rem; flex-wrap: wrap; }
        .calendar-summary span { min-height: 40px; display: inline-flex; align-items: center; gap: 0.45rem; padding: 0.45rem 0.75rem; border: 1px solid var(--calendar-line); border-radius: 9px; background: white; color: #514838; font-size: 0.78rem; font-weight: 750; }
        .calendar-note { display: flex; align-items: flex-start; gap: 0.65rem; padding: 0.9rem 1rem; border: 1px solid #E8D39A; border-radius: 11px; background: #FFF9E9; color: #71500B; font-size: 0.82rem; line-height: 1.6; }
        @media (max-width: 760px) {
          .guide-calendar-page { gap: 1rem; }
          .calendar-page-heading { grid-template-columns: 1fr; gap: 0.85rem; }
          .calendar-title h1 { font-size: 2.15rem; }
          .calendar-title p { font-size: 0.84rem; }
          .calendar-status-panel, .calendar-city-control { align-items: stretch; flex-direction: column; }
          .calendar-action { width: 100%; }
          .calendar-city-tab { min-height: 52px; }
          .calendar-toolbar { padding: 0.8rem; }
          .calendar-toolbar h2 { font-size: 1.35rem; }
          .calendar-legend { justify-content: flex-start; padding: 0.7rem; gap: 0.4rem; }
          .calendar-legend-item { font-size: 0.69rem; }
          .calendar-weekday { padding: 0.55rem 0.1rem; font-size: 0.62rem; }
          .calendar-empty-day, .calendar-day { min-height: 64px; padding: 0.42rem; }
          .calendar-day-status span { display: none; }
          .calendar-summary { display: grid; grid-template-columns: 1fr; }
          .calendar-summary span { width: 100%; box-sizing: border-box; }
        }
        @media (prefers-reduced-motion: reduce) { .calendar-spin { animation-duration: 1.5s; } }
      `}</style>

      <div className="calendar-page-heading">
        <div className="calendar-title">
          <span className="calendar-eyebrow"><CalendarDays size={16} /> Disponibilités</span>
          <h1>Calendrier</h1>
          <p>Indiquez uniquement les dates où vous n’êtes pas disponible. Les autres dates restent ouvertes à la réservation.</p>
        </div>

        <div className={`calendar-status-panel ${acceptingBookings ? 'is-on' : 'is-off'}`}>
          <div className="calendar-status-copy">
            <span className="calendar-status-icon"><Power size={20} /></span>
            <div>
              <strong>Nouvelles réservations {acceptingBookings ? 'activées' : 'en pause'}</strong>
              <span>{acceptingBookings ? 'Votre profil peut apparaître dans les recherches.' : 'Votre fiche reste accessible sans nouvelle réservation.'}</span>
            </div>
          </div>
          <button type="button" onClick={toggleAcceptingBookings} disabled={saving !== null} className={`calendar-action ${acceptingBookings ? 'is-danger' : 'is-success'}`}>
            {saving === 'global' ? 'Enregistrement…' : acceptingBookings ? 'Mettre en pause' : 'Réactiver'}
          </button>
        </div>
      </div>

      <section className="calendar-city-workspace" aria-label="Disponibilités par ville">
        <div className="calendar-city-tabs" role="tablist" aria-label="Choisir une ville">
          {(['MAKKAH', 'MADINAH'] as ServiceCity[]).map(item => {
            const itemEnabled = item === 'MAKKAH' ? services.makkah : services.madinah
            const CityIcon = item === 'MAKKAH' ? Landmark : MapPin
            return (
              <button key={item} type="button" role="tab" aria-selected={city === item} onClick={() => setCity(item)} className={`calendar-city-tab${city === item ? ' is-selected' : ''}`}>
                <CityIcon size={18} />
                <span>{item === 'MAKKAH' ? 'Makkah' : 'Médine'}</span>
                <span className={`calendar-city-tab__state${itemEnabled ? ' is-on' : ''}`} aria-label={itemEnabled ? 'activée' : 'désactivée'} />
              </button>
            )
          })}
        </div>
        <div className="calendar-city-control">
          <div>
            <strong>{city === 'MAKKAH' ? 'Makkah' : 'Médine'} · {serviceEnabled ? 'activée' : 'désactivée'}</strong>
            <p>{serviceEnabled ? 'Les pèlerins peuvent vous choisir pour cette ville.' : 'Votre profil n’apparaît pas dans les recherches pour cette ville.'}</p>
          </div>
          <button type="button" onClick={toggleService} disabled={saving !== null} className={`calendar-action ${serviceEnabled ? 'is-danger' : 'is-success'}`}>
            {saving === 'service' ? 'Enregistrement…' : serviceEnabled ? 'Désactiver cette ville' : 'Activer cette ville'}
          </button>
        </div>
      </section>

      {error && <div role="alert" style={{ background: '#FEE2E2', border: '1px solid #FCA5A5', borderRadius: 9, padding: '0.8rem 1rem', color: '#991B1B', fontSize: '0.84rem' }}>{error}</div>}

      <section className="calendar-board" aria-busy={loading}>
        <div className="calendar-toolbar">
          <button type="button" aria-label="Mois précédent" onClick={() => setCurrentMonth(value => new Date(value.getFullYear(), value.getMonth() - 1, 1))} className="calendar-month-button"><ChevronLeft size={20} /></button>
          <h2>{MONTHS_FR[month]} {year}</h2>
          <button type="button" aria-label="Mois suivant" onClick={() => setCurrentMonth(value => new Date(value.getFullYear(), value.getMonth() + 1, 1))} className="calendar-month-button"><ChevronRight size={20} /></button>
        </div>

        <div className="calendar-legend" aria-label="Légende du calendrier">
          <span className="calendar-legend-item"><span className="calendar-legend-dot" /> Disponible</span>
          <span className="calendar-legend-item"><span className="calendar-legend-dot is-unavailable" /> Indisponible</span>
          <span className="calendar-legend-item"><span className="calendar-legend-dot is-booked" /> Réservé</span>
          <span className="calendar-legend-item"><span className="calendar-legend-dot is-held" /> Paiement en cours</span>
        </div>

        <div className="calendar-weekdays">
          {DAYS_FR.map(day => <div key={day} className="calendar-weekday">{day}</div>)}
        </div>
        <div className="calendar-grid">
          {cells.map((cell, index) => {
            if (!cell.inMonth || !cell.date) return <div key={index} className="calendar-empty-day">{cell.day}</div>
            const record = availMap[cell.date]
            const isPast = cell.date < today
            const isBooked = record?.status === 'BOOKED'
            const isHeld = record?.status === 'HELD'
            const isUnavailable = record?.status === 'UNAVAILABLE'
            const disabled = isPast || isBooked || isHeld || !serviceEnabled
            const borderColor = isBooked ? '#93C5FD' : isHeld ? '#FCD34D' : isUnavailable ? '#FCA5A5' : '#F0EBE0'
            const background = isPast || !serviceEnabled ? '#F5F5F5' : isBooked ? '#DBEAFE' : isHeld ? '#FEF3C7' : isUnavailable ? '#FEE2E2' : 'white'
            const color = isBooked ? '#1D4ED8' : isHeld ? '#B45309' : isUnavailable ? '#DC2626' : '#1A1209'
            const statusLabel = isBooked ? 'Réservé' : isHeld ? 'Paiement en cours' : isUnavailable ? 'Indisponible' : 'Disponible'
            return (
              <button key={cell.date} type="button" aria-label={`${cell.day} ${MONTHS_FR[month]} ${year} · ${statusLabel}`} aria-pressed={isUnavailable} onClick={() => handleDayClick(cell.date!)} disabled={disabled} className="calendar-day" style={{ borderColor, background, color, opacity: saving === cell.date ? 0.58 : 1 }}>
                <span className="calendar-day-number">{cell.day}</span>
                {saving === cell.date && <span className="calendar-day-status"><LoaderCircle size={14} className="calendar-spin" /><span>Enregistrement</span></span>}
                {saving !== cell.date && isBooked && <span className="calendar-day-status"><CheckCircle2 size={14} /><span>Réservé</span></span>}
                {saving !== cell.date && isHeld && <span className="calendar-day-status"><Clock3 size={14} /><span>Paiement en cours</span></span>}
                {saving !== cell.date && isUnavailable && <span className="calendar-day-status"><X size={14} /><span>Indisponible</span></span>}
              </button>
            )
          })}
        </div>
        {loading && <div className="calendar-fetching"><div><LoaderCircle size={17} className="calendar-spin" /> Mise à jour du calendrier…</div></div>}
      </section>

      <div className="calendar-summary" aria-label="Résumé du mois">
        <span><X size={16} color="#C0392B" /> {unavailableCount} indisponible(s)</span>
        <span><CheckCircle2 size={16} color="#2563EB" /> {bookedCount} réservé(s)</span>
        <span><Clock3 size={16} color="#B45309" /> {heldCount} paiement(s) en cours</span>
      </div>

      <div className="calendar-note">
        <CalendarDays size={18} style={{ flex: '0 0 18px', marginTop: 2 }} />
        Cliquez uniquement sur les dates où vous n’êtes pas disponible. Toutes les dates sans croix rouge sont considérées comme disponibles. Une date réservée ou en cours de paiement ne peut pas être modifiée.
      </div>
    </div>
  )
}
