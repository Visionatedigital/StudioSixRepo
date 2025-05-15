import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { dynamicConfig } from '../../config';

export const dynamic = dynamicConfig.dynamic;
export const revalidate = dynamicConfig.revalidate;

// GET /api/community/categories - Get all categories
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Fetch all categories with their channels
    const categories = await prisma.communityCategory.findMany({
      include: {
        channels: {
          orderBy: {
            order: 'asc',
          },
        },
      },
      orderBy: {
        order: 'asc',
      },
    });
    
    // Return the categories
    return NextResponse.json({ categories });
  } catch (error) {
    console.error('Error fetching community categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch community categories' },
      { status: 500 }
    );
  }
}

// POST /api/community/categories - Create a new category (admin only)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated and is an admin
    if (!session?.user || !session.user.verified) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Parse request body
    const { name, description, order } = await req.json();
    
    // Validate input
    if (!name) {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 }
      );
    }
    
    // Create the category
    const category = await prisma.communityCategory.create({
      data: {
        name,
        description,
        order: order || 0,
      },
    });
    
    // Return the created category
    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    console.error('Error creating community category:', error);
    return NextResponse.json(
      { error: 'Failed to create community category' },
      { status: 500 }
    );
  }
} 