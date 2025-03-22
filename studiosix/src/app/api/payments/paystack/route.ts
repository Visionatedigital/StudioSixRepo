import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '@/lib/auth';
import { formatAmountForPaystack } from '@/lib/paystack';

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY!;

// Cache to track recent transaction attempts (in-memory, will reset on server restart)
const recentTransactions = new Map<string, { timestamp: number, attempts: number }>();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_ATTEMPTS = 3;

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { amount, currency, type, packageId, reference } = await request.json();

    if (!reference) {
      return NextResponse.json(
        { error: 'Transaction reference is required' },
        { status: 400 }
      );
    }

    // Check if reference has been used before
    const existingTransaction = await prisma.paymentTransaction.findFirst({
      where: {
        reference,
      },
    });

    if (existingTransaction) {
      return NextResponse.json(
        { error: 'Duplicate transaction reference' },
        { status: 409 }
      );
    }

    // Rate limiting check using user ID and reference
    const userKey = `${session.user.id}-${reference}`;
    const now = Date.now();
    const userTransactions = recentTransactions.get(userKey);

    if (userTransactions) {
      // Clean up old entries
      if (now - userTransactions.timestamp > RATE_LIMIT_WINDOW) {
        recentTransactions.delete(userKey);
      } else if (userTransactions.attempts >= MAX_ATTEMPTS) {
        return NextResponse.json(
          { error: 'Too many payment attempts. Please wait a moment before trying again.' },
          { status: 429 }
        );
      } else {
        userTransactions.attempts += 1;
      }
    } else {
      recentTransactions.set(userKey, { timestamp: now, attempts: 1 });
    }

    // Clean up old entries from the cache
    for (const [key, value] of recentTransactions.entries()) {
      if (now - value.timestamp > RATE_LIMIT_WINDOW) {
        recentTransactions.delete(key);
      }
    }

    // Initialize Paystack transaction with the provided reference
    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: session.user.email,
        amount: formatAmountForPaystack(amount),
        currency,
        reference,
        callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/paystack/verify`,
        metadata: {
          userId: session.user.id,
          type,
          packageId,
        },
      }),
    });

    const data = await response.json();

    if (!data.status) {
      throw new Error(data.message);
    }

    // Verify the reference matches
    if (data.data.reference !== reference) {
      console.error('Reference mismatch:', { sent: reference, received: data.data.reference });
      throw new Error('Transaction reference mismatch');
    }

    // Store the pending transaction
    await prisma.paymentTransaction.create({
      data: {
        userId: session.user.id,
        amount,
        currency,
        type,
        reference,
        status: 'PENDING',
        provider: 'PAYSTACK',
        metadata: {
          packageId,
          paystackReference: data.data.reference,
        },
      },
    });

    return NextResponse.json({
      authorizationUrl: data.data.authorization_url,
      reference,
    });
  } catch (error) {
    console.error('Error initializing payment:', error);
    return NextResponse.json(
      { error: 'Failed to initialize payment' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const reference = searchParams.get('reference');

    if (!reference) {
      return NextResponse.json(
        { error: 'Reference is required' },
        { status: 400 }
      );
    }

    // Verify the transaction with Paystack
    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      },
    });

    const data = await response.json();

    if (!data.status || data.data.status !== 'success') {
      throw new Error('Payment verification failed');
    }

    // Find the pending transaction
    const transaction = await prisma.paymentTransaction.findUnique({
      where: { reference },
    });

    if (!transaction) {
      throw new Error('Transaction not found');
    }

    // Update transaction status
    await prisma.$transaction(async (tx) => {
      // Update transaction status
      await tx.paymentTransaction.update({
        where: { id: transaction.id },
        data: { status: 'COMPLETED' },
      });

      // Handle credits purchase
      if (transaction.type === 'CREDITS') {
        await tx.user.update({
          where: { id: transaction.userId },
          data: {
            credits: {
              increment: transaction.amount,
            },
          },
        });

        await tx.creditTransaction.create({
          data: {
            userId: transaction.userId,
            amount: transaction.amount,
            type: 'PURCHASE',
            description: `Purchased ${transaction.amount} credits`,
          },
        });
      }

      // Handle subscription purchase
      if (transaction.type === 'SUBSCRIPTION') {
        const packageId = transaction.metadata.packageId;
        // Add subscription logic here
        // This would typically involve updating the user's subscription status,
        // setting expiration dates, etc.
      }
    });

    // Redirect to success page
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/payment/success?reference=${reference}`
    );
  } catch (error) {
    console.error('Error verifying payment:', error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/payment/error`
    );
  }
} 