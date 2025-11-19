# Specification - Global Educator Nexus

## 프로젝트 개요

**Global Educator Nexus**는 단순한 채용 웹사이트가 아닌, **Data-Driven AI Platform**입니다.
- 국제학교 강사들의 비정형 데이터(영상 이력서)를 AI로 분석하여 정형 데이터로 변환
- 학교와 강사를 AI 벡터 검색으로 자동 매칭
- 리크루터를 위한 무료 ATS(Applicant Tracking System) 제공으로 시장 데이터 확보

## 목표 (Objectives)

### 비즈니스 목표
- [x] 국제학교 채용 시장의 데이터 허브 구축
- [x] 경쟁사 리크루터를 플랫폼으로 유입시켜 공고 데이터 흡수
- [x] 검색 엔진(Google, Perplexity) 독점을 통한 트래픽 장악
- [x] 강사 프로필 데이터베이스를 강앤크릴의 핵심 자산으로 확보

### 기술 목표
- [x] AI 멀티모달 분석(GPT-4o)으로 비디오 이력서 자동 평가
- [x] pgvector를 활용한 RAG 기반 자동 매칭 시스템 구현
- [x] Programmatic SEO로 수만 개 페이지 자동 생성
- [x] Next.js 15 App Router로 API 레이어 제거, 개발 속도 2배 향상

## 기술 스택 (Tech Stack)

### Core Stack
- **Framework:** Next.js 15 (App Router)
  - React Server Components(RSC)로 DB 직접 접근
- **Database:** Neon (Serverless PostgreSQL)
  - Extension: `pgvector` (벡터 검색)
- **ORM:** Prisma
  - 복잡한 다대다 관계 및 JSON 타입 처리
- **AI Engine:** Vercel AI SDK (Core + RAG)
  - Analysis: `GPT-4o` (Video/Image 분석)
  - Interaction: `Claude 3.5 Sonnet` (자연어 생성)
  - Embedding: `text-embedding-3-small` (벡터 검색)
- **Storage:** Cloudflare R2 + UploadThing
  - S3 호환, Egress 비용 $0
- **Auth:** Auth.js v5 (Beta)
  - Database Session Strategy

### Infrastructure
- **Hosting:** Vercel (Next.js 최적화)
- **Email:** Resend (트랜잭션 이메일)
- **Monitoring:** Vercel Analytics + Sentry

## 기능 요구사항 (Functional Requirements)

### 1. 강사(Teacher) 기능

#### 1.1 프로필 생성
- **기본 정보 입력**
  - 이름, 이메일, 국적, 학위, 경력
  - 희망 국가/도시, 희망 급여(USD)
- **비디오 이력서 업로드**
  - Cloudflare R2에 저장
  - AI 자동 분석 (GPT-4o)
    - 억양 분석 (accent_type)
    - 명확도 점수 (clarity_score: 1-10)
    - 에너지 레벨 (energy_level)
    - 외모 체크 (appearance_check)
- **벡터 임베딩 생성**
  - 프로필 텍스트를 `text-embedding-3-small`로 벡터화
  - `pgvector`에 저장하여 매칭에 활용

#### 1.2 공고 검색 및 지원
- **필터링**
  - 국가, 도시, 과목, 급여 범위
  - 비자 발급 가능 여부 자동 체크
- **AI 매칭 점수 표시**
  - 각 공고마다 0-100점 매칭 점수 표시
- **원클릭 지원**
  - 비자 불가능 시 차단 모달
  - 지원 시 자동으로 커버레터 AI 생성

#### 1.3 지원 현황 추적
- 지원한 공고 목록
- 현재 상태 (NEW → SCREENING → INTERVIEW → OFFER)
- 리크루터 메시지

### 2. 학교/리크루터(Client) 기능

#### 2.1 공고 등록
- **기본 정보**
  - 학교명 (익명 옵션 가능)
  - 위치, 과목, 급여(자동 USD 환산)
  - 요구 학위, 경력, 비자 타입
- **익명 공고 처리**
  - `isAnonymous: true` 시 강사에게 학교명 숨김
  - `hiddenOrgName`에 실제 학교명 저장 (Admin/영업용)

#### 2.2 ATS Dashboard (무료 제공)
- **Kanban Board**
  - `dnd-kit`으로 드래그 앤 드롭
  - [New] → [Screening] → [Interview] → [Offer] → [Hired/Rejected]
- **지원자 목록**
  - AI 매칭 점수 기준 정렬
  - 비디오 이력서 바로 재생
  - 비자 상태 자동 표시
- **연락처 Reveal (Monetization)**
  - 기본: 전화번호 마스킹 (`***-****-****`)
  - "Reveal Contact" 버튼: 크레딧 차감 또는 기록

#### 2.3 AI 자동 매칭 수신
- 공고 등록 시 자동으로 적합한 강사에게 이메일 발송
- 이메일 내용: AI가 개인화하여 작성

### 3. AI Agents (자동화 시스템)

#### 🤖 Agent 1: AI Screener (비디오 분석관)
**Trigger:** 강사가 비디오 업로드 완료
**Process:**
1. R2에서 비디오 URL 가져오기
2. GPT-4o에게 분석 요청
   ```json
   {
     "accent_type": "North American",
     "clarity_score": 8,
     "energy_level": "High",
     "appearance_check": "Pass",
     "summary": "Enthusiastic presenter with clear diction"
   }
   ```
3. `TeacherProfile.videoAnalysis`에 저장
4. 강사에게 즉시 피드백 노출

**Output:** 비정형 데이터 → 정형 데이터 변환

#### 🕵️ Agent 2: Autonomous Headhunter (자동 매칭)
**Trigger:** 신규 `JobPosting` 생성
**Process:**
1. 공고 JD를 벡터로 임베딩
2. `pgvector`로 코사인 유사도 0.85+ 강사 검색
3. `visaStatus` 필터링 (발급 불가능자 제외)
4. 선별된 강사에게 개인화 이메일 발송
   - "Sarah, 이 학교는 당신이 원하던 제주도에 있으며 급여가 $300 높습니다."

**Output:** 능동적 매칭으로 지원율 3배 향상 (가설)

#### ⚡ Agent 3: Rule-based Visa Guard (비자 판별기)
**Logic:** 국가별 하드코딩 규칙
- **China:**
  - `degree >= BA`
  - `experience >= 2 years`
  - `criminal_record == clean`
  - `age < 60`
- **Korea (E2):**
  - `citizenship IN [US, UK, CA, AU, NZ, IE, SA]`
  - `degree >= BA`

**UX:** 지원 불가능 시 차단 모달
- "이 공고는 비자 문제로 지원이 불가능합니다."

### 4. Admin 기능

#### 4.1 데이터 분석 대시보드
- 총 강사 수, 총 공고 수
- AI 매칭 정확도 추적
- 거절 사유 통계 (`rejectReason` 집계)
- 국가별 평균 급여 트렌드

#### 4.2 익명 공고 관리
- `hiddenOrgName` 조회 (영업용)
- 경쟁사 공고 패턴 분석

## 비기능 요구사항 (Non-Functional Requirements)

### 성능
- **페이지 로드:** < 3초 (LCP)
- **AI 분석:** < 30초 (비디오 5분 기준)
- **검색 결과:** < 500ms (벡터 검색 포함)
- **동시 사용자:** 1000명 처리 가능

### 보안
- **Auth:** Session-based (DB 저장)
- **데이터:** 개인정보(이메일, 전화) 암호화
- **API:** Rate Limiting (DDoS 방지)
- **Storage:** R2 Pre-signed URL (일회용 링크)

### 확장성
- **Database:** Neon Auto-scaling
- **CDN:** Vercel Edge Network
- **Caching:** Redis (향후 도입)

### SEO (검색 엔진 독점 전략)

#### Programmatic SEO (pSEO)
- **URL 구조:**
  - `/jobs/[country]/[city]/[subject]`
  - 예: `/jobs/south-korea/seoul/math`
- **Internal Linking Mesh:**
  - 각 페이지 하단에 20개씩 관련 링크
  - "Nearby Jobs" (같은 국가, 다른 도시)
  - "Related Subjects" (같은 도시, 다른 과목)
- **목표:** 수만 개 페이지 자동 생성

#### AEO (Answer Engine Optimization)
- **Structured Data:**
  - JobPosting Schema
  - FAQPage Schema
  - BreadcrumbList Schema
- **GEO Data Feeds:**
  - `/api/geo/salary-index.json`
  - LLM이 이해하기 쉬운 JSON 포맷
  ```json
  {
    "country": "South Korea",
    "avg_salary_usd": 2100,
    "housing_provided": true,
    "top_hiring_cities": ["Seoul", "Busan"]
  }
  ```

## 사용자 시나리오 (User Scenarios)

### 시나리오 1: 강사의 프로필 등록 및 자동 매칭
**사용자:** Sarah (미국, ESL 강사, 경력 5년)
**목표:** 한국 국제학교 취업
**단계:**
1. 구글 계정으로 로그인
2. 프로필 작성 (5분)
   - 희망 국가: 한국, 베트남
   - 희망 급여: $2,500/월
3. 비디오 이력서 업로드 (자기소개 3분)
4. AI 분석 결과 확인
   - "억양: North American ✅"
   - "명확도: 9/10 ✅"
   - "에너지: High ✅"
5. 1시간 후, 이메일 수신
   - "Seoul의 Math Teacher 공고가 당신과 95% 매칭됩니다!"
6. 원클릭 지원
7. 리크루터가 24시간 내 연락

**결과:** 3일 이내 인터뷰 확정

### 시나리오 2: 리크루터의 공고 등록 및 ATS 활용
**사용자:** 경쟁사 리크루터 (Teach Away)
**목표:** 플랫폼에서 무료 ATS 사용
**단계:**
1. 회원가입 (리크루터 role)
2. 공고 등록
   - 학교명: 익명 처리 ✅
   - 위치: 상하이
   - 급여: 25,000 CNY → 자동 USD 환산 ($3,500)
3. 10분 후, 지원자 5명 유입 (AI 자동 매칭)
4. ATS Dashboard에서 확인
   - 드래그 앤 드롭으로 상태 변경
   - 비디오 바로 재생
5. "Reveal Contact" 버튼으로 전화번호 확인
6. 강앤크릴에 데이터 축적 ✅

**결과:** 리크루터 만족 + 강앤크릴 데이터 확보

### 시나리오 3: 검색 엔진 유입 (SEO)
**사용자:** Google 검색자
**검색어:** "international school jobs in busan"
**단계:**
1. Google 검색 결과 1위에 우리 페이지 노출
   - URL: `/jobs/south-korea/busan`
   - Meta: "Find 47 international school jobs in Busan. Average salary $2,300/month."
2. 페이지 방문
3. Structured Data로 인해 Rich Snippet 노출
   - "💼 47 jobs | 💰 $2,300 avg | 📍 Busan"
4. 하단 링크 클릭
   - "Seoul jobs" → 추가 트래픽

**결과:** 트래픽 → 회원가입 → 플랫폼 성장

## UI/UX 가이드라인

### 디자인 원칙
- **Mobile First:** 모든 입력 폼 한 손 입력 가능
- **Minimalism:** shadcn/ui 활용, 불필요한 요소 제거
- **Gamification:** 프로필 완성도 미터 (80% 완성 시 상위 노출)

### 사용자 경험
- **프로필 작성:** 5분 이내 완료 가능
- **비디오 업로드:** 드래그 앤 드롭 (UploadThing)
- **검색 필터:** 실시간 결과 업데이트 (Debounce 300ms)

### Component Library
- **UI:** shadcn/ui (Radix UI 기반)
  - Card, Dialog, Table, Button
- **Form:** React Hook Form + Zod
- **Drag & Drop:** dnd-kit

## 데이터베이스 스키마 (핵심)

### User & Profile
```prisma
model User {
  id       String   @id @default(cuid())
  email    String   @unique
  role     UserRole @default(TEACHER)
  profile  TeacherProfile?
  jobs     JobPosting[]
}

enum UserRole {
  ADMIN
  TEACHER
  SCHOOL
  RECRUITER
}

model TeacherProfile {
  id            String  @id @default(cuid())
  userId        String  @unique
  user          User    @relation(fields: [userId], references: [id])

  // AI Analysis
  videoAnalysis Json?   // { accent, energy, score, summary }
  visaStatus    Json?   // { kr: true, cn: false, reason: "..." }

  // Vector Embedding (1536 dimensions)
  embedding     Unsupported("vector(1536)")?

  // Preferences
  minSalaryUSD  Int?
  preferredCountries String[]

  applications  Application[]
}
```

### Job Posting
```prisma
model JobPosting {
  id             String   @id @default(cuid())

  // Anonymity for competitors
  isAnonymous    Boolean  @default(false)
  hiddenOrgName  String?  // Admin only

  // Salary normalization
  salaryUSD      Int      // All currencies converted

  // Location
  country        String
  city           String
  subject        String

  applications   Application[]
  createdBy      User     @relation(fields: [createdById], references: [id])
  createdById    String
}
```

### Application (The Funnel)
```prisma
model Application {
  id            String      @id @default(cuid())

  teacher       TeacherProfile @relation(fields: [teacherId], references: [id])
  teacherId     String

  job           JobPosting  @relation(fields: [jobId], references: [id])
  jobId         String

  // ATS Status
  funnelStatus  AppStatus   @default(NEW)

  // AI Matching
  aiMatchScore  Int?        // 0-100

  // Analytics
  viewedAt      DateTime?
  rejectedAt    DateTime?
  rejectReason  String?     // Market research data
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

## 제약사항 (Constraints)

### 기술적 제약
- Neon Free Tier: 10GB 제한 (향후 Pro 전환 필요)
- Vercel Serverless: 10초 실행 제한 (긴 AI 분석은 Background Job 필요)
- R2: 월 10GB 무료 (초과 시 과금)

### 비즈니스 제약
- 초기 강사 500명 확보 필요 (Cold Start 문제)
- 경쟁사 공고 크롤링 시 법적 이슈 (robots.txt 준수)

### 시간 제약
- 9주 내 MVP 런칭 목표
- Week 1-2: 기반 구축
- Week 3-4: 강사 기능
- Week 5-6: 리크루터 기능
- Week 7-8: SEO 엔진
- Week 9+: 런칭 및 시딩

## 성공 지표 (Success Metrics)

### 단기 (3개월)
- [ ] 강사 프로필 1,000개
- [ ] 공고 등록 500개
- [ ] 월 검색 트래픽 10,000명
- [ ] AI 매칭 정확도 70%+

### 중기 (6개월)
- [ ] 구글 검색 1페이지 점유율 50%+
- [ ] 경쟁사 리크루터 50명 유입
- [ ] 월 지원 건수 5,000건
- [ ] MRR $10,000 (Contact Reveal 과금)

### 장기 (1년)
- [ ] 시장 지배적 위치 확보
- [ ] Perplexity/Claude 등 AI 검색 인용 1위
- [ ] 강사 DB 10,000명 (핵심 자산)
- [ ] Exit 또는 Series A 투자 유치

## 다음 단계

1. ✅ `Specification.md` 완성
2. ⏭️ `Pseudocode.md`에서 핵심 로직 설계
3. ⏭️ `Architecture.md`에서 컴포넌트 구조 상세화
4. ⏭️ Prisma Schema 구현 및 마이그레이션
5. ⏭️ Next.js 15 프로젝트 초기화
