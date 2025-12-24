/**
 * Category service
 * Handles category-related business logic
 */

import { prisma } from '@/lib/db';

/**
 * Get all categories
 */
export async function getAllCategories() {
  return prisma.category.findMany({
    orderBy: { order: 'asc' },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      icon: true,
      order: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

