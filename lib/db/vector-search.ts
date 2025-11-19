/**
 * AI Agent 2: Autonomous Headhunter - Vector Search
 *
 * Performs semantic similarity search using pgvector
 */

import { prisma } from '@/lib/db';
import type { Prisma } from '@prisma/client';
import type { VideoAnalysis } from '@/lib/ai/video-analyzer';
import type { VisaStatusCache } from '@/lib/matching/filter-candidates';
import { getCachedMatches, cacheMatches, recordCacheHit, recordCacheMiss } from '@/lib/cache/match-cache';

export type TeacherMatch = {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  subjects: string[];
  yearsExperience: number;
  citizenship: string;
  preferredCountries: string[];
  minSalaryUSD?: number;
  videoAnalysis: VideoAnalysis | null;
  visaStatus: VisaStatusCache | null;
  similarity: number;
  distance: number;
};

/**
 * Find teachers matching a job posting using vector similarity
 *
 * Refinement.md:160-174 - Added Redis caching for performance
 *
 * @param jobId - Job posting ID
 * @param minSimilarity - Minimum cosine similarity (0-1)
 * @param limit - Maximum number of results
 * @returns Array of matching teachers sorted by similarity
 */
export async function findMatchingTeachers(
  jobId: string,
  minSimilarity: number = 0.85,
  limit: number = 20
): Promise<TeacherMatch[]> {
  // 0. Check cache first (1 hour TTL)
  const cached = await getCachedMatches(jobId);
  if (cached) {
    recordCacheHit();
    return cached;
  }
  recordCacheMiss();

  // 1. Get job with embedding
  const job = await prisma.jobPosting.findUnique({
    where: { id: jobId },
    select: {
      id: true,
      embedding: true,
      country: true,
      subject: true,
      minYearsExperience: true,
      salaryUSD: true
    }
  });

  if (!job) {
    throw new Error('Job not found');
  }

  if (!job.embedding) {
    throw new Error('Job embedding not generated. Please regenerate job posting.');
  }

  // 2. Perform vector similarity search using pgvector
  // Note: pgvector uses <=> for cosine distance
  // Similarity = 1 - distance
  const matches = await prisma.$queryRaw<TeacherMatch[]>`
    SELECT
      t.id,
      t."userId",
      t."firstName",
      t."lastName",
      u.email,
      t.subjects,
      t."yearsExperience",
      t.citizenship,
      t."preferredCountries",
      t."minSalaryUSD",
      t."videoAnalysis",
      t."visaStatus",
      t.embedding <=> ${job.embedding}::vector AS distance,
      1 - (t.embedding <=> ${job.embedding}::vector) AS similarity
    FROM "TeacherProfile" t
    INNER JOIN "User" u ON u.id = t."userId"
    WHERE
      t.embedding IS NOT NULL
      AND t.status = 'ACTIVE'
      AND t."profileCompleteness" >= 70
      AND 1 - (t.embedding <=> ${job.embedding}::vector) >= ${minSimilarity}
    ORDER BY similarity DESC
    LIMIT ${limit}
  `;

  // 3. Cache results for future requests
  await cacheMatches(jobId, matches);

  return matches;
}

/**
 * Find jobs matching a teacher profile using vector similarity
 * (For showing recommended jobs to teachers)
 *
 * @param teacherId - Teacher profile ID
 * @param minSimilarity - Minimum cosine similarity
 * @param limit - Maximum results
 */
export type JobMatch = {
  id: string;
  title: string;
  schoolName: string;
  city: string;
  country: string;
  salaryUSD: number;
  similarity: number;
  distance: number;
};

export async function findMatchingJobs(
  teacherId: string,
  minSimilarity: number = 0.80,
  limit: number = 10
): Promise<JobMatch[]> {
  const teacher = await prisma.teacherProfile.findUnique({
    where: { id: teacherId },
    select: { embedding: true }
  });

  if (!teacher?.embedding) {
    throw new Error('Teacher embedding not generated');
  }

  const matches = await prisma.$queryRaw<JobMatch[]>`
    SELECT
      j.id,
      j.title,
      j."schoolName",
      j.city,
      j.country,
      j."salaryUSD",
      j.embedding <=> ${teacher.embedding}::vector AS distance,
      1 - (j.embedding <=> ${teacher.embedding}::vector) AS similarity
    FROM "JobPosting" j
    WHERE
      j.embedding IS NOT NULL
      AND j.status = 'ACTIVE'
      AND 1 - (j.embedding <=> ${teacher.embedding}::vector) >= ${minSimilarity}
    ORDER BY similarity DESC
    LIMIT ${limit}
  `;

  return matches;
}

/**
 * Search teachers by multiple criteria (hybrid search)
 * Combines vector similarity with traditional filters
 */
export async function hybridTeacherSearch({
  jobId,
  subjects,
  countries,
  minExperience,
  maxSalary,
  minSimilarity = 0.75,
  limit = 50
}: {
  jobId?: string;
  subjects?: string[];
  countries?: string[];
  minExperience?: number;
  maxSalary?: number;
  minSimilarity?: number;
  limit?: number;
}) {
  let embedding: Prisma.JsonValue | null = null;

  // Get job embedding if jobId provided
  if (jobId) {
    const job = await prisma.jobPosting.findUnique({
      where: { id: jobId },
      select: { embedding: true }
    });
    embedding = job?.embedding || null;
  }

  // Build dynamic WHERE conditions
  const conditions: string[] = [
    't.status = \'ACTIVE\'',
    't."profileCompleteness" >= 60'
  ];

  if (embedding) {
    conditions.push(`1 - (t.embedding <=> '${embedding}'::vector) >= ${minSimilarity}`);
  }

  if (subjects && subjects.length > 0) {
    const subjectsList = subjects.map(s => `'${s}'`).join(',');
    conditions.push(`t.subjects && ARRAY[${subjectsList}]::text[]`);
  }

  if (countries && countries.length > 0) {
    const countriesList = countries.map(c => `'${c}'`).join(',');
    conditions.push(`t."preferredCountries" && ARRAY[${countriesList}]::text[]`);
  }

  if (minExperience) {
    conditions.push(`t."yearsExperience" >= ${minExperience}`);
  }

  if (maxSalary) {
    conditions.push(`(t."minSalaryUSD" IS NULL OR t."minSalaryUSD" <= ${maxSalary})`);
  }

  const whereClause = conditions.join(' AND ');

  const query = embedding
    ? `
      SELECT
        t.id,
        t."userId",
        t."firstName",
        t."lastName",
        u.email,
        t.subjects,
        t."yearsExperience",
        t.citizenship,
        t."videoAnalysis",
        t.embedding <=> '${embedding}'::vector AS distance,
        1 - (t.embedding <=> '${embedding}'::vector) AS similarity
      FROM "TeacherProfile" t
      INNER JOIN "User" u ON u.id = t."userId"
      WHERE ${whereClause}
      ORDER BY similarity DESC
      LIMIT ${limit}
    `
    : `
      SELECT
        t.id,
        t."userId",
        t."firstName",
        t."lastName",
        u.email,
        t.subjects,
        t."yearsExperience",
        t.citizenship,
        t."videoAnalysis",
        0 AS distance,
        1 AS similarity
      FROM "TeacherProfile" t
      INNER JOIN "User" u ON u.id = t."userId"
      WHERE ${whereClause}
      ORDER BY t."profileCompleteness" DESC, t."yearsExperience" DESC
      LIMIT ${limit}
    `;

  const results = await prisma.$queryRawUnsafe(query);
  return results as TeacherMatch[];
}

export type SimilarTeacher = {
  id: string;
  firstName: string;
  lastName: string;
  subjects: string[];
  similarity: number;
};

/**
 * Get similar teachers (for "Teachers like you" feature)
 */
export async function findSimilarTeachers(
  teacherId: string,
  limit: number = 5
): Promise<SimilarTeacher[]> {
  const teacher = await prisma.teacherProfile.findUnique({
    where: { id: teacherId },
    select: { embedding: true }
  });

  if (!teacher?.embedding) {
    return [];
  }

  const similar = await prisma.$queryRaw<SimilarTeacher[]>`
    SELECT
      t.id,
      t."firstName",
      t."lastName",
      t.subjects,
      1 - (t.embedding <=> ${teacher.embedding}::vector) AS similarity
    FROM "TeacherProfile" t
    WHERE
      t.embedding IS NOT NULL
      AND t.id != ${teacherId}
      AND t.status = 'ACTIVE'
    ORDER BY similarity DESC
    LIMIT ${limit}
  `;

  return similar;
}

/**
 * Refresh/rebuild vector index (maintenance operation)
 * Run periodically to optimize search performance
 */
export async function rebuildVectorIndex() {
  // This would be run as a maintenance script
  // pgvector automatically maintains indexes, but can be optimized

  await prisma.$executeRaw`
    REINDEX INDEX CONCURRENTLY idx_teacher_embedding;
  `;

  await prisma.$executeRaw`
    REINDEX INDEX CONCURRENTLY idx_job_embedding;
  `;

  console.log('Vector indexes rebuilt successfully');
}
