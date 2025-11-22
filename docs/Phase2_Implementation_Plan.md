# Phase 2: Core Enterprise Features + AI Boost (v2.0) Implementation Plan

**Based on:** Global Educator Nexus (GEN) Benchmark & Upgrade Plan (v3.0)
**Duration:** 5 Months (Months 3–7)
**Goal:** Transform GEN into a true "Talent Intelligence Platform" by deploying advanced AI matching, a built-in ATS, and real-time communication tools.

---

## 1. Objectives & Scope

Phase 2 is the **"Heavy Lifting"** phase. We are building the core differentiators that separate GEN from standard job boards.

### Key Objectives
1.  **Multimodal AI Matching**: Combine text (Resume/JD) and video/audio signals for superior candidate ranking.
2.  **ATS-lite**: Provide schools with a Kanban-style applicant tracking system with collaboration tools.
3.  **Real-Time Engagement**: Implement chat, notifications, and scheduling automation.
4.  **Ecosystem Integration**: Connect with external tools (Zoom, Slack, Calendars) and upgrade search to Hybrid (Vector + Keyword).

---

## 2. Monthly Execution Plan

### Month 3: The AI Engine (Multimodal & Search)

#### Week 9-10: Hybrid Search Engine
*   **[Task 1.1] Elasticsearch / OpenSearch Setup**
    *   **Action**: Deploy a managed search cluster. Index Jobs and Candidates.
    *   **Deliverable**: Hybrid search API combining BM25 (keywords) and kNN (vectors) with RRF ranking.
*   **[Task 1.2] Advanced Filtering**
    *   **Action**: Implement faceted search (Salary, Location, Certifications) backed by the new search engine.
    *   **Deliverable**: Sub-100ms search response times for complex queries.

#### Week 11-12: Multimodal Matching
*   **[Task 1.3] Video/Audio Analysis Pipeline**
    *   **Action**: Integrate a pipeline (e.g., AWS Transcribe + Comprehend or OpenAI Whisper + GPT-4o) to extract signals from video resumes (tone, fluency, keywords).
    *   **Deliverable**: `VideoAnalysis` vector stored in `pgvector`.
*   **[Task 1.4] Unified Matching Score**
    *   **Action**: Update the matching algorithm to weight: `0.5 * Resume_Vector + 0.3 * Video_Vector + 0.2 * Hard_Constraints`.
    *   **Deliverable**: "Match Score %" displayed on every candidate card.

### Month 4: ATS-lite & Collaboration

#### Week 13-14: Kanban Pipeline
*   **[Task 2.1] Kanban Board UI**
    *   **Action**: Build a drag-and-drop interface (using `@dnd-kit`) for applications. Columns: New, Screening, Interview, Offer, Hired, Rejected.
    *   **Deliverable**: Interactive Application Pipeline page.
*   **[Task 2.2] Pipeline State Management**
    *   **Action**: Backend logic to handle state transitions, trigger automated emails on status change.
    *   **Deliverable**: Robust state machine for Applications.

#### Week 15-16: Collaboration Tools
*   **[Task 2.3] Team Comments & Mentions**
    *   **Action**: Add a comment section to the Application detail view. Support `@mention` to notify other school admins.
    *   **Deliverable**: Internal discussion thread per applicant.
*   **[Task 2.4] Evaluation Scorecards**
    *   **Action**: Create customizable scorecards (e.g., 1-5 rating on "Experience", "Culture Fit").
    *   **Deliverable**: Structured feedback data collection.

### Month 5: Real-Time Communication

#### Week 17-18: Chat System
*   **[Task 3.1] WebSocket Infrastructure**
    *   **Action**: Implement real-time messaging using Socket.io, Pusher, or Supabase Realtime.
    *   **Deliverable**: 1:1 Chat between Recruiter and Candidate.
*   **[Task 3.2] Notification Center**
    *   **Action**: Centralized notification feed (In-app + Email + SMS fallback).
    *   **Deliverable**: "Bell" icon with real-time badge updates.

#### Week 19-20: Scheduling Automation
*   **[Task 3.3] Calendar Integration**
    *   **Action**: Integrate Google/Outlook Calendar API. Allow recruiters to set availability slots.
    *   **Deliverable**: "Book Interview" button for candidates.

### Month 6: Integrations & Expansion

#### Week 21-22: External Connectors
*   **[Task 4.1] Video Interview Links**
    *   **Action**: Auto-generate Zoom/Google Meet links when an interview is scheduled.
    *   **Deliverable**: Meeting URL in calendar invites.
*   **[Task 4.2] Slack/Teams Bots**
    *   **Action**: Build a bot to notify school channels of new high-match applicants.
    *   **Deliverable**: "New Applicant" alerts in Slack.

#### Week 23-24: Zapier/Webhooks
*   **[Task 4.3] Public API & Webhooks**
    *   **Action**: Expose webhooks for `application.created`, `status.changed`. Create a Zapier app definition.
    *   **Deliverable**: Ability for schools to connect GEN to their own HRIS.

### Month 7: Buffer & Polish (v2.0 Launch)

#### Week 25-28: Integrated Testing & Launch Prep
*   **[Task 5.1] Load Testing**
    *   **Action**: Simulate 10k concurrent users to test Search and Chat scaling.
    *   **Deliverable**: System stability report.
*   **[Task 5.2] Beta Rollout**
    *   **Action**: Release v2.0 features to a "Gold Tier" cohort of schools.
    *   **Deliverable**: Feedback collection and rapid bug fixing.

---

## 3. Success Metrics (KPIs)

| Metric | Target | Measurement Method |
| :--- | :--- | :--- |
| **Time-to-Hire** | **-30%** | Average days from "New" to "Hired" |
| **Match Accuracy** | **85%+** | Recruiter "Thumbs Up" rate on AI recommendations |
| **Chat Engagement** | **60%** | % of hired candidates who used chat |
| **Integration Usage** | **30%** | % of schools connecting Calendar or Slack |
| **Search Latency** | **< 100ms** | p95 response time |

---

## 4. Risks & Mitigation

*   **Risk**: AI costs (OpenAI/Transcribe) could skyrocket.
    *   *Mitigation*: Implement strict caching, per-user quotas, and use cheaper models for initial screening.
*   **Risk**: Real-time features (Chat) add significant server load.
    *   *Mitigation*: Offload WebSocket handling to a managed service (Pusher/Ably) or separate microservice.
*   **Risk**: Complex ATS features might confuse simple users.
    *   *Mitigation*: "Simple Mode" vs "Advanced Mode" toggle for the dashboard.
