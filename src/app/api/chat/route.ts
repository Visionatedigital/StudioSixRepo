import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY?.trim()
    });

    let parsedBody;
    try {
      parsedBody = await request.json();
    } catch (error) {
      console.error("Error parsing request body:", error);
      return NextResponse.json({ 
        error: 'Invalid request format. Could not parse JSON body.'
      }, { status: 400 });
    }

    const { messages = [], screenshots } = parsedBody;
    
    // Validate messages array
    if (!Array.isArray(messages)) {
      return NextResponse.json({ 
        error: 'Invalid messages format. Expected an array.', 
      }, { status: 400 });
    }

    // Use defensive programming with messages
    let chatMessages: any[] = [
      {
        role: "system",
        content: `You are an expert AI design assistant specializing in visual design and composition. When analyzing design elements, provide detailed feedback about:
1. Visual composition and layout
2. Color harmony and contrast
3. Typography and text hierarchy (if applicable)
4. Design principles being used
5. Specific suggestions for improvement

Focus on actionable insights that can help enhance the design while maintaining its original intent.

IMPORTANT: When you provide design suggestions or improvements, ALWAYS end your response with a call-to-action asking if the user would like to see a visualization of these suggestions. For example:
"Would you like me to generate a visualization of these suggested improvements?"

This helps users understand how they can implement your suggestions.`
      }
    ];

    // Add user messages, ensuring no duplicates and only the last few messages
    const uniqueMessages = new Map();
    const recentMessages = messages.slice(-5); // Only keep the last 5 messages
    
    if (recentMessages.length > 0) {
      recentMessages.forEach(msg => {
        if (msg && typeof msg === 'object') {
          const role = typeof msg.role === 'string' ? msg.role : 'user';
          const content = typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content);
          
          // Only add unique messages
          if (!uniqueMessages.has(content)) {
            uniqueMessages.set(content, {
              role: role,
              content: msg.content
            });
          }
        }
      });
    }

    // Add unique messages to chat
    chatMessages.push(...Array.from(uniqueMessages.values()));

    // If there are screenshots, add them to the messages
    if (screenshots && Array.isArray(screenshots) && screenshots.length > 0) {
      console.log('Processing screenshots:', {
        count: screenshots.length,
        screenshots: screenshots.map(s => ({
          id: s.id,
          hasData: !!s.data,
          dataLength: s.data?.length,
          area: s.area
        }))
      });
      
      // Create content array for the message
      const content: any[] = [{
        type: "text",
        text: `Please analyze these ${screenshots.length} screenshot${screenshots.length > 1 ? 's' : ''} from my canvas design. I'd like detailed feedback on the composition, visual elements, color harmony, and any suggestions for improvement.`
      }];

      // Add each screenshot as an image
      screenshots.forEach((screenshot: any, index: number) => {
        let imageUrl = screenshot.data;

      // Ensure the image URL is properly formatted
        if (!imageUrl.startsWith('data:image')) {
          imageUrl = `data:image/jpeg;base64,${imageUrl}`;
      }

        content.push({
            type: "image_url",
            image_url: {
              url: imageUrl,
              detail: "high"
            }
        });

        // Add area info if available
        if (screenshot.area) {
          content.push({
            type: "text",
            text: `Screenshot ${index + 1} shows a ${screenshot.area.width}×${screenshot.area.height} area from the canvas.`
          });
        }
      });

      const analysisRequest = {
        role: "user",
        content: content
      };

      chatMessages.push(analysisRequest);
    }

    // Ensure we have at least one user message
    if (chatMessages.length === 1) {
      chatMessages.push({
        role: "user",
        content: "Hello, I need help with my design."
      });
    }

    console.log("Screenshots:", screenshots);
    console.log("Sending request to OpenAI with messages:", JSON.stringify(chatMessages, null, 2));

    const response = await openai.chat.completions.create(
      {
        model: "gpt-4o",
        messages: chatMessages,
        max_tokens: 1000,
        temperature: 0.7
      },
      {
        headers: {
          'OpenAI-Beta': 'assistants=v1'
        }
      }
    );

    const responseMessage = {
      role: 'assistant',
      content: response.choices[0].message.content || "I'm not sure how to respond to that.",
      hasGenerateAction: checkForGenerateAction(response.choices[0].message.content || ""),
      screenshots: screenshots
    };

    return NextResponse.json(responseMessage);
  } catch (error) {
    console.error('Error in chat API:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process the request', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Add the checkForGenerateAction function
function checkForGenerateAction(content: string): boolean {
  const lowerContent = content.toLowerCase();
  // Check for various suggestion patterns
  const suggestivePatterns = [
    'would you like me to generate',
    'would you like to see',
    'shall i create',
    'i can show you',
    'i can generate',
    'would you like me to show',
    'i can create',
    'shall i show you',
    'would you like a visualization',
    'shall i create a new version',
    'would you like me to create'
  ];
  
  const designPatterns = [
    'design',
    'version',
    'changes',
    'improvement',
    'modification',
    'update',
    'style',
    'look',
    'visualization'
  ];

  // Check if the message ends with a call-to-action
  const lastParagraph = content.split('\n\n').pop()?.toLowerCase() || '';
  const hasCallToAction = suggestivePatterns.some(pattern => 
    lastParagraph.includes(pattern)
  );

  const hasDesignReference = designPatterns.some(pattern =>
    lowerContent.includes(pattern)
  );

  // Also check if the message contains suggestions for improvements
  const containsSuggestions = (
    lowerContent.includes('suggest') ||
    lowerContent.includes('could be') ||
    lowerContent.includes('recommend') ||
    lowerContent.includes('improve') ||
    lowerContent.includes('enhance')
  );

  // Show the button if the last paragraph contains a call-to-action
  // or if the message contains both suggestions and design references
  return hasCallToAction || (containsSuggestions && hasDesignReference);
} 