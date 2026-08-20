'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export type GuideSessionUser = {
  id: string
  email: string
  displayName: string | null
  firstName: string | null
  lastName: string | null
  guideProfileId: string
  guideStatus: 'DRAFT' | 'REVIEW' | 'ACTIVE'
}

const GuideSessionContext = createContext<GuideSessionUser | null>(null)

function LoadingGuideSession() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8F6F2' }}>
      <div style={{ width: 36, height: 36, border: '3px solid #E8DFC8', borderTopColor: '#C9A84C', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

export function GuideSessionGuard({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<GuideSessionUser | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    let cancelled = false
    fetch('/api/guide/auth/session', { cache: 'no-store' })
      .then(async response => {
        if (!response.ok) throw new Error('Session guide invalide')
        return response.json() as Promise<{ user: GuideSessionUser }>
      })
      .then(data => {
        if (!cancelled) {
          setUser(data.user)
          setLoading(false)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setUser(null)
          setLoading(false)
          router.replace('/guide/connexion')
        }
      })

    return () => {
      cancelled = true
    }
  }, [router])

  if (loading || !user) return <LoadingGuideSession />

  return (
    <GuideSessionContext.Provider value={user}>
      {children}
    </GuideSessionContext.Provider>
  )
}

export function useGuideSession(): GuideSessionUser {
  const value = useContext(GuideSessionContext)
  if (!value) throw new Error('GuideSessionGuard manquant')
  return value
}
