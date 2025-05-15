import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { dynamicConfig } from '../../config';

export const dynamic = dynamicConfig.dynamic;
export const revalidate = dynamicConfig.revalidate;

// Simple in-memory cache
interface CacheEntry {
  data: any;
  timestamp: number;
}
let channelsCache: CacheEntry | null = null;
const CACHE_TTL = 60 * 1000; // 1 minute cache

// GET /api/community/channels - Get all community categories and channels
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check cache first
    const now = Date.now();
    
    // If we have a valid cache entry, return it
    if (channelsCache && (now - channelsCache.timestamp) < CACHE_TTL) {
      console.log(`[${new Date().toISOString()}] Using cached community channels, cache age: ${(now - channelsCache.timestamp) / 1000}s`);
      return NextResponse.json(channelsCache.data);
    }
    
    console.log(`[${new Date().toISOString()}] Cache miss, fetching fresh community channels data`);
    
    // Fetch all categories
    const categories = await prisma.communityCategory.findMany({
      orderBy: { order: 'asc' },
      include: {
        channels: {
          orderBy: { order: 'asc' },
          select: {
            id: true,
            name: true,
            description: true,
            categoryId: true,
            order: true
          }
        }
      }
    });
    
    // Format the response
    const formattedCategories = categories.map(category => ({
      id: category.id,
      name: category.name,
      description: category.description,
      order: category.order,
      channels: category.channels.map(channel => ({
        id: channel.id,
        name: channel.name,
        description: channel.description,
        categoryId: channel.categoryId,
        order: channel.order
      }))
    }));
    
    // Create response data
    const responseData = { categories: formattedCategories };
    
    // Store in cache
    (channelsCache as any) = {
      data: responseData,
      timestamp: now
    };
    
    console.log(`[${new Date().toISOString()}] Cached community channels data with ${formattedCategories.length} categories`);
    
    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error fetching community channels:', error);
    return NextResponse.json(
      { error: 'Failed to fetch community channels' },
      { status: 500 }
    );
  }
}

// POST /api/community/channels - Create a new channel (admin only)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated and is an admin
    if (!session?.user || !session.user.verified) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Parse request body
    const { name, description, categoryId, order } = await req.json();
    
    // Validate input
    if (!name || !categoryId) {
      return NextResponse.json(
        { error: 'Channel name and category ID are required' },
        { status: 400 }
      );
    }
    
    // Check if category exists
    const categoryExists = await prisma.communityCategory.findUnique({
      where: { id: categoryId },
    });
    
    if (!categoryExists) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }
    
    // Create the channel
    const channel = await prisma.communityChannel.create({
      data: {
        name,
        description,
        categoryId,
        order: order || 0,
      },
    });
    
    // Invalidate the cache
    (channelsCache as any) = null;
    
    // Return the created channel
    return NextResponse.json({ channel }, { status: 201 });
  } catch (error) {
    console.error('Error creating community channel:', error);
    return NextResponse.json(
      { error: 'Failed to create community channel' },
      { status: 500 }
    );
  }
} 