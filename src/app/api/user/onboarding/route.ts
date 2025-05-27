import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();
    // Update the user to mark onboarding as complete
    await prisma.user.update({
      where: { id: userId },
      data: { hasCompletedOnboarding: true },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update onboarding status' }, { status: 500 });
  }
} 