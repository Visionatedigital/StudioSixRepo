import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';

// GET /api/notifications/pending-invitations - Fetch pending project invitations
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all unread COLLABORATION_INVITE notifications
    const notifications = await prisma.notification.findMany({
      where: {
        userId: session.user.id,
        type: 'COLLABORATION_INVITE',
        read: false,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Transform notifications into invitation objects
    const invitations = notifications.map(notification => {
      const metadata = notification.metadata as any;
      return {
        id: notification.id,
        projectId: metadata.projectId,
        projectName: metadata.projectName,
        role: metadata.role,
        senderId: metadata.senderId,
        senderName: metadata.senderName,
        senderEmail: metadata.senderEmail,
        senderImage: metadata.senderImage,
        status: metadata.status || 'PENDING',
      };
    });

    return NextResponse.json({ invitations });
  } catch (error) {
    console.error('Error fetching pending invitations:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 