import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    // Parse multipart form data
    const formData = await req.formData();
    const prompt = formData.get('prompt');
    const file = formData.get('file');

    if (!prompt || !file || typeof prompt !== 'string' || !(file instanceof Blob)) {
      return NextResponse.json({ error: 'Missing prompt or file' }, { status: 400 });
    }

    // Prepare form data for Stable Diffusion WebUI
    const sdFormData = new FormData();
    sdFormData.append('prompt', prompt);
    sdFormData.append('file', file, (file as File).name || 'input.png');

    // Send to Stable Diffusion WebUI
    const sdResponse = await fetch('https://1tqqsb8mr2nea5-80.proxy.runpod.net/', {
      method: 'POST',
      body: sdFormData,
    });

    if (!sdResponse.ok) {
      const errorText = await sdResponse.text();
      return NextResponse.json({ error: 'Stable Diffusion error', details: errorText }, { status: 500 });
    }

    // Assume the response is an image (or a JSON with image URL)
    const contentType = sdResponse.headers.get('content-type');
    if (contentType && contentType.startsWith('application/json')) {
      const data = await sdResponse.json();
      return NextResponse.json({ imageUrl: data.image || data.imageUrl || data.url });
    } else {
      // If it's an image blob, convert to base64 data URL
      const arrayBuffer = await sdResponse.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString('base64');
      const mime = contentType || 'image/png';
      const dataUrl = `data:${mime};base64,${base64}`;
      return NextResponse.json({ image: dataUrl });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Unknown error' }, { status: 500 });
  }
} 