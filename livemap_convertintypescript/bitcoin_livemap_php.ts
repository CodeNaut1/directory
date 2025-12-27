/**
 * Bitcoin Ecosystem Live Map
 * TypeScript conversion of WordPress plugin
 * Custom 3D Mapbox integration
 */

import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

/**
 * Plugin configuration
 */
interface BitcoinLiveMapConfig {
  pluginUrl: string;
  pluginPath: string;
}

/**
 * Shortcode attributes
 */
interface ShortcodeAttributes {
  width?: string;
  height?: string;
  lat?: string;
  lng?: string;
  zoom?: string;
  pitch?: string;
  bearing?: string;
  style?: string;
  terrain?: string;
  buildings?: string;
  controls?: string;
  locations?: string;
  popup?: string;
  id?: string;
}

/**
 * Default shortcode attributes
 */
const defaultShortcodeAtts: ShortcodeAttributes = {
  width: '100%',
  height: '500px',
  lat: '1.0',
  lng: '30',
  zoom: '2',
  pitch: '45',
  bearing: '0',
  style: 'light-v10',
  terrain: 'false',
  buildings: 'false',
  controls: 'false',
  locations: 'true',
  popup: 'true',
};

/**
 * Bitcoin Live Map 3D Class
 */
class BitcoinLiveMap3D {
  private pluginUrl: string;
  private pluginPath: string;

  constructor(pluginUrl: string, pluginPath: string) {
    this.pluginUrl = pluginUrl;
    this.pluginPath = pluginPath;
  }

  /**
   * Initialize plugin
   */
  public init(): void {
    // Plugin initialization
  }

  /**
   * Enqueue scripts and styles
   * Equivalent to wp_enqueue_scripts
   */
  public enqueueScripts(): {
    scripts: Array<{ src: string; deps?: string[]; version: string; inFooter?: boolean }>;
    styles: Array<{ href: string; deps?: string[]; version: string }>;
    config: {
      apiKey: string;
      ajaxUrl: string;
      nonce: string;
      pluginUrl: string;
      iconBaseUrl: string;
    };
  } {
    // Mapbox GL JS and CSS
    const scripts = [
      {
        src: 'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.js',
        deps: ['jquery'],
        version: '2.15.0',
        inFooter: true,
      },
      {
        src: `${this.pluginUrl}bitcoin_livemap.js`,
        deps: ['jquery', 'mapbox-gl-js'],
        version: Date.now().toString(), // Equivalent to filemtime
        inFooter: true,
      },
    ];

    const styles = [
      {
        href: 'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css',
        deps: [],
        version: '2.15.0',
      },
      {
        href: `${this.pluginUrl}bitcoin_livemap.css`,
        deps: ['mapbox-gl-css'],
        version: Date.now().toString(), // Equivalent to filemtime
      },
    ];

    // Grab the dynamic uploads base URL
    // In Next.js, this would be from environment or config
    const iconBase = process.env.NEXT_PUBLIC_ICON_BASE_URL || '/uploads/2025/04/';

    // Localize with dynamic iconBaseUrl
    const config = {
      apiKey: process.env.MAPBOX_API_KEY || '',
      ajaxUrl: '/api/bitcoin-livemap/locations',
      nonce: this.generateNonce(),
      pluginUrl: this.pluginUrl,
      iconBaseUrl: iconBase,
    };

    return { scripts, styles, config };
  }

  /**
   * Generate nonce (simplified version)
   */
  private generateNonce(): string {
    // In a real app, use proper nonce generation
    return Math.random().toString(36).substring(2, 15);
  }

  /**
   * Shortcode handler
   * Equivalent to add_shortcode
   */
  public shortcode(atts: Partial<ShortcodeAttributes> = {}): string {
    const mergedAtts: ShortcodeAttributes = { ...defaultShortcodeAtts, ...atts };
    const id = mergedAtts.id || `bitcoin-livemap-${Date.now()}`;

    const configJson = JSON.stringify(mergedAtts);

    let html = `
      <div class="bitcoin-livemap-container">
        <div id="${this.escapeHtml(id)}" 
             class="bitcoin-livemap" 
             data-config="${this.escapeHtml(configJson)}"
             style="width: ${this.escapeHtml(mergedAtts.width!)}; height: ${this.escapeHtml(mergedAtts.height!)};">
          <!-- Map will be initialized here -->
        </div>
    `;

    if (mergedAtts.controls === 'true') {
      html += `
        <div class="bitcoin-livemap-controls" data-map-id="${this.escapeHtml(id)}">
          <button class="bitcoin-livemap-control-btn" data-action="toggle-terrain">Toggle 3D Terrain</button>
          <button class="bitcoin-livemap-control-btn" data-action="toggle-buildings">Toggle 3D Buildings</button>
          <button class="bitcoin-livemap-control-btn" data-action="reset-view">Reset View</button>
      `;

      if (mergedAtts.locations === 'true') {
        html += `
          <button class="bitcoin-livemap-control-btn" data-action="show-locations">Show All Locations</button>
        `;
      }

      html += `</div>`;
    }

    html += `</div>`;

    html += `
      <script type="text/javascript">
        document.addEventListener('DOMContentLoaded', function() {
          setTimeout(function() {
            const mapElement = document.getElementById('${this.escapeJs(id)}');
            if (mapElement && !mapElement.bitcoinLiveMapInstance) {
              console.log('Initializing map:', '${this.escapeJs(id)}');
              const instance = new BitcoinLiveMap(mapElement);
              mapElement.bitcoinLiveMapInstance = instance;
            }
          }, 100);
        });
      </script>
    `;

    return html;
  }

  /**
   * Get locations (AJAX handler)
   * Equivalent to wp_ajax_get_map_locations
   */
  public async getLocations(): Promise<{ success: boolean; data?: any; error?: string }> {
    const file = join(this.pluginPath, 'locations.json');

    try {
      if (await this.fileExists(file)) {
        const locations = await readFile(file, 'utf-8');
        const parsed = JSON.parse(locations);
        return { success: true, data: parsed };
      } else {
        return { success: false, error: 'locations.json not found' };
      }
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to read locations.json' };
    }
  }

  /**
   * Check if file exists
   */
  private async fileExists(filePath: string): Promise<boolean> {
    try {
      await readFile(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Settings page HTML
   * Equivalent to admin_menu and settings_page
   */
  public settingsPage(apiKey: string, locationsJson: string): string {
    return `
      <div class="wrap">
        <h1>Live Map 3D Settings</h1>
        <form method="post">
          <table class="form-table">
            <tr>
              <th scope="row">Mapbox API Key</th>
              <td>
                <input type="text" name="bitcoin_livemap_api_key" value="${this.escapeHtml(apiKey)}" class="regular-text" />
                <p class="description">Enter your Mapbox API key here.</p>
              </td>
            </tr>
            <tr>
              <th scope="row">Locations JSON</th>
              <td>
                <textarea name="locations_json" rows="15" class="large-text code">${this.escapeHtml(locationsJson)}</textarea>
                <p class="description">Edit your locations in JSON format.</p>
              </td>
            </tr>
          </table>
          <button type="submit" name="submit">Save Changes</button>
        </form>
        
        <div class="bitcoin-livemap-admin-help">
          <h2>Usage</h2>
          <p>Use the following shortcode in your posts or pages:</p>
          <code>[bitcoin_livemap]</code>
          
          <h3>Available Parameters:</h3>
          <ul>
            <li><strong>lat, lng:</strong> Coordinates (default: NYC)</li>
            <li><strong>zoom:</strong> Zoom level (default: 15)</li>
            <li><strong>width, height:</strong> Map dimensions (default: 100%, 500px)</li>
            <li><strong>pitch:</strong> 3D tilt angle (default: 45)</li>
            <li><strong>bearing:</strong> Rotation angle (default: 0)</li>
            <li><strong>style:</strong> Map style (default: satellite-streets-v12)</li>
            <li><strong>terrain:</strong> Enable 3D terrain (true/false)</li>
            <li><strong>buildings:</strong> Enable 3D buildings (true/false)</li>
            <li><strong>controls:</strong> Show custom controls (true/false)</li>
            <li><strong>locations:</strong> Load locations from JSON (true/false)</li>
          </ul>
          
          <h3>Example:</h3>
          <code>[bitcoin_livemap lat="34.0522" lng="-118.2437" zoom="16" height="1200px" pitch="60"]</code>
        </div>
      </div>
    `;
  }

  /**
   * Get locations JSON
   */
  public async getLocationsJson(): Promise<string> {
    const locationsFile = join(this.pluginPath, 'locations.json');

    try {
      if (await this.fileExists(locationsFile)) {
        return await readFile(locationsFile, 'utf-8');
      }
    } catch (error) {
      console.error('Error reading locations.json:', error);
    }

    return this.getDefaultLocationsJson();
  }

  /**
   * Save locations JSON
   */
  public async saveLocations(json: string): Promise<void> {
    const locationsFile = join(this.pluginPath, 'locations.json');
    await writeFile(locationsFile, json, 'utf-8');
  }

  /**
   * Get default locations JSON
   */
  private getDefaultLocationsJson(): string {
    return JSON.stringify(
      {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [-74.006, 40.7128],
            },
            properties: {
              title: 'New York City',
              description: 'The Big Apple',
              category: 'city',
              color: '#FF0000',
            },
          },
          {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [-118.2437, 34.0522],
            },
            properties: {
              title: 'Los Angeles',
              description: 'City of Angels',
              category: 'city',
              color: '#0000FF',
            },
          },
        ],
      },
      null,
      2
    );
  }

  /**
   * Escape HTML
   */
  private escapeHtml(text: string): string {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
  }

  /**
   * Escape JavaScript
   */
  private escapeJs(text: string): string {
    return text.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/"/g, '\\"').replace(/\n/g, '\\n').replace(/\r/g, '\\r');
  }
}

export default BitcoinLiveMap3D;

