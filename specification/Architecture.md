# Architecture - 시스템 아키텍처

## 시스템 개요

Global Educator Nexus는 **Data-Driven AI Platform**으로, Next.js 15 App Router 기반의 서버리스 아키텍처를 채택합니다.

```
┌──────────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                             │
│  ┌────────────────┐  ┌────────────────┐  ┌─────────────────┐    │
│  │  Teacher App   │  │ Recruiter App  │  │   Admin App     │    │
│  │  (Next.js RSC) │  │  (ATS Kanban)  │  │ (Analytics)     │    │
│  └────────────────┘  └────────────────┘  └─────────────────┘    │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│                   BUSINESS LOGIC LAYER                            │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────────────┐     │
│  │ AI Agents   │  │ Server      │  │  Background Jobs     │     │
│  │ (3 Agents)  │  │ Actions     │  │  (Cron/Email)        │     │
│  └─────────────┘  └─────────────┘  └──────────────────────┘     │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│                      DATA LAYER                                   │
│  ┌────────────┐  ┌──────────┐  ┌────────────┐  ┌────────────┐  │
│  │  Neon DB   │  │ pgvector │  │ R2 Storage │  │ AI APIs    │  │
│  │ (Postgres) │  │ (Vector) │  │  (Videos)  │  │(GPT/Claude)│  │
│  └────────────┘  └──────────┘  └────────────┘  └────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 기술 스택 (Technology Stack)

### 프론트엔드
- **프레임워크**: Next.js 15.1.3 (App Router)
- **React**: v19.0.0 (React Server Components 활용)
- **상태 관리**: Server Components + Server Actions (클라이언트 상태 최소화)
- **UI 라이브러리**:
  - shadcn/ui (Radix UI primitives)
  - Tailwind CSS v3.4.17
  - lucide-react (Icons)
- **Form 관리**: React Hook Form v7.54.2 + Zod v3.24.1
- **DnD**: @dnd-kit (Kanban board용)

### 백엔드
- **언어**: TypeScript 5.7.2
- **프레임워크**: Next.js 15 Server Actions (API Routes 대체)
- **ORM**: Prisma 6.1.0
- **데이터베이스**:
  - Neon (Serverless PostgreSQL)
  - pgvector extension (벡터 유사도 검색)
- **인증**: Auth.js v5 (Beta 25)
- **AI SDK**: Vercel AI SDK v4.0.28
  - @ai-sdk/openai v1.0.8
  - @ai-sdk/anthropic v1.0.5

### AI Models
- **Multimodal Analysis**: GPT-4o (비디오 분석)
- **Text Generation**: Claude 3.5 Sonnet (이메일 작성)
- **Embeddings**: text-embedding-3-small (1536 dimensions)

### 인프라
- **호스팅**: Vercel (Serverless Functions)
- **데이터베이스**: Neon (Serverless PostgreSQL with pgvector)
- **Storage**: Cloudflare R2 (S3-compatible, $0 egress)
- **파일 업로드**: UploadThing v7.2.0
- **이메일**: Resend v4.0.1
- **CI/CD**: Vercel Git Integration
- **모니터링**: (계획 중: Sentry, Vercel Analytics)

---

## Next.js 15 폴더 구조

### App Router 디렉토리 구조

```
app/
├── (auth)/                      # Auth route group
│   ├── login/
│   │   └── page.tsx            # 로그인 페이지
│   └── select-role/
│       └── page.tsx            # 역할 선택 (Teacher/Recruiter)
│
├── (teacher)/                   # Teacher route group
│   └── profile/
│       └── setup/
│           └── page.tsx        # 강사 프로필 설정
│
├── (recruiter)/                 # Recruiter route group
│   └── setup/
│       └── page.tsx            # 리크루터 설정
│
├── actions/                     # Server Actions (중앙화)
│   ├── auth.ts
│   ├── teacher.ts
│   ├── recruiter.ts
│   └── jobs.ts
│
├── api/                         # API Routes (Legacy/Webhooks only)
│   ├── auth/
│   │   └── [...nextauth]/
│   │       └── route.ts        # Auth.js v5 handler
│   ├── uploadthing/
│   │   └── route.ts            # UploadThing webhooks
│   └── recruiter/
│       └── setup/
│           └── route.ts
│
├── layout.tsx                   # Root layout (전역 UI)
└── page.tsx                     # Homepage

components/
├── ui/                          # shadcn/ui primitives
│   ├── button.tsx
│   ├── card.tsx
│   ├── dialog.tsx
│   ├── form.tsx
│   └── ... (30+ components)
│
├── teacher/
│   ├── profile-form.tsx
│   ├── video-upload.tsx
│   └── visa-status.tsx
│
└── recruiter/
    ├── job-posting-form.tsx
    ├── kanban-board.tsx
    └── candidate-card.tsx

lib/
├── ai/                          # AI Agents
│   ├── video-analyzer.ts       # Agent 1: GPT-4o 비디오 분석
│   ├── embeddings.ts           # Agent 2: 벡터 임베딩 생성
│   └── email-generator.ts      # (미완) Claude 3.5 이메일 작성
│
├── visa/                        # Visa Rules Engine
│   ├── checker.ts              # Agent 3: 비자 적격성 체크
│   └── rules.ts                # 국가별 하드코딩 규칙 (10개국)
│
├── db/
│   ├── vector-search.ts        # pgvector 유사도 검색
│   └── prisma.ts               # Prisma client singleton
│
├── matching/
│   └── filter-candidates.ts    # Hybrid search (vector + filters)
│
├── validations/
│   ├── teacher-profile.ts      # Zod schemas
│   └── job-posting.ts
│
├── auth.ts                      # Auth.js v5 config
├── uploadthing.ts              # UploadThing config
└── utils.ts                     # 유틸리티 함수

prisma/
├── schema.prisma               # 전체 데이터베이스 스키마
└── seed.ts                     # 초기 데이터 시딩
```

---

## 주요 컴포넌트 상세

### 1. AI Agent 1: Video Analyzer
- **파일**: `lib/ai/video-analyzer.ts`
- **목적**: 비디오 이력서를 분석하여 원어민 여부, 억양, 전문성 평가
- **기술 스택**:
  - Vercel AI SDK `generateObject()`
  - GPT-4o multimodal
  - Zod schema validation
- **트리거**: UploadThing `onUploadComplete` webhook
- **출력**: VideoAnalysis JSON → `TeacherProfile.videoAnalysis`
- **의존성**:
  - OpenAI API (GPT-4o)
  - Prisma (저장)

### 2. AI Agent 2: Autonomous Headhunter
- **파일**:
  - `lib/ai/embeddings.ts` (벡터 생성)
  - `lib/db/vector-search.ts` (검색 로직)
- **목적**: 공고-강사 간 시맨틱 유사도 기반 자동 매칭
- **기술 스택**:
  - OpenAI text-embedding-3-small
  - pgvector (Postgres extension)
  - Raw SQL queries (`$queryRaw`)
- **트리거**:
  - Profile 생성 시 (embedding 생성)
  - Job 생성 시 (embedding 생성 + 매칭)
- **출력**:
  - `TeacherProfile.embedding` (vector 1536)
  - `JobPosting.embedding` (vector 1536)
  - Matched teachers list
- **의존성**:
  - Neon DB (pgvector extension)
  - OpenAI API

### 3. AI Agent 3: Visa Guard
- **파일**:
  - `lib/visa/checker.ts` (체크 로직)
  - `lib/visa/rules.ts` (규칙 데이터베이스)
- **목적**: 국가별 비자 규칙 기반 적격성 사전 검증
- **기술 스택**:
  - TypeScript (규칙 엔진)
  - 하드코딩된 규칙 (10개국: 한국, 중국, UAE, 베트남, 태국, 일본, 사우디, 대만, 싱가포르, 카타르)
- **트리거**:
  - Profile 생성 시 (전체 국가 체크)
  - Job 지원 시 (실시간 체크)
- **출력**: `TeacherProfile.visaStatus` JSON
- **의존성**: 없음 (순수 TypeScript)

### 4. Auth.js v5 (Next-Auth)
- **파일**: `lib/auth.ts`, `app/api/auth/[...nextauth]/route.ts`
- **전략**: Database Session (JWT 아님)
- **제공자**:
  - Google OAuth
  - LinkedIn OAuth
  - Email Magic Link (Resend)
- **세션 관리**:
  - `Session` table (Prisma)
  - `role` field로 RBAC (Role-Based Access Control)
- **보안**: CSRF protection, secure cookies

### 5. UploadThing (Video Upload)
- **파일**: `lib/uploadthing.ts`, `app/api/uploadthing/route.ts`
- **목적**: 비디오 이력서를 Cloudflare R2에 업로드
- **Flow**:
  1. Client: `<UploadButton>` 클릭
  2. File → UploadThing → Cloudflare R2
  3. `onUploadComplete` webhook → AI Agent 1 트리거
- **제한**:
  - 파일 크기: 최대 100MB
  - 파일 형식: video/mp4, video/webm
  - 길이: 최대 5분 권장

### 6. Server Actions
- **파일**: `app/actions/*.ts`
- **목적**: API Routes 없이 서버 로직 직접 호출
- **예시**:
  ```typescript
  // app/actions/teacher.ts
  'use server'

  export async function updateTeacherProfile(formData) {
    const session = await getSession()
    // 로직...
    revalidatePath('/profile')
  }
  ```
- **장점**:
  - Type-safe (TypeScript)
  - No API layer overhead
  - Automatic caching invalidation

---

## 데이터베이스 스키마 핵심

### TeacherProfile 테이블

```prisma
model TeacherProfile {
  id                    String   @id @default(cuid())
  userId                String   @unique

  // Basic Info
  firstName             String
  lastName              String
  citizenship           String   // "US", "UK", etc.

  // ESL/EFL Fields (Critical)
  passportCountry       String?  // For E2/Z visa eligibility
  isNativeSpeaker       Boolean  @default(false)
  nativeSpeakerVerified Boolean  @default(false)
  accentType            String?  // "North American", "British", etc.

  // Video Resume
  videoUrl              String?
  videoAnalysis         Json?    // AI Agent 1 output

  // AI Matching
  embedding             Unsupported("vector(1536)")?  // AI Agent 2

  // Visa Status
  visaStatus            Json?    // AI Agent 3 output (cached)

  // Profile Completeness
  profileCompleteness   Int      @default(0)  // 0-100

  // Timestamps
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt

  // Relations
  user                  User     @relation(fields: [userId], references: [id])
  applications          Application[]
}
```

### JobPosting 테이블

```prisma
model JobPosting {
  id                    String   @id @default(cuid())
  recruiterId           String

  // Job Info
  title                 String
  subject               String   // "ESL", "Math", "Science"
  city                  String
  country               String

  // Salary (Normalized to USD)
  salaryUSD             Int
  currency              String

  // Native Speaker Requirements
  nativeSpeakerRequired Boolean  @default(true)
  acceptedNativeCountries String[] // ["US", "UK", "CA"]

  // AI Matching
  embedding             Unsupported("vector(1536)")?

  // Anonymous Posting (Competitive Intel)
  isAnonymous           Boolean  @default(false)
  hiddenOrgName         String?  // Admin-only field

  // Timestamps
  createdAt             DateTime @default(now())
  status                JobStatus @default(ACTIVE)

  // Relations
  recruiter             User     @relation(fields: [recruiterId], references: [id])
  applications          Application[]
}
```

### Application 테이블 (ATS Funnel)

```prisma
model Application {
  id                String    @id @default(cuid())
  jobId             String
  teacherId         String

  // ATS Status
  funnelStatus      AppStatus @default(NEW)
  // NEW → SCREENING → INTERVIEW → OFFER → HIRED (or REJECTED)

  // AI Matching Score
  aiMatchScore      Int?      // 0-100 (cosine similarity * 100)

  // Analytics (Critical for market intel)
  viewedAt          DateTime?
  rejectedAt        DateTime?
  rejectReason      String?   // "Visa Issue", "Experience Mismatch"

  // Relations
  job               JobPosting @relation(fields: [jobId], references: [id])
  teacher           TeacherProfile @relation(fields: [teacherId], references: [id])
}

enum AppStatus {
  NEW
  SCREENING
  INTERVIEW
  OFFER
  HIRED
  REJECTED
}
```

---

## API 엔드포인트

### Server Actions (Preferred)

대부분의 로직은 Server Actions로 구현되어 API Routes를 최소화합니다.

#### Teacher Actions
```typescript
// app/actions/teacher.ts
'use server'

export async function createTeacherProfile(data)
export async function updateTeacherProfile(data)
export async function uploadVideoResume(fileUrl)  // Triggers AI Agent 1
export async function getMatchingJobs(teacherId)  // Uses AI Agent 2
```

#### Recruiter Actions
```typescript
// app/actions/recruiter.ts
'use server'

export async function createJobPosting(data)     // Triggers AI Agent 2
export async function getMatchingTeachers(jobId) // Uses AI Agent 2 + 3
export async function updateApplicationStatus(appId, newStatus)
```

### API Routes (Legacy/Webhooks Only)

#### Auth.js Handler
- `POST /api/auth/callback/google` - Google OAuth callback
- `POST /api/auth/callback/linkedin` - LinkedIn OAuth callback
- `GET /api/auth/session` - Get current session

#### UploadThing
- `POST /api/uploadthing` - File upload webhook
- `GET /api/uploadthing/callback` - Upload completion callback

---

## 보안 고려사항

### 인증/인가
- **Auth.js v5**: Database session strategy
- **RBAC**: `User.role` (ADMIN, TEACHER, SCHOOL, RECRUITER)
- **Row-Level Security**: Server Actions에서 `session.user.id` 검증

### 데이터 암호화
- **In-Transit**: HTTPS (Vercel 자동 제공)
- **At-Rest**: Neon DB 자동 암호화
- **Sensitive Fields**:
  - `hiddenOrgName` (Admin-only access)
  - Video URLs (Signed URLs from R2)

### API 보안
- **Rate Limiting**: Vercel Edge Middleware (계획)
- **CORS**: Next.js config에서 설정
- **Input Validation**: Zod schemas 모든 입력에 적용

### AI API Keys
- **환경변수**: `.env.local` (gitignored)
- **Vercel Secrets**: Production 배포 시 사용
- **Key Rotation**: 90일마다 권장

---

## 확장성 고려사항

### 캐싱 전략

#### 1. Database Query Caching
```typescript
// Prisma Accelerate 사용 (옵션)
const teachers = await prisma.teacherProfile.findMany({
  cacheStrategy: { ttl: 60, swr: 30 }  // 60초 캐시, 30초 stale
})
```

#### 2. AI Results Caching
- **Video Analysis**: `TeacherProfile.videoAnalysis` (JSON 저장)
- **Visa Status**: `TeacherProfile.visaStatus` (JSON 저장, 30일 TTL)
- **Embeddings**: `TeacherProfile.embedding` (영구 저장, 프로필 변경 시 재생성)

#### 3. Next.js Caching
```typescript
// RSC caching
export const revalidate = 3600  // 1시간마다 revalidate

// Dynamic rendering
export const dynamic = 'force-dynamic'  // For real-time data
```

### 로드 밸런싱
- **Vercel Edge Network**: 자동 글로벌 배포
- **Neon Connection Pooling**: `?pgbouncer=true`
- **R2 CDN**: Cloudflare 자동 CDN

### 수평적 확장
- **Serverless Functions**: Vercel 자동 스케일링
- **Database**: Neon autoscaling (0.25 → 10 CU)
- **Background Jobs**: Vercel Cron Jobs (계획)

---

## 성능 최적화

### 1. React Server Components (RSC)
```typescript
// Server Component (default)
async function TeacherList() {
  const teachers = await prisma.teacherProfile.findMany()  // DB 직접 접근
  return <div>{teachers.map(...)}</div>
}

// Client Component (최소화)
'use client'
function VideoUpload() {
  const [uploading, setUploading] = useState(false)
  return <UploadButton />
}
```

### 2. pgvector Index
```sql
-- Prisma migration에서 실행
CREATE INDEX idx_teacher_embedding ON "TeacherProfile"
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

CREATE INDEX idx_job_embedding ON "JobPosting"
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);
```

### 3. Image/Video Optimization
- **Sharp**: Next.js 자동 이미지 최적화
- **Cloudflare R2**: 비디오 CDN 캐싱
- **Lazy Loading**: `loading="lazy"` 속성

### 4. Code Splitting
```typescript
// Dynamic imports for heavy components
const KanbanBoard = dynamic(() => import('@/components/recruiter/kanban-board'), {
  loading: () => <Skeleton />,
  ssr: false  // Client-only
})
```

---

## 배포 아키텍처

```
┌─────────────────────────────────────────────────────────────┐
│                      VERCEL EDGE                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  US-East-1   │  │  EU-Central  │  │  AP-Seoul    │      │
│  │  (CDN Edge)  │  │  (CDN Edge)  │  │  (CDN Edge)  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│              VERCEL SERVERLESS FUNCTIONS                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Next.js    │  │ Server       │  │  API Routes  │      │
│  │   RSC Pages  │  │ Actions      │  │  (Webhooks)  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
          │                  │                  │
          ▼                  ▼                  ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   Neon DB    │  │ Cloudflare   │  │  OpenAI/     │
│  (Postgres + │  │      R2      │  │  Anthropic   │
│   pgvector)  │  │   (Videos)   │  │    APIs      │
└──────────────┘  └──────────────┘  └──────────────┘
```

### 환경 변수

#### Development (.env.local)
```env
DATABASE_URL=postgresql://...
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
NEXTAUTH_SECRET=...
NEXTAUTH_URL=http://localhost:3000
R2_ACCOUNT_ID=...
UPLOADTHING_SECRET=...
```

#### Production (Vercel Secrets)
```bash
vercel env add DATABASE_URL
vercel env add OPENAI_API_KEY
vercel env add ANTHROPIC_API_KEY
# ... 모든 환경변수
```

---

## 모니터링 및 로깅

### 계획된 통합 (미완)

#### 1. Sentry (Error Tracking)
```typescript
// lib/sentry.ts
import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0.1,
  environment: process.env.NODE_ENV
})
```

#### 2. Vercel Analytics
```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

#### 3. Custom Logging
```typescript
// lib/logger.ts
export function logAIAnalysis(type: 'video' | 'embedding' | 'visa', data: any) {
  console.log({
    timestamp: new Date().toISOString(),
    type,
    data,
    env: process.env.NODE_ENV
  })

  // Send to external service (Datadog, etc.)
}
```

---

## 다음 단계
이 아키텍처를 바탕으로 `Refinement.md`에서 개선점과 최적화 작업을 수행합니다.
