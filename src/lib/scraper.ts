import axios from 'axios';
import * as cheerio from 'cheerio';

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
  try {
    // Construct the search URL based on the query parameters
    const searchUrl = constructSearchUrl(query);
    
    // Fetch the search results page
    const response = await axios.get(searchUrl);
    const $ = cheerio.load(response.data);

    const caseStudies: CaseStudy[] = [];

    // Process each project card in the search results
    $('.afd-search-list__item').each((_, element) => {
      const $element = $(element);
      
      // Extract project details
      const title = $element.find('.afd-search-list__title').text().trim();
      const description = $element.find('.afd-search-list__description').text().trim();
      const architect = $element.find('.afd-search-list__author').text().trim();
      const image = $element.find('.afd-search-list__image img').attr('src') || '';
      const url = $element.find('.afd-search-list__link').attr('href') || '';
      
      // Extract additional details from the project page
      const projectDetails = extractProjectDetails(url);

      const caseStudy: CaseStudy = {
        id: generateId(title),
        title,
        description,
        architect,
        projectType: query.projectType,
        image,
        url,
        ...projectDetails
      };

      caseStudies.push(caseStudy);
    });

    // Filter and sort results based on relevance
    return filterAndSortResults(caseStudies, query);
  } catch (error) {
    console.error('Error scraping ArchDaily:', error);
    throw new Error('Failed to scrape case studies');
  }
}

function constructSearchUrl(query: SearchQuery): string {
  const baseUrl = 'https://www.archdaily.com/search/projects';
  const params = new URLSearchParams();

  // Add project type
  params.append('ad_categories', query.projectType);

  // Add location if specified
  if (query.location) {
    params.append('ad_country', query.location);
  }

  // Add keywords
  if (query.keywords) {
    params.append('ad_text', query.keywords);
  }

  // Add materials
  if (query.materials && query.materials.length > 0) {
    params.append('ad_materials', query.materials.join(','));
  }

  return `${baseUrl}?${params.toString()}`;
}

async function extractProjectDetails(url: string): Promise<Partial<CaseStudy>> {
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    const details: Partial<CaseStudy> = {};

    // Extract location
    details.location = $('.afd-project-data__location').text().trim();

    // Extract size
    details.size = $('.afd-project-data__size').text().trim();

    // Extract materials
    details.materials = $('.afd-project-data__materials')
      .map((_, el) => $(el).text().trim())
      .get();

    // Extract year
    details.year = $('.afd-project-data__year').text().trim();

    return details;
  } catch (error) {
    console.error('Error extracting project details:', error);
    return {};
  }
}

function generateId(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function filterAndSortResults(caseStudies: CaseStudy[], query: SearchQuery): CaseStudy[] {
  return caseStudies
    .filter(study => {
      // Filter by size if specified
      if (query.size && study.size) {
        const studySize = parseFloat(study.size.replace(/[^0-9.]/g, ''));
        const sizeRanges = {
          small: [0, 1000],
          medium: [1000, 5000],
          large: [5000, 20000],
          xlarge: [20000, Infinity]
        };
        const [min, max] = sizeRanges[query.size as keyof typeof sizeRanges];
        if (studySize < min || studySize > max) return false;
      }

      // Filter by materials if specified
      if (query.materials && query.materials.length > 0) {
        const hasMatchingMaterial = study.materials?.some(material =>
          query.materials?.some(queryMaterial =>
            material.toLowerCase().includes(queryMaterial.toLowerCase())
          )
        );
        if (!hasMatchingMaterial) return false;
      }

      return true;
    })
    .sort((a, b) => {
      // Sort by relevance to query
      let scoreA = 0;
      let scoreB = 0;

      // Add points for matching materials
      if (query.materials) {
        scoreA += countMatches(a.materials || [], query.materials);
        scoreB += countMatches(b.materials || [], query.materials);
      }

      // Add points for matching keywords in title and description
      if (query.keywords) {
        const keywords = query.keywords.toLowerCase().split(' ');
        scoreA += countMatches([a.title, a.description].join(' ').toLowerCase(), keywords);
        scoreB += countMatches([b.title, b.description].join(' ').toLowerCase(), keywords);
      }

      return scoreB - scoreA;
    });
}

function countMatches(source: string | string[], targets: string | string[]): number {
  const sourceStr = Array.isArray(source) ? source.join(' ') : source;
  const targetArr = Array.isArray(targets) ? targets : [targets];
  
  return targetArr.reduce((count, target) => {
    const regex = new RegExp(target, 'gi');
    const matches = sourceStr.match(regex);
    return count + (matches ? matches.length : 0);
  }, 0);
} 