'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

const REFRESH_INTERVAL_MS = 30_000

export default function AutoRefresh({ enabled = true }: { enabled?: boolean }) {
  const router = useRouter()

  useEffect(() => {
    if (!enabled) return
    const interval = window.setInterval(() => {
      router.refresh()
    }, REFRESH_INTERVAL_MS)

    return () => window.clearInterval(interval)
  }, [enabled, router])

  return null
}
