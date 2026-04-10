'use client'
import { useSession } from 'next-auth/react'
import { hasPermission, requireRole } from '@/lib/rbac'
import type { Permission, Role } from '@/lib/rbac'

interface RBACGuardProps {
  children: React.ReactNode
  permission?: Permission
  roles?: Role[]
  fallback?: React.ReactNode
}

export default function RBACGuard({
  children,
  permission,
  roles,
  fallback = null,
}: RBACGuardProps) {
  const { data: session, status } = useSession()

  if (status === 'loading') return null

  const userRole = (session?.user as any)?.role as Role | undefined

  if (!userRole) return <>{fallback}</>

  if (permission && !hasPermission(userRole, permission)) {
    return <>{fallback}</>
  }

  if (roles && !requireRole(userRole, ...roles)) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
