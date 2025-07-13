'use server';

import puppeteer from 'puppeteer-core';
import puppeteerLocal from 'puppeteer';
import { addExtra } from 'puppeteer-extra';
import { chromium } from 'playwright';

const BROWSERLESS_URL = 'wss://production-sfo.browserless.io';
const BROWSERLESS_TOKEN = process.env.BROWSERLESS_TOKEN;
const REMOTE_WS = process.env.REMOTE_WS;

interface BrowserSession {
  browser: any;
  page: any;
}

const puppeteerExtra = addExtra(puppeteer as any);

export async function launchBrowser(): Promise<BrowserSession> {
  // Force Playwright mode if environment variable is set
  if (process.env.USE_PLAYWRIGHT === 'true') {
    return await launchBrowserPlaywright();
  }
  
  const endpoint = REMOTE_WS || (BROWSERLESS_TOKEN && `${BROWSERLESS_URL}?token=${BROWSERLESS_TOKEN}&blockAds=true&keepalive=true`);
  if (endpoint) {
    console.log('[PUPPETEER] Connecting to remote service...');
    const browser = await puppeteerExtra.connect({
      browserWSEndpoint: endpoint,
      defaultViewport: null,
      protocolTimeout: 180000,
    });
    const page = await browser.newPage();
    await page.setDefaultTimeout(60000);
    await page.setDefaultNavigationTimeout(120000);
    await page.setViewport({
      width: 1920,
      height: 1080,
      deviceScaleFactor: 1,
      hasTouch: false,
      isLandscape: true,
      isMobile: false
    });
    page.on('error', err => { console.error('[PUPPETEER] Page error:', err); });
    page.on('pageerror', err => { console.error('[PUPPETEER] Page error:', err); });
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
      'Upgrade-Insecure-Requests': '1',
      'Connection': 'keep-alive',
      'sec-ch-ua': '"Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"macOS"',
      'Sec-Fetch-Site': 'none',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-User': '?1',
      'Sec-Fetch-Dest': 'document',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache'
    });
    await page.setJavaScriptEnabled(true);
    const fs = await import('fs');
    if (fs.existsSync('chatgpt-cookies.json')) {
      const cookies = JSON.parse(fs.readFileSync('chatgpt-cookies.json', 'utf8'));
      const filteredCookies = cookies.map((cookie: any) => {
        const { partitionKey, sameParty, sourceScheme, sourcePort, ...cleanCookie } = cookie;
        return cleanCookie;
      });
      console.log(`[PUPPETEER] Loading ${filteredCookies.length} filtered cookies from chatgpt-cookies.json`);
      await page.setCookie(...filteredCookies);
      console.log('[PUPPETEER] Successfully set cookies');
    }
    return { browser, page };
  } else {
    // Try local Chrome/Chromium with Puppeteer first, fallback to Playwright
    try {
      console.log('[PUPPETEER] Launching local Chrome/Chromium...');
    const browser = await puppeteerLocal.launch({
      headless: false,
      executablePath: process.env.CHROME_PATH || '/usr/bin/google-chrome-stable',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-extensions',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',
        '--disable-ipc-flooding-protection',
        '--disable-blink-features=AutomationControlled',
        '--no-first-run',
        '--no-default-browser-check',
        '--disable-default-apps',
        '--disable-popup-blocking',
        '--disable-translate',
        '--disable-background-networking',
        '--disable-sync',
        '--metrics-recording-only',
        '--safebrowsing-disable-auto-update',
        '--window-size=1920,1080',
        '--display=:99',
        `--user-data-dir=/tmp/chrome-user-data-${Date.now()}`,
      ],
    });
    const page = await browser.newPage();
    await page.setDefaultTimeout(60000);
    await page.setDefaultNavigationTimeout(120000);
    await page.setViewport({
      width: 1920,
      height: 1080,
      deviceScaleFactor: 1,
      hasTouch: false,
      isLandscape: true,
      isMobile: false
    });
    page.on('error', err => { console.error('[PUPPETEER] Page error:', err); });
    page.on('pageerror', err => { console.error('[PUPPETEER] Page error:', err); });
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
      'Upgrade-Insecure-Requests': '1',
      'Connection': 'keep-alive',
      'sec-ch-ua': '"Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"macOS"',
      'Sec-Fetch-Site': 'none',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-User': '?1',
      'Sec-Fetch-Dest': 'document',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache'
    });
    await page.setJavaScriptEnabled(true);
    const fs = await import('fs');
    if (fs.existsSync('chatgpt-cookies.json')) {
      const cookies = JSON.parse(fs.readFileSync('chatgpt-cookies.json', 'utf8'));
      const filteredCookies = cookies.map((cookie: any) => {
        const { partitionKey, sameParty, sourceScheme, sourcePort, ...cleanCookie } = cookie;
        return cleanCookie;
      });
      console.log(`[PUPPETEER] Loading ${filteredCookies.length} filtered cookies from chatgpt-cookies.json`);
      await page.setCookie(...filteredCookies);
      console.log('[PUPPETEER] Successfully set cookies');
    }
    return { browser, page };
    } catch (puppeteerError: any) {
      console.warn('[PUPPETEER] Failed to launch, trying Playwright fallback:', puppeteerError.message);
      return await launchBrowserPlaywright();
    }
  }
}

export async function launchBrowserPlaywright(): Promise<BrowserSession> {
  console.log('[PLAYWRIGHT] Launching Chromium...');
  
  const browser = await chromium.launch({
    headless: false,
    executablePath: process.env.CHROME_PATH || '/usr/bin/google-chrome-stable',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--disable-web-security',
      '--disable-features=VizDisplayCompositor',
      '--no-first-run',
      '--disable-default-apps',
      '--window-size=1920,1080',
      '--display=:99',
    ],
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  });

  const page = await context.newPage();

  console.log('[PLAYWRIGHT] Browser launched successfully');
  return { browser, page };
}
