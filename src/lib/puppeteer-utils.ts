// Trigger redeploy: no-op change
export async function launchBrowser(): Promise<any> {
  const isProduction = process.env.NODE_ENV === 'production';
  let puppeteer: any;

  if (isProduction) {
    puppeteer = require('puppeteer-extra');
    const StealthPlugin = require('puppeteer-extra-plugin-stealth');
    puppeteer.use(StealthPlugin());
    puppeteer.puppeteer = require('puppeteer-core');
  } else {
    puppeteer = require('puppeteer-extra');
    const StealthPlugin = require('puppeteer-extra-plugin-stealth');
    puppeteer.use(StealthPlugin());
  }

  if (isProduction) {
    // Use Browserless.io in production
    const browserlessToken = process.env.BROWSERLESS_TOKEN;
    if (!browserlessToken) {
      throw new Error('BROWSERLESS_TOKEN environment variable is required for production');
    }

    console.log('[PUPPETEER] Connecting to Browserless.io...');
    console.log('[PUPPETEER] Token length:', browserlessToken.length);
    console.log('[PUPPETEER] Token starts with:', browserlessToken.substring(0, 8) + '...');

    try {
      // Try the standard WebSocket connection first (new endpoint)
      const browser = await puppeteer.connect({
        browserWSEndpoint: `wss://production-sfo.browserless.io?token=${browserlessToken}`,
        defaultViewport: { width: 1280, height: 800 },
      });
      
      console.log('[PUPPETEER] Successfully connected to Browserless.io');
      return browser;
    } catch (error: any) {
      console.error('[PUPPETEER] WebSocket connection failed:', error.message);
      
      // Try alternative connection method with HTTP endpoint (new endpoint)
      try {
        console.log('[PUPPETEER] Trying HTTP endpoint as fallback...');
        const browser = await puppeteer.connect({
          browserWSEndpoint: `https://production-sfo.browserless.io?token=${browserlessToken}`,
          defaultViewport: { width: 1280, height: 800 },
        });
        
        console.log('[PUPPETEER] Successfully connected via HTTP endpoint');
        return browser;
      } catch (httpError: any) {
        console.error('[PUPPETEER] HTTP endpoint also failed:', httpError.message);
        
        // Try with different endpoint format (new endpoint with trailing slash)
        try {
          console.log('[PUPPETEER] Trying alternative endpoint format...');
          const browser = await puppeteer.connect({
            browserWSEndpoint: `wss://production-sfo.browserless.io/?token=${browserlessToken}`,
            defaultViewport: { width: 1280, height: 800 },
          });
          
          console.log('[PUPPETEER] Successfully connected with alternative format');
          return browser;
        } catch (altError: any) {
          console.error('[PUPPETEER] All connection methods failed');
          console.error('[PUPPETEER] Please check:');
          console.error('[PUPPETEER] 1. Your Browserless.io token is valid');
          console.error('[PUPPETEER] 2. Your account is active');
          console.error('[PUPPETEER] 3. You have available units');
          throw new Error(`Failed to connect to Browserless.io: ${error.message}`);
        }
      }
    }
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