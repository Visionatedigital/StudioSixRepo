import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    // Get all collaborators for the project
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { userId: session.user.id },
          {
            collaborators: {
              some: {
                userId: session.user.id,
              },
            },
          },
        ],
      },
      include: {
        collaborators: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
      },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json(project.collaborators);
  } catch (error) {
    console.error('Error getting collaborators:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { projectId, email, role } = await request.json();

    if (!projectId || !email || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!['VIEWER', 'EDITOR'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    // Check if the user owns the project
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: session.user.id,
      },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found or unauthorized' }, { status: 404 });
    }

    // Find the user to be added as collaborator
    const userToAdd = await prisma.user.findUnique({
      where: { email },
    });

    if (!userToAdd) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if already a collaborator
    const existingCollaborator = await prisma.projectCollaborator.findFirst({
      where: {
        projectId,
        userId: userToAdd.id,
      },
    });

    if (existingCollaborator) {
      return NextResponse.json({ error: 'User is already a collaborator' }, { status: 400 });
    }

    // Add collaborator
    const collaborator = await prisma.projectCollaborator.create({
      data: {
        projectId,
        userId: userToAdd.id,
        role,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    // Create notification
    await prisma.notification.create({
      data: {
        userId: userToAdd.id,
        type: 'PROJECT_INVITATION',
        message: `You have been invited to collaborate on ${project.name}`,
        metadata: {
          projectId,
          projectName: project.name,
          role,
        },
      },
    });

    return NextResponse.json(collaborator);
  } catch (error) {
    console.error('Error adding collaborator:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const collaboratorId = searchParams.get('collaboratorId');

    if (!projectId || !collaboratorId) {
      return NextResponse.json({ error: 'Project ID and Collaborator ID are required' }, { status: 400 });
    }

    // Check if the user owns the project
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: session.user.id,
      },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found or unauthorized' }, { status: 404 });
    }

    // Remove collaborator
    await prisma.projectCollaborator.delete({
      where: {
        id: collaboratorId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing collaborator:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 