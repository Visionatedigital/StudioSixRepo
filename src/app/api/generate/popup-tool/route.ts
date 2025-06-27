import { NextRequest, NextResponse } from 'next/server';
import { chromium, Page, BrowserContext } from 'playwright';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';

const SESSION_PATH = path.join(os.tmpdir(), 'chatgpt-session.json');

let browser: any = null;

async function getContext(): Promise<BrowserContext> {
    if (!browser) {
        browser = await chromium.launch({ headless: false });
    }
    // Try to load session
    try {
        await fs.access(SESSION_PATH);
        console.log('Loading existing session from session.json');
        return browser.newContext({ storageState: SESSION_PATH });
    } catch {
        console.log('No session found, starting fresh context.');
        return browser.newContext();
    }
}

async function ensureLoggedIn(page: Page, context: BrowserContext) {
    await page.goto('https://chatgpt.com/', { waitUntil: 'networkidle' });
    try {
        await page.waitForSelector('textarea[data-id="root"]', { timeout: 10000 });
        console.log('✅ Already logged in!');
        return;
    } catch {
        // Not logged in, prompt for manual login
        console.log('Please log in to ChatGPT manually in the opened browser window.');
        await page.waitForSelector('textarea[data-id="root"]', { timeout: 120000 });
        console.log('✅ Manual login successful! Saving session...');
        await context.storageState({ path: SESSION_PATH });
        console.log('✅ Session saved to session.json. Future runs will reuse this session.');
    }
}

export async function POST(req: NextRequest) {
    const formData = await req.formData();
    const prompt = formData.get('prompt') as string;
    const file = formData.get('file') as File;

    if (!prompt || !file) {
        return NextResponse.json({ error: 'Prompt and file are required.' }, { status: 400 });
    }

    // Save file temporarily
    const tempDir = os.tmpdir();
    const tempFilePath = path.join(tempDir, `upload-${Date.now()}-${file.name}`);
    await fs.writeFile(tempFilePath, Buffer.from(await file.arrayBuffer()));

    let context: BrowserContext | null = null;
    let page: Page | null = null;
    try {
        context = await getContext();
        page = await context.newPage();
        await ensureLoggedIn(page, context);

        // Go to new chat if not already there
        if (!page.url().includes('chatgpt.com')) {
            await page.goto('https://chatgpt.com/?model=gpt-4o', { waitUntil: 'networkidle' });
        }
        await page.waitForSelector('textarea[data-id="root"]');

        // --- Image Upload via File Chooser ---
        console.log('Uploading image...');
        // Click the + button to open the attachment menu
        await page.click('button[aria-label="Add to conversation"]');
        // Click the file upload button and handle the file chooser
        const [fileChooser] = await Promise.all([
            page.waitForEvent('filechooser'),
            page.click('button[aria-label="Upload file"]'),
        ]);
        await fileChooser.setFiles(tempFilePath);
        // Wait for image to appear in the input area
        await page.waitForSelector('div[data-testid*="attachment-image-"]', { timeout: 15000 });
        console.log('Image uploaded to input area.');

        // --- Prompt Submission ---
        console.log('Typing prompt...');
        await page.locator('textarea[data-id="root"]').fill(prompt);
        await page.keyboard.press('Enter');

        // --- Wait for Response ---
        console.log('Waiting for response...');
        await page.waitForSelector('[data-testid="generating-indicator"]', { state: 'detached', timeout: 180000 });

        // --- Extract Image URL ---
        const generatedImageUrl = await page.evaluate(() => {
            const assistantMessages = Array.from(document.querySelectorAll('[data-testid^="conversation-turn-"][data-agent-id=""]'));
            const lastMessage = assistantMessages[assistantMessages.length - 1];
            const img = lastMessage?.querySelector('img.rounded-md');
            return img ? img.getAttribute('src') : null;
        });

        if (!generatedImageUrl) {
            throw new Error('Could not find the generated image in the response.');
        }

        console.log('Found generated image URL:', generatedImageUrl);
        return NextResponse.json({ imageUrl: generatedImageUrl });
    } catch (error: any) {
        console.error('Error during image generation process:', error);
        return NextResponse.json({ error: 'Failed to generate image.', details: error.message }, { status: 500 });
    } finally {
        if (page) await page.close();
        if (context) await context.close();
        await fs.unlink(tempFilePath).catch(() => {});
    }
}
