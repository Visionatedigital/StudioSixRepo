import puppeteer from 'puppeteer';
import puppeteerCore from 'puppeteer-core';
import chromium from '@sparticuz/chromium-min';
import fs from 'fs';

export async function launchBrowser(): Promise<any> {
  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction) {
    let executablePath = '';
    let candidatePaths: string[] = [];
    let resolvedPath = await chromium.executablePath();
    candidatePaths.push(resolvedPath);
    candidatePaths.push('/var/task/node_modules/@sparticuz/chromium-min/bin/chromium');
    candidatePaths.push('/var/task/.next/server/bin/chromium');
    candidatePaths.push('/tmp/chromium');

    // Log all candidate paths and their existence
    console.log('[PUPPETEER][DEBUG] Candidate Chromium executable paths:');
    for (const path of candidatePaths) {
      try {
        const exists = path && fs.existsSync(path);
        console.log(`  - ${path}: ${exists ? 'FOUND' : 'NOT FOUND'}`);
      } catch (err) {
        console.log(`  - ${path}: ERROR CHECKING (${err})`);
      }
    }

    // Use the first path that exists
    for (const path of candidatePaths) {
      if (path && fs.existsSync(path)) {
        executablePath = path;
        break;
      }
    }

    if (!executablePath) {
      // If none found, use the resolvedPath anyway and log a warning
      executablePath = resolvedPath;
      console.warn('[PUPPETEER][DEBUG] No Chromium binary found in candidate paths, using resolvedPath anyway:', resolvedPath);
    } else {
      console.log('[PUPPETEER][DEBUG] Using Chromium executablePath:', executablePath);
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