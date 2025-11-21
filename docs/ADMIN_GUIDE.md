# Global Educator Nexus - Admin Guide

## Administrator Documentation

This guide is for platform administrators who manage the Global Educator Nexus system, monitor operations, and ensure smooth platform performance.

## Table of Contents

1. [Admin Access & Setup](#admin-access--setup)
2. [Dashboard Overview](#dashboard-overview)
3. [User Management](#user-management)
4. [Content Moderation](#content-moderation)
5. [AI Systems Monitoring](#ai-systems-monitoring)
6. [Database Management](#database-management)
7. [Analytics & Reporting](#analytics--reporting)
8. [System Configuration](#system-configuration)
9. [Security & Compliance](#security--compliance)
10. [Troubleshooting](#troubleshooting)
11. [Backup & Recovery](#backup--recovery)
12. [Performance Optimization](#performance-optimization)

---

## Admin Access & Setup

### Creating an Admin Account

Admin accounts must be created via direct database access or by existing admins.

**Via Database (Initial Setup):**

```bash
npm run db:create-admin
```

This prompts for:
- Email
- Password
- Name

**Via Admin Panel (Existing Admin):**

1. Log in as admin
2. Go to "Admin" → "Users"
3. Click "Create Admin User"
4. Enter details
5. Set role to ADMIN
6. Send invitation

### Admin Login

1. Navigate to `/admin/login`
2. Enter admin credentials
3. Complete 2FA if enabled (recommended)
4. Access admin dashboard

### Admin Permissions

Admins have full platform access:
- View all users (teachers, schools, admins)
- Edit/delete any content
- Access analytics and logs
- Modify system settings
- Manage billing
- Run AI operations manually
- Export data
- Access database console

---

## Dashboard Overview

### Admin Dashboard

Located at: `/admin/dashboard`

**Key Metrics (Top Row):**
- Total Users (by role)
- Active Jobs
- Total Applications (this month)
- AI API Costs (this month)
- System Health Status

**Charts:**
- User Growth (line chart)
- Applications by Status (pie chart)
- AI Usage by Model (bar chart)
- Revenue Trends (line chart)

**Recent Activity:**
- New user registrations
- Jobs posted
- Applications submitted
- Errors/warnings
- AI operations

**Quick Actions:**
- Create Admin User
- Run Database Backup
- Clear Cache
- Generate Report
- View System Logs

---

## User Management

### Viewing All Users

**Access:** Admin → Users

**Filters:**
- Role (TEACHER, SCHOOL, ADMIN)
- Registration date
- Active/Inactive
- Email verified
- Subscription status

**User List Columns:**
- ID
- Email
- Name
- Role
- Created Date
- Last Login
- Status
- Actions

### User Details

Click any user to view:

**Profile Information:**
- Full profile data
- Uploaded documents
- Video profile (if teacher)
- Job postings (if school)
- Applications (if teacher)
- Activity history

**Account Status:**
- Email verified
- Active/suspended
- Subscription tier
- Payment history

**Actions:**
- Edit profile
- Change role
- Suspend account
- Delete account
- Reset password
- Send notification
- View activity log

### Changing User Roles

**Use Case:** Convert a school account to admin, or fix incorrect role.

**Steps:**
1. Find user
2. Click "Edit"
3. Change role dropdown
4. Confirm change
5. User is notified via email

**Important:** Changing role affects permissions immediately.

### Suspending Users

**Reasons:**
- Policy violations
- Fraudulent activity
- Payment issues
- Reported content

**Process:**
1. User Details → "Suspend Account"
2. Select reason
3. Add internal notes
4. Set suspension duration (temporary/permanent)
5. Notify user (optional)
6. Confirm

**Effects:**
- User cannot log in
- Active jobs/applications frozen
- No new activity allowed
- Data preserved

### Deleting Users

**Caution:** This is permanent and cannot be undone.

**GDPR Compliance:**
- User data export offered first
- Anonymize instead of delete when possible
- Log deletion request

**Process:**
1. User Details → "Delete Account"
2. Review dependencies:
   - Active jobs
   - Pending applications
   - Financial transactions
3. Choose:
   - Hard delete (complete removal)
   - Soft delete (anonymize data)
4. Enter admin password to confirm
5. Execute deletion

**Soft Delete (Recommended):**
- Email → deleted_user_XXX@example.com
- Name → "Deleted User"
- Profile cleared
- Relationships preserved for data integrity

### Bulk User Actions

**Select Multiple Users:**
- Checkboxes in user list
- Filter criteria (e.g., "inactive >90 days")

**Actions:**
- Send mass notification
- Export to CSV
- Change status
- Apply tags

---

## Content Moderation

### Reviewing Reported Content

**Content Types:**
- Job postings
- Teacher profiles
- Messages
- Reviews

**Moderation Queue:**

Access: Admin → Moderation → Queue

**Each Item Shows:**
- Content type
- Reporter
- Reason
- Content preview
- Date reported
- Status (PENDING, REVIEWING, RESOLVED)

**Actions:**
1. **Approve:** Content is fine, dismiss report
2. **Edit:** Modify content to comply
3. **Remove:** Delete violating content
4. **Suspend User:** Content + account violation
5. **Request Changes:** Ask user to modify

### Job Posting Review

Some job postings may be flagged:
- Suspicious salary (too low/high)
- Inappropriate content
- Discriminatory language
- Scam indicators

**Review Process:**
1. Read full job description
2. Check school profile/history
3. Verify contact information
4. Research school online
5. Decision:
   - Approve
   - Request edits
   - Remove
   - Suspend school account

### Profile Moderation

**Red Flags:**
- Fake credentials
- Stock photos
- Inconsistent information
- Suspicious patterns

**Verification:**
- Cross-reference documents
- Check certificate validity
- Reverse image search photos
- Contact university if needed

### Automated Moderation

AI pre-filters content for:
- Profanity
- Personal contact info in public fields
- Spam patterns
- Suspicious links

**Settings:** Admin → Settings → Moderation

**Configure:**
- Auto-flag threshold
- Auto-reject rules
- Notification settings

---

## AI Systems Monitoring

### AI Agents Overview

**Agent 1: AI Screener (Video Analyzer)**
- Model: GPT-4o Vision
- Function: Analyze teacher profile videos
- Avg Cost per Request: $0.02
- Avg Duration: 30-60 seconds

**Agent 2: Autonomous Headhunter (RAG Matching)**
- Models: OpenAI Embeddings + Claude 3.5 Sonnet
- Function: Semantic job matching + personalized emails
- Avg Cost per Match: $0.05-$0.10
- Avg Duration: 45 seconds

**Agent 3: Visa Guard**
- Model: Rule-based (no API cost)
- Function: Visa eligibility checking
- Cost: $0
- Duration: <1 second

### AI Cost Tracking

**Access:** Admin → AI → Cost Tracker

**Metrics:**
- Total costs (today, this week, this month)
- Costs by model:
  - GPT-4o: $XXX
  - Claude 3.5 Sonnet: $XXX
  - Embeddings: $XXX
- Costs by operation:
  - Video analysis: $XXX
  - Matching: $XXX
  - Email generation: $XXX
- Cost per user/organization
- Token usage statistics

**Graphs:**
- Daily cost trend
- Cost breakdown by model
- Cost per AI agent
- Top spending schools

### Setting Cost Alerts

**Purpose:** Get notified when AI costs exceed threshold.

**Setup:**
1. Admin → AI → Alerts
2. Create new alert
3. Configure:
   - Threshold: $500/day
   - Recipients: admin@example.com
   - Frequency: Immediate
4. Save

**Alert Types:**
- Daily cost exceeds $X
- Single request costs >$Y
- Unusual spike detected
- Model API errors

### AI Operation Logs

**Access:** Admin → AI → Operation Logs

**View:**
- Timestamp
- Operation type
- Model used
- Input tokens
- Output tokens
- Cost
- Duration
- User/School
- Status (success/error)
- Error message (if any)

**Filters:**
- Date range
- Operation type
- Model
- Status
- User/School

**Export:**
- CSV format
- For accounting/auditing

### Manually Running AI Operations

**Use Cases:**
- Testing new features
- Debugging issues
- Backfilling data

**Video Analysis:**
1. Admin → AI → Video Analyzer
2. Enter teacher ID or video URL
3. Run analysis
4. View results
5. Optionally save to profile

**Matching:**
1. Admin → AI → Matcher
2. Enter job ID
3. Set parameters
4. Run match
5. Review results
6. Optionally send emails

**Email Generation:**
1. Admin → AI → Email Generator
2. Enter job ID + teacher ID
3. Generate preview
4. Edit if needed
5. Send or save template

### Monitoring API Rate Limits

**OpenAI Limits:**
- Embeddings: 3000 req/min
- GPT-4o: 500 req/min

**Anthropic Limits:**
- Claude 3.5: 1000 req/min

**Current Usage:**
Admin → AI → Rate Limits

**Shows:**
- Requests per minute (current)
- Peak requests per minute (today)
- Rate limit utilization (%)
- Throttled requests (count)

**Actions:**
- Implement request queuing
- Upgrade API tier
- Distribute load across accounts

---

## Database Management

### Database Overview

**Access:** Admin → Database

**Platform:** Neon PostgreSQL
**ORM:** Prisma

**Key Tables:**
- users
- teacher_profiles
- schools
- jobs
- applications
- interviews
- email_templates
- email_automations
- ai_cost_tracking
- match_cache

**Vector Extension:**
- pgvector (for embeddings)
- Dimension: 1536

### Viewing Database Stats

**Metrics:**
- Total records by table
- Database size
- Connection count
- Query performance
- Index usage
- Cache hit ratio

### Running Migrations

**Production Migration Process:**

```bash
# 1. Backup database first
npm run db:backup

# 2. Run migration
npx prisma migrate deploy

# 3. Verify
npx prisma migrate status

# 4. Generate Prisma client
npx prisma generate
```

**Safety Checks:**
- Always backup before migration
- Test in staging first
- Run during low-traffic hours
- Monitor for errors
- Have rollback plan ready

### Database Console

**Access:** Admin → Database → Console

**Caution:** Direct database access. Use with care.

**Common Queries:**

**Find user by email:**
```sql
SELECT * FROM users WHERE email = 'user@example.com';
```

**Check job statistics:**
```sql
SELECT
  COUNT(*) as total_jobs,
  COUNT(*) FILTER (WHERE active = true) as active_jobs,
  COUNT(*) FILTER (WHERE "createdAt" > NOW() - INTERVAL '30 days') as jobs_last_30_days
FROM jobs;
```

**AI cost by day:**
```sql
SELECT
  DATE(timestamp) as date,
  SUM(cost) as total_cost,
  COUNT(*) as operations
FROM ai_cost_tracking
GROUP BY DATE(timestamp)
ORDER BY date DESC
LIMIT 30;
```

**Top spending schools:**
```sql
SELECT
  s.name,
  SUM(c.cost) as total_cost,
  COUNT(c.id) as operations
FROM ai_cost_tracking c
JOIN schools s ON s."userId" = c."userId"
WHERE c.timestamp > NOW() - INTERVAL '30 days'
GROUP BY s.name
ORDER BY total_cost DESC
LIMIT 10;
```

### Vector Search Monitoring

**Check pgvector extension:**
```sql
SELECT * FROM pg_extension WHERE extname = 'vector';
```

**Analyze embedding performance:**
```sql
EXPLAIN ANALYZE
SELECT *, 1 - (embedding <=> '[0.1, 0.2, ...]'::vector) AS similarity
FROM teacher_profiles
ORDER BY embedding <=> '[0.1, 0.2, ...]'::vector
LIMIT 10;
```

**Rebuild vector indexes:**
```sql
REINDEX INDEX teacher_profiles_embedding_idx;
REINDEX INDEX jobs_embedding_idx;
```

---

## Analytics & Reporting

### Platform Analytics

**Access:** Admin → Analytics

**Overview Dashboard:**
- User growth trends
- Application conversion funnel
- Job posting activity
- Revenue metrics
- Engagement scores

### User Analytics

**Metrics:**
- Daily Active Users (DAU)
- Monthly Active Users (MAU)
- User retention (cohort analysis)
- Churn rate
- Registration sources

**Segmentation:**
- By role (teacher/school)
- By country
- By subscription tier
- By activity level

### Job Market Analytics

**Insights:**
- Most in-demand subjects
- Popular countries
- Salary trends
- Application-to-hire ratio
- Time-to-fill by position

### AI Performance Analytics

**Metrics:**
- Match accuracy (% accepted matches)
- Video analysis completion rate
- Email response rate
- Cost per successful hire

### Generating Reports

**Report Types:**

1. **Executive Summary**
   - High-level KPIs
   - Month-over-month growth
   - Revenue summary
   - AI ROI

2. **Financial Report**
   - Revenue by tier
   - AI costs breakdown
   - Profit margins
   - Payment failures

3. **Operational Report**
   - System uptime
   - Error rates
   - API performance
   - Database health

4. **User Engagement Report**
   - Active users
   - Feature usage
   - Session duration
   - Conversion rates

**Generating:**
1. Admin → Reports
2. Select report type
3. Choose date range
4. Apply filters
5. Generate
6. Export (PDF/Excel)
7. Schedule recurring (optional)

---

## System Configuration

### Environment Variables

**Critical Variables:**

**Database:**
```env
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
```

**Authentication:**
```env
NEXTAUTH_SECRET="..." (change periodically)
NEXTAUTH_URL="https://aijobx.vercel.app"
```

**AI Services:**
```env
OPENAI_API_KEY="sk-..."
ANTHROPIC_API_KEY="sk-ant-..."
```

**Email:**
```env
RESEND_API_KEY="re_..."
```

**Caching:**
```env
UPSTASH_REDIS_REST_URL="https://..."
UPSTASH_REDIS_REST_TOKEN="..."
```

**File Upload:**
```env
UPLOADTHING_SECRET="sk_live_..."
UPLOADTHING_APP_ID="..."
```

**Rotating Secrets:**

1. Generate new secret
2. Update in Vercel environment
3. Redeploy
4. Verify functionality
5. Remove old secret

### Feature Flags

**Access:** Admin → Settings → Feature Flags

**Available Flags:**
- `ENABLE_VIDEO_ANALYSIS` - Toggle video AI
- `ENABLE_AI_MATCHING` - Toggle matching system
- `ENABLE_EMAIL_AUTOMATION` - Toggle automations
- `ENABLE_ANALYTICS` - Toggle analytics features
- `MAINTENANCE_MODE` - Put site in maintenance

**Per-Role Flags:**
- `TEACHER_APPLICATIONS_ENABLED`
- `SCHOOL_JOB_POSTING_ENABLED`
- `BULK_ACTIONS_ENABLED`

### Email Configuration

**SMTP Settings:**

**Provider:** Resend
**From Address:** noreply@globaleducatornexus.com
**From Name:** Global Educator Nexus

**Templates:** Managed in `components/emails/`

**Testing Email:**
1. Admin → Settings → Email
2. Send test email
3. Check inbox
4. Verify formatting

### Cache Configuration

**Redis (Upstash):**

**Cache Keys & TTL:**
- Video analysis: 7 days
- Match results: 1 hour
- Embeddings: 30 days
- Dashboard stats: 5 minutes
- Session data: 24 hours

**Manual Cache Clear:**
1. Admin → System → Cache
2. Select cache type or clear all
3. Confirm
4. Verify functionality

**Cache Stats:**
- Hit rate
- Miss rate
- Memory usage
- Eviction count

---

## Security & Compliance

### Security Best Practices

**1. Access Control:**
- Use strong admin passwords
- Enable 2FA for all admins
- Rotate secrets quarterly
- Limit admin accounts

**2. Data Protection:**
- Encrypt sensitive data at rest
- Use HTTPS everywhere
- Sanitize user inputs
- Implement CORS properly

**3. Monitoring:**
- Review audit logs weekly
- Monitor failed login attempts
- Track suspicious activity
- Set up alerting

### Audit Logs

**Access:** Admin → Security → Audit Logs

**Logged Events:**
- Admin logins
- User role changes
- Content deletions
- Settings changes
- Data exports
- Database queries

**Log Entry:**
```
Timestamp: 2025-01-21 14:30:45 UTC
Admin: admin@example.com
Action: USER_ROLE_CHANGE
Target: teacher@example.com
Details: Changed role from TEACHER to SCHOOL
IP: 192.168.1.100
```

**Retention:** 90 days (configurable)

**Export Logs:**
- Date range selection
- CSV format
- For compliance audits

### GDPR Compliance

**User Data Rights:**

**1. Right to Access:**
- User requests data export
- Admin → Users → Export Data
- Generates JSON file with all user data
- Delivered within 30 days

**2. Right to Deletion:**
- User requests account deletion
- Admin → Users → Delete Account
- Soft delete (anonymize) or hard delete
- Confirm within 30 days

**3. Right to Portability:**
- Export user data in machine-readable format
- Include all profile, applications, messages

**4. Right to Rectification:**
- Users can edit own data
- Or request admin assistance

**Data Processing Agreement:**
- Review annually
- Update privacy policy
- Log consent timestamps

### Security Incidents

**Incident Response Plan:**

**1. Detection:**
- Automated alerts
- User reports
- Security scans

**2. Assessment:**
- Severity level (Low/Medium/High/Critical)
- Impact scope
- Data affected

**3. Containment:**
- Isolate affected systems
- Revoke compromised credentials
- Block malicious IPs

**4. Investigation:**
- Review logs
- Identify attack vector
- Document timeline

**5. Recovery:**
- Apply security patches
- Restore from backup if needed
- Reset passwords

**6. Communication:**
- Notify affected users (if required by law)
- Update security team
- Document incident

**7. Post-Mortem:**
- Root cause analysis
- Preventive measures
- Update security policies

---

## Troubleshooting

### Common Issues

**Issue 1: Users can't log in**

**Symptoms:**
- Authentication failures
- "Invalid credentials" errors

**Diagnosis:**
1. Check NextAuth logs
2. Verify database connection
3. Test with known valid credentials

**Solutions:**
- Reset user password
- Clear session cookies
- Check NEXTAUTH_SECRET
- Verify database user table

**Issue 2: AI operations failing**

**Symptoms:**
- Video analysis errors
- Matching timeouts
- Email generation failures

**Diagnosis:**
1. Check AI operation logs
2. Verify API keys
3. Check rate limits
4. Test API connectivity

**Solutions:**
- Rotate API keys
- Upgrade API tier
- Implement retry logic
- Check error messages

**Issue 3: Slow database queries**

**Symptoms:**
- Page load timeouts
- Dashboard delays
- Search results slow

**Diagnosis:**
```sql
-- Check slow queries
SELECT
  query,
  calls,
  mean_exec_time,
  max_exec_time
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;
```

**Solutions:**
- Add missing indexes
- Optimize query
- Increase connection pool
- Enable query caching

**Issue 4: Email delivery failures**

**Symptoms:**
- Emails not received
- Bounce notifications

**Diagnosis:**
1. Check Resend dashboard
2. Review email logs
3. Verify email addresses
4. Check spam scores

**Solutions:**
- Validate email syntax
- Update DNS records (SPF, DKIM)
- Review email content for spam triggers
- Contact email provider

### System Health Checks

**Automated Health Check:**

Access: `/api/health`

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-01-21T14:45:00Z",
  "services": {
    "database": "up",
    "redis": "up",
    "openai": "up",
    "anthropic": "up",
    "resend": "up"
  },
  "metrics": {
    "responseTime": "120ms",
    "activeConnections": 12,
    "cacheHitRate": 0.87
  }
}
```

**Manual Checks:**
1. Admin → System → Health
2. View service status
3. Run diagnostics
4. Review recent errors

---

## Backup & Recovery

### Automated Backups

**Database Backups:**
- Frequency: Daily at 2 AM UTC
- Retention: 30 days
- Location: Neon automated backups

**Manual Backup:**
```bash
# Full database backup
npm run db:backup

# Backup to file
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql
```

### Restoring from Backup

**Neon Dashboard:**
1. Go to Neon Console
2. Select project
3. Navigate to Backups
4. Choose backup point
5. Restore to new branch
6. Verify data
7. Promote branch to production

**From SQL File:**
```bash
# Restore from backup file
psql $DATABASE_URL < backup_20250121.sql
```

**Important:** Always test restore in staging environment first!

### Disaster Recovery Plan

**Scenario 1: Database Corruption**
1. Stop application
2. Assess corruption extent
3. Restore from latest backup
4. Verify data integrity
5. Resume application
6. Monitor closely

**Scenario 2: Data Loss**
1. Identify affected data
2. Find most recent backup
3. Restore to separate database
4. Extract specific data
5. Merge into production
6. Validate

**Scenario 3: Security Breach**
1. Immediately revoke all API keys
2. Reset all admin passwords
3. Rotate database credentials
4. Review audit logs
5. Patch vulnerability
6. Restore from pre-breach backup
7. Notify affected users

**Recovery Time Objective (RTO):** 4 hours
**Recovery Point Objective (RPO):** 24 hours

---

## Performance Optimization

### Monitoring Performance

**Key Metrics:**
- Page load time (<2 seconds target)
- API response time (<500ms target)
- Database query time (<100ms target)
- Time to First Byte (TTFB) (<600ms target)

**Tools:**
- Vercel Analytics
- Neon Dashboard
- Upstash Redis Monitor
- Browser DevTools

### Database Optimization

**1. Index Optimization:**

```sql
-- Find missing indexes
SELECT
  schemaname,
  tablename,
  attname,
  n_distinct,
  correlation
FROM pg_stats
WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
ORDER BY n_distinct DESC;
```

**2. Query Optimization:**

```sql
-- Enable query plan analysis
EXPLAIN ANALYZE SELECT ...;

-- Identify slow queries
SELECT
  query,
  calls,
  total_exec_time / calls as avg_time
FROM pg_stat_statements
WHERE calls > 100
ORDER BY avg_time DESC;
```

**3. Connection Pooling:**

Configure in `lib/db/prisma.ts`:
```typescript
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  connection: {
    connection_limit: 10,
    pool_timeout: 10,
  },
});
```

### Caching Strategy

**1. Server-Side Caching:**

Use Redis for:
- Expensive computations
- AI operation results
- Database query results
- Session data

**2. Client-Side Caching:**

Configure in Next.js:
```typescript
// app/layout.tsx
export const revalidate = 3600; // 1 hour

// Specific pages
export const revalidate = 60; // 1 minute for dashboard
```

**3. CDN Caching:**

Vercel Edge Network automatically caches:
- Static assets
- Images (via next/image)
- API routes with Cache-Control headers

### API Optimization

**Rate Limiting:**
```typescript
// lib/rate-limit.ts
const rateLimit = {
  videoAnalysis: 10 requests/hour,
  matching: 20 requests/hour,
  general: 100 requests/minute,
};
```

**Request Batching:**
- Batch embedding generation
- Batch email sending
- Combine database queries

**Response Compression:**
- Enable gzip/brotli
- Minify JSON responses
- Use pagination for large datasets

---

## Maintenance Tasks

### Daily Tasks
- [ ] Review error logs
- [ ] Check AI cost spending
- [ ] Monitor system health
- [ ] Review moderation queue

### Weekly Tasks
- [ ] Review user growth metrics
- [ ] Analyze AI performance
- [ ] Check database performance
- [ ] Review security logs
- [ ] Clear old cache entries

### Monthly Tasks
- [ ] Generate financial reports
- [ ] Review and optimize indexes
- [ ] Update dependencies
- [ ] Security audit
- [ ] Backup verification test
- [ ] Review API rate limits

### Quarterly Tasks
- [ ] Rotate API keys and secrets
- [ ] Review and update privacy policy
- [ ] Disaster recovery drill
- [ ] Performance optimization review
- [ ] User feedback analysis

---

## Support & Escalation

### Admin Support Contacts

**Technical Issues:**
- Platform Developer: dev@globaleducatornexus.com
- Database Admin: dba@globaleducatornexus.com

**Infrastructure:**
- Vercel Support: vercel.com/support
- Neon Support: neon.tech/docs/support

**API Providers:**
- OpenAI Support: help.openai.com
- Anthropic Support: support.anthropic.com
- Resend Support: resend.com/support

### Escalation Matrix

**Severity Levels:**

**P0 - Critical (Response: 15 min)**
- Site completely down
- Data breach
- Payment system failure
- Database corruption

**P1 - High (Response: 1 hour)**
- Major feature broken
- Performance severely degraded
- API errors affecting multiple users
- Security vulnerability

**P2 - Medium (Response: 4 hours)**
- Non-critical feature broken
- Intermittent errors
- Performance issues for some users

**P3 - Low (Response: 24 hours)**
- Minor bugs
- UI issues
- Feature requests
- Questions

---

## Appendix

### Useful Commands

**Database:**
```bash
# Connect to database
npx prisma studio

# Run migration
npx prisma migrate deploy

# Seed database
npx prisma db seed

# Reset database (dev only!)
npx prisma migrate reset
```

**Deployment:**
```bash
# Deploy to production
vercel --prod

# View production logs
vercel logs aijobx.vercel.app

# Check deployment status
vercel inspect <deployment-url>
```

**Cache:**
```bash
# Clear all Redis cache
npm run cache:clear

# View cache stats
npm run cache:stats
```

**Testing:**
```bash
# Run all tests
npm test

# Run specific test suite
npm test -- visa-checker

# Coverage report
npm run test:coverage
```

### Database Schema Reference

**Key Tables:**

**users:**
- id, email, password, role, createdAt

**teacher_profiles:**
- userId, nativeSpeaker, degree, yearsExperience, embedding

**schools:**
- userId, name, country, website

**jobs:**
- id, schoolId, title, description, salary, embedding, active

**applications:**
- id, jobId, teacherId, status, createdAt

**ai_cost_tracking:**
- id, userId, operation, model, cost, tokens, timestamp

### API Keys & Secrets Inventory

**Production Environment:**
- DATABASE_URL (Neon)
- OPENAI_API_KEY (OpenAI)
- ANTHROPIC_API_KEY (Anthropic)
- RESEND_API_KEY (Resend)
- UPSTASH_REDIS_REST_TOKEN (Upstash)
- UPLOADTHING_SECRET (UploadThing)
- NEXTAUTH_SECRET (NextAuth.js)
- CRON_SECRET (Vercel Cron)

**Rotation Schedule:**
- NEXTAUTH_SECRET: Every 90 days
- API Keys: Every 180 days or on suspected compromise
- Database Credentials: Annually or on team changes

---

**Document Version:** 1.0
**Last Updated:** January 21, 2025
**Next Review:** April 21, 2025

---

For urgent issues, contact: emergency@globaleducatornexus.com
