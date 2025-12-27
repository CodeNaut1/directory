/**
 * TypeScript types for Bitcoin Live Map locations
 * Generated from locations.json
 */

/**
 * Basic GeoJSON types
 */
export interface PointGeometry {
  type: 'Point';
  coordinates: [number, number]; // [lng, lat]
}

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

export interface LocationFeature {
  type: 'Feature';
  geometry: PointGeometry;
  properties: LocationProperties;
}

export interface LocationFeatureCollection {
  type: 'FeatureCollection';
  features: LocationFeature[];
}


