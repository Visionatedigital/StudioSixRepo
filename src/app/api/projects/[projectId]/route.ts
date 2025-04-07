import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

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

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const projectId = url.pathname.split('/')[3]; // Extract projectId from URL path

    const project = await prisma.project.findUnique({
      where: {
        id: projectId,
        userId: session.user.id
      },
      include: {
        messages: true,
        user: true,
        collaborators: true
      }
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error('Error fetching project:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const projectId = url.pathname.split('/')[3]; // Extract projectId from URL path
    const body = await request.json();

    const project = await prisma.project.update({
      where: {
        id: projectId,
        userId: session.user.id
      },
      data: body
    });

    return NextResponse.json(project);
  } catch (error) {
    console.error('Error updating project:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const projectId = url.pathname.split('/')[3]; // Extract projectId from URL path

    await prisma.project.delete({
      where: {
        id: projectId,
        userId: session.user.id
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 