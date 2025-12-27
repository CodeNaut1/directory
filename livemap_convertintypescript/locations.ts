/**
 * Typed wrapper around `locations.json`
 * Permet d'utiliser toutes les données du JSON en TypeScript avec un typage strict.
 */

import rawLocations from './locations.json';
import type { LocationFeatureCollection } from './locations.types';

// Exporte toutes les données du JSON, typées comme un FeatureCollection
export const locations = rawLocations as LocationFeatureCollection;


