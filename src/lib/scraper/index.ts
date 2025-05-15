import { ArchDailyScraper } from './archdaily';
import { CaseStudy } from './base';

// Cache for scraped results to avoid repeated scraping
const resultCache: Record<string, { timestamp: number, data: CaseStudy[] }> = {};
const CACHE_TTL = 1000 * 60 * 60 * 24; // 24 hours

// Set of URLs for different architectural projects by category
const PROJECT_URLS: Record<string, string[]> = {
  residential: [
    'https://www.archdaily.com/973035/the-cubic-house-yakusha-design',
    'https://www.archdaily.com/991543/house-in-the-garden-jure-kotonik',
    'https://www.archdaily.com/1000939/m-house-moca-arquitetura',
    'https://www.archdaily.com/986684/casa-maria-carlos-garces-arquitectos',
    'https://www.archdaily.com/989968/house-in-odemira-aires-mateus',
    'https://www.archdaily.com/990230/baan-rai-thaw-house-ars-atelier-de-architectures',
    'https://www.archdaily.com/984996/house-on-the-mountain-gga-architects',
    'https://www.archdaily.com/993534/house-in-parnassus-paper-architects'
  ],
  commercial: [
    'https://www.archdaily.com/996825/benetton-flagship-store-aim-architecture',
    'https://www.archdaily.com/990918/shopify-tokyo-office-suppose-design-office',
    'https://www.archdaily.com/994608/linkedin-office-nanimarquina-headquarters-el-equipo-creativo',
    'https://www.archdaily.com/986950/apple-store-sanlitun-foster-plus-partners',
    'https://www.archdaily.com/992661/apple-tower-theatre-foster-plus-partners',
    'https://www.archdaily.com/977245/wangshu-bookstore-of-chongqing-zhongshuge-x-studio',
    'https://www.archdaily.com/986342/google-bay-view-campus-bjarke-ingels-group-plus-heatherwick-studio'
  ],
  cultural: [
    'https://www.archdaily.com/990505/jiangsu-grand-theatre-pei-partnership-architects-plus-east-china-architectural-design-and-research-institute',
    'https://www.archdaily.com/989868/shanghai-planetarium-ennead-architects',
    'https://www.archdaily.com/977138/natural-history-museum-herzog-and-de-meuron',
    'https://www.archdaily.com/987878/the-odunpazari-modern-museum-kengo-kuma-and-associates',
    'https://www.archdaily.com/962268/shanghai-modern-art-museum-atelier-deshaus',
    'https://www.archdaily.com/925062/the-shed-diller-scofidio-plus-renfro'
  ],
  educational: [
    'https://www.archdaily.com/995376/a-village-school-complex-rural-development-studio-pu-miao',
    'https://www.archdaily.com/991950/tsinghua-university-institute-of-arts-and-humanities-studio-zhu-pei',
    'https://www.archdaily.com/992042/hebei-foreign-language-school-muda-architects',
    'https://www.archdaily.com/988219/early-learning-village-bogle-architects',
    'https://www.archdaily.com/981100/mit-site-4-undergraduate-residence-nadaaa',
    'https://www.archdaily.com/979916/green-school-ibuku'
  ],
  landscape: [
    'https://www.archdaily.com/993995/chongli-winter-olympics-park-sasaki',
    'https://www.archdaily.com/987858/nanning-garden-expo-park-sasaki',
    'https://www.archdaily.com/988011/forest-park-southeast-corktown-common-michael-van-valkenburgh-associates',
    'https://www.archdaily.com/971694/tongzhou-cultural-and-sports-park-crossboundaries',
    'https://www.archdaily.com/968333/gyeongdo-island-skywalk-kim-in-cheurl-plus-cinc-design-group',
    'https://www.archdaily.com/965778/qingshe-bamboo-pavilion-aube-conception'
  ],
  healthcare: [
    'https://www.archdaily.com/986909/nemours-childrens-hospital-stanley-beaman-and-sears-perkins-plus-will',
    'https://www.archdaily.com/977264/suzhou-childrens-hospital-hmd-architects',
    'https://www.archdaily.com/971742/phoenix-central-park-durbach-block-jaggers-plus-john-wardle-architects'
  ]
};

// Materials-specific projects
const MATERIAL_SPECIFIC_URLS: Record<string, string[]> = {
  'Wood': [
    'https://www.archdaily.com/979916/green-school-ibuku',
    'https://www.archdaily.com/965778/qingshe-bamboo-pavilion-aube-conception',
    'https://www.archdaily.com/984996/house-on-the-mountain-gga-architects'
  ],
  'Glass': [
    'https://www.archdaily.com/986950/apple-store-sanlitun-foster-plus-partners',
    'https://www.archdaily.com/991543/house-in-the-garden-jure-kotonik',
    'https://www.archdaily.com/989868/shanghai-planetarium-ennead-architects'
  ],
  'Concrete': [
    'https://www.archdaily.com/990505/jiangsu-grand-theatre-pei-partnership-architects-plus-east-china-architectural-design-and-research-institute',
    'https://www.archdaily.com/962268/shanghai-modern-art-museum-atelier-deshaus',
    'https://www.archdaily.com/973035/the-cubic-house-yakusha-design'
  ],
  'Steel': [
    'https://www.archdaily.com/925062/the-shed-diller-scofidio-plus-renfro',
    'https://www.archdaily.com/992661/apple-tower-theatre-foster-plus-partners',
    'https://www.archdaily.com/968333/gyeongdo-island-skywalk-kim-in-cheurl-plus-cinc-design-group'
  ],
  'Brick': [
    'https://www.archdaily.com/977245/wangshu-bookstore-of-chongqing-zhongshuge-x-studio',
    'https://www.archdaily.com/986684/casa-maria-carlos-garces-arquitectos',
    'https://www.archdaily.com/993534/house-in-parnassus-paper-architects'
  ],
  'Stone': [
    'https://www.archdaily.com/987878/the-odunpazari-modern-museum-kengo-kuma-and-associates',
    'https://www.archdaily.com/989968/house-in-odemira-aires-mateus',
    'https://www.archdaily.com/990230/baan-rai-thaw-house-ars-atelier-de-architectures'
  ]
};

// Location-specific projects
const LOCATION_SPECIFIC_KEYWORDS: Record<string, string[]> = {
  'urban': [
    'https://www.archdaily.com/986950/apple-store-sanlitun-foster-plus-partners',
    'https://www.archdaily.com/990918/shopify-tokyo-office-suppose-design-office',
    'https://www.archdaily.com/925062/the-shed-diller-scofidio-plus-renfro'
  ],
  'rural': [
    'https://www.archdaily.com/995376/a-village-school-complex-rural-development-studio-pu-miao',
    'https://www.archdaily.com/990230/baan-rai-thaw-house-ars-atelier-de-architectures',
    'https://www.archdaily.com/984996/house-on-the-mountain-gga-architects'
  ],
  'coastal': [
    'https://www.archdaily.com/989968/house-in-odemira-aires-mateus',
    'https://www.archdaily.com/968333/gyeongdo-island-skywalk-kim-in-cheurl-plus-cinc-design-group',
    'https://www.archdaily.com/981100/mit-site-4-undergraduate-residence-nadaaa'
  ],
  'mountain': [
    'https://www.archdaily.com/984996/house-on-the-mountain-gga-architects',
    'https://www.archdaily.com/993995/chongli-winter-olympics-park-sasaki',
    'https://www.archdaily.com/991543/house-in-the-garden-jure-kotonik'
  ]
};

// Materials mappings for improved search
const MATERIALS_KEYWORDS: Record<string, string[]> = {
  'wood': ['wood', 'timber', 'wooden', 'plywood'],
  'concrete': ['concrete', 'cement', 'precast'],
  'steel': ['steel', 'metal', 'aluminum', 'iron'],
  'glass': ['glass', 'glazing', 'transparent', 'curtain wall'],
  'brick': ['brick', 'masonry', 'terracotta'],
  'stone': ['stone', 'marble', 'granite', 'limestone'],
};

// Define the shape of search parameters
interface SearchParams {
  projectType?: string;
  location?: string;
  materials?: string[];
  size?: string;
  keywords?: string;
}

export async function scrapeArchDaily(searchParams: SearchParams): Promise<CaseStudy[]> {
  // Create cache key from search parameters
  const cacheKey = JSON.stringify(searchParams);
  
  // Add timestamp to logs
  const logPrefix = `[${new Date().toISOString()}]`;
  
  console.log(`${logPrefix} Starting scrape with params:`, JSON.stringify(searchParams, null, 2));
  
  // Check cache first, but bypass cache when testing
  const cachedResult = resultCache[cacheKey];
  const shouldUseCacheResult = process.env.NODE_ENV !== 'development' && 
                              cachedResult && 
                              (Date.now() - cachedResult.timestamp) < CACHE_TTL;
  
  if (shouldUseCacheResult) {
    console.log(`${logPrefix} Using cached results for query:`, searchParams);
    return cachedResult.data;
  }
  
  try {
    console.log(`${logPrefix} Cache bypassed or not found. Starting fresh scrape.`);
    
    // Initialize scraper
    const scraper = new ArchDailyScraper();
    
    // Select URLs based on search parameters
    let candidateUrls: string[] = [];
    const { projectType, location, materials, size, keywords } = searchParams;
    
    // 1. First collect URLs based on project type
    if (projectType && typeof projectType === 'string' && projectType in PROJECT_URLS) {
      candidateUrls = [...PROJECT_URLS[projectType]];
      console.log(`${logPrefix} Selected ${candidateUrls.length} URLs based on project type: ${projectType}`);
    } else {
      // Get a sampling from all categories if no specific type
      Object.entries(PROJECT_URLS).forEach(([type, urls]) => {
        console.log(`${logPrefix} Adding sample URLs from category: ${type}`);
        candidateUrls.push(...urls.slice(0, 2)); // Take 2 from each category
      });
    }
    
    // 2. Add material-specific URLs if materials are specified
    if (materials && Array.isArray(materials) && materials.length > 0) {
      console.log(`${logPrefix} Adding URLs for materials: ${materials.join(', ')}`);
      materials.forEach(material => {
        if (material in MATERIAL_SPECIFIC_URLS) {
          const urls = MATERIAL_SPECIFIC_URLS[material];
          console.log(`${logPrefix} Added ${urls.length} URLs for material: ${material}`);
          candidateUrls.push(...urls);
        } else {
          console.log(`${logPrefix} No specific URLs found for material: ${material}`);
        }
      });
    }
    
    // 3. Add location-specific URLs if location is specified
    if (location && typeof location === 'string') {
      const locationLower = location.toLowerCase();
      console.log(`${logPrefix} Looking for location-specific URLs for: ${location}`);
      Object.entries(LOCATION_SPECIFIC_KEYWORDS).forEach(([key, urls]) => {
        if (locationLower.includes(key)) {
          console.log(`${logPrefix} Added ${urls.length} URLs for location type: ${key}`);
          candidateUrls.push(...urls);
        }
      });
    }
    
    // Remove duplicates by converting to Set and back
    const originalLength = candidateUrls.length;
    candidateUrls = Array.from(new Set(candidateUrls));
    console.log(`${logPrefix} Removed ${originalLength - candidateUrls.length} duplicate URLs`);
    
    console.log(`${logPrefix} Selected ${candidateUrls.length} candidate URLs based on search parameters`);
    
    // Randomize to provide varied results and limit to a reasonable number for performance
    let urlsToScrape = shuffleArray(candidateUrls);
    
    // But prioritize URLs that match the criteria more closely
    if (projectType || materials?.length || location) {
      urlsToScrape = urlsToScrape.slice(0, 5); // Scrape fewer URLs for better performance during testing
      console.log(`${logPrefix} Limiting to 5 URLs for specific search criteria`);
    } else {
      urlsToScrape = urlsToScrape.slice(0, 3); // Default number of URLs to scrape during testing
      console.log(`${logPrefix} Using default limit of 3 URLs`);
    }
    
    console.log(`${logPrefix} Will scrape ${urlsToScrape.length} URLs: ${urlsToScrape.join(', ')}`);
    
    // Scrape each project in parallel
    console.log(`${logPrefix} Starting parallel scraping of URLs`);
    const scrapeStartTime = Date.now();
    const results = await Promise.all(
      urlsToScrape.map(async (url) => {
        try {
          console.log(`${logPrefix} Scraping project: ${url}`);
          const startTime = Date.now();
          const result = await scraper.scrapeProjectPage(url);
          const endTime = Date.now();
          console.log(`${logPrefix} Successfully scraped ${url} in ${endTime - startTime}ms`);
          return result;
        } catch (error) {
          console.error(`${logPrefix} Error scraping ${url}:`, error);
          return null;
        }
      })
    );
    const scrapeEndTime = Date.now();
    console.log(`${logPrefix} Completed scraping in ${scrapeEndTime - scrapeStartTime}ms`);
    
    // Filter out failed scrapes
    let validResults = results.filter(Boolean) as CaseStudy[];
    console.log(`${logPrefix} Got ${validResults.length} valid results out of ${results.length} attempts`);
    
    // Apply additional filters based on search parameters
    if (validResults.length > 0) {
      // Filter by materials
      if (materials && Array.isArray(materials) && materials.length > 0) {
        const beforeCount = validResults.length;
        validResults = validResults.filter(study => {
          return materials.some((material: string) => {
            // Check if the material exists in the study's metadata
            if (study.metadata.materials && study.metadata.materials.some(m => 
              m.toLowerCase() === material.toLowerCase()
            )) {
              return true;
            }
            
            // Check if material keyword exists in description
            const materialKeywords = material.toLowerCase() in MATERIALS_KEYWORDS 
              ? MATERIALS_KEYWORDS[material.toLowerCase()] 
              : [material.toLowerCase()];
            
            return study.description && materialKeywords.some((keyword: string) => 
              study.description!.toLowerCase().includes(keyword)
            );
          });
        });
        console.log(`${logPrefix} Filtered from ${beforeCount} to ${validResults.length} results after materials filter`);
      }
      
      // Filter by location
      if (location && typeof location === 'string' && location.trim() !== '') {
        const locationLower = location.toLowerCase();
        validResults = validResults.filter(study => 
          (study.location && study.location.toLowerCase().includes(locationLower)) ||
          (study.description && study.description.toLowerCase().includes(locationLower))
        );
        console.log(`${logPrefix} Filtered to ${validResults.length} results after location filter`);
      }
      
      // Filter by keywords
      if (keywords && typeof keywords === 'string' && keywords.trim() !== '') {
        const keywordsArray = keywords.toLowerCase().split(/\s+/);
        validResults = validResults.filter(study => {
          const text = `${study.title} ${study.description || ''} ${study.architect || ''}`.toLowerCase();
          return keywordsArray.some((keyword: string) => text.includes(keyword));
        });
        console.log(`${logPrefix} Filtered to ${validResults.length} results after keywords filter`);
      }
      
      // Filter by size
      if (size && typeof size === 'string' && size.trim() !== '') {
        validResults = filterBySize(validResults, size);
        console.log(`${logPrefix} Filtered to ${validResults.length} results after size filter`);
      }
    }
    
    // Cache results, but only if we have valid results to cache
    if (validResults.length > 0) {
      console.log(`${logPrefix} Caching ${validResults.length} results`);
      resultCache[cacheKey] = {
        timestamp: Date.now(),
        data: validResults
      };
    } else {
      console.log(`${logPrefix} No valid results to cache`);
    }
    
    console.log(`${logPrefix} Successfully scraped ${validResults.length} projects`);
    // Write results to a debug file for inspection
    if (process.env.NODE_ENV === 'development') {
      try {
        const fs = require('fs');
        fs.writeFileSync('./logs/scrape-results.json', JSON.stringify(validResults, null, 2));
        console.log(`${logPrefix} Wrote debug results to logs/scrape-results.json`);
      } catch (error) {
        console.error(`${logPrefix} Error writing debug file:`, error);
      }
    }
    
    return validResults;
  } catch (error) {
    console.error(`${logPrefix} Fatal error in scrapeArchDaily:`, error);
    // Return empty array on error rather than throwing
    return [];
  }
}

// Helper function to filter by size
function filterBySize(studies: CaseStudy[], sizeFilter: string): CaseStudy[] {
  switch(sizeFilter) {
    case 'small':
      return studies.filter(study => study.metadata.area !== undefined && study.metadata.area <= 1000);
    case 'medium':
      return studies.filter(study => study.metadata.area !== undefined && study.metadata.area > 1000 && study.metadata.area <= 5000);
    case 'large':
      return studies.filter(study => study.metadata.area !== undefined && study.metadata.area > 5000 && study.metadata.area <= 20000);
    case 'xlarge':
      return studies.filter(study => study.metadata.area !== undefined && study.metadata.area > 20000);
    default:
      return studies;
  }
}

// Helper function to shuffle an array (Fisher-Yates algorithm)
function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
} 