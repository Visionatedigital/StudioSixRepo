import { NextResponse } from 'next/server';
import RunwayML from '@runwayml/sdk';

// For testing purposes only
export const dynamic = 'force-dynamic';

interface RunwayTask {
  id: string;
  status: 'PENDING' | 'RUNNING' | 'SUCCEEDED' | 'FAILED';
  output?: string[];
}

export async function GET(request: Request) {
  if (!process.env.RUNWAY_API_KEY) {
    return NextResponse.json({
      success: false,
      error: 'RUNWAY_API_KEY is not set'
    }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const taskId = searchParams.get('taskId');

  if (!taskId) {
    return NextResponse.json({
      success: false,
      error: 'Task ID is required'
    }, { status: 400 });
  }

  try {
    const client = new RunwayML({
      apiKey: process.env.RUNWAY_API_KEY
    });

    // Get task status
    const task = await client.tasks.retrieve(taskId) as RunwayTask;

    // If task is complete, get the video URL
    let output = undefined;
    if (task.status === 'SUCCEEDED' && task.output && task.output.length > 0) {
      output = {
        videoUrl: task.output[0]
      };
    }

    return NextResponse.json({
      success: true,
      status: task.status,
      output
    });

  } catch (error) {
    console.error('Runway API Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
} 