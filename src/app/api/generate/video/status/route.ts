import { NextRequest } from 'next/server';
import RunwayML from '@runwayml/sdk';

interface TaskResponse {
  status: string;
  output: any;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const taskId = searchParams.get('taskId');
  const apiKey = process.env.RUNWAY_API_KEY;

  if (!taskId) {
    return Response.json({
      success: false,
      error: 'No taskId provided'
    });
  }

  if (!apiKey) {
    return Response.json({
      success: false,
      error: 'API key not configured'
    });
  }

  try {
    const runway = new RunwayML({ apiKey });
    const response = await runway.get(`/v1/tasks/${taskId}`);
    const task = response as TaskResponse;

    return Response.json({
      success: true,
      status: task.status,
      output: task.output
    });

  } catch (error) {
    console.error('Error checking video generation status:', error);
    return Response.json({
      success: false,
      error: 'Failed to check video generation status'
    });
  }
} 