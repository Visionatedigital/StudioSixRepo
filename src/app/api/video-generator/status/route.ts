import { NextResponse } from 'next/server';
import { RunwayML } from '@runwayml/sdk';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('taskId');

    if (!taskId) {
      return NextResponse.json({ error: 'Task ID is required' }, { status: 400 });
    }

    const RUNWAY_API_KEY = process.env.RUNWAY_API_KEY;
    if (!RUNWAY_API_KEY) {
      return NextResponse.json({ error: 'Runway API key not configured' }, { status: 500 });
    }

    const client = new RunwayML();
    const task = await client.tasks.retrieve(taskId);

    return NextResponse.json({
      status: task.status,
      output: task.artifacts?.[0]?.url || null,
      error: task.error || null,
      progress: task.progressRatio || 0
    });
  } catch (error) {
    console.error('Error checking task status:', error);
    return NextResponse.json({ error: 'Failed to check task status' }, { status: 500 });
  }
} 