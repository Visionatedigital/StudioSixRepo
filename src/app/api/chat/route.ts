import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import OpenAI from 'openai';
import { CanvasElement } from '@/types/canvas';
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

// Initialize OpenAI client
const apiKey = process.env.OPENAI_API_KEY;
console.log('API Key prefix:', apiKey?.substring(0, 5));
console.log('API Key length:', apiKey?.length);

let openai: OpenAI;

try {
  if (!apiKey || apiKey.length < 20 || (!apiKey.startsWith('sk-') && !apiKey.startsWith('sk-proj-'))) {
    throw new Error(`Invalid API key format: ${apiKey?.substring(0, 5)}...`);
  }
  
  openai = new OpenAI({
    apiKey: apiKey.trim()
  });
  
  console.log('OpenAI client initialized successfully with key starting with:', apiKey.substring(0, 10));
} catch (error) {
  console.error('Error initializing OpenAI client:', error);
} 

export async function POST(request: Request) {
  try {
    let parsedBody;
    try {
      parsedBody = await request.json();
    } catch (error) {
      console.error("Error parsing request body:", error);
      return NextResponse.json({ 
        error: 'Invalid request format. Could not parse JSON body.'
      }, { status: 400 });
    }

    const { messages = [] } = parsedBody;
    
    // Get the last user message
    let userMessage = "Hello";
    if (Array.isArray(messages) && messages.length > 0) {
      const lastUserMessage = messages.filter(m => m.role === 'user').pop();
      if (lastUserMessage && lastUserMessage.content) {
        userMessage = lastUserMessage.content;
      }
    }

    console.log("Received user message:", userMessage);
    
    // Return a mock response for testing
    const mockResponse = {
      role: 'assistant',
      content: `I'd be happy to help with your design! You asked: "${userMessage}". As your AI design assistant, I can provide guidance on layout, color schemes, typography, and overall design principles. What specific aspect would you like to focus on?`,
      hasGenerateAction: false
    };
    
    return NextResponse.json(mockResponse);
  } catch (error) {
    console.error('Error in chat API:', error);
    return NextResponse.json(
      { error: 'Failed to process the request' },
      { status: 500 }
    );
  }
} 