import { NextRequest, NextResponse } from 'next/server';
import { createGetHandler } from '@/lib/utils/api-handler';
import { successResponse } from '@/lib/utils/api-response';
import { claimListQuerySchema, type ClaimListQuery } from '@/lib/validators/claim';
import { listClaims } from '@/lib/services/claim.service';

/**
 * List all claims (admin only)
 * GET /api/admin/claims
 */
export const GET = createGetHandler(
  async (req: NextRequest) => {
    const searchParams = Object.fromEntries(req.nextUrl.searchParams.entries());
    const query = claimListQuerySchema.parse(searchParams) as ClaimListQuery;

    const result = await listClaims(query);

    return NextResponse.json(successResponse(result.data, result.meta));
  },
  {
    requireAuth: true,
    requireRoles: ['moderator', 'admin'],
    validateQuery: claimListQuerySchema
  }
);