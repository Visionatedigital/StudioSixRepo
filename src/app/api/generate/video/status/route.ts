import { NextRequest } from 'next/server';
import { RunwayML } from '@runwayml/sdk';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const taskId = searchParams.get('taskId');

  if (!taskId) {
    return Response.json({ success: false, error: 'Task ID is required' }, { status: 400 });
  }

  const apiKey = process.env.RUNWAY_API_KEY;
  if (!apiKey) {
    return Response.json({ success: false, error: 'Runway API key not configured' }, { status: 500 });
  }

  try {
    const runway = new RunwayML({ apiKey });
    const task = await runway.getTask(taskId);

    return Response.json({
      success: true,
      status: task.status,
      output: task.output
    });
  } catch (error) {
    console.error('Error checking task status:', error);
    return Response.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to check task status' 
    }, { status: 500 });
  }
} 