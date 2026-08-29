import { NextResponse } from 'next/server';
import { authConfig } from '@/config';

/**
 * Next.js 16 Proxy (replaces middleware)
 * Handles route protection and auth redirects at the network layer.
 *
 * Note: Auth.js session checking is intentionally NOT done here.
 * Per Next.js 16 best practices, security-critical checks should happen
 * in server components and server actions (data access layer), not proxy.
 * The proxy handles lightweight redirects based on cookie presence.
 */
export function proxy(request) {
  const { nextUrl } = request;
  const sessionCookie =
    request.cookies.get('authjs.session-token') ??
    request.cookies.get('__Secure-authjs.session-token') ??
    request.cookies.get('next-auth.session-token') ??
    request.cookies.get('__Secure-next-auth.session-token');

  const isLoggedIn = !!sessionCookie;

  const isAuthRoute = authConfig.authRoutes.some((route) =>
    nextUrl.pathname.startsWith(route)
  );
  const isProtectedRoute = nextUrl.pathname.startsWith(
    authConfig.protectedRoutePrefix
  );
  const isApiAuthRoute = nextUrl.pathname.startsWith('/api/auth');

  // Always allow API auth routes
  if (isApiAuthRoute) {
    return NextResponse.next();
  }

  // Redirect logged-in users away from auth pages
  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(
      new URL(authConfig.defaultRedirect, nextUrl)
    );
  }

  // Redirect unauthenticated users to sign-in
  if (isProtectedRoute && !isLoggedIn) {
    const signInUrl = new URL(authConfig.signInPage, nextUrl);
    signInUrl.searchParams.set('callbackUrl', nextUrl.pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes (/api/*)
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     * - Public assets (.svg, .png, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
