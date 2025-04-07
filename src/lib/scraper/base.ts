import { db } from '../db';
import { caseStudies } from '../db/schema';
import { eq } from 'drizzle-orm';

export interface CaseStudy {
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
  metadata: {
    area?: number;
    client?: string;
    materials?: string[];
    sustainability?: string[];
    awards?: string[];
  };
  characteristics: {
    keyFeatures: string[];
    siteConstraints: string[];
    programmaticRequirements: string[];
    designChallenges: string[];
    spatialOrganization: string;
    area: number;
    location: string;
  };
}

export abstract class BaseScraper {
  protected abstract source: string;
  protected abstract baseUrl: string;

  protected async saveCaseStudy(caseStudy: CaseStudy) {
    try {
      // Transform data structure to match database schema
      const dbCaseStudy = {
        ...caseStudy,
        images: {
          main: caseStudy.images.main,
          gallery: [
            ...caseStudy.images.floorPlans,
            ...caseStudy.images.renders,
            ...caseStudy.images.sections,
            ...caseStudy.images.details
          ]
        },
        metadata: {
          tags: [
            caseStudy.typology,
            caseStudy.location,
            ...(caseStudy.metadata.materials || []),
            ...(caseStudy.metadata.sustainability || [])
          ].filter((tag): tag is string => typeof tag === 'string'),
          awards: caseStudy.metadata.awards || []
        }
      };

      const existing = await db.query.caseStudies.findFirst({
        where: eq(caseStudies.sourceUrl, caseStudy.sourceUrl),
      });

      if (existing) {
        await db
          .update(caseStudies)
          .set({
            ...dbCaseStudy,
            updatedAt: new Date(),
          })
          .where(eq(caseStudies.sourceUrl, caseStudy.sourceUrl));
      } else {
        await db.insert(caseStudies).values(dbCaseStudy);
      }
    } catch (error) {
      console.error(`Error saving case study ${caseStudy.sourceUrl}:`, error);
      throw error;
    }
  }

  protected async downloadImage(url: string): Promise<string> {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      // Here you would implement your image storage logic
      // For example, uploading to S3 or your preferred storage
      // For now, we'll just return the URL
      return url;
    } catch (error) {
      console.error(`Error downloading image ${url}:`, error);
      throw error;
    }
  }

  abstract scrapeProjectPage(url: string): Promise<CaseStudy>;
  abstract scrapeProjectList(page: number): Promise<string[]>;
} 