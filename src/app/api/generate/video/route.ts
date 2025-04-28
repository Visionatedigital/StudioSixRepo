import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import RunwayML from '@runwayml/sdk';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

interface RunwayTask {
  id: string;
  status: 'PENDING' | 'RUNNING' | 'SUCCEEDED' | 'FAILED';
  output?: string[];
}

const VIDEO_GENERATION_COST = 50;

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if user has enough credits
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, credits: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (user.credits < VIDEO_GENERATION_COST) {
      return NextResponse.json(
        { error: `Insufficient credits. Video generation requires ${VIDEO_GENERATION_COST} credits. You have ${user.credits} credits.` },
        { status: 402 }
      );
    }

    const body = await request.json();
    const { imageUrl, movementType, direction, prompt } = body;

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Image URL is required' },
        { status: 400 }
      );
    }

    if (!process.env.RUNWAY_API_KEY) {
      return NextResponse.json(
        { error: 'Runway API key not configured' },
        { status: 500 }
      );
    }

    // Get the local file path from the URL
    const fileName = imageUrl.split('/').pop();
    const filePath = join(process.cwd(), 'public', 'uploads', fileName);

    // Read the file and convert to base64
    const fileBuffer = await readFile(filePath);
    const base64Image = fileBuffer.toString('base64');
    const dataUrl = `data:image/jpeg;base64,${base64Image}`;

    // Initialize Runway client
    const client = new RunwayML({
      apiKey: process.env.RUNWAY_API_KEY
    });

    console.log('Initializing video generation with Runway...');
    console.log('Generation parameters:', {
      movementType,
      direction,
      prompt: prompt?.substring(0, 100) + '...' // Log first 100 chars of prompt
    });
    
    try {
      // Create video generation task
      const imageToVideo = await client.imageToVideo.create({
        model: 'gen4_turbo',
        promptImage: dataUrl,
        promptText: prompt || 'Gentle camera movement with natural lighting',
        ratio: '1280:720'
      });

      console.log('Generation task initiated:', imageToVideo.id);

      // Poll for the result
      let attempts = 0;
      const maxAttempts = 30; // 5 minutes with 10-second intervals
      let result = null;

      while (attempts < maxAttempts) {
        console.log(`Checking status attempt ${attempts + 1}/${maxAttempts}...`);
        
        const task = await client.tasks.retrieve(imageToVideo.id) as RunwayTask;
        console.log('Task status:', task.status);

        if (task.status === 'SUCCEEDED' && task.output && task.output.length > 0) {
          // Deduct credits and create credit transaction entry
          await prisma.$transaction([
            prisma.user.update({
              where: { id: user.id },
              data: { 
                credits: { decrement: VIDEO_GENERATION_COST }
              }
            }),
            prisma.creditTransaction.create({
              data: {
                userId: user.id,
                amount: -VIDEO_GENERATION_COST,
                description: 'Video generation',
                type: 'USAGE'
              }
            })
          ]);

          result = {
            videoUrl: task.output[0],
            creditsRemaining: user.credits - VIDEO_GENERATION_COST
          };
          break;
        } else if (task.status === 'FAILED') {
          console.error('Generation failed');
          throw new Error('Video generation failed');
        }

        // Wait 10 seconds before next attempt
        await new Promise(resolve => setTimeout(resolve, 10000));
        attempts++;
      }

      if (!result) {
        throw new Error('Video generation timed out');
      }

      console.log('Video generation completed successfully');
      return NextResponse.json(result);
    } catch (runwayError) {
      console.error('Runway API error:', runwayError);
      return NextResponse.json(
        { 
          error: 'Runway API error',
          details: runwayError instanceof Error ? runwayError.message : String(runwayError)
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Video generation error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

function getRunwayDirection(movementType: string, direction: string): string {
  const directionMap = {
    'pan-left': 'left',
    'pan-right': 'right',
    'pan-up': 'up',
    'pan-down': 'down',
    'zoom-in': 'in',
    'zoom-out': 'out',
    'horizontal-left': 'left',
    'horizontal-right': 'right',
  };

  const key = `${movementType}-${direction}`;
  return directionMap[key as keyof typeof directionMap] || 'right';
} 