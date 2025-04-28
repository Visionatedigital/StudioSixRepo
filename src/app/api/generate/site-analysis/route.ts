import { NextResponse } from 'next/server';
import { OpenAI } from "openai";
import { ChatCompletionContentPart } from "openai/resources/chat/completions";
import { SiteAnalysisRequest } from '@/services/siteAnalysis';

const openai = new OpenAI();

export async function POST(req: Request) {
  try {
    const data: SiteAnalysisRequest = await req.json();
    
    if (!data) {
      throw new Error("No request data provided");
    }

    // Construct the prompt for GPT-4V
    const prompt = constructPrompt(data);

    // Prepare base message content
    let content: string | ChatCompletionContentPart[] = prompt;

    // Add image content if files are present and valid
    if (Array.isArray(data.uploadedFiles) && data.uploadedFiles.length > 0) {
      const validFiles = data.uploadedFiles.filter(file => file && file.compressedData);
      
      if (validFiles.length > 0) {
        content = [
          { type: "text", text: prompt },
          ...validFiles.map(file => ({
            type: "image_url",
            image_url: {
              url: file.compressedData,
              detail: "high"
            }
          }))
        ] as ChatCompletionContentPart[];
      }
    }

    // Call GPT-4 Vision for analysis
    const completion = await openai.chat.completions.create({
      model: "gpt-4-0125-preview",
      max_tokens: 4096,
      messages: [{
        role: "user",
        content
      }]
    });

    const analysis = completion.choices[0].message.content;
    if (!analysis) throw new Error("No analysis generated");

    const parsedAnalysis = parseAnalysis(analysis);
    
    // Generate infographic using DALL-E 3
    const imageResponse = await openai.images.generate({
      model: "dall-e-3",
      prompt: `Create a professional infographic visualizing this SWOT analysis for an architectural site:\n${analysis}`,
      n: 1,
      size: "1024x1024",
      quality: "standard",
      style: "natural"
    });

    return NextResponse.json({ 
      analysis: parsedAnalysis,
      infographic: imageResponse.data?.[0]?.url || ''
    });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to generate analysis'
    }, { status: 500 });
  }
}

function constructPrompt(data: SiteAnalysisRequest): string {
  const abstractionStyle = data.abstractionLevel < 33 ? 'literal' :
                          data.abstractionLevel < 66 ? 'balanced' : 'poetic';

  return `Analyze this architectural site based on the following information:

Project Brief:
${data.projectBrief || ''}

Site Description:
${data.siteDescription || ''}

Site Characteristics:
${(data.selectedTags || []).join(', ')}

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