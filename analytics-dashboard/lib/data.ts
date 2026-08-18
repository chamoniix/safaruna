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
  countries: Array<{ label: string; count: number }>
  devices: Array<{ label: string; count: number }>
  pages: Array<{ label: string; count: number }>
  events: Array<{ label: string; count: number }>
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

function emptyGa4(error: string | null): Ga4RealtimeData {
  return {
    available: false,
    generatedAt: new Date().toISOString(),
    error,
    overview: { activeUsers: 0, pageViews: 0, eventCount: 0, keyEvents: 0 },
    countries: [], devices: [], pages: [], events: [],
  }
}

export async function getGa4RealtimeData(): Promise<Ga4RealtimeData> {
  const propertyId = process.env.GA4_PROPERTY_ID
  const rawCredentials = process.env.GA4_SERVICE_ACCOUNT_JSON
  if (!propertyId || !rawCredentials) return emptyGa4('Connexion GA4 non configurée')

  try {
    const credentials = JSON.parse(rawCredentials) as Ga4ServiceAccount
    if (!credentials.client_email || !credentials.private_key) throw new Error('Identifiants GA4 incomplets')
    const accessToken = await getGa4AccessToken(credentials)
    const [overview, countries, devices, pages, events] = await Promise.all([
      runGa4RealtimeReport(propertyId, accessToken, [], ['activeUsers', 'screenPageViews', 'eventCount', 'keyEvents']),
      runGa4RealtimeReport(propertyId, accessToken, ['country'], ['activeUsers']),
      runGa4RealtimeReport(propertyId, accessToken, ['deviceCategory'], ['activeUsers']),
      runGa4RealtimeReport(propertyId, accessToken, ['unifiedScreenName'], ['screenPageViews']),
      runGa4RealtimeReport(propertyId, accessToken, ['eventName'], ['eventCount']),
    ])
    const values = overview.rows?.[0]?.metricValues || []
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
      countries: ga4Breakdown(countries),
      devices: ga4Breakdown(devices),
      pages: ga4Breakdown(pages),
      events: ga4Breakdown(events),
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
