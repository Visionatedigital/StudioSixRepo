import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';

type PostWithIncludes = Prisma.PostGetPayload<{
  include: {
    user: {
      select: {
        id: true;
        name: true;
        image: true;
      };
    };
    likes: true;
  };
}>;

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    const posts = await prisma.post.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        likes: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Transform posts to include like count and user's like status
    const transformedPosts = posts.map((post: PostWithIncludes) => ({
      id: post.id,
      imageUrl: post.imageUrl,
      caption: post.caption,
      createdAt: post.createdAt,
      user: post.user,
      likes: post.likes.length,
      isLiked: userId ? post.likes.some(like => like.userId === userId) : false,
      shares: post.shares,
    }));

    return NextResponse.json({ posts: transformedPosts });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 