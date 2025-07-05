import puppeteer from 'puppeteer';
import puppeteerCore from 'puppeteer-core';
import chromium from '@sparticuz/chromium-min';

export async function launchBrowser(): Promise<any> {
  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction) {
    let executablePath = await chromium.executablePath();
    if (!executablePath) {
      // Fallback to the default path where Vercel should bundle the binary
      executablePath = '/var/task/node_modules/@sparticuz/chromium-min/bin/chromium';
    }
    const launchOptions: any = {
      args: chromium.args,
      headless: true,
      defaultViewport: { width: 1280, height: 800 },
      executablePath,
    };
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