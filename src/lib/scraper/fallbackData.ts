import { CaseStudy } from './base';

// Fallback data for development or when scraping fails
export const fallbackCaseStudies: CaseStudy[] = [
  {
    id: 'fallback-1',
    title: 'Modern Garden House',
    description: 'A sustainable residential project that integrates indoor and outdoor living spaces with careful consideration for light and ventilation.',
    architect: 'Studio Green',
    year: 2022,
    location: 'Vancouver, Canada',
    typology: 'residential',
    source: 'archdaily',
    sourceUrl: 'https://www.archdaily.com/991543/house-in-the-garden-jure-kotonik',
    images: {
      main: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&w=600&h=400',
      floorPlans: ['https://images.unsplash.com/photo-1595514535215-b831ad654afd?auto=format&w=400&h=300'],
      renders: [],
      sections: ['https://images.unsplash.com/photo-1572297794401-874f6e512788?auto=format&w=400&h=300'],
      details: [],
    },
    metadata: {
      area: 185,
      client: 'Private',
      materials: ['Wood', 'Glass', 'Concrete'],
      sustainability: ['Solar Power', 'Rainwater Collection'],
      awards: ['Sustainability Award 2022']
    },
    characteristics: {
      keyFeatures: ['Indoor Garden', 'Natural Ventilation', 'Sustainable Materials'],
      siteConstraints: ['Urban Context', 'Small Lot'],
      programmaticRequirements: ['Three Bedrooms', 'Home Office', 'Open Living Area'],
      designChallenges: ['Limited Space', 'Environmental Considerations'],
      spatialOrganization: 'Vertical organization with central courtyard',
      area: 185,
      location: 'Vancouver, Canada'
    }
  },
  {
    id: 'fallback-2',
    title: 'Urban Office Complex',
    description: 'A contemporary commercial space designed to foster collaboration and creativity within a dense urban setting.',
    architect: 'Metropolis Architecture',
    year: 2021,
    location: 'Chicago, USA',
    typology: 'commercial',
    source: 'archdaily',
    sourceUrl: 'https://www.archdaily.com/990918/shopify-tokyo-office-suppose-design-office',
    images: {
      main: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&w=600&h=400',
      floorPlans: ['https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&w=400&h=300'],
      renders: ['https://images.unsplash.com/photo-1545049459-9c723dd14199?auto=format&w=400&h=300'],
      sections: ['https://images.unsplash.com/photo-1531973576160-7125cd663d86?auto=format&w=400&h=300'],
      details: [],
    },
    metadata: {
      area: 4500,
      client: 'TechCorp Inc.',
      materials: ['Steel', 'Glass', 'Concrete'],
      sustainability: ['Energy Efficient Systems', 'Green Roof'],
      awards: ['Commercial Design Award 2021']
    },
    characteristics: {
      keyFeatures: ['Flexible Workspaces', 'Rooftop Garden', 'Natural Light'],
      siteConstraints: ['Dense Urban Context', 'Historic District'],
      programmaticRequirements: ['Open Plan Offices', 'Meeting Rooms', 'Recreation Areas'],
      designChallenges: ['Heritage Considerations', 'Tight Site Boundaries'],
      spatialOrganization: 'Central atrium with peripheral office spaces',
      area: 4500,
      location: 'Chicago, USA'
    }
  },
  {
    id: 'fallback-3',
    title: 'Cultural Arts Center',
    description: 'A vibrant cultural hub designed with flexible exhibition spaces and innovative acoustics for performances.',
    architect: 'Harmony Designs',
    year: 2020,
    location: 'Barcelona, Spain',
    typology: 'cultural',
    source: 'archdaily',
    sourceUrl: 'https://www.archdaily.com/990505/jiangsu-grand-theatre-pei-partnership-architects-plus-east-china-architectural-design-and-research-institute',
    images: {
      main: 'https://images.unsplash.com/photo-1518005068251-37900150dfca?auto=format&w=600&h=400',
      floorPlans: ['https://images.unsplash.com/photo-1536172930127-0efd05b80a77?auto=format&w=400&h=300'],
      renders: ['https://images.unsplash.com/photo-1533158326339-7f3cf2404354?auto=format&w=400&h=300'],
      sections: ['https://images.unsplash.com/photo-1502901930015-158e72cff877?auto=format&w=400&h=300'],
      details: [],
    },
    metadata: {
      area: 8500,
      client: 'Barcelona Cultural Foundation',
      materials: ['Concrete', 'Glass', 'Steel', 'Wood'],
      sustainability: ['Natural Ventilation', 'Solar Panels', 'Rainwater Harvesting'],
      awards: ['Cultural Design Excellence Award 2020']
    },
    characteristics: {
      keyFeatures: ['Flexible Exhibition Space', 'Performance Hall', 'Acoustic Design'],
      siteConstraints: ['Urban Setting', 'Historic Context'],
      programmaticRequirements: ['Exhibition Galleries', 'Auditorium', 'Workshop Spaces'],
      designChallenges: ['Acoustics', 'Flexible Spaces', 'Heritage Integration'],
      spatialOrganization: 'Radial layout with central atrium',
      area: 8500,
      location: 'Barcelona, Spain'
    }
  }
]; 