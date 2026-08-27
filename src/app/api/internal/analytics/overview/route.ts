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
  const requestedGuideApplicationPage = Number(req.nextUrl.searchParams.get('guideApplicationPage') ?? '1')
  const guideApplicationPage = Number.isInteger(requestedGuideApplicationPage) ? Math.max(1, requestedGuideApplicationPage) : 1
  const guideApplicationPageSize = 10
  const start = new Date(Date.now() - days * 86_400_000)
  const activeSince = new Date(Date.now() - 5 * 60_000)

  const [events, usersTotal, usersNew, usersByRole, recentUsers, reservations, guidesActive, guidesPending, guideApplicationsNew, guideApplications, guideApplicationsTotal, guideApplicationCounts, adminAccounts, adminLoginAttempts, adminSessionsActive, emailDeliveries, sentry] = await Promise.all([
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
    prisma.guideApplication.count({ where: { status: { in: ['PENDING', 'IN_REVIEW'] } } }),
    prisma.guideApplication.count({ where: { createdAt: { gte: start } } }),
    prisma.guideApplication.findMany({
      orderBy: { createdAt: 'desc' },
      skip: (guideApplicationPage - 1) * guideApplicationPageSize,
      take: guideApplicationPageSize,
      select: {
        id: true, firstName: true, lastName: true, email: true, whatsapp: true, city: true,
        gender: true, serviceCities: true, nationality: true, languages: true, experienceYears: true,
        status: true, reviewedByEmail: true, reviewedAt: true, submittedCountry: true,
        submittedDevice: true, createdAt: true,
      },
    }),
    prisma.guideApplication.count(),
    prisma.guideApplication.groupBy({ by: ['status'], _count: { _all: true } }),
    prisma.adminAccount.findMany({ select: { email: true, role: true } }),
    prisma.adminLoginAttempt.findMany({ orderBy: { createdAt: 'desc' }, take: 100 }),
    prisma.adminSession.count({ where: { revokedAt: null, expiresAt: { gt: new Date() } } }),
    prisma.emailDelivery.findMany({
      where: { createdAt: { gte: start } },
      orderBy: { createdAt: 'desc' },
      take: 20_000,
      select: {
        id: true, category: true, status: true, attempts: true, lastError: true,
        acceptedAt: true, deliveredAt: true, createdAt: true,
      },
    }),
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

  const adminRoleByEmail = new Map(adminAccounts.map(account => [account.email.toLowerCase(), account.role]))
  const accountLoginHistory = rows
    .filter(event => event.eventName === 'login_success')
    .map(event => {
      const metadata = metadataObject(event.metadata)
      const role = metadata.role === 'GUIDE' ? 'GUIDE' : metadata.role === 'PELERIN' ? 'PELERIN' : null
      if (!role) return null
      return {
        id: `account:${event.id}`,
        createdAt: event.createdAt,
        dashboard: role,
        role,
        email: typeof metadata.email === 'string' ? metadata.email : event.user?.email || null,
        success: true,
        reason: 'SUCCESS',
        ip: typeof metadata.ip === 'string' ? metadata.ip : null,
        country: event.country,
        city: typeof metadata.city === 'string' ? metadata.city : null,
        device: event.device,
        browser: typeof metadata.browser === 'string' ? metadata.browser : null,
        userAgent: typeof metadata.userAgent === 'string' ? metadata.userAgent : null,
      }
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item))

  const adminAccessHistory = adminLoginAttempts.map(attempt => {
    const role = adminRoleByEmail.get(attempt.email.toLowerCase()) || 'ADMIN'
    return {
      id: `admin:${attempt.id}`,
      createdAt: attempt.createdAt,
      dashboard: role,
      role,
      email: attempt.email,
      success: attempt.success,
      reason: attempt.reason,
      ip: attempt.ip,
      country: attempt.country,
      city: attempt.city,
      device: attempt.device,
      browser: attempt.browser,
      userAgent: attempt.userAgent,
    }
  })

  const accessHistory = [...adminAccessHistory, ...accountLoginHistory]
    .sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime())
    .slice(0, 100)

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

  const emailStatuses = new Map<string, number>()
  const emailCategories = new Map<string, number>()
  for (const delivery of emailDeliveries) {
    addCount(emailStatuses, delivery.status)
    addCount(emailCategories, delivery.category)
  }
  const deliveredEmailStatuses = new Set(['DELIVERED', 'OPENED', 'CLICKED'])
  const pendingEmailStatuses = new Set(['QUEUED', 'SENDING', 'RETRY_PENDING'])
  const failedEmailStatuses = new Set(['FAILED', 'HARD_BOUNCE', 'BLOCKED', 'INVALID', 'SPAM', 'ERROR'])
  const emailAccepted = emailDeliveries.filter(item => item.acceptedAt !== null).length
  const emailDelivered = emailDeliveries.filter(item => deliveredEmailStatuses.has(item.status)).length

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
      guideApplications: guideApplicationsNew,
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
    guideApplications: {
      recent: guideApplications,
      total: guideApplicationsTotal,
      page: guideApplicationPage,
      pageSize: guideApplicationPageSize,
      pages: Math.max(1, Math.ceil(guideApplicationsTotal / guideApplicationPageSize)),
      byStatus: Object.fromEntries(guideApplicationCounts.map(row => [row.status, row._count._all])),
    },
    adminSecurity: {
      activeSessions: adminSessionsActive,
      loginAttempts: adminLoginAttempts,
    },
    emailDelivery: {
      total: emailDeliveries.length,
      accepted: emailAccepted,
      delivered: emailDelivered,
      pending: emailDeliveries.filter(item => pendingEmailStatuses.has(item.status)).length,
      failed: emailDeliveries.filter(item => failedEmailStatuses.has(item.status)).length,
      deliveryRate: emailAccepted > 0 ? emailDelivered / emailAccepted : 0,
      byStatus: ranked(emailStatuses, 30),
      byCategory: ranked(emailCategories, 40),
      recentFailures: emailDeliveries
        .filter(item => failedEmailStatuses.has(item.status))
        .slice(0, 20)
        .map(item => ({
          id: item.id,
          category: item.category,
          status: item.status,
          attempts: item.attempts,
          error: item.lastError,
          createdAt: item.createdAt,
        })),
    },
    accessHistory,
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
