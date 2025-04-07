export interface ProjectContext {
  siteConstraints?: string[];
  programmaticRequirements?: string[];
  designChallenges?: string[];
  spatialOrganization?: string[];
  typology?: string;
  area?: number;
  location?: string;
  description?: string;
}

export interface CaseStudyReference {
  id: string;
  title: string;
  description?: string;
  architect?: string;
  year?: number;
  location?: string;
  typology?: string;
  source: string;
  sourceUrl: string;
  images: {
    main: string;
    floorPlans: string[];
    renders: string[];
    sections: string[];
    details: string[];
  };
  characteristics: {
    siteConstraints: string[];
    programmaticRequirements: string[];
    designChallenges: string[];
    solutions: string[];
    keyFeatures: string[];
    spatialOrganization: string[];
    circulation: string[];
    environmentalConsiderations: string[];
  };
  metadata: {
    area?: number;
    client?: string;
    materials?: string[];
    sustainability?: string[];
    awards?: string[];
  };
  embedding: number[];
  relevanceScore?: number;
  createdAt: Date;
  updatedAt: Date;
} 