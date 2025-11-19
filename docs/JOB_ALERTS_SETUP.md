# Job Alerts Setup Guide

Complete guide to setting up and deploying the Job Alerts system for AI Job X.

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Configuration](#configuration)
- [Testing Locally](#testing-locally)
- [Deployment](#deployment)
- [Monitoring](#monitoring)
- [Troubleshooting](#troubleshooting)

## Overview

The Job Alerts system allows teachers to save job searches and receive email notifications when new matching jobs are posted.

### Features

- **4 Alert Frequencies**: Instant, Daily, Weekly, Never (save only)
- **Smart Matching**: Filter by country, subject, salary, benefits
- **Beautiful Emails**: Responsive HTML templates with job details
- **Efficient Delivery**: Batch processing with rate limiting
- **Privacy-First**: Pause/resume functionality, no tracking

### Architecture

```
┌─────────────────┐
│  Teacher saves  │
│     search      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐      ┌──────────────────┐
│  SavedSearch    │      │  Vercel Cron     │
│    (Database)   │◄─────┤  (Daily 9AM UTC) │
└────────┬────────┘      └──────────────────┘
         │
         ▼
┌─────────────────┐
│ Find matching   │
│   new jobs      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐      ┌──────────────────┐
│  Generate HTML  │─────►│   Resend API     │
│     email       │      │  (Send email)    │
└─────────────────┘      └──────────────────┘
```

## Prerequisites

### Required

1. **Resend Account** (Free tier available)
   - Sign up at [resend.com](https://resend.com)
   - Get API key from Dashboard > API Keys
   - Verify your domain (required for production)

2. **Database** (Already configured)
   - SavedSearch model migrated
   - Indexes created for performance

3. **Vercel Project** (for cron jobs)
   - Deploy to Vercel for automated cron scheduling
   - Or use alternative cron service (see below)

### Optional

- **Custom domain** for email (recommended for production)
- **Email analytics** via Resend dashboard

## Configuration

### 1. Environment Variables

Add to `.env.local` (development) and Vercel environment (production):

```bash
# Email Delivery
RESEND_API_KEY=re_123456789_YOUR_RESEND_API_KEY
FROM_EMAIL=jobs@yourdomain.com

# App URL
NEXT_PUBLIC_APP_URL=https://aijobx.com

# Cron Secret (generate with: openssl rand -base64 32)
CRON_SECRET=your-random-32-character-secret-here
```

### 2. Resend Domain Setup

#### Development (testing only)

Use Resend's test domain:
```bash
FROM_EMAIL=onboarding@resend.dev
```

**Note**: Test emails only work with verified addresses (add in Resend dashboard).

#### Production

1. Go to Resend Dashboard > Domains
2. Click "Add Domain"
3. Enter your domain (e.g., `aijobx.com`)
4. Add DNS records:
   ```
   Type: TXT
   Name: @ (or your domain)
   Value: [provided by Resend]

   Type: MX
   Name: @ (or your domain)
   Value: feedback-smtp.us-east-1.amazonses.com
   Priority: 10
   ```
5. Wait for verification (usually < 5 minutes)
6. Update `FROM_EMAIL` to use your domain:
   ```bash
   FROM_EMAIL=jobs@yourdomain.com
   ```

### 3. Database Migration

Ensure the SavedSearch table is created:

```bash
# Generate Prisma client
npm run db:generate

# Apply migration (if not already done)
npx prisma migrate deploy

# Verify table exists
npx prisma studio
# Check for SavedSearch model
```

### 4. Vercel Cron Configuration

The `vercel.json` file is already configured:

```json
{
  "crons": [
    {
      "path": "/api/cron/job-alerts",
      "schedule": "0 9 * * *"
    }
  ]
}
```

**Schedule**: Runs daily at 9:00 AM UTC
- **Daily alerts**: Sent every day at 9 AM UTC
- **Weekly alerts**: Sent only on Mondays at 9 AM UTC

**Timezone conversion**:
- 9 AM UTC = 6 PM KST (Seoul)
- 9 AM UTC = 5 AM EST (New York)
- 9 AM UTC = 2 AM PST (Los Angeles)

To change the schedule, update the cron expression:
```
0 9 * * *    # Daily at 9 AM UTC
0 */6 * * *  # Every 6 hours
0 0 * * 1    # Weekly on Mondays at midnight UTC
```

[Learn more about cron syntax](https://crontab.guru/)

## Testing Locally

### 1. Test Email Templates

Send a test email to verify Resend configuration:

```typescript
// Create a test script: scripts/test-email.ts
import { sendTestJobAlert } from '@/lib/email/job-alerts';

async function main() {
  const result = await sendTestJobAlert('your-email@example.com');
  console.log('Test email result:', result);
}

main();
```

Run:
```bash
npx tsx scripts/test-email.ts
```

Check your inbox for the test email.

### 2. Test Saved Search Creation

1. Start development server:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:3000/jobs`

3. Apply filters (country, subject, salary, etc.)

4. Click "Save This Search"

5. Configure alert settings:
   - Give it a name
   - Choose frequency (DAILY for testing)
   - Enable email alerts
   - Save

6. Verify in database:
   ```bash
   npx prisma studio
   # Navigate to SavedSearch table
   # Confirm record exists with correct filters
   ```

### 3. Test Cron Job Manually

#### Option A: Using curl

```bash
# Set your CRON_SECRET
export CRON_SECRET="your-secret-here"

# Trigger cron job
curl -X GET http://localhost:3000/api/cron/job-alerts \
  -H "Authorization: Bearer $CRON_SECRET"
```

#### Option B: Using Next.js API route

```bash
# Start dev server
npm run dev

# In another terminal:
curl http://localhost:3000/api/cron/job-alerts \
  -H "Authorization: Bearer your-secret-here"
```

#### Option C: Test specific saved search (POST endpoint)

```bash
curl -X POST http://localhost:3000/api/cron/job-alerts \
  -H "Authorization: Bearer your-secret-here" \
  -H "Content-Type: application/json" \
  -d '{
    "savedSearchId": "clx123456789"
  }'
```

Expected response:
```json
{
  "success": true,
  "savedSearchId": "clx123456789",
  "jobsFound": 5,
  "email": "teacher@example.com"
}
```

### 4. Test Complete Workflow

1. **Create test data**:
   ```sql
   -- Create a test job posting
   INSERT INTO "JobPosting" (
     "id", "employerId", "title", "schoolName",
     "country", "subject", "salaryMin", "status", "createdAt"
   ) VALUES (
     'test-job-1', 'employer-id', 'ESL Teacher',
     'Seoul Academy', 'South Korea', 'English as a Second Language',
     2500, 'ACTIVE', NOW()
   );
   ```

2. **Create saved search** (via UI or database)

3. **Trigger cron job** (see above)

4. **Check email inbox** for alert

5. **Verify database** was updated:
   ```sql
   SELECT "lastAlertSent", "lastMatchCount"
   FROM "SavedSearch"
   WHERE "id" = 'your-search-id';
   ```

## Deployment

### 1. Deploy to Vercel

```bash
# Ensure vercel.json is committed
git add vercel.json

# Deploy
vercel --prod

# Or push to GitHub (if auto-deploy is enabled)
git push origin main
```

### 2. Configure Environment Variables

In Vercel Dashboard > Settings > Environment Variables:

| Variable | Value | Environments |
|----------|-------|--------------|
| `RESEND_API_KEY` | `re_xxxxx` | Production, Preview |
| `FROM_EMAIL` | `jobs@yourdomain.com` | Production, Preview |
| `CRON_SECRET` | `[generate new]` | Production |
| `NEXT_PUBLIC_APP_URL` | `https://aijobx.com` | Production |

**Important**: Generate a new `CRON_SECRET` for production:
```bash
openssl rand -base64 32
```

### 3. Enable Cron Jobs in Vercel

Vercel automatically detects `vercel.json` and enables cron jobs.

To verify:
1. Go to Vercel Dashboard > Deployments
2. Click on your deployment
3. Go to "Cron Jobs" tab
4. You should see: `GET /api/cron/job-alerts` with schedule `0 9 * * *`

### 4. Test Production Cron

**Option A: Wait for scheduled time**
- Cron will run automatically at 9 AM UTC
- Check logs in Vercel Dashboard > Functions > /api/cron/job-alerts

**Option B: Manual trigger**
```bash
curl -X GET https://aijobx.com/api/cron/job-alerts \
  -H "Authorization: Bearer YOUR_PRODUCTION_CRON_SECRET"
```

### 5. Verify Email Delivery

1. Check Resend Dashboard > Logs
2. Look for sent emails
3. Check delivery status (delivered, bounced, etc.)
4. Review any errors

## Monitoring

### 1. Vercel Function Logs

View real-time logs:
```bash
vercel logs --follow
```

Or in Vercel Dashboard:
1. Go to Deployments > [Your deployment]
2. Click "Functions" tab
3. Find `/api/cron/job-alerts`
4. View invocations and logs

### 2. Resend Analytics

Monitor email delivery:
1. Go to Resend Dashboard > Analytics
2. View:
   - Delivery rate
   - Open rate (if tracking enabled)
   - Bounce rate
   - Spam complaints

### 3. Database Monitoring

Check saved search activity:

```sql
-- Active searches
SELECT COUNT(*) FROM "SavedSearch"
WHERE "isActive" = true AND "alertEmail" = true;

-- Recent alerts sent
SELECT "id", "lastAlertSent", "lastMatchCount", "alertFrequency"
FROM "SavedSearch"
WHERE "lastAlertSent" > NOW() - INTERVAL '24 hours'
ORDER BY "lastAlertSent" DESC;

-- Top performing searches (most matches)
SELECT "id", "lastMatchCount", "filters"
FROM "SavedSearch"
WHERE "lastMatchCount" > 0
ORDER BY "lastMatchCount" DESC
LIMIT 10;
```

### 4. Error Tracking

Common errors to monitor:

- **Email delivery failures**: Check Resend logs
- **Database query errors**: Check Vercel function logs
- **Rate limit errors**: Adjust batch size or delay
- **Authentication errors**: Verify CRON_SECRET

## Troubleshooting

### Emails Not Sending

**Check 1: Resend API Key**
```bash
# Test API key directly
curl https://api.resend.com/domains \
  -H "Authorization: Bearer YOUR_RESEND_API_KEY"

# Should return your domains, not 401 error
```

**Check 2: FROM_EMAIL Domain**
```bash
# Must be verified in Resend dashboard
# Go to Resend > Domains > Check status
```

**Check 3: Environment Variables**
```bash
# In Vercel Dashboard > Settings > Environment Variables
# Ensure all variables are set for Production
```

**Check 4: Resend Logs**
- Go to Resend Dashboard > Logs
- Look for rejected/failed emails
- Common issues:
  - Unverified domain
  - Invalid recipient email
  - Rate limit exceeded

### Cron Job Not Running

**Check 1: Vercel Configuration**
- Ensure `vercel.json` exists and is valid
- Go to Vercel Dashboard > Cron Jobs
- Verify schedule is shown

**Check 2: Function Timeout**
```json
// In vercel.json
{
  "crons": [...],
  "functions": {
    "app/api/cron/job-alerts/route.ts": {
      "maxDuration": 60
    }
  }
}
```

**Check 3: CRON_SECRET**
```bash
# Test authentication
curl https://aijobx.com/api/cron/job-alerts \
  -H "Authorization: Bearer WRONG_SECRET"

# Should return 401 Unauthorized
```

### No Jobs Found for Saved Search

**Debug saved search filters**:

```typescript
// In app/api/cron/job-alerts/route.ts, add logging:
console.log('Filters:', JSON.stringify(filters, null, 2));
console.log('WHERE clause:', JSON.stringify(whereClause, null, 2));
console.log('Jobs found:', jobs.length);
```

**Common issues**:
- Filters too restrictive (e.g., exact salary match)
- No new jobs since last alert
- Jobs exist but are INACTIVE or CLOSED

### Rate Limiting

If sending many emails, you may hit Resend's rate limits:

**Free Tier**: 100 emails/day
**Paid Tier**: Check your plan limits

**Solutions**:
1. Increase delay between emails:
   ```typescript
   // In lib/email/job-alerts.ts
   await new Promise((resolve) => setTimeout(resolve, 500)); // 500ms
   ```

2. Implement batch queue (advanced):
   - Use background job queue (e.g., BullMQ)
   - Process in smaller batches

3. Upgrade Resend plan

### Email Styling Issues

**Test in multiple clients**:
- Gmail (web, mobile)
- Outlook (web, desktop)
- Apple Mail
- Mobile devices

**Common fixes**:
- Inline CSS (already done in templates)
- Avoid CSS Grid/Flexbox (use tables for layout)
- Test responsive design
- Use web-safe fonts

**Tools**:
- [Litmus](https://litmus.com/) - Email testing
- [Email on Acid](https://www.emailonacid.com/) - Client preview
- Resend's built-in preview

## Advanced Configuration

### Custom Cron Schedule

Modify `vercel.json` for different schedules:

```json
{
  "crons": [
    {
      "path": "/api/cron/job-alerts",
      "schedule": "0 */4 * * *"
    }
  ]
}
```

Examples:
- `0 */4 * * *` - Every 4 hours
- `0 9,17 * * *` - Twice daily (9 AM & 5 PM UTC)
- `0 9 * * 1-5` - Weekdays only at 9 AM UTC
- `0 0 * * 0` - Sundays at midnight UTC

### Alternative Cron Services

If not using Vercel, you can use:

**1. GitHub Actions**
```yaml
# .github/workflows/job-alerts.yml
name: Job Alerts
on:
  schedule:
    - cron: '0 9 * * *'
jobs:
  run-alerts:
    runs-on: ubuntu-latest
    steps:
      - run: |
          curl -X GET ${{ secrets.APP_URL }}/api/cron/job-alerts \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}"
```

**2. Render Cron Jobs**
- Add cron job in `render.yaml`
- Configure schedule and endpoint

**3. EasyCron / Cron-Job.org**
- Free/paid external cron services
- Configure URL and headers

### Email Personalization

Enhance emails with more data:

```typescript
// In lib/email/job-alerts.ts
const personalizedGreeting = getTimeOfDayGreeting(recipientTimezone);
// "Good morning" / "Good afternoon" / "Good evening"

const jobRecommendations = await getAIRecommendations(teacherId, jobs);
// AI-powered job rankings
```

### Unsubscribe Handling

Implement one-click unsubscribe:

```typescript
// In email template
const unsubscribeUrl = `${APP_URL}/api/unsubscribe?id=${savedSearchId}&token=${generateToken(savedSearchId)}`;

// Create API route: app/api/unsubscribe/route.ts
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const token = searchParams.get('token');

  // Verify token, then:
  await prisma.savedSearch.update({
    where: { id },
    data: { isActive: false, alertEmail: false },
  });

  return new Response('Unsubscribed successfully');
}
```

## Production Checklist

Before going live:

- [ ] Resend domain verified
- [ ] Production environment variables set
- [ ] CRON_SECRET generated and secured
- [ ] Test email sent successfully
- [ ] Cron job scheduled in Vercel
- [ ] Manual cron trigger tested
- [ ] Email templates reviewed in multiple clients
- [ ] Database indexes created
- [ ] Error monitoring configured
- [ ] Rate limits understood and planned for
- [ ] Unsubscribe/pause links tested
- [ ] Privacy policy updated (if needed)

## Support

- **Resend Docs**: https://resend.com/docs
- **Vercel Cron Docs**: https://vercel.com/docs/cron-jobs
- **Project Repo**: [Your GitHub repo]
- **Email**: support@aijobx.com

---

**Last updated**: 2025-01-20
**Version**: 1.0.0
