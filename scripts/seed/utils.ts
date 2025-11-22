import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

export const prisma = new PrismaClient();

/**
 * Environment configuration for seed operations
 */
export const SEED_CONFIG = {
  isProduction: process.env.NODE_ENV === 'production',
  allowTestData: process.env.ALLOW_TEST_DATA === 'true',
  forceSeeding: process.env.FORCE_SEED === 'true',
  environment: process.env.NODE_ENV || 'development',
};

/**
 * Password hashing utility
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

/**
 * Default test passwords (only used in non-production)
 */
export const TEST_PASSWORDS = {
  admin: 'Admin123!@#',
  school: 'School123!@#',
  teacher: 'Teacher123!@#',
  recruiter: 'Recruiter123!@#',
} as const;

/**
 * Check if seeding is allowed based on environment
 */
export function canSeed(): { allowed: boolean; reason?: string } {
  if (SEED_CONFIG.forceSeeding) {
    return { allowed: true };
  }

  if (SEED_CONFIG.isProduction && !SEED_CONFIG.allowTestData) {
    return {
      allowed: false,
      reason: 'Seeding blocked in production. Set ALLOW_TEST_DATA=true to override.',
    };
  }

  return { allowed: true };
}

/**
 * Check if user with email already exists
 */
export async function userExists(email: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { email },
  });
  return !!user;
}

/**
 * Check if school profile with name already exists
 */
export async function schoolExists(schoolName: string): Promise<boolean> {
  const school = await prisma.schoolProfile.findFirst({
    where: { schoolName },
  });
  return !!school;
}

/**
 * Check if job posting with title at school already exists
 */
export async function jobExists(title: string, schoolId: string): Promise<boolean> {
  const job = await prisma.jobPosting.findFirst({
    where: {
      title,
      schoolId,
    },
  });
  return !!job;
}

/**
 * Logging utilities with consistent formatting
 */
export const logger = {
  info: (message: string) => console.log(`ℹ️  ${message}`),
  success: (message: string) => console.log(`✓ ${message}`),
  warning: (message: string) => console.log(`⚠️  ${message}`),
  error: (message: string) => console.error(`❌ ${message}`),
  section: (title: string) => console.log(`\n${'='.repeat(60)}\n${title}\n${'='.repeat(60)}`),
  subsection: (title: string) => console.log(`\n${title}`),
};

/**
 * Summary tracker for seed operations
 */
export class SeedSummary {
  private stats = {
    created: 0,
    skipped: 0,
    errors: 0,
  };

  increment(type: 'created' | 'skipped' | 'errors') {
    this.stats[type]++;
  }

  getStats() {
    return { ...this.stats };
  }

  display(entityType: string) {
    const { created, skipped, errors } = this.stats;
    logger.info(`${entityType} Summary: ${created} created, ${skipped} skipped, ${errors} errors`);
  }

  reset() {
    this.stats.created = 0;
    this.stats.skipped = 0;
    this.stats.errors = 0;
  }
}

/**
 * Safe operation wrapper with error handling
 */
export async function safeExecute<T>(
  operation: () => Promise<T>,
  errorMessage: string
): Promise<T | null> {
  try {
    return await operation();
  } catch (error) {
    logger.error(`${errorMessage}: ${error instanceof Error ? error.message : String(error)}`);
    return null;
  }
}

/**
 * Database cleanup helpers
 */
export const cleanup = {
  /**
   * Delete all test data (users with test email patterns)
   */
  async deleteTestData() {
    logger.warning('Deleting all test data...');

    // Delete in correct order to respect foreign key constraints
    await prisma.jobPosting.deleteMany({});
    await prisma.teacherProfile.deleteMany({});
    await prisma.schoolProfile.deleteMany({});
    await prisma.recruiterProfile.deleteMany({});
    await prisma.user.deleteMany({
      where: {
        OR: [
          { email: { contains: '@email.com' } },
          { email: { contains: 'test' } },
          { email: { contains: 'dummy' } },
        ],
      },
    });

    logger.success('Test data deleted');
  },

  /**
   * Delete all data (use with extreme caution)
   */
  async deleteAllData() {
    if (SEED_CONFIG.isProduction && !SEED_CONFIG.forceSeeding) {
      logger.error('Cannot delete all data in production without FORCE_SEED=true');
      return;
    }

    logger.warning('Deleting ALL data...');

    await prisma.jobPosting.deleteMany({});
    await prisma.teacherProfile.deleteMany({});
    await prisma.schoolProfile.deleteMany({});
    await prisma.recruiterProfile.deleteMany({});
    await prisma.user.deleteMany({});

    logger.success('All data deleted');
  },
};
