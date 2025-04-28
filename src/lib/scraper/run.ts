import { ArchDailyScraper } from './archdaily';

async function main() {
  const archDailyScraper = new ArchDailyScraper();

  console.log('Starting ArchDaily scraper...');
  
  try {
    const projectUrls = await archDailyScraper.scrapeProjectList();
    console.log(`Found ${projectUrls.length} projects`);

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
    console.error('Failed to scrape projects:', error);
  }

  console.log('Scraping completed!');
}

main().catch(console.error); 