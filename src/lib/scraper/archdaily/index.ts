import { Browser, Page } from 'puppeteer';
import { load } from 'cheerio';
import fs from 'fs';
import path from 'path';
import { BaseScraper, CaseStudy } from '../base';

interface ImageData {
  url: string;
  caption: string;
  type: string;
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class ArchDailyScraper extends BaseScraper {
  protected source = 'archdaily';
  protected baseUrl = 'https://www.archdaily.com';

  async scrapeProjectPage(url: string): Promise<CaseStudy> {
    let browser: Browser | null = null;
    
    try {
      browser = await import('puppeteer').then(puppeteer => puppeteer.launch({ 
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--disable-gpu',
          '--window-size=1920,1080'
        ],
        defaultViewport: {
          width: 1920,
          height: 1080
        }
      }));
      if (!browser) throw new Error('Failed to launch browser');
      
      const page = await browser.newPage();
      await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');
      
      // Set extra headers
      await page.setExtraHTTPHeaders({
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Referer': 'https://www.archdaily.com/'
      });

      // Block unnecessary resources
      await page.setRequestInterception(true);
      page.on('request', (request) => {
        const resourceType = request.resourceType();
        if (resourceType === 'image' || resourceType === 'stylesheet' || resourceType === 'font' || resourceType === 'media') {
          request.abort();
        } else {
          request.continue();
        }
      });

      await page.goto(url, { 
        waitUntil: 'domcontentloaded',
        timeout: 60000 // 60 seconds timeout
      });

      // Wait for content to load
      await page.waitForSelector('h1', { timeout: 30000 });
      
      const content = await page.content();
      const $ = load(content);

      // Save HTML for inspection
      await this.saveHtmlForInspection('project-page.html', content);

      // Extract title - try multiple selectors
      const title = $('h1.afd-title').text().trim() || 
                   $('h1[data-test="article-title"]').text().trim() ||
                   $('h1').first().text().trim();

      // Extract description - combine multiple paragraphs
      const description = $('.afd-content__description').text().trim() || 
                         $('.js-content-description').text().trim() ||
                         $('.afd-content p').map((_, el) => $(el).text().trim()).get().join('\n\n');

      // Extract architect - try multiple selectors and formats
      const architect = $('.afd-specs__architects .afd-specs__value').text().trim() ||
                       $('[data-test="architects"] .afd-specs__value').text().trim() ||
                       $('a[href*="/office/"]').first().text().trim();

      // Extract year - try multiple selectors and formats
      const yearText = $('.afd-specs__year .afd-specs__value').text().trim() ||
                      $('[data-test="year"] .afd-specs__value').text().trim() ||
                      $('time').first().text().trim();
      const year = parseInt(yearText) || undefined;

      // Extract location - try multiple selectors and formats
      const location = $('.afd-specs__location .afd-specs__value').text().trim() ||
                      $('[data-test="location"] .afd-specs__value').text().trim() ||
                      $('.afd-content__location').text().trim() ||
                      undefined;

      // Extract typology - try multiple selectors and formats
      const typology = $('.afd-specs__typology .afd-specs__value').text().trim() ||
                      $('[data-test="typology"] .afd-specs__value').text().trim() ||
                      $('.afd-content__typology').text().trim() ||
                      this.inferTypology($) ||
                      undefined;

      // Extract images with better categorization
      const images = await page.evaluate(() => {
        // Get all possible image elements
        const imgs = [
          ...Array.from(document.querySelectorAll('img[data-nr-picture-id]')),
          ...Array.from(document.querySelectorAll('img.js-image')),
          ...Array.from(document.querySelectorAll('.afd-image-container img')),
          ...Array.from(document.querySelectorAll('.afd-gallery__image img')),
          ...Array.from(document.querySelectorAll('.afd-main-image img')),
          ...Array.from(document.querySelectorAll('figure img'))
        ];

        return Array.from(new Set(imgs)).map(img => {
          // Get all possible URL sources
          const url = img.getAttribute('src') || 
                      img.getAttribute('data-src') || 
                      img.getAttribute('data-original') ||
                      img.getAttribute('data-lazy-src') ||
                      '';

          // Get all possible captions
          const caption = img.getAttribute('alt') || 
                         img.getAttribute('title') || 
                         img.getAttribute('data-caption') ||
                         img.closest('figure')?.querySelector('figcaption')?.textContent ||
                         '';

          // Get parent elements' text for additional context
          const parentText = img.closest('figure')?.textContent || 
                            img.parentElement?.textContent || 
                            '';

          return {
            url: url.replace(/\?.*$/, ''), // Remove query parameters
            caption: caption.trim(),
            parentText: parentText.trim(),
            type: 'photo'
          };
        }).filter(img => img.url && !img.url.includes('placeholder') && !img.url.includes('loading'));
      });

      // Categorize images with improved logic
      const categorizedImages = images.map((img: ImageData & { parentText?: string }) => ({
        ...img,
        type: this.categorizeImage(img.caption + ' ' + (img.parentText || ''), img.url)
      }));

      // Extract metadata with improved selectors
      const metadata = {
        area: this.extractAreaAsNumber($),
        client: this.extractClient($),
        materials: this.extractMaterials($),
        sustainability: this.extractSustainability($),
        awards: this.extractAwards($)
      };

      // Extract characteristics with improved selectors
      const characteristics = {
        keyFeatures: this.extractKeyFeatures($),
        siteConstraints: this.extractSiteConstraints($),
        programmaticRequirements: this.extractProgrammaticRequirements($),
        designChallenges: this.extractDesignChallenges($),
        spatialOrganization: this.extractSpatialOrganization($),
        area: metadata.area || 0,
        location: location || ''
      };

      await browser.close();

      const id = url.split('/').pop() || Date.now().toString();
      return {
        id,
        title,
        description,
        architect,
        year,
        location,
        typology,
        source: this.source,
        sourceUrl: url,
        images: {
          main: categorizedImages[0]?.url || '',
          floorPlans: categorizedImages.filter(img => img.type === 'floorplan').map(img => img.url),
          renders: categorizedImages.filter(img => img.type === 'render').map(img => img.url),
          sections: categorizedImages.filter(img => img.type === 'section').map(img => img.url),
          details: categorizedImages.filter(img => img.type === 'detail').map(img => img.url)
        },
        metadata,
        characteristics
      };
    } catch (error) {
      console.error(`Error scraping project page ${url}:`, error);
      if (browser) await browser.close();
      throw error;
    }
  }

  async scrapeProjectList(): Promise<string[]> {
    let browser: Browser | null = null;
    const projectUrls: string[] = [];
    
    try {
      browser = await import('puppeteer').then(puppeteer => puppeteer.launch({ 
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--disable-gpu',
          '--window-size=1920,1080'
        ],
        defaultViewport: {
          width: 1920,
          height: 1080
        }
      }));
      if (!browser) throw new Error('Failed to launch browser');

      // Scrape first 10 pages
      for (let i = 1; i <= 10; i++) {
        try {
          // Create a new page for each request
          const page = await browser.newPage();
          
          await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');

          // Set extra headers
          await page.setExtraHTTPHeaders({
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
            'Referer': 'https://www.archdaily.com/'
          });

          // Block unnecessary resources
          await page.setRequestInterception(true);
          page.on('request', (request) => {
            const resourceType = request.resourceType();
            if (resourceType === 'image' || resourceType === 'stylesheet' || resourceType === 'font' || resourceType === 'media') {
              request.abort();
            } else {
              request.continue();
            }
          });

          const url = `${this.baseUrl}/projects?page=${i}`;
          console.log(`Navigating to ${url}...`);
          
          await page.goto(url, { 
            waitUntil: 'domcontentloaded',
            timeout: 60000 // 60 seconds timeout
          });
          
          // Wait for content to load
          await page.waitForSelector('.afd-post-stream', { timeout: 30000 });
          
          // Log the page content for debugging
          const content = await page.content();
          console.log('Page content length:', content.length);
          
          // Save HTML for inspection
          await this.saveHtmlForInspection(`archdaily-page-${i}.html`, content);
          
          // Extract project URLs from article elements
          const urls = await page.evaluate(() => {
            const articles = document.querySelectorAll('.afd-post-stream');
            return Array.from(articles).map(article => {
              const titleLink = article.querySelector('h3 a');
              return titleLink ? titleLink.getAttribute('href') : null;
            }).filter(url => url && !url.includes('utm_'));
          }) as string[];
          
          if (urls.length === 0) {
            console.log('No project URLs found on page, trying next page...');
            await page.close();
            continue;
          }
          
          // Convert relative URLs to absolute URLs
          const absoluteUrls = urls.map(url => {
            if (url.startsWith('/')) {
              return `${this.baseUrl}${url}`;
            }
            return url;
          });
          
          console.log(`Found ${absoluteUrls.length} project URLs on page ${i}`);
          projectUrls.push(...absoluteUrls);
          
          // Close the page
          await page.close();
          
          // Add a delay between requests
          await delay(5000); // 5 second delay
        } catch (error) {
          console.error(`Error scraping page ${i}:`, error);
          // Continue with next page even if this one fails
          continue;
        }
      }

      await browser.close();
      return Array.from(new Set(projectUrls)); // Remove duplicates
    } catch (error) {
      console.error('Error scraping project list:', error);
      if (browser) await browser.close();
      throw error;
    }
  }

  private async saveHtmlForInspection(filename: string, content: string): Promise<void> {
    const debugDir = path.join(process.cwd(), 'debug');
    if (!fs.existsSync(debugDir)) {
      fs.mkdirSync(debugDir);
    }
    fs.writeFileSync(path.join(debugDir, filename), content);
  }

  private inferTypology($: ReturnType<typeof load>): string | undefined {
    // Try to infer typology from title and content
    const text = $('body').text().toLowerCase();
    const types = [
      'school', 'residential', 'office', 'museum', 'library', 'hospital',
      'hotel', 'restaurant', 'retail', 'sports', 'cultural', 'religious',
      'industrial', 'mixed-use', 'public space', 'landscape'
    ];
    
    for (const type of types) {
      if (text.includes(type)) {
        return type.charAt(0).toUpperCase() + type.slice(1);
      }
    }
    return undefined;
  }

  private categorizeImage(caption: string, url: string): string {
    const lowerCaption = caption.toLowerCase();
    const lowerUrl = url.toLowerCase();
    
    // Check both caption and URL for better categorization
    if (lowerCaption.includes('floor plan') || lowerCaption.includes('floorplan') ||
        lowerCaption.includes('plan') || lowerCaption.includes('layout') ||
        lowerUrl.includes('floor-plan') || lowerUrl.includes('floorplan') ||
        lowerUrl.includes('plan') || lowerUrl.includes('layout')) {
      return 'floorplan';
    } else if (lowerCaption.includes('section') || lowerCaption.includes('elevation') ||
               lowerUrl.includes('section') || lowerUrl.includes('elevation')) {
      return 'section';
    } else if (lowerCaption.includes('render') || lowerCaption.includes('visualization') ||
               lowerCaption.includes('perspective') || lowerCaption.includes('3d') ||
               lowerUrl.includes('render') || lowerUrl.includes('visualization') ||
               lowerUrl.includes('perspective') || lowerUrl.includes('3d')) {
      return 'render';
    } else if (lowerCaption.includes('detail') || lowerCaption.includes('closeup') ||
               lowerCaption.includes('close-up') || lowerCaption.includes('zoom') ||
               lowerUrl.includes('detail') || lowerUrl.includes('closeup') ||
               lowerUrl.includes('close-up') || lowerUrl.includes('zoom')) {
      return 'detail';
    } else {
      return 'photo';
    }
  }

  private extractAreaAsNumber($: ReturnType<typeof load>): number {
    const areaText = $('.afd-specs__area .afd-specs__value').text().trim();
    const match = areaText.match(/(\d+(?:,\d+)?)/);
    if (match) {
      return parseFloat(match[1].replace(',', ''));
    }
    return 0;
  }

  private extractClient($: ReturnType<typeof load>): string {
    return $('.afd-specs__client .afd-specs__value').text().trim();
  }

  private extractMaterials($: ReturnType<typeof load>): string[] {
    return $('.afd-specs__materials .afd-specs__value')
      .text()
      .trim()
      .split(',')
      .map(material => material.trim())
      .filter(Boolean);
  }

  private extractSustainability($: ReturnType<typeof load>): string[] {
    return $('.afd-specs__sustainability .afd-specs__value')
      .text()
      .trim()
      .split(',')
      .map(item => item.trim())
      .filter(Boolean);
  }

  private extractAwards($: ReturnType<typeof load>): string[] {
    return $('.afd-specs__awards .afd-specs__value')
      .text()
      .trim()
      .split(',')
      .map(award => award.trim())
      .filter(Boolean);
  }

  private extractKeyFeatures($: ReturnType<typeof load>): string[] {
    const features = $('.afd-specs__features .afd-specs__value')
      .text()
      .trim()
      .split(',')
      .map(feature => feature.trim())
      .filter(Boolean);
    
    return features.length > 0 ? features : ['Not specified'];
  }

  private extractSiteConstraints($: ReturnType<typeof load>): string[] {
    const constraints = $('.afd-specs__constraints .afd-specs__value')
      .text()
      .trim()
      .split(',')
      .map(constraint => constraint.trim())
      .filter(Boolean);
    
    return constraints.length > 0 ? constraints : ['Not specified'];
  }

  private extractProgrammaticRequirements($: ReturnType<typeof load>): string[] {
    const requirements = $('.afd-specs__program .afd-specs__value')
      .text()
      .trim()
      .split(',')
      .map(req => req.trim())
      .filter(Boolean);
    
    return requirements.length > 0 ? requirements : ['Not specified'];
  }

  private extractDesignChallenges($: ReturnType<typeof load>): string[] {
    const challenges = $('.afd-specs__challenges .afd-specs__value')
      .text()
      .trim()
      .split(',')
      .map(challenge => challenge.trim())
      .filter(Boolean);
    
    return challenges.length > 0 ? challenges : ['Not specified'];
  }

  private extractSpatialOrganization($: ReturnType<typeof load>): string {
    return $('.afd-specs__organization .afd-specs__value')
      .text()
      .trim() || 'Not specified';
  }
} 