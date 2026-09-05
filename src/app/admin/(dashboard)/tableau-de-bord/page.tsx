'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowUpRight, CalendarCheck2, CircleDollarSign, ClipboardList, UserRoundCheck, Users } from 'lucide-react'

type Stats = {
  guides: { total: number; active: number; pending: number }
  pelerins: { total: number }
  reservations: { total: number; thisMonth: number; pending: number; confirmed: number; completed: number; cancelled: number }
  revenue: { total: number; thisMonth: number; thisYear: number; commission: number; byMonth: number[] }
}

const MONTHS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    fetch('/api/admin/stats', { cache: 'no-store', signal: controller.signal })
      .then(async response => {
        const data = await response.json()
        if (controller.signal.aborted) return
        if (!response.ok) throw new Error(data.error || 'Impossible de charger le pilotage.')
        setStats(data)
      })
      .catch(fetchError => { if (!controller.signal.aborted) setError(fetchError instanceof Error ? fetchError.message : 'Impossible de charger le pilotage.') })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [attempt])

  const kpis = [
    { label: 'Guides actifs', value: stats?.guides.active ?? 0, detail: `${stats?.guides.pending ?? '—'} candidature(s) à traiter`, detailHref: '/admin/candidatures-guides', color: '#059669', tint: '#ECFDF5', icon: UserRoundCheck, href: '/admin/guides' },
    { label: 'Pèlerins', value: stats?.pelerins.total ?? 0, detail: 'comptes inscrits', color: '#2563EB', tint: '#EFF6FF', icon: Users, href: '/admin/pelerins' },
    { label: 'Réservations', value: stats?.reservations.thisMonth ?? 0, detail: `${stats?.reservations.total ?? '—'} au total`, color: '#D97706', tint: '#FFF7ED', icon: CalendarCheck2, href: '/admin/reservations' },
    { label: 'Commission', value: `${stats?.revenue.commission ?? 0} €`, detail: `${stats?.revenue.thisMonth ?? '—'} € de CA ce mois`, color: '#7C3AED', tint: '#F5F3FF', icon: CircleDollarSign, href: '/admin/revenus' },
  ]
  const pipeline = [
    { label: 'En attente', value: stats?.reservations.pending ?? 0, color: '#D97706' },
    { label: 'Confirmées', value: stats?.reservations.confirmed ?? 0, color: '#2563EB' },
    { label: 'Terminées', value: stats?.reservations.completed ?? 0, color: '#059669' },
    { label: 'Annulées', value: stats?.reservations.cancelled ?? 0, color: '#DC2626' },
  ]
  const maxRevenue = Math.max(...(stats?.revenue.byMonth ?? [0]), 1)
  const card: React.CSSProperties = { background: 'white', border: '1px solid #DCE6F0', borderRadius: 12, boxShadow: '0 1px 3px rgba(15,23,42,.04)' }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '1rem', flexWrap: 'wrap' }}>
        <div><h1 style={{ margin: 0, fontSize: '1.45rem', fontWeight: 850, color: '#0F172A' }}>Centre de commande</h1><p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: '#64748B' }}>Vue opérationnelle issue des données SAFARUMA.</p></div>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.65rem', borderRadius: 8, background: '#ECFDF5', color: '#047857', fontSize: '0.68rem', fontWeight: 800 }}><span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10B981' }} /> Données live</span>
      </div>

      {error && <div role="alert" style={{ padding: '0.7rem 0.9rem', borderRadius: 9, background: '#FEF2F2', border: '1px solid #FECACA', color: '#B91C1C', fontSize: '0.75rem' }}>{error} <button type="button" onClick={() => { setError(''); setLoading(true); setAttempt(value => value + 1) }}>Réessayer</button></div>}

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 210px), 1fr))', gap: '0.75rem', maxWidth: 'none', margin: 0, padding: 0 }}>
        {kpis.map(item => {
          const Icon = item.icon
          const content = <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.6rem' }}>
              <div><div style={{ color: '#64748B', fontSize: '0.62rem', fontWeight: 800, letterSpacing: '0.07em', textTransform: 'uppercase' }}>{item.label}</div><div style={{ marginTop: '0.5rem', color: '#0F172A', fontSize: '1.65rem', lineHeight: 1, fontWeight: 850 }}>{loading || !stats ? '—' : item.value}</div></div>
              <span style={{ display: 'inline-flex', width: 32, height: 32, alignItems: 'center', justifyContent: 'center', borderRadius: 9, background: item.tint, color: item.color }}><Icon size={18} /></span>
            </div>
          </>
          const detailStyle = { marginTop: '0.5rem', color: item.color, fontSize: '0.64rem', fontWeight: 700 }
          return item.detailHref ? <div key={item.label} style={{ ...card, padding: '0.9rem', minHeight: 92 }}>
            <Link href={item.href} style={{ display: 'block', textDecoration: 'none' }}>{content}</Link>
            <Link href={item.detailHref} style={{ ...detailStyle, display: 'block' }}>{item.detail}</Link>
          </div> : <Link key={item.label} href={item.href} style={{ ...card, display: 'block', padding: '0.9rem', textDecoration: 'none', minHeight: 92 }}>
            {content}<div style={detailStyle}>{item.detail}</div>
          </Link>
        })}
      </section>

      <section style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, .78fr) minmax(360px, 1.22fr)', gap: '0.75rem', maxWidth: 'none', margin: 0, padding: 0 }} className="admin-command-grid">
        <div style={{ ...card, padding: '0.9rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}><strong style={{ color: '#0F172A', fontSize: '0.78rem' }}>Pipeline des réservations</strong><Link href="/admin/reservations" aria-label="Voir les réservations" style={{ color: '#64748B' }}><ArrowUpRight size={17} /></Link></div>
          <div style={{ display: 'grid', gap: '0.55rem' }}>
            {pipeline.map(item => {
              const total = stats?.reservations.total ?? 0
              const percent = total ? Math.round(item.value / total * 100) : 0
              return <div key={item.label}><div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', marginBottom: '0.3rem' }}><span style={{ color: '#475569', fontWeight: 700 }}>{item.label}</span><span style={{ color: '#0F172A', fontWeight: 850 }}>{stats ? item.value : '—'}</span></div><div style={{ height: 5, background: '#F1F5F9', borderRadius: 99, overflow: 'hidden' }}><div style={{ height: '100%', width: `${percent}%`, background: item.color, borderRadius: 99 }} /></div></div>
            })}
          </div>
        </div>

        <div style={{ ...card, padding: '0.9rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}><div><strong style={{ color: '#0F172A', fontSize: '0.78rem' }}>Revenus {new Date().getFullYear()}</strong><div style={{ color: '#64748B', fontSize: '0.62rem', marginTop: 2 }}>{stats?.revenue.thisYear ?? '—'} € cumulés</div></div><Link href="/admin/stats" aria-label="Voir les statistiques" style={{ color: '#64748B' }}><ArrowUpRight size={17} /></Link></div>
          <div style={{ height: 130, display: 'grid', gridTemplateColumns: 'repeat(12, minmax(18px, 1fr))', alignItems: 'end', gap: '0.35rem' }}>
            {(stats?.revenue.byMonth ?? Array(12).fill(0)).map((value, index) => {
              const height = value ? Math.max(8, Math.round(value / maxRevenue * 100)) : 3
              return <div key={MONTHS[index]} title={`${MONTHS[index]} : ${value} €`} style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', gap: 5 }}><div style={{ width: '100%', maxWidth: 28, height: `${height}%`, borderRadius: '5px 5px 2px 2px', background: index === new Date().getMonth() ? 'linear-gradient(180deg,#38BDF8,#7C3AED)' : value ? '#0F766E' : '#E2E8F0' }} /><span style={{ color: '#94A3B8', fontSize: '0.52rem' }}>{MONTHS[index]}</span></div>
            })}
          </div>
        </div>
      </section>

      <section style={{ ...card, maxWidth: 'none', margin: 0, padding: '0.8rem 0.9rem', display: 'flex', alignItems: 'center', gap: '0.55rem', flexWrap: 'wrap' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', marginRight: '0.25rem', color: '#475569', fontSize: '0.68rem', fontWeight: 800 }}><ClipboardList size={15} /> Actions rapides</span>
        {[
          ['/admin/candidatures-guides', 'Traiter les candidatures'], ['/admin/commissions', 'Régler les marges'], ['/admin/lieux', 'Gérer les lieux'], ['/admin/audit', 'Contrôler l’audit'],
        ].map(([href, label]) => <Link key={href} href={href} style={{ padding: '0.42rem 0.65rem', borderRadius: 7, background: '#F8FAFC', border: '1px solid #E2E8F0', color: '#334155', fontSize: '0.66rem', fontWeight: 750, textDecoration: 'none' }}>{label}</Link>)}
      </section>

      <style>{`@media(max-width:900px){.admin-command-grid{grid-template-columns:1fr!important}}`}</style>
    </div>
  )
}
