import { z } from 'zod';

/**
 * Analytics validation schemas
 */

export const trackViewSchema = z.object({
  projectId: z.string().cuid('Invalid project ID'),
  referrer: z.string().url('Invalid referrer URL').optional(),
});

export const trackClickSchema = z.object({
  projectId: z.string().cuid('Invalid project ID'),
  url: z.string().url('Invalid URL'),
});

export type TrackViewInput = z.infer<typeof trackViewSchema>;
export type TrackClickInput = z.infer<typeof trackClickSchema>;

