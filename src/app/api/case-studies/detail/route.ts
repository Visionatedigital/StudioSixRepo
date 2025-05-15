import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { fallbackCaseStudies } from '@/lib/scraper/fallbackData';
import { CaseStudy } from '@/lib/scraper/base';
import { ArchDailyScraper } from '@/lib/scraper/archdaily';

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
    
    // If the ID looks like an ArchDaily ID (contains "archdaily"), try to scrape it
    if (id.includes('archdaily')) {
      // Extract URL from ID if possible
      const archDailyUrlMatch = id.match(/archdaily-([a-f0-9]{8})/);
      if (archDailyUrlMatch) {
        try {
          // Look for cached detail
          const cachedDetail = global._caseStudyDetailCache?.[id];
          if (cachedDetail) {
            console.log(`Using cached case study detail for ID: ${id}`);
            return NextResponse.json({ 
              caseStudy: cachedDetail,
              source: 'cache'
            });
          }
          
          // Initialize scraper and try to fetch from one of the URLs
          const scraper = new ArchDailyScraper();
          
          // Try to find a URL with this project ID
          const possibleUrls = [
            'https://www.archdaily.com/991543/house-in-the-garden-jure-kotonik',
            'https://www.archdaily.com/990918/shopify-tokyo-office-suppose-design-office',
            'https://www.archdaily.com/990505/jiangsu-grand-theatre-pei-partnership-architects-plus-east-china-architectural-design-and-research-institute',
            'https://www.archdaily.com/973035/the-cubic-house-yakusha-design',
            'https://www.archdaily.com/1000939/m-house-moca-arquitetura',
            'https://www.archdaily.com/986684/casa-maria-carlos-garces-arquitectos',
            'https://www.archdaily.com/989968/house-in-odemira-aires-mateus'
          ];
          
          // This is a simplified approach - in a real implementation you would have a database mapping IDs to URLs
          const scrapedStudy = await scraper.scrapeProjectPage(possibleUrls[0]);
          
          // Store in cache for future requests
          if (!global._caseStudyDetailCache) {
            global._caseStudyDetailCache = {};
          }
          global._caseStudyDetailCache[id] = scrapedStudy;
          
          return NextResponse.json({ 
            caseStudy: scrapedStudy,
            source: 'scraper'
          });
        } catch (error) {
          console.error(`Error scraping case study with ID ${id}:`, error);
          // Fall through to 404 response
        }
      }
    }
    
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