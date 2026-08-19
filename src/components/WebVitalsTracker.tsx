'use client'

import { useReportWebVitals } from 'next/web-vitals'
import { trackAnalyticsEvent } from '@/lib/analytics-client'

export default function WebVitalsTracker() {
  useReportWebVitals(metric => {
    trackAnalyticsEvent('web_vital', {
      metric: metric.name,
      value: Number(metric.value.toFixed(3)),
      delta: Number(metric.delta.toFixed(3)),
      rating: metric.rating,
      navigation: metric.navigationType,
    })
  })
  return null
}
