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
  citizenship: string | null;
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

  // TODO: Enable when embedding field is added to schema
  // 1. Get job details
  const job = await prisma.jobPosting.findUnique({
    where: { id: jobId },
    select: {
      id: true,
      country: true,
      subject: true,
      minYearsExperience: true,
      salaryUSD: true
    }
  });

  if (!job) {
    throw new Error('Job not found');
  }

  /* TODO: Enable vector search when embedding field is added
  if (!job.embedding) {
    throw new Error('Job embedding not generated.');
  }

  const matches = await prisma.$queryRaw<TeacherMatch[]>`
    SELECT ...
    t.embedding <=> ${job.embedding}::vector AS distance
    FROM "TeacherProfile" t
    WHERE t.embedding IS NOT NULL
    ORDER BY similarity DESC
    LIMIT ${limit}
  `;
  */

  // 2. Basic filtering until vector search is available
  const teachers = await prisma.teacherProfile.findMany({
    where: {
      status: 'ACTIVE',
      profileCompleteness: { gte: 70 },
      OR: [
        { subjects: { has: job.subject } },
        { preferredCountries: { has: job.country } },
      ],
      ...(job.minYearsExperience && {
        yearsExperience: { gte: job.minYearsExperience }
      }),
      ...(job.salaryUSD && {
        OR: [
          { minSalaryUSD: null },
          { minSalaryUSD: { lte: job.salaryUSD } }
        ]
      })
    },
    include: {
      user: {
        select: { email: true }
      }
    },
    take: limit,
    orderBy: { profileCompleteness: 'desc' }
  });

  const matches: TeacherMatch[] = teachers.map((t) => ({
    id: t.id,
    userId: t.userId,
    firstName: t.firstName,
    lastName: t.lastName,
    email: t.user.email,
    subjects: t.subjects,
    yearsExperience: t.yearsExperience,
    citizenship: t.citizenship,
    preferredCountries: t.preferredCountries,
    minSalaryUSD: t.minSalaryUSD || undefined,
    videoAnalysis: t.videoAnalysis as VideoAnalysis | null,
    visaStatus: t.visaStatus as VisaStatusCache | null,
    similarity: 0.85, // Placeholder
    distance: 0.15, // Placeholder
  }));

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
  // TODO: Enable when embedding field is added to schema
  const teacher = await prisma.teacherProfile.findUnique({
    where: { id: teacherId },
    select: {
      subjects: true,
      preferredCountries: true,
      minSalaryUSD: true,
    }
  });

  if (!teacher) {
    throw new Error('Teacher not found');
  }

  /* TODO: Enable vector search when embedding field is added
  if (!teacher.embedding) {
    throw new Error('Teacher embedding not generated');
  }

  const matches = await prisma.$queryRaw<JobMatch[]>`
    SELECT ...
    j.embedding <=> ${teacher.embedding}::vector AS distance
    FROM "JobPosting" j
    WHERE j.embedding IS NOT NULL
    ORDER BY similarity DESC
    LIMIT ${limit}
  `;
  */

  // Basic filtering until vector search is available
  const jobs = await prisma.jobPosting.findMany({
    where: {
      status: 'ACTIVE',
      OR: [
        { subject: { in: teacher.subjects } },
        { country: { in: teacher.preferredCountries } },
      ],
      ...(teacher.minSalaryUSD && {
        salaryUSD: { gte: teacher.minSalaryUSD }
      })
    },
    select: {
      id: true,
      title: true,
      schoolName: true,
      city: true,
      country: true,
      salaryUSD: true,
    },
    take: limit,
    orderBy: { createdAt: 'desc' }
  });

  return jobs.map(job => ({
    ...job,
    similarity: 0.80, // Placeholder
    distance: 0.20, // Placeholder
  }));
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
  // TODO: Enable vector search when embedding field is added to schema

  /* TODO: Get job embedding when field is available
  let embedding: Prisma.JsonValue | null = null;
  if (jobId) {
    const job = await prisma.jobPosting.findUnique({
      where: { id: jobId },
      select: { embedding: true }
    });
    embedding = job?.embedding || null;
  }
  */

  // Build WHERE conditions for basic filtering
  const where: any = {
    status: 'ACTIVE',
    profileCompleteness: { gte: 60 }
  };

  const orConditions: any[] = [];

  if (subjects && subjects.length > 0) {
    orConditions.push({ subjects: { hasSome: subjects } });
  }

  if (countries && countries.length > 0) {
    orConditions.push({ preferredCountries: { hasSome: countries } });
  }

  if (orConditions.length > 0) {
    where.OR = orConditions;
  }

  if (minExperience) {
    where.yearsExperience = { gte: minExperience };
  }

  if (maxSalary) {
    where.OR = [
      { minSalaryUSD: null },
      { minSalaryUSD: { lte: maxSalary } }
    ];
  }

  const teachers = await prisma.teacherProfile.findMany({
    where,
    include: {
      user: {
        select: { email: true }
      }
    },
    take: limit,
    orderBy: [
      { profileCompleteness: 'desc' },
      { yearsExperience: 'desc' }
    ]
  });

  return teachers.map((t) => ({
    id: t.id,
    userId: t.userId,
    firstName: t.firstName,
    lastName: t.lastName,
    email: t.user.email,
    subjects: t.subjects,
    yearsExperience: t.yearsExperience,
    citizenship: t.citizenship,
    preferredCountries: t.preferredCountries,
    minSalaryUSD: t.minSalaryUSD || undefined,
    videoAnalysis: t.videoAnalysis as VideoAnalysis | null,
    visaStatus: t.visaStatus as VisaStatusCache | null,
    similarity: 0.75, // Placeholder
    distance: 0.25, // Placeholder
  })) as TeacherMatch[];
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
  // TODO: Enable when embedding field is added to schema
  const teacher = await prisma.teacherProfile.findUnique({
    where: { id: teacherId },
    select: {
      subjects: true,
      preferredCountries: true,
    }
  });

  if (!teacher) {
    return [];
  }

  /* TODO: Enable vector search when embedding field is added
  if (!teacher.embedding) {
    return [];
  }

  const similar = await prisma.$queryRaw<SimilarTeacher[]>`
    SELECT ...
    1 - (t.embedding <=> ${teacher.embedding}::vector) AS similarity
    FROM "TeacherProfile" t
    WHERE t.embedding IS NOT NULL
    ORDER BY similarity DESC
    LIMIT ${limit}
  `;
  */

  // Basic filtering until vector search is available
  const similar = await prisma.teacherProfile.findMany({
    where: {
      status: 'ACTIVE',
      id: { not: teacherId },
      OR: [
        { subjects: { hasSome: teacher.subjects } },
        { preferredCountries: { hasSome: teacher.preferredCountries } },
      ]
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      subjects: true,
    },
    take: limit,
    orderBy: { profileCompleteness: 'desc' }
  });

  return similar.map(t => ({
    ...t,
    similarity: 0.75, // Placeholder
  }));
}

/**
 * Refresh/rebuild vector index (maintenance operation)
 * Run periodically to optimize search performance
 */
export async function rebuildVectorIndex() {
  // TODO: Enable when embedding field and indexes are added
  console.log('Vector indexes not yet implemented - embedding field not in schema');

  /* TODO: Uncomment when embedding indexes are created
  await prisma.$executeRaw`
    REINDEX INDEX CONCURRENTLY idx_teacher_embedding;
  `;

  await prisma.$executeRaw`
    REINDEX INDEX CONCURRENTLY idx_job_embedding;
  `;

  console.log('Vector indexes rebuilt successfully');
  */
}
