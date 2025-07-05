import puppeteer from 'puppeteer';
import puppeteerCore from 'puppeteer-core';
import chromium from '@sparticuz/chromium-min';

export async function launchBrowser(): Promise<any> {
  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction) {
    const executablePath = await chromium.executablePath();
    const launchOptions: any = {
      args: chromium.args,
      headless: true,
      defaultViewport: { width: 1280, height: 800 },
    };
    if (executablePath) {
      launchOptions.executablePath = executablePath;
    }
    try {
      return await puppeteerCore.launch(launchOptions);
    } catch (err) {
      console.error('[PUPPETEER] Error launching with chromium-min:', err);
      throw err;
    }
  } else {
    // Local development
    return await puppeteer.launch({
      headless: true,
      defaultViewport: { width: 1280, height: 800 },
    });
  }
} 