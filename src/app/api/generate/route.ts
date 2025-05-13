import { NextResponse, NextRequest } from 'next/server';
import sharp from 'sharp';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

interface GenerationSettings {
  style: {
    architecturalStyle: string;
    buildingType: string;
    customStyleNotes: string;
  };
  materials: {
    primaryMaterial: string;
    secondaryMaterial: string;
    finishType: string;
  };
  lighting: {
    timeOfDay: number;
    weather: string;
    shadowIntensity: number;
  };
  technical: {
    controlNetMode: string;
    denoisingStrength: number;
    steps: number;
    cfgScale: number;
  };
  negativePrompt?: string;
  controlNetModule?: string;
  denoiseStrength?: number;
  guidanceScale?: number;
  cfgScale?: number;
  steps?: number;
  numInferenceSteps?: number;
}

function buildPrompt(settings: GenerationSettings, userPrompt: string): string {
  // Build materials description with more specific details
  const materialsDesc = `${settings.materials.primaryMaterial} and ${settings.materials.secondaryMaterial} construction with ${settings.materials.finishType} finish, ultra-detailed material textures, realistic glass reflections, polished surfaces, precise material transitions, photorealistic textures`;
  
  // Enhanced lighting description
  const hour = settings.lighting.timeOfDay;
  let timeDesc = '';
  if (hour >= 5 && hour < 8) timeDesc = 'golden hour dawn lighting, morning atmosphere, volumetric morning light, rim lighting on edges, cinematic lighting';
  else if (hour >= 8 && hour < 17) timeDesc = 'bright natural daylight, perfect exposure, soft shadows, ambient occlusion, subtle sun flares, realistic sky illumination, volumetric lighting';
  else if (hour >= 17 && hour < 20) timeDesc = 'golden hour dusk lighting, warm evening atmosphere, long shadows, dramatic rim lighting, subtle lens flares, cinematic mood';
  else timeDesc = 'night lighting, dramatic exterior illumination, mood lighting, carefully placed accent lights, architectural spotlights';

  // Enhanced weather and atmosphere
  const weatherDesc = {
    clear: "crystal clear blue sky, ultra-high definition clouds, natural atmospheric perspective, photographic depth of field, subtle environmental reflections, perfect weather conditions",
    overcast: "detailed overcast sky, soft diffused lighting, atmospheric depth, volumetric light scattering, ambient light wrapping, moody atmosphere",
    rainy: "moody atmosphere, realistic wet surface reflections, dramatic cloud formations, subtle rain effects, atmospheric moisture, cinematic weather"
  }[settings.lighting.weather];

  // Base prompt with enhanced architectural focus
  const basePrompt = userPrompt || `${settings.style.architecturalStyle} ${settings.style.buildingType}, ${settings.style.customStyleNotes}`;
  
  // Specific architectural details
  const architecturalDetails = "precise architectural proportions, ultra-detailed structural elements, clean geometric lines, professional architectural design, exact window placements, detailed facade elements, award-winning architecture";
  
  // Enhanced rendering details
  const renderingDetails = "ultra-detailed 8k architectural visualization, unreal engine 5 quality, V-ray next, corona renderer, physically based materials, ray-traced reflections, global illumination, subsurface scattering, realistic glass materials, photorealistic rendering";
  
  // Enhanced environmental and photography details
  const environmentDetails = "professional architectural photography, high-end real estate photography, architectural digest style, perfect composition, wide angle lens, subtle vignetting, high dynamic range, perfect exposure, award-winning architectural photograph";
  
  // Combine all elements with specific focus on realism
  return `${basePrompt}, ${architecturalDetails}, ${materialsDesc}, ${timeDesc}, ${weatherDesc}, ${renderingDetails}, ${environmentDetails}, masterpiece, photorealistic, hyperrealistic, ultra-detailed`.trim();
}

async function sendToAutomatic1111(settings: GenerationSettings, image: string, userPrompt: string) {
  try {
    const prompt = buildPrompt(settings, userPrompt);
    console.log('Sending request to API with payload:', {
      prompt,
      denoising_strength: settings.technical.denoisingStrength,
      steps: settings.technical.steps,
      cfg_scale: settings.technical.cfgScale
    });

    // Always use image-to-image mode
    console.log('Using image-to-image generation...');

    try {
      console.log('Connecting to RunPod instance...');
      
      const response = await fetch(`https://oim4h1ldqg0523-80.proxy.runpod.net/sdapi/v1/img2img`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          init_images: [image],
          prompt: prompt,
          negative_prompt: "unrealistic proportions, bad architecture, deformed structure, blurry",
          steps: settings.technical.steps || 40,
          cfg_scale: settings.technical.cfgScale || 7,
          width: 512,
          height: 512,
          sampler_name: "DPM++ 2M Karras",
          denoising_strength: 0.95,
          batch_size: 1,
          n_iter: 1,
          seed: -1
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      let imageData = data.images[0];
      
      // Add image prefix if needed
      if (typeof imageData === 'string' && !imageData.startsWith('data:image/')) {
        imageData = `data:image/png;base64,${imageData}`;
      }
      
      return imageData;
    } catch (error) {
      console.error('RunPod API error:', error);
      return createEnhancedFallbackImage(prompt);
    }
  } catch (error: any) {
    console.error('Image generation error:', error);
    return createEnhancedFallbackImage("Image generation failed. Please try again.");
  }
}

// Function to create a more visually appealing fallback image
function createEnhancedFallbackImage(prompt: string): string {
  // Create a simple "processing" SVG with the prompt text
  const escapedPrompt = prompt.replace(/"/g, '&quot;').substring(0, 100) + '...';
  
  const svg = `
  <svg width="1024" height="768" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#4a6fa5;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#23395d;stop-opacity:1" />
      </linearGradient>
    </defs>
    <rect width="1024" height="768" fill="url(#grad)" />
    <rect x="50" y="50" width="924" height="668" fill="rgba(255,255,255,0.1)" rx="15" />
    
    <!-- Header -->
    <text x="512" y="120" font-family="Arial" font-size="36" text-anchor="middle" fill="white" font-weight="bold">Image Generation</text>
    
    <!-- Status -->
    <text x="512" y="180" font-family="Arial" font-size="24" text-anchor="middle" fill="#f8f8f8">
      Connection to image generation service failed
    </text>
    
    <!-- House icon -->
    <rect x="437" y="240" width="150" height="120" fill="none" stroke="white" stroke-width="4"/>
    <polygon points="437,240 512,190 587,240" fill="none" stroke="white" stroke-width="4"/>
    <rect x="487" y="290" width="50" height="70" fill="none" stroke="white" stroke-width="4"/>
    
    <!-- Prompt preview -->
    <rect x="150" y="400" width="724" height="200" fill="rgba(255,255,255,0.1)" rx="10" />
    <text x="180" y="440" font-family="Arial" font-size="18" fill="white" font-weight="bold">Prompt:</text>
    <foreignObject x="180" y="460" width="664" height="120">
      <div xmlns="http://www.w3.org/1999/xhtml" style="color: #e0e0e0; font-family: Arial; font-size: 14px; word-wrap: break-word;">
        ${escapedPrompt}
      </div>
    </foreignObject>
    
    <!-- Instructions -->
    <text x="512" y="650" font-family="Arial" font-size="18" text-anchor="middle" fill="#f0f0f0">
      Please check your connection to the image service and try again
    </text>
    <text x="512" y="680" font-family="Arial" font-size="14" text-anchor="middle" fill="#d0d0d0">
      Alternatively, try using a different image or prompt
    </text>
  </svg>
  `;
  
  const base64 = Buffer.from(svg).toString('base64');
  return `data:image/svg+xml;base64,${base64}`;
}

// Simple version of the fallback image function for backward compatibility
function createFallbackImage(message: string): string {
  return createEnhancedFallbackImage(message);
}

// Improved function to send requests to the RunPod API with better error handling
async function sendToGradioAPI(prompt: string, uploadedImageBase64: string, settings: GenerationSettings) {
  try {
    const negativePrompt = settings.negativePrompt || "bad quality, blurry, low resolution";
    const runpodAPIUrl = 'https://oim4h1ldqg0523-80.proxy.runpod.net/sdapi/v1/img2img';
    
    console.log('Sending request to RunPod API:');
    console.log(`URL: ${runpodAPIUrl}`);
    console.log(`Prompt: ${prompt}`);
    console.log(`Negative Prompt: ${negativePrompt}`);

    // Validate and process the base64 image
    if (!uploadedImageBase64) {
      throw new Error('No image data provided');
    }

    // Extract base64 data if it's a data URL
    let base64Data = uploadedImageBase64;
    if (uploadedImageBase64.startsWith('data:')) {
      const matches = uploadedImageBase64.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        throw new Error('Invalid image data format');
      }
      base64Data = matches[2];
    }

    // Retry mechanism with exponential backoff
    const MAX_RETRIES = 3;
    let retryCount = 0;
    let lastError;

    while (retryCount < MAX_RETRIES) {
      try {
        const response = await fetch(runpodAPIUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            init_images: [uploadedImageBase64],
            prompt: prompt,
            negative_prompt: negativePrompt,
            steps: settings.technical?.steps || settings.steps || 40,
            cfg_scale: settings.technical?.cfgScale || settings.cfgScale || settings.guidanceScale || 7,
            width: 512,
            height: 512,
            sampler_name: "DPM++ 2M Karras",
            denoising_strength: settings.technical?.denoisingStrength || settings.denoiseStrength || 0.75,
            batch_size: 1,
            n_iter: 1,
            seed: -1,
            alwayson_scripts: {
              controlnet: {
                args: [
                  {
                    input_image: uploadedImageBase64,
                    module: "lineart",
                    model: "control_v11p_sd15_lineart",
                    weight: 1.0,
                    guidance_start: 0.0,
                    guidance_end: 1.0,
                    processor_res: 512,
                    threshold_a: 100,
                    threshold_b: 200,
                    control_mode: "Balanced",
                    pixel_perfect: true
                  }
                ]
              }
            }
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }

        const data = await response.json();
        if (!data || !data.images || !data.images[0]) {
          throw new Error('Invalid response from API: missing image data');
        }

        let imageData = data.images[0];

        // Add image prefix if needed
        if (typeof imageData === 'string' && !imageData.startsWith('data:image/')) {
          imageData = `data:image/png;base64,${imageData}`;
        }

        return imageData;
      } catch (error) {
        lastError = error;
        const delay = Math.pow(2, retryCount) * 1000;
        console.log(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        retryCount++;
      }
    }

    throw new Error(`Failed after ${MAX_RETRIES} attempts: ${lastError instanceof Error ? lastError.message : 'Unknown error'}`);
  } catch (error: any) {
    console.error('RunPod API error:', error);
    throw error;
  }
}

// Helper function to get image dimensions
async function getImageDimensions(buffer: Buffer): Promise<{ width: number; height: number }> {
  const metadata = await sharp(buffer).metadata();
  if (!metadata.width || !metadata.height) {
    throw new Error('Could not determine image dimensions');
  }
  return {
    width: metadata.width,
    height: metadata.height
  };
}

// Main API endpoint handler
export async function POST(req: NextRequest) {
  try {
    // Get the session
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated
    if (!session?.user?.id) {
      return new NextResponse(JSON.stringify({ error: 'Authentication required' }), { status: 401 });
    }

    // Parse request body
    const body = await req.json();
    const { image, uploadedImage, userPrompt, prompt, settings, mode } = body;

    // Validate inputs
    if (!userPrompt && !prompt) return new NextResponse(JSON.stringify({ error: 'Prompt is required' }), { status: 400 });

    // Determine which prompt to use
    const finalPrompt = userPrompt || prompt || '';
    
    // Log request details
    console.log('Received request details:');
    console.log(`- User ID: ${session.user.id}`);
    console.log(`- Prompt: ${finalPrompt.substring(0, 100)}...`);
    console.log(`- Mode: ${mode || (image || uploadedImage ? 'img2img' : 'txt2img')}`);
    console.log(`- Settings provided: ${!!settings}`);

    const isTextToImage = mode === 'txt2img' || (!image && !uploadedImage);
    const imageData = image || uploadedImage || '';
    
    try {
      let generatedImage;

      // Choose generation method based on whether an image is provided
      if (isTextToImage) {
        console.log('Using text-to-image generation mode');
        
        const runpodAPIUrl = 'https://oim4h1ldqg0523-80.proxy.runpod.net/api/predict';
        
        console.log('Sending request to RunPod API for txt2img:');
        console.log(`URL: ${runpodAPIUrl}`);
        console.log(`Prompt: ${finalPrompt}`);
        
        const negativePrompt = settings?.negativePrompt || "bad quality, blurry, low resolution";
        
        // Make request with txt2img parameters
        const response = await fetch(runpodAPIUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            data: [
              finalPrompt,
              negativePrompt,
              settings?.technical?.steps || settings?.steps || 40,
              settings?.technical?.cfgScale || settings?.cfgScale || settings?.guidanceScale || 7,
              512, // width
              512, // height
              "DPM++ 2M Karras", // sampler
              false, // restore faces
              false, // tiling
              1, // batch count
              1, // batch size
              -1, // seed
              0, // subseed
              0, // subseed strength
              0, // seed resize from h
              0, // seed resize from w
              0  // seed resize to h
            ]
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Received txt2img response from RunPod API:', { success: !!data, dataLength: JSON.stringify(data).length });

        if (!data || !data.data || !data.data[0]) {
          throw new Error('Invalid response from API: missing data');
        }

        let imageData = data.data[0];
        
        // Add image prefix if needed
        if (typeof imageData === 'string' && !imageData.startsWith('data:image/')) {
          imageData = `data:image/png;base64,${imageData}`;
        }
        
        generatedImage = imageData;
      } else {
        console.log('Using image-to-image generation mode');
        // Use the existing img2img function
        generatedImage = await sendToGradioAPI(finalPrompt, imageData, settings || {});
      }

      return NextResponse.json({ image: generatedImage });
    } catch (error: any) {
      console.error('API Error:', error);
      return new NextResponse(
        JSON.stringify({ 
          error: `Image generation failed: ${error.message}`,
          details: error.stack
        }), 
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Request processing error:', error);
    return new NextResponse(
      JSON.stringify({ 
        error: `Failed to process request: ${error.message}`,
        details: error.stack 
      }), 
      { status: 400 }
    );
  }
} 
