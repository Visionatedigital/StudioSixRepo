import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  return NextResponse.json({ 
    success: false,
    message: 'ArchDaily scraping functionality has been removed',
    count: 0,
    results: [] 
  });
} 