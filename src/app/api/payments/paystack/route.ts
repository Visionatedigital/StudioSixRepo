import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '@/lib/auth';
import { formatAmountForPaystack } from '@/lib/paystack';
import { verifyEnv } from '@/lib/env';
import { v4 as uuidv4 } from 'uuid';
import { isTransactionReferenceUsed, markTransactionReferenceAsUsed } from '@/lib/redis';

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Verify environment variables
const env = verifyEnv();
const PAYSTACK_SECRET_KEY = env.PAYSTACK_SECRET_KEY;

// Maximum attempts to generate a unique reference
const MAX_REFERENCE_ATTEMPTS = 5;

async function generateUniqueReference(): Promise<string> {
  for (let i = 0; i < MAX_REFERENCE_ATTEMPTS; i++) {
    const reference = `TX-${uuidv4()}`;
    const isUsed = await isTransactionReferenceUsed(reference);
    if (!isUsed) {
      await markTransactionReferenceAsUsed(reference);
      return reference;
    }
    console.log(`Reference ${reference} already used, trying again...`);
  }
  throw new Error('Failed to generate unique transaction reference');
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { amount, currency, type, packageId } = await request.json();

    // Generate a unique reference with Redis check
    const reference = await generateUniqueReference();

    // Log the request details (excluding sensitive data)
    console.log('Initializing payment:', {
      amount,
      currency,
      type,
      packageId,
      reference,
      userId: session.user.id,
    });

    // Initialize Paystack transaction with the provided reference
    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: session.user.email,
        amount, // Amount is already in cents
        currency, // Use the provided currency (USD)
        reference,
        callback_url: `https://studiosix.ai/api/payments/paystack/verify`,
        metadata: {
          userId: session.user.id,
          type,
          packageId,
        },
      }),
    });

    // Log the raw response for debugging
    const responseText = await response.text();
    console.log('Paystack raw response:', responseText);
    
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error('Failed to parse Paystack response:', e);
      throw new Error('Invalid response from Paystack');
    }

    // Log the parsed response
    console.log('Paystack parsed response:', {
      status: data.status,
      message: data.message,
      reference: data.data?.reference,
      paystackReference: data.data?.reference,
    });

    if (!data.status) {
      throw new Error(data.message || 'Failed to initialize payment');
    }

    // Store the pending transaction
    await prisma.paymentTransaction.create({
      data: {
        amount,
        reference,
        status: 'PENDING',
        provider: 'PAYSTACK',
        metadata: {
          userId: session.user.id,
          type,
          packageId,
          currency,
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
      { error: error instanceof Error ? error.message : 'Failed to initialize payment' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const reference = searchParams.get('reference');
    const trxref = searchParams.get('trxref'); // Paystack sometimes uses trxref instead of reference

    // Log all query parameters
    console.log('Verification request parameters:', {
      reference,
      trxref,
      allParams: Object.fromEntries(searchParams.entries())
    });

    // Use either reference or trxref
    const transactionReference = reference || trxref;

    if (!transactionReference) {
      console.error('No transaction reference found in request');
      return NextResponse.json(
        { error: 'Transaction reference is required' },
        { status: 400 }
      );
    }

    // Log the verification attempt
    console.log('Verifying payment:', { transactionReference });

    // Verify the transaction with Paystack
    const response = await fetch(`https://api.paystack.co/transaction/verify/${transactionReference}`, {
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      },
    });

    const data = await response.json();
    console.log('Paystack verification response:', data);

    if (!data.status) {
      throw new Error(data.message || 'Failed to verify payment');
    }

    // Update the transaction status
    const transaction = await prisma.paymentTransaction.findFirst({
      where: { reference: transactionReference },
    });

    if (!transaction) {
      console.error('Transaction not found:', { transactionReference });
      throw new Error('Transaction not found');
    }

    // Update transaction status
    await prisma.paymentTransaction.update({
      where: { id: transaction.id },
      data: {
        status: data.data.status === 'success' ? 'COMPLETED' : 'FAILED',
        providerReference: data.data.reference,
      },
    });

    // Redirect to success page
    return NextResponse.redirect(
      `${env.NEXT_PUBLIC_APP_URL}/payment/success?reference=${transactionReference}`
    );
  } catch (error) {
    console.error('Error verifying payment:', error);
    return NextResponse.redirect(
      `${env.NEXT_PUBLIC_APP_URL}/payment/error`
    );
  }
} 