import {
  Activity, AlertTriangle, ArrowRight, BarChart3, CheckCircle2, CircleDollarSign,
  Clock3, CreditCard, Eye, Globe2, MonitorSmartphone, RefreshCw, Search, ShieldCheck,
  Smartphone, Tablet, UserRound, UsersRound,
} from 'lucide-react'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { hasValidSession } from '@/lib/auth'
import {
  getAnalyticsData, getGa4RealtimeData, type AnalyticsData, type Ga4ComparisonRow,
  type Ga4MetricComparison, type Ga4RealtimeData,
} from '@/lib/data'
import AutoRefresh from './AutoRefresh'
import LogoutButton from './LogoutButton'

export const dynamic = 'force-dynamic'

const funnelLabels: Record<string, string> = {
  guide_viewed: 'Profil guide vu',
  booking_started: 'Réservation commencée',
  booking_step: 'Étape complétée',
  begin_checkout: 'Checkout demandé',
  checkout_created: 'Arrivée Stripe',
  purchase: 'Paiement confirmé',
}

const eventLabels: Record<string, string> = {
  page_view: 'Page vue', guide_viewed: 'Guide vu', booking_started: 'Réservation commencée',
  booking_step: 'Étape réservation', begin_checkout: 'Checkout demandé', checkout_created: 'Session Stripe',
  checkout_error: 'Erreur checkout', payment_cancelled: 'Paiement annulé', purchase: 'Paiement confirmé',
  payment_expired: 'Session expirée',
}

function number(value: number) {
  return new Intl.NumberFormat('fr-FR').format(value)
}

function euro(value: number) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value)
}

function date(value: string | null | undefined) {
  return value ? new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : '—'
}

function countryName(code: string) {
  if (code === 'UNKNOWN') return 'Pays inconnu'
  try { return new Intl.DisplayNames(['fr'], { type: 'region' }).of(code) || code } catch { return code }
}

function deviceName(device: string) {
  return ({ MOBILE: 'Mobile', TABLET: 'Tablette', DESKTOP: 'Ordinateur', UNKNOWN: 'Inconnu' } as Record<string, string>)[device.toUpperCase()] || device
}

function Metric({ icon, label, value, note }: { icon: React.ReactNode; label: string; value: string; note: string }) {
  return <article className="metric"><div className="metric-icon">{icon}</div><p>{label}</p><strong>{value}</strong><span>{note}</span></article>
}

function RankedList({ rows, kind }: { rows: Array<{ label: string; count: number }>; kind: 'country' | 'device' | 'plain' }) {
  const max = Math.max(1, ...rows.map(row => row.count))
  if (!rows.length) return <div className="empty">Aucune donnée pour cette période.</div>
  return <div className="ranked-list">{rows.slice(0, 10).map(row => {
    const label = kind === 'country' ? countryName(row.label) : kind === 'device' ? deviceName(row.label) : row.label
    const DeviceIcon = row.label === 'MOBILE' ? Smartphone : row.label === 'TABLET' ? Tablet : MonitorSmartphone
    return <div className="ranked-row" key={row.label}>
      <div className="ranked-label">{kind === 'device' && <DeviceIcon size={15} />}<span title={label}>{label}</span><b>{number(row.count)}</b></div>
      <div className="bar"><i style={{ width: `${(row.count / max) * 100}%` }} /></div>
    </div>
  })}</div>
}

function percentChange(value: number | null) {
  if (value === null) return 'Nouveau'
  return `${value > 0 ? '+' : ''}${new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 }).format(value)} %`
}

function comparisonNote(metric: Ga4MetricComparison) {
  return `${percentChange(metric.change)} vs période précédente`
}

function ComparisonRankedList({ rows }: { rows: Ga4ComparisonRow[] }) {
  const max = Math.max(1, ...rows.map(row => row.count))
  if (!rows.length) return <div className="empty">Aucune donnée pour cette période.</div>
  return <div className="ranked-list comparison-list">{rows.map(row => <div className="ranked-row" key={row.label}>
    <div className="ranked-label"><span title={row.label}>{row.label}</span><em className={row.change !== null && row.change < 0 ? 'down' : 'up'}>{percentChange(row.change)}</em><b>{number(row.count)}</b></div>
    <div className="bar"><i style={{ width: `${(row.count / max) * 100}%` }} /></div>
  </div>)}</div>
}

function LineChart({ rows, previous = true }: { rows: Array<{ label: string; current: number; previous?: number }>; previous?: boolean }) {
  if (!rows.length) return <div className="empty">Aucune donnée pour cette période.</div>
  const width = 900
  const height = 240
  const padding = { top: 18, right: 14, bottom: 34, left: 42 }
  const chartWidth = width - padding.left - padding.right
  const chartHeight = height - padding.top - padding.bottom
  const max = Math.max(1, ...rows.flatMap(row => [row.current, row.previous || 0]))
  const coordinates = (value: number, index: number) => {
    const x = padding.left + (rows.length === 1 ? chartWidth / 2 : index / (rows.length - 1) * chartWidth)
    const y = padding.top + chartHeight - value / max * chartHeight
    return { x, y }
  }
  const point = (value: number, index: number) => {
    const { x, y } = coordinates(value, index)
    return `${x},${y}`
  }
  const labelIndexes = new Set([0, Math.floor((rows.length - 1) / 2), rows.length - 1])
  return <div className="chart-wrap">
    <div className="chart-legend"><span className="current">Période actuelle</span>{previous && <span className="previous">Période précédente</span>}</div>
    <svg className="line-chart" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Évolution des utilisateurs actifs">
      {[0, .25, .5, .75, 1].map(step => {
        const y = padding.top + chartHeight - step * chartHeight
        return <g key={step}><line x1={padding.left} y1={y} x2={width - padding.right} y2={y} className="chart-grid" /><text x={padding.left - 10} y={y + 4} textAnchor="end">{Math.round(max * step)}</text></g>
      })}
      {previous && <polyline points={rows.map((row, index) => point(row.previous || 0, index)).join(' ')} className="chart-line chart-previous" />}
      <polyline points={rows.map((row, index) => point(row.current, index)).join(' ')} className="chart-line chart-current" />
      {rows.map((row, index) => {
        const { x, y } = coordinates(row.current, index)
        const tooltipWidth = previous ? 210 : 150
        const tooltipX = Math.min(width - padding.right - tooltipWidth, Math.max(padding.left, x - tooltipWidth / 2))
        const tooltipY = y < padding.top + 52 ? y + 14 : y - 50
        const detail = previous ? `${number(row.current)} actuels · ${number(row.previous || 0)} précédents` : `${number(row.current)} utilisateur${row.current > 1 ? 's' : ''}`
        return <g className="chart-point" key={`${row.label}-${index}`}>
          <circle cx={x} cy={y} r="10" className="chart-point-hit" />
          <circle cx={x} cy={y} r="3.5" className="chart-point-dot" />
          <g className="chart-tooltip">
            <rect x={tooltipX} y={tooltipY} width={tooltipWidth} height="38" rx="8" />
            <text x={tooltipX + 10} y={tooltipY + 15} className="chart-tooltip-date">{row.label}</text>
            <text x={tooltipX + 10} y={tooltipY + 29}>{detail}</text>
          </g>
          <title>{`${row.label} : ${detail}`}</title>
        </g>
      })}
      {rows.map((row, index) => labelIndexes.has(index) ? <text key={`label-${row.label}-${index}`} x={coordinates(0, index).x} y={height - 8} textAnchor={index === 0 ? 'start' : index === rows.length - 1 ? 'end' : 'middle'}>{row.label}</text> : null)}
    </svg>
  </div>
}

function Dashboard({ data, ga4, days, query }: { data: AnalyticsData; ga4: Ga4RealtimeData; days: number; query: string }) {
  const maxFunnel = Math.max(1, ...data.funnel.map(item => item.count))
  return <main>
    <AutoRefresh />
    <header className="topbar">
      <div className="brand"><span>SAFAR<span>U</span>MA</span><small>Analytics privé</small></div>
      <nav><a href="#vue">Vue générale</a><a href="#ga4">GA4 complet</a><a href="#paiements">Paiements</a><a href="#erreurs">Erreurs</a><a href="#parcours">Parcours</a></nav>
      <LogoutButton />
    </header>

    <div className="shell">
      <section className="hero" id="vue">
        <div><p className="eyebrow"><ShieldCheck size={14} /> Données sans adresse IP</p><h1>Tableau de bord SAFARUMA</h1><p>Pays, appareil, parcours de réservation, paiements Stripe et erreurs Sentry au même endroit.</p></div>
        <form className="range-form" method="get">
          <select name="days" defaultValue={String(days)} aria-label="Période">
            <option value="7">7 derniers jours</option><option value="30">30 derniers jours</option><option value="90">90 derniers jours</option>
          </select>
          {query && <input type="hidden" name="q" value={query} />}
          <button><RefreshCw size={15} /> Actualiser</button>
        </form>
      </section>

      <div className="status-line"><span><Activity size={14} /> Mise à jour {date(data.generatedAt)}</span><span>Détail conservé {data.range.detailedRetentionDays} jours</span></div>

      <section className="metrics">
        <Metric icon={<Activity />} label="Visiteurs actifs" value={number(data.overview.activeVisitors)} note="sur les 5 dernières minutes" />
        <Metric icon={<Eye />} label="Pages vues" value={number(data.overview.pageViews)} note={`${number(data.overview.uniqueVisitors)} visiteurs uniques`} />
        <Metric icon={<UserRound />} label="Comptes" value={number(data.overview.accountsTotal)} note={`+${number(data.overview.accountsNew)} sur la période`} />
        <Metric icon={<CreditCard />} label="Réservations" value={number(data.overview.confirmedReservations)} note={`${number(data.overview.reservations)} demandes créées`} />
        <Metric icon={<CircleDollarSign />} label="Chiffre d’affaires" value={euro(data.overview.revenue)} note="réservations confirmées" />
        <Metric icon={<BarChart3 />} label="Conversion" value={`${(data.overview.conversionRate * 100).toFixed(1)} %`} note={`${number(data.overview.guidesActive)} guides actifs`} />
      </section>

      <section id="ga4">
        <article className="panel">
          <div className="panel-title"><div><p className="eyebrow">Google Analytics 4</p><h2>Vue d’ensemble — {days} derniers jours</h2></div>{ga4.available ? <CheckCircle2 className="ok" /> : <AlertTriangle className="warn" />}</div>
          {!ga4.available ? <div className="empty">{ga4.error || 'Connexion GA4 indisponible.'}</div> : <>
            <div className="metrics ga4-history-metrics">
              <Metric icon={<UsersRound />} label="Utilisateurs actifs" value={number(ga4.historical.overview.activeUsers.current)} note={comparisonNote(ga4.historical.overview.activeUsers)} />
              <Metric icon={<Activity />} label="Événements" value={number(ga4.historical.overview.eventCount.current)} note={comparisonNote(ga4.historical.overview.eventCount)} />
              <Metric icon={<CheckCircle2 />} label="Événements clés" value={number(ga4.historical.overview.keyEvents.current)} note={comparisonNote(ga4.historical.overview.keyEvents)} />
              <Metric icon={<UserRound />} label="Nouveaux utilisateurs" value={number(ga4.historical.overview.newUsers.current)} note={comparisonNote(ga4.historical.overview.newUsers)} />
            </div>
            <div className="status-line"><span><Activity size={14} /> Données complètes : {ga4.historical.currentLabel}</span><span>Comparaison : {ga4.historical.previousLabel}</span></div>
          </>}
        </article>
        {ga4.available && <>
          <article className="panel">
            <div className="panel-title"><div><p className="eyebrow">Évolution</p><h2>Utilisateurs actifs par jour</h2></div><BarChart3 /></div>
            <LineChart rows={ga4.historical.daily} />
          </article>
          <div className="grid two ga4-breakdowns">
            <article className="panel"><div className="panel-title"><div><p className="eyebrow">Audience</p><h2>Utilisateurs par pays</h2></div><Globe2 /></div><ComparisonRankedList rows={ga4.historical.countries} /></article>
            <article className="panel"><div className="panel-title"><div><p className="eyebrow">Audience</p><h2>Utilisateurs par ville</h2></div><Globe2 /></div><ComparisonRankedList rows={ga4.historical.cities} /></article>
            <article className="panel"><div className="panel-title"><div><p className="eyebrow">Contenu</p><h2>Vues par page</h2></div><Eye /></div><ComparisonRankedList rows={ga4.historical.pages} /></article>
            <article className="panel"><div className="panel-title"><div><p className="eyebrow">Acquisition</p><h2>Sessions par canal</h2></div><BarChart3 /></div><ComparisonRankedList rows={ga4.historical.channels} /></article>
            <article className="panel"><div className="panel-title"><div><p className="eyebrow">Acquisition initiale</p><h2>Utilisateurs par source / support</h2></div><UsersRound /></div><ComparisonRankedList rows={ga4.historical.firstSources} /></article>
            <article className="panel"><div className="panel-title"><div><p className="eyebrow">Acquisition des sessions</p><h2>Sessions par source / support</h2></div><Activity /></div><ComparisonRankedList rows={ga4.historical.sessionSources} /></article>
            <article className="panel"><div className="panel-title"><div><p className="eyebrow">Conversions</p><h2>Événements clés par plateforme</h2></div><CheckCircle2 /></div><ComparisonRankedList rows={ga4.historical.platforms} /></article>
          </div>
        </>}
      </section>

      <section id="ga4-realtime">
        <article className="panel">
          <div className="panel-title"><div><p className="eyebrow">Google Analytics 4</p><h2>Temps réel — 30 dernières minutes</h2></div>{ga4.available ? <CheckCircle2 className="ok" /> : <AlertTriangle className="warn" />}</div>
          {!ga4.available ? <div className="empty">{ga4.error || 'Connexion GA4 indisponible.'}</div> : <>
            <div className="payment-summary ga4-summary">
              <div><span>Visiteurs actifs</span><b>{number(ga4.overview.activeUsers)}</b></div>
              <div><span>Pages vues</span><b>{number(ga4.overview.pageViews)}</b></div>
              <div><span>Événements</span><b>{number(ga4.overview.eventCount)}</b></div>
              <div className="success"><span>Événements clés</span><b>{number(ga4.overview.keyEvents)}</b></div>
            </div>
            <div className="status-line"><span><Activity size={14} /> GA4 actualisé {date(ga4.generatedAt)}</span><span>Propriété 536896629</span></div>
          </>}
        </article>
        {ga4.available && <article className="panel">
          <div className="panel-title"><div><p className="eyebrow">GA4 en direct</p><h2>Utilisateurs actifs par minute</h2></div><Activity /></div>
          <LineChart rows={ga4.minuteSeries.map(row => ({ label: row.label, current: row.value }))} previous={false} />
        </article>}
        {ga4.available && <div className="grid two">
          <article className="panel"><div className="panel-title"><div><p className="eyebrow">GA4 en direct</p><h2>Pays</h2></div><Globe2 /></div><RankedList rows={ga4.countries} kind="plain" /></article>
          <article className="panel"><div className="panel-title"><div><p className="eyebrow">GA4 en direct</p><h2>Appareils</h2></div><MonitorSmartphone /></div><RankedList rows={ga4.devices} kind="device" /></article>
          <article className="panel"><div className="panel-title"><div><p className="eyebrow">GA4 en direct</p><h2>Pages consultées</h2></div><Eye /></div><RankedList rows={ga4.pages} kind="plain" /></article>
          <article className="panel"><div className="panel-title"><div><p className="eyebrow">GA4 en direct</p><h2>Événements</h2></div><Activity /></div><RankedList rows={ga4.events.map(row => ({ ...row, label: eventLabels[row.label] || row.label }))} kind="plain" /></article>
        </div>}
      </section>

      <section className="grid two">
        <article className="panel">
          <div className="panel-title"><div><p className="eyebrow">Tunnel</p><h2>Conversion réservation</h2></div><BarChart3 /></div>
          <div className="funnel">{data.funnel.map((item, index) => <div className="funnel-row" key={item.name}>
            <span className="funnel-index">{index + 1}</span><span>{funnelLabels[item.name] || item.name}</span>
            <div className="funnel-bar"><i style={{ width: `${Math.max(2, item.count / maxFunnel * 100)}%` }} /></div><b>{number(item.count)}</b>
          </div>)}</div>
        </article>
        <article className="panel">
          <div className="panel-title"><div><p className="eyebrow">Audience</p><h2>Pays des visiteurs</h2></div><Globe2 /></div>
          <RankedList rows={data.breakdowns.countries} kind="country" />
        </article>
      </section>

      <section className="grid three">
        <article className="panel"><div className="panel-title"><div><p className="eyebrow">Support</p><h2>Appareils</h2></div><MonitorSmartphone /></div><RankedList rows={data.breakdowns.devices} kind="device" /></article>
        <article className="panel"><div className="panel-title"><div><p className="eyebrow">Contenu</p><h2>Pages consultées</h2></div><Eye /></div><RankedList rows={data.breakdowns.pages} kind="plain" /></article>
        <article className="panel"><div className="panel-title"><div><p className="eyebrow">Marketplace</p><h2>Guides consultés</h2></div><UsersRound /></div><RankedList rows={data.breakdowns.guides} kind="plain" /></article>
      </section>

      <section className="panel" id="paiements">
        <div className="panel-title"><div><p className="eyebrow">Stripe + base SAFARUMA</p><h2>État des paiements</h2></div><CreditCard /></div>
        <div className="payment-summary">
          <div><span>Arrivées Stripe</span><b>{number(data.payments.checkoutCreated)}</b></div>
          <div className="success"><span>Confirmés</span><b>{number(data.payments.purchases)}</b></div>
          <div className="danger"><span>Erreurs</span><b>{number(data.payments.errors)}</b></div>
          <div><span>Annulés</span><b>{number(data.payments.cancelled)}</b></div>
          <div><span>Expirés</span><b>{number(data.payments.expired)}</b></div>
        </div>
        <div className="table-wrap"><table><thead><tr><th>Référence</th><th>Client</th><th>Destination</th><th>Voyageurs</th><th>Montant</th><th>Statut</th><th>Date</th></tr></thead><tbody>
          {data.payments.reservations.map(item => <tr key={item.refNumber}><td><code>{item.refNumber}</code></td><td>{item.pelerin.name || item.pelerin.email || '—'}</td><td>{item.selectedCities || '—'}</td><td>{item.nbPeople}</td><td>{euro(item.totalPrice)}</td><td><span className={`pill ${item.status.toLowerCase()}`}>{item.status}</span></td><td>{date(item.createdAt)}</td></tr>)}
        </tbody></table>{!data.payments.reservations.length && <div className="empty">Aucune réservation sur cette période.</div>}</div>
      </section>

      <section className="grid two">
        <article className="panel" id="erreurs">
          <div className="panel-title"><div><p className="eyebrow">Sentry</p><h2>Erreurs non résolues</h2></div>{data.sentry.available ? <CheckCircle2 className="ok" /> : <AlertTriangle className="warn" />}</div>
          {!data.sentry.available ? <div className="empty">Connexion Sentry indisponible.</div> : <div className="issues">{data.sentry.issues.slice(0, 12).map(issue => <a href={issue.permalink} target="_blank" rel="noreferrer" key={issue.id}><div><b>{issue.title}</b><span>{issue.culprit || 'Emplacement inconnu'}</span></div><em>{number(issue.count)} occurrences<ArrowRight size={14} /></em></a>)}{!data.sentry.issues.length && <div className="empty success-empty">Aucune erreur non résolue.</div>}</div>}
        </article>
        <article className="panel">
          <div className="panel-title"><div><p className="eyebrow">Comptes</p><h2>Dernières inscriptions</h2></div><UserRound /></div>
          <div className="account-list">{data.accounts.recent.slice(0, 12).map(user => <div key={user.id}><span className="avatar">{(user.name || user.email || '?').charAt(0).toUpperCase()}</span><div><b>{user.name || 'Sans nom'}</b><span>{user.email || 'Sans email'}</span></div><em><span>{user.role}</span><small>Créé {date(user.createdAt)}</small><small>Connexion {date(user.lastLogin)}</small></em></div>)}</div>
        </article>
      </section>

      <section className="panel" id="parcours">
        <div className="panel-title"><div><p className="eyebrow">Parcours détaillés</p><h2>Dernières sessions</h2></div><Clock3 /></div>
        <div className="journeys">{data.journeys.slice(0, 20).map(journey => <details key={`${journey.id}-${journey.lastActivity}`}><summary><div><b>{journey.user?.name || journey.user?.email || `Visiteur ${journey.id}`}</b><span>{countryName(journey.country)} · {deviceName(journey.device)}</span></div><em>{journey.events.length} actions · {date(journey.lastActivity)}</em></summary><ol>{journey.events.map((event, index) => <li key={`${event.at}-${index}`}><i /><div><b>{eventLabels[event.name] || event.name}</b><span>{event.path || 'Action serveur'} · {date(event.at)}</span></div></li>)}</ol></details>)}</div>
      </section>

      <section className="panel lookup">
        <div className="panel-title"><div><p className="eyebrow">Recherche</p><h2>Client ou référence de réservation</h2></div><Search /></div>
        <form method="get"><input type="hidden" name="days" value={days} /><input name="q" defaultValue={query} placeholder="Nom, email ou SAF-…" minLength={2} /><button><Search size={16} /> Rechercher</button></form>
        {data.lookup && <div className="lookup-results"><div><b>{data.lookup.users.length}</b><span>comptes trouvés</span></div><div><b>{data.lookup.reservations.length}</b><span>réservations trouvées</span></div><div><b>{data.lookup.events.length}</b><span>actions reliées</span></div></div>}
      </section>
    </div>
  </main>
}

export default async function Page({ searchParams }: { searchParams: Promise<{ days?: string; q?: string }> }) {
  if (!await hasValidSession()) redirect('/login')
  const params = await searchParams
  const requestedDays = Number(params.days ?? '30')
  const days = [7, 30, 90].includes(requestedDays) ? requestedDays : 30
  const query = (params.q || '').trim().slice(0, 120)
  const [result, ga4] = await Promise.all([
    getAnalyticsData(days, query)
      .then(data => ({ data, error: null }))
      .catch(error => ({ data: null, error: error instanceof Error ? error.message : 'Erreur inconnue' })),
    getGa4RealtimeData(days),
  ])
  if (!result.data) {
    return <main className="login-shell"><div className="login-card error-card"><AlertTriangle size={28} /><h1>Données indisponibles</h1><p className="muted">{result.error}</p><Link href="/">Réessayer</Link><LogoutButton /></div></main>
  }
  return <Dashboard data={result.data} ga4={ga4} days={days} query={query} />
}
