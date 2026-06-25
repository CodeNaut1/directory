import { NextRequest, NextResponse } from 'next/server';
import { createGetHandler } from '@/lib/utils/api-handler';
import {
  exportProjectsQuerySchema,
  parseExportDateRange,
  type ExportProjectsQuery,
} from '@/lib/validators/admin';
import { exportProjectsToCsv } from '@/lib/services/export.service';

/**
 * Export submitted projects as CSV (admin only)
 * GET /api/admin/projects/export?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD&status=pending
 */
export const GET = createGetHandler(
  async (req: NextRequest) => {
    const searchParams = Object.fromEntries(req.nextUrl.searchParams.entries());
    const query = exportProjectsQuerySchema.parse(searchParams) as ExportProjectsQuery;
    const filters = parseExportDateRange(query);

    const { csv, count, filename } = await exportProjectsToCsv(filters);

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'X-Export-Count': String(count),
      },
    });
  },
  {
    requireAuth: true,
    requireRoles: ['moderator', 'admin'],
    validateQuery: exportProjectsQuerySchema,
  }
);
