import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.redirect(new URL('/auth/signin', request.url));
    }

    const { searchParams } = new URL(request.url);
    const reference = searchParams.get('reference');
    const trxref = searchParams.get('trxref');

    if (!reference || !trxref) {
      return NextResponse.redirect(new URL('/dashboard?error=missing_reference', request.url));
    }

    // Verify the transaction with Paystack
    const paystackResponse = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    const result = await paystackResponse.json();
    
    if (!result.status || result.data.status !== 'success') {
      return NextResponse.redirect(new URL('/dashboard?error=verification_failed', request.url));
    }

    // Get the transaction to access metadata
    const transaction = await prisma.paymentTransaction.findUnique({
      where: { reference },
    });

    if (!transaction) {
      return NextResponse.redirect(new URL('/dashboard?error=transaction_not_found', request.url));
    }

    const metadata = transaction.metadata as { type: string; packageId: string };
    const planId = metadata.packageId;

    // Calculate subscription dates
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30); // 30-day subscription

    // Create subscription
    await prisma.subscription.create({
      data: {
        userId: session.user.id,
        planId,
        status: 'ACTIVE',
        startDate,
        endDate,
        autoRenew: true,
      },
    });

    // Update user's subscription status
    await prisma.user.update({
      where: { id: session.user.id },
      data: { subscriptionStatus: 'ACTIVE' },
    });

    // Update the transaction status
    await prisma.paymentTransaction.update({
      where: { reference },
      data: {
        status: 'COMPLETED',
        providerReference: result.data.reference,
      },
    });

    // Create the redirect response
    const redirectResponse = NextResponse.redirect(new URL('/dashboard?success=payment_completed', request.url));

    // Force a session update by setting a cookie
    redirectResponse.cookies.set('next-auth.session-token', 'updated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    return redirectResponse;
  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.redirect(new URL('/dashboard?error=verification_error', request.url));
  }
} 