# Phase 1 Task 1.3: Mobile Layout Optimization - Architecture

**SPARC Phase:** Architecture (SPARC-A)
**Task ID:** Phase 1.3

---

## 1. System Architecture Diagram

```mermaid
graph TB
    subgraph "Mobile Client Layer"
        A[Browser/PWA] -->|Responsive CSS| B[Viewport Detection]
        B --> C{Screen Size}
        C -->|< 640px| D[Mobile Layout]
        C -->|640-1024px| E[Tablet Layout]
        C -->|> 1024px| F[Desktop Layout]
    end

    subgraph "Component Architecture"
        D --> G[Mobile Navigation]
        D --> H[Card View Components]
        D --> I[Touch-Optimized Forms]

        E --> J[Hybrid Layouts]
        E --> K[Responsive Tables]

        F --> L[Grid Layouts]
        F --> M[Standard Components]
    end

    subgraph "Tailwind Responsive System"
        G --> N[Breakpoint Classes]
        H --> N
        I --> N
        N --> O[Mobile-First CSS]
        O --> P[Progressive Enhancement]
    end
```

---

## 2. Component Hierarchy

```
App Layout
├── ResponsiveHeader
│   ├── Logo (always visible)
│   ├── DesktopNav (hidden md:flex)
│   ├── MobileNav (flex md:hidden)
│   │   └── Sheet (slide-in menu)
│   └── ThemeToggle
│
├── Main Content
│   ├── JobListingPage
│   │   ├── SearchFilters
│   │   │   ├── Desktop: Sidebar
│   │   │   └── Mobile: BottomSheet
│   │   └── JobGrid
│   │       ├── Desktop: grid-cols-3
│   │       └── Mobile: grid-cols-1
│   │
│   ├── ProfileSetupPage
│   │   └── MultiStepForm
│   │       ├── MobileProgress (sticky top)
│   │       ├── FormStep (scrollable)
│   │       └── MobileNav (sticky bottom)
│   │
│   └── DashboardPage
│       ├── Stats Cards
│       │   ├── Desktop: grid-cols-4
│       │   └── Mobile: grid-cols-2
│       └── DataTable
│           ├── Desktop: <Table />
│           └── Mobile: <CardList />
│
└── ResponsiveFooter
```

---

## 3. Breakpoint Strategy

| Breakpoint | Width | Target Device | Layout Strategy |
|------------|-------|---------------|----------------|
| **xs** (default) | 0px - 639px | Mobile phones | Single column, stacked, full-width |
| **sm** | 640px - 767px | Large phones, small tablets | 2-column grids, compact spacing |
| **md** | 768px - 1023px | Tablets, small laptops | 2-3 column grids, side navigation |
| **lg** | 1024px - 1279px | Laptops, desktops | 3-4 column grids, full feature set |
| **xl** | 1280px+ | Large desktops | 4+ columns, maximum content width |

**Implementation:**
```css
/* Mobile-first approach */
.container {
  @apply p-4;           /* Base: 16px padding */
  @apply md:p-6;        /* Tablet: 24px */
  @apply lg:p-8;        /* Desktop: 32px */
}
```

---

## 4. Touch Target Architecture

```mermaid
graph LR
    A[User Touch] --> B{Target Size}
    B -->|< 44px| C[❌ Fail WCAG]
    B -->|≥ 44px| D[✅ Pass WCAG]

    D --> E{Touch Area}
    E --> F[Visual Size: 36px]
    E --> G[Touch Area: 44px via padding]

    style C fill:#f96
    style D fill:#9f6
```

**Touch Target Guidelines:**
- Minimum: 44x44px (WCAG 2.1 AA)
- Comfortable: 48x48px
- Large: 56x56px (primary actions)

---

## 5. Navigation Architecture

### Desktop Navigation
```
+--------------------------------------------------+
| Logo | Find Jobs | Schools | Sign In | Theme    |
+--------------------------------------------------+
```

### Mobile Navigation
```
+--------------------------------+
| Logo              | [☰] [🌓]   |
+--------------------------------+

When hamburger clicked:
┌─────────────────┐
│ ✕  Menu         │
│                 │
│ 🏠 Home         │
│ 💼 Find Jobs    │
│ 🏫 Schools      │
│ 👤 Profile      │
│ ⚙️  Settings     │
│                 │
└─────────────────┘
```

---

## 6. Form Layout Patterns

### Multi-Step Form (Mobile)
```
┌─────────────────────────────┐
│ Step 2 of 5      [40%] ●●○○○ │ ← Sticky progress
├─────────────────────────────┤
│                             │
│   [Scrollable Form Content] │
│                             │
│                             │
├─────────────────────────────┤
│ [ Back ]      [   Next →  ] │ ← Sticky footer
└─────────────────────────────┘
```

### Desktop Form
```
┌──────────────────────┬──────────┐
│                      │          │
│  Form Fields         │ Progress │
│  (2-column grid)     │ Sidebar  │
│                      │          │
│                      │          │
│  [Submit Button]     │          │
└──────────────────────┴──────────┘
```

---

## 7. Data Table Strategies

### Option 1: Horizontal Scroll (Simple)
```typescript
<div className="overflow-x-auto">
  <Table className="min-w-[600px]">
    {/* Standard table */}
  </Table>
</div>
```

### Option 2: Card View (Recommended)
```typescript
// Desktop: Table
// Mobile: Card list with key-value pairs

{isMobile ? (
  <div className="space-y-4">
    {data.map(row => <DataCard key={row.id} data={row} />)}
  </div>
) : (
  <Table>{/* Standard table */}</Table>
)}
```

---

## 8. Modal/Dialog Behavior

```mermaid
stateDiagram-v2
    [*] --> Closed
    Closed --> Opening: User clicks trigger
    Opening --> Mobile: viewport < 640px
    Opening --> Desktop: viewport ≥ 640px

    Mobile --> FullScreen: w-screen h-screen
    Desktop --> Centered: max-w-2xl

    FullScreen --> Closing: User closes
    Centered --> Closing: User closes
    Closing --> Closed
    Closed --> [*]
```

**Mobile Modal:**
- Full screen (100vw x 100vh)
- Sticky header with close button
- Scrollable body
- Optional sticky footer for actions

**Desktop Modal:**
- Centered with max-width
- Semi-transparent backdrop
- Standard dialog behavior

---

## 9. Image Responsiveness

```mermaid
graph LR
    A[Image Upload] --> B[Next.js Image Optimizer]
    B --> C{Device Type}
    C -->|Mobile| D[Small: 640w]
    C -->|Tablet| E[Medium: 1024w]
    C -->|Desktop| F[Large: 1920w]

    D --> G[WebP/AVIF]
    E --> G
    F --> G

    G --> H[Lazy Loading]
    H --> I[User Viewport]
```

**Implementation:**
```tsx
<Image
  src="/image.jpg"
  alt="Description"
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
  fill
  className="object-cover"
/>
```

---

## 10. Performance Architecture

### Critical Rendering Path (Mobile)
```
1. HTML (5KB) - First paint
2. Critical CSS (inline, 14KB) - Styled render
3. Hydration JS (split chunks)
4. Non-critical assets (lazy loaded)
```

### Bundle Splitting Strategy
```
Main bundle:
  - Core navigation
  - Layout components
  - Critical UI

Route bundles:
  - /jobs -> job-listing.chunk.js
  - /profile -> profile.chunk.js
  - /dashboard -> dashboard.chunk.js

Mobile-specific bundles:
  - mobile-navigation.chunk.js (lazy)
  - touch-gestures.chunk.js (lazy)
```

---

## 11. Testing Architecture

```mermaid
graph TB
    A[CI/CD Pipeline] --> B{Test Types}

    B --> C[Unit Tests]
    C --> C1[Component rendering]
    C --> C2[Breakpoint logic]
    C --> C3[Touch handlers]

    B --> D[Visual Regression]
    D --> D1[Mobile 375px]
    D --> D2[Tablet 768px]
    D --> D3[Desktop 1280px]

    B --> E[E2E Tests]
    E --> E1[Mobile navigation]
    E --> E2[Form submission]
    E --> E3[Touch interactions]

    B --> F[Accessibility]
    F --> F1[Touch target sizes]
    F --> F2[Screen reader]
    F --> F3[Keyboard nav]
```

---

## 12. Decision Records (ADRs)

### ADR-001: Mobile-First Approach
**Status:** ✅ Accepted
**Context:** Need to support mobile devices as primary target
**Decision:** Use mobile-first CSS with progressive enhancement
**Consequences:**
- ✅ Better mobile performance (default styles are mobile)
- ✅ Simpler media queries (adding features vs removing)
- ⚠️ Requires discipline to avoid desktop-first thinking

### ADR-002: Sheet Component for Mobile Menu
**Status:** ✅ Accepted
**Context:** Need accessible, animated mobile navigation
**Decision:** Use Radix UI Sheet component from shadcn/ui
**Consequences:**
- ✅ Accessibility built-in (focus management, ARIA)
- ✅ Smooth animations
- ✅ Prevents body scroll when open
- ⚪ Adds 5KB to bundle (acceptable)

### ADR-003: Card View for Mobile Tables
**Status:** ✅ Accepted
**Context:** Tables are difficult to read on mobile
**Decision:** Render tables as card lists on mobile (<768px)
**Consequences:**
- ✅ Better UX for mobile users
- ✅ Maintains all data visibility
- ⚠️ Requires dual rendering logic
- ⚠️ Slightly larger component code

---

**Document Status:** ✅ APPROVED
**Next Phase:** SPARC-R (Refinement/Implementation)
