import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Prisma, PrismaClient } from '@prisma/client';
import { dynamicConfig } from '../config';

export const dynamic = dynamicConfig.dynamic;
export const revalidate = dynamicConfig.revalidate;

type MessageWithUsers = {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
  sender: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
  receiver: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
};

interface Conversation {
  id: string;
  updatedAt: Date;
  messages: MessageWithUsers[];
  otherUser: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const conversations = await prisma.$transaction(async (tx: Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>) => {
      // Get all messages where the user is either sender or receiver
      const interactedUsers = await tx.message.findMany({
        where: {
          OR: [
            { senderId: session.user.id },
            { receiverId: session.user.id }
          ]
        },
        include: {
          sender: true,
          receiver: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      if (!interactedUsers.length) {
        return [];
      }

      // Get unique user IDs (excluding current user)
      const userIds = Array.from(new Set(
        interactedUsers.flatMap((msg: MessageWithUsers) => [msg.senderId, msg.receiverId])
      )).filter(id => id !== session.user.id);

      // Get latest message and user details for each conversation
      const conversationPromises = userIds.map(async (userId) => {
        const messages = await tx.message.findMany({
          where: {
            OR: [
              { AND: [{ senderId: session.user.id }, { receiverId: userId }] },
              { AND: [{ senderId: userId }, { receiverId: session.user.id }] }
            ]
          },
          include: {
            sender: true,
            receiver: true
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 50
        });

        if (!messages.length) {
          return null;
        }

        const otherUser = messages[0].senderId === session.user.id
          ? messages[0].receiver
          : messages[0].sender;

        return {
          id: userId,
          updatedAt: messages[0].createdAt,
          messages,
          otherUser
        };
      });

      const conversations = (await Promise.all(conversationPromises)).filter(Boolean) as Conversation[];
      return conversations
        .filter((conv): conv is Conversation => Boolean(conv && conv.updatedAt))
        .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
    });

    return NextResponse.json({ conversations });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 });
  }
} 