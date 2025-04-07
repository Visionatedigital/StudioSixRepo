import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (userId) {
      // Get messages between current user and specified user
      const messages = await prisma.message.findMany({
        where: {
          OR: [
            { senderId: session.user.id, receiverId: userId },
            { senderId: userId, receiverId: session.user.id }
          ]
        },
        orderBy: {
          createdAt: 'asc'
        },
        include: {
          sender: {
            select: {
              name: true,
              image: true,
              verified: true
            }
          }
        }
      });

      return NextResponse.json({ messages });
    } else {
      // Get all conversations (latest message from each conversation)
      const conversations = await prisma.$transaction(async (tx) => {
        // Get all users the current user has interacted with
        const interactedUsers = await tx.message.findMany({
          where: {
            OR: [
              { senderId: session.user.id },
              { receiverId: session.user.id }
            ]
          },
          select: {
            senderId: true,
            receiverId: true
          },
          distinct: ['senderId', 'receiverId']
        });

        // Get unique user IDs (excluding current user)
        const userIds = [...new Set(
          interactedUsers.flatMap(msg => [msg.senderId, msg.receiverId])
        )].filter(id => id !== session.user.id);

        // Get latest message and user details for each conversation
        const conversationPromises = userIds.map(async (userId) => {
          const latestMessage = await tx.message.findFirst({
            where: {
              OR: [
                { senderId: session.user.id, receiverId: userId },
                { senderId: userId, receiverId: session.user.id }
              ]
            },
            orderBy: {
              createdAt: 'desc'
            }
          });

          const unreadCount = await tx.message.count({
            where: {
              senderId: userId,
              receiverId: session.user.id,
              read: false
            }
          });

          const user = await tx.user.findUnique({
            where: { id: userId },
            select: {
              id: true,
              name: true,
              image: true,
              verified: true
            }
          });

          if (!latestMessage || !user) return null;

          return {
            id: userId,
            userId: userId,
            userName: user.name || 'Unknown User',
            userImage: user.image || '/profile-icons/Profile-icon-01.svg',
            verified: user.verified,
            lastMessage: latestMessage.content,
            unreadCount,
            updatedAt: latestMessage.createdAt
          };
        });

        const conversations = (await Promise.all(conversationPromises)).filter(Boolean);
        return conversations.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
      });

      return NextResponse.json({ conversations });
    }
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 