import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { validateCanvasData, CanvasState } from '@/lib/canvas-utils';
import { Prisma } from '@prisma/client';

interface ImageData {
  src: string;
  width: number;
  height: number;
  naturalWidth?: number;
  naturalHeight?: number;
}

interface BaseElement {
  id: string;
  type: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  naturalWidth?: number;
  naturalHeight?: number;
}

interface ImageElement extends BaseElement {
  type: 'upload' | 'generated';
  image: ImageData | string;
}

interface CanvasData {
  id: string;
  name: string;
  elements: (BaseElement | ImageElement)[];
  parentId?: string;
}

export async function GET(
  request: Request,
  { params }: { params: { projectId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Ensure projectId is properly awaited
    const projectId = await Promise.resolve(params.projectId);

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        collaborators: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true
              }
            }
          }
        }
      }
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Validate canvas data before returning
    if (project.canvasData && !validateCanvasData(project.canvasData)) {
      console.error('Invalid canvas data found in project:', project.id);
      // Reset to default canvas data
      project.canvasData = {
        elements: [],
        canvasStack: [{
          id: 'root',
          name: project.name,
          elements: [],
          parentId: undefined
        }]
      };
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error('Error fetching project:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { projectId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Ensure projectId is properly awaited
    const projectId = await Promise.resolve(params.projectId);
    const body = await req.json();
    const { canvasData } = body;

    console.log('PATCH request for project:', projectId);
    console.log('Request body:', body);
    console.log('Canvas data received:', canvasData);

    // Validate canvas data
    if (!validateCanvasData(canvasData)) {
      console.error('Invalid canvas data:', canvasData);
      return new NextResponse("Invalid canvas data", { status: 400 });
    }

    console.log('Canvas data validated successfully');

    // Update project with validated canvas data
    const updatedProject = await prisma.project.update({
      where: {
        id: projectId,
        OR: [
          { userId: session.user.id },
          { collaborators: { some: { userId: session.user.id } } }
        ]
      },
      data: {
        canvasData: canvasData as Prisma.InputJsonValue,
        updatedAt: new Date()
      }
    });

    console.log('Project updated successfully:', updatedProject);
    return NextResponse.json(updatedProject);
  } catch (error) {
    console.error("[PROJECT_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { projectId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Ensure projectId is properly awaited
    const projectId = await Promise.resolve(params.projectId);

    await prisma.project.delete({
      where: { id: projectId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json(
      { error: 'Failed to delete project' },
      { status: 500 }
    );
  }
} 