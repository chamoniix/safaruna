'use client'

import { useState, useEffect } from 'react'
import { PLACES, getPlacesByCategory } from '@/lib/places'

export default function GuideLieuxPage() {
  const [placesMap, setPlacesMap] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState<string | null>(null)
  const [suggestion, setSuggestion] = useState('')
  const [suggestionSent, setSuggestionSent] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetch('/api/guide/lieux')
      .then(r => r.json())
      .then(data => {
        setPlacesMap(data.places || {})
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const handleToggle = async (placeKey: string, isBase: boolean) => {
    if (isBase) return
    setToggling(placeKey)
    setPlacesMap(prev => ({ ...prev, [placeKey]: !prev[placeKey] }))
    await fetch('/api/guide/lieux', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ placeKey }),
    }).catch(() => {})
    setToggling(null)
  }

  const handleSuggest = async () => {
    if (!suggestion.trim()) return
    setIsSubmitting(true)
    try {
      await fetch('/api/guide/lieux/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ suggestion }),
      })
      setSuggestionSent(true)
      setSuggestion('')
    } catch { /* silent */ }
    setIsSubmitting(false)
  }

  const categories = [
    { key: 'MAKKAH', label: 'Makkah', emoji: '🕋' },
    { key: 'MADINAH', label: 'Madinah', emoji: '🌿' },
    { key: 'HISTORIQUE', label: 'Sites historiques', emoji: '⚔️' },
  ] as const

  const activeCount = PLACES.filter(p => p.includedInBase || placesMap[p.key]).length
  const makkahActive = PLACES.filter(p => p.category === 'MAKKAH' && (p.includedInBase || placesMap[p.key])).length
  const madinahActive = PLACES.filter(p => p.category === 'MADINAH' && (p.includedInBase || placesMap[p.key])).length

  const labelStyle: React.CSSProperties = {
    fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em',
    textTransform: 'uppercase', color: '#7A6D5A', marginBottom: 4, display: 'block',
  }

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {[200, 340, 180].map((h, i) => (
        <div key={i} style={{ background: '#F0EDE8', borderRadius: 12, height: h, border: '1px solid #E8DFC8' }} />
      ))}
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', fontFamily: 'var(--font-manrope, sans-serif)' }}>

      {/* Header info */}
      <div style={{ background: '#FEF9EC', border: '1px solid #FCD34D', borderRadius: 12, padding: '1rem 1.5rem', fontSize: '0.83rem', color: '#92400E', lineHeight: 1.7 }}>
        Activez les lieux que vous maîtrisez. Les lieux inactifs apparaîtront grisés sur votre profil public. Les pèlerins pourront les voir mais ne pourront pas les sélectionner pour leur réservation.
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
        {[
          { label: 'Total actifs', value: activeCount, color: '#1A1209' },
          { label: 'Makkah actifs', value: makkahActive, color: '#1D5C3A' },
          { label: 'Madinah actifs', value: madinahActive, color: '#1D4ED8' },
        ].map(s => (
          <div key={s.label} style={{ background: 'white', border: '1px solid #E8DFC8', borderRadius: 12, padding: '1.25rem' }}>
            <div style={labelStyle}>{s.label}</div>
            <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '2rem', fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Sections par catégorie */}
      {categories.map(cat => {
        const catPlaces = getPlacesByCategory(cat.key)
        const catActive = catPlaces.filter(p => p.includedInBase || placesMap[p.key]).length
        return (
          <div key={cat.key} style={{ background: 'white', border: '1px solid #E8DFC8', borderRadius: 12, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.2rem', fontWeight: 700, color: '#1A1209' }}>
                {cat.emoji} {cat.label}
              </span>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, background: '#F5F0E8', color: '#7A6D5A', padding: '0.2rem 0.6rem', borderRadius: 20 }}>
                {catActive}/{catPlaces.length} actifs
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '0.75rem' }}>
              {catPlaces.map(place => {
                const isActive = place.includedInBase || placesMap[place.key] === true
                const isTogg = toggling === place.key
                return (
                  <div
                    key={place.key}
                    style={{
                      background: isActive ? '#D1FAE5' : 'white',
                      border: `1px solid ${isActive ? '#1D5C3A' : '#E8DFC8'}`,
                      borderRadius: 10, padding: '0.875rem 1rem',
                      display: 'flex', alignItems: 'center', gap: '0.875rem',
                      opacity: isTogg ? 0.6 : 1, transition: 'opacity 0.15s',
                    }}
                  >
                    <span style={{ fontSize: '1.4rem', flexShrink: 0 }}>{place.emoji}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1A1209' }}>{place.nameFr}</div>
                      <div style={{ fontSize: '0.72rem', color: '#7A6D5A', marginTop: 2, lineHeight: 1.4 }}>{place.desc}</div>
                      {place.includedInBase && (
                        <span style={{ display: 'inline-block', marginTop: 4, fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.06em', background: '#FEF9EC', color: '#8B6914', border: '1px solid #FCD34D', padding: '0.15rem 0.5rem', borderRadius: 20 }}>
                          Inclus dans le package
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => handleToggle(place.key, place.includedInBase)}
                      disabled={place.includedInBase || isTogg}
                      style={{
                        padding: '0.3rem 0.875rem', borderRadius: 50,
                        border: 'none',
                        background: isActive ? '#1D5C3A' : '#F3F4F6',
                        color: isActive ? 'white' : '#9CA3AF',
                        fontSize: '0.72rem', fontWeight: 700,
                        cursor: place.includedInBase ? 'not-allowed' : 'pointer',
                        fontFamily: 'inherit', flexShrink: 0,
                        opacity: place.includedInBase ? 0.7 : 1,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {isActive ? 'ACTIF' : 'INACTIF'}
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}

      {/* Proposer un lieu */}
      <div style={{ background: 'white', border: '1px solid #E8DFC8', borderRadius: 12, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.2rem', fontWeight: 700, color: '#1A1209' }}>Proposer un nouveau lieu</div>
          <div style={{ fontSize: '0.78rem', color: '#7A6D5A', marginTop: 2 }}>
            Vous connaissez un lieu saint qui n&apos;est pas dans notre liste ? Suggérez-le à notre équipe.
          </div>
        </div>
        {suggestionSent ? (
          <div style={{ background: '#D1FAE5', border: '1px solid #6EE7B7', borderRadius: 8, padding: '0.875rem 1rem', fontSize: '0.85rem', fontWeight: 600, color: '#1D5C3A' }}>
            Suggestion envoyée — merci !
          </div>
        ) : (
          <>
            <textarea
              value={suggestion}
              onChange={e => setSuggestion(e.target.value)}
              rows={3}
              placeholder="Ex: Masjid Al-Ijaba à Madinah — lieu où le Prophète fit du'a pour sa communauté..."
              style={{ width: '100%', padding: '0.6rem 0.875rem', border: '1.5px solid #E8DFC8', borderRadius: 8, fontSize: '0.85rem', fontFamily: 'inherit', color: '#1A1209', background: 'white', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
            />
            <button
              onClick={handleSuggest}
              disabled={isSubmitting || !suggestion.trim()}
              style={{ padding: '0.65rem 1.75rem', background: isSubmitting ? '#9CA3AF' : '#1A1209', color: '#F0D897', border: 'none', borderRadius: 50, fontWeight: 700, fontSize: '0.85rem', cursor: isSubmitting ? 'not-allowed' : 'pointer', fontFamily: 'inherit', alignSelf: 'flex-start', opacity: !suggestion.trim() ? 0.5 : 1 }}
            >
              {isSubmitting ? 'Envoi...' : 'Envoyer la suggestion'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
