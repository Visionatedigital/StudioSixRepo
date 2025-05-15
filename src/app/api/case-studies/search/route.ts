import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { scrapeArchDaily } from '@/lib/scraper';
import { mockSearch } from '@/lib/scraper/mock';
import { fallbackCaseStudies } from '@/lib/scraper/fallbackData';
import { CaseStudy } from '@/lib/scraper/base';
import fs from 'fs';
import path from 'path';

interface SearchRequest {
  projectType: string;
  location: string;
  size: string;
  materials: string[];
  keywords: string;
}

// Helper to write debug logs
function writeDebugLog(message: string, data?: any) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}`;
  
  console.log(logMessage, data !== undefined ? data : '');
  
  try {
    // Make sure the logs directory exists
    if (!fs.existsSync('./logs')) {
      fs.mkdirSync('./logs', { recursive: true });
    }
    // Append to log file
    fs.appendFileSync('./logs/api-search.log', 
      `${logMessage} ${data !== undefined ? JSON.stringify(data, null, 2) : ''}\n`);
  } catch (error) {
    console.error('Error writing to log file:', error);
  }
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

    // Log the search request
    writeDebugLog('Case study search request:', body);

    // Check if we have meaningful search parameters
    const hasSearchParameters = 
      (projectType && projectType.trim() !== '') || 
      (location && location.trim() !== '') || 
      (size && size.trim() !== '') || 
      (materials && materials.length > 0) || 
      (keywords && keywords.trim() !== '');

    // If no search parameters, return a selection of fallback case studies to provide some initial results
    if (!hasSearchParameters) {
      writeDebugLog('No search parameters provided. Returning a selection of fallback case studies.');
      return NextResponse.json({ 
        caseStudies: fallbackCaseStudies.slice(0, 3),
        source: 'fallback'
      });
    }

    // In development mode, use the mock scraper for more reliable testing
    // Detect development environment or force use of mock data
    const isDevelopment = process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_USE_MOCK === 'true' || true;
    writeDebugLog(`Environment detection: NODE_ENV=${process.env.NODE_ENV}, using ${isDevelopment ? 'mock scraper' : 'real scraper'}`);
    
    if (isDevelopment) {
      try {
        writeDebugLog('Using mock scraper for development or testing');
        const mockData = await mockSearch(body);
        
        if (mockData && mockData.length > 0) {
          writeDebugLog(`Found ${mockData.length} mock case studies`);
          return NextResponse.json({
            caseStudies: mockData.slice(0, 3),
            source: 'mock'
          });
        } else {
          writeDebugLog('Mock scraper returned no results, using fallbacks');
        }
      } catch (mockError) {
        writeDebugLog('Error using mock scraper:', mockError);
        // Continue to fallbacks
      }
    }

    // Always attempt to scrape real data if not in development mode
    // or if the mock scraper failed
    if (!isDevelopment) {
      writeDebugLog('Attempting to scrape live data from ArchDaily...');
      try {
        const liveData = await scrapeArchDaily({ 
          projectType, 
          location, 
          size, 
          materials,
          keywords 
        });

        // If we got live data, return it
        if (liveData && liveData.length > 0) {
          writeDebugLog(`Found ${liveData.length} live case studies`);
          
          // Always ensure 2-3 results by adding fallback data if needed
          if (liveData.length < 2) {
            const neededFallbacks = 3 - liveData.length;
            
            // Filter fallbacks to match search criteria if possible
            let relevantFallbacks = fallbackCaseStudies;
            
            if (projectType) {
              relevantFallbacks = relevantFallbacks.filter(study => study.typology === projectType || !study.typology);
            }
            
            if (materials && materials.length > 0) {
              relevantFallbacks = relevantFallbacks.filter(study => {
                if (!study.metadata.materials || study.metadata.materials.length === 0) return false;
                return materials.some(material => 
                  study.metadata.materials?.includes(material)
                );
              });
            }
            
            // If no relevant fallbacks, just use the regular ones
            if (relevantFallbacks.length === 0) {
              relevantFallbacks = fallbackCaseStudies;
            }
            
            const fallbacksToAdd = relevantFallbacks.slice(0, neededFallbacks);
            
            // Make sure we're not adding duplicates by checking IDs
            const liveIds = new Set(liveData.map(study => study.id));
            const uniqueFallbacks = fallbacksToAdd.filter(study => !liveIds.has(study.id));
            
            writeDebugLog(`Adding ${uniqueFallbacks.length} fallbacks to supplement live data`);
            
            return NextResponse.json({ 
              caseStudies: [...liveData, ...uniqueFallbacks],
              source: 'mixed'
            });
          }
          
          return NextResponse.json({ 
            caseStudies: liveData.slice(0, 3), // Limit to maximum 3 results
            source: 'scraper'
          });
        }
        
        writeDebugLog('Real scraper returned no results. Falling back to sample data.');
      } catch (error) {
        writeDebugLog('Error scraping live data:', error);
        // Continue to fallback data
      }
    }

    // Otherwise, use fallback data
    writeDebugLog('No live results found or error occurred. Using fallback data.');
    
    // Filter fallbacks based on search criteria for better consistency
    let filteredFallbacks = fallbackCaseStudies;
    
    if (projectType) {
      filteredFallbacks = filteredFallbacks.filter(study => 
        study.typology === projectType || !study.typology
      );
    }
    
    if (materials && materials.length > 0) {
      filteredFallbacks = filteredFallbacks.filter(study => {
        // Match if ANY of the requested materials are in the study
        return materials.some(material => 
          study.metadata.materials?.includes(material)
        );
      });
    }
    
    if (location && location.trim() !== '') {
      const locationLower = location.toLowerCase();
      filteredFallbacks = filteredFallbacks.filter(study => 
        (study.location && study.location.toLowerCase().includes(locationLower)) ||
        (study.description && study.description.toLowerCase().includes(locationLower))
      );
    }
    
    if (keywords && keywords.trim() !== '') {
      const keywordsArray = keywords.toLowerCase().split(/\s+/);
      filteredFallbacks = filteredFallbacks.filter(study => {
        const text = `${study.title} ${study.description || ''} ${study.architect || ''}`.toLowerCase();
        return keywordsArray.some(keyword => text.includes(keyword));
      });
    }
    
    // Ensure we always have at least 2 results
    let resultsToReturn = filteredFallbacks;
    
    if (filteredFallbacks.length < 2) {
      writeDebugLog(`After filtering, only ${filteredFallbacks.length} results remain. Using default fallbacks.`);
      resultsToReturn = fallbackCaseStudies.slice(0, 3);
    } else if (filteredFallbacks.length > 3) {
      writeDebugLog(`${filteredFallbacks.length} results after filtering. Limiting to 3.`);
      resultsToReturn = filteredFallbacks.slice(0, 3);
    }
    
    return NextResponse.json({ 
      caseStudies: resultsToReturn,
      source: 'fallback'
    });
  } catch (error) {
    writeDebugLog('Error in case studies search:', error);
    
    // Return 2-3 fallback case studies in case of error
    return NextResponse.json({ 
      caseStudies: fallbackCaseStudies.slice(0, 3),
      source: 'fallback',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 