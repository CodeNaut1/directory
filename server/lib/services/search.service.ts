/**
 * Search service
 * Handles full-text search across projects
 */

import { prisma } from '@/lib/db';
import type { SearchQuery } from '@/lib/validators';

/**
 * Transform database project to match frontend format
 */
function transformProjectToJsonFormat(project: any) {
  return {
    id: project.id,
    name: project.name,
    slug: project.slug,
    description: project.description,
    image: project.logo || '',
    website: project.website || '',
    verified: project.verified || false,
    categories: project.categories || [project.category?.name].filter(Boolean) || [],
    country_name: project.countryName || project.country?.name || '',
    country_code: project.countryCode || project.country?.code || '',
    city: project.city || '',
    tags: project.tags?.map((pt: any) => pt.tag?.name || pt.name).filter(Boolean) || [],
  };
}

/**
 * Search projects
 */
export async function searchProjects(query: SearchQuery) {
  const { page, limit, q, category, country, tag } = query;
  const skip = (page - 1) * limit;

  // Build where clause
  const where: any = {
    published: true,
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
    data: projects.map(transformProjectToJsonFormat),
    meta: {
      page,
      limit,
      total,
    },
  };
}