import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { cache } from 'react';
import { UserRole } from '@prisma/client';

/**
 * Get the current session (cached per request)
 */
export const getSession = cache(async () => {
  const session = await auth();
  return session;
});

/**
 * Get the current user from session
 */
export async function getCurrentUser() {
  const session = await getSession();
  return session?.user ?? null;
}

/**
 * Require authentication - redirects to login if not authenticated
 */
export async function requireAuth() {
  const session = await getSession();
  if (!session?.user) {
    redirect('/login');
  }
  return session.user;
}

/**
 * Require specific role(s)
 */
export async function requireRole(allowedRoles: UserRole[]) {
  const user = await requireAuth();
  if (!allowedRoles.includes(user.role)) {
    redirect('/unauthorized');
  }
  return user;
}

/**
 * Require admin access
 */
export async function requireAdmin() {
  return requireRole([UserRole.ADMIN]);
}

/**
 * Require EC Rep staff (any level)
 */
export async function requireEcRep() {
  return requireRole([
    UserRole.EC_REP_ASSISTANT,
    UserRole.EC_REP_EXPERT,
    UserRole.EC_REP_MANAGER,
  ]);
}

/**
 * Require EC Rep Manager or Admin
 */
export async function requireManager() {
  return requireRole([UserRole.EC_REP_MANAGER, UserRole.ADMIN]);
}

/**
 * Check if user has permission
 */
export function hasPermission(
  userRole: UserRole,
  permission: string
): boolean {
  const rolePermissions: Record<UserRole, string[]> = {
    [UserRole.ADMIN]: ['*'],
    [UserRole.EC_REP_MANAGER]: [
      'users:read', 'users:write',
      'manufacturers:read', 'manufacturers:write',
      'products:read', 'products:write',
      'documents:read', 'documents:write',
      'reports:read',
      'settings:read', 'settings:write',
    ],
    [UserRole.EC_REP_EXPERT]: [
      'manufacturers:read',
      'products:read', 'products:write',
      'documents:read', 'documents:write',
      'tasks:read', 'tasks:write',
    ],
    [UserRole.EC_REP_ASSISTANT]: [
      'manufacturers:read',
      'products:read',
      'documents:read', 'documents:write',
      'tasks:read', 'tasks:write',
    ],
    [UserRole.CUSTOMER]: [
      'profile:read', 'profile:write',
      'products:read', 'products:write',
      'documents:read',
    ],
  };

  const permissions = rolePermissions[userRole];
  if (!permissions) return false;
  if (permissions.includes('*')) return true;
  return permissions.includes(permission);
}

/**
 * Check if user is admin
 */
export function isAdmin(role: UserRole): boolean {
  return role === UserRole.ADMIN;
}

/**
 * Check if user is EC Rep staff or higher
 */
export function isEcRepOrHigher(role: UserRole): boolean {
  const ecRepRoles: UserRole[] = [
    UserRole.ADMIN,
    UserRole.EC_REP_MANAGER,
    UserRole.EC_REP_EXPERT,
    UserRole.EC_REP_ASSISTANT,
  ];
  return ecRepRoles.includes(role);
}

/**
 * Check if user is manager level or higher
 */
export function isManagerOrHigher(role: UserRole): boolean {
  const managerRoles: UserRole[] = [UserRole.ADMIN, UserRole.EC_REP_MANAGER];
  return managerRoles.includes(role);
}
