import puppeteerCore from 'puppeteer-core';
import chromium from '@sparticuz/chromium-min';
import { join } from 'path';
import { existsSync } from 'fs';

export async function launchBrowser(): Promise<any> {
  const isProduction = process.env.NODE_ENV === 'production';

  // Use the manually bundled binary in production
  const executablePath = join(process.cwd(), 'chromium-bin', 'chromium');

  if (isProduction) {
    if (!existsSync(executablePath)) {
      console.error('[PUPPETEER][ERROR] Chromium binary not found at:', executablePath);
      throw new Error(`Chromium binary not found at: ${executablePath}`);
    }
    return await puppeteerCore.launch({
      args: [
        ...chromium.args,
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--single-process',
        '--no-zygote',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor'
      ],
      defaultViewport: chromium.defaultViewport,
      executablePath,
      headless: chromium.headless,
    });
  } else {
    // Local development (use puppeteer-core for consistency)
    return await puppeteerCore.launch({
      headless: true,
      defaultViewport: { width: 1280, height: 800 },
    });
  }
} 