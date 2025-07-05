import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import fs from 'fs';

puppeteer.use(StealthPlugin());

(async () => {
  let cookies: any[] = [];
  if (fs.existsSync('chatgpt-cookies.json')) {
    cookies = JSON.parse(fs.readFileSync('chatgpt-cookies.json', 'utf-8'));
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
  } else {
    console.log('No existing chatgpt-cookies.json found. You will need to log in manually.');
  }

  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  if (cookies.length > 0) {
    await page.setCookie(...cookies);
  }
  await page.goto('https://chat.openai.com/', { waitUntil: 'networkidle2' });

  const url = page.url();
  const title = await page.title();
  console.log(`Current page: ${url}`);
  console.log(`Page title: ${title}`);

  // Wait for user to log in and press Enter
  console.log('\nPlease complete the login in the browser window.');
  console.log('Once you are fully logged in, come back here and press Enter to save fresh cookies.');
  await new Promise(resolve => process.stdin.once('data', resolve));

  // Save fresh cookies
  const freshCookies = await page.cookies();
  fs.writeFileSync('chatgpt-cookies.json', JSON.stringify(freshCookies, null, 2));
  console.log('✅ Fresh cookies saved to chatgpt-cookies.json');

  const screenshotPath = `/tmp/chatgpt-cookies-debug-${Date.now()}.png` as const;
  await page.screenshot({ path: screenshotPath });
  console.log(`Screenshot saved to: ${screenshotPath}`);

  await browser.close();
  console.log('Check the browser window. Are you logged in?');
  console.log('Press Ctrl+C to exit.');
})(); 