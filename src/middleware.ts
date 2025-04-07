import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { withAuth } from 'next-auth/middleware';

export default withAuth(
  async function middleware(req) {
    const token = await getToken({ req });
    const isAuth = !!token;
    const isAuthPage = req.nextUrl.pathname.startsWith('/sign-in') || 
                      req.nextUrl.pathname.startsWith('/auth/signin');
    const isApiAuthRoute = req.nextUrl.pathname.startsWith('/api/auth');
    const isApiRoute = req.nextUrl.pathname.startsWith('/api');
    const isDashboard = req.nextUrl.pathname.startsWith('/dashboard');
    
    // List of public pages that don't require authentication
    const publicPages = [
      '/',                    // Home page
      '/about',              // About page
      '/pricing',            // Pricing page
      '/plugins',            // Plugins page
      '/help',               // Help page
      '/teams',              // Teams page
      '/education',          // Education page
      '/contact',            // Contact page
      '/privacy',            // Privacy policy
      '/terms',              // Terms of service
      '/cookies',            // Cookie policy
      '/blog',               // Blog page
      '/features',           // Features page
      '/status',             // Status page
      '/tutorials',          // Tutorials page
      '/api/status',         // API status endpoint
      '/sign-in',            // Sign in page
      '/auth/signin',        // Alternative sign in path
    ];
    
    // Check if the request is for a static asset
    const isStaticAsset = req.nextUrl.pathname.match(/\.(svg|png|jpg|jpeg|gif|ico|json|js|css)$/i);
    
    const isPublicPage = publicPages.includes(req.nextUrl.pathname) || 
                        req.nextUrl.pathname.startsWith('/blog/') ||  // Allow all blog posts
                        req.nextUrl.pathname.startsWith('/tutorials/') || // Allow all tutorials
                        isStaticAsset; // Allow all static assets

    // Allow static assets and API auth routes to pass through
    if (isStaticAsset || isApiAuthRoute) {
      return NextResponse.next();
    }

    // For API routes, require authentication except for public API endpoints
    if (isApiRoute && !isAuth && !isPublicPage) {
      return NextResponse.redirect(new URL('/sign-in', req.url));
    }

    // If user is authenticated and tries to access auth pages, redirect to home
    if (isAuthPage && isAuth) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    // Allow access to public pages
    if (isPublicPage) {
      return NextResponse.next();
    }

    // Redirect unauthenticated users to sign-in
    if (!isAuth) {
      let from = req.nextUrl.pathname;
      if (req.nextUrl.search) {
        from += req.nextUrl.search;
      }
      
      const signInUrl = new URL('/sign-in', req.url);
      signInUrl.searchParams.set('from', from);
      return NextResponse.redirect(signInUrl);
    }

    // Allow authenticated users to access protected routes
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: () => true // Let the middleware handle the auth check
    }
  }
);

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|api/auth|favicon.ico).*)'  // Match everything except Next.js internals and auth
  ]
}; 