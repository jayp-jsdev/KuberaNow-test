export const STAFF_ROLES = ['admin', 'editor', 'author'] as const
export const READER_ROLE = 'reader' as const

export type StaffRole = (typeof STAFF_ROLES)[number]
export type UserRole = StaffRole | typeof READER_ROLE

export function isStaffRole(role?: string | null): role is StaffRole {
  return STAFF_ROLES.includes(role as StaffRole)
}
