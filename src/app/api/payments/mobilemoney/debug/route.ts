import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * This is a debug endpoint to view all Mobile Money payments.
 * It's useful for testing and debugging.
 * 
 * IMPORTANT: This should be disabled in production!
 */
export async function GET(req: NextRequest) {
  // This should check for some kind of auth or secret in a real app
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
  }

  try {
    // Get all mobile money payments
    const payments = await prisma.$queryRaw`
      SELECT p.*, u.email as "userEmail"
      FROM "Payment" p
      JOIN "User" u ON p."userId" = u.id
      WHERE p."method" = 'MOBILE_MONEY'
      ORDER BY p."createdAt" DESC
      LIMIT 50
    `;
    
    return NextResponse.json({
      success: true,
      count: Array.isArray(payments) ? payments.length : 0,
      payments: payments
    });
  } catch (error) {
    console.error('Error fetching mobile money payments:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch payments' },
      { status: 500 }
    );
  }
} 