import { CanvasElement } from '@/types/canvas';

interface GenerationParams {
  prompt: string;
  image: string;  // base64 image data
}

interface GenerationSettings {
  technical: {
    controlNetMode: string;
    denoisingStrength: number;
    steps: number;
    cfgScale: number;
  };
}

export class ImageGenerationService {
  static async generateVariation({ prompt, image }: GenerationParams): Promise<string> {
    try {
      // Default settings that match the existing implementation
      const settings: GenerationSettings = {
        technical: {
          controlNetMode: "Balanced",
          denoisingStrength: 0.55,
          steps: 45,
          cfgScale: 12
        }
      };

      const controlNetWeight = 0.9; // Balanced mode weight
      const guidanceStart = 0.0;
      const guidanceEnd = 0.7;

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          init_images: [image],
          prompt: `${prompt}, ultra-detailed 8k architectural visualization, unreal engine 5 quality, photorealistic rendering, professional architectural photography`,
          negative_prompt: "unrealistic proportions, bad architecture, deformed structure, blurry, low quality, distorted perspective, plain surface, flat texture, warped geometry, asymmetrical architecture, curved walls where straight should be, broken windows, disproportionate features",
          steps: settings.technical.steps,
          cfg_scale: settings.technical.cfgScale,
          width: 768,
          height: 768,
          restore_faces: false,
          sampler_name: "DPM++ 2M Karras",
          denoising_strength: settings.technical.denoisingStrength,
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
                  threshold_a: 100,
                  threshold_b: 200,
                  control_mode: settings.technical.controlNetMode,
                  pixel_perfect: true
                }
              ]
            }
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || `Server responded with status ${response.status}`);
      }

      const data = await response.json();
      return data.images[0];  // Returns base64 image data
    } catch (error: any) {
      console.error('Error in image generation:', error);
      throw new Error(error.message || 'Failed to generate image');
    }
  }

  static extractPromptFromMessage(content: string): string {
    // Split the message into paragraphs
    const paragraphs = content.split('\n\n');
    
    // Get the main suggestions (excluding the last paragraph which is usually the call-to-action)
    const mainContent = paragraphs.slice(0, -1).join(' ');
    
    // Extract key phrases and design elements
    const suggestions = mainContent.match(/suggest|recommend|could|should|would|improve|change|update|modify/gi);
    if (!suggestions) return '';

    // Create a concise prompt focusing on the suggested changes
    const prompt = mainContent
      .split(/[.!?]/)
      .filter(sentence => 
        suggestions.some(suggestion => 
          sentence.toLowerCase().includes(suggestion.toLowerCase())
        )
      )
      .join(' ')
      .replace(/I suggest|I recommend|We could|You could|You should|It would be better to/gi, '')
      .trim();

    return prompt; // Removed the prefix since we're adding architectural details in generateVariation
  }
} 