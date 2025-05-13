import { NextResponse } from 'next/server';

export async function GET() {
  console.log('Testing text-to-image generation API...');
  
  try {
    console.log('Making test request to text-to-image API...');
    
    // Test parameters
    const prompt = 'photorealistic image of a modern house with a beautiful garden, professional architectural photography';
    const negativePrompt = 'unrealistic proportions, bad architecture, deformed structure, blurry, low quality';
    const settings = {
      negativePrompt,
      steps: 30,
      guidanceScale: 7.5,
      mode: 'txt2img'
    };
    
    // Log the test parameters
    console.log('Test parameters:', {
      prompt,
      settings
    });
    
    // Now make a request to our API endpoint
    const response = await fetch('http://localhost:3000/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: 'test-user',
        prompt,
        settings,
        mode: 'txt2img'
      })
    });
    
    // Get the response
    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Validate the response
    if (!data.image) {
      return NextResponse.json({
        success: false,
        message: 'No image received from API',
        error: data.error || 'Unknown error'
      });
    }
    
    // Return success with info about the generated image
    return NextResponse.json({
      success: true,
      message: 'Successfully generated text-to-image test',
      imageLength: data.image.length,
      imagePreview: data.image.substring(0, 100) + '...'
    });
  } catch (error: any) {
    console.error('Text-to-image test failed:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Text-to-image test failed',
      error: error.message
    }, { status: 500 });
  }
} 