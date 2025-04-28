import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { amount } = await req.json();

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid credit amount' }, { status: 400 });
    }

    // Get user's current credits
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { credits: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.credits < amount) {
      return NextResponse.json({ 
        error: 'Insufficient credits',
        currentCredits: user.credits 
      }, { status: 400 });
    }

    // Deduct credits
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: { credits: { decrement: amount } },
      select: { credits: true }
    });

    return NextResponse.json({
      success: true,
      remainingCredits: updatedUser.credits
    });

  } catch (error) {
    console.error('Error deducting credits:', error);
    return NextResponse.json(
      { error: 'Failed to deduct credits' },
      { status: 500 }
    );
  }
} 