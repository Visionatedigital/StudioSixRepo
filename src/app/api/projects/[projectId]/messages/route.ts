import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Ensure projectId is properly awaited
    const projectId = await Promise.resolve(params.projectId);

    const messages = await prisma.chatMessage.findMany({
      where: {
        projectId: projectId,
        project: {
          userId: session.user.id
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Ensure projectId is properly awaited
    const projectId = await Promise.resolve(params.projectId);
    const body = await request.json();
    const { content, role, hasGenerateAction, isGeneratedImage } = body;

    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    // Verify that the project exists and belongs to the user
    const project = await prisma.project.findUnique({
      where: {
        id: projectId,
        userId: session.user.id
      }
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Create new message
    const message = await prisma.chatMessage.create({
      data: {
        content,
        role: role || 'user',
        project: {
          connect: {
            id: projectId
          }
        },
        user: {
          connect: {
            id: session.user.id
          }
        },
        hasGenerateAction: hasGenerateAction || false,
        isGeneratedImage: isGeneratedImage || false,
        selectedElement: body.selectedElement || null,
        prompt: body.prompt || null,
        sources: body.sources || null
      }
    });

    return NextResponse.json(message);
  } catch (error) {
    console.error('Error creating message:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 