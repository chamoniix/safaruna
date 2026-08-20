'use client'

import { useEffect, useState } from 'react'

type Stats = { commissionsMois: number; reservationsMois: number }

export default function AdminRevenus() {
  const [stats, setStats] = useState<Stats | null>(null)
  useEffect(() => { fetch('/api/admin/stats', { cache: 'no-store' }).then(response => response.ok ? response.json() : null).then(setStats).catch(() => setStats(null)) }, [])
  return <div style={{ display: 'grid', gap: 16 }}>
    <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 14 }}>
      <article style={{ background: 'white', border: '1px solid #E8DFC8', borderRadius: 12, padding: 20 }}><span style={{ color: '#7A6D5A' }}>Commissions réelles ce mois</span><strong style={{ display: 'block', fontSize: 30, marginTop: 8 }}>{stats?.commissionsMois ?? 0} €</strong></article>
      <article style={{ background: 'white', border: '1px solid #E8DFC8', borderRadius: 12, padding: 20 }}><span style={{ color: '#7A6D5A' }}>Réservations réelles ce mois</span><strong style={{ display: 'block', fontSize: 30, marginTop: 8 }}>{stats?.reservationsMois ?? 0}</strong></article>
    </section>
    <section style={{ background: 'white', border: '1px solid #E8DFC8', borderRadius: 12, padding: '2.5rem', textAlign: 'center' }}><h2 style={{ margin: 0 }}>Aucun virement fictif</h2><p style={{ color: '#7A6D5A' }}>Les commissions et virements de démonstration ont été supprimés. Seules les valeurs calculées depuis les réservations live sont affichées.</p></section>
  </div>
}
