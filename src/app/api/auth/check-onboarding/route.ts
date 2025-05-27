import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      console.log('No session or email found, redirecting to sign-in');
      return NextResponse.redirect(new URL('/sign-in', request.url));
    }

    console.log('Checking onboarding status for user:', session.user.email);
    
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { hasCompletedOnboarding: true }
    });

    console.log('User onboarding status:', user?.hasCompletedOnboarding);

    if (!user) {
      console.log('User not found in database');
      return NextResponse.redirect(new URL('/sign-in', request.url));
    }

    if (!user.hasCompletedOnboarding) {
      console.log('User has not completed onboarding, redirecting to onboarding');
      return NextResponse.redirect(new URL('/onboarding', request.url));
    }

    console.log('User has completed onboarding, redirecting to dashboard');
    return NextResponse.redirect(new URL('/dashboard', request.url));
  } catch (error) {
    console.error('Error checking onboarding status:', error);
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }
} 