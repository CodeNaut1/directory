/**
 * Generate livemap coordinates for all approved projects in projects.json.
 *
 * Usage: npx tsx scripts/generate-livemap-coordinates.ts
 */

import fs from 'fs';
import path from 'path';
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

function projIdFor(project: Project): string {
  return project.slug?.trim() || project.id;
}

function main() {
  const projectsFile = JSON.parse(fs.readFileSync(PROJECTS_PATH, 'utf8')) as { projects: Project[] };
  const coordsFile = JSON.parse(fs.readFileSync(COORDS_PATH, 'utf8')) as CoordinatesFile;

  const approved = projectsFile.projects.filter((project) => project.status === 'approved');

  const existingByProjId = new Map<string, CoordinateEntry>();
  for (const entry of coordsFile.project_coordinates) {
    existingByProjId.set(entry.proj_id, entry);
  }

  // Also index by project id/slug from approved list for infographic preservation
  const approvedById = new Map(approved.map((p) => [p.id, p]));
  const approvedBySlug = new Map(
    approved.filter((p) => p.slug).map((p) => [p.slug!, p])
  );

  function preserveInfographic(projId: string) {
    const direct = existingByProjId.get(projId)?.infographic ?? null;
    if (direct) return direct;

    const project = approvedById.get(projId) || approvedBySlug.get(projId);
    if (!project) return null;

    return (
      existingByProjId.get(project.id)?.infographic
      ?? (project.slug ? existingByProjId.get(project.slug)?.infographic : null)
      ?? null
    );
  }

  const groupCounts = new Map<string, number>();
  const groupIndexes = new Map<string, number>();
  const unmapped: Project[] = [];
  const distribution = new Map<string, number>();

  for (const project of approved) {
    const groupKey = locationGroupKey(project);
    groupCounts.set(groupKey, (groupCounts.get(groupKey) || 0) + 1);
  }

  const output: CoordinateEntry[] = approved.map((project) => {
    const projId = projIdFor(project);
    const resolved = resolveBaseCoordinate(project);

    if (!resolved) {
      unmapped.push(project);
      return {
        proj_id: projId,
        name: project.name,
        infographic: preserveInfographic(projId),
        livemap: null,
      };
    }

    const groupKey = locationGroupKey(project);
    const index = groupIndexes.get(groupKey) || 0;
    groupIndexes.set(groupKey, index + 1);

    const coords = spreadCoordinate(resolved.coords, projId, index);
    const label = project.location?.trim() || project.country_name || project.country_code || resolved.source;
    distribution.set(label, (distribution.get(label) || 0) + 1);

    return {
      proj_id: projId,
      name: project.name,
      infographic: preserveInfographic(projId),
      livemap: {
        type: 'Point',
        coords,
      },
    };
  });

  // Keep legacy entries that no longer exist in approved list but preserve infographic-only data
  for (const entry of coordsFile.project_coordinates) {
    const stillPresent = output.some((item) => item.proj_id === entry.proj_id);
    if (!stillPresent && entry.infographic) {
      output.push({
        proj_id: entry.proj_id,
        name: entry.name,
        infographic: entry.infographic,
        livemap: entry.livemap,
      });
    }
  }

  output.sort((a, b) => a.name.localeCompare(b.name));

  const nextFile: CoordinatesFile = {
    project_coordinates: output,
    country_regions: coordsFile.country_regions,
  };

  fs.writeFileSync(COORDS_PATH, `${JSON.stringify(nextFile, null, 2)}\n`);

  const withLivemap = output.filter((entry) => entry.livemap).length;

  console.log('\n=== Live Map Coordinate Generation ===');
  console.log(`Approved projects: ${approved.length}`);
  console.log(`Entries written: ${output.length}`);
  console.log(`Projects with livemap coords: ${withLivemap}`);
  console.log(`Unmapped projects: ${unmapped.length}`);

  if (unmapped.length > 0) {
    console.log('\nUnmapped:');
    for (const project of unmapped) {
      console.log(`  - ${project.name} (${projIdFor(project)}) location="${project.location || ''}" country=${project.country_code || 'n/a'}`);
    }
  }

  console.log('\nDistribution (top locations):');
  [...distribution.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .forEach(([label, count]) => console.log(`  ${count} × ${label}`));

  console.log('\nMulti-project clusters (spread applied):');
  [...groupCounts.entries()]
    .filter(([, count]) => count > 1)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .forEach(([key, count]) => console.log(`  ${count} projects @ ${key}`));
}

main();
