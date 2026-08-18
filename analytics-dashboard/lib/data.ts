import 'server-only'

import { createSign } from 'node:crypto'

export type AnalyticsData = {
  generatedAt: string
  range: { days: number; start: string; detailedRetentionDays: number }
  overview: {
    activeVisitors: number; uniqueVisitors: number; pageViews: number
    accountsTotal: number; accountsNew: number; reservations: number
    confirmedReservations: number; revenue: number; conversionRate: number; guidesActive: number
  }
  funnel: Array<{ name: string; count: number }>
  breakdowns: Record<'countries' | 'devices' | 'pages' | 'guides', Array<{ label: string; count: number }>>
  payments: {
    checkoutCreated: number; purchases: number; errors: number; cancelled: number; expired: number
    reservations: Array<{
      refNumber: string; status: string; totalPrice: number; createdAt: string
      selectedCities: string | null; nbPeople: number
      pelerin: { id: string; name: string | null; email: string | null }
    }>
  }
  accounts: { recent: Array<{ id: string; name: string | null; email: string | null; role: string; country: string | null; createdAt: string; lastLogin: string | null }> }
  journeys: Array<{
    id: string; user: { name: string | null; email: string | null } | null
    country: string; device: string; lastActivity: string
    events: Array<{ name: string; path: string | null; at: string; metadata: unknown }>
  }>
  sentry: { available: boolean; issues: Array<{ id: string; title: string; culprit: string; level: string; count: number; users: number; firstSeen: string; lastSeen: string; permalink: string }> }
  lookup: { users: unknown[]; reservations: unknown[]; events: unknown[] } | null
}

export type Ga4RealtimeData = {
  available: boolean
  generatedAt: string
  error: string | null
  overview: { activeUsers: number; pageViews: number; eventCount: number; keyEvents: number }
  minuteSeries: Array<{ label: string; value: number }>
  countries: Array<{ label: string; count: number }>
  devices: Array<{ label: string; count: number }>
  pages: Array<{ label: string; count: number }>
  events: Array<{ label: string; count: number }>
  historical: Ga4HistoricalData
}

export type Ga4MetricComparison = {
  current: number
  previous: number
  change: number | null
}

export type Ga4ComparisonRow = {
  label: string
  count: number
  previous: number
  change: number | null
}

export type Ga4HistoricalData = {
  days: number
  currentLabel: string
  previousLabel: string
  overview: {
    activeUsers: Ga4MetricComparison
    eventCount: Ga4MetricComparison
    keyEvents: Ga4MetricComparison
    newUsers: Ga4MetricComparison
  }
  daily: Array<{ label: string; current: number; previous: number }>
  countries: Ga4ComparisonRow[]
  pages: Ga4ComparisonRow[]
  channels: Ga4ComparisonRow[]
  platforms: Ga4ComparisonRow[]
  firstSources: Ga4ComparisonRow[]
  sessionSources: Ga4ComparisonRow[]
  cities: Ga4ComparisonRow[]
}

type Ga4ServiceAccount = {
  client_email: string
  private_key: string
  private_key_id?: string
  token_uri?: string
}

type Ga4Report = {
  rows?: Array<{
    dimensionValues?: Array<{ value?: string }>
    metricValues?: Array<{ value?: string }>
  }>
  error?: { message?: string }
}

let ga4AccessToken: { value: string; expiresAt: number } | null = null
const ga4HistoryCache = new Map<number, { expiresAt: number; data: Ga4HistoricalData }>()

function base64Url(value: string | Buffer) {
  return Buffer.from(value).toString('base64url')
}

async function getGa4AccessToken(credentials: Ga4ServiceAccount) {
  if (ga4AccessToken && ga4AccessToken.expiresAt > Date.now() + 60_000) return ga4AccessToken.value

  const now = Math.floor(Date.now() / 1000)
  const tokenUri = credentials.token_uri || 'https://oauth2.googleapis.com/token'
  const header = base64Url(JSON.stringify({ alg: 'RS256', typ: 'JWT', kid: credentials.private_key_id }))
  const claims = base64Url(JSON.stringify({
    iss: credentials.client_email,
    scope: 'https://www.googleapis.com/auth/analytics.readonly',
    aud: tokenUri,
    iat: now,
    exp: now + 3600,
  }))
  const unsignedToken = `${header}.${claims}`
  const signer = createSign('RSA-SHA256')
  signer.update(unsignedToken)
  signer.end()
  const assertion = `${unsignedToken}.${base64Url(signer.sign(credentials.private_key))}`
  const response = await fetch(tokenUri, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }),
    cache: 'no-store',
  })
  const payload = await response.json() as { access_token?: string; expires_in?: number; error_description?: string }
  if (!response.ok || !payload.access_token) throw new Error(payload.error_description || 'Authentification GA4 impossible')

  ga4AccessToken = {
    value: payload.access_token,
    expiresAt: Date.now() + (payload.expires_in || 3600) * 1000,
  }
  return ga4AccessToken.value
}

async function runGa4RealtimeReport(
  propertyId: string,
  accessToken: string,
  dimensions: string[],
  metrics: string[],
): Promise<Ga4Report> {
  const response = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runRealtimeReport`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      dimensions: dimensions.map(name => ({ name })),
      metrics: metrics.map(name => ({ name })),
      limit: '10',
      ...(dimensions.length ? { orderBys: [{ metric: { metricName: metrics[0] }, desc: true }] } : {}),
    }),
    cache: 'no-store',
  })
  const payload = await response.json() as Ga4Report
  if (!response.ok) throw new Error(payload.error?.message || `Rapport GA4 indisponible (${response.status})`)
  return payload
}

async function runGa4Report(
  propertyId: string,
  accessToken: string,
  dimensions: string[],
  metrics: string[],
  dateRanges: Array<{ startDate: string; endDate: string; name: string }>,
): Promise<Ga4Report> {
  const response = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      dateRanges,
      dimensions: dimensions.map(name => ({ name })),
      metrics: metrics.map(name => ({ name })),
      limit: '100',
      ...(dimensions.length ? { orderBys: [{ metric: { metricName: metrics[0] }, desc: true }] } : {}),
    }),
    cache: 'no-store',
  })
  const payload = await response.json() as Ga4Report
  if (!response.ok) throw new Error(payload.error?.message || `Rapport historique GA4 indisponible (${response.status})`)
  return payload
}

function ga4Number(value: string | undefined) {
  const parsed = Number(value || 0)
  return Number.isFinite(parsed) ? parsed : 0
}

function ga4Breakdown(report: Ga4Report) {
  return (report.rows || []).map(row => ({
    label: row.dimensionValues?.[0]?.value || 'Inconnu',
    count: ga4Number(row.metricValues?.[0]?.value),
  }))
}

function comparison(current: number, previous: number): Ga4MetricComparison {
  return {
    current,
    previous,
    change: previous === 0 ? (current === 0 ? 0 : null) : ((current - previous) / previous) * 100,
  }
}

function historicalValues(report: Ga4Report, metricIndex: number) {
  const values = { current: 0, previous: 0 }
  for (const row of report.rows || []) {
    const range = row.dimensionValues?.at(-1)?.value
    if (range === 'current' || range === 'previous') values[range] = ga4Number(row.metricValues?.[metricIndex]?.value)
  }
  return comparison(values.current, values.previous)
}

function historicalBreakdown(report: Ga4Report): Ga4ComparisonRow[] {
  const values = new Map<string, { current: number; previous: number }>()
  for (const row of report.rows || []) {
    const label = row.dimensionValues?.[0]?.value || 'Inconnu'
    const range = row.dimensionValues?.at(-1)?.value
    if (range !== 'current' && range !== 'previous') continue
    const item = values.get(label) || { current: 0, previous: 0 }
    item[range] = ga4Number(row.metricValues?.[0]?.value)
    values.set(label, item)
  }
  return [...values.entries()]
    .map(([label, value]) => ({ label, count: value.current, previous: value.previous, change: comparison(value.current, value.previous).change }))
    .sort((a, b) => b.count - a.count || b.previous - a.previous)
    .slice(0, 10)
}

function ga4DateLabel(value: string) {
  if (!/^\d{8}$/.test(value)) return value
  const date = new Date(`${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}T12:00:00Z`)
  return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', timeZone: 'UTC' }).format(date)
}

function ga4DateKey(value: Date) {
  return `${value.getUTCFullYear()}${String(value.getUTCMonth() + 1).padStart(2, '0')}${String(value.getUTCDate()).padStart(2, '0')}`
}

function historicalDaily(report: Ga4Report, days: number) {
  const ranges = { current: new Map<string, number>(), previous: new Map<string, number>() }
  for (const row of report.rows || []) {
    const date = row.dimensionValues?.[0]?.value
    const range = row.dimensionValues?.at(-1)?.value
    if (!date || (range !== 'current' && range !== 'previous')) continue
    ranges[range].set(date, ga4Number(row.metricValues?.[0]?.value))
  }
  return Array.from({ length: days }, (_, index) => {
    const currentDate = new Date()
    currentDate.setUTCDate(currentDate.getUTCDate() - (days - index))
    const previousDate = new Date(currentDate)
    previousDate.setUTCDate(previousDate.getUTCDate() - days)
    const currentKey = ga4DateKey(currentDate)
    const previousKey = ga4DateKey(previousDate)
    return {
      label: ga4DateLabel(currentKey),
      current: ranges.current.get(currentKey) || 0,
      previous: ranges.previous.get(previousKey) || 0,
    }
  })
}

function rangeLabel(daysAgoStart: number, daysAgoEnd: number) {
  const end = new Date()
  end.setUTCDate(end.getUTCDate() - daysAgoEnd)
  const start = new Date()
  start.setUTCDate(start.getUTCDate() - daysAgoStart)
  const formatter = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })
  return `${formatter.format(start)} – ${formatter.format(end)}`
}

async function getGa4HistoricalData(propertyId: string, accessToken: string, days: number): Promise<Ga4HistoricalData> {
  const cached = ga4HistoryCache.get(days)
  if (cached && cached.expiresAt > Date.now()) return cached.data

  const dateRanges = [
    { startDate: `${days}daysAgo`, endDate: 'yesterday', name: 'current' },
    { startDate: `${days * 2}daysAgo`, endDate: `${days + 1}daysAgo`, name: 'previous' },
  ]
  const [overview, daily, countries, pages, channels, platforms, firstSources, sessionSources, cities] = await Promise.all([
    runGa4Report(propertyId, accessToken, [], ['activeUsers', 'eventCount', 'keyEvents', 'newUsers'], dateRanges),
    runGa4Report(propertyId, accessToken, ['date'], ['activeUsers'], dateRanges),
    runGa4Report(propertyId, accessToken, ['country'], ['activeUsers'], dateRanges),
    runGa4Report(propertyId, accessToken, ['pageTitle'], ['screenPageViews'], dateRanges),
    runGa4Report(propertyId, accessToken, ['sessionDefaultChannelGroup'], ['sessions'], dateRanges),
    runGa4Report(propertyId, accessToken, ['platform'], ['keyEvents'], dateRanges),
    runGa4Report(propertyId, accessToken, ['firstUserSourceMedium'], ['activeUsers'], dateRanges),
    runGa4Report(propertyId, accessToken, ['sessionSourceMedium'], ['sessions'], dateRanges),
    runGa4Report(propertyId, accessToken, ['city'], ['activeUsers'], dateRanges),
  ])
  const data: Ga4HistoricalData = {
    days,
    currentLabel: rangeLabel(days, 1),
    previousLabel: rangeLabel(days * 2, days + 1),
    overview: {
      activeUsers: historicalValues(overview, 0),
      eventCount: historicalValues(overview, 1),
      keyEvents: historicalValues(overview, 2),
      newUsers: historicalValues(overview, 3),
    },
    daily: historicalDaily(daily, days),
    countries: historicalBreakdown(countries),
    pages: historicalBreakdown(pages),
    channels: historicalBreakdown(channels),
    platforms: historicalBreakdown(platforms),
    firstSources: historicalBreakdown(firstSources),
    sessionSources: historicalBreakdown(sessionSources),
    cities: historicalBreakdown(cities),
  }
  ga4HistoryCache.set(days, { expiresAt: Date.now() + 5 * 60_000, data })
  return data
}

function emptyGa4(error: string | null): Ga4RealtimeData {
  return {
    available: false,
    generatedAt: new Date().toISOString(),
    error,
    overview: { activeUsers: 0, pageViews: 0, eventCount: 0, keyEvents: 0 },
    minuteSeries: [],
    countries: [], devices: [], pages: [], events: [],
    historical: {
      days: 30, currentLabel: '', previousLabel: '',
      overview: {
        activeUsers: comparison(0, 0), eventCount: comparison(0, 0),
        keyEvents: comparison(0, 0), newUsers: comparison(0, 0),
      },
      daily: [], countries: [], pages: [], channels: [], platforms: [], firstSources: [], sessionSources: [], cities: [],
    },
  }
}

export async function getGa4RealtimeData(days: number): Promise<Ga4RealtimeData> {
  const propertyId = process.env.GA4_PROPERTY_ID
  const rawCredentials = process.env.GA4_SERVICE_ACCOUNT_JSON
  if (!propertyId || !rawCredentials) return emptyGa4('Connexion GA4 non configurée')

  try {
    const credentials = JSON.parse(rawCredentials) as Ga4ServiceAccount
    if (!credentials.client_email || !credentials.private_key) throw new Error('Identifiants GA4 incomplets')
    const accessToken = await getGa4AccessToken(credentials)
    const historical = await getGa4HistoricalData(propertyId, accessToken, days)
    const [overview, minutes, countries, devices, pages, events] = await Promise.all([
      runGa4RealtimeReport(propertyId, accessToken, [], ['activeUsers', 'screenPageViews', 'eventCount', 'keyEvents']),
      runGa4RealtimeReport(propertyId, accessToken, ['minutesAgo'], ['activeUsers']),
      runGa4RealtimeReport(propertyId, accessToken, ['country'], ['activeUsers']),
      runGa4RealtimeReport(propertyId, accessToken, ['deviceCategory'], ['activeUsers']),
      runGa4RealtimeReport(propertyId, accessToken, ['unifiedScreenName'], ['screenPageViews']),
      runGa4RealtimeReport(propertyId, accessToken, ['eventName'], ['eventCount']),
    ])
    const values = overview.rows?.[0]?.metricValues || []
    const minuteValues = new Map((minutes.rows || []).map(row => [ga4Number(row.dimensionValues?.[0]?.value), ga4Number(row.metricValues?.[0]?.value)]))
    return {
      available: true,
      generatedAt: new Date().toISOString(),
      error: null,
      overview: {
        activeUsers: ga4Number(values[0]?.value),
        pageViews: ga4Number(values[1]?.value),
        eventCount: ga4Number(values[2]?.value),
        keyEvents: ga4Number(values[3]?.value),
      },
      minuteSeries: Array.from({ length: 30 }, (_, index) => {
        const minutesAgo = 29 - index
        return { label: minutesAgo === 0 ? 'Maintenant' : `-${minutesAgo} min`, value: minuteValues.get(minutesAgo) || 0 }
      }),
      countries: ga4Breakdown(countries),
      devices: ga4Breakdown(devices),
      pages: ga4Breakdown(pages),
      events: ga4Breakdown(events),
      historical,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Connexion GA4 indisponible'
    return emptyGa4(message.toLowerCase().includes('permission') ? 'Le compte technique attend son accès Lecteur dans GA4.' : message)
  }
}

export async function getAnalyticsData(days: number, query: string): Promise<AnalyticsData> {
  const baseUrl = process.env.SAFARUMA_API_BASE?.replace(/\/$/, '')
  const secret = process.env.ANALYTICS_INTERNAL_SECRET
  if (!baseUrl || !secret) throw new Error('Connexion analytics non configurée')
  const params = new URLSearchParams({ days: String(days) })
  if (query) params.set('q', query)
  const response = await fetch(`${baseUrl}/api/internal/analytics/overview?${params}`, {
    headers: { Authorization: `Bearer ${secret}` },
    cache: 'no-store',
  })
  if (!response.ok) throw new Error(`API analytics indisponible (${response.status})`)
  return response.json() as Promise<AnalyticsData>
}
