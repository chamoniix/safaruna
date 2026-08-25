export type Role = 'PELERIN' | 'GUIDE' | 'ADMIN' | 'SUPERADMIN'

export type Permission =
  | 'viewAllUsers'
  | 'viewPrivateMessages'
  | 'overrideReservations'
  | 'setCommissionRates'
  | 'manageGuideKYC'
  | 'sendAdminEmails'
  | 'manageOwnCalendar'
  | 'manageOwnTours'
  | 'viewOwnEarnings'
  | 'createReservation'
  | 'viewOwnReservations'
  | 'writeMessages'

const PERMISSIONS: Record<Role, Permission[]> = {
  SUPERADMIN: [
    'viewAllUsers',
    'viewPrivateMessages',
    'overrideReservations',
    'setCommissionRates',
    'manageGuideKYC',
    'sendAdminEmails',
    'manageOwnCalendar',
    'manageOwnTours',
    'viewOwnEarnings',
    'createReservation',
    'viewOwnReservations',
    'writeMessages',
  ],
  ADMIN: [
    'viewAllUsers',
    'viewPrivateMessages',
    'overrideReservations',
    'manageGuideKYC',
    'sendAdminEmails',
    'manageOwnCalendar',
    'manageOwnTours',
    'viewOwnEarnings',
    'createReservation',
    'viewOwnReservations',
    'writeMessages',
  ],
  GUIDE: [
    'manageOwnCalendar',
    'manageOwnTours',
    'viewOwnEarnings',
    'viewOwnReservations',
    'writeMessages',
  ],
  PELERIN: [
    'createReservation',
    'viewOwnReservations',
    'writeMessages',
  ],
}

export function hasPermission(role: Role, permission: Permission): boolean {
  return PERMISSIONS[role]?.includes(permission) ?? false
}

export function requireRole(userRole: string | undefined, ...allowedRoles: Role[]): boolean {
  if (!userRole) return false
  return allowedRoles.includes(userRole as Role)
}
