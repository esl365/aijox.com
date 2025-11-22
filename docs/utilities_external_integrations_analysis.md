# Utilities & External Integrations Analysis

## 1. Overview
This document analyzes the utilities and external integrations within the `global-educator-nexus` codebase (Phase 8). The application leverages a modern stack with heavy reliance on AI services, serverless storage, and edge-compatible caching.

## 2. External Integrations

### 2.1 AI Services (OpenAI & Anthropic)
The platform uses AI for two primary features: Video Analysis and Semantic Search.

*   **Providers**: OpenAI (`gpt-4o`, `text-embedding-3-small`), Anthropic (referenced in `.env.example` but primary logic uses OpenAI).
*   **Key Files**:
    *   `lib/ai/video-analyzer.ts`: Analyzes video resumes using `gpt-4o`.
        *   **Input**: Video URL (R2 CDN).
        *   **Output**: Structured `VideoAnalysis` object (accent, energy, professionalism scores, feedback).
        *   **Features**: Retry logic with exponential backoff, cost tracking.
    *   `lib/ai/embeddings.ts`: Generates vector embeddings using `text-embedding-3-small`.
        *   **Entities**: Job Postings, Teacher Profiles.
        *   **Features**: Batch processing (batch size 10), rate limiting delays, cost tracking.
    *   `lib/utils/ai-score.ts`: Utilities to calculate composite scores and profile completeness based on AI analysis.

### 2.2 Email (Resend)
Transactional emails are handled via Resend.

*   **Provider**: Resend (`resend` package).
*   **Key File**: `lib/email/notifications.ts`.
*   **Features**:
    *   Lazy initialization of the Resend client.
    *   **Templates**:
        *   `notifyTeacherVideoAnalyzed`: Sends analysis results (score, strengths, improvements) to teachers.
        *   `notifySchoolNewApplication`: Notifies schools of new job applications.
    *   **Styling**: Inline CSS for email compatibility.

### 2.3 Storage (UploadThing & Cloudflare R2)
Hybrid storage approach for different asset types.

*   **UploadThing**:
    *   **Usage**: General file uploads (resumes, profile pictures).
    *   **Key File**: `lib/uploadthing.ts` (Standard React component generators).
*   **Cloudflare R2**:
    *   **Usage**: Video storage (referenced in `.env.example` and `video-analyzer.ts`).
    *   **Integration**: Direct S3-compatible access or via signed URLs (implied by `R2_*` env vars).

### 2.4 Cache & Rate Limiting (Upstash)
Serverless-friendly caching and rate limiting using Upstash Redis.

*   **Provider**: Upstash (`@upstash/redis`, `@upstash/ratelimit`).
*   **Key Files**:
    *   `lib/cache/redis.ts`: Redis client configuration.
        *   **TTL**: Defined constants (Match Results: 1h, Job Embeddings: 24h, Teacher Embeddings: 7d).
        *   **Helpers**: `getCached`, `setCached`, `deleteCached`, `deletePattern`.
    *   `lib/cache/match-cache.ts`: Specific caching logic for job matching results.
    *   `lib/rate-limit/index.ts`: Rate limit definitions.
        *   **Global**: 10 req / 10s.
        *   **Video Analysis**: 5 req / 1h.
        *   **Job Matching**: 20 req / 1h.
        *   **Recruiter Setup**: 5 req / 1h.

### 2.5 SEO & Google Jobs
Integration with Google for Jobs via structured data.

*   **Key File**: `lib/seo/google-jobs.ts`.
*   **Features**:
    *   Generates `JSON-LD` schema for `JobPosting`.
    *   **Validation**: Validates schema against Google's requirements (required fields, expiration dates).
    *   **Metadata**: Generates Open Graph and Twitter Card metadata for social sharing.

## 3. General Utilities

### 3.1 Core Utilities (`lib/utils.ts`)
Standard helper functions used throughout the app.
*   `cn`: Class name merger (clsx + tailwind-merge).
*   `formatDate`: Intl.DateTimeFormat wrapper.
*   `formatCurrency`: Intl.NumberFormat wrapper (USD default).
*   `sleep`: Promise-based delay.
*   `chunk`: Array chunking helper.

### 3.2 Routing Utilities (`lib/utils/routing.ts`)
Centralized logic for role-based routing, critical for the multi-role architecture (Teacher, Recruiter, School, Admin).
*   `getSetupUrl(role)`: Determines where to redirect users after login/signup based on their role.
*   `getDashboardUrl(role)`: Returns the main dashboard URL for a given role.
*   `needsProfileSetup(role, hasProfile)`: Boolean check for onboarding status.
*   `ROLE_ROUTES`: Constant object defining key routes for each role.

## 4. Recommendations
1.  **Error Handling**: The `video-analyzer.ts` has good specific error handling. Ensure similar robustness in `embeddings.ts` for API failures.
2.  **Type Safety**: `lib/utils/routing.ts` uses string types for roles in some places; consider strictly using the `UserRole` enum from Prisma.
3.  **Environment Variables**: Ensure all `R2_*` and `UPSTASH_*` variables are properly validated at startup (e.g., in `env.ts`) to prevent runtime crashes.
