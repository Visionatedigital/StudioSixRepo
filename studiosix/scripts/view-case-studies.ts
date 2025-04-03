import { db } from '../src/lib/db';
import { caseStudies } from '../src/lib/db/schema';

async function viewCaseStudies() {
  try {
    const results = await db.query.caseStudies.findMany();
    console.log('Found case studies:', results.length);
    console.log(JSON.stringify(results, null, 2));
  } catch (error) {
    console.error('Error fetching case studies:', error);
  }
}

viewCaseStudies(); 