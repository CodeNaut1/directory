import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import projectsData from '../data/projects.json';
import coordinatesData from '../data/coordinates.json';

interface BitcoinLiveMapProps {
  width?: string;
  height?: string;
  lat?: number;
  lng?: number;
  zoom?: number;
  pitch?: number;
  bearing?: number;
  style?: string;
  terrain?: string;
  buildings?: string;
  controls?: boolean;
  locations?: boolean;
}

export default function BitcoinLiveMap({
  width = '100%',
  height = '500px',
  lat = 1.0,
  lng = 30.0,
  zoom = 2,
  pitch = 45,
  bearing = 0,
  style = 'light-v10',
  terrain = 'false',
  buildings = 'false',
  controls = false,
  locations = true,
}: BitcoinLiveMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const navigate = useNavigate();

  const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_API_KEY || 'pk.eyJ1IjoiZW0wMTMiLCJhIjoiY21iNWxpNzVkMGJyODJqcXN3b2J1NXZpbSJ9.kCtk-1jyDTZATMR_QKSzpA';

  useEffect(() => {
    if (!mapContainer.current) {
      console.error('❌ Map container ref is null!');
      return;
    }

    if (mapInstance.current) {
      return;
    }

    mapboxgl.accessToken = MAPBOX_TOKEN;

    try {
      // Create map
      mapInstance.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: `mapbox://styles/mapbox/${style}`,
        center: [lng, lat],
        zoom: zoom,
        pitch: pitch,
        bearing: bearing,
        antialias: true,
        interactive: true,
      });

      const map = mapInstance.current;

      // Add navigation controls
      map.addControl(new mapboxgl.NavigationControl());
      map.addControl(new mapboxgl.FullscreenControl());

      // Setup mouse rotation
      map.on('mousemove', (e: any) => {
        const { lng: centerLng } = map.getCenter();
        const bearing = (e.lngLat.lng - centerLng) / 10;
        map.setBearing(bearing);
      });

      // On map load
      map.on('load', () => {
        // Setup terrain source
        map.addSource('mapbox-dem', {
          type: 'raster-dem',
          url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
          tileSize: 512,
          maxzoom: 14,
        });

        if (terrain === 'true') {
          map.setTerrain({ source: 'mapbox-dem', exaggeration: 1.5 });
        }

        // Setup 3D buildings
        const layers = map.getStyle().layers;
        const labelLayerId = layers?.find(
          (layer: any) => layer.type === 'symbol' && layer.layout?.['text-field']
        )?.id;

        if (labelLayerId) {
          map.addLayer(
            {
              id: '3d-buildings',
              source: 'composite',
              'source-layer': 'building',
              filter: ['==', 'extrude', 'true'],
              type: 'fill-extrusion',
              minzoom: 15,
              paint: {
                'fill-extrusion-color': ['case', ['boolean', ['feature-state', 'hover'], false], '#ff6b6b', '#aaa'],
                'fill-extrusion-height': ['interpolate', ['linear'], ['zoom'], 15, 0, 15.05, ['get', 'height']],
                'fill-extrusion-base': ['interpolate', ['linear'], ['zoom'], 15, 0, 15.05, ['get', 'min_height']],
                'fill-extrusion-opacity': 0.8,
              },
              layout: {
                visibility: buildings === 'true' ? 'visible' : 'none',
              },
            },
            labelLayerId
          );
        }

        // Add locations if enabled
        if (locations) {
          addLocationMarkers(map);
        }
      });

      map.on('error', (e: any) => {
        console.error('❌ Mapbox error:', e);
      });

    } catch (error) {
      console.error('❌ Failed to create map:', error);
    }

    return () => {
      mapInstance.current?.remove();
      mapInstance.current = null;
    };
  }, []);

  // Build GeoJSON from new data structure
  const buildGeoJSON = () => {
    const features = coordinatesData.project_coordinates
      .filter(coord => coord.livemap) // Only include projects with livemap coordinates
      .map(coord => {
        // Find matching project data
        const project = projectsData.projects.find(
          (p) => p.id === coord.proj_id && p.status === 'approved'
        );

        if (!project) return null;

        return {
          type: 'Feature' as const,
          geometry: {
            type: 'Point' as const,
            coordinates: coord.livemap!.coords, // [lng, lat]
          },
          properties: {
            id: project.id,
            name: project.name,
            description: project.description,
          },
        };
      })
      .filter(Boolean); // Remove nulls

    return {
      type: 'FeatureCollection' as const,
      features,
    };
  };

  // Add location markers function
  const addLocationMarkers = (map: any) => {
    const geoJsonData = buildGeoJSON();

    if (!geoJsonData.features || geoJsonData.features.length === 0) {
      console.error('❌ No location data available');
      return;
    }

    // Remove existing layers/sources
    if (map.getLayer('bitcoin-projects-layer')) {
      map.removeLayer('bitcoin-projects-layer');
    }
    if (map.getSource('bitcoin-projects')) {
      map.removeSource('bitcoin-projects');
    }

    // Add source
    map.addSource('bitcoin-projects', {
      type: 'geojson',
      data: geoJsonData,
    });

    // Create custom pointer
    const size = 80;
    const customPointer: any = {
      width: size,
      height: size,
      data: new Uint8Array(size * size * 4),
      onAdd: function () {
        const canvas = document.createElement('canvas');
        canvas.width = this.width;
        canvas.height = this.height;
        this.context = canvas.getContext('2d');
      },
      render: function () {
        const duration = 2000;
        const t = (performance.now() % duration) / duration;
        const context = this.context!;
        const centerX = this.width / 2;
        const centerY = this.height / 2 - 10;

        context.clearRect(0, 0, this.width, this.height);

        // Pulse
        const pulseRadius = 20 + 12 * Math.sin(t * Math.PI * 2);
        context.beginPath();
        context.arc(centerX, centerY, pulseRadius, 0, Math.PI * 2);
        context.fillStyle = `rgba(255, 200, 50, ${0.5 * (1 - t)})`;
        context.fill();

        // Shadow
        context.beginPath();
        context.ellipse(centerX, centerY + 38, 14, 6, 0, 0, Math.PI * 2);
        context.fillStyle = 'rgba(0, 0, 0, 0.6)';
        context.fill();

        // Main circle
        context.beginPath();
        context.arc(centerX, centerY, 18, 0, Math.PI * 2);
        context.fillStyle = '#ff7800';
        context.fill();
        context.strokeStyle = '#ffffff';
        context.lineWidth = 1;
        context.stroke();

        // Triangle pointer
        context.beginPath();
        context.moveTo(centerX, centerY + 35);
        context.lineTo(centerX - 14, centerY + 9);
        context.lineTo(centerX + 14, centerY + 9);
        context.closePath();
        context.fillStyle = '#ff7800';
        context.fill();

        context.beginPath();
        context.moveTo(centerX - 14, centerY + 9);
        context.lineTo(centerX, centerY + 35);
        context.lineTo(centerX + 14, centerY + 9);
        context.strokeStyle = '#ffffff';
        context.lineWidth = 1;
        context.stroke();

        // Inner circle
        context.beginPath();
        context.arc(centerX, centerY, 9, 0, Math.PI * 2);
        context.fillStyle = '#ffffff';
        context.fill();

        this.data = context.getImageData(0, 0, this.width, this.height).data;
        return true;
      },
    };

    if (!map.hasImage('custom-bitcoin-pointer')) {
      map.addImage('custom-bitcoin-pointer', customPointer, { pixelRatio: 2 });
    }

    // Add layer
    map.addLayer({
      id: 'bitcoin-projects-layer',
      type: 'symbol',
      source: 'bitcoin-projects',
      layout: {
        'icon-image': 'custom-bitcoin-pointer',
        'icon-allow-overlap': true,
        'icon-ignore-placement': true,
        'icon-anchor': 'bottom',
      },
    });

    // Click handler - Navigate directly to project page
    map.on('click', 'bitcoin-projects-layer', (e: any) => {
      e.originalEvent.preventDefault();
      e.originalEvent.stopPropagation();

      const props = e.features[0].properties;
      const projectId = props.id;

      if (projectId) {
        navigate(`/project/${projectId}`);
      }
    });

    // Cursor change
    map.on('mouseenter', 'bitcoin-projects-layer', () => {
      map.getCanvas().style.cursor = 'pointer';
    });

    map.on('mouseleave', 'bitcoin-projects-layer', () => {
      map.getCanvas().style.cursor = '';
    });
  };

  return (
    <div style={{ position: 'relative', width, height }}>
      <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />
    </div>
  );
}