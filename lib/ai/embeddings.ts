/**
 * AI Agent 2: Autonomous Headhunter - Embedding Generation
 *
 * Generates vector embeddings for semantic search using OpenAI's embedding API
 */

import { embed } from 'ai';
import { openai } from '@ai-sdk/openai';

/**
 * Generate embedding for a job posting
 * Creates rich semantic representation for similarity search
 */
export async function generateJobEmbedding(job: {
  title: string;
  subject: string;
  city: string;
  country: string;
  schoolType?: string;
  requirements?: string;
  benefits?: string;
  cultureFit?: string;
  description?: string;
}): Promise<number[]> {
  // Create comprehensive text representation
  const textToEmbed = `
Position: ${job.title}
Subject Area: ${job.subject}
Location: ${job.city}, ${job.country}
School Type: ${job.schoolType || 'Not specified'}
Requirements: ${job.requirements || 'Not specified'}
Benefits: ${job.benefits || 'Not specified'}
Culture: ${job.cultureFit || 'Not specified'}
Description: ${job.description || 'Not specified'}
  `.trim();

  try {
    const { embedding } = await embed({
      model: openai.embedding('text-embedding-3-small'),
      value: textToEmbed,
    });

    return embedding; // Returns number[] of length 1536
  } catch (error: any) {
    console.error('Job embedding generation failed:', error);
    throw new Error(`Failed to generate job embedding: ${error.message}`);
  }
}

/**
 * Generate embedding for a teacher profile
 * Captures teaching experience, skills, and preferences
 */
export async function generateTeacherEmbedding(teacher: {
  subjects: string[];
  yearsExperience: number;
  certifications: string[];
  preferredCountries: string[];
  teachingStrengths?: string;
  bio?: string;
  specializations?: string[];
  degreeLevel?: string;
  degreeMajor?: string;
}): Promise<number[]> {
  const textToEmbed = `
Teaching Experience: ${teacher.yearsExperience} years teaching ${teacher.subjects.join(', ')}
Certifications: ${teacher.certifications.join(', ')}
Education: ${teacher.degreeLevel || 'Not specified'} in ${teacher.degreeMajor || 'Education'}
Preferred Locations: Interested in teaching in ${teacher.preferredCountries.join(', ')}
Specializations: ${teacher.specializations?.join(', ') || 'General education'}
Teaching Strengths: ${teacher.teachingStrengths || 'Passionate educator'}
Professional Bio: ${teacher.bio || 'Dedicated teacher'}
  `.trim();

  try {
    const { embedding } = await embed({
      model: openai.embedding('text-embedding-3-small'),
      value: textToEmbed,
    });

    return embedding;
  } catch (error: any) {
    console.error('Teacher embedding generation failed:', error);
    throw new Error(`Failed to generate teacher embedding: ${error.message}`);
  }
}

/**
 * Batch embedding generation for multiple jobs
 * More efficient than individual calls
 */
export async function generateJobEmbeddingsBatch(
  jobs: Array<{ id: string; data: Parameters<typeof generateJobEmbedding>[0] }>
): Promise<Array<{ id: string; embedding: number[] }>> {
  const results: Array<{ id: string; embedding: number[] }> = [];

  // Process in parallel batches of 10
  const BATCH_SIZE = 10;

  for (let i = 0; i < jobs.length; i += BATCH_SIZE) {
    const batch = jobs.slice(i, i + BATCH_SIZE);

    const batchResults = await Promise.allSettled(
      batch.map(async (job) => ({
        id: job.id,
        embedding: await generateJobEmbedding(job.data)
      }))
    );

    for (const result of batchResults) {
      if (result.status === 'fulfilled') {
        results.push(result.value);
      } else {
        console.error('Batch embedding failed:', result.reason);
      }
    }

    // Rate limiting delay
    if (i + BATCH_SIZE < jobs.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  return results;
}

/**
 * Batch embedding generation for multiple teachers
 */
export async function generateTeacherEmbeddingsBatch(
  teachers: Array<{ id: string; data: Parameters<typeof generateTeacherEmbedding>[0] }>
): Promise<Array<{ id: string; embedding: number[] }>> {
  const results: Array<{ id: string; embedding: number[] }> = [];

  const BATCH_SIZE = 10;

  for (let i = 0; i < teachers.length; i += BATCH_SIZE) {
    const batch = teachers.slice(i, i + BATCH_SIZE);

    const batchResults = await Promise.allSettled(
      batch.map(async (teacher) => ({
        id: teacher.id,
        embedding: await generateTeacherEmbedding(teacher.data)
      }))
    );

    for (const result of batchResults) {
      if (result.status === 'fulfilled') {
        results.push(result.value);
      } else {
        console.error('Batch embedding failed:', result.reason);
      }
    }

    if (i + BATCH_SIZE < teachers.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  return results;
}

/**
 * Calculate cosine similarity between two embeddings
 * (Usually handled by pgvector, but useful for testing)
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must have same length');
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);

  if (normA === 0 || normB === 0) {
    return 0;
  }

  return dotProduct / (normA * normB);
}
