import puppeteer from 'puppeteer-core';
import fs from 'fs';

(async () => {
  if (!fs.existsSync('chatgpt-cookies.json')) {
    console.error('❌ chatgpt-cookies.json not found!');
    process.exit(1);
  }
  let cookies = JSON.parse(fs.readFileSync('chatgpt-cookies.json', 'utf-8'));
  cookies = cookies.map((cookie: any) => {
    const allowed = ['name', 'value', 'domain', 'path', 'expires', 'httpOnly', 'secure', 'sameSite'];
    const filtered: any = {};
    for (const key of allowed) {
      if (cookie[key] !== undefined) filtered[key] = cookie[key];
    }
    return filtered;
  });

  console.log('Loaded cookies:');
  for (const cookie of cookies) {
    console.log(`- ${cookie.name} (expires: ${cookie.expires ? new Date(cookie.expires * 1000).toISOString() : 'session'})`);
  }

  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  await page.setCookie(...cookies);
  await page.goto('https://chat.openai.com/', { waitUntil: 'networkidle2' });

  const url = page.url();
  const title = await page.title();
  console.log(`Current page: ${url}`);
  console.log(`Page title: ${title}`);

  const screenshotPath = `chatgpt-cookies-debug-${Date.now()}.png` as const;
  await page.screenshot({ path: screenshotPath });
  console.log(`Screenshot saved to: ${screenshotPath}`);

  console.log('Check the browser window. Are you logged in?');
  console.log('Press Ctrl+C to exit.');
})(); 