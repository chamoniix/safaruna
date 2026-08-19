import { timingSafeEqual } from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

type EventRow = {
  id: string
  eventName: string
  sessionHash: string | null
  userId: string | null
  path: string | null
  referrer: string | null
  country: string | null
  device: string | null
  metadata: unknown
  createdAt: Date
  user: { name: string | null; email: string | null } | null
}

function authorized(req: NextRequest): boolean {
  const expected = process.env.ANALYTICS_INTERNAL_SECRET
  const value = req.headers.get('authorization')
  if (!expected || !value?.startsWith('Bearer ')) return false
  const received = value.slice(7)
  const expectedBuffer = Buffer.from(expected)
  const receivedBuffer = Buffer.from(received)
  return expectedBuffer.length === receivedBuffer.length && timingSafeEqual(expectedBuffer, receivedBuffer)
}

function metadataObject(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}
}

function addCount(map: Map<string, number>, key: string | null | undefined) {
  const normalized = key || 'UNKNOWN'
  map.set(normalized, (map.get(normalized) ?? 0) + 1)
}

function ranked(map: Map<string, number>, limit = 20) {
  return [...map.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
}

async function sentryIssues(days: number) {
  const token = process.env.SENTRY_ANALYTICS_TOKEN
  const org = process.env.SENTRY_ORG || 'safaruma'
  const project = process.env.SENTRY_PROJECT || 'javascript-nextjs'
  if (!token) return { available: false, issues: [] }

  try {
    const params = new URLSearchParams({ project, query: 'is:unresolved', statsPeriod: `${days}d`, limit: '25' })
    const response = await fetch(
      `https://sentry.io/api/0/organizations/${encodeURIComponent(org)}/issues/?${params}`,
      { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' }
    )
    if (!response.ok) return { available: false, issues: [] }
    const data = await response.json() as Array<Record<string, unknown>>
    return {
      available: true,
      issues: data.map(issue => ({
        id: String(issue.id ?? ''),
        title: String(issue.title ?? 'Erreur sans titre'),
        culprit: String(issue.culprit ?? ''),
        level: String(issue.level ?? 'error'),
        count: Number(issue.count ?? 0),
        users: Number(issue.userCount ?? 0),
        firstSeen: String(issue.firstSeen ?? ''),
        lastSeen: String(issue.lastSeen ?? ''),
        permalink: String(issue.permalink ?? ''),
      })),
    }
  } catch {
    return { available: false, issues: [] }
  }
}

export async function GET(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const requestedDays = Number(req.nextUrl.searchParams.get('days') ?? '30')
  const days = Number.isInteger(requestedDays) ? Math.min(90, Math.max(1, requestedDays)) : 30
  const query = (req.nextUrl.searchParams.get('q') ?? '').trim().slice(0, 120)
  const requestedAccountPage = Number(req.nextUrl.searchParams.get('accountPage') ?? '1')
  const accountPage = Number.isInteger(requestedAccountPage) ? Math.max(1, requestedAccountPage) : 1
  const accountPageSize = 10
  const start = new Date(Date.now() - days * 86_400_000)
  const activeSince = new Date(Date.now() - 5 * 60_000)

  const [events, usersTotal, usersNew, usersByRole, recentUsers, reservations, guidesActive, guidesPending, sentry] = await Promise.all([
    prisma.analyticsEvent.findMany({
      where: { createdAt: { gte: start } },
      orderBy: { createdAt: 'desc' },
      take: 20_000,
      include: { user: { select: { name: true, email: true } } },
    }),
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: start } } }),
    prisma.user.groupBy({ by: ['role'], _count: { _all: true } }),
    prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      skip: (accountPage - 1) * accountPageSize,
      take: accountPageSize,
      select: { id: true, name: true, email: true, role: true, country: true, createdAt: true, lastLogin: true },
    }),
    prisma.reservation.findMany({
      where: { createdAt: { gte: start } },
      orderBy: { createdAt: 'desc' },
      take: 500,
      select: {
        refNumber: true, status: true, totalPrice: true, createdAt: true,
        selectedCities: true, nbPeople: true,
        pelerin: { select: { id: true, name: true, email: true } },
      },
    }),
    prisma.guideProfile.count({ where: { status: 'ACTIVE' } }),
    prisma.guideProfile.count({ where: { status: 'REVIEW' } }),
    sentryIssues(days),
  ])

  const rows = events as EventRow[]
  const eventCounts = new Map<string, number>()
  const countries = new Map<string, number>()
  const devices = new Map<string, number>()
  const pages = new Map<string, number>()
  const guides = new Map<string, number>()
  const referrers = new Map<string, number>()
  const vitalValues = new Map<string, number[]>()
  const activeSessions = new Set<string>()
  const visitorSessions = new Set<string>()

  for (const event of rows) {
    addCount(eventCounts, event.eventName)
    if (event.sessionHash) visitorSessions.add(event.sessionHash)
    if (event.createdAt >= activeSince && event.sessionHash) activeSessions.add(event.sessionHash)
    if (event.eventName === 'page_view') {
      addCount(countries, event.country)
      addCount(devices, event.device)
      addCount(pages, event.path)
      addCount(referrers, event.referrer)
    }
    if (event.eventName === 'guide_viewed') {
      const slug = metadataObject(event.metadata).guideSlug
      if (typeof slug === 'string') addCount(guides, slug)
    }
    if (event.eventName === 'web_vital') {
      const metadata = metadataObject(event.metadata)
      const metric = metadata.metric
      const value = metadata.value
      if (typeof metric === 'string' && typeof value === 'number' && Number.isFinite(value)) {
        const values = vitalValues.get(metric) ?? []
        values.push(value)
        vitalValues.set(metric, values)
      }
    }
  }

  const confirmed = reservations.filter(reservation => reservation.status === 'CONFIRMED')
  const revenue = confirmed.reduce((sum, reservation) => sum + reservation.totalPrice, 0)
  const funnelNames = ['guide_viewed', 'booking_started', 'booking_step', 'begin_checkout', 'checkout_created', 'purchase']
  const funnel = funnelNames.map(name => ({ name, count: eventCounts.get(name) ?? 0 }))

  const journeyMap = new Map<string, EventRow[]>()
  for (const event of rows) {
    const key = event.sessionHash || (event.userId ? `user:${event.userId}` : null)
    if (!key) continue
    const list = journeyMap.get(key) ?? []
    if (list.length < 30) list.push(event)
    journeyMap.set(key, list)
  }
  const journeys = [...journeyMap.entries()].slice(0, 50).map(([key, journeyEvents]) => ({
    id: key.slice(0, 12),
    user: journeyEvents.find(event => event.user)?.user ?? null,
    country: journeyEvents.find(event => event.country)?.country ?? 'UNKNOWN',
    device: journeyEvents.find(event => event.device)?.device ?? 'UNKNOWN',
    lastActivity: journeyEvents[0]?.createdAt,
    events: journeyEvents.map(event => ({
      name: event.eventName,
      path: event.path,
      at: event.createdAt,
      metadata: event.metadata,
    })),
  }))

  let lookup: { users: unknown[]; reservations: unknown[]; events: unknown[] } | null = null
  if (query.length >= 2) {
    const [matchingUsers, matchingReservations] = await Promise.all([
      prisma.user.findMany({
        where: {
          OR: [
            { email: { contains: query, mode: 'insensitive' } },
            { name: { contains: query, mode: 'insensitive' } },
            { firstName: { contains: query, mode: 'insensitive' } },
            { lastName: { contains: query, mode: 'insensitive' } },
          ],
        },
        take: 20,
        select: { id: true, name: true, email: true, role: true, createdAt: true, lastLogin: true },
      }),
      prisma.reservation.findMany({
        where: { refNumber: { contains: query, mode: 'insensitive' } },
        take: 20,
        select: {
          refNumber: true, status: true, totalPrice: true, createdAt: true, selectedCities: true,
          pelerin: { select: { id: true, name: true, email: true } },
        },
      }),
    ])
    const userIds = new Set(matchingUsers.map(user => user.id))
    lookup = {
      users: matchingUsers,
      reservations: matchingReservations,
      events: rows
        .filter(event => (event.userId && userIds.has(event.userId)) || JSON.stringify(event.metadata).toLowerCase().includes(query.toLowerCase()))
        .slice(0, 100)
        .map(event => ({ name: event.eventName, path: event.path, at: event.createdAt, metadata: event.metadata })),
    }
  }

  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    range: { days, start: start.toISOString(), detailedRetentionDays: 90 },
    overview: {
      activeVisitors: activeSessions.size,
      uniqueVisitors: visitorSessions.size,
      pageViews: eventCounts.get('page_view') ?? 0,
      accountsTotal: usersTotal,
      accountsNew: usersNew,
      reservations: reservations.length,
      confirmedReservations: confirmed.length,
      revenue,
      conversionRate: visitorSessions.size > 0 ? confirmed.length / visitorSessions.size : 0,
      guidesActive,
      guidesPending,
      guideApplications: eventCounts.get('guide_application_submitted') ?? 0,
    },
    funnel,
    breakdowns: {
      countries: ranked(countries),
      devices: ranked(devices),
      pages: ranked(pages),
      guides: ranked(guides),
      referrers: ranked(referrers),
      events: ranked(eventCounts),
    },
    payments: {
      checkoutCreated: eventCounts.get('checkout_created') ?? 0,
      purchases: eventCounts.get('purchase') ?? 0,
      errors: eventCounts.get('checkout_error') ?? 0,
      cancelled: eventCounts.get('payment_cancelled') ?? 0,
      expired: eventCounts.get('payment_expired') ?? 0,
      reservations: reservations.slice(0, 50),
    },
    accounts: {
      recent: recentUsers,
      total: usersTotal,
      page: accountPage,
      pageSize: accountPageSize,
      pages: Math.max(1, Math.ceil(usersTotal / accountPageSize)),
      byRole: Object.fromEntries(usersByRole.map(row => [row.role, row._count._all])),
    },
    performance: [...vitalValues.entries()].map(([metric, values]) => {
      const sorted = [...values].sort((a, b) => a - b)
      return {
        metric,
        samples: values.length,
        average: values.reduce((sum, value) => sum + value, 0) / values.length,
        p75: sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * 0.75))] || 0,
      }
    }),
    journeys,
    sentry,
    lookup,
  }, {
    headers: {
      'Cache-Control': 'private, no-store, max-age=0',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}
