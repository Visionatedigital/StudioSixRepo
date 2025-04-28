'use client';

import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';

// Initialize mapboxgl
if (!process.env.NEXT_PUBLIC_MAPBOX_TOKEN) {
  throw new Error('Mapbox token is required');
}
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

// Create a singleton map instance
let mapInstance: mapboxgl.Map | null = null;

// Analysis layers configuration
const analysisLayers = {
  terrain: {
    id: 'terrain',
    name: 'Terrain',
    source: 'mapbox-dem',
    type: 'terrain',
    style: 'mapbox://styles/mapbox/satellite-streets-v12',
    exaggeration: 1.5
  },
  buildings: {
    id: 'buildings',
    name: 'Buildings',
    layer: '3d-buildings',
    source: 'composite',
    'source-layer': 'building',
    type: 'fill-extrusion'
  },
  contours: {
    id: 'contours',
    name: 'Contour Lines',
    source: 'mapbox-dem',
    type: 'line'
  },
  landuse: {
    id: 'landuse',
    name: 'Land Use',
    source: 'composite',
    'source-layer': 'landuse',
    type: 'fill'
  }
};

// Layer configurations
const environmentalLayers = {
  water: {
    id: 'water',
    source: 'composite',
    'source-layer': 'water',
    type: 'fill',
    paint: {
      'fill-color': '#4EA8DE',
      'fill-opacity': 0.8
    }
  },
  vegetation: {
    id: 'vegetation',
    source: 'composite',
    'source-layer': 'landuse',
    type: 'fill',
    filter: ['in', 'class', 'park', 'wood', 'forest', 'grass'],
    paint: {
      'fill-color': '#4CAF50',
      'fill-opacity': 0.6
    }
  },
  wetlands: {
    id: 'wetlands',
    source: 'composite',
    'source-layer': 'landuse',
    type: 'fill',
    filter: ['==', 'class', 'wetland'],
    paint: {
      'fill-color': '#81C784',
      'fill-opacity': 0.6
    }
  }
};

interface MapProps {
  onLocationSelect?: (location: { lng: number; lat: number }) => void;
  onAnalysisComplete?: (data: any) => void;
  onSiteInfoUpdate?: (info: {
    coordinates: [number, number];
    elevation?: number;
    address: string;
    nearbyFeatures?: Array<{name: string; distance: number}>;
    transportation?: Array<string>;
  }) => void;
  onSearchStart?: () => void;
}

export default function Map({ onLocationSelect, onAnalysisComplete, onSiteInfoUpdate, onSearchStart }: MapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  const [lng, setLng] = useState(-70.9);
  const [lat, setLat] = useState(42.35);
  const [zoom, setZoom] = useState(15);
  const [activeLayers, setActiveLayers] = useState<string[]>([]);
  const [selectedStyle, setSelectedStyle] = useState('streets-v12');

  useEffect(() => {
    if (!mapContainer.current || mapInstance) return;

    console.log('=== Map Initialization ===');
    console.log('Container:', mapContainer.current);
    console.log('Style:', `mapbox://styles/mapbox/${selectedStyle}`);
    console.log('Initial center:', [lng, lat]);
    console.log('Initial zoom:', zoom);

    // Initialize map
    mapInstance = new mapboxgl.Map({
      container: mapContainer.current,
      style: `mapbox://styles/mapbox/${selectedStyle}`,
      center: [lng, lat],
      zoom: zoom,
      pitch: 45,
      bearing: 0,
      antialias: true
    });

    // Track if map is fully loaded
    let isMapLoaded = false;

    // Debug map load events
    mapInstance.on('load', () => {
      console.log('=== Map Load Event ===');
      isMapLoaded = true;
      console.log('Map center:', mapInstance?.getCenter());
      console.log('Map zoom:', mapInstance?.getZoom());
      console.log('Map pitch:', mapInstance?.getPitch());
      console.log('Map bearing:', mapInstance?.getBearing());
    });

    // Debug style load events
    mapInstance.on('style.load', () => {
      console.log('=== Style Load Event ===');
      console.log('Map center:', mapInstance?.getCenter());
      console.log('Map zoom:', mapInstance?.getZoom());
      console.log('Map pitch:', mapInstance?.getPitch());
      console.log('Map bearing:', mapInstance?.getBearing());
    });

    // Debug move events
    mapInstance.on('move', () => {
      console.log('=== Map Move Event ===');
      console.log('Map center:', mapInstance?.getCenter());
      console.log('Map zoom:', mapInstance?.getZoom());
      console.log('Map pitch:', mapInstance?.getPitch());
      console.log('Map bearing:', mapInstance?.getBearing());
    });

    // Debug moveend events
    mapInstance.on('moveend', () => {
      console.log('=== Map Move End Event ===');
      console.log('Map center:', mapInstance?.getCenter());
      console.log('Map zoom:', mapInstance?.getZoom());
      console.log('Map pitch:', mapInstance?.getPitch());
      console.log('Map bearing:', mapInstance?.getBearing());
    });

    // Add controls first
    console.log('=== Adding Controls ===');
    mapInstance.addControl(new mapboxgl.NavigationControl(), 'top-right');
    
    // Add geolocation control
    const geolocateControl = new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true
      },
      trackUserLocation: true,
      showUserHeading: true,
      showAccuracyCircle: true,
      fitBoundsOptions: {
        maxZoom: 15,
        duration: 2000
      }
    });

    // Add geolocation control to the map
    mapInstance?.addControl(geolocateControl, 'top-right');

    // Add search control
    const geocoder = new MapboxGeocoder({
      accessToken: mapboxgl.accessToken as string,
      mapboxgl: mapboxgl as any,
      marker: true,
      placeholder: 'Search for a location',
      types: 'address,place,poi,neighborhood,locality,country,region',
      bbox: [-180, -90, 180, 90],
      flyTo: {
        duration: 2000,
        zoom: 15,
        pitch: 45,
        bearing: 0,
        essential: true
      }
    });

    // Add geocoder to the map
    mapInstance?.addControl(geocoder, 'top-right');

    // Initialize marker
    marker.current = new mapboxgl.Marker({
      draggable: true,
      color: '#844BDC'
    });

    // Wait for style to load before adding layers
    mapInstance.on('style.load', () => {
      console.log('Map style loaded');
      
      // Add terrain source
      mapInstance.addSource('mapbox-dem', {
        'type': 'raster-dem',
        'url': 'mapbox://mapbox.mapbox-terrain-dem-v1',
        'tileSize': 512,
        'maxzoom': 14
      });

      // Add hillshade layer
      if (!mapInstance.getLayer('hillshading')) {
        mapInstance.addLayer({
          'id': 'hillshading',
          'source': 'mapbox-dem',
          'type': 'hillshade',
          'layout': {
            'visibility': 'none'
          },
          'paint': {
            'hillshade-illumination-anchor': 'viewport',
            'hillshade-exaggeration': 0.5
          }
        });
      }

      // Enable terrain
      mapInstance.setTerrain({ 'source': 'mapbox-dem', 'exaggeration': 1.5 });

      // Add sky layer
      if (!mapInstance.getLayer('sky')) {
        mapInstance.addLayer({
          'id': 'sky',
          'type': 'sky',
          'paint': {
            'sky-type': 'atmosphere',
            'sky-atmosphere-sun': [0.0, 90.0],
            'sky-atmosphere-sun-intensity': 15
          }
        });
      }

      // Add 3D buildings
      if (!mapInstance.getLayer('3d-buildings')) {
        mapInstance.addLayer({
          'id': '3d-buildings',
          'source': 'composite',
          'source-layer': 'building',
          'filter': ['==', 'extrude', 'true'],
          'type': 'fill-extrusion',
          'minzoom': 15,
          'paint': {
            'fill-extrusion-color': '#aaa',
            'fill-extrusion-height': ['get', 'height'],
            'fill-extrusion-base': ['get', 'min_height'],
            'fill-extrusion-opacity': 0.6
          }
        });
      }

      // Add environmental layers
      Object.values(environmentalLayers).forEach(layer => {
        if (!mapInstance.getLayer(layer.id)) {
          mapInstance.addLayer({
            id: layer.id,
            source: layer.source,
            'source-layer': layer['source-layer'],
            type: layer.type as any,
            filter: layer.filter,
            paint: layer.paint,
            layout: { visibility: 'none' }
          });
        }
      });
    });

    // Helper function to handle navigation
    const navigateToLocation = (map: mapboxgl.Map, coords: [number, number]) => {
      console.log('Starting navigation to:', coords);
      
      // First, ensure we're at the right zoom level
      map.setZoom(15);
      
      // Then move to the location
      map.flyTo({
        center: coords,
        zoom: 15,
        pitch: 45,
        bearing: 0,
        duration: 2000,
        essential: true
      });
    };

    // Helper function to calculate distance between coordinates
    function getDistance(coords1: number[], coords2: number[]) {
      const R = 6371e3; // Earth's radius in meters
      const φ1 = coords1[1] * Math.PI/180;
      const φ2 = coords2[1] * Math.PI/180;
      const Δφ = (coords2[1] - coords1[1]) * Math.PI/180;
      const Δλ = (coords2[0] - coords1[0]) * Math.PI/180;

      const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                Math.cos(φ1) * Math.cos(φ2) *
                Math.sin(Δλ/2) * Math.sin(Δλ/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

      return R * c;
    }

    // Handle search results
    geocoder.on('result', (e) => {
      console.log('=== Search Result Event ===');
      console.log('Full result object:', e.result);
      
      const coords: [number, number] = e.result.center;
      const { place_name } = e.result;
      
      console.log('Search coordinates:', coords);
      console.log('Place name:', place_name);

      // Remove existing marker if any
      if (marker.current) {
        marker.current.remove();
      }

      // Create new marker without popup
      marker.current = new mapboxgl.Marker({
        draggable: true,
        color: '#844BDC'
      })
        .setLngLat(coords)
        .addTo(mapInstance!);

      // Fetch elevation data
      fetch(`https://api.mapbox.com/v4/mapbox.mapbox-terrain-v2/tilequery/${coords[0]},${coords[1]}.json?layers=contour&access_token=${mapboxgl.accessToken}`)
        .then(response => response.json())
        .then(data => {
          const elevation = data.features[0]?.properties?.ele || null;
          
          console.log('=== Initial Site Info Update ===');
          const initialInfo = {
            coordinates: coords,
            elevation: typeof elevation === 'number' ? elevation : undefined,
            address: place_name,
          };
          console.log('Initial site info:', initialInfo);
          onSiteInfoUpdate?.(initialInfo);

          // Fetch nearby features
          const bbox = [
            coords[0] - 0.01,
            coords[1] - 0.01,
            coords[0] + 0.01,
            coords[1] + 0.01
          ];

          // Fetch nearby POIs
          fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${coords[0]},${coords[1]}.json?types=poi&bbox=${bbox.join(',')}&limit=5&access_token=${mapboxgl.accessToken}`)
            .then(response => response.json())
            .then(data => {
              const nearbyFeatures = data.features.map((f: any) => ({
                name: f.text,
                distance: getDistance(coords, f.center) / 1000
              }));

              console.log('=== Site Info Update with Features ===');
              const infoWithFeatures = {
                coordinates: coords,
                elevation: typeof elevation === 'number' ? elevation : undefined,
                address: place_name,
                nearbyFeatures
              };
              console.log('Site info with features:', infoWithFeatures);
              onSiteInfoUpdate?.(infoWithFeatures);

              // Call onAnalysisComplete with the analysis data
              onAnalysisComplete?.({
                elevation,
                features: data.features,
                coordinates: { lng: coords[0], lat: coords[1] }
              });

              // Fetch transportation info
              fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${coords[0]},${coords[1]}.json?types=address&access_token=${mapboxgl.accessToken}`)
                .then(response => response.json())
                .then(data => {
                  const context = data.features[0]?.context || [];
                  const transportation: string[] = [];
                  
                  const road = context.find((c: any) => c.id.startsWith('place'));
                  if (road) {
                    transportation.push(road.text);
                  }

                  console.log('=== Final Site Info Update ===');
                  const finalInfo = {
                    coordinates: coords,
                    elevation: typeof elevation === 'number' ? elevation : undefined,
                    address: place_name,
                    nearbyFeatures,
                    transportation
                  };
                  console.log('Final site info:', finalInfo);
                  onSiteInfoUpdate?.(finalInfo);
                });
            });
        });

      // Update location
      onLocationSelect?.({ lng: coords[0], lat: coords[1] });
    });

    // Handle geocoder errors
    geocoder.on('error', (e) => {
      console.error('=== Geocoder Error ===');
      console.error('Error object:', e.error);
      console.error('Error message:', e.error?.message);
    });

    // Handle geolocation events
    geolocateControl.on('geolocate', (e) => {
      console.log('=== Geolocation Event ===');
      const { coords } = e as GeolocationPosition;
      console.log('Geolocation coordinates:', coords);
      
      // Update location
      onLocationSelect?.({ lng: coords.longitude, lat: coords.latitude });
    });

    // Handle geolocation errors
    geolocateControl.on('error', (e) => {
      console.error('=== Geolocation Error ===');
      console.error('Error code:', e.code);
      console.error('Error message:', e.message);
      
      // Show error to user
      alert('Unable to get your location. Please make sure location services are enabled and try again.');
    });

    // Handle geolocation tracking state changes
    geolocateControl.on('trackuserlocationstart', () => {
      console.log('Started tracking user location');
    });

    geolocateControl.on('trackuserlocationend', () => {
      console.log('Stopped tracking user location');
    });

    // Handle geocoder search start
    geocoder.on('searchstart', () => {
      console.log('=== Search Start Event ===');
      onSearchStart?.();
    });

    // Cleanup
    return () => {
      if (marker.current) {
        marker.current.remove();
        marker.current = null;
      }
    };
  }, [onLocationSelect, onAnalysisComplete, onSiteInfoUpdate, selectedStyle, onSearchStart]);

  // Function to toggle layer visibility
  const toggleLayer = (layerId: string) => {
    if (mapInstance) {
      const visibility = mapInstance.getLayoutProperty(layerId, 'visibility');
      const newVisibility = visibility === 'visible' ? 'none' : 'visible';
      
      mapInstance.setLayoutProperty(layerId, 'visibility', newVisibility);
      
      setActiveLayers(prev => 
        newVisibility === 'visible'
          ? [...prev, layerId]
          : prev.filter(id => id !== layerId)
      );
    }
  };

  // Function to switch map styles
  const switchMapStyle = (style: string) => {
    if (mapInstance) {
      mapInstance.setStyle(`mapbox://styles/mapbox/${style}`);
      setSelectedStyle(style);
    }
  };

  // Function to toggle terrain
  const toggleTerrain = (enabled: boolean) => {
    if (mapInstance) {
      if (enabled) {
        mapInstance.setTerrain({ 'source': 'mapbox-dem', 'exaggeration': 1.5 });
      } else {
        mapInstance.setTerrain(null);
      }
    }
  };

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden">
      <div ref={mapContainer} className="w-full h-full" />
      
      {/* Layer Controls */}
      <div className="absolute top-4 left-4 bg-white p-4 rounded-lg shadow-lg">
        <h3 className="text-sm font-semibold mb-2">Map Layers</h3>
        <div className="space-y-4">
          {/* Base Map Controls */}
          <div>
            <h4 className="text-xs font-medium text-gray-500 mb-2">Base Map</h4>
            <button
              onClick={() => switchMapStyle('satellite-streets-v12')}
              className={`block px-3 py-1.5 text-sm rounded ${
                selectedStyle === 'satellite-streets-v12'
                  ? 'bg-[#844BDC] text-white'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              Satellite View
            </button>
          </div>

          {/* Terrain Controls */}
          <div>
            <h4 className="text-xs font-medium text-gray-500 mb-2">Terrain</h4>
            <div className="space-y-2">
              <button
                onClick={() => toggleLayer('hillshading')}
                className={`block px-3 py-1.5 text-sm rounded w-full text-left ${
                  activeLayers.includes('hillshading')
                    ? 'bg-[#844BDC] text-white'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                Terrain
              </button>
              <button
                onClick={() => toggleLayer('3d-buildings')}
                className={`block px-3 py-1.5 text-sm rounded w-full text-left ${
                  activeLayers.includes('3d-buildings')
                    ? 'bg-[#844BDC] text-white'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                3D Buildings
              </button>
            </div>
          </div>

          {/* Environmental Controls */}
          <div>
            <h4 className="text-xs font-medium text-gray-500 mb-2">Environmental</h4>
            <div className="space-y-2">
              <button
                onClick={() => toggleLayer('water')}
                className={`block px-3 py-1.5 text-sm rounded w-full text-left ${
                  activeLayers.includes('water')
                    ? 'bg-[#844BDC] text-white'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                Water Bodies
              </button>
              <button
                onClick={() => toggleLayer('vegetation')}
                className={`block px-3 py-1.5 text-sm rounded w-full text-left ${
                  activeLayers.includes('vegetation')
                    ? 'bg-[#844BDC] text-white'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                Vegetation
              </button>
              <button
                onClick={() => toggleLayer('wetlands')}
                className={`block px-3 py-1.5 text-sm rounded w-full text-left ${
                  activeLayers.includes('wetlands')
                    ? 'bg-[#844BDC] text-white'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                Wetlands
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 