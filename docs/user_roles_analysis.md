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

