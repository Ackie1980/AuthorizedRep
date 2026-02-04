import { auth } from '@/server/auth/config'
import { redirect } from 'next/navigation'

export async function getSession() {
  return await auth()
}

export async function getCurrentUser() {
  const session = await auth()
  return session?.user
}

export async function requireAuth() {
  const session = await auth()
  if (!session?.user) {
    redirect('/login')
  }
  return session.user
}

export async function requireRole(allowedRoles: string[]) {
  const user = await requireAuth()
  if (!allowedRoles.includes(user.role)) {
    redirect('/dashboard')
  }
  return user
}

export function isQBDStaff(role: string): boolean {
  return ['ec_rep_assistant', 'ec_rep_expert', 'ec_rep_manager', 'admin'].includes(role)
}

export function isCustomer(role: string): boolean {
  return role === 'customer'
}
