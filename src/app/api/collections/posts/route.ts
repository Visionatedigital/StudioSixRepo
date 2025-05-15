import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST - Add a post to a collection
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Parse JSON body safely
    let body;
    try {
      body = await req.json();
    } catch (error) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }
    
    const { postId, collectionId } = body;
    
    // Validate input
    if (!postId || !collectionId) {
      return NextResponse.json({ error: 'Post ID and Collection ID are required' }, { status: 400 });
    }
    
    // Check if the collection belongs to the user
    const collection = await prisma.collection.findUnique({
      where: {
        id: collectionId,
        userId: session.user.id
      }
    });
    
    if (!collection) {
      return NextResponse.json({ error: 'Collection not found or unauthorized' }, { status: 404 });
    }
    
    // Check if the post exists
    const post = await prisma.post.findUnique({
      where: {
        id: postId
      }
    });
    
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }
    
    // Check if the post is already in the collection
    const existingEntry = await prisma.collectionPost.findFirst({
      where: {
        postId: postId,
        collectionId: collectionId
      }
    });
    
    if (existingEntry) {
      return NextResponse.json({ 
        message: 'Post is already in this collection',
        alreadyExists: true
      });
    }
    
    // Add post to collection
    await prisma.collectionPost.create({
      data: {
        postId,
        collectionId
      }
    });
    
    return NextResponse.json({ 
      message: 'Post added to collection successfully',
      success: true
    });
  } catch (error) {
    console.error('Error adding post to collection:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Remove a post from a collection
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { searchParams } = new URL(req.url);
    const postId = searchParams.get('postId');
    const collectionId = searchParams.get('collectionId');
    
    // Validate input
    if (!postId || !collectionId) {
      return NextResponse.json({ error: 'Post ID and Collection ID are required' }, { status: 400 });
    }
    
    // Check if the collection belongs to the user
    const collection = await prisma.collection.findUnique({
      where: {
        id: collectionId,
        userId: session.user.id
      }
    });
    
    if (!collection) {
      return NextResponse.json({ error: 'Collection not found or unauthorized' }, { status: 404 });
    }
    
    try {
      // Remove post from collection
      await prisma.collectionPost.deleteMany({
        where: {
          postId: postId,
          collectionId: collectionId
        }
      });
    } catch (error) {
      // Log the error but don't fail the request - might be already deleted
      console.error('Error removing post from collection:', error);
    }
    
    return NextResponse.json({ 
      message: 'Post removed from collection successfully',
      success: true
    });
  } catch (error) {
    console.error('Error removing post from collection:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 