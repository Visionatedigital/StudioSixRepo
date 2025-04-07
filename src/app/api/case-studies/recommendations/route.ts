import { NextResponse } from 'next/server';
import { CaseStudyService } from '@/lib/services/case-study-service';
import { ProjectContext } from '@/lib/types/case-study';

export async function POST(request: Request) {
  try {
    const context: ProjectContext = await request.json();
    const service = new CaseStudyService();
    const recommendations = await service.findRelevantCaseStudies(context);

    return NextResponse.json(recommendations);
  } catch (error) {
    console.error('Error getting case study recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to get case study recommendations' },
      { status: 500 }
    );
  }
} 