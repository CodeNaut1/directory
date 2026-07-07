/**
 * Search service
 * Handles full-text search across projects
 */

import { prisma } from '@/lib/db';
import type { SearchQuery } from '@/lib/validators';
import { transformDbProjectToJsonEntry } from '@/lib/services/projects-json-sync.service';

/**
 * Search projects
 */
export async function searchProjects(query: SearchQuery) {
  const { page, limit, q, category, country, tag } = query;
  const skip = (page - 1) * limit;

  // Build where clause
  const where: any = {
    status: 'approved',
    OR: [
      { name: { contains: q, mode: 'insensitive' } },
      { description: { contains: q, mode: 'insensitive' } },
    ],
    ...(category && {
      category: {
        slug: category,
      },
    }),
    ...(country && {
      country: {
        code: country,
      },
    }),
    ...(tag && {
      tags: {
        some: {
          tag: {
            slug: tag,
          },
        },
      },
    }),
  };

  // Get projects and total count
  const [projects, total] = await Promise.all([
    prisma.project.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        country: true,
        category: true,
        tags: { include: { tag: true } },
      },
    }),
    prisma.project.count({ where }),
  ]);

  return {
    data: projects.map(transformDbProjectToJsonEntry),
    meta: {
      page,
      limit,
      total,
    },
  };
}