'use client'

type ClientEventName =
  | 'page_view'
  | 'cta_click'
  | 'guide_search'
  | 'guide_viewed'
  | 'guide_application_started'
  | 'guide_application_step'
  | 'guide_application_submitted'
  | 'account_created'
  | 'login_success'
  | 'booking_started'
  | 'booking_step'
  | 'begin_checkout'
  | 'checkout_error'
  | 'payment_cancelled'
  | 'web_vital'
  | 'client_error'

const SESSION_KEY = 'safaruma_analytics_session'
const GA4_MEASUREMENT_ID = 'G-3RLSBGY5LZ'

declare global {
  interface Window {
    clarity?: (...args: unknown[]) => void
    gtag?: (...args: unknown[]) => void
  }
}

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
  window.gtag?.('event', eventName, {
    send_to: GA4_MEASUREMENT_ID,
    ...metadata,
  })
  window.clarity?.('event', eventName)

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
