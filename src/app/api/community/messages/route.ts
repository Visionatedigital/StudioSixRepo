import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { dynamicConfig } from '../../config';
import { Prisma } from '@prisma/client';

export const dynamic = dynamicConfig.dynamic;
export const revalidate = dynamicConfig.revalidate;

// Simple in-memory cache
interface CacheEntry {
  data: any;
  timestamp: number;
}
const messageCache: Record<string, CacheEntry> = {};
const CACHE_TTL = 20 * 1000; // 20 seconds cache

// GET /api/community/messages - Get messages for a specific channel
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check if channel ID is provided in the URL
    const { searchParams } = new URL(req.url);
    const channelId = searchParams.get('channelId');
    
    if (!channelId) {
      return NextResponse.json(
        { error: 'Channel ID is required' },
        { status: 400 }
      );
    }
    
    // Check cache first
    const cacheKey = `messages-${channelId}`;
    const now = Date.now();
    
    // If we have a valid cache entry, return it
    if (messageCache[cacheKey] && (now - messageCache[cacheKey].timestamp) < CACHE_TTL) {
      console.log(`[${new Date().toISOString()}] Using cached messages for channel ${channelId}, cache age: ${(now - messageCache[cacheKey].timestamp) / 1000}s`);
      return NextResponse.json(messageCache[cacheKey].data);
    }
    
    console.log(`[${new Date().toISOString()}] Cache miss, fetching fresh messages for channel ${channelId}`);
    
    // Check if the channel exists
    const channelExists = await prisma.communityChannel.findUnique({
      where: { id: channelId },
    });
    
    if (!channelExists) {
      return NextResponse.json(
        { error: 'Channel not found' },
        { status: 404 }
      );
    }
    
    // Fetch messages with related data
    const messages = await prisma.communityMessage.findMany({
      where: { channelId },
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
        thread: true,
        poll: {
          include: {
            votes: true, // Include poll votes
          }
        },
      },
      orderBy: { createdAt: 'asc' },
    });
    
    // Get reply counts in a separate query to avoid Prisma typing issues
    const replyCounts = await Promise.all(
      messages.map(message => 
        prisma.communityMessage.count({
          where: {
            threadId: message.id,
          },
        })
      )
    );
    
    // Process messages to format the poll data and add counts
    const processedMessages = messages.map((message, index) => {
      let pollData = null;
      
      if (message.poll) {
        // Initialize votes record
        const votes: Record<string, number> = {};
        
        // Initialize all poll options with 0 votes
        if (message.poll.options && Array.isArray(message.poll.options)) {
          message.poll.options.forEach((option: any) => {
            if (typeof option === 'string') {
              votes[option] = 0;
            }
          });
        }
        
        // Count votes for each option
        if (message.poll.votes && Array.isArray(message.poll.votes)) {
          message.poll.votes.forEach((vote: any) => {
            if (vote.options && Array.isArray(vote.options)) {
              vote.options.forEach((option: any) => {
                if (typeof option === 'string' && votes[option] !== undefined) {
                  votes[option]++;
                }
              });
            }
          });
        }
        
        // Create formatted poll data
        pollData = {
          ...message.poll,
          votes,
        };
      }
      
      // Return formatted message with proper counts
      return {
        ...message,
        poll: pollData,
        replies: replyCounts[index] || 0,
        shares: 0, // If you don't have shares yet, initialize to 0
      };
    });
    
    // Cache the result
    const responseData = { messages: processedMessages };
    messageCache[cacheKey] = {
      data: responseData,
      timestamp: now
    };
    
    console.log(`[${new Date().toISOString()}] Cached ${processedMessages.length} messages for channel ${channelId}`);
    
    // Return the processed messages
    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error fetching community messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch community messages' },
      { status: 500 }
    );
  }
}

// POST /api/community/messages - Create a new message
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Parse request body
    const {
      content,
      channelId,
      attachments,
      isPoll,
      isThread,
      pollData,
      threadData,
    } = await req.json();
    
    // Validate input
    if (!content || !channelId) {
      return NextResponse.json(
        { error: 'Message content and channel ID are required' },
        { status: 400 }
      );
    }
    
    // Process attachments to ensure URLs are properly formatted
    let processedAttachments = attachments;
    if (attachments && Array.isArray(attachments)) {
      console.log('Processing attachments for new message:', attachments);
      processedAttachments = attachments.map((attachment: any) => {
        if (!attachment) return null;
        
        // Ensure the attachment has all required fields
        const processedAttachment = {
          ...attachment,
          type: attachment.type || 'file',
          url: attachment.url || '',
          name: attachment.name || 'File',
          size: attachment.size || '0 KB'
        };
        
        // Make sure image URLs are properly formatted
        // If URL starts with blob: it was created by URL.createObjectURL() and needs to be replaced
        if (processedAttachment.type === 'image') {
          let url = processedAttachment.url;
          if (url.startsWith('blob:')) {
            // Just log this issue - client should have already uploaded the file
            console.warn('Found blob URL in attachment that should have been uploaded:', url);
          }
        }
        
        return processedAttachment;
      }).filter(Boolean);
    }
    
    // Check if the channel exists
    const channelExists = await prisma.communityChannel.findUnique({
      where: { id: channelId },
    });
    
    if (!channelExists) {
      return NextResponse.json(
        { error: 'Channel not found' },
        { status: 404 }
      );
    }
    
    // Handle thread creation if applicable
    let threadId: string | undefined;
    if (isThread && threadData) {
      const thread = await prisma.thread.create({
        data: {
          title: threadData.title,
          isPrivate: threadData.isPrivate || false,
        },
      });
      threadId = thread.id;
    }
    
    // Handle poll creation if applicable
    let pollId: string | undefined;
    if (isPoll && pollData) {
      // Calculate expiration date
      const durationMap: Record<string, number> = {
        '1 hour': 1,
        '6 hours': 6,
        '12 hours': 12,
        '24 hours': 24,
        '3 days': 72,
        '1 week': 168,
      };
      
      const durationHours = durationMap[pollData.duration] || 24;
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + durationHours);
      
      const poll = await prisma.poll.create({
        data: {
          question: pollData.question,
          options: pollData.options,
          duration: pollData.duration,
          allowMultiple: pollData.allowMultiple || false,
          expiresAt,
        },
      });
      pollId = poll.id;
    }
    
    // Create the message
    const message = await prisma.communityMessage.create({
      data: {
        content,
        channelId,
        userId: session.user.id,
        isThread: !!isThread,
        isPoll: !!isPoll,
        threadId,
        pollId,
        attachments: processedAttachments || undefined,
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
        thread: true,
        poll: true,
      },
    });
    
    // Invalidate cache for this channel
    const cacheKey = `messages-${channelId}`;
    if (messageCache[cacheKey]) {
      console.log(`[${new Date().toISOString()}] Invalidating cache for channel ${channelId} after new message`);
      delete messageCache[cacheKey];
    }
    
    // Return the created message
    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    console.error('Error creating community message:', error);
    return NextResponse.json(
      { error: 'Failed to create community message' },
      { status: 500 }
    );
  }
}

// PATCH /api/community/messages - Update a message (like, etc.)
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
    const message = await prisma.communityMessage.findUnique({
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
        // Check if the user has already liked this message using raw query
        const existingLikes = await prisma.$queryRaw`
          SELECT id FROM "MessageLike"
          WHERE "messageId" = ${messageId}
          AND "userId" = ${session.user.id}
        `;
        
        if (existingLikes && (existingLikes as any[]).length > 0) {
          return NextResponse.json(
            { error: 'User has already liked this message' },
            { status: 400 }
          );
        }
        
        // Create a new like record using raw query
        await prisma.$executeRaw`
          INSERT INTO "MessageLike" ("id", "messageId", "userId", "createdAt", "updatedAt")
          VALUES (${crypto.randomUUID()}, ${messageId}, ${session.user.id}, NOW(), NOW())
        `;
        
        // Increment likes count
        updatedMessage = await prisma.communityMessage.update({
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
        // Check if the user has liked this message using raw query
        const likesToRemove = await prisma.$queryRaw`
          SELECT id FROM "MessageLike"
          WHERE "messageId" = ${messageId}
          AND "userId" = ${session.user.id}
        `;
        
        if (!likesToRemove || (likesToRemove as any[]).length === 0) {
          return NextResponse.json(
            { error: 'User has not liked this message' },
            { status: 400 }
          );
        }
        
        // Delete the like record using raw query
        await prisma.$executeRaw`
          DELETE FROM "MessageLike"
          WHERE "messageId" = ${messageId}
          AND "userId" = ${session.user.id}
        `;
        
        // Decrement likes count, but don't go below 0
        updatedMessage = await prisma.communityMessage.update({
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
    const channelId = updatedMessage.channelId;
    // Invalidate cache for this channel
    const cacheKey = `messages-${channelId}`;
    if (messageCache[cacheKey]) {
      console.log(`[${new Date().toISOString()}] Invalidating cache for channel ${channelId} after message update`);
      delete messageCache[cacheKey];
    }

    return NextResponse.json({ message: updatedMessage });
  } catch (error) {
    console.error('Error updating community message:', error);
    return NextResponse.json(
      { error: 'Failed to update community message' },
      { status: 500 }
    );
  }
}

// DELETE /api/community/messages - Delete a community message
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get message ID from the URL
    const { searchParams } = new URL(req.url);
    const messageId = searchParams.get('messageId');
    
    if (!messageId) {
      return NextResponse.json(
        { error: 'Message ID is required' },
        { status: 400 }
      );
    }
    
    // Check if the message exists
    const message = await prisma.communityMessage.findUnique({
      where: { id: messageId },
    });
    
    if (!message) {
      return NextResponse.json(
        { error: 'Message not found' },
        { status: 404 }
      );
    }
    
    // Check if the user is the author of the message
    if (message.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'You can only delete your own messages' },
        { status: 403 }
      );
    }
    
    // Delete the message
    await prisma.communityMessage.delete({
      where: { id: messageId },
    });
    
    // Invalidate cache for this channel
    const cacheKey = `messages-${message.channelId}`;
    if (messageCache[cacheKey]) {
      console.log(`[${new Date().toISOString()}] Invalidating cache for channel ${message.channelId} after message deletion`);
      delete messageCache[cacheKey];
    }
    
    // Return success response
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting community message:', error);
    return NextResponse.json(
      { error: 'Failed to delete community message' },
      { status: 500 }
    );
  }
} 