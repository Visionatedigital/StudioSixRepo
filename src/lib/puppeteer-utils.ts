'use server';

// Trigger redeploy: no-op change
export async function launchBrowser(): Promise<any> {
  const isProduction = process.env.NODE_ENV === 'production';
  let puppeteer: any;

  if (isProduction) {
    puppeteer = require('puppeteer-extra');
    puppeteer.puppeteer = require('puppeteer-core');
  } else {
    puppeteer = require('puppeteer-extra');
  }

  // Add basic evasion techniques without requiring the full stealth plugin
  const evasions = {
    webdriver: () => {
      return {
        evaluate: () => {
          Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
        }
      };
    },
    chrome: () => {
      return {
        evaluate: () => {
          (window as any).chrome = {
            runtime: {},
          };
        }
      };
    },
    permissions: () => {
      return {
        evaluate: () => {
          const originalQuery = window.navigator.permissions.query;
          (window.navigator.permissions as any).query = (parameters: any): Promise<any> => (
            parameters.name === 'notifications' ?
              Promise.resolve({ state: Notification.permission }) :
              originalQuery(parameters)
          );
        }
      };
    },
    plugins: () => {
      return {
        evaluate: () => {
          Object.defineProperty(navigator, 'plugins', {
            get: () => [1, 2, 3, 4, 5],
          });
        }
      };
    },
    languages: () => {
      return {
        evaluate: () => {
          Object.defineProperty(navigator, 'languages', {
            get: () => ['en-US', 'en'],
          });
        }
      };
    }
  };

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
      // Try WebSocket connection
      const browser = await puppeteer.connect({
        browserWSEndpoint: `wss://chrome.browserless.io?token=${browserlessToken}`,
        defaultViewport: { width: 1280, height: 800 }
      });

      const page = await browser.newPage();
      
      // Apply evasions
      for (const evasion of Object.values(evasions)) {
        await page.evaluateOnNewDocument(evasion().evaluate);
      }

      return { browser, page };
    } catch (error: unknown) {
      const wsError = error as Error;
      console.log('[PUPPETEER] WebSocket connection failed:', wsError.message);
      console.log('[PUPPETEER] Trying HTTP endpoint as fallback...');

      try {
        // Try HTTP endpoint
        const browser = await puppeteer.connect({
          browserURL: `https://chrome.browserless.io?token=${browserlessToken}`,
          defaultViewport: { width: 1280, height: 800 }
        });

        const page = await browser.newPage();
        
        // Apply evasions
        for (const evasion of Object.values(evasions)) {
          await page.evaluateOnNewDocument(evasion().evaluate);
        }

        return { browser, page };
      } catch (error: unknown) {
        const httpError = error as Error;
        console.log('[PUPPETEER] HTTP endpoint also failed:', httpError.message);
        console.log('[PUPPETEER] Trying alternative endpoint format...');

        try {
          // Try alternative format
          const browser = await puppeteer.connect({
            browserWSEndpoint: `wss://chrome.browserless.io/webdriver/session?token=${browserlessToken}`,
            defaultViewport: { width: 1280, height: 800 }
          });

          const page = await browser.newPage();
          
          // Apply evasions
          for (const evasion of Object.values(evasions)) {
            await page.evaluateOnNewDocument(evasion().evaluate);
          }

          return { browser, page };
        } catch (error: unknown) {
          const altError = error as Error;
          console.log('[PUPPETEER] All connection methods failed');
          console.log('[PUPPETEER] Please check:');
          console.log('[PUPPETEER] 1. Your Browserless.io token is valid');
          console.log('[PUPPETEER] 2. Your account is active');
          console.log('[PUPPETEER] 3. You have available units');
          throw altError;
        }
      }
    }
  } else {
    // Local development - launch Chrome directly
    const browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage'
      ]
    });

    const page = await browser.newPage();
    
    // Apply evasions
    for (const evasion of Object.values(evasions)) {
      await page.evaluateOnNewDocument(evasion().evaluate);
    }

    return { browser, page };
  }
} 