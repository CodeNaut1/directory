import { NextRequest, NextResponse } from 'next/server';
import { createPostHandler, getValidatedBody, getRequestUser } from '@/lib/utils/api-handler';
import { successResponse } from '@/lib/utils/api-response';
import { approveClaimSchema, type ApproveClaimInput } from '@/lib/validators';
import { approveClaim } from '@/lib/services/claim.service';

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * Approve a claim (admin only)
 * POST /api/admin/claims/:id/approve
 */
export const POST = createPostHandler(
  async (req: NextRequest, { params }: RouteParams) => {
    const admin = getRequestUser(req);
    const body = getValidatedBody<ApproveClaimInput>(req);
    
    const claim = await approveClaim(admin, params.id, body);
    
    return NextResponse.json(
      successResponse({
        message: 'Claim approved and project ownership transferred',
        claim,
      })
    );
  },
  approveClaimSchema,
  { requireAuth: true, requireRoles: ['moderator', 'admin'] }
);

