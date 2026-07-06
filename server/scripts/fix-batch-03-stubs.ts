/**
 * One-time cleanup for batch-03 false stubs.
 * Merges coords to correct projects and removes erroneous stubs.
 */

import fs from 'fs';
import path from 'path';
import { prisma } from '../lib/db';

const REPO_ROOT = path.resolve(__dirname, '../..');
const PROJECTS_PATH = path.join(REPO_ROOT, 'client/src/data/projects.json');
const COORDS_PATH = path.join(REPO_ROOT, 'client/src/data/coordinates.json');

const STUB_SLUGS = ['bitcoin-nirr', 'bitcoin-senegal', 'bitbiashiara'] as const;

const MERGES = [
  {
    from: 'bitcoin-nirr',
    to: 'bitcoinbirr',
    coords: '4930.290598290599,2155.225071225071,392.37606837606836,68.2393162393164',
  },
  {
    from: 'bitcoin-senegal',
    to: 'bitcoin-s-n-gal',
    coords: '267.27065527065525,2786.4387464387464,534.5413105413106,90.9857549857552',
  },
  {
    from: 'bitbiashiara',
    to: 'bitbiashara',
    coords: '4503.794871794872,3178.814814814815,403.74928774928776,96.67236467236489',
  },
] as const;

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

  console.log('\n=== Batch 03 Stub Cleanup ===\n');

  for (const merge of MERGES) {
    const fromEntry = coordsFile.project_coordinates.find((e) => e.proj_id === merge.from);
    const toEntry = coordsFile.project_coordinates.find((e) => e.proj_id === merge.to);
    const project = projectsFile.projects.find(
      (p) => p.slug === merge.to || p.id === merge.to,
    );

    if (!toEntry || !project) {
      console.log(`❌ Missing target for ${merge.from} → ${merge.to}`);
      continue;
    }

    toEntry.infographic = { type: 'rect', coords: merge.coords };
    coordsFile.project_coordinates = coordsFile.project_coordinates.filter(
      (e) => e.proj_id !== merge.from,
    );

    console.log(`🔧 Merged: "${merge.from}" → "${merge.to}" (infographic coords transferred)`);
  }

  const before = projectsFile.projects.length;
  projectsFile.projects = projectsFile.projects.filter(
    (p) => !STUB_SLUGS.includes(p.slug as (typeof STUB_SLUGS)[number])
      && !STUB_SLUGS.includes(p.id as (typeof STUB_SLUGS)[number]),
  );
  console.log(`🗑️  Removed ${before - projectsFile.projects.length} stub(s) from projects.json`);

  for (const slug of STUB_SLUGS) {
    const deleted = await prisma.project.deleteMany({
      where: { OR: [{ slug }, { id: slug }] },
    });
    if (deleted.count > 0) {
      console.log(`🗑️  Deleted DB record: ${slug}`);
    }
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
