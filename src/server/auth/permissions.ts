export const permissions = {
  customer: [
    'products:read:own',
    'products:create',
    'documents:read:own',
    'documents:upload',
    'certificates:read:own',
  ],
  ec_rep_assistant: [
    'products:read:all',
    'products:update',
    'documents:read:all',
    'documents:review',
    'certificates:read:all',
    'certificates:create',
    'manufacturers:read:all',
  ],
  ec_rep_expert: [
    'products:read:all',
    'products:create',
    'products:update',
    'products:delete',
    'documents:read:all',
    'documents:review',
    'documents:approve',
    'certificates:read:all',
    'certificates:create',
    'certificates:update',
    'manufacturers:read:all',
    'submissions:create',
    'submissions:submit',
  ],
  ec_rep_manager: [
    '*', // All permissions
  ],
  admin: [
    '*', // All permissions
  ],
} as const

export type Role = keyof typeof permissions
export type Permission = string

export function hasPermission(
  role: string,
  permission: Permission,
  context?: { ownerId?: string; userId?: string }
): boolean {
  const rolePermissions = permissions[role as Role]
  if (!rolePermissions) return false

  // Wildcard grants all permissions
  if (rolePermissions.some(p => p === '*')) return true

  // Check for :own suffix (ownership check)
  if (permission.includes(':own') && context?.ownerId && context?.userId) {
    if (context.ownerId !== context.userId) {
      return false
    }
  }

  // Check exact permission
  if ((rolePermissions as readonly string[]).includes(permission)) return true

  // Check :all version of :own permission
  const allPermission = permission.replace(':own', ':all')
  if ((rolePermissions as readonly string[]).includes(allPermission)) return true

  return false
}

export function isQBDStaff(role: string): boolean {
  return ['ec_rep_assistant', 'ec_rep_expert', 'ec_rep_manager', 'admin'].includes(role)
}

export function isCustomer(role: string): boolean {
  return role === 'customer'
}

export function canAccessManufacturer(
  role: string,
  userManufacturerId: string | null,
  targetManufacturerId: string
): boolean {
  // QBD staff can access all manufacturers
  if (isQBDStaff(role)) return true

  // Customers can only access their own manufacturer
  if (isCustomer(role)) {
    return userManufacturerId === targetManufacturerId
  }

  return false
}
