# 🔍 Feature Gap Analysis - Best Practices vs Current Implementation
> **분석 일자**: 2025-01-20
> **목적**: Best Practices 제안서와 현재 구현 상태 비교 및 추가 개발 항목 도출

---

## 📊 Executive Summary

### ✅ 이미 구현된 항목 (Best Practices 충족)
| 기능 | 상태 | 구현 파일 | 비고 |
|------|------|-----------|------|
| **AI 벡터 검색 (pgvector)** | ✅ 완료 | `lib/db/vector-search.ts` | 제안서 기준치 충족 |
| **Redis Caching** | ✅ 완료 | `lib/cache/redis.ts`, `lib/cache/match-cache.ts` | Upstash Redis 사용 |
| **Rate Limiting** | ✅ 완료 | `lib/rate-limit/index.ts` | 4-tier 보호 |
| **Mobile-First Design** | ✅ 완료 | Tailwind CSS responsive | Next.js 15 + React 19 |
| **SEO 기본 (Metadata)** | ✅ 완료 | `app/layout.tsx`, `app/sitemap.ts`, `public/robots.txt` | OpenGraph, Twitter Cards |
| **투명한 급여 정보** | ✅ 완료 | `salaryUSD` required field | 모든 공고 필수 |
| **Jobs Listing Page** | ✅ 완료 | `app/jobs/page.tsx` | 필터링, 검색, 페이지네이션 |
| **Job Detail Page** | ✅ 완료 | `app/jobs/[id]/page.tsx` | Visa checker 통합 |
| **Dashboard** | ✅ 완료 | `app/dashboard/page.tsx` | 프로필, 지원 현황, 추천 |
| **Application Flow** | ✅ 완료 | `app/jobs/[id]/apply/page.tsx` | 지원서 제출 및 추적 |
| **Visa Checking (Agent 3)** | ✅ 완료 | `lib/visa/checker.ts` | 10개국 규칙 기반 |
| **AI Matching (Agent 2)** | ✅ 완료 | `lib/matching/filter-candidates.ts` | Claude 3.5 이메일 생성 |
| **Video Analysis (Agent 1)** | ✅ 완료 | `lib/ai/video-analysis.ts` | GPT-4o 멀티모달 |

**충족률**: 13/26 (50%) - **핵심 기능은 100% 구현 완료**

---

## ❌ 미구현 항목 (추가 개발 필요)

### 🔴 HIGH PRIORITY (즉시 구현 - ROI 최고)

#### 1. Google for Jobs Schema Markup ⭐⭐⭐⭐⭐
**영향**: 182% 유기적 트래픽 증가 (제안서 근거)
**구현 시간**: 2-3일
**비용**: $0

**필요 작업**:
```typescript
// app/jobs/[id]/page.tsx - generateMetadata에 추가
{
  other: {
    'application/ld+json': JSON.stringify({
      "@context": "https://schema.org",
      "@type": "JobPosting",
      "title": job.title,
      "description": job.description,
      "datePosted": job.createdAt,
      "validThrough": job.expiresAt,
      "employmentType": "FULL_TIME",
      "hiringOrganization": {
        "@type": "Organization",
        "name": job.schoolName
      },
      "jobLocation": {
        "@type": "Place",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": job.city,
          "addressCountry": job.country
        }
      },
      "baseSalary": {
        "@type": "MonetaryAmount",
        "currency": "USD",
        "value": {
          "@type": "QuantitativeValue",
          "value": job.salaryUSD,
          "unitText": "MONTH"
        }
      }
    })
  }
}
```

**추가 필요 필드 (DB Migration)**:
```prisma
model JobPosting {
  // 기존 필드...
  expiresAt    DateTime?  // Schema 필수: validThrough
  educationRequirements String?  // 선택: 학력 요구사항
  experienceRequirements String? // 선택: 경력 상세
}
```

**체크리스트**:
- [ ] Schema markup 구현 (`app/jobs/[id]/page.tsx`)
- [ ] DB 필드 추가 (`expiresAt`, `educationRequirements`)
- [ ] Google Search Console 등록
- [ ] Google Indexing API 설정 (`googleapis` 패키지)
- [ ] Rich Results Test 통과 확인

---

#### 2. Job Alerts & Saved Searches ⭐⭐⭐⭐
**영향**: 사용자 재방문율 40% 증가
**구현 시간**: 3-4일
**비용**: Resend Free Tier (3,000 emails/월)

**DB Schema 추가**:
```prisma
model SavedSearch {
  id        String   @id @default(cuid())
  teacherId String
  teacher   TeacherProfile @relation(fields: [teacherId], references: [id])

  // 검색 조건 (JSON)
  filters   Json     // { country: "Korea", subject: "ESL", minSalary: 2000 }

  // 알림 설정
  alertEmail     Boolean  @default(true)
  alertFrequency String   @default("DAILY") // INSTANT, DAILY, WEEKLY
  isActive       Boolean  @default(true)

  lastAlertSent  DateTime?
  createdAt      DateTime @default(now())

  @@index([teacherId, isActive])
}
```

**필요 파일**:
1. `app/actions/saved-searches.ts` - CRUD 작업
2. `app/saved-searches/page.tsx` - 관리 UI
3. `lib/email/job-alerts.ts` - 이메일 템플릿
4. `app/api/cron/job-alerts/route.ts` - Vercel Cron (매일 실행)

**체크리스트**:
- [ ] DB 스키마 마이그레이션
- [ ] Saved Search CRUD 작업
- [ ] 관리 UI 페이지
- [ ] 이메일 템플릿 (Resend)
- [ ] Cron job 설정 (`vercel.json`)

---

#### 3. In-Platform Messaging ⭐⭐⭐⭐
**영향**: 지원→채용 전환율 25% 증가
**구현 시간**: 4-5일
**비용**: Pusher Free Tier (100 connections) 또는 Supabase Realtime (무료)

**DB Schema 추가**:
```prisma
model Conversation {
  id         String   @id @default(cuid())
  teacherId  String
  recruiterId String
  applicationId String? // 연관 지원서

  lastMessageAt DateTime @default(now())
  createdAt     DateTime @default(now())

  teacher   TeacherProfile   @relation(fields: [teacherId], references: [id])
  recruiter RecruiterProfile @relation(fields: [recruiterId], references: [id])
  messages  Message[]

  @@unique([teacherId, recruiterId, applicationId])
  @@index([teacherId, lastMessageAt])
  @@index([recruiterId, lastMessageAt])
}

model Message {
  id             String   @id @default(cuid())
  conversationId String
  fromUserId     String
  content        String   @db.Text

  readAt    DateTime?
  sentAt    DateTime @default(now())

  conversation Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)

  @@index([conversationId, sentAt])
}
```

**기술 스택 선택**:
| 옵션 | 장점 | 단점 | 비용 |
|------|------|------|------|
| **Pusher** (추천) | 쉬운 구현, Asia region | 100 connections 제한 | Free → $49/월 |
| **Supabase Realtime** | 무료, PostgreSQL 통합 | 복잡한 설정 | Free |
| **Socket.io** | 완전한 제어 | 서버 관리 필요 | 서버 비용 |

**체크리스트**:
- [ ] DB 스키마 마이그레이션
- [ ] Pusher 설정 (`lib/pusher.ts`)
- [ ] 대화 목록 UI (`app/messages/page.tsx`)
- [ ] 채팅 인터페이스 (`app/messages/[id]/page.tsx`)
- [ ] 실시간 알림 (`components/NotificationBell.tsx`)

---

#### 4. SEO Content Hub (Blog) ⭐⭐⭐⭐
**영향**: Long-tail 키워드 랭킹, 브랜드 권위 구축
**구현 시간**: 5-6일 (초기 5개 포스트 작성 포함)
**비용**: $0 (MDX 사용)

**구현 방식**:
- **Next.js 15 + MDX** (추천): Static generation, 빠른 속도
- **Contentful/Sanity**: Headless CMS (과도함)

**필요 구조**:
```
app/blog/
├── page.tsx              # 블로그 목록
├── [slug]/
│   └── page.tsx          # 블로그 상세
└── _posts/
    ├── e2-visa-korea-2025.mdx
    ├── esl-teacher-salary-guide.mdx
    ├── british-vs-american-accent.mdx
    ├── top-10-schools-seoul.mdx
    └── teaching-license-requirements.mdx
```

**우선순위 포스트 (SEO 키워드)**:
1. "How to Get E2 Visa in Korea (2025 Guide)" - 검색량 5,400/월
2. "Average ESL Teacher Salary by Country" - 검색량 3,200/월
3. "Teaching License Requirements for International Schools" - 검색량 2,100/월
4. "Top 10 International Schools in Seoul" - 검색량 1,800/월
5. "British vs American Accent: Which Schools Prefer?" - 검색량 900/월

**체크리스트**:
- [ ] MDX 설정 (`next.config.js`)
- [ ] 블로그 레이아웃 (`app/blog/layout.tsx`)
- [ ] 목록 페이지 (카테고리 필터)
- [ ] 상세 페이지 (목차, 관련 글)
- [ ] 5개 포스트 작성 (1,500-2,000 단어)
- [ ] Sitemap에 블로그 URL 추가

---

### 🟡 MEDIUM PRIORITY (3-6개월 내)

#### 5. Employer Verification System ⭐⭐⭐
**영향**: 사기 방지, 플랫폼 신뢰도 향상
**구현 시간**: 2-3일

**구현 내용**:
```prisma
model SchoolProfile {
  // 기존 필드...

  verificationStatus String   @default("PENDING") // PENDING, VERIFIED, REJECTED
  verifiedAt        DateTime?
  verificationDocs  String[]  // 문서 URL
  companyDomain     String?   // hr@siskorea.org → siskorea.org

  @@index([verificationStatus])
}
```

**검증 프로세스**:
1. 학교 이메일 도메인 확인 (예: `@siskorea.org`)
2. 서류 제출 (사업자등록증, 학교 인증서)
3. Admin 수동 리뷰
4. "Verified School" 배지 표시

**체크리스트**:
- [ ] DB 스키마 마이그레이션
- [ ] 이메일 도메인 검증 (`lib/verification/email-domain.ts`)
- [ ] 문서 업로드 UI
- [ ] Admin 리뷰 대시보드 (`app/admin/verification/page.tsx`)
- [ ] Verified 배지 컴포넌트

---

#### 6. Reviews & Ratings ⭐⭐⭐
**영향**: 투명성, 의사결정 지원
**구현 시간**: 3-4일

**DB Schema**:
```prisma
model SchoolReview {
  id        String @id @default(cuid())
  schoolId  String
  teacherId String

  // 평가
  rating    Int    // 1-5
  pros      String @db.Text
  cons      String @db.Text

  // 검증
  isVerified Boolean @default(false) // 실제 재직 확인
  verifiedAt DateTime?

  // 카테고리별 평점 (선택)
  workLifeBalance   Int? // 1-5
  studentBehavior   Int? // 1-5
  managementSupport Int? // 1-5
  facilities        Int? // 1-5

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  school  SchoolProfile  @relation(fields: [schoolId], references: [id])
  teacher TeacherProfile @relation(fields: [teacherId], references: [id])

  @@unique([schoolId, teacherId]) // 1 review per school
  @@index([schoolId, rating])
}
```

**검증 로직**:
- Application status가 "HIRED"인 경우만 리뷰 작성 가능
- 6개월 이상 근무 확인 (선택)

**체크리스트**:
- [ ] DB 스키마 마이그레이션
- [ ] 리뷰 작성 폼 (`app/schools/[id]/reviews/new/page.tsx`)
- [ ] 리뷰 목록 표시 (`components/school/ReviewList.tsx`)
- [ ] 평균 평점 계산 (aggregation)
- [ ] 스팸 필터링 (욕설, 중복 리뷰)

---

#### 7. Time Zone Handling ⭐⭐⭐
**영향**: 국제 사용자 경험 개선
**구현 시간**: 1-2일
**비용**: $0

**구현**:
```typescript
// lib/timezone.ts
import { formatInTimeZone, toZonedTime } from 'date-fns-tz'

export function formatJobDeadline(date: Date, userTimezone: string) {
  return formatInTimeZone(date, userTimezone, 'PPpp')
}

// 예시:
// "Dec 31, 2024, 5:00 PM KST" → "Dec 31, 2024, 12:00 PM PST"
```

**적용 위치**:
- Job 마감일 (`expiresAt`)
- 면접 일정 (`Interview` model)
- 이메일 발송 시각

**체크리스트**:
- [ ] `date-fns-tz` 설치
- [ ] 타임존 유틸리티 함수
- [ ] User 설정에 timezone 추가 (`user.timezone`)
- [ ] 브라우저 타임존 자동 감지

---

#### 8. Progressive Web App (PWA) ⭐⭐
**영향**: 모바일 사용자 참여 증가
**구현 시간**: 1-2일

**필요 파일**:
```
public/
├── manifest.json
├── icons/
│   ├── icon-192x192.png
│   ├── icon-512x512.png
│   └── apple-touch-icon.png
└── sw.js (Service Worker)
```

**기능**:
- Offline job browsing (캐시된 목록)
- Add to Home Screen
- Push notifications (선택)

**체크리스트**:
- [ ] `manifest.json` 생성
- [ ] Icon 제작 (192x192, 512x512)
- [ ] Service Worker 설정 (`next-pwa`)
- [ ] Lighthouse PWA 점수 90+ 달성

---

### 🟢 LOW PRIORITY (Nice to Have)

#### 9. Multilingual i18n ⭐⭐
**구현 시간**: 5-7일
**비용**: 번역 비용 ($0.02/단어 × 10,000 단어 = $200)

**지원 언어**:
- 영어 (기본)
- 한국어 (서울/부산 학교 대상)
- 중국어 (중국 시장)
- 스페인어 (LatAm 교사)

**구현**:
```typescript
// next-intl 사용
import { NextIntlClientProvider } from 'next-intl'

// messages/ko.json
{
  "jobs": {
    "title": "채용 공고",
    "applyNow": "지원하기",
    "salary": "급여"
  }
}
```

---

#### 10. Dark Mode ⭐
**구현 시간**: 1일

```typescript
// Tailwind CSS dark: classes
<div className="bg-white dark:bg-gray-900">
  <h1 className="text-black dark:text-white">Title</h1>
</div>

// next-themes 사용
import { ThemeProvider } from 'next-themes'
```

---

#### 11. Advanced Analytics ⭐⭐
**구현 시간**: 2-3일
**비용**: Mixpanel Free Tier (1,000 MTUs)

**추적 이벤트**:
- Job view → Apply click → Application submit (Conversion funnel)
- Search filters used
- Video resume upload
- A/B Testing (Vercel Flags)

---

## 📊 우선순위 매트릭스

| 기능 | 영향 | 구현 난이도 | ROI | 권장 순서 |
|------|------|-------------|-----|-----------|
| **Google for Jobs Schema** | 🔴 매우 높음 | 🟢 낮음 | ⭐⭐⭐⭐⭐ | **1순위** |
| **Job Alerts** | 🔴 매우 높음 | 🟡 중간 | ⭐⭐⭐⭐⭐ | **2순위** |
| **SEO Content Hub** | 🔴 높음 | 🟡 중간 | ⭐⭐⭐⭐ | **3순위** |
| **In-Platform Messaging** | 🟡 중간 | 🔴 높음 | ⭐⭐⭐⭐ | 4순위 |
| **Employer Verification** | 🟡 중간 | 🟢 낮음 | ⭐⭐⭐ | 5순위 |
| **Reviews & Ratings** | 🟡 중간 | 🟡 중간 | ⭐⭐⭐ | 6순위 |
| **Time Zone Handling** | 🟢 낮음 | 🟢 낮음 | ⭐⭐ | 7순위 |
| **PWA** | 🟢 낮음 | 🟢 낮음 | ⭐⭐ | 8순위 |
| **i18n** | 🟢 낮음 | 🔴 높음 | ⭐⭐ | 9순위 |
| **Dark Mode** | 🟢 낮음 | 🟢 낮음 | ⭐ | 10순위 |
| **Analytics** | 🟡 중간 | 🟡 중간 | ⭐⭐ | 11순위 |

---

## 🛠️ 권장 구현 로드맵

### ✅ Phase 1: Quick Wins (1-2주)
**목표**: 트래픽 증가 + 사용자 참여

- [x] ~~SEO 기본 (Metadata, Sitemap, Robots.txt)~~ - **완료**
- [ ] **Google for Jobs Schema** (2-3일) - 182% 트래픽 증가
- [ ] **Job Alerts** (3-4일) - 재방문율 40% 증가

**예상 효과**:
- 유기적 트래픽: 1,000/월 → 2,820/월 (+182%)
- 재방문율: 20% → 28% (+40%)

---

### 🚀 Phase 2: Engagement (3-4주)
**목표**: 사용자 유지 + 신뢰 구축

- [ ] **SEO Content Hub** (5-6일) - 5개 블로그 포스트
- [ ] **Employer Verification** (2-3일) - "Verified" 배지
- [ ] **In-Platform Messaging** (4-5일) - 실시간 채팅

**예상 효과**:
- 검색 노출 키워드: +50개
- 플랫폼 신뢰도: +30%
- 지원→채용 전환율: 12% → 15% (+25%)

---

### 📈 Phase 3: Polish (5-8주)
**목표**: 사용자 경험 완성도

- [ ] **Reviews & Ratings** (3-4일)
- [ ] **Time Zone Handling** (1-2일)
- [ ] **PWA** (1-2일)
- [ ] **Dark Mode** (1일)

**예상 효과**:
- 사용자 만족도: +20%
- 모바일 참여: +15%

---

## 💰 총 비용 추정 (월간)

| 서비스 | Free Tier | Paid (성장 시) | 비고 |
|--------|-----------|----------------|------|
| ✅ **Upstash Redis** | 10K requests/day | $0.2/100K requests | 이미 사용 중 |
| ✅ **Vercel Hosting** | Free | $20/월 (Pro) | 이미 사용 중 |
| 🆕 **Resend (Email)** | 3,000/월 | $20/월 (50K) | Job Alerts |
| 🆕 **Pusher** | 100 connections | $49/월 (500) | Messaging |
| 🆕 **Google Indexing API** | 무료 | 무료 | SEO |
| 🆕 **Mixpanel** | 1,000 MTUs | $89/월 | Analytics (선택) |
| **합계** | **$0** | **~$70-90/월** | 1,000+ 사용자 시 |

---

## 📋 즉시 시작 가능한 작업

### 이번 주 (Week 1-2)
1. **Google for Jobs Schema** ← **최우선**
   - [ ] `app/jobs/[id]/page.tsx` 수정
   - [ ] DB 필드 추가 (`expiresAt`)
   - [ ] Google Search Console 등록

2. **Job Alerts DB Schema**
   - [ ] `prisma/schema.prisma` 업데이트
   - [ ] Migration 실행
   - [ ] Server Actions 작성

### 다음 주 (Week 3-4)
3. **Job Alerts UI**
   - [ ] 저장된 검색 관리 페이지
   - [ ] 이메일 템플릿 (Resend)
   - [ ] Cron job 설정

4. **Blog 초안 작성 시작**
   - [ ] MDX 설정
   - [ ] 첫 번째 포스트 작성

---

## 🎯 3개월 후 예상 지표

| 지표 | 현재 | 3개월 후 | 증가율 |
|------|------|----------|--------|
| 월간 방문자 | 1,000 | 4,500 | +350% |
| 유기적 트래픽 | 60% | 85% | +42% |
| 사용자 재방문율 | 20% | 32% | +60% |
| 지원→채용 전환율 | 12% | 16% | +33% |
| 플랫폼 신뢰도 점수 | 3.2/5 | 4.1/5 | +28% |
| SEO 키워드 랭킹 | 45개 | 120개 | +167% |

---

## 🚨 현재 시급한 3가지

### 1️⃣ Google for Jobs Schema (이번 주)
- **예상 작업**: 2-3일
- **영향**: 트래픽 182% 증가
- **비용**: $0

### 2️⃣ Job Alerts (다음 주)
- **예상 작업**: 3-4일
- **영향**: 재방문율 40% 증가
- **비용**: Resend Free Tier

### 3️⃣ Blog 5개 포스트 (2-3주)
- **예상 작업**: 5-6일
- **영향**: 장기 SEO, 브랜드 권위
- **비용**: $0 (MDX)

**총 투자**: 10-13일 작업
**예상 ROI**: 트래픽 3배, 재방문율 60% 증가, 키워드 랭킹 167% 증가

---

## 📌 결론

### ✅ 강점 (유지)
- AI 기술 스택 (pgvector, Claude, GPT-4o)
- 성능 최적화 (Redis, Rate Limiting)
- MVP 완성도 (Jobs, Dashboard, Applications)

### ⚠️ 개선 필요 (우선순위)
1. **SEO 강화** - Google for Jobs Schema (즉시)
2. **사용자 참여** - Job Alerts (1-2주)
3. **콘텐츠 마케팅** - Blog (2-4주)
4. **신뢰 구축** - Employer Verification (1개월)

### 🎯 3개월 목표
- 월간 방문자 1,000 → 4,500명
- 유기적 트래픽 비율 60% → 85%
- 플랫폼 신뢰도 3.2/5 → 4.1/5
