import { ProcessedFile } from '@/utils/imageProcessing';

export interface SiteAnalysisRequest {
  projectBrief: string;
  uploadedFiles: ProcessedFile[];
  siteDescription: string;
  selectedTags: string[];
  abstractionLevel: number;
}

export interface SiteAnalysisResponse {
  infographic: string; // base64 encoded image
  analysis: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
}

export async function generateSiteAnalysis(data: SiteAnalysisRequest): Promise<SiteAnalysisResponse> {
  try {
    const response = await fetch('/api/site-analysis', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to generate site analysis');
    }

    return response.json();
  } catch (error) {
    console.error('Error generating site analysis:', error);
    throw error;
  }
} 