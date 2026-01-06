/**
 * Sync projects.json to database
 * SECURITY: Only runs server-side, requires env variable in production
 */

import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

// SECURITY: Require explicit permission in production
if (process.env.NODE_ENV === 'production' && !process.env.ALLOW_PROJECT_SYNC) {
  console.error('⚠️  Project sync disabled in production for security.');
  console.error('💡 Set ALLOW_PROJECT_SYNC=true in environment to enable.');
  process.exit(1);
}

// Helper to convert empty/null to undefined
function toOptional(val: any): string | undefined {
  if (!val) return undefined;
  if (typeof val === 'string' && val.trim() === '') return undefined;
  if (typeof val === 'string' && val.toLowerCase() === 'nil') return undefined;
  return typeof val === 'string' ? val.trim() : val;
}

export async function syncProjectsFromJson() {
  console.log('🔄 Starting sync from projects.json to database...');
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);

  // Path to projects.json (adjust if needed)
  const projectsJsonPath = path.join(process.cwd(), '../client/src/data/projects.json');

  let finalPath = projectsJsonPath;

  if (!fs.existsSync(projectsJsonPath)) {
    console.log('💡 Trying alternative path...');

    // Try alternative path
    const altPath = path.join(process.cwd(), 'client/src/data/projects.json');
    if (!fs.existsSync(altPath)) {
      console.error('❌ projects.json not found at either location');
      throw new Error('projects.json not found');
    }
    finalPath = altPath;
  }

  // SECURITY: Validate JSON structure before processing
  let projectsJson: any;
  try {
    projectsJson = JSON.parse(fs.readFileSync(finalPath, 'utf-8'));
    if (!projectsJson.projects || !Array.isArray(projectsJson.projects)) {
      throw new Error('Invalid JSON structure: missing projects array');
    }
  } catch (error) {
    console.error('❌ Failed to read/parse projects.json:', error);
    throw error;
  }

  let updatedCount = 0;
  let createdCount = 0;
  let errorCount = 0;

  console.log(`📦 Found ${projectsJson.projects.length} projects in JSON`);

  for (const projectData of projectsJson.projects) {
    try {
      // SECURITY: Validate required fields
      if (!projectData.slug || !projectData.name) {
        console.warn(`⚠️  Skipping project without slug/name:`, projectData.id);
        errorCount++;
        continue;
      }

      // Find country by code (if provided)
      let countryId: string | undefined = undefined;
      if (projectData.country_code) {
        const country = await prisma.country.findUnique({
          where: { code: projectData.country_code.toUpperCase() },
        });
        countryId = country?.id;
      }

      // Check if project exists
      const existing = await prisma.project.findUnique({
        where: { slug: projectData.slug },
      });

      // Clean social links (remove "Nil" strings)
      const cleanSocial: Record<string, string> = {};
      if (projectData.social) {
        Object.keys(projectData.social).forEach(key => {
          const value = projectData.social[key];
          if (value && value !== '' && value.toLowerCase() !== 'nil') {
            cleanSocial[key] = value;
          }
        });
      }

      // Build project payload
      const projectPayload: any = {
        name: projectData.name,
        description: projectData.description,
        location: toOptional(projectData.location),
        city: toOptional(projectData.city),
        countryCode: toOptional(projectData.country_code?.toLowerCase()),
        countryName: toOptional(projectData.country_name),
        logo: toOptional(projectData.image),
        website: toOptional(projectData.website),
        email: toOptional(projectData.email),
        categories: projectData.categories || [],
        socialLinks: cleanSocial,
        acceptsOnchain: projectData.bitcoin_acceptance?.onchain || false,
        acceptsLightning: projectData.bitcoin_acceptance?.lightning || false,
        acceptsGiftCards: projectData.bitcoin_acceptance?.gift_cards || false,
        founderName: toOptional(projectData.founder?.name),
        founderTwitter: toOptional(projectData.founder?.twitter),
        founderEmail: toOptional(projectData.founder?.email),
        initiatives: toOptional(projectData.initiatives),
        impact: toOptional(projectData.impact),
        challenges: toOptional(projectData.challenges),
        foundedYear: toOptional(projectData.founded_year),
        verified: projectData.verified || false,
        featured: projectData.featured || false,
        active: projectData.active !== false,
        status: projectData.status === 'approved' ? 'approved' : 'pending',
        published: projectData.status === 'approved' ? true : false,
        updatedAt: new Date(),
      };

      // Only add countryId if it exists (to avoid Prisma type errors)
      if (countryId) {
        projectPayload.countryId = countryId;
      }

      await prisma.project.upsert({
        where: { slug: projectData.slug },
        update: projectPayload,
        create: {
          id: projectData.id,
          slug: projectData.slug,
          ...projectPayload,
          createdAt: projectData.created_at ? new Date(projectData.created_at) : new Date(),
        },
      });

      // Handle tags
      if (projectData.tags && Array.isArray(projectData.tags) && projectData.tags.length > 0) {
        const project = await prisma.project.findUnique({
          where: { slug: projectData.slug },
        });

        if (project) {
          // Remove existing tags
          await prisma.projectTag.deleteMany({
            where: { projectId: project.id },
          });

          // Add new tags
          for (const tagName of projectData.tags) {
            if (tagName && tagName.trim()) {
              const slug = tagName.toLowerCase().replace(/\s+/g, '-');

              const tag = await prisma.tag.upsert({
                where: { slug },
                update: {},
                create: { name: tagName, slug },
              });

              await prisma.projectTag.create({
                data: {
                  projectId: project.id,
                  tagId: tag.id,
                },
              });
            }
          }
        }
      }

      if (existing) {
        updatedCount++;
      } else {
        createdCount++;
      }

    } catch (error) {
      console.error(`❌ Error syncing project ${projectData.slug}:`, error);
      errorCount++;
    }
  }

  console.log('\n✅ Sync complete!');
  console.log(`   Created: ${createdCount}`);
  console.log(`   Updated: ${updatedCount}`);
  if (errorCount > 0) {
    console.log(`   ⚠️  Errors: ${errorCount}`);
  }

  return { created: createdCount, updated: updatedCount, errors: errorCount };
}

// If run directly (not imported)
if (require.main === module) {
  syncProjectsFromJson()
    .catch((e) => {
      console.error('❌ Sync failed:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}