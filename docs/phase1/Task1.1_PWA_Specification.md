# Phase 1 - Task 1.1: PWA Configuration Specification

**SPARC Phase:** Specification (S)
**Date:** 2025-01-23
**Task:** Progressive Web App (PWA) Configuration
**Duration:** Week 1-2

---

## 1. Overview

Transform Global Educator Nexus into a Progressive Web App to provide a native app-like experience, enabling installation on mobile devices and offline functionality.

### Business Objectives
- **Mobile-First**: Increase mobile traffic share to >40%
- **Engagement**: Improve user engagement through installable app
- **Accessibility**: Enable offline access to critical features
- **Performance**: Achieve Lighthouse PWA score >90

### Technical Objectives
- Install `next-pwa` or equivalent for Next.js 15 App Router
- Configure service workers for offline caching
- Create web app manifest for installability
- Implement offline fallback pages
- Add install prompts and UX flows

---

## 2. Requirements

### 2.1 Functional Requirements

#### FR-1: Web App Manifest
- **FR-1.1**: App must be installable on iOS (Safari) and Android (Chrome)
- **FR-1.2**: Custom app icons for multiple resolutions (192x192, 512x512)
- **FR-1.3**: Branded splash screens for both platforms
- **FR-1.4**: Proper app name, short name, and description
- **FR-1.5**: Theme color and background color matching brand

#### FR-2: Service Worker
- **FR-2.1**: Cache static assets (CSS, JS, fonts, images)
- **FR-2.2**: Implement cache-first strategy for static content
- **FR-2.3**: Implement network-first strategy for API calls
- **FR-2.4**: Automatic updates with version check
- **FR-2.5**: Background sync for offline actions (optional Phase 1.5)

#### FR-3: Offline Experience
- **FR-3.1**: Offline fallback page when no connection
- **FR-3.2**: Cached critical pages (dashboard, profile)
- **FR-3.3**: Queue form submissions for background sync
- **FR-3.4**: Visual indicators for offline status

#### FR-4: Install Prompts
- **FR-4.1**: Smart install banner (after 2 visits or 1 engaged session)
- **FR-4.2**: "Add to Home Screen" tutorial for iOS users
- **FR-4.3**: Dismissible install prompt with "Don't show again" option
- **FR-4.4**: Track installation analytics

### 2.2 Non-Functional Requirements

#### NFR-1: Performance
- **NFR-1.1**: Lighthouse PWA score: >90
- **NFR-1.2**: First Contentful Paint (FCP): <1.5s
- **NFR-1.3**: Time to Interactive (TTI): <3s
- **NFR-1.4**: Service worker registration: <100ms

#### NFR-2: Compatibility
- **NFR-2.1**: iOS Safari 15+ support
- **NFR-2.2**: Android Chrome 90+ support
- **NFR-2.3**: Desktop Chrome/Edge support
- **NFR-2.4**: Graceful degradation for older browsers

#### NFR-3: Security
- **NFR-3.1**: HTTPS required (already in place via Vercel)
- **NFR-3.2**: Service worker scope limited to app domain
- **NFR-3.3**: No sensitive data cached in service worker
- **NFR-3.4**: Cache invalidation on logout

---

## 3. Technical Stack

### 3.1 PWA Library Selection

**Option 1: next-pwa (Recommended)**
- **Pros**:
  - Excellent Next.js integration
  - Automatic service worker generation
  - Zero-config for basic setup
  - Active maintenance
- **Cons**:
  - May need updates for Next.js 15
- **Decision**: ✅ Selected

**Option 2: Workbox (Manual)**
- **Pros**:
  - More control over caching strategies
  - Google-backed
- **Cons**:
  - More complex setup
  - Manual service worker code
- **Decision**: ❌ Not selected (use if next-pwa incompatible)

**Option 3: Serwist**
- **Pros**:
  - Modern alternative to Workbox
  - TypeScript-first
  - Better Next.js 15 support
- **Cons**:
  - Newer, less battle-tested
- **Decision**: ⚠️ Backup option

### 3.2 Implementation Dependencies

```json
{
  "next-pwa": "^5.6.0",
  "@ducanh2912/next-pwa": "^10.0.0",
  "workbox-window": "^7.0.0"
}
```

Note: Use `@ducanh2912/next-pwa` for Next.js 13+ App Router compatibility.

---

## 4. Feature Specifications

### 4.1 Web App Manifest

**File:** `public/manifest.json`

```json
{
  "name": "Global Educator Nexus",
  "short_name": "EduNexus",
  "description": "Connect international teachers with schools worldwide",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#3b82f6",
  "orientation": "portrait-primary",
  "icons": [
    {
      "src": "/icons/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-96x96.png",
      "sizes": "96x96",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-128x128.png",
      "sizes": "128x128",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-144x144.png",
      "sizes": "144x144",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-152x152.png",
      "sizes": "152x152",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-384x384.png",
      "sizes": "384x384",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/maskable-icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable"
    }
  ],
  "screenshots": [
    {
      "src": "/screenshots/desktop-1.png",
      "sizes": "1280x720",
      "type": "image/png",
      "form_factor": "wide"
    },
    {
      "src": "/screenshots/mobile-1.png",
      "sizes": "750x1334",
      "type": "image/png",
      "form_factor": "narrow"
    }
  ],
  "categories": ["education", "business", "productivity"],
  "shortcuts": [
    {
      "name": "Find Jobs",
      "short_name": "Jobs",
      "description": "Browse teaching jobs worldwide",
      "url": "/jobs",
      "icons": [{ "src": "/icons/shortcut-jobs.png", "sizes": "96x96" }]
    },
    {
      "name": "My Applications",
      "short_name": "Applications",
      "description": "View your job applications",
      "url": "/dashboard/applications",
      "icons": [{ "src": "/icons/shortcut-apps.png", "sizes": "96x96" }]
    }
  ]
}
```

### 4.2 Service Worker Caching Strategy

#### Strategy 1: Static Assets (Cache First)
**Applies to:**
- CSS files
- JavaScript bundles
- Fonts
- Icons
- Images

**Cache Name:** `static-assets-v1`
**Max Age:** 30 days
**Max Entries:** 60

#### Strategy 2: Pages (Network First, Cache Fallback)
**Applies to:**
- All HTML pages
- Dynamic routes

**Cache Name:** `pages-v1`
**Max Age:** 1 day
**Max Entries:** 50

#### Strategy 3: API Calls (Network Only)
**Applies to:**
- `/api/*` routes
- Server Actions
- External API calls

**Cache Name:** None (always fresh)
**Fallback:** Show offline indicator

#### Strategy 4: Images (Cache First, Network Fallback)
**Applies to:**
- User uploads
- Job images
- Profile pictures

**Cache Name:** `images-v1`
**Max Age:** 7 days
**Max Entries:** 100

### 4.3 Offline Fallback Page

**File:** `app/offline/page.tsx`

**Content:**
- Friendly message explaining offline status
- Cached content preview (last visited page)
- Retry button to check connection
- Link to cached dashboard

### 4.4 Install Prompt Component

**File:** `components/pwa/install-prompt.tsx`

**Behavior:**
- Show after 2 page views OR 30 seconds on site
- Slide-up banner on mobile
- Modal on desktop
- "Install App" and "Not Now" buttons
- Store dismissal in localStorage (7 days)

**Tracking:**
- `install_prompt_shown`
- `install_prompt_accepted`
- `install_prompt_dismissed`
- `pwa_installed` (via `appinstalled` event)

---

## 5. Configuration

### 5.1 Next.js Configuration

**File:** `next.config.js`

```javascript
const withPWA = require('@ducanh2912/next-pwa').default({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/fonts\.(?:gstatic)\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts-webfonts',
        expiration: {
          maxEntries: 4,
          maxAgeSeconds: 365 * 24 * 60 * 60 // 1 year
        }
      }
    },
    {
      urlPattern: /^https:\/\/fonts\.(?:googleapis)\.com\/.*/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'google-fonts-stylesheets',
        expiration: {
          maxEntries: 4,
          maxAgeSeconds: 7 * 24 * 60 * 60 // 1 week
        }
      }
    },
    {
      urlPattern: /\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-font-assets',
        expiration: {
          maxEntries: 4,
          maxAgeSeconds: 7 * 24 * 60 * 60 // 1 week
        }
      }
    },
    {
      urlPattern: /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-image-assets',
        expiration: {
          maxEntries: 64,
          maxAgeSeconds: 24 * 60 * 60 // 1 day
        }
      }
    },
    {
      urlPattern: /\/_next\/image\?url=.+$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'next-image',
        expiration: {
          maxEntries: 64,
          maxAgeSeconds: 24 * 60 * 60 // 1 day
        }
      }
    },
    {
      urlPattern: /\.(?:mp3|wav|ogg)$/i,
      handler: 'CacheFirst',
      options: {
        rangeRequests: true,
        cacheName: 'static-audio-assets',
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 24 * 60 * 60 // 1 day
        }
      }
    },
    {
      urlPattern: /\.(?:mp4)$/i,
      handler: 'CacheFirst',
      options: {
        rangeRequests: true,
        cacheName: 'static-video-assets',
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 24 * 60 * 60 // 1 day
        }
      }
    },
    {
      urlPattern: /^https:\/\/uploadthing\.com\/.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'uploadthing-cache',
        networkTimeoutSeconds: 10,
        expiration: {
          maxEntries: 16,
          maxAgeSeconds: 24 * 60 * 60 // 1 day
        }
      }
    }
  ]
});

module.exports = withPWA({
  // existing config
});
```

### 5.2 Root Layout Metadata

**File:** `app/layout.tsx`

```typescript
export const metadata: Metadata = {
  manifest: '/manifest.json',
  themeColor: '#3b82f6',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'EduNexus',
  },
  formatDetection: {
    telephone: false,
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
};
```

---

## 6. Success Criteria

### 6.1 Technical Validation

✅ **Lighthouse PWA Audit**
- PWA score: >90
- Installable: Pass
- Offline support: Pass
- Fast and reliable: Pass

✅ **Service Worker Check**
- Registered successfully
- Caching assets correctly
- Update mechanism working
- Offline page accessible

✅ **Manifest Validation**
- All required fields present
- Icons in correct sizes
- Installable on iOS/Android
- Splash screens working

### 6.2 User Acceptance

✅ **Installation Flow**
- Install prompt appears correctly
- Installation completes successfully
- App launches in standalone mode
- Icons appear on home screen

✅ **Offline Experience**
- Offline page shows when disconnected
- Cached pages accessible offline
- Queue actions work (if implemented)
- Reconnection smooth

### 6.3 Performance Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Lighthouse PWA Score | >90 | Chrome DevTools |
| Service Worker Registration | <100ms | Performance API |
| Install Prompt CTR | >10% | Analytics event |
| PWA Install Rate | >5% | `appinstalled` event |
| Offline Page Access | <500ms | Manual testing |

---

## 7. Risks & Mitigation

### Risk 1: Next.js 15 Compatibility
- **Impact**: High
- **Probability**: Medium
- **Mitigation**:
  - Test with `@ducanh2912/next-pwa` (actively maintained)
  - Fallback to manual Workbox setup if needed
  - Monitor Next.js 15 release notes

### Risk 2: iOS PWA Limitations
- **Impact**: Medium
- **Probability**: High
- **Mitigation**:
  - Provide clear "Add to Home Screen" instructions
  - Test on real iOS devices
  - Consider iOS-specific fallbacks

### Risk 3: Cache Invalidation Issues
- **Impact**: Medium
- **Probability**: Low
- **Mitigation**:
  - Implement versioned cache names
  - Add manual "Clear Cache" option in settings
  - Automatic cache cleanup on logout

### Risk 4: Service Worker Update Delays
- **Impact**: Low
- **Probability**: Medium
- **Mitigation**:
  - Use `skipWaiting: true` for immediate updates
  - Show update notification to users
  - Implement force-refresh mechanism

---

## 8. Timeline

**Week 1:**
- Day 1-2: Install and configure next-pwa
- Day 3-4: Create manifest.json and icons
- Day 5: Test service worker caching

**Week 2:**
- Day 1-2: Build offline fallback page
- Day 3-4: Implement install prompt component
- Day 5: Lighthouse audit and optimization

---

## 9. Dependencies

### External Dependencies
- `@ducanh2912/next-pwa`: ^10.0.0
- Icon generation tool (e.g., PWA Asset Generator)
- Lighthouse CI for automated testing

### Internal Dependencies
- Next.js 15 App Router (✅ in place)
- Vercel deployment (✅ HTTPS enabled)
- Analytics tracking (✅ in place)

### Blockers
- None identified

---

## 10. Testing Strategy

### Unit Tests
- Manifest validation
- Service worker registration logic
- Install prompt display conditions

### Integration Tests
- Offline page rendering
- Cache strategies working
- Update mechanism

### E2E Tests
- Full installation flow on iOS/Android
- Offline functionality
- Cache persistence across sessions

### Manual Tests
- Real device testing (iOS Safari, Android Chrome)
- Various network conditions (4G, 3G, offline)
- Installation and uninstallation

---

## 11. Documentation

### Developer Documentation
- PWA setup guide
- Service worker debugging
- Cache management

### User Documentation
- "How to install" guide
- Offline features explanation
- Troubleshooting

---

## Approval

**Specification Status:** ✅ Ready for Pseudocode Phase

**Next SPARC Phase:** Pseudocode (P)

---

**Created:** 2025-01-23
**Last Updated:** 2025-01-23
**Version:** 1.0
