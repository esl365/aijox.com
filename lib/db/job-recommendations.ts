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
  // TODO: Enable when embedding field is added to schema
  // For now, return basic filtered recommendations

  // 1. Get teacher profile
  const teacher = await prisma.teacherProfile.findUnique({
    where: { id: teacherId },
    select: {
      id: true,
      subjects: true,
      yearsExperience: true,
      preferredCountries: true,
      minSalaryUSD: true,
    },
  });

  if (!teacher) {
    throw new Error('Teacher not found');
  }

  /* TODO: Enable when embedding field is added
  if (!teacher.embedding) {
    throw new Error(
      'Teacher profile embedding not generated. Please update your profile.'
    );
  }
  */

  // 2. Get already applied job IDs to exclude
  const applications = await prisma.application.findMany({
    where: { teacherId },
    select: { jobId: true },
  });
  const appliedJobIds = applications.map((app) => app.jobId);

  /* TODO: Enable vector similarity search when embedding field is added
  // 3. Perform vector similarity search using pgvector
  const matches = await prisma.$queryRaw`
    SELECT ...
    (j.embedding <=> ${teacher.embedding}::vector) as distance
    FROM "JobPosting" j
    WHERE j.status = 'ACTIVE'
      AND j.embedding IS NOT NULL
      AND (j.embedding <=> ${teacher.embedding}::vector) < ${1 - minSimilarity}
    ORDER BY distance ASC
    LIMIT ${limit}
  `;
  */

  // 3. Basic filtering until vector search is available
  const matches = await prisma.jobPosting.findMany({
    where: {
      status: 'ACTIVE',
      ...(appliedJobIds.length > 0 && {
        id: { notIn: appliedJobIds },
      }),
      OR: [
        { country: { in: teacher.preferredCountries } },
        { subject: { in: teacher.subjects } },
      ],
    },
    take: limit,
    orderBy: { createdAt: 'desc' },
  });

  // 4. Calculate match scores (basic until vector search is available)
  const recommendations: JobRecommendation[] = matches.map((match) => {
    // Base score without vector similarity
    let matchScore = 70; // Base score for matching jobs
    const distance = 0.3; // Placeholder distance
    const similarity = 0.7; // Placeholder similarity

    // Bonus: Preferred country
    if (teacher.preferredCountries.includes(match.country)) {
      matchScore = Math.min(100, matchScore + 10);
    }

    // Bonus: Subject match
    if (teacher.subjects.includes(match.subject)) {
      matchScore = Math.min(100, matchScore + 10);
    }

    // Bonus: Salary meets minimum
    if (teacher.minSalaryUSD && match.salaryUSD >= teacher.minSalaryUSD) {
      matchScore = Math.min(100, matchScore + 10);
    }

    return {
      id: match.id,
      title: match.title,
      schoolName: match.schoolName,
      country: match.country,
      city: match.city,
      subject: match.subject,
      salaryUSD: match.salaryUSD,
      housingProvided: match.housingProvided,
      flightProvided: match.flightProvided,
      description: match.description,
      status: match.status,
      createdAt: match.createdAt,
      similarity,
      distance,
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
  // TODO: Enable when embedding field is added to schema
  const job = await prisma.jobPosting.findUnique({
    where: { id: jobId },
    select: {
      id: true,
      subject: true,
      country: true,
    },
  });

  if (!job) {
    return [];
  }

  /* TODO: Enable vector similarity search when embedding field is added
  if (!job.embedding) {
    return [];
  }

  const matches = await prisma.$queryRaw`
    SELECT ...
    (j.embedding <=> ${job.embedding}::vector) as distance
    FROM "JobPosting" j
    WHERE j.status = 'ACTIVE'
      AND j.id != ${jobId}
      AND j.embedding IS NOT NULL
    ORDER BY distance ASC
    LIMIT ${limit}
  `;
  */

  // Basic filtering until vector search is available
  const matches = await prisma.jobPosting.findMany({
    where: {
      status: 'ACTIVE',
      id: { not: jobId },
      OR: [
        { subject: job.subject },
        { country: job.country },
      ],
    },
    take: limit,
    orderBy: { createdAt: 'desc' },
  });

  return matches.map((match) => ({
    id: match.id,
    title: match.title,
    schoolName: match.schoolName,
    country: match.country,
    city: match.city,
    subject: match.subject,
    salaryUSD: match.salaryUSD,
    housingProvided: match.housingProvided,
    flightProvided: match.flightProvided,
    description: match.description,
    status: match.status,
    createdAt: match.createdAt,
    similarity: 0.7, // Placeholder
    distance: 0.3, // Placeholder
    matchScore: 70, // Basic match score
  }));
}
