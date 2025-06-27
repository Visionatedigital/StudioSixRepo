import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { Frame } from 'puppeteer';

// Apply the stealth plugin
puppeteer.use(StealthPlugin());

export async function POST(req: NextRequest) {
  let browser: any = null;
  
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { prompt } = await req.json();
    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // Launch browser in headless mode
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    // Navigate to ChatGPT
    console.log('[AI-CHAT] Navigating to ChatGPT...');
    await page.goto('https://chat.openai.com/', { waitUntil: 'networkidle2' });

    // --- Login Logic ---
    const chatInputSelector = 'textarea[data-id="root"]';
    let isLoggedIn = await page.$(chatInputSelector);

    if (!isLoggedIn) {
      console.log('[AI-CHAT] Not logged in. Starting authentication...');
      // Use existing login logic...
      // (This assumes the login flow from the image generation script is applicable here)
        const loginButtonSelector = 'button[data-testid="login-button"]';
        await page.waitForSelector(loginButtonSelector, { timeout: 15000 });
        await page.click(loginButtonSelector);
        await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 20000 });
        const emailInputSelector = 'input#email-input';
        await page.waitForSelector(emailInputSelector, { timeout: 15000 });
        await page.type(emailInputSelector, "visionatedigital@gmail.com");
        const continueButtonSelector = 'button.btn-primary';
        await page.waitForSelector(continueButtonSelector);
        await page.click(continueButtonSelector);
        const passwordInputSelector = 'input#password';
        await page.waitForSelector(passwordInputSelector, { timeout: 10000 });
        await page.type(passwordInputSelector, "Ombre1sulgiallo!");
        const finalContinueButtons = await page.$$('button.btn-primary');
        if (finalContinueButtons.length > 0) {
           await finalContinueButtons[finalContinueButtons.length - 1].click();
        } else {
          throw new Error('Could not find final continue button');
        }
        await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 });
    } else {
        console.log('[AI-CHAT] Already logged in.');
    }

    // Ensure we are on a new chat page
    console.log('[AI-CHAT] Navigating to new chat...');
    await page.goto('https://chat.openai.com/?model=gpt-4', { waitUntil: 'networkidle2' });
    await page.waitForSelector(chatInputSelector, { timeout: 15000 });

    // --- Submit Prompt & Get Response ---
    console.log('[AI-CHAT] Submitting prompt:', prompt);
    await page.type(chatInputSelector, prompt);
    await page.keyboard.press('Enter');

    console.log('[AI-CHAT] Waiting for response...');
    // Wait for the response to appear. This selector targets the container of the latest response.
    const responseSelector = 'div.markdown.prose';
    await page.waitForSelector(`${responseSelector}:not(:empty)`);
    
    // Give a little extra time for the full response to stream
    await new Promise(resolve => setTimeout(resolve, 3000));

    const responses = await page.$$eval(responseSelector, (elements: Element[]) => {
      return elements.map((el: Element) => el.innerHTML);
    });

    // The last element should be the newest response
    const lastResponse = responses[responses.length - 1];

    if (!lastResponse) {
        throw new Error('Could not find a response from ChatGPT.');
    }

    console.log('[AI-CHAT] Got response.');
    return NextResponse.json({ response: lastResponse });

  } catch (error: any) {
    console.error('[AI-CHAT API ERROR]', error);
    return NextResponse.json({ error: error.message || 'Failed to get response from ChatGPT' }, { status: 500 });
  } finally {
    if (browser) {
      await browser.close();
    }
  }
} 