import { NextRequest, NextResponse } from 'next/server';
import ChatGPTSessionManager from '@/lib/chatgpt-session';
import fs from 'fs';
import path from 'path';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  // Parse form data
  const formData = await req.formData();
  const prompt = formData.get('prompt') as string;
  const imageCount = parseInt(formData.get('imageCount') as string) || 0;

  if (!prompt || imageCount === 0) {
    return NextResponse.json({ error: 'Missing prompt or images' }, { status: 400 });
  }

  // Process all uploaded images
  const tempPaths: string[] = [];
  const tempDir = path.join(process.cwd(), 'tmp');
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

  try {
    // Save all uploaded images to temp files
    for (let i = 0; i < imageCount; i++) {
      const imageFile = formData.get(`image${i}`) as File;
      if (imageFile) {
        const buffer = Buffer.from(await imageFile.arrayBuffer());
        const tempPath = path.join(tempDir, `${Date.now()}-${i}-${imageFile.name}`);
  fs.writeFileSync(tempPath, buffer);
        tempPaths.push(tempPath);
      }
    }

    if (tempPaths.length === 0) {
      return NextResponse.json({ error: 'No valid images provided' }, { status: 400 });
    }

    const sessionManager = ChatGPTSessionManager.getInstance();
    const session = await sessionManager.getSession() || await sessionManager.createSession();
    
    // Send all images with the prompt to ChatGPT
    const imageBase64 = await sessionManager.sendMultipleImagePrompt(prompt, tempPaths);
    
    // Clean up temp files
    tempPaths.forEach(path => {
      if (fs.existsSync(path)) fs.unlinkSync(path);
    });
    
    return NextResponse.json({ image: imageBase64 });
  } catch (error: any) {
    // Clean up temp files on error
    tempPaths.forEach(path => {
      if (fs.existsSync(path)) fs.unlinkSync(path);
    });
    return NextResponse.json({ error: error.message || 'Failed to generate image' }, { status: 500 });
  }
} 