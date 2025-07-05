import { NextRequest, NextResponse } from 'next/server';
import ChatGPTSessionManager from '@/lib/chatgpt-session-playwright';
import { supabase } from '@/lib/supabaseClient';

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
  const supabasePaths: string[] = [];
  try {
    // Save all uploaded images to Supabase Storage
    for (let i = 0; i < imageCount; i++) {
      const imageFile = formData.get(`image${i}`) as File;
      if (imageFile) {
        const buffer = Buffer.from(await imageFile.arrayBuffer());
        const fileName = `${Date.now()}-${i}-${imageFile.name}`;
        const supabasePath = `canvas-renders/${fileName}`;
        const { error: uploadError } = await supabase.storage
          .from('all-uploads')
          .upload(supabasePath, buffer, { upsert: true, contentType: imageFile.type });
        if (uploadError) {
          return NextResponse.json({ error: uploadError.message }, { status: 500 });
        }
        supabasePaths.push(supabasePath);
      }
    }

    if (supabasePaths.length === 0) {
      return NextResponse.json({ error: 'No valid images provided' }, { status: 400 });
    }

    // Get public URLs for the uploaded images
    const publicUrls = supabasePaths.map(path => {
      const { data } = supabase.storage.from('all-uploads').getPublicUrl(path);
      return data?.publicUrl;
    });

    // You may need to adjust this part depending on how ChatGPTSessionManager expects image input
    const sessionManager = ChatGPTSessionManager.getInstance();
    const session = await sessionManager.getSession() || await sessionManager.createSession();
    // If your sessionManager expects file paths, you may need to update it to accept URLs or buffers
    const imageBase64 = await sessionManager.sendMultipleImagePrompt(prompt, publicUrls);

    return NextResponse.json({ image: imageBase64 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to generate image' }, { status: 500 });
  }
} 