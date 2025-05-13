import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { image } = await req.json();

    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    // Call OpenAI to analyze the image and generate a prompt
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert architectural prompt engineer. Analyze the uploaded architectural sketch and generate a detailed prompt that describes the architectural style, materials, lighting, and key features. Focus on creating a prompt that will help generate a high-quality architectural visualization."
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Please analyze this architectural sketch and generate a detailed prompt for image generation. Include architectural style, materials, lighting conditions, and key features."
            },
            {
              type: "image_url",
              image_url: image
            }
          ]
        }
      ],
      max_tokens: 500
    });

    const prompt = response.choices[0].message.content;

    return NextResponse.json({ prompt });
  } catch (error) {
    console.error('Error generating prompt:', error);
    return NextResponse.json(
      { error: 'Failed to generate prompt' },
      { status: 500 }
    );
  }
} 