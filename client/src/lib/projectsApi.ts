import type { Project } from '../data/projects.types';

const API_URL = import.meta.env.VITE_API_URL || '';

let cachedProjects: Project[] | null = null;
let inflight: Promise<Project[]> | null = null;

export function invalidateProjectsCache() {
  cachedProjects = null;
  inflight = null;
}

/**
 * Fetch all approved projects from the API (paginated internally).
 * Results are cached in memory for the session to avoid refetching on navigation.
 */
export async function fetchAllApprovedProjects(options?: { force?: boolean }): Promise<Project[]> {
  if (options?.force) {
    invalidateProjectsCache();
  }

  if (cachedProjects) {
    return cachedProjects;
  }

  if (inflight) {
    return inflight;
  }

  if (!API_URL) {
    throw new Error('API URL not configured');
  }

  inflight = (async () => {
    const allProjects: Project[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const response = await fetch(`${API_URL}/api/projects?page=${page}&limit=100`);
      if (!response.ok) {
        throw new Error('Unable to load projects');
      }

      const data = await response.json();
      if (!data.success || !Array.isArray(data.data)) {
        throw new Error('Invalid API response');
      }

      allProjects.push(...data.data);
      const total = data.meta?.total ?? allProjects.length;
      hasMore = allProjects.length < total;
      page += 1;
    }

    cachedProjects = allProjects;
    return allProjects;
  })();

  try {
    return await inflight;
  } catch (error) {
    invalidateProjectsCache();
    throw error;
  } finally {
    inflight = null;
  }
}

export function buildProjectLookup(projects: Project[]): Map<string, Project> {
  const lookup = new Map<string, Project>();
  for (const project of projects) {
    lookup.set(project.id, project);
    lookup.set(project.slug, project);
  }
  return lookup;
}
