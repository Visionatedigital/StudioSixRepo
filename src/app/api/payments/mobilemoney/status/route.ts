import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * This endpoint checks the status of a Mobile Money payment.
 * It only checks the local database and does NOT contact the provider.
 * If the payment is still pending after 30 seconds, it is automatically marked as failed.
 */
export async function GET(req: NextRequest) {
  try {
    // Get the current user session
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    // Get the payment ID from the URL
    const { searchParams } = new URL(req.url);
    const paymentId = searchParams.get('paymentId');
    if (!paymentId) {
      return NextResponse.json(
        { error: 'Payment ID is required' },
        { status: 400 }
      );
    }
    // First try to find by provider payment ID
    let payment = await prisma.payment.findFirst({
      where: {
        userId: session.user.id,
        providerPaymentId: paymentId
      }
    });
    // If not found, try to find by our internal payment ID
    if (!payment) {
      payment = await prisma.payment.findFirst({
        where: {
          userId: session.user.id,
          id: paymentId
        }
      });
    }
    if (!payment) {
      // Instead of 404, return pending so frontend keeps polling
      return NextResponse.json({
        success: false,
        payment: {
          status: 'pending'
        }
      });
    }
    // If payment is not pending, return DB status immediately
    if (payment.status !== 'PENDING') {
      return NextResponse.json({
        success: true,
        payment: {
          id: payment.id,
          provider_id: payment.providerPaymentId,
          status: payment.status,
          amount: payment.amount,
          created_at: payment.createdAt
        },
        provider_response: null
      });
    }
    // If payment is still pending, check if more than 30 seconds have passed
    const now = new Date();
    const createdAt = new Date(payment.createdAt);
    const secondsElapsed = (now.getTime() - createdAt.getTime()) / 1000;
    if (secondsElapsed > 30) {
      // Automatically mark as failed
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'FAILED',
          providerStatus: 'timeout',
          updatedAt: new Date()
        }
      });
      return NextResponse.json({
        success: true,
        payment: {
          id: payment.id,
          provider_id: payment.providerPaymentId,
          status: 'FAILED',
          amount: payment.amount,
          created_at: payment.createdAt
        },
        provider_response: null
      });
    }
    // Still pending and within timeout
    return NextResponse.json({
      success: true,
      payment: {
        id: payment.id,
        provider_id: payment.providerPaymentId,
        status: payment.status,
        amount: payment.amount,
        created_at: payment.createdAt
      },
      provider_response: null
    });
  } catch (error) {
    console.error('Error checking Mobile Money payment status:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to check payment status' },
      { status: 500 }
    );
  }
} 