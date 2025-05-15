import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Fetch user's collections with their saved posts
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Fetch user's collections with their posts
    const collections = await prisma.collection.findMany({
      where: {
        userId: session.user.id
      },
      include: {
        posts: {
          include: {
            post: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    image: true,
                  },
                },
                likes: true,
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Transform collections to include post details
    const transformedCollections = collections.map(collection => {
      const posts = collection.posts.map(collectionPost => {
        const post = collectionPost.post;
        let parsedAttachments = [];
        
        // Safely parse attachments
        if (post.attachments) {
          try {
            // Handle different possible attachment formats safely
            if (typeof post.attachments === 'string') {
              // Only try to parse if the string is not empty
              const trimmed = post.attachments.trim();
              if (trimmed) {
                parsedAttachments = JSON.parse(trimmed);
              }
            } else {
              // If it's already an object, use it directly
              parsedAttachments = Array.isArray(post.attachments) 
                ? post.attachments 
                : [post.attachments];
            }
          } catch (error) {
            console.error(`Error parsing attachments for post ${post.id}:`, error);
            // Keep attachments as empty array in case of error
          }
        }
        
        return {
          id: post.id,
          imageUrl: post.imageUrl,
          caption: post.caption,
          createdAt: post.createdAt,
          user: post.user,
          likes: post.likes.length,
          isLiked: post.likes.some(like => like.userId === session.user.id),
          shares: post.shares,
          attachments: parsedAttachments
        };
      });
      
      return {
        id: collection.id,
        name: collection.name,
        description: collection.description,
        createdAt: collection.createdAt,
        updatedAt: collection.updatedAt,
        postCount: collection.posts.length,
        posts: posts
      };
    });
    
    return NextResponse.json({ collections: transformedCollections });
  } catch (error) {
    console.error('Error fetching collections:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create a new collection
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { name, description } = await req.json();
    
    // Validate input
    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'Collection name is required' }, { status: 400 });
    }
    
    // Create a new collection
    const collection = await prisma.collection.create({
      data: {
        name,
        description: description || '',
        userId: session.user.id
      }
    });
    
    return NextResponse.json({ 
      message: 'Collection created successfully',
      collection 
    });
  } catch (error) {
    console.error('Error creating collection:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 