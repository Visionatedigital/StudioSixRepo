import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { PrismaClient, Prisma } from '@prisma/client';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { amount, paymentIntentId } = await request.json();

    // TODO: Verify payment with Stripe
    // For now, we'll just add the credits directly
    // In production, this should verify the payment was successful

    const updatedUser = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Create transaction record
      await tx.creditTransaction.create({
        data: {
          userId: session.user.id,
          amount,
          type: 'PURCHASE',
          description: `Purchased ${amount} credits`
        }
      });

      // Update user's credit balance
      return tx.user.update({
        where: { id: session.user.id },
        data: {
          credits: {
            increment: amount
          }
        }
      });
    });

    return NextResponse.json({
      credits: updatedUser.credits,
      message: 'Credits purchased successfully'
    });
  } catch (error) {
    console.error('Error purchasing credits:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 