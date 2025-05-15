import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { dynamicConfig } from '../../../config';
import { Prisma } from '@prisma/client';

export const dynamic = dynamicConfig.dynamic;
export const revalidate = dynamicConfig.revalidate;

// POST /api/community/likes/user - Get messages that the current user has liked
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Parse request body
    const { messageIds } = await req.json();
    
    // Validate input
    if (!messageIds || !Array.isArray(messageIds) || messageIds.length === 0) {
      return NextResponse.json(
        { error: 'Message IDs are required' },
        { status: 400 }
      );
    }
    
    // Execute a raw query to get the liked message IDs
    const likes = await prisma.$queryRaw`
      SELECT "messageId" 
      FROM "MessageLike" 
      WHERE "userId" = ${session.user.id} 
      AND "messageId" IN (${Prisma.join(messageIds)})
    `;
    
    // Extract message IDs from the raw query result
    const likedMessageIds = (likes as any[]).map(like => like.messageId);
    
    // Return the list of liked message IDs
    return NextResponse.json({ likedMessageIds });
  } catch (error) {
    console.error('Error fetching user likes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user likes' },
      { status: 500 }
    );
  }
} 