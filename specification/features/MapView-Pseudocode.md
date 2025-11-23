# Map View Feature - Pseudocode

> **SPARC Phase 2**: Implementation-ready pseudocode for Map View feature
>
> This document provides detailed pseudocode that maps directly to production code.
> All functions, parameters, and logic flows are production-ready.

---

## Table of Contents
1. [Server Actions](#server-actions)
2. [API Routes](#api-routes)
3. [React Components](#react-components)
4. [Utility Functions](#utility-functions)
5. [Database Operations](#database-operations)

---

## Server Actions

### File: `app/actions/map.ts`

```pseudocode
// ============================================================================
// GEOCODE JOB POSTING
// ============================================================================

FUNCTION geocodeJobPosting(jobId: string) -> GeocodeResult
  /**
   * Geocodes a job posting by city + country
   * Caches result in database to avoid repeated API calls
   */

  // 1. Fetch job from database
  job = await prisma.jobPosting.findUnique({
    where: { id: jobId },
    select: { city, country, latitude, longitude, geocodedAt }
  })

  IF NOT job THEN
    THROW Error("Job not found")
  END IF

  // 2. Check if already geocoded
  IF job.latitude AND job.longitude AND job.geocodedAt THEN
    RETURN {
      latitude: job.latitude,
      longitude: job.longitude,
      confidence: 1.0,  // Already geocoded
      cached: true
    }
  END IF

  // 3. Call OpenCage Geocoder API
  TRY
    query = `${job.city}, ${job.country}`
    response = await fetch(`https://api.opencagedata.com/geocode/v1/json`, {
      params: {
        q: query,
        key: process.env.OPENCAGE_API_KEY,
        limit: 1,
        no_annotations: 1
      }
    })

    data = await response.json()

    IF data.results.length === 0 THEN
      // Fallback: Try country only
      response = await fetch(`https://api.opencagedata.com/geocode/v1/json`, {
        params: {
          q: job.country,
          key: process.env.OPENCAGE_API_KEY,
          limit: 1
        }
      })
      data = await response.json()
    END IF

    IF data.results.length > 0 THEN
      result = data.results[0]

      // 4. Update database with coordinates
      await prisma.jobPosting.update({
        where: { id: jobId },
        data: {
          latitude: result.geometry.lat,
          longitude: result.geometry.lng,
          geocodedAt: new Date(),
          geocodeConfidence: result.confidence
        }
      })

      RETURN {
        latitude: result.geometry.lat,
        longitude: result.geometry.lng,
        confidence: result.confidence,
        cached: false
      }
    ELSE
      THROW Error("Geocoding failed - no results")
    END IF

  CATCH error
    console.error("Geocoding error:", error)

    // Fallback: Return country center coordinates
    countryCenter = getCountryCenterCoordinates(job.country)

    await prisma.jobPosting.update({
      where: { id: jobId },
      data: {
        latitude: countryCenter.lat,
        longitude: countryCenter.lng,
        geocodedAt: new Date(),
        geocodeConfidence: 0.3  // Low confidence fallback
      }
    })

    RETURN {
      latitude: countryCenter.lat,
      longitude: countryCenter.lng,
      confidence: 0.3,
      cached: false,
      fallback: true
    }
  END TRY
END FUNCTION


// ============================================================================
// GET JOBS FOR MAP
// ============================================================================

FUNCTION getJobsForMap(
  filters: JobFilters,
  bounds?: MapBounds
) -> MapJobsResponse
  /**
   * Fetches jobs with coordinates for map visualization
   * Applies filters and map bounds
   */

  // 1. Build base where clause
  where = {
    status: 'ACTIVE',
    latitude: { not: null },
    longitude: { not: null }
  }

  // 2. Apply standard filters (country, subject, salary, etc.)
  IF filters.countries AND filters.countries.length > 0 THEN
    where.country = { in: filters.countries }
  END IF

  IF filters.subjects AND filters.subjects.length > 0 THEN
    where.OR = filters.subjects.map(subject => ({
      subject: { contains: subject, mode: 'insensitive' }
    }))
  END IF

  IF filters.minSalary THEN
    where.salaryUSD = { ...where.salaryUSD, gte: filters.minSalary }
  END IF

  IF filters.maxSalary THEN
    where.salaryUSD = { ...where.salaryUSD, lte: filters.maxSalary }
  END IF

  IF filters.housingProvided !== undefined THEN
    where.housingProvided = filters.housingProvided
  END IF

  IF filters.flightProvided !== undefined THEN
    where.flightProvided = filters.flightProvided
  END IF

  // 3. Apply map bounds if provided
  IF bounds THEN
    where.latitude = {
      gte: bounds.south,
      lte: bounds.north
    }
    where.longitude = {
      gte: bounds.west,
      lte: bounds.east
    }
  END IF

  // 4. Fetch jobs (limit to 1000 for performance)
  jobs = await prisma.jobPosting.findMany({
    where,
    select: {
      id: true,
      title: true,
      schoolName: true,
      latitude: true,
      longitude: true,
      salaryUSD: true,
      housingProvided: true,
      flightProvided: true,
      country: true,
      city: true,
      subject: true,
      employmentType: true,
      createdAt: true
    },
    take: 1000,
    orderBy: { createdAt: 'desc' }
  })

  // 5. Calculate total count
  total = await prisma.jobPosting.count({ where })

  RETURN {
    jobs,
    total,
    bounds: bounds || calculateBounds(jobs),
    truncated: total > 1000
  }
END FUNCTION


// ============================================================================
// BACKFILL COORDINATES
// ============================================================================

FUNCTION backfillMissingCoordinates() -> BackfillResult
  /**
   * Geocodes all jobs missing coordinates
   * Called once during feature rollout
   */

  // 1. Find jobs without coordinates
  jobsToGeocode = await prisma.jobPosting.findMany({
    where: {
      status: 'ACTIVE',
      OR: [
        { latitude: null },
        { longitude: null },
        { geocodedAt: null }
      ]
    },
    select: { id, city, country }
  })

  console.log(`Found ${jobsToGeocode.length} jobs to geocode`)

  successCount = 0
  failureCount = 0

  // 2. Geocode in batches (respect rate limits)
  FOR EACH batch OF jobsToGeocode IN BATCHES OF 10
    FOR EACH job IN batch
      TRY
        result = await geocodeJobPosting(job.id)

        IF result.confidence > 0.5 THEN
          successCount++
        ELSE
          failureCount++
        END IF

        // Rate limiting: 10 requests per second max
        await sleep(100)

      CATCH error
        console.error(`Failed to geocode job ${job.id}:`, error)
        failureCount++
      END TRY
    END FOR

    // Progress logging
    console.log(`Progress: ${successCount + failureCount}/${jobsToGeocode.length}`)
  END FOR

  RETURN {
    total: jobsToGeocode.length,
    success: successCount,
    failed: failureCount
  }
END FUNCTION
```

---

## API Routes

### File: `app/api/jobs/map/route.ts`

```pseudocode
// ============================================================================
// GET JOBS FOR MAP API
// ============================================================================

FUNCTION GET(request: Request) -> Response
  /**
   * API endpoint for fetching jobs with map view
   * Query params: filters, bounds
   */

  TRY
    // 1. Parse query parameters
    searchParams = new URL(request.url).searchParams

    filters = {
      countries: searchParams.get('countries')?.split(','),
      subjects: searchParams.get('subjects')?.split(','),
      minSalary: searchParams.get('minSalary') ? Number(searchParams.get('minSalary')) : undefined,
      maxSalary: searchParams.get('maxSalary') ? Number(searchParams.get('maxSalary')) : undefined,
      housingProvided: searchParams.get('housingProvided') === 'true' ? true : undefined,
      flightProvided: searchParams.get('flightProvided') === 'true' ? true : undefined
    }

    // 2. Parse map bounds if provided
    bounds = undefined
    IF searchParams.get('bounds') THEN
      boundsParsed = JSON.parse(searchParams.get('bounds'))
      bounds = {
        north: Number(boundsParsed.north),
        south: Number(boundsParsed.south),
        east: Number(boundsParsed.east),
        west: Number(boundsParsed.west)
      }

      // Validate bounds
      IF NOT isValidBounds(bounds) THEN
        RETURN Response.json(
          { error: 'Invalid map bounds' },
          { status: 400 }
        )
      END IF
    END IF

    // 3. Fetch jobs
    result = await getJobsForMap(filters, bounds)

    // 4. Return response with caching
    RETURN Response.json(result, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
      }
    })

  CATCH error
    console.error('Map API error:', error)
    RETURN Response.json(
      { error: 'Failed to fetch map data' },
      { status: 500 }
    )
  END TRY
END FUNCTION


// ============================================================================
// GEOCODE JOB API (Admin only)
// ============================================================================

FUNCTION POST(request: Request) -> Response
  /**
   * Manually geocode a specific job
   * Protected: Admin only
   */

  // 1. Check authentication
  session = await auth()
  IF NOT session OR session.user.role !== 'ADMIN' THEN
    RETURN Response.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  END IF

  TRY
    // 2. Parse request body
    body = await request.json()
    jobId = body.jobId

    IF NOT jobId THEN
      RETURN Response.json(
        { error: 'jobId required' },
        { status: 400 }
      )
    END IF

    // 3. Geocode job
    result = await geocodeJobPosting(jobId)

    // 4. Return result
    RETURN Response.json(result, { status: 200 })

  CATCH error
    console.error('Geocode API error:', error)
    RETURN Response.json(
      { error: error.message },
      { status: 500 }
    )
  END TRY
END FUNCTION
```

---

## React Components

### File: `components/jobs/JobMap.tsx`

```pseudocode
// ============================================================================
// JOB MAP COMPONENT
// ============================================================================

'use client'

COMPONENT JobMap({
  initialJobs: JobPosting[],
  filters: JobFilters,
  onJobSelect: (jobId: string) => void
})
  /**
   * Interactive Leaflet map showing job locations
   * Client component with clustering and filtering
   */

  // 1. State management
  STATE map = null
  STATE jobs = initialJobs
  STATE selectedJob = null
  STATE loading = false
  STATE bounds = null
  STATE searchThisArea = false

  // 2. Fetch jobs when filters change
  EFFECT [filters, bounds]
    async FUNCTION fetchJobs()
      loading = true

      TRY
        params = new URLSearchParams()

        // Add filters to params
        IF filters.countries THEN
          params.set('countries', filters.countries.join(','))
        END IF
        IF filters.subjects THEN
          params.set('subjects', filters.subjects.join(','))
        END IF
        // ... other filters

        // Add bounds if "Search This Area" was clicked
        IF bounds AND searchThisArea THEN
          params.set('bounds', JSON.stringify(bounds))
        END IF

        response = await fetch(`/api/jobs/map?${params}`)
        data = await response.json()

        jobs = data.jobs

      CATCH error
        console.error('Failed to fetch map jobs:', error)
      FINALLY
        loading = false
      END TRY
    END FUNCTION

    fetchJobs()
  END EFFECT

  // 3. Update bounds when map moves
  FUNCTION handleMapMove(event)
    newBounds = event.target.getBounds()

    bounds = {
      north: newBounds.getNorth(),
      south: newBounds.getSouth(),
      east: newBounds.getEast(),
      west: newBounds.getWest()
    }

    // Show "Search This Area" button
    searchThisArea = false
  END FUNCTION

  // 4. Handle marker click
  FUNCTION handleMarkerClick(job: JobPosting)
    selectedJob = job
    onJobSelect(job.id)

    // Pan map to center on selected job
    IF map THEN
      map.panTo([job.latitude, job.longitude])
    END IF
  END FUNCTION

  // 5. Handle "Search This Area" click
  FUNCTION handleSearchThisArea()
    searchThisArea = true
    // Triggers re-fetch with bounds
  END FUNCTION

  // 6. Center on user location
  FUNCTION handleCenterOnLocation()
    IF navigator.geolocation THEN
      navigator.geolocation.getCurrentPosition(
        (position) => {
          lat = position.coords.latitude
          lng = position.coords.longitude

          IF map THEN
            map.setView([lat, lng], 10)
          END IF
        },
        (error) => {
          console.error('Geolocation error:', error)
        }
      )
    END IF
  END FUNCTION

  // 7. Render map
  RETURN (
    <div className="relative h-full w-full">
      {/* Loading overlay */}
      {loading AND (
        <div className="absolute inset-0 bg-white/50 z-[1000] flex items-center justify-center">
          <Spinner />
        </div>
      )}

      {/* Leaflet Map */}
      <MapContainer
        center={[20, 0]}  // World center
        zoom={2}
        className="h-full w-full"
        whenCreated={(mapInstance) => map = mapInstance}
        onMoveEnd={handleMapMove}
      >
        {/* Map tiles */}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />

        {/* Job markers with clustering */}
        <MarkerClusterGroup
          chunkedLoading
          maxClusterRadius={50}
          iconCreateFunction={createClusterIcon}
        >
          {jobs.map(job => (
            <Marker
              key={job.id}
              position={[job.latitude, job.longitude]}
              icon={createJobIcon(job)}
              eventHandlers={{
                click: () => handleMarkerClick(job)
              }}
            >
              <Popup>
                <JobPreviewCard job={job} />
              </Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>

        {/* Map controls */}
        <div className="absolute top-4 right-4 z-[1000] space-y-2">
          {/* "Search This Area" button */}
          {NOT searchThisArea AND bounds AND (
            <Button
              onClick={handleSearchThisArea}
              className="bg-white shadow-lg"
            >
              🔍 Search This Area ({jobs.length} jobs)
            </Button>
          )}

          {/* "My Location" button */}
          <Button
            onClick={handleCenterOnLocation}
            className="bg-white shadow-lg"
            size="icon"
          >
            🎯
          </Button>
        </div>
      </MapContainer>

      {/* Selected job preview */}
      {selectedJob AND (
        <JobPreviewCard
          job={selectedJob}
          onClose={() => selectedJob = null}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[1000]"
        />
      )}
    </div>
  )
END COMPONENT


// ============================================================================
// JOB PREVIEW CARD
// ============================================================================

COMPONENT JobPreviewCard({
  job: JobPosting,
  onClose?: () => void
})
  /**
   * Compact job preview shown on map
   */

  RETURN (
    <Card className="w-80 shadow-xl">
      <CardHeader className="flex flex-row items-start justify-between">
        <div className="flex gap-3">
          {job.schoolLogo AND (
            <Avatar>
              <AvatarImage src={job.schoolLogo} />
            </Avatar>
          )}
          <div>
            <CardTitle className="text-lg">{job.title}</CardTitle>
            <p className="text-sm text-muted-foreground">{job.schoolName}</p>
          </div>
        </div>

        {onClose AND (
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Location */}
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="h-4 w-4" />
          {job.city}, {job.country}
        </div>

        {/* Salary */}
        <div className="flex items-center gap-2 text-sm font-semibold">
          <DollarSign className="h-4 w-4" />
          ${job.salaryUSD.toLocaleString()}/month
        </div>

        {/* Benefits */}
        <div className="flex gap-2">
          {job.housingProvided AND (
            <Badge variant="secondary">
              <Home className="h-3 w-3 mr-1" />
              Housing
            </Badge>
          )}
          {job.flightProvided AND (
            <Badge variant="secondary">
              <Plane className="h-3 w-3 mr-1" />
              Flight
            </Badge>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button
            className="flex-1"
            variant="outline"
            onClick={() => router.push(`/jobs/${job.id}`)}
          >
            View Details
          </Button>
          <Button
            className="flex-1"
            onClick={() => handleQuickApply(job.id)}
          >
            Quick Apply
          </Button>
        </div>
      </CardContent>
    </Card>
  )
END COMPONENT


// ============================================================================
// VIEW TOGGLE COMPONENT
// ============================================================================

COMPONENT JobViewToggle({
  view: 'list' | 'map',
  onChange: (view: 'list' | 'map') => void
})
  /**
   * Toggle between list and map view
   */

  RETURN (
    <div className="flex gap-1 bg-muted rounded-lg p-1">
      <Button
        variant={view === 'list' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onChange('list')}
        className="gap-2"
      >
        <List className="h-4 w-4" />
        List View
      </Button>

      <Button
        variant={view === 'map' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onChange('map')}
        className="gap-2"
      >
        <MapIcon className="h-4 w-4" />
        Map View
      </Button>
    </div>
  )
END COMPONENT
```

---

## Utility Functions

### File: `lib/map/utils.ts`

```pseudocode
// ============================================================================
// CREATE CLUSTER ICON
// ============================================================================

FUNCTION createClusterIcon(cluster) -> Icon
  /**
   * Creates custom cluster icon based on job count
   */

  count = cluster.getChildCount()

  // Determine color based on count
  IF count <= 10 THEN
    color = '#60A5FA'  // Light blue
    size = 'small'
  ELSE IF count <= 50 THEN
    color = '#3B82F6'  // Blue
    size = 'medium'
  ELSE IF count <= 100 THEN
    color = '#1E40AF'  // Dark blue
    size = 'large'
  ELSE
    color = '#7C3AED'  // Purple
    size = 'xlarge'
  END IF

  // Create HTML for cluster icon
  html = `
    <div class="cluster-marker cluster-${size}"
         style="background-color: ${color}">
      <span>${count}</span>
    </div>
  `

  RETURN L.divIcon({
    html: html,
    className: 'custom-cluster-icon',
    iconSize: L.point(40, 40)
  })
END FUNCTION


// ============================================================================
// CREATE JOB ICON
// ============================================================================

FUNCTION createJobIcon(job: JobPosting) -> Icon
  /**
   * Creates custom marker icon for individual job
   */

  // Use school logo if available
  IF job.schoolLogo THEN
    html = `
      <div class="job-marker">
        <img src="${job.schoolLogo}" alt="${job.schoolName}" />
      </div>
    `
  ELSE
    html = `
      <div class="job-marker-default">
        <MapPin />
      </div>
    `
  END IF

  RETURN L.divIcon({
    html: html,
    className: 'custom-job-icon',
    iconSize: L.point(32, 32),
    iconAnchor: L.point(16, 32)
  })
END FUNCTION


// ============================================================================
// COUNTRY CENTER COORDINATES
// ============================================================================

FUNCTION getCountryCenterCoordinates(country: string) -> Coordinates
  /**
   * Fallback coordinates for common countries
   */

  centers = {
    'South Korea': { lat: 37.5665, lng: 126.9780 },  // Seoul
    'Japan': { lat: 35.6762, lng: 139.6503 },  // Tokyo
    'China': { lat: 39.9042, lng: 116.4074 },  // Beijing
    'United Arab Emirates': { lat: 25.2048, lng: 55.2708 },  // Dubai
    'Saudi Arabia': { lat: 24.7136, lng: 46.6753 },  // Riyadh
    'Vietnam': { lat: 21.0285, lng: 105.8542 },  // Hanoi
    'Thailand': { lat: 13.7563, lng: 100.5018 },  // Bangkok
    'Taiwan': { lat: 25.0330, lng: 121.5654 },  // Taipei
    'Singapore': { lat: 1.3521, lng: 103.8198 },  // Singapore
    'Hong Kong': { lat: 22.3193, lng: 114.1694 }  // Hong Kong
  }

  RETURN centers[country] OR { lat: 0, lng: 0 }
END FUNCTION


// ============================================================================
// CALCULATE BOUNDS
// ============================================================================

FUNCTION calculateBounds(jobs: JobPosting[]) -> MapBounds
  /**
   * Calculate bounding box for all jobs
   */

  IF jobs.length === 0 THEN
    RETURN {
      north: 90,
      south: -90,
      east: 180,
      west: -180
    }
  END IF

  north = Math.max(...jobs.map(j => j.latitude))
  south = Math.min(...jobs.map(j => j.latitude))
  east = Math.max(...jobs.map(j => j.longitude))
  west = Math.min(...jobs.map(j => j.longitude))

  // Add 10% padding
  latPadding = (north - south) * 0.1
  lngPadding = (east - west) * 0.1

  RETURN {
    north: north + latPadding,
    south: south - latPadding,
    east: east + lngPadding,
    west: west - lngPadding
  }
END FUNCTION


// ============================================================================
// VALIDATE BOUNDS
// ============================================================================

FUNCTION isValidBounds(bounds: MapBounds) -> boolean
  /**
   * Validate map bounds are within acceptable range
   */

  RETURN (
    bounds.north >= -90 AND bounds.north <= 90 AND
    bounds.south >= -90 AND bounds.south <= 90 AND
    bounds.east >= -180 AND bounds.east <= 180 AND
    bounds.west >= -180 AND bounds.west <= 180 AND
    bounds.north > bounds.south AND
    bounds.east > bounds.west
  )
END FUNCTION
```

---

## Database Operations

### File: `prisma/migrations/XXX_add_geolocation/migration.sql`

```sql
-- Add geolocation fields to JobPosting
ALTER TABLE "JobPosting" ADD COLUMN "latitude" DOUBLE PRECISION;
ALTER TABLE "JobPosting" ADD COLUMN "longitude" DOUBLE PRECISION;
ALTER TABLE "JobPosting" ADD COLUMN "geocodedAt" TIMESTAMP(3);
ALTER TABLE "JobPosting" ADD COLUMN "geocodeConfidence" DOUBLE PRECISION;

-- Create index for spatial queries
CREATE INDEX "JobPosting_lat_lng_idx" ON "JobPosting"("latitude", "longitude");

-- Create index for geocoded jobs
CREATE INDEX "JobPosting_geocoded_idx" ON "JobPosting"("geocodedAt")
WHERE "latitude" IS NOT NULL AND "longitude" IS NOT NULL;
```

---

**Document Version**: 1.0
**Last Updated**: 2025-01-24
**Status**: Draft → Ready for Architecture Phase
