import { NextResponse } from 'next/server';
import { ArchDailyScraper } from '@/lib/scraper/archdaily';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const scraper = new ArchDailyScraper();
    
    // Get project URLs from the first page
    const projectUrls = await scraper.scrapeProjectList();
    
    // Scrape the first 3 projects
    const caseStudies = await Promise.all(
      projectUrls.slice(0, 3).map(async (url) => {
        try {
          const caseStudy = await scraper.scrapeProjectPage(url);
          // Return the case study data without saving to database
          return {
            id: caseStudy.id,
            title: caseStudy.title,
            description: caseStudy.description,
            architect: caseStudy.architect,
            year: caseStudy.year,
            location: caseStudy.location,
            typology: caseStudy.typology,
            source: caseStudy.source,
            sourceUrl: caseStudy.sourceUrl,
            images: caseStudy.images,
            metadata: caseStudy.metadata,
            characteristics: caseStudy.characteristics
          };
        } catch (error) {
          console.error(`Error scraping project ${url}:`, error);
          return null;
        }
      })
    );
    
    // Filter out any failed scrapes
    const validCaseStudies = caseStudies.filter(study => study !== null);
    
    return NextResponse.json({ 
      success: true,
      count: validCaseStudies.length,
      results: validCaseStudies 
    });
  } catch (error) {
    console.error('Error in test endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to fetch case studies' },
      { status: 500 }
    );
  }
} 