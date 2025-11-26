# UI/UX Redesign - SPARC Implementation Plan

**Project**: Global Educator Nexus UI/UX Overhaul
**Benchmark Target**: Wellfound (AngelList Talent)
**Methodology**: SPARC (Specification → Pseudocode → Architecture → Refinement → Completion)
**Date Created**: 2025-11-25
**Timeline**: 7.5 weeks (Phase 0-6)
**Status**: 🟡 Planning Phase

---

## Table of Contents

### SPARC Phase 0: Foundation & Baseline
1. [Current State Analysis](#phase-0-foundation--baseline)
2. [Baseline Metrics Collection](#baseline-metrics-collection)
3. [Testing Infrastructure Setup](#testing-infrastructure-setup)
4. [Standards Definition](#standards-definition)

### SPARC Phase 1: Specification
5. [Requirements Specification](#phase-1-specification)
6. [User Stories & Acceptance Criteria](#user-stories--acceptance-criteria)
7. [Component Specifications](#component-specifications)
8. [Design System Specification](#design-system-specification)

### SPARC Phase 2: Pseudocode
9. [Implementation Logic](#phase-2-pseudocode)
10. [Component Algorithms](#component-algorithms)
11. [State Management Logic](#state-management-logic)
12. [Animation Sequences](#animation-sequences)

### SPARC Phase 3: Architecture
13. [System Architecture](#phase-3-architecture)
14. [Component Architecture](#component-architecture)
15. [Data Flow Architecture](#data-flow-architecture)
16. [Performance Architecture](#performance-architecture)

### SPARC Phase 4: Refinement
17. [Code Quality Improvements](#phase-4-refinement)
18. [Performance Optimization](#performance-optimization)
19. [Accessibility Enhancements](#accessibility-enhancements)
20. [Security Hardening](#security-hardening)

### SPARC Phase 5: Completion
21. [Testing Strategy](#phase-5-completion)
22. [Quality Assurance](#quality-assurance)
23. [Deployment Checklist](#deployment-checklist)
24. [Success Metrics Verification](#success-metrics-verification)

---

# PHASE 0: Foundation & Baseline

> **Duration**: 1.5 weeks (Days 1-10)
> **Goal**: Establish measurable baseline and foundational infrastructure
> **Critical Success Factor**: Cannot proceed without baseline metrics

## Overview

Phase 0 ensures we have:
1. **Quantifiable Baseline**: Concrete metrics to measure improvement
2. **Testing Infrastructure**: Automated testing ready from day 1
3. **Standards & Guidelines**: Clear quality bars for all work
4. **Design Tokens**: Consistent design language foundation

---

## Baseline Metrics Collection

### 1. Performance Baseline

#### Lighthouse Audit (All Pages)

**Tool Installation**:
```bash
npm install -g lighthouse
npm install -D @lhci/cli
```

**Execution**:
```bash
# Homepage
lighthouse https://localhost:3000 \
  --output html \
  --output json \
  --output-path ./audits/homepage-baseline.html \
  --chrome-flags="--headless"

# Jobs Page
lighthouse https://localhost:3000/jobs \
  --output html \
  --output json \
  --output-path ./audits/jobs-baseline.html

# Dashboard
lighthouse https://localhost:3000/dashboard \
  --output html \
  --output json \
  --output-path ./audits/dashboard-baseline.html

# Profile Page
lighthouse https://localhost:3000/profile/test-id \
  --output html \
  --output json \
  --output-path ./audits/profile-baseline.html
```

**Baseline Document Template**:
```markdown
# Performance Baseline - YYYY-MM-DD

## Homepage
- Performance Score: __/100
- Accessibility Score: __/100
- Best Practices: __/100
- SEO: __/100

### Core Web Vitals
- First Contentful Paint (FCP): __ ms
- Largest Contentful Paint (LCP): __ ms
- Total Blocking Time (TBT): __ ms
- Cumulative Layout Shift (CLS): __
- Speed Index: __ ms

### Opportunities
1. [List top 3 issues from Lighthouse]
2.
3.

## Jobs Page
[Same structure as above]

## Dashboard
[Same structure as above]

## Profile Page
[Same structure as above]
```

**Acceptance Criteria**:
- [ ] All 4 pages audited
- [ ] JSON reports saved in `/audits/baseline/`
- [ ] Documented in `docs/BASELINE_METRICS.md`
- [ ] Identified top 5 performance bottlenecks

---

### 2. Analytics Baseline

#### Google Analytics Export

**Data to Collect** (Last 30 Days):
```javascript
// GA4 Queries to Run

// 1. User Behavior
SELECT
  COUNT(DISTINCT user_pseudo_id) as total_users,
  COUNT(DISTINCT session_id) as total_sessions,
  AVG(session_duration) as avg_session_duration,
  AVG(page_views_per_session) as avg_pages_per_session
FROM analytics_events
WHERE event_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)

// 2. Bounce Rate by Page
SELECT
  page_location,
  COUNT(*) as total_visits,
  SUM(CASE WHEN is_bounce THEN 1 ELSE 0 END) as bounces,
  (SUM(CASE WHEN is_bounce THEN 1 ELSE 0 END) / COUNT(*)) * 100 as bounce_rate
FROM analytics_events
WHERE event_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)
GROUP BY page_location
ORDER BY total_visits DESC
LIMIT 10

// 3. Conversion Funnel
SELECT
  'Homepage View' as step,
  COUNT(DISTINCT user_pseudo_id) as users
FROM analytics_events
WHERE event_name = 'page_view' AND page_location = '/'
UNION ALL
SELECT
  'Job View' as step,
  COUNT(DISTINCT user_pseudo_id) as users
FROM analytics_events
WHERE event_name = 'page_view' AND page_location LIKE '/jobs/%'
UNION ALL
SELECT
  'Application Started' as step,
  COUNT(DISTINCT user_pseudo_id) as users
FROM analytics_events
WHERE event_name = 'application_started'
UNION ALL
SELECT
  'Application Completed' as step,
  COUNT(DISTINCT user_pseudo_id) as users
FROM analytics_events
WHERE event_name = 'application_completed'
```

**Baseline Document**:
```markdown
# Analytics Baseline - YYYY-MM-DD

## User Behavior (Last 30 Days)
- Total Users: _____
- Total Sessions: _____
- Avg Session Duration: _____ seconds
- Avg Pages/Session: _____
- New vs Returning: __% / __%

## Bounce Rate by Page
| Page | Visits | Bounce Rate | Notes |
|------|--------|-------------|-------|
| Homepage | ___ | __% | |
| /jobs | ___ | __% | |
| /jobs/[id] | ___ | __% | |
| /dashboard | ___ | __% | |
| /profile | ___ | __% | |

## Conversion Funnel
| Step | Users | Conversion Rate | Drop-off |
|------|-------|-----------------|----------|
| Homepage View | ___ | 100% | - |
| Job View | ___ | __% | __% |
| Application Started | ___ | __% | __% |
| Application Completed | ___ | __% | __% |

### Key Insights
1. [Biggest drop-off point]
2. [Highest bounce rate page]
3. [Best performing page]

## Device Breakdown
- Mobile: __%
- Desktop: __%
- Tablet: __%

## Browser Breakdown
- Chrome: __%
- Safari: __%
- Firefox: __%
- Edge: __%
- Other: __%
```

**Acceptance Criteria**:
- [ ] Analytics data exported
- [ ] Documented in `docs/BASELINE_METRICS.md`
- [ ] Conversion funnel calculated
- [ ] Drop-off points identified

---

### 3. Database Query Baseline

#### Application Funnel from Database

```sql
-- File: scripts/baseline/application-funnel.sql

-- Get baseline conversion metrics from database
WITH user_activity AS (
  SELECT
    u.id as user_id,
    u.role,
    u.created_at as signup_date,

    -- Profile completion
    CASE WHEN tp.video_url IS NOT NULL THEN 1 ELSE 0 END as has_video,
    CASE WHEN tp.bio IS NOT NULL THEN 1 ELSE 0 END as has_bio,

    -- Job interaction
    (SELECT COUNT(*) FROM "JobView" jv WHERE jv.user_id = u.id) as jobs_viewed,
    (SELECT COUNT(*) FROM "SavedJob" sj WHERE sj.user_id = u.id) as jobs_saved,
    (SELECT COUNT(*) FROM "Application" a WHERE a.teacher_id = u.id) as applications_submitted

  FROM "User" u
  LEFT JOIN "TeacherProfile" tp ON tp.user_id = u.id
  WHERE u.role = 'TEACHER'
    AND u.created_at >= NOW() - INTERVAL '30 days'
)

-- Calculate funnel metrics
SELECT
  COUNT(*) as total_signups,

  -- Profile completion rate
  SUM(has_video) as completed_video,
  ROUND(SUM(has_video)::numeric / COUNT(*) * 100, 2) as video_completion_rate,

  -- Job viewing rate
  COUNT(CASE WHEN jobs_viewed > 0 THEN 1 END) as viewed_jobs,
  ROUND(COUNT(CASE WHEN jobs_viewed > 0 THEN 1 END)::numeric / COUNT(*) * 100, 2) as job_view_rate,

  -- Save rate
  COUNT(CASE WHEN jobs_saved > 0 THEN 1 END) as saved_jobs,
  ROUND(COUNT(CASE WHEN jobs_saved > 0 THEN 1 END)::numeric / COUNT(*) * 100, 2) as save_rate,

  -- Application rate
  COUNT(CASE WHEN applications_submitted > 0 THEN 1 END) as applied,
  ROUND(COUNT(CASE WHEN applications_submitted > 0 THEN 1 END)::numeric / COUNT(*) * 100, 2) as application_rate,

  -- Average applications per user
  ROUND(AVG(applications_submitted), 2) as avg_applications_per_user

FROM user_activity;

-- Time to first action
SELECT
  'Signup → Video Upload' as action,
  AVG(EXTRACT(EPOCH FROM (tp.created_at - u.created_at))/3600) as avg_hours
FROM "User" u
JOIN "TeacherProfile" tp ON tp.user_id = u.id
WHERE tp.video_url IS NOT NULL
  AND u.created_at >= NOW() - INTERVAL '30 days'

UNION ALL

SELECT
  'Signup → First Job View' as action,
  AVG(EXTRACT(EPOCH FROM (jv.created_at - u.created_at))/3600) as avg_hours
FROM "User" u
JOIN "JobView" jv ON jv.user_id = u.id
WHERE u.created_at >= NOW() - INTERVAL '30 days'
  AND jv.created_at = (
    SELECT MIN(created_at) FROM "JobView" WHERE user_id = u.id
  )

UNION ALL

SELECT
  'Signup → First Application' as action,
  AVG(EXTRACT(EPOCH FROM (a.created_at - u.created_at))/3600) as avg_hours
FROM "User" u
JOIN "Application" a ON a.teacher_id = u.id
WHERE u.created_at >= NOW() - INTERVAL '30 days'
  AND a.created_at = (
    SELECT MIN(created_at) FROM "Application" WHERE teacher_id = u.id
  );
```

**Execution**:
```bash
# Run baseline queries
npm run db:baseline

# Save results
npm run db:baseline > audits/baseline/database-metrics.json
```

**Acceptance Criteria**:
- [ ] Conversion funnel calculated from DB
- [ ] Time-to-action metrics captured
- [ ] Documented in `docs/BASELINE_METRICS.md`

---

### 4. User Research Baseline

#### User Interview Script

**Objective**: Identify pain points and usability issues

**Participants**:
- 10 Teachers (5 active, 5 churned)
- 10 Recruiters (5 active, 5 inactive)

**Interview Script**:
```markdown
# User Interview Script - Teachers

## Introduction (2 min)
Thank you for taking time. We're improving our platform and want to understand your experience.
This will take 15-20 minutes. Your feedback is confidential.

## Background (3 min)
1. How long have you been using Global Educator Nexus?
2. How many jobs have you applied to through our platform?
3. What other job platforms do you use?

## Platform Experience (10 min)
4. Walk me through your typical job search session. What do you do first?
5. What's the most frustrating part of using our platform?
6. What's the best part of using our platform?
7. On a scale of 1-10, how easy is it to find relevant jobs? Why?
8. On a scale of 1-10, how easy is it to apply to jobs? Why?
9. Have you used the video resume feature? What was that experience like?
10. What features do you wish we had?

## Mobile Experience (3 min)
11. Do you primarily use mobile or desktop?
12. [If mobile] What's your experience using our mobile site?
13. What mobile features would be most helpful?

## Competitive Comparison (2 min)
14. How does our platform compare to [Wellfound, LinkedIn, Indeed]?
15. What do those platforms do better than us?

## Closing (1 min)
16. If you could change one thing about the platform, what would it be?
17. Any other feedback you'd like to share?

Thank you! [Provide $25 gift card]
```

**Data Collection Template**:
```markdown
# User Research Findings - YYYY-MM-DD

## Summary
- Interviews Conducted: __ teachers, __ recruiters
- Date Range: YYYY-MM-DD to YYYY-MM-DD

## Top Pain Points (Teachers)
1. [Most mentioned issue] - Mentioned by __/__
2. [Second issue] - Mentioned by __/__
3. [Third issue] - Mentioned by __/__
4. [Fourth issue] - Mentioned by __/__
5. [Fifth issue] - Mentioned by __/__

## Top Feature Requests (Teachers)
1. [Most requested] - Requested by __/__
2. [Second] - Requested by __/__
3. [Third] - Requested by __/__

## Mobile Usage Insights
- Primary Mobile Users: __%
- Mobile Pain Points: [List]
- Mobile Feature Requests: [List]

## Competitive Insights
- Platforms mentioned: [List with frequency]
- What competitors do better: [List]
- Our unique strengths: [List]

## Quotes (Most Impactful)
> "[Direct quote from user about pain point]" - Teacher, [Location]

> "[Direct quote about feature request]" - Teacher, [Location]

> "[Direct quote about mobile]" - Teacher, [Location]

## Recommendations
Based on user feedback:
1. [High priority fix]
2. [High priority feature]
3. [Medium priority improvement]
```

**Acceptance Criteria**:
- [ ] 20 user interviews completed
- [ ] Findings documented in `docs/USER_RESEARCH_BASELINE.md`
- [ ] Top 5 pain points identified
- [ ] Top 5 feature requests identified

---

## Testing Infrastructure Setup

### 1. Unit Testing Setup

**Tool Installation**:
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

**Configuration**:
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData',
      ],
      lines: 80,
      functions: 80,
      branches: 75,
      statements: 80,
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
});
```

```typescript
// tests/setup.ts
import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

expect.extend(matchers);

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
}));

// Mock Next.js image
vi.mock('next/image', () => ({
  default: (props: any) => {
    // eslint-disable-next-line jsx-a11y/alt-text
    return <img {...props} />;
  },
}));
```

**Sample Test**:
```typescript
// components/ui/button.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './button';

describe('Button', () => {
  it('renders children correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();

    render(<Button onClick={handleClick}>Click me</Button>);
    await user.click(screen.getByRole('button'));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('applies variant classes correctly', () => {
    const { container } = render(<Button variant="destructive">Delete</Button>);
    expect(container.firstChild).toHaveClass('bg-red-600');
  });

  it('has correct focus styles for accessibility', () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('focus-visible:ring-2');
  });
});
```

**Acceptance Criteria**:
- [ ] Vitest configured
- [ ] Testing Library setup
- [ ] Sample tests passing
- [ ] Coverage thresholds defined
- [ ] CI/CD integration ready

---

### 2. E2E Testing Setup

**Tool Installation**:
```bash
npm install -D @playwright/test
npx playwright install
```

**Configuration**:
```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
  ],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
```

**Sample E2E Test**:
```typescript
// tests/e2e/job-search.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Job Search Flow', () => {
  test('user can search and filter jobs', async ({ page }) => {
    await page.goto('/jobs');

    // Wait for page load
    await expect(page.getByRole('heading', { name: /teaching jobs/i })).toBeVisible();

    // Check initial job count
    const initialJobCount = await page.getByTestId('job-card').count();
    expect(initialJobCount).toBeGreaterThan(0);

    // Search for a specific job
    await page.getByPlaceholder(/search jobs/i).fill('Math Teacher');
    await page.getByPlaceholder(/search jobs/i).press('Enter');

    // Wait for search results
    await page.waitForSelector('[data-testid="job-card"]');

    // Verify results contain search term
    const firstJobCard = page.getByTestId('job-card').first();
    await expect(firstJobCard).toContainText(/math/i);

    // Apply country filter
    await page.getByRole('checkbox', { name: /japan/i }).check();
    await page.waitForTimeout(500);

    // Verify filtered results
    await expect(page.getByText(/japan/i).first()).toBeVisible();

    // Check that filter count updated
    const filteredJobCount = await page.getByTestId('job-card').count();
    expect(filteredJobCount).toBeLessThanOrEqual(initialJobCount);
  });

  test('user can save a job', async ({ page, context }) => {
    // Set up authenticated state
    await context.addCookies([
      {
        name: 'next-auth.session-token',
        value: 'test-session-token',
        domain: 'localhost',
        path: '/',
        httpOnly: true,
        sameSite: 'Lax',
      },
    ]);

    await page.goto('/jobs');

    // Click save on first job
    const firstSaveButton = page.getByTestId('job-card').first().getByLabel(/save/i);
    await firstSaveButton.click();

    // Verify toast notification
    await expect(page.getByText(/job saved/i)).toBeVisible();

    // Navigate to saved jobs
    await page.getByRole('link', { name: /saved/i }).click();

    // Verify job appears in saved list
    await expect(page.getByTestId('job-card')).toHaveCount(1);
  });
});
```

**Acceptance Criteria**:
- [ ] Playwright configured
- [ ] Multi-browser testing setup
- [ ] Mobile device testing configured
- [ ] Sample tests passing
- [ ] CI/CD integration ready

---

### 3. Accessibility Testing Setup

**Tool Installation**:
```bash
npm install -D @axe-core/playwright pa11y-ci
```

**Configuration**:
```json
// .pa11yci.json
{
  "defaults": {
    "standard": "WCAG2AA",
    "timeout": 30000,
    "chromeLaunchConfig": {
      "args": ["--no-sandbox"]
    },
    "runners": ["axe"],
    "ignore": [
      "color-contrast" // Will be manually verified
    ]
  },
  "urls": [
    "http://localhost:3000/",
    "http://localhost:3000/jobs",
    "http://localhost:3000/dashboard",
    "http://localhost:3000/profile/test-id"
  ]
}
```

**Playwright Accessibility Test**:
```typescript
// tests/a11y/accessibility.spec.ts
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility Tests', () => {
  test('homepage should not have accessibility violations', async ({ page }) => {
    await page.goto('/');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('job listing page should not have accessibility violations', async ({ page }) => {
    await page.goto('/jobs');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('keyboard navigation should work', async ({ page }) => {
    await page.goto('/');

    // Tab through interactive elements
    await page.keyboard.press('Tab');
    let focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(['A', 'BUTTON', 'INPUT']).toContain(focusedElement);

    // Continue tabbing
    await page.keyboard.press('Tab');
    focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(['A', 'BUTTON', 'INPUT']).toContain(focusedElement);

    // Verify focus indicator is visible
    const hasFocusIndicator = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el) return false;
      const styles = window.getComputedStyle(el);
      return styles.outline !== 'none' || styles.boxShadow !== 'none';
    });
    expect(hasFocusIndicator).toBe(true);
  });
});
```

**Acceptance Criteria**:
- [ ] axe-core configured
- [ ] Pa11y configured
- [ ] WCAG 2.1 AA target set
- [ ] Sample tests passing
- [ ] CI/CD integration ready

---

### 4. Visual Regression Testing Setup

**Tool Installation**:
```bash
npm install -D @percy/cli @percy/playwright
```

**Configuration**:
```typescript
// tests/visual/visual-regression.spec.ts
import { test } from '@playwright/test';
import percySnapshot from '@percy/playwright';

test.describe('Visual Regression Tests', () => {
  test('homepage appearance', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="hero-section"]');
    await percySnapshot(page, 'Homepage - Baseline');
  });

  test('job listing page', async ({ page }) => {
    await page.goto('/jobs');
    await page.waitForSelector('[data-testid="job-card"]');
    await percySnapshot(page, 'Job Listing - Baseline');
  });

  test('job card hover state', async ({ page }) => {
    await page.goto('/jobs');
    const firstCard = page.getByTestId('job-card').first();
    await firstCard.hover();
    await page.waitForTimeout(300); // Wait for hover animation
    await percySnapshot(page, 'Job Card - Hover State - Baseline');
  });

  test('filters panel', async ({ page }) => {
    await page.goto('/jobs');
    await page.getByRole('button', { name: /filters/i }).click();
    await page.waitForSelector('[data-testid="filters-panel"]');
    await percySnapshot(page, 'Filters Panel - Expanded - Baseline');
  });

  test('mobile navigation', async ({ page, context }) => {
    await context.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.getByRole('button', { name: /menu/i }).click();
    await page.waitForSelector('[data-testid="mobile-menu"]');
    await percySnapshot(page, 'Mobile Menu - Open - Baseline');
  });
});
```

**Acceptance Criteria**:
- [ ] Percy configured
- [ ] Baseline snapshots captured
- [ ] CI/CD integration ready
- [ ] Visual diff reports accessible

---

## Standards Definition

### 1. Mobile-First Design Standards

**Document**: `docs/MOBILE_STANDARDS.md`

```markdown
# Mobile-First Design Standards

## Touch Targets

### Minimum Sizes (WCAG 2.5.5 Compliance)
- **Minimum**: 44x44px (CSS pixels)
- **Recommended**: 48x48px
- **Spacing**: Minimum 8px between targets

### Implementation
```tsx
// ✅ Correct
<Button className="min-h-[44px] min-w-[44px] touch-manipulation">
  Save
</Button>

// ❌ Incorrect
<Button className="h-8 w-8"> {/* 32x32px - too small */}
  Save
</Button>
```

## Navigation Patterns

### Primary Pattern: Bottom Navigation
- Use for main app navigation (Home, Jobs, Saved, Profile)
- Maximum 5 items
- Active state clearly indicated
- Labels always visible (no icon-only)

### Secondary Pattern: Hamburger Menu
- Use for secondary/admin actions
- Always in top-right
- Clear close button
- Overlay dimmed background

## Breakpoints
- Mobile: 0-639px (default styles)
- Tablet: 640-1023px
- Desktop: 1024px+

## Typography Scale (Mobile-First)
```css
/* Base (Mobile) */
--text-xs: 0.75rem;   /* 12px */
--text-sm: 0.875rem;  /* 14px */
--text-base: 1rem;    /* 16px */
--text-lg: 1.125rem;  /* 18px */

/* Tablet */
@media (min-width: 640px) {
  --text-base: 1.0625rem; /* 17px */
  --text-lg: 1.25rem;     /* 20px */
}

/* Desktop */
@media (min-width: 1024px) {
  --text-base: 1.125rem;  /* 18px */
  --text-lg: 1.375rem;    /* 22px */
}
```

## Gestures
- **Swipe Left/Right**: Navigate between items (job cards)
- **Pull to Refresh**: Update content lists
- **Long Press**: Show additional options
- **Pinch to Zoom**: Disabled globally (prevent accidental zoom)

## Performance Targets (Mobile 3G)
- First Contentful Paint: < 1.8s
- Largest Contentful Paint: < 2.5s
- Time to Interactive: < 3.8s
- Total Blocking Time: < 300ms

## Testing Checklist
- [ ] All interactive elements >= 44x44px
- [ ] Touch targets have >= 8px spacing
- [ ] Navigation accessible with one hand
- [ ] Content readable without zoom
- [ ] Forms easy to complete on mobile
- [ ] Images optimized (WebP/AVIF)
- [ ] JavaScript bundle < 200KB gzipped
```

**Acceptance Criteria**:
- [ ] Mobile standards documented
- [ ] Touch target guidelines defined
- [ ] Navigation patterns chosen
- [ ] Performance targets set

---

### 2. Accessibility Standards

**Document**: `docs/ACCESSIBILITY_STANDARDS.md`

```markdown
# Accessibility Standards (WCAG 2.1 AA)

## Color Contrast

### Text
- **Normal text** (< 18px): Minimum 4.5:1 contrast
- **Large text** (>= 18px or 14px bold): Minimum 3:1 contrast
- **UI components**: Minimum 3:1 contrast

### Approved Color Combinations
```typescript
// Text on white background
const APPROVED_COLORS = {
  // ✅ WCAG AAA (7:1+)
  textPrimary: '#0F172A',    // 16.1:1
  textSecondary: '#475569',  // 7.5:1
  linkPrimary: '#1E40AF',    // 7.9:1

  // ✅ WCAG AA (4.5:1+)
  textTertiary: '#64748B',   // 4.6:1
  success: '#059669',        // 4.5:1
  error: '#DC2626',          // 5.9:1

  // ❌ FAIL (<4.5:1)
  AVOID_lightGray: '#D1D5DB',  // 1.8:1
  AVOID_paleBlue: '#DBEAFE',   // 1.2:1
};
```

### Verification
```bash
# Use contrast checker in CI
npm run check:contrast
```

## Keyboard Navigation

### Focus Management
- **Visible focus indicator**: 2px solid, high contrast
- **Focus trap**: In modals/dialogs
- **Skip links**: "Skip to main content" at top

### Keyboard Shortcuts
- `Tab`: Next element
- `Shift + Tab`: Previous element
- `Enter`: Activate button/link
- `Space`: Activate button, check checkbox
- `Escape`: Close modal/dialog
- `Arrow Keys`: Navigate lists/menus

### Implementation
```tsx
// Focus indicator (required on all interactive elements)
<Button className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2">
  Click me
</Button>

// Focus trap in modal
import { useFocusTrap } from '@/lib/hooks/use-focus-trap';

export function Modal({ isOpen, children }) {
  const containerRef = useFocusTrap(isOpen);

  return (
    <div ref={containerRef} role="dialog" aria-modal="true">
      {children}
    </div>
  );
}
```

## Screen Reader Support

### ARIA Attributes
```tsx
// Job Card (Example)
<article
  aria-labelledby="job-title-123"
  aria-describedby="job-summary-123"
>
  <h3 id="job-title-123">Math Teacher</h3>

  <div id="job-summary-123" className="sr-only">
    Math Teacher at International School of Tokyo.
    Salary $30,000 to $45,000 USD per year.
    Visa sponsorship available.
  </div>

  <Button aria-label="Save Math Teacher position at International School of Tokyo">
    <Heart className="h-5 w-5" aria-hidden="true" />
    <span className="sr-only">Save</span>
  </Button>
</article>
```

### Live Regions
```tsx
// Loading state
<div role="status" aria-live="polite" aria-atomic="true">
  <Spinner />
  <span className="sr-only">Loading jobs...</span>
</div>

// Success message
<Toast role="status" aria-live="polite" aria-atomic="true">
  Application submitted successfully!
</Toast>

// Error message
<Alert role="alert" aria-live="assertive">
  <AlertCircle className="h-4 w-4" />
  <AlertTitle>Error</AlertTitle>
  <AlertDescription>Failed to submit application</AlertDescription>
</Alert>
```

## Forms

### Labels
- All inputs must have associated labels
- Use `<Label htmlFor="inputId">` or `aria-label`
- Required fields marked with `aria-required="true"`

### Validation
```tsx
<div>
  <Label htmlFor="email">Email</Label>
  <Input
    id="email"
    type="email"
    aria-required="true"
    aria-invalid={errors.email ? "true" : "false"}
    aria-describedby={errors.email ? "email-error" : undefined}
  />
  {errors.email && (
    <p id="email-error" role="alert" className="text-red-600 text-sm mt-1">
      {errors.email.message}
    </p>
  )}
</div>
```

## Testing Checklist
- [ ] All pages pass axe DevTools (0 violations)
- [ ] All pages pass WAVE (0 errors)
- [ ] Lighthouse accessibility score = 100
- [ ] Can navigate entire app with keyboard only
- [ ] Screen reader announces all content correctly
- [ ] Color contrast ratios meet WCAG AA
- [ ] Focus indicators visible on all elements
- [ ] Skip links present and functional
- [ ] Forms have proper labels and error handling
- [ ] ARIA attributes used correctly
```

**Acceptance Criteria**:
- [ ] Accessibility standards documented
- [ ] Color contrast ratios verified
- [ ] Keyboard patterns defined
- [ ] ARIA usage examples provided
- [ ] Testing checklist created

---

### 3. Design Token System

**Document**: `lib/design-system/tokens.ts`

```typescript
/**
 * Design Tokens for Global Educator Nexus
 * All values defined here should be used throughout the application
 * for consistency and ease of theme management.
 */

export const designTokens = {
  // ========================================
  // COLORS
  // ========================================
  colors: {
    // Brand Colors
    brand: {
      primary: {
        50: '#EFF6FF',
        100: '#DBEAFE',
        200: '#BFDBFE',
        300: '#93C5FD',
        400: '#60A5FA',
        500: '#3B82F6',  // Main brand color
        600: '#2563EB',
        700: '#1D4ED8',
        800: '#1E40AF',
        900: '#1E3A8A',
        950: '#172554',
      },
      secondary: {
        50: '#F0FDF4',
        100: '#DCFCE7',
        200: '#BBF7D0',
        300: '#86EFAC',
        400: '#4ADE80',
        500: '#22C55E',
        600: '#16A34A',  // Main secondary color
        700: '#15803D',
        800: '#166534',
        900: '#14532D',
        950: '#052E16',
      },
    },

    // Semantic Colors
    semantic: {
      success: {
        light: '#D1FAE5',
        DEFAULT: '#10B981',
        dark: '#047857',
        contrast: '#FFFFFF', // Text color on success bg
      },
      warning: {
        light: '#FEF3C7',
        DEFAULT: '#F59E0B',
        dark: '#D97706',
        contrast: '#FFFFFF',
      },
      error: {
        light: '#FEE2E2',
        DEFAULT: '#EF4444',
        dark: '#DC2626',
        contrast: '#FFFFFF',
      },
      info: {
        light: '#DBEAFE',
        DEFAULT: '#3B82F6',
        dark: '#2563EB',
        contrast: '#FFFFFF',
      },
    },

    // Neutral (Gray scale) - Slate palette
    neutral: {
      0: '#FFFFFF',
      50: '#F8FAFC',
      100: '#F1F5F9',
      200: '#E2E8F0',
      300: '#CBD5E1',
      400: '#94A3B8',
      500: '#64748B',
      600: '#475569',
      700: '#334155',
      800: '#1E293B',
      900: '#0F172A',
      950: '#020617',
    },

    // Functional Colors
    visa: {
      sponsored: '#10B981',      // Green
      potential: '#F59E0B',      // Amber
      notSponsored: '#EF4444',   // Red
    },

    applicationStatus: {
      draft: '#94A3B8',          // Gray
      submitted: '#3B82F6',      // Blue
      reviewing: '#F59E0B',      // Amber
      interviewed: '#8B5CF6',    // Purple
      offered: '#10B981',        // Green
      rejected: '#EF4444',       // Red
      withdrawn: '#6B7280',      // Gray
    },
  },

  // ========================================
  // SPACING
  // ========================================
  spacing: {
    0: '0px',
    px: '1px',
    0.5: '0.125rem',   // 2px
    1: '0.25rem',      // 4px
    1.5: '0.375rem',   // 6px
    2: '0.5rem',       // 8px
    2.5: '0.625rem',   // 10px
    3: '0.75rem',      // 12px
    3.5: '0.875rem',   // 14px
    4: '1rem',         // 16px
    5: '1.25rem',      // 20px
    6: '1.5rem',       // 24px
    7: '1.75rem',      // 28px
    8: '2rem',         // 32px
    9: '2.25rem',      // 36px
    10: '2.5rem',      // 40px
    11: '2.75rem',     // 44px
    12: '3rem',        // 48px
    14: '3.5rem',      // 56px
    16: '4rem',        // 64px
    20: '5rem',        // 80px
    24: '6rem',        // 96px
    28: '7rem',        // 112px
    32: '8rem',        // 128px
    36: '9rem',        // 144px
    40: '10rem',       // 160px
    44: '11rem',       // 176px
    48: '12rem',       // 192px
    52: '13rem',       // 208px
    56: '14rem',       // 224px
    60: '15rem',       // 240px
    64: '16rem',       // 256px
    72: '18rem',       // 288px
    80: '20rem',       // 320px
    96: '24rem',       // 384px
  },

  // ========================================
  // TYPOGRAPHY
  // ========================================
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'Courier New', 'monospace'],
    },

    fontSize: {
      xs: ['0.75rem', { lineHeight: '1rem', letterSpacing: '0.025em' }],       // 12px
      sm: ['0.875rem', { lineHeight: '1.25rem', letterSpacing: '0em' }],       // 14px
      base: ['1rem', { lineHeight: '1.5rem', letterSpacing: '0em' }],          // 16px
      lg: ['1.125rem', { lineHeight: '1.75rem', letterSpacing: '-0.0125em' }], // 18px
      xl: ['1.25rem', { lineHeight: '1.75rem', letterSpacing: '-0.0125em' }],  // 20px
      '2xl': ['1.5rem', { lineHeight: '2rem', letterSpacing: '-0.025em' }],    // 24px
      '3xl': ['1.875rem', { lineHeight: '2.25rem', letterSpacing: '-0.025em' }], // 30px
      '4xl': ['2.25rem', { lineHeight: '2.5rem', letterSpacing: '-0.025em' }], // 36px
      '5xl': ['3rem', { lineHeight: '1', letterSpacing: '-0.025em' }],         // 48px
      '6xl': ['3.75rem', { lineHeight: '1', letterSpacing: '-0.025em' }],      // 60px
      '7xl': ['4.5rem', { lineHeight: '1', letterSpacing: '-0.025em' }],       // 72px
    },

    fontWeight: {
      thin: '100',
      extralight: '200',
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
      black: '900',
    },

    letterSpacing: {
      tighter: '-0.05em',
      tight: '-0.025em',
      normal: '0em',
      wide: '0.025em',
      wider: '0.05em',
      widest: '0.1em',
    },

    lineHeight: {
      none: '1',
      tight: '1.25',
      snug: '1.375',
      normal: '1.5',
      relaxed: '1.625',
      loose: '2',
    },
  },

  // ========================================
  // BORDER RADIUS
  // ========================================
  borderRadius: {
    none: '0px',
    sm: '0.125rem',      // 2px
    DEFAULT: '0.25rem',  // 4px
    md: '0.375rem',      // 6px
    lg: '0.5rem',        // 8px
    xl: '0.75rem',       // 12px
    '2xl': '1rem',       // 16px
    '3xl': '1.5rem',     // 24px
    full: '9999px',
  },

  // ========================================
  // SHADOWS
  // ========================================
  boxShadow: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
    none: '0 0 #0000',
  },

  // ========================================
  // Z-INDEX SCALE
  // ========================================
  zIndex: {
    base: 0,
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
    notification: 1080,
  },

  // ========================================
  // TRANSITIONS
  // ========================================
  transitions: {
    duration: {
      instant: '0ms',
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
      slower: '700ms',
    },

    timing: {
      linear: 'linear',
      in: 'cubic-bezier(0.4, 0, 1, 1)',
      out: 'cubic-bezier(0, 0, 0.2, 1)',
      inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    },

    property: {
      none: 'none',
      all: 'all',
      colors: 'color, background-color, border-color, text-decoration-color, fill, stroke',
      opacity: 'opacity',
      shadow: 'box-shadow',
      transform: 'transform',
    },
  },

  // ========================================
  // BREAKPOINTS
  // ========================================
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },

  // ========================================
  // CONTAINER
  // ========================================
  container: {
    padding: {
      DEFAULT: '1rem',   // 16px
      sm: '2rem',        // 32px
      lg: '4rem',        // 64px
      xl: '5rem',        // 80px
      '2xl': '6rem',     // 96px
    },
    maxWidth: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
  },
} as const;

// Export individual token categories
export const { colors, spacing, typography, borderRadius, boxShadow, zIndex, transitions, breakpoints, container } = designTokens;

// Type exports for TypeScript
export type DesignTokens = typeof designTokens;
export type ColorTokens = typeof colors;
export type SpacingTokens = typeof spacing;
export type TypographyTokens = typeof typography;
```

**Tailwind Integration**:
```javascript
// tailwind.config.js
import { designTokens } from './lib/design-system/tokens';

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: designTokens.colors,
      spacing: designTokens.spacing,
      fontFamily: designTokens.typography.fontFamily,
      fontSize: designTokens.typography.fontSize,
      fontWeight: designTokens.typography.fontWeight,
      letterSpacing: designTokens.typography.letterSpacing,
      lineHeight: designTokens.typography.lineHeight,
      borderRadius: designTokens.borderRadius,
      boxShadow: designTokens.boxShadow,
      zIndex: designTokens.zIndex,
      transitionDuration: designTokens.transitions.duration,
      transitionTimingFunction: designTokens.transitions.timing,
      transitionProperty: designTokens.transitions.property,
      screens: designTokens.breakpoints,
      container: designTokens.container,
    },
  },
  plugins: [],
};
```

**Acceptance Criteria**:
- [ ] Design tokens file created
- [ ] Tailwind config integrated
- [ ] All token categories defined
- [ ] TypeScript types exported
- [ ] Documentation written

---

## Phase 0 Deliverables

### Required Documents
- [ ] `docs/BASELINE_METRICS.md` - Complete baseline analysis
- [ ] `docs/USER_RESEARCH_BASELINE.md` - User interview findings
- [ ] `docs/MOBILE_STANDARDS.md` - Mobile-first guidelines
- [ ] `docs/ACCESSIBILITY_STANDARDS.md` - WCAG 2.1 AA compliance
- [ ] `lib/design-system/tokens.ts` - Design token system

### Required Infrastructure
- [ ] Vitest unit testing configured
- [ ] Playwright E2E testing configured
- [ ] axe-core accessibility testing configured
- [ ] Percy visual regression testing configured
- [ ] All sample tests passing

### Required Data
- [ ] Lighthouse audits for 4 pages
- [ ] Google Analytics data (30 days)
- [ ] Database conversion funnel
- [ ] 20 user interviews completed
- [ ] Baseline documented with quantifiable metrics

### Quality Gates
- [ ] All tests passing in CI/CD
- [ ] Test coverage > 0% (baseline)
- [ ] Accessibility violations = 0 (on tested pages)
- [ ] Performance baseline documented

---

## Phase 0 Timeline

| Days | Tasks | Owner | Status |
|------|-------|-------|--------|
| 1-2 | Lighthouse audits + Analytics export | DevOps | 🔴 Not Started |
| 2-3 | Database queries + Documentation | Backend | 🔴 Not Started |
| 3-5 | User interviews (20 participants) | Product | 🔴 Not Started |
| 5-6 | Vitest + Playwright setup | Frontend | 🔴 Not Started |
| 6-7 | Accessibility + Visual testing setup | Frontend | 🔴 Not Started |
| 7-8 | Mobile standards documentation | Design | 🔴 Not Started |
| 8-9 | Accessibility standards documentation | Design | 🔴 Not Started |
| 9-10 | Design tokens creation | Design + Frontend | 🔴 Not Started |

**Total Duration**: 10 days (2 weeks)

---

## Success Criteria for Phase 0

### Quantitative
- [ ] 100% of baseline metrics documented
- [ ] 4 pages audited with Lighthouse
- [ ] 20 user interviews completed
- [ ] 0 test failures in CI/CD
- [ ] 100% of standards documented

### Qualitative
- [ ] Team consensus on mobile strategy
- [ ] Team consensus on accessibility approach
- [ ] Design tokens approved by design lead
- [ ] Testing infrastructure validated

### Readiness Gate
**Cannot proceed to Phase 1 without**:
1. Complete baseline metrics document
2. All testing infrastructure passing
3. All standards documents approved
4. Design tokens integrated

---

# PHASE 1: Specification

> **Duration**: 1 week (Days 11-17)
> **Goal**: Define all requirements with acceptance criteria
> **Prerequisite**: Phase 0 complete

## Overview

Phase 1 translates Wellfound benchmark insights into concrete, testable requirements using our baseline data as the measuring stick.

---

## Requirements Specification

### 1. Functional Requirements

#### FR-001: Enhanced Hero Section
**Priority**: P0 (Critical)
**Baseline**: Current hero has no animations, generic messaging, single CTA
**Target**: Wellfound-style animated hero with dual CTAs and social proof

**Requirements**:
1. Animated headline with word-by-word reveal (GSAP)
2. Rotating subheadline showcasing global opportunities
3. Dual CTAs: "Find Teaching Jobs" + "Hire Teachers"
4. Social proof metrics (animated counters)
5. Quick navigation cards (4 cards)
6. Parallax background elements

**Acceptance Criteria**:
```gherkin
Feature: Enhanced Hero Section

Scenario: User lands on homepage
  Given I am on the homepage
  Then I should see the hero section load within 1.5 seconds
  And the headline should animate in word-by-word over 1 second
  And I should see 2 CTA buttons side-by-side
  And I should see 3 social proof metrics
  And I should see 4 quick navigation cards

Scenario: Hero animation performance
  Given I am on the homepage
  When the hero animations run
  Then the animation should not cause layout shift (CLS < 0.1)
  And the animation should maintain 60fps
  And the Total Blocking Time should be < 200ms

Scenario: Dual CTAs for different audiences
  Given I am a teacher looking for jobs
  When I click "Find Teaching Jobs" CTA
  Then I should be taken to /jobs page

  Given I am a school recruiter
  When I click "Hire Teachers" CTA
  Then I should be taken to /recruiter/post-job page

Scenario: Social proof metrics
  Given I am on the homepage
  Then I should see "1,000+ teachers placed" metric
  And I should see "500+ schools in 50+ countries" metric
  And I should see "95% visa success rate" metric
  And all metrics should animate/count up on first view

Scenario: Quick navigation cards
  Given I am on the homepage
  Then I should see 4 navigation cards:
    | Card | Destination |
    | Browse by Country | /jobs?groupBy=country |
    | Browse by Subject | /jobs?groupBy=subject |
    | International Schools | /jobs?type=international |
    | ESL/TEFL Jobs | /jobs?type=esl |
  And each card should have hover effect
  And each card should be keyboard accessible
```

**Performance Requirements**:
- First Contentful Paint: < 1.5s (baseline: __s)
- Animation FPS: 60fps
- No Cumulative Layout Shift during animation
- Animation bundle size: < 50KB gzipped

**Accessibility Requirements**:
- Animations respect `prefers-reduced-motion`
- Both CTAs keyboard accessible
- Social proof metrics announced to screen readers
- Focus indicators visible on all interactive elements

---

#### FR-002: Role-Based Navigation
**Priority**: P0 (Critical)
**Baseline**: Generic navigation with no role differentiation
**Target**: Wellfound-style dual-audience navigation with dropdowns

**Requirements**:
1. Sticky header on scroll with background fade
2. Three dropdown menus: "Discover", "For Teachers", "For Schools"
3. Mobile hamburger menu with slide-in animation
4. Mobile bottom navigation for primary actions
5. Search bar in header (desktop)

**Acceptance Criteria**:
```gherkin
Feature: Role-Based Navigation

Scenario: Desktop navigation structure
  Given I am on desktop (>= 1024px)
  When I view the header
  Then I should see:
    | Element | Visibility |
    | Logo | Visible |
    | Discover dropdown | Visible |
    | For Teachers dropdown | Visible |
    | For Schools dropdown | Visible |
    | Search bar | Visible |
    | Log In button | Visible |
    | Sign Up button | Visible |

Scenario: Sticky header behavior
  Given I am on the homepage
  When I scroll down 100px
  Then the header should stick to the top
  And the header background should fade in
  And the header should have a subtle shadow
  When I scroll back to top
  Then the header background should fade out
  And the shadow should disappear

Scenario: Discover dropdown menu
  Given I am on desktop
  When I hover over "Discover" menu
  Then I should see dropdown with:
    | Item | Icon | Link |
    | Browse All Jobs | Search | /jobs |
    | Jobs by Country | Globe | /jobs?groupBy=country |
    | Jobs by Subject | Book | /jobs?groupBy=subject |
    | Interactive Map | MapPin | /map |
  And I can navigate with keyboard (Tab, Enter, Escape)

Scenario: For Teachers dropdown menu
  Given I am on desktop
  When I hover over "For Teachers" menu
  Then I should see dropdown with:
    | Item | Link |
    | Find Jobs | /jobs |
    | Your Profile | /profile |
    | Dashboard | /dashboard |
    | Visa Guide | /resources/visa-guide |
    | Salary Calculator | /resources/salary-calculator |

Scenario: Mobile navigation (< 768px)
  Given I am on mobile
  When I view the header
  Then I should see:
    | Element | Visibility |
    | Logo | Visible |
    | Search icon | Visible |
    | Menu hamburger | Visible |
    | Log In button | Hidden |
    | Sign Up button | Hidden |

Scenario: Mobile hamburger menu
  Given I am on mobile
  When I tap the hamburger menu
  Then the menu should slide in from right
  And the background should dim
  And I should see all navigation items
  When I tap the close button or background
  Then the menu should slide out
  And the background should return to normal

Scenario: Mobile bottom navigation
  Given I am on mobile
  And I am logged in
  When I view any page
  Then I should see bottom navigation with:
    | Icon | Label | Link |
    | Home | Home | / |
    | Search | Jobs | /jobs |
    | Heart | Saved | /saved |
    | User | Profile | /profile |
  And the current page should be highlighted
```

**Performance Requirements**:
- Dropdown opens within 100ms of hover
- Sticky header transition smooth (60fps)
- Mobile menu slide animation 300ms
- No layout shift when header becomes sticky

**Accessibility Requirements**:
- Dropdowns accessible via keyboard (Tab, Arrow keys, Enter, Escape)
- ARIA attributes: `aria-expanded`, `aria-haspopup`, `role="menu"`
- Focus trap in mobile menu when open
- Skip link: "Skip to main content"

---

#### FR-003: Enhanced Job Cards
**Priority**: P0 (Critical)
**Baseline**: Basic job cards with minimal info, no quick actions
**Target**: Wellfound-style cards with Quick Apply, Save, and rich info

**Requirements**:
1. School logo/initial avatar
2. Visa sponsorship badge (prominent)
3. Salary range displayed (not hidden)
4. Quick Apply button
5. Save/Favorite button with heart icon
6. Hover elevation effect
7. Featured/Urgent badges

**Acceptance Criteria**:
```gherkin
Feature: Enhanced Job Cards

Scenario: Job card information display
  Given I am viewing a job card
  Then I should see:
    | Element | Format |
    | School logo | 48x48px rounded image or initial |
    | Job title | H3 heading, truncated at 2 lines |
    | School name | Gray text, truncated at 1 line |
    | Location | With MapPin icon: "Tokyo, Japan" |
    | Salary | With DollarSign icon: "USD $30K-$45K" |
    | Start date | With Calendar icon: "August 2025" |
    | Subjects | Up to 2 badges, "+N" for more |
    | Contract type | Badge: "2 Years" |
  And if visa sponsorship available:
    | Badge | "Visa Sponsored" with Plane icon, green |

Scenario: Quick Apply functionality
  Given I am logged in as a teacher
  And my profile is 100% complete
  When I click "Quick Apply" on a job card
  Then I should see a confirmation modal
  And the modal should show:
    | Info | Source |
    | Job title | From job |
    | School name | From job |
    | My video resume URL | From profile |
    | My CV URL | From profile |
  When I click "Confirm Application"
  Then my application should be submitted
  And I should see success toast
  And the card should show "Applied" badge
  And I should see 3 similar job suggestions

Scenario: Quick Apply with incomplete profile
  Given I am logged in as a teacher
  And my profile is incomplete
  When I click "Quick Apply" on a job card
  Then I should see a modal saying "Complete your profile first"
  And I should see which fields are missing
  And I should see "Complete Profile" button
  When I click "Complete Profile"
  Then I should be taken to /profile page

Scenario: Save job functionality
  Given I am logged in
  When I click the heart icon on a job card
  Then the heart should fill with color (animation)
  And I should see "Job saved" toast
  And the job should appear in /saved page
  When I click the filled heart icon
  Then the heart should unfill (animation)
  And I should see "Job removed from saved" toast

Scenario: Hover effects
  Given I am on desktop
  When I hover over a job card
  Then the card should:
    | Effect | Value |
    | Elevation | Increase shadow from sm to lg |
    | Transform | translateY(-4px) |
    | Duration | 300ms |
    | Timing | ease-out |

Scenario: Featured job badge
  Given a job is marked as featured
  When I view the job card
  Then I should see "Featured" badge
  And the badge should be blue with white text
  And the card should have a blue border (2px)

Scenario: Urgent job badge
  Given a job is marked as urgent
  When I view the job card
  Then I should see "Urgent" badge
  And the badge should be red with pulsing animation
```

**Performance Requirements**:
- Card hover animation maintains 60fps
- Image loading uses Next/Image with blur placeholder
- Card renders in < 50ms

**Accessibility Requirements**:
- Card is single focusable element (article)
- Descriptive aria-label for screen readers
- Save button: `aria-label="Save [Job Title] at [School]"`
- Quick Apply button: `aria-label="Quick apply for [Job Title] position"`
- All icons: `aria-hidden="true"`

---

#### FR-004: Advanced Filters Panel
**Priority**: P0 (Critical)
**Baseline**: Basic dropdowns, no real-time filtering, poor mobile experience
**Target**: Wellfound-style sidebar with real-time filtering, counts, and mobile sheet

**Requirements**:
1. Sticky sidebar on desktop (left side)
2. Real-time filtering (no submit button)
3. Filter counts (e.g., "Japan (45)")
4. Accordion sections with expand/collapse
5. Quick filters at top (Visa, Remote, Urgent)
6. Clear all button
7. Active filter badges
8. Mobile: Bottom sheet with backdrop
9. URL state sync

**Acceptance Criteria**:
```gherkin
Feature: Advanced Filters Panel

Scenario: Desktop filter panel layout
  Given I am on desktop (>= 1024px)
  And I am on /jobs page
  Then I should see filters panel on left side
  And the panel should be 320px wide
  And the panel should stick on scroll
  And I should see:
    | Section | Expanded by Default |
    | Quick Filters | Yes |
    | Country | Yes |
    | Subject | Yes |
    | Salary Range | No |
    | Contract Type | No |
    | School Type | No |
    | Experience Level | No |

Scenario: Quick filters
  Given I am on /jobs page
  When I click "Visa Sponsorship" quick filter
  Then it should toggle to active state (blue bg)
  And job results should update immediately
  And URL should update: /jobs?visa=true
  And I should see filter count badge on header

Scenario: Country filter with counts
  Given I am on /jobs page
  When I view the Country section
  Then I should see countries with job counts:
    | Country | Count |
    | Japan | 45 |
    | South Korea | 32 |
    | China | 28 |
    | UAE | 15 |
  When I check "Japan"
  Then job results should update immediately
  And URL should update: /jobs?countries=Japan
  And "Japan" should show in active filters

Scenario: Multiple filters interaction
  Given I am on /jobs page
  When I select:
    | Filter | Value |
    | Country | Japan |
    | Subject | Math |
    | Visa | true |
  Then job results should show only jobs that match ALL filters (AND logic)
  And URL should be: /jobs?countries=Japan&subjects=Math&visa=true
  And I should see 3 active filter badges

Scenario: Clear all filters
  Given I have 5 filters active
  When I click "Clear All" button
  Then all filters should be unchecked
  And job results should show all jobs
  And URL should be: /jobs
  And active filter badges should disappear

Scenario: Salary range slider
  Given I am on /jobs page
  When I open "Salary Range" accordion
  Then I should see a dual-thumb slider
  And min should be $0
  And max should be $150,000
  When I drag the min thumb to $30,000
  And I drag the max thumb to $50,000
  Then job results should update after I release
  And I should see "$30K - $50K" displayed

Scenario: Mobile filters (< 768px)
  Given I am on mobile
  And I am on /jobs page
  Then the filters panel should be hidden
  And I should see "Filters" button in header
  When I tap "Filters" button
  Then filters should slide up as bottom sheet
  And background should dim
  And I should see all filter options
  When I tap "Apply Filters" button
  Then sheet should slide down
  And results should update
  When I tap the backdrop
  Then sheet should slide down

Scenario: URL state synchronization
  Given I am on /jobs?countries=Japan,Korea&subjects=Math&visa=true
  When the page loads
  Then the filters panel should pre-select:
    | Filter | Values |
    | Countries | Japan, Korea |
    | Subjects | Math |
    | Visa | true |
  And job results should match the filters

Scenario: Filter counts update
  Given I have "Country: Japan" selected
  When I view other filter sections
  Then the counts should reflect jobs available in Japan:
    | Filter | Count (before) | Count (with Japan) |
    | Math | 150 | 25 |
    | Science | 120 | 18 |
```

**Performance Requirements**:
- Filter update reflects in results within 300ms
- URL update debounced (500ms)
- Sidebar scroll is smooth (60fps)
- Mobile sheet animation is 300ms

**Accessibility Requirements**:
- Accordion sections use proper ARIA: `aria-expanded`, `aria-controls`
- Checkboxes have associated labels
- Slider is keyboard accessible (arrow keys)
- Mobile sheet has focus trap when open
- "Clear All" button is keyboard accessible

---

#### FR-005: One-Click Apply Flow
**Priority**: P0 (Critical)
**Baseline**: Multi-step application form with 5+ fields
**Target**: Wellfound-style one-click apply for complete profiles

**Requirements**:
1. Profile completeness check (video, CV, bio)
2. One-click apply button (green, prominent)
3. Confirmation modal with profile preview
4. Optimistic UI update
5. Success toast with similar jobs
6. Application tracking in dashboard

**Acceptance Criteria**:
```gherkin
Feature: One-Click Apply Flow

Scenario: Complete profile - one-click apply
  Given I am logged in as a teacher
  And my profile is 100% complete:
    | Field | Status |
    | Video resume | Uploaded |
    | CV | Uploaded |
    | Bio | Written |
    | Experience | Added |
    | Education | Added |
  When I view a job card
  Then I should see "Quick Apply" button (green)
  When I click "Quick Apply"
  Then I should see confirmation modal within 200ms
  And the modal should show:
    | Section | Content |
    | Job title | From job |
    | School name | From job |
    | Your video | Thumbnail + play button |
    | Your CV | Filename + download link |
    | Your bio | First 200 characters |
  And I should see "Confirm Application" button
  And I should see "Cancel" button

Scenario: Submit application from modal
  Given I am viewing the application confirmation modal
  When I click "Confirm Application"
  Then the modal should show loading state
  And the button should say "Submitting..."
  And within 2 seconds:
    | Action |
    | Application is saved to database |
    | Notification sent to recruiter |
    | Success state shown |
  Then I should see success toast: "Application submitted! We'll notify you of updates."
  And the modal should close automatically after 2s
  And the job card should show "Applied" badge
  And I should see 3 similar job suggestions

Scenario: Similar job suggestions after apply
  Given I just applied to a job:
    | Job Details |
    | Math Teacher |
    | Japan |
    | International School |
  Then I should see 3 similar jobs based on:
    | Criteria | Weight |
    | Same subject | 40% |
    | Same country | 30% |
    | Same school type | 20% |
    | Similar salary | 10% |
  And each suggestion should have "Quick Apply" button

Scenario: Incomplete profile - guided completion
  Given I am logged in as a teacher
  And my profile is incomplete:
    | Field | Status |
    | Video resume | Missing |
    | CV | Uploaded |
    | Bio | Missing |
  When I click "Quick Apply" on a job
  Then I should see "Complete Your Profile" modal
  And the modal should show:
    | Section | Status |
    | Video Resume | ❌ Add a video resume (required) |
    | CV | ✅ Uploaded |
    | Bio | ❌ Write a bio (required) |
    | Experience | ⚠️ Add experience (recommended) |
  And I should see "Complete Profile" button
  When I click "Complete Profile"
  Then I should be taken to /profile page
  And the missing fields should be highlighted

Scenario: Optimistic UI update
  Given I click "Confirm Application"
  When the API request is in flight
  Then the job card should immediately show "Applied" badge
  And the "Quick Apply" button should be disabled
  If the API request fails:
    Then the badge should revert
    And I should see error toast
    And the "Quick Apply" button should re-enable
  If the API request succeeds:
    Then the "Applied" badge should remain
    And the button should stay disabled

Scenario: Application tracking in dashboard
  Given I have applied to 5 jobs
  When I go to /dashboard
  Then I should see "My Applications" section
  And I should see all 5 applications with:
    | Field | Display |
    | Job title | Link to job |
    | School name | Plain text |
    | Applied date | "2 days ago" |
    | Status | Badge: Submitted/Reviewing/Interviewed |
    | Actions | View, Withdraw |
```

**Performance Requirements**:
- Modal opens in < 200ms
- API request completes in < 2s
- Optimistic update is instant (0ms)
- Similar jobs load in < 1s

**Accessibility Requirements**:
- Modal has focus trap
- Close button: `aria-label="Close application modal"`
- Profile preview sections have proper headings (h3)
- Error messages announced to screen readers with `role="alert"`

---

### 2. Non-Functional Requirements

#### NFR-001: Performance
**Based on**: Baseline Lighthouse audits

| Metric | Current (Baseline) | Target | Measurement |
|--------|-------------------|--------|-------------|
| Homepage FCP | [From baseline] | < 1.5s | Lighthouse |
| Homepage LCP | [From baseline] | < 2.5s | Lighthouse |
| Homepage TBT | [From baseline] | < 200ms | Lighthouse |
| Homepage CLS | [From baseline] | < 0.1 | Lighthouse |
| Jobs Page FCP | [From baseline] | < 1.8s | Lighthouse |
| Jobs Page LCP | [From baseline] | < 2.8s | Lighthouse |
| Mobile FCP (3G) | [From baseline] | < 2.5s | Lighthouse (throttled) |
| JavaScript Bundle | [From baseline] | < 200KB gzipped | Webpack Bundle Analyzer |
| CSS Bundle | [From baseline] | < 50KB gzipped | Webpack Bundle Analyzer |

**Acceptance Criteria**:
- All metrics must be within target on CI/CD pipeline
- Performance budget enforced (build fails if exceeded)
- Core Web Vitals pass for 75th percentile of users

---

#### NFR-002: Accessibility
**Based on**: WCAG 2.1 AA standard

| Requirement | Target | Verification |
|-------------|--------|--------------|
| Axe violations | 0 | axe DevTools |
| WAVE errors | 0 | WAVE browser extension |
| Lighthouse a11y score | 100 | Lighthouse |
| Color contrast | 4.5:1 (normal), 3:1 (large) | Manual + automated |
| Keyboard navigation | 100% of features | Manual testing |
| Screen reader support | All content announced | NVDA/VoiceOver testing |

**Acceptance Criteria**:
- Zero accessibility violations on all pages
- All interactive elements keyboard accessible
- All images have alt text
- All forms have labels
- All ARIA attributes used correctly

---

#### NFR-003: Mobile Experience
**Based on**: Mobile standards document

| Requirement | Target | Verification |
|-------------|--------|--------------|
| Touch targets | Minimum 44x44px | Visual inspection |
| Touch target spacing | Minimum 8px | Visual inspection |
| Mobile navigation | Bottom nav + hamburger | Manual testing |
| Responsive breakpoints | 640px, 768px, 1024px | Visual testing |
| Mobile performance (3G) | FCP < 2.5s | Lighthouse (throttled) |

**Acceptance Criteria**:
- All buttons and links meet touch target size
- Bottom navigation present on all mobile pages
- All pages responsive at all breakpoints
- Mobile gestures work (swipe, pull-to-refresh)

---

#### NFR-004: Browser Compatibility

| Browser | Minimum Version | Market Share |
|---------|----------------|--------------|
| Chrome | Latest - 2 | 65% |
| Safari | Latest - 2 | 20% |
| Firefox | Latest - 2 | 5% |
| Edge | Latest - 2 | 8% |
| Mobile Safari | iOS 14+ | 15% |
| Mobile Chrome | Latest - 2 | 40% |

**Acceptance Criteria**:
- Visual regression tests pass on all browsers
- E2E tests pass on Chrome, Firefox, Safari
- Mobile tests pass on iOS and Android

---

## User Stories & Acceptance Criteria

### Epic 1: Homepage Redesign

#### US-001: Animated Hero Section
**As a** visitor
**I want to** see an engaging, animated hero section
**So that** I understand the platform's value proposition immediately

**Acceptance Criteria**:
- [ ] Headline animates in word-by-word
- [ ] Subheadline rotates between 4 regions
- [ ] 2 CTAs visible: teachers and schools
- [ ] 3 social proof metrics animate on scroll
- [ ] 4 quick nav cards with hover effects
- [ ] Animations respect `prefers-reduced-motion`

**Definition of Done**:
- [ ] Code reviewed and approved
- [ ] Unit tests passing (95% coverage)
- [ ] E2E test passing
- [ ] Accessibility audit passing (0 violations)
- [ ] Performance within target (FCP < 1.5s)
- [ ] Merged to main

---

#### US-002: Role-Based Navigation
**As a** user (teacher or recruiter)
**I want to** see navigation tailored to my role
**So that** I can quickly find relevant features

**Acceptance Criteria**:
- [ ] Header has 3 dropdown menus
- [ ] Dropdowns open on hover (desktop)
- [ ] Mobile has hamburger menu
- [ ] Mobile has bottom navigation
- [ ] Header becomes sticky on scroll
- [ ] Search bar in header (desktop)

**Definition of Done**:
- [ ] Code reviewed and approved
- [ ] Unit tests passing (90% coverage)
- [ ] E2E test passing (navigation flows)
- [ ] Accessibility audit passing (keyboard nav)
- [ ] Cross-browser tested
- [ ] Merged to main

---

### Epic 2: Job Discovery Enhancement

#### US-003: Enhanced Job Cards
**As a** teacher
**I want to** see comprehensive job information at a glance
**So that** I can quickly evaluate opportunities

**Acceptance Criteria**:
- [ ] School logo displayed
- [ ] Salary range visible
- [ ] Visa badge prominent (if applicable)
- [ ] Quick Apply button functional
- [ ] Save button toggles favorite status
- [ ] Hover effect elevates card

**Definition of Done**:
- [ ] Code reviewed and approved
- [ ] Unit tests passing (90% coverage)
- [ ] E2E test passing (apply + save flows)
- [ ] Accessibility audit passing
- [ ] Visual regression test passing
- [ ] Merged to main

---

#### US-004: Advanced Filters
**As a** teacher
**I want to** filter jobs by multiple criteria in real-time
**So that** I can find relevant opportunities quickly

**Acceptance Criteria**:
- [ ] Sidebar filters on desktop
- [ ] Bottom sheet filters on mobile
- [ ] Real-time result updates
- [ ] Filter counts displayed
- [ ] Active filters shown as badges
- [ ] Clear all functionality

**Definition of Done**:
- [ ] Code reviewed and approved
- [ ] Unit tests passing (85% coverage)
- [ ] E2E test passing (filter combinations)
- [ ] Accessibility audit passing
- [ ] URL state tested
- [ ] Merged to main

---

#### US-005: One-Click Apply
**As a** teacher with a complete profile
**I want to** apply to jobs with one click
**So that** I can apply to multiple jobs quickly

**Acceptance Criteria**:
- [ ] Profile completeness checked
- [ ] Confirmation modal shows profile preview
- [ ] Application submits in < 2s
- [ ] Success toast with similar jobs
- [ ] Optimistic UI update
- [ ] Dashboard shows application

**Definition of Done**:
- [ ] Code reviewed and approved
- [ ] Unit tests passing (95% coverage)
- [ ] E2E test passing (end-to-end flow)
- [ ] Accessibility audit passing
- [ ] Error handling tested
- [ ] Merged to main

---

## Component Specifications

### COMP-001: AnimatedText Component

**Purpose**: Animate text with word-by-word or character-by-character reveals

**Props**:
```typescript
interface AnimatedTextProps {
  text: string;
  animation?: 'slide-up' | 'fade-in' | 'rotate-in';
  stagger?: number;  // Delay between characters (ms)
  delay?: number;    // Initial delay (ms)
  className?: string;
}
```

**Behavior**:
1. On mount, split text into characters using SplitType
2. Animate each character with GSAP based on animation type
3. Respect `prefers-reduced-motion` media query
4. Clean up on unmount

**Dependencies**:
- `gsap` v3.12+
- `split-type` v0.3+

**Tests**:
- [ ] Renders text correctly
- [ ] Animates on mount
- [ ] Respects prefers-reduced-motion
- [ ] Cleans up on unmount

---

### COMP-002: JobCardV2 Component

**Purpose**: Display job information with enhanced UI and quick actions

**Props**:
```typescript
interface JobCardV2Props {
  job: {
    id: string;
    title: string;
    school: string;
    logo?: string;
    location: string;
    country: string;
    salaryMin?: number;
    salaryMax?: number;
    currency: string;
    visaSponsorship: boolean;
    contractType: string;
    startDate: string;
    subjects: string[];
    isUrgent?: boolean;
    isFeatured?: boolean;
  };
  onSave?: (id: string) => void;
  onQuickApply?: (id: string) => void;
  isSaved?: boolean;
  isApplied?: boolean;
}
```

**Behavior**:
1. Display all job information
2. Show school logo or generated initial
3. Handle save toggle with animation
4. Handle quick apply click
5. Show appropriate badges (featured, urgent, visa)
6. Apply hover effects on desktop

**Tests**:
- [ ] Renders job information correctly
- [ ] Shows visa badge when applicable
- [ ] Save button toggles state
- [ ] Quick Apply button calls handler
- [ ] Hover effects applied
- [ ] Accessibility attributes correct

---

### COMP-003: FiltersPanel Component

**Purpose**: Provide comprehensive filtering interface with real-time updates

**Props**:
```typescript
interface FiltersPanelProps {
  initialFilters?: JobFilters;
  onFilterChange: (filters: JobFilters) => void;
  filterCounts: {
    countries: Record<string, number>;
    subjects: Record<string, number>;
    // ... more counts
  };
}

interface JobFilters {
  countries: string[];
  subjects: string[];
  visaSponsorship: boolean;
  salaryRange: [number, number];
  contractTypes: string[];
  schoolTypes: string[];
  experienceLevel: string[];
}
```

**Behavior**:
1. Display all filter sections in accordions
2. Update filters on user interaction
3. Call onFilterChange callback
4. Show active filter count badges
5. Support "Clear All" functionality
6. Mobile: Render as bottom sheet

**Tests**:
- [ ] Renders all filter sections
- [ ] Updates filters on interaction
- [ ] Calls onChange callback
- [ ] Shows filter counts
- [ ] Clear all works
- [ ] Mobile sheet opens/closes

---

## Design System Specification

### Typography Scale

```typescript
// lib/design-system/typography.tsx
export const Typography = {
  Display: ({ children, className }: TypographyProps) => (
    <h1 className={cn("text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight", className)}>
      {children}
    </h1>
  ),

  H1: ({ children, className }: TypographyProps) => (
    <h1 className={cn("text-3xl md:text-4xl font-bold tracking-tight", className)}>
      {children}
    </h1>
  ),

  H2: ({ children, className }: TypographyProps) => (
    <h2 className={cn("text-2xl md:text-3xl font-semibold tracking-tight", className)}>
      {children}
    </h2>
  ),

  H3: ({ children, className }: TypographyProps) => (
    <h3 className={cn("text-xl md:text-2xl font-semibold", className)}>
      {children}
    </h3>
  ),

  BodyLarge: ({ children, className }: TypographyProps) => (
    <p className={cn("text-lg leading-relaxed text-neutral-700", className)}>
      {children}
    </p>
  ),

  Body: ({ children, className }: TypographyProps) => (
    <p className={cn("text-base leading-relaxed text-neutral-700", className)}>
      {children}
    </p>
  ),

  BodySmall: ({ children, className }: TypographyProps) => (
    <p className={cn("text-sm leading-relaxed text-neutral-600", className)}>
      {children}
    </p>
  ),

  Caption: ({ children, className }: TypographyProps) => (
    <span className={cn("text-xs text-neutral-500", className)}>
      {children}
    </span>
  ),

  Lead: ({ children, className }: TypographyProps) => (
    <p className={cn("text-xl leading-relaxed text-neutral-600", className)}>
      {children}
    </p>
  ),
};
```

---

### Animation Presets

```typescript
// lib/design-system/animation-presets.ts
export const animationPresets = {
  // Fade animations
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.3 },
  },

  fadeInUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.4, ease: 'easeOut' },
  },

  // Scale animations
  scaleIn: {
    initial: { scale: 0.9, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.9, opacity: 0 },
    transition: { duration: 0.2, ease: 'easeOut' },
  },

  // Slide animations
  slideInRight: {
    initial: { x: '100%' },
    animate: { x: 0 },
    exit: { x: '100%' },
    transition: { duration: 0.3, ease: 'easeInOut' },
  },

  slideInUp: {
    initial: { y: '100%' },
    animate: { y: 0 },
    exit: { y: '100%' },
    transition: { duration: 0.3, ease: 'easeInOut' },
  },

  // Hover presets (for Framer Motion hover state)
  hoverLift: {
    whileHover: {
      y: -4,
      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
      transition: { duration: 0.2 },
    },
  },

  hoverScale: {
    whileHover: {
      scale: 1.05,
      transition: { duration: 0.2 },
    },
  },
};
```

---

## Phase 1 Deliverables

### Documents
- [ ] Complete requirements specification (this document)
- [ ] User stories with acceptance criteria
- [ ] Component specifications
- [ ] Design system specification
- [ ] API contracts (if new endpoints needed)

### Artifacts
- [ ] Figma mockups for all new components
- [ ] User flow diagrams
- [ ] Architecture diagrams (updated)
- [ ] Database schema changes (if any)

### Sign-offs
- [ ] Product Owner approval
- [ ] Design Lead approval
- [ ] Engineering Lead approval
- [ ] QA Lead approval

---

## Phase 1 Timeline

| Days | Tasks | Owner | Status |
|------|-------|-------|--------|
| 11-12 | Write functional requirements | Product + Eng | 🔴 Not Started |
| 12-13 | Write non-functional requirements | Eng + QA | 🔴 Not Started |
| 13-14 | Create user stories | Product | 🔴 Not Started |
| 14-15 | Write component specs | Eng | 🔴 Not Started |
| 15-16 | Define design system | Design + Eng | 🔴 Not Started |
| 16-17 | Review and approval | All | 🔴 Not Started |

**Total Duration**: 7 days (1 week)

---

## Success Criteria for Phase 1

### Quantitative
- [ ] 100% of features specified with acceptance criteria
- [ ] 100% of user stories have definition of done
- [ ] 100% of components have prop interfaces
- [ ] 100% of stakeholders signed off

### Qualitative
- [ ] Requirements are clear and unambiguous
- [ ] Acceptance criteria are testable
- [ ] Component specs are implementable
- [ ] No missing requirements identified

### Readiness Gate
**Cannot proceed to Phase 2 without**:
1. All requirements documented and approved
2. All user stories written
3. All component specs defined
4. All stakeholders signed off

---

# PHASE 2: Pseudocode

> **Duration**: 1 week (Days 18-24)
> **Goal**: Define implementation logic for all components
> **Prerequisite**: Phase 1 complete with all approvals

## Overview

Phase 2 translates requirements into implementation logic using pseudocode and algorithms. This bridges the gap between "what" (specification) and "how" (implementation).

---

## Component Algorithms

### ALGO-001: AnimatedText Component

```pseudocode
FUNCTION AnimatedText(text, animation, stagger, delay):
  // Initialize
  SET textRef = createRef()
  SET hasAnimated = false

  ON_MOUNT:
    IF prefersReducedMotion:
      RETURN  // Skip animation

    // Split text into characters
    SET split = SplitType(textRef.current, types: 'chars')

    // Choose animation based on type
    SWITCH animation:
      CASE 'slide-up':
        GSAP.from(split.chars, {
          y: 40,
          opacity: 0,
          duration: 0.8,
          stagger: stagger,
          delay: delay,
          ease: 'power3.out'
        })

      CASE 'fade-in':
        GSAP.from(split.chars, {
          opacity: 0,
          duration: 0.6,
          stagger: stagger,
          delay: delay
        })

      CASE 'rotate-in':
        GSAP.from(split.chars, {
          rotationX: -90,
          opacity: 0,
          duration: 0.8,
          stagger: stagger,
          delay: delay,
          ease: 'back.out(1.7)'
        })

    SET hasAnimated = true

  ON_UNMOUNT:
    IF split EXISTS:
      split.revert()  // Cleanup

  RENDER:
    <span ref={textRef} className={className}>
      {text}
    </span>
END FUNCTION
```

**Time Complexity**: O(n) where n = number of characters
**Space Complexity**: O(n) for split character elements

---

### ALGO-002: JobCardV2 - Quick Apply Logic

```pseudocode
FUNCTION handleQuickApply(jobId):
  // Step 1: Check authentication
  IF user NOT authenticated:
    SHOW login modal
    RETURN

  // Step 2: Check profile completeness
  SET profile = fetchUserProfile(user.id)
  SET completeness = calculateCompleteness(profile)

  IF completeness < 100%:
    SET missingFields = getMissingFields(profile)
    SHOW profile completion modal WITH missingFields
    RETURN

  // Step 3: Show confirmation modal
  SHOW confirmation modal WITH {
    job: fetchJob(jobId),
    profile: {
      videoUrl: profile.videoUrl,
      cvUrl: profile.cvUrl,
      bio: profile.bio
    }
  }

  // Step 4: Wait for user confirmation
  WAIT FOR user action

  IF user clicks "Confirm":
    // Step 5: Optimistic UI update
    UPDATE job card state TO "applying"
    UPDATE button text TO "Submitting..."
    DISABLE button

    // Step 6: Submit application
    TRY:
      SET application = await submitApplication({
        jobId: jobId,
        teacherId: user.id,
        profileSnapshot: profile
      })

      // Step 7: Success path
      UPDATE job card state TO "applied"
      CLOSE modal
      SHOW success toast WITH "Application submitted!"

      // Step 8: Fetch similar jobs
      SET similarJobs = await fetchSimilarJobs(jobId, limit: 3)
      SHOW similar jobs panel WITH similarJobs

    CATCH error:
      // Step 9: Error path - rollback optimistic update
      UPDATE job card state TO "not-applied"
      UPDATE button text TO "Quick Apply"
      ENABLE button
      SHOW error toast WITH error.message

  ELSE IF user clicks "Cancel":
    CLOSE modal
END FUNCTION

FUNCTION calculateCompleteness(profile):
  SET requiredFields = [
    {field: 'videoUrl', weight: 40},
    {field: 'cvUrl', weight: 30},
    {field: 'bio', weight: 20},
    {field: 'experience', weight: 10}
  ]

  SET completeness = 0

  FOR EACH field IN requiredFields:
    IF profile[field.field] EXISTS AND NOT empty:
      completeness += field.weight

  RETURN completeness
END FUNCTION
```

**Time Complexity**: O(1) - constant time operations
**Space Complexity**: O(1) - fixed data structures

---

### ALGO-003: FiltersPanel - Real-Time Filtering

```pseudocode
FUNCTION FiltersPanel(initialFilters, onFilterChange, filterCounts):
  // State
  SET filters = initialFilters OR defaultFilters
  SET debouncedFilters = filters
  SET updateTimer = null

  // Debounced filter update
  FUNCTION updateFilters(newFilters):
    SET filters = newFilters

    // Clear existing timer
    IF updateTimer EXISTS:
      clearTimeout(updateTimer)

    // Set new timer (debounce 300ms)
    SET updateTimer = setTimeout(() => {
      SET debouncedFilters = newFilters
      onFilterChange(newFilters)
      updateURL(newFilters)
    }, 300)
  END FUNCTION

  // Handle checkbox change
  FUNCTION handleCheckboxChange(category, value):
    SET newFilters = {...filters}

    IF value IN newFilters[category]:
      // Remove value
      newFilters[category] = newFilters[category].filter(v => v !== value)
    ELSE:
      // Add value
      newFilters[category].push(value)

    updateFilters(newFilters)
  END FUNCTION

  // Handle range slider change
  FUNCTION handleRangeChange(min, max):
    SET newFilters = {...filters}
    newFilters.salaryRange = [min, max]
    updateFilters(newFilters)
  END FUNCTION

  // Clear all filters
  FUNCTION clearAll():
    SET emptyFilters = {
      countries: [],
      subjects: [],
      visaSponsorship: false,
      salaryRange: [0, 150000],
      contractTypes: [],
      schoolTypes: [],
      experienceLevel: []
    }
    updateFilters(emptyFilters)
  END FUNCTION

  // Sync with URL on mount
  ON_MOUNT:
    SET urlParams = parseURL()
    IF urlParams HAS filters:
      SET filters = urlParams.filters
      onFilterChange(filters)
  END ON_MOUNT

  RENDER:
    // Filter panel UI with all controls
END FUNCTION

FUNCTION updateURL(filters):
  SET params = new URLSearchParams()

  // Add non-empty filters to URL
  IF filters.countries.length > 0:
    params.set('countries', filters.countries.join(','))

  IF filters.subjects.length > 0:
    params.set('subjects', filters.subjects.join(','))

  IF filters.visaSponsorship:
    params.set('visa', 'true')

  // ... more filters

  // Update URL without page reload
  window.history.pushState(null, '', `?${params.toString()}`)
END FUNCTION
```

**Time Complexity**: O(n) where n = number of filter values
**Space Complexity**: O(n) for filter state

---

## State Management Logic

### STATE-001: Client State (Zustand)

```pseudocode
// Auth Store
CREATE_STORE AuthStore:
  STATE:
    user: User | null = null
    isAuthenticated: boolean = false

  ACTIONS:
    FUNCTION setUser(user):
      SET this.user = user
      SET this.isAuthenticated = true
    END FUNCTION

    FUNCTION logout():
      SET this.user = null
      SET this.isAuthenticated = false
      CLEAR localStorage('auth-storage')
    END FUNCTION

  PERSIST:
    name: 'auth-storage'
    storage: localStorage
END CREATE_STORE

// UI Store
CREATE_STORE UIStore:
  STATE:
    sidebarOpen: boolean = false
    filtersPanelOpen: boolean = true
    theme: 'light' | 'dark' | 'system' = 'system'

  ACTIONS:
    FUNCTION toggleSidebar():
      SET this.sidebarOpen = NOT this.sidebarOpen
    END FUNCTION

    FUNCTION toggleFiltersPanel():
      SET this.filtersPanelOpen = NOT this.filtersPanelOpen
    END FUNCTION

    FUNCTION setTheme(theme):
      SET this.theme = theme
      applyTheme(theme)
    END FUNCTION
END CREATE_STORE

// Saved Jobs Store
CREATE_STORE SavedJobsStore:
  STATE:
    savedJobIds: Set<string> = new Set()

  ACTIONS:
    FUNCTION addJob(id):
      SET this.savedJobIds.add(id)
      syncWithServer(id, action: 'save')
    END FUNCTION

    FUNCTION removeJob(id):
      SET this.savedJobIds.delete(id)
      syncWithServer(id, action: 'unsave')
    END FUNCTION

    FUNCTION isSaved(id):
      RETURN this.savedJobIds.has(id)
    END FUNCTION

  PERSIST:
    name: 'saved-jobs'
    storage: localStorage
    serialize: (state) => JSON.stringify({
      savedJobIds: Array.from(state.savedJobIds)
    })
    deserialize: (str) => ({
      savedJobIds: new Set(JSON.parse(str).savedJobIds)
    })
END CREATE_STORE
```

---

### STATE-002: Server State (React Query)

```pseudocode
// Jobs Query
QUERY useJobs(filters):
  KEY: ['jobs', filters]

  QUERY_FN:
    FUNCTION fetchJobs(filters):
      SET params = buildQueryParams(filters)
      SET response = await fetch(`/api/jobs?${params}`)
      IF response NOT ok:
        THROW Error('Failed to fetch jobs')
      RETURN response.json()
    END FUNCTION

  OPTIONS:
    staleTime: 2 * 60 * 1000  // 2 minutes
    cacheTime: 5 * 60 * 1000  // 5 minutes
    refetchOnWindowFocus: false
    retry: 1
END QUERY

// Apply Mutation
MUTATION useApplyToJob():
  MUTATION_FN:
    FUNCTION applyToJob(jobId):
      SET response = await fetch(`/api/jobs/${jobId}/apply`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'}
      })
      IF response NOT ok:
        THROW Error('Failed to apply')
      RETURN response.json()
    END FUNCTION

  ON_SUCCESS(data, jobId):
    // Invalidate related queries
    queryClient.invalidateQueries(['job', jobId])
    queryClient.invalidateQueries(['applications'])
    queryClient.invalidateQueries(['jobs'])  // Refresh list

  ON_ERROR(error, jobId):
    SHOW toast WITH error.message
END MUTATION

// Save Job Mutation (with Optimistic Update)
MUTATION useSaveJob():
  MUTATION_FN:
    FUNCTION saveJob(jobId):
      SET response = await fetch(`/api/jobs/${jobId}/save`, {
        method: 'POST'
      })
      RETURN response.json()
    END FUNCTION

  ON_MUTATE(jobId):
    // Cancel outgoing queries
    await queryClient.cancelQueries(['saved-jobs'])

    // Snapshot current state
    SET previousSavedJobs = queryClient.getQueryData(['saved-jobs'])

    // Optimistically update
    queryClient.setQueryData(['saved-jobs'], (old) => {
      RETURN old ? [...old, jobId] : [jobId]
    })

    RETURN {previousSavedJobs}  // Context for rollback

  ON_ERROR(error, jobId, context):
    // Rollback on error
    queryClient.setQueryData(['saved-jobs'], context.previousSavedJobs)
    SHOW toast WITH 'Failed to save job'

  ON_SETTLED():
    // Always refetch after mutation
    queryClient.invalidateQueries(['saved-jobs'])
END MUTATION
```

---

## Animation Sequences

### ANIM-001: Hero Section Entry

```pseudocode
SEQUENCE heroEntryAnimation:
  // Timeline for coordinated animations
  CREATE timeline = gsap.timeline()

  // Step 1: Fade in background (0s)
  timeline.from('.hero-background', {
    opacity: 0,
    duration: 0.6,
    ease: 'power2.out'
  }, 0)

  // Step 2: Animate headline (0.2s delay)
  timeline.from('.hero-headline .word', {
    y: 40,
    opacity: 0,
    duration: 0.8,
    stagger: 0.05,
    ease: 'power3.out'
  }, 0.2)

  // Step 3: Animate subheadline (0.6s delay)
  timeline.from('.hero-subheadline', {
    y: 20,
    opacity: 0,
    duration: 0.6,
    ease: 'power2.out'
  }, 0.6)

  // Step 4: Animate CTAs (0.9s delay)
  timeline.from('.hero-cta', {
    y: 20,
    opacity: 0,
    duration: 0.6,
    stagger: 0.1,
    ease: 'power2.out'
  }, 0.9)

  // Step 5: Animate metrics (1.2s delay)
  timeline.from('.hero-metric', {
    scale: 0.8,
    opacity: 0,
    duration: 0.5,
    stagger: 0.15,
    ease: 'back.out(1.7)'
  }, 1.2)

  // Step 6: Count up numbers (1.5s delay)
  FOR EACH metric IN metrics:
    timeline.to(metric.element, {
      innerText: metric.value,
      duration: 1.5,
      snap: {innerText: 1},  // Snap to integers
      onUpdate: () => {
        metric.element.innerText = Math.floor(metric.element.innerText).toLocaleString()
      }
    }, 1.5)

  // Step 7: Animate quick nav cards (1.8s delay)
  timeline.from('.quick-nav-card', {
    y: 30,
    opacity: 0,
    duration: 0.6,
    stagger: 0.1,
    ease: 'power2.out'
  }, 1.8)

  TOTAL DURATION: ~2.5 seconds
END SEQUENCE
```

---

### ANIM-002: Job Card Hover

```pseudocode
ANIMATION jobCardHover:
  TRIGGER: onMouseEnter

  PARALLEL:
    // Elevation
    ANIMATE card.boxShadow:
      FROM: '0 1px 3px rgba(0,0,0,0.1)'
      TO: '0 10px 15px rgba(0,0,0,0.1)'
      DURATION: 300ms
      EASING: ease-out

    // Lift
    ANIMATE card.transform:
      FROM: translateY(0)
      TO: translateY(-4px)
      DURATION: 300ms
      EASING: ease-out

    // Border glow (if featured)
    IF card.isFeatured:
      ANIMATE card.borderColor:
        FROM: 'rgba(37, 99, 235, 0.5)'
        TO: 'rgba(37, 99, 235, 1)'
        DURATION: 300ms

  ON_MOUSE_LEAVE:
    REVERSE all animations
    DURATION: 300ms
END ANIMATION
```

---

### ANIM-003: Filter Application

```pseudocode
ANIMATION filterApplication:
  TRIGGER: onFilterChange

  SEQUENCE:
    // Step 1: Fade out current results (200ms)
    ANIMATE '.job-grid':
      opacity: 0.4
      DURATION: 200ms

    // Step 2: Update results (happens during fade)
    PARALLEL TO fade:
      FETCH new job data
      UPDATE job list state

    // Step 3: Fade in new results (300ms)
    ANIMATE '.job-grid':
      opacity: 1
      DURATION: 300ms
      DELAY: 50ms  // Slight delay for perceived smoothness

    // Step 4: Stagger in job cards (if new results)
    IF results changed:
      ANIMATE '.job-card':
        y: FROM 20 TO 0
        opacity: FROM 0 TO 1
        STAGGER: 50ms
        DURATION: 400ms

  TOTAL DURATION: ~700ms
END ANIMATION
```

---

## Phase 2 Deliverables

### Code Artifacts
- [ ] Pseudocode for all components (10+ files)
- [ ] State management pseudocode (5 stores)
- [ ] Animation sequences (8+ animations)
- [ ] Algorithm documentation with complexity analysis

### Documentation
- [ ] Implementation logic document
- [ ] Data structure definitions
- [ ] API integration patterns
- [ ] Error handling strategies

### Review Checkpoints
- [ ] Algorithmic complexity review
- [ ] State management review
- [ ] Animation performance review
- [ ] Code review readiness

---

## Phase 2 Timeline

| Days | Tasks | Owner | Status |
|------|-------|-------|--------|
| 18-19 | Component algorithms | Frontend | 🔴 Not Started |
| 19-20 | State management logic | Frontend | 🔴 Not Started |
| 20-21 | Animation sequences | Frontend + Design | 🔴 Not Started |
| 21-22 | Integration patterns | Full Stack | 🔴 Not Started |
| 22-24 | Review and refinement | All | 🔴 Not Started |

---

# PHASE 3: Architecture

> **Duration**: 1 week (Days 25-31)
> **Goal**: Define system architecture and component relationships
> **Prerequisite**: Phase 2 complete

## Overview

Phase 3 defines the complete system architecture including:
1. Component hierarchy and relationships
2. Data flow between components
3. State management architecture
4. Performance optimization strategies
5. Deployment architecture

---

## System Architecture

### ARCH-001: Frontend Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                         Next.js 15 App                          │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │                    App Directory                          │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │ │
│  │  │   page   │  │  layout  │  │  error   │  │ loading │ │ │
│  │  │   .tsx   │  │   .tsx   │  │   .tsx   │  │  .tsx   │ │ │
│  │  └──────────┘  └──────────┘  └──────────┘  └─────────┘ │ │
│  └──────────────────────────────────────────────────────────┘ │
│                            ↓ ↑                                  │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │                   Components Layer                        │ │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐         │ │
│  │  │   Hero     │  │ Navigation │  │ Job Cards  │         │ │
│  │  │ Section    │  │   Header   │  │            │         │ │
│  │  └────────────┘  └────────────┘  └────────────┘         │ │
│  │                                                            │ │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐         │ │
│  │  │  Filters   │  │  Modals    │  │  Toasts    │         │ │
│  │  │   Panel    │  │            │  │            │         │ │
│  │  └────────────┘  └────────────┘  └────────────┘         │ │
│  └──────────────────────────────────────────────────────────┘ │
│                            ↓ ↑                                  │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │                  State Management                         │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │ │
│  │  │ Zustand  │  │  React   │  │  React   │  │   URL   │ │ │
│  │  │ (Client) │  │  Query   │  │   Hook   │  │  State  │ │ │
│  │  │          │  │ (Server) │  │   Form   │  │         │ │ │
│  │  └──────────┘  └──────────┘  └──────────┘  └─────────┘ │ │
│  └──────────────────────────────────────────────────────────┘ │
│                            ↓ ↑                                  │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │                   API/Data Layer                          │ │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐         │ │
│  │  │   Server   │  │    API     │  │  Database  │         │ │
│  │  │  Actions   │  │   Routes   │  │  Queries   │         │ │
│  │  └────────────┘  └────────────┘  └────────────┘         │ │
│  └──────────────────────────────────────────────────────────┘ │
│                            ↓ ↑                                  │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │                 Animation/Design Layer                    │ │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐         │ │
│  │  │    GSAP    │  │   Framer   │  │   Design   │         │ │
│  │  │            │  │   Motion   │  │   Tokens   │         │ │
│  │  └────────────┘  └────────────┘  └────────────┘         │ │
│  └──────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────┘
```

---

### ARCH-002: Component Hierarchy

```
App
├─ Providers (React Query, Zustand, Theme)
│  └─ Layout
│     ├─ Header (sticky navigation)
│     │  ├─ Logo
│     │  ├─ DesktopNav
│     │  │  ├─ DiscoverDropdown
│     │  │  ├─ ForTeachersDropdown
│     │  │  └─ ForSchoolsDropdown
│     │  ├─ SearchBar
│     │  ├─ AuthButtons
│     │  └─ MobileMenuButton
│     │
│     ├─ MobileMenu (slide-in)
│     │  ├─ NavLinks
│     │  └─ CloseButton
│     │
│     ├─ Main Content
│     │  └─ Page-specific content
│     │     ├─ HomePage
│     │     │  ├─ HeroSection
│     │     │  │  ├─ AnimatedHeadline
│     │     │  │  ├─ RotatingSubheadline
│     │     │  │  ├─ DualCTAs
│     │     │  │  ├─ SocialProofMetrics
│     │     │  │  └─ QuickNavCards
│     │     │  ├─ FeaturedJobsSection
│     │     │  └─ HowItWorksSection
│     │     │
│     │     ├─ JobsPage
│     │     │  ├─ FiltersPanel (desktop sidebar, mobile sheet)
│     │     │  │  ├─ QuickFilters
│     │     │  │  ├─ CountryAccordion
│     │     │  │  ├─ SubjectAccordion
│     │     │  │  ├─ SalaryRangeSlider
│     │     │  │  └─ ClearAllButton
│     │     │  ├─ JobGrid
│     │     │  │  └─ JobCardV2 (multiple instances)
│     │     │  │     ├─ SchoolLogo
│     │     │  │     ├─ JobInfo
│     │     │  │     ├─ Badges (Visa, Featured, Urgent)
│     │     │  │     ├─ SaveButton
│     │     │  │     └─ QuickApplyButton
│     │     │  └─ Pagination
│     │     │
│     │     └─ DashboardPage
│     │        ├─ StatsCards
│     │        ├─ ApplicationsList
│     │        └─ SavedJobsList
│     │
│     ├─ MobileBottomNav (mobile only)
│     │  ├─ HomeTab
│     │  ├─ JobsTab
│     │  ├─ SavedTab
│     │  └─ ProfileTab
│     │
│     └─ Footer
│
├─ Modals (portals)
│  ├─ QuickApplyModal
│  ├─ ProfileCompletionModal
│  └─ LoginModal
│
└─ Toast Container
   └─ Toast (multiple instances)
```

---

### ARCH-003: Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                      User Interaction                        │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ↓
┌───────────────────────────────────────────────────────────────┐
│                   Component Event Handler                      │
│  onClick, onChange, onSubmit, etc.                            │
└───────────────────────┬───────────────────────────────────────┘
                        │
                        ↓
┌───────────────────────────────────────────────────────────────┐
│                     State Update                               │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────┐      │
│  │   Zustand    │  │ React Query  │  │     URL       │      │
│  │ (immediate)  │  │  (mutate)    │  │ (pushState)   │      │
│  └──────┬───────┘  └──────┬───────┘  └───────┬───────┘      │
│         │                  │                   │               │
│         └──────────────────┼───────────────────┘               │
│                            │                                   │
└────────────────────────────┼───────────────────────────────────┘
                             │
                             ↓
┌───────────────────────────────────────────────────────────────┐
│                      API Call (if needed)                      │
│  Server Action, API Route, or direct fetch                    │
└───────────────────────┬───────────────────────────────────────┘
                        │
                        ↓
┌───────────────────────────────────────────────────────────────┐
│                    Database Operation                          │
│  Prisma query → PostgreSQL                                    │
└───────────────────────┬───────────────────────────────────────┘
                        │
                        ↓
┌───────────────────────────────────────────────────────────────┐
│                    Response Processing                         │
│  Transform data, update cache, trigger side effects           │
└───────────────────────┬───────────────────────────────────────┘
                        │
                        ↓
┌───────────────────────────────────────────────────────────────┐
│                    Component Re-render                         │
│  React re-renders affected components                         │
└───────────────────────┬───────────────────────────────────────┘
                        │
                        ↓
┌───────────────────────────────────────────────────────────────┐
│                     UI Update (with animation)                 │
│  GSAP/Framer Motion animations, if applicable                 │
└───────────────────────────────────────────────────────────────┘
```

**Example Flow: Applying to a Job**

```
1. User clicks "Quick Apply" button
   └→ JobCardV2.handleQuickApply()

2. Check authentication
   └→ useAuthStore.getState().isAuthenticated

3. Check profile completeness
   └→ useQuery(['profile', userId])
   └→ If incomplete: Show ProfileCompletionModal
   └→ If complete: Show QuickApplyModal

4. User confirms application
   └→ useMutation(['applyToJob'])

5. Optimistic update
   └→ Update JobCard state to "applying"
   └→ Disable Quick Apply button

6. API call
   └→ POST /api/jobs/{jobId}/apply
   └→ Server Action: submitApplication()

7. Database operation
   └→ prisma.application.create()
   └→ prisma.job.update() (increment applicant count)

8. Response handling
   └→ ON_SUCCESS:
      ├→ Invalidate queries: ['job', jobId], ['applications']
      ├→ Update JobCard state to "applied"
      ├→ Show success toast
      └→ Fetch similar jobs

   └→ ON_ERROR:
      ├→ Rollback optimistic update
      ├→ Re-enable Quick Apply button
      └→ Show error toast

9. UI update
   └→ JobCard re-renders with "Applied" badge
   └→ Similar jobs panel slides in (animation)
```

---

## Performance Architecture

### PERF-001: Code Splitting Strategy

```typescript
// Route-based code splitting (automatic with Next.js)
app/
  page.tsx                 // Homepage chunk
  jobs/page.tsx           // Jobs page chunk
  dashboard/page.tsx      // Dashboard chunk
  profile/[id]/page.tsx   // Profile chunk

// Component-based code splitting (dynamic imports)
const QuickApplyModal = dynamic(() => import('@/components/modals/quick-apply-modal'), {
  loading: () => <ModalSkeleton />,
  ssr: false  // Client-side only
});

const FiltersPanel = dynamic(() => import('@/components/jobs/filters-panel'), {
  loading: () => <FiltersSkeleton />,
});

// Animation library splitting
const gsap = dynamic(() => import('gsap'), {
  ssr: false
});

const FramerMotion = dynamic(() => import('framer-motion'), {
  ssr: false
});
```

**Bundle Analysis**:
```
Homepage:
  - Main chunk: ~120KB
  - Hero animations: ~30KB (lazy loaded)
  - Total FCP: ~150KB

Jobs Page:
  - Main chunk: ~130KB
  - Filters panel: ~25KB (lazy loaded on mobile)
  - GSAP animations: ~30KB (lazy loaded)
  - Total FCP: ~155KB

Dashboard:
  - Main chunk: ~110KB
  - Charts library: ~40KB (lazy loaded)
  - Total FCP: ~110KB
```

---

### PERF-002: Caching Strategy

```
┌─────────────────────────────────────────────────────┐
│              Caching Layers                          │
├─────────────────────────────────────────────────────┤
│                                                      │
│  1. Browser Cache (Service Worker - PWA)            │
│     - Static assets: 1 year                         │
│     - Images: 6 months                              │
│     - Fonts: 1 year                                 │
│                                                      │
│  2. CDN Cache (Vercel Edge)                         │
│     - Static pages: 1 hour                          │
│     - API responses: 5 minutes                      │
│     - ISR: Revalidate every 60 seconds             │
│                                                      │
│  3. React Query Cache (Client-side)                 │
│     - Jobs list: 2 minutes stale, 5 minutes cache  │
│     - Job details: 5 minutes stale, 10 minutes     │
│     - User profile: 10 minutes stale, 30 minutes   │
│     - Applications: 1 minute stale, 5 minutes      │
│                                                      │
│  4. Database Cache (PostgreSQL)                     │
│     - Query results: Automatic                      │
│     - Materialized views: Refresh every hour       │
│                                                      │
│  5. Redis Cache (Upstash)                           │
│     - Rate limit state: TTL = window duration      │
│     - Session data: 24 hours                        │
│     - Aggregated counts: 5 minutes                 │
│                                                      │
└─────────────────────────────────────────────────────┘
```

---

### PERF-003: Image Optimization

```typescript
// Image optimization strategy

// 1. Use Next/Image component
<Image
  src={job.school.logo}
  alt={`${job.school.name} logo`}
  width={48}
  height={48}
  quality={80}
  placeholder="blur"
  blurDataURL={generateBlurDataURL(job.school.logo)}
  loading="lazy"
/>

// 2. Serve modern formats
// next.config.js
module.exports = {
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
  },
};

// 3. Use blur placeholders
// Generate at build time or on first request
const shimmer = (w, h) => `
  <svg width="${w}" height="${h}" ...>
    <rect fill="#f0f0f0" width="${w}" height="${h}"/>
  </svg>
`;

const toBase64 = (str) =>
  typeof window === 'undefined'
    ? Buffer.from(str).toString('base64')
    : window.btoa(str);

// 4. Lazy load below-the-fold images
<Image loading="lazy" ... />

// 5. Priority for above-the-fold
<Image priority ... />
```

---

## Phase 3 Deliverables

### Architecture Documents
- [ ] System architecture diagram
- [ ] Component hierarchy diagram
- [ ] Data flow diagrams
- [ ] Performance architecture document
- [ ] Deployment architecture document

### Technical Specifications
- [ ] Bundle size analysis
- [ ] Caching strategy document
- [ ] Database schema (if changes needed)
- [ ] API contracts (if new endpoints)

### Infrastructure
- [ ] CI/CD pipeline updates
- [ ] Environment configuration
- [ ] Deployment scripts
- [ ] Monitoring setup

---

## Phase 3 Timeline

| Days | Tasks | Owner | Status |
|------|-------|-------|--------|
| 25-26 | System architecture diagrams | Eng + Arch | 🔴 Not Started |
| 26-27 | Data flow documentation | Eng | 🔴 Not Started |
| 27-28 | Performance architecture | Eng + DevOps | 🔴 Not Started |
| 28-29 | Deployment architecture | DevOps | 🔴 Not Started |
| 29-31 | Review and approval | All | 🔴 Not Started |

---

# PHASE 4: Refinement

> **Duration**: 2 weeks (Days 32-45)
> **Goal**: Implement and refine all features to production quality
> **Prerequisite**: Phase 3 complete

## Overview

Phase 4 is the implementation phase where code is written, tested, and refined based on the specifications, pseudocode, and architecture from previous phases.

---

## Implementation Sprints

### Sprint 1: Foundation (Days 32-35)

**Goals**:
- [ ] Set up design token system
- [ ] Create base animation utilities
- [ ] Set up state management (Zustand + React Query)
- [ ] Create base components (Button, Input, Modal, etc.)

**Deliverables**:
- `lib/design-system/tokens.ts`
- `lib/animations/gsap-helpers.ts`
- `lib/store/*` (all Zustand stores)
- `components/ui/*` (base components)
- Unit tests for all utilities

---

### Sprint 2: Hero & Navigation (Days 36-38)

**Goals**:
- [ ] Implement animated hero section
- [ ] Build role-based navigation
- [ ] Create mobile menu and bottom nav
- [ ] Integrate GSAP animations

**Deliverables**:
- `app/page.tsx` (updated homepage)
- `components/hero/*`
- `components/layout/header.tsx`
- `components/layout/mobile-bottom-nav.tsx`
- E2E tests for navigation flows

---

### Sprint 3: Job Discovery (Days 39-42)

**Goals**:
- [ ] Build JobCardV2 component
- [ ] Implement FiltersPanel
- [ ] Create job grid with pagination
- [ ] Add save and quick apply functionality

**Deliverables**:
- `components/jobs/job-card-v2.tsx`
- `components/jobs/filters-panel.tsx`
- `app/jobs/page.tsx` (updated)
- Integration tests for job discovery

---

### Sprint 4: Application Flow (Days 43-45)

**Goals**:
- [ ] Implement one-click apply
- [ ] Build application modals
- [ ] Create profile completeness checker
- [ ] Add similar jobs suggestions

**Deliverables**:
- `components/modals/quick-apply-modal.tsx`
- `components/modals/profile-completion-modal.tsx`
- `lib/profile/completeness.ts`
- `lib/matching/similar-jobs.ts`
- E2E tests for application flow

---

## Code Quality Standards

### CQ-001: TypeScript Strictness

```typescript
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true
  }
}

// All functions must have explicit return types
// ❌ Bad
export function calculateCompleteness(profile) {
  return profile.videoUrl ? 100 : 0;
}

// ✅ Good
export function calculateCompleteness(profile: TeacherProfile): number {
  return profile.videoUrl ? 100 : 0;
}

// All components must have prop interfaces
// ❌ Bad
export function JobCard({ job, onSave }) {
  // ...
}

// ✅ Good
interface JobCardProps {
  job: Job;
  onSave: (id: string) => void;
}

export function JobCard({ job, onSave }: JobCardProps) {
  // ...
}
```

---

### CQ-002: Testing Requirements

```typescript
// Unit test coverage: >= 80%
// Integration test coverage: >= 60%
// E2E test coverage: Critical user flows

// Example unit test
describe('calculateCompleteness', () => {
  it('returns 0 for empty profile', () => {
    const profile = { videoUrl: null, cvUrl: null, bio: null };
    expect(calculateCompleteness(profile)).toBe(0);
  });

  it('returns 100 for complete profile', () => {
    const profile = { videoUrl: 'url', cvUrl: 'url', bio: 'text' };
    expect(calculateCompleteness(profile)).toBe(100);
  });

  it('returns partial score for incomplete profile', () => {
    const profile = { videoUrl: 'url', cvUrl: null, bio: null };
    expect(calculateCompleteness(profile)).toBe(40); // Video is 40%
  });
});

// Example E2E test
test('user can apply to job with one click', async ({ page }) => {
  // Setup: Login and complete profile
  await setupAuthenticatedUser(page);
  await completeUserProfile(page);

  // Navigate to jobs
  await page.goto('/jobs');

  // Click quick apply on first job
  const firstJob = page.getByTestId('job-card').first();
  await firstJob.getByRole('button', { name: /quick apply/i }).click();

  // Verify modal appears
  await expect(page.getByRole('dialog')).toBeVisible();

  // Confirm application
  await page.getByRole('button', { name: /confirm/i }).click();

  // Verify success
  await expect(page.getByText(/application submitted/i)).toBeVisible();
  await expect(firstJob.getByText(/applied/i)).toBeVisible();
});
```

---

### CQ-003: Performance Budgets

```typescript
// Enforced in CI/CD

// Bundle size budget
const BUNDLE_SIZE_BUDGET = {
  'pages/index': 150 * 1024,      // 150KB
  'pages/jobs': 160 * 1024,       // 160KB
  'pages/dashboard': 120 * 1024,  // 120KB
};

// Lighthouse budget
const LIGHTHOUSE_BUDGET = {
  performance: 90,
  accessibility: 100,
  'best-practices': 90,
  seo: 90,
};

// Core Web Vitals budget
const WEB_VITALS_BUDGET = {
  FCP: 1.5 * 1000,   // 1.5s
  LCP: 2.5 * 1000,   // 2.5s
  TBT: 200,          // 200ms
  CLS: 0.1,          // 0.1
};

// Build fails if budgets exceeded
```

---

## Accessibility Enhancements

### A11Y-001: ARIA Implementation Checklist

- [ ] All interactive elements have `role` attribute
- [ ] All form inputs have associated labels
- [ ] All images have `alt` text
- [ ] All icons have `aria-hidden="true"`
- [ ] All modals have `role="dialog"` and `aria-modal="true"`
- [ ] All dropdowns have `aria-haspopup` and `aria-expanded`
- [ ] All live regions have `aria-live` attribute
- [ ] All error messages have `role="alert"`
- [ ] All loading states have `role="status"`
- [ ] All tabs have `role="tablist"`, `role="tab"`, `role="tabpanel"`

---

### A11Y-002: Keyboard Navigation Checklist

- [ ] All interactive elements focusable with Tab
- [ ] Focus indicators visible (2px ring)
- [ ] Focus order logical (top to bottom, left to right)
- [ ] Skip links present ("Skip to main content")
- [ ] Modals trap focus
- [ ] Dropdowns navigable with Arrow keys
- [ ] Enter/Space activates buttons
- [ ] Escape closes modals/dropdowns
- [ ] No keyboard traps

---

## Security Hardening

### SEC-001: Input Validation

```typescript
// All user inputs validated

// Form validation with Zod
import { z } from 'zod';

const jobApplicationSchema = z.object({
  coverLetter: z.string()
    .min(100, 'Cover letter must be at least 100 characters')
    .max(5000, 'Cover letter must be at most 5000 characters')
    .regex(/^[a-zA-Z0-9\s.,!?-]*$/, 'Invalid characters'),

  videoUrl: z.string().url('Must be a valid URL'),

  availableDate: z.date({
    required_error: 'Please select an available date',
  }).min(new Date(), 'Date must be in the future'),
});

// API validation
export async function POST(request: Request) {
  const body = await request.json();

  // Validate with Zod
  const result = jobApplicationSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: result.error },
      { status: 400 }
    );
  }

  // Proceed with validated data
  const validatedData = result.data;
  // ...
}
```

---

### SEC-002: XSS Prevention

```typescript
// Prevent XSS attacks

// 1. Use React's built-in escaping
// ✅ Good - React escapes by default
<p>{user.bio}</p>

// ❌ Bad - dangerouslySetInnerHTML without sanitization
<div dangerouslySetInnerHTML={{ __html: user.bio }} />

// ✅ Good - sanitize before using dangerouslySetInnerHTML
import DOMPurify from 'isomorphic-dompurify';

<div dangerouslySetInnerHTML={{
  __html: DOMPurify.sanitize(user.bio)
}} />

// 2. Validate URLs
// ❌ Bad - direct use of user-provided URL
<a href={job.schoolWebsite}>Visit Website</a>

// ✅ Good - validate URL
const isValidUrl = (url: string) => {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

<a href={isValidUrl(job.schoolWebsite) ? job.schoolWebsite : '#'}>
  Visit Website
</a>

// 3. Set CSP headers
// next.config.js
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: `
      default-src 'self';
      script-src 'self' 'unsafe-eval' 'unsafe-inline';
      style-src 'self' 'unsafe-inline';
      img-src 'self' data: blob: https:;
      font-src 'self';
      connect-src 'self' https://api.example.com;
    `.replace(/\s{2,}/g, ' ').trim()
  }
];
```

---

## Phase 4 Deliverables

### Code
- [ ] All components implemented
- [ ] All tests passing (unit + integration + E2E)
- [ ] Code coverage >= 80%
- [ ] Performance budgets met
- [ ] Accessibility audits passing

### Documentation
- [ ] Component documentation (Storybook)
- [ ] API documentation updated
- [ ] Deployment runbook
- [ ] Known issues log

### Quality Assurance
- [ ] Code reviews completed
- [ ] Security review completed
- [ ] Performance review completed
- [ ] Accessibility review completed

---

## Phase 4 Timeline

| Days | Tasks | Owner | Status |
|------|-------|-------|--------|
| 32-35 | Sprint 1: Foundation | Frontend | 🔴 Not Started |
| 36-38 | Sprint 2: Hero & Nav | Frontend | 🔴 Not Started |
| 39-42 | Sprint 3: Job Discovery | Frontend + Backend | 🔴 Not Started |
| 43-45 | Sprint 4: Application Flow | Full Stack | 🔴 Not Started |

---

# PHASE 5: Completion

> **Duration**: 1 week (Days 46-52)
> **Goal**: Final testing, QA, and production deployment
> **Prerequisite**: Phase 4 complete with all features implemented

## Overview

Phase 5 is the final validation phase before production deployment. This includes comprehensive testing, performance validation, security audits, and final approvals.

---

## Testing Strategy (Comprehensive)

### TEST-001: Unit Testing Checklist

**Coverage Requirement**: >= 80%

```bash
# Run unit tests with coverage
npm run test:unit -- --coverage

# Enforce coverage thresholds
npm run test:unit -- --coverage --coverageThreshold='{"global":{"lines":80,"functions":80,"branches":75,"statements":80}}'
```

**Component Test Checklist**:
- [ ] AnimatedText component (8 tests)
- [ ] JobCardV2 component (12 tests)
- [ ] FiltersPanel component (15 tests)
- [ ] QuickApplyModal component (10 tests)
- [ ] Header navigation component (8 tests)
- [ ] MobileBottomNav component (6 tests)

**Utility Test Checklist**:
- [ ] Design tokens (5 tests)
- [ ] Animation helpers (10 tests)
- [ ] Profile completeness calculator (8 tests)
- [ ] Similar jobs algorithm (12 tests)
- [ ] URL state management (7 tests)

---

### TEST-002: Integration Testing Checklist

**Coverage Requirement**: >= 60%

```bash
# Run integration tests
npm run test:integration
```

**Test Scenarios**:
- [ ] User registration → profile setup → job browsing
- [ ] Job search → filtering → job details → save job
- [ ] Job discovery → quick apply → application submitted
- [ ] Incomplete profile → quick apply → profile completion → retry apply
- [ ] Filter application → URL update → page reload → filters persist
- [ ] Save job → navigate to saved → remove job → verify removed

---

### TEST-003: E2E Testing Checklist

```bash
# Run E2E tests on all browsers
npm run test:e2e
```

**Critical User Flows**:
- [ ] **Teacher registration flow** (5 scenarios)
  - Sign up with email
  - Sign up with Google OAuth
  - Email verification
  - Profile setup
  - First job view

- [ ] **Job discovery flow** (8 scenarios)
  - Browse all jobs
  - Apply country filter
  - Apply multiple filters
  - Clear filters
  - Save job
  - Unsave job
  - View job details
  - Quick apply

- [ ] **Application flow** (6 scenarios)
  - Quick apply with complete profile
  - Quick apply with incomplete profile
  - Complete profile from modal
  - Submit application
  - View application in dashboard
  - Withdraw application

- [ ] **Recruiter flow** (4 scenarios)
  - Post new job
  - View applications
  - Review candidate profile
  - Accept/reject application

---

### TEST-004: Accessibility Testing Checklist

```bash
# Run accessibility audits
npm run test:a11y

# Run axe-core tests
npm run test:a11y:axe

# Run Pa11y CI
npm run test:a11y:pa11y
```

**Automated Tests**:
- [ ] axe-core: 0 violations on all pages
- [ ] WAVE: 0 errors on all pages
- [ ] Lighthouse: 100 accessibility score on all pages
- [ ] Pa11y: 0 errors on all pages

**Manual Tests**:
- [ ] Keyboard navigation (Tab, Shift+Tab, Enter, Escape, Arrow keys)
- [ ] Screen reader testing (NVDA on Windows, VoiceOver on Mac)
- [ ] High contrast mode (Windows)
- [ ] Browser zoom (200%, 400%)
- [ ] Color blindness simulation (Deuteranopia, Protanopia, Tritanopia)

---

### TEST-005: Performance Testing Checklist

```bash
# Run Lighthouse audits
npm run test:performance

# Run bundle size analysis
npm run analyze
```

**Performance Metrics** (must meet targets):

| Page | FCP | LCP | TBT | CLS | Bundle Size |
|------|-----|-----|-----|-----|-------------|
| Homepage | < 1.5s | < 2.5s | < 200ms | < 0.1 | < 150KB |
| Jobs Page | < 1.8s | < 2.8s | < 300ms | < 0.1 | < 160KB |
| Dashboard | < 1.6s | < 2.6s | < 200ms | < 0.1 | < 120KB |
| Profile | < 1.7s | < 2.7s | < 200ms | < 0.1 | < 130KB |

**Mobile Performance** (3G throttled):

| Page | FCP | LCP | TBT | CLS |
|------|-----|-----|-----|-----|
| Homepage | < 2.5s | < 3.5s | < 400ms | < 0.1 |
| Jobs Page | < 2.8s | < 3.8s | < 500ms | < 0.1 |

---

### TEST-006: Cross-Browser Testing Checklist

**Desktop Browsers**:
- [ ] Chrome (latest)
- [ ] Chrome (latest - 1)
- [ ] Firefox (latest)
- [ ] Firefox (latest - 1)
- [ ] Safari (latest)
- [ ] Safari (latest - 1)
- [ ] Edge (latest)
- [ ] Edge (latest - 1)

**Mobile Browsers**:
- [ ] Mobile Chrome (Android 12+)
- [ ] Mobile Safari (iOS 14+)
- [ ] Samsung Internet (latest)

**Testing Checklist per Browser**:
- [ ] Visual regression (Percy snapshots)
- [ ] E2E tests passing
- [ ] Animations working
- [ ] Forms submitting
- [ ] Modals opening/closing
- [ ] Touch gestures working (mobile)

---

### TEST-007: Visual Regression Testing

```bash
# Run Percy visual tests
npm run test:visual

# Compare with baseline
percy finalize
```

**Screenshot Coverage**:
- [ ] Homepage (desktop, tablet, mobile)
- [ ] Homepage with hero animation complete
- [ ] Jobs page with filters closed
- [ ] Jobs page with filters open
- [ ] Job card hover state
- [ ] Job card applied state
- [ ] Job card saved state
- [ ] Quick apply modal
- [ ] Profile completion modal
- [ ] Mobile menu open
- [ ] Mobile bottom navigation
- [ ] Dashboard stats cards
- [ ] Application list

---

## Quality Assurance

### QA-001: Manual QA Checklist

**Homepage**:
- [ ] Hero animation plays smoothly
- [ ] All CTAs working
- [ ] Social proof metrics animating
- [ ] Quick nav cards navigating
- [ ] Responsive on all breakpoints

**Navigation**:
- [ ] Desktop dropdowns opening on hover
- [ ] Dropdown items navigating correctly
- [ ] Mobile hamburger menu working
- [ ] Mobile bottom nav highlighting current page
- [ ] Search bar functional (if implemented)
- [ ] Sticky header working on scroll

**Job Cards**:
- [ ] All information displaying correctly
- [ ] Visa badge showing when applicable
- [ ] Salary displaying correctly
- [ ] Save button toggling state
- [ ] Quick apply button working
- [ ] Hover effects smooth
- [ ] Featured/urgent badges showing

**Filters**:
- [ ] All filter sections expanding/collapsing
- [ ] Checkboxes updating results
- [ ] Salary slider working
- [ ] Filter counts displaying
- [ ] Active filters showing as badges
- [ ] Clear all working
- [ ] Mobile bottom sheet working
- [ ] URL syncing with filters

**Application Flow**:
- [ ] Quick apply button checking profile
- [ ] Profile completion modal showing missing fields
- [ ] Confirmation modal showing correct data
- [ ] Application submitting successfully
- [ ] Success toast appearing
- [ ] Similar jobs loading
- [ ] Application appearing in dashboard

---

### QA-002: User Acceptance Testing

**UAT Participants**: 10 teachers, 5 recruiters

**Test Scenarios**:

1. **Teacher Onboarding**
   - Sign up for account
   - Complete profile with video
   - Browse jobs
   - Apply to 3 jobs
   - Rate experience (1-10)

2. **Job Discovery**
   - Find jobs in preferred country
   - Filter by subject
   - Save 5 jobs
   - Apply to 2 jobs
   - Rate ease of use (1-10)

3. **Application Process**
   - Use quick apply
   - Complete profile if prompted
   - Submit application
   - View in dashboard
   - Rate satisfaction (1-10)

**Success Criteria**:
- [ ] Average rating >= 8/10
- [ ] 90%+ task completion rate
- [ ] < 5 critical issues found
- [ ] < 10 non-critical issues found

---

## Deployment Checklist

### DEPLOY-001: Pre-Deployment Checklist

**Code Quality**:
- [ ] All tests passing (unit, integration, E2E)
- [ ] Code coverage >= 80%
- [ ] No TypeScript errors
- [ ] No ESLint errors
- [ ] No console.log statements in production code
- [ ] All TODOs resolved or documented

**Performance**:
- [ ] Lighthouse scores >= 90 (performance, accessibility, best practices, SEO)
- [ ] Bundle sizes within budget
- [ ] Core Web Vitals passing
- [ ] Images optimized
- [ ] Fonts loaded efficiently

**Security**:
- [ ] All environment variables set
- [ ] No API keys in frontend code
- [ ] CSP headers configured
- [ ] CORS configured correctly
- [ ] Rate limiting enabled
- [ ] Input validation on all forms
- [ ] XSS prevention measures in place

**Accessibility**:
- [ ] axe-core: 0 violations
- [ ] Lighthouse accessibility: 100
- [ ] Keyboard navigation tested
- [ ] Screen reader tested
- [ ] Color contrast verified

**Database**:
- [ ] Migrations tested on staging
- [ ] Database backups configured
- [ ] Connection pooling configured
- [ ] Indexes created for performance

**Monitoring**:
- [ ] Error tracking configured (Sentry)
- [ ] Performance monitoring configured (Vercel Analytics)
- [ ] Logging configured
- [ ] Alerts configured

---

### DEPLOY-002: Deployment Steps

**1. Staging Deployment** (Day 46-47):
```bash
# Deploy to staging
vercel --env-file .env.staging

# Run smoke tests on staging
npm run test:smoke -- --baseURL=https://staging.globaleducatornexus.com

# Run E2E tests on staging
npm run test:e2e -- --baseURL=https://staging.globaleducatornexus.com

# Monitor for 24 hours
# Check error rates, performance metrics, user feedback
```

**2. Canary Deployment** (Day 48):
```bash
# Deploy to 10% of production traffic
vercel --prod --canary=10

# Monitor key metrics for 12 hours:
# - Error rate < 0.1%
# - P95 response time < 500ms
# - No critical bugs reported

# If stable, increase to 50%
vercel --prod --canary=50

# Monitor for 12 hours

# If stable, proceed to full deployment
```

**3. Production Deployment** (Day 49):
```bash
# Deploy to 100% of production traffic
vercel --prod

# Run post-deployment checks
npm run test:smoke -- --baseURL=https://globaleducatornexus.com

# Monitor dashboard for anomalies
# - Error rates
# - Performance metrics
# - User engagement metrics
```

**4. Post-Deployment Verification** (Day 50):
- [ ] All pages loading correctly
- [ ] All features working as expected
- [ ] No error spikes in logs
- [ ] Performance metrics within targets
- [ ] User feedback positive
- [ ] Database queries performing well

---

### DEPLOY-003: Rollback Plan

**Trigger Conditions** (any of these):
- Error rate > 1%
- Critical bug affecting > 10% of users
- Performance degradation > 50%
- Database issues
- Security vulnerability discovered

**Rollback Steps**:
```bash
# 1. Identify deployment to rollback to
vercel list

# 2. Promote previous deployment
vercel promote [previous-deployment-url]

# 3. Verify rollback successful
npm run test:smoke

# 4. Notify team
# Send alert to Slack/Discord

# 5. Post-mortem
# Document issue, root cause, prevention
```

---

## Success Metrics Verification

### METRICS-001: Baseline vs. Target Comparison

**Performance Metrics**:

| Metric | Baseline | Target | Actual | Status |
|--------|----------|--------|--------|--------|
| Homepage FCP | [From Phase 0] | < 1.5s | __ | 🟡 Pending |
| Homepage LCP | [From Phase 0] | < 2.5s | __ | 🟡 Pending |
| Jobs Page FCP | [From Phase 0] | < 1.8s | __ | 🟡 Pending |
| Bundle Size | [From Phase 0] | < 200KB | __ | 🟡 Pending |

**User Engagement Metrics**:

| Metric | Baseline | Target | Actual | Status |
|--------|----------|--------|--------|--------|
| Bounce Rate | [From Phase 0] | < 40% | __ | 🟡 Pending |
| Avg Session Duration | [From Phase 0] | > 3 minutes | __ | 🟡 Pending |
| Pages/Session | [From Phase 0] | > 4 | __ | 🟡 Pending |

**Conversion Metrics**:

| Metric | Baseline | Target | Actual | Status |
|--------|----------|--------|--------|--------|
| Job View Rate | [From Phase 0] | > 35% | __ | 🟡 Pending |
| Application Rate | [From Phase 0] | > 15% | __ | 🟡 Pending |
| Profile Completion | [From Phase 0] | > 80% | __ | 🟡 Pending |

---

### METRICS-002: A/B Test Results

**Test 1: Hero CTA Variations**
- Variant A (Control): Single CTA
- Variant B: Dual CTAs
- Winner: __ (CTR: __%)

**Test 2: Job Card Design**
- Variant A (Control): Current design
- Variant B: Wellfound-inspired with Quick Apply
- Winner: __ (Application rate: __%)

**Test 3: Filter Interface**
- Variant A (Control): Dropdowns
- Variant B: Sidebar panel with real-time
- Winner: __ (Jobs viewed per session: __)

---

## Phase 5 Deliverables

### Testing
- [ ] All test suites passing
- [ ] UAT completed with positive results
- [ ] Cross-browser testing completed
- [ ] Performance metrics validated

### Documentation
- [ ] User documentation updated
- [ ] API documentation finalized
- [ ] Deployment runbook completed
- [ ] Monitoring dashboard set up

### Deployment
- [ ] Staging deployment successful
- [ ] Production deployment successful
- [ ] Post-deployment verification complete
- [ ] Rollback plan tested

### Sign-offs
- [ ] Product Owner approval
- [ ] QA Lead approval
- [ ] Engineering Lead approval
- [ ] Security review approval

---

## Phase 5 Timeline

| Days | Tasks | Owner | Status |
|------|-------|-------|--------|
| 46-47 | Comprehensive testing | QA + Eng | 🔴 Not Started |
| 47-48 | UAT and feedback | Product + QA | 🔴 Not Started |
| 48-49 | Staging deployment | DevOps | 🔴 Not Started |
| 49-50 | Production deployment | DevOps | 🔴 Not Started |
| 50-52 | Monitoring and validation | All | 🔴 Not Started |

---

# PROJECT COMPLETION

## Final Checklist

### Code Quality
- [x] Phase 0: Baseline established
- [ ] Phase 1: Requirements documented
- [ ] Phase 2: Pseudocode written
- [ ] Phase 3: Architecture defined
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Testing and deployment complete

### Documentation
- [x] SPARC methodology followed
- [x] All recommendations from BENCHMARK_EVALUATION integrated
- [ ] All phases documented
- [ ] Success metrics tracked
- [ ] Lessons learned documented

### Success Criteria
- [ ] All acceptance criteria met
- [ ] All tests passing
- [ ] Performance targets achieved
- [ ] Accessibility standards met
- [ ] User feedback positive
- [ ] No critical bugs

---

## Post-Launch Activities

### Week 1-2 Post-Launch
- [ ] Monitor error rates daily
- [ ] Track performance metrics
- [ ] Collect user feedback
- [ ] Address critical issues immediately
- [ ] Document issues in backlog

### Week 3-4 Post-Launch
- [ ] Analyze A/B test results
- [ ] Review success metrics vs. targets
- [ ] Plan iteration based on feedback
- [ ] Document lessons learned
- [ ] Celebrate success with team 🎉

---

## Appendix

### Tools & Resources

**Development**:
- Next.js 15 documentation: https://nextjs.org/docs
- React documentation: https://react.dev
- TypeScript handbook: https://www.typescriptlang.org/docs
- Tailwind CSS: https://tailwindcss.com/docs

**Animation**:
- GSAP documentation: https://greensock.com/docs
- Framer Motion: https://www.framer.com/motion

**Testing**:
- Vitest: https://vitest.dev
- Playwright: https://playwright.dev
- Testing Library: https://testing-library.com
- Percy: https://percy.io

**Accessibility**:
- WCAG 2.1 guidelines: https://www.w3.org/WAI/WCAG21/quickref
- axe DevTools: https://www.deque.com/axe/devtools
- NVDA screen reader: https://www.nvaccess.org

**Performance**:
- Lighthouse: https://developers.google.com/web/tools/lighthouse
- WebPageTest: https://www.webpagetest.org
- Vercel Analytics: https://vercel.com/analytics

---

## Document Control

**Version**: 1.0
**Last Updated**: 2025-11-25
**Status**: 🟡 Phase 0 - Ready to Begin
**Next Review**: Upon Phase 0 completion

**Approvals**:
- [ ] Product Owner: __________________ Date: __________
- [ ] Engineering Lead: ________________ Date: __________
- [ ] Design Lead: ____________________ Date: __________
- [ ] QA Lead: _______________________ Date: __________

---

**END OF SPARC SPECIFICATION**

*This document follows the SPARC methodology (Specification → Pseudocode → Architecture → Refinement → Completion) and incorporates all recommendations from BENCHMARK_EVALUATION.md including baseline metrics, mobile-first design, accessibility compliance, comprehensive testing, design tokens, and state management architecture.*
