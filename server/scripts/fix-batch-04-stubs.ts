/**
 * Cleanup false stubs from batch-04.
 */

import fs from 'fs';
import path from 'path';
import { prisma } from '../lib/db';

const REPO_ROOT = path.resolve(__dirname, '../..');
const PROJECTS_PATH = path.join(REPO_ROOT, 'client/src/data/projects.json');
const COORDS_PATH = path.join(REPO_ROOT, 'client/src/data/coordinates.json');

const STUB_SLUGS = ['bitcoin-in-africa-story', 'shuga-mines'] as const;

const MERGES = [
  {
    from: 'bitcoin-in-africa-story',
    to: 'bitcoin-africa-story',
    coords: '1114.5754985754988,4509.481481481482,602.7806267806266,96.67236467236398',
  },
  {
    from: 'shuga-mines',
    to: 'shugamine',
    coords: '1796.968660968661,4748.319088319088,449.24216524216536,96.67236467236489',
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

  console.log('\n=== Batch 04 Stub Cleanup ===\n');

  for (const merge of MERGES) {
    const toEntry = coordsFile.project_coordinates.find((e) => e.proj_id === merge.to);
    if (!toEntry) {
      console.log(`❌ Missing target ${merge.to}`);
      continue;
    }

    toEntry.infographic = { type: 'rect', coords: merge.coords };
    coordsFile.project_coordinates = coordsFile.project_coordinates.filter(
      (e) => e.proj_id !== merge.from,
    );

    console.log(`🔧 Merged: "${merge.from}" → "${merge.to}"`);
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
