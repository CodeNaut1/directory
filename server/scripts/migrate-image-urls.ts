/**
 * Migrate project image URLs from old WordPress hosting to Cloudflare R2.
 *
 * Usage:
 *   npx tsx scripts/migrate-image-urls.ts --dry-run   # preview only
 *   npx tsx scripts/migrate-image-urls.ts             # apply DB + JSON sync
 */

import fs from 'fs';
import path from 'path';
import { prisma } from '../lib/db';
import { syncAllProjectsFromDb } from '../lib/services/projects-json-sync.service';

const envPath = path.join(__dirname, '../.env');
const envContents = fs.readFileSync(envPath, 'utf-8');
const databaseUrl = envContents
  .split('\n')
  .find((line) => line.startsWith('DATABASE_URL='))
  ?.replace(/^DATABASE_URL="?/, '')
  .replace(/"$/, '');

if (!databaseUrl) {
  throw new Error('DATABASE_URL not found in .env');
}

process.env.DATABASE_URL = databaseUrl;

const OLD_PREFIX = 'https://bitcoiners.africa/wp-content/';
const NEW_PREFIX = 'https://pub-d2aef463d8a6497d90ac252cbcb0dcbf.r2.dev/';

const PROJECTS_JSON_PATH = path.join(__dirname, '../../client/src/data/projects.json');

const TEXT_FIELDS = ['logo', 'coverImage', 'description', 'initiatives', 'impact', 'challenges'] as const;

function migrateString(value: string | null | undefined): string | null | undefined {
  if (!value?.includes(OLD_PREFIX)) return value;
  return value.replaceAll(OLD_PREFIX, NEW_PREFIX);
}

function migrateSocialLinks(links: unknown): unknown {
  if (!links || typeof links !== 'object' || Array.isArray(links)) return links;

  const record = links as Record<string, unknown>;
  let changed = false;
  const migrated: Record<string, unknown> = { ...record };

  for (const [key, value] of Object.entries(record)) {
    if (typeof value === 'string' && value.includes(OLD_PREFIX)) {
      migrated[key] = migrateString(value);
      changed = true;
    }
  }

  return changed ? migrated : links;
}

function countJsonMatches(raw: string): number {
  return (raw.match(/https:\/\/bitcoiners\.africa\/wp-content\//g) || []).length;
}

async function scanProjects() {
  const projects = await prisma.project.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      logo: true,
      coverImage: true,
      description: true,
      initiatives: true,
      impact: true,
      challenges: true,
      socialLinks: true,
    },
  });

  const fieldCounts: Record<string, number> = {};
  const affected: Array<{ id: string; name: string; slug: string; fields: string[]; sample?: string }> = [];

  for (const project of projects) {
    const fields: string[] = [];
    let sample: string | undefined;

    for (const field of TEXT_FIELDS) {
      const value = project[field];
      if (typeof value === 'string' && value.includes(OLD_PREFIX)) {
        fields.push(field);
        fieldCounts[field] = (fieldCounts[field] || 0) + 1;
        sample ||= migrateString(value)!;
      }
    }

    if (JSON.stringify(project.socialLinks || {}).includes(OLD_PREFIX)) {
      fields.push('socialLinks');
      fieldCounts.socialLinks = (fieldCounts.socialLinks || 0) + 1;
    }

    if (fields.length > 0) {
      affected.push({
        id: project.id,
        name: project.name,
        slug: project.slug,
        fields,
        sample,
      });
    }
  }

  const avatarCount = await prisma.user.count({
    where: { avatar: { contains: 'bitcoiners.africa/wp-content' } },
  });

  const jsonRaw = fs.readFileSync(PROJECTS_JSON_PATH, 'utf-8');
  const jsonMatches = countJsonMatches(jsonRaw);

  return { affected, fieldCounts, avatarCount, jsonMatches, totalProjects: projects.length };
}

async function applyMigration() {
  const projects = await prisma.project.findMany({
    select: {
      id: true,
      logo: true,
      coverImage: true,
      description: true,
      initiatives: true,
      impact: true,
      challenges: true,
      socialLinks: true,
    },
  });

  let updatedProjects = 0;

  for (const project of projects) {
    const data: Record<string, unknown> = {};
    let changed = false;

    for (const field of TEXT_FIELDS) {
      const value = project[field];
      if (typeof value === 'string' && value.includes(OLD_PREFIX)) {
        data[field] = migrateString(value);
        changed = true;
      }
    }

    const migratedSocial = migrateSocialLinks(project.socialLinks);
    if (migratedSocial !== project.socialLinks) {
      data.socialLinks = migratedSocial;
      changed = true;
    }

    if (changed) {
      await prisma.project.update({
        where: { id: project.id },
        data,
      });
      updatedProjects++;
    }
  }

  const avatarUsers = await prisma.user.findMany({
    where: { avatar: { contains: 'bitcoiners.africa/wp-content' } },
    select: { id: true, avatar: true },
  });

  for (const user of avatarUsers) {
    await prisma.user.update({
      where: { id: user.id },
      data: { avatar: migrateString(user.avatar)! },
    });
  }

  await syncAllProjectsFromDb();

  let jsonRaw = fs.readFileSync(PROJECTS_JSON_PATH, 'utf-8');
  let jsonRemaining = countJsonMatches(jsonRaw);

  if (jsonRemaining > 0) {
    jsonRaw = jsonRaw.replaceAll(OLD_PREFIX, NEW_PREFIX);
    fs.writeFileSync(PROJECTS_JSON_PATH, jsonRaw.endsWith('\n') ? jsonRaw : `${jsonRaw}\n`, 'utf-8');
    jsonRemaining = countJsonMatches(jsonRaw);
  }

  return { updatedProjects, updatedAvatars: avatarUsers.length, jsonRemaining };
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');

  console.log('Image URL migration');
  console.log(`  FROM: ${OLD_PREFIX}`);
  console.log(`  TO:   ${NEW_PREFIX}`);
  console.log('');

  const scan = await scanProjects();

  console.log('Scan results (before changes):');
  console.log(`  Projects in DB: ${scan.totalProjects}`);
  console.log(`  Projects affected in DB: ${scan.affected.length}`);
  console.log(`  User avatars affected: ${scan.avatarCount}`);
  console.log(`  Old URLs in projects.json: ${scan.jsonMatches}`);
  console.log('  Field breakdown:', scan.fieldCounts);

  if (scan.affected.length > 0) {
    console.log('\nSample affected projects:');
    for (const project of scan.affected.slice(0, 5)) {
      console.log(`  - ${project.name} (${project.slug}): ${project.fields.join(', ')}`);
      if (project.sample) console.log(`    → ${project.sample}`);
    }
    if (scan.affected.length > 5) {
      console.log(`  ... and ${scan.affected.length - 5} more`);
    }
  }

  if (dryRun) {
    console.log('\nDry run only — no changes written.');
    return;
  }

  console.log('\nApplying migration...');
  const result = await applyMigration();

  console.log(`  Updated ${result.updatedProjects} projects in DB`);
  console.log(`  Updated ${result.updatedAvatars} user avatars in DB`);
  console.log(`  Synced projects.json from DB`);
  console.log(`  Remaining old URLs in projects.json: ${result.jsonRemaining}`);

  const verify = await scanProjects();
  console.log('\nPost-migration verification:');
  console.log(`  Projects still affected in DB: ${verify.affected.length}`);
  console.log(`  Old URLs remaining in projects.json: ${verify.jsonMatches}`);

  const spotChecks = ['african-bitcoin-mining-summit', 'pay-with-flash', 'satoshi-leaners'];
  const samples = await prisma.project.findMany({
    where: { slug: { in: spotChecks } },
    select: { name: true, slug: true, logo: true },
  });

  console.log('\nSpot check:');
  for (const project of samples) {
    console.log(`  ${project.name}: ${project.logo || '(no logo)'}`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
