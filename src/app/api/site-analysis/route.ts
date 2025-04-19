import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { ChatCompletionContentPart } from 'openai/resources/chat/completions';
import { SiteAnalysisRequest } from '@/services/siteAnalysis';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const data: SiteAnalysisRequest = await req.json();

    // Construct the prompt for GPT-4V
    const prompt = constructPrompt(data);

    // Prepare the content array
    const content: ChatCompletionContentPart[] = [
      { type: "text", text: prompt }
    ];

    // Add images if present
    if (Array.isArray(data.uploadedFiles) && data.uploadedFiles.length > 0) {
      content.push(
        ...data.uploadedFiles.map(file => ({
          type: "image_url" as const,
          image_url: {
            url: file.compressedData,
            detail: "high" as const
          }
        }))
      );
    }

    // Call GPT-4V for analysis
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "user",
          content
        }
      ],
      max_tokens: 4096,
    });

    // Generate image using DALL-E 3
    const imageResponse = await openai.images.generate({
      model: "dall-e-3",
      prompt: `Create a minimal infographic visualization of this SWOT analysis:\n${completion.choices[0].message.content}\n\nUse a clean, modern design with a light background. Include icons and simple diagrams to represent key points. Organize the content into four clear quadrants for Strengths, Weaknesses, Opportunities, and Threats.`,
      size: "1024x1024",
      quality: "standard",
      n: 1,
    });

    const analysis = parseAnalysis(completion.choices[0].message.content || "");
    
    return NextResponse.json({
      infographic: imageResponse.data[0].url,
      analysis
    });

  } catch (error) {
    console.error('Error in site analysis:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate site analysis' },
      { status: 500 }
    );
  }
}

function constructPrompt(data: SiteAnalysisRequest): string {
  const abstractionStyle = data.abstractionLevel < 33 ? 'literal' :
                          data.abstractionLevel < 66 ? 'balanced' : 'poetic';

  return `Analyze this architectural site based on the following information:

Project Brief:
${data.projectBrief}

Site Description:
${data.siteDescription}

Site Characteristics:
${data.selectedTags.join(', ')}

Please provide a ${abstractionStyle} SWOT analysis focusing on:
1. Environmental and climatic factors
2. Urban context and connectivity
3. Site-specific opportunities and constraints
4. Potential architectural responses

Format your response as a structured SWOT analysis with clear sections for Strengths, Weaknesses, Opportunities, and Threats.`;
}

function parseAnalysis(content: string): {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
} {
  // This is a simple parser that should be improved based on actual GPT-4V output format
  const sections = content.split(/\b(Strengths|Weaknesses|Opportunities|Threats):/i);
  
  return {
    strengths: extractPoints(sections[2] || ""),
    weaknesses: extractPoints(sections[4] || ""),
    opportunities: extractPoints(sections[6] || ""),
    threats: extractPoints(sections[8] || "")
  };
}

function extractPoints(text: string): string[] {
  return text
    .split('\n')
    .filter(line => line.trim().length > 0)
    .map(line => line.replace(/^[•\-\*]\s*/, '').trim());
} 