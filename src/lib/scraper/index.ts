import { CaseStudy } from './base';

// Define the shape of search parameters
interface SearchParams {
  projectType?: string;
  location?: string;
  materials?: string[];
  size?: string;
  keywords?: string;
}

export async function scrapeArchDaily(searchParams: SearchParams): Promise<CaseStudy[]> {
  console.log(`[${new Date().toISOString()}] ArchDaily scraper has been removed. Returning empty results.`);
  return [];
} 