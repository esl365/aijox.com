# School Dashboard Enhancement Plan

## Executive Summary

This document outlines a comprehensive plan to enhance the School Dashboard for the Global Educator Nexus platform. The enhancement stays strictly within the bounds of the existing business process, which centers on three AI Agents:

1. **AI Screener** - GPT-4o video analysis of teacher profiles
2. **Autonomous Headhunter** - RAG-based job matching using pgvector + Claude 3.5
3. **Visa Guard** - Rule-based visa eligibility checking

**Current State**: Basic dashboard with hardcoded mock data (6 stats, recent jobs list, recent applications list)

**Target State**: AI-powered analytics dashboard with real-time data, match quality metrics, video analysis insights, visa eligibility tracking, and cost monitoring

---

## 1. Current State Analysis

### Existing Features (app/school/dashboard/page.tsx:49-110)

**Hardcoded Statistics:**
- Active Jobs: 8 (static)
- Total Applications: 156 (static)
- Total Views: 892 (static)
- Unread Messages: 5 (static)
- Average Response Rate: 82% (static)
- Hiring Rate: 18% (static)

**Hardcoded Lists:**
- 3 recent job postings with static data
- 3 recent applications with static data

**Missing Integrations:**
- No connection to AI Agent 1 (video analysis results)
- No connection to AI Agent 2 (match quality, email campaigns)
- No connection to AI Agent 3 (visa eligibility statistics)
- No AI cost tracking dashboard
- No performance analytics
- No candidate comparison tools

### Available Data Sources (from Prisma Schema)

**Existing Models:**
```prisma
Job - Job postings with embeddings, visa requirements, salary ranges
TeacherProfile - Teacher profiles with video URLs, analysis results, embeddings
Application - Applications with status tracking
JobMatch - Match quality scores, email status, batch tracking
VisaEligibility - Cached visa eligibility results (JSONB)
AIUsage - Cost tracking for all AI operations
SchoolProfile - School information and preferences
```

---

## 2. Business Process Alignment

### Three AI Agents Integration Points

#### Agent 1: AI Screener Integration
**Data Available:**
- `TeacherProfile.aiAnalysis` (JSONB) - GPT-4o structured output
- Scores: accentClarity, energyEnthusiasm, professionalPresentation, videoTechnicalQuality
- Overall assessment, strengths, areasForImprovement
- Processing status: PENDING → PROCESSING → COMPLETED → FAILED

**Dashboard Opportunities:**
- Display video analysis metrics for applicants
- Show profile completeness scores
- Highlight top-rated candidates
- Track analysis costs and processing times

#### Agent 2: Autonomous Headhunter Integration
**Data Available:**
- `JobMatch` model - similarity scores, filtering stages, email status
- Match discovery speed: <2 seconds for 10,000 profiles
- Email generation using Claude 3.5
- Batch processing with Resend

**Dashboard Opportunities:**
- Show match quality distribution (similarity scores)
- Track email campaign performance (open rates, click rates)
- Display filtering funnel (visa → experience → subject → salary)
- Monitor automated outreach effectiveness

#### Agent 3: Visa Guard Integration
**Data Available:**
- `VisaEligibility` model - cached results for 10 countries
- Real-time validation: <50ms per check
- Cache duration: 30 days
- Country-specific requirements and eligibility status

**Dashboard Opportunities:**
- Visa eligibility distribution for applicants
- Country-specific application trends
- Blocked applications due to visa issues
- Compliance tracking

### AI Cost Tracking (Phase 5-3.2 - COMPLETED)
**Data Available:**
- `AIUsage` model tracks all operations
- Cost breakdown: video-analysis ($0.15/video), embedding ($0.0001/profile), email-generation ($0.002/email)
- Monthly quota: $10/user
- Usage by operation type, date, associated entity

**Dashboard Opportunities:**
- Monthly cost trends
- Cost per hire calculation
- Budget utilization tracking
- ROI analysis

---

## 3. Phased Enhancement Roadmap

### Phase 1: Real Data Foundation (Week 1)
**Goal**: Replace all mock data with real database queries

#### 1.1 Statistics Dashboard
**Implementation:**
```typescript
// Server Component - app/school/dashboard/page.tsx
async function getSchoolStats(schoolId: string) {
  const [activeJobs, totalApplications, recentViews, ...] = await Promise.all([
    prisma.job.count({ where: { schoolId, status: 'ACTIVE' } }),
    prisma.application.count({ where: { job: { schoolId } } }),
    prisma.job.aggregate({
      where: { schoolId },
      _sum: { views: true }
    }),
    // ... more queries
  ]);

  return { activeJobs, totalApplications, totalViews, ... };
}
```

**Database Queries Needed:**
- Active jobs count: `Job.count({ status: 'ACTIVE' })`
- Total applications: `Application.count({ job.schoolId = current })`
- Total views: `Job.aggregate(_sum: { views })`
- Unread messages: (requires Message model - not in spec)
- Response rate: `Application.count({ status: 'RESPONDED' }) / Application.count()`
- Hiring rate: `Application.count({ status: 'HIRED' }) / Application.count()`

**Files to Modify:**
- `app/school/dashboard/page.tsx` - Add async data fetching
- No new files needed

**Success Metrics:**
- All 6 statistics show real-time data
- Page load time <1 second
- Zero hardcoded values

#### 1.2 Recent Jobs List
**Implementation:**
```typescript
const recentJobs = await prisma.job.findMany({
  where: { schoolId },
  orderBy: { createdAt: 'desc' },
  take: 5,
  include: {
    _count: {
      select: { applications: true }
    }
  }
});
```

**Display Fields:**
- Job title, location, status
- Application count (real-time)
- Views count
- Posted date (relative time: "3 hours ago")
- Edit button → `/school/jobs/${job.id}/edit`

**Files to Modify:**
- `app/school/dashboard/page.tsx` - Replace mock data

#### 1.3 Recent Applications List
**Implementation:**
```typescript
const recentApplications = await prisma.application.findMany({
  where: { job: { schoolId } },
  orderBy: { createdAt: 'desc' },
  take: 5,
  include: {
    teacher: {
      include: {
        user: { select: { name: true } }
      }
    },
    job: { select: { title: true } }
  }
});
```

**Display Fields:**
- Candidate name
- Job title
- Applied date (relative)
- Status badge (NEW, REVIEWED, SHORTLISTED, REJECTED, HIRED)
- Review button → `/school/applications/${application.id}`

**Files to Modify:**
- `app/school/dashboard/page.tsx` - Replace mock data

**Phase 1 Deliverables:**
- ✅ Real statistics from database
- ✅ Real recent jobs list
- ✅ Real recent applications list
- ✅ All data updates in real-time

---

### Phase 2: AI Agent Metrics Integration (Week 2)

#### 2.1 Video Analysis Dashboard (Agent 1)
**Goal**: Display AI Screener insights for applicants

**New Component:** `components/school/VideoAnalysisCard.tsx`
```typescript
interface VideoAnalysisCardProps {
  application: Application & {
    teacher: TeacherProfile & { aiAnalysis: AIAnalysisResult }
  };
}

// Display:
// - Overall score (average of 4 metrics)
// - Score breakdown: accent, energy, professionalism, technical quality
// - Key strengths (bullet points)
// - Areas for improvement
// - Video thumbnail with play button
```

**Database Query:**
```typescript
const applicationsWithAnalysis = await prisma.application.findMany({
  where: { job: { schoolId } },
  include: {
    teacher: {
      include: {
        user: true,
        aiAnalysis: true // JSONB field with GPT-4o output
      }
    }
  },
  orderBy: { createdAt: 'desc' }
});
```

**UI Layout:**
- New section: "Top-Rated Candidates" (sorted by AI score)
- Card grid showing top 6 candidates
- Click to expand full analysis

**Files to Create:**
- `components/school/VideoAnalysisCard.tsx`
- `lib/utils/ai-score.ts` (helper to calculate overall score)

**Files to Modify:**
- `app/school/dashboard/page.tsx` - Add new section

#### 2.2 Match Quality Metrics (Agent 2)
**Goal**: Show job matching performance and email campaign results

**New Component:** `components/school/MatchQualityChart.tsx`
```typescript
// Display:
// - Match quality distribution (histogram of similarity scores)
// - Average similarity score per job
// - Filtering funnel: Total profiles → Visa pass → Experience pass → Final matches
// - Email campaign metrics: Sent, Delivered, Opened, Clicked
```

**Database Query:**
```typescript
const matchMetrics = await prisma.jobMatch.groupBy({
  by: ['jobId'],
  where: { job: { schoolId } },
  _avg: { similarityScore: true },
  _count: { id: true }
});

const emailStats = await prisma.jobMatch.groupBy({
  by: ['emailStatus'],
  where: { job: { schoolId } },
  _count: { id: true }
});
```

**UI Layout:**
- New section: "Job Matching Performance"
- Bar chart showing match quality per job
- Funnel diagram showing filtering stages
- Email campaign summary table

**Files to Create:**
- `components/school/MatchQualityChart.tsx`
- `components/school/FilteringFunnel.tsx`
- `components/school/EmailCampaignStats.tsx`

**Files to Modify:**
- `app/school/dashboard/page.tsx` - Add new section
- `package.json` - Add charting library (recharts)

#### 2.3 Visa Eligibility Overview (Agent 3)
**Goal**: Track visa compliance and eligibility trends

**New Component:** `components/school/VisaEligibilityOverview.tsx`
```typescript
// Display:
// - Eligibility distribution by country (pie chart)
// - Top countries for applications
// - Blocked applications due to visa issues
// - Visa requirement warnings
```

**Database Query:**
```typescript
const visaStats = await prisma.application.findMany({
  where: { job: { schoolId } },
  include: {
    teacher: {
      include: {
        visaEligibility: true // JSONB with eligibility per country
      }
    },
    job: {
      select: { country: true }
    }
  }
});

// Process in memory to calculate:
// - Eligible vs ineligible count per country
// - Most common visa blockers
// - Country distribution
```

**UI Layout:**
- New section: "Visa Eligibility Insights"
- Pie chart: Eligible vs Ineligible applications
- Table: Country breakdown with eligibility rates
- Warning list: Applications blocked by visa issues

**Files to Create:**
- `components/school/VisaEligibilityOverview.tsx`
- `lib/utils/visa-stats.ts` (helper to process visa data)

**Files to Modify:**
- `app/school/dashboard/page.tsx` - Add new section

**Phase 2 Deliverables:**
- ✅ Video analysis insights for all applicants
- ✅ Match quality metrics and email campaign tracking
- ✅ Visa eligibility dashboard with compliance tracking
- ✅ All three AI Agents integrated into dashboard

---

### Phase 3: Cost & Performance Analytics (Week 3)

#### 3.1 AI Cost Tracking Dashboard
**Goal**: Monitor AI usage costs and budget utilization

**New Component:** `components/school/AICostDashboard.tsx`
```typescript
// Display:
// - Monthly cost trend (line chart)
// - Cost breakdown by operation type (pie chart)
// - Budget utilization: $X / $10 monthly quota
// - Cost per hire calculation
// - Most expensive operations
```

**Database Query:**
```typescript
const costData = await prisma.aIUsage.findMany({
  where: {
    userId: session.user.id,
    createdAt: {
      gte: new Date(new Date().setMonth(new Date().getMonth() - 3)) // Last 3 months
    }
  },
  orderBy: { createdAt: 'desc' }
});

const monthlyCosts = costData.reduce((acc, usage) => {
  const month = usage.createdAt.toISOString().slice(0, 7); // "2025-01"
  acc[month] = (acc[month] || 0) + usage.cost;
  return acc;
}, {});

const operationBreakdown = costData.reduce((acc, usage) => {
  acc[usage.operation] = (acc[usage.operation] || 0) + usage.cost;
  return acc;
}, {});
```

**Cost Calculations:**
```typescript
// Cost per hire
const totalHires = await prisma.application.count({
  where: { job: { schoolId }, status: 'HIRED' }
});
const totalCost = costData.reduce((sum, u) => sum + u.cost, 0);
const costPerHire = totalHires > 0 ? totalCost / totalHires : 0;

// ROI calculation
const avgTeacherSalary = 50000; // Can be from job postings
const recruitmentCostSavings = avgTeacherSalary * 0.20; // 20% typical recruitment fee
const roi = (recruitmentCostSavings - totalCost) / totalCost * 100;
```

**UI Layout:**
- New page: `app/school/analytics/costs/page.tsx`
- Link from main dashboard: "View Cost Analytics"
- Line chart: Monthly spending trend
- Pie chart: Cost by operation (video-analysis, embedding, email-generation)
- Key metrics cards: Total spent, Budget remaining, Cost per hire, ROI
- Table: Recent AI operations with costs

**Files to Create:**
- `app/school/analytics/costs/page.tsx`
- `components/school/AICostDashboard.tsx`
- `components/school/CostTrendChart.tsx`
- `lib/utils/cost-calculator.ts`

**Files to Modify:**
- `app/school/dashboard/page.tsx` - Add link to cost analytics

#### 3.2 Hiring Funnel Analytics
**Goal**: Track candidate progression through hiring stages

**New Component:** `components/school/HiringFunnel.tsx`
```typescript
// Display:
// - Funnel visualization: Applications → Reviewed → Shortlisted → Interviewed → Hired
// - Conversion rates between stages
// - Average time per stage
// - Bottleneck identification
```

**Database Query:**
```typescript
const funnelData = await prisma.application.groupBy({
  by: ['status'],
  where: { job: { schoolId } },
  _count: { id: true }
});

// Calculate conversion rates
const stages = ['NEW', 'REVIEWED', 'SHORTLISTED', 'INTERVIEWED', 'HIRED'];
const conversions = stages.map((stage, i) => {
  const current = funnelData.find(d => d.status === stage)?._count.id || 0;
  const previous = i > 0 ? funnelData.find(d => d.status === stages[i-1])?._count.id : current;
  return {
    stage,
    count: current,
    conversionRate: previous > 0 ? (current / previous) * 100 : 0
  };
});
```

**UI Layout:**
- New section on main dashboard: "Hiring Funnel"
- Funnel chart showing candidate progression
- Conversion rate badges between stages
- Click to view candidates at each stage

**Files to Create:**
- `components/school/HiringFunnel.tsx`
- `lib/utils/funnel-calculator.ts`

**Files to Modify:**
- `app/school/dashboard/page.tsx` - Add funnel section

#### 3.3 Performance Benchmarking
**Goal**: Compare school's hiring performance against platform averages

**New Component:** `components/school/PerformanceBenchmark.tsx`
```typescript
// Display:
// - Average time to hire (school vs platform average)
// - Application-to-hire conversion rate
// - Candidate quality score (based on AI analysis)
// - Job posting effectiveness (views per application)
```

**Database Queries:**
```typescript
// School metrics
const schoolMetrics = await prisma.application.findMany({
  where: {
    job: { schoolId },
    status: 'HIRED',
    hiredAt: { not: null }
  },
  select: {
    createdAt: true,
    hiredAt: true,
    teacher: {
      include: { aiAnalysis: true }
    }
  }
});

// Calculate school averages
const avgTimeToHire = schoolMetrics.reduce((sum, app) => {
  const days = (app.hiredAt.getTime() - app.createdAt.getTime()) / (1000 * 60 * 60 * 24);
  return sum + days;
}, 0) / schoolMetrics.length;

const avgQualityScore = schoolMetrics.reduce((sum, app) => {
  const analysis = app.teacher.aiAnalysis;
  const score = (analysis.accentClarity + analysis.energyEnthusiasm +
                 analysis.professionalPresentation + analysis.videoTechnicalQuality) / 4;
  return sum + score;
}, 0) / schoolMetrics.length;

// Platform averages (aggregate across all schools)
const platformMetrics = await prisma.application.findMany({
  where: {
    status: 'HIRED',
    hiredAt: { not: null }
  },
  // ... same calculations for platform average
});
```

**UI Layout:**
- New section: "Performance Benchmarks"
- Comparison cards: School vs Platform for each metric
- Green/red indicators for above/below average
- Trend arrows (improving/declining)

**Files to Create:**
- `components/school/PerformanceBenchmark.tsx`
- `lib/utils/benchmark-calculator.ts`

**Files to Modify:**
- `app/school/dashboard/page.tsx` - Add benchmark section

**Phase 3 Deliverables:**
- ✅ AI cost tracking with budget monitoring
- ✅ Hiring funnel visualization with conversion rates
- ✅ Performance benchmarking against platform averages
- ✅ Cost per hire and ROI calculations

---

### Phase 4: Advanced Features (Week 4)

#### 4.1 Candidate Comparison Tool
**Goal**: Side-by-side comparison of multiple candidates

**New Page:** `app/school/candidates/compare/page.tsx`
```typescript
// URL: /school/candidates/compare?ids=1,2,3

// Display:
// - Up to 4 candidates side-by-side
// - Video analysis scores (radar chart)
// - Experience comparison
// - Visa eligibility for target country
// - Salary expectations
// - Match quality score
// - Application status
```

**Implementation:**
```typescript
const candidateIds = searchParams.ids.split(',').map(Number);

const candidates = await prisma.application.findMany({
  where: {
    id: { in: candidateIds },
    job: { schoolId }
  },
  include: {
    teacher: {
      include: {
        user: true,
        aiAnalysis: true,
        visaEligibility: true
      }
    },
    jobMatch: true
  }
});
```

**UI Layout:**
- Table with candidates as columns
- Rows: Photo, Name, Video Score, Experience, Visa Status, Salary, Match Score
- Radar chart overlaying all candidates' AI scores
- Action buttons: Shortlist, Reject, Message

**Files to Create:**
- `app/school/candidates/compare/page.tsx`
- `components/school/CandidateComparisonTable.tsx`
- `components/school/ScoreRadarChart.tsx`

**Files to Modify:**
- `app/school/applications/page.tsx` - Add "Compare" checkbox selection

#### 4.2 AI-Powered Candidate Recommendations
**Goal**: Suggest best candidates for each job using AI insights

**New Component:** `components/school/RecommendedCandidates.tsx`
```typescript
// Algorithm:
// 1. Fetch all applications for a job
// 2. Calculate composite score:
//    - Match quality (40%): similarityScore from JobMatch
//    - AI analysis (30%): average of 4 GPT-4o scores
//    - Visa eligibility (20%): eligible = 100, ineligible = 0
//    - Experience match (10%): years of experience vs requirement
// 3. Sort by composite score descending
// 4. Display top 5 recommendations
```

**Implementation:**
```typescript
const applications = await prisma.application.findMany({
  where: { jobId },
  include: {
    teacher: {
      include: {
        aiAnalysis: true,
        visaEligibility: true
      }
    },
    jobMatch: {
      where: { jobId }
    }
  }
});

const scoredApplications = applications.map(app => {
  const matchScore = app.jobMatch?.similarityScore || 0;
  const aiScore = (app.teacher.aiAnalysis.accentClarity +
                   app.teacher.aiAnalysis.energyEnthusiasm +
                   app.teacher.aiAnalysis.professionalPresentation +
                   app.teacher.aiAnalysis.videoTechnicalQuality) / 4;
  const visaScore = app.teacher.visaEligibility[job.country]?.eligible ? 100 : 0;
  const experienceScore = Math.min(app.teacher.yearsOfExperience / job.minExperience, 1) * 100;

  const compositeScore = (matchScore * 0.4) + (aiScore * 0.3) + (visaScore * 0.2) + (experienceScore * 0.1);

  return { ...app, compositeScore };
}).sort((a, b) => b.compositeScore - a.compositeScore).slice(0, 5);
```

**UI Layout:**
- Section on job detail page: "Recommended Candidates"
- Card grid showing top 5 with composite scores
- Score breakdown tooltip on hover
- "Why recommended?" explanation text

**Files to Create:**
- `components/school/RecommendedCandidates.tsx`
- `lib/utils/candidate-scorer.ts`

**Files to Modify:**
- `app/school/jobs/[id]/page.tsx` - Add recommendations section

#### 4.3 Automated Workflow Suggestions
**Goal**: AI suggests next actions based on hiring patterns

**New Component:** `components/school/WorkflowSuggestions.tsx`
```typescript
// Analyze:
// - Applications sitting in NEW status >3 days → Suggest: "Review pending applications"
// - Jobs with <5 applications after 7 days → Suggest: "Run headhunter for Job X"
// - High-quality candidates rejected → Suggest: "Consider for other open positions"
// - Low email open rates → Suggest: "Improve job description"
// - High cost per hire → Suggest: "Use video screening to filter early"
```

**Implementation:**
```typescript
const suggestions = [];

// Check pending applications
const oldApplications = await prisma.application.count({
  where: {
    job: { schoolId },
    status: 'NEW',
    createdAt: { lt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) }
  }
});
if (oldApplications > 0) {
  suggestions.push({
    type: 'ACTION',
    priority: 'HIGH',
    message: `${oldApplications} applications pending review for >3 days`,
    action: '/school/applications?status=NEW',
    actionLabel: 'Review Now'
  });
}

// Check underperforming jobs
const lowApplicationJobs = await prisma.job.findMany({
  where: {
    schoolId,
    status: 'ACTIVE',
    createdAt: { lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    applications: { _count: { lt: 5 } }
  }
});
if (lowApplicationJobs.length > 0) {
  lowApplicationJobs.forEach(job => {
    suggestions.push({
      type: 'OPTIMIZATION',
      priority: 'MEDIUM',
      message: `"${job.title}" has only ${job.applications.length} applications after 7 days`,
      action: `/school/jobs/${job.id}/run-headhunter`,
      actionLabel: 'Run AI Headhunter'
    });
  });
}

// More suggestion patterns...
```

**UI Layout:**
- Alert banner at top of dashboard (if high priority suggestions)
- Collapsible section: "Workflow Suggestions"
- List of suggestions with priority badges
- One-click action buttons

**Files to Create:**
- `components/school/WorkflowSuggestions.tsx`
- `lib/suggestions/workflow-analyzer.ts`
- `app/actions/suggestions.ts` (Server Action to fetch suggestions)

**Files to Modify:**
- `app/school/dashboard/page.tsx` - Add suggestions banner

**Phase 4 Deliverables:**
- ✅ Candidate comparison tool for side-by-side evaluation
- ✅ AI-powered candidate recommendations with composite scoring
- ✅ Automated workflow suggestions based on hiring patterns
- ✅ One-click actions for suggested improvements

---

## 4. Technical Implementation Details

### Database Schema Requirements

**No new tables needed** - All features use existing Prisma models:
- `Job`, `TeacherProfile`, `Application`, `JobMatch`, `VisaEligibility`, `AIUsage`, `SchoolProfile`

**Potential indexes to add** for performance:
```prisma
@@index([schoolId, status]) // on Job model
@@index([jobId, status]) // on Application model
@@index([userId, createdAt]) // on AIUsage model
```

### Server Actions Architecture

**Create centralized server actions:**
```
app/actions/
  ├── dashboard-stats.ts      // Phase 1 statistics
  ├── ai-metrics.ts           // Phase 2 AI Agent data
  ├── cost-analytics.ts       // Phase 3 cost tracking
  ├── candidate-scoring.ts    // Phase 4 recommendations
  └── suggestions.ts          // Phase 4 workflow suggestions
```

**Example Server Action:**
```typescript
'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function getDashboardStats() {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  const schoolProfile = await prisma.schoolProfile.findUnique({
    where: { userId: session.user.id }
  });
  if (!schoolProfile) throw new Error('School profile not found');

  const [activeJobs, totalApplications, totalViews] = await Promise.all([
    prisma.job.count({ where: { schoolId: schoolProfile.id, status: 'ACTIVE' } }),
    prisma.application.count({ where: { job: { schoolId: schoolProfile.id } } }),
    prisma.job.aggregate({
      where: { schoolId: schoolProfile.id },
      _sum: { views: true }
    })
  ]);

  return { activeJobs, totalApplications, totalViews: totalViews._sum.views || 0 };
}
```

### UI Component Architecture

**Component Hierarchy:**
```
app/school/dashboard/page.tsx (Server Component)
├── <DashboardStats /> (Client Component - Phase 1)
├── <RecentJobs /> (Client Component - Phase 1)
├── <RecentApplications /> (Client Component - Phase 1)
├── <VideoAnalysisSection /> (Client Component - Phase 2)
│   └── <VideoAnalysisCard /> × N
├── <MatchQualitySection /> (Client Component - Phase 2)
│   ├── <MatchQualityChart />
│   ├── <FilteringFunnel />
│   └── <EmailCampaignStats />
├── <VisaEligibilityOverview /> (Client Component - Phase 2)
├── <HiringFunnel /> (Client Component - Phase 3)
├── <PerformanceBenchmark /> (Client Component - Phase 3)
└── <WorkflowSuggestions /> (Client Component - Phase 4)
```

**Data Fetching Strategy:**
- Server Component fetches all data in parallel
- Pass data as props to Client Components
- Client Components handle interactivity only (no data fetching)

### Performance Optimization

**Caching Strategy:**
```typescript
// Use React cache() for deduplication within a request
import { cache } from 'react';

export const getSchoolProfile = cache(async (userId: string) => {
  return await prisma.schoolProfile.findUnique({
    where: { userId }
  });
});
```

**Parallel Data Fetching:**
```typescript
// Fetch all dashboard data in parallel
const [stats, recentJobs, recentApplications, aiMetrics, costData] = await Promise.all([
  getDashboardStats(),
  getRecentJobs(),
  getRecentApplications(),
  getAIMetrics(),
  getCostAnalytics()
]);
```

**Redis Caching for Expensive Queries:**
```typescript
import { redis } from '@/lib/cache/redis';

// Cache benchmark data (changes infrequently)
const cacheKey = `benchmarks:${schoolId}`;
let benchmarks = await redis.get(cacheKey);

if (!benchmarks) {
  benchmarks = await calculateBenchmarks(schoolId);
  await redis.setex(cacheKey, 3600, JSON.stringify(benchmarks)); // 1 hour cache
}
```

### Chart Library Selection

**Recommendation: Recharts**
- Reason: React-friendly, customizable, good performance
- Installation: `npm install recharts`
- Usage: Line charts, bar charts, pie charts, radar charts, funnel charts

**Example Usage:**
```typescript
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

<LineChart width={600} height={300} data={costTrendData}>
  <CartesianGrid strokeDasharray="3 3" />
  <XAxis dataKey="month" />
  <YAxis />
  <Tooltip />
  <Line type="monotone" dataKey="cost" stroke="#8884d8" />
</LineChart>
```

---

## 5. Success Metrics

### Key Performance Indicators (KPIs)

**User Engagement:**
- Dashboard page views: Target +200% vs baseline
- Time spent on dashboard: Target 5+ minutes per session
- Feature adoption rate: Target 80% of schools use AI metrics within 30 days

**Hiring Process Efficiency:**
- Time to first review: Reduce from avg 48 hours to <24 hours
- Time to hire: Reduce by 30% (from 21 days to <15 days)
- Application review rate: Increase by 50%

**AI Agent Utilization:**
- Video analysis adoption: 90% of applications analyzed
- Headhunter campaigns run: Target 2+ per job posting
- Visa eligibility checks: 100% of applications before shortlisting

**Cost Efficiency:**
- Cost per hire: Target <$50 (video analysis + matching + emails)
- AI budget utilization: 70-90% of $10 monthly quota
- ROI: Target 10x return (vs traditional recruitment fees)

**Data Quality:**
- Zero hardcoded data on dashboard
- Real-time updates: <1 second staleness
- Accurate analytics: 100% match with database state

### User Feedback Collection

**In-app Feedback Widget:**
```typescript
// Add to dashboard
<FeedbackButton
  feature="dashboard-v2"
  prompt="How useful is the new AI-powered dashboard?"
/>
```

**A/B Testing Metrics:**
- Test: Show vs hide AI recommendations
- Measure: Shortlist rate, time to decision, user satisfaction

---

## 6. Risk Mitigation

### Performance Risks

**Risk**: Dashboard slow to load with complex queries
**Mitigation**:
- Parallel data fetching with Promise.all()
- Database indexes on frequently queried columns
- Redis caching for expensive aggregations
- Pagination for large lists (>100 items)

**Risk**: Charting library increases bundle size
**Mitigation**:
- Use dynamic imports for chart components
- Code splitting per phase
- Lazy load charts below the fold

### Data Quality Risks

**Risk**: Missing or incomplete AI analysis data
**Mitigation**:
- Show "Analysis Pending" state for in-progress videos
- Handle null/undefined gracefully with fallbacks
- Provide manual override for schools

**Risk**: Inaccurate benchmarks with low sample size
**Mitigation**:
- Require minimum 10 hires for benchmark display
- Show "Insufficient data" message if <10 samples
- Use platform averages as default

### Cost Risks

**Risk**: Expensive database queries increase Neon costs
**Mitigation**:
- Monitor query performance with Prisma logging
- Use connection pooling (already configured)
- Implement query result caching
- Set budget alerts in Neon dashboard

---

## 7. Implementation Timeline

### Week 1: Phase 1 - Real Data Foundation
- Day 1-2: Implement statistics dashboard with real queries
- Day 3-4: Replace recent jobs and applications lists
- Day 5: Testing, bug fixes, performance optimization

**Deliverable**: Dashboard with 100% real data, zero hardcoded values

### Week 2: Phase 2 - AI Agent Metrics
- Day 1-2: Video analysis dashboard (Agent 1)
- Day 3: Match quality metrics (Agent 2)
- Day 4: Visa eligibility overview (Agent 3)
- Day 5: Integration testing, UI polish

**Deliverable**: All three AI Agents integrated into dashboard

### Week 3: Phase 3 - Cost & Analytics
- Day 1-2: AI cost tracking dashboard
- Day 3: Hiring funnel analytics
- Day 4: Performance benchmarking
- Day 5: Testing, documentation

**Deliverable**: Complete analytics suite with cost monitoring

### Week 4: Phase 4 - Advanced Features
- Day 1-2: Candidate comparison tool
- Day 3: AI-powered recommendations
- Day 4: Workflow suggestions
- Day 5: Final testing, user feedback collection

**Deliverable**: Production-ready advanced dashboard with AI recommendations

---

## 8. Future Enhancements (Out of Scope for Initial Plan)

**Not included but potential for future phases:**
- Real-time messaging system (requires Message model)
- Calendar integration for interview scheduling
- Automated reference checking
- Predictive analytics (e.g., predict time to hire)
- Custom report builder
- Mobile app companion
- Integration with external HR systems
- Multi-language support for international schools
- Video interview scheduling and recording
- Candidate assessment tests

---

## 9. Conclusion

This enhancement plan transforms the School Dashboard from a basic stat display into a comprehensive AI-powered hiring command center. By leveraging the three existing AI Agents (Screener, Headhunter, Visa Guard) and the Phase 5 infrastructure (Redis caching, cost tracking), schools will gain:

1. **Real-time visibility** into hiring pipeline
2. **AI-driven insights** for candidate evaluation
3. **Cost transparency** and ROI tracking
4. **Performance benchmarking** against platform averages
5. **Automated recommendations** to optimize hiring

**Implementation Approach:**
- Phased rollout over 4 weeks
- No new database schema changes
- Uses existing Prisma models and AI infrastructure
- Stays strictly within specification boundaries
- Focus on performance and user experience

**Success Definition:**
- 90%+ schools actively use AI metrics within 30 days
- 30% reduction in time to hire
- <$50 cost per hire
- Zero hardcoded data on dashboard

The enhanced dashboard will position Global Educator Nexus as a truly AI-powered recruitment platform, differentiating it from traditional job boards through intelligent automation and data-driven hiring decisions.
