import { NextRequest, NextResponse } from 'next/server';
import { createPostHandler, getValidatedBody, getRequestUser } from '@/lib/utils/api-handler';
import { successResponse } from '@/lib/utils/api-response';
import { rejectClaimSchema, type RejectClaimInput } from '@/lib/validators';
import { rejectClaim } from '@/lib/services/claim.service';

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * Reject a claim (admin only)
 * POST /api/admin/claims/:id/reject
 */
export const POST = createPostHandler(
  async (req: NextRequest, { params }: RouteParams) => {
    const admin = getRequestUser(req);
    const body = getValidatedBody<RejectClaimInput>(req);
    
    const claim = await rejectClaim(admin, params.id, body);
    
    return NextResponse.json(
      successResponse({
        message: 'Claim rejected',
        claim,
      })
    );
  },
  rejectClaimSchema,
  { requireAuth: true, requireRoles: ['moderator', 'admin'] }
);

