# Job Alerts Feature

Complete implementation of job search alerts with email notifications for teachers.

## Overview

The Job Alerts system allows teachers to save their job searches and receive automatic email notifications when new matching positions are posted.

## Features

### 1. Saved Searches
- **Custom Filters**: Save searches with multiple filter criteria
  - Country
  - Subject
  - Salary range (min/max)
  - Housing provided
  - Flight provided
  - Free text search query
- **Named Searches**: Give searches memorable names
- **Unlimited Searches**: Teachers can save as many searches as needed

### 2. Alert Frequencies
- **INSTANT**: Immediate notification when a matching job is posted
- **DAILY**: Daily digest at 9:00 AM UTC
- **WEEKLY**: Weekly digest every Monday at 9:00 AM UTC
- **NEVER**: Save search for manual checking (no emails)

### 3. Email Notifications
- **Beautiful HTML Emails**: Responsive design for all devices
- **Job Details**: Title, school, location, salary, benefits
- **Direct Links**: Click to view full job details
- **Manage Links**: Pause, resume, or delete saved searches
- **Privacy-First**: No tracking pixels, respect user preferences

### 4. Management Interface
- **Dashboard**: View all saved searches at a glance
- **Statistics**: Active alerts, recent matches, total searches
- **Quick Actions**: Pause/resume, view results, delete
- **Search Results**: View all current matching jobs

## Architecture

### Database Schema

```prisma
model SavedSearch {
  id        String   @id @default(cuid())
  teacherId String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Search criteria (stored as JSON)
  name      String?
  filters   Json

  // Alert settings
  alertEmail     Boolean @default(true)
  alertFrequency String  @default("DAILY")
  isActive       Boolean @default(true)

  // Tracking
  lastAlertSent  DateTime?
  lastMatchCount Int      @default(0)

  // Relations
  teacher TeacherProfile @relation(...)

  @@index([teacherId, isActive])
  @@index([alertFrequency, isActive])
  @@index([lastAlertSent])
}
```

### File Structure

```
app/
├── actions/
│   └── saved-searches.ts          # Server actions (CRUD)
├── api/
│   └── cron/
│       └── job-alerts/
│           └── route.ts            # Cron job handler
├── saved-searches/
│   ├── page.tsx                    # Main saved searches page
│   ├── SavedSearchesClient.tsx    # Client component
│   └── [id]/
│       └── results/
│           ├── page.tsx            # Results page
│           └── SavedSearchResultsClient.tsx

components/
└── saved-searches/
    ├── SavedSearchCard.tsx         # Search display card
    └── SaveSearchDialog.tsx        # Create/edit dialog

lib/
├── email/
│   └── job-alerts.ts               # Email template generation
└── types/
    └── saved-search.ts             # Type definitions

docs/
├── JOB_ALERTS_README.md           # This file
└── JOB_ALERTS_SETUP.md            # Setup guide

scripts/
└── test-job-alerts.ts              # Testing script

prisma/
└── migrations/
    └── 20250120_add_saved_searches/
        └── migration.sql           # Database migration
```

## API Reference

### Server Actions

#### `createSavedSearch(input)`
Create a new saved search.

```typescript
const savedSearch = await createSavedSearch({
  name: 'ESL Jobs in Seoul',
  filters: {
    country: 'South Korea',
    subject: 'English as a Second Language',
    minSalary: 2500,
  },
  alertFrequency: 'DAILY',
  alertEmail: true,
});
```

#### `getMySavedSearches()`
Get all saved searches for current user.

```typescript
const searches = await getMySavedSearches();
```

#### `updateSavedSearch(id, updates)`
Update saved search settings.

```typescript
await updateSavedSearch(searchId, {
  alertFrequency: 'WEEKLY',
  name: 'Updated Name',
});
```

#### `toggleSavedSearchActive(id)`
Toggle active/paused state.

```typescript
await toggleSavedSearchActive(searchId);
```

#### `deleteSavedSearch(id)`
Delete a saved search.

```typescript
await deleteSavedSearch(searchId);
```

#### `getJobsForSavedSearch(id, page?, pageSize?)`
Get current jobs matching a saved search.

```typescript
const { jobs, total, hasMore } = await getJobsForSavedSearch(
  searchId,
  1,
  20
);
```

### Email Functions

#### `sendInstantJobAlert(email, name, job, searchId)`
Send instant notification for a single job.

```typescript
import { sendInstantJobAlert } from '@/lib/email/job-alerts';

const result = await sendInstantJobAlert(
  'teacher@example.com',
  'John Doe',
  jobPosting,
  savedSearchId
);

if (result.success) {
  console.log('Email sent!');
} else {
  console.error('Failed:', result.error);
}
```

#### `sendDigestJobAlert(email, name, jobs, searchId, filters, frequency)`
Send daily/weekly digest of multiple jobs.

```typescript
const result = await sendDigestJobAlert(
  'teacher@example.com',
  'John Doe',
  [job1, job2, job3],
  savedSearchId,
  { country: 'South Korea' },
  'daily'
);
```

#### `sendBatchJobAlerts(alerts)`
Send multiple alerts efficiently.

```typescript
const results = await sendBatchJobAlerts([
  {
    email: 'teacher1@example.com',
    name: 'Teacher 1',
    jobs: [job1, job2],
    savedSearchId: 'search1',
    filters: {},
    frequency: 'daily',
  },
  // ... more alerts
]);

console.log(`Sent ${results.successful}/${results.total} emails`);
```

#### `sendTestJobAlert(email)`
Send test email for development/testing.

```typescript
const result = await sendTestJobAlert('your-email@example.com');
```

### Cron Job Endpoint

#### `GET /api/cron/job-alerts`
Scheduled job that processes all pending alerts.

**Authentication**: Requires `Authorization: Bearer <CRON_SECRET>` header

**Response**:
```json
{
  "success": true,
  "timestamp": "2025-01-20T09:00:00.000Z",
  "results": {
    "total": 50,
    "daily": 45,
    "weekly": 5,
    "successful": 48,
    "failed": 2,
    "errors": [
      {
        "email": "invalid@example.com",
        "error": "Invalid email address"
      }
    ]
  }
}
```

#### `POST /api/cron/job-alerts`
Manual trigger for testing specific searches.

**Body**:
```json
{
  "savedSearchId": "clx123456789"
}
```

**Response**:
```json
{
  "success": true,
  "savedSearchId": "clx123456789",
  "jobsFound": 5,
  "email": "teacher@example.com"
}
```

## Type Definitions

### SavedSearchFilters
```typescript
type SavedSearchFilters = {
  country?: string;
  subject?: string;
  minSalary?: number;
  maxSalary?: number;
  housingProvided?: boolean;
  flightProvided?: boolean;
  searchQuery?: string;
};
```

### AlertFrequency
```typescript
type AlertFrequency = 'INSTANT' | 'DAILY' | 'WEEKLY' | 'NEVER';
```

### CreateSavedSearchInput
```typescript
type CreateSavedSearchInput = {
  name?: string;
  filters: SavedSearchFilters;
  alertFrequency?: AlertFrequency;
  alertEmail?: boolean;
};
```

### UpdateSavedSearchInput
```typescript
type UpdateSavedSearchInput = {
  name?: string;
  alertFrequency?: AlertFrequency;
  alertEmail?: boolean;
  isActive?: boolean;
};
```

## User Interface

### Components

#### SaveSearchDialog
Dialog for creating/saving searches from the jobs page.

**Props**:
```typescript
type SaveSearchDialogProps = {
  filters: SavedSearchFilters;
  trigger?: React.ReactNode;
};
```

**Usage**:
```tsx
import { SaveSearchDialog } from '@/components/saved-searches/SaveSearchDialog';

<SaveSearchDialog
  filters={{ country: 'South Korea', minSalary: 2500 }}
/>
```

#### SavedSearchCard
Display card for individual saved search.

**Props**:
```typescript
type SavedSearchCardProps = {
  savedSearch: SavedSearch;
  onUpdate?: () => void;
};
```

**Usage**:
```tsx
import { SavedSearchCard } from '@/components/saved-searches/SavedSearchCard';

<SavedSearchCard
  savedSearch={savedSearch}
  onUpdate={() => router.refresh()}
/>
```

### Pages

#### `/saved-searches`
Main saved searches management page.

**Features**:
- Statistics dashboard
- Active/paused sections
- Create new search
- Empty state

#### `/saved-searches/[id]/results`
View results for a specific saved search.

**Features**:
- Search criteria summary
- Job list with current matches
- Alert status and settings
- Manage search link

## Email Templates

### Instant Alert
Single job notification sent immediately when a matching job is posted.

**Subject**: `New Job Alert: {job.title} in {job.country}`

**Content**:
- Job title and school
- Location and salary
- Benefits (housing, flight)
- Job description preview
- "View Full Details" CTA button

### Daily Digest
Summary of new jobs from the past 24 hours.

**Subject**: `Your Daily Job Alert: {count} New Jobs`

**Content**:
- Search criteria summary
- List of up to 10 jobs
- "View All Results" CTA
- Tips for job seekers

### Weekly Digest
Summary of new jobs from the past 7 days.

**Subject**: `Your Weekly Job Alert: {count} New Jobs`

**Content**:
- Same as daily digest
- Sent only on Mondays

## Workflow

### Creating a Saved Search

1. Teacher browses jobs at `/jobs`
2. Applies filters (country, subject, salary, etc.)
3. Clicks "Save This Search" button
4. SaveSearchDialog opens
5. Teacher optionally names the search
6. Selects alert frequency
7. Clicks "Save Search"
8. Search is saved to database
9. Teacher is notified of success

### Receiving Alerts

#### INSTANT (Not yet implemented)
1. New job is posted
2. System finds matching saved searches
3. Instant emails sent immediately

#### DAILY
1. Cron job runs at 9:00 AM UTC daily
2. Finds all DAILY saved searches
3. Checks `lastAlertSent` (must be >24h ago)
4. Queries for new jobs since last alert
5. Sends digest email with all matches
6. Updates `lastAlertSent` and `lastMatchCount`

#### WEEKLY
1. Cron job runs at 9:00 AM UTC on Mondays
2. Finds all WEEKLY saved searches
3. Checks `lastAlertSent` (must be >7d ago)
4. Queries for new jobs since last alert
5. Sends digest email with all matches
6. Updates `lastAlertSent` and `lastMatchCount`

### Managing Saved Searches

1. Teacher visits `/saved-searches`
2. Views all saved searches
3. Can:
   - View current results
   - Pause/resume alerts
   - Edit alert frequency
   - Delete search
   - Create new search

## Testing

### Local Testing

1. **Test email sending**:
   ```bash
   npm run alerts:test your-email@example.com
   ```

2. **Test saved search creation**:
   - Start dev server: `npm run dev`
   - Navigate to `/jobs`
   - Apply filters and save search

3. **Test cron job**:
   ```bash
   curl http://localhost:3000/api/cron/job-alerts \
     -H "Authorization: Bearer your-cron-secret"
   ```

### Production Testing

1. **Verify cron schedule**:
   - Check Vercel Dashboard > Cron Jobs
   - Confirm schedule is `0 9 * * *`

2. **Monitor first run**:
   - Wait for scheduled time (9 AM UTC)
   - Check Vercel Function Logs
   - Verify emails in Resend Dashboard

3. **Test email delivery**:
   - Check inbox for test email
   - Verify rendering in multiple clients
   - Test links (job details, manage, unsubscribe)

## Performance Considerations

### Database

- **Indexes**: Created on `teacherId`, `isActive`, `alertFrequency`, `lastAlertSent`
- **Query Optimization**: Uses composite indexes for filtering
- **Batch Processing**: Processes searches in batches of 50

### Email Delivery

- **Rate Limiting**: 100ms delay between emails
- **Batch Size**: Up to 50 alerts per cron run
- **Retry Logic**: No automatic retries (logged to errors)

### Cron Job

- **Timeout**: 60 seconds (configurable in vercel.json)
- **Memory**: Default Vercel function memory
- **Concurrency**: Single instance (cron ensures no overlap)

## Security

### Authentication

- **Cron Secret**: Verifies cron job authenticity
- **Ownership Verification**: All actions check `teacherId` matches session
- **Session Required**: Must be logged in as TEACHER role

### Privacy

- **No Tracking**: No pixel tracking in emails
- **Unsubscribe**: Easy pause/resume functionality
- **Data Minimal**: Only stores necessary filter data

### Rate Limiting

- **Email API**: Respects Resend rate limits
- **Database**: Efficient queries with indexes
- **Cron**: Single scheduled instance prevents spam

## Monitoring & Debugging

### Logs to Monitor

1. **Vercel Function Logs**:
   - `/api/cron/job-alerts` invocations
   - Success/failure counts
   - Error messages

2. **Resend Dashboard**:
   - Email delivery status
   - Bounce rate
   - Spam complaints

3. **Database Queries**:
   ```sql
   -- Failed searches (no matches in last 7 days)
   SELECT * FROM "SavedSearch"
   WHERE "lastAlertSent" < NOW() - INTERVAL '7 days'
     AND "lastMatchCount" = 0;

   -- High-performing searches
   SELECT * FROM "SavedSearch"
   WHERE "lastMatchCount" > 10
   ORDER BY "lastMatchCount" DESC;
   ```

### Common Issues

See `docs/JOB_ALERTS_SETUP.md` for detailed troubleshooting.

## Future Enhancements

### Planned Features

1. **INSTANT Alerts**:
   - Webhook triggered on new job creation
   - Immediate notification for time-sensitive jobs

2. **Smart Recommendations**:
   - AI-powered job ranking
   - Personalized suggestions based on profile

3. **Advanced Filters**:
   - Grade level
   - Start date range
   - Visa sponsorship
   - Contract length

4. **Email Preferences**:
   - Customize email frequency per search
   - Digest format options (brief vs detailed)
   - Time zone customization

5. **Mobile App Push Notifications**:
   - Alternative to email
   - Instant alerts on mobile

6. **Analytics**:
   - Email open/click tracking (opt-in)
   - Search effectiveness metrics
   - Popular search patterns

### Technical Improvements

1. **Background Queue**:
   - Use BullMQ or similar for robust job processing
   - Better error handling and retries

2. **Email Templates**:
   - Customizable themes
   - A/B testing for effectiveness

3. **Deduplication**:
   - Prevent same job in multiple searches
   - Aggregate similar jobs

4. **Performance**:
   - Cache frequent queries
   - Pre-compute search results

## Support

For setup instructions, see `docs/JOB_ALERTS_SETUP.md`

For questions or issues:
- Email: support@aijobx.com
- GitHub Issues: [Your repo]/issues
- Resend Support: https://resend.com/support

---

**Last Updated**: 2025-01-20
**Version**: 1.0.0
**Status**: ✅ Production Ready
