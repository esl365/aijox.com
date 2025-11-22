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
