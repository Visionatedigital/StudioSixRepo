import { pgTable, text, timestamp, integer, jsonb, boolean } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  name: text('name'),
  email: text('email').notNull().unique(),
  emailVerified: timestamp('email_verified'),
  hashedPassword: text('hashed_password'),
  image: text('image'),
  bannerImage: text('banner_image'),
  verified: boolean('verified').default(false),
  subscriptionStatus: text('subscription_status').default('free'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const caseStudies = pgTable('case_studies', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  architect: text('architect'),
  year: integer('year'),
  location: text('location'),
  typology: text('typology'),
  source: text('source').notNull(), // 'archdaily' or 'dezeen'
  sourceUrl: text('source_url').notNull(),
  images: jsonb('images').$type<{
    main: string;
    gallery: string[];
  }>(),
  characteristics: jsonb('characteristics').$type<{
    keyFeatures: string[];
    siteConstraints: string[];
    programmaticRequirements: string[];
    designChallenges: string[];
    spatialOrganization: string;
    area: number;
    location: string;
  }>(),
  metadata: jsonb('metadata').$type<{
    tags: string[];
    awards: string[];
  }>(),
  embedding: jsonb('embedding').$type<number[]>(), // Vector embedding for semantic search
  relevanceScore: integer('relevance_score').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}); 