/**
 * Job Recommendations for Teachers
 *
 * Finds personalized job recommendations using vector similarity
 */

import { prisma } from '@/lib/db';

export type JobRecommendation = {
  id: string;
  title: string;
  schoolName: string;
  country: string;
  city: string;
  subject: string;
  salaryUSD: number;
  housingProvided: boolean;
  flightProvided: boolean;
  description: string;
  status: string;
  createdAt: Date;
  similarity: number;
  distance: number;
  matchScore: number; // 0-100
};

/**
 * Find jobs matching a teacher's profile using vector similarity
 *
 * @param teacherId - Teacher profile ID
 * @param minSimilarity - Minimum cosine similarity (0-1)
 * @param limit - Maximum number of results
 * @returns Array of matching jobs sorted by similarity
 */
export async function findRecommendedJobs(
  teacherId: string,
  minSimilarity: number = 0.8,
  limit: number = 10
): Promise<JobRecommendation[]> {
  // 1. Get teacher with embedding
  const teacher = await prisma.teacherProfile.findUnique({
    where: { id: teacherId },
    select: {
      id: true,
      // @ts-ignore - embedding is Unsupported type
      embedding: true,
      subjects: true,
      yearsExperience: true,
      preferredCountries: true,
      minSalaryUSD: true,
    },
  });

  if (!teacher) {
    throw new Error('Teacher not found');
  }

  if (!teacher.embedding) {
    throw new Error(
      'Teacher profile embedding not generated. Please update your profile.'
    );
  }

  // 2. Get already applied job IDs to exclude
  const applications = await prisma.application.findMany({
    where: { teacherId },
    select: { jobId: true },
  });
  const appliedJobIds = applications.map((app) => app.jobId);

  // 3. Perform vector similarity search using pgvector
  // Note: pgvector uses <=> for cosine distance
  // Similarity = 1 - distance
  const matches = await prisma.$queryRaw<
    Array<{
      id: string;
      title: string;
      schoolName: string;
      country: string;
      city: string;
      subject: string;
      salaryUSD: number;
      housingProvided: boolean;
      flightProvided: boolean;
      description: string;
      status: string;
      createdAt: Date;
      distance: number;
    }>
  >`
    SELECT
      j.id,
      j.title,
      j."schoolName",
      j.country,
      j.city,
      j.subject,
      j."salaryUSD",
      j."housingProvided",
      j."flightProvided",
      j.description,
      j.status,
      j."createdAt",
      (j.embedding <=> ${teacher.embedding}::vector) as distance
    FROM "JobPosting" j
    WHERE j.status = 'ACTIVE'
      AND j.embedding IS NOT NULL
      AND (j.embedding <=> ${teacher.embedding}::vector) < ${1 - minSimilarity}
      ${
        appliedJobIds.length > 0
          ? `AND j.id NOT IN (${appliedJobIds.map((id) => `'${id}'`).join(', ')})`
          : ''
      }
    ORDER BY distance ASC
    LIMIT ${limit}
  `;

  // 4. Calculate similarity and match scores
  const recommendations: JobRecommendation[] = matches.map((match) => {
    const similarity = 1 - Number(match.distance);

    // Calculate match score (0-100) with various factors
    let matchScore = similarity * 100;

    // Bonus: Preferred country
    if (teacher.preferredCountries.includes(match.country)) {
      matchScore = Math.min(100, matchScore + 5);
    }

    // Bonus: Subject match
    if (teacher.subjects.includes(match.subject)) {
      matchScore = Math.min(100, matchScore + 3);
    }

    // Bonus: Salary meets minimum
    if (teacher.minSalaryUSD && match.salaryUSD >= teacher.minSalaryUSD) {
      matchScore = Math.min(100, matchScore + 2);
    }

    return {
      ...match,
      similarity,
      matchScore: Math.round(matchScore),
    };
  });

  return recommendations;
}

/**
 * Find similar jobs to a given job
 * Useful for "Similar Jobs" recommendations
 */
export async function findSimilarJobs(
  jobId: string,
  limit: number = 5
): Promise<JobRecommendation[]> {
  const job = await prisma.jobPosting.findUnique({
    where: { id: jobId },
    select: {
      id: true,
      // @ts-ignore
      embedding: true,
    },
  });

  if (!job || !job.embedding) {
    return [];
  }

  const matches = await prisma.$queryRaw<
    Array<{
      id: string;
      title: string;
      schoolName: string;
      country: string;
      city: string;
      subject: string;
      salaryUSD: number;
      housingProvided: boolean;
      flightProvided: boolean;
      description: string;
      status: string;
      createdAt: Date;
      distance: number;
    }>
  >`
    SELECT
      j.id,
      j.title,
      j."schoolName",
      j.country,
      j.city,
      j.subject,
      j."salaryUSD",
      j."housingProvided",
      j."flightProvided",
      j.description,
      j.status,
      j."createdAt",
      (j.embedding <=> ${job.embedding}::vector) as distance
    FROM "JobPosting" j
    WHERE j.status = 'ACTIVE'
      AND j.id != ${jobId}
      AND j.embedding IS NOT NULL
    ORDER BY distance ASC
    LIMIT ${limit}
  `;

  return matches.map((match) => ({
    ...match,
    similarity: 1 - Number(match.distance),
    matchScore: Math.round((1 - Number(match.distance)) * 100),
  }));
}
