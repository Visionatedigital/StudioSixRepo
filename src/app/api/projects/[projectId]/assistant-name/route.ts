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

    const projectId = await Promise.resolve(params.projectId);

    const project = await prisma.project.findUnique({
      where: {
        id: projectId,
        userId: session.user.id
      },
      select: {
        canvasData: true
      }
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const canvasData = project.canvasData as any;
    const assistantName = canvasData?.assistantName || 'AI Assistant';

    return NextResponse.json({ assistantName });
  } catch (error) {
    console.error('Error fetching assistant name:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const projectId = await Promise.resolve(params.projectId);
    const body = await request.json();
    const { assistantName } = body;

    if (!assistantName || typeof assistantName !== 'string') {
      return NextResponse.json({ error: 'Assistant name is required' }, { status: 400 });
    }

    // Get current project data
    const project = await prisma.project.findUnique({
      where: {
        id: projectId,
        userId: session.user.id
      },
      select: {
        canvasData: true
      }
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Update canvas data with assistant name
    const currentCanvasData = project.canvasData as any;
    const updatedCanvasData = {
      ...currentCanvasData,
      assistantName: assistantName.trim()
    };

    // Save updated canvas data
    await prisma.project.update({
      where: {
        id: projectId,
        userId: session.user.id
      },
      data: {
        canvasData: updatedCanvasData,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({ success: true, assistantName: assistantName.trim() });
  } catch (error) {
    console.error('Error updating assistant name:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 