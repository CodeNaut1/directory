import { z } from 'zod';

/**
 * User validation schemas
 */

export const updateUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  avatar: z.string().url('Invalid avatar URL').optional(),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;

