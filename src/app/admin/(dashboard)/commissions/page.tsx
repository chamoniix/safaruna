'use client'

import { useEffect, useState } from 'react'

type GuideRow = {
  id: string
  slug: string | null
  name: string
  totalReservations: number
  totalRevenue: number
  totalCommission: number
}

export default function AdminCommissions() {
  const [guides, setGuides] = useState<GuideRow[]>([])
  const [guideMarkup, setGuideMarkup] = useState('30')
  const [travelMarkup, setTravelMarkup] = useState('20')
  const [canEdit, setCanEdit] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    fetch('/api/admin/commissions', { cache: 'no-store' })
      .then(async response => {
        const data = await response.json()
        if (!response.ok) throw new Error(data.error || 'Impossible de charger les commissions.')
        if (!active) return
        setGuides(data.guides || [])
        setGuideMarkup(String(data.guideServiceMarkupPercent ?? 30))
        setTravelMarkup(String(data.travelMarkupPercent ?? 20))
        setCanEdit(Boolean(data.canEdit))
      })
      .catch(fetchError => {
        if (active) setError(fetchError instanceof Error ? fetchError.message : 'Impossible de charger les commissions.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => { active = false }
  }, [])

  const saveMarkups = async () => {
    setSaving(true)
    setError('')
    setMessage('')
    try {
      const response = await fetch('/api/admin/commissions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guideServiceMarkupPercent: Number(guideMarkup),
          travelMarkupPercent: Number(travelMarkup),
        }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Impossible d’enregistrer les majorations.')
      setGuideMarkup(String(data.guideServiceMarkupPercent))
      setTravelMarkup(String(data.travelMarkupPercent))
      setConfirming(false)
      setMessage('Majorations enregistrées et appliquées au calcul serveur.')
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Impossible d’enregistrer les majorations.')
    } finally {
      setSaving(false)
    }
  }

  const card: React.CSSProperties = {
    background: 'white', border: '1px solid #D9E4F0', borderRadius: 12,
    boxShadow: '0 1px 3px rgba(15,23,42,0.05)',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontFamily: 'var(--font-manrope, sans-serif)' }}>
      <div>
        <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>Commissions & majorations</h1>
        <p style={{ margin: '0.25rem 0 0', color: '#64748B', fontSize: '0.78rem' }}>
          Source unique utilisée par le checkout et recalculée côté serveur avant paiement.
        </p>
      </div>

      <section style={{ ...card, padding: '1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
          {[
            { label: 'Guides & visites', value: guideMarkup, setter: setGuideMarkup, help: 'Appliquée aux rémunérations nettes des guides et aux visites supplémentaires.' },
            { label: 'Transport & hôtel', value: travelMarkup, setter: setTravelMarkup, help: 'Appliquée au train, véhicule local, trajet interville et nuitées du guide.' },
          ].map(field => (
            <label key={field.label} style={{ display: 'block', padding: '0.875rem', border: '1px solid #E2E8F0', borderRadius: 10, background: '#F8FAFC' }}>
              <span style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: '#334155', marginBottom: '0.4rem' }}>{field.label}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={field.value}
                  disabled={!canEdit || saving}
                  onChange={event => { field.setter(event.target.value); setConfirming(false); setMessage('') }}
                  style={{ width: 100, padding: '0.55rem 0.65rem', border: '1px solid #CBD5E1', borderRadius: 8, fontSize: '1rem', fontWeight: 800, color: '#0F172A', background: canEdit ? 'white' : '#F1F5F9' }}
                />
                <span style={{ fontWeight: 800, color: '#475569' }}>%</span>
              </span>
              <span style={{ display: 'block', marginTop: '0.45rem', color: '#64748B', fontSize: '0.68rem', lineHeight: 1.45 }}>{field.help}</span>
            </label>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', flexWrap: 'wrap', gap: '0.65rem', marginTop: '0.8rem' }}>
          {!canEdit ? (
            <span style={{ color: '#64748B', fontSize: '0.72rem' }}>Lecture seule — modification réservée au Superadmin.</span>
          ) : confirming ? (
            <>
              <span style={{ color: '#9A3412', fontSize: '0.72rem', fontWeight: 700 }}>Confirmer l’application immédiate aux prochains checkouts ?</span>
              <button type="button" onClick={() => setConfirming(false)} style={{ padding: '0.5rem 0.8rem', border: '1px solid #CBD5E1', borderRadius: 8, background: 'white', color: '#475569', fontWeight: 700, cursor: 'pointer' }}>Annuler</button>
              <button type="button" disabled={saving} onClick={saveMarkups} style={{ padding: '0.5rem 0.9rem', border: 0, borderRadius: 8, background: '#0F766E', color: 'white', fontWeight: 800, cursor: saving ? 'wait' : 'pointer' }}>{saving ? 'Enregistrement…' : 'Confirmer'}</button>
            </>
          ) : (
            <button type="button" onClick={() => setConfirming(true)} style={{ padding: '0.55rem 0.95rem', border: 0, borderRadius: 8, background: '#0369A1', color: 'white', fontWeight: 800, cursor: 'pointer' }}>Enregistrer les majorations</button>
          )}
        </div>
      </section>

      {message && <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: 8, padding: '0.7rem 0.9rem', fontSize: '0.76rem', color: '#047857' }}>{message}</div>}
      {error && <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, padding: '0.7rem 0.9rem', fontSize: '0.76rem', color: '#B91C1C' }}>{error}</div>}

      <div style={{ ...card, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 640 }}>
            <thead><tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
              {['Guide', 'Majoration services', 'Réservations', 'Revenus générés', 'Commission réalisée'].map(header => (
                <th key={header} style={{ padding: '0.65rem 0.8rem', textAlign: 'left', fontSize: '0.6rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#64748B', whiteSpace: 'nowrap' }}>{header}</th>
              ))}
            </tr></thead>
            <tbody>
              {loading ? Array.from({ length: 3 }).map((_, index) => (
                <tr key={index}>{Array.from({ length: 5 }).map((__, cell) => <td key={cell} style={{ padding: '0.8rem' }}><div style={{ height: 11, background: '#E2E8F0', borderRadius: 4 }} /></td>)}</tr>
              )) : guides.length === 0 ? (
                <tr><td colSpan={5} style={{ padding: '1.5rem', textAlign: 'center', color: '#64748B', fontSize: '0.8rem' }}>Aucun guide</td></tr>
              ) : guides.map(guide => (
                <tr key={guide.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '0.7rem 0.8rem', fontSize: '0.8rem', fontWeight: 700, color: '#0F172A' }}>{guide.name}</td>
                  <td style={{ padding: '0.7rem 0.8rem' }}><span style={{ background: '#E0F2FE', color: '#0369A1', fontSize: '0.74rem', fontWeight: 800, padding: '0.2rem 0.55rem', borderRadius: 20 }}>{guideMarkup}%</span></td>
                  <td style={{ padding: '0.7rem 0.8rem', fontSize: '0.78rem', color: '#475569' }}>{guide.totalReservations}</td>
                  <td style={{ padding: '0.7rem 0.8rem', fontSize: '0.8rem', fontWeight: 700, color: '#0F172A' }}>{guide.totalRevenue} €</td>
                  <td style={{ padding: '0.7rem 0.8rem', fontSize: '0.8rem', fontWeight: 800, color: '#0F766E' }}>{guide.totalCommission} €</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
