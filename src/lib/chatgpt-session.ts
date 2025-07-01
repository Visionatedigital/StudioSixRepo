import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import fs from 'fs';

interface ChatGPTSession {
  browser: any;
  page: any;
  isConnected: boolean;
  lastActivity: Date;
}

class ChatGPTSessionManager {
  private static instance: ChatGPTSessionManager;
  private session: ChatGPTSession | null = null;
  private sessionTimeout: NodeJS.Timeout | null = null;
  private readonly SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

  private constructor() {}

  public static getInstance(): ChatGPTSessionManager {
    if (!ChatGPTSessionManager.instance) {
      ChatGPTSessionManager.instance = new ChatGPTSessionManager();
    }
    return ChatGPTSessionManager.instance;
  }

  public async getSession(): Promise<ChatGPTSession | null> {
    if (this.session && this.session.isConnected) {
      // Update last activity
      this.session.lastActivity = new Date();
      this.resetSessionTimeout();
      return this.session;
    }
    return null;
  }

  public async createSession(): Promise<ChatGPTSession> {
    // Close existing session if any
    await this.closeSession();

    console.log('[CHATGPT-SESSION] Creating new session...');

    try {
      let browser;
      
      if (process.env.VERCEL || process.env.AWS_REGION) {
        // Production/Vercel environment
        browser = await puppeteer.launch({
          args: chromium.args,
          defaultViewport: chromium.defaultViewport,
          executablePath: await chromium.executablePath(),
          headless: chromium.headless,
          ignoreHTTPSErrors: true,
        });
      } else {
        // Local development environment
        browser = await puppeteer.launch({
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
            '--disable-gpu'
          ],
          timeout: 60000
        });
      }

      const page = await browser.newPage();
      await page.setViewport({ width: 1280, height: 800 });

      // Add stealth measures
      await page.evaluateOnNewDocument(() => {
        // Remove webdriver property
        Object.defineProperty(navigator, 'webdriver', {
          get: () => undefined,
        });

        // Override permissions
        const originalQuery = window.navigator.permissions.query;
        (window.navigator.permissions as any).query = (parameters: any) => (
          parameters.name === 'notifications' ?
            Promise.resolve({ state: Notification.permission }) :
            originalQuery(parameters)
        );

        // Override plugins
        Object.defineProperty(navigator, 'plugins', {
          get: () => [1, 2, 3, 4, 5],
        });

        // Override languages
        Object.defineProperty(navigator, 'languages', {
          get: () => ['en-US', 'en'],
        });

        // Override chrome
        (window as any).chrome = {
          runtime: {},
        };

        // Override permissions
        const originalQuery2 = window.navigator.permissions.query;
        (window.navigator.permissions as any).query = (parameters: any) => (
          parameters.name === 'notifications' ?
            Promise.resolve({ state: Notification.permission }) :
            originalQuery2(parameters)
        );
      });

      // Load cookies if available
      if (fs.existsSync('chatgpt-cookies.json')) {
        let cookies = JSON.parse(fs.readFileSync('chatgpt-cookies.json', 'utf-8'));
        // Only keep allowed properties
        cookies = cookies.map((cookie: any) => {
          const allowed = ['name', 'value', 'domain', 'path', 'expires', 'httpOnly', 'secure', 'sameSite'];
          const filtered: any = {};
          for (const key of allowed) {
            if (cookie[key] !== undefined) filtered[key] = cookie[key];
          }
          return filtered;
        });
        await page.setCookie(...cookies);
        console.log('[CHATGPT-SESSION] Loaded cookies from file');
      }

      // Navigate to ChatGPT
      console.log('[CHATGPT-SESSION] Navigating to ChatGPT...');
      await page.goto('https://chatgpt.com/', { waitUntil: 'networkidle2', timeout: 30000 });

      // Check if already logged in
      let chatInputSelector = 'textarea[data-testid="prompt-textarea"]';
      let isLoggedIn = await page.$(chatInputSelector);

      // If not found, try waiting up to 30s for a visible textarea with placeholder 'Ask anything'
      if (!isLoggedIn) {
        console.log('[CHATGPT-SESSION] Trying fallback selector for chat input...');
        chatInputSelector = 'textarea[placeholder="Ask anything"]';
        let foundVisible = false;
        for (let i = 0; i < 30; i++) {
          try {
            foundVisible = await page.$eval(chatInputSelector, el => el && window.getComputedStyle(el).display !== 'none');
            if (foundVisible) break;
          } catch (e) {
            // ignore if not found
          }
          await new Promise(res => setTimeout(res, 1000));
        }
        if (foundVisible) {
          isLoggedIn = await page.$(chatInputSelector);
        } else {
          chatInputSelector = 'textarea'; // fallback to any textarea
          isLoggedIn = await page.$(chatInputSelector);
        }
      }

      if (!isLoggedIn) {
        // Add debugging to see what's on the page
        console.log('[CHATGPT-SESSION] Login check failed, debugging page state...');
        const currentUrl = page.url();
        console.log('[CHATGPT-SESSION] Current URL:', currentUrl);
        
        // Take a screenshot for debugging
        await page.screenshot({ path: 'debug-login-check.png' });
        console.log('[CHATGPT-SESSION] Screenshot saved as debug-login-check.png');
        
        // Check if we're on a login page or error page
        const pageContent = await page.content();
        console.log('[CHATGPT-SESSION] Page title:', await page.title());
        
        if (pageContent.includes('Sign in') || pageContent.includes('Log in')) {
          console.log('[CHATGPT-SESSION] Page appears to be a login page');
        } else if (pageContent.includes('error') || pageContent.includes('Error')) {
          console.log('[CHATGPT-SESSION] Page appears to have an error');
          // Look for specific error messages
          const errorMatch = pageContent.match(/<title[^>]*>([^<]+)<\/title>/i);
          if (errorMatch) {
            console.log('[CHATGPT-SESSION] Page title suggests error:', errorMatch[1]);
          }
        } else if (pageContent.includes('chat.openai.com') || pageContent.includes('chatgpt.com')) {
          console.log('[CHATGPT-SESSION] Page appears to be ChatGPT but no chat input found');
          // Check if we're on a different ChatGPT page (like settings, etc.)
          if (currentUrl.includes('/c/')) {
            console.log('[CHATGPT-SESSION] On a specific chat page, might need to navigate to new chat');
          }
        } else {
          console.log('[CHATGPT-SESSION] Page content preview:', pageContent.substring(0, 1000));
        }
        
        // Also check if the selector exists but is not visible
        const hiddenTextarea = await page.$('textarea[data-testid="prompt-textarea"]');
        if (hiddenTextarea) {
          console.log('[CHATGPT-SESSION] Textarea exists but might be hidden or not visible');
          // Puppeteer v20+ supports .isVisible(), but fallback if not
          let isVisible = false;
          try {
            isVisible = await hiddenTextarea.isVisible();
          } catch (e) {
            // fallback: check bounding box
            const box = await hiddenTextarea.boundingBox();
            isVisible = !!box;
          }
          console.log('[CHATGPT-SESSION] Textarea visible:', isVisible);
        } else {
          // List all textarea elements and their attributes
          const allTextareas = await page.$$eval('textarea', nodes => nodes.map(n => ({
            outerHTML: n.outerHTML,
            attributes: Array.from(n.attributes).map(a => ({ name: a.name, value: a.value })),
            dataTestid: n.getAttribute('data-testid'),
            placeholder: n.getAttribute('placeholder'),
            id: n.id,
            class: n.className
          })));
          console.log('[CHATGPT-SESSION] All textarea elements:', JSON.stringify(allTextareas, null, 2));
        }
        
        throw new Error('Not logged in. Please re-run the manual login script to refresh your cookies.');
      } else {
        console.log('[CHATGPT-SESSION] Already logged in with cookies.');
      }

      // Ensure we are on a new chat page
      console.log('[CHATGPT-SESSION] Navigating to new chat...');
      await page.goto('https://chatgpt.com/?model=gpt-4o', { waitUntil: 'networkidle2', timeout: 30000 });
      await page.waitForSelector(chatInputSelector, { timeout: 15000 });

      // Ensure GPT-4o is selected for image upload capabilities
      console.log('[CHATGPT-SESSION] Ensuring GPT-4o model is selected...');
      try {
        // Look for model selector button/dropdown
        const modelSelectorSelectors = [
          'button[data-testid="model-switcher"]',
          'button:has-text("GPT")',
          'div[data-testid="model-selector"]',
          'button[aria-label*="model"]',
          '[data-testid*="model"]',
          '.model-selector',
          'button:has([data-testid*="model"])'
        ];

        let modelButton = null;
        for (const selector of modelSelectorSelectors) {
          try {
            modelButton = await page.$(selector);
            if (modelButton) {
              console.log(`[CHATGPT-SESSION] Found model selector with: ${selector}`);
              break;
            }
          } catch (e) {
            // Continue to next selector
          }
        }

        if (modelButton) {
          // Click to open model selector
          await modelButton.click();
          await new Promise(res => setTimeout(res, 1000));

          // Look for GPT-4o option
          const gpt4oSelectors = [
            'text=GPT-4o',
            'text=gpt-4o',
            '[data-value="gpt-4o"]',
            'button:has-text("GPT-4o")',
            'div:has-text("GPT-4o")',
            'li:has-text("GPT-4o")'
          ];

          let gpt4oOption = null;
          for (const selector of gpt4oSelectors) {
            try {
              gpt4oOption = await page.$(selector);
              if (gpt4oOption) {
                console.log(`[CHATGPT-SESSION] Found GPT-4o option with: ${selector}`);
                break;
              }
            } catch (e) {
              // Continue to next selector
            }
          }

          if (gpt4oOption) {
            await gpt4oOption.click();
            await new Promise(res => setTimeout(res, 1000));
            console.log('[CHATGPT-SESSION] Successfully selected GPT-4o model');
          } else {
            console.log('[CHATGPT-SESSION] Could not find GPT-4o option in model selector');
            // Take screenshot for debugging
            await page.screenshot({ path: 'debug-model-selector.png' });
            console.log('[CHATGPT-SESSION] Screenshot saved as debug-model-selector.png');
          }
        } else {
          console.log('[CHATGPT-SESSION] Could not find model selector button');
          // Check if GPT-4o is already selected by looking for text indicators
          const pageText = await page.evaluate(() => document.body.innerText);
          if (pageText.includes('GPT-4o') || pageText.includes('gpt-4o')) {
            console.log('[CHATGPT-SESSION] GPT-4o appears to already be selected');
          } else {
            console.log('[CHATGPT-SESSION] Warning: Could not verify GPT-4o is selected');
          }
        }

        // Additional verification: look for file upload capabilities
        await new Promise(res => setTimeout(res, 2000));
        const hasFileUpload = await page.$('button[aria-label*="Attach"], input[type="file"], [data-testid*="attach"], button:has(svg):has-text("📎")') !== null;
        console.log('[CHATGPT-SESSION] File upload capability detected:', hasFileUpload);
        
        if (!hasFileUpload) {
          console.log('[CHATGPT-SESSION] Warning: File upload not detected. Image prompts may not work properly.');
        }

      } catch (error) {
        console.log('[CHATGPT-SESSION] Error during model selection:', error);
        console.log('[CHATGPT-SESSION] Continuing with session creation...');
      }

      this.session = {
        browser,
        page,
        isConnected: true,
        lastActivity: new Date()
      };

      this.resetSessionTimeout();
      console.log('[CHATGPT-SESSION] Session created successfully');

      return this.session;

    } catch (error) {
      const err = error as any;
      if (err && typeof err.message === 'string' && err.message.includes('detached Frame')) {
        console.error('[CHATGPT-SESSION] Detached frame detected, recreating session...');
        await this.closeSession();
        return this.createSession();
      }
      console.error('[CHATGPT-SESSION] Error creating session:', error);
      await this.closeSession();
      throw error;
    }
  }

  public async sendMessage(message: string): Promise<string> {
    const session = await this.getSession();
    if (!session) {
      throw new Error('No active ChatGPT session');
    }

    try {
      console.log('[CHATGPT-SESSION] Sending message:', message);

      // Type the message
      const chatInputSelector = 'textarea[data-testid="prompt-textarea"]';
      await session.page.waitForSelector(chatInputSelector, { timeout: 10000, visible: true });
      const textarea = await session.page.$(chatInputSelector);
      if (!textarea) throw new Error('Chat input not found');
      await textarea.focus();
      await session.page.evaluate((el: HTMLTextAreaElement) => { el.value = ''; }, textarea); // clear any existing text
      await new Promise(res => setTimeout(res, 100)); // small delay
      await textarea.type(message);
      await session.page.keyboard.press('Enter');

      // Wait for response
      console.log('[CHATGPT-SESSION] Waiting for response...');
      const responseSelector = 'div.markdown.prose';
      await session.page.waitForSelector(`${responseSelector}:not(:empty)`, { timeout: 60000 });
      
      // Give a little extra time for the full response to stream
      await new Promise(resolve => setTimeout(resolve, 3000));

      const responses = await session.page.$$eval(responseSelector, (elements: Element[]) => {
        return elements.map((el: Element) => el.innerHTML);
      });

      // The last element should be the newest response
      const lastResponse = responses[responses.length - 1];

      if (!lastResponse) {
        throw new Error('Could not find a response from ChatGPT.');
      }

      console.log('[CHATGPT-SESSION] Received response');
      return lastResponse;

    } catch (error) {
      console.error('[CHATGPT-SESSION] Error sending message:', error);
      throw error;
    }
  }

  public async sendImagePrompt(prompt: string, imagePath: string): Promise<string> {
    const session = await this.getSession();
    if (!session) {
      throw new Error('No active ChatGPT session');
    }
    const page = session.page;
    try {
      console.log('[CHATGPT-SESSION] Uploading image and sending prompt...');
      // Collect all current image URLs before sending
      const imageSelector = 'img[src^="https://files.oaiusercontent.com/"]';
      const existingImageUrls: string[] = await page.$$eval(imageSelector, (imgs: any[]) => imgs.map((img: any) => (img as HTMLImageElement).src));

      // Wait for the add files button and click it
      const addButtonSelector = 'button[aria-label*="Add photos and files"], button[aria-label*="Attach files"], button[aria-label*="Upload"], button';
      let addButton = await page.$(addButtonSelector);
      if (!addButton) {
        // Try clicking the "+" button if visible
        const plusButton = await page.$('button:has(svg[data-testid="PlusIcon"])');
        if (plusButton) {
          await plusButton.click();
          await new Promise(res => setTimeout(res, 500));
        }
        addButton = await page.$(addButtonSelector);
      }
      if (!addButton) throw new Error('Could not find add/upload button');
      await addButton.click();
      await new Promise(res => setTimeout(res, 500));
      // Find the file input and upload the image
      const fileInput = await page.$('input[type="file"]');
      if (!fileInput) throw new Error('Could not find file input');
      await fileInput.uploadFile(imagePath);
      await new Promise(res => setTimeout(res, 1500)); // Wait for upload
      // Type the prompt
      const chatInputSelector = 'textarea[data-testid="prompt-textarea"], textarea[placeholder="Ask anything"], textarea';
      const textarea = await page.$(chatInputSelector);
      if (!textarea) throw new Error('Chat input not found');
      await textarea.focus();
      await page.evaluate((el: HTMLTextAreaElement) => { el.value = ''; }, textarea);
      await new Promise(res => setTimeout(res, 100));
      await textarea.type(prompt);
      await new Promise(res => setTimeout(res, 300)); // Small delay after typing
      // Try pressing Enter
      await page.keyboard.press('Enter');
      await new Promise(res => setTimeout(res, 1000)); // Wait to see if message is sent
      // If the prompt is still in the textarea, try clicking the Send button
      const promptValue = await page.evaluate((el: HTMLTextAreaElement) => el.value, textarea);
      if (promptValue && promptValue.trim().length > 0) {
        // Try clicking the send button
        const sendButton = await page.$('button[aria-label*="Send"], button:has(svg[data-testid="SendIcon"])');
        if (sendButton) {
          await sendButton.click();
          await new Promise(res => setTimeout(res, 1000));
        }
      }
      // Wait 3 minutes and 20 seconds before starting to poll for the generated image
      console.log('[CHATGPT-SESSION] Waiting 3 minutes and 20 seconds for ChatGPT to start rendering...');
      await new Promise(res => setTimeout(res, 200000));
      console.log('[CHATGPT-SESSION] Starting to poll for the generated image (up to 3 more minutes)...');
      // Scroll to the bottom before polling
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      // Poll for a new assistant message with an image, up to 3 more minutes
      const pollTimeout = 180000; // 3 minutes
      const pollInterval = 2500; // 2.5 seconds
      const pollStart = Date.now();
      let generatedImageUrl: string | null = null;
      let pollCount = 0;
      while (Date.now() - pollStart < pollTimeout) {
        pollCount++;
        // New logic: find assistant messages by article[data-testid^="conversation-turn-"] with h6 containing 'ChatGPT said:'
        const assistantCount = await page.$$eval(
          'article[data-testid^="conversation-turn-"]',
          (nodes: any[]) => nodes.filter(node => {
            const h6 = node.querySelector('h6');
            return h6 && h6.textContent && h6.textContent.includes('ChatGPT said:');
          }).length
        );
        console.log(`[CHATGPT-SESSION] Poll #${pollCount}: Found ${assistantCount} assistant articles.`);
        // Get all assistant articles and look for an image inside each
        const assistantImages: string[] = await page.$$eval(
          'article[data-testid^="conversation-turn-"]',
          (nodes: any[]) => nodes
            .filter(node => {
              const h6 = node.querySelector('h6');
              return h6 && h6.textContent && h6.textContent.includes('ChatGPT said:');
            })
            .map(node => {
              const img = node.querySelector('img');
              return img ? img.src : null;
            })
            .filter(Boolean)
        );
        console.log(`[CHATGPT-SESSION] Poll #${pollCount}: Found ${assistantImages.length} assistant articles with images.`);
        if (assistantImages.length > 0) {
          generatedImageUrl = assistantImages[assistantImages.length - 1];
          console.log(`[CHATGPT-SESSION] New generated image found in assistant article after polling: ${generatedImageUrl}`);
          break;
        }
        await new Promise(res => setTimeout(res, pollInterval));
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      }
      // If no image found after polling, fallback to the last assistant article with an image
      if (!generatedImageUrl) {
        // Log the HTML of all assistant articles for debugging
        const assistantHtml: string[] = await page.$$eval(
          'article[data-testid^="conversation-turn-"]',
          (nodes: any[]) => nodes
            .filter(node => {
              const h6 = node.querySelector('h6');
              return h6 && h6.textContent && h6.textContent.includes('ChatGPT said:');
            })
            .map(node => node.outerHTML)
        );
        console.log('[CHATGPT-SESSION] Assistant article HTML dump:', JSON.stringify(assistantHtml, null, 2));
        // Additional debugging: log <main> HTML
        const mainHtml = await page.evaluate(() => {
          const main = document.querySelector('main');
          return main ? main.innerHTML : 'No <main> found';
        });
        console.log('[CHATGPT-SESSION] <main> HTML dump:', mainHtml);
        // Log all article[data-testid^="conversation-turn-"] outerHTML
        const allArticles = await page.$$eval(
          'article[data-testid^="conversation-turn-"]',
          (nodes: any[]) => nodes.map((node: any) => node.outerHTML)
        );
        console.log('[CHATGPT-SESSION] All article[data-testid^="conversation-turn-"] HTML:', JSON.stringify(allArticles, null, 2));
        // Log all <img> srcs
        const allImgSrcs = await page.$$eval('img', (imgs: any[]) => imgs.map((img: any) => img.src));
        console.log('[CHATGPT-SESSION] All <img> srcs:', JSON.stringify(allImgSrcs, null, 2));
        // Fallback: try again for images in assistant articles
        const assistantImages: string[] = await page.$$eval(
          'article[data-testid^="conversation-turn-"]',
          (nodes: any[]) => nodes
            .filter(node => {
              const h6 = node.querySelector('h6');
              return h6 && h6.textContent && h6.textContent.includes('ChatGPT said:');
            })
            .map(node => {
              const img = node.querySelector('img');
              return img ? img.src : null;
            })
            .filter(Boolean)
        );
        generatedImageUrl = assistantImages[assistantImages.length - 1] || null;
        if (!generatedImageUrl) {
          // Fallback: pull the last image in the DOM
          const allImages: string[] = await page.$$eval('img', (imgs: any[]) => imgs.map((img: any) => img.src));
          generatedImageUrl = allImages[allImages.length - 1] || null;
          if (!generatedImageUrl) {
            console.error('[CHATGPT-SESSION] No generated image found in assistant articles or anywhere in the DOM.');
            await page.screenshot({ path: 'debug-after-polling.png' });
            console.error('[CHATGPT-SESSION] Screenshot saved as debug-after-polling.png');
            throw new Error('No generated image found in assistant articles or anywhere in the DOM');
          }
          console.log('[CHATGPT-SESSION] Fallback: using last image in DOM:', generatedImageUrl);
        } else {
          console.log('[CHATGPT-SESSION] Polling timed out, using last assistant article image:', generatedImageUrl);
        }
      }
      // Download the image and convert to base64
      const response = await fetch(generatedImageUrl);
      if (!response.ok) throw new Error('Failed to download generated image');
      const buffer = await response.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');
      // Try to detect mime type from URL (default to jpeg)
      const ext = (generatedImageUrl.split('.').pop() || '').toLowerCase();
      const mime = ext === 'png' ? 'image/png' : 'image/jpeg';
      console.log('[CHATGPT-SESSION] Returning generated image as base64.');
      return `data:${mime};base64,${base64}`;
    } catch (error) {
      console.error('[CHATGPT-SESSION] Error in sendImagePrompt:', error);
      throw error;
    }
  }

  public async sendMultipleImagePrompt(prompt: string, imagePaths: string[]): Promise<string> {
    const session = await this.getSession();
    if (!session) {
      throw new Error('No active ChatGPT session');
    }
    const page = session.page;
    try {
      console.log(`[CHATGPT-SESSION] Uploading ${imagePaths.length} images and sending prompt...`);
      
      // Upload all images first
      for (let i = 0; i < imagePaths.length; i++) {
        console.log(`[CHATGPT-SESSION] Uploading image ${i + 1}/${imagePaths.length}...`);
        
        // Wait for the add files button and click it
        const addButtonSelector = 'button[aria-label*="Add photos and files"], button[aria-label*="Attach files"], button[aria-label*="Upload"], button';
        let addButton = await page.$(addButtonSelector);
        if (!addButton) {
          // Try clicking the "+" button if visible
          const plusButton = await page.$('button:has(svg[data-testid="PlusIcon"])');
          if (plusButton) {
            await plusButton.click();
            await new Promise(res => setTimeout(res, 500));
          }
          addButton = await page.$(addButtonSelector);
        }
        if (!addButton) throw new Error('Could not find add/upload button');
        await addButton.click();
        await new Promise(res => setTimeout(res, 500));
        
        // Find the file input and upload the image
        const fileInput = await page.$('input[type="file"]');
        if (!fileInput) throw new Error('Could not find file input');
        await fileInput.uploadFile(imagePaths[i]);
        await new Promise(res => setTimeout(res, 1500)); // Wait for upload
      }

      // Type the prompt
      const chatInputSelector = 'textarea[data-testid="prompt-textarea"], textarea[placeholder="Ask anything"], textarea';
      const textarea = await page.$(chatInputSelector);
      if (!textarea) throw new Error('Chat input not found');
      await textarea.focus();
      await page.evaluate((el: HTMLTextAreaElement) => { el.value = ''; }, textarea);
      await new Promise(res => setTimeout(res, 100));
      await textarea.type(prompt);
      await new Promise(res => setTimeout(res, 300)); // Small delay after typing

      // Try pressing Enter
      await page.keyboard.press('Enter');
      await new Promise(res => setTimeout(res, 1000)); // Wait to see if message is sent

      // If the prompt is still in the textarea, try clicking the Send button
      const promptValue = await page.evaluate((el: HTMLTextAreaElement) => el.value, textarea);
      if (promptValue && promptValue.trim().length > 0) {
        // Try clicking the send button
        const sendButton = await page.$('button[aria-label*="Send"], button:has(svg[data-testid="SendIcon"])');
        if (sendButton) {
          await sendButton.click();
          await new Promise(res => setTimeout(res, 1000));
        }
      }

      // Wait 3 minutes and 20 seconds before starting to poll for the generated image
      console.log('[CHATGPT-SESSION] Waiting 3 minutes and 20 seconds for ChatGPT to start rendering...');
      await new Promise(res => setTimeout(res, 200000));
      console.log('[CHATGPT-SESSION] Starting to poll for the generated image (up to 3 more minutes)...');

      // Scroll to the bottom before polling
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

      // Poll for a new assistant message with an image, up to 3 more minutes
      const pollTimeout = 180000; // 3 minutes
      const pollInterval = 2500; // 2.5 seconds
      const pollStart = Date.now();
      let generatedImageUrl: string | null = null;
      let pollCount = 0;

      while (Date.now() - pollStart < pollTimeout) {
        pollCount++;
        // Find assistant messages by article[data-testid^="conversation-turn-"] with h6 containing 'ChatGPT said:'
        const assistantCount = await page.$$eval(
          'article[data-testid^="conversation-turn-"]',
          (nodes: any[]) => nodes.filter(node => {
            const h6 = node.querySelector('h6');
            return h6 && h6.textContent && h6.textContent.includes('ChatGPT said:');
          }).length
        );
        console.log(`[CHATGPT-SESSION] Poll #${pollCount}: Found ${assistantCount} assistant articles.`);

        // Get all assistant articles and look for an image inside each
        const assistantImages: string[] = await page.$$eval(
          'article[data-testid^="conversation-turn-"]',
          (nodes: any[]) => nodes
            .filter(node => {
              const h6 = node.querySelector('h6');
              return h6 && h6.textContent && h6.textContent.includes('ChatGPT said:');
            })
            .map(node => {
              const img = node.querySelector('img');
              return img ? img.src : null;
            })
            .filter(Boolean)
        );
        console.log(`[CHATGPT-SESSION] Poll #${pollCount}: Found ${assistantImages.length} assistant articles with images.`);

        if (assistantImages.length > 0) {
          generatedImageUrl = assistantImages[assistantImages.length - 1];
          console.log(`[CHATGPT-SESSION] New generated image found in assistant article after polling: ${generatedImageUrl}`);
          break;
        }

        await new Promise(res => setTimeout(res, pollInterval));
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      }

      // If no image found after polling, use fallback logic
      if (!generatedImageUrl) {
        console.log('[CHATGPT-SESSION] Polling timed out, trying fallback methods...');
        const assistantImages: string[] = await page.$$eval(
          'article[data-testid^="conversation-turn-"]',
          (nodes: any[]) => nodes
            .filter(node => {
              const h6 = node.querySelector('h6');
              return h6 && h6.textContent && h6.textContent.includes('ChatGPT said:');
            })
            .map(node => {
              const img = node.querySelector('img');
              return img ? img.src : null;
            })
            .filter(Boolean)
        );
        generatedImageUrl = assistantImages[assistantImages.length - 1] || null;
        
        if (!generatedImageUrl) {
          // Final fallback: pull the last image in the DOM
          const allImages: string[] = await page.$$eval('img', (imgs: any[]) => imgs.map((img: any) => img.src));
          generatedImageUrl = allImages[allImages.length - 1] || null;
          
          if (!generatedImageUrl) {
            console.error('[CHATGPT-SESSION] No generated image found after multiple image upload.');
            await page.screenshot({ path: 'debug-multiple-images-polling.png' });
            console.error('[CHATGPT-SESSION] Screenshot saved as debug-multiple-images-polling.png');
            throw new Error('No generated image found after multiple image upload');
          }
          console.log('[CHATGPT-SESSION] Fallback: using last image in DOM:', generatedImageUrl);
        } else {
          console.log('[CHATGPT-SESSION] Using last assistant article image:', generatedImageUrl);
        }
      }

      // Download the image and convert to base64
      const response = await fetch(generatedImageUrl);
      if (!response.ok) throw new Error('Failed to download generated image');
      const buffer = await response.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');

      // Try to detect mime type from URL (default to jpeg)
      const ext = (generatedImageUrl.split('.').pop() || '').toLowerCase();
      const mime = ext === 'png' ? 'image/png' : 'image/jpeg';

      console.log('[CHATGPT-SESSION] Returning generated image as base64 from multiple image prompt.');
      return `data:${mime};base64,${base64}`;
    } catch (error) {
      console.error('[CHATGPT-SESSION] Error in sendMultipleImagePrompt:', error);
      throw error;
    }
  }

  public async closeSession(): Promise<void> {
    if (this.session) {
      console.log('[CHATGPT-SESSION] Closing session...');
      try {
        await this.session.browser.close();
      } catch (error) {
        console.error('[CHATGPT-SESSION] Error closing browser:', error);
      }
      this.session = null;
    }

    if (this.sessionTimeout) {
      clearTimeout(this.sessionTimeout);
      this.sessionTimeout = null;
    }
  }

  private resetSessionTimeout(): void {
    if (this.sessionTimeout) {
      clearTimeout(this.sessionTimeout);
    }

    this.sessionTimeout = setTimeout(async () => {
      console.log('[CHATGPT-SESSION] Session timeout, closing...');
      await this.closeSession();
    }, this.SESSION_TIMEOUT);
  }

  public isConnected(): boolean {
    return this.session?.isConnected || false;
  }
}

// Cleanup on process exit
process.on('SIGINT', async () => {
  const manager = ChatGPTSessionManager.getInstance();
  await manager.closeSession();
  process.exit();
});

process.on('SIGTERM', async () => {
  const manager = ChatGPTSessionManager.getInstance();
  await manager.closeSession();
  process.exit();
});

export default ChatGPTSessionManager; 