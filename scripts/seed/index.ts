import { prisma, canSeed, logger, SEED_CONFIG } from './utils';
import { seedSchools, seedRecruiters, seedTeachers } from './test-users';
import { seedJobs } from './sample-jobs';

/**
 * Main seed orchestrator
 *
 * This script seeds the database with test data for development and testing.
 * It includes environment checks and deduplication to prevent duplicate data.
 *
 * Usage:
 *   npm run seed            # Normal seeding
 *   FORCE_SEED=true npm run seed  # Force seeding in production (dangerous!)
 *
 * Environment Variables:
 *   NODE_ENV - Environment (production, development, test)
 *   ALLOW_TEST_DATA - Allow test data in production (default: false)
 *   FORCE_SEED - Force seeding even in production (default: false)
 */
async function main() {
  logger.section('🌱 Database Seeding');

  // Environment check
  logger.info(`Environment: ${SEED_CONFIG.environment}`);
  logger.info(`Production: ${SEED_CONFIG.isProduction}`);
  logger.info(`Allow Test Data: ${SEED_CONFIG.allowTestData}`);
  logger.info(`Force Seeding: ${SEED_CONFIG.forceSeeding}`);

  // Permission check
  const { allowed, reason } = canSeed();
  if (!allowed) {
    logger.error(`Seeding aborted: ${reason}`);
    process.exit(1);
  }

  if (SEED_CONFIG.isProduction && !SEED_CONFIG.forceSeeding) {
    logger.warning('⚠️  WARNING: Running in production mode!');
    logger.warning('⚠️  This will add test data to your production database.');
    logger.warning('⚠️  Set FORCE_SEED=true if you really want to proceed.');
    process.exit(1);
  }

  logger.info('✓ Environment checks passed\n');

  const startTime = Date.now();

  try {
    // Seed data in correct order to respect foreign key constraints

    // 1. Create schools (independent)
    const schools = await seedSchools();

    // 2. Create recruiters (independent)
    await seedRecruiters();

    // 3. Create teachers (independent)
    await seedTeachers();

    // 4. Create job postings (depends on schools)
    await seedJobs(schools);

    // Final summary
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    logger.section('✨ Seeding Completed Successfully');

    // Get final counts
    const [schoolCount, recruiterCount, teacherCount, jobCount] = await Promise.all([
      prisma.schoolProfile.count(),
      prisma.recruiterProfile.count(),
      prisma.teacherProfile.count(),
      prisma.jobPosting.count(),
    ]);

    logger.info(`Total Schools: ${schoolCount}`);
    logger.info(`Total Recruiters: ${recruiterCount}`);
    logger.info(`Total Teachers: ${teacherCount}`);
    logger.info(`Total Job Postings: ${jobCount}`);
    logger.info(`Duration: ${duration}s`);

    logger.subsection('\n🔐 Test Credentials:');
    logger.info('Schools: contact@seoul-academy.edu / School123!@#');
    logger.info('Teachers: john.smith@email.com / Teacher123!@#');
    logger.info('Recruiters: contact@globalteachrecruit.com / Recruiter123!@#');
    logger.info('Admin: admin@aijobx.com / Admin123!@#');

    logger.subsection('\n💡 Tip:');
    logger.info('Run "npm run db:studio" to view the seeded data in Prisma Studio');
  } catch (error) {
    logger.error(`Seeding failed: ${error instanceof Error ? error.message : String(error)}`);
    console.error(error);
    process.exit(1);
  }
}

main()
  .catch((e) => {
    logger.error(`Fatal error: ${e instanceof Error ? e.message : String(e)}`);
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
