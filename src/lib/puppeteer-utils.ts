import puppeteerCore from 'puppeteer-core';
import chromium from '@sparticuz/chromium-min';
import { join } from 'path';
import { existsSync } from 'fs';

export async function launchBrowser(): Promise<any> {
  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction) {
    // Use @sparticuz/chromium-min for serverless environments
    const executablePath = await chromium.executablePath();
    
    return await puppeteerCore.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath,
      headless: chromium.headless,
    });
  } else {
    // Local development - try custom binary first, fallback to system chromium
    const customBinaryPath = join(process.cwd(), 'chromium-bin', 'chromium');
    
    if (existsSync(customBinaryPath)) {
      console.log('[PUPPETEER][DEV] Using custom chromium binary');
      return await puppeteerCore.launch({
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: customBinaryPath,
        headless: true,
      });
    } else {
      console.log('[PUPPETEER][DEV] Using system chromium');
      return await puppeteerCore.launch({
        headless: true,
        defaultViewport: { width: 1280, height: 800 },
      });
    }
  }
} 