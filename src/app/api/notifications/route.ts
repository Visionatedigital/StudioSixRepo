import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';

// GET /api/notifications - Fetch user's notifications
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const notifications = await prisma.notification.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Transform notifications to include project and sender information
    const transformedNotifications = notifications.map((notification: any) => {
      const metadata = notification.metadata as Record<string, any>;
      
      // Extract project and sender info from metadata
      const project = metadata.projectId ? {
        id: metadata.projectId,
        name: metadata.projectName || 'Untitled Project'
      } : undefined;
      
      const sender = metadata.senderId ? {
        id: metadata.senderId,
        name: metadata.senderName || null,
        email: metadata.senderEmail || 'Unknown',
        image: metadata.senderImage || null
      } : undefined;

      // For debugging
      console.log('Notification metadata:', metadata);
      console.log('Transformed sender:', sender);
      console.log('Transformed project:', project);

      return {
        id: notification.id,
        type: notification.type,
        message: notification.message,
        read: notification.read,
        createdAt: notification.createdAt,
        project,
        sender
      };
    });

    return NextResponse.json({ notifications: transformedNotifications });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/notifications - Mark notification as read
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { notificationId } = await request.json();
    
    if (!notificationId) {
      return NextResponse.json({ error: 'Notification ID is required' }, { status: 400 });
    }

    // Verify user owns the notification
    const notification = await prisma.notification.findFirst({
      where: {
        id: notificationId,
        userId: session.user.id,
      },
    });

    if (!notification) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
    }

    // Mark as read
    const updatedNotification = await prisma.notification.update({
      where: {
        id: notificationId,
      },
      data: {
        read: true,
      },
    });

    return NextResponse.json(updatedNotification);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/notifications - Create a new notification (for internal use)
export async function POST(request: NextRequest) {
  try {
    const { userId, type, message, metadata } = await request.json();

    if (!userId || !type || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        message,
        metadata: metadata || {},
      },
    });

    return NextResponse.json(notification);
  } catch (error) {
    console.error('Error creating notification:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 