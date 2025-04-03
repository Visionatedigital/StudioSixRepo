import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { caseStudies } from '@/lib/db/schema';
import { eq, ilike, and, or } from 'drizzle-orm';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || '';
  const typology = searchParams.get('typology') || '';
  const year = searchParams.get('year') || '';
  const location = searchParams.get('location') || '';

  try {
    let conditions = [];

    if (query) {
      conditions.push(
        or(
          ilike(caseStudies.title, `%${query}%`),
          ilike(caseStudies.description, `%${query}%`),
          ilike(caseStudies.architect, `%${query}%`)
        )
      );
    }

    if (typology) {
      conditions.push(ilike(caseStudies.typology, `%${typology}%`));
    }

    if (year) {
      conditions.push(eq(caseStudies.year, parseInt(year)));
    }

    if (location) {
      conditions.push(ilike(caseStudies.location, `%${location}%`));
    }

    const results = await db.query.caseStudies.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      orderBy: (caseStudies, { desc }) => [desc(caseStudies.createdAt)],
      limit: 20,
    });

    return NextResponse.json(results);
  } catch (error) {
    console.error('Error querying case studies:', error);
    return NextResponse.json(
      { error: 'Failed to fetch case studies' },
      { status: 500 }
    );
  }
} 