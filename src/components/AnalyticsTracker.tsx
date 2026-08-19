'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { trackAnalyticsEvent } from '@/lib/analytics-client'

export default function AnalyticsTracker() {
  const pathname = usePathname()
  const lastTrackedPath = useRef<string | null>(null)

  useEffect(() => {
    const trackCurrentPage = () => {
      if (lastTrackedPath.current === pathname) return
      lastTrackedPath.current = pathname
      trackAnalyticsEvent('page_view', {
        title: document.title,
        page_path: pathname,
      })
    }

    trackCurrentPage()
  }, [pathname])

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = event.target instanceof Element ? event.target.closest('a,button') : null
      if (!target) return
      const label = (target.textContent || target.getAttribute('aria-label') || target.tagName)
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 100)
      const href = target instanceof HTMLAnchorElement
        ? `${target.origin === window.location.origin ? '' : target.origin}${target.pathname}`.slice(0, 200)
        : null
      trackAnalyticsEvent('cta_click', {
        label: label || target.tagName,
        href,
        element: target.tagName.toLowerCase(),
      })
    }
    const onError = (event: ErrorEvent) => {
      trackAnalyticsEvent('client_error', {
        message: (event.message || 'Erreur navigateur').slice(0, 180),
        source: event.filename ? new URL(event.filename, window.location.href).pathname.slice(0, 180) : null,
      })
    }
    const onRejection = (event: PromiseRejectionEvent) => {
      const message = event.reason instanceof Error ? event.reason.message : String(event.reason || 'Promesse rejetée')
      trackAnalyticsEvent('client_error', { message: message.slice(0, 180), source: 'unhandledrejection' })
    }
    document.addEventListener('click', onClick, true)
    window.addEventListener('error', onError)
    window.addEventListener('unhandledrejection', onRejection)
    return () => {
      document.removeEventListener('click', onClick, true)
      window.removeEventListener('error', onError)
      window.removeEventListener('unhandledrejection', onRejection)
    }
  }, [])

  return null
}
