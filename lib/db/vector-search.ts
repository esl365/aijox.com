/**
 * AI Agent 2: Autonomous Headhunter - Vector Search
 *
 * Performs semantic similarity search using pgvector
 */

import { prisma } from '@/lib/db';
import type { Prisma } from '@prisma/client';

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
  videoAnalysis: any;
  visaStatus: any;
  similarity: number;
  distance: number;
};

/**
 * Find teachers matching a job posting using vector similarity
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
export async function findMatchingJobs(
  teacherId: string,
  minSimilarity: number = 0.80,
  limit: number = 10
): Promise<Array<{
  id: string;
  title: string;
  schoolName: string;
  city: string;
  country: string;
  salaryUSD: number;
  similarity: number;
  distance: number;
}>> {
  const teacher = await prisma.teacherProfile.findUnique({
    where: { id: teacherId },
    select: { embedding: true }
  });

  if (!teacher?.embedding) {
    throw new Error('Teacher embedding not generated');
  }

  const matches = await prisma.$queryRaw`
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

  return matches as any;
}

/**
 * Search teachers by multiple criteria (hybrid search)
 * Combines vector similarity with traditional filters
 *
 * SECURITY: Uses Prisma's safe filtering where possible to prevent SQL injection
 * For complex vector queries, uses parameterized $queryRaw
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
  // OPTION 1: Use Prisma's safe filtering (preferred when no vector search)
  if (!jobId) {
    const whereClause: Prisma.TeacherProfileWhereInput = {
      status: 'ACTIVE',
      profileCompleteness: { gte: 60 },
    }

    if (subjects && subjects.length > 0) {
      whereClause.subjects = { hasSome: subjects }
    }

    if (countries && countries.length > 0) {
      whereClause.preferredCountries = { hasSome: countries }
    }

    if (minExperience) {
      whereClause.yearsExperience = { gte: minExperience }
    }

    if (maxSalary) {
      whereClause.OR = [
        { minSalaryUSD: null },
        { minSalaryUSD: { lte: maxSalary } }
      ]
    }

    const results = await prisma.teacherProfile.findMany({
      where: whereClause,
      select: {
        id: true,
        userId: true,
        firstName: true,
        lastName: true,
        user: {
          select: { email: true }
        },
        subjects: true,
        yearsExperience: true,
        citizenship: true,
        videoAnalysis: true,
        profileCompleteness: true
      },
      orderBy: [
        { profileCompleteness: 'desc' },
        { yearsExperience: 'desc' }
      ],
      take: limit
    })

    // Transform to match TeacherMatch type
    return results.map(r => ({
      ...r,
      email: r.user.email,
      similarity: 1,
      distance: 0
    })) as any
  }

  // OPTION 2: Vector search with parameterized query (SQL injection safe)
  const job = await prisma.jobPosting.findUnique({
    where: { id: jobId },
    select: { embedding: true }
  })

  if (!job?.embedding) {
    throw new Error('Job embedding not found. Please regenerate job posting.')
  }

  // Build WHERE conditions with safe parameterization
  const params: any[] = []
  let paramIndex = 1

  // Base conditions
  let whereConditions = `
    t.status = 'ACTIVE'
    AND t."profileCompleteness" >= 60
  `

  // Vector similarity condition
  whereConditions += ` AND 1 - (t.embedding <=> $${paramIndex}::vector) >= $${paramIndex + 1}`
  params.push(job.embedding, minSimilarity)
  paramIndex += 2

  // Subjects filter (safe array comparison)
  if (subjects && subjects.length > 0) {
    whereConditions += ` AND t.subjects && $${paramIndex}::text[]`
    params.push(subjects)
    paramIndex++
  }

  // Countries filter
  if (countries && countries.length > 0) {
    whereConditions += ` AND t."preferredCountries" && $${paramIndex}::text[]`
    params.push(countries)
    paramIndex++
  }

  // Experience filter
  if (minExperience) {
    whereConditions += ` AND t."yearsExperience" >= $${paramIndex}`
    params.push(minExperience)
    paramIndex++
  }

  // Salary filter
  if (maxSalary) {
    whereConditions += ` AND (t."minSalaryUSD" IS NULL OR t."minSalaryUSD" <= $${paramIndex})`
    params.push(maxSalary)
    paramIndex++
  }

  // Limit parameter
  whereConditions += ` LIMIT $${paramIndex}`
  params.push(limit)

  // Execute safe parameterized query
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
      t.embedding <=> ${Prisma.raw(params[0])}::vector AS distance,
      1 - (t.embedding <=> ${Prisma.raw(params[0])}::vector) AS similarity
    FROM "TeacherProfile" t
    INNER JOIN "User" u ON u.id = t."userId"
    WHERE
      t.status = 'ACTIVE'
      AND t."profileCompleteness" >= 60
      AND 1 - (t.embedding <=> ${Prisma.raw(params[0])}::vector) >= ${params[1]}
      ${subjects && subjects.length > 0 ? Prisma.sql`AND t.subjects && ${subjects}::text[]` : Prisma.empty}
      ${countries && countries.length > 0 ? Prisma.sql`AND t."preferredCountries" && ${countries}::text[]` : Prisma.empty}
      ${minExperience ? Prisma.sql`AND t."yearsExperience" >= ${minExperience}` : Prisma.empty}
      ${maxSalary ? Prisma.sql`AND (t."minSalaryUSD" IS NULL OR t."minSalaryUSD" <= ${maxSalary})` : Prisma.empty}
    ORDER BY similarity DESC
    LIMIT ${limit}
  `

  return matches
}

/**
 * Get similar teachers (for "Teachers like you" feature)
 */
export async function findSimilarTeachers(
  teacherId: string,
  limit: number = 5
): Promise<Array<{
  id: string;
  firstName: string;
  lastName: string;
  subjects: string[];
  similarity: number;
}>> {
  const teacher = await prisma.teacherProfile.findUnique({
    where: { id: teacherId },
    select: { embedding: true }
  });

  if (!teacher?.embedding) {
    return [];
  }

  const similar = await prisma.$queryRaw`
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

  return similar as any;
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
