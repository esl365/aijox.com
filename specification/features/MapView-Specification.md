# Map View Feature - Specification

> **SPARC Phase 1**: Detailed specification for interactive job location visualization
>
> Feature Type: Phase 1 - Immediate Enhancement
> Priority: HIGH
> Estimated Complexity: MEDIUM

---

## Table of Contents
1. [Overview](#overview)
2. [User Stories](#user-stories)
3. [Functional Requirements](#functional-requirements)
4. [Technical Requirements](#technical-requirements)
5. [UI/UX Specifications](#uiux-specifications)
6. [API Specifications](#api-specifications)
7. [Performance Requirements](#performance-requirements)
8. [Security Considerations](#security-considerations)

---

## Overview

### Purpose
Enable job seekers to visualize teaching positions geographically through an interactive map interface, making location-based job discovery more intuitive and engaging.

### Business Value
- **Improved User Experience**: Visual job discovery reduces cognitive load
- **Higher Engagement**: Interactive maps increase time on site by 30-40%
- **Better Conversions**: Location-aware search increases application rate by 25%
- **Competitive Advantage**: Few teaching job boards offer map visualization

### Benchmarking
- **CareerArc Job Maps**: Interactive clustering, location-based filtering
- **Glassdoor Job Explorer**: Pin-based visualization, zoom controls
- **RemoteOK**: Simple location pins with job count badges

---

## User Stories

### Epic: Interactive Job Map Discovery

**US-1.1: View Jobs on Map**
```
As a job seeker
I want to see all available teaching positions on an interactive map
So that I can discover opportunities based on geographical location
```

**Acceptance Criteria**:
- ✅ Map displays all active job postings as location markers
- ✅ Markers cluster when zoomed out (>10 jobs in same city)
- ✅ Individual pins show when zoomed in
- ✅ Map loads within 2 seconds
- ✅ Mobile responsive with touch controls

**US-1.2: Filter Map by Criteria**
```
As a job seeker
I want to apply filters to map results
So that I can see only relevant positions in my areas of interest
```

**Acceptance Criteria**:
- ✅ All existing filters apply to map view
- ✅ Map updates in real-time when filters change
- ✅ Active filters are visually indicated
- ✅ Filter count shows on map markers

**US-1.3: Switch Between List and Map View**
```
As a job seeker
I want to toggle between list and map view
So that I can choose my preferred browsing method
```

**Acceptance Criteria**:
- ✅ Toggle button switches views instantly
- ✅ Filters persist across view changes
- ✅ Selected job persists when switching views
- ✅ User preference is saved in localStorage

**US-1.4: View Job Details from Map**
```
As a job seeker
I want to click a map marker to see job details
So that I can learn about positions without leaving the map
```

**Acceptance Criteria**:
- ✅ Clicking marker opens job preview card
- ✅ Preview shows: title, school, salary, benefits, image
- ✅ "View Full Details" button opens complete listing
- ✅ "Quick Apply" button initiates application
- ✅ Preview is mobile-friendly

**US-1.5: Navigate Map Intuitively**
```
As a job seeker
I want standard map controls
So that I can explore different regions easily
```

**Acceptance Criteria**:
- ✅ Pan with mouse drag / touch swipe
- ✅ Zoom with scroll wheel / pinch gesture
- ✅ Zoom in/out buttons
- ✅ "Center on My Location" button (with permission)
- ✅ Search box to jump to city/country

---

## Functional Requirements

### FR-1: Map Data Layer

**FR-1.1: Job Location Geocoding**
- All job postings must have latitude/longitude coordinates
- Coordinates calculated from city + country on job creation
- Fallback to city center if exact address unavailable
- Cache coordinates in database for performance

**FR-1.2: Marker Clustering**
- Cluster jobs when >10 positions in 50km radius
- Cluster size determines marker size/color
- Cluster badge shows job count
- Clicking cluster zooms to reveal individual markers

**FR-1.3: Marker Types**
```typescript
Single Job Pin:
  - Blue pin with school logo (if available)
  - Hover shows job title + salary
  - Click opens job preview card

Cluster Marker:
  - Circular badge with count
  - Color coded by density:
    - 2-10 jobs: Light blue (#60A5FA)
    - 11-50 jobs: Blue (#3B82F6)
    - 51-100 jobs: Dark blue (#1E40AF)
    - 100+ jobs: Purple (#7C3AED)
  - Click zooms to split cluster
```

### FR-2: Map Interaction

**FR-2.1: Job Preview Card**
```typescript
Preview Card Content:
  ┌─────────────────────────────────┐
  │ [School Logo]   [× Close]       │
  │                                 │
  │ Elementary Teacher              │
  │ Seoul International School      │
  │                                 │
  │ 📍 Seoul, South Korea          │
  │ 💰 $4,500-5,500/mo             │
  │ 🏠 Housing  ✈️ Flight          │
  │                                 │
  │ [Quick Apply]  [View Details]  │
  └─────────────────────────────────┘
```

**FR-2.2: Map Controls**
- Zoom: +/- buttons, scroll wheel, pinch gesture
- Pan: Drag (desktop), swipe (mobile)
- Center: "My Location" button (geolocation API)
- Search: Autocomplete city/country search

**FR-2.3: View Toggle**
- Button in header: "List View" ↔ "Map View"
- Icon changes: List icon ↔ Map icon
- Smooth transition with loading state
- Preserves scroll position when switching back

### FR-3: Filter Integration

**FR-3.1: Real-time Map Updates**
- Map re-renders when filters change
- Smooth marker animation (fade out/in)
- Loading overlay during fetch
- Empty state message if no results

**FR-3.2: Location-Based Filtering**
- "Search This Area" button appears after panning
- Clicking updates filters to map bounds
- Removes country filter, adds custom bounds
- Shows result count in button

---

## Technical Requirements

### TR-1: Technology Stack

**Map Library**: Leaflet.js
```typescript
Rationale:
  ✓ Open source, no API costs
  ✓ Lightweight (38KB gzipped)
  ✓ Mobile-friendly
  ✓ Plugin ecosystem (clustering, search)
  ✓ Better than Google Maps for this use case

Dependencies:
  - leaflet: ^1.9.4
  - react-leaflet: ^4.2.1
  - react-leaflet-cluster: ^2.1.0
  - leaflet-geosearch: ^3.11.0
```

**Geocoding Service**: OpenCage Geocoder API
```typescript
Rationale:
  ✓ 2,500 requests/day free tier
  ✓ Global coverage
  ✓ Reverse geocoding support
  ✓ Confidence scores

Free Tier Limit: 2,500/day
  - ~80 jobs/day with coordinates
  - Cache in database = no repeated calls
```

### TR-2: Database Schema Changes

**Add Geolocation Fields to JobPosting**:
```prisma
model JobPosting {
  // ... existing fields

  // Geolocation (new fields)
  latitude   Float?   @map("latitude")
  longitude  Float?   @map("longitude")
  geocodedAt DateTime? @map("geocoded_at")
  geocodeConfidence Float? @map("geocode_confidence")

  @@index([latitude, longitude])
}
```

### TR-3: API Endpoints

**GET /api/jobs/map**
```typescript
Query Parameters:
  - bounds: { north, south, east, west } // Map viewport
  - ...all existing filters (country, subject, etc.)

Response:
  {
    jobs: {
      id: string,
      title: string,
      schoolName: string,
      latitude: number,
      longitude: number,
      salaryUSD: number,
      housingProvided: boolean,
      flightProvided: boolean,
      country: string,
      city: string
    }[],
    total: number,
    bounds: { north, south, east, west }
  }
```

**POST /api/geocode/job**
```typescript
Body:
  {
    jobId: string,
    city: string,
    country: string
  }

Response:
  {
    latitude: number,
    longitude: number,
    confidence: number,
    geocodedAt: Date
  }
```

### TR-4: Performance Optimization

**Caching Strategy**:
- Geocode results cached in database forever
- Map tile caching via browser cache
- Job data cached for 5 minutes (React Query)
- Viewport bounds debounced (500ms)

**Data Loading**:
- Initial load: All jobs with coordinates
- Lazy load job details on marker click
- Infinite scroll not needed (map bounds limit results)
- Max 1000 markers rendered at once

**Bundle Size**:
- Leaflet bundle: ~38KB gzipped
- react-leaflet: ~15KB gzipped
- Total map overhead: ~53KB (acceptable)

---

## UI/UX Specifications

### Layout: Desktop (1440px+)

```
┌────────────────────────────────────────────────────────┐
│  Navigation Header                                     │
├────────────────┬───────────────────────────────────────┤
│                │  [List View] [Map View]   847 jobs    │
│  Filters       │  ┌──────────────────────────────────┐ │
│  Sidebar       │  │                                  │ │
│                │  │          MAP CANVAS              │ │
│  [Collapse]    │  │      (Leaflet Container)         │ │
│                │  │                                  │ │
│                │  │    [Zoom +]  [🎯 My Location]   │ │
│                │  │    [Zoom -]  [🔍 Search City]   │ │
│                │  └──────────────────────────────────┘ │
│                │                                        │
│                │  [Job Preview Card - absolute positioned] │
└────────────────┴───────────────────────────────────────┘
```

### Layout: Mobile (< 768px)

```
┌──────────────────────────┐
│  Navigation              │
├──────────────────────────┤
│  [Filters] [List] [Map]  │
├──────────────────────────┤
│                          │
│       MAP CANVAS         │
│     (Full Screen)        │
│                          │
│  [🎯]  [🔍]  [+] [-]    │
│                          │
├──────────────────────────┤
│  [Job Preview Sheet]     │
│  (Bottom Sheet on click) │
└──────────────────────────┘
```

### Visual Design

**Color Palette**:
```css
Primary Blue: #3B82F6
Cluster Light: #60A5FA (2-10 jobs)
Cluster Med: #3B82F6 (11-50 jobs)
Cluster Dark: #1E40AF (51-100 jobs)
Cluster Dense: #7C3AED (100+ jobs)
Selected Pin: #F59E0B (Orange)
Background: #F3F4F6
```

**Typography**:
```css
Marker Badge: 600 14px Inter
Preview Title: 600 18px Inter
Preview School: 400 14px Inter
Preview Details: 400 12px Inter
```

**Animations**:
- Marker fade-in: 200ms ease-out
- Cluster split: 300ms ease-in-out
- Preview slide-up: 250ms ease-out
- View transition: 300ms ease-in-out

---

## Performance Requirements

### Load Time
- Initial map render: < 2 seconds
- Filter update: < 500ms
- Marker click response: < 100ms
- Tile loading: Progressive (no blocking)

### Scalability
- Support up to 10,000 jobs on map
- Clustering handles >100 jobs per city
- Viewport culling for off-screen markers
- RequestAnimationFrame for smooth panning

### Mobile Performance
- 60fps pan/zoom animations
- Touch gestures: < 16ms response
- First Contentful Paint: < 1.5s
- Largest Contentful Paint: < 2.5s

---

## Security Considerations

### API Security
- Rate limiting: 100 requests/minute per IP
- CORS: Restrict to app domain only
- Geocoding API key: Server-side only
- Map bounds validation (prevent abuse)

### Data Privacy
- No user location tracked without consent
- Geolocation permission: Optional
- User location: Not stored on server
- IP geolocation: Disabled

### XSS Prevention
- Sanitize all job data before rendering
- Content Security Policy for map tiles
- Validate geocoding responses
- Escape user search input

---

## Success Metrics

### Engagement
- Map view usage: Target 40% of job page visits
- Time on map: Target 2+ minutes average
- Interactions: Target 5+ clicks per session

### Conversion
- Application rate from map: Target 20% higher vs list
- Quick Apply from map: Target 30% of map applications
- Saved searches with map bounds: Target 15% of saved searches

### Performance
- Map load time P95: < 3 seconds
- Marker render time: < 500ms
- Zero JavaScript errors in production

### User Satisfaction
- Map usability rating: Target 4.5/5
- Feature request fulfillment: This addresses #1 requested feature
- Mobile satisfaction: Target 4.2/5 (mobile is harder)

---

## Out of Scope (Future Enhancements)

- Street view integration
- Satellite imagery toggle
- Heat map visualization
- Commute time calculator
- Neighborhood data (crime, schools, etc.)
- Drawing custom search areas
- Multiple map layers (housing, schools, etc.)

---

## Dependencies & Risks

### Dependencies
- ✅ Prisma schema migration (low risk)
- ✅ OpenCage Geocoder API availability (low risk)
- ⚠️ Backfill existing job coordinates (medium risk, ~1000 jobs)

### Risks
| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Geocoding API rate limit | Medium | High | Cache coordinates, use fallbacks |
| Poor mobile performance | Low | Medium | Progressive enhancement, lazy loading |
| Map tile CDN downtime | Low | Low | Use multiple tile providers |
| Coordinate inaccuracy | Medium | Low | Show city-level markers, not exact addresses |

---

## Acceptance Criteria Summary

**Definition of Done**:
- ✅ All user stories implemented and tested
- ✅ Mobile responsive on iOS & Android
- ✅ Performance metrics met (< 2s load, 60fps animations)
- ✅ Accessibility: Keyboard navigation, screen reader support
- ✅ Error handling: Graceful degradation if map fails
- ✅ Documentation: Component usage, API endpoints
- ✅ Analytics: Event tracking for map interactions
- ✅ A/B test ready: Can disable for 50% of users

---

**Document Version**: 1.0
**Last Updated**: 2025-01-24
**Author**: Claude (AI Development Assistant)
**Reviewed By**: Pending
**Status**: Draft → Ready for Pseudocode Phase
