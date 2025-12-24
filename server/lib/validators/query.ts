import { z } from 'zod';

/**
 * Query parameter validation schemas
 */

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1, 'Page must be at least 1').default(1),
  limit: z.coerce.number().int().min(1).max(100, 'Limit cannot exceed 100').default(20),
});

export const projectListQuerySchema = paginationSchema.extend({
  category: z.string().optional(),
  country: z.string().length(2, 'Country code must be 2 characters').optional(),
  tag: z.string().optional(),
  search: z.string().min(1, 'Search query cannot be empty').optional(),
  featured: z.coerce.boolean().optional(),
  sort: z.enum(['newest', 'oldest', 'name']).default('newest'),
});

export const searchQuerySchema = paginationSchema.extend({
  q: z.string().min(1, 'Search query is required'),
  category: z.string().optional(),
  country: z.string().length(2).optional(),
  tag: z.string().optional(),
});

export const reviewListQuerySchema = paginationSchema;

export const submissionListQuerySchema = paginationSchema.extend({
  status: z.enum(['pending', 'approved', 'rejected']).optional(),
});

export type PaginationInput = z.infer<typeof paginationSchema>;
export type ProjectListQuery = z.infer<typeof projectListQuerySchema>;
export type SearchQuery = z.infer<typeof searchQuerySchema>;
export type ReviewListQuery = z.infer<typeof reviewListQuerySchema>;
export type SubmissionListQuery = z.infer<typeof submissionListQuerySchema>;

