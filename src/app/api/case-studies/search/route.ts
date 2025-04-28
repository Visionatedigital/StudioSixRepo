import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { scrapeArchDaily } from '@/lib/scraper';

interface SearchRequest {
  projectType: string;
  location: string;
  size: string;
  materials: string[];
  keywords: string;
}

export async function POST(req: Request) {
  try {
    // Verify user session
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const body: SearchRequest = await req.json();
    const { projectType, location, size, materials, keywords } = body;

    // Validate required parameters
    if (!projectType) {
      return NextResponse.json({ error: 'Project type is required' }, { status: 400 });
    }

    // Construct search query for AI analysis
    const searchQuery = {
      projectType,
      location,
      size,
      materials,
      keywords,
      // Add any additional parameters needed for the scraper
    };

    // Call the scraper with the search parameters
    const caseStudies = await scrapeArchDaily(searchQuery);

    // Return the results
    return NextResponse.json({ caseStudies });
  } catch (error) {
    console.error('Error in case studies search:', error);
    return NextResponse.json(
      { error: 'Failed to search case studies' },
      { status: 500 }
    );
  }
} 