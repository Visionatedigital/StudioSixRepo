import { launchPlaywrightBrowser, closeBrowser } from './playwright-utils';
import type { Browser, BrowserContext, Page } from 'playwright-core';
import fs from 'fs';

interface ChatGPTSession {
  browser: Browser;
  context: BrowserContext;
  page: Page;
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
      console.log('[CHATGPT-SESSION] Attempting to launch browser...');
      
      // Add timeout and retry logic for browser launch
      let browserResult;
      let lastError;
      
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          console.log(`[CHATGPT-SESSION] Browser launch attempt ${attempt}/3...`);
          browserResult = await Promise.race([
            launchPlaywrightBrowser(),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Browser launch timeout')), 60000)
            )
          ]) as { browser: Browser; context: BrowserContext; page: Page };
          console.log('[CHATGPT-SESSION] Browser launched successfully');
          break;
        } catch (error) {
          lastError = error;
          console.error(`[CHATGPT-SESSION] Browser launch attempt ${attempt} failed:`, error);
          if (attempt < 3) {
            console.log(`[CHATGPT-SESSION] Waiting 5 seconds before retry...`);
            await new Promise(resolve => setTimeout(resolve, 5000));
          }
        }
      }
      
      if (!browserResult) {
        throw lastError || new Error('Failed to launch browser after 3 attempts');
      }

      const { browser, context, page } = browserResult;

      // Add stealth measures
      await page.addInitScript(() => {
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
      });

      // Load cookies if available
      if (fs.existsSync('chatgpt-cookies.json')) {
        let cookies = JSON.parse(fs.readFileSync('chatgpt-cookies.json', 'utf-8'));
        // Convert Puppeteer cookie format to Playwright format
        const playwrightCookies = cookies.map((cookie: any) => ({
          name: cookie.name,
          value: cookie.value,
          domain: cookie.domain,
          path: cookie.path,
          expires: cookie.expires ? cookie.expires : undefined,
          httpOnly: cookie.httpOnly,
          secure: cookie.secure,
          sameSite: cookie.sameSite
        }));
        await context.addCookies(playwrightCookies);
        console.log('[CHATGPT-SESSION] Loaded cookies from file');
      }

      // Navigate to ChatGPT
      console.log('[CHATGPT-SESSION] Navigating to ChatGPT...');
      await page.goto('https://chatgpt.com/', { waitUntil: 'networkidle', timeout: 30000 });

      // Check if already logged in
      let chatInputSelector = 'textarea[data-testid="prompt-textarea"]';
      let isLoggedIn = await page.locator(chatInputSelector).first().isVisible().catch(() => false);

      // If not found, try waiting up to 30s for a visible textarea with placeholder 'Ask anything'
      if (!isLoggedIn) {
        console.log('[CHATGPT-SESSION] Trying fallback selector for chat input...');
        chatInputSelector = 'textarea[placeholder="Ask anything"]';
        
        try {
          await page.locator(chatInputSelector).first().waitFor({ timeout: 30000 });
          isLoggedIn = await page.locator(chatInputSelector).first().isVisible();
        } catch (e) {
          // Try any textarea as fallback
          chatInputSelector = 'textarea';
          isLoggedIn = await page.locator(chatInputSelector).first().isVisible().catch(() => false);
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
        const title = await page.title();
        console.log('[CHATGPT-SESSION] Page title:', title);
        
        if (pageContent.includes('Sign in') || pageContent.includes('Log in')) {
          console.log('[CHATGPT-SESSION] Page appears to be a login page');
        } else if (pageContent.includes('error') || pageContent.includes('Error')) {
          console.log('[CHATGPT-SESSION] Page appears to have an error');
        } else if (pageContent.includes('chat.openai.com') || pageContent.includes('chatgpt.com')) {
          console.log('[CHATGPT-SESSION] Page appears to be ChatGPT but no chat input found');
        } else {
          console.log('[CHATGPT-SESSION] Page content preview:', pageContent.substring(0, 1000));
        }
        
        throw new Error('ChatGPT login required or page not accessible');
      }

      console.log('[CHATGPT-SESSION] Successfully connected to ChatGPT');

      // Save cookies after successful login
      const cookies = await context.cookies();
      fs.writeFileSync('chatgpt-cookies.json', JSON.stringify(cookies, null, 2));
      console.log('[CHATGPT-SESSION] Saved cookies to file');

      const session: ChatGPTSession = {
        browser,
        context,
        page,
        isConnected: true,
        lastActivity: new Date()
      };

      this.session = session;
      this.resetSessionTimeout();

      return session;
    } catch (error) {
      console.error('[CHATGPT-SESSION] Error creating session:', error);
      throw error;
    }
  }

  public async sendMessage(message: string): Promise<string> {
    const session = await this.getSession();
    if (!session) {
      throw new Error('No active ChatGPT session');
    }

    try {
      const { page } = session;
      
      // Find the chat input
      const chatInputSelector = 'textarea[data-testid="prompt-textarea"], textarea[placeholder="Ask anything"], textarea';
      await page.locator(chatInputSelector).first().waitFor({ timeout: 10000 });
      
      // Clear and type the message
      await page.locator(chatInputSelector).first().clear();
      await page.locator(chatInputSelector).first().fill(message);
      
      // Submit the message
      await page.keyboard.press('Enter');
      
      // Wait for response
      await page.waitForTimeout(2000);
      
      // Wait for the response to appear and stop generating
      let attempts = 0;
      const maxAttempts = 60; // 60 seconds max wait
      
      while (attempts < maxAttempts) {
        // Check if ChatGPT is still generating
        const isGenerating = await page.locator('[data-testid="stop-button"]').isVisible().catch(() => false);
        
        if (!isGenerating) {
          // Wait a bit more to ensure response is complete
          await page.waitForTimeout(1000);
          break;
        }
        
        await page.waitForTimeout(1000);
        attempts++;
      }
      
      // Get the latest response
      const responseElements = await page.locator('[data-message-author-role="assistant"]').all();
      if (responseElements.length === 0) {
        throw new Error('No response received from ChatGPT');
      }
      
      const latestResponse = responseElements[responseElements.length - 1];
      const responseText = await latestResponse.textContent();
      
      return responseText || 'No response text found';
      
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

    try {
      const { page } = session;
      console.log('[CHATGPT-SESSION] Uploading image and sending prompt...');
      
      // Find and click the add files button
      const addButtonSelector = 'button[aria-label*="Add photos and files"], button[aria-label*="Attach files"], button[aria-label*="Upload"]';
      let addButton = page.locator(addButtonSelector).first();
      
      if (!(await addButton.isVisible().catch(() => false))) {
        // Try clicking the "+" button if visible
        const plusButton = page.locator('button:has(svg[data-testid="PlusIcon"])').first();
        if (await plusButton.isVisible().catch(() => false)) {
          await plusButton.click();
          await page.waitForTimeout(500);
        }
      }
      
      await addButton.click();
      await page.waitForTimeout(500);
      
      // Upload the image
      const fileInput = page.locator('input[type="file"]').first();
      await fileInput.setInputFiles(imagePath);
      await page.waitForTimeout(1500);
      
      // Type the prompt
      const chatInputSelector = 'textarea[data-testid="prompt-textarea"], textarea[placeholder="Ask anything"], textarea';
      await page.locator(chatInputSelector).first().clear();
      await page.locator(chatInputSelector).first().fill(prompt);
      await page.waitForTimeout(300);
      
      // Send the message
      await page.keyboard.press('Enter');
      await page.waitForTimeout(1000);
      
      // Wait for image generation (3 minutes 20 seconds)
      console.log('[CHATGPT-SESSION] Waiting for image generation...');
      await page.waitForTimeout(200000);
      
      // Poll for generated image
      const pollTimeout = 180000; // 3 minutes
      const pollStart = Date.now();
      let generatedImageUrl: string | null = null;
      
      while (Date.now() - pollStart < pollTimeout) {
        // Scroll to bottom
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        
        // Look for assistant messages with images
        const assistantImages = await page.locator('article[data-testid^="conversation-turn-"] img').all();
        if (assistantImages.length > 0) {
          const lastImage = assistantImages[assistantImages.length - 1];
          generatedImageUrl = await lastImage.getAttribute('src');
          if (generatedImageUrl) {
            console.log('[CHATGPT-SESSION] Generated image found:', generatedImageUrl);
            break;
          }
        }
        
        await page.waitForTimeout(2500);
      }
      
      if (!generatedImageUrl) {
        throw new Error('No generated image found');
      }
      
      // Download and convert to base64
      const response = await fetch(generatedImageUrl);
      if (!response.ok) throw new Error('Failed to download generated image');
      const buffer = await response.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');
      
      const ext = (generatedImageUrl.split('.').pop() || '').toLowerCase();
      const mime = ext === 'png' ? 'image/png' : 'image/jpeg';
      
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

    try {
      const { page } = session;
      console.log(`[CHATGPT-SESSION] Uploading ${imagePaths.length} images and sending prompt...`);
      
      // Upload all images
      for (let i = 0; i < imagePaths.length; i++) {
        console.log(`[CHATGPT-SESSION] Uploading image ${i + 1}/${imagePaths.length}...`);
        
        // Find and click the add files button
        const addButtonSelector = 'button[aria-label*="Add photos and files"], button[aria-label*="Attach files"], button[aria-label*="Upload"]';
        let addButton = page.locator(addButtonSelector).first();
        
        if (!(await addButton.isVisible().catch(() => false))) {
          const plusButton = page.locator('button:has(svg[data-testid="PlusIcon"])').first();
          if (await plusButton.isVisible().catch(() => false)) {
            await plusButton.click();
            await page.waitForTimeout(500);
          }
        }
        
        await addButton.click();
        await page.waitForTimeout(500);
        
        // Upload the image
        const fileInput = page.locator('input[type="file"]').first();
        await fileInput.setInputFiles(imagePaths[i]);
        await page.waitForTimeout(1500);
      }
      
      // Type the prompt
      const chatInputSelector = 'textarea[data-testid="prompt-textarea"], textarea[placeholder="Ask anything"], textarea';
      await page.locator(chatInputSelector).first().clear();
      await page.locator(chatInputSelector).first().fill(prompt);
      await page.waitForTimeout(300);
      
      // Send the message
      await page.keyboard.press('Enter');
      await page.waitForTimeout(1000);
      
      // Wait for image generation
      console.log('[CHATGPT-SESSION] Waiting for image generation...');
      await page.waitForTimeout(200000);
      
      // Poll for generated image
      const pollTimeout = 180000;
      const pollStart = Date.now();
      let generatedImageUrl: string | null = null;
      
      while (Date.now() - pollStart < pollTimeout) {
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        
        const assistantImages = await page.locator('article[data-testid^="conversation-turn-"] img').all();
        if (assistantImages.length > 0) {
          const lastImage = assistantImages[assistantImages.length - 1];
          generatedImageUrl = await lastImage.getAttribute('src');
          if (generatedImageUrl) {
            console.log('[CHATGPT-SESSION] Generated image found:', generatedImageUrl);
            break;
          }
        }
        
        await page.waitForTimeout(2500);
      }
      
      if (!generatedImageUrl) {
        throw new Error('No generated image found after multiple image upload');
      }
      
      // Download and convert to base64
      const response = await fetch(generatedImageUrl);
      if (!response.ok) throw new Error('Failed to download generated image');
      const buffer = await response.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');
      
      const ext = (generatedImageUrl.split('.').pop() || '').toLowerCase();
      const mime = ext === 'png' ? 'image/png' : 'image/jpeg';
      
      return `data:${mime};base64,${base64}`;
      
    } catch (error) {
      console.error('[CHATGPT-SESSION] Error in sendMultipleImagePrompt:', error);
      throw error;
    }
  }

  public async closeSession(): Promise<void> {
    if (this.session) {
      console.log('[CHATGPT-SESSION] Closing session...');
      
      if (this.sessionTimeout) {
        clearTimeout(this.sessionTimeout);
        this.sessionTimeout = null;
      }
      
      try {
        await closeBrowser(this.session.browser);
      } catch (error) {
        console.error('[CHATGPT-SESSION] Error closing browser:', error);
      }
      
      this.session = null;
      console.log('[CHATGPT-SESSION] Session closed');
    }
  }

  private resetSessionTimeout(): void {
    if (this.sessionTimeout) {
      clearTimeout(this.sessionTimeout);
    }
    
    this.sessionTimeout = setTimeout(async () => {
      console.log('[CHATGPT-SESSION] Session timeout reached, closing...');
      await this.closeSession();
    }, this.SESSION_TIMEOUT);
  }

  public isConnected(): boolean {
    return this.session?.isConnected || false;
  }
}

export default ChatGPTSessionManager; 