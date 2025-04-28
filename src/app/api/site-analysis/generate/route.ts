import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

interface Feature {
  properties: {
    type?: string;
    class?: string;
  };
}

interface Feeling {
  primary: string;
  related: string[];
}

interface SiteCharacteristics {
  [category: string]: {
    [key: string]: string[] | string;
  } | string;
}

interface RequestData {
  location: { lat: number; lng: number };
  description: string;
  feelings: Feeling[];
  analysisData: {
    elevation?: number;
    features?: Feature[];
  } | null;
  siteCharacteristics: SiteCharacteristics | null;
}

async function generateSectionImage(type: 'siteAnalysis' | 'environmental' | 'design', description: string): Promise<string | null> {
  try {
    let prompt = '';
    
    switch (type) {
      case 'siteAnalysis':
        prompt = `Create a minimal, technical diagram set showing:
- A simple 2D site analysis diagram with basic annotations for orientation (N,S,E,W)
- A clean wind rose diagram showing prevailing winds
- A basic sun path diagram
- Simple contour lines if site has elevation changes
- Clear legend with basic symbols
- Minimal color palette using only blues and grays
- No realistic architectural renderings or detailed landscapes

Style: Clean, minimal technical diagrams on white background using simple lines and basic geometric shapes. Focus on clarity and data representation rather than artistic visualization. ${description}`;
        break;

      case 'environmental':
        prompt = `Create a simple environmental data visualization set with:
- Basic climate charts showing temperature and rainfall ranges
- Simple solar exposure diagram using arrows and shading
- Vegetation zones marked in basic shapes
- Water flow indicated with simple arrows
- Basic legend explaining symbols
- Use only abstract shapes and arrows
- No realistic landscape renderings

Style: Clean infographic style using simple shapes, arrows, and minimal colors (mainly blues and greens). Focus on data clarity rather than realistic representation. ${description}`;
        break;

      case 'design':
        prompt = `Create a basic site opportunities diagram showing:
- Simple bubble diagrams for spatial relationships
- Basic circulation patterns with arrows
- View corridors marked with simple sight lines
- Constraints and opportunities marked with basic symbols
- Simple legend explaining all markings
- Use only abstract shapes and arrows
- No realistic architectural renderings

Style: Clean, abstract diagram style using simple shapes, dotted lines, and arrows. Focus on spatial relationships and site analysis rather than architectural design. ${description}`;
        break;
    }

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt,
      size: "1024x1024",
      quality: "standard",
      n: 1,
    });

    if (!response.data || response.data.length === 0) {
      return null;
    }

    return response.data[0].url ?? null;
  } catch (error) {
    console.error('Error generating image:', error);
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const {
      location,
      description,
      feelings = [],
      analysisData = null,
      siteCharacteristics = null
    }: RequestData = await req.json();

    if (!location || !description) {
      return NextResponse.json(
        { error: 'Missing required fields: location and description are required' },
        { status: 400 }
      );
    }

    const prompt = `Generate an extremely detailed and comprehensive architectural site analysis report. For each section, provide in-depth analysis, specific examples, and detailed recommendations. Include quantitative and qualitative assessments where applicable.

Structure the report with the following sections:

1. Executive Summary
- Comprehensive overview of key findings
- Critical site characteristics and their implications
- Primary recommendations and strategic direction

2. Site Context & Location Analysis
- Detailed geographic and topographic analysis
- Surrounding urban/rural context and its impact
- Connectivity and accessibility assessment
- Microclimate analysis
- Views and vistas evaluation

3. Historical & Cultural Analysis
- Historical significance and heritage considerations
- Cultural context and community values
- Local architectural vernacular
- Social and demographic patterns
- Cultural preservation opportunities

4. Environmental Analysis
- Detailed climate data and implications
- Solar path analysis and shadow studies
- Wind patterns and their effects
- Vegetation and biodiversity assessment
- Water management considerations
- Soil conditions and geology
- Environmental challenges and opportunities

5. Sensory & Experiential Analysis
- Detailed analysis of site atmosphere and character
- Sound mapping and acoustic considerations
- Visual quality assessment
- Tactile and material experiences
- Temporal variations (daily/seasonal changes)
- User experience journey mapping

6. Infrastructure & Services Assessment
- Utilities availability and capacity
- Transportation infrastructure
- Public services accessibility
- Digital connectivity
- Waste management systems
- Emergency services access

7. Opportunities & Constraints
- Detailed SWOT analysis
- Development potential
- Regulatory constraints
- Environmental limitations
- Social and community factors
- Economic considerations

8. Design Recommendations
- Architectural style and form suggestions
- Sustainability strategies
- Material palette recommendations
- Spatial organization principles
- Integration with surroundings
- Innovation opportunities

9. Visual Documentation Requirements
- Required documentation and presentations
- Visualization strategies
- Key viewpoints and perspectives
- Documentation standards

10. Technical Data Appendix
- Detailed site measurements
- Environmental data
- Regulatory requirements
- Technical specifications
- Reference standards

Site Information:
Location: ${location.lat}, ${location.lng}
Elevation: ${analysisData?.elevation ?? 'N/A'}
Site Description: ${description}
Feelings/Atmosphere: ${feelings.length > 0 ? feelings.map(f => `${f.primary} (${f.related?.join(', ') ?? ''})`).join('; ') : 'N/A'}
Site Characteristics: ${siteCharacteristics ? Object.entries(siteCharacteristics).flatMap(([category, values]) => 
  typeof values === 'object' ? 
    Object.entries(values).map(([key, value]) => 
      Array.isArray(value) ? value.join(', ') : value
    ) : 
    values
).filter((value): value is string => Boolean(value)).join(', ') : 'N/A'}
Nearby Features: ${analysisData?.features?.map(f => f.properties.type ?? f.properties.class ?? 'unknown').filter(Boolean).join(', ') ?? 'N/A'}

For each section:
1. Provide specific, actionable insights
2. Include quantitative data where applicable
3. Reference relevant architectural precedents
4. Consider both immediate and long-term implications
5. Address sustainability and resilience
6. Include innovative approaches and technologies
7. Consider cultural and social impact
8. Provide practical implementation guidance

Use professional architectural terminology while maintaining clarity. Support all recommendations with clear reasoning and evidence.`;

    // First, get the text analysis
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert architectural site analyst with extensive experience in urban planning, environmental analysis, and architectural design. Provide comprehensive, professional analysis that combines technical expertise with practical insights. Your analysis should be thorough and detailed, considering multiple perspectives and future implications."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 4000,
      presence_penalty: 0.3,
      frequency_penalty: 0.3
    });

    const analysis = completion.choices[0].message.content;

    // Generate technical diagrams and infographics
    const [siteAnalysisImage, environmentalImage, designImage] = await Promise.all([
      generateSectionImage(
        'siteAnalysis',
        `Site location: ${location.lat}, ${location.lng}, Elevation: ${analysisData?.elevation ?? 'N/A'}m. 
         Site characteristics: ${description}. Show key site features and constraints.`
      ),
      generateSectionImage(
        'environmental',
        `Environmental factors for site with characteristics: ${
          siteCharacteristics ? 
          Object.entries(siteCharacteristics).flatMap(([category, values]) => 
            typeof values === 'object' ? 
              Object.entries(values).map(([key, value]) => 
                Array.isArray(value) ? value.join(', ') : value
              ) : 
              values
          ).filter((value): value is string => Boolean(value)).join(', ') 
          : 'N/A'
        }. Include analysis of local climate conditions, vegetation, and environmental challenges.`
      ),
      generateSectionImage(
        'design',
        `Design analysis for site with atmosphere: ${feelings.map(f => f.primary).join(', ')}. 
         Nearby features: ${analysisData?.features?.map(f => f.properties.type ?? f.properties.class ?? 'unknown').filter(Boolean).join(', ') ?? 'N/A'}.
         Show potential architectural responses and spatial strategies.`
      )
    ]);

    // Return both the analysis text and generated images
    return NextResponse.json({
      analysis,
      images: {
        siteContext: siteAnalysisImage,
        environmental: environmentalImage,
        designRecommendation: designImage
      }
    });

  } catch (error) {
    console.error('Error generating analysis:', error);
    return NextResponse.json(
      { error: 'Failed to generate analysis' },
      { status: 500 }
    );
  }
} 