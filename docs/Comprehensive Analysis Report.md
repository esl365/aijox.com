# Codebase Analysis Report

## Phase 1: Architecture & Infrastructure

### 1. Project Overview

- **Name**: Global Educator Nexus (aijox.com)
- **Type**: Next.js Web Application
- **Purpose**: AI-powered international teacher recruitment platform.

### 2. Tech Stack Analysis

#### Core Framework

- **Framework**: Next.js 15.1.3 (App Router)
- **Language**: TypeScript 5.7.2
- **Runtime**: Node.js >=18.17.0

#### Frontend

- **UI Library**: React 19.0.0
- **Styling**: Tailwind CSS 3.4.17, Tailwind Merge, Tailwind Animate
- **Components**: Radix UI (Primitives), Lucide React (Icons)
- **Forms**: React Hook Form, Zod
- **Visualization**: Recharts

#### Backend & Infrastructure

- **Database ORM**: Prisma 6.1.0
- **Authentication**: NextAuth.js 5.0.0-beta.25
- **Caching/Rate Limiting**: Upstash Redis, Upstash Ratelimit
- **Email**: Resend
- **File Storage**: UploadThing

#### AI & ML

- **SDK**: Vercel AI SDK (`ai`, `@ai-sdk/openai`, `@ai-sdk/anthropic`)
- **Providers**: OpenAI, Anthropic

#### Testing

- **Unit/Integration**: Vitest
- **Environment**: Happy DOM
- **Utilities**: Testing Library

### 3. Infrastructure Analysis

#### Database (PostgreSQL + Prisma)

- **Provider**: Neon PostgreSQL (inferred from `COMPLETION_SUMMARY.md` and `vector` extension).
- **Extensions**: `vector` (pgvector) enabled for AI embeddings.
- **Core Models**:
  - **Identity**: `User`, `Account`, `Session` (NextAuth).
  - **Profiles**: `TeacherProfile`, `SchoolProfile`, `RecruiterProfile`.
  - **Recruitment**: `JobPosting`, `Application`, `Interview`, `MatchNotification`.
  - **AI**: `AIUsage`, `AIExtractionCache`.
  - **Dashboard**: `Alert`, `Activity`, `Report`, `AnalyticsPrediction`.

#### Authentication & Middleware

- **Library**: NextAuth.js v5 (Beta).
- **Strategy**: Role-Based Access Control (RBAC).
- **Roles**: `ADMIN`, `TEACHER`, `RECRUITER`, `SCHOOL`.
- **Flow**:
  - Public routes: `/`, `/jobs`, `/about`.
  - Protected routes: `/admin`, `/recruiter`, `/profile`.
  - Setup enforcement: Redirects users to profile setup if incomplete.


### 4. API Structure Analysis

#### Server Actions (Primary Backend)

- **Strategy**: Heavy reliance on Server Actions for direct backend logic invocation.
- **Coverage**: 28 files covering all major features.
  - **Auth**: `auth.ts`, `set-role.ts`
  - **AI Agents**: `analyze-video.ts`, `match-teachers.ts`, `check-visa.ts`, `job-extraction.ts`
  - **Core**: `jobs.ts`, `applications.ts`, `interviews.ts`
  - **Dashboard**: `dashboard.ts`, `analytics.ts`, `reports.ts`, `alerts.ts`
  - **Communication**: `email-automation.ts`, `email-templates.ts`

#### API Routes (Edge/External)

- **Strategy**: Minimal API surface, used for webhooks and specific integrations.
- **Endpoints**:
  - `/api/auth/*`: NextAuth.js handlers.
  - `/api/uploadthing`: File upload callbacks.
  - `/api/cron/job-alerts`: Scheduled job alerts.
  - `/api/recruiter/setup`: Initial setup endpoints.

### 5. Project Structure Overview

- **`app/`**: App Router pages and layouts.
  - `actions/`: Server actions (Backend logic).
  - `api/`: API Route handlers.
  - `(auth)/`: Authentication pages (grouped).
  - `(dashboard)/`: Dashboard pages (grouped).
- **`components/`**: React components.
  - `ui/`: Reusable UI components (shadcn/ui).
  - `school/`, `teacher/`: Feature-specific components.
- **`lib/`**: Shared utilities and business logic.
  - `ai/`: AI service integrations.
  - `db/`: Database helpers.
  - `visa/`: Visa validation logic.
- **`prisma/`**: Database schema and migrations.
- **`docs/`**: Comprehensive documentation (API, User, Admin).





# Database & Data Modeling Analysis

## 1. Database Schema Overview

The application uses **PostgreSQL** with **Prisma ORM**. The schema is defined in `prisma/schema.prisma`.

### Core Models

- **User**: Central identity model. Roles: `ADMIN`, `TEACHER`, `RECRUITER`, `SCHOOL`.
- **TeacherProfile**: Comprehensive profile for teachers including:
  -   Personal info, experience, education.
  -   **Video Resume**: `videoUrl`, `videoAnalysis` (AI integration).
  -   **Embeddings**: `embedding` (vector type) for AI matching.
- **SchoolProfile**: Profile for schools/organizations.
- **JobPosting**: Job listings with rich metadata (salary, location, requirements).
  -   Includes `embedding` for AI matching.
  -   Supports "Hybrid" postings (AI-extracted from raw text).
- **Application**: Tracks job applications through status `NEW` -> `HIRED`/`REJECTED`.
- **Interview**: Scheduling and feedback for interviews.

### Key Features & Relationships

- **AI Integration**: `AIUsage` tracks token usage. `AIExtractionCache` caches job extraction results. `vector` extension used for embeddings in `TeacherProfile` and `JobPosting`.
- **Notifications**: `Alert` (for schools), `MatchNotification` (for teachers), `Activity` (feed).
- **Analytics**: `AnalyticsPrediction` and `Report` models for data insights.
- **Auth**: Standard Auth.js (NextAuth) models (`Account`, `Session`, `User`, `VerificationToken`).

## 2. Data Access Layer

### Configuration

- **Client**: Singleton instance exported from `lib/prisma.ts` (and re-exported by `lib/db.ts`).
- **Global Access**: Attaches to `globalThis` in development to prevent connection exhaustion during hot reloads.

### Access Patterns

- **Server Actions**: Heavy usage in `app/actions/` for mutations and data fetching (e.g., `actions/jobs.ts`, `actions/applications.ts`).
- **API Routes**: Used in `app/api/` for specific endpoints (e.g., `api/auth/*`, `api/cron/*`, `api/uploadthing/*`).
- **Direct Usage**: Imported as `import { prisma } from "@/lib/prisma"` or `import db from "@/lib/db"`.

## 3. Database Configuration & Seeding

### Seeding

- **Script**: `scripts/seed-dummy-data.ts` appears to be the main seed script.
- **Issue**: `package.json` defines `"db:seed": "tsx prisma/seed.ts"`, but `prisma/seed.ts` **does not exist**. This command will fail.
  -   **Recommendation**: Update `package.json` to point to `scripts/seed-dummy-data.ts` or move the script.

### Migrations

- Located in `prisma/migrations/`.
- Managed via `prisma migrate dev`.

## 4. Recommendations

1.  **Fix Seed Script**: Correct the `db:seed` script in `package.json`.
2.  **Standardize Imports**: Ensure consistent import of Prisma client (either `@/lib/prisma` or `@/lib/db`) to avoid confusion.
3.  **Schema Review**: Ensure `vector` extension is enabled in the target database environment before deployment.





# Authentication & Authorization Analysis

## 1. Overview

The application uses **Auth.js (NextAuth v5)** for authentication, integrated with **Prisma** for database persistence. It currently relies on **Credentials** (Email/Password) authentication, with OAuth providers (Google, LinkedIn) present in the codebase but temporarily disabled.

## 2. Key Technologies

-   **Library**: `next-auth` (v5.0.0-beta.25)
-   **Adapter**: `@auth/prisma-adapter` (v2.11.1)
-   **Database**: PostgreSQL (via Prisma)
-   **Hashing**: `bcryptjs` (v2.4.3)
-   **Validation**: `zod` (v3.24.1)

## 3. Architecture & Configuration

### 3.1 Configuration (`lib/auth.ts`)

-   **Strategy**: JWT (`session: { strategy: 'jwt' }`). This is chosen to support the Credentials provider.
-   **Providers**:
    -   `Credentials`: Active. Uses `bcrypt` to verify passwords against the `User` table.
    -   `Google` & `LinkedIn`: Configured but commented out.
-   **Callbacks**:
    -   `jwt`: Enriches the token with `role` and profile IDs (`teacherProfileId`, `schoolProfileId`, `recruiterProfileId`).
    -   `session`: Exposes the enriched token data to the client session.
-   **Pages**: Custom pages are defined for `signIn` (`/login`), `signOut`, `error`, and `newUser`.

### 3.2 Middleware (`middleware.ts`)

The middleware implements Role-Based Access Control (RBAC) and route protection:

-   **Public Routes**: `/`, `/jobs`, `/about`, etc.
-   **Auth Routes**: `/login`, `/signup` (redirects logged-in users to dashboard).
-   **Protected Routes**:
    -   `/admin`: Requires `ADMIN` role.
    -   `/recruiter`: Requires `RECRUITER`, `SCHOOL`, or `ADMIN` role.
    -   `/profile`: Requires `TEACHER` or `ADMIN` role.
-   **Flow Enforcement**:
    -   Redirects users without a role to `/select-role`.
    -   Redirects users without a profile (except Admin/School) to profile setup.

## 4. Data Models (`prisma/schema.prisma`)

### 4.1 Core Auth Models

-   `User`: Stores email, password hash, role, and verification status.
-   `Account`: Stores OAuth provider data (linked to User).
-   `Session`: Stores session data (though JWT strategy is used, this model exists for potential database sessions).
-   `VerificationToken`: For email verification.

### 4.2 User Roles & Profiles

The `User` model has a `role` enum (`ADMIN`, `TEACHER`, `RECRUITER`, `SCHOOL`). Each role (except ADMIN) corresponds to a specific profile table:

-   `TeacherProfile` (linked via `userId`)
-   `SchoolProfile` (linked via `userId`)
-   `RecruiterProfile` (linked via `userId`)

## 5. Authentication Flows

### 5.1 Registration (Signup)

-   **Frontend**: `components/auth/signup-form.tsx`
-   **Endpoint**: `POST /api/auth/signup` (`app/api/auth/signup/route.ts`)
-   **Process**:
    1.  Validates input using `signupSchema`.
    2.  Checks for existing email.
    3.  Hashes password.
    4.  Creates `User` record.
    5.  **Crucial**: Creates the corresponding profile record (`TeacherProfile`, etc.) with minimal initial data.
    6.  Returns success.
-   **Post-Registration**: The frontend automatically triggers a `signIn` call to log the user in immediately.
-   **Note**: There is a `register` server action in `lib/actions/auth.ts` that appears to be unused or incomplete (it does not create profile records).

### 5.2 Login (Sign In)

-   **Frontend**: `components/auth/login-form.tsx`
-   **Method**: Calls `signIn('credentials', ...)` from `next-auth/react`.
-   **Backend**: Triggers the `authorize` callback in `lib/auth.ts`.
-   **Process**:
    1.  Validates credentials.
    2.  Finds user and verifies password hash.
    3.  Fetches associated profile ID based on role.
    4.  Returns user object for JWT creation.

## 6. Findings & Recommendations

1.  **OAuth Disabled**: Google and LinkedIn providers are implemented but commented out. Enabling them would require setting up environment variables and potentially adjusting the `signIn` callback to handle profile creation for OAuth users.
2.  **Duplicate Registration Logic**: `lib/actions/auth.ts` contains a `register` function that seems inferior to the API route handler (`app/api/auth/signup/route.ts`) as it lacks profile creation. This should be cleaned up or unified.
3.  **Profile Setup Enforcement**: The middleware robustly enforces profile setup, ensuring users don't access the app in an invalid state.
4.  **JWT Strategy**: Using JWT is efficient but means session revocation is harder (though `maxAge` is set to 30 days).





# Core Features Analysis: Jobs & Applications

## 1. Data Models

### JobPosting

- **Purpose**: Represents a job listing created by a School or Recruiter.
- **Key Fields**:
  - `title`, `description`, `subject`, `country`, `city`
  - `salaryUSD`, `contractLength`, `benefits`
  - `schoolId`, `recruiterId`
  - `status` (ACTIVE, CLOSED, FILLED)
- **Relations**:
  - `school`: Link to SchoolProfile
  - `recruiter`: Link to RecruiterProfile
  - `applications`: Link to Application[]

### Application

- **Purpose**: Represents a teacher's application to a specific job.
- **Key Fields**:
  - `status` (NEW, SCREENING, INTERVIEW, OFFER, HIRED, REJECTED)
  - `coverLetter`
  - `aiMatchScore`
  - Timestamps: `viewedAt`, `screenedAt`, `interviewedAt`, `offeredAt`, `hiredAt`, `rejectedAt`
- **Relations**:
  - `job`: Link to JobPosting
  - `teacher`: Link to TeacherProfile

## 2. Server Actions

### Jobs (`app/actions/jobs.ts`)

- **`getJobs`**: Main search function. Supports filtering by country, subject, salary, housing, flight, and text search. Implements pagination.
- **`getJobById`**: Fetches detailed job info including verification status of school/recruiter.
- **`getJobFilterOptions`**: Aggregates available countries, subjects, and salary range for UI filters.
- **`getJobStatsByCountry`**: Returns job counts and average salaries per country.
- **`getFeaturedJobs`**: Returns top jobs for homepage/featured sections.

### Applications (`app/actions/applications.ts`)

- **`submitApplication`**: Handles application logic.
  - Checks user role (must be TEACHER).
  - Validates profile completeness and visa eligibility.
  - Checks for duplicate applications.
  - Creates `Application` record.
- **`getMyApplications`**: Lists applications for the logged-in teacher.
- **`updateApplicationStatus`**: Allows schools to move applications through the pipeline (Screening -> Interview -> Offer -> Hired).
- **`withdrawApplication`**: Allows teachers to withdraw applications if they are still in early stages (NEW/SCREENING).

## 3. Frontend Architecture

### Jobs Page (`app/jobs`)

- **`page.tsx`**: Server Component. Fetches initial filter options and stats.
- **`JobsPageClient.tsx`**: Client Component. Manages search state and renders results.
- **Components (`components/jobs`)**:
  - `JobFilters`: Sidebar for filtering.
  - `JobList`: Renders list of `JobCard`s.
  - `JobCard`: Displays job summary (title, school, location, salary, benefits).
    - Handles "View Details" navigation.
    - Shows "Housing" and "Flight" badges if provided.
    - Formats salary and relative date (e.g., "2 days ago").

### Applications Page (`app/applications`)

- **`page.tsx`**: Server Component. Enforces TEACHER role and fetches user's applications.
- **`ApplicationsClient.tsx`**: Client Component.
  - Displays applications in a list/grid.
  - Shows status badges and timeline.
  - Provides "Withdraw" functionality.
  - Includes a dashboard-like summary of application statuses.
- **Components (`components/applications`)**:
  - `ApplicationCard`: Likely used to display individual application details (inferred from file existence).
  - `ApplicationTimeline`: Visualizes the status history (Applied -> Screened -> Interview -> etc.).

## 4. Key Observations

- **Server Actions**: The application relies heavily on Server Actions for data fetching and mutation, which is a modern Next.js pattern.
- **Validation**: Visa validation logic is decoupled in `visa-validation.ts` (referenced in `submitApplication`).
- **Real-time Updates**: `revalidatePath` is used to refresh data after mutations.
- **Role-Based Access**: Strict checks for `TEACHER` vs `SCHOOL` roles in actions.
- **UI/UX**:
  - **Feedback**: Uses `useToast` for user feedback on actions like withdrawing applications.
  - **Loading States**: Skeleton loading is implemented in `JobsPageClient`.
  - **Responsive Design**: Grid layouts adjust for mobile/desktop (e.g., filters sidebar).





# Phase 5: User Roles & Profiles Analysis

## 1. Data Models

### Core User Model

- **User**: Central entity containing authentication info (email, password, OAuth accounts) and a `role` field.
- **Roles**: Defined in `UserRole` enum: `ADMIN`, `TEACHER`, `RECRUITER`, `SCHOOL`.
- **Status**: `UserStatus` enum: `ACTIVE`, `INACTIVE`, `SUSPENDED`.

### Profile Models

- **TeacherProfile**: 1:1 relation with `User`. Contains bio, experience, education, visa status, etc.
- **SchoolProfile**: 1:1 relation with `User`. Contains school name, location, type, verification status.
- **RecruiterProfile**: 1:1 relation with `User`. Contains company name, verification status.

### Relationships

- Users have a specific role which determines which profile type they should have.
- Profiles are linked via `userId`.


## 2. Role Management

### Role Assignment

- **Action**: `setUserRole` in `app/actions/set-role.ts`.
- **Logic**: Updates `User.role` and redirects to a setup URL.
- **Routing**: Uses `getSetupUrl` from `lib/utils/routing.ts` to determine post-role-selection destination.

## 3. Profile Management

### Teacher Profile

- **Setup**: `app/(teacher)/profile/setup/page.tsx` -> `TeacherSetupClient` -> `TeacherProfileForm`.
- **API**: POST `/api/teacher/profile`.
- **View**: `app/(teacher)/profile/page.tsx` (presumed).

### Recruiter Profile

- **Setup**: `app/(recruiter)/setup/page.tsx` -> `RecruiterSetupForm`.
- **API**: Likely `/api/recruiter/profile` (to be verified).
- **View**: `app/recruiter/profile/page.tsx` (presumed).

### School Profile

- **Setup**: `app/school/setup/page.tsx`.
- **Logic**: Auto-creates a default profile if one doesn't exist, then redirects to dashboard. No initial form.

## 4. Role-Based Access Control (RBAC)

### Middleware Protection (`middleware.ts`)

- **Public Routes**: `/`, `/jobs`, `/about`, `/contact`, `/pricing`.
- **Role Enforcement**:
  - **Admin**: `/admin/*` restricted to `ADMIN`.
  - **Recruiter/School**: `/recruiter/*` restricted to `RECRUITER`, `SCHOOL`, `ADMIN`.
  - **Teacher**: `/profile/*` (except setup) restricted to `TEACHER`, `ADMIN`.
- **Redirection Rules**:
  - Users without role -> `/select-role`.
  - Users without profile (Teacher/Recruiter) -> Setup pages.
  - Logged-in users on auth pages -> Dashboard.

### API Protection

- **Teacher API**: `POST /api/teacher/profile` is called by `TeacherSetupClient` but the route **does not exist** in `app/api/teacher`. This is a critical implementation gap.
- **Recruiter API**: `POST /api/recruiter/setup` exists but **does not create a RecruiterProfile record**. It only updates the user's name. This is an incomplete implementation.
- **School API**: No specific API; handled server-side in `app/school/setup/page.tsx`.

## 5. Critical Findings & Gaps

1.  **Missing Teacher API**: The teacher profile setup flow is broken because the backend endpoint is missing.
2.  **Incomplete Recruiter Setup**: The recruiter setup flow validates data but fails to persist it to the `RecruiterProfile` table defined in the schema.
3.  **Data Model vs Implementation**: The `schema.prisma` defines rich profile models, but the current implementation barely uses them (except for School).
4.  **RBAC**: Middleware seems robust, but the underlying features it protects are not fully implemented.



# API & Server Actions Analysis

## 1. Overview

The application primarily uses **Server Actions** for business logic and data mutations, leveraging Next.js App Router capabilities. **API Routes** are used sparingly, mainly for third-party integrations (Auth.js, UploadThing) and webhooks.

## 2. Server Actions (`app/actions`)

Server actions are organized by domain (e.g., `jobs.ts`, `applications.ts`, `auth.ts`) and handle most of the application's interactivity.

### Key Patterns

*   **Authentication**:
    *   Uses `auth()` from `@/lib/auth` to retrieve the current session.
    *   Explicit checks for `session.user` and roles (e.g., `TEACHER`, `SCHOOL`) within the action.
    *   Example: `if (!session?.user?.id || session.user.role !== 'TEACHER') { ... }`

*   **Input Validation**:
    *   Manual validation checks (e.g., `if (!teacherProfileId) ...`).
    *   Custom validation logic (e.g., `validateJobApplication` in `applications.ts`).
    *   *Note: Strict Zod schema validation was not prominently seen in the analyzed files, but types are defined.*

*   **Database Interaction**:
    *   Direct use of `prisma` client imported from `@/lib/db`.
    *   Complex queries (filtering, sorting, pagination) are handled directly within the actions (e.g., `getJobs` in `jobs.ts`).

*   **Error Handling**:
    *   `try/catch` blocks wrap the logic.
    *   Errors are logged to the console.
    *   **Read Actions**: Return "safe" fallbacks (empty arrays, null) to prevent UI crashes.
    *   **Mutation Actions**: Return a standardized result object: `{ success: boolean, error?: string, message?: string }`.

*   **Cache Revalidation**:
    *   `revalidatePath()` is used after mutations to refresh data on relevant pages (e.g., `/dashboard`, `/applications`).

### Notable Files

*   `jobs.ts`: Handles job searching, filtering, and retrieval.
*   `applications.ts`: Manages job applications, including submission, status updates, and withdrawal.
*   `auth.ts`: Wraps `signIn` from NextAuth to handle `NEXT_REDIRECT` and `AuthError` gracefully.

## 3. API Routes (`app/api`)

API routes are minimal and serve specific infrastructure needs.

### Key Routes

*   **`app/api/auth/[...nextauth]/route.ts`**:
    *   Exports `GET` and `POST` handlers from `@/lib/auth`.
    *   Standard NextAuth v5 setup.

*   **`app/api/uploadthing/core.ts`**:
    *   Configures file upload endpoints using `uploadthing/next`.
    *   **Middleware**: Authenticates users and enforces role-based access (e.g., only Teachers can upload video resumes).
    *   **Callbacks**: Updates the database (Prisma) in `onUploadComplete` to link the uploaded file to the user/profile.

## 4. Data Fetching & Mutations

*   **Fetching**: Primarily done via Server Actions called directly from Server Components or Client Components.
*   **Mutations**: Done via Server Actions triggered by form submissions or event handlers.

## 5. Security & Middleware

*   **Role-Based Access Control (RBAC)**: Implemented manually inside Server Actions and UploadThing middleware.
*   **Session Validation**: Consistent use of `auth()` to verify identity before sensitive operations.





# UI/UX & Design System Analysis

## 1. Styling Architecture

-   **Framework**: Tailwind CSS (v3.4.17)
-   **Configuration**: `tailwind.config.ts` is configured with `tailwindcss-animate` plugin.
-   **Global Styles**: `app/globals.css` defines CSS variables for theming (HSL values) for both light and dark modes.
-   **Fonts**: `Inter` font from `next/font/google` is applied globally in `app/layout.tsx`.
-   **Icons**: `lucide-react` is used for iconography.

## 2. Component Library

-   **Library**: `shadcn/ui` (built on top of Radix UI primitives).
-   **Location**: `components/ui/` contains reusable UI components (Button, Card, Input, etc.).
-   **Utilities**: `cn` utility (combining `clsx` and `tailwind-merge`) is used for class name management, located in `lib/utils.ts` (inferred from usage).
-   **Animation**: `tailwindcss-animate` is used for component animations (e.g., accordion).

## 3. Layout & Theming

-   **Root Layout**: `app/layout.tsx` wraps the application with:
    -   `Providers` (currently only wraps `SessionProvider`).
    -   `Toaster` for toast notifications.
    -   Global font application (`Inter`).
-   **Theming**:
    -   CSS variables are defined for `background`, `foreground`, `primary`, `secondary`, `muted`, `accent`, `destructive`, `border`, `input`, `ring`.
    -   `darkMode: ['class']` is set in `tailwind.config.ts`.
    -   **Gap Identified**: There is no `ThemeProvider` (e.g., `next-themes`) integrated into `app/providers.tsx` or `app/layout.tsx`. While the CSS supports dark mode, there is no mechanism for the user to toggle it, and it won't automatically respect system preferences unless manually handled.
-   **Responsive Design**:
    -   Standard Tailwind responsive prefixes (`md:`, `lg:`) are used extensively.
    -   Mobile-first approach is evident (e.g., `hidden md:flex` for navigation).
    -   Grid layouts adjust columns based on breakpoints (e.g., `grid-cols-2 md:grid-cols-3 lg:grid-cols-6`).

## 4. UI Patterns

-   **Navigation**:
    -   Desktop: Top navigation bar with links.
    -   Mobile: Hamburger menu icon (implementation details of the menu content itself were not fully visible in `page.tsx` but the trigger is there).
-   **Feedback**: Toast notifications (`Toaster`) are set up.
-   **Data Display**: Cards are heavily used for job listings and feature highlights.
-   **Interactive Elements**: Hover effects (`hover:shadow-lg`, `hover:opacity-75`) and transitions (`transition-all`) are present.

## 5. Recommendations

1.  **Implement ThemeProvider**: Add `next-themes` and wrap the app in a `ThemeProvider` to enable proper dark mode support.
2.  **Mobile Menu**: Ensure the mobile menu (hamburger) is fully implemented and accessible.
3.  **Accessibility**: Continue using Radix UI primitives which provide good default accessibility. Ensure color contrast ratios in the custom theme variables meet WCAG standards.



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

