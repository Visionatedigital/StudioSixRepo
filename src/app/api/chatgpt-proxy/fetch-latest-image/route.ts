import { NextRequest, NextResponse } from 'next/server';
import ChatGPTSessionManager from '@/lib/chatgpt-session-playwright';

export async function POST() {
  try {
    const sessionManager = ChatGPTSessionManager.getInstance();
    const session = await sessionManager.getSession();
    if (!session) throw new Error('No active ChatGPT session');
    const page = session.page;

    // Find the last generated image in the chat
    const imageSelector = 'img[src^="https://files.oaiusercontent.com/"]';
    const allImageUrls: string[] = await page.$$eval(imageSelector, (imgs: any[]) => imgs.map((img: any) => (img as HTMLImageElement).src));
    const latestImageUrl = allImageUrls[allImageUrls.length - 1];
    if (!latestImageUrl) throw new Error('No generated image found in chat');

    // Download and return as base64
    const response = await fetch(latestImageUrl);
    if (!response.ok) throw new Error('Failed to download generated image');
    const buffer = await response.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    const ext = (latestImageUrl.split('.').pop() || '').toLowerCase();
    const mime = ext === 'png' ? 'image/png' : 'image/jpeg';
    return NextResponse.json({ image: `data:${mime};base64,${base64}` });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch latest image' }, { status: 500 });
  }
} 