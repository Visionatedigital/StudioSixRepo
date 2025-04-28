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
  center?: [number, number];
  zoom?: number;
  style?: string;
}

// Helper function to calculate distance between coordinates
const getDistance = (coords1: [number, number], coords2: [number, number]): number => {
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
};

const Map: React.FC<MapProps> = ({
  onLocationSelect,
  onAnalysisComplete,
  onSiteInfoUpdate,
  onSearchStart,
  center = [-0.127758, 51.507351],
  zoom = 10,
  style = 'mapbox://styles/mapbox/streets-v12'
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  const [lng, setLng] = useState(center[0]);
  const [lat, setLat] = useState(center[1]);
  const [mapZoom, setMapZoom] = useState(zoom);
  const [activeLayers, setActiveLayers] = useState<string[]>([]);
  const [selectedStyle, setSelectedStyle] = useState('streets-v12');
  const geolocateControlRef = useRef<mapboxgl.GeolocateControl | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';
    
    if (!map.current) {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: style,
        center: [lng, lat],
        zoom: mapZoom,
        pitch: 45,
        bearing: -17.6,
        antialias: true
      });

      // Add navigation control
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      // Add geolocation control
      geolocateControlRef.current = new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true
        },
        trackUserLocation: true,
        showUserHeading: true
      });
      map.current.addControl(geolocateControlRef.current, 'top-right');

      map.current.on('load', () => {
        if (!map.current) return;

        // Add terrain source
        map.current.addSource('mapbox-dem', {
          'type': 'raster-dem',
          'url': 'mapbox://mapbox.mapbox-terrain-dem-v1',
          'tileSize': 512,
          'maxzoom': 14
        });

        // Add hillshade layer
        map.current.addLayer({
          'id': 'hillshading',
          'source': 'mapbox-dem',
          'type': 'hillshade',
          'paint': {
            'hillshade-exaggeration': 0.5
          }
        });

        // Add 3D terrain
        map.current.setTerrain({ 'source': 'mapbox-dem', 'exaggeration': 1.5 });

        // Add building layer
        map.current.addLayer({
          'id': 'add-3d-buildings',
          'source': 'composite',
          'source-layer': 'building',
          'type': 'fill-extrusion',
          'minzoom': 15,
          'paint': {
            'fill-extrusion-color': '#aaa',
            'fill-extrusion-height': [
              'interpolate',
              ['linear'],
              ['zoom'],
              15,
              0,
              15.05,
              ['get', 'height']
            ],
            'fill-extrusion-base': [
              'interpolate',
              ['linear'],
              ['zoom'],
              15,
              0,
              15.05,
              ['get', 'min_height']
            ],
            'fill-extrusion-opacity': 0.6
          }
        } as mapboxgl.FillExtrusionLayer);

        // Add land use layer
        map.current.addLayer({
          'id': 'land-use',
          'source': 'composite',
          'source-layer': 'landuse',
          'type': 'fill',
          'filter': ['in', 'class', 'park', 'wood', 'grass', 'forest'],
          'paint': {
            'fill-color': '#90EE90',
            'fill-opacity': 0.4
          }
        } as mapboxgl.FillLayer);
      });

      map.current.on('move', () => {
        if (!map.current) return;
        setLng(Number(map.current.getCenter().lng.toFixed(4)));
        setLat(Number(map.current.getCenter().lat.toFixed(4)));
        setMapZoom(Number(map.current.getZoom().toFixed(2)));
      });
    }

    // Initialize marker
    marker.current = new mapboxgl.Marker({
      draggable: true,
      color: '#844BDC'
    });

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
    map.current?.addControl(geocoder, 'top-right');

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
    if (geolocateControlRef.current) {
      geolocateControlRef.current.on('geolocate', (e: { coords: { longitude: number; latitude: number } }) => {
        if (onLocationSelect) {
          onLocationSelect({
            lng: e.coords.longitude,
            lat: e.coords.latitude
          });
        }
      });

      geolocateControlRef.current.on('trackuserlocationstart', () => {
        if (onSearchStart) {
          onSearchStart();
        }
      });
    }

    // Handle geolocation errors
    geolocateControlRef.current?.on('error', (e) => {
      console.error('=== Geolocation Error ===');
      console.error('Error code:', e.code);
      console.error('Error message:', e.message);
      
      // Show error to user
      alert('Unable to get your location. Please make sure location services are enabled and try again.');
    });

    // Handle geolocation tracking state changes
    geolocateControlRef.current?.on('trackuserlocationstart', () => {
      console.log('Started tracking user location');
    });

    geolocateControlRef.current?.on('trackuserlocationend', () => {
      console.log('Stopped tracking user location');
    });

    // Handle geocoder search start
    geocoder.on('searchstart', () => {
      console.log('=== Search Start Event ===');
      onSearchStart?.();
    });

    return () => {
      if (marker.current) {
        marker.current.remove();
        marker.current = null;
      }
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [onLocationSelect, onAnalysisComplete, onSiteInfoUpdate, style, onSearchStart]);

  // Function to toggle layer visibility
  const toggleLayer = (layerId: string) => {
    if (map.current) {
      const visibility = map.current.getLayoutProperty(layerId, 'visibility');
      const newVisibility = visibility === 'visible' ? 'none' : 'visible';
      
      map.current.setLayoutProperty(layerId, 'visibility', newVisibility);
      
      setActiveLayers(prev => 
        newVisibility === 'visible'
          ? [...prev, layerId]
          : prev.filter(id => id !== layerId)
      );
    }
  };

  // Function to switch map styles
  const switchMapStyle = (style: string) => {
    if (map.current) {
      map.current.setStyle(`mapbox://styles/mapbox/${style}`);
      setSelectedStyle(style);
    }
  };

  // Function to toggle terrain
  const toggleTerrain = (enabled: boolean) => {
    if (map.current) {
      if (enabled) {
        map.current.setTerrain({ 'source': 'mapbox-dem', 'exaggeration': 1.5 });
      } else {
        map.current.setTerrain(null);
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
      <div className="absolute bottom-2 left-2 bg-white/80 px-4 py-2 rounded-lg text-sm">
        Longitude: {lng} | Latitude: {lat} | Zoom: {mapZoom}
      </div>
    </div>
  );
};

export default Map; 