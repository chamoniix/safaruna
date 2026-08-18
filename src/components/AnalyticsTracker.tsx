'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { getConsent, restoreSavedConsent } from '@/lib/consent'
import { trackAnalyticsEvent } from '@/lib/analytics-client'

export default function AnalyticsTracker() {
  const pathname = usePathname()
  const lastTrackedPath = useRef<string | null>(null)

  useEffect(() => {
    restoreSavedConsent()
  }, [])

  useEffect(() => {
    const trackCurrentPage = () => {
      if (!getConsent()?.analytics || lastTrackedPath.current === pathname) return
      lastTrackedPath.current = pathname
      trackAnalyticsEvent('page_view', { title: document.title })
    }

    trackCurrentPage()
    window.addEventListener('consent-changed', trackCurrentPage)
    return () => window.removeEventListener('consent-changed', trackCurrentPage)
  }, [pathname])

  return null
}

