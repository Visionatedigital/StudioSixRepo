import { db } from './index';
import { caseStudies } from './schema';
import { eq } from 'drizzle-orm';

async function seed() {
  try {
    // Clear existing data
    await db.delete(caseStudies);

    // Sample case studies
    const sampleCaseStudies = [
      {
        id: '1',
        title: 'Modern Minimalist House',
        description: 'A contemporary single-family residence featuring clean lines and open spaces',
        architect: 'Studio Six Architects',
        year: 2023,
        location: 'San Francisco, CA',
        typology: 'Residential',
        source: 'ArchDaily',
        sourceUrl: 'https://example.com/case-study-1',
        images: {
          main: '/images/case-studies/house-1.jpg',
          gallery: [
            '/images/case-studies/house-1-1.jpg',
            '/images/case-studies/house-1-2.jpg'
          ]
        },
        characteristics: {
          keyFeatures: ['Open Floor Plan', 'Natural Light', 'Sustainable Materials'],
          siteConstraints: ['Steep Slope', 'Narrow Lot'],
          programmaticRequirements: ['3 Bedrooms', '2 Bathrooms', 'Home Office'],
          designChallenges: ['Maximizing Views', 'Privacy from Street'],
          spatialOrganization: 'Linear with Central Circulation',
          area: 2500,
          location: 'Urban Residential'
        },
        metadata: {
          tags: ['modern', 'residential', 'sustainable'],
          awards: ['AIA Design Award 2023']
        },
        embedding: new Array(1536).fill(0), // Placeholder embedding
        relevanceScore: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '2',
        title: 'Urban Mixed-Use Development',
        description: 'A mixed-use development combining retail, office, and residential spaces',
        architect: 'Studio Six Architects',
        year: 2022,
        location: 'New York, NY',
        typology: 'Mixed-Use',
        source: 'ArchDaily',
        sourceUrl: 'https://example.com/case-study-2',
        images: {
          main: '/images/case-studies/mixed-use-1.jpg',
          gallery: [
            '/images/case-studies/mixed-use-1-1.jpg',
            '/images/case-studies/mixed-use-1-2.jpg'
          ]
        },
        characteristics: {
          keyFeatures: ['Vertical Integration', 'Public Plaza', 'Green Roof'],
          siteConstraints: ['Historic District', 'Height Restrictions'],
          programmaticRequirements: ['Retail Space', 'Office Space', 'Residential Units'],
          designChallenges: ['Contextual Integration', 'Pedestrian Flow'],
          spatialOrganization: 'Vertical Stacking',
          area: 50000,
          location: 'Urban Core'
        },
        metadata: {
          tags: ['mixed-use', 'urban', 'sustainable'],
          awards: ['Urban Design Award 2022']
        },
        embedding: new Array(1536).fill(0), // Placeholder embedding
        relevanceScore: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    // Insert sample data
    await db.insert(caseStudies).values(sampleCaseStudies);

    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seed(); 