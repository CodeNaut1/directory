/**
 * User service
 * Handles user-related business logic
 */

import { prisma } from '@/lib/db';
import { NotFoundError } from '@/lib/utils/errors';
import type { UpdateUserInput } from '@/lib/validators';
import type { AuthenticatedUser } from '@/lib/auth/middleware';

/**
 * Get user by ID
 */
export async function getUserById(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      avatar: true,
      role: true,
      emailVerified: true,
      createdAt: true,
      updatedAt: true,
      lastLoginAt: true,
    },
  });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  return user;
}

/**
 * Update user
 */
export async function updateUser(userId: string, input: UpdateUserInput) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(input.name !== undefined && { name: input.name }),
      ...(input.avatar !== undefined && { avatar: input.avatar }),
    },
    select: {
      id: true,
      email: true,
      name: true,
      avatar: true,
      role: true,
      emailVerified: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return user;
}

