# AI Agents Setup & Configuration Guide

Complete guide to set up and configure all three AI agents for the Global Educator Nexus platform.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Environment Variables](#environment-variables)
3. [Database Setup](#database-setup)
4. [AI Services Configuration](#ai-services-configuration)
5. [Agent-Specific Setup](#agent-specific-setup)
6. [Testing & Verification](#testing--verification)
7. [Deployment Checklist](#deployment-checklist)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Accounts & API Keys

| Service | Purpose | Cost | Sign Up URL |
|---------|---------|------|-------------|
| **OpenAI** | GPT-4o (video analysis) + Embeddings | ~$150/mo | https://platform.openai.com |
| **Anthropic** | Claude 3.5 (email generation) | ~$20/mo | https://console.anthropic.com |
| **Neon** | Serverless PostgreSQL + pgvector | Free tier OK | https://neon.tech |
| **Cloudflare R2** | Video storage | ~$5/mo | https://dash.cloudflare.com |
| **UploadThing** | Upload handling | Free tier OK | https://uploadthing.com |
| **Resend** | Email delivery | Free 100/day | https://resend.com |

### Development Environment

```bash
Node.js >= 18.17.0
npm >= 9.0.0
Git
```

---

## Environment Variables

### Create `.env.local` File

```bash
# Copy example environment file
cp .env.example .env.local
```

### Complete Configuration

```bash
# ============================================
# CORE APPLICATION
# ============================================
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# ============================================
# DATABASE (Neon PostgreSQL + pgvector)
# ============================================
DATABASE_URL=postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
DIRECT_URL=postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require

# ============================================
# AI SERVICES
# ============================================

# OpenAI (Agent 1: Video Analysis + Agent 2: Embeddings)
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Anthropic (Agent 2: Email Generation)
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# ============================================
# FILE STORAGE
# ============================================

# Cloudflare R2 (Video Storage)
R2_ACCOUNT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
R2_ACCESS_KEY_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
R2_SECRET_ACCESS_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
R2_BUCKET_NAME=educator-nexus-videos
R2_PUBLIC_URL=https://videos.yourdomain.com

# UploadThing (Upload Handler)
UPLOADTHING_SECRET=sk_live_REPLACE_WITH_YOUR_SECRET
UPLOADTHING_APP_ID=REPLACE_WITH_YOUR_APP_ID

# ============================================
# EMAIL DELIVERY
# ============================================

# Resend (Agent 2: Email Notifications)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
FROM_EMAIL=jobs@globaleducatornexus.com

# ============================================
# AUTHENTICATION
# ============================================

# Auth.js v5
AUTH_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx # Generate with: openssl rand -base64 32
AUTH_URL=http://localhost:3000

# OAuth Providers (Optional)
GOOGLE_CLIENT_ID=xxxxxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxxxxxxxxxxxxx
LINKEDIN_CLIENT_ID=xxxxxxxxxxxxxxxx
LINKEDIN_CLIENT_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# ============================================
# OPTIONAL: MONITORING & ANALYTICS
# ============================================

# Vercel Analytics (Production only)
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=xxxxxxxxxxxxxxxx

# Sentry Error Tracking
SENTRY_DSN=https://xxxxxx@xxxxxxx.ingest.sentry.io/xxxxxxx
```

---

## Database Setup

### Step 1: Create Neon Database

```bash
# 1. Go to https://neon.tech
# 2. Create new project: "educator-nexus"
# 3. Region: Choose closest to your users (e.g., us-east-2)
# 4. Copy connection string to DATABASE_URL
```

### Step 2: Enable pgvector Extension

```sql
-- Run this SQL in Neon SQL Editor
CREATE EXTENSION IF NOT EXISTS vector;

-- Verify installation
SELECT * FROM pg_extension WHERE extname = 'vector';
```

### Step 3: Run Prisma Migrations

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Seed initial data (optional)
npx prisma db seed
```

### Step 4: Create Vector Indexes

```sql
-- Optimize vector search performance
CREATE INDEX idx_teacher_embedding ON "TeacherProfile"
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

CREATE INDEX idx_job_embedding ON "JobPosting"
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 50);

-- GIN index for JSONB fields
CREATE INDEX idx_visa_status ON "TeacherProfile"
  USING GIN (visaStatus);

CREATE INDEX idx_video_analysis ON "TeacherProfile"
  USING GIN (videoAnalysis);
```

---

## AI Services Configuration

### OpenAI Setup

1. **Create Account**: https://platform.openai.com
2. **Generate API Key**:
   - Go to API Keys section
   - Create new secret key
   - Copy to `OPENAI_API_KEY`
3. **Set Usage Limits** (recommended):
   - Go to Settings > Limits
   - Set monthly budget: $200
   - Email alerts at 75% and 90%

4. **Test Connection**:
```bash
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```

### Anthropic Setup

1. **Create Account**: https://console.anthropic.com
2. **Generate API Key**:
   - Go to API Keys
   - Create new key
   - Copy to `ANTHROPIC_API_KEY`
3. **Test Connection**:
```bash
curl https://api.anthropic.com/v1/messages \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d '{"model":"claude-3-5-sonnet-20241022","max_tokens":100,"messages":[{"role":"user","content":"Hello"}]}'
```

### Cloudflare R2 Setup

1. **Create R2 Bucket**:
   ```bash
   # In Cloudflare Dashboard:
   # 1. Go to R2
   # 2. Create bucket: "educator-nexus-videos"
   # 3. Set public access (optional, for CDN)
   ```

2. **Generate API Tokens**:
   ```bash
   # 1. Go to R2 > Manage R2 API Tokens
   # 2. Create API token with:
   #    - Permissions: Read & Write
   #    - Bucket: educator-nexus-videos
   # 3. Copy Account ID, Access Key ID, Secret Access Key
   ```

3. **Configure CORS** (if using direct uploads):
   ```json
   [
     {
       "AllowedOrigins": ["http://localhost:3000", "https://yourdomain.com"],
       "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
       "AllowedHeaders": ["*"],
       "MaxAgeSeconds": 3000
     }
   ]
   ```

### UploadThing Setup

1. **Create Account**: https://uploadthing.com
2. **Create App**:
   - App name: "Global Educator Nexus"
   - Framework: Next.js 15
3. **Configure**:
   ```bash
   # Copy secret and app ID to .env.local
   UPLOADTHING_SECRET=sk_live_...
   UPLOADTHING_APP_ID=...
   ```

4. **Create File Router** (already done in `/app/api/uploadthing/core.ts`)

### Resend Setup

1. **Create Account**: https://resend.com
2. **Add Domain**:
   ```bash
   # 1. Go to Domains
   # 2. Add: globaleducatornexus.com
   # 3. Add DNS records:
   #    - MX record
   #    - TXT record (SPF)
   #    - CNAME record (DKIM)
   ```

3. **Generate API Key**:
   ```bash
   # Go to API Keys > Create
   # Name: "Production Outreach"
   # Permissions: Full Access
   ```

4. **Test Email**:
   ```bash
   curl -X POST https://api.resend.com/emails \
     -H "Authorization: Bearer $RESEND_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{
       "from": "test@globaleducatornexus.com",
       "to": "your-email@example.com",
       "subject": "Test Email",
       "html": "<p>Hello from Resend!</p>"
     }'
   ```

---

## Agent-Specific Setup

### Agent 1: AI Screener

**1. Verify Video Upload Flow**:
```bash
# Start development server
npm run dev

# Navigate to: http://localhost:3000/profile/edit
# Upload a test video (max 100MB)
# Check UploadThing dashboard for upload
```

**2. Test Video Analysis**:
```typescript
// test/agent1.test.ts
import { analyzeVideo } from '@/lib/ai/video-analyzer';

const result = await analyzeVideo('https://your-r2-url.com/test-video.mp4');
console.log('Analysis result:', result);
```

**3. Expected Output**:
```json
{
  "accent_type": "North American",
  "accent_clarity_score": 8,
  "energy_level": "High",
  "energy_score": 9,
  "professionalism_score": 7,
  "technical_quality_score": 6,
  "overall_score": 78,
  "key_strengths": [
    "Excellent energy and enthusiasm",
    "Clear communication"
  ],
  "improvement_areas": [
    "Improve lighting quality"
  ],
  "summary": "Strong candidate with excellent energy...",
  "recommended_for_roles": ["Elementary", "ESL"],
  "confidence_level": 92
}
```

### Agent 2: Autonomous Headhunter

**1. Generate Test Embeddings**:
```bash
# Create a test script: scripts/test-embeddings.ts
import { generateTeacherEmbedding, generateJobEmbedding } from '@/lib/ai/embeddings';

const teacherEmbed = await generateTeacherEmbedding({
  subjects: ['Mathematics', 'Physics'],
  yearsExperience: 5,
  certifications: ['TEFL', 'CELTA'],
  preferredCountries: ['South Korea', 'Japan'],
  teachingStrengths: 'Engaging lessons, student-centered approach'
});

console.log('Teacher embedding length:', teacherEmbed.length); // Should be 1536
```

**2. Test Vector Search**:
```sql
-- In Neon SQL Editor, verify pgvector is working:
SELECT
  id,
  firstName,
  1 - (embedding <=> '[0.1, 0.2, ...]'::vector) AS similarity
FROM "TeacherProfile"
WHERE embedding IS NOT NULL
ORDER BY similarity DESC
LIMIT 5;
```

**3. Test Email Generation**:
```typescript
// test/agent2-email.test.ts
import { generateOutreachEmail } from '@/lib/ai/email-generator';

const email = await generateOutreachEmail(
  {
    firstName: 'Sarah',
    lastName: 'Johnson',
    subjects: ['English', 'ESL'],
    yearsExperience: 3,
    preferredCountries: ['South Korea'],
    minSalaryUSD: 2000
  },
  {
    title: 'ESL Teacher',
    schoolName: 'Seoul International School',
    isAnonymous: false,
    city: 'Seoul',
    country: 'South Korea',
    salaryUSD: 2300,
    benefits: 'Housing, flight, insurance'
  },
  ['Interested in South Korea', '3+ years experience'],
  0.92
);

console.log('Email:', email);
```

### Agent 3: Visa Guard

**1. Test Visa Checker**:
```typescript
// test/agent3.test.ts
import { checkVisaEligibility } from '@/lib/visa/checker';

const result = checkVisaEligibility(
  {
    citizenship: 'US',
    degreeLevel: 'BA',
    yearsExperience: 3,
    criminalRecord: 'clean',
    age: 28,
    hasTEFL: true
  },
  'South Korea'
);

console.log('Visa check:', result);
// Expected: { eligible: true, ... }
```

**2. Verify All Countries**:
```typescript
import { checkAllCountries } from '@/lib/visa/checker';

const allStatuses = checkAllCountries(teacherProfile);
console.log('Eligible countries:', Object.keys(allStatuses).filter(c => allStatuses[c].eligible));
```

**3. Test Application Validation**:
```bash
# In browser:
# 1. Go to a job posting
# 2. Click "Apply Now"
# 3. Verify modal appears if ineligible
# 4. Check console for validation logs
```

---

## Testing & Verification

### End-to-End Test

```bash
# 1. Create a test teacher account
# 2. Complete profile with video
# 3. Wait for AI analysis (check email)
# 4. Create a test job posting (as recruiter)
# 5. Check if matching emails sent
# 6. Try to apply to various countries
# 7. Verify visa blocking works
```

### Unit Tests

```bash
# Run all tests
npm run test

# Run agent-specific tests
npm run test -- agent1
npm run test -- agent2
npm run test -- agent3
```

### Performance Tests

```bash
# Load test video analysis
npm run test:load -- video-analysis --concurrent=10

# Load test vector search
npm run test:load -- vector-search --profiles=10000

# Load test visa validation
npm run test:load -- visa-check --concurrent=100
```

---

## Deployment Checklist

### Pre-deployment

- [ ] All environment variables set in production
- [ ] Database migrations run successfully
- [ ] Vector indexes created
- [ ] API keys tested and working
- [ ] Domain verified for email sending
- [ ] R2 bucket configured with public access
- [ ] Rate limits configured for AI APIs

### Production Optimizations

```bash
# 1. Enable production logging
NEXT_PUBLIC_LOG_LEVEL=info

# 2. Configure caching
REDIS_URL=redis://...  # For result caching

# 3. Set up monitoring
SENTRY_DSN=...
VERCEL_ANALYTICS_ID=...

# 4. Configure autoscaling
# In Vercel dashboard:
# - Functions: 10s timeout, 1024MB memory
# - Edge: Enable for static assets
```

### Health Checks

```typescript
// app/api/health/route.ts
export async function GET() {
  const checks = {
    database: await checkDatabase(),
    openai: await checkOpenAI(),
    anthropic: await checkAnthropic(),
    r2: await checkR2(),
    resend: await checkResend()
  };

  const allHealthy = Object.values(checks).every(c => c.healthy);

  return Response.json(
    { status: allHealthy ? 'healthy' : 'degraded', checks },
    { status: allHealthy ? 200 : 503 }
  );
}
```

---

## Troubleshooting

### Agent 1: Video Analysis Issues

**Problem**: "Video analysis timeout"
```bash
Solution:
1. Check video file size (<100MB)
2. Verify R2 URL is publicly accessible
3. Increase OpenAI timeout in lib/ai/video-analyzer.ts:
   maxTokens: 2000 (instead of 1500)
```

**Problem**: "Low accuracy scores"
```bash
Solution:
1. Review system prompt in video-analyzer.ts
2. Check temperature setting (should be 0.3 for consistency)
3. Verify video quality (min 480p)
```

### Agent 2: Matching Issues

**Problem**: "No matches found"
```bash
Solution:
1. Check if embeddings are generated:
   SELECT COUNT(*) FROM "TeacherProfile" WHERE embedding IS NOT NULL;
2. Lower similarity threshold (try 0.75 instead of 0.85)
3. Verify pgvector extension is installed
```

**Problem**: "Emails not sending"
```bash
Solution:
1. Check Resend dashboard for errors
2. Verify domain DNS records
3. Check rate limits (100/day on free tier)
4. Review email content for spam triggers
```

### Agent 3: Visa Validation Issues

**Problem**: "Visa status always returns false"
```bash
Solution:
1. Check if calculateAllVisaStatuses() was called
2. Verify profile fields are populated (not null)
3. Review visa rules in lib/visa/rules.ts
4. Check cache invalidation (visaLastCheckedAt)
```

**Problem**: "Rules out of date"
```bash
Solution:
1. Update VISA_RULES in lib/visa/rules.ts
2. Run batch re-calculation:
   npm run script -- batch-recalculate-visa
3. Update lastUpdated field in rules
```

---

## Monitoring & Maintenance

### Daily Checks

```bash
# Check AI API costs
- OpenAI Dashboard > Usage
- Anthropic Console > Usage
- Target: <$10/day

# Check email delivery
- Resend Dashboard > Emails
- Open rate target: >25%
- Bounce rate target: <5%

# Check error logs
- Sentry Dashboard
- Critical errors: 0
- Warning threshold: <10/hour
```

### Weekly Maintenance

```bash
# Update visa rules if regulations change
# Review AI prompt effectiveness
# Analyze match quality metrics
# Optimize vector search performance
```

### Monthly Tasks

```bash
# Review and optimize costs
# Update AI model versions
# Rebuild vector indexes
# Audit visa rule accuracy
```

---

## Support & Resources

### Documentation
- Next.js: https://nextjs.org/docs
- Prisma: https://www.prisma.io/docs
- pgvector: https://github.com/pgvector/pgvector
- Vercel AI SDK: https://sdk.vercel.ai/docs

### API References
- OpenAI: https://platform.openai.com/docs
- Anthropic: https://docs.anthropic.com
- Resend: https://resend.com/docs

### Community
- Discord: [Your Discord invite]
- GitHub Issues: [Your repo]
- Email: dev@globaleducatornexus.com

---

## Next Steps

After setup is complete:

1. ✅ Review specification/Specification.md for detailed architecture
2. ✅ Read docs/ARCHITECTURE.md for data flow diagrams
3. ✅ Test each agent individually before integration
4. ✅ Deploy to staging environment first
5. ✅ Run load tests before production launch
6. ✅ Set up monitoring and alerts
7. ✅ Create runbook for incident response

**Ready to launch? Good luck! 🚀**
