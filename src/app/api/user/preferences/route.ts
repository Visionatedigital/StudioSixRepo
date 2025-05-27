import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const data = await request.json();
    const updateData: any = {};
    if (data.email) updateData.email = data.email;
    if (data.username) updateData.name = data.username;
    if (typeof data.weeklyNewsletter === 'boolean') updateData.weeklyNewsletter = data.weeklyNewsletter;
    if (data.password && data.password !== '••••••••') {
      updateData.hashedPassword = await bcrypt.hash(data.password, 10);
    }
    await prisma.user.update({
      where: { email: session.user.email },
      data: updateData,
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update user preferences:', error);
    return NextResponse.json({ error: 'Failed to save preferences' }, { status: 500 });
  }
} 