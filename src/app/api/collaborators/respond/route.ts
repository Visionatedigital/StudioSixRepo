import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';

// POST /api/collaborators/respond - Respond to a collaboration invitation
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { notificationId, projectId, action, role } = await request.json();

    if (!notificationId || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Find the notification
    const notification = await prisma.notification.findFirst({
      where: {
        id: notificationId,
        userId: session.user.id,
        type: 'COLLABORATION_INVITE',
      },
    });

    if (!notification) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
    }

    const metadata = notification.metadata as any;
    console.log('Notification metadata:', metadata);
    
    // Extract projectId from metadata if not provided
    const targetProjectId = projectId || metadata.projectId;
    const targetRole = role || metadata.role;
    
    if (!targetProjectId || !targetRole) {
      return NextResponse.json({ error: 'Project ID or role not found in invitation' }, { status: 400 });
    }
    
    // Mark notification as read
    await prisma.notification.update({
      where: { id: notificationId },
      data: { read: true },
    });

    if (action === 'ACCEPT') {
      // Check if the project exists
      const project = await prisma.project.findUnique({
        where: { id: targetProjectId },
      });

      if (!project) {
        return NextResponse.json({ error: 'Project not found' }, { status: 404 });
      }

      // Check if already a collaborator
      const existingCollaborator = await prisma.projectCollaborator.findFirst({
        where: {
          projectId: targetProjectId,
          userId: session.user.id,
        },
      });

      if (existingCollaborator) {
        return NextResponse.json(
          { error: 'You are already a collaborator on this project' }, 
          { status: 400 }
        );
      }

      // Add collaborator
      const collaborator = await prisma.projectCollaborator.create({
        data: {
          projectId: targetProjectId,
          userId: session.user.id,
          role: targetRole,
        },
      });

      // Notify the project owner that the invitation was accepted
      await prisma.notification.create({
        data: {
          userId: metadata.senderId,
          type: 'COLLABORATION_ACCEPTED',
          message: `${session.user.name || session.user.email} accepted your invitation to collaborate on ${metadata.projectName}`,
          metadata: {
            projectId: targetProjectId,
            projectName: metadata.projectName,
            collaboratorId: session.user.id,
            collaboratorName: session.user.name,
            collaboratorEmail: session.user.email,
            collaboratorImage: session.user.image,
          },
        },
      });

      return NextResponse.json({ success: true, collaborator });
    } else if (action === 'DECLINE') {
      // Notify the project owner that the invitation was declined
      await prisma.notification.create({
        data: {
          userId: metadata.senderId,
          type: 'COLLABORATION_REJECTED',
          message: `${session.user.name || session.user.email} declined your invitation to collaborate on ${metadata.projectName}`,
          metadata: {
            projectId: metadata.projectId,
            projectName: metadata.projectName,
            collaboratorId: session.user.id,
            collaboratorName: session.user.name,
            collaboratorEmail: session.user.email,
            collaboratorImage: session.user.image,
          },
        },
      });

      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error responding to invitation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}