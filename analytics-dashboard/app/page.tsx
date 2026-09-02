import {
  Activity, AlertTriangle, ArrowLeft, ArrowRight, BarChart3, CheckCircle2, CircleDollarSign, Gift,
  Clock3, Cloud, CreditCard, Database, Eye, Gauge, Globe2, LayoutDashboard, ListFilter, Mail,
  type LucideIcon, Menu, MonitorSmartphone, MousePointerClick, RefreshCw, Search, ShieldCheck,
  Smartphone, Tablet, UserRound, UsersRound, Waypoints, Zap,
} from 'lucide-react'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { hasValidSession } from '@/lib/auth'
import { getAdminLoginHistory, type AdminLoginEvent } from '@/lib/admin-audit'
import {
  getAnalyticsData, getBigQueryUsage, getGa4RealtimeData, type AnalyticsData, type BigQueryUsage,
  type DashboardView, type Ga4ComparisonRow, type Ga4MetricComparison, type Ga4RealtimeData,
} from '@/lib/data'
import AutoRefresh from './AutoRefresh'
import LogoutButton from './LogoutButton'

export const dynamic = 'force-dynamic'

const views: Array<{ id: DashboardView; label: string; description: string; icon: LucideIcon; group: string }> = [
  { id: 'overview', label: 'Vue générale', description: 'Santé globale', icon: LayoutDashboard, group: 'Pilotage' },
  { id: 'realtime', label: 'Temps réel', description: 'Activité en direct', icon: Zap, group: 'Pilotage' },
  { id: 'audience', label: 'Audience', description: 'Pays et appareils', icon: UsersRound, group: 'Comprendre' },
  { id: 'acquisition', label: 'Acquisition', description: 'Sources et campagnes', icon: Waypoints, group: 'Comprendre' },
  { id: 'content', label: 'Contenu', description: 'Pages et interactions', icon: Eye, group: 'Comprendre' },
  { id: 'auth', label: 'Authentification', description: 'Comptes et connexions', icon: ShieldCheck, group: 'Opérations' },
  { id: 'guides', label: 'Guides', description: 'Candidatures et profils', icon: UserRound, group: 'Opérations' },
  { id: 'payments', label: 'Réservations', description: 'Paiements et revenu', icon: CreditCard, group: 'Opérations' },
  { id: 'referrals', label: 'Parrainages', description: 'Liens, codes et paiements', icon: Gift, group: 'Opérations' },
  { id: 'emails', label: 'Emails', description: 'Envois et livraison', icon: Mail, group: 'Opérations' },
  { id: 'errors', label: 'Qualité', description: 'Erreurs et performance', icon: Gauge, group: 'Technique' },
  { id: 'search', label: 'Recherche', description: 'Client ou réservation', icon: Search, group: 'Technique' },
  { id: 'infrastructure', label: 'Infrastructure', description: 'GA4, BigQuery, Clarity', icon: Database, group: 'Technique' },
]

const viewIds = new Set<DashboardView>(views.map(view => view.id))

const funnelLabels: Record<string, string> = {
  guide_viewed: 'Profil guide vu', booking_started: 'Réservation commencée', booking_step: 'Étape complétée',
  begin_checkout: 'Checkout demandé', checkout_created: 'Session de paiement créée', purchase: 'Paiement confirmé',
}

const eventLabels: Record<string, string> = {
  page_view: 'Page vue', cta_click: 'Clic', guide_search: 'Recherche guide', guide_viewed: 'Guide vu',
  guide_application_started: 'Candidature commencée', guide_application_step: 'Étape candidature',
  guide_application_submitted: 'Candidature envoyée', account_created: 'Compte créé', login_success: 'Connexion réussie',
  booking_started: 'Réservation commencée', booking_step: 'Étape réservation', begin_checkout: 'Checkout demandé',
  checkout_created: 'Session de paiement', checkout_error: 'Erreur checkout', payment_cancelled: 'Paiement annulé',
  purchase: 'Paiement confirmé', payment_expired: 'Session expirée', review_submitted: 'Avis envoyé',
  review_moderated: 'Avis modéré', web_vital: 'Performance web', client_error: 'Erreur navigateur',
}

const viewTitles: Record<DashboardView, { eyebrow: string; title: string; description: string }> = {
  overview: { eyebrow: 'Centre de contrôle', title: 'Vue générale', description: 'Les indicateurs essentiels pour piloter SAFARUMA aujourd’hui.' },
  realtime: { eyebrow: 'En direct', title: 'Temps réel', description: 'Qui est sur le site, depuis où et sur quelles pages.' },
  audience: { eyebrow: 'Comprendre les visiteurs', title: 'Audience', description: 'Géographie, langues, appareils, navigateurs et systèmes.' },
  acquisition: { eyebrow: 'Origine du trafic', title: 'Acquisition', description: 'Canaux, sources, campagnes et pages d’entrée.' },
  content: { eyebrow: 'Comportement', title: 'Contenu et interactions', description: 'Pages consultées et actions réalisées sur le site.' },
  auth: { eyebrow: 'Identités', title: 'Comptes et connexions', description: 'Inscriptions clients, guides et accès au dashboard privé.' },
  guides: { eyebrow: 'Réseau certifié', title: 'Guides', description: 'Profils consultés, guides actifs et nouvelles candidatures.' },
  payments: { eyebrow: 'Business', title: 'Réservations et paiements', description: 'Tunnel de paiement, réservations et chiffre d’affaires.' },
  referrals: { eyebrow: 'Business', title: 'Parrainages', description: 'Liens utilisés, codes promotionnels et paiements qualifiants.' },
  emails: { eyebrow: 'Communication', title: 'Emails transactionnels', description: 'Acceptation Brevo, livraison, reprises et échecs sans exposer le contenu des messages.' },
  errors: { eyebrow: 'Fiabilité', title: 'Erreurs et performances', description: 'Incidents Sentry, erreurs navigateur et Core Web Vitals.' },
  search: { eyebrow: 'Support', title: 'Recherche globale', description: 'Retrouver un client, une réservation ou ses actions.' },
  infrastructure: { eyebrow: 'Données', title: 'Infrastructure analytics', description: 'État de GA4, BigQuery, Clarity et consommation des quotas.' },
}

function number(value: number) { return new Intl.NumberFormat('fr-FR').format(value) }
function euro(value: number) { return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value) }
function percent(value: number) { return `${new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 }).format(value * 100)} %` }
function duration(value: number) { const minutes = Math.floor(value / 60); const seconds = Math.round(value % 60); return minutes ? `${minutes} min ${seconds} s` : `${seconds} s` }
function bytes(value: number) { if (!value) return '0 o'; const units = ['o', 'Ko', 'Mo', 'Go', 'To']; const index = Math.min(units.length - 1, Math.floor(Math.log(value) / Math.log(1024))); return `${(value / 1024 ** index).toFixed(index > 2 ? 2 : 0)} ${units[index]}` }
function date(value: string | null | undefined) { return value ? new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : '—' }
function paymentStatus(value: string) {
  if (value === 'SUCCEEDED') return 'Payé'
  if (value === 'PENDING' || value === 'CREATED') return 'En cours'
  if (value === 'EXPIRED') return 'Expiré'
  if (value === 'CANCELLED') return 'Annulé'
  if (value === 'FAILED') return 'Échec'
  return value
}
function countryName(code: string) { if (code === 'UNKNOWN') return 'Pays inconnu'; try { return new Intl.DisplayNames(['fr'], { type: 'region' }).of(code) || code } catch { return code } }
function deviceName(device: string) { return ({ MOBILE: 'Mobile', TABLET: 'Tablette', DESKTOP: 'Ordinateur', UNKNOWN: 'Inconnu', mobile: 'Mobile', tablet: 'Tablette', desktop: 'Ordinateur' } as Record<string, string>)[device] || device }
function percentChange(value: number | null) { if (value === null) return 'Nouveau'; return `${value > 0 ? '+' : ''}${new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 }).format(value)} %` }

function Metric({ icon, label, value, note, tone = 'blue' }: { icon: React.ReactNode; label: string; value: string; note: string; tone?: string }) {
  return <article className={`metric tone-${tone}`}><div className="metric-head"><span>{label}</span>{icon}</div><strong>{value}</strong><small>{note}</small></article>
}

function PanelTitle({ eyebrow, title, icon }: { eyebrow: string; title: string; icon: React.ReactNode }) {
  return <div className="panel-title"><div><p className="eyebrow">{eyebrow}</p><h2>{title}</h2></div>{icon}</div>
}

function RankedList({ rows, kind = 'plain' }: { rows: Array<{ label: string; count: number }>; kind?: 'country' | 'device' | 'plain' }) {
  const max = Math.max(1, ...rows.map(row => row.count))
  if (!rows.length) return <div className="empty">Aucune donnée pour cette période.</div>
  return <div className="ranked-list">{rows.slice(0, 10).map(row => {
    const label = kind === 'country' ? countryName(row.label) : kind === 'device' ? deviceName(row.label) : row.label
    const DeviceIcon = row.label.toUpperCase() === 'MOBILE' ? Smartphone : row.label.toUpperCase() === 'TABLET' ? Tablet : MonitorSmartphone
    return <div className="ranked-row" key={row.label}><div className="ranked-label">{kind === 'device' && <DeviceIcon size={16} />}<span title={label}>{label}</span><b>{number(row.count)}</b></div><div className="bar"><i style={{ width: `${row.count / max * 100}%` }} /></div></div>
  })}</div>
}

function ComparisonRankedList({ rows }: { rows: Ga4ComparisonRow[] }) {
  const max = Math.max(1, ...rows.map(row => row.count))
  if (!rows.length) return <div className="empty">Aucune donnée pour cette période.</div>
  return <div className="ranked-list">{rows.map(row => <div className="ranked-row" key={row.label}><div className="ranked-label"><span title={row.label}>{row.label}</span><em className={row.change !== null && row.change < 0 ? 'down' : 'up'}>{percentChange(row.change)}</em><b>{number(row.count)}</b></div><div className="bar"><i style={{ width: `${row.count / max * 100}%` }} /></div></div>)}</div>
}

function LineChart({ rows, previous = true }: { rows: Array<{ label: string; current: number; previous?: number }>; previous?: boolean }) {
  if (!rows.length) return <div className="empty">Aucune donnée pour cette période.</div>
  const width = 900, height = 260, padding = { top: 20, right: 18, bottom: 38, left: 44 }
  const chartWidth = width - padding.left - padding.right, chartHeight = height - padding.top - padding.bottom
  const max = Math.max(1, ...rows.flatMap(row => [row.current, row.previous || 0]))
  const coordinates = (value: number, index: number) => ({ x: padding.left + (rows.length === 1 ? chartWidth / 2 : index / (rows.length - 1) * chartWidth), y: padding.top + chartHeight - value / max * chartHeight })
  const points = (field: 'current' | 'previous') => rows.map((row, index) => { const point = coordinates(field === 'current' ? row.current : row.previous || 0, index); return `${point.x},${point.y}` }).join(' ')
  const labelIndexes = new Set([0, Math.floor((rows.length - 1) / 2), rows.length - 1])
  return <div className="chart-wrap"><div className="chart-legend"><span>Période actuelle</span>{previous && <span className="previous">Période précédente</span>}</div><svg className="line-chart" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Évolution des utilisateurs actifs">
    {[0, .25, .5, .75, 1].map(step => { const y = padding.top + chartHeight - step * chartHeight; return <g key={step}><line x1={padding.left} y1={y} x2={width - padding.right} y2={y} className="chart-grid" /><text x={padding.left - 10} y={y + 4} textAnchor="end">{Math.round(max * step)}</text></g> })}
    {previous && <polyline points={points('previous')} className="chart-line chart-previous" />}<polyline points={points('current')} className="chart-line chart-current" />
    {rows.map((row, index) => { const { x, y } = coordinates(row.current, index); const detail = previous ? `${number(row.current)} actuels · ${number(row.previous || 0)} précédents` : `${number(row.current)} actif(s)`; return <g className="chart-point" key={`${row.label}-${index}`}><circle cx={x} cy={y} r="12" className="chart-hit" /><circle cx={x} cy={y} r="4" className="chart-dot" /><g className="chart-tooltip"><rect x={Math.min(width - 220, Math.max(44, x - 100))} y={y < 60 ? y + 14 : y - 48} width="200" height="38" rx="8" /><text x={Math.min(width - 210, Math.max(54, x - 90))} y={(y < 60 ? y + 14 : y - 48) + 15}>{row.label}</text><text x={Math.min(width - 210, Math.max(54, x - 90))} y={(y < 60 ? y + 14 : y - 48) + 29}>{detail}</text></g><title>{`${row.label} : ${detail}`}</title></g> })}
    {rows.map((row, index) => labelIndexes.has(index) ? <text key={`${row.label}-label`} x={coordinates(0, index).x} y={height - 8} textAnchor={index === 0 ? 'start' : index === rows.length - 1 ? 'end' : 'middle'}>{row.label}</text> : null)}
  </svg></div>
}

function Ga4Unavailable({ error }: { error: string | null }) { return <div className="empty warning"><AlertTriangle size={18} />{error || 'Connexion GA4 indisponible.'}</div> }

function comparisonNote(metric: Ga4MetricComparison) { return `${percentChange(metric.change)} vs période précédente` }

function UsageMeter({ label, value, percentValue, limit }: { label: string; value: string; percentValue: number; limit: string }) {
  const state = percentValue >= 90 ? 'critical' : percentValue >= 70 ? 'watch' : 'ok'
  return <div className={`usage-meter ${state}`}><div><span>{label}</span><b>{value}</b></div><div className="usage-track"><i style={{ width: `${Math.min(100, percentValue)}%` }} /></div><small>{percentValue.toFixed(2)} % de la limite gratuite · {limit}</small></div>
}

function Sidebar({ view, days }: { view: DashboardView; days: number }) {
  return <aside className="sidebar"><div className="sidebar-brand"><span>SAFAR<span>U</span>MA</span><small>Intelligence</small></div><nav>{views.map((item, index) => { const Icon = item.icon; const group = index === 0 || views[index - 1]?.group !== item.group ? item.group : ''; return <div key={item.id}>{group && <p>{group}</p>}<Link prefetch={false} href={{ pathname: '/', query: { view: item.id, days } }} className={view === item.id ? 'active' : ''}><Icon size={18} /><span><b>{item.label}</b><small>{item.description}</small></span>{view === item.id && <i />}</Link></div> })}</nav><div className="sidebar-foot"><ShieldCheck size={15} /><span>Accès superadmin<br />Session chiffrée</span></div></aside>
}

function MobileMenu({ view, days }: { view: DashboardView; days: number }) {
  const active = views.find(item => item.id === view) || views[0]
  return <details className="mobile-menu"><summary><Menu size={19} /><span><small>Section</small><b>{active.label}</b></span><ArrowRight size={17} /></summary><nav>{views.map(item => { const Icon = item.icon; return <Link prefetch={false} key={item.id} href={{ pathname: '/', query: { view: item.id, days } }} className={view === item.id ? 'active' : ''}><Icon size={17} />{item.label}</Link> })}</nav></details>
}

function Dashboard({ data, ga4, bigQuery, loginHistory, days, query, view }: { data: AnalyticsData; ga4: Ga4RealtimeData; bigQuery: BigQueryUsage | null; loginHistory: AdminLoginEvent[]; days: number; query: string; view: DashboardView }) {
  const maxFunnel = Math.max(1, ...data.funnel.map(item => item.count))
  const heading = viewTitles[view]
  const unifiedAccessHistory = [
    ...(data.accessHistory || []),
    ...loginHistory.map(item => ({
      id: `analytics:${item.id}`,
      createdAt: item.at,
      dashboard: 'SAFARUMA ANALYTICS',
      role: 'SUPERADMIN ANALYTICS',
      email: item.username,
      success: item.success,
      reason: item.reason,
      ip: item.ip,
      country: item.country,
      city: item.city,
      device: item.device,
      browser: item.browser,
      userAgent: null,
    })),
  ].sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()).slice(0, 100)

  const overview = () => <>
    <section className="metrics kpi-grid">
      <Metric icon={<Activity />} label="Actifs maintenant" value={number(data.overview.activeVisitors)} note="5 dernières minutes" tone="green" />
      <Metric icon={<Eye />} label="Pages vues" value={number(data.overview.pageViews)} note={`${number(data.overview.uniqueVisitors)} visiteurs uniques`} />
      <Metric icon={<UserRound />} label="Nouveaux comptes" value={number(data.overview.accountsNew)} note={`${number(data.overview.accountsTotal)} au total`} tone="gold" />
      <Metric icon={<CreditCard />} label="Réservations" value={number(data.overview.confirmedReservations)} note={`${number(data.overview.reservations)} demandes`} tone="teal" />
      <Metric icon={<CircleDollarSign />} label="Chiffre d’affaires" value={euro(data.overview.revenue)} note="réservations confirmées" tone="purple" />
      <Metric icon={<BarChart3 />} label="Conversion" value={percent(data.overview.conversionRate)} note="visiteur → paiement" tone="orange" />
    </section>
    {!ga4.available ? <Ga4Unavailable error={ga4.error} /> : <>
      <section className="panel feature-panel"><PanelTitle eyebrow="Google Analytics 4" title={`Performance · ${days} derniers jours`} icon={<CheckCircle2 className="ok" />} /><div className="metric-ribbon">
        <div><span>Utilisateurs</span><b>{number(ga4.historical.overview.activeUsers.current)}</b><small>{comparisonNote(ga4.historical.overview.activeUsers)}</small></div>
        <div><span>Sessions</span><b>{number(ga4.historical.overview.sessions.current)}</b><small>{comparisonNote(ga4.historical.overview.sessions)}</small></div>
        <div><span>Engagement</span><b>{percent(ga4.historical.overview.engagementRate.current)}</b><small>{comparisonNote(ga4.historical.overview.engagementRate)}</small></div>
        <div><span>Durée moyenne</span><b>{duration(ga4.historical.overview.averageSessionDuration.current)}</b><small>par session</small></div>
        <div><span>Événements clés</span><b>{number(ga4.historical.overview.keyEvents.current)}</b><small>{comparisonNote(ga4.historical.overview.keyEvents)}</small></div>
      </div></section>
      <section className="panel"><PanelTitle eyebrow="Tendance" title="Utilisateurs actifs par jour" icon={<BarChart3 />} /><LineChart rows={ga4.historical.daily} /></section>
    </>}
    <section className="panel"><PanelTitle eyebrow="Tunnel commercial" title="De la découverte au paiement" icon={<Waypoints />} /><div className="funnel">{data.funnel.map((item, index) => <div className="funnel-row" key={item.name}><span className="funnel-index">{index + 1}</span><span>{funnelLabels[item.name] || item.name}</span><div className="funnel-bar"><i style={{ width: `${Math.max(2, item.count / maxFunnel * 100)}%` }} /></div><b>{number(item.count)}</b></div>)}</div></section>
  </>

  const realtime = () => <>{!ga4.available ? <Ga4Unavailable error={ga4.error} /> : <>
    <section className="live-banner"><div><span className="live-pulse" /><div><p>Activité en direct</p><b>{number(ga4.overview.activeUsers)} visiteur{ga4.overview.activeUsers > 1 ? 's' : ''} actif{ga4.overview.activeUsers > 1 ? 's' : ''}</b></div></div><small>Actualisation automatique toutes les 30 secondes</small></section>
    <section className="metrics four"><Metric icon={<UsersRound />} label="Visiteurs actifs" value={number(ga4.overview.activeUsers)} note="30 dernières minutes" tone="green" /><Metric icon={<Eye />} label="Pages vues" value={number(ga4.overview.pageViews)} note="en direct" /><Metric icon={<MousePointerClick />} label="Événements" value={number(ga4.overview.eventCount)} note="actions enregistrées" tone="teal" /><Metric icon={<CheckCircle2 />} label="Événements clés" value={number(ga4.overview.keyEvents)} note="conversions" tone="gold" /></section>
    <section className="panel"><PanelTitle eyebrow="Minute par minute" title="Utilisateurs actifs" icon={<Activity />} /><LineChart rows={ga4.minuteSeries.map(row => ({ label: row.label, current: row.value }))} previous={false} /></section>
    <section className="grid two"><article className="panel"><PanelTitle eyebrow="Localisation" title="Pays" icon={<Globe2 />} /><RankedList rows={ga4.countries} /></article><article className="panel"><PanelTitle eyebrow="Technologie" title="Appareils" icon={<MonitorSmartphone />} /><RankedList rows={ga4.devices} kind="device" /></article><article className="panel"><PanelTitle eyebrow="Navigation" title="Pages consultées" icon={<Eye />} /><RankedList rows={ga4.pages} /></article><article className="panel"><PanelTitle eyebrow="Actions" title="Événements" icon={<MousePointerClick />} /><RankedList rows={ga4.events.map(row => ({ ...row, label: eventLabels[row.label] || row.label }))} /></article></section>
  </>}
    <section className="panel"><PanelTitle eyebrow="SAFARUMA en direct" title="Dernières sessions détaillées" icon={<Clock3 />} /><div className="journeys">{data.journeys.slice(0, 20).map(journey => <details key={`${journey.id}-${journey.lastActivity}`}><summary><div><b>{journey.user?.name || journey.user?.email || `Visiteur ${journey.id}`}</b><span>{countryName(journey.country)} · {deviceName(journey.device)}</span></div><em>{journey.events.length} actions · {date(journey.lastActivity)}</em></summary><ol>{journey.events.map((event, index) => <li key={`${event.at}-${index}`}><i /><div><b>{eventLabels[event.name] || event.name}</b><span>{event.path || 'Action serveur'} · {date(event.at)}</span></div></li>)}</ol></details>)}</div></section>
  </>

  const audience = () => <>{!ga4.available ? <Ga4Unavailable error={ga4.error} /> : <section className="grid two"><article className="panel"><PanelTitle eyebrow="Géographie" title="Pays" icon={<Globe2 />} /><ComparisonRankedList rows={ga4.historical.countries} /></article><article className="panel"><PanelTitle eyebrow="Géographie" title="Villes" icon={<Globe2 />} /><ComparisonRankedList rows={ga4.historical.cities} /></article><article className="panel"><PanelTitle eyebrow="Préférences" title="Langues" icon={<UsersRound />} /><ComparisonRankedList rows={ga4.historical.languages} /></article><article className="panel"><PanelTitle eyebrow="Support" title="Appareils" icon={<MonitorSmartphone />} /><ComparisonRankedList rows={ga4.historical.devices} /></article><article className="panel"><PanelTitle eyebrow="Technologie" title="Navigateurs" icon={<Cloud />} /><ComparisonRankedList rows={ga4.historical.browsers} /></article><article className="panel"><PanelTitle eyebrow="Technologie" title="Systèmes d’exploitation" icon={<MonitorSmartphone />} /><ComparisonRankedList rows={ga4.historical.operatingSystems} /></article></section>}<section className="grid two"><article className="panel compact"><PanelTitle eyebrow="Collecte SAFARUMA" title="Pays vérifiés" icon={<Globe2 />} /><RankedList rows={data.breakdowns.countries} kind="country" /></article><article className="panel compact"><PanelTitle eyebrow="Collecte SAFARUMA" title="Appareils vérifiés" icon={<MonitorSmartphone />} /><RankedList rows={data.breakdowns.devices} kind="device" /></article></section></>

  const acquisition = () => <>{!ga4.available ? <Ga4Unavailable error={ga4.error} /> : <section className="grid two"><article className="panel"><PanelTitle eyebrow="Canaux" title="Sessions par canal" icon={<Waypoints />} /><ComparisonRankedList rows={ga4.historical.channels} /></article><article className="panel"><PanelTitle eyebrow="Première visite" title="Source / support initial" icon={<UsersRound />} /><ComparisonRankedList rows={ga4.historical.firstSources} /></article><article className="panel"><PanelTitle eyebrow="Sessions" title="Source / support" icon={<Activity />} /><ComparisonRankedList rows={ga4.historical.sessionSources} /></article><article className="panel"><PanelTitle eyebrow="Marketing" title="Campagnes" icon={<BarChart3 />} /><ComparisonRankedList rows={ga4.historical.campaigns} /></article><article className="panel"><PanelTitle eyebrow="Entrée" title="Pages d’arrivée" icon={<Eye />} /><ComparisonRankedList rows={ga4.historical.landingPages} /></article><article className="panel"><PanelTitle eyebrow="Référents" title="Sites et pages sources" icon={<ArrowRight />} /><ComparisonRankedList rows={ga4.historical.referrers} /></article></section>}<section className="panel compact"><PanelTitle eyebrow="Collecte SAFARUMA" title="Référents directement observés" icon={<Waypoints />} /><RankedList rows={data.breakdowns.referrers} /></section></>

  const content = () => <>{!ga4.available ? <Ga4Unavailable error={ga4.error} /> : <section className="grid two"><article className="panel"><PanelTitle eyebrow="Navigation" title="Pages les plus vues" icon={<Eye />} /><ComparisonRankedList rows={ga4.historical.pages} /></article><article className="panel"><PanelTitle eyebrow="Entrée" title="Pages d’arrivée" icon={<ArrowRight />} /><ComparisonRankedList rows={ga4.historical.landingPages} /></article><article className="panel"><PanelTitle eyebrow="Interactions" title="Événements GA4" icon={<MousePointerClick />} /><ComparisonRankedList rows={ga4.historical.events.map(row => ({ ...row, label: eventLabels[row.label] || row.label }))} /></article><article className="panel"><PanelTitle eyebrow="Conversions" title="Événements clés par plateforme" icon={<CheckCircle2 />} /><ComparisonRankedList rows={ga4.historical.platforms} /></article></section>}<section className="grid two"><article className="panel"><PanelTitle eyebrow="Collecte SAFARUMA" title="Pages consultées" icon={<Eye />} /><RankedList rows={data.breakdowns.pages} /></article><article className="panel"><PanelTitle eyebrow="Collecte SAFARUMA" title="Toutes les actions" icon={<ListFilter />} /><RankedList rows={data.breakdowns.events.map(row => ({ ...row, label: eventLabels[row.label] || row.label }))} /></article></section></>

  const auth = () => <>
    <section className="metrics four"><Metric icon={<UsersRound />} label="Comptes" value={number(data.accounts.total)} note="tous les rôles" /><Metric icon={<UserRound />} label="Nouveaux" value={number(data.overview.accountsNew)} note={`${days} derniers jours`} tone="green" /><Metric icon={<ShieldCheck />} label="Pèlerins" value={number(data.accounts.byRole.PELERIN || 0)} note="comptes clients" tone="teal" /><Metric icon={<UserRound />} label="Guides" value={number(data.accounts.byRole.GUIDE || 0)} note="comptes guides" tone="gold" /></section>
    <section className="panel"><PanelTitle eyebrow="Utilisateurs" title="Dernières inscriptions" icon={<UserRound />} /><div className="account-list">{data.accounts.recent.map(user => <div key={user.id}><span className="avatar">{(user.name || user.email || '?').charAt(0).toUpperCase()}</span><div><b>{user.name || 'Sans nom'}</b><span>{user.email || 'Sans email'}</span></div><em><span>{user.role}</span><small>Créé {date(user.createdAt)}</small><small>Connexion {date(user.lastLogin)}</small></em></div>)}</div><div className="pagination"><Link aria-disabled={data.accounts.page <= 1} href={{ pathname: '/', query: { view: 'auth', days, accountPage: Math.max(1, data.accounts.page - 1) } }}><ArrowLeft size={16} /> Précédent</Link><span>Page {data.accounts.page} sur {data.accounts.pages}</span><Link aria-disabled={data.accounts.page >= data.accounts.pages} href={{ pathname: '/', query: { view: 'auth', days, accountPage: Math.min(data.accounts.pages, data.accounts.page + 1) } }}>Suivant <ArrowRight size={16} /></Link></div></section>
    <section className="panel"><PanelTitle eyebrow="Accès centralisés" title="Connexions à tous les dashboards" icon={<ShieldCheck />} />{!unifiedAccessHistory.length ? <div className="empty">Le journal apparaîtra à la prochaine connexion.</div> : <div className="table-wrap"><table><thead><tr><th>Date</th><th>Espace</th><th>Email / identifiant</th><th>Rôle</th><th>Résultat</th><th>Adresse IP</th><th>Localisation</th><th>Appareil</th></tr></thead><tbody>{unifiedAccessHistory.map(item => <tr key={item.id}><td>{date(item.createdAt)}</td><td>{item.dashboard}</td><td>{item.email || '—'}</td><td><span className="pill">{item.role}</span></td><td><span className={`pill ${item.success ? 'confirmed' : 'cancelled'}`}>{item.success ? 'Réussie' : item.reason}</span></td><td><code>{item.ip || '—'}</code></td><td>{item.city || '—'} · {item.country || '—'}</td><td>{item.device || '—'} · {item.browser || '—'}</td></tr>)}</tbody></table></div>}</section>
    <section className="panel"><PanelTitle eyebrow="Sécurité superadmin" title="Historique de connexion au dashboard" icon={<ShieldCheck />} />{!loginHistory.length ? <div className="empty">Le journal commencera à la prochaine tentative de connexion.</div> : <div className="table-wrap"><table><thead><tr><th>Date</th><th>Identifiant</th><th>Résultat</th><th>Adresse IP</th><th>Localisation</th><th>Appareil</th></tr></thead><tbody>{loginHistory.map(item => <tr key={item.id}><td>{date(item.at)}</td><td>{item.username}</td><td><span className={`pill ${item.success ? 'confirmed' : 'cancelled'}`}>{item.success ? 'Réussie' : item.reason === 'rate_limited' ? 'Bloquée' : 'Échouée'}</span></td><td><code>{item.ip}</code></td><td>{item.city} · {item.country}</td><td>{item.device} · {item.browser}</td></tr>)}</tbody></table></div>}</section>
    <section className="panel"><PanelTitle eyebrow="Sécurité administration" title="Connexions à l’espace opérationnel" icon={<ShieldCheck />} /><div className="metric-ribbon"><div><span>Sessions actives</span><b>{number(data.adminSecurity.activeSessions)}</b><small>sessions individuelles non révoquées</small></div><div><span>Tentatives journalisées</span><b>{number(data.adminSecurity.loginAttempts.length)}</b><small>100 dernières au maximum</small></div></div>{!data.adminSecurity.loginAttempts.length ? <div className="empty">Le journal commencera à la prochaine connexion admin.</div> : <div className="table-wrap"><table><thead><tr><th>Date</th><th>Email</th><th>Résultat</th><th>Adresse IP</th><th>Localisation</th><th>Appareil</th></tr></thead><tbody>{data.adminSecurity.loginAttempts.map(item => <tr key={item.id}><td>{date(item.createdAt)}</td><td>{item.email}</td><td><span className={`pill ${item.success ? 'confirmed' : 'cancelled'}`}>{item.success ? 'Réussie' : item.reason}</span></td><td><code>{item.ip || '—'}</code></td><td>{item.city || '—'} · {item.country || '—'}</td><td>{item.device || '—'} · {item.browser || '—'}</td></tr>)}</tbody></table></div>}</section>
  </>

  const guides = () => <><section className="metrics four"><Metric icon={<UserRound />} label="Guides actifs" value={number(data.overview.guidesActive)} note="visibles sur le site" tone="green" /><Metric icon={<Clock3 />} label="À examiner" value={number(data.overview.guidesPending)} note="à traiter ou en cours" tone="gold" /><Metric icon={<MousePointerClick />} label="Candidatures" value={number(data.overview.guideApplications)} note={`${days} derniers jours`} tone="teal" /><Metric icon={<Eye />} label="Profils vus" value={number(data.breakdowns.events.find(row => row.label === 'guide_viewed')?.count || 0)} note="événements enregistrés" /></section><section className="panel"><PanelTitle eyebrow="Candidatures réelles" title="Dernières demandes guide" icon={<ListFilter />} /><div className="table-wrap"><table><thead><tr><th>Candidat</th><th>Contact</th><th>Villes</th><th>Langues</th><th>Statut</th><th>Reçue</th><th>Traitée par</th></tr></thead><tbody>{data.guideApplications.recent.map(item => <tr key={item.id}><td><b>{item.firstName} {item.lastName}</b><br /><small>{item.gender} · {item.nationality || '—'}</small></td><td>{item.email}<br /><small>{item.whatsapp || '—'}</small></td><td>{item.serviceCities.join(' · ')}</td><td>{item.languages.join(', ') || '—'}</td><td><span className={`pill ${item.status === 'APPROVED' ? 'confirmed' : item.status === 'REJECTED' ? 'cancelled' : 'pending'}`}>{item.status === 'PENDING' ? 'À traiter' : item.status === 'IN_REVIEW' ? 'En cours' : item.status === 'APPROVED' ? 'Validée' : 'Rejetée'}</span></td><td>{date(item.createdAt)}</td><td>{item.reviewedByEmail || '—'}</td></tr>)}</tbody></table>{!data.guideApplications.recent.length && <div className="empty">Aucune candidature réelle.</div>}</div><div className="pagination"><Link aria-disabled={data.guideApplications.page <= 1} href={{ pathname: '/', query: { view: 'guides', days, guideApplicationPage: Math.max(1, data.guideApplications.page - 1) } }}><ArrowLeft size={16} /> Précédent</Link><span>Page {data.guideApplications.page} sur {data.guideApplications.pages}</span><Link aria-disabled={data.guideApplications.page >= data.guideApplications.pages} href={{ pathname: '/', query: { view: 'guides', days, guideApplicationPage: Math.min(data.guideApplications.pages, data.guideApplications.page + 1) } }}>Suivant <ArrowRight size={16} /></Link></div></section><section className="grid two"><article className="panel"><PanelTitle eyebrow="Intérêt" title="Guides les plus consultés" icon={<Eye />} /><RankedList rows={data.breakdowns.guides} /></article><article className="panel"><PanelTitle eyebrow="Formulaire" title="Actions dans l’inscription guide" icon={<ListFilter />} /><RankedList rows={data.breakdowns.events.filter(row => row.label.startsWith('guide_application')).map(row => ({ ...row, label: eventLabels[row.label] || row.label }))} /></article></section></>

  const payments = () => {
    const succeeded = data.payments.providers.reduce((sum, provider) => sum + provider.succeeded, 0)
    const failed = data.payments.providers.reduce((sum, provider) => sum + provider.failed, 0)
    const expired = data.payments.providers.reduce((sum, provider) => sum + provider.expired, 0)
    return <>
      <section className="metrics four">
        <Metric icon={<CircleDollarSign />} label="Chiffre d’affaires" value={euro(data.overview.revenue)} note="réservations confirmées" tone="green" />
        <Metric icon={<CreditCard />} label="Paiements réussis" value={number(succeeded)} note="registre des processeurs" tone="teal" />
        <Metric icon={<AlertTriangle />} label="Échecs paiement" value={number(failed)} note="tentatives enregistrées" tone="red" />
        <Metric icon={<Clock3 />} label="Expirés" value={number(expired)} note="tentatives enregistrées" tone="gold" />
      </section>
      <section className="panel">
        <PanelTitle eyebrow="Processeurs de paiement" title="État réel des tentatives" icon={<CreditCard />} />
        <div className="table-wrap"><table><thead><tr><th>Processeur</th><th>Tentatives</th><th>Payées</th><th>En cours</th><th>Échecs</th><th>Annulées</th><th>Expirées</th><th>Capturé</th></tr></thead><tbody>{data.payments.providers.map(item => <tr key={item.provider}><td><b>{item.provider}</b></td><td>{number(item.attempts)}</td><td>{number(item.succeeded)}</td><td>{number(item.pending)}</td><td>{number(item.failed)}</td><td>{number(item.cancelled)}</td><td>{number(item.expired)}</td><td>{euro(item.capturedCents / 100)}</td></tr>)}</tbody></table>{!data.payments.providers.length && <div className="empty">Aucune tentative de paiement sur cette période.</div>}</div>
      </section>
      <section className="panel">
        <PanelTitle eyebrow="Traçabilité" title="Dernières tentatives de paiement" icon={<CreditCard />} />
        <div className="table-wrap"><table><thead><tr><th>Référence</th><th>Processeur</th><th>Statut</th><th>Montant</th><th>Identifiant checkout</th><th>Identifiant paiement</th><th>Date</th></tr></thead><tbody>{data.payments.attempts.map(item => <tr key={item.id}><td><code>{item.bookingRef}</code></td><td><b>{item.provider}</b></td><td><span className={`pill ${item.status === 'SUCCEEDED' ? 'confirmed' : item.status === 'FAILED' || item.status === 'CANCELLED' ? 'cancelled' : 'pending'}`}>{paymentStatus(item.status)}</span></td><td>{euro(item.amountCents / 100)}</td><td><code>{item.providerCheckoutId || '—'}</code></td><td><code>{item.providerPaymentId || '—'}</code></td><td>{date(item.paidAt || item.createdAt)}</td></tr>)}</tbody></table>{!data.payments.attempts.length && <div className="empty">Aucune tentative enregistrée.</div>}</div>
      </section>
      <section className="panel">
        <PanelTitle eyebrow="Action requise" title="Incidents de traitement des webhooks" icon={<AlertTriangle />} />
        <div className="table-wrap"><table><thead><tr><th>Référence</th><th>Processeur</th><th>Événement</th><th>Tentatives</th><th>Erreur technique</th><th>Date</th></tr></thead><tbody>{data.payments.failedEvents.map(item => <tr key={item.id}><td><code>{item.bookingRef || '—'}</code></td><td><b>{item.provider}</b></td><td>{item.providerEventType}<br /><small><code>{item.providerEventId}</code></small></td><td>{item.processingAttempts}</td><td>{item.lastError || '—'}</td><td>{date(item.occurredAt)}</td></tr>)}</tbody></table>{!data.payments.failedEvents.length && <div className="empty success">Aucun webhook en échec sur cette période.</div>}</div>
      </section>
      <section className="panel">
        <PanelTitle eyebrow="Réservations" title="Dernières demandes" icon={<CreditCard />} />
        <div className="table-wrap"><table><thead><tr><th>Référence</th><th>Client</th><th>Destination</th><th>Voyageurs</th><th>Montant</th><th>Processeur</th><th>Paiement</th><th>Réservation</th><th>Date</th></tr></thead><tbody>{data.payments.reservations.map(item => <tr key={item.refNumber}><td><code>{item.refNumber}</code></td><td>{item.pelerin.name || item.pelerin.email || '—'}</td><td>{item.selectedCities || '—'}</td><td>{item.nbPeople}</td><td>{euro(item.totalPrice)}</td><td>{item.payment?.provider || '—'}</td><td>{item.payment ? paymentStatus(item.payment.status) : 'Aucun'}</td><td><span className={`pill ${item.status.toLowerCase()}`}>{item.status}</span></td><td>{date(item.createdAt)}</td></tr>)}</tbody></table>{!data.payments.reservations.length && <div className="empty">Aucune réservation sur cette période.</div>}</div>
      </section>
    </>
  }

  const referrals = () => <><section className="metrics three"><Metric icon={<Gift />} label="Liens utilisés" value={number(data.referrals.total)} note={`${days} derniers jours`} tone="blue" /><Metric icon={<CheckCircle2 />} label="Paiements qualifiants" value={number(data.referrals.qualified)} note="paiement confirmé par webhook" tone="green" /><Metric icon={<Clock3 />} label="En attente" value={number(data.referrals.pending)} note="inscrits sans paiement" tone="gold" /></section><section className="panel"><PanelTitle eyebrow="Traçabilité complète" title="Parrainages réels" icon={<Gift />} /><div className="table-wrap"><table><thead><tr><th>Parrain</th><th>Filleul</th><th>Inscription</th><th>Statut</th><th>Codes</th><th>Paiement</th></tr></thead><tbody>{data.referrals.rows.map(item => <tr key={item.id}><td>{item.sponsor.name || item.sponsor.email || '—'}<br /><small>{item.sponsor.email || '—'}</small></td><td>{item.referred.name || item.referred.email || '—'}<br /><small>{item.referred.email || '—'}</small></td><td>{date(item.createdAt)}</td><td><span className={`pill ${item.status === 'QUALIFIED' ? 'confirmed' : 'pending'}`}>{item.status === 'QUALIFIED' ? 'Paiement confirmé' : 'En attente'}</span></td><td>{item.promoCodes.map(code => <div key={`${code.kind}:${code.code}`}><code>{code.code}</code> · {code.discountPercent} % · {code.status}</div>)}</td><td>{item.payment ? <><code>{item.payment.refNumber}</code><br />{euro(item.payment.totalPrice)}<br /><small>{item.payment.provider || 'Processeur historique'} · {date(item.payment.createdAt)}</small></> : '—'}</td></tr>)}</tbody></table>{!data.referrals.rows.length && <div className="empty">Aucun parrainage réel sur cette période.</div>}</div></section></>

  const emails = () => <><section className="metrics four"><Metric icon={<Mail />} label="Envois suivis" value={number(data.emailDelivery.total)} note="registre transactionnel" tone="blue" /><Metric icon={<CheckCircle2 />} label="Livrés" value={number(data.emailDelivery.delivered)} note={`${percent(data.emailDelivery.deliveryRate)} des envois acceptés`} tone="green" /><Metric icon={<Clock3 />} label="En attente" value={number(data.emailDelivery.pending)} note="file de reprise" tone="gold" /><Metric icon={<AlertTriangle />} label="Échecs" value={number(data.emailDelivery.failed)} note="permanents ou épuisés" tone="red" /></section><section className="grid two"><article className="panel"><PanelTitle eyebrow="Brevo" title="Statuts de livraison" icon={<Mail />} /><RankedList rows={data.emailDelivery.byStatus} /></article><article className="panel"><PanelTitle eyebrow="Catégories" title="Types d’emails envoyés" icon={<ListFilter />} /><RankedList rows={data.emailDelivery.byCategory} /></article></section><section className="panel"><PanelTitle eyebrow="Action requise" title="Derniers échecs" icon={<AlertTriangle />} /><div className="table-wrap"><table><thead><tr><th>Catégorie</th><th>Statut</th><th>Tentatives</th><th>Erreur technique</th><th>Date</th></tr></thead><tbody>{data.emailDelivery.recentFailures.map(item => <tr key={item.id}><td>{item.category}</td><td><span className="pill failed">{item.status}</span></td><td>{item.attempts}</td><td>{item.error || '—'}</td><td>{date(item.createdAt)}</td></tr>)}</tbody></table>{!data.emailDelivery.recentFailures.length && <div className="empty success">Aucun échec sur cette période.</div>}</div></section></>

  const errors = () => <><section className="metrics four"><Metric icon={<AlertTriangle />} label="Erreurs Sentry" value={number(data.sentry.issues.reduce((sum, issue) => sum + issue.count, 0))} note="occurrences non résolues" tone="red" /><Metric icon={<Activity />} label="Erreurs navigateur" value={number(data.breakdowns.events.find(row => row.label === 'client_error')?.count || 0)} note="collecte SAFARUMA" tone="orange" /><Metric icon={<Gauge />} label="Mesures performance" value={number(data.performance.reduce((sum, metric) => sum + metric.samples, 0))} note="échantillons réels" tone="teal" /><Metric icon={<CheckCircle2 />} label="Statut Sentry" value={data.sentry.available ? 'Connecté' : 'Indisponible'} note="surveillance des incidents" tone="green" /></section><section className="grid two"><article className="panel"><PanelTitle eyebrow="Sentry" title="Erreurs non résolues" icon={data.sentry.available ? <CheckCircle2 className="ok" /> : <AlertTriangle className="warn" />} />{!data.sentry.available ? <div className="empty">Connexion Sentry indisponible.</div> : <div className="issues">{data.sentry.issues.slice(0, 12).map(issue => <a href={issue.permalink} target="_blank" rel="noreferrer" key={issue.id}><div><b>{issue.title}</b><span>{issue.culprit || 'Emplacement inconnu'}</span></div><em>{number(issue.count)} occurrences<ArrowRight size={14} /></em></a>)}{!data.sentry.issues.length && <div className="empty success">Aucune erreur non résolue.</div>}</div>}</article><article className="panel"><PanelTitle eyebrow="Expérience réelle" title="Core Web Vitals" icon={<Gauge />} />{!data.performance.length ? <div className="empty">Les premières mesures apparaîtront après le déploiement.</div> : <div className="vitals">{data.performance.map(metric => <div key={metric.metric}><span>{metric.metric}</span><b>P75 · {metric.metric === 'CLS' ? metric.p75.toFixed(3) : `${Math.round(metric.p75)} ms`}</b><small>{metric.samples} échantillons · moyenne {metric.average.toFixed(metric.metric === 'CLS' ? 3 : 0)}</small></div>)}</div>}</article></section></>

  const searchView = () => <section className="panel search-panel"><PanelTitle eyebrow="Recherche sécurisée" title="Client ou référence de réservation" icon={<Search />} /><form method="get"><input type="hidden" name="days" value={days} /><input type="hidden" name="view" value="search" /><label htmlFor="global-search">Nom, email ou référence SAF-…</label><div><input id="global-search" name="q" defaultValue={query} placeholder="Ex. SAF-2026 ou client@exemple.com" minLength={2} /><button><Search size={17} /> Rechercher</button></div></form>{data.lookup && <><div className="lookup-results"><div><span>Comptes</span><b>{data.lookup.users.length}</b></div><div><span>Réservations</span><b>{data.lookup.reservations.length}</b></div><div><span>Actions reliées</span><b>{data.lookup.events.length}</b></div></div><p className="search-note">Résultats pour « {query} »</p></>}</section>

  const infrastructure = () => <><section className="grid two"><article className="panel service-card"><PanelTitle eyebrow="Google Analytics 4" title="Collecte et quota API" icon={ga4.available ? <CheckCircle2 className="ok" /> : <AlertTriangle className="warn" />} /><div className="service-state"><span className={ga4.available ? 'connected' : 'offline'}>{ga4.available ? 'Connecté' : 'Indisponible'}</span><small>Propriété 536896629</small></div>{ga4.quota ? <UsageMeter label="Jetons API cette heure" value={number(ga4.quota.consumed)} percentValue={ga4.quota.limit ? ga4.quota.consumed / ga4.quota.limit * 100 : 0} limit={`${number(ga4.quota.limit)} jetons`} /> : <p className="service-note">Le quota sera affiché dès que Google le retourne.</p>}</article><article className="panel service-card"><PanelTitle eyebrow="Microsoft Clarity" title="Enregistrements et heatmaps" icon={<CheckCircle2 className="ok" />} /><div className="service-state"><span className="connected">Installé</span><small>Projet y4opk03t84</small></div><p className="service-note">Le script est présent sur toutes les pages du site. Les enregistrements apparaissent directement dans Clarity.</p></article></section>
    <section className="panel bigquery-panel"><PanelTitle eyebrow="Entrepôt de données" title="BigQuery · région EU" icon={<Database />} />{!bigQuery ? <div className="empty">État BigQuery indisponible.</div> : bigQuery.error ? <div className="empty warning"><AlertTriangle size={18} />{bigQuery.error}</div> : !bigQuery.linked ? <div className="setup-state"><Database size={28} /><div><b>En attente de la liaison GA4</b><p>Le projet est prêt. Le dataset {bigQuery.dataset} apparaîtra après l’activation de l’export quotidien.</p></div></div> : <div className="usage-grid"><UsageMeter label="Stockage" value={bytes(bigQuery.storageBytes)} percentValue={bigQuery.storagePercent} limit="10 Gio gratuits / mois" /><UsageMeter label="Requêtes analysées" value={bytes(bigQuery.queryBytes)} percentValue={bigQuery.queryPercent} limit="1 Tio gratuit / mois" /></div>}<div className="cost-guard"><ShieldCheck size={18} /><div><b>Protection de coût active dans le dashboard</b><span>Vert jusqu’à 70 %, surveillance à 70 %, alerte critique à 90 %. Export quotidien uniquement, sans streaming payant.</span></div></div></section></>

  const contentByView: Record<DashboardView, () => React.ReactNode> = { overview, realtime, audience, acquisition, content, auth, guides, payments, referrals, emails, errors, search: searchView, infrastructure }

  return <main><AutoRefresh enabled={view === 'realtime'} /><Sidebar view={view} days={days} /><div className="workspace"><header className="topbar"><div><span className="status-dot" />Systèmes opérationnels</div><div><span>Mis à jour {date(data.generatedAt)}</span><LogoutButton /></div></header><div className="mobile-head"><div className="sidebar-brand"><span>SAFAR<span>U</span>MA</span><small>Intelligence</small></div><LogoutButton /></div><MobileMenu view={view} days={days} /><div className="content"><section className="page-head"><div><p className="eyebrow">{heading.eyebrow}</p><h1>{heading.title}</h1><p>{heading.description}</p></div><form className="range-form" method="get"><input type="hidden" name="view" value={view} />{query && <input type="hidden" name="q" value={query} />}<select name="days" defaultValue={String(days)} aria-label="Période"><option value="7">7 jours</option><option value="30">30 jours</option><option value="90">90 jours</option></select><button><RefreshCw size={16} /> Actualiser</button></form></section><div className="context-line"><span><Activity size={14} /> Données détaillées conservées {data.range.detailedRetentionDays} jours</span><span>{days} derniers jours · comparaison automatique</span></div>{contentByView[view]()}</div></div></main>
}

export default async function Page({ searchParams }: { searchParams: Promise<{ days?: string; q?: string; view?: string; accountPage?: string; guideApplicationPage?: string }> }) {
  if (!await hasValidSession()) redirect('/login')
  const params = await searchParams
  const requestedDays = Number(params.days ?? '30')
  const days = [7, 30, 90].includes(requestedDays) ? requestedDays : 30
  const view = viewIds.has(params.view as DashboardView) ? params.view as DashboardView : 'overview'
  const query = (params.q || '').trim().slice(0, 120)
  const accountPage = Math.max(1, Number(params.accountPage || '1') || 1)
  const guideApplicationPage = Math.max(1, Number(params.guideApplicationPage || '1') || 1)
  const [result, ga4, loginHistory, bigQuery] = await Promise.all([
    getAnalyticsData(days, query, accountPage, guideApplicationPage).then(data => ({ data, error: null })).catch(error => ({ data: null, error: error instanceof Error ? error.message : 'Erreur inconnue' })),
    getGa4RealtimeData(days, view),
    view === 'auth' ? getAdminLoginHistory() : Promise.resolve([]),
    view === 'infrastructure' ? getBigQueryUsage() : Promise.resolve(null),
  ])
  if (!result.data) return <main className="login-shell"><div className="login-card error-card"><AlertTriangle size={28} /><h1>Données indisponibles</h1><p className="muted">{result.error}</p><Link href="/">Réessayer</Link><LogoutButton /></div></main>
  return <Dashboard data={result.data} ga4={ga4} bigQuery={bigQuery} loginHistory={loginHistory} days={days} query={query} view={view} />
}
