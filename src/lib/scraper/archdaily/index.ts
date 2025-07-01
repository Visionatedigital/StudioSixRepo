import puppeteer, { Browser } from 'puppeteer';
import * as cheerio from 'cheerio';
import { CaseStudy, BaseScraper } from '../base';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';

export class ArchDailyScraper extends BaseScraper {
  protected source = 'ArchDaily';
  protected baseUrl = 'https://www.archdaily.com';
  private browser: Browser | null = null;
  private debugMode: boolean = process.env.NODE_ENV === 'development';
  private logPrefix = `[ArchDailyScraper]`;
  
  private async getBrowser(): Promise<Browser> {
    if (!this.browser) {
      this.log('Launching Puppeteer browser...');
      try {
        this.browser = await puppeteer.launch({
          headless: true,
          args: [
            '--no-sandbox', 
            '--disable-setuid-sandbox', 
            '--disable-dev-shm-usage',
            '--single-process',
            '--no-zygote'
          ],
          timeout: 60000 // Increase timeout to 60 seconds
        });
        this.log('Puppeteer browser launched successfully');
      } catch (error) {
        this.log(`Error launching browser: ${error}`);
        throw error;
      }
    }
    return this.browser;
  }
  
  public async close(): Promise<void> {
    if (this.browser) {
      this.log('Closing Puppeteer browser...');
      await this.browser.close();
      this.browser = null;
      this.log('Puppeteer browser closed');
    }
  }
  
  private log(message: string, data?: any): void {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${this.logPrefix} ${message}`;
    console.log(logMessage, data !== undefined ? data : '');
    
    if (this.debugMode) {
      try {
        // Make sure the logs directory exists
        if (!fs.existsSync('./logs')) {
          fs.mkdirSync('./logs', { recursive: true });
        }
        // Append to log file
        fs.appendFileSync('./logs/archdaily-scraper.log', 
          `${logMessage} ${data !== undefined ? JSON.stringify(data) : ''}\n`);
      } catch (error) {
        console.error('Error writing to log file:', error);
      }
    }
  }
  
  private logError(message: string, error: any): void {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] ${this.logPrefix} ERROR: ${message}`, error);
    
    if (this.debugMode) {
      try {
        // Make sure the logs directory exists
        if (!fs.existsSync('./logs')) {
          fs.mkdirSync('./logs', { recursive: true });
        }
        // Append to error log file
        fs.appendFileSync('./logs/archdaily-scraper-errors.log', 
          `[${timestamp}] ERROR: ${message}\n${error?.stack || JSON.stringify(error)}\n\n`);
      } catch (logError) {
        console.error('Error writing to error log file:', logError);
      }
    }
  }
  
  /**
   * Scrapes a specific ArchDaily project page
   */
  public async scrapeProjectPage(url: string): Promise<CaseStudy> {
    this.log(`Starting to scrape ${url}`);
    
    try {
      // 1. Launch browser and navigate to page
      const browser = await this.getBrowser();
      const page = await browser.newPage();
      
      // Set a reasonable timeout and user agent
      await page.setDefaultNavigationTimeout(45000); // 45 seconds
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
      
      // Add error handlers
      page.on('error', error => {
        this.logError(`Page error on ${url}`, error);
      });
      
      page.on('console', msg => {
        const type = msg.type();
        if (type === 'error' || type === 'warning') {
          this.log(`Console ${type}: ${msg.text()}`);
        }
      });
      
      this.log(`Navigating to ${url}...`);
      const navigationStart = Date.now();
      
      try {
        await page.goto(url, { 
          waitUntil: 'networkidle2',
          timeout: 45000 // 45 seconds
        });
        this.log(`Navigation completed in ${Date.now() - navigationStart}ms`);
      } catch (navigationError) {
        this.logError(`Navigation failed for ${url}`, navigationError);
        
        // Try one more time with a simple load strategy
        this.log(`Retrying with simpler load strategy for ${url}`);
        try {
      await page.goto(url, { 
        waitUntil: 'domcontentloaded',
            timeout: 30000
          });
          this.log(`Retry navigation succeeded`);
        } catch (retryError) {
          this.logError(`Retry navigation also failed for ${url}`, retryError);
          throw retryError;
        }
      }
      
      // 2. Get the page HTML content
      this.log(`Getting HTML content from ${url}`);
      const content = await page.content();
      
      // Save HTML for debugging
      if (this.debugMode) {
        const urlHash = Buffer.from(url).toString('base64').substring(0, 10);
        fs.writeFileSync(`./logs/page-${urlHash}.html`, content);
        this.log(`Saved HTML to logs/page-${urlHash}.html`);
      }
      
      await page.close();
      this.log(`Page closed for ${url}`);
      
      // 3. Parse the HTML with Cheerio
      this.log(`Parsing HTML with Cheerio for ${url}`);
      const $ = cheerio.load(content);
      
      // 4. Extract project data
      this.log(`Extracting project data for ${url}`);
      
      // Extract project data - using fallbacks for each in case the page structure varies
      const title = $('.afd-title h1').text().trim() || 
                   $('h1.gallery-title').text().trim() || 
                   $('h1').first().text().trim() || 
                   'Unknown Project';
                   
      this.log(`Scraped project title: ${title}`);
      
      const architect = $('.afd-title h3 a').first().text().trim() || 
                       $('.specs-wrapper .specs-module:contains("Architects") .specs-value').text().trim() ||
                       $('a[href*="/office/"]').first().text().trim() ||
                       'Unknown Architect';
      
      this.log(`Scraped architect: ${architect}`);
      
      // Extract project metadata
      const yearText = $('.specs-wrapper .specs-module:contains("Year") .specs-value').text().trim() ||
                      $('.project-year').text().trim() ||
                      '';
      const year = parseInt(yearText) || new Date().getFullYear();
      
      const areaText = $('.specs-wrapper .specs-module:contains("Area") .specs-value').text().trim() ||
                      $('.project-area').text().trim() ||
                      '0';
      const area = parseInt(areaText.replace(/[^0-9]/g, '')) || 0;
      
      const location = $('.specs-wrapper .specs-module:contains("Location") .specs-value').text().trim() ||
                      $('.project-location').text().trim() ||
                      'Unknown Location';
      
      // Get project description
      const description = $('.content-single p').first().text().trim() || 
                         $('.js-content p').first().text().trim() ||
                         $('article p').first().text().trim() ||
                         'No description available for this architectural project.';
      
      this.log(`Extracted metadata: year=${year}, area=${area}, location=${location.substring(0, 30)}...`);
      
      // 5. Get project images
      this.log(`Extracting images for ${url}`);
      
      const images: string[] = [];
      const floorPlanUrls: string[] = [];
      const sectionUrls: string[] = [];
      const renderUrls: string[] = [];
      
      // First try to look for specific image categories
      $('.gallery-thumbs img').each((_, img) => {
        const src = $(img).attr('src');
        const parent = $(img).parent();
        const caption = parent.attr('data-caption') || parent.text() || '';
        const altText = $(img).attr('alt') || '';
        const fullText = (caption + ' ' + altText).toLowerCase();
        
        if (src) {
          // Clean up the URL if needed
          const fullSrc = src.includes('https:') ? src : (src.startsWith('//') ? 'https:' + src : src);
          
          // Categorize based on caption or alt text
          if (fullText.includes('plan') || fullText.includes('floor') || fullText.includes('planta')) {
            floorPlanUrls.push(fullSrc);
          } else if (fullText.includes('section') || fullText.includes('corte') || fullText.includes('seccion')) {
            sectionUrls.push(fullSrc);
          } else if (fullText.includes('render') || fullText.includes('visualization') || fullText.includes('3d')) {
            renderUrls.push(fullSrc);
          } else {
            // Add to generic images array
            images.push(fullSrc);
          }
        }
      });
      
      this.log(`Found images: ${images.length} general, ${floorPlanUrls.length} floor plans, ${sectionUrls.length} sections, ${renderUrls.length} renders`);
      
      // Fallback: if no specific categories found, try to guess from general images
      if (floorPlanUrls.length === 0 && sectionUrls.length === 0) {
        this.log(`No categorized images found. Looking for general images.`);
        $('img').each((_, img) => {
          const src = $(img).attr('src');
          if (src && (src.includes('images.adsttc.com') || src.includes('archdaily'))) {
            const fullSrc = src.includes('https:') ? src : (src.startsWith('//') ? 'https:' + src : src);
            
            // If not already in images array, add it
            if (!images.includes(fullSrc)) {
              images.push(fullSrc);
            }
          }
        });
        this.log(`Found ${images.length} general images after fallback search`);
      }
      
      // Select main image - prefer large images
      const mainImageCandidates = $('.gallery-main img').map((_, img) => $(img).attr('src')).get();
      let mainImageUrl = 
        (mainImageCandidates.length > 0 ? mainImageCandidates[0] : null) || 
        images[0] || 
        '/images/case-studies/placeholder-main.jpg';
      
      // Ensure main image URL is properly formatted
      if (mainImageUrl && !mainImageUrl.includes('http') && mainImageUrl.startsWith('//')) {
        mainImageUrl = 'https:' + mainImageUrl;
      }
      
      this.log(`Selected main image: ${mainImageUrl}`);
      
      // If we still don't have floor plans or sections, try to identify them from regular images
      if (floorPlanUrls.length === 0) {
        this.log(`No floor plans found. Attempting to identify from general images.`);
        // Look for images that might be floor plans (often more horizontal, with lines/diagrams)
        for (let i = 0; i < Math.min(images.length, 10); i++) {
          if (images[i] && 
              (images[i].includes('plan') || images[i].includes('floor') || 
               images[i].includes('planta') || images[i].includes('diagram'))) {
            floorPlanUrls.push(images[i]);
            // Remove from regular images to avoid duplication
            images.splice(i, 1);
            i--;
          }
        }
        this.log(`Identified ${floorPlanUrls.length} potential floor plans from URLs`);
      }
      
      if (sectionUrls.length === 0) {
        this.log(`No sections found. Attempting to identify from general images.`);
        // Look for images that might be sections
        for (let i = 0; i < Math.min(images.length, 10); i++) {
          if (images[i] && 
              (images[i].includes('section') || images[i].includes('corte') || 
               images[i].includes('seccion') || images[i].includes('elevation'))) {
            sectionUrls.push(images[i]);
            // Remove from regular images to avoid duplication
            images.splice(i, 1);
            i--;
          }
        }
        this.log(`Identified ${sectionUrls.length} potential sections from URLs`);
      }
      
      // If we STILL don't have floor plans or sections, just use some of the regular images
      if (floorPlanUrls.length === 0 && images.length > 0) {
        this.log(`Still no floor plans. Using ${Math.min(2, images.length)} general images as floor plans.`);
        // Use some additional images as floor plans
        floorPlanUrls.push(...images.slice(1, 3));
      }
      
      if (sectionUrls.length === 0 && images.length > 0) {
        this.log(`Still no sections. Using ${Math.min(2, images.length)} general images as sections.`);
        // Use some additional images as sections
        sectionUrls.push(...images.slice(3, 5));
      }
      
      // Get additional renders if we have them
      if (renderUrls.length === 0 && images.length > 0) {
        this.log(`No renders. Using ${Math.min(2, images.length)} general images as renders.`);
        renderUrls.push(...images.slice(5, 7));
      }
      
      // Ensure all URLs are absolute and properly formatted
      const correctImageUrl = (url: string): string => {
        if (!url) return url;
        return url.startsWith('//') ? 'https:' + url : url;
      };
      
      const correctedFloorPlans = floorPlanUrls.map(correctImageUrl);
      const correctedSections = sectionUrls.map(correctImageUrl);
      const correctedRenders = renderUrls.map(correctImageUrl);
      
      // 6. Determine project typology based on keywords in title and description
      const typology = this.determineTypology(title, description);
      this.log(`Determined typology: ${typology}`);
      
      // 7. Generate unique ID
      const id = `archdaily-${uuidv4().slice(0, 8)}`;
      
      // 8. Gather materials from description
      const materialsList = this.extractMaterialsFromText(description);
      this.log(`Extracted materials: ${materialsList.join(', ')}`);
      
      // 9. Create and return the case study object
      const caseStudy = {
        id,
        title,
        description,
        architect,
        year: typeof year === 'string' ? parseInt(year, 10) : year,
        location,
        typology,
        source: 'archdaily',
        sourceUrl: url,
        images: {
          main: mainImageUrl,
          floorPlans: correctedFloorPlans,
          sections: correctedSections,
          renders: correctedRenders,
          details: []
        },
        metadata: {
          area: area,
          client: 'Unknown Client',
          materials: materialsList,
          sustainability: this.extractSustainabilityFeatures(description),
          awards: []
        },
        characteristics: {
          keyFeatures: this.extractKeyFeatures(description),
          siteConstraints: [],
          programmaticRequirements: [],
          designChallenges: [],
          spatialOrganization: this.extractSpatialOrganization(description),
          area: area,
          location
        }
      };
      
      this.log(`Successfully created case study object for ${url}`);
      
      // Save the case study object for debugging
      if (this.debugMode) {
        fs.writeFileSync(`./logs/case-study-${id}.json`, JSON.stringify(caseStudy, null, 2));
        this.log(`Saved case study to logs/case-study-${id}.json`);
      }
      
      return caseStudy;
    } catch (error) {
      this.logError(`Error scraping project ${url}`, error);
      
      // Return a placeholder case study instead of throwing
      return {
        id: `error-${uuidv4().slice(0, 8)}`,
        title: 'Error Loading Project',
        description: `We encountered an error while trying to load this project. The original URL was: ${url}`,
        architect: 'Unknown',
        year: new Date().getFullYear(),
        location: 'Unknown',
        typology: 'unknown',
        source: 'archdaily',
        sourceUrl: url,
        images: {
          main: '/images/case-studies/error-placeholder.jpg',
          floorPlans: [],
          sections: [],
          renders: [],
          details: []
        },
        metadata: {
          area: 0,
          client: 'Unknown',
          materials: [],
          sustainability: [],
          awards: []
        },
        characteristics: {
          keyFeatures: [],
          siteConstraints: [],
          programmaticRequirements: [],
          designChallenges: [],
          spatialOrganization: '',
          area: 0,
          location: 'Unknown'
        }
      };
    }
  }
  
  private determineTypology(title: string, description: string): string {
    const text = `${title} ${description}`.toLowerCase();
    
    if (text.includes('house') || text.includes('home') || text.includes('residential') || 
        text.includes('villa') || text.includes('apartment')) {
      return 'residential';
    }
    
    if (text.includes('office') || text.includes('workspace') || text.includes('commercial') || 
        text.includes('retail') || text.includes('store')) {
      return 'commercial';
    }
    
    if (text.includes('museum') || text.includes('gallery') || text.includes('cultural') || 
        text.includes('theatre') || text.includes('theater')) {
      return 'cultural';
    }
    
    if (text.includes('school') || text.includes('university') || text.includes('college') || 
        text.includes('campus') || text.includes('education')) {
      return 'educational';
    }
    
    if (text.includes('hospital') || text.includes('clinic') || text.includes('healthcare') || 
        text.includes('medical')) {
      return 'healthcare';
    }
    
    if (text.includes('park') || text.includes('garden') || text.includes('landscape') || 
        text.includes('urban design')) {
      return 'landscape';
    }
    
    return 'other';
  }
  
  private extractMaterialsFromText(text: string): string[] {
    const materials = [
      'concrete', 'wood', 'glass', 'steel', 'brick', 'stone', 'timber', 
      'ceramic', 'aluminum', 'copper', 'marble', 'granite', 'metal',
      'plaster', 'ceramic tiles', 'porcelain', 'terrazzo'
    ];
    
    return materials.filter(material => 
      text.toLowerCase().includes(material.toLowerCase())
    );
  }
  
  private extractSustainabilityFeatures(text: string): string[] {
    const features: string[] = [];
    const text_lower = text.toLowerCase();
    
    if (text_lower.includes('solar') || text_lower.includes('photovoltaic')) {
      features.push('Solar Power');
    }
    
    if (text_lower.includes('rainwater') || text_lower.includes('water collection')) {
      features.push('Rainwater Collection');
    }
    
    if (text_lower.includes('geothermal')) {
      features.push('Geothermal Energy');
    }
    
    if (text_lower.includes('passive') && 
        (text_lower.includes('cooling') || text_lower.includes('heating') || text_lower.includes('design'))) {
      features.push('Passive Design');
    }
    
    if (text_lower.includes('sustainable') || text_lower.includes('eco-friendly') || 
        text_lower.includes('green building')) {
      features.push('Sustainable Design');
    }
    
    return features;
  }
  
  private extractKeyFeatures(text: string): string[] {
    const features: string[] = [];
    const text_lower = text.toLowerCase();
    
    // Extract potential key features based on common architectural elements
    if (text_lower.includes('courtyard')) features.push('Courtyard');
    if (text_lower.includes('open plan')) features.push('Open Plan');
    if (text_lower.includes('terrace') || text_lower.includes('balcony')) features.push('Outdoor Space');
    if (text_lower.includes('natural light') || text_lower.includes('daylighting')) features.push('Natural Light');
    if (text_lower.includes('skylight')) features.push('Skylights');
    if (text_lower.includes('minimalist') || text_lower.includes('minimal')) features.push('Minimalist Design');
    if (text_lower.includes('sustainable') || text_lower.includes('green')) features.push('Sustainable Design');
    if (text_lower.includes('modular')) features.push('Modular Construction');
    if (text_lower.includes('flexible space')) features.push('Flexible Spaces');
    if (text_lower.includes('double height') || text_lower.includes('high ceiling')) features.push('Double-Height Spaces');
    
    return features;
  }
  
  private extractSpatialOrganization(text: string): string {
    if (text.toLowerCase().includes('linear organization')) return 'Linear Organization';
    if (text.toLowerCase().includes('central courtyard')) return 'Central Courtyard';
    if (text.toLowerCase().includes('radial')) return 'Radial Organization';
    if (text.toLowerCase().includes('cluster')) return 'Clustered Organization';
    if (text.toLowerCase().includes('grid')) return 'Grid-Based Organization';
    if (text.toLowerCase().includes('open plan')) return 'Open Plan';
    
    return 'Standard Layout';
  }

  /**
   * Scrapes a list of project URLs from ArchDaily
   */
  public async scrapeProjectList(page: number = 1): Promise<string[]> {
    this.log(`Scraping project list from page ${page}`);
    
    try {
      const browser = await this.getBrowser();
      const pageInstance = await browser.newPage();
      
      await pageInstance.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
      
      const url = `${this.baseUrl}/search/projects?page=${page}`;
      this.log(`Navigating to ${url}`);
      
      await pageInstance.goto(url, { 
        waitUntil: 'networkidle2',
        timeout: 30000 
      });
      
      const content = await pageInstance.content();
      await pageInstance.close();
      
      const $ = cheerio.load(content);
      const projectUrls: string[] = [];
      
      // Extract project URLs from the search results
      $('article a[href*="/"]').each((_, element) => {
        const href = $(element).attr('href');
        if (href && href.includes('/project/') && !href.includes('?')) {
          const fullUrl = href.startsWith('http') ? href : `${this.baseUrl}${href}`;
          if (!projectUrls.includes(fullUrl)) {
            projectUrls.push(fullUrl);
          }
        }
      });
      
      this.log(`Found ${projectUrls.length} project URLs on page ${page}`);
      return projectUrls;
      
    } catch (error) {
      this.logError(`Error scraping project list from page ${page}`, error);
      return []; // Return empty array instead of throwing
    }
  }
} 