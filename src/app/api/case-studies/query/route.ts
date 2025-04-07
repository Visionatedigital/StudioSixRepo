import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { caseStudies } from '@/lib/db/schema';
import { eq, ilike, and, or } from 'drizzle-orm';

export async function POST(request: Request) {
  try {
    const { query } = await request.json();
    console.log('Searching for:', query);

    // First try exact match
    const exactResults = await db.query.caseStudies.findMany({
      where: or(
        ilike(caseStudies.title, `%${query}%`),
        ilike(caseStudies.description, `%${query}%`)
      ),
      limit: 5
    });

    if (exactResults.length > 0) {
      console.log('Found exact matches:', exactResults);
      return NextResponse.json(exactResults);
    }

    // If no exact matches, try searching for key terms
    const keyTerms = query.toLowerCase().split(/\s+/).filter(term => 
      term.length > 3 && !['the', 'and', 'for', 'about', 'more', 'tell', 'me'].includes(term)
    );

    console.log('Searching with key terms:', keyTerms);

    const results = await db.query.caseStudies.findMany({
      where: or(
        ...keyTerms.map((term: string) => 
          or(
            ilike(caseStudies.title, `%${term}%`),
            ilike(caseStudies.description, `%${term}%`),
            ilike(caseStudies.architect, `%${term}%`),
            ilike(caseStudies.location, `%${term}%`),
            ilike(caseStudies.typology, `%${term}%`)
          )
        )
      ),
      limit: 5
    });

    console.log('Found case studies:', results);
    return NextResponse.json(results);
  } catch (error) {
    console.error('Error querying case studies:', error);
    return NextResponse.json(
      { error: 'Failed to fetch case studies' },
      { status: 500 }
    );
  }
} 