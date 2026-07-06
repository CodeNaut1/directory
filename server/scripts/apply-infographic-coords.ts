/**
 * Apply infographic rect coordinates from fla-shop SVG batches.
 *
 * KEY PRINCIPLE: If a project appears in the SVG batch, it IS approved.
 * projects.json may be outdated — align it to match infographic reality.
 *
 * Standing instructions (every batch):
 * 1. Extract xlink:title + rect coords from each <a> tag
 * 2. Fuzzy match title across coordinates.json AND projects.json
 * 3. If in coordinates.json → update infographic, preserve livemap (generate if null)
 * 4. If only in projects.json → add coordinates entry + generate livemap
 * 5. If nowhere → create approved stub in projects.json + coordinates.json + DB
 * 6. For every matched project → ensure status='approved' in projects.json AND DB
 * 7. Report: Updated / Added / CREATED NEW STUB / STATUS CORRECTED / AMBIGUOUS / Skipped
 *
 * Usage:
 *   npx tsx scripts/apply-infographic-coords.ts path/to/batch.svg
 *   npx tsx scripts/apply-infographic-coords.ts --inline "<svg>...</svg>"
 *   npx tsx scripts/apply-infographic-coords.ts batch.svg --no-db   # skip DB writes
 */

import fs from 'fs';
import path from 'path';
import slugify from 'slugify';
import { prisma } from '../lib/db';
import {
  locationGroupKey,
  resolveBaseCoordinate,
  spreadCoordinate,
} from './lib/geocoding';

const REPO_ROOT = path.resolve(__dirname, '../..');
const PROJECTS_PATH = path.join(REPO_ROOT, 'client/src/data/projects.json');
const COORDS_PATH = path.join(REPO_ROOT, 'client/src/data/coordinates.json');

interface Project {
  id: string;
  slug?: string;
  name: string;
  status?: string;
  location?: string;
  country_code?: string;
  country_name?: string;
  city?: string;
  description?: string;
  categories?: string[];
  tags?: string[];
  verified?: boolean;
  featured?: boolean;
  active?: boolean;
  image?: string;
  website?: string;
  email?: string;
  social?: Record<string, string>;
  bitcoin_acceptance?: {
    onchain?: boolean;
    lightning?: boolean;
    gift_cards?: boolean;
  };
  founder?: {
    name?: string;
    twitter?: string;
    email?: string;
  };
  initiatives?: string;
  impact?: string;
  challenges?: string;
  founded_year?: string;
  created_at?: string;
  updated_at?: string;
}

interface SvgShape {
  title: string;
  coords: string;
}

interface CoordinateEntry {
  proj_id: string;
  name: string;
  infographic: { type: string; coords: string } | null;
  livemap: { type: 'Point'; coords: [number, number] } | null;
}

interface CoordinatesFile {
  project_coordinates: CoordinateEntry[];
  country_regions?: unknown[];
}

interface MatchCandidate {
  label: string;
  score: number;
  project?: Project;
  entry?: CoordinateEntry;
}

type MatchResult =
  | { type: 'matched'; candidate: MatchCandidate }
  | { type: 'ambiguous'; candidates: MatchCandidate[] }
  | { type: 'unmatched'; candidates: MatchCandidate[] };

function normalizeMatchText(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/₿/g, 'bitcoin')
    .replace(/\bbtc\b/g, 'bitcoin')
    .replace(/\bnirr\b/g, 'birr')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Known SVG title typos/variations → project slug */
const TITLE_SLUG_OVERRIDES: Record<string, string> = {
  'bitcoin birr': 'bitcoinbirr',
  'bitcoin senegal': 'bitcoin-s-n-gal',
  bitbiashiara: 'bitbiashara',
  'bitcoin in africa story': 'bitcoin-africa-story',
  'shuga mines': 'shugamine',
  'bitcoin johanessburg': 'bitcoinjhb',
  'women of satoshi coperative': 'women-of-satoshi-cooperative',
  btrust: 'btrust-team',
};

function resolveTitleSlugOverride(title: string): string | undefined {
  const normalized = normalizeMatchText(title);
  return TITLE_SLUG_OVERRIDES[normalized];
}

function findProjectBySlug(slug: string, projects: Project[]): Project | undefined {
  return projects.find(
    (project) => project.slug === slug || project.id === slug,
  );
}

function compactText(value: string): string {
  return normalizeMatchText(value).replace(/\s+/g, '');
}

function tokenize(value: string): string[] {
  return normalizeMatchText(value).split(' ').filter(Boolean);
}

function levenshtein(a: string, b: string): number {
  const matrix = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost,
      );
    }
  }
  return matrix[a.length][b.length];
}

function tokenSimilarity(a: string, b: string): number {
  if (a === b) return 1;
  if (a.length <= 1 || b.length <= 1) return a === b ? 1 : 0;
  const distance = levenshtein(a, b);
  const maxLen = Math.max(a.length, b.length);
  if (distance === 1 && maxLen >= 4) return 0.92;
  return Math.max(0, 1 - distance / maxLen);
}

function scoreTitleAgainstLabel(title: string, name: string, slug?: string): number {
  const titleNorm = normalizeMatchText(title);
  const nameNorm = normalizeMatchText(name);
  const slugNorm = normalizeMatchText(slug || '');

  if (titleNorm === nameNorm || (slugNorm && titleNorm === slugNorm)) return 100;
  if (compactText(title) === compactText(name) || (slug && compactText(title) === compactText(slug))) return 96;
  if (nameNorm.includes(titleNorm) || titleNorm.includes(nameNorm)) return 90;
  if (slugNorm && (slugNorm.includes(compactText(title)) || compactText(title) === compactText(slugNorm))) {
    return 88;
  }

  const titleTokens = tokenize(title);
  const nameTokens = tokenize(name);
  if (titleTokens.length === 0 || nameTokens.length === 0) return 0;

  let matched = 0;
  for (const titleToken of titleTokens) {
    let best = 0;
    for (const nameToken of nameTokens) {
      best = Math.max(best, tokenSimilarity(titleToken, nameToken));
    }
    matched += best;
  }

  return (matched / titleTokens.length) * 80;
}

function scoreTitleAgainstProject(title: string, project: Project): number {
  return Math.max(
    scoreTitleAgainstLabel(title, project.name, project.slug || project.id),
    scoreTitleAgainstLabel(title, project.slug || '', project.slug || project.id),
  );
}

function scoreTitleAgainstEntry(title: string, entry: CoordinateEntry): number {
  return scoreTitleAgainstLabel(title, entry.name, entry.proj_id);
}

function parseSvgShapes(svg: string): SvgShape[] {
  const shapes: SvgShape[] = [];
  const anchorRegex = /<a\b[^>]*xlink:title="([^"]+)"[^>]*>[\s\S]*?<rect\b[^>]*\bx="([^"]+)"\s+y="([^"]+)"\s+width="([^"]+)"\s+height="([^"]+)"[^>]*>/gi;

  let match: RegExpExecArray | null;
  while ((match = anchorRegex.exec(svg)) !== null) {
    const [, title, x, y, width, height] = match;
    shapes.push({
      title: title.trim(),
      coords: `${x},${y},${width},${height}`,
    });
  }

  return shapes;
}

function projIdFor(project: Project): string {
  return project.slug?.trim() || project.id;
}

function titleCaseName(title: string): string {
  return title
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

function slugFromTitle(title: string): string {
  return slugify(title, { lower: true, strict: true });
}

function canonicalMatchKey(candidate: MatchCandidate, projects: Project[]): string {
  if (candidate.project) {
    return `project:${candidate.project.id}`;
  }

  if (candidate.entry) {
    const linked = findProjectForEntry(candidate.entry, projects);
    if (linked) {
      return `project:${linked.id}`;
    }
    return `entry:${candidate.entry.proj_id}`;
  }

  return `unknown:${candidate.label}`;
}

function mergeCandidate(existing: MatchCandidate, incoming: MatchCandidate): MatchCandidate {
  if (incoming.score > existing.score) {
    return {
      label: incoming.label,
      score: incoming.score,
      project: incoming.project ?? existing.project,
      entry: incoming.entry ?? existing.entry,
    };
  }

  return {
    label: existing.label,
    score: existing.score,
    project: existing.project ?? incoming.project,
    entry: existing.entry ?? incoming.entry,
  };
}

function preferAmbiguousCandidate(
  candidates: MatchCandidate[],
  projects: Project[],
): MatchCandidate | null {
  const withBoth = candidates.filter((candidate) => candidate.project && candidate.entry);
  if (withBoth.length === 1) {
    return withBoth[0];
  }

  const withInfographic = candidates.filter((candidate) => candidate.entry?.infographic);
  if (withInfographic.length === 1) {
    return withInfographic[0];
  }

  const slugAligned = candidates.filter((candidate) => {
    if (!candidate.project || !candidate.entry) return false;
    const slug = candidate.project.slug?.trim();
    return Boolean(slug && candidate.entry.proj_id === slug);
  });
  if (slugAligned.length === 1) {
    return slugAligned[0];
  }

  const linkedProjects = candidates
    .map((candidate) => {
      if (candidate.project) return candidate.project;
      if (candidate.entry) return findProjectForEntry(candidate.entry, projects);
      return undefined;
    })
    .filter((project): project is Project => Boolean(project));

  const uniqueProjectIds = new Set(linkedProjects.map((project) => project.id));
  if (uniqueProjectIds.size === 1 && linkedProjects[0]) {
    const project = linkedProjects[0];
    const best = [...candidates].sort((a, b) => b.score - a.score)[0];
    return {
      label: `${project.name} (${projIdFor(project)})`,
      score: best.score,
      project,
      entry: best.entry ?? candidates.find((candidate) => candidate.entry)?.entry,
    };
  }

  return null;
}

function findProjectInCatalog(title: string, projects: Project[]): Project | undefined {
  const slug = slugFromTitle(title);
  const titleNorm = normalizeMatchText(title);

  const exactSlug = projects.find(
    (project) => project.slug === slug || project.id === slug,
  );
  if (exactSlug) return exactSlug;

  let best: { project: Project; score: number } | undefined;
  for (const project of projects) {
    const score = scoreTitleAgainstProject(title, project);
    if (score < 90) continue;
    if (!best || score > best.score) {
      best = { project, score };
    }
  }

  if (best && best.score >= 90) {
    const close = projects.filter(
      (project) => scoreTitleAgainstProject(title, project) >= best!.score - 3,
    );
    if (close.length === 1) {
      return best.project;
    }
  }

  return undefined;
}

function findMatches(
  title: string,
  projects: Project[],
  entries: CoordinateEntry[],
): MatchResult {
  const mergedByKey = new Map<string, MatchCandidate>();

  for (const entry of entries) {
    const score = scoreTitleAgainstEntry(title, entry);
    if (score < 60) continue;

    const candidate: MatchCandidate = {
      label: `${entry.name} (${entry.proj_id})`,
      score,
      entry,
    };
    const key = canonicalMatchKey(candidate, projects);
    const existing = mergedByKey.get(key);
    mergedByKey.set(key, existing ? mergeCandidate(existing, candidate) : candidate);
  }

  for (const project of projects) {
    const score = scoreTitleAgainstProject(title, project);
    if (score < 60) continue;

    const candidate: MatchCandidate = {
      label: `${project.name} (${projIdFor(project)})`,
      score,
      project,
    };
    const key = canonicalMatchKey(candidate, projects);
    const existing = mergedByKey.get(key);
    mergedByKey.set(key, existing ? mergeCandidate(existing, candidate) : candidate);
  }

  const deduped = [...mergedByKey.values()].sort((a, b) => b.score - a.score);

  if (deduped.length === 0) {
    return { type: 'unmatched', candidates: [] };
  }

  const top = deduped[0];
  const closeCandidates = deduped.filter(
    (entry) => entry.score >= 75 && top.score - entry.score <= (top.score >= 95 ? 3 : 8),
  );

  if (closeCandidates.length > 1) {
    const preferred = preferAmbiguousCandidate(closeCandidates, projects);
    if (preferred) {
      return { type: 'matched', candidate: preferred };
    }
    return { type: 'ambiguous', candidates: closeCandidates };
  }

  if (top.score < 75) {
    return { type: 'unmatched', candidates: deduped.slice(0, 3) };
  }

  return { type: 'matched', candidate: top };
}

function defaultProjectStub(title: string): Project {
  const slug = slugFromTitle(title);
  const now = new Date().toISOString();

  return {
    id: slug,
    slug,
    name: titleCaseName(title),
    description: '',
    country_code: 'xx',
    country_name: 'Africa Wide',
    city: '',
    location: 'Africa Wide',
    image: '',
    website: '',
    email: '',
    categories: [],
    tags: [],
    social: {
      twitter: '',
      linkedin: '',
      instagram: '',
      facebook: '',
      youtube: '',
      telegram: '',
      nostr: '',
    },
    bitcoin_acceptance: {
      onchain: false,
      lightning: false,
      gift_cards: false,
    },
    founder: {
      name: '',
      twitter: '',
      email: '',
    },
    initiatives: '',
    impact: '',
    challenges: '',
    verified: false,
    featured: false,
    status: 'approved',
    founded_year: '',
    active: true,
    created_at: now,
    updated_at: now,
  };
}

function generateLivemap(project: Project, groupIndexes: Map<string, number>): CoordinateEntry['livemap'] {
  const resolved = resolveBaseCoordinate(project);
  if (!resolved) return null;

  const groupKey = locationGroupKey(project);
  const index = groupIndexes.get(groupKey) || 0;
  groupIndexes.set(groupKey, index + 1);

  return {
    type: 'Point',
    coords: spreadCoordinate(resolved.coords, projIdFor(project), index),
  };
}

function findProjectForEntry(entry: CoordinateEntry, projects: Project[]): Project | undefined {
  return projects.find(
    (project) =>
      project.id === entry.proj_id
      || project.slug === entry.proj_id
      || projIdFor(project) === entry.proj_id,
  );
}

function readSvgArg(): { svg: string; skipDb: boolean } {
  const args = process.argv.slice(2).filter((arg) => arg !== '--no-db');
  const skipDb = process.argv.includes('--no-db');

  if (args.length === 0) {
    throw new Error('Provide an SVG file path or --inline "<svg>...</svg>"');
  }

  if (args[0] === '--inline') {
    return { svg: args.slice(1).join(' '), skipDb };
  }

  const svgPath = path.resolve(process.cwd(), args[0]);
  return { svg: fs.readFileSync(svgPath, 'utf8'), skipDb };
}

async function approveProjectInDatabase(project: Project): Promise<boolean> {
  try {
    await prisma.project.update({
      where: { id: project.id },
      data: {
        status: 'approved',
        published: true,
        publishedAt: new Date(),
        active: true,
      },
    });
    return true;
  } catch (error) {
    console.error(
      `   DB status update failed for "${project.name}":`,
      error instanceof Error ? error.message : error,
    );
    return false;
  }
}

function approveProjectInJson(project: Project): string {
  const previousStatus = project.status || 'unknown';
  project.status = 'approved';
  project.active = true;
  return previousStatus;
}

async function ensureProjectApproved(
  project: Project,
  skipDb: boolean,
): Promise<{ corrected: boolean; previousStatus: string }> {
  let previousStatus = project.status || 'unknown';
  let jsonNeedsFix = project.status !== 'approved';
  let dbNeedsFix = false;

  if (!skipDb) {
    const dbProject = await prisma.project.findFirst({
      where: {
        OR: [{ id: project.id }, { slug: project.slug || '' }],
      },
      select: { status: true },
    });

    if (dbProject && dbProject.status !== 'approved') {
      dbNeedsFix = true;
      if (!jsonNeedsFix) {
        previousStatus = dbProject.status;
      }
    }
  }

  if (!jsonNeedsFix && !dbNeedsFix) {
    return { corrected: false, previousStatus: 'approved' };
  }

  if (jsonNeedsFix) {
    previousStatus = approveProjectInJson(project);
  }

  if (!skipDb && (jsonNeedsFix || dbNeedsFix)) {
    await approveProjectInDatabase(project);
  }

  console.log(`🔄 STATUS CORRECTED: ${project.name} (was: ${previousStatus} → now: approved)`);

  return { corrected: true, previousStatus };
}

async function createStubInDatabase(project: Project): Promise<boolean> {
  try {
    const existing = await prisma.project.findFirst({
      where: {
        OR: [{ slug: project.slug || '' }, { id: project.id }],
      },
    });

    if (existing) {
      return false;
    }

    await prisma.project.create({
      data: {
        id: project.id,
        slug: project.slug || project.id,
        name: project.name,
        description: project.description || '',
        location: project.location || '',
        city: project.city || '',
        countryCode: project.country_code || 'xx',
        countryName: project.country_name || 'Africa Wide',
        categories: project.categories || [],
        logo: project.image || '',
        website: project.website || '',
        email: project.email || '',
        socialLinks: project.social || {},
        acceptsOnchain: project.bitcoin_acceptance?.onchain || false,
        acceptsLightning: project.bitcoin_acceptance?.lightning || false,
        acceptsGiftCards: project.bitcoin_acceptance?.gift_cards || false,
        founderName: project.founder?.name || '',
        founderTwitter: project.founder?.twitter || '',
        founderEmail: project.founder?.email || '',
        initiatives: project.initiatives || '',
        impact: project.impact || '',
        challenges: project.challenges || '',
        verified: false,
        featured: false,
        active: true,
        status: 'approved',
        published: true,
        publishedAt: new Date(),
      },
    });

    return true;
  } catch (error) {
    console.error(`   DB stub failed for "${project.name}":`, error instanceof Error ? error.message : error);
    return false;
  }
}

async function main() {
  const { svg, skipDb } = readSvgArg();
  const shapes = parseSvgShapes(svg);

  if (shapes.length === 0) {
    throw new Error('No <a xlink:title> + <rect> shapes found in SVG input');
  }

  const projectsFile = JSON.parse(fs.readFileSync(PROJECTS_PATH, 'utf8')) as { projects: Project[] };
  const coordsFile = JSON.parse(fs.readFileSync(COORDS_PATH, 'utf8')) as CoordinatesFile;
  const allProjects = projectsFile.projects;
  const approved = allProjects.filter((project) => project.status === 'approved');

  const entriesByProjId = new Map<string, CoordinateEntry>();
  for (const entry of coordsFile.project_coordinates) {
    entriesByProjId.set(entry.proj_id, entry);
  }

  const livemapGroupIndexes = new Map<string, number>();

  let updatedExisting = 0;
  let addedToCoords = 0;
  let createdNew = 0;
  let ambiguousCount = 0;
  let skippedCount = 0;
  let statusCorrected = 0;

  console.log('\n=== Infographic Coordinate Batch ===');

  for (const shape of shapes) {
    const slugOverride = resolveTitleSlugOverride(shape.title);
    if (slugOverride) {
      const project = findProjectBySlug(slugOverride, allProjects);
      if (project) {
        const projId = projIdFor(project);
        let entry =
          entriesByProjId.get(projId)
          ?? entriesByProjId.get(project.id)
          ?? (project.slug ? entriesByProjId.get(project.slug) : undefined);

        if (!entry) {
          entry = {
            proj_id: projId,
            name: project.name,
            infographic: null,
            livemap: generateLivemap(project, livemapGroupIndexes),
          };
        }

        const hadInfographic = Boolean(entry.infographic);
        const { corrected } = await ensureProjectApproved(project, skipDb);
        if (corrected) {
          statusCorrected++;
          if (!approved.some((item) => item.id === project.id)) {
            approved.push(project);
          }
        }

        entry.proj_id = projId;
        entry.name = project.name;
        entry.infographic = { type: 'rect', coords: shape.coords };
        if (!entry.livemap) {
          entry.livemap = generateLivemap(project, livemapGroupIndexes);
        }
        entriesByProjId.set(entry.proj_id, entry);

        if (hadInfographic) {
          updatedExisting++;
          console.log(`✅ Updated existing coords: "${project.name}"`);
        } else {
          addedToCoords++;
          console.log(`✅ Added to coordinates.json: "${project.name}" (found in projects.json)`);
        }
        continue;
      }
    }

    const result = findMatches(shape.title, allProjects, coordsFile.project_coordinates);

    if (result.type === 'ambiguous') {
      ambiguousCount++;
      const names = result.candidates.map((c) => c.label).join(', ');
      console.log(`⚠️  AMBIGUOUS: "${shape.title}" could match: ${names} - please clarify`);
      continue;
    }

    if (result.type === 'unmatched') {
      const stub = defaultProjectStub(shape.title);
      const projId = projIdFor(stub);

      if (!allProjects.some((project) => project.id === stub.id || project.slug === stub.slug)) {
        projectsFile.projects.push(stub);
        allProjects.push(stub);
        approved.push(stub);
      }

      const entry: CoordinateEntry = {
        proj_id: projId,
        name: stub.name,
        infographic: { type: 'rect', coords: shape.coords },
        livemap: generateLivemap(stub, livemapGroupIndexes),
      };
      entriesByProjId.set(projId, entry);

      let dbCreated = false;
      if (!skipDb) {
        dbCreated = await createStubInDatabase(stub);
      }

      createdNew++;
      console.log(
        `🆕 CREATED NEW STUB: "${shape.title}" (not found anywhere, stub created - needs CSV flesh-out)`
        + ` (slug: ${projId}${dbCreated ? ', + DB' : skipDb ? '' : ', DB skipped/failed'})`,
      );
      continue;
    }

    const { candidate } = result;
    let entry: CoordinateEntry | undefined;
    let project: Project | undefined;
    let action: 'updated' | 'added' = 'updated';

    if (candidate.entry) {
      entry = entriesByProjId.get(candidate.entry.proj_id) || candidate.entry;
      project = findProjectForEntry(entry, allProjects);
      action = 'updated';
    } else if (candidate.project) {
      project = candidate.project;
      const projId = projIdFor(project);
      entry =
        entriesByProjId.get(projId)
        ?? entriesByProjId.get(project.id)
        ?? (project.slug ? entriesByProjId.get(project.slug) : undefined);

      if (!entry) {
        entry = {
          proj_id: projId,
          name: project.name,
          infographic: null,
          livemap: generateLivemap(project, livemapGroupIndexes),
        };
        action = 'added';
      }
    }

    if (!entry) {
      skippedCount++;
      console.log(`❌ Skipped: "${shape.title}" - resolved match but no writable entry`);
      continue;
    }

    if (project) {
      const { corrected } = await ensureProjectApproved(project, skipDb);
      if (corrected) {
        statusCorrected++;
        if (!approved.some((item) => item.id === project!.id)) {
          approved.push(project);
        }
      }
    }

    if (!project) {
      entry.infographic = { type: 'rect', coords: shape.coords };
      if (!entry.livemap) {
        const linked = findProjectForEntry(entry, allProjects);
        if (linked) {
          entry.livemap = generateLivemap(linked, livemapGroupIndexes);
        }
      }
      entriesByProjId.set(entry.proj_id, entry);
      updatedExisting++;
      console.log(`✅ Updated existing coords: "${entry.name}"`);
      continue;
    }

    const hadInfographic = Boolean(entry.infographic);
    entry.proj_id = projIdFor(project);
    entry.name = project.name;
    entry.infographic = { type: 'rect', coords: shape.coords };
    if (!entry.livemap) {
      entry.livemap = generateLivemap(project, livemapGroupIndexes);
    }

    entriesByProjId.set(entry.proj_id, entry);

    if (hadInfographic || action === 'updated') {
      updatedExisting++;
      console.log(`✅ Updated existing coords: "${project.name}"`);
    } else {
      addedToCoords++;
      console.log(`✅ Added to coordinates.json: "${project.name}" (found in projects.json)`);
    }
  }

  const nextFile: CoordinatesFile = {
    project_coordinates: [...entriesByProjId.values()].sort((a, b) => a.name.localeCompare(b.name)),
    country_regions: coordsFile.country_regions,
  };

  fs.writeFileSync(PROJECTS_PATH, `${JSON.stringify(projectsFile, null, 2)}\n`);
  fs.writeFileSync(COORDS_PATH, `${JSON.stringify(nextFile, null, 2)}\n`);

  console.log('\nSummary:');
  console.log(`  Shapes parsed: ${shapes.length}`);
  console.log(`  Updated existing: ${updatedExisting}`);
  console.log(`  Added to coordinates: ${addedToCoords}`);
  console.log(`  Created new stubs: ${createdNew}`);
  console.log(`  Status corrected: ${statusCorrected}`);
  console.log(`  Ambiguous: ${ambiguousCount}`);
  console.log(`  Skipped: ${skippedCount}`);
  console.log(`  Total coordinate entries: ${nextFile.project_coordinates.length}`);

  await prisma.$disconnect();
}

main().catch(async (error) => {
  console.error(error);
  await prisma.$disconnect();
  process.exit(1);
});
