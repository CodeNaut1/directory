import { NextRequest, NextResponse } from 'next/server';
import { createGetHandler } from '@/lib/utils/api-handler';
import { successResponse } from '@/lib/utils/api-response';
import { getClaimById } from '@/lib/services/claim.service';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * Get claim by ID (admin only)
 * GET /api/admin/claims/:id
 */
export const GET = createGetHandler(
  async (req: NextRequest, context: RouteParams) => {
    const { id } = await context.params;
    const claim = await getClaimById(id);

    return NextResponse.json(successResponse(claim));
  },
  { requireAuth: true, requireRoles: ['moderator', 'admin'] }
);