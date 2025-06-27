import { NextResponse, NextRequest } from 'next/server';
import OpenAI, { toFile } from 'openai';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { image, prompt } = await req.json();
    if (!image || !prompt) {
      return NextResponse.json({ error: 'Image and prompt are required' }, { status: 400 });
    }

    // Step 1: Use GPT-4o with vision to analyze the sketch and generate a precise DALL-E prompt
    const visionResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert architectural visualization specialist. Your job is to analyze a sketch and create a highly specific DALL-E prompt that will preserve the exact structure, layout, and composition of the sketch while applying the requested stylistic transformation.

IMPORTANT: Your response must be ONLY the DALL-E prompt text, nothing else. No explanations, no markdown formatting, just the raw prompt that can be sent directly to DALL-E 3.`
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this architectural sketch and create a DALL-E prompt that will generate a photorealistic render. The sketch shows the exact structure and layout that must be preserved. Apply this stylistic transformation: "${prompt}"

Your prompt must be extremely specific about maintaining the exact proportions, angles, positioning, and spatial relationships shown in the sketch.`
            },
            {
              type: "image_url",
              image_url: {
                url: image
              }
            }
          ]
        }
      ],
      max_tokens: 1000
    });

    const dallePrompt = visionResponse.choices[0]?.message?.content;
    if (!dallePrompt) {
      throw new Error('Failed to generate DALL-E prompt from sketch analysis');
    }

    console.log('Generated DALL-E prompt:', dallePrompt);

    // Step 2: Use the generated prompt with DALL-E 3
    const imageResponse = await openai.images.generate({
      model: "dall-e-3",
      prompt: dallePrompt,
      size: "1024x1024",
      response_format: "b64_json",
      quality: "hd"
    });

    const generatedImage = imageResponse.data?.[0];
    if (!generatedImage?.b64_json) {
      throw new Error('DALL-E failed to generate image');
    }

    const finalImageData = `data:image/png;base64,${generatedImage.b64_json}`;

    return NextResponse.json({ image: finalImageData });

  } catch (error: any) {
    console.error('[OPENAI IMAGE GENERATION ERROR]', error);
    return NextResponse.json({ error: error.message || 'Failed to generate image' }, { status: 500 });
  }
}
