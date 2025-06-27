const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require('fs');

// Apply the stealth plugin
puppeteer.use(StealthPlugin());

async function refreshCookies() {
  console.log('🚀 Starting ChatGPT cookie refresh...');
  console.log('📝 This will open a browser window for you to log in manually.');
  console.log('📝 After logging in, the cookies will be saved automatically.');
  
  const browser = await puppeteer.launch({
    headless: false, // Show the browser so you can log in
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  try {
    // Navigate to ChatGPT
    console.log('🌐 Navigating to ChatGPT...');
    await page.goto('https://chatgpt.com/', { waitUntil: 'networkidle2' });

    console.log('🔐 Please log in to ChatGPT in the browser window...');
    console.log('⏳ Waiting for you to complete login...');

    // Wait for the chat input to appear (indicating successful login)
    await page.waitForSelector('textarea[data-testid="prompt-textarea"]', { 
      timeout: 300000, // 5 minutes timeout
      visible: true 
    });

    console.log('✅ Login detected! Saving cookies...');

    // Get all cookies
    const cookies = await page.cookies();
    
    // Save cookies to file
    fs.writeFileSync('chatgpt-cookies.json', JSON.stringify(cookies, null, 2));
    
    console.log('💾 Cookies saved successfully!');
    console.log('📁 Saved to: chatgpt-cookies.json');
    console.log('🔢 Number of cookies saved:', cookies.length);

    // Test that we can access the chat
    console.log('🧪 Testing chat access...');
    await page.waitForSelector('textarea[data-testid="prompt-textarea"]', { visible: true });
    console.log('✅ Chat input found - cookies are working!');

  } catch (error) {
    console.error('❌ Error during cookie refresh:', error.message);
    console.log('💡 Make sure you completed the login process in the browser window.');
  } finally {
    console.log('🔒 Closing browser...');
    await browser.close();
    console.log('✅ Cookie refresh complete!');
  }
}

// Run the script
refreshCookies().catch(console.error); 