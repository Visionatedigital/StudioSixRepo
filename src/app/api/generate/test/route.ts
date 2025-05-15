import { NextResponse } from 'next/server';

// Simple test image (1x1 pixel transparent PNG in base64)
const TEST_IMAGE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

export async function GET() {
  console.log('Testing image generation API...');
  
  try {
    // Test text-to-image generation
    console.log('Testing text-to-image generation...');
    const txt2imgPayload = {
      prompt: 'modern minimalist house with large windows, architectural visualization',
      negative_prompt: 'unrealistic proportions, bad architecture, deformed structure, blurry',
      steps: 30,
      cfg_scale: 7,
      width: 512,
      height: 512,
      sampler_name: "DPM++ 2M Karras",
      batch_size: 1,
      n_iter: 1,
      seed: -1,
      enable_hr: false,
      denoising_strength: 0.7,
      firstphase_width: 0,
      firstphase_height: 0,
      hr_scale: 2,
      hr_upscaler: "Latent",
      hr_second_pass_steps: 0,
      hr_resize_x: 0,
      hr_resize_y: 0
    };
    
    console.log('Sending text-to-image request with payload:', JSON.stringify(txt2imgPayload, null, 2));
    
    const txt2imgResponse = await fetch('https://n8sbg27o9f9smg-80.proxy.runpod.net/sdapi/v1/txt2img', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(txt2imgPayload)
    });

    console.log('Text-to-image response status:', txt2imgResponse.status);
    console.log('Text-to-image response headers:', Object.fromEntries(txt2imgResponse.headers.entries()));
    
    const txt2imgData = await txt2imgResponse.json();
    console.log('Text-to-image response data:', JSON.stringify(txt2imgData, null, 2));

    if (!txt2imgResponse.ok) {
      throw new Error(`Text-to-image test failed: ${txt2imgResponse.status} - ${JSON.stringify(txt2imgData)}`);
    }
    
    // Test image-to-image generation
    console.log('Testing image-to-image generation...');
    const img2imgPayload = {
      init_images: [TEST_IMAGE],
      prompt: 'modern minimalist house with large windows, architectural visualization',
      negative_prompt: 'unrealistic proportions, bad architecture, deformed structure, blurry',
      steps: 30,
      cfg_scale: 7,
      width: 512,
      height: 512,
      sampler_name: "DPM++ 2M Karras",
      denoising_strength: 0.75,
      batch_size: 1,
      n_iter: 1,
      seed: -1
    };
    
    console.log('Sending image-to-image request with payload:', JSON.stringify(img2imgPayload, null, 2));
    
    const img2imgResponse = await fetch('https://n8sbg27o9f9smg-80.proxy.runpod.net/sdapi/v1/img2img', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(img2imgPayload)
    });

    console.log('Image-to-image response status:', img2imgResponse.status);
    console.log('Image-to-image response headers:', Object.fromEntries(img2imgResponse.headers.entries()));
    
    const img2imgData = await img2imgResponse.json();
    console.log('Image-to-image response data:', JSON.stringify(img2imgData, null, 2));

    if (!img2imgResponse.ok) {
      throw new Error(`Image-to-image test failed: ${img2imgResponse.status} - ${JSON.stringify(img2imgData)}`);
    }
    
    return NextResponse.json({
      success: true,
      txt2img: {
        success: true,
        images: txt2imgData.images
      },
      img2img: {
        success: true,
        images: img2imgData.images
      }
    });
  } catch (error: any) {
    console.error('Test failed:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 