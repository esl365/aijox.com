# Wellfound → aijobx 구현 매핑

**작성일**: 2025-11-26
**목적**: Wellfound 벤치마크를 aijobx에 적용하기 위한 구체적 매핑 문서

---

## 1. 섹션별 구현 매핑

### 1.1 Hero Section

| Wellfound 요소 | aijobx 적용 | 파일 경로 | 상태 |
|----------------|-------------|-----------|------|
| "Find what's next" 헤드라인 | "Find your next teaching adventure" | `components/ui-v2/hero-section.tsx` | ✅ 존재 |
| Rotating text animation | RotatingText 컴포넌트 | `components/animations/rotating-text.tsx` | ⚠️ 미구현 |
| Floating tags (Python, iOS 등) | 교육 관련 태그 (Japan, ESL 등) | `components/ui-v2/floating-tags.tsx` | ⚠️ 미구현 |
| Dual CTA (Find job / Hire) | Find Teaching Jobs / Hire Teachers | `components/ui-v2/hero-section.tsx` | ✅ 존재 |
| Background parallax | GSAP parallax effect | `lib/animations/parallax.ts` | ⚠️ 미구현 |

### 1.2 Navigation

| Wellfound 요소 | aijobx 적용 | 파일 경로 | 상태 |
|----------------|-------------|-----------|------|
| Sticky header | useScrollPosition hook | `components/layout/header.tsx` | ⚠️ 미구현 |
| Discover dropdown | Jobs dropdown | `components/ui/dropdown-menu.tsx` | ✅ 존재 |
| For job seekers dropdown | For Teachers dropdown | - | ⚠️ 미구현 |
| For companies dropdown | For Schools dropdown | - | ⚠️ 미구현 |
| Mobile menu | Sheet 컴포넌트 | `components/ui/sheet.tsx` | ✅ 존재 |

### 1.3 Social Proof

| Wellfound 요소 | aijobx 적용 | 파일 경로 | 상태 |
|----------------|-------------|-----------|------|
| "8M+ Matches Made" | "10,000+ Teachers Placed" | - | ⚠️ 미구현 |
| "1M+ Tech Jobs" | "500+ Partner Schools" | - | ⚠️ 미구현 |
| CountUp animation | AnimatedCounter | `components/animations/animated-counter.tsx` | ⚠️ 미구현 |
| Company logo wall | Partner school logos | - | ⚠️ 미구현 |

### 1.4 Value Proposition

| Wellfound 요소 | aijobx 적용 | 파일 경로 | 상태 |
|----------------|-------------|-----------|------|
| 2-column layout | Teacher benefits / School benefits | - | ⚠️ 미구현 |
| Check list items | Feature 리스트 | - | ⚠️ 미구현 |
| "Learn more" CTA | Feature detail links | - | ⚠️ 미구현 |

### 1.5 AI Feature Section

| Wellfound 요소 | aijobx 적용 | 파일 경로 | 상태 |
|----------------|-------------|-----------|------|
| "Meet Autopilot" | "Meet AI Screener" | - | ⚠️ 미구현 |
| Dashboard preview | AI Screener 결과 미리보기 | - | ⚠️ 미구현 |
| Feature bullet points | AI 기능 리스트 | - | ⚠️ 미구현 |
| Dark purple background | Brand blue gradient | - | ⚠️ 미구현 |

### 1.6 Job Cards

| Wellfound 요소 | aijobx 적용 | 파일 경로 | 상태 |
|----------------|-------------|-----------|------|
| Company logo | School logo placeholder | `components/ui-v2/job-card-v2.tsx` | ✅ 존재 |
| Salary range | USD salary range | `components/ui-v2/job-card-v2.tsx` | ✅ 존재 |
| Save button (heart) | Save to favorites | `components/ui-v2/job-card-v2.tsx` | ✅ 존재 |
| Quick Apply | Quick Apply modal | `components/jobs/JobList.tsx` | ✅ 네비게이션으로 변경 |
| Tags (React, TypeScript) | Tags (ESL, Math, Japan) | `components/ui-v2/job-card-v2.tsx` | ✅ 존재 |
| Visa badge | Visa Sponsored badge | `components/ui-v2/job-card-v2.tsx` | ✅ 존재 |

---

## 2. 파일별 구현 현황

### 존재하는 파일 (✅)

```
components/ui-v2/
├── hero-section.tsx          ✅ 기본 구현됨
├── job-card-v2.tsx           ✅ 기본 구현됨
├── quick-apply-modal.tsx     ✅ 존재 (React Query 이슈로 비활성화)
├── filters-panel.tsx         ✅ 존재
└── ...

components/animations/
├── rotating-text.tsx         ⚠️ 미구현
├── animated-counter.tsx      ⚠️ 미구현
├── floating-tags.tsx         ⚠️ 미구현
└── parallax-tags.tsx         ⚠️ 미구현

components/ui/
├── sheet.tsx                 ✅ 존재
├── dropdown-menu.tsx         ✅ 존재
├── badge.tsx                 ✅ 존재
├── card.tsx                  ✅ 존재
└── button.tsx                ✅ 존재
```

### 새로 만들어야 하는 파일 (⚠️)

```
components/ui-v2/
├── announcement-bar.tsx           # 상단 알림 배너
├── navigation-header-v2.tsx       # 개선된 네비게이션
├── social-proof-section.tsx       # 소셜 프루프 섹션
├── value-proposition-section.tsx  # 가치 제안 섹션
├── ai-feature-section.tsx         # AI 기능 소개 섹션
├── testimonials-section.tsx       # 후기 섹션
├── cta-cards-section.tsx          # Dual CTA 카드
├── featured-banner.tsx            # 피처드 배너
├── content-list.tsx               # 블로그/컬렉션 리스트
├── footer-v2.tsx                  # 개선된 푸터
└── partner-logos.tsx              # 파트너 로고 슬라이더

components/animations/
├── rotating-text.tsx              # 텍스트 회전 애니메이션
├── animated-counter.tsx           # 숫자 카운트업
├── floating-tags.tsx              # 플로팅 태그
├── parallax-container.tsx         # 패럴랙스 컨테이너
└── scroll-reveal.tsx              # 스크롤 시 나타나는 효과

lib/animations/
├── gsap-config.ts                 # GSAP 설정
├── hero-animations.ts             # Hero 섹션 애니메이션
├── count-up.ts                    # CountUp 유틸
└── parallax.ts                    # 패럴랙스 유틸
```

---

## 3. 기술 스택 결정

### 애니메이션 라이브러리 선택

| 옵션 | 장점 | 단점 | 선택 |
|------|------|------|------|
| **GSAP** | 강력, Wellfound 동일 | 번들 크기, 라이센스 | ⭐ 권장 |
| **Framer Motion** | React 친화적, 간단 | 복잡한 애니메이션 한계 | ✅ 이미 설치됨 |
| **CSS Animations** | 번들 크기 없음 | 제어 어려움 | 기본 전환용 |

**결론**: Framer Motion 기반 + 필요시 GSAP 추가

### 설치 필요 패키지

```bash
# 이미 설치됨
framer-motion  ✅

# 추가 설치 필요
npm install gsap                    # 고급 애니메이션
npm install @gsap/react             # GSAP React hooks
npm install split-type              # 텍스트 분할 애니메이션
npm install embla-carousel-react    # 로고/후기 슬라이더
```

---

## 4. 구현 우선순위 스프린트

### Sprint 1 (Week 1): Core Components

**목표**: 홈페이지 핵심 컴포넌트 완성

| Task | 예상 시간 | 담당 |
|------|----------|------|
| `rotating-text.tsx` 구현 | 2h | - |
| `animated-counter.tsx` 구현 | 2h | - |
| `social-proof-section.tsx` 구현 | 4h | - |
| Hero Section에 애니메이션 통합 | 4h | - |
| Navigation 드롭다운 개선 | 4h | - |

### Sprint 2 (Week 2): Value Sections

**목표**: 가치 제안 및 AI 기능 섹션

| Task | 예상 시간 | 담당 |
|------|----------|------|
| `value-proposition-section.tsx` 구현 | 4h | - |
| `ai-feature-section.tsx` 구현 | 6h | - |
| `testimonials-section.tsx` 구현 | 4h | - |
| 홈페이지에 섹션 통합 | 4h | - |

### Sprint 3 (Week 3): Polish & Content

**목표**: 콘텐츠 섹션 및 마무리

| Task | 예상 시간 | 담당 |
|------|----------|------|
| `cta-cards-section.tsx` 구현 | 3h | - |
| `featured-banner.tsx` 구현 | 2h | - |
| `content-list.tsx` 구현 | 4h | - |
| `footer-v2.tsx` 구현 | 4h | - |
| 반응형 테스트 및 수정 | 4h | - |

### Sprint 4 (Week 4): Animation & Testing

**목표**: 애니메이션 최적화 및 테스팅

| Task | 예상 시간 | 담당 |
|------|----------|------|
| GSAP 고급 애니메이션 추가 | 6h | - |
| 성능 최적화 | 4h | - |
| E2E 테스트 작성 | 4h | - |
| 접근성 테스트 | 2h | - |
| 배포 및 모니터링 | 2h | - |

---

## 5. 데이터 흐름

### 홈페이지 데이터 요구사항

```typescript
// app/page.tsx에 필요한 데이터
interface HomePageData {
  // Social Proof
  stats: {
    teachersPlaced: number;      // 10,000+
    partnerSchools: number;      // 500+
    countriesCovered: number;    // 50+
  };

  // Partner Logos
  partners: Array<{
    name: string;
    logo: string;
    href?: string;
  }>;

  // Testimonials
  testimonials: Array<{
    id: string;
    quote: string;
    author: string;
    role: string;
    avatar?: string;
  }>;

  // Featured Jobs (for preview)
  featuredJobs: Array<JobCardData>;

  // Featured Content
  featuredContent: Array<{
    type: 'collection' | 'blog' | 'guide';
    title: string;
    description: string;
    href: string;
  }>;
}
```

### API 엔드포인트

```typescript
// 이미 존재
GET /api/jobs              // 잡 리스트
GET /api/jobs/[id]         // 잡 상세

// 추가 필요
GET /api/stats             // 통계 데이터
GET /api/testimonials      // 후기 데이터
GET /api/partners          // 파트너 데이터
GET /api/featured-content  // 피처드 콘텐츠
```

---

## 6. 컴포넌트 Props 설계

### AnimatedCounter

```typescript
interface AnimatedCounterProps {
  value: number;
  suffix?: string;           // "+" or "K" or "M"
  duration?: number;         // default: 2000ms
  className?: string;
  onComplete?: () => void;
}
```

### RotatingText

```typescript
interface RotatingTextProps {
  texts: string[];
  interval?: number;         // default: 3000ms
  animation?: 'slide' | 'fade' | 'scale';
  className?: string;
}
```

### SocialProofSection

```typescript
interface SocialProofSectionProps {
  stats: Array<{
    value: number;
    suffix?: string;
    label: string;
    icon?: ReactNode;
  }>;
  partners?: Array<{
    name: string;
    logo: string;
    href?: string;
  }>;
  title?: string;            // "Trusted by educators worldwide"
}
```

### ValuePropositionSection

```typescript
interface ValuePropositionSectionProps {
  leftColumn: {
    badge?: string;
    title: string;
    features: Array<{
      title: string;
      description: string;
    }>;
    primaryCTA?: CTAButton;
    secondaryCTA?: CTAButton;
  };
  rightColumn: {
    badge?: string;
    title: string;
    features: Array<{
      title: string;
      description: string;
    }>;
    primaryCTA?: CTAButton;
    secondaryCTA?: CTAButton;
  };
}
```

### AIFeatureSection

```typescript
interface AIFeatureSectionProps {
  badge?: string;
  title: string;
  description: string;
  features: Array<{
    icon?: ReactNode;
    text: string;
  }>;
  cta: CTAButton;
  preview?: ReactNode;       // Dashboard preview component
  variant?: 'blue' | 'purple' | 'gradient';
}
```

### TestimonialsSection

```typescript
interface TestimonialsSectionProps {
  title?: string;
  testimonials: Array<{
    id: string;
    quote: string;
    author?: string;
    role?: string;
    avatar?: string;
    rating?: number;
  }>;
  variant?: 'cards' | 'carousel';
}
```

---

## 7. 스타일 가이드

### Tailwind 확장 설정

```javascript
// tailwind.config.js 추가 설정
module.exports = {
  theme: {
    extend: {
      colors: {
        // Wellfound-inspired colors
        'wellfound-purple': '#2D1B54',
        'wellfound-pink': '#FFE4E1',
        'wellfound-amber': '#FFF8E7',

        // aijobx brand
        'brand-primary': '#1E40AF',
        'brand-secondary': '#059669',
        'brand-accent': '#F59E0B',
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'slide-up': 'slideUp 0.5s ease-out',
        'fade-in': 'fadeIn 0.5s ease-out',
        'count-up': 'countUp 2s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
};
```

---

## 8. 테스트 계획

### Unit Tests

```typescript
// tests/components/animated-counter.test.tsx
describe('AnimatedCounter', () => {
  it('should animate from 0 to target value', async () => {
    render(<AnimatedCounter value={1000} suffix="+" />);
    // Initial value
    expect(screen.getByText('0+')).toBeInTheDocument();
    // After animation
    await waitFor(() => {
      expect(screen.getByText('1,000+')).toBeInTheDocument();
    }, { timeout: 3000 });
  });
});

// tests/components/rotating-text.test.tsx
describe('RotatingText', () => {
  it('should rotate through texts', async () => {
    const texts = ['Text 1', 'Text 2', 'Text 3'];
    render(<RotatingText texts={texts} interval={1000} />);

    expect(screen.getByText('Text 1')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Text 2')).toBeInTheDocument();
    }, { timeout: 1500 });
  });
});
```

### E2E Tests

```typescript
// tests/e2e/homepage.spec.ts
test('homepage loads with all sections', async ({ page }) => {
  await page.goto('/');

  // Hero section
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

  // Social proof
  await expect(page.getByText(/Teachers Placed/)).toBeVisible();

  // Value proposition
  await expect(page.getByText(/For Teachers/)).toBeVisible();
  await expect(page.getByText(/For Schools/)).toBeVisible();

  // CTA buttons work
  await page.getByRole('button', { name: /Find Teaching Jobs/ }).click();
  await expect(page).toHaveURL('/jobs');
});
```

---

## 다음 단계

1. [ ] Sprint 1 시작: `rotating-text.tsx` 구현
2. [ ] GSAP 또는 Framer Motion 최종 선택
3. [ ] 홈페이지 데이터 API 구현
4. [ ] 디자인 리뷰 미팅 설정

---

**문서 버전**: 1.0
**작성일**: 2025-11-26
**다음 리뷰**: 구현 시작 후 주간 업데이트
