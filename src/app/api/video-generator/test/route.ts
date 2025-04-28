import { NextResponse } from 'next/server';
import RunwayML from '@runwayml/sdk';

// For testing purposes only
export const dynamic = 'force-dynamic';

// Simple test image (1x1 pixel transparent PNG in base64)
const TEST_IMAGE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

export async function GET() {
  if (!process.env.RUNWAY_API_KEY) {
    return NextResponse.json({
      success: false,
      error: 'RUNWAY_API_KEY is not set'
    }, { status: 500 });
  }

  try {
    const client = new RunwayML({
      apiKey: process.env.RUNWAY_API_KEY
    });

    // Create a new image-to-video task
    const imageToVideo = await client.imageToVideo.create({
      model: 'gen4_turbo',
      promptImage: TEST_IMAGE,
      promptText: 'A serene mountain landscape',
      ratio: '1280:720'
    });

    return NextResponse.json({
      success: true,
      taskId: imageToVideo.id,
      message: 'Video generation task created successfully'
    });

  } catch (error) {
    console.error('Runway API Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
} 