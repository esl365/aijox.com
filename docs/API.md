# Global Educator Nexus - API Documentation

## Overview

This document provides comprehensive API documentation for the Global Educator Nexus platform, covering all server actions, API routes, and core services.

**Base URL (Production):** `https://aijobx.vercel.app`

## Table of Contents

1. [Authentication](#authentication)
2. [Server Actions](#server-actions)
3. [API Routes](#api-routes)
4. [AI Services](#ai-services)
5. [Database Services](#database-services)
6. [Error Handling](#error-handling)
7. [Rate Limiting](#rate-limiting)

---

## Authentication

### NextAuth.js Integration

The platform uses NextAuth.js for authentication with credentials-based login.

**Endpoints:**
- `POST /api/auth/signin` - Sign in
- `POST /api/auth/signout` - Sign out
- `GET /api/auth/session` - Get current session
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/check-email` - Check email availability

**Session Structure:**
```typescript
interface Session {
  user: {
    id: string;
    email: string;
    role: 'TEACHER' | 'SCHOOL' | 'ADMIN';
    name?: string;
  }
}
```

---

## Server Actions

All server actions are located in `app/actions/` and use Next.js Server Actions with `'use server'`.

### 1. Authentication & User Management

#### `app/actions/auth.ts`

**`authenticate(email: string, password: string)`**
- Validates credentials and creates session
- Returns: `{ success: boolean, error?: string }`

**`createUser(data: { email, password, role })`**
- Creates new user account
- Returns: `{ success: boolean, userId?: string, error?: string }`

**`setUserRole(userId: string, role: Role)`**
- Admin function to set user role
- Returns: `{ success: boolean, error?: string }`

#### `app/actions/set-role.ts`

**`setRole(role: 'TEACHER' | 'SCHOOL')`**
- Sets role for current user
- Returns: `{ success: boolean, error?: string }`

---

### 2. AI Agent Actions

#### `app/actions/analyze-video.ts` (Agent 1: AI Screener)

**`analyzeVideo(videoUrl: string, teacherId: string)`**
- Analyzes teacher profile video using GPT-4o Vision
- Extracts: teaching style, personality, strengths, weaknesses
- Returns:
```typescript
{
  success: boolean;
  analysis?: {
    teachingStyle: string;
    personalityTraits: string[];
    strengths: string[];
    weaknesses: string[];
    overallScore: number;
    feedback: string;
    completenessScore: number;
    missingInfo: string[];
  };
  error?: string;
}
```

**`getVideoAnalysisStatus(teacherId: string)`**
- Gets cached video analysis result
- Returns: Same as analyzeVideo

#### `app/actions/match-teachers.ts` (Agent 2: Autonomous Headhunter)

**`matchTeachersToJob(jobId: string, options?: MatchOptions)`**
- RAG-based semantic matching using OpenAI embeddings + pgvector
- Multi-stage filtering: vector similarity → visa → preferences
- Returns:
```typescript
{
  success: boolean;
  matches?: Array<{
    teacherId: string;
    teacher: TeacherProfile;
    matchScore: number;
    similarity: number;
    visaEligibility: boolean;
    reasoning: string;
  }>;
  totalFound: number;
  error?: string;
}
```

**`sendPersonalizedEmails(jobId: string, teacherIds: string[])`**
- Generates personalized emails with Claude 3.5 Sonnet
- Sends via Resend API
- Returns:
```typescript
{
  success: boolean;
  sent: number;
  failed: number;
  errors?: string[];
}
```

**`getMatchCache(jobId: string)`**
- Retrieves cached match results
- Returns: Same as matchTeachersToJob

#### `app/actions/check-visa.ts` (Agent 3: Visa Guard)

**`checkVisaEligibility(teacherId: string, country: string)`**
- Rule-based visa eligibility checking
- Supports 10 countries: South Korea, China, UAE, Japan, Saudi Arabia, Vietnam, Thailand, Taiwan, Spain, Chile
- Returns:
```typescript
{
  success: boolean;
  result?: {
    eligible: boolean;
    visaType: string;
    confidence: number;
    requirements: string[];
    failedRequirements: string[];
    recommendation: string;
  };
  error?: string;
}
```

**`checkAllCountries(teacherId: string)`**
- Checks eligibility for all 10 countries
- Returns: `Record<string, VisaCheckResult>`

**`getEligibleCountries(teacherId: string)`**
- Returns list of countries where teacher is eligible
- Returns: `string[]`

#### `app/actions/visa-validation.ts`

**`validateVisaApplication(applicationId: string)`**
- Validates visa application against country rules
- Returns:
```typescript
{
  success: boolean;
  validation?: {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  };
  error?: string;
}
```

---

### 3. Job Management

#### `app/actions/jobs.ts`

**`createJob(data: JobCreateInput)`**
- Creates new job posting
- Generates embeddings automatically
- Returns: `{ success: boolean, jobId?: string, error?: string }`

**`updateJob(jobId: string, data: JobUpdateInput)`**
- Updates job posting
- Regenerates embeddings if description changed
- Returns: `{ success: boolean, error?: string }`

**`deleteJob(jobId: string)`**
- Soft deletes job (sets deletedAt)
- Returns: `{ success: boolean, error?: string }`

**`getJobsBySchool(schoolId?: string, filters?: JobFilters)`**
- Gets jobs for a school with filters
- Returns: `{ success: boolean, jobs?: Job[], error?: string }`

**`getJobDetails(jobId: string)`**
- Gets detailed job information
- Returns: `{ success: boolean, job?: Job, error?: string }`

**`toggleJobActive(jobId: string, active: boolean)`**
- Activates/deactivates job posting
- Returns: `{ success: boolean, error?: string }`

#### `app/actions/job-extraction.ts`

**`extractJobFromUrl(url: string)`**
- Scrapes job posting from external URL
- Parses with GPT-4
- Returns:
```typescript
{
  success: boolean;
  jobData?: {
    title: string;
    description: string;
    requirements: string[];
    salary?: { min: number; max: number; currency: string };
    location: string;
  };
  error?: string;
}
```

---

### 4. Application & Interview Management

#### `app/actions/applications.ts`

**`getApplications(filters?: ApplicationFilters)`**
- Gets applications with filters
- Returns: `{ success: boolean, applications?: Application[], error?: string }`

**`updateApplicationStatus(applicationId: string, status: ApplicationStatus)`**
- Updates application status
- Valid statuses: PENDING, REVIEWING, INTERVIEWED, OFFERED, ACCEPTED, REJECTED
- Returns: `{ success: boolean, error?: string }`

**`createApplication(jobId: string, teacherId: string)`**
- Creates new application
- Returns: `{ success: boolean, applicationId?: string, error?: string }`

#### `app/actions/interviews.ts`

**`scheduleInterview(applicationId: string, data: InterviewData)`**
- Schedules interview for application
- Sends email notifications
- Returns:
```typescript
{
  success: boolean;
  interview?: {
    id: string;
    scheduledAt: Date;
    type: 'VIDEO' | 'PHONE' | 'IN_PERSON';
    meetingLink?: string;
  };
  error?: string;
}
```

**`updateInterview(interviewId: string, data: InterviewUpdateData)`**
- Updates interview details
- Returns: `{ success: boolean, error?: string }`

**`completeInterview(interviewId: string, notes: string, outcome: string)`**
- Marks interview as completed with notes
- Returns: `{ success: boolean, error?: string }`

---

### 5. Dashboard & Analytics

#### `app/actions/dashboard.ts`

**`getDashboardData(role: 'TEACHER' | 'SCHOOL')`**
- Gets comprehensive dashboard data
- Returns role-specific metrics
- Returns:
```typescript
{
  success: boolean;
  data?: {
    stats: DashboardStats;
    recentActivity: Activity[];
    topJobs?: Job[];
    applications?: Application[];
  };
  error?: string;
}
```

#### `app/actions/dashboard-stats.ts`

**`getTeacherStats(teacherId: string)`**
- Gets teacher-specific statistics
- Returns: `{ success: boolean, stats?: TeacherStats, error?: string }`

**`getSchoolStats(schoolId: string)`**
- Gets school-specific statistics
- Returns: `{ success: boolean, stats?: SchoolStats, error?: string }`

#### `app/actions/analytics.ts`

**`getAnalyticsPredictions()`**
- Gets AI-powered hiring predictions
- Returns:
```typescript
{
  success: boolean;
  predictions?: Array<{
    id: string;
    predictionType: 'TIME_TO_HIRE' | 'ACCEPTANCE_PROBABILITY' | 'ENGAGEMENT_SCORE';
    predictionValue: number;
    confidence: number;
    validUntil: Date;
  }>;
  error?: string;
}
```

**`getAnalyticsSummary()`**
- Gets aggregated analytics summary
- Returns: `{ success: boolean, summary?: AnalyticsSummary, error?: string }`

#### `app/actions/ai-metrics.ts`

**`getAICostMetrics(startDate?: Date, endDate?: Date)`**
- Gets AI usage and cost metrics
- Tracks: API calls, tokens, costs by model
- Returns:
```typescript
{
  success: boolean;
  metrics?: {
    totalCost: number;
    totalCalls: number;
    totalTokens: number;
    byModel: Record<string, ModelMetrics>;
  };
  error?: string;
}
```

---

### 6. School Features (P0-P2)

#### `app/actions/schools.ts`

**`getSchoolProfile(schoolId: string)`**
- Gets school profile details
- Returns: `{ success: boolean, school?: School, error?: string }`

**`updateSchoolProfile(data: SchoolUpdateInput)`**
- Updates school profile
- Returns: `{ success: boolean, error?: string }`

#### `app/actions/email-templates.ts`

**`getEmailTemplates()`**
- Gets all email templates for school
- Returns: `{ success: boolean, templates?: EmailTemplate[], error?: string }`

**`createEmailTemplate(data: TemplateInput)`**
- Creates custom email template
- Supports placeholders: {{candidateName}}, {{jobTitle}}, etc.
- Returns: `{ success: boolean, templateId?: string, error?: string }`

**`updateEmailTemplate(templateId: string, data: TemplateInput)`**
- Updates email template
- Returns: `{ success: boolean, error?: string }`

**`deleteEmailTemplate(templateId: string)`**
- Deletes email template
- Returns: `{ success: boolean, error?: string }`

#### `app/actions/email-automation.ts`

**`getEmailAutomations()`**
- Gets all active email automations
- Returns: `{ success: boolean, automations?: EmailAutomation[], error?: string }`

**`createEmailAutomation(data: AutomationInput)`**
- Creates automated email workflow
- Triggers: APPLICATION_RECEIVED, APPLICATION_REVIEWED, INTERVIEW_SCHEDULED, etc.
- Returns: `{ success: boolean, automationId?: string, error?: string }`

**`toggleEmailAutomation(automationId: string, active: boolean)`**
- Enables/disables automation
- Returns: `{ success: boolean, error?: string }`

**`deleteEmailAutomation(automationId: string)`**
- Deletes automation
- Returns: `{ success: boolean, error?: string }`

#### `app/actions/bulk-actions.ts`

**`bulkUpdateApplications(applicationIds: string[], status: ApplicationStatus)`**
- Updates multiple applications at once
- Returns: `{ success: boolean, updated: number, error?: string }`

**`bulkSendEmails(applicationIds: string[], templateId: string)`**
- Sends emails to multiple candidates
- Returns: `{ success: boolean, sent: number, failed: number, error?: string }`

**`bulkArchiveApplications(applicationIds: string[])`**
- Archives multiple applications
- Returns: `{ success: boolean, archived: number, error?: string }`

#### `app/actions/saved-filters.ts`

**`getSavedFilters()`**
- Gets saved candidate filters
- Returns: `{ success: boolean, filters?: SavedFilter[], error?: string }`

**`createSavedFilter(data: FilterInput)`**
- Saves candidate filter
- Returns: `{ success: boolean, filterId?: string, error?: string }`

**`deleteSavedFilter(filterId: string)`**
- Deletes saved filter
- Returns: `{ success: boolean, error?: string }`

#### `app/actions/collaboration.ts`

**`getTeamMembers()`**
- Gets school team members
- Returns: `{ success: boolean, members?: TeamMember[], error?: string }`

**`inviteTeamMember(email: string, role: TeamRole)`**
- Invites team member with role
- Roles: ADMIN, RECRUITER, VIEWER
- Returns: `{ success: boolean, error?: string }`

**`updateTeamMemberRole(memberId: string, role: TeamRole)`**
- Updates team member role
- Returns: `{ success: boolean, error?: string }`

**`removeTeamMember(memberId: string)`**
- Removes team member
- Returns: `{ success: boolean, error?: string }`

#### `app/actions/dashboard-layout.ts`

**`getDashboardLayout()`**
- Gets customized dashboard layout
- Returns: `{ success: boolean, layout?: LayoutConfig, error?: string }`

**`updateDashboardLayout(config: LayoutConfig)`**
- Updates dashboard widget layout
- Returns: `{ success: boolean, error?: string }`

#### `app/actions/reports.ts`

**`generateReport(type: ReportType, filters?: ReportFilters)`**
- Generates recruitment report
- Types: HIRING_METRICS, CANDIDATE_PIPELINE, TIME_TO_HIRE, COST_PER_HIRE
- Returns:
```typescript
{
  success: boolean;
  report?: {
    id: string;
    type: ReportType;
    data: ReportData;
    generatedAt: Date;
    downloadUrl?: string;
  };
  error?: string;
}
```

---

### 7. Additional Features

#### `app/actions/alerts.ts`

**`getAlerts()`**
- Gets user alerts/notifications
- Returns: `{ success: boolean, alerts?: Alert[], error?: string }`

**`markAlertAsRead(alertId: string)`**
- Marks alert as read
- Returns: `{ success: boolean, error?: string }`

**`createAlert(data: AlertInput)`**
- Creates custom alert
- Returns: `{ success: boolean, alertId?: string, error?: string }`

#### `app/actions/activity.ts`

**`getActivityLog(filters?: ActivityFilters)`**
- Gets activity history
- Returns: `{ success: boolean, activities?: Activity[], error?: string }`

**`logActivity(type: ActivityType, metadata: object)`**
- Logs user activity
- Returns: `{ success: boolean, error?: string }`

#### `app/actions/saved-searches.ts`

**`getSavedSearches()`**
- Gets saved job searches
- Returns: `{ success: boolean, searches?: SavedSearch[], error?: string }`

**`createSavedSearch(data: SearchInput)`**
- Saves job search
- Returns: `{ success: boolean, searchId?: string, error?: string }`

**`deleteSavedSearch(searchId: string)`**
- Deletes saved search
- Returns: `{ success: boolean, error?: string }`

#### `app/actions/recommendations.ts`

**`getJobRecommendations(teacherId: string, limit?: number)`**
- Gets AI-powered job recommendations
- Uses vector similarity matching
- Returns:
```typescript
{
  success: boolean;
  recommendations?: Array<{
    job: Job;
    matchScore: number;
    reasoning: string;
  }>;
  error?: string;
}
```

#### `app/actions/reviews.ts`

**`createReview(targetId: string, targetType: 'SCHOOL' | 'TEACHER', rating: number, comment: string)`**
- Creates review
- Returns: `{ success: boolean, reviewId?: string, error?: string }`

**`getReviews(targetId: string, targetType: string)`**
- Gets reviews for entity
- Returns: `{ success: boolean, reviews?: Review[], error?: string }`

#### `app/actions/verification.ts`

**`requestVerification(type: 'CERTIFICATE' | 'DEGREE' | 'EXPERIENCE', documentUrl: string)`**
- Requests document verification
- Returns: `{ success: boolean, verificationId?: string, error?: string }`

**`getVerificationStatus(verificationId: string)`**
- Gets verification status
- Returns: `{ success: boolean, status?: VerificationStatus, error?: string }`

---

## API Routes

### 1. Authentication

#### `POST /api/auth/signup`
Creates new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "role": "TEACHER"
}
```

**Response:**
```json
{
  "success": true,
  "userId": "clx..."
}
```

#### `POST /api/auth/check-email`
Checks if email is available.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "available": true
}
```

---

### 2. File Upload

#### `POST /api/uploadthing`
Handles file uploads (videos, documents, images).

Uses UploadThing SDK for secure uploads.

**Supported File Types:**
- Videos: `.mp4`, `.mov`, `.avi` (max 100MB)
- Documents: `.pdf`, `.doc`, `.docx` (max 10MB)
- Images: `.jpg`, `.png`, `.gif` (max 5MB)

**Response:**
```json
{
  "url": "https://uploadthing.com/f/...",
  "key": "file-key",
  "name": "filename.mp4"
}
```

---

### 3. Cron Jobs

#### `GET /api/cron/job-alerts`
Automated job for sending job alerts to matching candidates.

Runs: Every 6 hours

**Authorization:** Requires cron secret in header
```
Authorization: Bearer ${process.env.CRON_SECRET}
```

**Response:**
```json
{
  "success": true,
  "alertsSent": 42,
  "timestamp": "2025-01-15T10:00:00Z"
}
```

---

### 4. Recruiter Setup

#### `POST /api/recruiter/setup`
Initial setup wizard for recruiters/schools.

**Request Body:**
```json
{
  "schoolName": "International School Tokyo",
  "country": "Japan",
  "website": "https://school.edu",
  "contactEmail": "hr@school.edu"
}
```

**Response:**
```json
{
  "success": true,
  "schoolId": "clx...",
  "setupComplete": true
}
```

---

## AI Services

Core AI services located in `lib/ai/`.

### 1. Video Analyzer (`lib/ai/video-analyzer.ts`)

**`analyzeTeacherVideo(videoUrl: string): Promise<VideoAnalysis>`**

Uses GPT-4o Vision API to analyze teacher profile videos.

**Analysis Output:**
- Teaching style assessment
- Personality traits identification
- Strengths and weaknesses
- Overall presentation score
- Profile completeness metrics
- Actionable feedback

**Cost:** ~$0.02 per video analysis

---

### 2. Embeddings Generator (`lib/ai/embeddings.ts`)

**`generateEmbedding(text: string): Promise<number[]>`**

Creates 1536-dimensional embeddings using OpenAI `text-embedding-3-small`.

**Use Cases:**
- Job description embeddings
- Teacher profile embeddings
- Semantic search
- Similarity matching

**Cost:** ~$0.00002 per 1000 tokens

**`batchGenerateEmbeddings(texts: string[]): Promise<number[][]>`**

Batch processing for multiple texts.

---

### 3. Email Generator (`lib/ai/email-generator.ts`)

**`generatePersonalizedEmail(params: EmailParams): Promise<string>`**

Uses Claude 3.5 Sonnet to generate personalized recruitment emails.

**Input:**
```typescript
interface EmailParams {
  candidateName: string;
  jobTitle: string;
  schoolName: string;
  matchReason: string;
  teacherProfile: TeacherProfile;
  jobDetails: Job;
}
```

**Features:**
- Personalized content based on match reasoning
- Professional tone
- Clear call-to-action
- Highlights relevant qualifications

**Cost:** ~$0.003 per email

---

### 4. Cost Tracker (`lib/ai/cost-tracker.ts`)

**`trackAPICall(params: CostTrackingParams): Promise<void>`**

Tracks AI API usage and costs.

**Tracked Metrics:**
- Model used (GPT-4o, Claude 3.5, embeddings)
- Token count (input + output)
- Cost calculation
- Timestamp
- User/organization

**`getCostReport(startDate: Date, endDate: Date): Promise<CostReport>`**

Generates cost report for date range.

---

### 5. Job Parser (`lib/ai/job-parser.ts`)

**`parseJobPosting(html: string, url: string): Promise<ParsedJob>`**

Extracts structured data from external job postings.

**Extraction:**
- Job title
- Description
- Requirements
- Salary range
- Location
- Benefits

**Sources Supported:**
- TES Jobs
- ESL Cafe
- Dave's ESL Cafe
- Generic job boards

---

## Database Services

Core database services located in `lib/db/`.

### 1. Vector Search (`lib/db/vector-search.ts`)

**`searchSimilarProfiles(embedding: number[], limit: number): Promise<SearchResult[]>`**

Finds similar teacher profiles using pgvector cosine similarity.

**Query:**
```sql
SELECT *, 1 - (embedding <=> $1::vector) AS similarity
FROM teacher_profiles
ORDER BY embedding <=> $1::vector
LIMIT $2
```

**Returns:**
```typescript
interface SearchResult {
  teacherId: string;
  similarity: number;
  profile: TeacherProfile;
}
```

---

### 2. Job Recommendations (`lib/db/job-recommendations.ts`)

**`getRecommendedJobs(teacherId: string, limit: number): Promise<JobRecommendation[]>`**

Finds matching jobs using hybrid approach:
1. Vector similarity search
2. Hard constraint filtering (location, salary)
3. Preference scoring
4. Visa eligibility check

**Scoring Algorithm:**
```
finalScore = (vectorSimilarity * 0.6) +
             (preferenceMatch * 0.3) +
             (experienceMatch * 0.1)
```

---

### 3. PGVector Check (`lib/db/check-pgvector.ts`)

**`ensurePGVectorExtension(): Promise<void>`**

Ensures pgvector extension is installed in database.

**`createVectorIndexes(): Promise<void>`**

Creates IVFFlat indexes for fast similarity search.

---

## Error Handling

All API responses follow consistent error format:

```typescript
interface ErrorResponse {
  success: false;
  error: string;
  code?: string;
  details?: object;
}
```

**Common Error Codes:**
- `AUTH_REQUIRED` - Authentication needed
- `FORBIDDEN` - Insufficient permissions
- `NOT_FOUND` - Resource not found
- `VALIDATION_ERROR` - Invalid input
- `RATE_LIMIT` - Too many requests
- `AI_ERROR` - AI service failure
- `DATABASE_ERROR` - Database operation failed

---

## Rate Limiting

### AI Services Rate Limits

**OpenAI API:**
- Embeddings: 3000 requests/min
- GPT-4o: 500 requests/min
- Automatic retry with exponential backoff

**Anthropic API:**
- Claude 3.5 Sonnet: 1000 requests/min
- Automatic retry with exponential backoff

### Server Actions Rate Limits

Rate limiting implemented per user/session:
- Authentication: 5 requests/min
- Video analysis: 10 requests/hour
- Email sending: 100 requests/hour
- General actions: 60 requests/min

---

## Caching Strategy

### Redis Cache (Upstash)

**Cached Data:**
- Video analysis results (TTL: 7 days)
- Match results (TTL: 1 hour)
- Embeddings (TTL: 30 days)
- Dashboard stats (TTL: 5 minutes)

**Cache Keys:**
```
video:analysis:{teacherId}
match:results:{jobId}
embeddings:job:{jobId}
embeddings:teacher:{teacherId}
stats:teacher:{teacherId}
stats:school:{schoolId}
```

**Cache Invalidation:**
- Profile updates → Clear related caches
- Job updates → Clear match caches
- Application status changes → Clear dashboard caches

---

## Webhook Events

### UploadThing Webhooks

**`POST /api/uploadthing/webhook`**

Handles upload completion events.

**Events:**
- `upload.completed` - File upload finished
- `upload.failed` - File upload failed

---

## Security

### Authentication

- NextAuth.js with credentials provider
- Bcrypt password hashing (10 rounds)
- Secure session tokens
- CSRF protection enabled

### Authorization

Role-based access control (RBAC):
- `TEACHER` - Can view jobs, apply, manage profile
- `SCHOOL` - Can post jobs, view candidates, manage applications
- `ADMIN` - Full system access

### Data Protection

- SQL injection prevention (Prisma ORM)
- XSS protection (React escaping)
- CORS configured for production domain
- Rate limiting on sensitive endpoints
- Environment variables for secrets

---

## Development

### Running Locally

```bash
# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local

# Run database migrations
npx prisma migrate dev

# Start development server
npm run dev
```

### Environment Variables

Required environment variables:

```env
# Database
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# NextAuth
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="http://localhost:3000"

# OpenAI
OPENAI_API_KEY="sk-..."

# Anthropic
ANTHROPIC_API_KEY="sk-ant-..."

# Upstash Redis
UPSTASH_REDIS_REST_URL="https://..."
UPSTASH_REDIS_REST_TOKEN="..."

# Resend (Email)
RESEND_API_KEY="re_..."

# UploadThing
UPLOADTHING_SECRET="sk_live_..."
UPLOADTHING_APP_ID="..."

# Cron
CRON_SECRET="..."
```

---

## API Versioning

Current version: **v1**

All APIs are currently unversioned. Future versions will use path-based versioning:
- `/api/v2/...`

Breaking changes will be communicated 30 days in advance.

---

## Support

For API questions or issues:
- GitHub Issues: https://github.com/your-org/aijobx/issues
- Email: support@globaleducatornexus.com
- Documentation: https://docs.globaleducatornexus.com

---

**Last Updated:** 2025-01-21
**API Version:** 1.0.0
