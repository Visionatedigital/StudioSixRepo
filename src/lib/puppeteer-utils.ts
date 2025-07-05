import puppeteer from 'puppeteer';

export async function launchBrowser(): Promise<any> {
  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction) {
    // Use Browserless.io in production
    const browserlessToken = process.env.BROWSERLESS_TOKEN;
    if (!browserlessToken) {
      throw new Error('BROWSERLESS_TOKEN environment variable is required for production');
    }

    console.log('[PUPPETEER] Connecting to Browserless.io...');
    const browser = await puppeteer.connect({
      browserWSEndpoint: `wss://chrome.browserless.io?token=${browserlessToken}`,
    });

    return browser;
  } else {
    // Local development - use local puppeteer
    console.log('[PUPPETEER] Launching local browser for development...');
    return await puppeteer.launch({
      headless: false, // Set to false so you can see the browser
      defaultViewport: { width: 1280, height: 800 },
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor'
      ]
    });
  }
} 