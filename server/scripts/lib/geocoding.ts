import { createHash } from 'crypto';

/** Longitude, latitude */
export type LngLat = [number, number];

const AFRICA_WIDE: LngLat = [20, 0];
const GLOBAL_COORD: LngLat = [20, 0];

const CITY_COORDS: Record<string, LngLat> = {
  'nairobi': [36.8219, -1.2921],
  'lagos': [3.3792, 6.5244],
  'cape town': [18.4241, -33.9249],
  'johannesburg': [28.0473, -26.2041],
  'soweto': [27.854, -26.248],
  'pretoria': [28.1881, -25.7461],
  'lusaka': [28.3228, -15.3875],
  'abuja': [7.4951, 9.0579],
  'accra': [-0.187, 5.6037],
  'kampala': [32.5825, 0.3476],
  'dakar': [-17.4677, 14.7167],
  'addis ababa': [38.7578, 9.032],
  'windhoek': [17.0658, -22.5609],
  'douala': [9.7679, 4.0511],
  'maputo': [32.5732, -25.9692],
  'cotonou': [2.4282, 6.3654],
  'lilongwe': [33.7873, -13.9626],
  'abidjan': [-4.0083, 5.36],
  'calabar': [8.3417, 4.9757],
  'gitega': [29.9246, -3.4264],
  'arusha': [36.6827, -3.3869],
  'dar es salaam': [39.2083, -6.7924],
  'khartoum': [32.5599, 15.5007],
  'ouagadougou': [-1.5197, 12.3714],
  'gaborone': [25.9086, -24.6282],
  'bulawayo': [28.5858, -20.1569],
  'kadoma': [29.1119, -18.3333],
  'kano': [8.524, 12.0022],
  'port harcourt': [7.0498, 4.8156],
  'jos': [8.8937, 9.8965],
  'kitui': [38.0106, -1.367],
  'bungoma': [34.5606, 0.5695],
  'juja': [37.02, -1.1015],
  'machakos': [37.2634, -1.5177],
  'awka': [7.0714, 6.2123],
  'uyo': [7.9128, 5.037],
  'antsirabe': [47.0333, -19.8667],
  'asmara': [38.9318, 15.3229],
  'goma': [29.234, -1.6792],
  'lome': [1.2253, 6.1375],
  'lomé': [1.2253, 6.1375],
  'livingstone': [25.8584, -17.8417],
  'mossel bay': [22.146, -34.183],
  'sedgefield': [22.802, -34.022],
  'hoedspruit': [30.453, -24.508],
  'witsand': [20.827, -34.616],
  'margate': [30.37, -30.863],
  'plettenberg bay': [23.371, -34.053],
  'swellendam': [20.441, -34.023],
  'somerset west': [18.848, -34.078],
  'de rust': [22.535, -33.489],
  'akure': [5.195, 7.257],
  'akatsi': [0.798, 5.982],
  'agbazome': [0.883, 6.104],
  'bugiri': [33.741, 0.569],
  'najyanankumbi': [32.5825, 0.3476],
  'acornhoek': [31.088, -24.603],
  'atan': [3.35, 6.55],
  'kilimanjaro': [37.3556, -3.0674],
  'los lunas': [-106.783, 34.806],
};

const COUNTRY_COORDS: Record<string, LngLat> = {
  ng: [8.6753, 9.082],
  ke: [37.9063, -0.0236],
  za: [22.9375, -30.5595],
  zm: [27.8493, -13.1339],
  gh: [-1.0232, 7.9465],
  ug: [32.2903, 1.3733],
  sn: [-14.4524, 14.4974],
  et: [38.7468, 9.145],
  na: [18.4904, -22.9576],
  cm: [12.3547, 7.3697],
  mz: [35.5296, -18.6657],
  bj: [2.3158, 9.3077],
  mw: [34.3015, -13.2543],
  ci: [-5.5471, 7.54],
  bi: [29.9189, -3.3731],
  tz: [34.8888, -6.369],
  sd: [30.2176, 12.8628],
  bf: [-1.5616, 12.2383],
  bw: [24.6849, -22.3285],
  zw: [29.1549, -19.0154],
  mg: [46.8691, -18.7669],
  er: [38.9318, 15.3229],
  cd: [23.655, -2.877],
  tg: [0.8248, 8.6195],
  lr: [-9.4295, 6.4281],
  mu: [57.5522, -20.3484],
  td: [18.7322, 15.4542],
  xx: AFRICA_WIDE,
};

const COUNTRY_NAMES: Record<string, string> = {
  nigeria: 'ng',
  kenya: 'ke',
  'south africa': 'za',
  zambia: 'zm',
  ghana: 'gh',
  uganda: 'ug',
  senegal: 'sn',
  ethiopia: 'et',
  namibia: 'na',
  cameroon: 'cm',
  mozambique: 'mz',
  benin: 'bj',
  malawi: 'mw',
  "cote d'ivoire": 'ci',
  "côte d'ivoire": 'ci',
  burundi: 'bi',
  tanzania: 'tz',
  sudan: 'sd',
  'burkina faso': 'bf',
  botswana: 'bw',
  zimbabwe: 'zw',
  madagascar: 'mg',
  eritrea: 'er',
  'democratic republic of congo': 'cd',
  togo: 'tg',
  liberia: 'lr',
  mauritius: 'mu',
  chad: 'td',
  'africa wide': 'xx',
  africa: 'xx',
  global: 'xx',
};

function normalizeKey(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function isAfricaWide(location: string, countryCode?: string): boolean {
  const normalized = normalizeKey(location);
  return (
    countryCode === 'xx'
    || normalized === 'africa wide'
    || normalized === 'africa'
    || normalized === 'global'
    || normalized.endsWith(' africa wide')
    || normalized.endsWith(' global')
    || normalized === 'west africa region'
    || normalized === 'rural africa africa wide'
  );
}

function findCityInText(text: string): LngLat | null {
  const normalized = normalizeKey(text);
  if (CITY_COORDS[normalized]) return CITY_COORDS[normalized];

  const sortedCities = Object.keys(CITY_COORDS).sort((a, b) => b.length - a.length);
  for (const city of sortedCities) {
    if (normalized.includes(city)) {
      return CITY_COORDS[city];
    }
  }
  return null;
}

function countryCodeFromName(name: string): string | null {
  const key = normalizeKey(name);
  return COUNTRY_NAMES[key] || null;
}

export function resolveBaseCoordinate(project: {
  location?: string;
  country_code?: string;
  country_name?: string;
  city?: string;
}): { coords: LngLat; source: string } | null {
  const location = (project.location || '').trim();
  const countryCode = (project.country_code || '').toLowerCase();

  if (isAfricaWide(location, countryCode)) {
    return { coords: AFRICA_WIDE, source: 'africa-wide' };
  }

  if (normalizeKey(location) === 'global' || location.toLowerCase().includes('global')) {
    const city = findCityInText(location);
    if (city) return { coords: city, source: 'city-in-global-location' };
    return { coords: GLOBAL_COORD, source: 'global' };
  }

  if (project.city) {
    const cityCoord = findCityInText(project.city);
    if (cityCoord) {
      return { coords: cityCoord, source: `city-field:${project.city}` };
    }
  }

  if (location) {
    const cityCoord = findCityInText(location);
    if (cityCoord) {
      return { coords: cityCoord, source: `city-in-location:${location}` };
    }

    const parts = location.split(',').map((part) => part.trim()).filter(Boolean);
    if (parts.length === 1) {
      const only = normalizeKey(parts[0]);
      const code = countryCodeFromName(only);
      if (code && COUNTRY_COORDS[code]) {
        return { coords: COUNTRY_COORDS[code], source: `country-name:${parts[0]}` };
      }
    }

    for (const part of parts) {
      const code = countryCodeFromName(part);
      if (code && COUNTRY_COORDS[code]) {
        return { coords: COUNTRY_COORDS[code], source: `country-in-location:${part}` };
      }
    }
  }

  if (countryCode && COUNTRY_COORDS[countryCode]) {
    return { coords: COUNTRY_COORDS[countryCode], source: `country-code:${countryCode}` };
  }

  if (project.country_name) {
    const code = countryCodeFromName(project.country_name);
    if (code && COUNTRY_COORDS[code]) {
      return { coords: COUNTRY_COORDS[code], source: `country-name-field:${project.country_name}` };
    }
  }

  return null;
}

export function hashSlug(slug: string): number {
  const hex = createHash('sha256').update(slug).digest('hex').slice(0, 8);
  return parseInt(hex, 16);
}

export function spreadCoordinate(base: LngLat, slug: string, index: number): LngLat {
  const hash = hashSlug(slug);
  const angle = ((hash % 360) * Math.PI) / 180;
  const radius = 0.01 + ((hash % 41) / 1000) + index * 0.006;
  const clampedRadius = Math.min(radius, 0.05);

  return [
    base[0] + clampedRadius * Math.cos(angle),
    base[1] + clampedRadius * Math.sin(angle),
  ];
}

export function locationGroupKey(project: {
  location?: string;
  country_code?: string;
  country_name?: string;
  city?: string;
}): string {
  const resolved = resolveBaseCoordinate(project);
  if (!resolved) return 'unknown';
  return `${resolved.source}:${resolved.coords[0].toFixed(3)},${resolved.coords[1].toFixed(3)}`;
}
