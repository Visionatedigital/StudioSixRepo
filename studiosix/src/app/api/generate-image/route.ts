import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const AUTOMATIC1111_URL = 'http://44.200.48.147:7860';

// Helper function to check if a URL is available
async function isUrlAvailable(url: string): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    
    const response = await fetch(`${url}/sdapi/v1/options`, {
      method: 'GET',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    console.error(`Error checking URL availability for ${url}:`, error);
    return false;
  }
}

// Helper function to extract suggestions from AI response
function extractSuggestions(content: string): string {
  // Split content into paragraphs
  const paragraphs = content.split('\n\n');
  
  // Find paragraphs containing suggestions
  const suggestionParagraphs = paragraphs.filter(paragraph => 
    paragraph.toLowerCase().includes('suggest') || 
    paragraph.toLowerCase().includes('recommend') ||
    paragraph.toLowerCase().includes('improve') ||
    paragraph.toLowerCase().includes('enhance') ||
    paragraph.toLowerCase().includes('could be') ||
    paragraph.toLowerCase().includes('would be better')
  );

  // Combine suggestions into a prompt
  return suggestionParagraphs.join(' ');
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    let body;
    try {
      body = await req.json();
    } catch (error) {
      console.error("Error parsing request body:", error);
      return NextResponse.json({ 
        error: 'Invalid request format. Could not parse JSON body.', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      }, { status: 400 });
    }

    const { prompt, imageUrl, selectedElement, aiResponse } = body;

    if (!imageUrl) {
      return NextResponse.json({ error: 'Source image is required' }, { status: 400 });
    }

    // Check if the Stable Diffusion API is available
    const isApiAvailable = await isUrlAvailable(AUTOMATIC1111_URL);
    if (!isApiAvailable) {
      console.error('Stable Diffusion API is not available');
      return NextResponse.json({ 
        error: 'Image generation service is currently unavailable. Please try again later.',
        details: 'Connection to Automatic1111 failed'
      }, { status: 503 });
    }

    // Extract suggestions from AI response if available
    const suggestions = aiResponse ? extractSuggestions(aiResponse) : '';
    
    // Combine user prompt with suggestions
    const enhancedPrompt = `High quality professional design, clean lines, modern aesthetic, ${prompt} ${suggestions}`;
    const negativePrompt = "ugly, blurry, low quality, distorted, deformed, disfigured, bad anatomy, wrong anatomy, extra limb, missing limb, floating limbs, disconnected limbs, mutation, mutated, ugly, disgusting, amputation";

    // Convert image URL to base64 if it's not already
    let base64Image;
    try {
      if (imageUrl.startsWith('data:image')) {
        // Extract base64 part from data URL
        base64Image = imageUrl.split(',')[1];
      } else if (imageUrl.startsWith('http') || imageUrl.startsWith('/')) {
        // Fetch the image and convert to base64
        const imageResponse = await fetch(imageUrl);
        if (!imageResponse.ok) {
          throw new Error(`Failed to fetch image: ${imageResponse.status}`);
        }
        const imageBuffer = await imageResponse.arrayBuffer();
        base64Image = Buffer.from(imageBuffer).toString('base64');
      } else {
        base64Image = imageUrl;
      }
    } catch (error) {
      console.error('Error processing image:', error);
      return NextResponse.json({ error: 'Failed to process image' }, { status: 500 });
    }

    // Use img2img with depth midas control net
    const payload = {
      init_images: [base64Image],
      prompt: enhancedPrompt,
      negative_prompt: negativePrompt,
      steps: 30,
      denoising_strength: 0.75,
      cfg_scale: 7,
      width: selectedElement?.width || 512,
      height: selectedElement?.height || 512,
      sampler_name: "DPM++ 2M Karras",
      alwayson_scripts: {
        controlnet: {
          args: [
            {
              image: base64Image,
              module: "depth_midas",
              model: "control_v2_depth_sd15",
              weight: 0.8,
              guidance_start: 0.0,
              guidance_end: 0.7,
              processor_res: 768,
              control_mode: "Balanced",
              pixel_perfect: true
            }
          ]
        }
      }
    };

    console.log(`Calling Stable Diffusion API: ${AUTOMATIC1111_URL}/sdapi/v1/img2img`);
    console.log('Payload:', JSON.stringify(payload).substring(0, 500) + '...');

    try {
      const response = await fetch(`${AUTOMATIC1111_URL}/sdapi/v1/img2img`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Stable Diffusion API error:', errorText);
        throw new Error(`Failed to generate image: ${errorText}`);
      }

      const data = await response.json();
      if (!data.images || !data.images[0]) {
        throw new Error('No image was returned from the API');
      }

      return NextResponse.json({ 
        imageData: data.images[0],
        prompt: enhancedPrompt
      });
    } catch (error) {
      console.error('Error connecting to Stable Diffusion API:', error);
      return NextResponse.json(
        { 
          error: 'Failed to connect to image generation service', 
          details: error instanceof Error ? error.message : 'Unknown error'
        },
        { status: 503 }
      );
    }
  } catch (error) {
    console.error('Error generating image:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 