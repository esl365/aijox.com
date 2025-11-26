/**
 * Database Metrics Baseline Collection Script
 *
 * Collects current conversion funnel, user engagement, and performance metrics
 * from the database to establish baseline before UI/UX redesign.
 *
 * Usage: npx tsx scripts/baseline/collect-database-metrics.ts
 */

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface DatabaseMetrics {
  timestamp: string;
  userMetrics: {
    totalUsers: number;
    teacherProfiles: number;
    recruiterProfiles: number;
    profilesWithVideo: number;
    profileCompleteness: number;
  };
  conversionFunnel: {
    signups: number;
    profilesCreated: number;
    jobsViewed: number;
    jobsApplied: number;
    signupToProfile: number;
    profileToView: number;
    viewToApply: number;
    overallConversion: number;
  };
  jobMetrics: {
    totalJobs: number;
    activeJobs: number;
    applicationsReceived: number;
    avgApplicationsPerJob: number;
    jobsWithApplications: number;
  };
  performanceMetrics: {
    avgJobSearchTime?: string;
    avgProfileLoadTime?: string;
    avgApplicationTime?: string;
  };
}

async function collectUserMetrics() {
  console.log('📊 Collecting user metrics...');

  const totalUsers = await prisma.user.count();

  const teacherProfiles = await prisma.teacherProfile.count();

  const recruiterProfiles = await prisma.recruiterProfile.count();

  const profilesWithVideo = await prisma.teacherProfile.count({
    where: {
      videoUrl: { not: null },
    },
  });

  // Calculate average profile completeness
  const profiles = await prisma.teacherProfile.findMany({
    select: {
      videoUrl: true,
      bio: true,
      yearsExperience: true,
      subjects: true,
      documents: {
        select: {
          type: true,
        },
      },
    },
  });

  const completeness = profiles.map(profile => {
    let score = 0;
    if (profile.videoUrl) score += 25;
    // Check if has PDF document (resume/CV)
    const hasResume = profile.documents.some(doc => doc.type === 'PDF');
    if (hasResume) score += 25;
    if (profile.bio && profile.bio.length > 100) score += 25;
    if (profile.yearsExperience && profile.yearsExperience > 0) score += 10;
    if (profile.subjects && profile.subjects.length > 0) score += 15;
    return score;
  });

  const avgCompleteness = completeness.length > 0
    ? Math.round(completeness.reduce((a, b) => a + b, 0) / completeness.length)
    : 0;

  return {
    totalUsers,
    teacherProfiles,
    recruiterProfiles,
    profilesWithVideo,
    profileCompleteness: avgCompleteness,
  };
}

async function collectConversionFunnel() {
  console.log('📊 Collecting conversion funnel...');

  // Get total signups
  const signups = await prisma.user.count();

  // Profiles created (users with either teacher or recruiter profile)
  const profilesCreated = await prisma.user.count({
    where: {
      OR: [
        { teacherProfile: { isNot: null } },
        { recruiterProfile: { isNot: null } },
      ],
    },
  });

  // Jobs viewed (distinct users who have application records)
  const jobsViewedResult = await prisma.application.groupBy({
    by: ['teacherId'],
    _count: true,
  });
  const jobsViewed = jobsViewedResult.length;

  // Jobs applied
  const jobsApplied = await prisma.application.count();

  // Calculate conversion rates
  const signupToProfile = signups > 0 ? Math.round((profilesCreated / signups) * 100) : 0;
  const profileToView = profilesCreated > 0 ? Math.round((jobsViewed / profilesCreated) * 100) : 0;
  const viewToApply = jobsViewed > 0 ? Math.round((jobsApplied / jobsViewed) * 100) : 0;
  const overallConversion = signups > 0 ? Math.round((jobsApplied / signups) * 100) : 0;

  return {
    signups,
    profilesCreated,
    jobsViewed,
    jobsApplied,
    signupToProfile,
    profileToView,
    viewToApply,
    overallConversion,
  };
}

async function collectJobMetrics() {
  console.log('📊 Collecting job metrics...');

  const totalJobs = await prisma.jobPosting.count();

  const activeJobs = await prisma.jobPosting.count({
    where: {
      status: 'ACTIVE',
    },
  });

  const applicationsReceived = await prisma.application.count();

  const jobsWithApplications = await prisma.jobPosting.count({
    where: {
      applications: {
        some: {},
      },
    },
  });

  const avgApplicationsPerJob = totalJobs > 0
    ? Math.round((applicationsReceived / totalJobs) * 10) / 10
    : 0;

  return {
    totalJobs,
    activeJobs,
    applicationsReceived,
    avgApplicationsPerJob,
    jobsWithApplications,
  };
}

function generateMarkdownReport(metrics: DatabaseMetrics): string {
  let markdown = `# Database Metrics Baseline Report\n\n`;
  markdown += `**Date**: ${new Date(metrics.timestamp).toISOString().split('T')[0]}\n`;
  markdown += `**Purpose**: Establish user engagement baseline before UI/UX redesign\n\n`;
  markdown += `---\n\n`;

  // User Metrics
  markdown += `## User Metrics\n\n`;
  markdown += `| Metric | Value |\n`;
  markdown += `|--------|-------|\n`;
  markdown += `| Total Users | ${metrics.userMetrics.totalUsers.toLocaleString()} |\n`;
  markdown += `| Teacher Profiles | ${metrics.userMetrics.teacherProfiles.toLocaleString()} |\n`;
  markdown += `| Recruiter Profiles | ${metrics.userMetrics.recruiterProfiles.toLocaleString()} |\n`;
  markdown += `| Profiles with Video | ${metrics.userMetrics.profilesWithVideo.toLocaleString()} (${metrics.userMetrics.teacherProfiles > 0 ? Math.round((metrics.userMetrics.profilesWithVideo / metrics.userMetrics.teacherProfiles) * 100) : 0}%) |\n`;
  markdown += `| Avg Profile Completeness | ${metrics.userMetrics.profileCompleteness}% |\n\n`;

  // Conversion Funnel
  markdown += `## Conversion Funnel\n\n`;
  markdown += `\`\`\`\n`;
  markdown += `Signups (${metrics.conversionFunnel.signups})\n`;
  markdown += `    ↓ ${metrics.conversionFunnel.signupToProfile}%\n`;
  markdown += `Profiles Created (${metrics.conversionFunnel.profilesCreated})\n`;
  markdown += `    ↓ ${metrics.conversionFunnel.profileToView}%\n`;
  markdown += `Jobs Viewed (${metrics.conversionFunnel.jobsViewed})\n`;
  markdown += `    ↓ ${metrics.conversionFunnel.viewToApply}%\n`;
  markdown += `Applications Submitted (${metrics.conversionFunnel.jobsApplied})\n`;
  markdown += `\n`;
  markdown += `Overall Conversion: ${metrics.conversionFunnel.overallConversion}%\n`;
  markdown += `\`\`\`\n\n`;

  markdown += `| Stage | Count | Conversion Rate |\n`;
  markdown += `|-------|-------|----------------|\n`;
  markdown += `| Signups | ${metrics.conversionFunnel.signups.toLocaleString()} | - |\n`;
  markdown += `| Profile Created | ${metrics.conversionFunnel.profilesCreated.toLocaleString()} | ${metrics.conversionFunnel.signupToProfile}% |\n`;
  markdown += `| Jobs Viewed | ${metrics.conversionFunnel.jobsViewed.toLocaleString()} | ${metrics.conversionFunnel.profileToView}% |\n`;
  markdown += `| Applications | ${metrics.conversionFunnel.jobsApplied.toLocaleString()} | ${metrics.conversionFunnel.viewToApply}% |\n`;
  markdown += `| **Overall** | **${metrics.conversionFunnel.jobsApplied.toLocaleString()}** | **${metrics.conversionFunnel.overallConversion}%** |\n\n`;

  // Job Metrics
  markdown += `## Job Posting Metrics\n\n`;
  markdown += `| Metric | Value |\n`;
  markdown += `|--------|-------|\n`;
  markdown += `| Total Jobs Posted | ${metrics.jobMetrics.totalJobs.toLocaleString()} |\n`;
  markdown += `| Active Jobs | ${metrics.jobMetrics.activeJobs.toLocaleString()} |\n`;
  markdown += `| Total Applications | ${metrics.jobMetrics.applicationsReceived.toLocaleString()} |\n`;
  markdown += `| Jobs with Applications | ${metrics.jobMetrics.jobsWithApplications.toLocaleString()} (${metrics.jobMetrics.totalJobs > 0 ? Math.round((metrics.jobMetrics.jobsWithApplications / metrics.jobMetrics.totalJobs) * 100) : 0}%) |\n`;
  markdown += `| Avg Applications per Job | ${metrics.jobMetrics.avgApplicationsPerJob} |\n\n`;

  // Targets
  markdown += `---\n\n`;
  markdown += `## Target Metrics (Post-Redesign)\n\n`;
  markdown += `| Metric | Current | Target | Improvement Needed |\n`;
  markdown += `|--------|---------|--------|--------------------|\n`;
  markdown += `| Signup → Profile | ${metrics.conversionFunnel.signupToProfile}% | 80% | +${Math.max(0, 80 - metrics.conversionFunnel.signupToProfile)}% |\n`;
  markdown += `| Profile → View Jobs | ${metrics.conversionFunnel.profileToView}% | 70% | +${Math.max(0, 70 - metrics.conversionFunnel.profileToView)}% |\n`;
  markdown += `| View → Apply | ${metrics.conversionFunnel.viewToApply}% | 25% | +${Math.max(0, 25 - metrics.conversionFunnel.viewToApply)}% |\n`;
  markdown += `| Overall Conversion | ${metrics.conversionFunnel.overallConversion}% | 15% | +${Math.max(0, 15 - metrics.conversionFunnel.overallConversion)}% |\n`;
  markdown += `| Profile Completeness | ${metrics.userMetrics.profileCompleteness}% | 85% | +${Math.max(0, 85 - metrics.userMetrics.profileCompleteness)}% |\n`;
  markdown += `| Apps per Job | ${metrics.jobMetrics.avgApplicationsPerJob} | 10+ | ${metrics.jobMetrics.avgApplicationsPerJob >= 10 ? '✅' : `+${(10 - metrics.jobMetrics.avgApplicationsPerJob).toFixed(1)}`} |\n\n`;

  markdown += `---\n\n`;
  markdown += `## Key Insights\n\n`;

  // Generate insights
  if (metrics.conversionFunnel.signupToProfile < 50) {
    markdown += `- ⚠️ **Low profile creation rate**: Only ${metrics.conversionFunnel.signupToProfile}% of users create profiles. Focus on onboarding UX.\n`;
  }

  if (metrics.conversionFunnel.viewToApply < 15) {
    markdown += `- ⚠️ **Low application rate**: Only ${metrics.conversionFunnel.viewToApply}% of users who view jobs apply. Simplify application flow.\n`;
  }

  if (metrics.userMetrics.profileCompleteness < 70) {
    markdown += `- ⚠️ **Incomplete profiles**: Average completeness is ${metrics.userMetrics.profileCompleteness}%. Add completion prompts and incentives.\n`;
  }

  if (metrics.jobMetrics.avgApplicationsPerJob < 5) {
    markdown += `- ⚠️ **Low job engagement**: Jobs receive ${metrics.jobMetrics.avgApplicationsPerJob} applications on average. Improve job discovery and matching.\n`;
  }

  markdown += `\n---\n\n`;
  markdown += `## Next Steps\n\n`;
  markdown += `1. Set up weekly tracking queries to monitor trends\n`;
  markdown += `2. Implement analytics events for user interactions\n`;
  markdown += `3. Create dashboard to visualize these metrics\n`;
  markdown += `4. Re-measure after each UI/UX phase\n\n`;

  return markdown;
}

async function main() {
  console.log('🚀 Starting Database Metrics Collection\n');
  console.log('='.repeat(50));

  try {
    const userMetrics = await collectUserMetrics();
    const conversionFunnel = await collectConversionFunnel();
    const jobMetrics = await collectJobMetrics();

    const metrics: DatabaseMetrics = {
      timestamp: new Date().toISOString(),
      userMetrics,
      conversionFunnel,
      jobMetrics,
      performanceMetrics: {},
    };

    // Save to files
    const baselineDir = path.join(process.cwd(), 'docs', 'baseline');
    if (!fs.existsSync(baselineDir)) {
      fs.mkdirSync(baselineDir, { recursive: true });
    }

    const markdown = generateMarkdownReport(metrics);
    const reportPath = path.join(baselineDir, 'database-baseline.md');
    fs.writeFileSync(reportPath, markdown);

    const jsonPath = path.join(baselineDir, 'database-baseline.json');
    fs.writeFileSync(jsonPath, JSON.stringify(metrics, null, 2));

    console.log('\n' + '='.repeat(50));
    console.log('✅ Database metrics collection complete!');
    console.log(`\n📄 Reports saved to:`);
    console.log(`   - ${reportPath}`);
    console.log(`   - ${jsonPath}`);

    // Display summary
    console.log(`\n📊 Summary:`);
    console.log(`   Total Users: ${metrics.userMetrics.totalUsers}`);
    console.log(`   Overall Conversion: ${metrics.conversionFunnel.overallConversion}%`);
    console.log(`   Avg Applications per Job: ${metrics.jobMetrics.avgApplicationsPerJob}`);

  } catch (error) {
    console.error('❌ Error collecting metrics:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
