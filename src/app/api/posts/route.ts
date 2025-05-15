import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { dynamicConfig } from '../config';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import crypto from 'crypto';
import { existsSync, mkdirSync } from 'fs';
import { Prisma } from '@prisma/client';

export const dynamic = dynamicConfig.dynamic;
export const revalidate = dynamicConfig.revalidate;

// Define a response interface for consistent typing
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
    const transformedPosts = posts.map((post): PostResponse => {
      const typedPost = post as unknown as PostWithIncludes;
      let parsedAttachments = [];
      
      // Safely parse attachments JSON
      if (typedPost.attachments) {
        try {
          parsedAttachments = JSON.parse(typedPost.attachments);
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
        isLiked: userId ? typedPost.likes.some((like) => like.userId === userId) : false,
        shares: typedPost.shares,
        attachments: parsedAttachments
      };
    });

    return NextResponse.json({ posts: transformedPosts });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST method to create a new post with attachment support
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse FormData
    const formData = await req.formData();
    const content = formData.get('content') as string;
    const attachmentType = formData.get('attachmentType') as string | null;
    
    // Create file upload logic
    let imageUrl = '';
    let attachments: Array<{
      type: string;
      url: string;
      name: string;
      size: number;
    }> = [];
    
    // Basic validation
    if (!content && !formData.has('attachment0')) {
      return NextResponse.json({ error: 'Post must have content or an attachment' }, { status: 400 });
    }

    // Ensure uploads directory exists
    const uploadsDir = join(process.cwd(), 'public', 'uploads');
    if (!existsSync(uploadsDir)) {
      console.log(`Creating uploads directory: ${uploadsDir}`);
      mkdirSync(uploadsDir, { recursive: true });
    } else {
      console.log(`Uploads directory exists: ${uploadsDir}`);
    }

    // Process attachments
    let hasImage = false;
    let i = 0;
    const uploadPromises: Promise<any>[] = [];
    const tempAttachments: { index: number, attachment: { type: string, url: string, name: string, size: number } }[] = [];
    
    while (formData.has(`attachment${i}`)) {
      const file = formData.get(`attachment${i}`) as File;
      console.log(`Processing attachment ${i}: ${file?.name}, type: ${file?.type}`);
      
      if (file) {
        const currentIndex = i; // Capture the current index for the closure
        
        try {
          // Generate unique filename
          const fileExtension = file.name.split('.').pop() || 'jpg';
          const fileName = `post-${crypto.randomUUID()}.${fileExtension}`;
          const filePath = join(uploadsDir, fileName);
          console.log(`Generated filename: ${fileName}, full path: ${filePath}`);
          
          // Convert the file to a Buffer
          const bytes = await file.arrayBuffer();
          const buffer = Buffer.from(bytes);
          console.log(`File converted to buffer, size: ${buffer.length} bytes`);
          
          // Save the file
          const uploadPromise = writeFile(filePath, buffer).then(() => {
            console.log(`File saved to ${filePath}`);
            
            // Create public URL
            const url = `/uploads/${fileName}`;
            console.log(`Public URL: ${url}`);
            
            // Create attachment object
            const attachment = {
              type: file.type.startsWith('image/') 
                ? 'image' 
                : file.type.startsWith('video/') 
                  ? 'video' 
                  : 'document',
              url: url,
              name: file.name,
              size: file.size
            };
            
            // Store in temp array with index info to maintain order
            tempAttachments.push({ index: currentIndex, attachment });
            
            // Set as main image if it's the first image
            if (file.type.startsWith('image/') && currentIndex === 0) {
              imageUrl = url;
              hasImage = true;
              console.log(`Set as main image URL: ${imageUrl}`);
            }
            
            return { success: true, url };
          });
          
          uploadPromises.push(uploadPromise);
        } catch (error) {
          console.error('Error processing file:', error);
          // Continue with other files if one fails
        }
      }
      i++;
    }
    
    // Wait for all file uploads to complete
    if (uploadPromises.length > 0) {
      try {
        await Promise.all(uploadPromises);
        console.log('All files uploaded successfully');
        
        // Sort attachments to maintain original order and extract just the attachment objects
        attachments = tempAttachments
          .sort((a, b) => a.index - b.index)
          .map(item => item.attachment);
          
        console.log(`Processed ${attachments.length} attachments`);
      } catch (error) {
        console.error('Error uploading files:', error);
      }
    }
    
    // If no image was uploaded but we have content, create a post without an image
    if (!hasImage && content && content.trim()) {
      // Allow text-only posts
      const postData = {
        imageUrl: '', // Empty for text-only posts
        caption: content.trim(),
        user: { connect: { id: session.user.id } },
        attachments: attachments.length > 0 ? JSON.stringify(attachments) : "[]"
      };
      
      const post = await prisma.post.create({
        data: postData,
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
      });
      
      const transformedPost: PostResponse = {
        id: post.id,
        imageUrl: post.imageUrl,
        caption: post.caption,
        createdAt: post.createdAt,
        user: post.user,
        likes: 0,
        isLiked: false,
        shares: post.shares,
        attachments: attachments
      };

      return NextResponse.json({ 
        message: 'Text post created successfully',
        post: transformedPost
      });
    }
    
    // For posts with images, ensure we have an actual image
    if (!hasImage) {
      return NextResponse.json({ 
        error: 'Image upload failed or no image provided for post with attachments' 
      }, { status: 400 });
    }
    
    // Create post with image
    const postData = {
      imageUrl: imageUrl, // Only use the actual uploaded image, no fallbacks
      caption: content || '',
      user: { connect: { id: session.user.id } },
      attachments: attachments.length > 0 ? JSON.stringify(attachments) : "[]"
    };
    
    console.log(`Creating post with data:`, JSON.stringify(postData));
    
    const post = await prisma.post.create({
      data: postData,
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
    });
    
    console.log(`Post created with ID ${post.id}, imageUrl: ${post.imageUrl}`);
    
    const transformedPost: PostResponse = {
      id: post.id,
      imageUrl: post.imageUrl,
      caption: post.caption,
      createdAt: post.createdAt,
      user: post.user,
      likes: 0,
      isLiked: false,
      shares: post.shares,
      attachments: attachments
    };
    
    console.log(`Returning transformed post:`, JSON.stringify(transformedPost));

    return NextResponse.json({ 
      message: 'Post created successfully',
      post: transformedPost
    });
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json({ 
      error: 'Failed to create post',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 