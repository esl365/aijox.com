/**
 * Validation script for Google for Jobs Schema
 *
 * Usage:
 * tsx scripts/validate-google-jobs.ts [job-id]
 *
 * If no job-id provided, validates all active jobs
 */

import { prisma } from '../lib/db';
import {
  generateGoogleJobSchema,
  isEligibleForGoogleJobs,
} from '../lib/seo/google-jobs';
import { validateGoogleJobSchema } from '../lib/types/google-jobs';

async function validateJob(jobId: string) {
  const job = await prisma.jobPosting.findUnique({
    where: { id: jobId },
  });

  if (!job) {
    console.error(`❌ Job not found: ${jobId}`);
    return false;
  }

  console.log(`\n📋 Validating Job: ${job.title}`);
  console.log(`   ID: ${job.id}`);
  console.log(`   Status: ${job.status}`);

  // Check eligibility
  const eligible = isEligibleForGoogleJobs(job);
  if (!eligible) {
    console.log(`⚠️  Not eligible for Google for Jobs:`);

    if (job.status !== 'ACTIVE') {
      console.log(`   - Status is ${job.status} (must be ACTIVE)`);
    }
    if (!job.title || !job.description || !job.city || !job.country) {
      console.log(`   - Missing required fields`);
    }
    if (job.expiresAt && job.expiresAt < new Date()) {
      console.log(`   - Expired on ${job.expiresAt.toISOString()}`);
    }

    return false;
  }

  // Generate schema
  const schema = generateGoogleJobSchema(job);

  // Validate schema
  const validation = validateGoogleJobSchema(schema);

  if (validation.isValid) {
    console.log(`✅ Valid Google for Jobs Schema`);
    console.log(`   - Title: ${schema.title}`);
    console.log(`   - Location: ${schema.jobLocation.address.addressLocality}, ${schema.jobLocation.address.addressCountry}`);
    console.log(`   - Salary: ${schema.baseSalary?.currency} ${schema.baseSalary?.value.value}/${schema.baseSalary?.value.unitText}`);
    console.log(`   - Posted: ${schema.datePosted}`);
    console.log(`   - Expires: ${schema.validThrough}`);

    if (schema.educationRequirements) {
      console.log(`   - Education: ${typeof schema.educationRequirements === 'string' ? schema.educationRequirements.slice(0, 50) + '...' : 'Defined'}`);
    }

    if (schema.experienceRequirements) {
      const expReq = typeof schema.experienceRequirements === 'string'
        ? schema.experienceRequirements.slice(0, 50) + '...'
        : `${(schema.experienceRequirements as any).monthsOfExperience} months`;
      console.log(`   - Experience: ${expReq}`);
    }

    return true;
  } else {
    console.log(`❌ Invalid Google for Jobs Schema`);
    console.log(`   Errors:`);
    validation.errors.forEach((error) => {
      console.log(`   - ${error}`);
    });

    return false;
  }
}

async function validateAllJobs() {
  console.log('🔍 Validating all active job postings...\n');

  const jobs = await prisma.jobPosting.findMany({
    where: { status: 'ACTIVE' },
    select: { id: true },
  });

  console.log(`Found ${jobs.length} active jobs\n`);

  let validCount = 0;
  let invalidCount = 0;
  let ineligibleCount = 0;

  for (const job of jobs) {
    const result = await validateJob(job.id);

    if (result === null) {
      ineligibleCount++;
    } else if (result) {
      validCount++;
    } else {
      invalidCount++;
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`   ✅ Valid: ${validCount}`);
  console.log(`   ❌ Invalid: ${invalidCount}`);
  console.log(`   ⚠️  Ineligible: ${ineligibleCount}`);
  console.log(`   📈 Total: ${jobs.length}`);

  if (invalidCount > 0) {
    console.log(`\n⚠️  ${invalidCount} jobs have schema errors. Please fix them.`);
    process.exit(1);
  } else if (ineligibleCount === jobs.length) {
    console.log(`\n⚠️  No jobs are eligible for Google for Jobs.`);
    process.exit(1);
  } else {
    console.log(`\n✅ All eligible jobs have valid schemas!`);
    process.exit(0);
  }
}

async function main() {
  const jobId = process.argv[2];

  try {
    if (jobId) {
      // Validate single job
      const result = await validateJob(jobId);
      process.exit(result ? 0 : 1);
    } else {
      // Validate all jobs
      await validateAllJobs();
    }
  } catch (error) {
    console.error('❌ Validation failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
