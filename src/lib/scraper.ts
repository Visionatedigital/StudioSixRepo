

export interface SearchQuery {
  projectType: string;
  location?: string;
  size?: string;
  materials?: string[];
  keywords?: string;
}

export interface CaseStudy {
  id: string;
  title: string;
  description: string;
  architect: string;
  projectType: string;
  image: string;
  url: string;
  location?: string;
  size?: string;
  materials?: string[];
  year?: string;
}

export async function scrapeArchDaily(query: SearchQuery): Promise<CaseStudy[]> {
  console.log(`[${new Date().toISOString()}] ArchDaily scraper has been removed. Returning empty results.`);
  return [];
}

 