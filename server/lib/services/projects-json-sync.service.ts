/**
 * Keeps client/src/data/projects.json in sync with the database.
 * Database remains the source of truth; JSON is updated for static frontend fallbacks.
 */

import fs from 'fs/promises';
import path from 'path';
import { prisma } from '@/lib/db';

const PROJECTS_JSON_PATH = path.join(process.cwd(), '../client/src/data/projects.json');

type JsonProject = Record<string, unknown>;

function defaultSocialLinks() {
  return {
    twitter: '',
    linkedin: '',
    instagram: '',
    facebook: '',
    youtube: '',
    telegram: '',
    nostr: '',
  };
}

function transformDbProjectToJsonEntry(project: any): JsonProject {
  const social = (project.socialLinks as Record<string, string> | null) ?? {};

  return {
    id: project.id,
    name: project.name,
    slug: project.slug,
    description: project.description ?? '',
    country_code: project.countryCode || project.country?.code?.toLowerCase() || '',
    country_name: project.countryName || project.country?.name || '',
    city: project.city || '',
    location: project.location || '',
    image: project.logo || '',
    website: project.website || '',
    email: project.email || '',
    categories: project.categories?.length
      ? project.categories
      : [project.category?.name].filter(Boolean),
    tags: project.tags?.map((pt: any) => pt.tag?.name).filter(Boolean) || [],
    social: {
      ...defaultSocialLinks(),
      ...social,
    },
    bitcoin_acceptance: {
      onchain: project.acceptsOnchain || false,
      lightning: project.acceptsLightning || false,
      gift_cards: project.acceptsGiftCards || false,
    },
    founder: {
      name: project.founderName || '',
      twitter: project.founderTwitter || '',
      email: project.founderEmail || '',
    },
    initiatives: project.initiatives || '',
    impact: project.impact || '',
    challenges: project.challenges || '',
    verified: project.verified || false,
    featured: project.featured || false,
    status: project.status || 'pending',
    founded_year: project.foundedYear || '',
    active: project.active !== false,
    created_at: project.createdAt?.toISOString() || new Date().toISOString(),
    updated_at: project.updatedAt?.toISOString() || new Date().toISOString(),
  };
}

async function readProjectsJson(): Promise<{ projects: JsonProject[] }> {
  const raw = await fs.readFile(PROJECTS_JSON_PATH, 'utf-8');
  return JSON.parse(raw);
}

async function writeProjectsJson(data: { projects: JsonProject[] }) {
  const tmpPath = `${PROJECTS_JSON_PATH}.tmp`;
  await fs.writeFile(tmpPath, `${JSON.stringify(data, null, 2)}\n`, 'utf-8');
  await fs.rename(tmpPath, PROJECTS_JSON_PATH);
}

const projectInclude = {
  country: true,
  category: true,
  tags: { include: { tag: true } },
} as const;

export async function syncProjectById(projectId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: projectInclude,
  });

  if (!project) return;

  await upsertProjectInJson(project);
}

export async function upsertProjectInJson(project: any) {
  const data = await readProjectsJson();
  const entry = transformDbProjectToJsonEntry(project);
  const index = data.projects.findIndex(
    (p) => p.id === entry.id || p.slug === entry.slug
  );

  if (index >= 0) {
    data.projects[index] = { ...data.projects[index], ...entry };
  } else {
    data.projects.push(entry);
  }

  await writeProjectsJson(data);
}

export async function syncAllProjectsFromDb() {
  const projects = await prisma.project.findMany({
    orderBy: { createdAt: 'asc' },
    include: projectInclude,
  });

  const data = {
    projects: projects.map(transformDbProjectToJsonEntry),
  };

  await writeProjectsJson(data);
  return projects.length;
}

export function scheduleProjectsJsonSync(projectId: string) {
  setImmediate(async () => {
    try {
      await syncProjectById(projectId);
    } catch (error) {
      console.error('⚠️ projects.json sync failed:', error);
    }
  });
}
