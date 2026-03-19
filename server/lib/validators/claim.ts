import { z } from 'zod';

/**
 * Project claim validation schemas
 */

export const submitClaimSchema = z.object({
  proofOfOwnership: z
    .string()
    .min(10, 'Proof of ownership must be at least 10 characters')
    .max(5000, 'Proof of ownership is too long')
    .optional(),
});

export const approveClaimSchema = z.object({
  notes: z.string().max(1000, 'Notes are too long').optional(),
});

export const rejectClaimSchema = z.object({
  reason: z
    .string()
    .min(10, 'Rejection reason must be at least 10 characters')
    .max(1000, 'Rejection reason is too long'),
});

export const claimListQuerySchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected']).optional(),
  projectId: z.string().cuid().optional(),
  userId: z.string().cuid().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type SubmitClaimInput = z.infer<typeof submitClaimSchema>;
export type ApproveClaimInput = z.infer<typeof approveClaimSchema>;
export type RejectClaimInput = z.infer<typeof rejectClaimSchema>;
export type ClaimListQuery = z.infer<typeof claimListQuerySchema>;