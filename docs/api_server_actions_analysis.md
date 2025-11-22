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
