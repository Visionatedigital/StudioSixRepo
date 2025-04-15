import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { projectId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ hasAccess: false, reason: 'unauthorized' }, { status: 401 });
    }

    // Ensure projectId is properly awaited
    const projectId = await Promise.resolve(params.projectId);
    
    // Check if user is the owner
    const project = await prisma.project.findUnique({
      where: {
        id: projectId,
      },
    });

    if (!project) {
      return NextResponse.json({ hasAccess: false, reason: 'not_found' }, { status: 404 });
    }

    // If user is the owner, they have access
    if (project.userId === session.user.id) {
      return NextResponse.json({ hasAccess: true, role: 'OWNER' });
    }

    // Check if user is a collaborator
    const collaborator = await prisma.projectCollaborator.findFirst({
      where: {
        projectId,
        userId: session.user.id,
      },
    });

    if (collaborator) {
      return NextResponse.json({ 
        hasAccess: true, 
        role: collaborator.role 
      });
    }

    // Check if user has a pending invitation (using JSON filtering)
    const pendingInvitations = await prisma.notification.findMany({
      where: {
        userId: session.user.id,
        type: 'COLLABORATION_INVITE',
        read: false,
      },
    });
    
    // Filter manually for projectId in metadata
    const pendingInvitation = pendingInvitations.find(
      notification => {
        const metadata = notification.metadata as any;
        return metadata?.projectId === projectId;
      }
    );

    if (pendingInvitation) {
      return NextResponse.json({ 
        hasAccess: false, 
        reason: 'pending_invitation',
        invitationId: pendingInvitation.id
      });
    }

    // No access
    return NextResponse.json({ hasAccess: false, reason: 'no_access' });
  } catch (error) {
    console.error('Error checking project access:', error);
    return NextResponse.json({ hasAccess: false, reason: 'error' }, { status: 500 });
  }
}