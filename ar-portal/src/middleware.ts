import { auth } from '@/lib/auth';
import { isStaffRole, isAdmin } from '@/lib/permissions';

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

  // API routes that are public
  const publicApiRoutes = ['/api/auth'];
  const isPublicApi = publicApiRoutes.some((route) => pathname.startsWith(route));

  // Allow public routes and API routes
  if (isPublicRoute || isPublicApi) {
    return;
  }

  // Redirect to login if not authenticated
  if (!isLoggedIn && !pathname.startsWith('/api')) {
    const loginUrl = new URL('/login', req.nextUrl.origin);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return Response.redirect(loginUrl);
  }

  // Role-based access control for authenticated users
  if (isLoggedIn && req.auth?.user) {
    const { role } = req.auth.user;

    // Admin-only routes
    if (pathname.startsWith('/admin')) {
      if (!isAdmin(role)) {
        return Response.redirect(new URL('/dashboard', req.nextUrl.origin));
      }
    }

    // Staff-only routes (EC_REP roles and ADMIN)
    const staffOnlyRoutes = ['/manufacturers/manage', '/users/manage'];
    const isStaffOnlyRoute = staffOnlyRoutes.some((route) => pathname.startsWith(route));
    if (isStaffOnlyRoute && !isStaffRole(role)) {
      return Response.redirect(new URL('/dashboard', req.nextUrl.origin));
    }
  }
});

export const config = {
  matcher: [
    // Skip static files and _next
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
