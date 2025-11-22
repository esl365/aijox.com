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
