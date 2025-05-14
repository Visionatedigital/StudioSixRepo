import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * This is a test endpoint to simulate Mobile Money callbacks.
 * It allows you to trigger a callback for a specific payment to change its status.
 * 
 * IMPORTANT: This should be disabled in production!
 */
export async function POST(req: NextRequest) {
  // This should check for some kind of auth or secret in a real app
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
  }

  try {
    const { paymentId, status } = await req.json();

    if (!paymentId) {
      return NextResponse.json({ error: 'Payment ID is required' }, { status: 400 });
    }

    // Find the payment
    const payment = await prisma.$queryRaw`
      SELECT * FROM "Payment" WHERE "id" = ${paymentId} LIMIT 1
    `;
    
    if (!Array.isArray(payment) || payment.length === 0) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    const paymentRecord = payment[0] as any;
    
    // Convert status string to valid enum value
    let newStatus = status || 'SUCCESS';
    if (!['PENDING', 'SUCCESS', 'FAILED', 'CANCELLED'].includes(newStatus)) {
      newStatus = 'SUCCESS';
    }
    
    // Create callback payload
    const callbackMetadata = JSON.stringify({
      ...paymentRecord.metadata,
      callback: {
        status: newStatus.toLowerCase(),
        payment_id: paymentRecord.providerPaymentId || `test-${Date.now()}`,
        reference_id: paymentRecord.providerReferenceId || `test-ref-${Date.now()}`,
        message: `Test ${newStatus.toLowerCase()} callback`,
      }
    });
    
    // Update the payment status
    await prisma.$executeRaw`
      UPDATE "Payment"
      SET 
        "status" = ${newStatus},
        "providerStatus" = ${newStatus.toLowerCase()},
        "metadata" = ${callbackMetadata}::jsonb,
        "updatedAt" = NOW()
      WHERE "id" = ${paymentId}
    `;

    // If payment is marked as successful, add credits to the user's account
    if (newStatus === 'SUCCESS') {
      // Update the user's credit balance
      await prisma.user.update({
        where: { id: paymentRecord.userId },
        data: {
          credits: { increment: paymentRecord.credits }
        }
      });

      // Create a transaction record
      await prisma.creditTransaction.create({
        data: {
          userId: paymentRecord.userId,
          amount: paymentRecord.credits,
          type: 'PURCHASE',
          description: `Mobile Money purchase of ${paymentRecord.credits} credits`
        }
      });

      console.log(`[TEST] Credits added to user ${paymentRecord.userId}: ${paymentRecord.credits}`);
    }

    return NextResponse.json({
      success: true,
      message: `Payment ${paymentId} status updated to ${newStatus}`,
      payment: {
        id: paymentId,
        status: newStatus
      }
    });
  } catch (error) {
    console.error('Error in test callback:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Test callback failed' },
      { status: 500 }
    );
  }
} 