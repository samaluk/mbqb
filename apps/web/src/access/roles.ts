import type { Access, AccessArgs, FieldAccess } from 'payload'

export type StaffRole = 'admin' | 'editor' | 'validation-manager'

type UserWithRole = {
  role?: StaffRole | null
}

const hasRole = (user: unknown, roles: StaffRole[]) =>
  Boolean(user && roles.includes((user as UserWithRole).role ?? 'editor'))

export const isAdmin = ({ req }: AccessArgs) => hasRole(req.user, ['admin'])

export const isAdminField: FieldAccess = ({ req }) => hasRole(req.user, ['admin'])

export const isEditorOrAdmin = ({ req }: AccessArgs) =>
  hasRole(req.user, ['admin', 'editor'])

export const isValidationManagerOrAdmin = ({ req }: AccessArgs) =>
  hasRole(req.user, ['admin', 'validation-manager'])

export const isStaff = ({ req }: AccessArgs) =>
  hasRole(req.user, ['admin', 'editor', 'validation-manager'])

export const ownerOrAdmin: Access = ({ req: { user } }) => {
  if (!user) return false
  if (hasRole(user, ['admin'])) return true
  return { id: { equals: user.id } }
}
