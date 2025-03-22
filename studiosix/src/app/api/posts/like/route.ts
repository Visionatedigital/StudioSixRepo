import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { postId } = await req.json();
    if (!postId) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
    }

    // Check if user has already liked the post
    const existingLike = await prisma.like.findUnique({
      where: {
        postId_userId: {
          postId: postId,
          userId: session.user.id,
        },
      },
    });

    if (existingLike) {
      // Unlike the post
      await prisma.like.delete({
        where: {
          id: existingLike.id,
        },
      });

      const likeCount = await prisma.like.count({
        where: {
          postId: postId,
        },
      });

      return NextResponse.json({ liked: false, likeCount });
    }

    // Like the post
    await prisma.like.create({
      data: {
        postId: postId,
        userId: session.user.id,
      },
    });

    const likeCount = await prisma.like.count({
      where: {
        postId: postId,
      },
    });

    return NextResponse.json({ liked: true, likeCount });
  } catch (error) {
    console.error('Error handling like:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 