import { db } from '../src/lib/db';
import { caseStudies } from '../src/lib/db/schema';

async function testCaseStudyAccess() {
  try {
    // Get all case studies
    const studies = await db.query.caseStudies.findMany();
    
    // Format the data in a way that would be useful for the AI assistant
    const formattedStudies = studies.map(study => ({
      id: study.id,
      title: study.title,
      architect: study.architect,
      year: study.year,
      location: study.location,
      typology: study.typology,
      description: study.description,
      characteristics: study.characteristics,
      metadata: study.metadata,
      imageCount: study.images?.gallery?.length || 0
    }));

    console.log('Successfully retrieved case studies:');
    console.log(JSON.stringify(formattedStudies, null, 2));
    console.log(`\nTotal number of case studies: ${studies.length}`);
  } catch (error) {
    console.error('Error accessing case studies:', error);
  }
}

testCaseStudyAccess(); 