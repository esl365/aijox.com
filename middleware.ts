import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { getSetupUrl, getDashboardUrl } from '@/lib/utils/routing';

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const userRole = req.auth?.user?.role;
  const hasProfile = req.auth?.user?.hasProfile;

  // Public routes that don't require authentication
  const publicRoutes = ['/', '/jobs', '/about', '/contact', '/pricing'];
  const authRoutes = ['/login', '/signup', '/verify-email', '/error'];
  const setupRoutes = ['/select-role', '/profile/setup', '/recruiter/setup', '/school/setup'];

  const isPublicRoute = publicRoutes.some(route =>
    nextUrl.pathname === route || nextUrl.pathname.startsWith('/jobs/')
  );
  const isAuthRoute = authRoutes.includes(nextUrl.pathname);
  const isSetupRoute = setupRoutes.some(route => nextUrl.pathname.startsWith(route));

  // Allow API routes and auth routes
  if (nextUrl.pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }

  // Redirect logged-in users away from auth pages
  if (isAuthRoute && isLoggedIn) {
    // If no role, redirect to role selection
    if (!userRole) {
      return NextResponse.redirect(new URL('/select-role', nextUrl));
    }
    // If has role but no profile, redirect to setup (except SCHOOL - they have auto-creation in dashboard)
    if (!hasProfile && userRole !== 'SCHOOL') {
      return NextResponse.redirect(new URL(getSetupUrl(userRole, 'select-role'), nextUrl));
    }
    // Otherwise go to dashboard
    return NextResponse.redirect(new URL(getDashboardUrl(userRole), nextUrl));
  }

  // Redirect logged-in users from home page to their dashboard
  if (isLoggedIn && nextUrl.pathname === '/' && userRole) {
    // School users can go to dashboard even without profile (auto-creation there)
    if (userRole === 'SCHOOL' || hasProfile) {
      return NextResponse.redirect(new URL(getDashboardUrl(userRole), nextUrl));
    }
    // Other users need to complete profile first
    if (!hasProfile) {
      return NextResponse.redirect(new URL(getSetupUrl(userRole, 'select-role'), nextUrl));
    }
  }

  // Allow public routes
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Redirect non-logged-in users to login
  if (!isLoggedIn && !isAuthRoute) {
    const callbackUrl = nextUrl.pathname + nextUrl.search;
    const loginUrl = new URL('/login', nextUrl);
    loginUrl.searchParams.set('callbackUrl', callbackUrl);
    return NextResponse.redirect(loginUrl);
  }

  // If logged in but no role, force role selection
  if (isLoggedIn && !userRole && !isSetupRoute && nextUrl.pathname !== '/select-role') {
    return NextResponse.redirect(new URL('/select-role', nextUrl));
  }

  // If logged in with role but no profile, force profile setup (except SCHOOL - they have auto-creation)
  if (isLoggedIn && userRole && !hasProfile && !isSetupRoute && userRole !== 'SCHOOL') {
    return NextResponse.redirect(new URL(getSetupUrl(userRole, 'select-role'), nextUrl));
  }

  // Role-based access control for protected routes
  if (isLoggedIn && userRole) {
    // Admin access control
    if (nextUrl.pathname.startsWith('/admin') && userRole !== 'ADMIN') {
      return NextResponse.redirect(new URL(getDashboardUrl(userRole), nextUrl));
    }

    // Recruiter/School access control
    if (
      nextUrl.pathname.startsWith('/recruiter') &&
      userRole !== 'RECRUITER' &&
      userRole !== 'SCHOOL' &&
      userRole !== 'ADMIN'
    ) {
      return NextResponse.redirect(new URL(getDashboardUrl(userRole), nextUrl));
    }

    // Teacher access control
    if (
      nextUrl.pathname.startsWith('/profile') &&
      nextUrl.pathname !== '/profile/setup' &&
      userRole !== 'TEACHER' &&
      userRole !== 'ADMIN'
    ) {
      return NextResponse.redirect(new URL(getDashboardUrl(userRole), nextUrl));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
