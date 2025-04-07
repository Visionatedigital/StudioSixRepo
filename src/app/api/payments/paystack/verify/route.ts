import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { verifyEnv } from '@/lib/env';

export async function GET(request: Request) {
  const env = verifyEnv();
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.redirect(`${env.NEXT_PUBLIC_APP_URL}/sign-in`);
    }

    const { searchParams } = new URL(request.url);
    const reference = searchParams.get('reference');
    const trxref = searchParams.get('trxref');

    if (!reference || !trxref) {
      return NextResponse.redirect(`${env.NEXT_PUBLIC_APP_URL}/dashboard?error=missing_reference`);
    }

    // Verify the transaction with Paystack
    const paystackResponse = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    const result = await paystackResponse.json();
    
    if (!result.status || result.data.status !== 'success') {
      return NextResponse.redirect(`${env.NEXT_PUBLIC_APP_URL}/dashboard?error=verification_failed`);
    }

    // Get the transaction to access metadata
    const transaction = await prisma.paymentTransaction.findUnique({
      where: { reference },
    });

    if (!transaction) {
      return NextResponse.redirect(`${env.NEXT_PUBLIC_APP_URL}/dashboard?error=transaction_not_found`);
    }

    const metadata = transaction.metadata as { type: string; packageId: string };

    // Handle different payment types
    if (metadata.type === 'SUBSCRIPTION') {
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 30); // 30-day subscription

      // Create subscription
      await prisma.subscription.create({
        data: {
          userId: session.user.id,
          planId: metadata.packageId,
          status: 'ACTIVE',
          startDate,
          endDate,
          autoRenew: true,
        },
      });

      // Update user's subscription status based on the plan
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          subscriptionStatus: metadata.packageId === 'starter' ? 'BASIC' :
                             metadata.packageId === 'pro' ? 'PRO' : 'ENTERPRISE',
        },
      });
    } else if (metadata.type === 'CREDITS') {
      // Update user's credits
      const credits = parseInt(metadata.packageId);
      if (!isNaN(credits)) {
        await prisma.user.update({
          where: { id: session.user.id },
          data: {
            credits: {
              increment: credits,
            },
          },
        });
      }
    }

    // Update the transaction status
    await prisma.paymentTransaction.update({
      where: { reference },
      data: {
        status: 'COMPLETED',
        providerReference: result.data.reference,
      },
    });

    // Instead of clearing the session cookie, we'll use a special query parameter
    // to trigger a client-side session refresh
    return NextResponse.redirect(
      `${env.NEXT_PUBLIC_APP_URL}/dashboard?success=payment_completed&refresh_session=true`
    );
  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.redirect(`${env.NEXT_PUBLIC_APP_URL}/dashboard?error=verification_error`);
  }
} 