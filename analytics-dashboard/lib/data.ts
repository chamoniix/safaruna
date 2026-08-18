import 'server-only'

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
