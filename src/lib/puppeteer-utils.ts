import puppeteer from 'puppeteer';
import puppeteerCore from 'puppeteer-core';
import chromium from '@sparticuz/chromium-min';

export async function launchBrowser(): Promise<any> {
  const isProduction = process.env.NODE_ENV === 'production';
  
  if (isProduction) {
    try {
      // Use @sparticuz/chromium-min for serverless environments (optimized for Vercel's 50MB limit)
      const executablePath = await chromium.executablePath();
      
      console.log('[PUPPETEER] Launching browser in production mode with chromium-min');
      console.log('[PUPPETEER] Executable path:', executablePath);
      
      return await puppeteerCore.launch({
        args: [
          ...chromium.args,
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--single-process',
          '--no-zygote',
          '--disable-extensions',
          '--disable-plugins',
          '--disable-default-apps',
          '--disable-background-timer-throttling',
          '--disable-backgrounding-occluded-windows',
          '--disable-renderer-backgrounding',
          '--disable-ipc-flooding-protection',
          '--disable-features=VizDisplayCompositor',
          '--disable-web-security',
          '--disable-blink-features=AutomationControlled'
        ],
        executablePath,
        headless: true,
        ignoreHTTPSErrors: true,
        timeout: 30000
      });
    } catch (error) {
      console.error('[PUPPETEER] Error launching with chromium-min:', error);
      
      // Fallback to regular puppeteer if chromium-min fails
      console.log('[PUPPETEER] Falling back to regular puppeteer');
      return await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--single-process',
          '--no-zygote',
          '--disable-extensions',
          '--disable-plugins',
          '--disable-default-apps'
        ],
        timeout: 30000
      });
    }
  } else {
    // Use regular Puppeteer for development
    console.log('[PUPPETEER] Launching browser in development mode');
    return await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-blink-features=AutomationControlled',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',
        '--disable-ipc-flooding-protection',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding',
        '--disable-extensions',
        '--disable-plugins',
        '--disable-default-apps',
        '--disable-gpu',
        '--single-process',
        '--no-zygote'
      ],
      timeout: 60000
    });
  }
} 