import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    console.log('[PROJECTS_POST] Session:', session);
    
    if (!session?.user?.id) {
      console.log('[PROJECTS_POST] No user ID in session');
      return NextResponse.json(
        { message: 'Unauthorized - No user ID found in session' },
        { status: 401 }
      );
    }

    const body = await req.json();
    console.log('[PROJECTS_POST] Request body:', body);
    const { name, description } = body;

    if (!name) {
      console.log('[PROJECTS_POST] Missing project name');
      return NextResponse.json(
        { message: 'Name is required' },
        { status: 400 }
      );
    }

    console.log('[PROJECTS_POST] Creating project for user:', session.user.id);
    
    // Get or create a default client for the user
    let defaultClient = await prisma.client.findFirst({
      where: {
        email: session.user.email || 'default@example.com'
      }
    });
    
    if (!defaultClient) {
      defaultClient = await prisma.client.create({
        data: {
          name: session.user.name || 'Default Client',
          email: session.user.email || 'default@example.com',
          phone: 'N/A',
          address: 'N/A'
        }
      });
    }
    
    const project = await prisma.project.create({
      data: {
        name,
        description,
        userId: session.user.id,
        clientId: defaultClient.id,
        canvasData: {
          elements: [],
          version: 1,
        },
      },
    });
    console.log('[PROJECTS_POST] Project created:', project);

    return NextResponse.json(project);
  } catch (error) {
    console.error('[PROJECTS_POST] Detailed error:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Internal server error. Please try again.' },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    console.log('[PROJECTS_GET] Session:', session);

    if (!session?.user?.id) {
      console.log('[PROJECTS_GET] No user ID in session');
      return NextResponse.json(
        { message: 'Unauthorized - No user ID found in session' },
        { status: 401 }
      );
    }

    console.log('[PROJECTS_GET] Fetching projects for user:', session.user.id);
    const projects = await prisma.project.findMany({
      where: {
        userId: session.user.id
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    console.log('[PROJECTS_GET] Projects found:', projects);

    return NextResponse.json(projects);
  } catch (error) {
    console.error('[PROJECTS_GET] Detailed error:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Internal server error. Please try again.' },
      { status: 500 }
    );
  }
} 