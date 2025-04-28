import { db } from '../db';
import { caseStudies } from '../db/schema';
import { eq, and, or, ilike, gt, lt } from 'drizzle-orm';
import { sql } from 'drizzle-orm';
import OpenAI from 'openai';

const openai = new OpenAI();

interface ProjectContext {
  siteConstraints?: string[];
  programmaticRequirements?: string[];
  designChallenges?: string[];
  spatialOrganization?: string[];
  typology?: string;
  area?: number;
  location?: string;
  description?: string;
}

export class CaseStudyRecommender {
  async findRelevantCaseStudies(context: ProjectContext, limit: number = 3) {
    try {
      // First, get a semantic embedding of the project context
      const embedding = await this.getProjectEmbedding(context);

      // Find case studies with similar characteristics
      const results = await db.query.caseStudies.findMany({
        where: this.buildContextualQuery(context),
        limit,
      });

      // Score and sort results based on relevance
      const scoredResults = await this.scoreResults(results, context, embedding);
      
      return scoredResults;
    } catch (error) {
      console.error('Error finding relevant case studies:', error);
      throw error;
    }
  }

  private async getProjectEmbedding(context: ProjectContext): Promise<number[]> {
    const prompt = this.buildContextPrompt(context);
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: prompt,
    });
    return response.data[0].embedding;
  }

  private buildContextPrompt(context: ProjectContext): string {
    return `
      Project Context:
      Typology: ${context.typology || 'Not specified'}
      Area: ${context.area || 'Not specified'} m²
      Location: ${context.location || 'Not specified'}
      Description: ${context.description || 'Not specified'}
      
      Site Constraints: ${context.siteConstraints?.join(', ') || 'None specified'}
      Programmatic Requirements: ${context.programmaticRequirements?.join(', ') || 'None specified'}
      Design Challenges: ${context.designChallenges?.join(', ') || 'None specified'}
      Spatial Organization: ${context.spatialOrganization?.join(', ') || 'None specified'}
    `;
  }

  private buildContextualQuery(context: ProjectContext) {
    const conditions = [];

    if (context.typology) {
      conditions.push(ilike(caseStudies.typology, `%${context.typology}%`));
    }

    if (context.area) {
      // Find projects within 20% of the target area
      const minArea = context.area * 0.8;
      const maxArea = context.area * 1.2;
      conditions.push(
        and(
          gt(sql`${caseStudies.characteristics}->>'area'`, minArea),
          lt(sql`${caseStudies.characteristics}->>'area'`, maxArea)
        )
      );
    }

    if (context.location) {
      conditions.push(ilike(caseStudies.location, `%${context.location}%`));
    }

    // Add characteristic-based conditions
    if (context.siteConstraints?.length) {
      conditions.push(
        or(
          ...context.siteConstraints.map(constraint =>
            sql`${caseStudies.characteristics}->>'siteConstraints' LIKE ${`%${constraint}%`}`
          )
        )
      );
    }

    if (context.programmaticRequirements?.length) {
      conditions.push(
        or(
          ...context.programmaticRequirements.map(req =>
            sql`${caseStudies.characteristics}->>'programmaticRequirements' LIKE ${`%${req}%`}`
          )
        )
      );
    }

    return conditions.length > 0 ? and(...conditions) : undefined;
  }

  private async scoreResults(
    results: any[],
    context: ProjectContext,
    embedding: number[]
  ) {
    // Score each result based on:
    // 1. Characteristic similarity
    // 2. Embedding similarity
    // 3. Recency
    return results.map(result => ({
      ...result,
      relevanceScore: this.calculateRelevanceScore(result, context, embedding),
    })).sort((a, b) => b.relevanceScore - a.relevanceScore);
  }

  private calculateRelevanceScore(
    result: any,
    context: ProjectContext,
    embedding: number[]
  ): number {
    let score = 0;

    // Characteristic similarity (40%)
    if (result.characteristics) {
      const characteristicScore = this.calculateCharacteristicSimilarity(
        result.characteristics,
        context
      );
      score += characteristicScore * 0.4;
    }

    // Embedding similarity (40%)
    if (result.embedding) {
      const embeddingScore = this.calculateEmbeddingSimilarity(
        result.embedding,
        embedding
      );
      score += embeddingScore * 0.4;
    }

    // Recency (20%)
    const recencyScore = this.calculateRecencyScore(result.createdAt);
    score += recencyScore * 0.2;

    return score;
  }

  private calculateCharacteristicSimilarity(
    characteristics: any,
    context: ProjectContext
  ): number {
    let score = 0;
    let total = 0;

    if (context.siteConstraints?.length) {
      const siteScore = this.calculateArraySimilarity(
        characteristics.siteConstraints || [],
        context.siteConstraints
      );
      score += siteScore;
      total++;
    }

    if (context.programmaticRequirements?.length) {
      const programScore = this.calculateArraySimilarity(
        characteristics.programmaticRequirements || [],
        context.programmaticRequirements
      );
      score += programScore;
      total++;
    }

    if (context.designChallenges?.length) {
      const challengeScore = this.calculateArraySimilarity(
        characteristics.designChallenges || [],
        context.designChallenges
      );
      score += challengeScore;
      total++;
    }

    return total > 0 ? score / total : 0;
  }

  private calculateArraySimilarity(arr1: string[], arr2: string[]): number {
    if (!arr1.length || !arr2.length) return 0;
    const common = arr1.filter(item => arr2.includes(item));
    return common.length / Math.max(arr1.length, arr2.length);
  }

  private calculateEmbeddingSimilarity(embedding1: number[], embedding2: number[]): number {
    if (!embedding1 || !embedding2) return 0;
    const dotProduct = embedding1.reduce((sum, val, i) => sum + val * embedding2[i], 0);
    const norm1 = Math.sqrt(embedding1.reduce((sum, val) => sum + val * val, 0));
    const norm2 = Math.sqrt(embedding2.reduce((sum, val) => sum + val * val, 0));
    return dotProduct / (norm1 * norm2);
  }

  private calculateRecencyScore(createdAt: Date): number {
    const ageInDays = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
    return Math.max(0, 1 - ageInDays / 365); // Score decreases over a year
  }
} 