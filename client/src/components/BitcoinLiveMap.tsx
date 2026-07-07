import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import coordinatesData from '../data/coordinates.json';
import type { Project } from '../data/projects.types';
import { buildProjectLookup, fetchAllApprovedProjects } from '../lib/projectsApi';
import ProjectsLoadError from './ProjectsLoadError';

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
  locations = true,
}: BitcoinLiveMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<mapboxgl.Map | null>(null);
  const mapReady = useRef(false);
  const navigate = useNavigate();

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_API_KEY || 'pk.eyJ1IjoiZW0wMTMiLCJhIjoiY21iNWxpNzVkMGJyODJqcXN3b2J1NXZpbSJ9.kCtk-1jyDTZATMR_QKSzpA';

  const loadProjects = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchAllApprovedProjects({ force: retryKey > 0 });
      setProjects(data);
    } catch (err) {
      console.error('Error loading map projects:', err);
      setError('Unable to load projects. Please try again.');
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, [retryKey]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const buildGeoJSON = useCallback(
    (projectList: Project[]) => {
      const lookup = buildProjectLookup(projectList);

      const features = coordinatesData.project_coordinates
        .filter((coord) => coord.livemap)
        .map((coord) => {
          const project = lookup.get(coord.proj_id);
          if (!project || project.status !== 'approved') return null;

          return {
            type: 'Feature' as const,
            geometry: {
              type: 'Point' as const,
              coordinates: coord.livemap!.coords,
            },
            properties: {
              id: project.id,
              slug: project.slug || project.id,
              name: project.name,
              description: project.description,
            },
          };
        })
        .filter((feature): feature is NonNullable<typeof feature> => feature !== null);

      return {
        type: 'FeatureCollection' as const,
        features,
      };
    },
    []
  );

  const addLocationMarkers = useCallback(
    (map: mapboxgl.Map, projectList: Project[]) => {
      const geoJsonData = buildGeoJSON(projectList);

      if (!geoJsonData.features || geoJsonData.features.length === 0) {
        return;
      }

      if (map.getLayer('bitcoin-projects-layer')) {
        map.removeLayer('bitcoin-projects-layer');
      }
      if (map.getSource('bitcoin-projects')) {
        map.removeSource('bitcoin-projects');
      }

      map.addSource('bitcoin-projects', {
        type: 'geojson',
        data: geoJsonData,
      });

      const size = 80;
      const customPointer: any = {
        width: size,
        height: size,
        data: new Uint8ClampedArray(size * size * 4),
        onAdd: function onAdd() {
          const canvas = document.createElement('canvas');
          canvas.width = this.width;
          canvas.height = this.height;
          this.context = canvas.getContext('2d')!;
        },
        render: function render() {
          const duration = 2000;
          const t = (performance.now() % duration) / duration;
          const context = this.context!;
          const centerX = this.width / 2;
          const centerY = this.height / 2 - 10;

          context.clearRect(0, 0, this.width, this.height);

          const pulseRadius = 20 + 12 * Math.sin(t * Math.PI * 2);
          context.beginPath();
          context.arc(centerX, centerY, pulseRadius, 0, Math.PI * 2);
          context.fillStyle = `rgba(255, 200, 50, ${0.5 * (1 - t)})`;
          context.fill();

          context.beginPath();
          context.ellipse(centerX, centerY + 38, 14, 6, 0, 0, Math.PI * 2);
          context.fillStyle = 'rgba(0, 0, 0, 0.6)';
          context.fill();

          context.beginPath();
          context.arc(centerX, centerY, 18, 0, Math.PI * 2);
          context.fillStyle = '#ff7800';
          context.fill();
          context.strokeStyle = '#ffffff';
          context.lineWidth = 1;
          context.stroke();

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

      map.on('click', 'bitcoin-projects-layer', (e) => {
        e.originalEvent.preventDefault();
        e.originalEvent.stopPropagation();

        const props = e.features?.[0]?.properties;
        const slug = props?.slug || props?.id;
        if (slug) {
          navigate(`/project/${slug}`);
        }
      });

      map.on('mouseenter', 'bitcoin-projects-layer', () => {
        map.getCanvas().style.cursor = 'pointer';
      });

      map.on('mouseleave', 'bitcoin-projects-layer', () => {
        map.getCanvas().style.cursor = '';
      });
    },
    [buildGeoJSON, navigate]
  );

  useEffect(() => {
    if (!mapContainer.current || mapInstance.current) {
      return;
    }

    mapboxgl.accessToken = MAPBOX_TOKEN;

    try {
      mapInstance.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: `mapbox://styles/mapbox/${style}`,
        center: [lng, lat],
        zoom,
        pitch,
        bearing,
        antialias: true,
        interactive: true,
      });

      const map = mapInstance.current;
      map.addControl(new mapboxgl.NavigationControl());
      map.addControl(new mapboxgl.FullscreenControl());

      map.on('mousemove', (e) => {
        const { lng: centerLng } = map.getCenter();
        map.setBearing((e.lngLat.lng - centerLng) / 10);
      });

      map.on('load', () => {
        map.addSource('mapbox-dem', {
          type: 'raster-dem',
          url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
          tileSize: 512,
          maxzoom: 14,
        });

        if (terrain === 'true') {
          map.setTerrain({ source: 'mapbox-dem', exaggeration: 1.5 });
        }

        const layers = map.getStyle().layers;
        const labelLayerId = layers?.find(
          (layer) => layer.type === 'symbol' && layer.layout?.['text-field']
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

        mapReady.current = true;
        if (locations && projects.length > 0) {
          addLocationMarkers(map, projects);
        }
      });

      map.on('error', (e) => {
        console.error('Mapbox error:', e);
      });
    } catch (mapError) {
      console.error('Failed to create map:', mapError);
    }

    return () => {
      mapInstance.current?.remove();
      mapInstance.current = null;
      mapReady.current = false;
    };
  }, []);

  useEffect(() => {
    if (!locations || loading || error || projects.length === 0) {
      return;
    }

    const map = mapInstance.current;
    if (map && mapReady.current) {
      addLocationMarkers(map, projects);
    }
  }, [projects, loading, error, locations, addLocationMarkers]);

  if (error) {
    return (
      <div className="bitcoin-livemap-wrapper" style={{ position: 'relative', width, height }}>
        <ProjectsLoadError onRetry={() => setRetryKey((k) => k + 1)} />
      </div>
    );
  }

  return (
    <div className="bitcoin-livemap-wrapper" style={{ position: 'relative', width, height }}>
      <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />
      {loading && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(255,255,255,0.7)',
            color: '#6B7280',
            fontSize: '0.9375rem',
          }}
        >
          Loading map projects...
        </div>
      )}
      <div className="livemap-overlay-controls">
        <button
          type="button"
          className="livemap-overlay-btn livemap-home-btn"
          onClick={() => navigate('/')}
          aria-label="Back to home"
          title="Back to home"
        >
          <Home size={22} strokeWidth={2.25} />
          <span>Home</span>
        </button>
      </div>
    </div>
  );
}
