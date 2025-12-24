import { z } from 'zod';

/**
 * Review validation schemas
 */

export const createReviewSchema = z.object({
  rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5'),
  title: z.string().max(200, 'Title is too long').optional(),
  comment: z.string().max(5000, 'Comment is too long').optional(),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;

