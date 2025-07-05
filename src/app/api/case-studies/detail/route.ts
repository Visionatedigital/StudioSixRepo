import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { fallbackCaseStudies } from '@/lib/scraper/fallbackData';
import { CaseStudy } from '@/lib/scraper/base';

export async function GET(req: Request) {
  try {
    // Verify user session
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get ID from query parameter
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Case study ID is required' }, { status: 400 });
    }
    
    console.log(`Fetching case study detail for ID: ${id}`);
    
    // First check fallback data
    const fallbackStudy = fallbackCaseStudies.find(study => study.id === id);
    if (fallbackStudy) {
      console.log(`Found case study in fallback data: ${fallbackStudy.title}`);
      return NextResponse.json({ 
        caseStudy: fallbackStudy,
        source: 'fallback'
      });
    }
    
    // ArchDaily scraping functionality has been removed
    console.log(`ArchDaily scraping not available for ID: ${id}`);
    
    // If we get here, the case study was not found
    return NextResponse.json({ error: 'Case study not found' }, { status: 404 });
  } catch (error) {
    console.error('Error in case study detail API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch case study' },
      { status: 500 }
    );
  }
}

// Add type declaration for global cache object
declare global {
  var _caseStudyDetailCache: Record<string, CaseStudy> | undefined;
} 