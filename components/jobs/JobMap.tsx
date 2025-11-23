'use client';

/**
 * Job Map Component
 * SPARC: Implementation Phase - Main Map Component
 *
 * Interactive Leaflet map showing job locations with clustering
 */

import { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { Button } from '@/components/ui/button';
import { Loader2, MapPin, Navigation } from 'lucide-react';
import { JobPreviewCard } from './JobPreviewCard';
import {
  buildMapApiUrl,
  debounce,
  leafletBoundsToMapBounds,
  createJobIcon,
  createClusterIcon,
} from '@/lib/map/utils';
import { MAP_CONFIG } from '@/lib/types/map';
import type { JobMapProps, MapJob, MapState } from '@/lib/types/map';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default icon issue with Next.js
import L from 'leaflet';
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/markers/marker-icon-2x.png',
  iconUrl: '/markers/marker-icon.png',
  shadowUrl: '/markers/marker-shadow.png',
});

// ============================================================================
// Map Event Handler Component
// ============================================================================

function MapEventHandler({
  onBoundsChange,
  onCenterLocation,
}: {
  onBoundsChange: (bounds: any) => void;
  onCenterLocation: boolean;
}) {
  const map = useMap();

  // Handle bounds change
  useMapEvents({
    moveend: () => {
      const bounds = map.getBounds();
      onBoundsChange(leafletBoundsToMapBounds(bounds));
    },
  });

  // Center on user location
  useEffect(() => {
    if (onCenterLocation && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          map.setView([position.coords.latitude, position.coords.longitude], 10);
        },
        (error) => {
          console.error('Geolocation error:', error);
        }
      );
    }
  }, [onCenterLocation, map]);

  return null;
}

// ============================================================================
// Main Map Component
// ============================================================================

export function JobMap({ initialJobs, filters, onJobSelect }: JobMapProps) {
  const [jobs, setJobs] = useState<MapJob[]>(initialJobs);
  const [selectedJob, setSelectedJob] = useState<MapJob | null>(null);
  const [loading, setLoading] = useState(false);
  const [mapState, setMapState] = useState<MapState>({
    center: MAP_CONFIG.DEFAULT_CENTER,
    zoom: MAP_CONFIG.DEFAULT_ZOOM,
    bounds: null,
    selectedJobId: null,
    searchThisArea: false,
  });
  const [centerOnLocation, setCenterOnLocation] = useState(false);

  // Fetch jobs when filters change
  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);

      try {
        const url = buildMapApiUrl(
          filters,
          mapState.searchThisArea ? mapState.bounds || undefined : undefined
        );

        const response = await fetch(url);
        const data = await response.json();

        setJobs(data.jobs || []);
      } catch (error) {
        console.error('Failed to fetch map jobs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [filters, mapState.searchThisArea, mapState.bounds]);

  // Debounced bounds change handler
  const handleBoundsChange = useCallback(
    debounce((newBounds: any) => {
      setMapState((prev) => ({
        ...prev,
        bounds: newBounds,
        searchThisArea: false, // Reset search this area flag
      }));
    }, 500),
    []
  );

  // Handle marker click
  const handleMarkerClick = (job: MapJob) => {
    setSelectedJob(job);
    if (onJobSelect) {
      onJobSelect(job.id);
    }
  };

  // Handle "Search This Area" click
  const handleSearchThisArea = () => {
    setMapState((prev) => ({
      ...prev,
      searchThisArea: true,
    }));
  };

  // Handle center on location
  const handleCenterOnLocation = () => {
    setCenterOnLocation((prev) => !prev);
  };

  return (
    <div className="relative h-full w-full">
      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 bg-white/50 z-[1000] flex items-center justify-center">
          <div className="bg-white rounded-lg p-4 shadow-lg flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm font-medium">Loading jobs...</span>
          </div>
        </div>
      )}

      {/* Map Container */}
      <MapContainer
        center={mapState.center}
        zoom={mapState.zoom}
        className="h-full w-full"
        zoomControl={true}
        scrollWheelZoom={true}
      >
        <TileLayer
          url={MAP_CONFIG.TILE_URL}
          attribution={MAP_CONFIG.ATTRIBUTION}
        />

        <MapEventHandler
          onBoundsChange={handleBoundsChange}
          onCenterLocation={centerOnLocation}
        />

        {/* Job markers with clustering */}
        <MarkerClusterGroup
          chunkedLoading
          maxClusterRadius={MAP_CONFIG.CLUSTER_RADIUS}
          iconCreateFunction={createClusterIcon}
        >
          {jobs.map((job) => {
            if (!job.latitude || !job.longitude) return null;

            return (
              <Marker
                key={job.id}
                position={[job.latitude, job.longitude]}
                icon={createJobIcon(job)}
                eventHandlers={{
                  click: () => handleMarkerClick(job),
                }}
              >
                <Popup>
                  <div className="p-2">
                    <JobPreviewCard job={job} />
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MarkerClusterGroup>

        {/* Map controls */}
        <div className="absolute top-4 right-4 z-[1000] space-y-2">
          {/* "Search This Area" button */}
          {!mapState.searchThisArea && mapState.bounds && (
            <Button
              onClick={handleSearchThisArea}
              className="bg-white text-gray-900 hover:bg-gray-100 shadow-lg border"
              size="sm"
            >
              <MapPin className="h-4 w-4 mr-2" />
              Search This Area
            </Button>
          )}

          {/* "My Location" button */}
          <Button
            onClick={handleCenterOnLocation}
            className="bg-white text-gray-900 hover:bg-gray-100 shadow-lg border"
            size="icon"
            title="Center on my location"
          >
            <Navigation className="h-4 w-4" />
          </Button>
        </div>

        {/* Results counter */}
        <div className="absolute bottom-4 left-4 z-[1000]">
          <div className="bg-white rounded-lg p-3 shadow-lg border">
            <p className="text-sm font-medium">
              {jobs.length} {jobs.length === 1 ? 'job' : 'jobs'} shown
            </p>
          </div>
        </div>
      </MapContainer>

      {/* Selected job preview (mobile) */}
      {selectedJob && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[1000] md:hidden">
          <JobPreviewCard
            job={selectedJob}
            onClose={() => setSelectedJob(null)}
          />
        </div>
      )}
    </div>
  );
}
