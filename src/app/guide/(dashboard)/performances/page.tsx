'use client'

import { useEffect, useState } from 'react'

type PeriodStats = {
  completedReservations: number
  netEarnings: number
  averageRating: number | null
  approvedReviews: number
}

type PerformanceData = {
  thisMonth: PeriodStats
  allTime: PeriodStats
}

export default function Page() {
  const [data, setData] = useState<PerformanceData | null>(null)
  const [period, setPeriod] = useState<'thisMonth' | 'allTime'>('thisMonth')
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/guide/performances', { cache: 'no-store' })
      .then(async response => {
        const body = await response.json()
        if (!response.ok) throw new Error(body.error || 'Impossible de charger les performances.')
        setData(body)
      })
      .catch(errorValue => setError(errorValue.message))
  }, [])

  if (error) {
    return <div style={{ padding: 14, color: '#B91C1C', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10 }}>{error}</div>
  }

  if (!data) {
    return (
      <div role="status" aria-live="polite" aria-label="Chargement des performances" style={{ minHeight: 'calc(100vh - 9rem)', display: 'grid', placeItems: 'center' }}>
        <div className="guide-route-loading__spinner" aria-hidden="true" />
      </div>
    )
  }

  const stats = data[period]
  const cards = [
    { label: 'Réservations terminées', value: String(stats.completedReservations), description: 'Séjours finalisés' },
    { label: 'Revenus nets', value: `${stats.netEarnings.toLocaleString('fr-FR')} €`, description: 'Vos revenus uniquement' },
    { label: 'Note moyenne', value: stats.averageRating === null ? '—' : `${stats.averageRating.toFixed(1)} / 5`, description: 'Avis approuvés' },
    { label: 'Avis approuvés', value: String(stats.approvedReviews), description: 'Affichés sur votre profil' },
  ]

  return (
    <div style={{ display: 'grid', gap: 18 }}>
      <header>
        <div style={{ color: '#9A6C14', fontSize: 12, fontWeight: 800, letterSpacing: '.12em', textTransform: 'uppercase' }}>Données réelles</div>
        <h1 style={{ margin: '6px 0', color: '#1A1209', fontFamily: 'var(--font-cormorant, serif)', fontSize: 30 }}>Performances</h1>
        <p style={{ margin: 0, color: '#756B5D', fontSize: 14 }}>Vos réservations terminées, vos revenus nets et les avis approuvés.</p>
      </header>

      <div style={{ display: 'inline-flex', width: 'fit-content', gap: 4, padding: 4, background: '#EEE8DE', borderRadius: 10 }}>
        <button onClick={() => setPeriod('thisMonth')} style={{ border: 'none', borderRadius: 7, padding: '8px 12px', cursor: 'pointer', fontSize: 12, fontWeight: 800, color: period === 'thisMonth' ? '#1A1209' : '#756B5D', background: period === 'thisMonth' ? 'white' : 'transparent', boxShadow: period === 'thisMonth' ? '0 1px 2px rgba(0,0,0,.08)' : 'none' }}>Ce mois</button>
        <button onClick={() => setPeriod('allTime')} style={{ border: 'none', borderRadius: 7, padding: '8px 12px', cursor: 'pointer', fontSize: 12, fontWeight: 800, color: period === 'allTime' ? '#1A1209' : '#756B5D', background: period === 'allTime' ? 'white' : 'transparent', boxShadow: period === 'allTime' ? '0 1px 2px rgba(0,0,0,.08)' : 'none' }}>Depuis le début</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
        {cards.map(card => (
          <article key={card.label} style={{ background: 'white', border: '1px solid #E8DFC8', borderRadius: 14, padding: 18 }}>
            <div style={{ color: '#756B5D', fontSize: 11, fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase' }}>{card.label}</div>
            <div style={{ margin: '8px 0 4px', color: '#1A1209', fontFamily: 'var(--font-cormorant, serif)', fontSize: 30, fontWeight: 700 }}>{card.value}</div>
            <div style={{ color: '#8A8072', fontSize: 12 }}>{card.description}</div>
          </article>
        ))}
      </div>

      {stats.completedReservations === 0 && stats.approvedReviews === 0 && (
        <div style={{ padding: '2rem', background: 'white', border: '1px solid #E8DFC8', borderRadius: 14, textAlign: 'center', color: '#7A6D5A', lineHeight: 1.6 }}>Aucune donnée de performance pour cette période. Vos indicateurs apparaîtront lorsque des réservations seront terminées ou que des avis seront approuvés.</div>
      )}
    </div>
  )
}
