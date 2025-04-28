import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';
import { dynamicConfig } from '../../config';

export const dynamic = dynamicConfig.dynamic;
export const revalidate = dynamicConfig.revalidate;

// GET /api/projects/shared - Fetch projects shared with the user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all projects where the user is a collaborator
    const collaborations = await prisma.projectCollaborator.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        project: {
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
      orderBy: {
        project: {
          updatedAt: 'desc',
        },
      },
    });

    return NextResponse.json({ projects: collaborations });
  } catch (error) {
    console.error('Error fetching shared projects:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 