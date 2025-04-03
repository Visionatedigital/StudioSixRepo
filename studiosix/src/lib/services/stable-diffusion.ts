interface StableDiffusionResponse {
  images: string[];
  parameters: {
    prompt: string;
    negative_prompt?: string;
    steps: number;
    width: number;
    height: number;
    cfg_scale: number;
    sampler_name: string;
  };
  info: string;
}

export class StableDiffusionService {
  private apiUrl: string;
  private apiKey: string;

  constructor() {
    this.apiUrl = process.env.NEXT_PUBLIC_STABLE_DIFFUSION_API_URL || '';
    this.apiKey = process.env.NEXT_PUBLIC_STABLE_DIFFUSION_API_KEY || '';
  }

  async generateImage(prompt: string, options: {
    negative_prompt?: string;
    width?: number;
    height?: number;
    steps?: number;
    cfg_scale?: number;
    sampler_name?: string;
  } = {}): Promise<string> {
    try {
      const response = await fetch(`${this.apiUrl}/sdapi/v1/txt2img`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          prompt,
          negative_prompt: options.negative_prompt || '',
          width: options.width || 512,
          height: options.height || 512,
          steps: options.steps || 20,
          cfg_scale: options.cfg_scale || 7,
          sampler_name: options.sampler_name || 'DPM++ 2M Karras',
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: StableDiffusionResponse = await response.json();
      
      if (!data.images || data.images.length === 0) {
        throw new Error('No images generated');
      }

      return data.images[0];
    } catch (error) {
      console.error('Error generating image:', error);
      throw error;
    }
  }

  async upscaleImage(image: string, options: {
    scale?: number;
    upscaler_1?: string;
  } = {}): Promise<string> {
    try {
      const response = await fetch(`${this.apiUrl}/sdapi/v1/extra-single-image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          image,
          scale: options.scale || 2,
          upscaler_1: options.upscaler_1 || 'Latent',
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.image;
    } catch (error) {
      console.error('Error upscaling image:', error);
      throw error;
    }
  }
} 