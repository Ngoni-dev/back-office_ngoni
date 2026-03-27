import type { AdminProfile } from '@/types/api.types'

export function hasPermission(user: AdminProfile | null | undefined, permission: string): boolean {
  if (!user) return false
  if (user.role === 'super_admin') return true
  return (user.permissions ?? []).includes(permission)
}
