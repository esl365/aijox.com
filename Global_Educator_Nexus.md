# 🌍 Project: Global Educator Nexus (Detailed Spec)





## 1. System Architecture & Tech Stack Strategy



단순한 웹사이트가 아닌, **"Data-Driven AI Platform"**을 위한 인프라입니다.



### 1.1. Core Stack ( 확정 )



- **Framework:** **Next.js 15 (App Router)**
  - *Why:* React Server Components(RSC)를 활용하여 DB에 직접 접근, API 레이어 제거로 개발 속도 2배 향상.
- **Database:** **Neon (Serverless PostgreSQL)**
  - *Extension:* **`pgvector`** 필수 설치. (강사와 공고의 텍스트를 벡터화하여 AI 매칭에 사용).
- **ORM:** **Prisma**
  - *Strategy:* 복잡한 다대다 관계(User-Job-Application) 및 JSON 타입(AI 분석 결과 저장) 처리에 최적화.
- **AI Engine:** **Vercel AI SDK (Core + RAG)**
  - *Models:*
    - **Analysis:** `GPT-4o` (Video/Image Multi-modal 분석).
    - **Interaction:** `Claude 3.5 Sonnet` (이메일 작성, 커버레터 생성 등 자연어 처리).
    - **Embedding:** `text-embedding-3-small` (벡터 검색용).
- **Storage:** **Cloudflare R2** + **UploadThing**
  - *Why:* S3 호환 API이면서 Egress 비용 $0. 대용량 동영상 이력서 처리에 필수.
- **Auth:** **Auth.js v5 (Beta)**
  - *Strategy:* Session Strategy를 'Database'로 설정하여, 로그인 세션조차 강앤크릴의 자산으로 관리.

------



## 2. Database Schema Deep Dive (데이터 구조 상세)



단순 저장이 아닌 **AI 활용**과 **경쟁사 데이터 흡수**를 위한 필드 설계입니다.



### 2.1. User & Profile (The Asset)



- **`User`**: `role` 필드(`ADMIN`, `TEACHER`, `SCHOOL`, `RECRUITER`)로 권한을 철저히 분리.
- **`TeacherProfile`**:
  - `embedding`: `Unsupported("vector(1536)")` - 강사의 스펙을 벡터로 변환해 저장 (AI 매칭용).
  - `visaStatus`: JSON 필드. `{ "china": "impossible", "vietnam": "possible" }` 형태로 규칙 기반 판별 결과 캐싱.
  - `videoAnalysis`: JSON 필드. AI가 분석한 `{ "accent": "North American", "energy": 85, "professionalism": 90 }` 데이터 저장.



### 2.2. Job Posting (The Bait)



- **`JobPosting`**:
  - `isAnonymous`: `Boolean`. 경쟁 리크루터가 학교명을 숨길 수 있게 함.
  - `hiddenOrgName`: `String`. (Admin Only) 익명 공고일 때 실제 학교 이름 저장. **(영업용 핵심 데이터)**
  - `salaryUSD`: `Int`. 모든 통화(KRW, CNY 등)를 USD로 자동 환산하여 저장 (글로벌 검색 정렬용).



### 2.3. Application (The Funnel)



- **`Application`**:
  - `funnelStatus`: `Enum` (`NEW`, `SCREENING`, `INTERVIEW`, `OFFER`, `HIRED`, `REJECTED`).
  - `aiMatchScore`: `Int`. 지원 시점의 AI 매칭 점수 (0~100).
  - `rejectReason`: `String`. 학교가 거절 버튼 누를 때 선택한 사유 (예: "Visa Issue"). **(시장 분석 데이터)**

------



## 3. AI Agents Implementation (AI 에이전트 상세 로직)





### 🤖 Agent 1: "The AI Screener" (비디오 분석관)



**목표:** 비정형 데이터(영상)를 정형 데이터(점수)로 변환.

1. **Trigger:** 강사가 R2에 영상 업로드 완료 (`onUploadComplete`).
2. **Process:**
   - 서버 액션이 영상 URL을 `GPT-4o`에게 전송.
   - **System Prompt:** *"당신은 국제학교 전문 리크루터입니다. 영상을 보고 다음 JSON 포맷으로 출력하세요: { 'accent_type': 'string', 'clarity_score': 1-10, 'energy_level': 'High/Mid/Low', 'appearance_check': 'Pass/Fail', 'summary': 'string' }"*
3. **Output:** 결과를 `TeacherProfile.videoAnalysis`에 저장하고, 강사에게 즉시 피드백 노출. (*"조명이 너무 어둡습니다."*)



### 🕵️ Agent 2: "The Autonomous Headhunter" (자동 매칭 시스템)



**목표:** 공고 발생 시 능동적으로 지원자 연결.

1. **Trigger:** 신규 `JobPosting` 생성 (`onCreate`).
2. **Process (RAG):**
   - 공고 내용(JD)을 `text-embedding-3-small`로 벡터화.
   - Postgres(`pgvector`)에서 코사인 유사도(Cosine Similarity) 0.85 이상인 강사 추출.
   - `visaStatus` 필터를 거쳐 '비자 발급 불가능자' 제외.
3. **Action:**
   - 선별된 강사에게 `Resend`를 통해 이메일 발송.
   - **Content:** AI가 공고의 장점(급여, 위치)과 강사의 니즈를 매핑하여 작성. *"Sarah, 이 학교는 당신이 원하던 '제주도'에 있으며 급여가 $300 높습니다."*



### ⚡ Agent 3: "The Rule-based Visa Guard" (비자 판별기)



**목표:** 법적 리스크 없이 지원 자격 필터링.

1. **Logic:** 국가별 하드코딩된 규칙 엔진(Rule Engine) 실행.
   - *China:* `degree >= BA` AND `experience >= 2 years` AND `criminal_record == clean` AND `age < 60`.
   - *Korea (E2):* `citizenship IN [US, UK, CA, AU, NZ, IE, SA]` AND `degree >= BA`.
2. **UX:** 지원 버튼 클릭 시 위 조건 불충족하면 **[Blocking Modal]** 띄움. *"이 공고는 비자 문제로 지원이 불가능합니다."*

------



## 4. Search Dominance Strategy (트래픽 장악 상세)





### 4.1. Programmatic SEO (URL & Routing)



Next.js의 Dynamic Routes를 활용해 수만 개의 페이지를 만듭니다.

- **Directory Structure:** `app/jobs/[country]/[city]/[subject]/page.tsx`
- **Internal Linking Strategy (Mesh):**
  - 모든 페이지 하단에 **"Nearby Jobs"** (같은 국가 다른 도시)와 **"Related Subjects"** (같은 도시 다른 과목) 링크를 20개씩 자동 생성.
  - 크롤러(Google Bot)가 이 링크를 타고 사이트 전체를 샅샅이 긁어가게 유도.



### 4.2. GEO Data Feeds (AI 학습용 데이터)



- **Endpoint:** `/api/geo/salary-index.json`

- **Format:** LLM이 이해하기 쉬운 Clean JSON 형태.

  JSON

  ```
  {
    "country": "South Korea",
    "avg_salary_usd": 2100,
    "housing_provided": true,
    "top_hiring_cities": ["Seoul", "Busan"]
  }
  ```

- **Strategy:** 이 데이터를 `robots.txt`에서 허용하고, 페이지 내 `<table>` 태그로도 렌더링하여 Perplexity 등의 인용 유도.



### 4.3. AEO (Structured Data)



- **Component:** `<JobSchema />` (Client Component가 아닌 Server Component로 구현).
- **Content:** `FAQPage`, `JobPosting`, `BreadcrumbList` 스키마를 하나의 페이지에 모두 주입(Multi-schema injection)하여 점유율 극대화.

------



## 5. The "Trojan Horse" UX (리크루터 락인 전략)





### 5.1. The Dashboard (무료 ATS)



타 리크루터와 학교 담당자가 보게 될 화면입니다.

- **UI Library:** `shadcn/ui`의 `Card`, `Dialog`, `Table` 컴포넌트 활용.
- **Kanban Board:** `dnd-kit` 라이브러리를 사용하여 부드러운 드래그 앤 드롭 구현.
  - [New] -> [Screening] -> [Interview] -> [Offer]
- **The "Reveal" Button (Monetization):**
  - 기본적으로 강사의 연락처는 `***-****-****`로 마스킹 처리.
  - "Reveal Contact Info" 버튼 클릭 시 크레딧 차감 또는 기록 남김 (강앤크릴 영업 데이터 확보).



### 5.2. The Candidate Experience



- **Profile Completion Meter:** "프로필 80% 완성 시 상위 노출" 게이미피케이션 요소 도입.
- **Mobile First:** 모든 입력 폼은 모바일(아이폰/갤럭시)에서 한 손으로 입력 가능하도록 최적화.

------



## 6. Development Roadmap (주차별 실행 계획)





### 📅 Week 1-2: Foundation & Data Structure



- Next.js 15 + Neon DB + Prisma 초기 세팅.
- `User`, `TeacherProfile` (Vector 포함), `JobPosting` 스키마 마이그레이션.
- Auth.js 연동 (Google/LinkedIn/Email).



### 📅 Week 3-4: Candidate Side & AI Screener



- 강사 프로필 입력 폼 개발 (React Hook Form + Zod).
- Video Upload (UploadThing) 및 `GPT-4o` 연동 분석 로직 구현.
- **The Rule-based Visa Guard** 로직 하드코딩 구현.



### 📅 Week 5-6: Client Side & ATS



- 채용 공고 등록/수정 페이지 (익명 옵션 포함).
- 리크루터 대시보드 (Kanban Board) 구현.
- 지원자 목록 조회 및 필터링(AI Score 기반 정렬) 기능.



### 📅 Week 7-8: SEO Engine & Automation



- pSEO용 라우팅(`[country]/[city]`) 및 메타데이터 생성기 구현.
- `Resend` 이메일 템플릿 디자인 및 발송 트리거 연동.
- `Autonomous Headhunter` (백그라운드 매칭 잡) 구현.



### 📅 Week 9+: Launch & Seeding



- 강앤크릴 보유 공고 500개+ 등록 (Cold Start 해결).
- Google Search Console 제출 및 인덱싱 확인.
- 초기 베타 유저(협력 학교) 초대 및 피드백.

------



## 7. Immediate Action Items (당장 해야 할 일)



이 방대한 계획을 시작하기 위해, 가장 먼저 **데이터베이스(Brain)**를 만들어야 합니다.

아래의 `prisma.schema` 코드는 **AI 벡터 검색**과 **상세 분석 데이터**까지 모두 포함한 **최종본**입니다. 이것을 프로젝트에 적용하는 것이 첫걸음입니다.

Code snippet

```
// 최종 schema.prisma snippet (일부분)

model TeacherProfile {
  id            String   @id @default(cuid())
  // ...기본 정보 생략
  
  // AI Analysis Data (JSONB for flexibility)
  videoAnalysis Json?    // { accent, energy, score, summary }
  visaStatus    Json?    // { kr: true, cn: false, reason: "..." }
  
  // Vector Embedding (Unsupported type handled by raw SQL)
  embedding     Unsupported("vector(1536)")? 

  // Preferences
  minSalaryUSD  Int?     // 글로벌 통일 기준
}

model Application {
  id            String    @id @default(cuid())
  status        AppStatus @default(NEW) // ATS Status
  
  aiMatchScore  Int?      // 0-100
  
  // Analytics
  viewedAt      DateTime? // 리크루터가 언제 봤는지
  rejectedAt    DateTime?
  rejectReason  String?   // 거절 사유 수집
}
```

