import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  console.log('=== Middleware Debug ===');
  console.log('Path:', request.nextUrl.pathname);
  console.log('Method:', request.method);
  console.log('Headers:', JSON.stringify(request.headers, null, 2));

  const token = await getToken({ req: request });
  console.log('Token:', token ? 'Present' : 'Missing');
  if (token) {
    console.log('Token data:', token);
  }

  // Define public paths that don't require authentication
  const publicPaths = [
    '/',
    '/sign-in',
    '/sign-up',
    '/api/auth',
    '/api/webhooks',
    '/uploads',
    '/_next',
    '/favicon.ico'
  ];

  // Check if the current path is public
  const isPublicPath = publicPaths.some(path => 
    request.nextUrl.pathname === path || 
    request.nextUrl.pathname.startsWith(path + '/') ||
    request.nextUrl.pathname.match(/\.(jpg|jpeg|png|gif|svg|ico|css|js|woff|woff2|ttf|eot)$/)
  );

  console.log('Is public path?', isPublicPath);
  if (isPublicPath) {
    console.log('Public path detected, allowing access:', request.nextUrl.pathname);
    return NextResponse.next();
  }

  // Check if user is authenticated
  if (!token) {
    console.log('No token found, redirecting to sign-in');
    const signInUrl = new URL('/sign-in', request.url);
    signInUrl.searchParams.set('callbackUrl', request.nextUrl.pathname);
    return NextResponse.redirect(signInUrl);
  }

  console.log('Token found, allowing access');
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ]
}; 