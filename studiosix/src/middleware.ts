import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const path = request.nextUrl.pathname;

  // Debug logging for all requests
  console.log('Middleware triggered for path:', path);
  console.log('Token:', token ? 'Present' : 'Missing');

  // Define public paths that don't require authentication
  const publicPaths = [
    "/", 
    "/sign-in", 
    "/sign-up", 
    "/api/auth", 
    "/api/register",
    "/api/payments/paystack",
    "/api/payments/paystack/verify",
    "/payment/success",
    "/payment/error"
  ];
  const isPublicPath = publicPaths.some(publicPath => path === publicPath || path.startsWith(publicPath + '/'));

  // Allow access to static assets and public files
  const isStaticAsset = path.match(/\.(jpg|jpeg|png|gif|svg|ico|json|css|js|woff|woff2|ttf|eot)$/);
  if (isStaticAsset) {
    console.log('Static asset detected, allowing access:', path);
    return NextResponse.next();
  }

  // If the path is public, allow access
  if (isPublicPath) {
    console.log('Public path detected, allowing access:', path);
    return NextResponse.next();
  }

  // If no token, redirect to sign in
  if (!token) {
    console.log('No token found, redirecting to sign-in');
    const signInUrl = new URL("/sign-in", request.url);
    signInUrl.searchParams.set("callbackUrl", path);
    return NextResponse.redirect(signInUrl);
  }

  // Check subscription status for protected routes
  const subscriptionStatus = token.subscriptionStatus as string;
  const isOnboardingPage = path === "/onboarding";
  const isDashboardPage = path === "/dashboard";

  // Debug logging for subscription check
  console.log('Subscription Check:', {
    path,
    subscriptionStatus,
    isOnboardingPage,
    isDashboardPage
  });

  // If user has no active subscription, they can only access onboarding
  if (subscriptionStatus !== "ACTIVE") {
    if (!isOnboardingPage) {
      console.log('No active subscription, redirecting to onboarding');
      return NextResponse.redirect(new URL("/onboarding", request.url));
    }
    console.log('Onboarding page access granted for inactive subscription');
    return NextResponse.next();
  }

  // If user has active subscription, they can't access onboarding
  if (subscriptionStatus === "ACTIVE" && isOnboardingPage) {
    console.log('Active subscription, redirecting to dashboard');
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Allow access to all other routes if user has active subscription
  console.log('Access granted for active subscription');
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all paths except static files and API routes
    '/((?!_next/static|_next/image|favicon.ico|public|api/auth).*)',
  ],
}; 