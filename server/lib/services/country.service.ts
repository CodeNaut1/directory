/**
 * Country service
 * Handles country-related business logic
 */

import { prisma } from '@/lib/db';

/**
 * Get all countries
 */
export async function getAllCountries() {
  return prisma.country.findMany({
    orderBy: { name: 'asc' },
    select: {
      id: true,
      code: true,
      name: true,
      flag: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

