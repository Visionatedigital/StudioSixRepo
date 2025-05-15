import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { dynamicConfig } from '../../config';

export const dynamic = dynamicConfig.dynamic;

export async function GET() {
  try {
    // Get total user count from database
    const totalUsers = await prisma.user.count();
    
    // Calculate a realistic number of online users (for demonstration)
    // In a real app, this would come from active sessions or websocket connections
    const onlineUsers = Math.max(Math.floor(totalUsers * 0.3), 1);
    
    return NextResponse.json({ 
      totalUsers,
      onlineUsers
    });
  } catch (error) {
    console.error('Error fetching online users count:', error);
    return NextResponse.json(
      { error: 'Failed to fetch online users count' },
      { status: 500 }
    );
  }
} 