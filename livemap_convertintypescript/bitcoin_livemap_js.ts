/**
 * Bitcoin Live Map 3D TypeScript
 * Handles all map functionality and interactions
 */

// Type definitions for Mapbox GL JS (if not already installed, you may need @types/mapbox-gl)
declare const mapboxgl: any; // You can install @types/mapbox-gl for proper typing

/**
 * Configuration interface for the map
 */
interface BitcoinLiveMapConfig {
  lat?: string | number;
  lng?: string | number;
  zoom?: string | number;
  pitch?: string | number;
  bearing?: string | number;
  style?: string;
  terrain?: string;
  buildings?: string;
  locations?: string;
}

/**
 * Global configuration interface
 */
interface BitcoinLiveMapGlobalConfig {
  apiKey: string;
  nonce: string;
  ajaxUrl: string;
  iconBaseUrl: string;
}

/**
 * Location feature properties
 */
interface LocationProperties {
  name: string;
  description?: string;
  image?: string;
  link?: string;
  twitter?: string;
  linkedin?: string;
  instagram?: string;
  nostr?: string;
  location?: string;
  category?: string;
  sector?: string;
  founder_name?: string;
  founder?: string;
  founder_twitter?: string;
  active?: boolean;
  country_code?: string;
}

/**
 * GeoJSON Feature with typed properties
 */
interface LocationFeature {
  type: 'Feature';
  geometry: {
    type: 'Point';
    coordinates: [number, number];
  };
  properties: LocationProperties;
}

/**
 * GeoJSON FeatureCollection
 */
interface LocationFeatureCollection {
  type: 'FeatureCollection';
  features: LocationFeature[];
}

/**
 * AJAX Response interface
 */
interface AjaxResponse {
  success: boolean;
  data: LocationFeatureCollection | string;
}

/**
 * Marker options interface
 */
interface CustomMarkerOptions {
  element?: HTMLElement;
  popup?: string;
}

/**
 * FlyTo options interface
 */
interface FlyToOptions {
  zoom?: number;
  pitch?: number;
  bearing?: number;
  duration?: number;
}

/**
 * Social link type
 */
type SocialLinkType = 'website' | 'twitter' | 'linkedin' | 'instagram' | 'nostr';

/**
 * Custom pointer image interface
 */
interface CustomImage {
  width: number;
  height: number;
  data: Uint8Array;
  context?: CanvasRenderingContext2D;
  onAdd: () => void;
  render: () => boolean;
}

/**
 * Bitcoin Live Map Class
 */
class BitcoinLiveMap {
  private element: HTMLElement;
  private mapId: string;
  private config: BitcoinLiveMapConfig;
  private map: any; // mapboxgl.Map - use proper type if @types/mapbox-gl is installed
  private terrainEnabled: boolean;
  private buildingsEnabled: boolean;
  private locations: LocationFeatureCollection | null;
  private markers: any[];

  constructor(element: HTMLElement) {
    this.element = element;
    this.mapId = element.id;
    this.config = JSON.parse(element.dataset.config || '{}') as BitcoinLiveMapConfig;
    this.map = null;
    this.terrainEnabled = false;
    this.buildingsEnabled = false;
    this.locations = null;
    this.markers = [];

    this.init();
  }

  private init(): void {
    if (typeof mapboxgl === 'undefined' || !(window as any).bitcoinLiveMapConfig?.apiKey) {
      console.error('Mapbox GL JS not loaded or API key missing');
      return;
    }

    // Ensure the container is empty
    this.element.innerHTML = '';

    // Debug: Log the configuration
    console.log('Bitcoin Live Map Config:', this.config);
    console.log('Bitcoin Live Map container:', this.element);

    const globalConfig = (window as any).bitcoinLiveMapConfig as BitcoinLiveMapGlobalConfig;
    mapboxgl.accessToken = globalConfig.apiKey;
    this.createMap();
    this.setupEventListeners();

    if (this.config.locations === 'true') {
      this.loadLocations();
    }
  }

  private createMap(): void {
    // Use config values or fallback to Africa defaults
    const lat = parseFloat(String(this.config.lat || 1.0));
    const lng = parseFloat(String(this.config.lng || 20.0));
    const zoom = parseFloat(String(this.config.zoom || 2.5));
    const pitch = parseFloat(String(this.config.pitch || 20));
    const bearing = parseFloat(String(this.config.bearing || 0));

    this.map = new mapboxgl.Map({
      container: this.mapId,
      style: `mapbox://styles/mapbox/${this.config.style || 'satellite-streets-v12'}`,
      center: [lng, lat],
      zoom: zoom,
      pitch: pitch,
      bearing: bearing,
      antialias: true,
      interactive: true,
    });

    this.map.on('load', () => this.onMapLoad());

    // Add navigation controls
    this.map.addControl(new mapboxgl.NavigationControl());
    this.map.addControl(new mapboxgl.FullscreenControl());

    // Add mouse-driven 3D rotation for Africa view
    this.setupMouseRotation();
  }

  private setupMouseRotation(): void {
    this.map.on('mousemove', (e: any) => {
      const { lng } = this.map.getCenter();
      const bearing = (e.lngLat.lng - lng) / 10; // Subtle rotation
      this.map.setBearing(bearing);
    });
  }

  private onMapLoad(): void {
    this.setupTerrain();
    this.setupBuildings();

    if (this.config.locations === 'true') {
      this.loadLocations();

      ['bitcoin-projects-layer', 'bitcoin-projects-labels'].forEach((layer) => {
        this.map.on('mouseenter', layer, () => {
          this.map.getCanvas().style.cursor = 'pointer';
        });
        this.map.on('mouseleave', layer, () => {
          this.map.getCanvas().style.cursor = '';
        });
      });
    }

    console.log('Map loaded, locations data:', this.locations);
    this.element.dispatchEvent(
      new CustomEvent('mapLoaded', {
        detail: { map: this.map, instance: this },
      })
    );
  }

  private setupTerrain(): void {
    // Add terrain source
    this.map.addSource('mapbox-dem', {
      type: 'raster-dem',
      url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
      tileSize: 512,
      maxzoom: 14,
    });

    if (this.config.terrain === 'true') {
      this.enableTerrain();
    }
  }

  private setupBuildings(): void {
    const layers = this.map.getStyle().layers;
    const labelLayerId = layers.find(
      (layer: any) => layer.type === 'symbol' && layer.layout?.['text-field']
    )?.id;

    if (!labelLayerId) {
      console.warn('Label layer not found, buildings may not render correctly');
      return;
    }

    this.map.addLayer(
      {
        id: `3d-buildings-${this.mapId}`,
        source: 'composite',
        'source-layer': 'building',
        filter: ['==', 'extrude', 'true'],
        type: 'fill-extrusion',
        minzoom: 15,
        paint: {
          'fill-extrusion-color': [
            'case',
            ['boolean', ['feature-state', 'hover'], false],
            '#ff6b6b',
            '#aaa',
          ],
          'fill-extrusion-height': [
            'interpolate',
            ['linear'],
            ['zoom'],
            15,
            0,
            15.05,
            ['get', 'height'],
          ],
          'fill-extrusion-base': [
            'interpolate',
            ['linear'],
            ['zoom'],
            15,
            0,
            15.05,
            ['get', 'min_height'],
          ],
          'fill-extrusion-opacity': 0.8,
        },
      },
      labelLayerId
    );

    if (this.config.buildings === 'true') {
      this.buildingsEnabled = true;
    } else {
      this.toggleBuildings();
    }

    // Add building hover effects
    this.setupBuildingHover();
  }

  private setupBuildingHover(): void {
    let hoveredBuildingId: number | null = null;

    this.map.on('mousemove', `3d-buildings-${this.mapId}`, (e: any) => {
      if (e.features.length > 0) {
        if (hoveredBuildingId !== null) {
          this.map.setFeatureState(
            {
              source: 'composite',
              sourceLayer: 'building',
              id: hoveredBuildingId,
            },
            { hover: false }
          );
        }
        hoveredBuildingId = e.features[0].id;
        this.map.setFeatureState(
          {
            source: 'composite',
            sourceLayer: 'building',
            id: hoveredBuildingId,
          },
          { hover: true }
        );
      }
    });

    this.map.on('mouseleave', `3d-buildings-${this.mapId}`, () => {
      if (hoveredBuildingId !== null) {
        this.map.setFeatureState(
          {
            source: 'composite',
            sourceLayer: 'building',
            id: hoveredBuildingId,
          },
          { hover: false }
        );
      }
      hoveredBuildingId = null;
    });
  }

  private loadLocations(): void {
    const globalConfig = (window as any).bitcoinLiveMapConfig as BitcoinLiveMapGlobalConfig;
    const formData = new FormData();
    formData.append('action', 'get_map_locations');
    formData.append('nonce', globalConfig.nonce);

    fetch(globalConfig.ajaxUrl, {
      method: 'POST',
      body: formData,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data: AjaxResponse) => {
        if (data.success) {
          this.locations = data.data as LocationFeatureCollection;
          console.log('Loaded locations:', this.locations);
          this.addLocationMarkers(); // Ensure this runs after locations are set
        } else {
          console.error('AJAX error:', data.data);
        }
      })
      .catch((error) => console.error('Error loading locations:', error));
  }

  private addLocationMarkers(): void {
    if (!this.locations || !Array.isArray(this.locations.features)) {
      console.error('Invalid locations data:', this.locations);
      return;
    }

    console.log(`Adding ${this.locations.features.length} locations to map`);

    // 1) Remove existing layer
    if (this.map.getLayer('bitcoin-projects-layer')) {
      this.map.removeLayer('bitcoin-projects-layer');
    }
    // 2) Then remove existing source
    if (this.map.getSource('bitcoin-projects')) {
      this.map.removeSource('bitcoin-projects');
    }
    // 3) Re-add source
    this.map.addSource('bitcoin-projects', {
      type: 'geojson',
      data: this.locations,
    });

    // Create the NEW enhanced custom pointer marker image
    const size = 80;
    const customPointer: CustomImage = {
      width: size,
      height: size,
      data: new Uint8Array(size * size * 4),
      onAdd: function (this: CustomImage) {
        const canvas = document.createElement('canvas');
        canvas.width = this.width;
        canvas.height = this.height;
        this.context = canvas.getContext('2d') as CanvasRenderingContext2D;
      },
      render: function (this: CustomImage): boolean {
        const duration = 2000;
        const t = (performance.now() % duration) / duration;

        const context = this.context!;
        const centerX = this.width / 2;
        const centerY = this.height / 2 - 10;

        context.clearRect(0, 0, this.width, this.height);

        // Blinker (pulse) - animate!
        const pulseRadius = 20 + 12 * Math.sin(t * Math.PI * 2);
        context.beginPath();
        context.arc(centerX, centerY, pulseRadius, 0, Math.PI * 2);
        context.fillStyle = `rgba(255, 200, 50, ${0.5 * (1 - t)})`;
        context.fill();

        // Shadow ellipse below marker
        context.beginPath();
        context.ellipse(centerX, centerY + 38, 14, 6, 0, 0, Math.PI * 2);
        context.fillStyle = 'rgba(0, 0, 0, 0.6)';
        context.fill();

        // Main marker (slightly bigger top)
        context.beginPath();
        context.arc(centerX, centerY, 18, 0, Math.PI * 2);
        context.fillStyle = '#ff7800';
        context.fill();
        context.strokeStyle = '#ffffff';
        context.lineWidth = 1;
        context.stroke();

        // Triangle pointer
        // Step 1: Fill the triangle shape
        context.beginPath();
        context.moveTo(centerX, centerY + 35);
        context.lineTo(centerX - 14, centerY + 9);
        context.lineTo(centerX + 14, centerY + 9);
        context.closePath();
        context.fillStyle = '#ff7800';
        context.fill();

        // Step 2: Manually stroke only the left and right sides (no top)
        context.beginPath();
        context.moveTo(centerX - 14, centerY + 9);
        context.lineTo(centerX, centerY + 35);
        context.lineTo(centerX + 14, centerY + 9);
        context.strokeStyle = '#ffffff';
        context.lineWidth = 1;
        context.stroke();

        // Inner circle - transparent white
        context.beginPath();
        context.arc(centerX, centerY, 9, 0, Math.PI * 2);
        context.fillStyle = '#ffffff';
        context.fill();

        // Commit to canvas
        this.data = context.getImageData(0, 0, this.width, this.height).data;
        return true;
      },
    };

    // Before addImage, check:
    if (!this.map.hasImage('custom-bitcoin-pointer')) {
      this.map.addImage('custom-bitcoin-pointer', customPointer, { pixelRatio: 2 });
    }

    // ── FIX: Add your layer exactly once, right after the image is registered ──
    this.map.addLayer({
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

    console.log('Added NEW custom bitcoin-projects-layer and labels');

    // Add click handler for popups - ONLY for the markers
    this.map.on('click', 'bitcoin-projects-layer', (e: any) => {
      e.originalEvent.preventDefault();
      e.originalEvent.stopPropagation();

      console.log('Marker clicked:', e.features[0].properties.name);

      const props = e.features[0].properties as LocationProperties;
      const coordinates = e.features[0].geometry.coordinates.slice() as [number, number];

      // Ensure that if the map is zoomed out such that multiple
      // copies of the feature are visible, the popup appears
      // over the copy being pointed to.
      while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
      }

      // On click Zoom to location with a target zoom of 5
      this.map.flyTo({
        center: coordinates,
        zoom: 5,
        duration: 1000,
      });

      this.showProjectPopup(props, coordinates);
    });

    // Change cursor on hover - for both icons and labels
    this.map.on('mouseenter', 'bitcoin-projects-layer', () => {
      this.map.getCanvas().style.cursor = 'pointer';
    });

    this.map.on('mouseleave', 'bitcoin-projects-layer', () => {
      this.map.getCanvas().style.cursor = '';
    });

    this.map.on('mouseenter', 'bitcoin-projects-labels', () => {
      this.map.getCanvas().style.cursor = 'pointer';
    });

    this.map.on('mouseleave', 'bitcoin-projects-labels', () => {
      this.map.getCanvas().style.cursor = '';
    });

    console.log('Enhanced location markers setup complete');
  }

  private showProjectPopup(props: LocationProperties, coordinates: [number, number]): void {
    console.log('✅ showProjectPopup fired', props.name);

    // 1) Clean up any existing popups or overlays
    document.querySelectorAll('.bitcoin-livemap-popup').forEach((el) => el.remove());
    document.querySelectorAll('.bitcoin-livemap-popup-overlay').forEach((el) => el.remove());

    // 2) Create the overlay
    const overlay = document.createElement('div');
    overlay.className = 'bitcoin-livemap-popup-overlay';
    document.body.appendChild(overlay);

    // 3) Build the flag or globe HTML
    let flagHtml: string;
    if (props.country_code && props.country_code.length === 2) {
      const iso = props.country_code.toLowerCase();
      // Tooltip text = last segment of location, or uppercase ISO
      const countryName =
        (props.location || '').split(',').pop()?.trim() || iso.toUpperCase();
      flagHtml = `<span class="project-flag fi fi-${iso}" title="${countryName}"></span>`;
    } else {
      flagHtml = `<span class="project-flag" title="Africa wide">🌐</span>`;
    }

    // 4) Create the popup container
    const popup = document.createElement('div');
    popup.className = 'bitcoin-livemap-popup';
    popup.innerHTML = `
      <div class="popup-header-top">
        <h3 class="header-title">Project Spotlight</h3>
        <span class="close-popup">×</span>
      </div>
      <div class="popup-content-wrapper">
        <div class="popup-header">
          <div class="project-title">
            <img src="${props.image || 'https://via.placeholder.com/40'}"
                 alt="${props.name}" class="project-logo" />
            <h4 class="project-name">${props.name}</h4>
            ${flagHtml}
          </div>
        </div>
        <div class="project-description">
          <p>${props.description || 'No description available'}</p>
        </div>
        <div class="project-socials">
          ${props.link ? this.createSocialLink('website', props.link) : ''}
          ${props.twitter ? this.createSocialLink('twitter', props.twitter) : ''}
          ${props.linkedin ? this.createSocialLink('linkedin', props.linkedin) : ''}
          ${props.instagram ? this.createSocialLink('instagram', props.instagram) : ''}
          ${props.nostr ? this.createSocialLink('nostr', props.nostr) : ''}
        </div>
        <div class="project-details">
          <div class="detail-item city">
            <p class="detail-label">
              <img src="https://bitcoiners.africa/wp-content/uploads/2025/04/location-icon.png" alt="Location icon" />LOCATION
            </p>
            <p class="detail-value">${props.location || 'Unknown'}</p>
          </div>
          <div class="detail-item sector">
            <p class="detail-label">
              <img src="https://bitcoiners.africa/wp-content/uploads/2025/04/puzzle-icon.png" alt="Industry icon" />SECTOR
            </p>
            <p class="detail-value">${props.category || props.sector || 'Unknown'}</p>
          </div>
        </div>
        <div class="detail-item founder">
          <p class="detail-label">
            <img src="https://bitcoiners.africa/wp-content/uploads/2025/04/user-icon.png" alt="Founder icon" />FOUNDER INFORMATION
          </p>
          <p class="detail-value">${props.founder_name || props.founder || 'Not available'}</p>
          ${
            props.founder_twitter
              ? `<a href="${props.founder_twitter}" target="_blank">${this.extractHandle(
                  props.founder_twitter
                )}</a>`
              : '<a href="#" target="_blank">No information</a>'
          }
        </div>
        <div class="detail-item activity">
          <p class="detail-label">
            <img src="https://bitcoiners.africa/wp-content/uploads/2025/04/activity-icon.png" alt="Activity icon" />ACTIVITY STATUS
          </p>
          <p class="detail-value ${
            props.active === false ? 'status-inactive' : 'status-active'
          }">
            ${
              props.active === false
                ? 'Not active recently <i class="fas fa-ban"></i>'
                : 'Active in the Last 3 months <i class="far fa-check-circle"></i>'
            }
          </p>
        </div>
      </div>
    `;

    // 5) Append and wire up close behavior
    document.body.appendChild(popup);
    const closeBtn = popup.querySelector('.close-popup');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        popup.remove();
        overlay.remove();
      });
    }

    overlay.addEventListener('click', () => {
      popup.remove();
      overlay.remove();
    });

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        popup.remove();
        overlay.remove();
        document.removeEventListener('keydown', handleEscape);
      }
    };

    document.addEventListener('keydown', handleEscape);

    // 6) Make sure they're visible
    popup.style.display = 'block';
    overlay.style.display = 'block';
  }

  // Helper method to create social links
  private createSocialLink(type: SocialLinkType, url: string): string {
    const globalConfig = (window as any).bitcoinLiveMapConfig as BitcoinLiveMapGlobalConfig;
    const icons: Record<SocialLinkType, string> = {
      website: 'globe-vector.png',
      twitter: 'twitter-vector.png',
      linkedin: 'Linkedin-logo.svg',
      instagram: 'instagram1.svg',
      nostr: 'nostr-logo-purple-trasparent.svg',
    };
    const src = globalConfig.iconBaseUrl + icons[type];
    let displayText = url.replace(/https?:\/\/(www\.)?/, '').split('/')[0];
    if (type === 'twitter' && url.includes('twitter.com')) {
      displayText = `@${url.split('/').pop()}`;
    }
    return `
      <div class="${type}">
        <a href="${url}" target="_blank" rel="noopener">
          <img src="${src}" alt="${type} icon"/>
          <p>${displayText}</p>
        </a>
      </div>
    `;
  }

  // Helper to extract username from a URL
  private extractHandle(url: string): string {
    if (!url) return 'View profile';
    const parts = url.split('/');
    return `@${parts[parts.length - 1]}`;
  }

  private setupEventListeners(): void {
    const controls = document.querySelector(`[data-map-id="${this.mapId}"]`);
    if (!controls) {
      console.log('No controls found for map:', this.mapId);
      return;
    }

    controls.addEventListener('click', (e: Event) => {
      const target = e.target as HTMLElement;
      if (!target.classList.contains('map-control-btn')) return;

      const action = target.dataset.action;
      if (action) {
        this.handleControlAction(action);
      }
    });
  }

  private handleControlAction(action: string): void {
    switch (action) {
      case 'toggle-terrain':
        this.toggleTerrain();
        break;
      case 'toggle-buildings':
        this.toggleBuildings();
        break;
      case 'reset-view':
        this.resetView();
        break;
      case 'show-locations':
        this.showAllLocations();
        break;
    }
  }

  private toggleTerrain(): void {
    if (this.terrainEnabled) {
      this.map.setTerrain(null);
      this.terrainEnabled = false;
    } else {
      this.enableTerrain();
    }
  }

  private enableTerrain(): void {
    this.map.setTerrain({
      source: 'mapbox-dem',
      exaggeration: 1.5,
    });
    this.terrainEnabled = true;
  }

  private toggleBuildings(): void {
    const visibility = this.buildingsEnabled ? 'none' : 'visible';
    this.map.setLayoutProperty(`3d-buildings-${this.mapId}`, 'visibility', visibility);
    this.buildingsEnabled = !this.buildingsEnabled;
  }

  private resetView(): void {
    // Use config values or fallback to Africa defaults
    const lat = parseFloat(String(this.config.lat || 1.0));
    const lng = parseFloat(String(this.config.lng || 20.0));
    const zoom = parseFloat(String(this.config.zoom || 2.5));
    const pitch = parseFloat(String(this.config.pitch || 20));
    const bearing = parseFloat(String(this.config.bearing || 0));

    this.map.flyTo({
      center: [lng, lat],
      zoom: zoom,
      pitch: pitch,
      bearing: bearing,
      essential: true,
      duration: 2000,
    });
  }

  private showAllLocations(): void {
    if (this.locations?.features && this.locations.features.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();

      this.locations.features.forEach((feature) => {
        bounds.extend(feature.geometry.coordinates);
      });

      this.map.fitBounds(bounds, {
        padding: 50,
        duration: 2000,
        pitch: 20, // Maintain 3D view
        bearing: 0,
      });
    } else {
      // Fallback to Africa view if no locations
      this.map.flyTo({
        center: [1.0, 20], // Center of Africa
        zoom: 2,
        pitch: 20,
        bearing: 0,
        duration: 2000,
      });
    }
  }

  // Public API methods
  public getMap(): any {
    return this.map;
  }

  public addCustomMarker(lngLat: [number, number], options: CustomMarkerOptions = {}): any {
    const marker = new mapboxgl.Marker(options.element)
      .setLngLat(lngLat)
      .addTo(this.map);

    if (options.popup) {
      marker.setPopup(new mapboxgl.Popup().setHTML(options.popup));
    }

    return marker;
  }

  public flyToLocation(lngLat: [number, number], options: FlyToOptions = {}): void {
    this.map.flyTo({
      center: lngLat,
      zoom: options.zoom || this.map.getZoom(),
      pitch: options.pitch || this.map.getPitch(),
      bearing: options.bearing || this.map.getBearing(),
      duration: options.duration || 2000,
    });
  }
}

// Initialize maps when DOM is ready
document.addEventListener('DOMContentLoaded', function () {
  // Only initialize if LiveMap class exists and liveMapConfig is available
  if (
    typeof BitcoinLiveMap === 'undefined' ||
    typeof (window as any).bitcoinLiveMapConfig === 'undefined'
  ) {
    console.log('Bitcoin LiveMap or config not available yet, waiting...');
    return;
  }

  const maps = document.querySelectorAll('.bitcoin-livemap:not([data-initialized])');
  const mapInstances: BitcoinLiveMap[] = [];

  console.log('Found', maps.length, 'uninitialized maps');

  maps.forEach((mapElement) => {
    try {
      // Mark as initialized to prevent double initialization
      mapElement.setAttribute('data-initialized', 'true');

      const instance = new BitcoinLiveMap(mapElement as HTMLElement);
      mapInstances.push(instance);

      // Store instance on element for external access
      (mapElement as any).bitcoinLiveMapInstance = instance;

      console.log('Initialized map:', mapElement.id);
    } catch (error) {
      console.error('Error initializing map:', mapElement.id, error);
    }
  });

  // Global access (append to existing array if it exists)
  if ((window as any).bitcoinLiveMapInstances) {
    (window as any).bitcoinLiveMapInstances.push(...mapInstances);
  } else {
    (window as any).bitcoinLiveMapInstances = mapInstances;
  }
});

// Expose LiveMap class globally
(window as any).BitcoinLiveMap = BitcoinLiveMap;

export default BitcoinLiveMap;

