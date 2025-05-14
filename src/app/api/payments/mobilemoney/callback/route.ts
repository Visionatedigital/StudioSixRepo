import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyCallbackSignature } from '@/lib/mobilemoney';

/**
 * This endpoint receives payment callbacks from the Mobile Money API.
 * It updates the payment status and adds credits to the user's account if the payment was successful.
 */
export async function POST(req: NextRequest) {
  try {
    // Get the raw request body for signature verification
    const rawBody = await req.text();
    const signature = req.headers.get('X-Content-Signature');

    // Verify the signature
    if (!signature || !verifyCallbackSignature(signature, rawBody)) {
      console.error('Invalid payment callback signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // Parse the request body
    const payload = JSON.parse(rawBody);
    const { 
      status, 
      payment_id, 
      reference_id, 
      message, 
      amount, 
      currency 
    } = payload;

    console.log('Mobile Money callback received:', { 
      status, 
      payment_id, 
      reference_id, 
      message 
    });

    // Find the payment in the database using raw SQL query
    const payments = await prisma.$queryRaw`
      SELECT p.*, u."id" as "userId", u."email" as "userEmail" 
      FROM "Payment" p
      JOIN "User" u ON p."userId" = u."id"
      WHERE p."providerPaymentId" = ${payment_id}
      AND p."providerReferenceId" = ${reference_id}
      LIMIT 1
    `;

    if (!payments || (payments as any[]).length === 0) {
      console.error('Payment not found for callback:', { payment_id, reference_id });
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    const payment = (payments as any[])[0];

    // Map the provider status to our status
    let newStatus: 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED';
    
    switch (status) {
      case 'successful':
        newStatus = 'SUCCESS';
        break;
      case 'failed':
        newStatus = 'FAILED';
        break;
      case 'pending':
        newStatus = 'PENDING';
        break;
      default:
        newStatus = 'FAILED';
    }

    const callbackMetadata = JSON.stringify({
      ...payment.metadata,
      callback: payload
    });

    // Update the payment record using raw SQL
    await prisma.$executeRaw`
      UPDATE "Payment"
      SET 
        "status" = ${newStatus},
        "providerStatus" = ${status},
        "metadata" = ${callbackMetadata}::jsonb,
        "updatedAt" = NOW()
      WHERE "id" = ${payment.id}
    `;

    // If payment was successful, credit the user's account
    if (newStatus === 'SUCCESS') {
      // Update the user's credit balance
      await prisma.user.update({
        where: { id: payment.userId },
        data: {
          credits: { increment: payment.credits }
        }
      });

      // Create a transaction record
      await prisma.creditTransaction.create({
        data: {
          userId: payment.userId,
          amount: payment.credits,
          type: 'PURCHASE',
          description: `Mobile Money purchase of ${payment.credits} credits`
        }
      });

      console.log(`Credits added to user ${payment.userId}: ${payment.credits}`);
    }

    // Respond with 200 OK to acknowledge receipt of the callback
    return NextResponse.json({ 
      success: true, 
      status: newStatus 
    });
  } catch (error) {
    console.error('Error processing payment callback:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process callback' },
      { status: 500 }
    );
  }
} 