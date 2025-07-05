'use server';

import { launchBrowser } from './puppeteer-utils';

export interface ChatGPTConfig {
  email?: string;
  password?: string;
  sessionToken?: string;
  headless?: boolean;
}

export class ChatGPTAutomation {
  private config: ChatGPTConfig;
  private browser: any = null;
  private page: any = null;

  constructor(config: ChatGPTConfig = {}) {
    this.config = {
      headless: true,
      ...config
    };
  }

  async initialize(): Promise<void> {
    this.browser = await launchBrowser();

    this.page = await this.browser.newPage();
    await this.page.setViewport({ width: 1280, height: 720 });
  }

  async login(): Promise<void> {
    if (!this.page) throw new Error('Browser not initialized');

    // Navigate to ChatGPT
    await this.page.goto('https://chat.openai.com/', { waitUntil: 'networkidle2' });

    // Check if already logged in
    const isLoggedIn = await this.page.$('textarea[data-id="root"]');
    if (isLoggedIn) {
      console.log('Already logged in to ChatGPT');
      return;
    }

    // Click login button
    await this.page.click('a[href="/auth/login"]');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Fill in credentials if provided
    if (this.config.email && this.config.password) {
      await this.page.type('input[name="username"]', this.config.email);
      await this.page.click('button[type="submit"]');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      await this.page.type('input[name="password"]', this.config.password);
      await this.page.click('button[type="submit"]');
      await new Promise(resolve => setTimeout(resolve, 5000));
    } else {
      console.log('Please log in manually...');
      // Wait for manual login (in non-headless mode)
      await this.page.waitForSelector('textarea[data-id="root"]', { timeout: 60000 });
    }
  }

  async generateImage(imagePath: string, prompt: string): Promise<string> {
    if (!this.page) throw new Error('Browser not initialized');

    // Wait for chat interface
    await this.page.waitForSelector('textarea[data-id="root"]');

    // Upload image
    let fileInputElement = await this.page.$('input[type="file"]');
    if (!fileInputElement) {
      const uploadButton = await this.page.$('button[aria-label="Attach files"]');
      if (uploadButton) {
        await uploadButton.click();
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    await this.page.waitForSelector('input[type="file"]');
    fileInputElement = await this.page.$('input[type="file"]');
    if (fileInputElement) {
      await fileInputElement.uploadFile(imagePath);
    }
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Type and submit prompt
    const textarea = await this.page.$('textarea[data-id="root"]');
    if (!textarea) throw new Error('Could not find text input');
    
    await textarea.click();
    await textarea.type(prompt);
    await this.page.keyboard.press('Enter');

    // Wait for response
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Look for generated image
    const imageSelector = 'img[src*="oaidalleapiprodscus"]';
    await this.page.waitForSelector(imageSelector, { timeout: 30000 });

    // Extract image URL
    const imageElement = await this.page.$(imageSelector);
    if (!imageElement) throw new Error('No generated image found');

    const imageUrl = await imageElement.evaluate((el: Element) => el.getAttribute('src'));
    if (!imageUrl) throw new Error('Could not extract image URL');

    // Download image
    const imageResponse = await this.page.goto(imageUrl);
    const imageBuffer = await imageResponse?.buffer();
    
    if (!imageBuffer) throw new Error('Failed to download image');

    return imageBuffer.toString('base64');
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.page = null;
    }
  }
}

// Helper function to save base64 image to temp file
export function saveBase64ToTemp(base64Data: string): string {
  const fs = require('fs');
  const os = require('os');
  const path = require('path');
  
  const imageBuffer = Buffer.from(base64Data.split(',')[1], 'base64');
  const tempDir = os.tmpdir();
  const tempPath = path.join(tempDir, `sketch-${Date.now()}.png`);
  
  fs.writeFileSync(tempPath, imageBuffer);
  return tempPath;
} 