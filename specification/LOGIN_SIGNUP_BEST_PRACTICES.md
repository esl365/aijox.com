# Global Educator Nexus - 로그인/회원가입 Best Practices

> AI-Powered Native English Teacher & International School ESL/EFL Recruitment Platform
>
> **프로젝트 현황 기반 맞춤형 가이드**

## 📋 목차

1. [프로젝트 현황 분석](#프로젝트-현황-분석)
2. [핵심 설계 원칙](#핵심-설계-원칙)
3. [사용자 유형별 가입 플로우](#사용자-유형별-가입-플로우)
4. [폼 디자인 Best Practices](#폼-디자인-best-practices)
5. [기술 구현 가이드](#기술-구현-가이드)
6. [보안 및 규정 준수](#보안-및-규정-준수)
7. [구현 우선순위](#구현-우선순위)

---

## 프로젝트 현황 분석

### 현재 기술 스택
- **Frontend**: Next.js 15 (App Router), React 18, TypeScript
- **UI**: Radix UI, Tailwind CSS, Lucide Icons
- **Form**: React Hook Form, Zod (validation)
- **Auth**: NextAuth v5 (beta), @auth/prisma-adapter
- **Database**: PostgreSQL, Prisma ORM
- **File Upload**: UploadThing (비디오 이력서용)

### 사용자 유형 (UserRole)
프로젝트는 **4가지 사용자 유형**을 지원합니다:

1. **TEACHER** (교사) - 기본값
   - ESL/EFL 교사, 원어민 강사
   - 프로필: TeacherProfile (복잡도 높음)
   - 필수 정보: 국적, 학위, 경력, ESL 자격증 등

2. **SCHOOL** (학교)
   - 국제학교, 어학원
   - 프로필: SchoolProfile (중간 복잡도)
   - 필수 정보: 학교명, 위치, 커리큘럼 등

3. **RECRUITER** (리크루터)
   - 채용 대행사
   - 프로필: RecruiterProfile (단순)
   - 필수 정보: 회사명, 전문 분야 등

4. **ADMIN** (관리자)
   - 플랫폼 관리자

### 프로젝트 특성
- ✅ 이미 NextAuth v5 설정됨 (소셜 로그인 준비 완료)
- ✅ Prisma 스키마 완성 (User, Account, Session, VerificationToken)
- ✅ React Hook Form + Zod 사용 예정
- ⏳ UI 미구현 (처음부터 Best Practices 적용 가능)
- ⏳ 프로그레시브 프로파일링 구조 필요 (교사 정보 많음)

---

## 핵심 설계 원칙

### 1. 역할 기반 점진적 정보 수집 (Progressive Profiling)

**문제**: TEACHER 역할의 경우 수집해야 할 정보가 매우 많음 (30+ 필드)
- 기본 정보, 국적, 학위, 경력, ESL 자격증, 선호 국가, 비디오 이력서 등

**해결책**: 다단계 온보딩 + 프로그레시브 프로파일링

```
[단계 1] 계정 생성 (필수 최소)
  → 이메일, 비밀번호, 이름, 역할 선택
  ✅ 즉시 로그인 가능

[단계 2] 역할별 기본 프로필 (온보딩)
  TEACHER → 국적, 학위, 경력 연수만 요청
  SCHOOL → 학교명, 국가, 도시만 요청
  RECRUITER → 회사명만 요청
  ✅ 플랫폼 탐색 가능

[단계 3] 상세 프로필 (필요 시점에 요청)
  - 채용 공고 지원 시 → ESL 자격증, 선호 조건 요청
  - 비디오 이력서 업로드 시 → 전체 프로필 완성 유도
  - 프로필 완성도 점수 표시 (gamification)
```

**근거**:
- Gemini: "프로그레시브 프로파일링은 초기 이탈률을 극적으로 낮추고 장기 유지율 향상"
- Perplexity: "필드를 9개→6개로 줄였을 때 가입률 25% 증가"
- Claude: "기본 정보만 수집, 추가 정보는 온보딩 과정에서 점진적으로"

### 2. 역할 선택 우선 (Role-First Design)

초기 가입 시 사용자 역할을 먼저 선택하게 하여, 이후 폼을 맞춤화합니다.

**이점**:
- 불필요한 필드 제거 (교사에게 학교명 묻지 않음)
- 맞춤형 가이드 제공
- 데이터 품질 향상

**구현**:
```
1. 랜딩 페이지: "I'm a..." 선택
   [교사로 등록] [학교로 등록] [리크루터로 등록]

2. 선택에 따라 다른 가입 폼 표시
   - 공통: 이메일, 비밀번호, 이름
   - 역할별: 맞춤형 필드 2-3개만 추가
```

### 3. 소셜 로그인 우선 제공

**통계**:
- Claude: "SSO는 신규 사용자 전환율 20-40% 향상"
- Perplexity: "소셜 로그인은 가입률 8% 증가"
- Grok: "Google 선호도 70.97%"

**구현 권장사항**:
```tsx
// 우선순위 순서
1. Google (최우선 - 전세계적)
2. Apple (iOS 사용자)
3. LinkedIn (B2B 특성상 - 교사, 학교 관리자)
4. 이메일/비밀번호
```

**NextAuth v5 설정** (이미 준비됨):
```typescript
// auth.config.ts
providers: [
  Google,
  Apple,
  LinkedIn,
  Credentials
]
```

### 4. 모바일 우선 (Mobile-First)

**통계**:
- Perplexity: "2021년 모바일 트래픽 54.25%"
- Perplexity: "모바일 최적화 폼은 데스크톱 대비 67% 높은 전환율"

**필수 구현**:
- 단일 열(single-column) 레이아웃
- 터치 친화적 버튼 (최소 44x44px)
- 적절한 키보드 타입 (`type="email"`, `type="tel"`)
- 자동완성 지원 (`autocomplete` 속성)

---

## 사용자 유형별 가입 플로우

### TEACHER (교사) 가입 플로우

#### Phase 1: 계정 생성 (1분 이내)
```
필수 필드:
- 이메일 ✉️
- 비밀번호 🔒
- 이름 (First + Last) 👤
- 소셜 로그인 옵션 [Google] [Apple] [LinkedIn]

선택 필드:
- 전화번호 (나중에 요청 가능)
```

#### Phase 2: 역할 확인 온보딩 (2-3분)
```
질문 기반 접근:

1. "어디서 오셨나요?"
   → passportCountry 수집 (NativeSpeakerCountry enum)
   → 자동으로 비자 적격성 체크

2. "최종 학위는?"
   → degree (HIGH_SCHOOL ~ DOCTORATE)

3. "ESL/EFL 교육 경력이 있나요?"
   → yearsESLExperience (0, 1-2, 3-5, 5+)
   → 0이면 "신규 교사 환영!" 메시지

✅ 이 시점에서 profileComplete = 30%
✅ 채용 공고 검색 가능
```

#### Phase 3: 프로필 강화 (필요 시점에)

**트리거 1**: 채용 공고 지원 시
```
"더 나은 매칭을 위해 추가 정보를 알려주세요"
- ESL 자격증 (TEFL, TESOL, CELTA 등)
- 전문 분야 (IELTS, Business English 등)
- 선호 국가/도시
```

**트리거 2**: 프로필 완성도 알림
```
대시보드에 표시:
"프로필 완성도: 45% 🎯"
"비디오 이력서를 추가하면 +30% → 학교의 주목도 3배 상승!"
```

**트리거 3**: 일주일 후 이메일
```
"아직 비디오 이력서가 없으시네요! 📹
원어민 인증을 받으면 평균 지원률 2배 증가합니다."
```

### SCHOOL (학교) 가입 플로우

#### Phase 1: 계정 생성
```
필수:
- 이메일
- 비밀번호
- 담당자 이름
- 소셜 로그인 [Google] [LinkedIn]
```

#### Phase 2: 학교 정보 (간단)
```
- 학교명 🏫
- 국가 🌍
- 도시 🏙️

✅ 즉시 교사 검색 가능
```

#### Phase 3: 상세 정보 (채용 공고 작성 시)
```
"채용 공고를 작성하려면 학교 인증이 필요합니다"
- 학교 웹사이트
- 학교 주소
- 커리큘럼 (IB, AP, British 등)
- 로고 업로드
```

### RECRUITER (리크루터) 가입 플로우

가장 간단한 플로우:

```
Phase 1: 계정 + 회사명만 요청
Phase 2: 크레딧 구매 페이지로 안내
Phase 3: 교사 연락처 공개 시 상세 정보 요청
```

---

## 폼 디자인 Best Practices

### 1. 단계별 폼 구조 (Multi-Step Forms)

**언제 사용**: 5개 이상의 필드가 필요한 경우

**장점** (Gemini 분석):
- 인지 부하 극적 감소
- 진행률 표시로 동기 부여
- 모바일 UX 향상
- 각 단계별 이탈 추적 가능

**구현 패턴**:
```tsx
// 진행률 표시 필수
<ProgressBar current={2} total={4} />

// 각 단계별 명확한 제목
Step 1/4: Account Setup
Step 2/4: Your Background
Step 3/4: Preferences
Step 4/4: Upload Resume
```

### 2. 필드별 Best Practices

#### 이메일
```tsx
<Input
  type="email"
  autoComplete="email"
  placeholder="you@example.com"
  required
/>

// 실시간 검증 (Perplexity: 에러 발생 22% 감소)
- 형식 체크: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
- 중복 체크: DB 쿼리 (debounce 500ms)
- 성공 시: ✅ 녹색 체크
- 실패 시: ❌ "올바른 이메일 형식이 아닙니다"
```

#### 비밀번호
```tsx
<Input
  type="password"
  autoComplete="new-password"
  minLength={8}
/>

// 비밀번호 표시/숨김 토글 (Perplexity 권장)
<button type="button" onClick={toggleShow}>
  {show ? <EyeOff /> : <Eye />}
</button>

// 실시간 강도 측정기
<PasswordStrengthMeter value={password} />
// Weak (빨강) | Medium (노랑) | Strong (녹색)

// 요구사항 명시 (Claude: 과도한 복잡성 피하기)
- ✅ 최소 8자 이상
- ✅ 숫자 포함 권장
- ❌ 특수문자 강제 X
```

#### 이름 (국제화 고려)
```tsx
// 단일 "Full Name" 대신 First/Last 분리
<Input name="firstName" label="First Name" />
<Input name="lastName" label="Last Name" />

// 이유: 다국적 사용자 (아시아권 성/이름 순서 다름)
```

#### 역할 선택 (Role Selection)
```tsx
// 라디오 버튼 대신 시각적 카드
<RoleCard
  role="TEACHER"
  icon={<GraduationCap />}
  title="I'm a Teacher"
  description="Find ESL/EFL teaching jobs worldwide"
/>

// 각 역할에 명확한 아이콘 + 설명
- TEACHER: 졸업모자
- SCHOOL: 건물
- RECRUITER: 서류가방
```

#### 국적 선택 (passportCountry)
```tsx
// TEACHER만 해당 - 비자 적격성 중요

<Select>
  <SelectTrigger>
    <SelectValue placeholder="Select your passport country" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="USA">🇺🇸 United States</SelectItem>
    <SelectItem value="UK">🇬🇧 United Kingdom</SelectItem>
    <SelectItem value="CANADA">🇨🇦 Canada</SelectItem>
    <SelectItem value="AUSTRALIA">🇦🇺 Australia</SelectItem>
    <SelectItem value="NEW_ZEALAND">🇳🇿 New Zealand</SelectItem>
    <SelectItem value="IRELAND">🇮🇪 Ireland</SelectItem>
    <SelectItem value="SOUTH_AFRICA">🇿🇦 South Africa</SelectItem>
  </SelectContent>
</Select>

// 선택 시 즉시 피드백
"Great! As a US citizen, you're eligible for E2 visa in South Korea 🇰🇷"
```

### 3. 에러 메시지 작성 가이드

**원칙** (Gemini):
- 구체적: "Invalid" 대신 "이메일 형식이 올바르지 않습니다"
- 비난 회피: "잘못 입력했습니다" → "입력하신 정보를 확인해주세요"
- 해결책 제시: "이미 사용 중인 이메일입니다 → [로그인하기]"

**위치**: 필드 바로 아래 (인라인)

```tsx
// Zod 에러 메시지 커스터마이징
const schema = z.object({
  email: z
    .string()
    .email("올바른 이메일 형식을 입력해주세요 (예: name@example.com)"),
  password: z
    .string()
    .min(8, "비밀번호는 최소 8자 이상이어야 합니다")
})
```

### 4. CTA 버튼 최적화

**문구** (Perplexity):
- ❌ "제출", "Submit"
- ✅ "무료로 시작하기", "내 계정 만들기", "교사로 가입하기"

**1인칭 시점** (Gemini: 전환율 향상):
- ✅ "내 계정 만들기" (My Account)
- ✅ "무료 체험 시작하기" (Start My Free Trial)

**로딩 상태**:
```tsx
<Button disabled={isLoading}>
  {isLoading ? (
    <>
      <Loader2 className="animate-spin" />
      계정 생성 중...
    </>
  ) : (
    "무료로 시작하기"
  )}
</Button>
```

---

## 기술 구현 가이드

### 1. React Hook Form + Zod 패턴

```tsx
// schemas/auth.schema.ts
import { z } from "zod"

export const signupSchema = z.object({
  email: z.string().email("올바른 이메일을 입력해주세요"),
  password: z.string().min(8, "비밀번호는 최소 8자 이상이어야 합니다"),
  firstName: z.string().min(1, "이름을 입력해주세요"),
  lastName: z.string().min(1, "성을 입력해주세요"),
  role: z.enum(["TEACHER", "SCHOOL", "RECRUITER"]),
})

export type SignupInput = z.infer<typeof signupSchema>
```

```tsx
// components/SignupForm.tsx
"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { signupSchema, type SignupInput } from "@/schemas/auth.schema"

export function SignupForm() {
  const form = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      role: "TEACHER", // 기본값
    },
  })

  const onSubmit = async (data: SignupInput) => {
    // API 호출
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify(data),
    })
    // ...
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {/* 필드들 */}
      </form>
    </Form>
  )
}
```

### 2. NextAuth v5 설정

```typescript
// auth.config.ts
import Google from "next-auth/providers/google"
import Apple from "next-auth/providers/apple"
import LinkedIn from "next-auth/providers/linkedin"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { db } from "@/lib/db"

export const authConfig = {
  adapter: PrismaAdapter(db),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Apple({
      clientId: process.env.APPLE_CLIENT_ID,
      clientSecret: process.env.APPLE_CLIENT_SECRET,
    }),
    LinkedIn({
      clientId: process.env.LINKEDIN_CLIENT_ID,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
    }),
    Credentials({
      async authorize(credentials) {
        // 이메일/비밀번호 검증
        // bcrypt 비교 등
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // 소셜 로그인 시 역할 선택 페이지로 리다이렉트
      if (!user.role && account?.provider !== "credentials") {
        return "/onboarding/select-role"
      }
      return true
    },
    async session({ session, user }) {
      // 세션에 역할 추가
      session.user.role = user.role
      return session
    },
  },
  pages: {
    signIn: "/login",
    signOut: "/",
    error: "/error",
    newUser: "/onboarding", // 소셜 로그인 후 역할 선택
  },
}
```

### 3. 프로그레시브 프로파일링 구현

```tsx
// components/ProfileCompletionBanner.tsx
export function ProfileCompletionBanner({ profile }: { profile: TeacherProfile }) {
  const completionScore = profile.completionScore // 0-100

  const getMissingFields = () => {
    const missing = []
    if (!profile.passportCountry) missing.push("국적")
    if (!profile.degree) missing.push("학위")
    if (profile.yearsESLExperience === 0) missing.push("경력")
    if (!profile.videoResumeUrl) missing.push("비디오 이력서")
    return missing
  }

  const missing = getMissingFields()

  if (completionScore === 100) return null

  return (
    <Alert>
      <AlertTitle>프로필 완성도: {completionScore}%</AlertTitle>
      <AlertDescription>
        {missing.length > 0 && (
          <>
            아직 {missing.join(", ")}이(가) 필요합니다.
            <Link href="/profile/complete">지금 완성하기</Link>
          </>
        )}
      </AlertDescription>
      <Progress value={completionScore} />
    </Alert>
  )
}
```

```tsx
// app/jobs/[id]/apply/page.tsx - 지원 시 필수 정보 체크
export default async function ApplyPage({ params }: { params: { id: string } }) {
  const profile = await getTeacherProfile()

  // 필수 필드 체크
  if (!profile.passportCountry || !profile.eslCertifications.length) {
    return (
      <div>
        <h2>지원하려면 프로필을 완성해주세요</h2>
        <p>이 채용 공고에 지원하려면 다음 정보가 필요합니다:</p>
        <ul>
          {!profile.passportCountry && <li>국적 (비자 적격성 확인용)</li>}
          {!profile.eslCertifications.length && <li>ESL 자격증</li>}
        </ul>
        <Button asChild>
          <Link href="/profile/complete?returnTo=/jobs/{params.id}/apply">
            프로필 완성하기
          </Link>
        </Button>
      </div>
    )
  }

  // 지원 폼 표시
  return <ApplicationForm jobId={params.id} />
}
```

### 4. 인라인 검증 (Real-time Validation)

```tsx
// hooks/useEmailCheck.ts
import { useState, useEffect } from "react"
import { useDebouncedValue } from "@/hooks/useDebounce"

export function useEmailCheck(email: string) {
  const [isChecking, setIsChecking] = useState(false)
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null)
  const debouncedEmail = useDebouncedValue(email, 500)

  useEffect(() => {
    if (!debouncedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(debouncedEmail)) {
      setIsAvailable(null)
      return
    }

    setIsChecking(true)
    fetch(`/api/auth/check-email?email=${encodeURIComponent(debouncedEmail)}`)
      .then((res) => res.json())
      .then((data) => {
        setIsAvailable(data.available)
      })
      .finally(() => {
        setIsChecking(false)
      })
  }, [debouncedEmail])

  return { isChecking, isAvailable }
}
```

```tsx
// components/EmailField.tsx
export function EmailField({ value, onChange }: Props) {
  const { isChecking, isAvailable } = useEmailCheck(value)

  return (
    <div>
      <Input
        type="email"
        value={value}
        onChange={onChange}
        placeholder="you@example.com"
      />
      {isChecking && <Loader2 className="animate-spin" />}
      {isAvailable === true && (
        <p className="text-green-600">✅ 사용 가능한 이메일입니다</p>
      )}
      {isAvailable === false && (
        <p className="text-red-600">
          ❌ 이미 사용 중인 이메일입니다{" "}
          <Link href="/login">로그인하기</Link>
        </p>
      )}
    </div>
  )
}
```

---

## 보안 및 규정 준수

### 1. 비밀번호 보안

**저장** (이미 NextAuth가 처리):
```typescript
// bcrypt 또는 argon2 사용
import bcrypt from "bcryptjs"

const hashedPassword = await bcrypt.hash(password, 10)
```

**요구사항** (Claude + Perplexity):
- 최소 8자 (16자 권장)
- 복잡성 강제하지 않음 (긴 비밀번호가 더 안전)
- 비밀번호 관리자 지원 (붙여넣기 허용)
- "비밀번호 보기" 토글 제공
- 평문 저장/전송 절대 금지

### 2. 이메일 인증

**NextAuth v5 패턴**:
```typescript
// 가입 시 이메일 검증 토큰 발송
import { sendVerificationEmail } from "@/lib/email"

// VerificationToken 자동 생성
const token = await db.verificationToken.create({
  data: {
    identifier: email,
    token: randomUUID(),
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24시간
  },
})

await sendVerificationEmail(email, token.token)
```

**UX 고려사항**:
- 가입 후 즉시 로그인 허용 (이메일 미인증 상태)
- 대시보드 상단에 배너: "이메일을 인증해주세요 📧"
- 민감한 작업 (채용 공고 작성, 지원) 시에만 인증 강제

### 3. GDPR 준수 (국제 플랫폼)

**동의 체크박스** (Perplexity):
```tsx
<Checkbox id="terms" required />
<label htmlFor="terms">
  <a href="/terms">이용약관</a> 및{" "}
  <a href="/privacy">개인정보 처리방침</a>에 동의합니다 (필수)
</label>

<Checkbox id="marketing" />
<label htmlFor="marketing">
  채용 공고 및 프로모션 이메일 수신에 동의합니다 (선택)
</label>
```

**주의사항**:
- 사전 체크 금지 (명시적 동의 필요)
- 목적별 별도 체크박스
- 언제든 철회 가능 명시

### 4. 접근성 (WCAG 2.1 AA)

**필수 구현**:
```tsx
// 모든 입력에 label 연결
<label htmlFor="email">이메일</label>
<Input id="email" name="email" />

// 에러 메시지에 aria-describedby
<Input
  id="password"
  aria-describedby={errors.password ? "password-error" : undefined}
  aria-invalid={!!errors.password}
/>
{errors.password && (
  <p id="password-error" role="alert">
    {errors.password.message}
  </p>
)}

// 키보드 네비게이션
<form onKeyDown={(e) => {
  if (e.key === "Enter" && e.target.tagName !== "TEXTAREA") {
    e.preventDefault()
    form.handleSubmit(onSubmit)()
  }
}}>
```

**색상 대비**: 최소 4.5:1 (Tailwind의 기본 색상 대부분 준수)

---

## 구현 우선순위

### Phase 1: MVP (1-2주)
**목표**: 기본 가입/로그인 동작

- [ ] NextAuth v5 기본 설정
  - [ ] Google 소셜 로그인
  - [ ] 이메일/비밀번호 인증
- [ ] 간단한 가입 폼
  - [ ] 이메일, 비밀번호, 이름, 역할 선택만
  - [ ] React Hook Form + Zod 검증
- [ ] 역할별 리다이렉트
  - TEACHER → /dashboard/teacher
  - SCHOOL → /dashboard/school
  - RECRUITER → /dashboard/recruiter
- [ ] 로그인 폼
  - [ ] 소셜 로그인 버튼
  - [ ] 이메일/비밀번호 필드
  - [ ] "비밀번호 찾기" 링크

**테스트 체크리스트**:
- [ ] 모바일에서 정상 작동
- [ ] Google 로그인 → 역할 선택 → 대시보드 이동
- [ ] 이메일 가입 → 로그인 → 세션 유지
- [ ] 에러 메시지 표시 (중복 이메일 등)

### Phase 2: 온보딩 (2-3주)
**목표**: 역할별 맞춤형 프로필 수집

- [ ] 역할 선택 페이지 (소셜 로그인 후)
  - [ ] 시각적 카드 디자인
  - [ ] 각 역할 설명
- [ ] TEACHER 온보딩
  - [ ] 국적 선택 + 비자 피드백
  - [ ] 학위, 경력 연수
  - [ ] "나중에 완성하기" 옵션
- [ ] SCHOOL 온보딩
  - [ ] 학교명, 국가, 도시
- [ ] RECRUITER 온보딩
  - [ ] 회사명, 전문 분야
- [ ] 프로필 완성도 대시보드
  - [ ] 진행률 바
  - [ ] 누락된 필드 안내

### Phase 3: 프로그레시브 프로파일링 (3-4주)
**목표**: 필요 시점에 상세 정보 수집

- [ ] 지원 시 필수 정보 체크
  - [ ] ESL 자격증 미입력 시 팝업
  - [ ] "지금 추가하기" → 모달 또는 새 페이지
- [ ] 비디오 이력서 업로드 유도
  - [ ] 대시보드 배너
  - [ ] 이메일 리마인더 (1주일 후)
- [ ] 프로필 완성도 점수 (gamification)
  - [ ] 각 섹션별 가중치
  - [ ] "80% 이상 완성 시 우선 노출" 혜택 안내
- [ ] 상황별 데이터 요청
  - [ ] 채용 공고 작성 시 → 학교 상세 정보
  - [ ] 크레딧 구매 시 → 리크루터 회사 정보

### Phase 4: 고급 기능 (4주 이후)
- [ ] Apple, LinkedIn 소셜 로그인 추가
- [ ] 2단계 인증 (2FA) - 선택사항
- [ ] "매직 링크" 로그인 (비밀번호 없는 인증)
- [ ] A/B 테스트
  - [ ] 역할 선택 위치 (가입 전 vs 가입 후)
  - [ ] CTA 문구 변형 테스트
- [ ] 분석 및 최적화
  - [ ] 단계별 이탈률 추적
  - [ ] 히트맵 (hotjar 등)

---

## UI 컴포넌트 예시

### 역할 선택 카드

```tsx
// components/RoleSelectionCard.tsx
interface RoleCardProps {
  role: "TEACHER" | "SCHOOL" | "RECRUITER"
  selected: boolean
  onSelect: (role: string) => void
}

export function RoleSelectionCard({ role, selected, onSelect }: RoleCardProps) {
  const config = {
    TEACHER: {
      icon: GraduationCap,
      title: "교사로 등록",
      description: "전 세계 ESL/EFL 교육 채용 기회 찾기",
      color: "blue",
    },
    SCHOOL: {
      icon: Building2,
      title: "학교로 등록",
      description: "우수한 원어민 교사 채용하기",
      color: "green",
    },
    RECRUITER: {
      icon: Briefcase,
      title: "리크루터로 등록",
      description: "교사와 학교를 연결하기",
      color: "purple",
    },
  }[role]

  const Icon = config.icon

  return (
    <button
      onClick={() => onSelect(role)}
      className={cn(
        "flex flex-col items-center gap-4 p-6 rounded-lg border-2 transition",
        selected
          ? `border-${config.color}-500 bg-${config.color}-50`
          : "border-gray-200 hover:border-gray-300"
      )}
    >
      <Icon className={`h-12 w-12 text-${config.color}-600`} />
      <div className="text-center">
        <h3 className="font-semibold text-lg">{config.title}</h3>
        <p className="text-sm text-gray-600">{config.description}</p>
      </div>
    </button>
  )
}
```

### 소셜 로그인 버튼

```tsx
// components/SocialLoginButtons.tsx
export function SocialLoginButtons() {
  return (
    <div className="space-y-3">
      <Button
        variant="outline"
        className="w-full"
        onClick={() => signIn("google", { callbackUrl: "/onboarding" })}
      >
        <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
          {/* Google 아이콘 SVG */}
        </svg>
        Google로 계속하기
      </Button>

      <Button
        variant="outline"
        className="w-full"
        onClick={() => signIn("apple", { callbackUrl: "/onboarding" })}
      >
        <Apple className="h-5 w-5 mr-2" />
        Apple로 계속하기
      </Button>

      <Button
        variant="outline"
        className="w-full"
        onClick={() => signIn("linkedin", { callbackUrl: "/onboarding" })}
      >
        <Linkedin className="h-5 w-5 mr-2" />
        LinkedIn으로 계속하기
      </Button>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">또는</span>
        </div>
      </div>
    </div>
  )
}
```

### 진행률 표시

```tsx
// components/OnboardingProgress.tsx
interface ProgressProps {
  currentStep: number
  totalSteps: number
  steps: string[]
}

export function OnboardingProgress({ currentStep, totalSteps, steps }: ProgressProps) {
  return (
    <div className="mb-8">
      <div className="flex justify-between mb-2">
        {steps.map((step, index) => (
          <div
            key={index}
            className={cn(
              "flex-1 text-center text-sm",
              index + 1 === currentStep && "font-semibold text-blue-600",
              index + 1 < currentStep && "text-green-600"
            )}
          >
            {index + 1 < currentStep && "✓ "}
            {step}
          </div>
        ))}
      </div>
      <Progress value={(currentStep / totalSteps) * 100} />
      <p className="text-sm text-gray-500 mt-2">
        {currentStep} / {totalSteps} 단계
      </p>
    </div>
  )
}
```

---

## 핵심 성공 지표 (KPIs)

### 측정해야 할 지표

1. **가입 전환율**
   - 랜딩 페이지 방문 → 가입 완료 비율
   - 목표: 15-25% (업계 평균)

2. **소셜 로그인 사용률**
   - 전체 가입 중 소셜 로그인 비율
   - 목표: 60% 이상

3. **단계별 이탈률**
   - 각 온보딩 단계에서 이탈하는 사용자 비율
   - 목표: 각 단계 20% 미만

4. **프로필 완성율**
   - 가입 후 1주일 내 프로필 80% 이상 완성
   - 목표: 40% 이상

5. **첫 활동까지 시간**
   - 가입 → 첫 채용 공고 조회/지원 시간
   - 목표: 24시간 이내

### 추적 구현

```typescript
// lib/analytics.ts
export const trackSignupStep = (step: string, role: string) => {
  // Google Analytics 4
  gtag("event", "signup_step", {
    step_name: step,
    user_role: role,
  })

  // 자체 DB 로깅
  db.analyticsEvent.create({
    data: {
      event: "signup_step",
      properties: { step, role },
      timestamp: new Date(),
    },
  })
}

// 사용 예
trackSignupStep("account_created", "TEACHER")
trackSignupStep("onboarding_complete", "TEACHER")
```

---

## 요약: 우리 프로젝트에 가장 적합한 Best Practices

### ✅ 반드시 구현
1. **소셜 로그인 우선 제공** (Google, Apple, LinkedIn)
2. **역할 기반 맞춤 폼** (TEACHER/SCHOOL/RECRUITER)
3. **프로그레시브 프로파일링** (최소 가입 → 점진적 완성)
4. **모바일 우선 디자인** (단일 열, 큰 터치 타겟)
5. **실시간 인라인 검증** (이메일 중복, 비밀번호 강도)
6. **명확한 에러 메시지** (해결책 포함)

### 🎯 우선순위 높음
7. **다단계 온보딩** (진행률 표시)
8. **프로필 완성도 시각화** (gamification)
9. **역할별 대시보드 리다이렉트**
10. **비밀번호 보기 토글**
11. **접근성 (WCAG 2.1 AA)** 준수

### 💡 Phase 2 이후
12. **매직 링크** 로그인 (비밀번호 없는 인증)
13. **A/B 테스트** (CTA, 역할 선택 위치 등)
14. **2단계 인증** (선택사항)
15. **단계별 이탈률 분석** 및 최적화

---

**최종 체크리스트**:
- [x] 4가지 AI 모델 권장사항 종합 분석
- [x] 프로젝트 기술 스택 고려 (Next.js 15, NextAuth v5, Prisma)
- [x] 사용자 유형 특성 반영 (TEACHER 복잡, SCHOOL/RECRUITER 단순)
- [x] 단계별 구현 우선순위 제시
- [x] 실전 코드 예시 포함
- [x] 측정 가능한 KPI 정의

이 가이드를 따르면 **전환율이 높고, 사용자 경험이 우수하며, 확장 가능한** 로그인/회원가입 시스템을 구축할 수 있습니다! 🚀
