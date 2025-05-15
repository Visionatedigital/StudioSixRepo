import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Define a response interface for consistent typing with the main posts API
interface PostResponse {
  id: string;
  imageUrl: string;
  caption: string | null;
  createdAt: Date;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
  likes: number;
  isLiked: boolean;
  shares: number;
  attachments: Array<{
    type: string;
    url: string;
    name: string;
    size: number;
  }>;
}

type PostWithIncludes = {
  id: string;
  imageUrl: string;
  caption: string | null;
  createdAt: Date;
  userId: string;
  shares: number;
  attachments?: string;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
  likes: {
    id: string;
    userId: string;
    postId: string;
    createdAt: Date;
  }[];
};

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get posts liked by the current user
    const likedPosts = await prisma.post.findMany({
      where: {
        likes: {
          some: {
            userId: session.user.id
          }
        }
      },
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
    const transformedPosts = likedPosts.map((post): PostResponse => {
      const typedPost = post as unknown as PostWithIncludes;
      let parsedAttachments = [];
      
      // Safely parse attachments JSON
      if (typedPost.attachments) {
        try {
          // Check if the attachments string is empty or null before parsing
          parsedAttachments = typedPost.attachments.trim() 
            ? JSON.parse(typedPost.attachments) 
            : [];
        } catch (error) {
          console.error(`Error parsing attachments for post ${typedPost.id}:`, error);
          // Continue with empty attachments array
        }
      }
      
      return {
        id: typedPost.id,
        imageUrl: typedPost.imageUrl,
        caption: typedPost.caption,
        createdAt: typedPost.createdAt,
        user: typedPost.user,
        likes: typedPost.likes.length,
        isLiked: true, // These are all liked posts by definition
        shares: typedPost.shares,
        attachments: parsedAttachments
      };
    });

    return NextResponse.json({ posts: transformedPosts });
  } catch (error) {
    console.error('Error fetching liked posts:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 