import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    console.log('[OPENAI-IMAGE] Starting image generation request...');
    
    const formData = await request.formData();
    const prompt = formData.get('prompt') as string;
    const imageCount = parseInt(formData.get('imageCount') as string) || 0;
    
    if (!prompt || !prompt.trim()) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }
    
    if (imageCount === 0) {
      return NextResponse.json({ error: 'At least one image is required' }, { status: 400 });
    }
    
    console.log(`[OPENAI-IMAGE] Processing ${imageCount} images with prompt:`, prompt);
    
    // Extract and convert images to base64
    const imageBase64Array: string[] = [];
    for (let i = 0; i < imageCount; i++) {
      const imageFile = formData.get(`image${i}`) as File;
      if (imageFile) {
        const arrayBuffer = await imageFile.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString('base64');
        const mimeType = imageFile.type || 'image/jpeg';
        const dataUrl = `data:${mimeType};base64,${base64}`;
        imageBase64Array.push(dataUrl);
        console.log(`[OPENAI-IMAGE] Converted image ${i + 1} to base64 (${mimeType})`);
      }
    }
    
    if (imageBase64Array.length === 0) {
      return NextResponse.json({ error: 'No valid images found' }, { status: 400 });
    }
    
    // Step 1: Use GPT-4 Vision to analyze the images and enhance the prompt
    console.log('[OPENAI-IMAGE] Step 1: Analyzing images with GPT-4 Vision...');
    
    const visionMessages: any[] = [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `Please analyze the uploaded architectural sketch(es) and the user's request: "${prompt}"

Create a highly detailed DALL-E prompt that:
1. Describes what you see in the sketch(es) - architectural elements, spatial relationships, proportions
2. Incorporates the user's specific request 
3. Adds professional architectural visualization details
4. Maintains the design intent and layout from the original sketch
5. Enhances with realistic materials, lighting, and environmental context

The output should be a single, comprehensive prompt for DALL-E that will generate a photorealistic architectural rendering based on the sketch while fulfilling the user's request.

Format: Return ONLY the DALL-E prompt, nothing else.`
          },
          ...imageBase64Array.map(base64 => ({
            type: "image_url",
            image_url: {
              url: base64,
              detail: "high"
            }
          }))
        ]
      }
    ];
    
    const visionResponse = await openai.chat.completions.create({
      model: "gpt-4o", // GPT-4 with vision
      messages: visionMessages,
      max_tokens: 500,
      temperature: 0.7,
    });
    
    const enhancedPrompt = visionResponse.choices[0]?.message?.content?.trim();
    
    if (!enhancedPrompt) {
      throw new Error('Failed to generate enhanced prompt from vision analysis');
    }
    
    console.log('[OPENAI-IMAGE] Enhanced prompt created:', enhancedPrompt);
    
    // Step 2: Use DALL-E to generate the image with the enhanced prompt
    console.log('[OPENAI-IMAGE] Step 2: Generating image with DALL-E...');
    
    const dalleResponse = await openai.images.generate({
      model: "dall-e-3",
      prompt: enhancedPrompt,
      size: "1024x1024",
      quality: "hd",
      style: "natural", // More realistic style
      n: 1,
    });
    
    const generatedImageUrl = dalleResponse.data?.[0]?.url;
    
    if (!generatedImageUrl) {
      throw new Error('Failed to generate image with DALL-E');
    }
    
    console.log('[OPENAI-IMAGE] ✅ Image generated successfully:', generatedImageUrl);
    
    return NextResponse.json({
      image: generatedImageUrl,
      enhancedPrompt,
      originalPrompt: prompt,
      success: true
    });
    
  } catch (error: any) {
    console.error('[OPENAI-IMAGE] Error:', error);
    
    // Handle specific OpenAI errors
    if (error.type === 'insufficient_quota') {
      return NextResponse.json({ 
        error: 'OpenAI API quota exceeded. Please check your API usage.' 
      }, { status: 429 });
    }
    
    if (error.status === 400 && error.message?.includes('content_policy')) {
      return NextResponse.json({ 
        error: 'Image content violates OpenAI content policy. Please try a different image or prompt.' 
      }, { status: 400 });
    }
    
    return NextResponse.json({ 
      error: error.message || 'Failed to generate image' 
    }, { status: 500 });
  }
} 