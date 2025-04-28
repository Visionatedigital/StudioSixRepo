import { NextResponse } from 'next/server';
import { RunwayML } from '@runwayml/sdk';
import { dynamicConfig } from '../../config';

export const dynamic = dynamicConfig.dynamic;
export const revalidate = dynamicConfig.revalidate;

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

    const client = new RunwayML({ apiKey: RUNWAY_API_KEY });
    const task = await client.tasks.retrieve(taskId);

    return NextResponse.json({
      status: task.status,
      output: task.output || null,
      error: null,
      progress: 0
    });
  } catch (error) {
    console.error('Error checking task status:', error);
    return NextResponse.json({ error: 'Failed to check task status' }, { status: 500 });
  }
} 