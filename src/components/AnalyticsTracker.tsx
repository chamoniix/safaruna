'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { restoreSavedConsent } from '@/lib/consent'
import { trackAnalyticsEvent } from '@/lib/analytics-client'

const GA4_MEASUREMENT_ID = 'G-3RLSBGY5LZ'

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
      window.gtag?.('event', 'page_view', {
        send_to: GA4_MEASUREMENT_ID,
        page_path: pathname,
        page_title: document.title,
        page_location: window.location.href,
      })
    }

    trackCurrentPage()
  }, [pathname])

  return null
}
