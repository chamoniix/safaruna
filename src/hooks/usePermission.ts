'use client'
import { useSession } from 'next-auth/react'
import { hasPermission, requireRole } from '@/lib/rbac'
import type { Permission, Role } from '@/lib/rbac'

export function usePermission(permission: Permission): boolean {
  const { data: session } = useSession()
  const role = (session?.user as any)?.role as Role | undefined
  if (!role) return false
  return hasPermission(role, permission)
}

export function useRole(...roles: Role[]): boolean {
  const { data: session } = useSession()
  const role = (session?.user as any)?.role as Role | undefined
  return requireRole(role, ...roles)
}

export function useUserRole(): Role | null {
  const { data: session } = useSession()
  return ((session?.user as any)?.role as Role) || null
}
