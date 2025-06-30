import puppeteer from 'puppeteer';
import fs from 'fs';

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto('https://chat.openai.com/', { waitUntil: 'networkidle2' });

  console.log('Log in to ChatGPT in the browser window. When you see the chat interface, come back here and press Enter.');
  process.stdin.once('data', async () => {
    const cookies = await page.cookies();
    fs.writeFileSync('chatgpt-cookies.json', JSON.stringify(cookies, null, 2));
    console.log('✅ Cookies saved to chatgpt-cookies.json');
    await browser.close();
    process.exit(0);
  });
})(); 