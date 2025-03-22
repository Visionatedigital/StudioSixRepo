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

    const { amount, description } = await request.json();

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Check if user has enough credits
      const user = await tx.user.findUnique({
        where: { id: session.user.id },
        select: { credits: true }
      });

      if (!user || user.credits < amount) {
        throw new Error('Insufficient credits');
      }

      // Create transaction record
      await tx.creditTransaction.create({
        data: {
          userId: session.user.id,
          amount: -amount,
          type: 'USAGE',
          description: description || 'Used credits'
        }
      });

      // Update user's credit balance
      return tx.user.update({
        where: { id: session.user.id },
        data: {
          credits: {
            decrement: amount
          }
        }
      });
    });

    return NextResponse.json({
      credits: updatedUser.credits,
      message: 'Credits used successfully'
    });
  } catch (error) {
    console.error('Error using credits:', error);
    if (error instanceof Error && error.message === 'Insufficient credits') {
      return NextResponse.json(
        { error: 'Insufficient credits' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 