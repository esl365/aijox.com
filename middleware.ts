import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const userRole = req.auth?.user?.role;

  // Public routes that don't require authentication
  const publicRoutes = ['/', '/jobs', '/about', '/contact'];
  const authRoutes = ['/signin', '/signup', '/verify-email'];

  const isPublicRoute = publicRoutes.some(route =>
    nextUrl.pathname === route || nextUrl.pathname.startsWith('/jobs/')
  );
  const isAuthRoute = authRoutes.includes(nextUrl.pathname);

  // Redirect logged-in users away from auth pages
  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL('/dashboard', nextUrl));
  }

  // Allow public routes
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Redirect non-logged-in users to signin
  if (!isLoggedIn) {
    const callbackUrl = nextUrl.pathname + nextUrl.search;
    const signInUrl = new URL('/signin', nextUrl);
    signInUrl.searchParams.set('callbackUrl', callbackUrl);
    return NextResponse.redirect(signInUrl);
  }

  // Role-based access control
  if (nextUrl.pathname.startsWith('/admin') && userRole !== 'ADMIN') {
    return NextResponse.redirect(new URL('/dashboard', nextUrl));
  }

  if (nextUrl.pathname.startsWith('/recruiter') &&
      userRole !== 'RECRUITER' &&
      userRole !== 'ADMIN') {
    return NextResponse.redirect(new URL('/dashboard', nextUrl));
  }

  if (nextUrl.pathname.startsWith('/teacher') &&
      userRole !== 'TEACHER' &&
      userRole !== 'ADMIN') {
    return NextResponse.redirect(new URL('/dashboard', nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
