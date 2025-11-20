import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const jobs = await prisma.jobPosting.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      title: true,
      schoolName: true,
      country: true,
      salaryUSD: true
    }
  });

  console.log('\n📋 Job Postings in Database:\n');
  if (jobs.length === 0) {
    console.log('❌ No jobs found in database!');
  } else {
    jobs.forEach((job, index) => {
      console.log(`${index + 1}. ${job.title} at ${job.schoolName}`);
      console.log(`   ID: ${job.id}`);
      console.log(`   Location: ${job.country}`);
      console.log(`   Salary: $${job.salaryUSD}/month`);
      console.log(`   URL: https://aijobx.vercel.app/jobs/${job.id}\n`);
    });
  }

  await prisma.$disconnect();
}

main().catch(console.error);
