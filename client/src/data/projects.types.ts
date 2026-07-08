/**
 * TypeScript types for African Bitcoin Directory Projects
 * Complete type definitions for projects.json and coordinates.json
 */

/**
 * Project Categories (Max 2 per project)
 */
export type ProjectCategory =
  | 'Mining'
  | 'Community'
  | 'Education'
  | 'Payments'
  | 'Retail'
  | 'Finance'
  | 'Exchange'
  | 'Wallet'
  | 'Media'
  | 'Conference'
  | 'Charity'
  | 'Tourism'
  | 'Directory'
  | 'Technology'
  | 'Developer Community'
  | 'Circular Economy'
  | 'Business'
  | 'Non Profit'
  | 'Hodl'
  | 'Travel'
  | 'Funding'
  | 'Podcast'
  | 'Regular Meetup'
  | 'Tech Meetup';

/**
 * Project Status
 */
export type ProjectStatus = 'pending' | 'approved' | 'rejected' | 'changes_requested' | 'unpublished' | string;

/**
 * Social Media Links
 */
export interface SocialLinks {
  twitter: string;
  linkedin: string;
  instagram: string;
  facebook: string;
  youtube: string;
  telegram: string;
  nostr: string;
}

/**
 * Bitcoin Payment Methods
 */
export interface BitcoinAcceptance {
  onchain: boolean;
  lightning: boolean;
  gift_cards: boolean;
}

/**
 * Founder Information
 */
export interface Founder {
  name: string;
  twitter: string;
  email: string;
}

/**
 * Complete Project Data
 */
export interface Project {
  /** Unique identifier (slug format: lowercase-with-hyphens) */
  id: string;

  /** Project name */
  name: string;

  /** URL-friendly slug */
  slug: string;

  /** Short description */
  description: string;

  /** ISO 3166-1 alpha-2 country code (lowercase) */
  country_code: string;

  /** Full country name */
  country_name: string;

  /** City name */
  city: string;

  /** Combined location string (e.g., "Lagos, Nigeria") */
  location: string;

  /** Project logo/image URL */
  image: string;

  /** Website URL */
  website: string;

  /** Contact email */
  email: string;

  /** Categories (max 2) - flexible to allow any string */
  categories: string[];

  /** Tags (max 6) */
  tags: string[];

  /** Social media links */
  social: SocialLinks;

  /** Bitcoin payment acceptance */
  bitcoin_acceptance: BitcoinAcceptance;

  /** Founder information */
  founder: Founder;

  /** Long description of core initiatives */
  initiatives: string;

  /** Impact statement */
  impact: string;

  /** Current challenges */
  challenges: string;

  /** Verification status */
  verified: boolean;

  /** Featured project flag */
  featured: boolean;

  /** Project status controls public visibility */
  status: ProjectStatus;

  /** Year founded (YYYY format) */
  founded_year: string;

  /** Project active status */
  active: boolean;

  /** Creation timestamp (ISO 8601) */
  created_at: string;

  /** Last update timestamp (ISO 8601) */
  updated_at: string;

  /** Owner user ID - optional for backwards compatibility */
  userId?: string | null;
}

/**
 * Projects Collection
 */
export interface ProjectsData {
  /** Present on auto-generated exports from `npm run sync` */
  _notice?: string;
  projects: Project[];
}

/**
 * ==============================================================================
 * COORDINATES DATA TYPES
 * ==============================================================================
 */

/**
 * Infographic Coordinate Data
 */
export interface InfographicCoords {
  type: string; // 'rect' | 'polygon' | 'circle' but allow any string for flexibility
  coords: string;
}

/**
 * LiveMap Coordinate Data (GeoJSON Point)
 */
export interface LiveMapCoords {
  type: string; // Expected: 'Point' but allow any string for flexibility
  coords: number[]; // [longitude, latitude] but allow any array for flexibility
}

/**
 * Project Coordinate Mapping
 */
export interface ProjectCoordinate {
  /** Links to project ID in projects.json */
  proj_id: string;

  /** Project name (for quick reference) */
  name: string;

  /** Infographic positioning */
  infographic: InfographicCoords | null;

  /** LiveMap positioning (GeoJSON) */
  livemap: LiveMapCoords | null;
}

/**
 * Country Region for Infographic Overlay
 */
export interface CountryRegion {
  /** Country name */
  name: string;

  /** ISO 3166-1 alpha-2 country code (lowercase) */
  code: string;

  /** Shape type */
  type: string; // 'polygon' | 'rect' | 'circle' but allow any string for flexibility

  /** Coordinate string (format depends on type) */
  coords: string;
}

/**
 * Complete Coordinates Data
 */
export interface CoordinatesData {
  /** Individual project positioning */
  project_coordinates: ProjectCoordinate[];

  /** Country overlay boundaries */
  country_regions: CountryRegion[];
}

/**
 * ==============================================================================
 * LEGACY TYPES (for backward compatibility during migration)
 * ==============================================================================
 */

/**
 * @deprecated Use Project instead
 */
export interface LocationProperties {
  name: string;
  description?: string;
  image?: string;
  country_code?: string;
  location?: string;
  link?: string;
  twitter?: string;
  linkedin?: string;
  instagram?: string;
  facebook?: string;
  youtube?: string;
  telegram?: string;
  nostr?: string;
  email?: string;
  founder?: string;
  founder_twitter?: string;
  founder_email?: string;
  personal_twitter?: string;
  category?: string;
  active?: boolean | string;
}

/**
 * @deprecated Use LiveMapCoords instead
 */
export interface PointGeometry {
  type: 'Point';
  coordinates: [number, number];
}

/**
 * @deprecated Use ProjectCoordinate instead
 */
export interface LocationFeature {
  type: 'Feature';
  geometry: PointGeometry;
  properties: LocationProperties;
}

/**
 * @deprecated Use ProjectsData instead
 */
export interface LocationFeatureCollection {
  type: 'FeatureCollection';
  features: LocationFeature[];
}