/**
 * Fix malformed project slugs and approve projects that have coordinates.
 *
 * Usage: npx tsx scripts/fix-malformed-slugs.ts
 */

import fs from 'fs';
import path from 'path';
import { prisma } from '../lib/db';

const REPO_ROOT = path.resolve(__dirname, '../..');
const PROJECTS_PATH = path.join(REPO_ROOT, 'client/src/data/projects.json');
const COORDS_PATH = path.join(REPO_ROOT, 'client/src/data/coordinates.json');

interface Project {
  id: string;
  slug?: string;
  name: string;
  status?: string;
}

interface CoordinateEntry {
  proj_id: string;
  name: string;
  infographic: { type: string; coords: string } | null;
  livemap: { type: 'Point'; coords: [number, number] } | null;
}

const SLUG_FIXES = [
  { oldSlug: 'hope-with-itcoin', newSlug: 'hope-with-bitcoin', projectId: 'hope-with-itcoin' },
  { oldSlug: 'grimm-app', newSlug: 'grim-app', projectId: 'cmo60dyam00017lodp50oji2z' },
  { oldSlug: 'bitcoinnakfa', newSlug: 'bitcoin-nakfa', projectId: 'bitcoinnakfa' },
] as const;

const STATUS_FIXES = [
  { projectId: 'cmltd1jqv00021n29a2flrpsn', slug: 'zazapay-lightning', name: 'ZazaPay lightning' },
] as const;

async function updateSlugInDatabase(projectId: string, newSlug: string): Promise<void> {
  const conflict = await prisma.project.findFirst({
    where: {
      slug: newSlug,
      NOT: { id: projectId },
    },
  });

  if (conflict) {
    throw new Error(`Cannot set slug "${newSlug}" for ${projectId}: already used by ${conflict.id}`);
  }

  await prisma.project.update({
    where: { id: projectId },
    data: { slug: newSlug },
  });
}

async function approveProjectInDatabase(projectId: string): Promise<void> {
  await prisma.project.update({
    where: { id: projectId },
    data: {
      status: 'approved',
      published: true,
      publishedAt: new Date(),
      active: true,
    },
  });
}

async function main() {
  const projectsFile = JSON.parse(fs.readFileSync(PROJECTS_PATH, 'utf8')) as { projects: Project[] };
  const coordsFile = JSON.parse(fs.readFileSync(COORDS_PATH, 'utf8')) as {
    project_coordinates: CoordinateEntry[];
    country_regions?: unknown[];
  };

  console.log('\n=== Fix Malformed Slugs + Status ===\n');

  for (const fix of SLUG_FIXES) {
    const project = projectsFile.projects.find((entry) => entry.id === fix.projectId);
    if (!project) {
      console.log(`❌ Skipped slug fix ${fix.oldSlug}: project ${fix.projectId} not found`);
      continue;
    }

    const previousSlug = project.slug || fix.oldSlug;
    project.slug = fix.newSlug;

    const coordEntry = coordsFile.project_coordinates.find((entry) => entry.proj_id === fix.oldSlug);
    if (coordEntry) {
      coordEntry.proj_id = fix.newSlug;
    }

    await updateSlugInDatabase(fix.projectId, fix.newSlug);

    console.log(
      `🔧 Fixed slug: "${previousSlug}" → "${fix.newSlug}" (updated projects.json, DB, coordinates.json)`,
    );
  }

  for (const fix of STATUS_FIXES) {
    const project = projectsFile.projects.find((entry) => entry.id === fix.projectId);
    if (!project) {
      console.log(`❌ Skipped status fix ${fix.name}: project ${fix.projectId} not found`);
      continue;
    }

    const previousStatus = project.status || 'unknown';
    if (previousStatus === 'approved') {
      console.log(`✅ Already approved: ${fix.name}`);
      continue;
    }

    project.status = 'approved';
    project.active = true;
    await approveProjectInDatabase(fix.projectId);

    console.log(`🔄 Status corrected: ${fix.name} (was: ${previousStatus} → now: approved)`);
  }

  fs.writeFileSync(PROJECTS_PATH, `${JSON.stringify(projectsFile, null, 2)}\n`);
  fs.writeFileSync(
    COORDS_PATH,
    `${JSON.stringify(
      {
        project_coordinates: coordsFile.project_coordinates.sort((a, b) => a.name.localeCompare(b.name)),
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
