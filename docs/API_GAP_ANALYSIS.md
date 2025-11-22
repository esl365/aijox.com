# API Gap Analysis

**Date**: 2025-01-22
**Phase**: Phase 0, Week 2 - API Completion
**Status**: Analysis Complete

---

## Executive Summary

This document identifies the gaps between the **API Specifications** (Specification.md:1198-1315) and the **current implementation**.

### Key Findings

✅ **Good News**: All core functionality is implemented as Next.js Server Actions
❌ **Gap**: REST API endpoints are missing for external access
⚠️ **Note**: Server Actions work for internal app but won't support webhooks or external clients

---

## Detailed Gap Analysis

### 1. Video Analysis API

**Spec**: `POST /api/analyze-video` (Specification.md:1202)

**Current Status**:
- ✅ Server Action: `app/actions/analyze-video.ts`
- ✅ Core logic: `lib/ai/video-analyzer.ts`
- ❌ API Endpoint: **MISSING**

**Request Format (Spec)**:
```typescript
{
  "profileId": "string",
  "videoUrl": "string"
}
```

**Response Format (Spec)**:
```typescript
{
  "success": boolean,
  "analysis": VideoAnalysis,
  "processingTime": number
}
```

**Implementation Status**:
```
Server Action:   ✅ analyzeTeacherVideo(profileId: string)
AI Integration:  ✅ analyzeVideoWithRetry() - GPT-4o
Error Handling:  ✅ Retry logic with exponential backoff
Rate Limiting:   ✅ videoAnalysisRateLimit()
User Feedback:   ✅ generateUserFeedback()
Completeness:    ✅ calculateProfileCompleteness()
Notifications:   ✅ notifyTeacherVideoAnalyzed()

Missing: REST API endpoint wrapper
```

---

### 2. Job Matching API

**Spec**: `POST /api/match-teachers` (Specification.md:1239)

**Current Status**:
- ✅ Server Action: `app/actions/match-teachers.ts`
- ✅ Vector Search: `lib/db/vector-search.ts`
- ✅ Filtering: `lib/matching/filter-candidates.ts`
- ✅ Email Generation: `lib/ai/email-generator.ts`
- ❌ API Endpoint: **MISSING**

**Request Format (Spec)**:
```typescript
{
  "jobId": "string",
  "limit": number,      // default: 20, max: 100
  "minSimilarity": number  // default: 0.85
}
```

**Response Format (Spec)**:
```typescript
{
  "success": boolean,
  "matches": MatchedTeacher[],
  "totalMatches": number,
  "processingTime": number
}
```

**Implementation Status**:
```
Server Action:    ✅ matchTeachersForJob(jobId: string)
Vector Search:    ✅ findMatchingTeachers() - pgvector
Filtering:        ✅ applyFilters() - visa, experience, salary
Email Generation: ✅ generateBatchEmails() - Claude 3.5
Email Delivery:   ✅ Resend API integration
Rate Limiting:    ✅ jobMatchingRateLimit()
Deduplication:    ✅ deduplicateMatches()

Missing: REST API endpoint wrapper
```

---

### 3. Visa Validation API

**Spec**: `POST /api/validate-visa` (Specification.md:1273)

**Current Status**:
- ✅ Server Action: `app/actions/visa-validation.ts`
- ✅ Checker Logic: `lib/visa/checker.ts`
- ✅ Rules Engine: `lib/visa/rules.ts`
- ❌ API Endpoint: **MISSING**

**Request Format (Spec)**:
```typescript
{
  "teacherId": "string",
  "country": "string"
}
```

**Response Format (Spec)**:
```typescript
{
  "eligible": boolean,
  "country": "string",
  "visaType": "string",
  "failedRequirements": string[],
  "disqualifications": string[],
  "confidence": number
}
```

**Implementation Status**:
```
Server Action:     ✅ validateJobApplication(teacherId, jobId)
                   ✅ calculateAllVisaStatuses(teacherId)
Checker Logic:     ✅ checkVisaEligibility(teacher, country)
Rules Engine:      ✅ 10 countries with detailed requirements
Caching:           ✅ visaStatus JSONB field
Recommendations:   ✅ getEligibilityRecommendations()

Missing: REST API endpoint wrapper
```

---

### 4. Application Validation API

**Spec**: `POST /api/validate-application` (Specification.md:1295)

**Current Status**:
- ✅ Server Action: `app/actions/applications.ts`
- ✅ Validation: `app/actions/visa-validation.ts`
- ❌ API Endpoint: **MISSING**

**Request Format (Spec)**:
```typescript
{
  "teacherId": "string",
  "jobId": "string"
}
```

**Response Format (Spec)**:
```typescript
{
  "canApply": boolean,
  "reason"?: string,
  "checks": {
    "visaEligible": boolean,
    "experienceMatch": boolean,
    "subjectMatch": boolean,
    "salaryMatch": boolean
  }
}
```

**Implementation Status**:
```
Server Action:      ✅ submitApplication(data)
                    ✅ validateJobApplication(teacherId, jobId)
Visa Check:         ✅ Via Agent 3 (visa-validation.ts)
Experience Check:   ✅ Minimum years requirement
Subject Match:      ✅ Flexible subject matching
Salary Check:       ✅ Minimum salary expectation
Pre-validation:     ✅ Blocks ineligible applications

Missing: REST API endpoint wrapper
```

---

## Additional API Gaps

### Profile Management

**Current**:
- ✅ Server Actions for CRUD operations exist
- ❌ No REST API for external profile updates

**Missing Endpoints**:
- `GET /api/profile/:id` - Fetch profile
- `PATCH /api/profile/:id` - Update profile
- `POST /api/profile/:id/video` - Upload video URL

### Job Posting Management

**Current**:
- ✅ Server Actions in `app/actions/jobs.ts`
- ❌ No REST API for job CRUD

**Missing Endpoints**:
- `GET /api/jobs` - List jobs
- `POST /api/jobs` - Create job
- `PATCH /api/jobs/:id` - Update job
- `DELETE /api/jobs/:id` - Delete job

### Application Management

**Current**:
- ✅ Server Actions for applications
- ❌ No REST API for status updates

**Missing Endpoints**:
- `GET /api/applications` - List applications
- `PATCH /api/applications/:id` - Update status
- `DELETE /api/applications/:id` - Withdraw application

---

## Server Actions vs API Endpoints

### What's Working (Server Actions)

✅ **Internal App Features**:
- Frontend components can call server actions directly
- Type-safe with TypeScript
- No need for API routes
- Works with React Server Components

### What's Missing (REST APIs)

❌ **External Integrations**:
- Webhooks (UploadThing, Resend, etc.)
- Mobile apps
- Third-party integrations
- Admin dashboards
- Testing/monitoring tools

### When REST APIs Are Required

1. **UploadThing Webhooks**:
   - Currently using server action after upload complete
   - Spec suggests webhook trigger for analysis
   - Need: `POST /api/webhooks/uploadthing`

2. **Email Webhooks (Resend)**:
   - Track email opens, clicks, bounces
   - Need: `POST /api/webhooks/resend`

3. **Mobile Apps**:
   - Can't use Next.js server actions
   - Need: Full REST API set

4. **External Admin Tools**:
   - Direct database access alternatives
   - Need: Admin API endpoints

---

## Priority Classification

### P0: Critical for MVP
1. **Video Analysis API** - Required for UploadThing webhook
2. **Application Validation API** - Required for UX (block before application)

### P1: High Priority
3. **Visa Validation API** - Useful for debugging/admin
4. **Job Matching API** - Could be triggered via cron instead

### P2: Nice to Have
5. Profile CRUD APIs
6. Job CRUD APIs
7. Application Management APIs

---

## Recommended Approach

### Phase 1: Wrapper APIs (Quick Win)

Create thin API route wrappers around existing server actions:

```typescript
// app/api/analyze-video/route.ts
import { analyzeTeacherVideo } from '@/app/actions/analyze-video';

export async function POST(request: Request) {
  const { profileId, videoUrl } = await request.json();

  // Validate auth
  // Call existing server action
  const result = await analyzeTeacherVideo(profileId);

  return NextResponse.json(result);
}
```

**Advantages**:
- Reuses all existing logic
- Minimal code duplication
- Same error handling
- Same rate limiting

**Timeline**: 1-2 days

### Phase 2: Full REST API (If Needed)

Only implement if external clients are confirmed:
- OpenAPI/Swagger documentation
- API authentication (JWT tokens)
- Rate limiting per API key
- Versioning strategy

**Timeline**: 3-5 days

---

## Implementation Checklist

### Required APIs (Spec Compliance)

- [ ] `POST /api/analyze-video`
  - [ ] Route handler
  - [ ] Request validation (Zod)
  - [ ] Auth check
  - [ ] Call existing server action
  - [ ] Error handling
  - [ ] Rate limiting

- [ ] `POST /api/match-teachers`
  - [ ] Route handler
  - [ ] Request validation
  - [ ] Auth check (recruiter only)
  - [ ] Call existing server action
  - [ ] Error handling
  - [ ] Rate limiting

- [ ] `POST /api/validate-visa`
  - [ ] Route handler
  - [ ] Request validation
  - [ ] Auth check
  - [ ] Call existing server action
  - [ ] Error handling

- [ ] `POST /api/validate-application`
  - [ ] Route handler
  - [ ] Request validation
  - [ ] Auth check
  - [ ] Call existing server action
  - [ ] Error handling

### Optional APIs (Enhancement)

- [ ] Profile CRUD APIs
- [ ] Job CRUD APIs
- [ ] Application Management APIs
- [ ] Webhook endpoints
- [ ] Admin APIs

### Infrastructure

- [ ] API authentication strategy
- [ ] Rate limiting middleware
- [ ] Request validation schemas
- [ ] Error response standardization
- [ ] API documentation (OpenAPI)
- [ ] Integration tests

---

## Architecture Implications

### Current: Server Actions Only

```
┌─────────────┐
│  Frontend   │
│ (Components)│
└──────┬──────┘
       │ Direct call
       ↓
┌─────────────┐
│   Server    │
│   Actions   │
└──────┬──────┘
       │
       ↓
┌─────────────┐
│  Database   │
│   & AI APIs │
└─────────────┘
```

**Pros**: Simple, type-safe, fast
**Cons**: No external access

### Proposed: Hybrid Approach

```
┌─────────────┐     ┌─────────────┐
│  Frontend   │     │  External   │
│ (Components)│     │   Clients   │
└──────┬──────┘     └──────┬──────┘
       │                   │
       │ Direct call       │ HTTP
       ↓                   ↓
┌─────────────┐     ┌─────────────┐
│   Server    │ ←── │ REST API    │
│   Actions   │     │  Endpoints  │
└──────┬──────┘     └─────────────┘
       │
       ↓
┌─────────────┐
│  Database   │
│   & AI APIs │
└─────────────┘
```

**Pros**: Best of both worlds
**Cons**: Slightly more code

---

## Related Files

**Specifications**:
- `specification/Specification.md:1198-1315` - API requirements
- `specification/Completion.md` - Testing checklist

**Server Actions**:
- `app/actions/analyze-video.ts` - Agent 1
- `app/actions/match-teachers.ts` - Agent 2
- `app/actions/visa-validation.ts` - Agent 3
- `app/actions/applications.ts` - Application handling

**AI Libraries**:
- `lib/ai/video-analyzer.ts` - GPT-4o integration
- `lib/ai/embeddings.ts` - OpenAI embeddings
- `lib/ai/email-generator.ts` - Claude 3.5

**Business Logic**:
- `lib/db/vector-search.ts` - pgvector queries
- `lib/matching/filter-candidates.ts` - Filtering logic
- `lib/visa/checker.ts` - Visa rules engine

**Current APIs**:
- `app/api/auth/` - Authentication endpoints
- `app/api/uploadthing/` - File upload
- `app/api/cron/` - Background jobs
- `app/api/recruiter/` - Recruiter setup

---

## Next Steps

1. **Review with stakeholders**: Confirm which APIs are actually needed
2. **Prioritize implementation**: Start with P0 critical APIs
3. **Create wrapper endpoints**: Quick wins for spec compliance
4. **Test integration**: Verify webhooks and external access work
5. **Document APIs**: OpenAPI spec for external clients

---

## Conclusion

**Summary**:
- ✅ All core functionality exists as server actions
- ❌ REST API endpoints are missing
- ⏱️ Estimated effort: 1-2 days for wrapper APIs

**Recommendation**:
- Implement thin wrapper APIs for spec compliance
- Use existing server actions as the source of truth
- Only build full REST API if external clients confirmed

---

**Last Updated**: 2025-01-22
**Reviewed By**: Week 2 - API Completion Task
