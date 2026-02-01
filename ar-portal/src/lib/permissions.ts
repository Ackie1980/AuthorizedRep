import { UserRole } from '@prisma/client';

/**
 * Check if a user can access a specific manufacturer's data
 * @param userRole - The user's role
 * @param userManufacturerId - The user's manufacturer ID (null for EC_REP roles)
 * @param targetManufacturerId - The manufacturer ID being accessed
 * @returns true if access is allowed, false otherwise
 */
export function canAccessManufacturer(
  userRole: UserRole,
  userManufacturerId: string | null,
  targetManufacturerId: string
): boolean {
  // CUSTOMER can only access their own manufacturer
  if (userRole === 'CUSTOMER') {
    return userManufacturerId === targetManufacturerId;
  }
  // All EC_REP roles and ADMIN can access any manufacturer
  return true;
}

/**
 * Check if a user has a staff role (EC_REP or ADMIN)
 * @param role - The user's role
 * @returns true if user is staff, false otherwise
 */
export function isStaffRole(role: UserRole): boolean {
  return ['EC_REP_ASSISTANT', 'EC_REP_EXPERT', 'EC_REP_MANAGER', 'ADMIN'].includes(role);
}

/**
 * Check if a user can perform admin operations
 * @param role - The user's role
 * @returns true if user is admin, false otherwise
 */
export function isAdmin(role: UserRole): boolean {
  return role === 'ADMIN';
}

/**
 * Check if a user can review documents
 * @param role - The user's role
 * @returns true if user can review, false otherwise
 */
export function canReviewDocuments(role: UserRole): boolean {
  return ['EC_REP_EXPERT', 'EC_REP_MANAGER', 'ADMIN'].includes(role);
}

/**
 * Check if a user can manage manufacturers
 * @param role - The user's role
 * @returns true if user can manage, false otherwise
 */
export function canManageManufacturers(role: UserRole): boolean {
  return ['EC_REP_MANAGER', 'ADMIN'].includes(role);
}
