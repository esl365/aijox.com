# Phase 1 - Task 1.2: Dark Mode & Theming - Specification (SPARC-S)

**Project**: Global Educator Nexus
**Task**: Dark Mode & Theming Implementation
**Phase**: Phase 1 - Foundation Strengthening
**Methodology**: SPARC (Specification → Pseudocode → Architecture → Refinement → Completion)
**Document Version**: 1.0
**Date**: 2025-11-23

---

## 1. Executive Summary

This specification defines the implementation of a comprehensive dark mode and theming system for Global Educator Nexus. The system will provide users with a seamless, accessible, and visually appealing dark theme that respects system preferences while allowing manual override.

### Business Context

Modern web applications must support dark mode to:
- **Reduce eye strain** for users working in low-light environments
- **Improve accessibility** for users with light sensitivity
- **Enhance battery life** on OLED/AMOLED mobile devices
- **Meet user expectations** (dark mode is now standard in professional apps)
- **Increase engagement** by providing a comfortable viewing experience 24/7

### Success Criteria

| Metric | Target | Measurement |
|--------|--------|-------------|
| Dark mode coverage | 100% of UI components | Visual audit |
| System preference detection | Automatic | DevTools testing |
| Theme toggle accessibility | WCAG 2.1 AA compliant | Axe DevTools |
| Color contrast ratio | ≥4.5:1 (normal text) | Contrast checker |
| Theme switch performance | <100ms | Performance profiling |
| User preference persistence | Across sessions | LocalStorage verification |

---

## 2. Objectives

### 2.1 Primary Objectives

1. **Implement next-themes Integration**
   - Install and configure `next-themes` package
   - Integrate with Next.js 15 App Router
   - Support SSR without flash of unstyled content (FOUC)

2. **Create Comprehensive Dark Theme**
   - Define complete dark mode color palette
   - Ensure WCAG 2.1 AA contrast compliance
   - Support all existing UI components

3. **Build Theme Toggle UI**
   - Accessible toggle component
   - Visual feedback for current theme
   - Support for system/light/dark modes

4. **Audit & Update Existing Components**
   - Add `dark:` variants to all Tailwind classes
   - Update custom components for dark mode compatibility
   - Fix any visual issues in dark mode

### 2.2 Secondary Objectives

1. **Performance Optimization**
   - Minimize theme switching jank
   - Optimize color variable lookups
   - Prevent layout shifts during theme changes

2. **Developer Experience**
   - Document dark mode color system
   - Provide clear guidelines for future components
   - Create reusable dark mode patterns

3. **Analytics Integration**
   - Track theme preference distribution
   - Monitor theme toggle interactions
   - Measure engagement by theme

---

## 3. Functional Requirements

### FR-1: Theme Provider Setup

**Priority**: P0 (Critical)

**Description**: Configure next-themes provider at application root with proper SSR handling.

**Acceptance Criteria**:
- [x] `next-themes` package installed
- [x] `ThemeProvider` wraps application root
- [x] No flash of incorrect theme on page load
- [x] Theme persists in localStorage
- [x] System preference auto-detected

**Technical Details**:
```typescript
// Expected configuration
<ThemeProvider
  attribute="class"
  defaultTheme="system"
  enableSystem={true}
  disableTransitionOnChange={false}
  storageKey="gen-theme"
>
  {children}
</ThemeProvider>
```

### FR-2: Dark Mode Color Palette

**Priority**: P0 (Critical)

**Description**: Define complete color system that works in both light and dark modes.

**Acceptance Criteria**:
- [x] All semantic colors defined (primary, secondary, accent, etc.)
- [x] Background and foreground colors optimized for readability
- [x] Border and muted colors provide sufficient contrast
- [x] Success, warning, error, info colors accessible in dark mode
- [x] Chart and data visualization colors adjusted

**Color Requirements**:
| Color Type | Light Mode | Dark Mode | Contrast Ratio |
|------------|------------|-----------|----------------|
| Background | #FFFFFF | #09090B | N/A |
| Foreground | #09090B | #FAFAFA | ≥7:1 |
| Primary | #3B82F6 | #60A5FA | ≥4.5:1 |
| Muted | #F1F5F9 | #1E293B | ≥4.5:1 |
| Border | #E2E8F0 | #334155 | ≥3:1 |

### FR-3: Theme Toggle Component

**Priority**: P0 (Critical)

**Description**: User-facing control to switch between light, dark, and system themes.

**Acceptance Criteria**:
- [x] Three-state toggle (light / system / dark)
- [x] Visual indicator for current theme
- [x] Keyboard accessible (Tab, Enter, Space)
- [x] Screen reader friendly
- [x] Mobile-friendly touch target (≥44×44px)
- [x] Smooth transition animation

**UI Specifications**:
- Component type: Dropdown menu or segmented control
- Location: Header/navigation bar
- Icons: Sun (light), Moon (dark), Monitor (system)
- Transition: 200ms ease-in-out

### FR-4: Tailwind Dark Mode Variants

**Priority**: P0 (Critical)

**Description**: All Tailwind CSS classes must have `dark:` variants where color is applied.

**Acceptance Criteria**:
- [x] Background colors: `bg-*` → `dark:bg-*`
- [x] Text colors: `text-*` → `dark:text-*`
- [x] Border colors: `border-*` → `dark:border-*`
- [x] Ring colors: `ring-*` → `dark:ring-*`
- [x] Custom components updated
- [x] Third-party component overrides

**Audit Scope**:
```bash
# Components to audit (estimated count)
- app/ routes: ~50 files
- components/: ~80 files
- Total classes to review: ~2000+
```

### FR-5: Component Library Support

**Priority**: P1 (High)

**Description**: Ensure all Radix UI and custom components render correctly in dark mode.

**Acceptance Criteria**:
- [x] shadcn/ui components (Button, Dialog, Dropdown, etc.)
- [x] Form controls (Input, Select, Checkbox, Radio)
- [x] Navigation components (Header, Sidebar, Breadcrumbs)
- [x] Data display (Tables, Cards, Lists)
- [x] Feedback components (Toasts, Alerts, Modals)

### FR-6: System Preference Detection

**Priority**: P1 (High)

**Description**: Automatically detect and apply user's OS-level dark mode preference.

**Acceptance Criteria**:
- [x] Media query `prefers-color-scheme` respected
- [x] Defaults to system preference on first visit
- [x] Updates when system preference changes
- [x] Manual override persists across sessions

**Technical Implementation**:
```javascript
// Media query detection
const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
  ? 'dark'
  : 'light';
```

### FR-7: Accessibility Compliance

**Priority**: P0 (Critical)

**Description**: Dark mode must meet WCAG 2.1 Level AA accessibility standards.

**Acceptance Criteria**:
- [x] Text contrast ratio ≥ 4.5:1 (normal text)
- [x] Large text contrast ratio ≥ 3:1 (18pt+ or 14pt+ bold)
- [x] UI component contrast ratio ≥ 3:1
- [x] Focus indicators visible in both themes
- [x] Color not sole differentiator for information

**Testing Tools**:
- WebAIM Contrast Checker
- Axe DevTools
- Lighthouse Accessibility Audit

### FR-8: Animation & Transitions

**Priority**: P2 (Medium)

**Description**: Smooth, non-jarring transitions when switching themes.

**Acceptance Criteria**:
- [x] Theme switch animated with CSS transitions
- [x] No layout shift during theme change
- [x] Respect `prefers-reduced-motion` setting
- [x] Transition duration: 150-300ms
- [x] Easing function: ease-in-out

**CSS Implementation**:
```css
@media (prefers-reduced-motion: no-preference) {
  :root {
    transition: background-color 200ms ease-in-out,
                color 200ms ease-in-out;
  }
}
```

---

## 4. Non-Functional Requirements

### NFR-1: Performance

**Target**: Theme switch completes in <100ms

**Metrics**:
- First paint after theme change: <50ms
- Total blocking time: <100ms
- Cumulative layout shift: 0

**Optimization Strategies**:
- Use CSS variables for instant color updates
- Avoid JavaScript-heavy theme calculations
- Leverage browser's native `prefers-color-scheme` caching

### NFR-2: Browser Compatibility

**Support Matrix**:
| Browser | Min Version | Market Share |
|---------|-------------|--------------|
| Chrome | 88+ | 65% |
| Safari | 14+ | 20% |
| Firefox | 78+ | 5% |
| Edge | 88+ | 5% |
| Mobile Safari | 14+ | 3% |
| Mobile Chrome | 88+ | 2% |

**Fallback Strategy**:
- Graceful degradation to light mode only for unsupported browsers
- Progressive enhancement for `prefers-color-scheme`

### NFR-3: Maintainability

**Code Quality Standards**:
- Centralized theme configuration
- Documented color token system
- Consistent naming conventions
- TypeScript type safety for theme values

**Documentation Requirements**:
- Color palette reference guide
- Component dark mode checklist
- Troubleshooting guide for common issues

### NFR-4: Bundle Size Impact

**Constraint**: next-themes adds minimal bundle overhead

**Measurements**:
- next-themes package: ~2KB gzipped
- Custom theme logic: <1KB
- Total dark mode overhead: <3KB
- **Acceptable**: Yes (0.3% of typical bundle)

---

## 5. Technical Architecture

### 5.1 Technology Stack

**Primary Library**: `next-themes` v0.4.x

**Rationale**:
| Criteria | next-themes | Alternatives |
|----------|-------------|--------------|
| Next.js 15 compatibility | ✅ Excellent | ❌ Most are outdated |
| SSR support | ✅ Zero FOUC | ⚠️ Some have flashing |
| Bundle size | ✅ 2KB | ❌ 5-10KB+ |
| System preference | ✅ Native | ✅ Most support |
| Active maintenance | ✅ 2025 updates | ❌ Many abandoned |
| TypeScript support | ✅ Full types | ⚠️ Partial |
| Documentation | ✅ Comprehensive | ⚠️ Varies |

**Decision**: ✅ Use `next-themes`

**Alternatives Considered**:
- ❌ Custom implementation - High maintenance burden
- ❌ `theme-ui` - Too opinionated, large bundle
- ❌ `styled-components` theming - Not compatible with Tailwind

### 5.2 Integration Points

**Next.js App Router**:
```
app/
├── layout.tsx          → Wrap with ThemeProvider
├── providers.tsx       → Centralize providers
└── components/
    └── theme-toggle.tsx → UI control
```

**Tailwind CSS**:
```javascript
// tailwind.config.ts
module.exports = {
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        // Custom dark mode colors
      }
    }
  }
}
```

**shadcn/ui Components**:
- Already supports dark mode via CSS variables
- Requires theme-aware color configuration
- Custom components need manual dark mode variants

### 5.3 Color System Design

**Approach**: CSS Custom Properties (Variables)

**Light Mode**:
```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 221.2 83.2% 53.3%;
  /* ... */
}
```

**Dark Mode**:
```css
.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  --primary: 217.2 91.2% 59.8%;
  /* ... */
}
```

**Usage**:
```tsx
<div className="bg-background text-foreground">
  // Automatically adapts to theme
</div>
```

---

## 6. User Flows

### Flow 1: First-Time Visitor

```
User visits site
  ↓
System detects OS theme preference
  ↓
IF OS = dark mode
  → Apply dark theme
ELSE
  → Apply light theme
  ↓
Theme persisted to localStorage
```

### Flow 2: Manual Theme Toggle

```
User clicks theme toggle
  ↓
Dropdown shows: Light | System | Dark
  ↓
User selects "Dark"
  ↓
CSS class "dark" added to <html>
  ↓
All colors transition (200ms)
  ↓
Preference saved to localStorage
  ↓
Analytics event: theme_changed
```

### Flow 3: System Preference Change

```
User changes OS theme (macOS: System Settings)
  ↓
Browser fires 'prefers-color-scheme' event
  ↓
IF user preference = "system"
  → Update app theme to match OS
ELSE
  → Keep manual override
```

---

## 7. Component Audit Checklist

### Priority 1: Core UI (Week 1)

- [ ] **Navigation**
  - [ ] Header/AppBar
  - [ ] Sidebar
  - [ ] Footer
  - [ ] Breadcrumbs
  - [ ] Tabs

- [ ] **Forms**
  - [ ] Input fields
  - [ ] Select dropdowns
  - [ ] Checkboxes
  - [ ] Radio buttons
  - [ ] Textareas
  - [ ] File upload

- [ ] **Buttons**
  - [ ] Primary button
  - [ ] Secondary button
  - [ ] Ghost button
  - [ ] Link button
  - [ ] Icon button

### Priority 2: Content Display (Week 2)

- [ ] **Cards**
  - [ ] Job card
  - [ ] Profile card
  - [ ] Stats card
  - [ ] Feature card

- [ ] **Tables**
  - [ ] Data table
  - [ ] Sortable columns
  - [ ] Pagination

- [ ] **Lists**
  - [ ] Job listings
  - [ ] Application list
  - [ ] Search results

### Priority 3: Feedback & Overlays (Week 2)

- [ ] **Modals/Dialogs**
  - [ ] Confirmation dialog
  - [ ] Form dialog
  - [ ] Alert dialog

- [ ] **Toasts/Alerts**
  - [ ] Success toast
  - [ ] Error toast
  - [ ] Warning toast
  - [ ] Info toast

- [ ] **Loaders**
  - [ ] Spinner
  - [ ] Skeleton screens
  - [ ] Progress bars

---

## 8. Testing Strategy

### 8.1 Visual Regression Testing

**Tool**: Chromatic or Percy (recommended for future)

**Approach**:
1. Capture screenshots of all components in light mode
2. Capture screenshots of all components in dark mode
3. Compare for unintended changes
4. Review contrast ratios programmatically

**Manual Testing Checklist**:
- [ ] All pages render correctly in dark mode
- [ ] No white/light flashes during theme switch
- [ ] Images and icons visible in dark mode
- [ ] Focus states visible and accessible
- [ ] Hover states appropriate for theme

### 8.2 Accessibility Testing

**Automated Tools**:
- Axe DevTools (browser extension)
- Lighthouse Accessibility Audit
- WAVE Web Accessibility Evaluation Tool

**Manual Testing**:
- [ ] Keyboard navigation works in both themes
- [ ] Screen reader announces theme changes
- [ ] Color blindness simulation (Chromatic, Stark)
- [ ] High contrast mode compatibility

### 8.3 Performance Testing

**Metrics to Track**:
```javascript
// Theme switch performance
const startTime = performance.now();
setTheme('dark');
// Measure to next paint
const endTime = performance.mark('theme-switch-complete');
console.log('Theme switch took:', endTime - startTime, 'ms');
```

**Targets**:
- Theme switch: <100ms
- No layout shift (CLS = 0)
- No blocking JavaScript

### 8.4 Cross-Browser Testing

**Testing Matrix**:
| Device | Browser | Versions |
|--------|---------|----------|
| Desktop (Windows) | Chrome | Latest, Latest-1 |
| Desktop (macOS) | Safari | Latest |
| Desktop (Windows) | Edge | Latest |
| Desktop (Linux) | Firefox | Latest |
| Mobile (iOS) | Safari | 14, 15, 16, 17 |
| Mobile (Android) | Chrome | Latest |

---

## 9. Migration Strategy

### Phase 1: Foundation (Day 1-2)

1. Install next-themes
2. Configure ThemeProvider
3. Define color system in Tailwind
4. Create theme toggle component
5. Add to header

### Phase 2: Component Audit (Day 3-7)

1. Audit all components systematically
2. Add `dark:` variants to Tailwind classes
3. Test each component in isolation
4. Fix visual issues

### Phase 3: Page-Level Testing (Day 8-10)

1. Test all major pages in dark mode
2. Fix layout and spacing issues
3. Ensure images/media display correctly
4. Verify forms and interactions

### Phase 4: Polish & Optimization (Day 11-12)

1. Refine color choices for optimal contrast
2. Add smooth transitions
3. Performance optimization
4. Accessibility audit and fixes

### Phase 5: Documentation & Handoff (Day 13-14)

1. Document color system
2. Create dark mode guidelines for devs
3. Add examples to component library
4. Knowledge transfer session

---

## 10. Success Metrics & KPIs

### Quantitative Metrics

| Metric | Baseline | Target | Measurement |
|--------|----------|--------|-------------|
| Dark mode adoption | 0% | 30%+ | Analytics (theme preference) |
| Accessibility score | 90 | 95+ | Lighthouse |
| Theme toggle engagement | N/A | Track clicks | Google Analytics events |
| Performance (theme switch) | N/A | <100ms | Performance API |
| Contrast ratio failures | TBD | 0 | Axe DevTools scan |

### Qualitative Metrics

- [ ] User feedback on dark mode quality
- [ ] Designer approval of color choices
- [ ] Developer ease of adding new dark mode components
- [ ] Stakeholder sign-off on accessibility compliance

---

## 11. Risks & Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **Scope Creep** (auditing 2000+ classes) | High | High | Automated tooling for class detection; prioritize P0/P1 components |
| **Contrast Issues** | Medium | High | Use contrast checker tools; establish color system upfront |
| **Third-Party Components** | Medium | Medium | Test early; override styles if needed; document workarounds |
| **Performance Degradation** | Low | Medium | Benchmark before/after; use CSS variables; avoid JavaScript |
| **Browser Incompatibility** | Low | Low | Progressive enhancement; graceful degradation for old browsers |
| **User Confusion** (theme toggle UI) | Low | Medium | Clear icons; tooltips; user testing |

---

## 12. Dependencies & Assumptions

### Dependencies

**External**:
- `next-themes` package (v0.4.x)
- Existing Tailwind CSS setup
- Next.js 15 App Router

**Internal**:
- Tailwind configuration access
- Root layout modification permissions
- Analytics tracking infrastructure

### Assumptions

1. **Browser Support**: Users on modern browsers (2020+)
2. **Design System**: Current color choices are flexible enough for dark mode
3. **Component Library**: shadcn/ui components already support dark mode theming
4. **User Behavior**: Significant portion of users prefer dark mode
5. **Performance**: CSS variable approach won't cause jank

---

## 13. Future Enhancements (Out of Scope)

### Phase 2 Candidates

1. **Multiple Theme Options**
   - High contrast theme
   - Sepia/warm theme
   - Custom brand themes

2. **Advanced Customization**
   - User-defined color palette
   - Font size preferences
   - Spacing/density controls

3. **Scheduled Theme Switching**
   - Auto dark mode at sunset
   - Time-based theme rules
   - Geolocation-aware switching

4. **Theme Presets**
   - Preset themes for different use cases
   - "Reading mode" with optimized typography
   - "Focus mode" with minimal distractions

---

## 14. Acceptance Criteria Summary

This task is **complete** when:

1. ✅ `next-themes` installed and configured
2. ✅ Theme toggle accessible in header
3. ✅ All UI components render correctly in dark mode
4. ✅ System preference auto-detection working
5. ✅ Manual theme override persists across sessions
6. ✅ WCAG 2.1 AA contrast ratios met
7. ✅ No flash of unstyled content (FOUC)
8. ✅ Theme switch performance <100ms
9. ✅ Documentation complete (color system, guidelines)
10. ✅ Lighthouse accessibility score ≥95

---

## 15. References

### Documentation
- [next-themes GitHub](https://github.com/pacocoursey/next-themes)
- [Tailwind CSS Dark Mode](https://tailwindcss.com/docs/dark-mode)
- [WCAG 2.1 Contrast Guidelines](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)
- [shadcn/ui Theming](https://ui.shadcn.com/docs/theming)

### Tools
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Coolors Palette Generator](https://coolors.co/)
- [Realtime Colors](https://realtimecolors.com/)
- [Accessible Color Palette Builder](https://toolness.github.io/accessible-color-matrix/)

---

**Document Status**: ✅ Complete
**Next Phase**: SPARC-P (Pseudocode)
**Estimated Implementation Time**: 10-14 days
**Complexity**: Medium-High
