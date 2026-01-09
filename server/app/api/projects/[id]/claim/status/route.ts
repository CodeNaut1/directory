import { NextRequest, NextResponse } from 'next/server';
import { createGetHandler, getRequestUser } from '@/lib/utils/api-handler';
import { successResponse } from '@/lib/utils/api-response';
import { getClaimStatus } from '@/lib/services/claim.service';

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * Get claim status for current user and project
 * GET /api/projects/:id/claim/status
 */
export const GET = createGetHandler(
  async (req: NextRequest, { params }: RouteParams) => {
    const user = getRequestUser(req);
    
    const claim = await getClaimStatus(user.id, params.id);
    
    return NextResponse.json(successResponse(claim));
  },
  { requireAuth: true, requireRoles: ['user', 'builder', 'moderator', 'admin'] }
);

