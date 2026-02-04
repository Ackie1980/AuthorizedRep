import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from '@/server/auth/config'

// Routes that don't require authentication
const publicRoutes = ['/login', '/register', '/api/auth']

// Routes that require specific roles
const roleRoutes: Record<string, string[]> = {
  '/manufacturers': ['ec_rep_assistant', 'ec_rep_expert', 'ec_rep_manager', 'admin'],
}

export default auth((req) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth

  // Allow public routes
  if (publicRoutes.some(route => nextUrl.pathname.startsWith(route))) {
    // Redirect logged in users away from login page
    if (isLoggedIn && nextUrl.pathname === '/login') {
      return NextResponse.redirect(new URL('/dashboard', nextUrl))
    }
    return NextResponse.next()
  }

  // Redirect to login if not authenticated
  if (!isLoggedIn) {
    const loginUrl = new URL('/login', nextUrl)
    loginUrl.searchParams.set('callbackUrl', nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Check role-based access
  const userRole = req.auth?.user?.role
  for (const [route, allowedRoles] of Object.entries(roleRoutes)) {
    if (nextUrl.pathname.startsWith(route)) {
      if (!userRole || !allowedRoles.includes(userRole)) {
        return NextResponse.redirect(new URL('/dashboard', nextUrl))
      }
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/trpc).*)'],
}
