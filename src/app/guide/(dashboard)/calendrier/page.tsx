'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

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
  const buttonStyle: React.CSSProperties = {
    padding: '0.5rem 1.25rem', background: '#1A1209', color: '#F0D897', border: 'none', borderRadius: 50,
    fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'inherit',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', fontFamily: 'var(--font-manrope, sans-serif)' }}>
      <div style={{ background: acceptingBookings ? '#ECFDF5' : '#FEF2F2', border: `1px solid ${acceptingBookings ? '#6EE7B7' : '#FCA5A5'}`, borderRadius: 12, padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontWeight: 700, color: acceptingBookings ? '#166534' : '#991B1B' }}>Nouvelles réservations : {acceptingBookings ? 'activées' : 'en pause'}</div>
          <div style={{ fontSize: '0.78rem', color: '#7A6D5A', marginTop: 3 }}>{acceptingBookings ? 'Votre profil peut apparaître dans les recherches.' : 'Votre fiche publique reste accessible, mais la réservation est désactivée.'}</div>
        </div>
        <button onClick={toggleAcceptingBookings} disabled={saving !== null} style={{ ...buttonStyle, background: acceptingBookings ? '#991B1B' : '#166534', opacity: saving === 'global' ? 0.6 : 1 }}>
          {saving === 'global' ? 'Enregistrement…' : acceptingBookings ? 'Mettre en pause' : 'Réactiver les réservations'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        {(['MAKKAH', 'MADINAH'] as ServiceCity[]).map(item => (
          <button key={item} onClick={() => setCity(item)} style={{
            padding: '0.85rem', borderRadius: 12, border: city === item ? '2px solid #C9A84C' : '1px solid #E8DFC8',
            background: city === item ? '#FAF3E0' : 'white', fontWeight: 700, cursor: 'pointer', color: '#1A1209',
          }}>{item === 'MAKKAH' ? '🕋 Makkah' : '🌿 Médine'}</button>
        ))}
      </div>

      <div style={{ background: serviceEnabled ? '#ECFDF5' : '#FEF2F2', border: `1px solid ${serviceEnabled ? '#6EE7B7' : '#FCA5A5'}`, borderRadius: 12, padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontWeight: 700, color: serviceEnabled ? '#166534' : '#991B1B' }}>{city === 'MAKKAH' ? 'Service Makkah' : 'Service Médine'} : {serviceEnabled ? 'activé' : 'désactivé'}</div>
          <div style={{ fontSize: '0.78rem', color: '#7A6D5A', marginTop: 3 }}>{serviceEnabled ? 'Vous pouvez être choisi pour cette ville.' : 'Votre profil n’apparaît pas pour cette ville.'}</div>
        </div>
        <button onClick={toggleService} disabled={saving !== null} style={{ ...buttonStyle, background: serviceEnabled ? '#991B1B' : '#166534', opacity: saving === 'service' ? 0.6 : 1 }}>
          {saving === 'service' ? 'Enregistrement…' : serviceEnabled ? 'Désactiver cette ville' : 'Activer cette ville'}
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        <button onClick={() => setCurrentMonth(value => new Date(value.getFullYear(), value.getMonth() - 1, 1))} style={buttonStyle}>← Mois précédent</button>
        <h1 style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.5rem', fontWeight: 700, color: '#1A1209', margin: 0 }}>{MONTHS_FR[month]} {year}</h1>
        <button onClick={() => setCurrentMonth(value => new Date(value.getFullYear(), value.getMonth() + 1, 1))} style={buttonStyle}>Mois suivant →</button>
      </div>

      {error && <div style={{ background: '#FEE2E2', border: '1px solid #FCA5A5', borderRadius: 8, padding: '0.75rem 1rem', color: '#991B1B', fontSize: '0.82rem' }}>{error}</div>}

      <div style={{ display: 'flex', gap: '1rem', fontSize: '0.78rem', color: '#4A3F30', flexWrap: 'wrap' }}>
        <span>□ Sans marque : disponible</span><span style={{ color: '#DC2626' }}>✕ Rouge : indisponible</span><span style={{ color: '#1D4ED8' }}>● Bleu : réservé</span><span style={{ color: '#B45309' }}>● Orange : paiement en cours</span>
      </div>

      <div style={{ background: 'white', border: '1px solid #E8DFC8', borderRadius: 12, overflow: 'hidden', opacity: loading ? 0.6 : 1 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid #E8DFC8' }}>
          {DAYS_FR.map(day => <div key={day} style={{ padding: '0.6rem 0', textAlign: 'center', fontSize: '0.72rem', fontWeight: 700, color: '#7A6D5A' }}>{day}</div>)}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
          {cells.map((cell, index) => {
            if (!cell.inMonth || !cell.date) return <div key={index} style={{ minHeight: 80, background: '#FAFAF8', border: '1px solid #F0EBE0', padding: '0.5rem', color: '#D1C9BC' }}>{cell.day}</div>
            const record = availMap[cell.date]
            const isPast = cell.date < today
            const isBooked = record?.status === 'BOOKED'
            const isHeld = record?.status === 'HELD'
            const isUnavailable = record?.status === 'UNAVAILABLE'
            const disabled = isPast || isBooked || isHeld || !serviceEnabled
            const borderColor = isBooked ? '#93C5FD' : isHeld ? '#FCD34D' : isUnavailable ? '#FCA5A5' : '#F0EBE0'
            const background = isPast || !serviceEnabled ? '#F5F5F5' : isBooked ? '#DBEAFE' : isHeld ? '#FEF3C7' : isUnavailable ? '#FEE2E2' : 'white'
            const color = isBooked ? '#1D4ED8' : isHeld ? '#B45309' : isUnavailable ? '#DC2626' : '#1A1209'
            return (
              <button key={cell.date} onClick={() => handleDayClick(cell.date!)} disabled={disabled} style={{
                minHeight: 80, padding: '0.5rem', border: `1px solid ${borderColor}`, background, color,
                cursor: disabled ? 'not-allowed' : 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
                gap: '0.3rem', fontFamily: 'inherit', opacity: saving === cell.date ? 0.5 : 1,
              }}>
                <span style={{ fontWeight: 700 }}>{cell.day}</span>
                {isBooked && <span style={{ fontSize: '0.65rem', fontWeight: 700 }}>● Réservé</span>}
                {isHeld && <span style={{ fontSize: '0.65rem', fontWeight: 700 }}>● Paiement en cours</span>}
                {isUnavailable && <span style={{ fontSize: '0.65rem', fontWeight: 700 }}>✕ Indisponible</span>}
              </button>
            )
          })}
        </div>
      </div>

      <div style={{ background: 'white', border: '1px solid #E8DFC8', borderRadius: 12, padding: '1rem 1.5rem', display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        <span style={{ color: '#DC2626', fontWeight: 700 }}>{unavailableCount} indisponible(s)</span>
        <span style={{ color: '#1D4ED8', fontWeight: 700 }}>{bookedCount} réservé(s)</span>
        <span style={{ color: '#B45309', fontWeight: 700 }}>{heldCount} paiement(s) en cours</span>
      </div>

      <div style={{ background: '#FEF9EC', border: '1px solid #FCD34D', borderRadius: 12, padding: '1rem 1.5rem', fontSize: '0.82rem', color: '#92400E', lineHeight: 1.7 }}>
        Cliquez uniquement sur les dates où vous n’êtes pas disponible. Toutes les dates sans croix rouge sont considérées comme disponibles. Une date réservée ou en cours de paiement ne peut pas être modifiée.
      </div>
    </div>
  )
}
