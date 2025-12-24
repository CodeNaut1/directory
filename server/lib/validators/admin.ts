import { z } from 'zod';

/**
 * Admin/Moderation validation schemas
 */

export const rejectSubmissionSchema = z.object({
  reason: z.string().min(5, 'Reason must be at least 5 characters').max(1000, 'Reason is too long'),
});

export type RejectSubmissionInput = z.infer<typeof rejectSubmissionSchema>;

