import { chromium } from 'playwright-core';
import type { Browser, BrowserContext, Page } from 'playwright-core';

export async function launchPlaywrightBrowser(): Promise<{ browser: Browser; context: BrowserContext; page: Page }> {
  const isProduction = process.env.NODE_ENV === 'production';

  const launchOptions = {
    headless: false,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--disable-web-security',
      '--disable-features=VizDisplayCompositor',
      '--disable-background-timer-throttling',
      '--disable-backgrounding-occluded-windows',
      '--disable-renderer-backgrounding',
      '--disable-ipc-flooding-protection',
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-default-apps',
      '--disable-extensions',
      '--disable-plugins',
      '--disable-sync',
      '--disable-translate',
      '--hide-scrollbars',
      '--mute-audio',
      '--no-zygote',
      '--single-process'
    ]
  };

  if (isProduction) {
    console.log('[PLAYWRIGHT] Launching in production mode');
    // In production, Playwright will use its own bundled chromium
    // which is often more compatible with serverless environments
  } else {
    console.log('[PLAYWRIGHT] Launching in development mode');
  }

  const browser = await chromium.launch(launchOptions);
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
  });
  const page = await context.newPage();

  return { browser, context, page };
}

export async function closeBrowser(browser: Browser): Promise<void> {
  await browser.close();
} 