import puppeteer, { type Browser } from 'puppeteer';
import puppeteerCore, { type Browser as BrowserCore } from 'puppeteer-core';
import chromium from '@sparticuz/chromium-min';

export async function launchBrowser(): Promise<Browser | BrowserCore> {
  const isProduction = process.env.NODE_ENV === 'production';
  
  if (isProduction) {
    // Use @sparticuz/chromium-min for serverless environments (optimized for Vercel's 50MB limit)
    return await puppeteerCore.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(
        'https://github.com/Sparticuz/chromium/releases/download/v121.0.0/chromium-v121.0.0-pack.tar'
      ),
      headless: true,
      ignoreHTTPSErrors: true,
    });
  } else {
    // Use regular Puppeteer for development
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