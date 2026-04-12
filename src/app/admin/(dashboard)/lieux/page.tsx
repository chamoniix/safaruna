'use client'

import { useState, useEffect } from 'react'

type PlaceRow = {
  key: string
  emoji: string
  nameFr: string
  nameAr: string
  category: string
  includedInBase: boolean
  price: number
}

function Skeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} style={{ height: 48, background: '#F0EBE0', borderRadius: 8, animation: 'pulse 1.5s ease-in-out infinite', opacity: 0.7 - i * 0.05 }} />
      ))}
      <style>{`@keyframes pulse { 0%,100%{opacity:.7}50%{opacity:.4} }`}</style>
    </div>
  )
}

export default function AdminLieuxPage() {
  const [places, setPlaces] = useState<PlaceRow[]>([])
  const [loading, setLoading] = useState(true)
  const [editingKey, setEditingKey] = useState<string | null>(null)
  const [editPrice, setEditPrice] = useState('')
  const [saving, setSaving] = useState<string | null>(null)
  const [savedKey, setSavedKey] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/admin/lieux')
      .then(r => r.json())
      .then(d => { setPlaces(d.places || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const handleSave = async (placeKey: string) => {
    setSaving(placeKey)
    const price = Number(editPrice)
    await fetch('/api/admin/lieux', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ placeKey, price }),
    })
    setPlaces(prev => prev.map(p => p.key === placeKey ? { ...p, price } : p))
    setEditingKey(null)
    setSaving(null)
    setSavedKey(placeKey)
    setTimeout(() => setSavedKey(null), 2000)
  }

  const makkah    = places.filter(p => p.category === 'MAKKAH')
  const madinah   = places.filter(p => p.category === 'MADINAH')
  const historique = places.filter(p => p.category === 'HISTORIQUE')

  const avgPrice = places.filter(p => !p.includedInBase).length > 0
    ? Math.round(places.filter(p => !p.includedInBase).reduce((s, p) => s + p.price, 0) / places.filter(p => !p.includedInBase).length)
    : 0
  const baseCount = places.filter(p => p.includedInBase).length

  const thStyle: React.CSSProperties = {
    padding: '0.5rem 0.875rem', fontSize: '0.65rem', fontWeight: 700,
    letterSpacing: '0.1em', textTransform: 'uppercase', color: '#7A6D5A',
    textAlign: 'left', borderBottom: '1px solid #E8DFC8', whiteSpace: 'nowrap',
  }
  const tdStyle: React.CSSProperties = {
    padding: '0.7rem 0.875rem', fontSize: '0.82rem', color: '#1A1209',
    borderBottom: '1px solid #F0EBE0', verticalAlign: 'middle',
  }

  const renderSection = (label: string, rows: PlaceRow[], color: string) => (
    <div style={{ background: 'white', border: '1px solid #E8DFC8', borderRadius: 12, overflow: 'hidden', marginBottom: '1.5rem' }}>
      <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #F0EBE0', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ width: 4, height: 20, background: color, borderRadius: 2 }} />
        <span style={{ fontFamily: 'Georgia, serif', fontSize: '1.1rem', fontWeight: 600, color: '#1A1209' }}>{label}</span>
        <span style={{ fontSize: '0.72rem', color: '#9CA3AF', marginLeft: 2 }}>{rows.length} lieux</span>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#FAFAF8' }}>
              <th style={thStyle}>Lieu</th>
              <th style={{ ...thStyle, display: 'none' }}>Arabe</th>
              <th style={thStyle}>Statut</th>
              <th style={thStyle}>Prix</th>
              <th style={thStyle}>Modifier</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(place => (
              <tr key={place.key} style={{ background: 'white' }}>
                <td style={tdStyle}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.1rem' }}>{place.emoji}</span>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.82rem' }}>{place.nameFr}</div>
                      <div style={{ fontSize: '0.65rem', color: '#9CA3AF', direction: 'rtl' }}>{place.nameAr}</div>
                    </div>
                  </div>
                </td>
                <td style={tdStyle}>
                  {place.includedInBase ? (
                    <span style={{ background: '#FEF9EC', color: '#8B6914', border: '1px solid #FCD34D', borderRadius: 20, fontSize: '0.65rem', fontWeight: 700, padding: '0.2rem 0.65rem' }}>
                      ★ Inclus de base
                    </span>
                  ) : (
                    <span style={{ background: '#F0F9FF', color: '#0369A1', border: '1px solid #BAE6FD', borderRadius: 20, fontSize: '0.65rem', fontWeight: 700, padding: '0.2rem 0.65rem' }}>
                      + Visite supp.
                    </span>
                  )}
                </td>
                <td style={tdStyle}>
                  {place.includedInBase ? (
                    <span style={{ color: '#9CA3AF', fontSize: '0.82rem' }}>—</span>
                  ) : (
                    <span style={{ fontWeight: 700, fontSize: '0.88rem', color: '#1A1209' }}>{place.price} €</span>
                  )}
                </td>
                <td style={tdStyle}>
                  {place.includedInBase ? (
                    <span style={{ color: '#D1D5DB', fontSize: '0.72rem' }}>Non applicable</span>
                  ) : editingKey === place.key ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <input
                        type="number"
                        value={editPrice}
                        min={0} max={999} step={5}
                        onChange={e => setEditPrice(e.target.value)}
                        style={{ width: 80, padding: '0.35rem 0.5rem', border: '1.5px solid #C9A84C', borderRadius: 6, fontSize: '0.82rem', outline: 'none', textAlign: 'center' }}
                        autoFocus
                        onKeyDown={e => { if (e.key === 'Enter') handleSave(place.key); if (e.key === 'Escape') setEditingKey(null) }}
                      />
                      <button
                        onClick={() => handleSave(place.key)}
                        disabled={saving === place.key}
                        style={{ padding: '0.35rem 0.75rem', background: '#1D5C3A', color: 'white', border: 'none', borderRadius: 20, fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer' }}
                      >
                        {saving === place.key ? '…' : '✓ OK'}
                      </button>
                      <button
                        onClick={() => setEditingKey(null)}
                        style={{ padding: '0.35rem 0.6rem', background: 'white', color: '#7A6D5A', border: '1px solid #E8DFC8', borderRadius: 20, fontSize: '0.72rem', cursor: 'pointer' }}
                      >
                        Annuler
                      </button>
                    </div>
                  ) : savedKey === place.key ? (
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#1D5C3A' }}>✓ Sauvegardé</span>
                  ) : (
                    <button
                      onClick={() => { setEditingKey(place.key); setEditPrice(String(place.price)) }}
                      style={{ padding: '0.3rem 0.75rem', background: 'white', color: '#1A1209', border: '1px solid #E8DFC8', borderRadius: 20, fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer' }}
                    >
                      Modifier
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )

  return (
    <div style={{ maxWidth: 860 }}>
      {/* Header */}
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '1.75rem', fontWeight: 700, color: '#1A1209', margin: 0, marginBottom: '0.25rem' }}>
          Lieux &amp; Tarifs
        </h1>
        <p style={{ fontSize: '0.82rem', color: '#7A6D5A', margin: 0 }}>
          Gérez les tarifs des visites supplémentaires pour tous les guides.
        </p>
      </div>

      {/* Info card */}
      <div style={{ background: '#FEF9EC', border: '1px solid #FCD34D', borderRadius: 10, padding: '0.875rem 1.25rem', marginBottom: '1.75rem', fontSize: '0.82rem', color: '#92400E', lineHeight: 1.6 }}>
        💡 Ces tarifs s&apos;appliquent à tous les guides. Les lieux inclus dans un package de base (★) sont toujours gratuits pour le client — le prix affiché ici est le surcoût pour les visites supplémentaires.
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.75rem' }}>
        {[
          { label: 'Total lieux', value: '23', sub: 'dans le catalogue' },
          { label: 'Prix moyen', value: loading ? '—' : `${avgPrice} €`, sub: 'visites supplémentaires' },
          { label: 'Inclus de base', value: loading ? '—' : String(baseCount), sub: 'lieux toujours inclus' },
        ].map(stat => (
          <div key={stat.label} style={{ background: 'white', border: '1px solid #E8DFC8', borderRadius: 10, padding: '1rem 1.25rem' }}>
            <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#7A6D5A', marginBottom: '0.35rem' }}>{stat.label}</div>
            <div style={{ fontFamily: 'Georgia, serif', fontSize: '1.75rem', fontWeight: 700, color: '#1A1209', lineHeight: 1 }}>{stat.value}</div>
            <div style={{ fontSize: '0.65rem', color: '#9CA3AF', marginTop: '0.25rem' }}>{stat.sub}</div>
          </div>
        ))}
      </div>

      {/* Tables */}
      {loading ? (
        <Skeleton />
      ) : (
        <>
          {renderSection('Makkah Al-Mukarramah', makkah, '#C9A84C')}
          {renderSection('Al-Madinah Al-Munawwarah', madinah, '#1A1209')}
          {renderSection('Sites Historiques', historique, '#9CA3AF')}
        </>
      )}
    </div>
  )
}
