import { CaseStudy } from '../base';
import { v4 as uuidv4 } from 'uuid';

// Test data for development purposes
const MOCK_CASE_STUDIES: Record<string, Partial<CaseStudy>> = {
  residential: {
    title: 'Modern Residential Villa',
    description: 'A contemporary residential villa with floor-to-ceiling windows and a central courtyard designed for a family of four. The house features an open-plan living area, four bedrooms, and a sustainable approach to energy usage.',
    architect: 'Studio Contemporary',
    year: 2023,
    location: 'Vancouver, Canada',
    typology: 'residential',
    source: 'mockdaily',
    sourceUrl: 'https://www.archdaily.com/mock/residential-villa',
    images: {
      main: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&w=600&h=400',
      floorPlans: ['https://images.unsplash.com/photo-1595514535215-b831ad654afd?auto=format&w=400&h=300'],
      renders: [],
      sections: ['https://images.unsplash.com/photo-1572297794401-874f6e512788?auto=format&w=400&h=300'],
      details: [],
    },
    metadata: {
      area: 250,
      client: 'Private',
      materials: ['Wood', 'Glass', 'Concrete'],
      sustainability: ['Solar Power', 'Rainwater Collection'],
      awards: ['Residential Design Award 2023']
    },
    characteristics: {
      keyFeatures: ['Indoor Garden', 'Natural Ventilation', 'Sustainable Materials'],
      siteConstraints: ['Urban Context', 'Small Lot'],
      programmaticRequirements: ['Four Bedrooms', 'Home Office', 'Open Living Area'],
      designChallenges: ['Limited Space', 'Environmental Considerations'],
      spatialOrganization: 'Central courtyard',
      area: 250,
      location: 'Vancouver, Canada'
    }
  },
  commercial: {
    title: 'Urban Office Hub',
    description: 'A modern office space designed to promote collaboration and creativity. The building features open workspaces, meeting pods, and recreational areas to enhance employee wellbeing.',
    architect: 'Metropolis Design',
    year: 2022,
    location: 'Chicago, USA',
    typology: 'commercial',
    source: 'mockdaily',
    sourceUrl: 'https://www.archdaily.com/mock/urban-office',
    images: {
      main: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&w=600&h=400',
      floorPlans: ['https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&w=400&h=300'],
      renders: ['https://images.unsplash.com/photo-1545049459-9c723dd14199?auto=format&w=400&h=300'],
      sections: ['https://images.unsplash.com/photo-1531973576160-7125cd663d86?auto=format&w=400&h=300'],
      details: [],
    },
    metadata: {
      area: 3500,
      client: 'Tech Innovations Inc.',
      materials: ['Steel', 'Glass', 'Concrete'],
      sustainability: ['Energy Efficient Systems', 'Green Roof'],
      awards: ['Commercial Design Award 2022']
    },
    characteristics: {
      keyFeatures: ['Flexible Workspaces', 'Rooftop Garden', 'Natural Light'],
      siteConstraints: ['Dense Urban Context', 'Historic District'],
      programmaticRequirements: ['Open Plan Offices', 'Meeting Rooms', 'Recreation Areas'],
      designChallenges: ['Heritage Considerations', 'Tight Site Boundaries'],
      spatialOrganization: 'Central atrium',
      area: 3500,
      location: 'Chicago, USA'
    }
  },
  cultural: {
    title: 'Contemporary Art Museum',
    description: 'A museum designed to showcase contemporary art with flexible exhibition spaces and innovative lighting solutions that adapt to different types of artworks.',
    architect: 'Harmony Architects',
    year: 2021,
    location: 'Berlin, Germany',
    typology: 'cultural',
    source: 'mockdaily',
    sourceUrl: 'https://www.archdaily.com/mock/art-museum',
    images: {
      main: 'https://images.unsplash.com/photo-1518005068251-37900150dfca?auto=format&w=600&h=400',
      floorPlans: ['https://images.unsplash.com/photo-1536172930127-0efd05b80a77?auto=format&w=400&h=300'],
      renders: ['https://images.unsplash.com/photo-1533158326339-7f3cf2404354?auto=format&w=400&h=300'],
      sections: ['https://images.unsplash.com/photo-1502901930015-158e72cff877?auto=format&w=400&h=300'],
      details: [],
    },
    metadata: {
      area: 7500,
      client: 'Berlin Cultural Foundation',
      materials: ['Concrete', 'Glass', 'Steel', 'Wood'],
      sustainability: ['Natural Ventilation', 'Solar Panels', 'Rainwater Harvesting'],
      awards: ['Cultural Design Excellence Award 2021']
    },
    characteristics: {
      keyFeatures: ['Flexible Exhibition Space', 'Custom Lighting System', 'Acoustic Design'],
      siteConstraints: ['Urban Setting', 'Historic Context'],
      programmaticRequirements: ['Exhibition Galleries', 'Auditorium', 'Workshop Spaces'],
      designChallenges: ['Lighting Control', 'Flexible Spaces', 'Heritage Integration'],
      spatialOrganization: 'Radial layout',
      area: 7500,
      location: 'Berlin, Germany'
    }
  },
  educational: {
    title: 'Innovation Campus',
    description: 'An educational campus designed to foster innovation and collaboration among students. The buildings are interconnected with outdoor spaces to create a cohesive learning environment.',
    architect: 'Education Design Group',
    year: 2023,
    location: 'Stockholm, Sweden',
    typology: 'educational',
    source: 'mockdaily',
    sourceUrl: 'https://www.archdaily.com/mock/innovation-campus',
    images: {
      main: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&w=600&h=400',
      floorPlans: ['https://images.unsplash.com/photo-1574269910231-6a35b4d5d4f6?auto=format&w=400&h=300'],
      renders: ['https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&w=400&h=300'],
      sections: ['https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&w=400&h=300'],
      details: [],
    },
    metadata: {
      area: 12000,
      client: 'Stockholm University',
      materials: ['Wood', 'Glass', 'Steel', 'Stone'],
      sustainability: ['Geothermal Energy', 'Green Roofs', 'Passive Design'],
      awards: ['Educational Architecture Award 2023']
    },
    characteristics: {
      keyFeatures: ['Collaborative Spaces', 'Indoor-Outdoor Connection', 'Flexible Classrooms'],
      siteConstraints: ['Campus Integration', 'Existing Buildings'],
      programmaticRequirements: ['Classrooms', 'Research Labs', 'Common Areas'],
      designChallenges: ['Climate Adaptation', 'Future Flexibility'],
      spatialOrganization: 'Campus cluster',
      area: 12000,
      location: 'Stockholm, Sweden'
    }
  },
  landscape: {
    title: 'Urban Waterfront Park',
    description: 'A revitalized waterfront area transformed into a public park with various recreational zones, native plantings, and sustainable water management systems.',
    architect: 'Landscape Innovations',
    year: 2022,
    location: 'Sydney, Australia',
    typology: 'landscape',
    source: 'mockdaily',
    sourceUrl: 'https://www.archdaily.com/mock/waterfront-park',
    images: {
      main: 'https://images.unsplash.com/photo-1496614932623-0a3a9743552e?auto=format&w=600&h=400',
      floorPlans: ['https://images.unsplash.com/photo-1600240644455-fd01cbe7a3d4?auto=format&w=400&h=300'],
      renders: ['https://images.unsplash.com/photo-1585506942812-e72b29de8f1f?auto=format&w=400&h=300'],
      sections: ['https://images.unsplash.com/photo-1600240644455-fd01cbe7a3d4?auto=format&w=400&h=300'],
      details: [],
    },
    metadata: {
      area: 25000,
      client: 'Sydney City Council',
      materials: ['Stone', 'Wood', 'Concrete', 'Corten Steel'],
      sustainability: ['Native Plantings', 'Stormwater Management', 'Solar Lighting'],
      awards: ['Landscape Design Award 2022']
    },
    characteristics: {
      keyFeatures: ['Waterfront Promenade', 'Recreational Areas', 'Ecological Restoration'],
      siteConstraints: ['Water Edge', 'Urban Context', 'Flood Zone'],
      programmaticRequirements: ['Public Space', 'Event Areas', 'Water Access Points'],
      designChallenges: ['Flood Management', 'Maintenance Considerations'],
      spatialOrganization: 'Linear organization',
      area: 25000,
      location: 'Sydney, Australia'
    }
  }
};

// Materials-specific mock data
const MATERIAL_SPECIFIC_MOCKS: Record<string, Partial<CaseStudy>> = {
  'Wood': {
    title: 'Timber Pavilion',
    description: 'A striking timber pavilion showcasing the versatility and warmth of wood as a primary building material. The structure features complex joinery techniques and a minimal environmental footprint.',
    architect: 'Wood Works Studio',
    year: 2023,
    location: 'Portland, USA',
    typology: 'cultural',
    metadata: {
      materials: ['Wood', 'Glass'],
      sustainability: ['Sustainable Forestry', 'Passive Design']
    },
    images: {
      main: 'https://images.unsplash.com/photo-1610500796385-3ffc1ae2f046?auto=format&w=600&h=400',
      floorPlans: ['https://images.unsplash.com/photo-1600240644455-fd01cbe7a3d4?auto=format&w=400&h=300'],
      renders: [],
      sections: ['https://images.unsplash.com/photo-1600240644455-fd01cbe7a3d4?auto=format&w=400&h=300'],
      details: [],
    }
  },
  'Glass': {
    title: 'Transparent Office',
    description: 'An office building with a fully glazed facade, creating a transparent and light-filled workspace. Advanced glazing technologies are employed to manage solar gain and energy efficiency.',
    architect: 'Crystal Architecture',
    year: 2022,
    location: 'Tokyo, Japan',
    typology: 'commercial',
    metadata: {
      materials: ['Glass', 'Steel', 'Concrete'],
      sustainability: ['Energy Efficient Glazing', 'Daylight Harvesting']
    },
    images: {
      main: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&w=600&h=400',
      floorPlans: ['https://images.unsplash.com/photo-1574269910231-6a35b4d5d4f6?auto=format&w=400&h=300'],
      renders: [],
      sections: ['https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&w=400&h=300'],
      details: [],
    }
  },
  'Concrete': {
    title: 'Brutalist Gallery',
    description: 'A raw concrete structure housing an art gallery, emphasizing the expressive potential of exposed concrete. The building features dramatic forms and carefully crafted light wells.',
    architect: 'Solid Forms',
    year: 2021,
    location: 'Sao Paulo, Brazil',
    typology: 'cultural',
    metadata: {
      materials: ['Concrete', 'Glass', 'Steel'],
      sustainability: ['Thermal Mass', 'Low Maintenance']
    },
    images: {
      main: 'https://images.unsplash.com/photo-1518005068251-37900150dfca?auto=format&w=600&h=400',
      floorPlans: ['https://images.unsplash.com/photo-1536172930127-0efd05b80a77?auto=format&w=400&h=300'],
      renders: [],
      sections: ['https://images.unsplash.com/photo-1502901930015-158e72cff877?auto=format&w=400&h=300'],
      details: [],
    }
  }
};

// Location-specific mock data
const LOCATION_SPECIFIC_MOCKS: Record<string, Partial<CaseStudy>> = {
  'urban': {
    title: 'Urban Infill Project',
    description: 'A mixed-use building inserted into a tight urban context, maximizing the potential of a constrained site while respecting the surrounding urban fabric.',
    location: 'New York, USA',
    typology: 'mixed-use',
    characteristics: {
      keyFeatures: ['Vertical Organization', 'Mixed-Use Programming', 'Urban Integration'],
      siteConstraints: ['Dense Urban Context', 'Tight Site Boundaries'],
      programmaticRequirements: ['Retail', 'Office Space', 'Residential Units'],
      designChallenges: ['Site Constraints', 'Urban Regulations', 'Mixed-Use Integration'],
      spatialOrganization: 'Vertical stacking',
      area: 3800,
      location: 'New York, USA'
    },
    images: {
      main: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&w=600&h=400',
      floorPlans: ['https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&w=400&h=300'],
      renders: [],
      sections: ['https://images.unsplash.com/photo-1531973576160-7125cd663d86?auto=format&w=400&h=300'],
      details: []
    }
  },
  'rural': {
    title: 'Rural Retreat',
    description: 'A residential retreat nestled in a rural landscape, designed to harmonize with the natural surroundings while providing a comfortable living environment.',
    location: 'Montana, USA',
    typology: 'residential',
    characteristics: {
      keyFeatures: ['Landscape Integration', 'Sustainable Systems', 'Natural Materials'],
      siteConstraints: ['Rural Setting', 'Natural Landscape'],
      programmaticRequirements: ['Living Spaces', 'Guest Accommodation', 'Outdoor Areas'],
      designChallenges: ['Weather Conditions', 'Remote Location', 'Sustainability'],
      spatialOrganization: 'Horizontal layout',
      area: 250,
      location: 'Montana, USA'
    },
    images: {
      main: 'https://images.unsplash.com/photo-1551927336-09d50efd69cd?auto=format&w=600&h=400',
      floorPlans: ['https://images.unsplash.com/photo-1595514535215-b831ad654afd?auto=format&w=400&h=300'],
      renders: [],
      sections: ['https://images.unsplash.com/photo-1572297794401-874f6e512788?auto=format&w=400&h=300'],
      details: []
    }
  },
  'coastal': {
    title: 'Coastal Residence',
    description: 'A home designed to withstand coastal conditions while taking advantage of stunning ocean views through carefully positioned apertures.',
    location: 'Malibu, USA',
    typology: 'residential',
    characteristics: {
      keyFeatures: ['Ocean Views', 'Weather Resistance', 'Outdoor Living Spaces'],
      siteConstraints: ['Coastal Exposure', 'Environmental Regulations'],
      programmaticRequirements: ['Living Areas', 'Beach Access', 'View Maximization'],
      designChallenges: ['Salt Air Exposure', 'Storm Protection', 'View Optimization'],
      spatialOrganization: 'Linear organization facing ocean',
      area: 320,
      location: 'Malibu, USA'
    },
    images: {
      main: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&w=600&h=400',
      floorPlans: ['https://images.unsplash.com/photo-1595514535215-b831ad654afd?auto=format&w=400&h=300'],
      renders: [],
      sections: ['https://images.unsplash.com/photo-1572297794401-874f6e512788?auto=format&w=400&h=300'],
      details: []
    }
  }
};

/**
 * Mock scraper for development purposes
 * Returns varied, realistic test data based on search parameters
 */
export class MockScraper {
  constructor() {
    console.log('[MockScraper] Initialized');
  }
  
  /**
   * Simulates scraping a project page
   * @param url Mock URL to "scrape"
   * @returns A mock case study
   */
  public async scrapeProjectPage(url: string): Promise<CaseStudy> {
    console.log(`[MockScraper] Pretending to scrape ${url}`);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
    
    // Extract project type from URL if possible
    let baseTemplate: Partial<CaseStudy> = { ...MOCK_CASE_STUDIES.residential };
    
    if (url.includes('residential')) {
      baseTemplate = { ...MOCK_CASE_STUDIES.residential };
    } else if (url.includes('commercial') || url.includes('office')) {
      baseTemplate = { ...MOCK_CASE_STUDIES.commercial };
    } else if (url.includes('cultural') || url.includes('museum')) {
      baseTemplate = { ...MOCK_CASE_STUDIES.cultural };
    } else if (url.includes('educational') || url.includes('school')) {
      baseTemplate = { ...MOCK_CASE_STUDIES.educational };
    } else if (url.includes('landscape') || url.includes('park')) {
      baseTemplate = { ...MOCK_CASE_STUDIES.landscape };
    }
    
    // Generate a unique ID
    const id = `mock-${uuidv4().slice(0, 8)}`;
    
    // Add slight variations to make each result unique
    const year = (baseTemplate.year || 2020) + Math.floor(Math.random() * 4) - 2;
    const area = (baseTemplate.metadata?.area || 1000) * (0.9 + Math.random() * 0.2);
    
    // Create the full case study by combining the template with unique values
    const caseStudy: CaseStudy = {
      id,
      title: baseTemplate.title || 'Mock Project',
      description: baseTemplate.description || 'This is a mock project description',
      architect: baseTemplate.architect || 'Mock Architects',
      year,
      location: baseTemplate.location || 'Mock Location',
      typology: baseTemplate.typology || 'mixed',
      source: 'mockdaily',
      sourceUrl: url,
      images: baseTemplate.images || {
        main: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&w=600&h=400',
        floorPlans: [],
        renders: [],
        sections: [],
        details: []
      },
      metadata: {
        area: Math.round(area),
        client: baseTemplate.metadata?.client || 'Mock Client',
        materials: baseTemplate.metadata?.materials || ['Concrete', 'Glass', 'Steel'],
        sustainability: baseTemplate.metadata?.sustainability || [],
        awards: baseTemplate.metadata?.awards || []
      },
      characteristics: {
        keyFeatures: baseTemplate.characteristics?.keyFeatures || ['Feature 1', 'Feature 2'],
        siteConstraints: baseTemplate.characteristics?.siteConstraints || [],
        programmaticRequirements: baseTemplate.characteristics?.programmaticRequirements || [],
        designChallenges: baseTemplate.characteristics?.designChallenges || [],
        spatialOrganization: baseTemplate.characteristics?.spatialOrganization || 'Standard Layout',
        area: Math.round(area),
        location: baseTemplate.location || 'Mock Location'
      }
    };
    
    console.log(`[MockScraper] Generated mock case study: ${caseStudy.title}`);
    return caseStudy;
  }
}

/**
 * Function to search for mock case studies
 */
export async function mockSearch(searchParams: any): Promise<CaseStudy[]> {
  console.log('[MockScraper] Searching with parameters:', searchParams);
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const { projectType, location, materials } = searchParams;
  const results: CaseStudy[] = [];
  const scraper = new MockScraper();
  
  // Generate URLs based on search parameters
  const urls: string[] = [];
  
  // Add type-specific URLs
  if (projectType) {
    if (MOCK_CASE_STUDIES[projectType]) {
      urls.push(`https://www.mockdaily.com/mock/${projectType}-project-1`);
      urls.push(`https://www.mockdaily.com/mock/${projectType}-project-2`);
    }
  } else {
    // Add a mix of project types
    Object.keys(MOCK_CASE_STUDIES).forEach(type => {
      urls.push(`https://www.mockdaily.com/mock/${type}-project-${Math.floor(Math.random() * 100)}`);
    });
  }
  
  // Add material-specific URLs if materials are specified
  if (materials && materials.length > 0) {
    materials.forEach((material: string) => {
      if (MATERIAL_SPECIFIC_MOCKS[material]) {
        urls.push(`https://www.mockdaily.com/mock/${material.toLowerCase()}-project`);
      }
    });
  }
  
  // Add location-specific URLs if location is specified
  if (location) {
    const locationLower = location.toLowerCase();
    Object.keys(LOCATION_SPECIFIC_MOCKS).forEach(key => {
      if (locationLower.includes(key)) {
        urls.push(`https://www.mockdaily.com/mock/${key}-project`);
      }
    });
  }
  
  // Ensure we have at least 3 URLs
  while (urls.length < 3) {
    const types = Object.keys(MOCK_CASE_STUDIES);
    const randomType = types[Math.floor(Math.random() * types.length)];
    urls.push(`https://www.mockdaily.com/mock/${randomType}-project-${Math.floor(Math.random() * 100)}`);
  }
  
  // Remove duplicates
  const uniqueUrls = Array.from(new Set(urls));
  
  // Take only up to 5 URLs to simulate
  const selectedUrls = uniqueUrls.slice(0, 5);
  
  console.log(`[MockScraper] Will simulate scraping: ${selectedUrls.join(', ')}`);
  
  // "Scrape" each URL
  for (const url of selectedUrls) {
    try {
      const result = await scraper.scrapeProjectPage(url);
      results.push(result);
    } catch (error) {
      console.error(`[MockScraper] Error simulating scrape for ${url}:`, error);
    }
  }
  
  console.log(`[MockScraper] Generated ${results.length} mock results`);
  return results;
} 