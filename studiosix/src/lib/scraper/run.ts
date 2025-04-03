import { ArchDailyScraper } from './archdaily';

async function main() {
  const archDailyScraper = new ArchDailyScraper();
  const maxPages = 10; // Limit the number of pages to scrape

  console.log('Starting ArchDaily scraper...');

  for (let page = 1; page <= maxPages; page++) {
    console.log(`Scraping page ${page}...`);
    
    try {
      const projectUrls = await archDailyScraper.scrapeProjectList(page);
      console.log(`Found ${projectUrls.length} projects on page ${page}`);

      for (const url of projectUrls) {
        try {
          console.log(`Scraping project: ${url}`);
          await archDailyScraper.scrapeProjectPage(url);
          // Add a delay to be respectful to the server
          await new Promise(resolve => setTimeout(resolve, 2000));
        } catch (error) {
          console.error(`Failed to scrape project ${url}:`, error);
        }
      }
    } catch (error) {
      console.error(`Failed to scrape page ${page}:`, error);
    }
  }

  console.log('Scraping completed!');
}

main().catch(console.error); 