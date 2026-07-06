/**
 * Cleanup false stub from batch-05.
 */

import fs from 'fs';
import path from 'path';
import { prisma } from '../lib/db';

const REPO_ROOT = path.resolve(__dirname, '../..');
const PROJECTS_PATH = path.join(REPO_ROOT, 'client/src/data/projects.json');
const COORDS_PATH = path.join(REPO_ROOT, 'client/src/data/coordinates.json');

const STUB_SLUG = 'bitcoin-johanessburg';
const TARGET_SLUG = 'bitcoinjhb';
const COORDS =
  '2115.4188034188032,6494.108262108262,688.0797720797723,96.67236467236398';

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

  console.log('\n=== Batch 05 Stub Cleanup ===\n');

  const toEntry = coordsFile.project_coordinates.find((e) => e.proj_id === TARGET_SLUG);
  if (!toEntry) {
    throw new Error(`Target entry ${TARGET_SLUG} not found`);
  }

  toEntry.infographic = { type: 'rect', coords: COORDS };
  coordsFile.project_coordinates = coordsFile.project_coordinates.filter(
    (e) => e.proj_id !== STUB_SLUG,
  );

  const before = projectsFile.projects.length;
  projectsFile.projects = projectsFile.projects.filter(
    (p) => p.slug !== STUB_SLUG && p.id !== STUB_SLUG,
  );

  const deleted = await prisma.project.deleteMany({
    where: { OR: [{ slug: STUB_SLUG }, { id: STUB_SLUG }] },
  });

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

  console.log(`🔧 Merged: "${STUB_SLUG}" → "${TARGET_SLUG}" (BitcoinJHB)`);
  console.log(`🗑️  Removed ${before - projectsFile.projects.length} stub(s) from projects.json`);
  if (deleted.count > 0) {
    console.log(`🗑️  Deleted ${deleted.count} DB record(s): ${STUB_SLUG}`);
  }
  console.log('\nDone.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
