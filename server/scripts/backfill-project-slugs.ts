/**
 * Ensure every project has a unique slug derived from its name.
 * Safe to run multiple times — only updates rows missing a slug.
 *
 * Usage: npx tsx scripts/backfill-project-slugs.ts
 */

import slugify from 'slugify';
import { prisma } from '../lib/db';

function generateSlug(name: string): string {
  return slugify(name, { lower: true, strict: true });
}

async function ensureUniqueSlug(slug: string, excludeId: string): Promise<string> {
  let uniqueSlug = slug;
  let counter = 1;

  while (true) {
    const existing = await prisma.project.findUnique({ where: { slug: uniqueSlug } });
    if (!existing || existing.id === excludeId) break;
    uniqueSlug = `${slug}-${counter}`;
    counter++;
  }

  return uniqueSlug;
}

async function main() {
  const projects = await prisma.project.findMany({
    select: { id: true, name: true, slug: true },
  });

  let updated = 0;

  for (const project of projects) {
    if (project.slug?.trim()) continue;

    const slug = await ensureUniqueSlug(generateSlug(project.name), project.id);
    await prisma.project.update({
      where: { id: project.id },
      data: { slug },
    });
    console.log(`Set slug for "${project.name}": ${slug}`);
    updated++;
  }

  const duplicates = await prisma.$queryRaw<Array<{ slug: string; cnt: number }>>`
    SELECT slug, COUNT(*)::int AS cnt FROM projects GROUP BY slug HAVING COUNT(*) > 1
  `;

  if (duplicates.length > 0) {
    console.error('Duplicate slugs remain:', duplicates);
    process.exit(1);
  }

  console.log(`Done. ${projects.length} projects checked, ${updated} updated.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
