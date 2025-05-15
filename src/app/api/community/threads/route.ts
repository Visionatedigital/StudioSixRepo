import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { dynamicConfig } from '../../config';

export const dynamic = dynamicConfig.dynamic;
export const revalidate = dynamicConfig.revalidate;

// GET /api/community/threads - Get thread details and messages
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get the thread ID from the URL
    const { searchParams } = new URL(req.url);
    const threadId = searchParams.get('threadId');
    
    if (!threadId) {
      return NextResponse.json(
        { error: 'Thread ID is required' },
        { status: 400 }
      );
    }
    
    // Fetch the thread with its messages
    const thread = await prisma.thread.findUnique({
      where: { id: threadId },
      include: {
        messages: {
          include: {
            channel: true,
          },
        },
        threadMessages: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
                level: true,
                verified: true,
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });
    
    if (!thread) {
      return NextResponse.json(
        { error: 'Thread not found' },
        { status: 404 }
      );
    }
    
    // Return the thread with its messages
    return NextResponse.json({ thread });
  } catch (error) {
    console.error('Error fetching thread:', error);
    return NextResponse.json(
      { error: 'Failed to fetch thread' },
      { status: 500 }
    );
  }
}

// POST /api/community/threads/messages - Add a message to a thread
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Parse request body
    const { threadId, content, attachments } = await req.json();
    
    // Validate input
    if (!threadId || !content) {
      return NextResponse.json(
        { error: 'Thread ID and message content are required' },
        { status: 400 }
      );
    }
    
    // Check if the thread exists
    const thread = await prisma.thread.findUnique({
      where: { id: threadId },
    });
    
    if (!thread) {
      return NextResponse.json(
        { error: 'Thread not found' },
        { status: 404 }
      );
    }
    
    // Create the thread message
    const threadMessage = await prisma.threadMessage.create({
      data: {
        content,
        threadId,
        userId: session.user.id,
        attachments: attachments || undefined,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            level: true,
            verified: true,
          },
        },
      },
    });
    
    // Return the created thread message
    return NextResponse.json({ message: threadMessage }, { status: 201 });
  } catch (error) {
    console.error('Error creating thread message:', error);
    return NextResponse.json(
      { error: 'Failed to create thread message' },
      { status: 500 }
    );
  }
}

// PATCH /api/community/threads/messages - Update a thread message (like, etc.)
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Parse request body
    const { messageId, action } = await req.json();
    
    // Validate input
    if (!messageId || !action) {
      return NextResponse.json(
        { error: 'Message ID and action are required' },
        { status: 400 }
      );
    }
    
    // Check if the message exists
    const message = await prisma.threadMessage.findUnique({
      where: { id: messageId },
    });
    
    if (!message) {
      return NextResponse.json(
        { error: 'Message not found' },
        { status: 404 }
      );
    }
    
    let updatedMessage;
    
    // Handle different actions
    switch (action) {
      case 'like':
        // Increment likes count
        updatedMessage = await prisma.threadMessage.update({
          where: { id: messageId },
          data: { likes: { increment: 1 } },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
                level: true,
                verified: true,
              },
            },
          },
        });
        break;
        
      case 'unlike':
        // Decrement likes count, but don't go below 0
        updatedMessage = await prisma.threadMessage.update({
          where: { id: messageId },
          data: { 
            likes: {
              decrement: message.likes > 0 ? 1 : 0
            }
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
                level: true,
                verified: true,
              },
            },
          },
        });
        break;
        
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
    
    // Return the updated message
    return NextResponse.json({ message: updatedMessage });
  } catch (error) {
    console.error('Error updating thread message:', error);
    return NextResponse.json(
      { error: 'Failed to update thread message' },
      { status: 500 }
    );
  }
} 