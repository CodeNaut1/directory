/**
 * Tag service
 * Handles tag-related business logic
 */

import { prisma } from '@/lib/db';

/**
 * Get all tags
 */
export async function getAllTags() {
  return prisma.tag.findMany({
    orderBy: { name: 'asc' },
    select: {
      id: true,
      name: true,
      slug: true,
      createdAt: true,
    },
  });
}

