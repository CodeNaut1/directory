import { NextRequest, NextResponse } from 'next/server';
import { createGetHandler } from '@/lib/utils/api-handler';
import { successResponse } from '@/lib/utils/api-response';
import { getClaimById } from '@/lib/services/claim.service';

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * Get claim by ID (admin only)
 * GET /api/admin/claims/:id
 */
export const GET = createGetHandler(
  async (req: NextRequest, { params }: RouteParams) => {
    const claim = await getClaimById(params.id);
    
    return NextResponse.json(successResponse(claim));
  },
  { requireAuth: true, requireRoles: ['moderator', 'admin'] }
);

