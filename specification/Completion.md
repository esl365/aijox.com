# Completion - 완성 및 배포

## 테스트 계획

### 단위 테스트 (Unit Tests)

**테스트 프레임워크**: Jest + React Testing Library (설치 필요)

#### AI Agents Tests
- [ ] **lib/ai/video-analyzer.ts**
  - [ ] `analyzeVideo()`: 올바른 JSON 스키마 반환
  - [ ] Error handling: Rate limit, Invalid video, Timeout
  - [ ] `generateUserFeedback()`: 점수별 다른 메시지 반환
  - [ ] `calculateProfileCompleteness()`: 0-100 범위 검증
  - [ ] `analyzeVideoWithRetry()`: Exponential backoff 동작

- [ ] **lib/ai/embeddings.ts**
  - [ ] `generateJobEmbedding()`: 1536 길이 벡터 반환
  - [ ] `generateTeacherEmbedding()`: 올바른 텍스트 포맷
  - [ ] `generateJobEmbeddingsBatch()`: 배치 처리 성공
  - [ ] `cosineSimilarity()`: 수학적 정확성 검증

- [ ] **lib/visa/checker.ts**
  - [ ] `checkVisaEligibility()`: 한국 E-2 규칙 정확성
  - [ ] `checkVisaEligibility()`: 중국 Z 비자 규칙 정확성
  - [ ] `evaluateCondition()`: 모든 operator 동작 (eq, in, gte 등)
  - [ ] `getEligibleCountries()`: 필터링 정확성
  - [ ] `getEligibilityRecommendations()`: 적절한 권장사항 생성

**커버리지 목표**: 80% 이상

---

### 통합 테스트 (Integration Tests)

#### Database Integration
- [ ] **Prisma + pgvector**
  - [ ] pgvector extension 설치 확인
  - [ ] Vector 저장 및 조회
  - [ ] Cosine similarity 검색 (distance < 0.15)
  - [ ] Index 성능 (1000 rows에서 < 100ms)

- [ ] **Server Actions**
  - [ ] `createTeacherProfile()`: DB 저장 성공
  - [ ] `updateTeacherProfile()`: Profile completeness 자동 계산
  - [ ] `createJobPosting()`: Embedding 자동 생성
  - [ ] `findMatchingTeachers()`: AI 매칭 동작

#### External API Integration
- [ ] **OpenAI API**
  - [ ] GPT-4o video analysis (테스트 비디오 사용)
  - [ ] text-embedding-3-small (샘플 텍스트)
  - [ ] Rate limiting 처리 (429 error)
  - [ ] API key 유효성 확인

- [ ] **Auth.js**
  - [ ] Google OAuth 로그인 플로우
  - [ ] Session 생성 및 검증
  - [ ] Role-based access control (TEACHER, RECRUITER)

- [ ] **UploadThing**
  - [ ] 비디오 파일 업로드 (< 100MB)
  - [ ] `onUploadComplete` webhook 트리거
  - [ ] Cloudflare R2 저장 확인

---

### 시스템 테스트 (System Tests)

#### Full User Journeys

##### Teacher Journey
1. [ ] **회원가입 및 프로필 생성**
   - [ ] Google OAuth로 로그인
   - [ ] 역할 선택: Teacher
   - [ ] 기본 정보 입력 (이름, 국적, 학위)
   - [ ] Profile completeness 30% 표시

2. [ ] **비디오 이력서 업로드**
   - [ ] 비디오 파일 선택 (mp4, < 100MB)
   - [ ] 업로드 진행률 표시
   - [ ] AI 분석 완료 후 피드백 표시
   - [ ] Profile completeness 80% 표시

3. [ ] **공고 검색 및 지원**
   - [ ] 국가/과목별 필터링
   - [ ] AI 추천 공고 (similarity > 0.85) 표시
   - [ ] 비자 적격성 체크
     - [ ] 부적격 시 blocking modal 표시
     - [ ] 적격 시 지원 버튼 활성화
   - [ ] 지원 완료 (Application 생성)

##### Recruiter Journey
1. [ ] **공고 등록**
   - [ ] 공고 정보 입력 (제목, 위치, 급여, 요구사항)
   - [ ] Native speaker 요구사항 설정
   - [ ] 공고 게시 (Embedding 자동 생성)

2. [ ] **매칭된 강사 확인**
   - [ ] AI 추천 강사 목록 (aiMatchScore 내림차순)
   - [ ] 비디오 이력서 재생
   - [ ] Video analysis 결과 확인

3. [ ] **ATS Kanban 관리**
   - [ ] 지원자 카드 드래그 앤 드롭
   - [ ] 상태 변경: NEW → SCREENING → INTERVIEW → OFFER → HIRED
   - [ ] 거절 시 사유 선택 (Analytics 데이터)

---

### 성능 테스트 (Performance Tests)

#### Load Testing (k6 또는 Artillery 사용)

- [ ] **동시 사용자**: 100명
  - [ ] 홈페이지 로드: < 2초
  - [ ] 공고 목록 조회: < 1초
  - [ ] 프로필 페이지: < 1.5초

- [ ] **AI Agents 부하 테스트**
  - [ ] Video analysis 10개 동시 요청: 각 < 30초
  - [ ] Embedding generation 100개 배치: < 2분
  - [ ] Vector search (10,000 profiles): < 500ms

- [ ] **Database 쿼리 성능**
  - [ ] `findMatchingTeachers()`: < 300ms (pgvector index 사용)
  - [ ] N+1 query 문제 없음 (Prisma include 사용)

#### Stress Testing
- [ ] **동시 접속**: 500명
  - [ ] Error rate < 1%
  - [ ] Response time p95 < 3초

---

### 사용자 수용 테스트 (UAT)

**일정**: 배포 전 1주일
**참여자**: 강앤크릴 팀원 5명 + 베타 테스터 10명

**테스트 시나리오**:
1. [ ] Teacher 3명: 프로필 생성 → 비디오 업로드 → 공고 지원
2. [ ] Recruiter 2명: 공고 등록 → 매칭 확인 → 지원자 관리
3. [ ] 피드백 수집:
   - [ ] UI/UX 개선점
   - [ ] 버그 리포트
   - [ ] 기능 요청

**결과 기준**:
- [ ] Critical bug 0개
- [ ] 평균 만족도 4/5 이상

---

## 문서화

### 사용자 문서

#### Teacher 가이드
- [ ] **프로필 설정 가이드**
  - [ ] 어떤 정보를 입력해야 하는가
  - [ ] 프로필 완성도를 높이는 방법
  - [ ] 비디오 이력서 촬영 팁

- [ ] **비디오 이력서 촬영 가이드**
  - [ ] 조명, 배경, 복장 권장사항
  - [ ] 말하기 속도 및 발음 팁
  - [ ] 3분 안에 어필할 내용

- [ ] **비자 가이드**
  - [ ] 국가별 비자 요구사항 설명
  - [ ] 필요 서류 목록 (E-2, Z 비자)
  - [ ] 비자 신청 프로세스 타임라인

#### Recruiter 가이드
- [ ] **공고 작성 가이드**
  - [ ] 효과적인 JD 작성법
  - [ ] Native speaker 요구사항 설정
  - [ ] AI 매칭 최적화 팁

- [ ] **ATS 사용 가이드**
  - [ ] Kanban board 사용법
  - [ ] 지원자 필터링 기능
  - [ ] 비디오 평가 기준

#### FAQ
- [ ] 비디오 업로드가 실패하는 이유는?
- [ ] AI 매칭 점수는 어떻게 계산되나요?
- [ ] 비자 적격성 판단이 틀린 경우 어떻게 하나요?
- [ ] 프로필 정보를 수정하면 매칭 점수가 바뀌나요?

---

### 기술 문서

#### API 문서
- [ ] **Server Actions API Reference**
  ```typescript
  // createTeacherProfile(data: TeacherProfileInput)
  // → Returns: { success: boolean, profileId: string }

  // updateTeacherProfile(id: string, data: Partial<TeacherProfileInput>)
  // → Returns: { success: boolean, completeness: number }

  // findMatchingJobs(teacherId: string, limit?: number)
  // → Returns: JobPosting[] with similarity scores
  ```

- [ ] **AI Agents API Reference**
  ```typescript
  // analyzeVideo(videoUrl: string)
  // → Returns: VideoAnalysis (Zod schema)

  // generateJobEmbedding(job: JobData)
  // → Returns: number[] (1536 dimensions)

  // checkVisaEligibility(teacher: TeacherProfile, country: string)
  // → Returns: VisaCheckResult
  ```

#### 아키텍처 문서
- [x] `Architecture.md` 작성 완료
- [x] `Pseudocode.md` 작성 완료
- [ ] Database ER Diagram 생성
- [ ] System Flow Diagram 생성

#### 배포 가이드
- [ ] **Vercel 배포**
  - [ ] Environment variables 설정
  - [ ] Build settings (Next.js 15)
  - [ ] pgvector extension 확인 (Neon Console)

- [ ] **Prisma Migration**
  ```bash
  # 1. Generate Prisma Client
  npx prisma generate

  # 2. Run migrations
  npx prisma migrate deploy

  # 3. Seed database (optional)
  npx prisma db seed
  ```

- [ ] **Post-Deployment Checklist**
  - [ ] Health check endpoint (`/api/health`)
  - [ ] Database connection pooling 확인
  - [ ] AI API keys 동작 확인
  - [ ] UploadThing webhook URL 설정

#### 유지보수 가이드
- [ ] **정기 작업**
  - [ ] Vector index rebuild: 월 1회
  - [ ] Visa rules 업데이트: 분기 1회
  - [ ] Dependency 업데이트: 월 1회

- [ ] **모니터링**
  - [ ] Error tracking (Sentry)
  - [ ] Performance monitoring (Vercel Analytics)
  - [ ] Database metrics (Neon Dashboard)

---

### 개발자 문서

#### 설정 가이드
```bash
# 1. Clone repository
git clone https://github.com/esl365/aijox.com.git
cd aijox.com

# 2. Install dependencies
npm install

# 3. Setup environment variables
cp .env.example .env.local
# 필수: DATABASE_URL, OPENAI_API_KEY, NEXTAUTH_SECRET 등

# 4. Setup database
npx prisma generate
npx prisma migrate dev
npx prisma db seed

# 5. Run development server
npm run dev
```

#### 기여 가이드
- [ ] **Branching Strategy**
  - `main`: Production branch
  - `dev`: Development branch
  - `feature/*`: Feature branches
  - `fix/*`: Bug fix branches

- [ ] **Commit Convention**
  ```
  feat: Add video upload functionality
  fix: Resolve SQL injection vulnerability in vector search
  docs: Update API reference
  refactor: Extract rate limiter to separate module
  test: Add unit tests for visa checker
  ```

- [ ] **Pull Request Template**
  ```markdown
  ## Description
  Brief description of changes

  ## Type of Change
  - [ ] Bug fix
  - [ ] New feature
  - [ ] Breaking change
  - [ ] Documentation update

  ## Testing
  - [ ] Unit tests added/updated
  - [ ] Integration tests pass
  - [ ] Manual testing completed

  ## Checklist
  - [ ] Code follows style guidelines
  - [ ] Self-review completed
  - [ ] Documentation updated
  ```

#### 코드 스타일 가이드
- [ ] **TypeScript**
  - Strict mode enabled
  - No `any` types (use `unknown` if necessary)
  - Explicit return types for functions

- [ ] **React/Next.js**
  - Prefer Server Components over Client Components
  - Use Server Actions instead of API Routes
  - Avoid useState when Server Components can do the job

- [ ] **Naming Conventions**
  ```typescript
  // Files: kebab-case
  video-analyzer.ts
  kanban-board.tsx

  // Functions: camelCase
  function analyzeVideo() {}

  // Components: PascalCase
  function VideoUpload() {}

  // Constants: UPPER_SNAKE_CASE
  const MAX_FILE_SIZE = 100_000_000
  ```

---

## 배포 계획

### 환경 설정

#### 개발 환경 (Development)
- **URL**: http://localhost:3000
- **목적**: 로컬 개발 및 테스트
- **DB**: Neon Dev branch
- **Storage**: Cloudflare R2 Dev bucket
- **상태**: ✅ 설정 완료

#### 스테이징 환경 (Staging)
- **URL**: https://aijox-staging.vercel.app (예정)
- **목적**: 프로덕션 배포 전 최종 검증
- **DB**: Neon Staging branch
- **Storage**: Cloudflare R2 Staging bucket
- **상태**: ⏳ 설정 필요

**설정 단계**:
1. [ ] Vercel에 Staging environment 생성
2. [ ] Neon에 Staging branch 생성
3. [ ] 환경변수 복사 (API keys는 개발용 사용)
4. [ ] Git branch `staging`에서 자동 배포 설정

#### 프로덕션 환경 (Production)
- **URL**: https://aijox.com (예정)
- **목적**: 실제 서비스
- **DB**: Neon Main branch
- **Storage**: Cloudflare R2 Production bucket
- **상태**: ⏳ 배포 대기

---

### 배포 체크리스트

#### Pre-Deployment
- [ ] **코드 품질**
  - [ ] All tests passing (npm test)
  - [ ] ESLint 경고 0개 (npm run lint)
  - [ ] TypeScript errors 0개 (npm run build)
  - [ ] No console.log in production code

- [ ] **환경 변수 확인**
  - [ ] OPENAI_API_KEY (프로덕션 키)
  - [ ] ANTHROPIC_API_KEY (프로덕션 키)
  - [ ] DATABASE_URL (Neon 프로덕션)
  - [ ] NEXTAUTH_SECRET (32+ characters)
  - [ ] NEXTAUTH_URL (https://aijox.com)
  - [ ] R2 credentials (프로덕션)
  - [ ] RESEND_API_KEY (프로덕션)
  - [ ] UPLOADTHING_SECRET (프로덕션)

- [ ] **데이터베이스**
  - [ ] Prisma migrations applied
  - [ ] pgvector extension installed
  - [ ] Vector indexes created
  - [ ] Connection pooling enabled
  - [ ] Seed data loaded (optional)

- [ ] **Third-party Services**
  - [ ] Cloudflare R2 bucket created
  - [ ] R2 CORS policy configured
  - [ ] UploadThing webhook URL set
  - [ ] Resend domain verified
  - [ ] Auth.js OAuth apps configured (Google, LinkedIn)

- [ ] **보안**
  - [ ] HTTPS enabled (Vercel 자동)
  - [ ] CORS policy reviewed
  - [ ] Rate limiting enabled
  - [ ] Input validation (Zod schemas)
  - [ ] SQL injection prevention

- [ ] **성능**
  - [ ] Image optimization (Sharp)
  - [ ] Code splitting (dynamic imports)
  - [ ] React Server Components 최대 활용
  - [ ] Database query optimization

#### Deployment Steps

```bash
# 1. Final commit
git add .
git commit -m "chore: Prepare for production deployment"
git push origin main

# 2. Vercel deployment (automatic via Git)
# Check Vercel Dashboard for deployment status

# 3. Database migration
npx prisma migrate deploy

# 4. Verify deployment
curl https://aijox.com/api/health
# Expected: { "status": "ok", "database": "connected" }

# 5. Smoke tests
# - Homepage loads
# - Login works
# - Teacher profile creation
# - Video upload
# - Job posting creation
```

#### Post-Deployment Verification
- [ ] **기능 검증**
  - [ ] 홈페이지 로드 (< 2초)
  - [ ] Google OAuth 로그인
  - [ ] Teacher 프로필 생성
  - [ ] 비디오 업로드 및 AI 분석
  - [ ] Job posting 생성 및 매칭
  - [ ] Visa eligibility check

- [ ] **성능 확인**
  - [ ] Vercel Analytics: Core Web Vitals
  - [ ] Neon Dashboard: Query performance
  - [ ] Cloudflare R2: Egress traffic

- [ ] **모니터링 설정**
  - [ ] Sentry error tracking 활성화
  - [ ] Vercel Analytics 대시보드 확인
  - [ ] Uptime monitoring (UptimeRobot 또는 Pingdom)

- [ ] **백업 설정**
  - [ ] Neon 자동 백업 활성화 (7일 보관)
  - [ ] Cloudflare R2 versioning 활성화

---

### 롤백 계획

**트리거 조건**:
- Critical bug 발견 (치명적 기능 장애)
- Error rate > 5%
- API response time > 5초
- Database connection failures

**롤백 절차**:
```bash
# 1. Vercel Dashboard에서 이전 배포로 롤백
# Deployments → [Previous Deployment] → Promote to Production

# 2. 데이터베이스 마이그레이션 롤백 (필요 시)
npx prisma migrate resolve --rolled-back <migration_name>

# 3. 긴급 패치 준비
git revert <problematic_commit>
git push origin main

# 4. 상황 분석 및 수정
# - Error logs 분석 (Sentry)
# - Database 상태 확인
# - 재배포 준비
```

**롤백 후 조치**:
1. Incident report 작성
2. Root cause analysis
3. 테스트 케이스 추가
4. 재발 방지 대책 수립

---

## 배포 후 모니터링

### 모니터링 항목

#### 시스템 메트릭
- [ ] **Vercel Functions**
  - [ ] Execution count
  - [ ] Error rate (목표: < 1%)
  - [ ] Duration p95 (목표: < 3초)
  - [ ] Cold start frequency

- [ ] **Database (Neon)**
  - [ ] Active connections
  - [ ] Query latency p95 (목표: < 100ms)
  - [ ] Storage usage
  - [ ] CPU usage (Compute Units)

- [ ] **Cloudflare R2**
  - [ ] Upload success rate (목표: > 99%)
  - [ ] Bandwidth usage
  - [ ] Request count

#### 애플리케이션 메트릭
- [ ] **AI Agents**
  - [ ] Video analysis success rate
  - [ ] Embedding generation failures
  - [ ] Visa check errors
  - [ ] OpenAI API latency

- [ ] **User Activity**
  - [ ] Daily Active Users (DAU)
  - [ ] New signups (Teacher vs Recruiter)
  - [ ] Video upload count
  - [ ] Job applications count
  - [ ] Conversion rate (Signup → Profile → Video → Application)

#### 비즈니스 메트릭
- [ ] **Recruiter Analytics**
  - [ ] Job postings per week
  - [ ] Average time-to-hire
  - [ ] Top rejection reasons
  - [ ] Visa-related rejections (%)

- [ ] **Teacher Analytics**
  - [ ] Profile completeness distribution
  - [ ] AI match score distribution
  - [ ] Countries with highest demand
  - [ ] Native speaker ratio

---

### 알림 설정

#### Critical Alerts (즉시 대응)
- Error rate > 5% (5분 평균)
- API response time > 10초 (1분 평균)
- Database connection failures
- OpenAI API quota exceeded

#### Warning Alerts (1시간 내 대응)
- Error rate > 2%
- API response time > 5초
- Disk usage > 80%
- Unusual traffic spike (> 200% baseline)

#### Info Alerts (일일 요약)
- 신규 가입자 수
- 비디오 업로드 수
- AI 분석 완료 건수
- 공고 등록 수

**알림 채널**:
- Slack: #aijox-alerts
- Email: dev@aijox.com
- SMS: Critical alerts only (on-call engineer)

---

### 대시보드

#### 운영 대시보드 (Vercel Analytics)
- **URL**: https://vercel.com/esl365/aijox/analytics
- **접근 권한**: Dev team
- **주요 메트릭**:
  - Real User Monitoring (RUM)
  - Core Web Vitals (LCP, FID, CLS)
  - Page views & Unique visitors
  - Top pages by traffic

#### 비즈니스 대시보드 (Custom)
- **URL**: https://aijox.com/admin/analytics (개발 예정)
- **접근 권한**: Admin, Management
- **주요 메트릭**:
  - Funnel analysis (Signup → Hired)
  - Recruiter engagement
  - Teacher profile quality scores
  - AI matching effectiveness

---

## 배포 후 검증

### Smoke Tests (배포 직후)

```bash
# 1. Health check
curl https://aijox.com/api/health
# → { "status": "ok" }

# 2. Database connectivity
curl https://aijox.com/api/health/db
# → { "status": "connected", "latency": 45 }

# 3. Auth.js session
# Manual: Login with Google → Check /profile redirects

# 4. Video upload
# Manual: Upload test video → Check AI analysis completes

# 5. AI Agents
# Manual:
# - Create teacher profile → Check embedding generated
# - Create job posting → Check embedding generated
# - Check visa eligibility → Verify result
```

### Regression Tests (배포 후 1시간)

- [ ] All E2E tests passing
- [ ] No new Sentry errors (compared to previous 24h)
- [ ] Performance metrics within acceptable range
  - LCP < 2.5s
  - FID < 100ms
  - CLS < 0.1

---

## 운영 계획

### 유지보수 일정

#### 일일 (Daily)
- [ ] Error logs 검토 (Sentry)
- [ ] Performance metrics 확인
- [ ] User feedback 수집

#### 주간 (Weekly)
- [ ] Database backup 확인
- [ ] Dependency security audit (`npm audit`)
- [ ] User analytics 리뷰

#### 월간 (Monthly)
- [ ] Dependency 업데이트 (minor versions)
- [ ] Vector index rebuild
- [ ] Performance optimization review
- [ ] User survey 발송

#### 분기별 (Quarterly)
- [ ] Visa rules 업데이트 (10개국)
- [ ] Major dependency 업데이트
- [ ] Security audit
- [ ] Disaster recovery drill

---

### 지원 체계

#### 기술 지원 채널
- **이메일**: support@aijox.com
- **채팅**: Intercom (웹사이트 우측 하단)
- **문서**: https://docs.aijox.com

#### 지원 시간
- **일반 문의**: 평일 9am-6pm KST
- **긴급 문의**: 24/7 (Critical bugs only)

#### 평균 응답 시간
- **Critical**: 1시간 이내
- **High**: 4시간 이내
- **Normal**: 24시간 이내
- **Low**: 3일 이내

---

## 프로젝트 회고

### 성공 요인
1. **AI-First 접근**
   - GPT-4o, Claude 3.5, text-embedding-3-small 활용
   - 비정형 데이터(비디오)를 정형 데이터로 변환
   - pgvector로 시맨틱 검색 구현

2. **Next.js 15 + RSC**
   - API 레이어 제거로 개발 속도 향상
   - Type-safe Server Actions
   - 자동 캐싱 및 revalidation

3. **명확한 타겟**
   - Native English teacher 특화
   - Visa eligibility 사전 체크로 리크루터 시간 절약
   - Accent matching으로 차별화

### 개선점
1. **테스트 부족**
   - Unit tests 미구현
   - E2E tests 필요

2. **문서화 부족**
   - API 문서 자동 생성 필요 (Swagger/OpenAPI)
   - 사용자 가이드 추가 필요

3. **모니터링 미흡**
   - Sentry 연동 아직 안됨
   - Custom analytics dashboard 필요

### 배운 교훈
- **SPARC 방법론 효과**
  - 의사코드 → 구현 → 문서화 순서가 명확한 설계 도움
  - Reverse SPARC도 유용 (기존 코드 문서화)

- **AI SDK 활용**
  - Vercel AI SDK가 OpenAI API보다 사용하기 쉬움
  - Zod 통합으로 타입 안전성 확보

- **Serverless 한계**
  - Long-running tasks (비디오 분석 > 10초) 처리 어려움
  - Background jobs 필요 (Vercel Cron 또는 Inngest)

---

## 다음 단계

### Phase 2 (1개월 후)
- [ ] Programmatic SEO 구현 (`/jobs/[country]/[city]/[subject]`)
- [ ] 이메일 자동 발송 (Claude 3.5 Sonnet 활용)
- [ ] Analytics dashboard 구현
- [ ] Mobile app (React Native + Expo)

### Phase 3 (3개월 후)
- [ ] AI chatbot (Teacher support)
- [ ] Resume builder (AI-assisted)
- [ ] Salary benchmark tool
- [ ] Video interview scheduling

### Phase 4 (6개월 후)
- [ ] AI-powered interview prep
- [ ] Onboarding automation
- [ ] Contract management
- [ ] Payment processing (Stripe Connect)

---

프로젝트 완료 후 유지보수 및 개선을 지속합니다.
