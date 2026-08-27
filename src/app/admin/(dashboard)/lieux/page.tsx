'use client'

import { useEffect, useState } from 'react'

type PlaceRow = {
  key: string
  emoji: string
  nameFr: string
  nameAr: string
  category: string
  includedInBase: boolean
  isActive: boolean
  netUpTo6: number
  netUpTo15: number
  netUpTo32: number
}

function Toggle({ checked, disabled, label, onChange }: { checked: boolean; disabled: boolean; label: string; onChange: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={onChange}
      style={{
        width: 38, height: 22, borderRadius: 999, padding: 2, border: 0,
        background: checked ? '#0F766E' : '#CBD5E1', cursor: disabled ? 'wait' : 'pointer',
        opacity: disabled ? 0.55 : 1, transition: 'background 150ms ease',
      }}
    >
      <span style={{ display: 'block', width: 18, height: 18, borderRadius: '50%', background: 'white', transform: checked ? 'translateX(16px)' : 'translateX(0)', transition: 'transform 150ms ease', boxShadow: '0 1px 3px rgba(15,23,42,.25)' }} />
    </button>
  )
}

export default function AdminLieuxPage() {
  const [places, setPlaces] = useState<PlaceRow[]>([])
  const [loading, setLoading] = useState(true)
  const [editingKey, setEditingKey] = useState<string | null>(null)
  const [editPrices, setEditPrices] = useState({ netUpTo6: '', netUpTo15: '', netUpTo32: '' })
  const [saving, setSaving] = useState<string | null>(null)
  const [canEdit, setCanEdit] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/admin/lieux', { cache: 'no-store' })
      .then(async response => {
        const data = await response.json()
        if (!response.ok) throw new Error(data.error || 'Impossible de charger les lieux.')
        setPlaces(data.places || [])
        setCanEdit(Boolean(data.canEdit))
      })
      .catch(fetchError => setError(fetchError instanceof Error ? fetchError.message : 'Impossible de charger les lieux.'))
      .finally(() => setLoading(false))
  }, [])

  const updatePlace = async (placeKey: string, change: Partial<Pick<PlaceRow, 'netUpTo6' | 'netUpTo15' | 'netUpTo32' | 'includedInBase' | 'isActive'>>) => {
    setSaving(placeKey)
    setError('')
    try {
      const response = await fetch('/api/admin/lieux', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ placeKey, ...change }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Impossible d’enregistrer ce lieu.')
      setPlaces(current => current.map(place => place.key === placeKey ? { ...place, ...data.place } : place))
      setEditingKey(null)
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Impossible d’enregistrer ce lieu.')
    } finally {
      setSaving(null)
    }
  }

  const categories = [
    { key: 'MAKKAH', label: 'Makkah', color: '#7C3AED' },
    { key: 'MADINAH', label: 'Médine', color: '#0284C7' },
    { key: 'HISTORIQUE', label: 'Sites historiques', color: '#D97706' },
  ]
  const activeCount = places.filter(place => place.isActive).length
  const baseCount = places.filter(place => place.isActive && place.includedInBase).length

  const renderRows = (rows: PlaceRow[]) => rows.map(place => (
    <tr key={place.key} style={{ borderBottom: '1px solid #F1F5F9', opacity: place.isActive ? 1 : 0.58 }}>
      <td style={{ padding: '0.65rem 0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
          <span style={{ fontSize: '1rem' }}>{place.emoji}</span>
          <div><div style={{ fontSize: '0.78rem', fontWeight: 750, color: '#0F172A' }}>{place.nameFr}</div><div style={{ fontSize: '0.62rem', color: '#94A3B8' }}>{place.nameAr}</div></div>
        </div>
      </td>
      <td style={{ padding: '0.65rem 0.75rem' }}>
        <Toggle checked={place.isActive} disabled={!canEdit || saving === place.key} label={`${place.isActive ? 'Désactiver' : 'Activer'} ${place.nameFr} dans le catalogue`} onChange={() => updatePlace(place.key, { isActive: !place.isActive })} />
      </td>
      <td style={{ padding: '0.65rem 0.75rem' }}>
        <Toggle checked={place.includedInBase} disabled={!canEdit || saving === place.key} label={`${place.includedInBase ? 'Retirer' : 'Ajouter'} ${place.nameFr} du socle inclus`} onChange={() => updatePlace(place.key, { includedInBase: !place.includedInBase })} />
      </td>
      <td style={{ padding: '0.65rem 0.75rem' }}>
        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
          {[
            ['1–6', place.netUpTo6], ['7–15', place.netUpTo15], ['16–32', place.netUpTo32],
          ].map(([label, value]) => <span key={String(label)} style={{ padding: '0.2rem 0.4rem', borderRadius: 6, background: '#F1F5F9', color: '#334155', fontSize: '0.64rem', fontWeight: 750 }}>{label}: {value} €</span>)}
        </div>
      </td>
      <td style={{ padding: '0.65rem 0.75rem' }}>
        {!canEdit ? <span style={{ color: '#94A3B8', fontSize: '0.68rem' }}>Lecture seule</span> : editingKey === place.key ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
            {[
              ['netUpTo6', '1–6'], ['netUpTo15', '7–15'], ['netUpTo32', '16–32'],
            ].map(([key, label]) => <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 3, color: '#64748B', fontSize: '0.58rem' }}>{label}<input type="number" min="0" max="999" step="1" value={editPrices[key as keyof typeof editPrices]} onChange={event => setEditPrices(current => ({ ...current, [key]: event.target.value }))} style={{ width: 58, padding: '0.36rem 0.4rem', border: '1px solid #7DD3FC', borderRadius: 7 }} /></label>)}
            <button type="button" disabled={saving === place.key} onClick={() => updatePlace(place.key, { netUpTo6: Number(editPrices.netUpTo6), netUpTo15: Number(editPrices.netUpTo15), netUpTo32: Number(editPrices.netUpTo32) })} style={{ padding: '0.4rem 0.6rem', border: 0, borderRadius: 7, background: '#0F766E', color: 'white', fontWeight: 800, cursor: 'pointer' }}>OK</button>
            <button type="button" onClick={() => setEditingKey(null)} style={{ padding: '0.4rem', border: 0, background: 'transparent', color: '#64748B', cursor: 'pointer' }}>×</button>
          </div>
        ) : (
          <button type="button" onClick={() => { setEditingKey(place.key); setEditPrices({ netUpTo6: String(place.netUpTo6), netUpTo15: String(place.netUpTo15), netUpTo32: String(place.netUpTo32) }) }} style={{ padding: '0.35rem 0.65rem', border: '1px solid #CBD5E1', borderRadius: 7, background: 'white', color: '#334155', fontSize: '0.7rem', fontWeight: 750, cursor: 'pointer' }}>Modifier</button>
        )}
      </td>
    </tr>
  ))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ margin: 0, color: '#0F172A', fontSize: '1.45rem', fontWeight: 800 }}>Lieux & catalogue</h1>
          <p style={{ margin: '0.25rem 0 0', color: '#64748B', fontSize: '0.76rem' }}>Deux commandes indépendantes : visibilité publique et inclusion dans l’accompagnement de base.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <span style={{ padding: '0.4rem 0.65rem', borderRadius: 8, background: '#ECFDF5', color: '#047857', fontSize: '0.7rem', fontWeight: 800 }}>{activeCount} actifs</span>
          <span style={{ padding: '0.4rem 0.65rem', borderRadius: 8, background: '#EFF6FF', color: '#1D4ED8', fontSize: '0.7rem', fontWeight: 800 }}>{baseCount} inclus</span>
        </div>
      </div>

      <div style={{ padding: '0.7rem 0.85rem', borderRadius: 9, background: '#FFF7ED', border: '1px solid #FED7AA', color: '#9A3412', fontSize: '0.7rem', lineHeight: 1.5 }}>
        Les trois tarifs sont les montants nets reversés au guide par groupe. La majoration « Guides & visites » est ajoutée côté serveur. Un lieu inclus reste configurable, mais aucun supplément n’est facturé tant qu’il est inclus.
      </div>
      {error && <div style={{ padding: '0.7rem 0.85rem', borderRadius: 9, background: '#FEF2F2', border: '1px solid #FECACA', color: '#B91C1C', fontSize: '0.72rem' }}>{error}</div>}

      {loading ? <div style={{ height: 220, borderRadius: 12, background: '#E2E8F0' }} /> : categories.map(category => {
        const rows = places.filter(place => place.category === category.key)
        return (
          <section key={category.key} style={{ background: 'white', border: '1px solid #DCE6F0', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 3px rgba(15,23,42,.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', padding: '0.65rem 0.8rem', borderBottom: '1px solid #E2E8F0' }}><span style={{ width: 4, height: 16, borderRadius: 4, background: category.color }} /><strong style={{ color: '#0F172A', fontSize: '0.82rem' }}>{category.label}</strong><span style={{ color: '#94A3B8', fontSize: '0.66rem' }}>{rows.length}</span></div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', minWidth: 680, borderCollapse: 'collapse' }}>
                <thead><tr style={{ background: '#F8FAFC' }}>{['Lieu', 'Catalogue', 'Inclus de base', 'Tarifs nets par groupe', 'Action'].map(label => <th key={label} style={{ padding: '0.5rem 0.75rem', textAlign: 'left', color: '#64748B', fontSize: '0.58rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</th>)}</tr></thead>
                <tbody>{renderRows(rows)}</tbody>
              </table>
            </div>
          </section>
        )
      })}
    </div>
  )
}
