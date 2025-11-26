# Wellfound Job Details Page - Benchmark Specification

> 철저한 벤치마크 분석: Wellfound의 Job Details 페이지 UI/UX를 분석하여 Global Educator Nexus의 구직 상세 페이지 업그레이드 계획 수립

---

## 1. 페이지 레이아웃 구조

### 1.1 전체 구조
```
┌─────────────────────────────────────────────────────────────┐
│ Navigation Bar                                              │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Company Header                                          │ │
│ │ [Logo] [Company Name] [Actively Hiring Badge]           │ │
│ │                                    [Save] [Apply Now]   │ │
│ └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Job Title Header                                        │ │
│ │ Senior Software Engineer                                │ │
│ │ $150K – $200K • 0.2% – 0.5% • San Francisco             │ │
│ │ 5 years exp • Full Time                                 │ │
│ └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Info Grid (6 columns)                                   │ │
│ │ [Remote] [Policy] [Location] [Visa] [Relocation] [Skills]│
│ └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ About the job                                           │ │
│ │ ┌─────────────────┐ ┌─────────────┐ ┌─────────────────┐ │ │
│ │ │ Responsibilities│ │ Requirements│ │ Benefits        │ │ │
│ │ │ • Item 1       │ │ • Item 1    │ │ • Item 1        │ │ │
│ │ │ • Item 2       │ │ • Item 2    │ │ • Item 2        │ │ │
│ │ └─────────────────┘ └─────────────┘ └─────────────────┘ │ │
│ └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ About the company                                       │ │
│ │ [Company Card with stats and description]               │ │
│ └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Similar Jobs (3x3 Grid)                                 │ │
│ │ [Job Card] [Job Card] [Job Card]                        │ │
│ │ [Job Card] [Job Card] [Job Card]                        │ │
│ │ [Job Card] [Job Card] [Job Card]                        │ │
│ └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ Footer                                                      │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 반응형 레이아웃
- **Desktop (1200px+)**: 최대 너비 960px, 중앙 정렬
- **Tablet (768px-1199px)**: 좌우 패딩 24px
- **Mobile (<768px)**: 좌우 패딩 16px, 단일 열 레이아웃

---

## 2. Company Header 섹션

### 2.1 구성 요소
```
┌──────────────────────────────────────────────────────────────┐
│ [Company Logo]  Company Name                                 │
│ 64x64px         Actively Hiring Badge                        │
│ rounded-lg                                    [Save] [Apply] │
└──────────────────────────────────────────────────────────────┘
```

### 2.2 상세 스펙

#### Company Logo
- **크기**: 64x64px
- **모서리**: rounded-lg (8px)
- **배경**: 회사 브랜드 컬러 또는 기본 그라데이션
- **Fallback**: 회사명 이니셜

#### Company Name
- **폰트**: Inter Bold, 20px
- **색상**: #1a1a1a (다크모드: #ffffff)
- **클릭시**: 회사 프로필 페이지로 이동

#### Actively Hiring Badge
- **배경**: #dcfce7 (연한 초록)
- **텍스트**: #166534 (진한 초록), 12px, Semi-bold
- **아이콘**: 녹색 점 (8px, 애니메이션 pulse)
- **모서리**: rounded-full

#### Action Buttons
```tsx
// Save Button
<Button variant="outline" size="sm" className="gap-2">
  <BookmarkIcon className="w-4 h-4" />
  Save
</Button>

// Apply Button
<Button size="sm" className="bg-black text-white hover:bg-gray-800">
  Apply
</Button>
```

### 2.3 구현 코드
```tsx
interface CompanyHeaderProps {
  company: {
    id: string;
    name: string;
    logo?: string;
    isActivelyHiring: boolean;
  };
  onSave: () => void;
  onApply: () => void;
  isSaved: boolean;
}

export function CompanyHeader({ company, onSave, onApply, isSaved }: CompanyHeaderProps) {
  return (
    <div className="flex items-center justify-between py-6 border-b">
      <div className="flex items-center gap-4">
        {/* Company Logo */}
        <div className="w-16 h-16 rounded-lg overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
          {company.logo ? (
            <Image src={company.logo} alt={company.name} width={64} height={64} />
          ) : (
            <span className="text-2xl font-bold text-white">
              {company.name.charAt(0)}
            </span>
          )}
        </div>

        {/* Company Info */}
        <div>
          <Link href={`/schools/${company.id}`} className="hover:underline">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {company.name}
            </h2>
          </Link>

          {company.isActivelyHiring && (
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-green-100 text-green-800 text-xs font-medium rounded-full mt-1">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Actively Hiring
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={onSave}
          className={cn(
            "gap-2",
            isSaved && "bg-gray-100 border-gray-300"
          )}
        >
          <BookmarkIcon className={cn("w-4 h-4", isSaved && "fill-current")} />
          {isSaved ? 'Saved' : 'Save'}
        </Button>

        <Button
          size="sm"
          onClick={onApply}
          className="bg-black text-white hover:bg-gray-800"
        >
          Apply
        </Button>
      </div>
    </div>
  );
}
```

---

## 3. Job Title 헤더 섹션

### 3.1 구성 요소
```
┌──────────────────────────────────────────────────────────────┐
│ Senior Software Engineer                                      │
│ $150K – $200K  •  0.2% – 0.5%  •  San Francisco              │
│ 5 years of exp required  •  Full Time                        │
└──────────────────────────────────────────────────────────────┘
```

### 3.2 상세 스펙

#### Job Title
- **폰트**: Inter Bold, 32px
- **색상**: #1a1a1a
- **마진**: 하단 8px

#### Compensation Line
- **구분자**: • (가운데 점)
- **폰트**: Inter Medium, 16px
- **색상**: #4b5563

| 항목 | 포맷 | 예시 |
|------|------|------|
| Salary Range | `$XXK – $XXXK` | `$150K – $200K` |
| Equity | `X.X% – X.X%` | `0.2% – 0.5%` |
| Location | City name | `San Francisco` |

#### Requirements Line
- **폰트**: Inter Regular, 14px
- **색상**: #6b7280

| 항목 | 포맷 | 예시 |
|------|------|------|
| Experience | `X years of exp required` | `5 years of exp required` |
| Employment Type | Badge 스타일 | `Full Time` |

### 3.3 구현 코드
```tsx
interface JobTitleHeaderProps {
  title: string;
  salary: {
    min: number;
    max: number;
    currency: string;
  };
  equity?: {
    min: number;
    max: number;
  };
  location: string;
  experienceYears: number;
  employmentType: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT';
}

export function JobTitleHeader({
  title,
  salary,
  equity,
  location,
  experienceYears,
  employmentType
}: JobTitleHeaderProps) {
  const formatSalary = (amount: number) => {
    if (amount >= 1000) {
      return `$${Math.round(amount / 1000)}K`;
    }
    return `$${amount}`;
  };

  const formatEmploymentType = (type: string) => {
    return type.replace('_', ' ').toLowerCase()
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="py-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
        {title}
      </h1>

      {/* Compensation & Location */}
      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-2">
        <span className="font-medium">
          {formatSalary(salary.min)} – {formatSalary(salary.max)}
        </span>

        {equity && (
          <>
            <span className="text-gray-400">•</span>
            <span>{equity.min}% – {equity.max}%</span>
          </>
        )}

        <span className="text-gray-400">•</span>
        <span className="flex items-center gap-1">
          <MapPinIcon className="w-4 h-4" />
          {location}
        </span>
      </div>

      {/* Requirements */}
      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        <span>{experienceYears} years of exp required</span>
        <span className="text-gray-400">•</span>
        <Badge variant="secondary" className="font-medium">
          {formatEmploymentType(employmentType)}
        </Badge>
      </div>
    </div>
  );
}
```

---

## 4. Job Info Grid 섹션

### 4.1 구성 요소 (6열 그리드)
```
┌─────────┬─────────────┬───────────┬────────────┬────────────┬─────────┐
│ HIRES   │ REMOTE WORK │ COMPANY   │ VISA       │ RELOCATION │ SKILLS  │
│ REMOTELY│ POLICY      │ LOCATION  │ SPONSORSHIP│            │         │
├─────────┼─────────────┼───────────┼────────────┼────────────┼─────────┤
│ Yes / No│ Onsite /    │ City,     │ Yes / No   │ Assistance │ Tag1    │
│ In [loc]│ Remote / etc│ Country   │            │ Available  │ Tag2... │
└─────────┴─────────────┴───────────┴────────────┴────────────┴─────────┘
```

### 4.2 상세 스펙

#### 그리드 레이아웃
- **Desktop**: 6열 균등 분할
- **Tablet**: 3열 x 2행
- **Mobile**: 2열 x 3행

#### 각 항목 스타일
```tsx
interface InfoGridItemProps {
  label: string;        // 상단 라벨 (회색, 대문자)
  value: string;        // 메인 값 (검정, 볼드)
  subValue?: string;    // 서브 값 (옵션)
  tags?: string[];      // 태그 리스트 (Skills용)
}
```

| 요소 | 스타일 |
|------|--------|
| Label | 10px, uppercase, #9ca3af, letter-spacing: 0.05em |
| Value | 14px, font-semibold, #1a1a1a |
| SubValue | 12px, #6b7280 |
| Tags | 12px, bg-gray-100, rounded-md, px-2, py-0.5 |

### 4.3 교육 플랫폼 적용

Wellfound의 Tech 중심 항목을 교육 플랫폼에 맞게 수정:

| Wellfound | Global Educator Nexus |
|-----------|----------------------|
| Hires Remotely | Contract Duration |
| Remote Work Policy | Work Schedule |
| Company Location | School Location |
| Visa Sponsorship | Visa Sponsorship |
| Relocation | Relocation Support |
| Skills | Subject Areas |

### 4.4 구현 코드
```tsx
interface JobInfoGridProps {
  contractLength?: number;
  workSchedule: string;
  location: {
    city: string;
    country: string;
  };
  visaSponsorship: boolean;
  relocationSupport: boolean;
  subjects: string[];
  housingProvided: boolean;
  flightProvided: boolean;
}

export function JobInfoGrid({
  contractLength,
  workSchedule,
  location,
  visaSponsorship,
  relocationSupport,
  subjects,
  housingProvided,
  flightProvided
}: JobInfoGridProps) {
  const gridItems = [
    {
      label: 'CONTRACT',
      value: contractLength ? `${contractLength} months` : 'Ongoing',
      icon: CalendarIcon
    },
    {
      label: 'SCHEDULE',
      value: workSchedule,
      icon: ClockIcon
    },
    {
      label: 'LOCATION',
      value: `${location.city}, ${location.country}`,
      icon: MapPinIcon
    },
    {
      label: 'VISA',
      value: visaSponsorship ? 'Sponsorship Available' : 'Not Provided',
      icon: DocumentIcon,
      highlight: visaSponsorship
    },
    {
      label: 'BENEFITS',
      value: [
        housingProvided && 'Housing',
        flightProvided && 'Flights',
        relocationSupport && 'Relocation'
      ].filter(Boolean).join(', ') || 'Standard',
      icon: GiftIcon
    },
    {
      label: 'SUBJECTS',
      tags: subjects,
      icon: BookOpenIcon
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 py-6 border-y border-gray-200 dark:border-gray-800">
      {gridItems.map((item, index) => (
        <div key={index} className="space-y-1">
          <p className="text-[10px] uppercase tracking-wide text-gray-400 font-medium">
            {item.label}
          </p>

          {item.tags ? (
            <div className="flex flex-wrap gap-1">
              {item.tags.slice(0, 3).map((tag, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs rounded-md"
                >
                  {tag}
                </span>
              ))}
              {item.tags.length > 3 && (
                <span className="px-2 py-0.5 text-gray-400 text-xs">
                  +{item.tags.length - 3}
                </span>
              )}
            </div>
          ) : (
            <p className={cn(
              "text-sm font-semibold text-gray-900 dark:text-white",
              item.highlight && "text-green-600 dark:text-green-400"
            )}>
              {item.value}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
```

---

## 5. "About the Job" 섹션

### 5.1 구성 요소 (3열 레이아웃)
```
┌────────────────────────────────────────────────────────────────┐
│ About the job                                                  │
├────────────────┬────────────────┬────────────────────────────┤
│ Responsibilities│ Requirements   │ Benefits                   │
├────────────────┼────────────────┼────────────────────────────┤
│ • Design APIs  │ • 5+ years exp │ • Competitive salary       │
│ • Build systems│ • React/Node   │ • Health insurance         │
│ • Collaborate  │ • AWS/GCP      │ • Flexible PTO             │
│ • Mentor       │ • Communication│ • Remote work              │
└────────────────┴────────────────┴────────────────────────────┘
```

### 5.2 상세 스펙

#### 섹션 타이틀
- **폰트**: Inter Bold, 24px
- **색상**: #1a1a1a
- **마진**: 하단 24px

#### 서브 헤더
- **폰트**: Inter Semi-bold, 16px
- **색상**: #374151
- **마진**: 하단 12px

#### 리스트 항목
- **스타일**: 커스텀 불릿 (• 또는 체크마크)
- **폰트**: Inter Regular, 14px
- **색상**: #4b5563
- **줄 높이**: 1.75
- **항목 간격**: 8px

### 5.3 교육 플랫폼 적용

| 섹션 | 교육 플랫폼 내용 |
|------|-----------------|
| Responsibilities | Teaching duties, class sizes, curriculum responsibilities |
| Requirements | Certifications, degree, experience, language requirements |
| Benefits | Housing, flights, insurance, vacation days, bonuses |

### 5.4 구현 코드
```tsx
interface AboutJobSectionProps {
  responsibilities: string[];
  requirements: string[];
  benefits: string[];
  fullDescription?: string;
}

export function AboutJobSection({
  responsibilities,
  requirements,
  benefits,
  fullDescription
}: AboutJobSectionProps) {
  return (
    <section className="py-8">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        About the job
      </h2>

      {/* Full description if available */}
      {fullDescription && (
        <div
          className="prose prose-gray dark:prose-invert max-w-none mb-8"
          dangerouslySetInnerHTML={{ __html: fullDescription }}
        />
      )}

      {/* Three-column grid */}
      <div className="grid md:grid-cols-3 gap-8">
        {/* Responsibilities */}
        <div>
          <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-4">
            Responsibilities
          </h3>
          <ul className="space-y-2">
            {responsibilities.map((item, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                <span className="text-gray-400 mt-1">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Requirements */}
        <div>
          <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-4">
            Requirements
          </h3>
          <ul className="space-y-2">
            {requirements.map((item, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                <span className="text-gray-400 mt-1">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Benefits */}
        <div>
          <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-4">
            Benefits
          </h3>
          <ul className="space-y-2">
            {benefits.map((item, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                <CheckCircleIcon className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
```

---

## 6. "About the Company" 섹션

### 6.1 구성 요소
```
┌────────────────────────────────────────────────────────────────┐
│ About [Company Name]                                           │
├────────────────────────────────────────────────────────────────┤
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ [Logo]  Company Name                          [Website →]  │ │
│ │         Founded Year • Location • Industry                 │ │
│ │                                                            │ │
│ │ Company description text goes here. This is a brief        │ │
│ │ overview of what the company does...                       │ │
│ │                                                            │ │
│ │ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │ │
│ │ │ 50-100   │ │ Series B │ │ $50M     │ │ 4.5/5    │       │ │
│ │ │ Employees│ │ Funding  │ │ Revenue  │ │ Rating   │       │ │
│ │ └──────────┘ └──────────┘ └──────────┘ └──────────┘       │ │
│ └────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────┘
```

### 6.2 상세 스펙

#### 카드 스타일
- **배경**: #ffffff (다크모드: #1f2937)
- **테두리**: 1px solid #e5e7eb
- **모서리**: rounded-xl (12px)
- **패딩**: 24px
- **그림자**: shadow-sm

#### 회사 정보 그리드
| 항목 | 교육 플랫폼 적용 |
|------|-----------------|
| Employees | Number of Teachers |
| Funding | Accreditation |
| Revenue | Student Population |
| Rating | Teacher Satisfaction |

### 6.3 구현 코드
```tsx
interface AboutCompanyProps {
  company: {
    id: string;
    name: string;
    logo?: string;
    website?: string;
    foundedYear?: number;
    location: string;
    description?: string;
    accreditation?: string[];
    studentCount?: number;
    teacherCount?: number;
    rating?: number;
    reviewCount?: number;
  };
}

export function AboutCompanySection({ company }: AboutCompanyProps) {
  const stats = [
    {
      label: 'Teachers',
      value: company.teacherCount ? `${company.teacherCount}+` : 'N/A'
    },
    {
      label: 'Students',
      value: company.studentCount
        ? company.studentCount.toLocaleString()
        : 'N/A'
    },
    {
      label: 'Accreditation',
      value: company.accreditation?.[0] || 'Pending'
    },
    {
      label: 'Rating',
      value: company.rating
        ? `${company.rating.toFixed(1)}/5`
        : 'New'
    }
  ];

  return (
    <section className="py-8">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        About {company.name}
      </h2>

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            {/* Logo */}
            <div className="w-12 h-12 rounded-lg overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              {company.logo ? (
                <Image src={company.logo} alt={company.name} width={48} height={48} />
              ) : (
                <span className="text-lg font-bold text-white">
                  {company.name.charAt(0)}
                </span>
              )}
            </div>

            {/* Info */}
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {company.name}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {company.foundedYear && `Est. ${company.foundedYear}`}
                {company.foundedYear && company.location && ' • '}
                {company.location}
              </p>
            </div>
          </div>

          {/* Website Link */}
          {company.website && (
            <a
              href={company.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1"
            >
              Website
              <ExternalLinkIcon className="w-3 h-3" />
            </a>
          )}
        </div>

        {/* Description */}
        {company.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 line-clamp-3">
            {company.description}
          </p>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-4 pt-4 border-t border-gray-100 dark:border-gray-800">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {stat.value}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

---

## 7. Similar Jobs 섹션

### 7.1 구성 요소 (3x3 그리드)
```
┌──────────────────────────────────────────────────────────────┐
│ Similar Jobs                                                  │
├──────────────────┬──────────────────┬──────────────────────┤
│ ┌──────────────┐ │ ┌──────────────┐ │ ┌──────────────────┐ │
│ │ [Logo]       │ │ │ [Logo]       │ │ │ [Logo]           │ │
│ │ Company A    │ │ │ Company B    │ │ │ Company C        │ │
│ │ Job Title    │ │ │ Job Title    │ │ │ Job Title        │ │
│ │ $XXK • City  │ │ │ $XXK • City  │ │ │ $XXK • City      │ │
│ └──────────────┘ │ └──────────────┘ │ └──────────────────┘ │
├──────────────────┼──────────────────┼──────────────────────┤
│ ┌──────────────┐ │ ┌──────────────┐ │ ┌──────────────────┐ │
│ │ ...          │ │ │ ...          │ │ │ ...              │ │
│ └──────────────┘ │ └──────────────┘ │ └──────────────────┘ │
└──────────────────┴──────────────────┴──────────────────────┘
```

### 7.2 카드 스타일

각 카드는 Wellfound의 컴팩트한 Job Card 스타일:
- **배경**: #ffffff
- **테두리**: 1px solid #e5e7eb
- **호버**: shadow-md, border-gray-300
- **패딩**: 16px
- **높이**: 고정 120px

#### 카드 내용
```tsx
interface SimilarJobCardProps {
  id: string;
  company: {
    name: string;
    logo?: string;
  };
  title: string;
  salary: number;
  location: string;
}
```

### 7.3 구현 코드
```tsx
interface SimilarJobsSectionProps {
  jobs: Array<{
    id: string;
    company: {
      name: string;
      logo?: string;
    };
    title: string;
    salary: number;
    location: string;
  }>;
}

export function SimilarJobsSection({ jobs }: SimilarJobsSectionProps) {
  if (jobs.length === 0) return null;

  return (
    <section className="py-8">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Similar Jobs
      </h2>

      <div className="grid md:grid-cols-3 gap-4">
        {jobs.map((job) => (
          <Link
            key={job.id}
            href={`/jobs/${job.id}`}
            className="group"
          >
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4 h-[120px] flex flex-col transition-all hover:shadow-md hover:border-gray-300 dark:hover:border-gray-700">
              {/* Company */}
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-md overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center flex-shrink-0">
                  {job.company.logo ? (
                    <Image src={job.company.logo} alt="" width={32} height={32} />
                  ) : (
                    <span className="text-xs font-bold text-gray-500">
                      {job.company.name.charAt(0)}
                    </span>
                  )}
                </div>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400 truncate">
                  {job.company.name}
                </span>
              </div>

              {/* Title */}
              <h3 className="font-semibold text-gray-900 dark:text-white truncate mb-auto group-hover:text-blue-600">
                {job.title}
              </h3>

              {/* Meta */}
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <span>${Math.round(job.salary / 1000)}K/mo</span>
                <span className="text-gray-300 dark:text-gray-600">•</span>
                <span className="truncate">{job.location}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
```

---

## 8. Sticky Apply Bar (모바일)

### 8.1 구성 요소
```
┌──────────────────────────────────────────────────────────────┐
│ [Salary Range]                               [Apply Now →]   │
│ $3K - $4K/mo                                                 │
└──────────────────────────────────────────────────────────────┘
```

### 8.2 상세 스펙
- **위치**: 하단 고정 (모바일 전용)
- **배경**: #ffffff with backdrop-blur
- **테두리**: 상단 1px solid #e5e7eb
- **패딩**: 16px
- **그림자**: shadow-lg (위쪽 방향)
- **z-index**: 50

### 8.3 구현 코드
```tsx
interface StickyApplyBarProps {
  salary: { min: number; max: number };
  onApply: () => void;
  disabled?: boolean;
}

export function StickyApplyBar({ salary, onApply, disabled }: StickyApplyBarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-gray-950/95 backdrop-blur-sm border-t border-gray-200 dark:border-gray-800 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-50 lg:hidden">
      <div className="flex items-center justify-between max-w-lg mx-auto">
        <div>
          <p className="text-lg font-bold text-gray-900 dark:text-white">
            ${Math.round(salary.min / 1000)}K - ${Math.round(salary.max / 1000)}K
          </p>
          <p className="text-xs text-gray-500">per month</p>
        </div>

        <Button
          size="lg"
          onClick={onApply}
          disabled={disabled}
          className="bg-black text-white hover:bg-gray-800 px-8"
        >
          Apply Now
        </Button>
      </div>
    </div>
  );
}
```

---

## 9. 색상 시스템

### 9.1 라이트 모드
```css
:root {
  /* 배경 */
  --background: #ffffff;
  --background-secondary: #f9fafb;
  --background-tertiary: #f3f4f6;

  /* 텍스트 */
  --text-primary: #1a1a1a;
  --text-secondary: #4b5563;
  --text-tertiary: #6b7280;
  --text-muted: #9ca3af;

  /* 테두리 */
  --border-primary: #e5e7eb;
  --border-secondary: #d1d5db;

  /* 액센트 */
  --accent-green: #22c55e;
  --accent-green-bg: #dcfce7;
  --accent-blue: #3b82f6;
  --accent-blue-bg: #dbeafe;
}
```

### 9.2 다크 모드
```css
.dark {
  /* 배경 */
  --background: #0a0a0a;
  --background-secondary: #111111;
  --background-tertiary: #1a1a1a;

  /* 텍스트 */
  --text-primary: #ffffff;
  --text-secondary: #d1d5db;
  --text-tertiary: #9ca3af;
  --text-muted: #6b7280;

  /* 테두리 */
  --border-primary: #262626;
  --border-secondary: #404040;
}
```

---

## 10. 타이포그래피

### 10.1 폰트 스케일
| 용도 | 크기 | Weight | Line Height |
|------|------|--------|-------------|
| Page Title | 32px | Bold (700) | 1.2 |
| Section Title | 24px | Bold (700) | 1.3 |
| Card Title | 18px | Semi-bold (600) | 1.4 |
| Body | 14px | Regular (400) | 1.6 |
| Small | 12px | Regular (400) | 1.5 |
| Tiny (Labels) | 10px | Medium (500) | 1.4 |

### 10.2 폰트 패밀리
```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
```

---

## 11. 애니메이션

### 11.1 호버 트랜지션
```css
.card-hover {
  transition: all 0.2s ease;
}

.card-hover:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}
```

### 11.2 버튼 트랜지션
```css
.btn-transition {
  transition: all 0.15s ease;
}

.btn-transition:hover {
  transform: scale(1.02);
}

.btn-transition:active {
  transform: scale(0.98);
}
```

### 11.3 페이지 로드 애니메이션
```tsx
// Framer Motion variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};
```

---

## 12. 구현 계획

### Phase 1: 핵심 컴포넌트 (1단계)
1. ✅ `CompanyHeader` - 회사 정보 + Save/Apply 버튼
2. ✅ `JobTitleHeader` - 직무명, 급여, 위치, 경력 요건
3. ✅ `JobInfoGrid` - 6열 정보 그리드

### Phase 2: 상세 정보 섹션 (2단계)
4. ✅ `AboutJobSection` - Responsibilities/Requirements/Benefits
5. ✅ `AboutCompanySection` - 회사 정보 카드

### Phase 3: 추가 기능 (3단계)
6. ✅ `SimilarJobsGrid` - 3x3 유사 공고 그리드
7. ✅ `StickyApplyBar` - 모바일 하단 고정 바

### Phase 4: 통합 및 최적화 (4단계)
8. 페이지 레이아웃 통합
9. 반응형 테스트
10. 애니메이션 추가
11. 다크모드 테스트
12. 성능 최적화

---

## 13. 파일 구조

```
components/
└── job-details/
    ├── index.ts                    # Export barrel
    ├── company-header.tsx          # CompanyHeader
    ├── job-title-header.tsx        # JobTitleHeader
    ├── job-info-grid.tsx           # JobInfoGrid
    ├── about-job-section.tsx       # AboutJobSection
    ├── about-company-section.tsx   # AboutCompanySection
    ├── similar-jobs-grid.tsx       # SimilarJobsGrid
    └── sticky-apply-bar.tsx        # StickyApplyBar

app/jobs/[id]/
├── page.tsx                        # Server component
├── JobDetailClient.tsx             # Client component (updated)
└── apply/
    └── page.tsx                    # Apply form page
```

---

## 14. 현재 구현 vs 목표 비교

| 요소 | 현재 구현 | Wellfound 벤치마크 | 변경 필요 |
|------|----------|-------------------|----------|
| Company Header | 단순 텍스트 | 로고 + Badge + Actions | ✅ 전면 개편 |
| Job Title | Card 내부 | 독립 섹션 + 급여 강조 | ✅ 분리 |
| Info Grid | 없음 | 6열 그리드 | ✅ 신규 추가 |
| About Job | 단일 Card | 3열 구분 레이아웃 | ✅ 구조 변경 |
| About Company | 없음 | 카드 + 통계 | ✅ 신규 추가 |
| Similar Jobs | 3열 단일행 | 3열 다중행 | ⚠️ 확장 |
| Sticky Apply | 없음 | 모바일 하단 고정 | ✅ 신규 추가 |
| 전체 레이아웃 | Card 기반 | 섹션 기반 플랫 | ✅ 개편 |

---

## 15. 결론

이 벤치마크 문서는 Wellfound의 Job Details 페이지를 철저히 분석하여 Global Educator Nexus에 적용할 수 있는 구체적인 구현 계획을 제시합니다.

핵심 개선 사항:
1. **시각적 계층 구조 개선**: Card 기반에서 섹션 기반 레이아웃으로 전환
2. **정보 밀도 최적화**: 6열 그리드를 통한 핵심 정보 일목요연하게 표시
3. **사용자 경험 향상**: Sticky Apply Bar, 개선된 Similar Jobs 섹션
4. **회사 정보 강화**: About Company 섹션 추가로 학교 신뢰도 향상

다음 단계로 이 문서를 바탕으로 실제 컴포넌트를 구현하고, 기존 `JobDetailClient.tsx`를 리팩터링할 예정입니다.
