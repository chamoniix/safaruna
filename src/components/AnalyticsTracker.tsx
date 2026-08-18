'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { restoreSavedConsent } from '@/lib/consent'
import { trackAnalyticsEvent } from '@/lib/analytics-client'

export default function AnalyticsTracker() {
  const pathname = usePathname()
  const lastTrackedPath = useRef<string | null>(null)

  useEffect(() => {
    restoreSavedConsent()
  }, [])

  useEffect(() => {
    const trackCurrentPage = () => {
      if (lastTrackedPath.current === pathname) return
      lastTrackedPath.current = pathname
      trackAnalyticsEvent('page_view', { title: document.title })
    }

    trackCurrentPage()
  }, [pathname])

  return null
}
