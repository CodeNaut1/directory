import { z } from 'zod';

/**
 * Admin/Moderation validation schemas
 */

export const rejectSubmissionSchema = z.object({
  reason: z.string().min(5, 'Reason must be at least 5 characters').max(1000, 'Reason is too long'),
});

const dateStringSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format');

export const exportProjectsQuerySchema = z
  .object({
    startDate: dateStringSchema,
    endDate: dateStringSchema,
    status: z.enum(['pending', 'approved', 'rejected', 'changes_requested', 'unpublished']).optional(),
  })
  .refine((data) => data.startDate <= data.endDate, {
    message: 'startDate must be on or before endDate',
    path: ['endDate'],
  });

export type RejectSubmissionInput = z.infer<typeof rejectSubmissionSchema>;
export type ExportProjectsQuery = z.infer<typeof exportProjectsQuerySchema>;

export function parseExportDateRange(query: ExportProjectsQuery): {
  startDate: Date;
  endDate: Date;
  status?: ExportProjectsQuery['status'];
} {
  return {
    startDate: new Date(`${query.startDate}T00:00:00.000Z`),
    endDate: new Date(`${query.endDate}T23:59:59.999Z`),
    status: query.status,
  };
}

