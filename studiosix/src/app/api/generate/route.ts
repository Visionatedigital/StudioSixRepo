import { NextResponse } from 'next/server';

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
    // Refined weight calculations for Canny model
    const controlNetWeight = 
      settings.technical.controlNetMode === "Balanced" ? 0.9 :
      settings.technical.controlNetMode === "Prompt Focus" ? 0.8 : 1.0;

    const guidanceStart = 0.0;
    const guidanceEnd = 0.7; // Allow more creative freedom in later stages

    const prompt = buildPrompt(settings, userPrompt);
    console.log('Sending request to API with payload:', {
      prompt,
      denoising_strength: settings.technical.denoisingStrength,
      steps: settings.technical.steps,
      cfg_scale: settings.technical.cfgScale
    });

    const response = await fetch('http://44.200.48.147:7860/sdapi/v1/img2img', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        init_images: [image],
        prompt,
        negative_prompt: "unrealistic proportions, bad architecture, deformed structure, blurry, low quality, distorted perspective, plain surface, flat texture, warped geometry, asymmetrical architecture, curved walls where straight should be, broken windows, disproportionate features, missing architectural elements, oversaturated, cartoon, anime, illustration, drawing, painting, crayon, CGI, 3d model, dull, boring, plain, simplified, low resolution, flat lighting, uniform textures, noise, grain, artifacts",
        steps: Math.max(settings.technical.steps, 45), // Increased steps for better quality
        cfg_scale: Math.min(settings.technical.cfgScale, 12), // Increased for stronger prompt influence
        width: 768,
        height: 768,
        restore_faces: false,
        sampler_name: "DPM++ 2M Karras", // Changed sampler for better quality
        denoising_strength: Math.min(settings.technical.denoisingStrength, 0.55), // Balanced for detail preservation
        alwayson_scripts: {
          controlnet: {
            args: [
              {
                image: image,
                module: "canny",
                model: "control_v11p_sd15_canny",
                weight: controlNetWeight,
                guidance_start: guidanceStart,
                guidance_end: guidanceEnd,
                processor_res: 768,
                threshold_a: 100, // Increased for stronger edge detection
                threshold_b: 200,
                control_mode: settings.technical.controlNetMode,
                pixel_perfect: true
              }
            ]
          }
        }
      })
    });

    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.text();
      console.error('Server error response:', errorData);
      throw new Error(`HTTP error! status: ${response.status}, details: ${errorData}`);
    }

    const data = await response.json();
    console.log('Received response data structure:', Object.keys(data));
    
    if (!data.images || !data.images[0]) {
      console.error('Unexpected response format:', JSON.stringify(data));
      throw new Error('No image data in response');
    }
    return data.images[0]; // Base64 encoded image
  } catch (error: any) {
    console.error('Detailed error:', {
      message: error?.message || 'Unknown error',
      cause: error?.cause,
      stack: error?.stack
    });
    throw error;
  }
}

export async function POST(request: Request) {
  try {
    const { settings, image, prompt } = await request.json();

    if (!settings || !image) {
      return NextResponse.json(
        { error: 'Settings and image are required' },
        { status: 400 }
      );
    }

    console.log('Received request with settings:', JSON.stringify(settings, null, 2));
    console.log('Image data length:', image.length);
    console.log('User prompt:', prompt);

    const generatedImage = await sendToAutomatic1111(settings, image, prompt);

    return NextResponse.json({ image: generatedImage });
  } catch (error: any) {
    console.error('Error in generate route:', {
      message: error?.message || 'Unknown error',
      cause: error?.cause,
      stack: error?.stack
    });
    return NextResponse.json(
      { error: 'Failed to generate image: ' + (error?.message || 'Unknown error') },
      { status: 500 }
    );
  }
} 