'use server';

import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { launchBrowser } from '@/lib/puppeteer-utils';
import fs from 'fs';
import path from 'path';
import os from 'os';

export async function POST(req: NextRequest) {
  let browser: any = null;
  
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { image, prompt } = await req.json();
    if (!image || !prompt) {
      return NextResponse.json({ error: 'Image and prompt are required' }, { status: 400 });
    }

    // Extract base64 data and save to temporary file
    const base64Data = image.split(',')[1];
    const imageBuffer = Buffer.from(base64Data, 'base64');
    const tempDir = os.tmpdir();
    const tempImagePath = path.join(tempDir, `sketch-${Date.now()}.png`);
    fs.writeFileSync(tempImagePath, imageBuffer);

    // Launch browser using our utility
    browser = await launchBrowser();

    const page = await browser.newPage();
    
    // Set viewport
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

    // Navigate to ChatGPT
    console.log('Navigating to ChatGPT...');
    await page.goto('https://chat.openai.com/', { waitUntil: 'networkidle2' });

    // Check if we are already logged in
    const chatInputSelector = 'textarea[data-id="root"]';
    let isLoggedIn = await page.$(chatInputSelector);

    if (!isLoggedIn) {
      console.log('Not logged in. Starting authentication...');
      
      try {
        // Click the "Log in" button
        const loginButtonSelector = 'button[data-testid="login-button"]';
        await page.waitForSelector(loginButtonSelector, { timeout: 15000 });
        await page.click(loginButtonSelector);

        console.log('Waiting for navigation to login page...');
        await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 20000 });
        
        console.log('Interacting directly with login page...');

        // Enter email
        console.log('Entering email...');
        const emailInputSelector = 'input#email-input';
        await page.waitForSelector(emailInputSelector, { timeout: 15000 });
        await page.type(emailInputSelector, "visionatedigital@gmail.com");
        
        // Click the first "Continue" button
        const continueButtonSelector = 'button.btn-primary';
        await page.waitForSelector(continueButtonSelector);
        await page.click(continueButtonSelector);

        // Enter password
        console.log('Entering password...');
        const passwordInputSelector = 'input#password';
        await page.waitForSelector(passwordInputSelector, { timeout: 10000 });
        await page.type(passwordInputSelector, "Ombre1sulgiallo!");
        
        // Click final "Continue" button
        const finalContinueButtons = await page.$$('button.btn-primary');
        if (finalContinueButtons.length > 0) {
           await finalContinueButtons[finalContinueButtons.length - 1].click();
        } else {
          throw new Error('Could not find final continue button');
        }

        console.log('Waiting for navigation to dashboard...');
        await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 });
      } catch (e: any) {
          const screenshotPath = path.join(os.tmpdir(), `chatgpt-login-error-${Date.now()}.png`);
          await page.screenshot({ path: screenshotPath });
          console.error(`Login failed. Screenshot saved to: ${screenshotPath}`);
          throw new Error(`Login failed. A screenshot of the error has been saved to ${screenshotPath}. Please check it to see what's blocking the process.`);
      }

    } else {
        console.log('Already logged in.');
    }

    // Ensure we are on a chat page
    if (!page.url().includes('chat.openai.com/c/')) {
        console.log('Not on a chat page, navigating to new chat...');
        await page.goto('https://chat.openai.com/?model=gpt-4', { waitUntil: 'networkidle2' });
    }
    
    // Wait for the chat interface to be ready
    await page.waitForSelector(chatInputSelector, { timeout: 15000 });

    // Upload the image
    console.log('Uploading image...');
    const fileInput = await page.$('input[type="file"]');
    if (!fileInput) {
      // If no file input is visible, we might need to click a button first
      const uploadButton = await page.$('button[aria-label="Attach files"]');
      if (uploadButton) {
        await uploadButton.click();
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    const fileInputSelector = 'input[type="file"]';
    await page.waitForSelector(fileInputSelector);
    await page.uploadFile(fileInputSelector, tempImagePath);

    // Wait for image to appear in the input area (indicating successful upload)
    console.log('Waiting for image to appear in input area...');
    await page.waitForSelector('div[data-testid*="attachment-image-"], div[data-testid*="file-"], div[class*="attachment"], div[class*="file-preview"]', { timeout: 15000 });
    console.log('Image successfully uploaded to input area.');

    // Additional wait to ensure UI is ready
    await new Promise(resolve => setTimeout(resolve, 500));

    // Type the prompt
    console.log('Typing prompt...');
    const textarea = await page.$('textarea[data-id="root"]');
    if (!textarea) {
      throw new Error('Could not find ChatGPT text input');
    }

    await textarea.click();
    await textarea.type(prompt);

    // Small delay after typing
    await new Promise(resolve => setTimeout(resolve, 300));

    // Smart sending: Check if send button is enabled before pressing Enter
    console.log('Checking if send button is enabled...');
    const sendButton = await page.$('button[aria-label*="Send"], button:has(svg[data-testid="SendIcon"]), button[data-testid="send-button"]');
    if (sendButton) {
      const isEnabled = await page.evaluate((btn: any) => !btn.disabled, sendButton);
      if (isEnabled) {
        console.log('Send button is enabled, pressing Enter...');
        await page.keyboard.press('Enter');
      } else {
        console.log('Send button is disabled, waiting and then clicking send button...');
        // Wait a bit more and try clicking the send button directly
        await new Promise(resolve => setTimeout(resolve, 1000));
        await sendButton.click();
      }
    } else {
      console.log('No send button found, trying Enter key...');
    await page.keyboard.press('Enter');
    }

    // Wait for response
    console.log('Waiting for response...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Look for generated image
    const imageSelector = 'img[src*="oaidalleapiprodscus"]';
    await page.waitForSelector(imageSelector, { timeout: 30000 });

    // Extract image URL
    const imageElement = await page.$(imageSelector);
    if (!imageElement) {
      throw new Error('No generated image found in response');
    }

    const imageUrl = await imageElement.evaluate((el: any) => el.getAttribute('src'));
    if (!imageUrl) {
      throw new Error('Could not extract image URL');
    }

    // Download the image and convert to base64
    console.log('Downloading generated image...');
    const imageResponse = await page.goto(imageUrl);
    const imageBufferResponse = await imageResponse?.buffer();
    
    if (!imageBufferResponse) {
      throw new Error('Failed to download generated image');
    }

    const base64Image = imageBufferResponse.toString('base64');
    const finalImageData = `data:image/png;base64,${base64Image}`;

    // Clean up temporary file
    try {
      fs.unlinkSync(tempImagePath);
    } catch (error) {
      console.warn('Failed to delete temporary file:', error);
    }

    return NextResponse.json({ image: finalImageData });

  } catch (error: any) {
    console.error('[CHATGPT AUTOMATION ERROR]', error);
    return NextResponse.json({ error: error.message || 'Failed to generate image via ChatGPT' }, { status: 500 });
  } finally {
    if (browser) {
      await browser.close();
    }
  }
} 