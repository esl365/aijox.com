# Refinement - 개선 및 최적화

## 개요

이 문서는 현재 구현된 Global Educator Nexus의 코드 품질, 성능, 보안, 기능 완성도를 분석하고 개선 방향을 제시합니다.

**분석 기준 날짜**: 2025-01-19
**코드 완성도**: 약 60% (핵심 기능 구현 완료, 최적화 및 일부 기능 미완)

---

## 🔍 전체 코드 분석 결과

### ✅ 잘 구현된 부분

1. **AI Agents 핵심 로직**
   - ✅ Agent 1 (Video Analyzer): GPT-4o 연동, Zod 스키마, 에러 처리 완벽
   - ✅ Agent 2 (Embeddings): OpenAI API 연동, 배치 처리, pgvector 쿼리
   - ✅ Agent 3 (Visa Guard): 10개국 규칙 엔진, 타입 안전성 우수

2. **TypeScript 타입 안전성**
   - ✅ Zod 스키마를 모든 AI 응답에 적용
   - ✅ Prisma 자동 타입 생성
   - ✅ Server Actions 타입 추론

3. **코드 구조 및 모듈화**
   - ✅ `lib/` 폴더 기능별 분리 (ai, visa, db, validations)
   - ✅ Server Actions 중앙화 (`app/actions/`)
   - ✅ 컴포넌트 계층 구조 명확

---

## 🚨 발견된 문제점

### 1. 치명적 문제 (CRITICAL)

#### 1.1. pgvector Extension 미설치 확인 불가
**파일**: `lib/db/vector-search.ts`

**문제**:
```typescript
// raw SQL을 사용하지만, pgvector가 설치되어 있는지 확인하는 로직이 없음
const matches = await prisma.$queryRaw`
  SELECT ...
  FROM "TeacherProfile" t
  WHERE t.embedding <=> ${job.embedding}::vector ...
`
```

**영향도**: 💀 CRITICAL - DB에 pgvector 미설치 시 runtime error 발생

**해결책**:
```typescript
// lib/db/check-pgvector.ts
export async function ensurePgvectorInstalled() {
  try {
    await prisma.$queryRaw`SELECT '1'::vector;`
    return true
  } catch (error) {
    console.error('pgvector extension not installed!')
    throw new Error(
      'Database is missing pgvector extension. Run: CREATE EXTENSION vector;'
    )
  }
}

// 앱 시작 시 체크
// app/layout.tsx or middleware
await ensurePgvectorInstalled()
```

#### 1.2. 환경변수 검증 미비
**파일**: 전역

**문제**:
- `.env.example` 파일 없음
- 환경변수 누락 시 runtime error (개발 초기에 발견 어려움)

**해결책**:
```typescript
// lib/env.ts
import { z } from 'zod'

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  OPENAI_API_KEY: z.string().startsWith('sk-'),
  ANTHROPIC_API_KEY: z.string().startsWith('sk-ant-'),
  NEXTAUTH_SECRET: z.string().min(32),
  NEXTAUTH_URL: z.string().url(),
  R2_ACCOUNT_ID: z.string(),
  R2_ACCESS_KEY_ID: z.string(),
  R2_SECRET_ACCESS_KEY: z.string(),
})

export const env = envSchema.parse(process.env)
```

#### 1.3. SQL Injection 취약점 (Hybrid Search)
**파일**: `lib/db/vector-search.ts:210-229`

**문제**:
```typescript
// subjects와 countries가 사용자 입력일 경우 SQL injection 위험
const subjectsList = subjects.map(s => `'${s}'`).join(',')  // ❌ 위험!
conditions.push(`t.subjects && ARRAY[${subjectsList}]::text[]`)
```

**해결책**:
```typescript
// Parameterized queries 사용
const subjectsList = subjects.map((_, i) => `$${i + offset}`).join(',')
conditions.push(`t.subjects && ARRAY[${subjectsList}]::text[]`)

// 또는 Prisma의 안전한 메서드 사용
const teachers = await prisma.teacherProfile.findMany({
  where: {
    subjects: { hasSome: subjects }
  }
})
```

---

### 2. 높은 우선순위 (HIGH)

#### 2.1. AI API Rate Limiting 처리 부족
**파일**: `lib/ai/embeddings.ts`, `lib/ai/video-analyzer.ts`

**문제**:
- `analyzeVideoWithRetry`는 존재하지만 embeddings에는 없음
- OpenAI Tier 0 (무료): 분당 3 requests 제한
- 배치 처리 시 rate limit 초과 가능

**현재 코드**:
```typescript
// lib/ai/embeddings.ts:119
if (i + BATCH_SIZE < jobs.length) {
  await new Promise(resolve => setTimeout(resolve, 100));  // 100ms만 대기 (부족)
}
```

**해결책**:
```typescript
// lib/ai/rate-limiter.ts
export class RateLimiter {
  private queue: Array<() => Promise<any>> = []
  private processing = false

  constructor(
    private maxRequestsPerMinute: number,
    private delayBetweenRequests: number
  ) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await fn()
          resolve(result)
        } catch (error) {
          reject(error)
        }
      })
      this.processQueue()
    })
  }

  private async processQueue() {
    if (this.processing || this.queue.length === 0) return
    this.processing = true

    while (this.queue.length > 0) {
      const fn = this.queue.shift()!
      await fn()
      await new Promise(r => setTimeout(r, this.delayBetweenRequests))
    }

    this.processing = false
  }
}

// 사용
const openaiLimiter = new RateLimiter(3, 20000) // 분당 3개, 20초 간격

export async function generateJobEmbedding(job) {
  return openaiLimiter.execute(async () => {
    const { embedding } = await embed({ ... })
    return embedding
  })
}
```

#### 2.2. 에러 메시지 사용자 노출
**파일**: `lib/ai/video-analyzer.ts:142`

**문제**:
```typescript
throw new Error(`Video analysis failed: ${error.message}`)  // 내부 에러 노출
```

**해결책**:
```typescript
// lib/errors.ts
export class PublicError extends Error {
  constructor(
    message: string,
    public userMessage: string,
    public code: string
  ) {
    super(message)
  }
}

// video-analyzer.ts
throw new PublicError(
  `Video analysis failed: ${error.message}`,  // 로그용
  'Failed to analyze video. Please try again or contact support.',  // 사용자용
  'VIDEO_ANALYSIS_FAILED'
)

// Server Actions에서 처리
try {
  await analyzeVideo(url)
} catch (error) {
  if (error instanceof PublicError) {
    return { error: error.userMessage }
  }
  return { error: 'An unexpected error occurred.' }
}
```

#### 2.3. Video Upload 후 자동 분석 미연결
**파일**: 없음 (구현 누락)

**문제**:
- `lib/ai/video-analyzer.ts`는 존재하지만, UploadThing webhook과 연결되지 않음
- `app/api/uploadthing/route.ts`에 `onUploadComplete` 핸들러 없음

**해결책**:
```typescript
// app/api/uploadthing/route.ts
import { analyzeVideoWithRetry } from '@/lib/ai/video-analyzer'
import { prisma } from '@/lib/db'

export const uploadRouter = createUploadthing({
  video: fileTypes(['video/mp4', 'video/webm'])
    .maxFileSize('100MB')
    .middleware(async ({ req }) => {
      const session = await getSession(req)
      if (!session?.user) throw new Error('Unauthorized')
      return { userId: session.user.id }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // 1. Save video URL to database
      await prisma.teacherProfile.update({
        where: { userId: metadata.userId },
        data: { videoUrl: file.url }
      })

      // 2. Trigger AI analysis (background)
      // IMPORTANT: Don't await here (webhook timeout 위험)
      analyzeVideoWithRetry(file.url)
        .then(async (analysis) => {
          await prisma.teacherProfile.update({
            where: { userId: metadata.userId },
            data: {
              videoAnalysis: analysis as any,
              profileCompleteness: calculateProfileCompleteness(...)
            }
          })
        })
        .catch(error => {
          console.error('Video analysis failed:', error)
          // Send notification to user
        })

      return { videoUrl: file.url }
    })
})
```

#### 2.4. Prisma Migration pgvector 지원 누락
**파일**: `prisma/schema.prisma`

**문제**:
```prisma
embedding Unsupported("vector(1536)")?
```
- `Unsupported` 타입은 Prisma가 네이티브 지원하지 않는 타입
- Migration 파일에 직접 SQL 추가 필요

**해결책**:
```sql
-- prisma/migrations/XXX_add_pgvector/migration.sql

-- 1. pgvector extension 활성화
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. 인덱스 생성 (성능 향상)
CREATE INDEX IF NOT EXISTS idx_teacher_embedding
ON "TeacherProfile"
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

CREATE INDEX IF NOT EXISTS idx_job_embedding
ON "JobPosting"
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);
```

---

### 3. 중간 우선순위 (MEDIUM)

#### 3.1. 프로필 완성도 계산 로직 미구현
**파일**: `lib/ai/video-analyzer.ts:218`

**문제**:
```typescript
export function calculateProfileCompleteness(
  hasVideo: boolean,
  videoAnalysis: VideoAnalysis | null,
  hasBasicInfo: boolean,
  hasExperience: boolean,
  hasCertifications: boolean
): number {
  // ... 구현되어 있음
}
```
- 함수는 존재하지만, 실제로 호출하는 곳이 없음
- `TeacherProfile.profileCompleteness`가 항상 0으로 유지됨

**해결책**:
```typescript
// app/actions/teacher.ts
export async function updateTeacherProfile(data) {
  const updated = await prisma.teacherProfile.update({
    where: { id: data.id },
    data: { ...data }
  })

  // Recalculate completeness
  const completeness = calculateProfileCompleteness(
    !!updated.videoUrl,
    updated.videoAnalysis as any,
    !!(updated.firstName && updated.lastName && updated.email),
    !!updated.yearsExperience,
    !!updated.certifications && updated.certifications.length > 0
  )

  await prisma.teacherProfile.update({
    where: { id: data.id },
    data: { profileCompleteness: completeness }
  })

  revalidatePath('/profile')
}
```

#### 3.2. Visa Status 캐싱 TTL 없음
**파일**: `lib/visa/checker.ts`

**문제**:
- `visaStatus` JSON에 `lastUpdated` 필드가 있지만, 실제로 TTL 체크하는 로직 없음
- 비자 규칙 변경 시 오래된 캐시 사용 가능

**해결책**:
```typescript
export function isVisaStatusExpired(visaStatus: any): boolean {
  if (!visaStatus?.lastUpdated) return true

  const lastUpdated = new Date(visaStatus.lastUpdated)
  const now = new Date()
  const daysSinceUpdate = (now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24)

  return daysSinceUpdate > 30  // 30일 TTL
}

// Usage in Server Actions
export async function checkTeacherVisaStatus(teacherId: string, country: string) {
  const teacher = await prisma.teacherProfile.findUnique({
    where: { id: teacherId }
  })

  // Check cache first
  const cachedStatus = teacher.visaStatus?.[country]
  if (cachedStatus && !isVisaStatusExpired(cachedStatus)) {
    return cachedStatus
  }

  // Recalculate
  const result = checkVisaEligibility(teacher, country)

  // Update cache
  await prisma.teacherProfile.update({
    where: { id: teacherId },
    data: {
      visaStatus: {
        ...teacher.visaStatus,
        [country]: result
      }
    }
  })

  return result
}
```

#### 3.3. 이메일 자동 발송 미구현
**파일**: `lib/ai/email-generator.ts` (존재만 함)

**문제**:
- Specification과 Pseudocode에는 "공고 생성 시 매칭된 강사에게 자동 이메일 발송"이라고 되어 있음
- `email-generator.ts` 파일은 있지만 내용 없음

**해결책**:
```typescript
// lib/ai/email-generator.ts
import { generateText } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function generatePersonalizedEmail({
  teacherName,
  jobTitle,
  schoolName,
  city,
  country,
  salary,
  teacherPreferences,
  matchScore
}: {
  teacherName: string
  jobTitle: string
  schoolName: string
  city: string
  country: string
  salary: number
  teacherPreferences: any
  matchScore: number
}) {
  const prompt = `Write a personalized recruitment email for ${teacherName}.

Job Details:
- Position: ${jobTitle}
- School: ${schoolName}
- Location: ${city}, ${country}
- Salary: $${salary} USD/month
- AI Match Score: ${matchScore}%

Teacher Preferences:
${JSON.stringify(teacherPreferences, null, 2)}

Guidelines:
- Professional but friendly tone
- Highlight why this job matches their preferences
- Include specific benefits (salary, location)
- Keep under 200 words
- Include clear call-to-action

Subject line:
Body:
`

  const { text } = await generateText({
    model: anthropic('claude-3-5-sonnet-20241022'),
    prompt,
    temperature: 0.7
  })

  const [subject, ...bodyLines] = text.split('\n')
  const body = bodyLines.join('\n').trim()

  return {
    subject: subject.replace('Subject:', '').trim(),
    body
  }
}

export async function sendMatchNotification(
  teacherEmail: string,
  jobId: string,
  emailContent: { subject: string; body: string }
) {
  await resend.emails.send({
    from: 'Global Educator Nexus <jobs@aijox.com>',
    to: teacherEmail,
    subject: emailContent.subject,
    html: `
      <div style="font-family: sans-serif; line-height: 1.6;">
        ${emailContent.body.split('\n').map(line => `<p>${line}</p>`).join('')}

        <p style="margin-top: 24px;">
          <a href="https://aijox.com/jobs/${jobId}"
             style="background: #0070f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
            View Job & Apply
          </a>
        </p>
      </div>
    `
  })
}
```

#### 3.4. 로딩 상태 및 Suspense 미사용
**파일**: `app/**/*.tsx`

**문제**:
- Server Components에서 데이터 fetch 시 로딩 UI 없음
- 사용자가 빈 화면을 볼 수 있음

**해결책**:
```typescript
// app/(teacher)/profile/page.tsx
import { Suspense } from 'react'

export default function ProfilePage() {
  return (
    <Suspense fallback={<ProfileSkeleton />}>
      <ProfileContent />  {/* async Server Component */}
    </Suspense>
  )
}

async function ProfileContent() {
  const profile = await getTeacherProfile()
  return <ProfileForm profile={profile} />
}

function ProfileSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-64 w-full" />
      <Skeleton className="h-12 w-1/3" />
    </div>
  )
}
```

---

## 💡 기능 누락 (Missing Features)

### 1. Programmatic SEO
**우선순위**: HIGH
**현재 상태**: 미구현

**Specification 요구사항**:
```
app/jobs/[country]/[city]/[subject]/page.tsx
```

**구현 필요**:
```typescript
// app/jobs/[country]/[city]/[subject]/page.tsx
import { prisma } from '@/lib/db'
import { Metadata } from 'next'

type Params = {
  country: string
  city: string
  subject: string
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  return {
    title: `${params.subject} Teaching Jobs in ${params.city}, ${params.country} | Global Educator Nexus`,
    description: `Find ${params.subject} teaching positions in ${params.city}. Browse international school jobs with competitive salaries and benefits.`,
    openGraph: {
      title: `${params.subject} Jobs in ${params.city}`,
      description: `Explore teaching opportunities in ${params.city}, ${params.country}`
    }
  }
}

export async function generateStaticParams() {
  // Generate all possible combinations
  const jobs = await prisma.jobPosting.findMany({
    select: { country: true, city: true, subject: true },
    distinct: ['country', 'city', 'subject']
  })

  return jobs.map(job => ({
    country: job.country.toLowerCase().replace(/\s/g, '-'),
    city: job.city.toLowerCase().replace(/\s/g, '-'),
    subject: job.subject.toLowerCase().replace(/\s/g, '-')
  }))
}

export default async function JobsByLocationPage({ params }: { params: Params }) {
  const jobs = await prisma.jobPosting.findMany({
    where: {
      country: { equals: params.country, mode: 'insensitive' },
      city: { equals: params.city, mode: 'insensitive' },
      subject: { equals: params.subject, mode: 'insensitive' },
      status: 'ACTIVE'
    },
    include: {
      recruiter: {
        select: { name: true }
      }
    }
  })

  return (
    <div>
      <h1>{params.subject} Teaching Jobs in {params.city}, {params.country}</h1>
      <JobList jobs={jobs} />

      {/* Internal linking for SEO */}
      <section>
        <h2>Related Job Searches</h2>
        <ul>
          <li><Link href={`/jobs/${params.country}/seoul/esl`}>ESL Jobs in Seoul</Link></li>
          <li><Link href={`/jobs/china/${params.city}/${params.subject}`}>Jobs in China</Link></li>
          {/* More internal links */}
        </ul>
      </section>
    </div>
  )
}
```

### 2. ATS Kanban Board
**우선순위**: HIGH
**현재 상태**: 부분 구현

**필요 기능**:
- `components/recruiter/kanban-board.tsx` 파일 있음
- Server Action으로 drag & drop 상태 업데이트 필요

```typescript
// app/actions/recruiter.ts
'use server'

export async function updateApplicationStatus(
  applicationId: string,
  newStatus: 'NEW' | 'SCREENING' | 'INTERVIEW' | 'OFFER' | 'HIRED' | 'REJECTED'
) {
  const session = await getSession()
  if (session?.user.role !== 'RECRUITER') {
    throw new Error('Unauthorized')
  }

  await prisma.application.update({
    where: { id: applicationId },
    data: {
      funnelStatus: newStatus,
      updatedAt: new Date()
    }
  })

  revalidatePath('/recruiter/dashboard')
}
```

### 3. 데이터 분석 대시보드
**우선순위**: MEDIUM
**현재 상태**: 미구현

**제안**:
```typescript
// app/(admin)/analytics/page.tsx
import { prisma } from '@/lib/db'

export default async function AnalyticsPage() {
  // 1. Top reject reasons (market intelligence)
  const rejectReasons = await prisma.application.groupBy({
    by: ['rejectReason'],
    where: { rejectReason: { not: null } },
    _count: { rejectReason: true },
    orderBy: { _count: { rejectReason: 'desc' } },
    take: 10
  })

  // 2. Visa status distribution
  const visaIssues = rejectReasons.filter(r =>
    r.rejectReason?.toLowerCase().includes('visa')
  )

  // 3. Average time-to-hire
  const hiredApps = await prisma.application.findMany({
    where: { funnelStatus: 'HIRED' },
    select: { createdAt: true, updatedAt: true }
  })

  const avgDays = hiredApps.reduce((sum, app) => {
    const days = (app.updatedAt.getTime() - app.createdAt.getTime()) / (1000 * 60 * 60 * 24)
    return sum + days
  }, 0) / hiredApps.length

  return (
    <div>
      <h1>Recruitment Analytics</h1>

      <Card>
        <CardHeader>Top Rejection Reasons</CardHeader>
        <CardContent>
          {rejectReasons.map(r => (
            <div key={r.rejectReason}>
              {r.rejectReason}: {r._count.rejectReason}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>Average Time to Hire</CardHeader>
        <CardContent>{avgDays.toFixed(1)} days</CardContent>
      </Card>
    </div>
  )
}
```

---

## 🏆 개선 우선순위 (Top 10)

| 순위 | 항목 | 우선순위 | 예상 소요 시간 | 영향도 |
|------|------|----------|----------------|--------|
| 1 | pgvector extension 체크 로직 | CRITICAL | 30분 | 매우 높음 |
| 2 | 환경변수 Zod 검증 | CRITICAL | 1시간 | 높음 |
| 3 | SQL Injection 수정 (hybridSearch) | CRITICAL | 1시간 | 매우 높음 |
| 4 | Video Upload → AI 분석 연결 | HIGH | 2시간 | 높음 |
| 5 | Rate Limiter 구현 | HIGH | 3시간 | 중간 |
| 6 | 에러 메시지 사용자화 | HIGH | 2시간 | 중간 |
| 7 | Profile Completeness 자동 계산 | MEDIUM | 1시간 | 중간 |
| 8 | Visa Status TTL 체크 | MEDIUM | 1시간 | 낮음 |
| 9 | Programmatic SEO 구현 | HIGH | 4시간 | 높음 (장기) |
| 10 | 이메일 자동 발송 | MEDIUM | 3시간 | 중간 |

---

## 🎯 즉시 실행 가능한 개선안 (Quick Wins)

### 1. .env.example 파일 생성
```bash
# .env.example
DATABASE_URL="postgresql://user:password@localhost:5432/dbname?pgbouncer=true"
DIRECT_URL="postgresql://user:password@localhost:5432/dbname"

NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"

OPENAI_API_KEY="sk-proj-..."
ANTHROPIC_API_KEY="sk-ant-..."

R2_ACCOUNT_ID="your_cloudflare_account_id"
R2_ACCESS_KEY_ID="your_r2_access_key"
R2_SECRET_ACCESS_KEY="your_r2_secret_key"

RESEND_API_KEY="re_..."
UPLOADTHING_SECRET="sk_live_..."

NODE_ENV="development"
```

### 2. Prisma Migration에 pgvector 추가
```bash
# 새 migration 생성
npx prisma migrate create add_pgvector_extension

# prisma/migrations/XXX_add_pgvector_extension/migration.sql 수정
```

### 3. TypeScript Strict Mode 활성화
```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,  // 배열 접근 안전성
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

---

## 📊 성능 최적화 제안

### 1. Database Query 최적화

**Before**:
```typescript
// N+1 problem
const applications = await prisma.application.findMany()
for (const app of applications) {
  const teacher = await prisma.teacherProfile.findUnique({ where: { id: app.teacherId } })
}
```

**After**:
```typescript
const applications = await prisma.application.findMany({
  include: {
    teacher: true,  // JOIN으로 한 번에 가져오기
    job: true
  }
})
```

### 2. Vector Search 인덱스 최적화

```sql
-- 현재: ivfflat (기본)
CREATE INDEX idx_teacher_embedding ON "TeacherProfile"
  USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- 개선: lists 값 조정 (rows / 1000)
-- 10,000 teachers → lists = 100
-- 100,000 teachers → lists = 1000

-- 더 나은 성능을 위해 HNSW (Hierarchical Navigable Small World) 고려
CREATE INDEX idx_teacher_embedding_hnsw ON "TeacherProfile"
  USING hnsw (embedding vector_cosine_ops);
```

### 3. React Server Components 최적화

```typescript
// ❌ Bad: 모든 것을 Client Component로
'use client'
export default function Dashboard() {
  const [data, setData] = useState(null)

  useEffect(() => {
    fetch('/api/data').then(r => r.json()).then(setData)
  }, [])

  return <div>{data && <Charts data={data} />}</div>
}

// ✅ Good: Server Component + Streaming
export default async function Dashboard() {
  const data = await getData()  // 서버에서 직접 DB 접근

  return (
    <Suspense fallback={<Skeleton />}>
      <Charts data={data} />  {/* Client Component는 필요한 부분만 */}
    </Suspense>
  )
}
```

---

## 🔐 보안 강화 제안

### 1. Rate Limiting (Vercel Edge Middleware)
```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'),  // 10초당 10 requests
})

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/api')) {
    const ip = request.ip ?? '127.0.0.1'
    const { success, pending, limit, reset, remaining } = await ratelimit.limit(ip)

    if (!success) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      )
    }
  }

  return NextResponse.next()
}
```

### 2. CSRF Protection (Auth.js 내장 활용)
```typescript
// lib/auth.ts
export const authOptions = {
  ...
  cookies: {
    sessionToken: {
      name: `__Secure-next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',  // CSRF protection
        path: '/',
        secure: process.env.NODE_ENV === 'production'
      }
    }
  }
}
```

### 3. Input Sanitization
```typescript
// lib/sanitize.ts
import validator from 'validator'

export function sanitizeString(input: string): string {
  return validator.escape(input.trim())
}

export function sanitizeEmail(email: string): string | null {
  const trimmed = email.trim().toLowerCase()
  return validator.isEmail(trimmed) ? trimmed : null
}

// Server Actions에서 사용
export async function updateProfile(data: any) {
  const sanitized = {
    firstName: sanitizeString(data.firstName),
    lastName: sanitizeString(data.lastName),
    email: sanitizeEmail(data.email)
  }

  if (!sanitized.email) {
    throw new Error('Invalid email format')
  }

  await prisma.teacherProfile.update({ ... })
}
```

---

## 다음 단계

1. **즉시 수정 (오늘)**: CRITICAL 문제 3가지 해결
2. **이번 주**: HIGH 우선순위 6가지 해결
3. **다음 주**: MEDIUM 우선순위 및 누락 기능 구현
4. **장기 (2주+)**: Programmatic SEO, Analytics Dashboard

이 개선사항들을 바탕으로 `Completion.md`에서 테스트 및 배포 계획을 수립합니다.
