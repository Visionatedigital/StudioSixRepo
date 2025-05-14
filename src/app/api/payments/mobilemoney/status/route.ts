import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getPaymentStatus } from '@/lib/mobilemoney';

/**
 * This endpoint checks the status of a Mobile Money payment.
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
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    // Get the provider payment ID for checking status
    const providerPaymentId = payment.providerPaymentId || '';

    try {
      // Check the payment status with the provider if we have a provider payment ID
      if (providerPaymentId) {
        const statusResponse = await getPaymentStatus(providerPaymentId);
        
        // Update the payment record with the latest status
        await prisma.payment.update({
          where: { id: payment.id },
          data: {
            providerStatus: statusResponse.status,
            updatedAt: new Date()
          }
        });

        return NextResponse.json({
          success: true,
          payment: {
            id: payment.id,
            provider_id: payment.providerPaymentId,
            status: statusResponse.status,
            amount: payment.amount,
            created_at: payment.createdAt
          },
          provider_response: statusResponse
        });
      } else {
        // If we don't have a provider payment ID, just return the current status
        return NextResponse.json({
          success: true,
          payment: {
            id: payment.id,
            provider_id: payment.providerPaymentId,
            status: payment.status,
            amount: payment.amount,
            created_at: payment.createdAt
          }
        });
      }
    } catch (error) {
      console.error('Error checking provider status:', error);
      
      // Return the current status from our database if provider check fails
      return NextResponse.json({
        success: true,
        payment: {
          id: payment.id,
          provider_id: payment.providerPaymentId,
          status: payment.status,
          amount: payment.amount,
          created_at: payment.createdAt
        },
        error: 'Failed to check provider status, using local status'
      });
    }
  } catch (error) {
    console.error('Error checking Mobile Money payment status:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to check payment status' },
      { status: 500 }
    );
  }
} 