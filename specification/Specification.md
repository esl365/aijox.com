# Specification - Global Educator Nexus

## 프로젝트 개요

**Global Educator Nexus**는 **영어 원어민 교사 및 국제학교 ESL/EFL 교사 전문 채용 플랫폼**입니다.
- **타겟 사용자**: 영어 원어민 언어 강사 (ESL/EFL/IELTS/TOEFL 교사) 및 국제학교 영어 교사
- **핵심 차별화**: 비디오 이력서 AI 분석으로 **억양(accent), 원어민 여부, 발음 명확도** 자동 검증
- **자동 매칭**: AI 벡터 검색으로 학교의 억양 선호도(미국/영국/호주), 비자 요건에 맞는 교사 매칭
- **시장 데이터 확보**: 리크루터를 위한 무료 ATS 제공으로 경쟁사 공고 및 급여 정보 수집

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

#### 🤖 Agent 1: AI Screener - Native Speaker Verification Engine
**Trigger:** 강사가 비디오 이력서 업로드 완료
**목표:** 비정형 데이터(영상) → 정형 데이터(원어민 검증 점수)
**Process:**
1. R2에서 비디오 URL 가져오기
2. **GPT-4o Multimodal Analysis** 실행
   - **System Prompt (핵심):**
     ```
     You are an expert ESL recruiter specialized in verifying native English speakers.
     Analyze this teaching video and provide a detailed assessment in JSON format.

     Focus on:
     - Accent type (North American, British, Australian, South African, Non-native)
     - Native speaker confidence (0-100, based on pronunciation, grammar, fluency)
     - Pronunciation quality
     - Grammar accuracy
     - Teaching effectiveness
     - Red flags (non-native indicators, unclear speech)
     ```
   - **Expected Output:**
     ```json
     {
       "accent_type": "British",
       "accent_subtype": "Received Pronunciation (RP)",
       "native_confidence_score": 95,
       "accent_clarity": 9,
       "pronunciation_quality": 9,
       "grammar_accuracy": 10,
       "energy_level": "High",
       "professionalism_score": 8,
       "teaching_style": "Interactive, student-centered",
       "appearance_check": "Professional",
       "background_setting": "Clean, well-lit classroom",
       "summary": "Highly confident native British speaker with excellent RP accent. Grammar is impeccable. Very engaging teaching style suitable for young learners.",
       "red_flags": [],
       "recommendations": ["Excellent candidate for positions requiring British accent"]
     }
     ```
3. `TeacherProfile.videoAnalysis`에 저장
4. `isNativeSpeaker` 자동 업데이트 (native_confidence_score >= 80이면 true)
5. **즉시 피드백 노출** (30초 이내)
   - ✅ "당신은 **원어민**으로 인증되었습니다!" (신뢰도 95%)
   - ✅ "억양: **British (RP)** - 영국 국제학교에 최적"
   - ⚠️ "개선 제안: 배경 조명을 조금 더 밝게 하세요"

**Output:**
- 원어민 검증 자동화 (사람 개입 불필요)
- 억양 타입별 공고 매칭 준비 완료
- 학교가 신뢰할 수 있는 객관적 데이터 제공

#### 🕵️ Agent 2: Autonomous Headhunter (자동 매칭)
**Trigger:** 신규 `JobPosting` 생성
**Process:**
1. 공고 JD를 벡터로 임베딩
2. `pgvector`로 코사인 유사도 0.85+ 강사 검색
3. `visaStatus` 필터링 (발급 불가능자 제외)
4. 선별된 강사에게 개인화 이메일 발송
   - "Sarah, 이 학교는 당신이 원하던 제주도에 있으며 급여가 $300 높습니다."

**Output:** 능동적 매칭으로 지원율 3배 향상 (가설)

#### ⚡ Agent 3: Native Speaker Visa Guard (원어민 비자 판별 엔진)
**목표:** 원어민 국적 기반 비자 적격성 자동 체크 (법적 리스크 제로)
**Logic:** 국가별 하드코딩된 원어민 규칙

**한국 E2 비자 (가장 엄격):**
```javascript
function checkKoreaE2Eligibility(teacher) {
  // E2 비자는 7개국 원어민만 가능
  const E2_COUNTRIES = ['USA', 'UK', 'CANADA', 'AUSTRALIA', 'NEW_ZEALAND', 'IRELAND', 'SOUTH_AFRICA'];

  if (!E2_COUNTRIES.includes(teacher.passportCountry)) {
    return {
      eligible: false,
      reason: "E2 비자는 미국, 영국, 캐나다, 호주, 뉴질랜드, 아일랜드, 남아공 국적자만 가능합니다.",
      visa_type: "E2"
    };
  }

  if (teacher.degree < 'BACHELOR') {
    return {
      eligible: false,
      reason: "E2 비자는 학사 학위 이상 필수입니다.",
      visa_type: "E2"
    };
  }

  if (!teacher.criminalRecordClean) {
    return {
      eligible: false,
      reason: "범죄 기록이 있으면 E2 비자를 받을 수 없습니다.",
      visa_type: "E2"
    };
  }

  return {
    eligible: true,
    reason: `${teacher.passportCountry} 국적으로 E2 비자 적격입니다.`,
    visa_type: "E2"
  };
}
```

**중국 Z 비자 (원어민 + 경력):**
```javascript
function checkChinaZVisaEligibility(teacher) {
  const NATIVE_COUNTRIES = ['USA', 'UK', 'CANADA', 'AUSTRALIA', 'NEW_ZEALAND', 'IRELAND', 'SOUTH_AFRICA'];

  if (!NATIVE_COUNTRIES.includes(teacher.passportCountry)) {
    return {
      eligible: false,
      reason: "중국은 원어민 국적 필수입니다.",
      visa_type: "Z"
    };
  }

  if (teacher.yearsExperience < 2) {
    return {
      eligible: false,
      reason: "중국 Z 비자는 최소 2년 교육 경력 필수입니다.",
      visa_type: "Z"
    };
  }

  if (teacher.degree < 'BACHELOR') {
    return {
      eligible: false,
      reason: "학사 학위 이상 필수입니다.",
      visa_type: "Z"
    };
  }

  if (teacher.age >= 60) {
    return {
      eligible: false,
      reason: "중국은 60세 미만만 취업 비자 발급이 가능합니다.",
      visa_type: "Z"
    };
  }

  return {
    eligible: true,
    reason: `${teacher.yearsExperience}년 경력으로 Z 비자 적격입니다.`,
    visa_type: "Z"
  };
}
```

**UX: 지원 차단 + 대안 제시**
- ❌ **차단 모달 (비적격 시):**
  > "죄송합니다. 이 공고는 **E2 비자 국가 국적**이 필수입니다.
  >
  > 현재 국적: 필리핀 🇵🇭
  >
  > 필수 국적: 🇺🇸 🇬🇧 🇨🇦 🇦🇺 🇳🇿 🇮🇪 🇿🇦
  >
  > 💡 **대안**: 비자 제한이 없는 공고 12건 보기 →"

- ✅ **경고 모달 (부분 적격 시):**
  > "⚠️ 주의: 이 공고는 **British accent 선호**로 표시되어 있습니다.
  >
  > 당신의 억양: North American
  >
  > 그래도 지원하시겠습니까? [예] [다른 공고 찾기]"

**Output:**
- 법적 리스크 제로 (비자 불가능 지원 원천 차단)
- 사용자 경험 개선 (시간 낭비 방지)
- 데이터: 비자 제한으로 인한 기회 손실 추적

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

### 시나리오 1: 영어 원어민 교사의 프로필 등록 및 자동 매칭
**사용자:** Sarah (미국 시민, TEFL 자격증 보유, ESL 교사 경력 5년)
**목표:** 한국 국제학교 ESL 교사 취업
**단계:**
1. 구글 계정으로 로그인
2. 프로필 작성 (5분)
   - **국적/여권**: 미국 (USA) ✅ E2 비자 적격
   - **ESL 자격증**: TEFL (120시간)
   - **전문 분야**: ESL, IELTS Prep, Young Learners
   - **희망 국가**: 한국, 베트남, 태국
   - **희망 급여**: $2,200/월 (주거 포함)
3. 비디오 이력서 업로드 (자기소개 + 모의 수업 3분)
4. **AI 분석 결과 자동 확인** (30초 이내)
   - "✅ **억양**: North American (미국식)"
   - "✅ **원어민 신뢰도**: 98% (매우 높음)"
   - "✅ **발음 명확도**: 9/10"
   - "✅ **문법 정확도**: 10/10"
   - "✅ **에너지 레벨**: High (학생 참여 우수)"
   - "⚠️ **조명**: 약간 어두움 (개선 권장)"
5. 프로필 완성도: 85% → 상위 노출 확정
6. **1시간 후, 자동 매칭 이메일 수신** (AI Headhunter)
   - "Sarah님, **서울 강남구** 국제학교에서 **ESL Teacher** 공고가 등록되었습니다!"
   - "매칭 점수: **95%**"
   - "이유: 미국 시민(E2 적격) + 북미 억양 선호 + IELTS 경험 일치"
   - "급여: $2,300/월 + 주거 제공 (당신의 희망보다 $100 높음!)"
7. 원클릭 지원 → AI가 **맞춤형 커버레터 자동 생성**
8. 리크루터가 24시간 내 연락 (비디오 이미 확인 완료)

**결과:** 3일 이내 화상 인터뷰 확정, 1주일 내 오퍼

### 시나리오 2: 리크루터의 공고 등록 및 ATS 활용
**사용자:** 경쟁사 리크루터 (Teach Away 소속)
**목표:** 플랫폼에서 무료 ATS 사용하여 중국 학교에 ESL 교사 배치
**단계:**
1. 회원가입 (리크루터 role)
2. **ESL 교사 공고 등록**
   - 학교명: 익명 처리 ✅
   - 위치: 상하이
   - 포지션: **ESL Teacher (Young Learners)**
   - **원어민 요구사항**:
     - 필수 국적: USA, UK, Canada, Australia
     - 선호 억양: British (영국식 선호) 🇬🇧
   - **필수 자격증**: TEFL 또는 CELTA
   - 급여: 25,000 CNY → 자동 USD 환산 ($3,500)
   - 비자: Z Visa 스폰서 제공
3. **10분 후, AI 매칭된 지원자 7명 자동 유입**
   - 5명: 영국 국적 (British accent) ✅
   - 2명: 캐나다 국적 (North American accent)
4. ATS Dashboard에서 확인
   - **억양 필터**: "British" 선택 → 5명만 표시
   - AI 매칭 점수순 정렬 (98%, 95%, 92%...)
   - **비디오 이력서 즉시 재생** (3분 영상)
   - 드래그 앤 드롭으로 상태 변경 (Screening → Interview)
5. 상위 3명 선택 → "Reveal Contact" 버튼
   - 크레딧 3개 차감 (또는 무료 체험)
   - 전화번호, 이메일 즉시 노출
6. **강앤크릴에 데이터 축적** ✅
   - 상하이 평균 급여 업데이트
   - British accent 수요 증가 감지
   - 경쟁사 공고 패턴 분석

**결과:** 리크루터 만족도 극대화 + 강앤크릴 시장 데이터 확보

### 시나리오 3: 검색 엔진 유입 (SEO - Native English Teacher Focus)
**사용자:** Google 검색자 (영국인, CELTA 자격증 소지)
**검색어:** "native English teacher jobs korea E2 visa"
**단계:**
1. Google 검색 결과 **1위**에 우리 페이지 노출
   - URL: `/jobs/south-korea/seoul/esl`
   - Meta Title: "**Native English Teacher Jobs in Seoul, Korea** - E2 Visa Sponsored | $2,200/mo avg"
   - Meta Description: "Find 63 ESL jobs for native English speakers in Seoul. E2 visa sponsorship, housing provided. **British & American accent welcome**."
2. 페이지 방문 → Structured Data로 Rich Snippet 표시
   - "💼 **63 ESL jobs** | 💰 $2,200 avg | 🏠 Housing included | 🇰🇷 E2 Visa"
3. 필터 적용 (페이지 내)
   - ✅ "Native speaker required" (기본 선택됨)
   - ✅ "British accent preferred" 선택
   - ✅ "CELTA/TEFL required"
   → 결과: 12개 공고
4. 하단 **Internal Links Mesh** 클릭
   - "ESL jobs in Busan" (같은 국가, 다른 도시)
   - "IELTS Instructor jobs in Seoul" (같은 도시, 다른 과목)
   - "Native English teacher salary in Korea" (정보 페이지)
5. 회원가입 후 이력서 등록

**결과:**
- SEO 트래픽 → 고품질 회원 확보
- 검색어 데이터 수집 ("British accent" 수요 높음)
- Google이 더 많은 키워드에서 우리를 상위 노출

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
