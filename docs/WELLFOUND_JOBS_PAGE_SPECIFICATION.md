# Wellfound Jobs 페이지 완전 클론 명세서

**문서 목적**: Wellfound /jobs 페이지를 최대한 동일하게 재현하기 위한 상세 명세
**대상 플랫폼**: Global Educator Nexus (aijobx)
**작성일**: 2025-11-26
**버전**: 1.0

---

## 목차

1. [전체 페이지 구조](#1-전체-페이지-구조)
2. [헤더 및 검색 영역](#2-헤더-및-검색-영역)
3. [Trending Startups 섹션](#3-trending-startups-섹션)
4. [Job Categories 섹션](#4-job-categories-섹션)
5. [Job Card 컴포넌트](#5-job-card-컴포넌트)
6. [사이드바 컴포넌트](#6-사이드바-컴포넌트)
7. [CTA 섹션](#7-cta-섹션)
8. [Footer 구조](#8-footer-구조)
9. [색상 및 타이포그래피](#9-색상-및-타이포그래피)
10. [구현 코드](#10-구현-코드)

---

## 1. 전체 페이지 구조

### 1.1 레이아웃 구조

```
┌─────────────────────────────────────────────────────────────────┐
│ NAVIGATION HEADER                                                │
│ [Logo] [Overview] [Jobs] [Featured] [Remote] [For companies] [Login] [Sign up] │
├─────────────────────────────────────────────────────────────────┤
│ HERO SEARCH SECTION                                              │
│ "OVER 150K REMOTE & LOCAL STARTUP JOBS"                          │
│ "Find what's next:"                                              │
│ [🔍 Job title] [📍 Location] [Search]                            │
├─────────────────────────────────────────────────────────────────┤
│ TRENDING STARTUPS HIRING NOW                                     │
│ [Card 1] [Card 2] [Card 3] [Card 4] [Card 5]                     │
├─────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────┐ ┌─────────────────────────┐ │
│ │ JOB LISTINGS (LEFT)             │ │ SIDEBAR (RIGHT)          │ │
│ │                                 │ │                          │ │
│ │ Trending startup jobs           │ │ [Sign up CTA]            │ │
│ │ ├─ Job Card 1                   │ │                          │ │
│ │ ├─ Job Card 2                   │ │ Level up your job search │ │
│ │ └─ View all jobs                │ │ ├─ Feature 1             │ │
│ │                                 │ │ ├─ Feature 2             │ │
│ │ Engineering jobs                │ │ └─ Feature 3             │ │
│ │ ├─ Job Card 1                   │ │                          │ │
│ │ ├─ Job Card 2                   │ │ Know your worth          │ │
│ │ └─ View all engineering jobs    │ │ [Salary calculator]      │ │
│ │                                 │ │                          │ │
│ │ Product jobs                    │ └─────────────────────────┘ │
│ │ Design jobs                     │                              │
│ │ Data and Analytics jobs         │                              │ │
│ │ Sales jobs                      │                              │
│ │ Marketing jobs                  │                              │
│ │ Operations jobs                 │                              │
│ │ HR and recruiting jobs          │                              │
│ │ Finance / Legal jobs            │                              │
│ └─────────────────────────────────┘                              │
├─────────────────────────────────────────────────────────────────┤
│ GET STARTED TODAY CTA                                            │
│ [Create your profile]                                            │
│ [Featured jobs] [Remote jobs] [Jobs by Location] [Jobs by Role]  │
├─────────────────────────────────────────────────────────────────┤
│ FOOTER                                                           │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 그리드 시스템

```css
/* 메인 컨테이너 */
.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 24px;
}

/* 2컬럼 레이아웃 (메인 + 사이드바) */
.jobs-layout {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 48px;
}

/* 모바일 */
@media (max-width: 1024px) {
  .jobs-layout {
    grid-template-columns: 1fr;
  }
  .sidebar {
    display: none; /* 또는 모바일용 다른 위치 */
  }
}
```

---

## 2. 헤더 및 검색 영역

### 2.1 네비게이션 헤더

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ [wellfound: logo]    [Overview] [Jobs •] [Featured] [Remote] [For companies] │
│                                                          [Log In] [Sign Up] │
└─────────────────────────────────────────────────────────────────────────────┘
```

**스타일 명세**:
- 배경: `#FFFFFF` (화이트)
- 높이: `64px`
- 로고: SVG, 너비 약 `120px`
- 네비게이션 링크:
  - 폰트: `14px`, `font-weight: 500`
  - 색상: `#374151` (기본), `#000000` (hover)
  - 활성 탭 (Jobs): 하단 도트 인디케이터 (`•`)
- 버튼:
  - Log In: ghost 스타일, `#374151`
  - Sign Up: 솔리드 `#000000`, 흰색 텍스트, `border-radius: 6px`

### 2.2 히어로 검색 섹션

```
┌─────────────────────────────────────────────────────────────────┐
│                     [작은 아이콘들: 💼 📊 ⭐]                     │
│                                                                 │
│              OVER 150K REMOTE & LOCAL STARTUP JOBS              │
│                                                                 │
│                    Find what's next:                            │
│                                                                 │
│  ┌─────────────────────┐ ┌─────────────────────┐ ┌──────────┐  │
│  │ 🔍 Job title        │ │ 📍 Location         │ │  Search  │  │
│  └─────────────────────┘ └─────────────────────┘ └──────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

**스타일 명세**:
- 배경: `#FFFFFF`
- 상단 작은 텍스트:
  - 폰트: `12px`, `font-weight: 500`, `letter-spacing: 1px`
  - 색상: `#6B7280`
  - 텍스트: "OVER 150K REMOTE & LOCAL STARTUP JOBS"
- 메인 헤드라인:
  - 폰트: `48px`, `font-weight: 700`
  - 색상: `#111827`
  - 텍스트: "Find what's next:"
- 검색 입력 필드:
  - 너비: 각각 약 `280px`
  - 높이: `48px`
  - 배경: `#F9FAFB`
  - 보더: `1px solid #E5E7EB`
  - 보더 radius: `8px`
  - placeholder 색상: `#9CA3AF`
- 검색 버튼:
  - 배경: `#000000`
  - 색상: `#FFFFFF`
  - 높이: `48px`
  - 너비: `100px`
  - 보더 radius: `8px`

### 2.3 검색 필드 아이콘 장식

히어로 섹션 상단에 플로팅 아이콘들:
- 왼쪽: 노란색 별 아이콘 (⭐)
- 중앙: 보라색 차트 아이콘 (📊)
- 오른쪽: 녹색 식물 아이콘 (🌱)

```tsx
const FloatingIcons = () => (
  <div className="absolute inset-0 pointer-events-none">
    <span className="absolute top-4 left-1/4 text-2xl">⭐</span>
    <span className="absolute top-8 right-1/3 text-2xl">📊</span>
    <span className="absolute top-2 right-1/4 text-2xl">🌱</span>
  </div>
);
```

---

## 3. Trending Startups 섹션

### 3.1 섹션 헤더

```
Trending startups hiring now
```

**스타일**:
- 폰트: `24px`, `font-weight: 700`
- 색상: `#111827`
- 마진: `bottom: 24px`

### 3.2 스타트업 카드 그리드

```
┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐
│ [Logo]  │ │ [Logo]  │ │ [Logo]  │ │ [Logo]  │ │ [Logo]  │
│ GEMS AI │ │ Ankorst │ │ NexFI   │ │ Gust    │ │ ...     │
│ AI/ML   │ │ Fintech │ │ Health  │ │ VC      │ │         │
│ SF, $5M │ │ NYC     │ │ Boston  │ │ Remote  │ │         │
│ ───────│ │ ───────│ │ ───────│ │ ───────│ │         │
│ [Tags]  │ │ [Tags]  │ │ [Tags]  │ │ [Tags]  │ │         │
│ 10 open │ │ 8 open  │ │ 15 open │ │ 5 open  │ │         │
└─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘
```

**카드 명세**:
- 너비: `calc(20% - 16px)` (5개 그리드)
- 높이: 자동 (콘텐츠 기반)
- 배경: `#FFFFFF`
- 보더: `1px solid #E5E7EB`
- 보더 radius: `12px`
- 패딩: `20px`
- hover: `box-shadow: 0 4px 12px rgba(0,0,0,0.1)`

**카드 내부 구조**:
```tsx
interface StartupCard {
  logo: string;           // 로고 이미지 URL
  name: string;           // 회사명
  tagline: string;        // 한 줄 설명
  location: string;       // 위치
  funding?: string;       // 펀딩 정보 (예: "Seed", "Series A")
  tags: string[];         // 기술 스택 또는 분야 태그
  openPositions: number;  // 오픈 포지션 수
}
```

**태그 스타일**:
- 배경: `#F3F4F6`
- 색상: `#374151`
- 폰트: `12px`
- 패딩: `4px 8px`
- 보더 radius: `4px`

---

## 4. Job Categories 섹션

### 4.1 카테고리 목록

Wellfound는 직무별로 그룹화된 Job 목록을 표시:

1. **Trending startup jobs** - "View all jobs" 링크
2. **Engineering jobs** - "View all engineering jobs" 링크
3. **Product jobs** - "View all product jobs" 링크
4. **Design jobs** - "View all design jobs" 링크
5. **Data and Analytics jobs** - "View all data and analytics jobs" 링크
6. **Sales jobs** - "View all sales jobs" 링크
7. **Marketing jobs** - "View all marketing jobs" 링크
8. **Operations jobs** - "View all operations jobs" 링크
9. **HR and recruiting jobs** - "View all hr and recruiting jobs" 링크
10. **Finance / Legal jobs** - "View all finance / legal jobs" 링크

### 4.2 카테고리 섹션 헤더

```
┌─────────────────────────────────────────────────────────────┐
│ Engineering jobs                    View all engineering jobs │
└─────────────────────────────────────────────────────────────┘
```

**스타일**:
- 카테고리명:
  - 폰트: `20px`, `font-weight: 600`
  - 색상: `#111827`
- "View all" 링크:
  - 폰트: `14px`, `font-weight: 500`
  - 색상: `#6B7280`
  - hover: `#111827`, underline

### 4.3 교육 플랫폼용 카테고리 매핑

| Wellfound 카테고리 | Global Educator Nexus 카테고리 |
|-------------------|------------------------------|
| Trending startup jobs | Trending teaching jobs |
| Engineering jobs | STEM Teaching jobs |
| Product jobs | Curriculum Development jobs |
| Design jobs | Arts & Music Teaching jobs |
| Data and Analytics jobs | Assessment & Data jobs |
| Sales jobs | Admissions & Enrollment jobs |
| Marketing jobs | School Marketing jobs |
| Operations jobs | School Operations jobs |
| HR and recruiting jobs | Teacher Recruitment jobs |
| Finance / Legal jobs | School Administration jobs |

---

## 5. Job Card 컴포넌트

### 5.1 Job Card 구조

```
┌─────────────────────────────────────────────────────────────────────────┐
│ [🔵 Company Logo]  Product Engineer                              [Apply]│
│                    SpellStry • Remote only • Compensation: $150K - $175K│
│                    • 0.0% - 0.25% • today                               │
└─────────────────────────────────────────────────────────────────────────┘
```

### 5.2 상세 명세

```tsx
interface JobCardProps {
  id: string;
  company: {
    name: string;
    logo: string;
    logoColor?: string;  // 로고 배경색
  };
  title: string;
  location: string;           // "Remote only", "San Francisco, CA", etc.
  compensation: {
    salary?: string;          // "$150K - $175K"
    equity?: string;          // "0.0% - 0.25%"
  };
  postedAt: string;           // "today", "2 days ago", etc.
  isNew?: boolean;
  isFeatured?: boolean;
}
```

### 5.3 Job Card 스타일

```css
.job-card {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 20px 0;
  border-bottom: 1px solid #E5E7EB;
}

.job-card:hover {
  background-color: #F9FAFB;
  margin: 0 -16px;
  padding: 20px 16px;
  border-radius: 8px;
}

/* 회사 로고 */
.company-logo {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 600;
  color: white;
}

/* 직무 제목 */
.job-title {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 4px;
}

/* 메타 정보 */
.job-meta {
  font-size: 14px;
  color: #6B7280;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.job-meta span::before {
  content: "•";
  margin-right: 8px;
  color: #D1D5DB;
}

.job-meta span:first-child::before {
  content: "";
  margin-right: 0;
}

/* Apply 버튼 */
.apply-button {
  margin-left: auto;
  padding: 8px 20px;
  background: #000000;
  color: #FFFFFF;
  font-size: 14px;
  font-weight: 500;
  border-radius: 6px;
  border: none;
  cursor: pointer;
}

.apply-button:hover {
  background: #374151;
}
```

### 5.4 로고 색상 팔레트

회사 로고가 없을 경우 이니셜 + 배경색 조합:

```typescript
const logoColors = [
  '#3B82F6', // Blue
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#EF4444', // Red
  '#F97316', // Orange
  '#EAB308', // Yellow
  '#22C55E', // Green
  '#14B8A6', // Teal
  '#06B6D4', // Cyan
  '#6366F1', // Indigo
];

function getLogoColor(companyName: string): string {
  const index = companyName.charCodeAt(0) % logoColors.length;
  return logoColors[index];
}
```

---

## 6. 사이드바 컴포넌트

### 6.1 전체 구조

```
┌─────────────────────────────────────┐
│ [Sign up 버튼]                       │
│ ─────────────────────               │
│ or                                  │
│ [🔵 Sign up with Google]            │
│                                     │
│ Already have an account? Login      │
├─────────────────────────────────────┤
│ Level up your job search            │
│                                     │
│ ✓ Unique jobs in niche industries   │
│ ✓ Set salary & equity upfront       │
│ ✓ Personalized job filters          │
│ ✓ Showcase skills beyond a resume   │
│ ✓ Let founders and recruiters       │
│   reach out to you                  │
│                                     │
│ [Sign up to search]                 │
├─────────────────────────────────────┤
│ Know your worth                     │
│                                     │
│ Know your worth. Filter by industry,│
│ job type, location & more.          │
│                                     │
│ [Salary calculator]                 │
└─────────────────────────────────────┘
```

### 6.2 Sign Up CTA 카드

```css
.signup-card {
  background: #FFFFFF;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
}

.signup-button-primary {
  width: 100%;
  padding: 12px;
  background: #000000;
  color: #FFFFFF;
  font-weight: 500;
  border-radius: 6px;
  margin-bottom: 16px;
}

.signup-divider {
  text-align: center;
  color: #9CA3AF;
  font-size: 14px;
  margin: 16px 0;
}

.signup-button-google {
  width: 100%;
  padding: 12px;
  background: #FFFFFF;
  border: 1px solid #E5E7EB;
  color: #374151;
  font-weight: 500;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
```

### 6.3 Level Up 카드

```tsx
interface LevelUpFeature {
  icon: string;  // 체크마크 또는 커스텀 아이콘
  text: string;
}

const levelUpFeatures: LevelUpFeature[] = [
  { icon: '✓', text: 'Unique jobs in niche industries' },
  { icon: '✓', text: 'Set salary & equity upfront' },
  { icon: '✓', text: 'Personalized job filters' },
  { icon: '✓', text: 'Showcase skills beyond a resume' },
  { icon: '✓', text: 'Let founders and recruiters reach out to you' },
];
```

**스타일**:
- 제목: `20px`, `font-weight: 600`, `#111827`
- 체크 아이콘: `#22C55E` (녹색)
- 텍스트: `14px`, `#374151`
- 간격: `12px` between items

### 6.4 Salary Calculator 카드

```css
.salary-card {
  background: #F9FAFB;
  border-radius: 12px;
  padding: 24px;
}

.salary-card h3 {
  font-size: 20px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 8px;
}

.salary-card p {
  font-size: 14px;
  color: #6B7280;
  margin-bottom: 16px;
}

.salary-button {
  padding: 10px 20px;
  background: #FFFFFF;
  border: 1px solid #E5E7EB;
  color: #374151;
  font-weight: 500;
  border-radius: 6px;
  cursor: pointer;
}
```

---

## 7. CTA 섹션

### 7.1 Get Started Today

```
┌─────────────────────────────────────────────────────────────────┐
│                        [🌱 일러스트]                             │
│                                                                 │
│                     Get started today                           │
│    To apply to jobs with one click and connect with founders    │
│              and recruiters searching for your skills.          │
│                                                                 │
│                    [Create your profile]                        │
│                                                                 │
│  [Featured jobs ▼] [Remote jobs ▼] [Jobs by Location ▼]         │
│  [Jobs by Role ▼] [Jobs by Role & Location ▼]                   │
└─────────────────────────────────────────────────────────────────┘
```

**스타일**:
- 배경: `#F9FAFB`
- 일러스트: 중앙 정렬, 녹색 테마 식물/성장 이미지
- 제목: `32px`, `font-weight: 700`, `#111827`
- 부제목: `16px`, `#6B7280`, 최대 너비 `500px`
- CTA 버튼: `#22C55E` (녹색), 흰색 텍스트, `border-radius: 6px`
- 필터 드롭다운: `#FFFFFF` 배경, `#E5E7EB` 보더

### 7.2 Quick Filter 버튼들

```tsx
const quickFilters = [
  { label: 'Featured jobs', hasDropdown: true },
  { label: 'Remote jobs', hasDropdown: true },
  { label: 'Jobs by Location', hasDropdown: true },
  { label: 'Jobs by Role', hasDropdown: true },
  { label: 'Jobs by Role & Location', hasDropdown: true },
];
```

---

## 8. Footer 구조

### 8.1 레이아웃

```
┌─────────────────────────────────────────────────────────────────┐
│ wellfound:        For Candidates    For Recruiters    Company   │
│                   Overview          Overview          About     │
│ [Twitter]         Startup Jobs      Recruit Pro       Blog      │
│ [LinkedIn]        Web3 Jobs         Curated           Help      │
│                   Featured          WellfoundHR       Terms     │
│                   Startup Hiring    Hire Developers   Privacy   │
│                   Tech Startups     Pricing           Trust     │
│                                                       Platform  │
├─────────────────────────────────────────────────────────────────┤
│ © 2025 Wellfound. All rights reserved.                          │
│ Browse by: Jobs | Remote Jobs | Locations | Startups | ...      │
└─────────────────────────────────────────────────────────────────┘
```

### 8.2 Footer 스타일

```css
.footer {
  background: #FFFFFF;
  border-top: 1px solid #E5E7EB;
  padding: 48px 0 24px;
}

.footer-grid {
  display: grid;
  grid-template-columns: 200px repeat(3, 1fr);
  gap: 48px;
}

.footer-logo {
  font-size: 20px;
  font-weight: 700;
  color: #111827;
}

.footer-social {
  display: flex;
  gap: 12px;
  margin-top: 16px;
}

.footer-column h4 {
  font-size: 14px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 16px;
}

.footer-column a {
  display: block;
  font-size: 14px;
  color: #6B7280;
  margin-bottom: 8px;
}

.footer-column a:hover {
  color: #111827;
}

.footer-bottom {
  border-top: 1px solid #E5E7EB;
  padding-top: 24px;
  margin-top: 48px;
}

.footer-copyright {
  font-size: 12px;
  color: #9CA3AF;
}

.footer-browse {
  font-size: 12px;
  color: #6B7280;
}
```

---

## 9. 색상 및 타이포그래피

### 9.1 색상 시스템

```typescript
const colors = {
  // Primary
  primary: {
    black: '#000000',
    white: '#FFFFFF',
  },

  // Grays
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },

  // Accent Colors (for company logos)
  accent: {
    blue: '#3B82F6',
    purple: '#8B5CF6',
    pink: '#EC4899',
    red: '#EF4444',
    orange: '#F97316',
    yellow: '#EAB308',
    green: '#22C55E',
    teal: '#14B8A6',
    cyan: '#06B6D4',
    indigo: '#6366F1',
  },

  // Semantic
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
};
```

### 9.2 타이포그래피

```css
/* Font Family */
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
             'Helvetica Neue', Arial, sans-serif;

/* Headings */
.h1 { font-size: 48px; font-weight: 700; line-height: 1.2; }
.h2 { font-size: 32px; font-weight: 700; line-height: 1.3; }
.h3 { font-size: 24px; font-weight: 600; line-height: 1.4; }
.h4 { font-size: 20px; font-weight: 600; line-height: 1.4; }
.h5 { font-size: 16px; font-weight: 600; line-height: 1.5; }

/* Body */
.body-lg { font-size: 18px; line-height: 1.6; }
.body-md { font-size: 16px; line-height: 1.6; }
.body-sm { font-size: 14px; line-height: 1.5; }
.body-xs { font-size: 12px; line-height: 1.5; }

/* Labels */
.label-lg { font-size: 14px; font-weight: 500; letter-spacing: 0.02em; }
.label-sm { font-size: 12px; font-weight: 500; letter-spacing: 0.04em; text-transform: uppercase; }
```

### 9.3 반응형 타이포그래피

```css
/* Mobile */
@media (max-width: 768px) {
  .h1 { font-size: 32px; }
  .h2 { font-size: 24px; }
  .h3 { font-size: 20px; }
}
```

---

## 10. 구현 코드

### 10.1 Jobs Page Layout

```tsx
// app/jobs/page.tsx
import { JobsHero } from '@/components/jobs/jobs-hero';
import { TrendingStartups } from '@/components/jobs/trending-startups';
import { JobCategories } from '@/components/jobs/job-categories';
import { JobsSidebar } from '@/components/jobs/jobs-sidebar';
import { GetStartedCTA } from '@/components/jobs/get-started-cta';

export default function JobsPage() {
  return (
    <div className="min-h-screen bg-white">
      <JobsHero />
      <TrendingStartups />

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-12">
          {/* Main Content */}
          <main>
            <JobCategories />
          </main>

          {/* Sidebar */}
          <aside className="hidden lg:block">
            <JobsSidebar />
          </aside>
        </div>
      </div>

      <GetStartedCTA />
    </div>
  );
}
```

### 10.2 Jobs Hero Component

```tsx
// components/jobs/jobs-hero.tsx
'use client';

import { useState } from 'react';
import { Search, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function JobsHero() {
  const [jobTitle, setJobTitle] = useState('');
  const [location, setLocation] = useState('');

  const handleSearch = () => {
    // Implement search logic
  };

  return (
    <section className="relative py-16 bg-white">
      {/* Floating Icons */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <span className="absolute top-8 left-1/4 text-3xl opacity-60">⭐</span>
        <span className="absolute top-12 left-1/2 text-3xl opacity-60">📊</span>
        <span className="absolute top-6 right-1/4 text-3xl opacity-60">🌱</span>
      </div>

      <div className="container mx-auto px-4 text-center">
        <p className="text-xs font-medium tracking-wider text-gray-500 mb-4">
          OVER 150K REMOTE & LOCAL STARTUP JOBS
        </p>

        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">
          Find what's next:
        </h1>

        <div className="flex flex-col md:flex-row items-center justify-center gap-4 max-w-2xl mx-auto">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Job title"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              className="pl-12 h-12 bg-gray-50 border-gray-200"
            />
          </div>

          <div className="relative flex-1 w-full">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="pl-12 h-12 bg-gray-50 border-gray-200"
            />
          </div>

          <Button
            onClick={handleSearch}
            className="h-12 px-8 bg-black hover:bg-gray-800"
          >
            Search
          </Button>
        </div>
      </div>
    </section>
  );
}
```

### 10.3 Job Card Component

```tsx
// components/jobs/job-card.tsx
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface JobCardProps {
  id: string;
  company: {
    name: string;
    logo?: string;
    logoColor?: string;
  };
  title: string;
  location: string;
  salary?: string;
  equity?: string;
  postedAt: string;
}

export function JobCard({
  id,
  company,
  title,
  location,
  salary,
  equity,
  postedAt,
}: JobCardProps) {
  const getInitials = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  const logoColors = [
    '#3B82F6', '#8B5CF6', '#EC4899', '#EF4444', '#F97316',
    '#EAB308', '#22C55E', '#14B8A6', '#06B6D4', '#6366F1',
  ];

  const bgColor = company.logoColor ||
    logoColors[company.name.charCodeAt(0) % logoColors.length];

  return (
    <div className="group flex items-start gap-4 py-5 px-4 -mx-4 hover:bg-gray-50 rounded-lg transition-colors border-b border-gray-100 last:border-0">
      {/* Company Logo */}
      {company.logo ? (
        <img
          src={company.logo}
          alt={company.name}
          className="w-12 h-12 rounded-lg object-cover"
        />
      ) : (
        <div
          className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-semibold text-lg"
          style={{ backgroundColor: bgColor }}
        >
          {getInitials(company.name)}
        </div>
      )}

      {/* Job Info */}
      <div className="flex-1 min-w-0">
        <Link href={`/jobs/${id}`}>
          <h3 className="font-semibold text-gray-900 hover:text-blue-600 transition-colors">
            {title}
          </h3>
        </Link>

        <div className="flex flex-wrap items-center gap-1 text-sm text-gray-500 mt-1">
          <span className="font-medium text-gray-700">{company.name}</span>
          <span className="text-gray-300">•</span>
          <span>{location}</span>
          {salary && (
            <>
              <span className="text-gray-300">•</span>
              <span>Compensation: {salary}</span>
            </>
          )}
          {equity && (
            <>
              <span className="text-gray-300">•</span>
              <span>{equity}</span>
            </>
          )}
          <span className="text-gray-300">•</span>
          <span>{postedAt}</span>
        </div>
      </div>

      {/* Apply Button */}
      <Button
        variant="default"
        size="sm"
        className="opacity-0 group-hover:opacity-100 transition-opacity bg-black hover:bg-gray-800"
      >
        Apply
      </Button>
    </div>
  );
}
```

### 10.4 Job Category Section

```tsx
// components/jobs/job-category-section.tsx
'use client';

import Link from 'next/link';
import { JobCard } from './job-card';

interface Job {
  id: string;
  company: {
    name: string;
    logo?: string;
    logoColor?: string;
  };
  title: string;
  location: string;
  salary?: string;
  equity?: string;
  postedAt: string;
}

interface JobCategorySectionProps {
  title: string;
  viewAllLink: string;
  viewAllText: string;
  jobs: Job[];
}

export function JobCategorySection({
  title,
  viewAllLink,
  viewAllText,
  jobs,
}: JobCategorySectionProps) {
  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">
          {title}
        </h2>
        <Link
          href={viewAllLink}
          className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          {viewAllText}
        </Link>
      </div>

      <div className="divide-y divide-gray-100">
        {jobs.map((job) => (
          <JobCard key={job.id} {...job} />
        ))}
      </div>
    </section>
  );
}
```

### 10.5 Jobs Sidebar

```tsx
// components/jobs/jobs-sidebar.tsx
'use client';

import Link from 'next/link';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function JobsSidebar() {
  const features = [
    'Unique jobs in niche industries',
    'Set salary & equity upfront',
    'Personalized job filters',
    'Showcase skills beyond a resume',
    'Let founders and recruiters reach out to you',
  ];

  return (
    <div className="sticky top-24 space-y-6">
      {/* Sign Up Card */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <Button className="w-full mb-4 bg-black hover:bg-gray-800">
          Sign up
        </Button>

        <div className="text-center text-sm text-gray-400 mb-4">or</div>

        <Button
          variant="outline"
          className="w-full flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            {/* Google Icon SVG */}
          </svg>
          Sign up with Google
        </Button>

        <p className="text-center text-sm text-gray-500 mt-4">
          Already have an account?{' '}
          <Link href="/login" className="text-blue-600 hover:underline">
            Login
          </Link>
        </p>
      </div>

      {/* Level Up Card */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Level up your job search
        </h3>

        <ul className="space-y-3 mb-6">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-3 text-sm text-gray-600">
              <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        <Button variant="outline" className="w-full">
          Sign up to search
        </Button>
      </div>

      {/* Salary Calculator Card */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Know your worth
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          Know your worth. Filter by industry, job type, location & more.
        </p>
        <Button variant="outline" className="bg-white">
          Salary calculator
        </Button>
      </div>
    </div>
  );
}
```

### 10.6 Trending Startups

```tsx
// components/jobs/trending-startups.tsx
'use client';

import Link from 'next/link';

interface Startup {
  id: string;
  name: string;
  logo?: string;
  logoColor?: string;
  tagline: string;
  location: string;
  tags: string[];
  openPositions: number;
}

interface TrendingStartupsProps {
  startups?: Startup[];
}

const defaultStartups: Startup[] = [
  {
    id: '1',
    name: 'GEMS AI',
    tagline: 'AI infrastructure for ML teams',
    location: 'San Francisco, CA',
    tags: ['AI/ML', 'B2B'],
    openPositions: 10,
    logoColor: '#3B82F6',
  },
  // Add more defaults...
];

export function TrendingStartups({ startups = defaultStartups }: TrendingStartupsProps) {
  return (
    <section className="py-12 bg-white border-b border-gray-100">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Trending startups hiring now
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {startups.map((startup) => (
            <Link
              key={startup.id}
              href={`/companies/${startup.id}`}
              className="group p-5 bg-white border border-gray-200 rounded-xl hover:shadow-lg transition-shadow"
            >
              {/* Logo */}
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg mb-4"
                style={{ backgroundColor: startup.logoColor || '#6B7280' }}
              >
                {startup.name.charAt(0)}
              </div>

              {/* Info */}
              <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 mb-1">
                {startup.name}
              </h3>
              <p className="text-sm text-gray-500 line-clamp-2 mb-2">
                {startup.tagline}
              </p>
              <p className="text-xs text-gray-400 mb-3">
                {startup.location}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1 mb-3">
                {startup.tags.slice(0, 2).map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Open Positions */}
              <p className="text-sm text-gray-500">
                {startup.openPositions} open position{startup.openPositions !== 1 ? 's' : ''}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
```

---

## 11. 교육 플랫폼 적용 가이드

### 11.1 용어 매핑

| Wellfound 용어 | Global Educator Nexus 용어 |
|---------------|--------------------------|
| Startup | International School |
| Founder | School Administrator |
| Engineering | STEM Teaching |
| Product | Curriculum |
| Remote | Online Teaching |
| Equity | Benefits Package |
| Series A/B/C | School Rating |

### 11.2 카테고리 매핑

```typescript
const educationCategories = [
  { id: 'trending', label: 'Trending teaching jobs', icon: '🔥' },
  { id: 'stem', label: 'STEM Teaching jobs', icon: '🔬' },
  { id: 'languages', label: 'Language Teaching jobs', icon: '🌍' },
  { id: 'arts', label: 'Arts & Music jobs', icon: '🎨' },
  { id: 'elementary', label: 'Elementary Education jobs', icon: '📚' },
  { id: 'secondary', label: 'Secondary Education jobs', icon: '🎓' },
  { id: 'administration', label: 'Administration jobs', icon: '🏫' },
  { id: 'special-ed', label: 'Special Education jobs', icon: '💜' },
  { id: 'online', label: 'Online Teaching jobs', icon: '💻' },
  { id: 'ib', label: 'IB Curriculum jobs', icon: '🌐' },
];
```

### 11.3 검색 필터 매핑

```typescript
const educationFilters = {
  location: ['South Korea', 'China', 'Japan', 'UAE', 'Singapore', 'Thailand'],
  subject: ['English', 'Math', 'Science', 'Social Studies', 'PE', 'Music', 'Art'],
  level: ['Early Childhood', 'Elementary', 'Middle School', 'High School'],
  curriculum: ['IB', 'British', 'American', 'Canadian', 'Australian'],
  benefits: ['Housing', 'Flight', 'Health Insurance', 'Visa Sponsorship'],
  salary: ['$2000-3000', '$3000-4000', '$4000-5000', '$5000+'],
};
```

---

## 12. 구현 우선순위

### Phase 1: Core Layout (Week 1)
- [ ] Jobs Hero Section with Search
- [ ] Job Card Component
- [ ] Job Category Section Layout
- [ ] Basic Pagination

### Phase 2: Sidebar & Features (Week 2)
- [ ] Sign Up CTA Sidebar
- [ ] Level Up Features Card
- [ ] Salary/Benefits Calculator Integration
- [ ] Sticky Sidebar Behavior

### Phase 3: Trending & CTA (Week 3)
- [ ] Trending Schools Section
- [ ] Get Started CTA Section
- [ ] Quick Filter Dropdowns
- [ ] Footer Integration

### Phase 4: Polish & Animations (Week 4)
- [ ] Hover States & Transitions
- [ ] Loading Skeletons
- [ ] Empty States
- [ ] Mobile Responsive Adjustments

---

## 13. 테스트 체크리스트

### Unit Tests
- [ ] JobCard renders correctly with all props
- [ ] JobCategorySection displays jobs in order
- [ ] Search filters work correctly
- [ ] Sidebar sticky behavior

### E2E Tests
- [ ] Search flow: type query → submit → view results
- [ ] Category navigation
- [ ] Job application flow
- [ ] Mobile responsive behavior

### Accessibility Tests
- [ ] Keyboard navigation
- [ ] Screen reader compatibility
- [ ] Color contrast ratios
- [ ] Focus indicators

---

**문서 버전 히스토리**:
- v1.0 (2025-11-26): 초기 작성
