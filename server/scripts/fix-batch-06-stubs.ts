/**
 * Fix batch-06: apply skipped btrust coords + dedupe duplicate stubs.
 */

import fs from 'fs';
import path from 'path';
import { prisma } from '../lib/db';

const REPO_ROOT = path.resolve(__dirname, '../..');
const PROJECTS_PATH = path.join(REPO_ROOT, 'client/src/data/projects.json');
const COORDS_PATH = path.join(REPO_ROOT, 'client/src/data/coordinates.json');

const BTRUST_COORDS =
  '1990.3133903133903,8183.031339031339,278.6438746438748,90.9857549857552';

async function main() {
  const projectsFile = JSON.parse(fs.readFileSync(PROJECTS_PATH, 'utf8')) as {
    projects: Array<{ id: string; slug?: string }>;
  };
  const coordsFile = JSON.parse(fs.readFileSync(COORDS_PATH, 'utf8')) as {
    project_coordinates: Array<{
      proj_id: string;
      name: string;
      infographic: { type: string; coords: string } | null;
      livemap: unknown;
    }>;
    country_regions?: unknown[];
  };

  console.log('\n=== Batch 06 Fixes ===\n');

  const btrustEntry = coordsFile.project_coordinates.find((e) => e.proj_id === 'btrust-team');
  if (!btrustEntry) {
    throw new Error('btrust-team entry not found');
  }

  btrustEntry.infographic = { type: 'rect', coords: BTRUST_COORDS };
  console.log('✅ Applied coords: "btrust" → BTrust Team (btrust-team)');

  const seen = new Set<string>();
  const before = projectsFile.projects.length;
  projectsFile.projects = projectsFile.projects.filter((project) => {
    const key = project.slug || project.id;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
  const removed = before - projectsFile.projects.length;
  if (removed > 0) {
    console.log(`🗑️  Removed ${removed} duplicate project(s) from projects.json`);
  }

  fs.writeFileSync(PROJECTS_PATH, `${JSON.stringify(projectsFile, null, 2)}\n`);
  fs.writeFileSync(
    COORDS_PATH,
    `${JSON.stringify(
      {
        project_coordinates: coordsFile.project_coordinates.sort((a, b) =>
          a.name.localeCompare(b.name),
        ),
        country_regions: coordsFile.country_regions,
      },
      null,
      2,
    )}\n`,
  );

  console.log('\nDone.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
