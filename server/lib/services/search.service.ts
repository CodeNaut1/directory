/**
 * Search service
 * Handles full-text search across projects
 */

import { prisma } from '@/lib/db';
import type { SearchQuery } from '@/lib/validators';

/**
 * Search projects
 */
export async function searchProjects(query: SearchQuery) {
  const { page, limit, q, category, country, tag } = query;
  const skip = (page - 1) * limit;

  // Build where clause
  const where: any = {
    published: true, // Only search published projects
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
        createdAt: 'desc', // Most recent first
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        website: true,
        logo: true,
        coverImage: true,
        published: true,
        featured: true,
        verified: true,
        city: true,
        createdAt: true,
        publishedAt: true,
        country: {
          select: {
            id: true,
            code: true,
            name: true,
            flag: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        tags: {
          select: {
            tag: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    }),
    prisma.project.count({ where }),
  ]);

  // Transform tags structure
  const transformedProjects = projects.map((project) => ({
    ...project,
    tags: project.tags.map((pt) => pt.tag),
  }));

  return {
    data: transformedProjects,
    meta: {
      page,
      limit,
      total,
    },
  };
}

