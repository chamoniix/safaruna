'use client'

type ClientEventName =
  | 'page_view'
  | 'guide_viewed'
  | 'booking_started'
  | 'booking_step'
  | 'begin_checkout'
  | 'checkout_error'
  | 'payment_cancelled'

const SESSION_KEY = 'safaruma_analytics_session'

export function getAnalyticsSessionId(): string | null {
  if (typeof window === 'undefined') return null
  try {
    const current = sessionStorage.getItem(SESSION_KEY)
    if (current) return current
    const created = crypto.randomUUID()
    sessionStorage.setItem(SESSION_KEY, created)
    return created
  } catch {
    return null
  }
}

export function trackAnalyticsEvent(
  eventName: ClientEventName,
  metadata?: Record<string, string | number | boolean | null>
): void {
  const sessionId = getAnalyticsSessionId()
  if (!sessionId) return

  void fetch('/api/analytics/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    keepalive: true,
    body: JSON.stringify({
      eventName,
      sessionId,
      path: window.location.pathname,
      referrer: document.referrer || null,
      metadata,
    }),
  }).catch(() => {})
}
