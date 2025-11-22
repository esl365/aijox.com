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
