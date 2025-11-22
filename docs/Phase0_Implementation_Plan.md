# Phase 0: Stabilization & Tech Debt Clearance (v1.1) Implementation Plan

**Based on:** Global Educator Nexus (GEN) Benchmark & Upgrade Plan (v3.0)
**Duration:** 4 Weeks (Weeks 0–4)
**Goal:** Establish a stable, enterprise-grade foundation by clearing technical debt, ensuring data integrity, and achieving high test coverage before major feature upgrades.

---

## 1. Objectives & Scope

The primary focus of Phase 0 is **Stability** and **Readiness**. We are not building new features (like AI Agents or Advanced Search) yet. We are preparing the ground.

### Key Objectives
1.  **Data Integrity**: Clean up seed/dummy data and resolve user duplication issues.
2.  **API & Auth Completeness**: Fill gaps in API endpoints and ensure OAuth is robust.
3.  **Quality Assurance**: Achieve 80% test coverage and ensure critical flows (Onboarding) are bug-free.
4.  **Operational Stability**: Verify 99% uptime capability.

---

## 2. Weekly Execution Plan

### Week 1: Data Integrity & Cleanup
**Focus:** Database Hygiene & Seed Logic

*   **[Task 1.1] Seed Script Audit & Refactor**
    *   **Action**: Review `prisma/seed.ts`. Ensure it produces deterministic, realistic data for development but is safe to run (or disabled) in production.
    *   **Deliverable**: Refactored `seed.ts` with clear separation of "static data" (roles, categories) vs. "dummy data" (test users).
*   **[Task 1.2] User Duplication Logic**
    *   **Action**: Implement logic to detect duplicate accounts (e.g., same email with different providers).
    *   **Deliverable**: Migration script or service logic to merge/link duplicate accounts safely.
*   **[Task 1.3] Database Schema Validation**
    *   **Action**: Verify `schema.prisma` against current requirements. Ensure all relations are correctly defined and indexes are in place for performance.
    *   **Deliverable**: Updated `schema.prisma` (if needed) and a clean migration history.

### Week 2: API Completion & Auth Stabilization
**Focus:** Backend Robustness

*   **[Task 2.1] API Gap Analysis**
    *   **Action**: Compare frontend requirements with existing `app/api` routes and Server Actions. Identify missing CRUD operations.
    *   **Deliverable**: List of missing endpoints.
*   **[Task 2.2] Implement Missing APIs**
    *   **Action**: Build out missing endpoints (e.g., specific user profile updates, detailed job fetch options).
    *   **Deliverable**: Fully functional API suite.
*   **[Task 2.3] OAuth Hardening**
    *   **Action**: Test Google/LinkedIn login flows extensively. Handle edge cases (cancellations, existing email errors).
    *   **Deliverable**: Robust `next-auth` configuration with comprehensive error handling.

### Week 3: Testing & QA Expansion
**Focus:** Test Coverage (Target: 80%)

*   **[Task 3.1] Unit Test Expansion**
    *   **Action**: Use `vitest` to write unit tests for all utility functions (`lib/utils`, `lib/db`).
    *   **Deliverable**: >90% coverage on utility modules.
*   **[Task 3.2] Integration Testing**
    *   **Action**: Create integration tests for critical flows:
        1.  User Signup/Login (Auth).
        2.  Job Posting Creation.
        3.  Application Submission.
    *   **Deliverable**: Passing integration test suite.
*   **[Task 3.3] UI Testing (Optional/Basic)**
    *   **Action**: Implement basic smoke tests for key pages using `vitest --ui` or a lightweight E2E setup if available.
    *   **Deliverable**: Automated smoke test script.

### Week 4: Stabilization & Onboarding Polish
**Focus:** User Experience & Performance

*   **[Task 4.1] Onboarding Flow Polish**
    *   **Action**: Walk through the new user onboarding process. Fix any UI glitches, loading states, or confusing steps.
    *   **Deliverable**: Frictionless onboarding experience.
*   **[Task 4.2] Performance & Uptime Check**
    *   **Action**: Review Vercel/Server logs. Optimize slow queries. Ensure database connection pooling is correctly configured.
    *   **Deliverable**: Performance report showing <200ms API response times (p95).
*   **[Task 4.3] Documentation**
    *   **Action**: Update `README.md` and API docs.
    *   **Deliverable**: Up-to-date developer documentation.

---

## 3. Success Metrics (KPIs)

| Metric | Target | Measurement Method |
| :--- | :--- | :--- |
| **Test Coverage** | **≥ 80%** | `npm run test:coverage` report |
| **Uptime** | **99.9%** | Synthetic monitoring / Uptime robot |
| **Critical Bugs** | **0** | GitHub Issues (P0/P1) |
| **Onboarding Drop-off** | **< 10%** | Analytics (Funnel analysis) |
| **Duplicate Users** | **0** | Database query check |

---

## 4. Risks & Mitigation

*   **Risk**: Refactoring seed data might break existing dev environments.
    *   *Mitigation*: Communicate changes clearly to the team; provide a "reset db" script.
*   **Risk**: Achieving 80% coverage in 1 week is aggressive.
    *   *Mitigation*: Prioritize critical business logic and API routes over simple UI components.
*   **Risk**: OAuth changes can lock users out.
    *   *Mitigation*: Test in a staging environment first; ensure fallback login methods work.
